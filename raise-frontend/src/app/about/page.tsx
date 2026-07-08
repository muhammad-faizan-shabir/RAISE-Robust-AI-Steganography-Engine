'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Target, Cpu, Shield, Users, Lightbulb, Globe } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { Footer } from '@/components/landing';

export default function AboutPage() {
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
          About RAISE
        </h1>
        <p className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-[#f6d6cf] via-[#bfb48f] to-[#7a3e45] bg-clip-text text-transparent mb-6">
          Conceal. Create. Communicate.
        </p>
        <p className="text-xl text-[#f2efe9]/80 max-w-4xl mx-auto leading-relaxed">
          Welcome to RAISE (Robust AI Steganography Engine), a next-generation web platform designed to redefine 
          secure communication in the digital age. Developed as a Final Year Project at the National University of 
          Computer and Emerging Sciences (FAST-NUCES), Lahore, RAISE leverages the power of Artificial Intelligence 
          to make your data invisible.
        </p>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Our Mission */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-3xl font-semibold text-white">Our Mission</h2>
            </div>
            <div className="space-y-4 text-[#f2efe9]/80 leading-relaxed text-lg">
              <p>
                In an era of mass surveillance and data interception, traditional encryption is no longer enough. 
                While encryption protects your message, it also flags it as "sensitive," potentially drawing unwanted attention.
              </p>
              <p className="text-[#f6d6cf] font-semibold text-xl">
                RAISE changes the game.
              </p>
              <p>
                Our mission is to provide a steganography solution that hides not just the content of your message, 
                but the very fact that a message exists. By embedding sensitive files, whether text, images, or PDFs, 
                inside ordinary-looking images, we enable communication that is secure, covert, and undetectable.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Cpu className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-3xl font-semibold text-white">How It Works</h2>
            </div>
            <div className="space-y-5">
              <p className="text-[#f2efe9]/80 leading-relaxed text-lg">
                Unlike legacy tools that rely on simple pixel manipulation (like LSB), RAISE is powered by 
                state-of-the-art Deep Learning:
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/5 border-l-4 border-[#904e55] p-5 rounded">
                  <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">AI-Driven Hiding</h4>
                  <p className="text-[#f2efe9]/80">
                    We utilize Generative Adversarial Networks (GANs), trained on expert datasets like BOSSBase 
                    and ALASKA2, to embed data with minimal visual distortion.
                  </p>
                </div>

                <div className="bg-white/5 border-l-4 border-[#7a9eb1] p-5 rounded">
                  <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Cover Generation</h4>
                  <p className="text-[#f2efe9]/80">
                    Don't have a cover image? RAISE integrates Stable Diffusion to generate unique, high-quality 
                    cover images on demand, ensuring your cover media is as unique as your message.
                  </p>
                </div>

                <div className="bg-white/5 border-l-4 border-[#bfb48f] p-5 rounded">
                  <h4 className="font-semibold text-[#f6d6cf] mb-2 text-lg">Robust Security</h4>
                  <p className="text-[#f2efe9]/80">
                    Our system is built to withstand scrutiny. We rigorously test our "stego-images" against 
                    advanced steganalysis tools like StegExpose, Aletheia, and StegDetect to ensure high robustness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#7a9eb1]" />
              </div>
              <h2 className="text-3xl font-semibold text-white">The Technology Stack</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#f2efe9]/80 leading-relaxed text-lg mb-4">
                RAISE is built on a modern, scalable architecture designed for performance and security:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-[#f6d6cf] mb-2">Frontend</h5>
                  <p className="text-[#f2efe9]/80 text-sm">
                    Next.js for a responsive, intuitive user interface
                  </p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-[#f6d6cf] mb-2">Backend</h5>
                  <p className="text-[#f2efe9]/80 text-sm">
                    FastAPI (Python) for high-performance processing and AI model inference
                  </p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-[#f6d6cf] mb-2">Database</h5>
                  <p className="text-[#f2efe9]/80 text-sm">
                    PostgreSQL for secure data management
                  </p>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h5 className="font-semibold text-[#f6d6cf] mb-2">Security</h5>
                  <p className="text-[#f2efe9]/80 text-sm">
                    JWT authentication and HTTPS encryption to protect every interaction
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meet the Team */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#f6d6cf]" />
              </div>
              <h2 className="text-3xl font-semibold text-white">Meet the Team</h2>
            </div>
            <div className="space-y-4">
              <p className="text-[#f2efe9]/80 leading-relaxed text-lg">
                RAISE is the result of dedicated research and development by a team of Computer Science students.
              </p>
              
              <h4 className="font-semibold text-[#f6d6cf] text-xl mt-6 mb-4">Developers:</h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#904e55]/20 to-[#564e58]/20 p-6 rounded-xl border border-white/10 text-center transition-transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                  <h5 className="font-semibold text-[#f6d6cf] text-lg mb-2">Husnain Ali</h5>
                  <p className="text-[#f2efe9]/60 text-sm">Computer Science Student</p>
                  <p className="text-[#f2efe9]/60 text-xs mt-2">FAST-NUCES, Lahore</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#904e55]/20 to-[#564e58]/20 p-6 rounded-xl border border-white/10 text-center transition-transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                  <h5 className="font-semibold text-[#f6d6cf] text-lg mb-2">Shaheer Ahmed</h5>
                  <p className="text-[#f2efe9]/60 text-sm">Computer Science Student</p>
                  <p className="text-[#f2efe9]/60 text-xs mt-2">FAST-NUCES, Lahore</p>
                </div>
                
                <div className="bg-gradient-to-br from-[#904e55]/20 to-[#564e58]/20 p-6 rounded-xl border border-white/10 text-center transition-transform hover:-translate-y-1">
                  <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👨‍💻</span>
                  </div>
                  <h5 className="font-semibold text-[#f6d6cf] text-lg mb-2">Muhammad Faizan Shabir</h5>
                  <p className="text-[#f2efe9]/60 text-sm">Computer Science Student</p>
                  <p className="text-[#f2efe9]/60 text-xs mt-2">FAST-NUCES, Lahore</p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Vision */}
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-[#bfb48f]" />
              </div>
              <h2 className="text-3xl font-semibold text-white">Our Vision</h2>
            </div>
            <div className="space-y-4 text-[#f2efe9]/80 leading-relaxed text-lg">
              <p>
                We believe in the right to privacy and the necessity of secure infrastructure. RAISE aligns with 
                UN Sustainable Development Goal 9 (Industry, Innovation, and Infrastructure) by fostering resilient 
                digital infrastructure that protects users in high-risk environments.
              </p>
              <div className="bg-gradient-to-r from-[#904e55]/20 to-[#7a9eb1]/20 border-l-4 border-[#bfb48f] p-6 rounded-lg mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="h-6 w-6 text-[#bfb48f]" />
                  <h4 className="font-semibold text-[#f6d6cf] text-xl">A Window into the Future</h4>
                </div>
                <p className="text-[#f2efe9]/90">
                  Whether for journalists protecting sources, organizations securing intelligence, or individuals 
                  preserving privacy, RAISE offers a window into the future of covert communication.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={ROUTES.AUTH.REGISTER}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#904e55] via-[#7a3e45] to-[#564e58] px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#904e55]/50 transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Get Started with RAISE
            </Link>
            <Link
              href={ROUTES.HOME}
              className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-[#111216]/80 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-black/40 transition-all hover:-translate-y-0.5 hover:border-[#bfb48f]/80 hover:bg-[#18191d]"
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
