import { z } from "zod";

export const createChallengeSchema = z.object({
  body: z.object({
    simulationId: z.string().min(1, "معرف المحاكاة مطلوب"),
    situationAr: z.string().min(5, "نص الموقف مطلوب"),
    questionAr: z.string().min(5, "نص السؤال مطلوب"),
    hintAr: z.string().default(""),
    orderIndex: z.number().int().default(0),
    options: z.array(
      z.object({
        textAr: z.string().min(1, "نص الخيار مطلوب"),
        quality: z.number().int().min(1).max(5),
        orderIndex: z.number().int().default(0),
      })
    ).min(2, "يجب توفير خيارين على الأقل"),
  }),
});
