import { prisma } from "../../config/prisma";
import type { SkillIndicator } from "@prisma/client";

export class CareersRepository {
  async findAll() {
    return prisma.career.findMany({
      where: { isActive: true },
      include: {
        weights: true,
        simulations: {
          select: { id: true, slug: true, titleAr: true, difficulty: true, durationMinutes: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByIdOrSlug(idOrSlug: string) {
    return prisma.career.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
      include: {
        weights: true,
        simulations: {
          include: {
            challenges: {
              include: { options: true },
            },
          },
        },
      },
    });
  }

  async createCareer(data: {
    slug: string;
    nameAr: string;
    descriptionAr: string;
    aboutAr: string;
    icon: string;
    requiredSkills: string[];
    traits: string[];
    jobs: string[];
    growthSkills: string[];
    nextSteps: string[];
    weights?: Record<string, number>;
  }) {
    return prisma.$transaction(async (tx) => {
      const career = await tx.career.create({
        data: {
          slug: data.slug,
          nameAr: data.nameAr,
          descriptionAr: data.descriptionAr,
          aboutAr: data.aboutAr,
          icon: data.icon,
          requiredSkills: data.requiredSkills,
          traits: data.traits,
          jobs: data.jobs,
          growthSkills: data.growthSkills,
          nextSteps: data.nextSteps,
        },
      });

      if (data.weights) {
        const weightEntries = Object.entries(data.weights).map(([indicator, weight]) => ({
          careerId: career.id,
          indicator: indicator as SkillIndicator,
          weight,
        }));

        await tx.careerWeight.createMany({
          data: weightEntries,
        });
      }

      return tx.career.findUnique({
        where: { id: career.id },
        include: { weights: true },
      });
    });
  }

  async updateCareer(
    id: string,
    data: {
      nameAr?: string;
      descriptionAr?: string;
      aboutAr?: string;
      icon?: string;
      requiredSkills?: string[];
      traits?: string[];
      jobs?: string[];
      growthSkills?: string[];
      nextSteps?: string[];
      weights?: Record<string, number>;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      const career = await tx.career.update({
        where: { id },
        data: {
          nameAr: data.nameAr,
          descriptionAr: data.descriptionAr,
          aboutAr: data.aboutAr,
          icon: data.icon,
          requiredSkills: data.requiredSkills,
          traits: data.traits,
          jobs: data.jobs,
          growthSkills: data.growthSkills,
          nextSteps: data.nextSteps,
        },
      });

      if (data.weights) {
        await tx.careerWeight.deleteMany({
          where: { careerId: id },
        });

        const weightEntries = Object.entries(data.weights).map(([indicator, weight]) => ({
          careerId: id,
          indicator: indicator as SkillIndicator,
          weight,
        }));

        await tx.careerWeight.createMany({
          data: weightEntries,
        });
      }

      return tx.career.findUnique({
        where: { id },
        include: { weights: true },
      });
    });
  }

  async deleteCareer(id: string) {
    return prisma.career.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
