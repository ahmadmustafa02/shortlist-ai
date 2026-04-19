import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StepIndicator } from "@/components/analysis/StepIndicator";
import { ResumeStep } from "@/components/analysis/ResumeStep";
import { JobStep } from "@/components/analysis/JobStep";
import { TimeStep } from "@/components/analysis/TimeStep";
import { Button } from "@/components/ui/button";
import { AnalyzingOverlay } from "@/components/analysis/AnalyzingOverlay";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { TimeBudget } from "@/lib/analysis-schema";

const STEPS = [
  { id: 1, label: "Resume" },
  { id: 2, label: "Job" },
  { id: 3, label: "Timeline" },
];

/**
 * Wizard for kicking off a new “shortlist” analysis. I keep each step’s fields in
 * separate state chunks instead of one big object so we only re-render what matters
 * and the step components stay dumb/presentational.
 *
 * Flow ends by calling the `analyze-application` Edge Function with everything we
 * collected; the overlay + `isSubmitting` keep the user from double-submitting while
 * Supabase is doing its thing.
 */
const NewAnalysis = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Step 2
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");

  // Step 3
  const [timeBudget, setTimeBudget] = useState<TimeBudget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Final step: ship the job + resume + time budget to the Edge Function and bounce
   * to `/analysis/:id` on success.
   *
   * The annoying bit is error handling — `supabase.functions.invoke` doesn’t give you
   * a nice JSON body on 4xx/5xx; you get a `FunctionsHttpError` and the actual message
   * is often hiding in `error.context` (sometimes `json.error`, sometimes a string body
   * you have to `JSON.parse`). I peel those layers so the toast shows what the
   * function actually said instead of a useless generic message.
   */
  const handleSubmit = async () => {
    if (!timeBudget) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-application", {
        body: { jobTitle, company, jdText, resumeText, timeBudget },
      });

      if (error) {
        // Supabase wraps non-2xx as FunctionsHttpError; try to read the body.
        let message = error.message ?? "Something went wrong";
        const ctx = (error as unknown as { context?: { json?: { error?: string }; body?: string } }).context;
        if (ctx?.json?.error) message = ctx.json.error;
        else if (typeof ctx?.body === "string") {
          try {
            message = JSON.parse(ctx.body).error ?? message;
          } catch { /* keep default */ }
        }
        toast({ title: "Analysis failed", description: message, variant: "destructive" });
        return;
      }

      if (!data?.id) {
        toast({ title: "Unexpected response", description: "No analysis id returned.", variant: "destructive" });
        return;
      }

      navigate(`/analysis/${data.id}`);
    } catch (e) {
      console.error(e);
      toast({
        title: "Analysis failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container max-w-3xl py-10 md:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">New analysis</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Let's get you shortlisted
          </h1>
        </div>

        <div className="mb-10">
          <StepIndicator steps={STEPS} current={step} />
        </div>

        {step === 1 && (
          <ResumeStep
            resumeText={resumeText}
            onResumeTextChange={setResumeText}
            fileName={fileName}
            onFileNameChange={setFileName}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <JobStep
            jobTitle={jobTitle}
            company={company}
            jdText={jdText}
            onJobTitleChange={setJobTitle}
            onCompanyChange={setCompany}
            onJdTextChange={setJdText}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <TimeStep
            timeBudget={timeBudget}
            onTimeBudgetChange={setTimeBudget}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </main>
      <AnalyzingOverlay open={isSubmitting} />
    </div>
  );
};

export default NewAnalysis;
