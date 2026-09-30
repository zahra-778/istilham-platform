import { request, delay } from "./apiClient";
import { getSimulation, simulations as fallbackSimulations } from "@/data/simulations";
import type { BehaviorEvent, Simulation, SimulationChallenge, SimulationResult, SkillKey } from "@/types";

const cachedResults = new Map<string, SimulationResult>();

function mapDifficulty(diff: string): "مبتدئ" | "متوسط" | "متقدم" {
  if (diff === "BEGINNER") return "مبتدئ";
  if (diff === "ADVANCED") return "متقدم";
  return "متوسط";
}

function mapSimulation(sim: any): Simulation {
  const challenges: SimulationChallenge[] = (sim.challenges || []).map((c: any) => ({
    id: c.id,
    situation: c.situationAr,
    question: c.questionAr,
    hint: c.hintAr || "",
    options: (c.options || []).map((o: any) => ({
      id: o.id,
      text: o.textAr,
      quality: o.quality,
    })),
  }));

  return {
    id: sim.slug || sim.id,
    careerId: sim.career?.slug || sim.careerId,
    title: sim.titleAr,
    description: sim.descriptionAr,
    difficulty: mapDifficulty(sim.difficulty),
    duration: `${sim.durationMinutes || 20} دقيقة`,
    intro: sim.introAr || sim.descriptionAr,
    progress: 0,
    challenges,
  };
}

export const simulationsService = {
  async list(): Promise<Simulation[]> {
    try {
      const list = await request<any[]>("/simulations");
      if (list && list.length > 0) {
        return list.map((s) => mapSimulation(s));
      }
      return fallbackSimulations;
    } catch {
      return delay(fallbackSimulations, 250);
    }
  },

  async get(id: string): Promise<Simulation> {
    try {
      const sim = await request<any>(`/simulations/${id}`);
      if (sim) {
        return mapSimulation(sim);
      }
      const local = getSimulation(id);
      if (!local) throw new Error("لم يتم العثور على المحاكاة المطلوبة.");
      return local;
    } catch {
      const local = getSimulation(id);
      if (!local) throw new Error("لم يتم العثور على المحاكاة المطلوبة.");
      return delay(local, 250);
    }
  },

  async submit(simulationId: string, events: BehaviorEvent[]): Promise<SimulationResult> {
    try {
      // 1. Start simulation session on backend
      const session = await request<any>(`/simulations/${simulationId}/start`, {
        method: "POST",
      });
      const sessionId = session?.id;

      if (sessionId) {
        // 2. Send all challenge attempts
        for (const e of events) {
          await request(
            `/simulations/sessions/${sessionId}/challenges/${e.challengeId}/attempt`,
            {
              method: "POST",
              body: JSON.stringify({
                optionId: e.optionId,
                responseSeconds: e.responseSeconds,
                attempts: e.attempts,
                changedDecision: e.changedDecision,
                usedHint: e.usedHint,
              }),
            }
          ).catch(() => null);
        }

        // 3. Complete simulation session
        const result = await request<any>(
          `/simulations/sessions/${sessionId}/complete`,
          {
            method: "POST",
          }
        );

        if (result) {
          const indicators = result.indicators as Record<SkillKey, number>;
          const formatted: SimulationResult = {
            simulationId,
            careerId: result.careerId,
            completedAt: "اليوم",
            indicators,
            totalTimeMinutes: result.totalTimeMinutes,
            correctAnswers: result.correctAnswers,
            totalChallenges: result.totalChallenges,
            summary: result.summaryAr,
            events,
          };

          cachedResults.set(simulationId, formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn("Backend simulation submit fallback:", err);
    }

    // Fallback calculation
    const simulation = getSimulation(simulationId);
    if (!simulation) throw new Error("لم يتم العثور على المحاكاة المطلوبة.");

    const total = events.length || 1;
    const avgQuality =
      events.reduce((sum, e) => {
        const challenge = simulation.challenges.find((c) => c.id === e.challengeId);
        const option = challenge?.options.find((o) => o.id === e.optionId);
        return sum + (option?.quality ?? 3);
      }, 0) / total;

    const avgTime = events.reduce((s, e) => s + e.responseSeconds, 0) / total;
    const changed = events.filter((e) => e.changedDecision).length;
    const hints = events.filter((e) => e.usedHint).length;
    const correct = events.filter((e) => e.correct).length;

    const qualityBase = 55 + avgQuality * 7;
    const clamp = (v: number) => Math.max(40, Math.min(98, Math.round(v)));

    const indicators: Record<SkillKey, number> = {
      problemSolving: clamp(qualityBase + (hints === 0 ? 5 : -3)),
      analyticalThinking: clamp(qualityBase + (avgTime > 12 ? 4 : -2)),
      decisionMaking: clamp(qualityBase + (changed <= 1 ? 6 : -4)),
      creativity: clamp(qualityBase - 8 + Math.random() * 8),
      communication: clamp(qualityBase - 5 + Math.random() * 8),
      leadership: clamp(qualityBase - 9 + Math.random() * 10),
      persistence: clamp(qualityBase + (events.reduce((s, e) => s + e.attempts, 0) > total ? 6 : 2)),
      timeManagement: clamp(90 - avgTime * 1.6),
    };

    const result: SimulationResult = {
      simulationId,
      careerId: simulation.careerId,
      completedAt: "اليوم",
      indicators,
      totalTimeMinutes: Math.max(3, Math.round((avgTime * total) / 60)),
      correctAnswers: correct,
      totalChallenges: total,
      summary:
        "أظهرت أداءً قويًا في اتخاذ القرار وحل المشكلات، مع قدرة جيدة على التعامل مع التحديات والمواقف المختلفة، وميل إلى تحليل المعلومات قبل التصرف.",
      events,
    };

    cachedResults.set(simulationId, result);
    return delay(result, 600);
  },

  async getResult(simulationId: string): Promise<SimulationResult> {
    const cached = cachedResults.get(simulationId);
    if (cached) return cached;

    try {
      const res = await request<any>(`/simulations/results/${simulationId}`);
      if (res) {
        return {
          simulationId,
          careerId: res.careerId || res.simulation?.career?.slug,
          completedAt: new Date(res.completedAt).toLocaleDateString("ar-SA"),
          indicators: res.indicators,
          totalTimeMinutes: res.totalTimeMinutes,
          correctAnswers: res.correctAnswers,
          totalChallenges: res.totalChallenges,
          summary: res.summaryAr,
          events: [],
        };
      }
    } catch {
      // Fallback
    }

    const simulation = getSimulation(simulationId);
    if (!simulation) throw new Error("لم يتم العثور على نتائج هذه المحاكاة.");

    return delay(
      {
        simulationId,
        careerId: simulation.careerId,
        completedAt: "قبل يومين",
        indicators: {
          problemSolving: 87,
          analyticalThinking: 82,
          decisionMaking: 91,
          creativity: 74,
          communication: 79,
          leadership: 71,
          persistence: 88,
          timeManagement: 76,
        },
        totalTimeMinutes: 21,
        correctAnswers: 6,
        totalChallenges: simulation.challenges.length,
        summary:
          "أظهرت أداءً قويًا في اتخاذ القرار وحل المشكلات، مع قدرة جيدة على التعامل مع التحديات والمواقف المختلفة.",
        events: [],
      },
      300
    );
  },
};
