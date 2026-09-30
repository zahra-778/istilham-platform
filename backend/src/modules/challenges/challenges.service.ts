import { ChallengesRepository } from "./challenges.repository";

export class ChallengesService {
  private repo = new ChallengesRepository();

  async getChallenges() {
    return this.repo.findAll();
  }

  async getChallengeById(id: string) {
    const challenge = await this.repo.findById(id);
    if (!challenge) throw new Error("التحدي غير موجود.");
    return challenge;
  }

  async createChallenge(data: any) {
    return this.repo.createChallenge(data);
  }
}
