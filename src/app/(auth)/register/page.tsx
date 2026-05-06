"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  linkedin: string;
  github: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    linkedin: "",
    github: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber || undefined,
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1.5 text-sm">
            Start generating tailored CVs in seconds
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={update("fullName")}
                placeholder="Jane Smith"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address <span className="text-blue-500">*</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={update("email")}
                placeholder="jane@example.com"
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Password <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={update("password")}
                    placeholder="Min. 8 characters"
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm password <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={update("confirmPassword")}
                    placeholder="Repeat password"
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 pr-10 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Optional fields */}
            <div className="pt-2 pb-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Optional profile info
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={update("phoneNumber")}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={update("linkedin")}
                  placeholder="linkedin.com/in/..."
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  GitHub
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={update("github")}
                  placeholder="github.com/..."
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:bg-slate-800 transition-colors outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
