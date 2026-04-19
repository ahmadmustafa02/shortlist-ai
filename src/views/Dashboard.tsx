import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Clock, Plus, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { TIME_BUDGETS } from "@/lib/analysis-schema";
import { cn } from "@/lib/utils";

interface AnalysisListItem {
  id: string;
  job_title: string;
  company: string | null;
  time_budget: string;
  fit_score: number | null;
  created_at: string;
}

const scoreColor = (n: number | null) => {
  if (n == null) return "text-muted-foreground";
  if (n >= 80) return "text-success";
  if (n >= 60) return "text-primary";
  if (n >= 40) return "text-warning";
  return "text-destructive";
};

const Dashboard = () => {
  const { user } = useAuth();
  const greetingName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const [items, setItems] = useState<AnalysisListItem[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("analyses")
        .select("id,job_title,company,time_budget,fit_score,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (!active) return;
      if (error) {
        console.error(error);
        setItems([]);
        return;
      }
      setItems((data ?? []) as AnalysisListItem[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  const isLoading = items === null;
  const isEmpty = items?.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container py-12 md:py-16">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Dashboard</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Hi {greetingName} 👋
            </h1>
            <p className="mt-2 text-muted-foreground">Ready to tailor your resume to your next role?</p>
          </div>
          <Button asChild size="lg" variant="hero">
            <Link to="/new">
              <Plus className="h-4 w-4" /> New analysis
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center md:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold">No analyses yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Run your first analysis — paste a job description, drop your resume, and we'll do the rest.
            </p>
            <Button asChild className="mt-6" variant="hero">
              <Link to="/new">
                <Plus className="h-4 w-4" /> Start your first analysis
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {items!.map((a) => {
              const tb = TIME_BUDGETS.find((t) => t.value === a.time_budget);
              return (
                <Link
                  key={a.id}
                  to={`/analysis/${a.id}`}
                  className="group rounded-3xl border border-border bg-card p-6 transition hover:border-primary/60 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-xl font-semibold">{a.job_title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {a.company && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" /> {a.company}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {tb?.label ?? a.time_budget}
                        </span>
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <Target className="h-3 w-3" /> Fit
                      </div>
                      <p className={cn("font-display text-3xl font-semibold", scoreColor(a.fit_score))}>
                        {a.fit_score ?? "–"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
