import { prisma } from "../../config/prisma";
import type { ActivityType } from "@prisma/client";

export class BehaviorService {
  async trackEvent(studentId: string, data: { type: ActivityType; titleAr: string; detailAr: string }) {
    return prisma.activityLog.create({
      data: {
        studentId,
        type: data.type,
        titleAr: data.titleAr,
        detailAr: data.detailAr,
      },
    });
  }

  async getBehavioralProfile(studentId: string) {
    const profile = await prisma.behavioralProfile.findUnique({
      where: { userId: studentId },
    });
    if (!profile) {
      throw new Error("الملف السلوكي غير موجود.");
    }
    return profile;
  }
}
