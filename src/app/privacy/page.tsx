"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
              <p className="text-xs text-slate-500">Last updated: September 20, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Information We Collect</h2>
              <p>
                When you use Instant Placement, we collect information you provide directly, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Name, email address, and phone number</li>
                <li>Professional information (skills, experience, qualifications)</li>
                <li>Resume/CV documents you upload</li>
                <li>Location data (city and locality)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. How We Use Your Information</h2>
              <p>
                We use your information to connect job seekers with employers, facilitate the hiring process,
                and improve our platform services. Your profile may be visible to verified employers when
                you grant consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Data Protection (DPDP Act 2023)</h2>
              <p>
                In compliance with the Digital Personal Data Protection Act, 2023, we ensure:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Explicit consent before sharing your data with employers</li>
                <li>Right to withdraw consent at any time</li>
                <li>Right to access and delete your data</li>
                <li>Data is stored securely with industry-standard encryption</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Contact Us</h2>
              <p>
                For privacy-related inquiries, contact us at:
              </p>
              <p className="font-semibold mt-1">
                Email: instantplacement.in@gmail.com<br />
                Phone: +91 78630 22284
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
