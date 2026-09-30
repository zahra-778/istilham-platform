import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "الاسم مطلوب").optional(),
    dateOfBirth: z.string().optional().nullable(),
    educationLevel: z.string().optional().nullable(),
    school: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
  }),
});
