export interface LlmRequest {
  tokenCount: number;
  resolve: (value?: { success: boolean } | undefined) => void;
  reject: (value?: undefined) => void;
}