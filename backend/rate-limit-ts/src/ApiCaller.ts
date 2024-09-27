import { MockAPI } from "./MockAPI";
import { RateLimiter } from "./RateLimiter";
import { RequestQueue } from "./RequestQueue";

type Limits = {
  rpm: number;
  tpm: number;
  monitoringInterval: number;
};

export class ApiCaller {
  private queue: RequestQueue;

  constructor(apiInstances: MockAPI[], limits: Limits) {
    const rateLimiters = apiInstances.map(() => new RateLimiter(limits));
    this.queue = new RequestQueue(apiInstances, rateLimiters);
  }

  async call(tokenCount: number) {
    try {
      return this.queue.addRequest(tokenCount);
    } catch (error) {
      console.log(error);
    }
  }
}
