"""
End-to-end system test against the running Docker deployment at http://localhost:8002.

Crafts a signed HS256 JWT (matching the format the backend expects) and exercises
the full embed → poll → extract → history pipeline for text, image, and PDF payloads.
Verifies method_used, payload_type, and LSB fallback behavior.

Usage:
    python system_test.py
"""

import base64
import io
import json
import os
import struct
import time
from datetime import datetime, timezone, timedelta

import jwt  # PyJWT
import requests

# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #
BASE_URL = "http://localhost:8002"
JWT_SECRET = "O+LcZC9dNN4zLUQ74q5Ipam7CGOWcNTXbiMLEuheVLfDsS2r1TiYdtGYvBp91YRldysGFeTQRtjL1QWT40+oPg=="
POLL_INTERVAL = 3   # seconds between status polls
POLL_TIMEOUT  = 120  # seconds before giving up


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
PASS = "\033[32mPASS\033[0m"
FAIL = "\033[31mFAIL\033[0m"
INFO = "\033[36mINFO\033[0m"

results = []

def log(symbol, msg):
    print(f"  [{symbol}] {msg}")

def check(name, condition, detail=""):
    if condition:
        log(PASS, name)
        results.append((name, True))
    else:
        log(FAIL, f"{name}{(' — ' + detail) if detail else ''}")
        results.append((name, False))

def make_jwt(sub="system-test-user-001",
             email="systest@raise-systest.dev",
             name="System Tester"):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "email": email,
        "user_metadata": {"name": name},
        "iss": "supabase",
        "aud": "authenticated",
        "role": "authenticated",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=1)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

def poll_job(job_id, token, timeout=POLL_TIMEOUT):
    deadline = time.time() + timeout
    while time.time() < deadline:
        r = requests.get(f"{BASE_URL}/api/v1/stego/jobs/{job_id}", headers=auth_headers(token))
        if r.status_code != 200:
            log(INFO, f"poll got {r.status_code}: {r.text[:200]}")
            return None, r
        body = r.json()
        status = body.get("status")
        if status in ("SUCCESS", "FAILURE"):
            return body, r
        time.sleep(POLL_INTERVAL)
    return None, None  # timed out

def tiny_png():
    """Return a minimal 4×4 pixel PNG (valid, tiny, low capacity for LSB tests)."""
    # Use Python's built-in struct + zlib to create a 4×4 white PNG
    import zlib, struct

    def chunk(name, data):
        c = name + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    width, height = 4, 4
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    raw_rows = b"".join(b"\x00" + bytes([255, 255, 255] * width) for _ in range(height))
    idat_data = zlib.compress(raw_rows)

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", ihdr_data)
    png += chunk(b"IDAT", idat_data)
    png += chunk(b"IEND", b"")
    return png

def medium_png():
    """Return a 200×200 random-noise PNG — complex enough for SteganoGAN."""
    import io as _io
    import numpy as _np
    arr = _np.random.randint(0, 256, (200, 200, 3), dtype=_np.uint8)
    from PIL import Image as _PIL
    img = _PIL.fromarray(arr, mode="RGB")
    buf = _io.BytesIO()
    img.save(buf, "PNG")
    return buf.getvalue()

def sample_pdf_bytes():
    """Minimal valid PDF bytes."""
    return b"%PDF-1.0\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n" \
           b"2 0 obj<</Type /Pages /Kids[3 0 R]/Count 1>>endobj\n" \
           b"3 0 obj<</Type /Page /MediaBox[0 0 3 3]>>endobj\n" \
           b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n" \
           b"0000000058 00000 n\n0000000115 00000 n\n" \
           b"trailer<</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF"


# --------------------------------------------------------------------------- #
# Tests
# --------------------------------------------------------------------------- #
def run_tests():
    token = make_jwt()
    hdrs  = auth_headers(token)

    print("\n" + "="*60)
    print("  RAISE SYSTEM TEST")
    print("="*60)

    # ----------------------------------------------------------------------- #
    # 1. Health check
    # ----------------------------------------------------------------------- #
    print("\n[1] Health check")
    r = requests.get(f"{BASE_URL}/health")
    check("GET /health returns 200", r.status_code == 200)
    check("status=healthy", r.json().get("status") == "healthy")

    # ----------------------------------------------------------------------- #
    # 2. Text embed — force LSB for reliable round-trip in any environment
    # ----------------------------------------------------------------------- #
    print("\n[2] Text embed (method=lsb, reliable in all environments)")
    cover = medium_png()
    r = requests.post(
        f"{BASE_URL}/api/v1/stego/embed",
        headers=hdrs,
        files={"image": ("cover.png", io.BytesIO(cover), "image/png")},
        data={"message": "Hello RAISE system test!", "content_type": "text", "architecture": "dense", "method": "lsb"},
    )
    check("POST /embed returns 200", r.status_code == 200, r.text)
    text_job_id = r.json().get("job_id") if r.status_code == 200 else None
    check("Response has job_id", bool(text_job_id))

    if text_job_id:
        log(INFO, f"Polling job {text_job_id} …")
        body, _ = poll_job(text_job_id, token)
        check("Text embed job reaches SUCCESS", body is not None and body.get("status") == "SUCCESS",
              str(body))
        if body and body.get("status") == "SUCCESS":
            res = body.get("result", {})
            check("result.method_used is set", res.get("method_used") in ("steganogan", "lsb"),
                  str(res))
            check("result.payload_type = text", res.get("payload_type") == "text", str(res))
            check("result.output_path is present", bool(res.get("output_path")))
            embed_method = res.get("method_used")
            embed_output = res.get("output_path")
            log(INFO, f"method_used={embed_method}, output_path={embed_output}")
        else:
            embed_method = None
            embed_output = None
    else:
        embed_method = None
        embed_output = None

    # ----------------------------------------------------------------------- #
    # 3. Text extract — round-trip
    # ----------------------------------------------------------------------- #
    if embed_output:
        print("\n[3] Text extract (round-trip with same method)")
        # Download the stego image first
        job_status_r = requests.get(f"{BASE_URL}/api/v1/stego/status/{text_job_id}", headers=hdrs)
        # Try to download the output image
        download_r = requests.get(
            f"{BASE_URL}/api/v1/stego/download/{text_job_id}",
            headers=hdrs,
        )
        check("GET /download/{job_id} returns 200", download_r.status_code == 200,
              f"{download_r.status_code} {download_r.text[:200]}")

        if download_r.status_code == 200:
            stego_bytes = download_r.content
            extract_method = embed_method if embed_method else "steganogan"
            r2 = requests.post(
                f"{BASE_URL}/api/v1/stego/extract",
                headers=hdrs,
                files={"image": ("stego.png", io.BytesIO(stego_bytes), "image/png")},
                data={"architecture": "dense", "method": extract_method},
            )
            check("POST /extract returns 200", r2.status_code == 200, r2.text[:200])
            ex_job_id = r2.json().get("job_id") if r2.status_code == 200 else None

            if ex_job_id:
                log(INFO, f"Polling extract job {ex_job_id} …")
                ex_body, _ = poll_job(ex_job_id, token)
                check("Extract job reaches SUCCESS", ex_body is not None and ex_body.get("status") == "SUCCESS",
                      str(ex_body))
                if ex_body and ex_body.get("status") == "SUCCESS":
                    ex_res = ex_body.get("result", {})
                    check("Extracted content_type = text", ex_res.get("content_type") == "text", str(ex_res))
                    check("Extracted message matches original",
                          "Hello RAISE system test!" in ex_res.get("extracted_message", ""),
                          f"got: {ex_res.get('extracted_message')!r}")
                    check("Extract method_used matches embed", ex_res.get("method_used") == extract_method,
                          f"expected {extract_method!r}, got {ex_res.get('method_used')!r}")

    # ----------------------------------------------------------------------- #
    # 4. LSB capacity exceeded: SteganoGAN may succeed on tiny images, but if
    #    SteganoGAN also fails, LSB fallback should give a clear capacity error.
    #    We use a payload large enough to overflow any 4×4 image via LSB.
    # ----------------------------------------------------------------------- #
    print("\n[4] Capacity exceeded error (tiny 4×4 cover image, 500-byte payload)")
    tiny = tiny_png()
    long_msg = "X" * 500  # 4×4 RGB = 48 bytes LSB capacity; SteganoGAN may still succeed
    r = requests.post(
        f"{BASE_URL}/api/v1/stego/embed",
        headers=hdrs,
        files={"image": ("tiny.png", io.BytesIO(tiny), "image/png")},
        data={"message": long_msg, "content_type": "text", "architecture": "dense"},
    )
    cap_job_id = r.json().get("job_id") if r.status_code == 200 else None
    check("POST /embed tiny cover returns 200 (job queued)", r.status_code == 200, r.text[:200])

    if cap_job_id:
        log(INFO, f"Polling capacity job {cap_job_id} …")
        cap_body, _ = poll_job(cap_job_id, token)
        if cap_body:
            status = cap_body.get("status")
            if status == "FAILURE":
                detail = str(cap_body.get("error", "") or cap_body.get("result", ""))
                check("Tiny-cover FAILURE mentions capacity",
                      "capacity" in detail.lower() or "too large" in detail.lower() or "exceed" in detail.lower(),
                      f"detail={detail[:200]}")
                log(INFO, "SteganoGAN also failed → LSB capacity error surfaced correctly")
            elif status == "SUCCESS":
                res = cap_body.get("result", {})
                check("Tiny-cover SUCCESS uses SteganoGAN (no LSB capacity limit hit)",
                      res.get("method_used") == "steganogan",
                      f"method_used={res.get('method_used')}")
                log(INFO, "SteganoGAN succeeded on tiny image (it has no pixel capacity limit)")
        else:
            check("Tiny-cover job completes within timeout", False, "timed out")

    # ----------------------------------------------------------------------- #
    # 5. PDF embed (force LSB for reliable round-trip)
    # ----------------------------------------------------------------------- #
    print("\n[5] PDF embed (method=lsb)")
    pdf_bytes = sample_pdf_bytes()
    cover2 = medium_png()
    r = requests.post(
        f"{BASE_URL}/api/v1/stego/embed",
        headers=hdrs,
        files={
            "image": ("cover.png", io.BytesIO(cover2), "image/png"),
            "secret_file": ("report.pdf", io.BytesIO(pdf_bytes), "application/pdf"),
        },
        data={"content_type": "pdf", "architecture": "dense", "method": "lsb"},
    )
    check("POST /embed pdf returns 200", r.status_code == 200, r.text[:200])
    pdf_job_id = r.json().get("job_id") if r.status_code == 200 else None

    if pdf_job_id:
        log(INFO, f"Polling PDF embed job {pdf_job_id} …")
        pdf_body, _ = poll_job(pdf_job_id, token)
        check("PDF embed job reaches SUCCESS", pdf_body is not None and pdf_body.get("status") == "SUCCESS",
              str(pdf_body))
        if pdf_body and pdf_body.get("status") == "SUCCESS":
            pdf_res = pdf_body.get("result", {})
            check("PDF payload_type = pdf", pdf_res.get("payload_type") == "pdf", str(pdf_res))
            check("PDF method_used is set", pdf_res.get("method_used") in ("steganogan", "lsb"), str(pdf_res))
            log(INFO, f"PDF embed method_used={pdf_res.get('method_used')}")
            pdf_embed_method = pdf_res.get("method_used")
            pdf_job_id_for_extract = pdf_job_id
        else:
            pdf_embed_method = None
            pdf_job_id_for_extract = None
    else:
        pdf_embed_method = None
        pdf_job_id_for_extract = None

    # ----------------------------------------------------------------------- #
    # 6. PDF extract round-trip
    # ----------------------------------------------------------------------- #
    if pdf_job_id_for_extract and pdf_embed_method:
        print("\n[6] PDF extract (round-trip)")
        dl_r = requests.get(f"{BASE_URL}/api/v1/stego/download/{pdf_job_id_for_extract}", headers=hdrs)
        check("Download PDF stego image returns 200", dl_r.status_code == 200,
              f"{dl_r.status_code} {dl_r.text[:100]}")

        if dl_r.status_code == 200:
            r_ex = requests.post(
                f"{BASE_URL}/api/v1/stego/extract",
                headers=hdrs,
                files={"image": ("stego_pdf.png", io.BytesIO(dl_r.content), "image/png")},
                data={"architecture": "dense", "method": pdf_embed_method},
            )
            check("POST /extract pdf stego returns 200", r_ex.status_code == 200, r_ex.text[:200])
            ex_pdf_job = r_ex.json().get("job_id") if r_ex.status_code == 200 else None

            if ex_pdf_job:
                log(INFO, f"Polling PDF extract job {ex_pdf_job} …")
                ex_pdf_body, _ = poll_job(ex_pdf_job, token)
                check("PDF extract reaches SUCCESS",
                      ex_pdf_body is not None and ex_pdf_body.get("status") == "SUCCESS",
                      str(ex_pdf_body))
                if ex_pdf_body and ex_pdf_body.get("status") == "SUCCESS":
                    ex_pdf_res = ex_pdf_body.get("result", {})
                    check("Extracted content_type=application",
                          ex_pdf_res.get("content_type") == "application", str(ex_pdf_res))
                    check("Extracted mime_type=application/pdf",
                          ex_pdf_res.get("extracted_mime_type") == "application/pdf", str(ex_pdf_res))
                    check("Extracted filename=report.pdf",
                          ex_pdf_res.get("extracted_filename") == "report.pdf", str(ex_pdf_res))

    # ----------------------------------------------------------------------- #
    # 7. LSB explicit extract (embed with LSB, extract with LSB)
    # ----------------------------------------------------------------------- #
    print("\n[7] Explicit LSB embed (method=lsb not exposed in embed; skip if not supported)")
    # The embed endpoint doesn't expose a method param; LSB is chosen via fallback.
    # We can't force LSB from the API directly — skip this as a note.
    log(INFO, "LSB embed is triggered automatically by fallback; no explicit method param on embed endpoint.")

    # ----------------------------------------------------------------------- #
    # 8. Access control — recipient-based authorization
    # ----------------------------------------------------------------------- #
    print("\n[8] Access control — recipient-based authorization")

    # User A (embedder) and User B (intended recipient)
    token_a = token  # same as main test user
    token_b = make_jwt(sub="system-test-user-002",
                       email="systest-b@raise-systest.dev",
                       name="System Tester B")
    token_c = make_jwt(sub="system-test-user-003",
                       email="systest-c@raise-systest.dev",
                       name="System Tester C")

    # Ensure User B exists in the DB by making any authenticated request
    requests.get(f"{BASE_URL}/api/v1/stego", headers=auth_headers(token_b))

    # Embed as User A, specifying User B as recipient
    ac_cover = medium_png()
    r_ac = requests.post(
        f"{BASE_URL}/api/v1/stego/embed",
        headers=auth_headers(token_a),
        files={"image": ("cover_ac.png", io.BytesIO(ac_cover), "image/png")},
        data={
            "message": "secret for B only",
            "content_type": "text",
            "method": "lsb",
            "recipient_email": "systest-b@raise-systest.dev",
        },
    )
    check("POST /embed with recipient_email returns 200", r_ac.status_code == 200, r_ac.text[:200])
    ac_job_id = r_ac.json().get("job_id") if r_ac.status_code == 200 else None

    if ac_job_id:
        log(INFO, f"Polling access-control embed job {ac_job_id} …")
        ac_body, _ = poll_job(ac_job_id, token_a)
        check("Access-control embed reaches SUCCESS",
              ac_body is not None and ac_body.get("status") == "SUCCESS", str(ac_body))

        if ac_body and ac_body.get("status") == "SUCCESS":
            # Download the stego image
            dl_ac = requests.get(f"{BASE_URL}/api/v1/stego/download/{ac_job_id}",
                                 headers=auth_headers(token_a))
            check("Download access-control stego image returns 200", dl_ac.status_code == 200)

            if dl_ac.status_code == 200:
                stego_ac = dl_ac.content

                # ── User A (embedder) should succeed ─────────────────────────
                r_ex_a = requests.post(
                    f"{BASE_URL}/api/v1/stego/extract",
                    headers=auth_headers(token_a),
                    files={"image": ("stego_ac.png", io.BytesIO(stego_ac), "image/png")},
                    data={"method": "lsb"},
                )
                check("Embedder extract POST returns 200", r_ex_a.status_code == 200, r_ex_a.text[:200])
                if r_ex_a.status_code == 200:
                    ex_a_job = r_ex_a.json().get("job_id")
                    log(INFO, f"Polling embedder extract job {ex_a_job} …")
                    ex_a_body, _ = poll_job(ex_a_job, token_a)
                    check("Embedder can extract own stego image (SUCCESS)",
                          ex_a_body is not None and ex_a_body.get("status") == "SUCCESS",
                          str(ex_a_body))
                    if ex_a_body and ex_a_body.get("status") == "SUCCESS":
                        msg_a = ex_a_body.get("result", {}).get("extracted_message", "")
                        check("Embedder sees correct message",
                              "secret for B only" in msg_a, f"got: {msg_a!r}")

                # ── User B (recipient) should succeed ─────────────────────────
                r_ex_b = requests.post(
                    f"{BASE_URL}/api/v1/stego/extract",
                    headers=auth_headers(token_b),
                    files={"image": ("stego_ac.png", io.BytesIO(stego_ac), "image/png")},
                    data={"method": "lsb"},
                )
                check("Recipient extract POST returns 200", r_ex_b.status_code == 200, r_ex_b.text[:200])
                if r_ex_b.status_code == 200:
                    ex_b_job = r_ex_b.json().get("job_id")
                    log(INFO, f"Polling recipient extract job {ex_b_job} …")
                    ex_b_body, _ = poll_job(ex_b_job, token_b)
                    check("Recipient can extract stego image (SUCCESS)",
                          ex_b_body is not None and ex_b_body.get("status") == "SUCCESS",
                          str(ex_b_body))
                    if ex_b_body and ex_b_body.get("status") == "SUCCESS":
                        msg_b = ex_b_body.get("result", {}).get("extracted_message", "")
                        check("Recipient sees correct message",
                              "secret for B only" in msg_b, f"got: {msg_b!r}")

                # ── User C (unauthorized) should fail ─────────────────────────
                r_ex_c = requests.post(
                    f"{BASE_URL}/api/v1/stego/extract",
                    headers=auth_headers(token_c),
                    files={"image": ("stego_ac.png", io.BytesIO(stego_ac), "image/png")},
                    data={"method": "lsb"},
                )
                check("Unauthorized extract POST returns 200 (job queued)",
                      r_ex_c.status_code == 200, r_ex_c.text[:200])
                if r_ex_c.status_code == 200:
                    ex_c_job = r_ex_c.json().get("job_id")
                    log(INFO, f"Polling unauthorized extract job {ex_c_job} …")
                    ex_c_body, _ = poll_job(ex_c_job, token_c)
                    check("Unauthorized user extract reaches FAILURE",
                          ex_c_body is not None and ex_c_body.get("status") == "FAILURE",
                          str(ex_c_body))
                    if ex_c_body and ex_c_body.get("status") == "FAILURE":
                        err = str(ex_c_body.get("error", ""))
                        check("FAILURE message mentions authorization",
                              "authorized" in err.lower() or "permission" in err.lower(),
                              f"error={err!r}")

    # ----------------------------------------------------------------------- #
    # 9. History/list endpoint
    # ----------------------------------------------------------------------- #
    print("\n[9] History endpoint")
    r = requests.get(f"{BASE_URL}/api/v1/stego", headers=hdrs)
    check("GET /api/v1/stego returns 200", r.status_code == 200, r.text[:200])
    if r.status_code == 200:
        body = r.json()
        check("Response has 'items' key", "items" in body)
        check("Response has 'total' key", "total" in body)
        items = body.get("items", [])
        check("At least one job in history", len(items) > 0, f"total={body.get('total')}")
        if items:
            item = items[0]
            check("History item has operation_type (lowercase)",
                  item.get("operation_type") in ("embed", "extract"), str(item))
            check("History item has method_used field",
                  "method_used" in item, str(list(item.keys())))
            check("History item has payload_type field",
                  "payload_type" in item, str(list(item.keys())))

    # ----------------------------------------------------------------------- #
    # Summary
    # ----------------------------------------------------------------------- #
    print("\n" + "="*60)
    passed = sum(1 for _, ok in results if ok)
    failed = sum(1 for _, ok in results if not ok)
    print(f"  RESULTS: {passed} passed, {failed} failed out of {len(results)} checks")
    print("="*60)

    if failed:
        print("\nFailed checks:")
        for name, ok in results:
            if not ok:
                print(f"  - {name}")

    print()
    return failed == 0


if __name__ == "__main__":
    try:
        from PIL import Image
    except ImportError:
        print("Installing Pillow for test image generation …")
        os.system("pip install pillow -q")
        from PIL import Image

    import sys
    ok = run_tests()
    sys.exit(0 if ok else 1)
