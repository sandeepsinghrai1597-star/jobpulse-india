"use client";

import Link from "next/link";
import { ArrowRight, Brain, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <div className="relative w-full">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 py-3 text-center text-white">
        <p className="text-sm font-medium">
          🚀 Empowering Your Career With AI-Powered Job Search & Skill Development
        </p>
      </div>

      {/* Main Hero Section */}
      <section className="relative w-full overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Badge */}
              <Badge
                variant="secondary"
                className="w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700 shadow-sm hover:bg-blue-50"
              >
                <span className="mr-1">⭐</span> India&apos;s #1 AI Job Platform
              </Badge>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  India&apos;s #1 Platform for{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Jobs + AI Career Tools
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Browse job vacancies from top companies hiring freshers and graduates across
                  India right now. Explore opportunities, apply easily, and get AI-powered
                  guidance today.
                </p>
              </div>

              {/* CTA Banner */}
              <div className="rounded-lg border-l-4 border-l-blue-600 bg-blue-50 p-4 sm:p-5">
                <p className="font-medium text-blue-900">
                  💼 Connect with companies offering freshers jobs across India.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="rounded-lg bg-blue-600 px-8 font-semibold shadow-lg hover:bg-blue-700">
                  <Link href="/signup">
                    Register Now
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-lg border-2 border-blue-600 bg-white px-8 font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/jobs">
                    Explore Jobs
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Illustration/Stats */}
            <div className="flex items-center justify-center">
              <div className="space-y-4 w-full">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-sm">
                    <p className="text-3xl font-bold text-emerald-700">1,200+</p>
                    <p className="mt-2 text-sm font-medium text-emerald-600">Curated Job Roles</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
                    <p className="text-3xl font-bold text-blue-700">50K+</p>
                    <p className="mt-2 text-sm font-medium text-blue-600">Active Candidates</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm">
                    <p className="text-3xl font-bold text-purple-700">800+</p>
                    <p className="mt-2 text-sm font-medium text-purple-600">Hiring Companies</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6 shadow-sm">
                    <p className="text-3xl font-bold text-orange-700">7</p>
                    <p className="mt-2 text-sm font-medium text-orange-600">Career Tools</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Search Section */}
      <section className="relative -mt-12 bg-slate-50 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-slate-950 sm:text-3xl">
              Find Your Next Opportunity
            </h2>

            {/* Search Filters */}
            <div className="space-y-4">
              {/* Top Row - Search Inputs */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Job Title, Keyword or Company"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="City, State, Zip Code or Remote"
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dropdowns Row */}
              <div className="grid gap-3 sm:grid-cols-3">
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Job Type</option>
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Monthly Salary</option>
                  <option>₹0 - ₹20k</option>
                  <option>₹20k - ₹40k</option>
                  <option>₹40k - ₹60k</option>
                  <option>₹60k - ₹1L</option>
                </select>
                <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option>Years of Experience</option>
                  <option>0-1 Years</option>
                  <option>1-3 Years</option>
                  <option>3-5 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>

              {/* Search Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 pt-2">
                <Button asChild size="lg" className="flex-1 rounded-lg bg-blue-600 font-semibold shadow-md hover:bg-blue-700">
                  <Link href="/jobs">
                    <Search className="mr-2 size-4" />
                    Find Jobs
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-lg border-2 border-blue-600 bg-white font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/ai-search">
                    <Brain className="mr-2 size-4" />
                    AI Search
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
