import { z } from "zod";

export const recordAttemptSchema = z.object({
  body: z.object({
    optionId: z.string().min(1, "معرف الخيار مطلوب"),
    responseSeconds: z.number().nonnegative("وقت الاستجابة يجب أن يكون موجباً"),
    attempts: z.number().int().positive().default(1),
    changedDecision: z.boolean().default(false),
    usedHint: z.boolean().default(false),
  }),
});

export const createSimulationSchema = z.object({
  body: z.object({
    slug: z.string().min(1, "الاسم اللطيف (Slug) مطلوب"),
    careerId: z.string().min(1, "معرف المهنة مطلوب"),
    titleAr: z.string().min(1, "عنوان المحاكاة مطلوب"),
    descriptionAr: z.string().min(1, "وصف المحاكاة مطلوب"),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
    durationMinutes: z.number().int().positive().default(20),
    introAr: z.string().min(1, "المقدمة مطلوبة"),
    challenges: z
      .array(
        z.object({
          situationAr: z.string().min(1, "الموقف مطلوب"),
          questionAr: z.string().min(1, "السؤال مطلوب"),
          hintAr: z.string().default(""),
          options: z
            .array(
              z.object({
                textAr: z.string().min(1, "نص الخيار مطلوب"),
                quality: z.number().int().min(1).max(5).default(3),
              })
            )
            .min(2, "يجب إدخال خيارين على الأقل لكل تحدٍ"),
        })
      )
      .optional(),
  }),
});

export const updateSimulationSchema = z.object({
  body: z.object({
    slug: z.string().min(1).optional(),
    careerId: z.string().min(1).optional(),
    titleAr: z.string().min(1).optional(),
    descriptionAr: z.string().min(1).optional(),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    durationMinutes: z.number().int().positive().optional(),
    introAr: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});
