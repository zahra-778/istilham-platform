import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Send,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { simulationsService } from "@/services/mockSimulations";
import { challengesService } from "@/services/mockChallenges";
import { toArabicDigits, toArabicNumber, toArabicPercent } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { BehaviorEvent } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/simulations/$simulationId")({
  head: () => ({
    meta: [
      { title: "خوض المحاكاة التفاعلية | استلهام" },
      { name: "description", content: "عش تجربة مواقف واقعية واتخذ قرارات مهنية تحاكي بيئة العمل الفعلية." },
    ],
  }),
  component: SimulationPlayerPage,
});

function SimulationPlayerPage() {
  const { simulationId } = Route.useParams();
  const navigate = useNavigate();

  const {
    data: simulation,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["simulation", simulationId],
    queryFn: () => simulationsService.get(simulationId),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [hintsUsed, setHintsUsed] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState(false);
  const [attemptsCount, setAttemptsCount] = useState<Record<string, number>>({});
  const [decisionChanged, setDecisionChanged] = useState<Record<string, boolean>>({});

  // Challenge timer tracking
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const challengeStartTimes = useRef<Record<string, number>>({});
  const challengeDurations = useRef<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (simulation && simulation.challenges[currentIndex]) {
      const currentId = simulation.challenges[currentIndex].id;
      if (!challengeStartTimes.current[currentId]) {
        challengeStartTimes.current[currentId] = Date.now();
      }
    }
    setShowHint(false);
  }, [currentIndex, simulation]);

  const submitMutation = useMutation({
    mutationFn: async (events: BehaviorEvent[]) => {
      return simulationsService.submit(simulationId, events);
    },
    onSuccess: () => {
      toast.success("تم إكمال المحاكاة بنجاح! جاري استخراج التحليل السلوكي...");
      navigate({
        to: "/results/$simulationId",
        params: { simulationId },
      });
    },
    onError: () => {
      toast.error("حدث خطأ أثناء معالجة النتائج. يرجى المحاولة مرة أخرى.");
    },
  });

  if (isLoading) {
    return (
      <AppShell
        title="المحاكاة المهنية"
        breadcrumbs={[
          { label: "المحاكاة", to: "/simulations" },
          { label: "جاري التحميل..." },
        ]}
      >
        <LoadingState label="جاري تحضير بيئة المحاكاة التفاعلية..." />
      </AppShell>
    );
  }

  if (isError || !simulation || !simulation.challenges || simulation.challenges.length === 0) {
    return (
      <AppShell
        title="خطأ في المحاكاة"
        breadcrumbs={[
          { label: "المحاكاة", to: "/simulations" },
          { label: "خطأ" },
        ]}
      >
        <ErrorState description="تعذر العثور على بيانات المحاكاة المحددة." />
      </AppShell>
    );
  }

  const challenges = simulation.challenges;
  const currentChallenge = challenges[currentIndex];

  if (!currentChallenge) {
    return (
      <AppShell
        title="خطأ في المحاكاة"
        breadcrumbs={[
          { label: "المحاكاة", to: "/simulations" },
          { label: "خطأ" },
        ]}
      >
        <ErrorState description="تعذر العثور على بيانات التحدي الحالي." />
      </AppShell>
    );
  }

  const currentSelected = selectedAnswers[currentChallenge.id];
  const isLastChallenge = currentIndex === challenges.length - 1;
  const isCurrentAnswered = Boolean(currentSelected);
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / challenges.length) * 100);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${toArabicDigits(mins.toString().padStart(2, "0"))}:${toArabicDigits(secs.toString().padStart(2, "0"))}`;
  };

  const handleSelectOption = (optionId: string) => {
    const cId = currentChallenge.id;
    const previous = selectedAnswers[cId];

    if (previous && previous !== optionId) {
      setDecisionChanged((prev) => ({ ...prev, [cId]: true }));
    }

    setAttemptsCount((prev) => ({
      ...prev,
      [cId]: (prev[cId] || 0) + 1,
    }));

    setSelectedAnswers((prev) => ({ ...prev, [cId]: optionId }));

    // Log instant interaction
    const responseSecs = Math.max(1, Math.round((Date.now() - (challengeStartTimes.current[cId] || Date.now())) / 1000));
    challengeDurations.current[cId] = responseSecs;

    const opt = currentChallenge.options.find((o) => o.id === optionId);
    challengesService.logEvent({
      challengeId: cId,
      optionId,
      responseSeconds: responseSecs,
      attempts: (attemptsCount[cId] || 0) + 1,
      changedDecision: Boolean(previous && previous !== optionId),
      usedHint: Boolean(hintsUsed[cId]),
      correct: (opt?.quality ?? 3) >= 4,
    });
  };

  const handleToggleHint = () => {
    const cId = currentChallenge.id;
    setHintsUsed((prev) => ({ ...prev, [cId]: true }));
    setShowHint((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitSimulation = () => {
    if (answeredCount < challenges.length) {
      toast.warning("يرجى الإجابة على جميع مواقف المحاكاة قبل إرسال النتائج.");
      return;
    }

    const events: BehaviorEvent[] = challenges.map((c) => {
      const optId = selectedAnswers[c.id] || c.options[0]?.id || "";
      const opt = c.options.find((o) => o.id === optId);
      const dur = challengeDurations.current[c.id] || 15;

      return {
        challengeId: c.id,
        optionId: optId,
        responseSeconds: dur,
        attempts: attemptsCount[c.id] || 1,
        changedDecision: Boolean(decisionChanged[c.id]),
        usedHint: Boolean(hintsUsed[c.id]),
        correct: (opt?.quality ?? 3) >= 4,
      };
    });

    submitMutation.mutate(events);
  };

  return (
    <AppShell
      title={simulation.title}
      subtitle={simulation.intro}
      breadcrumbs={[
        { label: "المحاكاة المهنية", to: "/simulations" },
        { label: simulation.title },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-xs">
            <Clock className="h-3.5 w-3.5 text-teal" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Progress & Step Status Card */}
        <section className="card-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-navy">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal text-xs font-extrabold text-primary-foreground">
                {toArabicNumber(currentIndex + 1)}
              </span>
              <span>
                الموقف {toArabicNumber(currentIndex + 1)} من {toArabicNumber(challenges.length)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>نسبة الإنجاز: {toArabicPercent(progressPercent)}</span>
              <span className="text-xs font-semibold text-teal">
                ({toArabicNumber(answeredCount)} / {toArabicNumber(challenges.length)} مكتمل)
              </span>
            </div>
          </div>

          <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-l from-turquoise to-teal transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
            />
          </div>

          {/* Stepper Dots */}
          <div className="mt-4 flex items-center justify-between gap-1">
            {challenges.map((c, idx) => {
              const isAnswered = Boolean(selectedAnswers[c.id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-bold transition-all",
                    isCurrent
                      ? "border-2 border-teal bg-mint-soft text-teal shadow-xs"
                      : isAnswered
                        ? "bg-teal/10 text-teal hover:bg-teal/20"
                        : "bg-muted text-muted-foreground hover:bg-accent",
                  )}
                  title={`الموقف ${toArabicNumber(idx + 1)}`}
                >
                  {toArabicNumber(idx + 1)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Current Challenge Scenario Card */}
        <section className="card-surface relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-teal/5 blur-2xl" />

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-mint-soft px-3.5 py-1 text-xs font-bold text-teal">
            <Sparkles className="h-3.5 w-3.5" />
            <span>موقف مهني واقعي #{toArabicNumber(currentIndex + 1)}</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/60 p-5 backdrop-blur-xs">
            <p className="text-sm font-semibold text-muted-foreground">وصف الموقف:</p>
            <p className="text-balance-ar mt-2 text-base font-bold leading-relaxed text-navy sm:text-lg">
              {currentChallenge.situation}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-extrabold text-navy sm:text-lg">
              {currentChallenge.question}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              اختر الإجراء الذي تراه أكثر ملاءمة ومهنية في هذا الموقف:
            </p>
          </div>

          {/* Options Grid */}
          <div className="mt-5 space-y-3">
            {currentChallenge.options.map((option) => {
              const isSelected = currentSelected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "flex w-full items-start gap-4 rounded-2xl border p-4 text-right transition-all sm:p-5",
                    isSelected
                      ? "border-teal bg-mint-soft/50 ring-2 ring-teal/30 shadow-xs"
                      : "border-border bg-card hover:border-turquoise hover:bg-accent/40",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all",
                      isSelected
                        ? "border-teal bg-teal text-primary-foreground"
                        : "border-muted-foreground/40 bg-background",
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {option.id.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 text-sm font-semibold text-navy leading-relaxed sm:text-base">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hint Collapsible */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleToggleHint}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:text-teal/80 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                <span>{showHint ? "إخفاء التلميح الذكي" : "طلب تلميح ذكي"}</span>
              </button>
              {hintsUsed[currentChallenge.id] && (
                <span className="text-[11px] text-muted-foreground">
                  (تم الاستعانة بالتلميح)
                </span>
              )}
            </div>

            {showHint && (
              <div className="mt-3 rounded-xl border border-turquoise/30 bg-mint-soft/60 p-4 text-xs sm:text-sm text-navy leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-teal mt-0.5" />
                  <div>
                    <p className="font-bold text-teal">إرشاد لمساعدتك في اتخاذ القرار:</p>
                    <p className="mt-1 text-navy">{currentChallenge.hint}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Navigation & Submission Controls */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-navy transition-colors",
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed bg-muted"
                : "bg-card hover:bg-accent",
            )}
          >
            <ArrowRight className="h-4 w-4" />
            الموقف السابق
          </button>

          <div className="flex items-center gap-2">
            {!isLastChallenge ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isCurrentAnswered}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-primary-foreground transition-all shadow-xs",
                  isCurrentAnswered
                    ? "bg-teal hover:bg-turquoise"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                )}
              >
                الموقف التالي
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitSimulation}
                disabled={answeredCount < challenges.length || submitMutation.isPending}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-primary-foreground transition-all shadow-md",
                  answeredCount === challenges.length && !submitMutation.isPending
                    ? "bg-linear-to-l from-teal to-turquoise hover:opacity-95"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                )}
              >
                {submitMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    جاري معالجة السلوك...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    إنهاء المحاكاة واستخراج التحليل
                  </>
                )}
              </button>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
