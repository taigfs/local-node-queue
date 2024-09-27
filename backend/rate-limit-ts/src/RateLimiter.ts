import { RateLimiterOptions } from "./types/RateLimiterOptions";

export class RateLimiter {
  private rpm: number;
  private tpm: number;
  private monitoringIntervalMs: number;

  private requestTimestamps: number[] = [];
  private tokenTimestamps: { timestamp: number; tokens: number }[] = [];

  constructor(options: RateLimiterOptions) {
    this.rpm = options.rpm;
    this.tpm = options.tpm;
    this.monitoringIntervalMs = options.monitoringInterval * 1000;
  }

  canMakeRequest(tokenCount: number): { canProceed: boolean; retryAfter?: number } {
    const now = Date.now();

    const cutoffTime = now - this.monitoringIntervalMs;
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > cutoffTime,
    );
    this.tokenTimestamps = this.tokenTimestamps.filter(
      ({ timestamp }) => timestamp > cutoffTime,
    );

    const intervalFraction = this.monitoringIntervalMs / 60000;
    const requestsPerInterval = Math.ceil(this.rpm * intervalFraction);
    const tokensPerInterval = Math.ceil(this.tpm * intervalFraction);

    if (tokenCount > tokensPerInterval) {
      // TODO: create parallel 'unprocessable' queue for requests that exceed the token limit
      throw new Error(
        `Request token count ${tokenCount} exceeds the per-interval limit of ${tokensPerInterval}`,
      );
    }

    if (this.requestTimestamps.length >= requestsPerInterval) {
      const msSinceFirstValidRequestOfThisInterval = now - this.requestTimestamps[0];
      const retryAfter = Math.ceil(
        (this.monitoringIntervalMs - msSinceFirstValidRequestOfThisInterval) / 1000,
      );
      return { canProceed: false, retryAfter };
    }

    const tokensUsed = this.tokenTimestamps.reduce(
      (sum, { tokens }) => sum + tokens,
      0,
    );
    if (tokensUsed + tokenCount > tokensPerInterval) {
      const msSinceFirstValidRequestOfThisInterval = now - this.tokenTimestamps[0].timestamp;
      const retryAfter = Math.ceil(
        (this.monitoringIntervalMs - msSinceFirstValidRequestOfThisInterval) / 1000,
      );
      return { canProceed: false, retryAfter };
    }

    return { canProceed: true };
  }

  recordRequest(tokenCount: number) {
    const now = Date.now();
    this.requestTimestamps.push(now);
    this.tokenTimestamps.push({ timestamp: now, tokens: tokenCount });
  }
}
