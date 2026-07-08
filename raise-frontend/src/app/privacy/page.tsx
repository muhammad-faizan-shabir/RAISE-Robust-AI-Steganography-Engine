'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Database, Lock, UserCheck, Trash2, Mail } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { Footer } from '@/components/landing';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#252627] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-3">
            <Image
              src="/assets/Logo.png"
              alt="RAISE Logo"
              width={60}
              height={60}
              className="object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-[#f2efe9] tracking-[0.2em]">RAISE</h1>
              <p className="text-xs text-[#f2efe9]/80 mt-1">Robust AI Steganography Engine</p>
            </div>
          </Link>
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center rounded-full border border-[#bfb48f]/70 px-5 py-2 text-sm font-medium text-[#f2efe9] transition-all hover:border-[#bfb48f] hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-gradient-to-br from-[#904e55] to-[#564e58] rounded-full flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-[#f2efe9]/80 mb-2 max-w-2xl mx-auto">
          Your privacy is critically important to us
        </p>
        <p className="text-sm text-[#f2efe9]/60">
          Last Updated: December 8, 2025
        </p>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Introduction */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5">
            <p className="text-[#f2efe9]/90 leading-relaxed text-lg">
              Your privacy is critically important to us. This Privacy Policy explains what information we collect, 
              how we use it, and how we handle your data within the RAISE system.
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
            </div>
            <div className="space-y-6">
              {/* A. Personal Information */}
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-3 text-lg">A. Personal Information</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed mb-3">
                  When you register, we collect personal identifiers such as:
                </p>
                <ul className="space-y-2 text-[#f2efe9]/80">
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Username</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Password (which is encrypted and stored securely)</span>
                  </li>
                </ul>
              </div>

              {/* B. Usage Data & Logs */}
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-3 text-lg">B. Usage Data & Logs</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed mb-3">
                  For security and debugging, we maintain an Activity Log. This includes:
                </p>
                <ul className="space-y-2 text-[#f2efe9]/80">
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>User ID</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Action Type (e.g., 'embed', 'extract')</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Timestamp of the action</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span>Status (Success/Failure)</span>
                  </li>
                </ul>
                <div className="bg-[#7a9eb1]/20 border-l-4 border-[#7a9eb1] p-4 mt-4 rounded">
                  <p className="text-[#f2efe9]/90 text-sm">
                    <strong>Note:</strong> We do not persist your original secret data in our logs. 
                    We may store a hash of the data for integrity verification, but the content itself 
                    is not readable in the logs.
                  </p>
                </div>
              </div>

              {/* C. Uploaded and Generated Files */}
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-3 text-lg">C. Uploaded and Generated Files</h4>
                <ul className="space-y-2 text-[#f2efe9]/80">
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span><strong>Cover Images:</strong> Images you upload or generate using Stable Diffusion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span><strong>Secret Data:</strong> Text, Images, or PDFs you upload for embedding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span><strong>Stego-Images:</strong> The resulting images containing hidden data</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. How We Store and Retain Data */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">2. How We Store and Retain Data</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                We implement a strict Temporary File Cleanup Policy to ensure your data is not held longer than necessary:
              </p>
              <div className="bg-[#904e55]/20 border-l-4 border-[#904e55] p-4 rounded">
                <h5 className="font-semibold text-[#f6d6cf] mb-2">Stego-Images</h5>
                <p className="text-[#f2efe9]/80 text-sm">
                  These are retained on our servers for <strong>24 hours</strong> to allow you sufficient time 
                  to download them. After 24 hours, they are automatically deleted via a scheduled task.
                </p>
              </div>
              <div className="bg-[#7a9eb1]/20 border-l-4 border-[#7a9eb1] p-4 rounded">
                <h5 className="font-semibold text-[#f6d6cf] mb-2">Temporary Files</h5>
                <p className="text-[#f2efe9]/80 text-sm">
                  Input files (original cover images and secret data) are removed <strong>immediately</strong> upon 
                  the completion of the embedding or extraction operation.
                </p>
              </div>
              <div className="bg-[#bfb48f]/20 border-l-4 border-[#bfb48f] p-4 rounded">
                <h5 className="font-semibold text-[#f6d6cf] mb-2">Database Records</h5>
                <p className="text-[#f2efe9]/80 text-sm">
                  User account information and activity logs are retained <strong>permanently</strong> to maintain 
                  account access and system security.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Security of Your Data */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">3. Security of Your Data</h2>
            </div>
            <div className="space-y-5">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                We employ industry-standard security measures to protect your information:
              </p>
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg flex items-center">
                  <span className="mr-2">🔒</span>
                  Encryption in Transit
                </h5>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  All data transmitted between your browser and our servers is encrypted using HTTPS/TLS 1.3.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg flex items-center">
                  <span className="mr-2">💾</span>
                  Encryption at Rest
                </h5>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  Sensitive data, such as passwords, are hashed before storage. Secret information is encrypted 
                  (e.g., AES-256) prior to embedding into images.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg flex items-center">
                  <span className="mr-2">🔑</span>
                  Authentication
                </h5>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  We use secure JWT (JSON Web Tokens) with short expiration times (15 minutes) and refresh tokens 
                  to prevent unauthorized account access.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Data Sharing and Third Parties */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#7a9eb1]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">4. Data Sharing and Third Parties</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg">No Third-Party Sale</h5>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  We do not sell or rent your personal data to third parties.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Service Providers</h5>
                <p className="text-[#f2efe9]/80 leading-relaxed mb-3">
                  We may use third-party services for specific functions:
                </p>
                <ul className="space-y-2 text-[#f2efe9]/80">
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span><strong>Firebase:</strong> For managing secure user authentication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#bfb48f] mr-2">•</span>
                    <span><strong>Google Colab/Cloud:</strong> Potentially used for GPU-intensive model training or inference</span>
                  </li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Legal Compliance</h5>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  We may disclose your information if required to do so by law or in response to valid requests 
                  by public authorities (e.g., a court or a government agency), specifically in relation to the 
                  investigation of illicit activities facilitated by our platform.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Your Data Rights */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">5. Your Data Rights</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                You have the right to:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#bfb48f] font-semibold">👁️</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#f6d6cf] mb-1">Access</h5>
                    <p className="text-[#f2efe9]/80">View your profile and operation history via the dashboard</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#bfb48f] font-semibold">✏️</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#f6d6cf] mb-1">Update</h5>
                    <p className="text-[#f2efe9]/80">Edit your account details (username, email, password)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[#bfb48f] font-semibold">🗑️</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-[#f6d6cf] mb-1">Delete</h5>
                    <p className="text-[#f2efe9]/80">Request the deletion of your account and associated data from our database</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Contact Us */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">6. Contact Us</h2>
            </div>
            <p className="text-[#f2efe9]/80 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or the Terms of Service, please contact the development team:
            </p>
            <div className="space-y-2 text-[#f2efe9]/80">
              <p>• Husnain Ali (l226562@lhr.nu.edu.pk)</p>
              <p>• Shaheer Ahmed (l226743@lhr.nu.edu.pk)</p>
              <p>• Muhammad Faizan Shabir (l226552@lhr.nu.edu.pk)</p>
            </div>
            <p className="text-[#f2efe9]/60 mt-4 text-sm">
              National University of Computer and Emerging Sciences, Lahore
            </p>
          </div>

          {/* Related Links */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.TERMS}
              className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111216]/80 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-[#bfb48f]/80 hover:bg-[#18191d]"
            >
              View Terms of Service
            </Link>
            <Link
              href={ROUTES.HOME}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#904e55] via-[#7a3e45] to-[#564e58] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#904e55]/50 transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
