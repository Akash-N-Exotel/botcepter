export type BotType = 'chat' | 'voice';

export interface Bot {
  id: string;
  name: string;
  type: BotType;
  endpoint: string;
}

export interface Question {
  question: string;
  expectedAnswer: string;
  objectives: string[];
  tools: string[];
}

export interface ApiQuestion {
  question: string;
  expected_answer: string;
  expected_objectives: string[];
  expected_tools: string[];
}

export interface ConversationResult {
  question: string;
  response: string;
  expected_objectives: string[];
  expected_tools: string[];
  event: 'response' | 'transfer_call';
  used_objectives: string[];
  used_tool_calls: string[];
  is_passed?: boolean;
}

export interface TestRunResult {
  session_id: string;
  conversation: ConversationResult[];
  final_result: 'passed' | 'failed';
}

export interface ApiResponse {
  success: boolean;
  data: TestRunResult[];
  error?: string;
}

export interface FormData {
  selectedBotType: BotType;
  selectedBotId: string;
  testCount: number;
  numQuestions: number;
  questions: Question[];
}

export interface QuestionResult {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  expectedObjectives: string[];
  expectedTools: string[];
  usedObjectives: string[];
  usedTools: string[];
  event: 'response' | 'transfer_call';
  passed: boolean;
  testRunId: number;
  sessionId: string;
}

export interface TestResult {
  success: boolean;
  results: QuestionResult[];
}