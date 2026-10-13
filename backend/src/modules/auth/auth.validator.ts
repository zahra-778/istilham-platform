import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    educationLevel: z.string().optional(),
    school: z.string().optional(),
    city: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("البريد الإلكتروني غير صحيح"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z.string().min(6, "كلمة المرور الجديدة يجب ألا تقل عن ٦ أحرف"),
  }),
});

