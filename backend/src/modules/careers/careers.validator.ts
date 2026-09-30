import { z } from "zod";

export const createCareerSchema = z.object({
  body: z.object({
    slug: z.string().min(2, "المعرف الإنجليزي مطلوب"),
    nameAr: z.string().min(2, "اسم المهنة مطلوب"),
    descriptionAr: z.string().min(5, "الوصف مطلوب"),
    aboutAr: z.string().min(5, "نبذة عن المهنة مطلوبة"),
    icon: z.string().default("Briefcase"),
    requiredSkills: z.array(z.string()).default([]),
    traits: z.array(z.string()).default([]),
    jobs: z.array(z.string()).default([]),
    growthSkills: z.array(z.string()).default([]),
    nextSteps: z.array(z.string()).default([]),
    weights: z
      .record(z.enum([
        "problemSolving",
        "analyticalThinking",
        "decisionMaking",
        "creativity",
        "communication",
        "leadership",
        "persistence",
        "timeManagement",
      ]), z.number())
      .optional(),
  }),
});

export const updateCareerSchema = z.object({
  body: z.object({
    nameAr: z.string().optional(),
    descriptionAr: z.string().optional(),
    aboutAr: z.string().optional(),
    icon: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    traits: z.array(z.string()).optional(),
    jobs: z.array(z.string()).optional(),
    growthSkills: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional(),
    weights: z
      .record(z.enum([
        "problemSolving",
        "analyticalThinking",
        "decisionMaking",
        "creativity",
        "communication",
        "leadership",
        "persistence",
        "timeManagement",
      ]), z.number())
      .optional(),
  }),
});
