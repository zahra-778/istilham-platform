import { CareersRepository } from "./careers.repository";

export class CareersService {
  private repo = new CareersRepository();

  async getAllCareers() {
    return this.repo.findAll();
  }

  async getCareerByIdOrSlug(idOrSlug: string) {
    const career = await this.repo.findByIdOrSlug(idOrSlug);
    if (!career) {
      throw new Error("المهنة غير موجودة.");
    }
    return career;
  }

  async createCareer(data: any) {
    return this.repo.createCareer(data);
  }

  async updateCareer(id: string, data: any) {
    return this.repo.updateCareer(id, data);
  }

  async deleteCareer(id: string) {
    return this.repo.deleteCareer(id);
  }
}
