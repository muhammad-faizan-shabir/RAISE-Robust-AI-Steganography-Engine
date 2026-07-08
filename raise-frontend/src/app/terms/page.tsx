'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, Shield, AlertCircle, Scale, Lock, Users } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { Footer } from '@/components/landing';

export default function TermsOfServicePage() {
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
            <FileText className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-xl text-[#f2efe9]/80 mb-2 max-w-2xl mx-auto">
          Please read these terms carefully before using RAISE
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
              Welcome to RAISE (Robust AI Steganography Engine). By accessing or using our website and services, 
              you agree to be bound by these Terms of Service. If you disagree with any part of the terms, 
              you may not access the service.
            </p>
          </div>

          {/* 1. Description of Service */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">1. Description of Service</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                RAISE is an academic project developed at the National University of Computer and Emerging Sciences 
                (FAST-NUCES). It is a web-based platform that utilizes Artificial Intelligence, specifically 
                Generative Adversarial Networks (GANs) and Stable Diffusion, to provide image steganography services.
              </p>
              <p className="text-[#f2efe9]/80 leading-relaxed">
                The service allows users to embed secret data (text, images, PDFs) into cover images and extract 
                such data from stego-images.
              </p>
            </div>
          </div>

          {/* 2. Academic & Prototype Disclaimer */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">2. Academic & Prototype Disclaimer</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-[#904e55]/20 border-l-4 border-[#904e55] p-4 rounded">
                <p className="text-[#f6d6cf] font-medium flex items-center">
                  <span className="mr-2">⚠️</span>
                  Important Notice
                </p>
              </div>
              <p className="text-[#f2efe9]/80 leading-relaxed">
                Please acknowledge that this service is provided primarily for educational, research, and 
                demonstration purposes as a Final Year Project. While we strive for reliability (targeting 99% uptime), 
                the service is provided on an "AS IS" and "AS AVAILABLE" basis.
              </p>
              <p className="text-[#f2efe9]/80 leading-relaxed">
                We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
            </div>
          </div>

          {/* 3. User Accounts */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">3. User Accounts</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Registration</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  To access features such as embedding and extraction, you must register an account using a 
                  valid email address and password.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Security</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  You are responsible for safeguarding the password that you use to access the service. 
                  We use JWT (JSON Web Tokens) for secure session management, but you are responsible for 
                  any activities or actions under your account.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Access Control</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  You are responsible for managing access permissions for your stego-images. You must accurately 
                  specify the User IDs allowed to extract data from your images. RAISE is not liable for 
                  unauthorized extraction if you incorrectly grant permissions.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Acceptable Use Policy */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Scale className="h-6 w-6 text-[#7a9eb1]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">4. Acceptable Use Policy</h2>
            </div>
            <div className="space-y-5">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, 
                or impairs the service.
              </p>
              
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Legality of Content</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  You are solely responsible for the legality of the secret data you conceal. RAISE does not 
                  monitor the content of hidden messages.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Prohibited Activities</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed mb-3">
                  You must not use RAISE to hide, transmit, or store:
                </p>
                <ul className="space-y-2 text-[#f2efe9]/80">
                  <li className="flex items-start">
                    <span className="text-[#904e55] mr-2">•</span>
                    <span>Malware, viruses, or malicious code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#904e55] mr-2">•</span>
                    <span>Illegal content, including but not limited to pirated software, child exploitation material, or terrorist propaganda</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#904e55] mr-2">•</span>
                    <span>Confidential information you do not have the right to disclose</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Audit Logging</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  You acknowledge that major operations (embedding, extraction) are logged for security and 
                  auditing purposes to prevent abuse.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Intellectual Property */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Lock className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">5. Intellectual Property</h2>
            </div>
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Our Rights</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  The RAISE platform, its underlying code, AI models (Encoder, Decoder, Critic), and design 
                  are the intellectual property of the developers.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Your Rights</h4>
                <p className="text-[#f2efe9]/80 leading-relaxed">
                  You retain all rights to the cover images and secret data you upload. However, you grant us 
                  a limited license to process these files solely for the purpose of providing the steganography service.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Limitation of Liability */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-2xl font-semibold text-white">6. Limitation of Liability</h2>
            </div>
            <div className="bg-white/5 border-l-4 border-[#bfb48f] p-5 rounded">
              <p className="text-[#f2efe9]/80 leading-relaxed">
                In no event shall the RAISE team be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of data, use, goodwill, or other intangible 
                losses, resulting from your use of the service.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-[#f2efe9]/80 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact the development team:
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
              href={ROUTES.PRIVACY}
              className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111216]/80 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-[#bfb48f]/80 hover:bg-[#18191d]"
            >
              View Privacy Policy
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
