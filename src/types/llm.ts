export type Provider = 'Anthropic' | 'OpenAI';
export type ReasoningLevel = 'basic' | 'standard' | 'strong' | 'exceptional';
export type CodingLevel = 'basic' | 'good' | 'strong' | 'exceptional';
export type AgentSuitability = 'limited' | 'good' | 'strong' | 'best';

export interface LLMModel {
  id: string;
  name: string;
  modelId: string;
  provider: Provider;
  family: string;
  // Pricing per 1M tokens (USD)
  inputPrice: number;
  outputPrice: number;
  cachedInputPrice?: number;
  // Capabilities
  contextWindow: number;
  maxOutputTokens: number;
  reasoning: ReasoningLevel;
  coding: CodingLevel;
  vision: boolean;
  toolUse: boolean;
  agentSuitable: AgentSuitability;
  // Content
  description: string;
  strengths: string[];
  useCases: string[];
  lessAppropriate: string[];
  // Metadata
  sourceUrl: string;
  pricingUrl: string;
  pricingLastVerified: string;
  pricingVerified: boolean;
  releaseDate?: string;
  deprecated?: boolean;
}

export type TaskCategory = 'student' | 'faculty' | 'research' | 'general';

export interface TaskUseCase {
  id: string;
  category: TaskCategory;
  label: string;
  description: string;
  recommendedCapabilities: string[];
  suggestedModelIds: string[];
  modelNotes: Record<string, string>;
  considerations: string[];
  exampleTokens: { input: number; output: number };
}

export interface TaskExample {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  recommendedCharacteristics: string[];
  inputTokens: number;
  outputTokens: number;
  notes: string;
}

export interface SensitivityPreset {
  label: string;
  description: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

export interface CalculatorState {
  selectedModelId: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
}

export interface MonthlyCalcState {
  selectedModelId: string;
  requestsPerDay: number;
  inputTokensPerRequest: number;
  outputTokensPerRequest: number;
  daysPerMonth: number;
}

export interface AgentCalcState {
  selectedModelId: string;
  callsPerTask: number;
  inputTokensPerCall: number;
  outputTokensPerCall: number;
}

export interface ContextItem {
  label: string;
  tokens: number;
  color: string;
}

export interface CachingCalcState {
  selectedModelId: string;
  materialTokens: number;
  studentQueryTokens: number;
  totalRequests: number;
  cacheHitRate: number;
}
