import { delay } from "./apiClient";
import type { BehaviorEvent } from "@/types";

/**
 * Behavior tracking layer. Today it buffers events in memory;
 * later it will POST each event to the backend for the AI pipeline.
 */
class BehaviorTracker {
  private events: BehaviorEvent[] = [];

  reset() {
    this.events = [];
  }

  record(event: BehaviorEvent) {
    this.events = [...this.events.filter((e) => e.challengeId !== event.challengeId), event];
  }

  all(): BehaviorEvent[] {
    return [...this.events];
  }
}

export const behaviorTracker = new BehaviorTracker();

export const challengesService = {
  logEvent: (event: BehaviorEvent) => {
    behaviorTracker.record(event);
    return delay({ ok: true }, 120);
  },
  mostUsedChallenges: () =>
    delay(
      [
        { name: "اكتشاف خطأ قبل الإطلاق", career: "هندسة البرمجيات", usage: 1284 },
        { name: "تحليل بيانات متضاربة", career: "تحليل البيانات", usage: 1103 },
        { name: "الاستجابة لحادث أمني", career: "الأمن السيبراني", usage: 942 },
        { name: "إطلاق حملة بميزانية محدودة", career: "التسويق", usage: 877 },
        { name: "إدارة أزمة تأخر مورد", career: "إدارة الأعمال", usage: 690 },
      ],
      350,
    ),
};
