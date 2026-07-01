// types/challenge.ts
// ─── Shared types for the Code & Decode challenge system ─────────────────────

export type Difficulty = "Easy" | "Medium" | "Hard";
export type Language   = "python" | "javascript" | "cpp" | "java" | "c";
export type QuestionType = "coding" | "mcq" | "cs_fundamental" | "puzzle";
export type SubmissionStatus = "idle" | "queued" | "running" | "accepted" | "rejected" | "error";

// ─── Problem fetched from GET /api/daily/today ───────────────────────────────
export interface TestCaseExample {
  input:       string;
  output:      string;
  explanation?: string;
}

export interface StarterCode {
  python:     string;
  javascript: string;
  cpp:        string;
  java:       string;
  c:          string;
}

export interface DailyChallenge {
  _id:            string;
  title:          string;
  description:    string;
  type:           QuestionType;
  difficulty:     Difficulty;
  basePoints:     number;
  penaltyPoints:  number;
  topic?:         string;
  tags:           string[];
  examples:       TestCaseExample[];   // visible examples (not test cases)
  constraints:    string[];            // e.g. "1 <= nums.length <= 10^4"
  starterCode:    StarterCode;
  supportedLangs: Language[];
  scheduledDate:  string;              // "2026-06-24"
}

export interface DailyResponse {
  question:       DailyChallenge;
  alreadyAnswered: boolean;
  userStreak:     number;
  multiplier:     number;
  totalPoints:    number;
}

// ─── Submission types ─────────────────────────────────────────────────────────
export interface TestResult {
  passed:        boolean;
  status:        string;    // "Accepted", "Wrong Answer", "TLE", etc.
  statusId:      number;
  actualOutput:  string | null;
  runtime:       string | null;  // "0.042"
  memory:        number | null;  // KB
  stderr:        string | null;
  compileOutput: string | null;
}

export interface SubmissionResult {
  status:        SubmissionStatus;
  passCount:     number;
  total:         number;
  score:         number;
  points?:       number;       // final delta (positive or negative)
  breakdown?:    string;       // "10 pts × 2x streak = 20 pts"
  totalPoints?:  number;       // user's new total
  results:       TestResult[];
}