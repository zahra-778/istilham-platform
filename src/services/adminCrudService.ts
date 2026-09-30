import { request } from "./apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CareerItem {
  id: string;
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
  isActive: boolean;
  weights?: Array<{ indicator: string; weight: number }>;
  simulations?: Array<{ id: string; slug: string; titleAr: string }>;
}

export interface SimulationItem {
  id: string;
  slug: string;
  titleAr: string;
  descriptionAr: string;
  difficulty: string;
  durationMinutes: number;
  isActive: boolean;
  career?: { id: string; nameAr: string; slug: string };
  _count?: { challenges: number };
}

export interface SimulationChallengePayload {
  situationAr: string;
  questionAr: string;
  hintAr?: string;
  options: Array<{
    textAr: string;
    quality: number;
  }>;
}

export interface SimulationPayload {
  slug: string;
  careerId: string;
  titleAr: string;
  descriptionAr: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes?: number;
  introAr: string;
  challenges?: SimulationChallengePayload[];
}

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  educationLevel?: string;
  city?: string;
  createdAt: string;
  _count?: { simulationResults: number };
}

export interface CareerPayload {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  aboutAr: string;
  icon?: string;
  requiredSkills?: string[];
  traits?: string[];
  jobs?: string[];
  growthSkills?: string[];
  nextSteps?: string[];
  weights?: Record<string, number>;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const adminCrudService = {
  // CAREERS
  async getCareers(): Promise<CareerItem[]> {
    const res = await request<any>("/careers");
    return Array.isArray(res) ? res : res.data ?? [];
  },

  async createCareer(payload: CareerPayload): Promise<CareerItem> {
    return request<CareerItem>("/careers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCareer(id: string, payload: Partial<CareerPayload>): Promise<CareerItem> {
    return request<CareerItem>(`/careers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteCareer(id: string): Promise<void> {
    await request(`/careers/${id}`, { method: "DELETE" });
  },

  // SIMULATIONS
  async getSimulations(): Promise<SimulationItem[]> {
    const res = await request<any>("/simulations");
    return Array.isArray(res) ? res : res.data ?? [];
  },

  async createSimulation(payload: SimulationPayload): Promise<SimulationItem> {
    return request<SimulationItem>("/simulations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateSimulation(id: string, payload: Partial<SimulationPayload>): Promise<SimulationItem> {
    return request<SimulationItem>(`/simulations/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteSimulation(id: string): Promise<void> {
    await request(`/simulations/${id}`, { method: "DELETE" });
  },

  // STUDENTS (admin endpoint)
  async getStudents(): Promise<StudentItem[]> {
    const res = await request<any>("/admin/students");
    // backend returns array of users with studentProfile embedded
    const arr: any[] = Array.isArray(res) ? res : res.students ?? res.data ?? [];
    return arr.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      educationLevel: u.studentProfile?.educationLevel,
      city: u.studentProfile?.city,
      createdAt: u.createdAt,
      _count: {
        simulationResults: u._count?.simulationSessions ?? u._count?.simulationResults ?? 0,
      },
    }));
  },

  async toggleStudentStatus(id: string, isActive: boolean): Promise<void> {
    await request(`/admin/students/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },
};
