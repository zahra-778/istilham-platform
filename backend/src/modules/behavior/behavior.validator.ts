import { z } from "zod";

export const trackEventSchema = z.object({
  body: z.object({
    type: z.enum(["ASSESSMENT", "SIMULATION", "RECOMMENDATION", "PROFILE_UPDATE"]),
    titleAr: z.string().min(1, "عنوان النشاط مطلوب"),
    detailAr: z.string().min(1, "تفاصيل النشاط مطلوبة"),
  }),
});
