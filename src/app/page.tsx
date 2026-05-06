import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  FileSearch,
  Layers,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tailoring",
    description:
      "Claude analyses your experience and the job description to highlight exactly what the hiring manager wants to see.",
  },
  {
    icon: Target,
    title: "ATS Optimised",
    description:
      "Keywords and phrases from the job description are naturally woven in, so your CV passes automated screening systems.",
  },
  {
    icon: FileSearch,
    title: "Cover Letter Generation",
    description:
      "Generate a compelling, personalised cover letter that speaks directly to the company and role — no generic templates.",
  },
  {
    icon: Sparkles,
    title: "Quantified Achievements",
    description:
      "Your bullet points are rewritten with strong action verbs and quantified results that grab attention in seconds.",
  },
  {
    icon: Layers,
    title: "Multiple Formats",
    description:
      "Export as Markdown, PDF, HTML, or JSON. Use Cevvy to manage all versions of your CV in one place.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description:
      "Streamed responses mean you see your tailored CV being written in real time — no waiting, no loading screens.",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste your existing CV",
    description:
      "Copy and paste your current CV text — doesn't matter how rough or outdated it is.",
  },
  {
    number: "02",
    title: "Add the job description",
    description:
      "Paste the full job posting you're applying to. The more detail, the better the tailoring.",
  },
  {
    number: "03",
    title: "Generate in seconds",
    description:
      "Hit generate and watch Claude craft your perfectly tailored CV in real time.",
  },
];

const benefits = [
  "Tailored to each specific job — not a one-size-fits-all template",
  "Keywords match what recruiters and ATS systems look for",
  "Professional summary written to hook hiring managers instantly",
  "Every bullet rewritten with impact metrics and strong verbs",
  "Cover letters that don't sound like AI wrote them",
  "Save unlimited CV versions for different roles",
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-3xl" />
        <div className="absolute top-2/3 -right-20 h-[300px] w-[300px] rounded-full bg-cyan-600/8 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Powered by Claude claude-sonnet-4-6
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Generate your</span>
            <br />
            <span className="gradient-text">perfect CV</span>
            <br />
            <span className="text-white">in seconds</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste your existing CV and a job description. Cevvy uses AI to tailor
            your experience, optimise for ATS systems, and craft a cover letter
            that gets you interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:scale-105 text-lg"
            >
              Generate your CV for free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl transition-all text-lg font-medium hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Ready in under 30 seconds</span>
            </div>
            <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Saves all your CVs</span>
            </div>
          </div>
        </div>

        {/* Hero mockup */}
        <div className="mx-auto max-w-5xl mt-16">
          <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/40">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-slate-500">cevvy.app/workspace</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-slate-700/50 min-h-[300px]">
              <div className="p-6">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                  Your Inputs
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
                    <div className="text-xs text-blue-400 mb-1.5 font-medium">Existing CV</div>
                    <div className="space-y-1">
                      {["John Smith — Software Engineer", "5 years at TechCorp", "React, Node.js, Python"].map((line) => (
                        <div key={line} className="h-2.5 rounded bg-slate-700/60 text-xs text-slate-400 flex items-center pl-2 text-[10px]">
                          <span className="text-slate-500">{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-800/60 p-3 border border-slate-700/50">
                    <div className="text-xs text-cyan-400 mb-1.5 font-medium">Job Description</div>
                    <div className="space-y-1">
                      {["Senior Frontend Engineer @ Stripe", "5+ years experience required", "React, TypeScript, performance"].map((line) => (
                        <div key={line} className="h-2.5 rounded bg-slate-700/60 text-xs text-slate-400 flex items-center pl-2 text-[10px]">
                          <span className="text-slate-500">{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span>AI Output</span>
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-white">John Smith</div>
                  <div className="text-xs text-blue-400">Senior Frontend Engineer</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Seasoned frontend engineer with 5+ years delivering high-performance React applications at scale. At TechCorp, led frontend architecture for systems serving 2M+ users...
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-medium text-slate-300 mb-1">Experience</div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>• Architected React component library reducing bundle size by 40%</div>
                      <div>• Led TypeScript migration cutting runtime errors by 67%</div>
                      <div>• Optimised Core Web Vitals, improving LCP by 2.3s</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to land the job
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Cevvy isn't just a template filler. It's a strategic CV writer that
              understands what employers actually want to see.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/20 mb-4 group-hover:bg-blue-600/30 transition-colors">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Three steps to a better application
            </h2>
            <p className="text-lg text-slate-400">
              No complex workflows. No confusing settings. Just results.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-6">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/30 border border-blue-500/20">
                  <span className="text-xl font-bold text-blue-400">{step.number}</span>
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits list */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Why job seekers choose Cevvy
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Generic CVs get generic results. Cevvy generates a unique, tailored
                document for every role you apply to — without the hours of manual editing.
              </p>
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                Start for free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/40"
                >
                  <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card rounded-2xl p-12 glow-blue">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to stand out?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Create your free account and generate your first tailored CV in under a minute.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-lg shadow-xl shadow-blue-600/30 hover:scale-105"
            >
              Get started — it's free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-white">Cevvy</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Cevvy. AI-powered CV generation.
          </p>
        </div>
      </footer>
    </div>
  );
}
