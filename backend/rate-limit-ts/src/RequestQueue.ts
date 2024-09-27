import { MockAPI } from './MockAPI';
import { RateLimiter } from './RateLimiter';
import { LlmRequest } from './types/LlmRequest';

export class RequestQueue {
  private queue: LlmRequest[] = [];
  private apiInstances: MockAPI[];
  private rateLimiters: RateLimiter[];
  private currentInstanceIndex = 0;

  constructor(apiInstances: MockAPI[], rateLimiters: RateLimiter[]) {
    this.apiInstances = apiInstances;
    this.rateLimiters = rateLimiters;
    this.processQueue();
  }

  addRequest(tokenCount: number): Promise<{ success: boolean } | undefined> {
    return new Promise((resolve, reject) => {
      const req: LlmRequest = { tokenCount, resolve, reject };
      this.queue.push(req);
    });
  }

  private async processQueue() {
    while (true) {
      if (this.queue.length === 0) {
        await this.sleep(50);
        continue;
      }

      const request = this.queue.shift();
      if (!request) { continue; }

      const { tokenCount, resolve, reject } = request;

      const apiInstance = this.apiInstances[this.currentInstanceIndex];
      const rateLimiter = this.rateLimiters[this.currentInstanceIndex];

      // TODO: Improve it based on the rate limiter data for each API instance
      this.currentInstanceIndex = (this.currentInstanceIndex + 1) % this.apiInstances.length;

      const canProceed = rateLimiter.canMakeRequest(tokenCount);

      if (canProceed.canProceed) {
        try {
          rateLimiter.recordRequest(tokenCount);
          const result = await apiInstance.callAPI(tokenCount);
          resolve(result);
        } catch (error: any) {
          if (error.message.includes('429')) {
            const retryAfter = this.parseRetryAfter(error.message);
            setTimeout(() => {
              this.queue.unshift({ tokenCount, resolve, reject });
            }, retryAfter * 1000);
          } else {
            reject(error as undefined);
          }
        }
      } else {
        const retryAfter = canProceed.retryAfter || 0;
        setTimeout(() => {
          this.queue.unshift({ tokenCount, resolve, reject });
        }, retryAfter * 1000);
      }
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parseRetryAfter(message: string): number {
    const match = message.match(/Retry After (\d+) seconds/);
    return match ? parseInt(match[1], 10) : 1;
  }
}
