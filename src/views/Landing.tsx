import { Link } from "react-router-dom";
import { ArrowRight, FileText, Target, Sparkles, Clock, MessageSquare, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FitScoreSample } from "@/components/FitScoreSample";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const ctaTo = user ? "/dashboard" : "/auth?mode=signup";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-hero" />
          <div className="absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="container grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-7 animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                AI resume tailoring
              </span>
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Get shortlisted <br />
                for the job you <em className="not-italic text-gradient-primary">actually want.</em>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Upload your resume, paste a job description, tell us how much time you have — and we'll hand you a fit score, the gaps to close, a prep roadmap, and rewritten bullets.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link to={ctaTo}>
                    Analyze my resume <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">See how it works</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-2 text-xs text-muted-foreground">
                <span>✓ No credit card</span>
                <span>✓ Private by default</span>
                <span>✓ Results in ~30s</span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <FitScoreSample />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-y border-border/60 bg-surface">
          <div className="container py-20 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">How it works</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Three steps. One ridiculously good resume.</h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                { icon: FileText, n: "01", title: "Upload your resume", body: "Drop your PDF — we'll pull out the text and let you polish anything that didn't extract cleanly." },
                { icon: Target, n: "02", title: "Paste the job", body: "Add the job description and tell us how long you have to prepare — a week, a month, half a year." },
                { icon: Sparkles, n: "03", title: "Get your shortlist plan", body: "Fit score, missing skills, a phased prep roadmap, rewritten bullets, and the questions they'll ask." },
              ].map(({ icon: Icon, n, title, body }) => (
                <div key={n} className="group relative rounded-3xl border border-border bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-display text-sm text-muted-foreground">{n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="container py-20 md:py-28">
          <div className="grid items-end gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">What you get</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Everything a recruiter wishes you knew.</h2>
            </div>
            <p className="text-muted-foreground md:text-right">No fluff. No generic advice. Specific, actionable feedback tied to the exact job you're targeting.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Target, title: "Fit Score & ATS scores", body: "See your match out of 100, and your ATS score before vs. after suggested edits." },
              { icon: ListChecks, title: "Skill gaps & keywords", body: "Hard skills, tools, and exact keywords missing from your resume — grouped by priority." },
              { icon: Clock, title: "Time-aware prep plan", body: "A phased roadmap that fits your timeline. 1 week? 6 months? You only get what's realistic." },
              { icon: Sparkles, title: "Bullet rewrites", body: "Before / after rewrites of your weakest bullets — tuned to the job's language." },
              { icon: MessageSquare, title: "Interview questions", body: "Technical and behavioral questions you're likely to face, with what they're really asking." },
              { icon: FileText, title: "Tailoring tips", body: "Concrete edits to make right now, before you hit send on the application." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-20 md:pb-28">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground px-8 py-16 text-background md:px-16 md:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-glow/30 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Stop sending generic resumes into the void.
                </h2>
                <p className="mt-4 max-w-md text-background/70">
                  Get a tailored plan for your next application in under a minute.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Button asChild size="xl" variant="hero" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to={ctaTo}>
                    Start your first analysis <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border/60 bg-surface">
          <div className="container py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">FAQ</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Quick answers</h2>
            </div>
            <div className="mx-auto mt-12 max-w-2xl space-y-4">
              {[
                { q: "Is my resume data private?", a: "Yes. Your resume and analyses are stored securely and only visible to you." },
                { q: "What kind of resume formats are supported?", a: "PDF for now. We extract the text and let you fix anything that didn't come through cleanly." },
                { q: "How accurate is the fit score?", a: "It's based on a careful comparison of your experience, skills, and keywords against the job description — but always treat it as guidance, not a verdict." },
              ].map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="font-display text-lg font-semibold">{q}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Landing;
