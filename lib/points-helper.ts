// lib/points-helper.ts

// ─── Base points per difficulty ───────────────────────────────────────────
export const BASE_POINTS : any = {
	easy:   5,
	medium: 10,
	hard:   20,
  } as const;
  
  // ─── Penalty per difficulty ───────────────────────────────────────────────
  export const PENALTY_POINTS : any = {
	easy:   1,
	medium: 2,
	hard:   5,
  } as const;
  
  // ─── Streak multiplier tiers ──────────────────────────────────────────────
  export function getStreakMultiplier(currentStreak: number): number {
	if (currentStreak >= 30) return 3.0;  // 30+ day streak → 3x
	if (currentStreak >= 14) return 2.5;  // 2 week streak  → 2.5x
	if (currentStreak >= 7)  return 2.0;  // 1 week streak  → 2x
	if (currentStreak >= 3)  return 1.5;  // 3-day streak   → 1.5x
	return 1.0;                            // no streak bonus
  }
  
  // ─── Calculate points for an answer ──────────────────────────────────────
  interface CalculatePointsParams {
	difficulty: 'easy' | 'medium' | 'hard';
	correct: boolean;
	currentStreak: number;
  }
  
  interface PointsResult {
	points: number;
	multiplier: number;
	breakdown: string;
  }
  
  export function calculatePoints({
	difficulty,
	correct,
	currentStreak,
  }: CalculatePointsParams): PointsResult {
	if (!correct) {
	  // Wrong answer — always a flat penalty, no streak involved
	  return {
		points:     -PENALTY_POINTS[difficulty],
		multiplier: 1,
		breakdown:  `Wrong answer: -${PENALTY_POINTS[difficulty]} pts`,
	  };
	}
  
	const base       = BASE_POINTS[difficulty];
	const multiplier = getStreakMultiplier(currentStreak);
	const points     = Math.round(base * multiplier);
  
	let streakLabel = '';
	if (multiplier > 1) streakLabel = ` × ${multiplier} streak bonus`;
  
	return {
	  points,
	  multiplier,
	  breakdown: `${base} pts${streakLabel} = ${points} pts`,
	};
  }
  
  // ─── Date helpers ─────────────────────────────────────────────────────────
  function getPreviousDate(dateStr: string): string {
	const d = new Date(dateStr);
	d.setDate(d.getDate() - 1);
	return d.toISOString().split('T')[0];
  }
  
  // ─── Update streak after answering ───────────────────────────────────────
  interface UserProgress {
	lastAnsweredDate: string | null;
	currentStreak: number;
	longestStreak: number;
  }
  
  export function updateStreak(
	progress: UserProgress,
	todayDate: string // format: "2026-06-24"
  ): UserProgress {
	const last = progress.lastAnsweredDate;
	const today = todayDate;
	const yesterday = getPreviousDate(today);
  
	if (last === yesterday) {
	  // Answered yesterday — streak continues
	  progress.currentStreak += 1;
	} else if (last !== today) {
	  // Not answered today and not yesterday → streak reset to 1
	  progress.currentStreak = 1;
	}
	// else: already answered today → do nothing (keep streak unchanged)
  
	if (progress.currentStreak > progress.longestStreak) {
	  progress.longestStreak = progress.currentStreak;
	}
  
	progress.lastAnsweredDate = today;
	return progress;
  }