"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  Server,
  KeyRound,
  Tv
} from "lucide-react";
import { authService } from "@/services/authService";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login(username, password);
      setSuccess(true);
      router.push("/stories");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex font-sans select-none overflow-x-hidden">
      {/* 2-Column Split Layout matching reference image design */}
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side: Clean Light Hero Section with Image & Floating Cards */}
        <div className="lg:w-1/2 xl:w-7/12 bg-slate-100/90 p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-mono text-xs px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-bold tracking-wide">EDITION TV CONTROL CENTER &bull; admin.editiontv.com</span>
            </div>
          </div>

          {/* Center Hero Content & Image Showcase */}
          <div className="relative z-10 my-auto py-8 space-y-6 max-w-2xl">
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-serif leading-tight">
                Set Your Platform Governance on <span className="text-red-600 underline decoration-red-300 decoration-4 underline-offset-4">Auto-Pilot</span>
              </h1>
              <p className="text-slate-600 text-base leading-relaxed">
                Centralized platform governance, dynamic RBAC security matrix, automated ingestion pipelines, and live database cluster management.
              </p>
            </div>

            {/* Hero Image Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white group">
              <Image 
                src="/hero.png" 
                alt="Admin Control Room" 
                width={1000} 
                height={600} 
                className="w-full h-[340px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              
              {/* Floating Metric Badge 1 */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-mono block">System Health</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">100% Operational</span>
                </div>
              </div>

              {/* Floating Metric Badge 2 */}
              <div className="absolute top-4 right-4 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 font-mono text-xs">
                <Server className="h-4 w-4 text-red-500 animate-pulse" />
                <span>Cluster: PROD-US-EAST</span>
              </div>
            </div>
          </div>

          {/* Left Footer Info */}
          <div className="relative z-10 text-xs text-slate-500 font-mono flex items-center justify-between pt-4 border-t border-slate-200/80">
            <span>TLS 1.3 Strict &bull; Spring Security JWT</span>
            <span>PostgreSQL & OpenSearch Online</span>
          </div>
        </div>

        {/* Right Side: Clean White Form Container matching reference image */}
        <div className="flex-1 lg:w-1/2 xl:w-5/12 bg-white p-8 lg:p-16 flex flex-col justify-between relative shadow-xl min-h-screen">
          
          {/* Top Header with Edition TV Red Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Tv className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-serif block leading-none">
                  EDITION <span className="text-red-600">TV</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Control Console</span>
              </div>
            </div>
          </div>

          {/* Login Form Box */}
          <div className="my-auto py-6 space-y-6 max-w-md w-full mx-auto">
            
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                Login
              </h2>
              <p className="text-sm text-slate-500 font-sans">
                Login to your account. Enter your administrator credentials to access the control panel.
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-mono">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Authentication successful! Accessing Admin Console...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="edition_admin_user"
                    id="edition_admin_user"
                    autoComplete="off"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or email"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 text-slate-900 rounded-xl pl-10 pr-4 py-3 text-sm transition outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="edition_admin_pass"
                    id="edition_admin_pass"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-2 focus:ring-red-600/10 text-slate-900 rounded-xl pl-10 pr-10 py-3 text-sm transition outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Red Sign In Button matching reference design */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 uppercase tracking-wider disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 font-mono text-xs text-white">
                    <Sparkles className="h-4 w-4 animate-spin" /> Verifying Privileges...
                  </span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Footer */}
          <div className="text-center text-xs text-slate-400 font-sans">
            Edition TV Platform &copy; 2026 &bull; Secured with Spring Security JWT
          </div>

        </div>

      </div>
    </div>
  );
}
