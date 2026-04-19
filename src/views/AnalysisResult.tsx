import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill } from "@/components/ui/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import type { AnalysisReport } from "@/types/report";
import { TIME_BUDGETS } from "@/lib/analysis-schema";
import { cn } from "@/lib/utils";

interface AnalysisRow {
  id: string;
  job_title: string;
  company: string | null;
  time_budget: string;
  fit_score: number | null;
  ats_before: number | null;
  ats_after: number | null;
  result_json: AnalysisReport | null;
  created_at: string;
}

const scoreColor = (n: number) => {
  if (n >= 80) return "text-success";
  if (n >= 60) return "text-primary";
  if (n >= 40) return "text-warning";
  return "text-destructive";
};

const ScoreCard = ({
  label,
  value,
  icon: Icon,
  sublabel,
}: {
  label: string;
  value: number;
  icon: typeof Target;
  sublabel?: string;
}) => (
  <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
    <div className="mt-4 flex items-baseline gap-2">
      <span className={cn("font-display text-5xl font-semibold tracking-tight", scoreColor(value))}>
        {value}
      </span>
      <span className="text-lg text-muted-foreground">/100</span>
    </div>
    {sublabel && <p className="mt-2 text-sm text-muted-foreground">{sublabel}</p>}
  </div>
);

const ChipList = ({ items, tone = "default" }: { items: string[]; tone?: "default" | "warning" }) => {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">Nothing missing here. Nice.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            tone === "warning"
              ? "border-warning/40 bg-warning/10 text-foreground"
              : "border-primary/30 bg-primary-soft text-accent-foreground",
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const copy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  } catch {
    toast({ title: "Couldn't copy", variant: "destructive" });
  }
};

const AnalysisResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [row, setRow] = useState<AnalysisRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("analyses")
        .select("id,job_title,company,time_budget,fit_score,ats_before,ats_after,result_json,created_at")
        .eq("id", id)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        toast({ title: "Analysis not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }
      setRow(data as unknown as AnalysisRow);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, navigate]);

  if (loading || !row || !row.result_json) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container max-w-5xl py-10">
          <Skeleton className="mb-4 h-8 w-40" />
          <Skeleton className="mb-8 h-12 w-2/3" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  const report = row.result_json;
  const timeLabel =
    TIME_BUDGETS.find((t) => t.value === row.time_budget)?.label ?? row.time_budget;
  const atsDelta = report.ats_after - report.ats_before;

  const allRewriteText = report.bullet_rewrites.map((b) => `• ${b.after}`).join("\n");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container max-w-5xl py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Analysis</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {row.job_title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {row.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {row.company}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {timeLabel} to prepare
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {new Date(row.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button asChild variant="hero">
            <Link to="/new">
              <Sparkles className="h-4 w-4" /> New analysis
            </Link>
          </Button>
        </div>

        {/* Headline summary */}
        <p className="mt-6 max-w-3xl rounded-2xl border border-border bg-primary-soft/50 p-5 text-base leading-relaxed">
          {report.fit_summary}
        </p>

        {/* Score cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ScoreCard label="Fit Score" value={report.fit_score} icon={Target} sublabel="Overall match" />
          <ScoreCard label="ATS Before" value={report.ats_before} icon={ListChecks} sublabel="Current resume" />
          <ScoreCard
            label="ATS After"
            value={report.ats_after}
            icon={TrendingUp}
            sublabel={atsDelta > 0 ? `+${atsDelta} after applying tips` : "Apply the tips below"}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="gaps" className="mt-10">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            {[
              { v: "gaps", label: "Skill Gaps" },
              { v: "tips", label: "Tailoring Tips" },
              { v: "roadmap", label: "Prep Roadmap" },
              { v: "rewrites", label: "Bullet Rewrites" },
              { v: "interview", label: "Interview Qs" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Skill gaps */}
          <TabsContent value="gaps" className="mt-6 space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">Missing hard skills</h3>
              <p className="text-sm text-muted-foreground">Skills the JD requires that aren't in your resume.</p>
              <div className="mt-4">
                <ChipList items={report.skill_gaps.missing_hard_skills} tone="warning" />
              </div>
            </section>
            <section className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">Missing keywords</h3>
              <p className="text-sm text-muted-foreground">ATS-relevant phrases to weave in where truthful.</p>
              <div className="mt-4">
                <ChipList items={report.skill_gaps.missing_keywords} />
              </div>
            </section>
            <section className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-display text-xl font-semibold">Missing experience signals</h3>
              <p className="text-sm text-muted-foreground">Patterns of experience the role expects.</p>
              <div className="mt-4">
                <ChipList items={report.skill_gaps.missing_experience_signals} tone="warning" />
              </div>
            </section>
          </TabsContent>

          {/* Tailoring tips */}
          <TabsContent value="tips" className="mt-6 space-y-4">
            {report.tailoring_tips.map((tip, i) => (
              <div key={i} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-lg font-semibold">{tip.title}</h4>
                      <Pill
                        variant="outline"
                        className={cn(
                          "uppercase tracking-wide",
                          tip.priority === "high" && "border-primary/40 bg-primary-soft text-accent-foreground",
                        )}
                      >
                        {tip.priority}
                      </Pill>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Roadmap */}
          <TabsContent value="roadmap" className="mt-6 space-y-6">
            <p className="rounded-2xl border border-border bg-primary-soft/50 p-5 text-sm leading-relaxed">
              {report.prep_roadmap.overview}
            </p>
            <ol className="space-y-4">
              {report.prep_roadmap.phases.map((phase, i) => (
                <li key={i} className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-semibold">{phase.name}</h4>
                      <p className="text-sm text-muted-foreground">{phase.focus}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {phase.actions.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </TabsContent>

          {/* Rewrites */}
          <TabsContent value="rewrites" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => copy(allRewriteText, "All rewrites")}>
                <Copy className="h-4 w-4" /> Copy all
              </Button>
            </div>
            {report.bullet_rewrites.map((b, i) => (
              <div key={i} className="rounded-3xl border border-border bg-card p-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Before</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-through decoration-muted-foreground/40">
                      {b.before}
                    </p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">After</p>
                    <p className="mt-2 text-sm leading-relaxed">{b.after}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Why: </span>
                    {b.why}
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => copy(b.after, "Bullet")}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Interview */}
          <TabsContent value="interview" className="mt-6 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">Technical</h3>
              </div>
              <ul className="mt-4 space-y-4">
                {report.interview_questions.technical.map((q, i) => (
                  <li key={i} className="border-l-2 border-primary/30 pl-4">
                    <p className="font-medium leading-snug">{q.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Really asking: </span>
                      {q.hint}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">Behavioral</h3>
              </div>
              <ul className="mt-4 space-y-4">
                {report.interview_questions.behavioral.map((q, i) => (
                  <li key={i} className="border-l-2 border-primary/30 pl-4">
                    <p className="font-medium leading-snug">{q.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Really asking: </span>
                      {q.hint}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalysisResult;
