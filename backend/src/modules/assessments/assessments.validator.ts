import { z } from "zod";

export const answerQuestionSchema = z.object({
  body: z.object({
    questionId: z.string().min(1, "معرف السؤال مطلوب"),
    optionId: z.string().min(1, "معرف الخيار مطلوب"),
  }),
});
