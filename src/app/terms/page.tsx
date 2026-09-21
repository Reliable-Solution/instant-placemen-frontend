"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
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
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
              <p className="text-xs text-slate-500">Last updated: September 20, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Instant Placement, you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Platform Description</h2>
              <p>
                Instant Placement is a job discovery and hiring platform that connects job seekers
                directly with employers. We facilitate direct communication without agency middlemen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the confidentiality of your account</li>
                <li>Not misuse the platform for fraudulent purposes</li>
                <li>Respect the privacy and rights of other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Employer Code of Conduct</h2>
              <p>
                Employers using our platform must:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Post genuine job vacancies only</li>
                <li>Not charge candidates any fees</li>
                <li>Respond to applications in a timely manner</li>
                <li>Maintain professional communication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Contact</h2>
              <p>
                For questions about these terms:
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
