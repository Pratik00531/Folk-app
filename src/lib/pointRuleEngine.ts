import { PointRuleConfig, SadhanaRecord, PillarDotStatus } from '@/types/database';

/**
 * Parses time string (e.g. "05:03 AM", "5:03 AM", "05:03", "17:30")
 * into minutes from midnight (0 to 1439).
 */
export function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim().toUpperCase();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Checks whether a given time in minutes falls within [fromStr, toStr].
 */
export function isTimeInRange(timeMinutes: number, fromStr?: string, toStr?: string): boolean {
  if (!fromStr || !toStr) return false;
  const fromMins = parseTimeToMinutes(fromStr);
  const toMins = parseTimeToMinutes(toStr);
  if (fromMins === null || toMins === null) return false;

  if (fromMins <= toMins) {
    return timeMinutes >= fromMins && timeMinutes <= toMins;
  }
  // Wraparound midnight (e.g. 11:30 PM to 01:00 AM)
  return timeMinutes >= fromMins || timeMinutes <= toMins;
}

export interface PillarEvaluation {
  points: number;
  maxPoints: number;
  dot: PillarDotStatus;
  statusLabel: string;
}

/**
 * Dynamically evaluates points and dot color for an activity against the Guide's configured rule.
 * Whatever values the Guide puts (e.g. 5:00-5:05 = 4 points, 5:06-5:10 = 2 points),
 * the app strictly follows that logic without hardcoded numbers.
 */
export function evaluateActivityRule(
  rule: PointRuleConfig | undefined,
  value: string | number | null | undefined,
  isSunday: boolean
): PillarEvaluation {
  if (!rule || !rule.is_active) {
    return { points: 0, maxPoints: 0, dot: 'grey', statusLabel: 'Inactive' };
  }

  // 1. Maṅgala Ārati:
  // 4:30 – 5:04:59 → 4 points (Green)
  // 5:05 – 5:14:59 → 2 points (Light Green)
  // 5:15 – 5:30:00 → 1 point (Yellow)
  // Missed / after 5:30 → 0 points (Red)
  if (rule.activity === 'mangala_arati') {
    const maxPts = rule.ontime_points ?? 4;
    if (!value || typeof value !== 'string' || !value.trim()) {
      return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'Not Attended (0 pts)' };
    }
    const timeMins = parseTimeToMinutes(value);
    if (timeMins === null) {
      return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'Invalid Time (0 pts)' };
    }

    // 4:30 to 5:04:59 (270 to 304 mins) -> 4 points
    if (timeMins >= 270 && timeMins <= 304) {
      return { points: rule.ontime_points ?? 4, maxPoints: maxPts, dot: 'green', statusLabel: '4:30–5:04 AM (4 pts)' };
    }
    // 5:05 to 5:14:59 (305 to 314 mins) -> 2 points
    if (timeMins >= 305 && timeMins <= 314) {
      return { points: rule.late_points ?? 2, maxPoints: maxPts, dot: 'light_green', statusLabel: '5:05–5:14 AM (2 pts)' };
    }
    // 5:15 to 5:30:00 (315 to 330 mins) -> 1 point
    if (timeMins >= 315 && timeMins <= 330) {
      return { points: rule.lastmin_points ?? 1, maxPoints: maxPts, dot: 'yellow', statusLabel: '5:15–5:30 AM (1 pt)' };
    }
    // Customized range fallback if guide changed values
    if (rule.ontime_from && rule.ontime_to && isTimeInRange(timeMins, rule.ontime_from, rule.ontime_to)) {
      return { points: rule.ontime_points ?? 4, maxPoints: maxPts, dot: 'green', statusLabel: 'On Time' };
    }
    return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'After 5:30 AM (0 pts)' };
  }

  // 2. Morning Japa Slot Timing:
  // 5:30 – 6:00 → 1 point
  // 5:30 – 6:30 → 2 points
  // 5:30 – 7:00 → 3 points
  // 5:30 – 7:30 → 4 points
  if (rule.activity === 'japa') {
    const maxPts = rule.ontime_points ?? 4;
    if (!value) {
      return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'Not Chanted (0 pts)' };
    }
    const strVal = String(value).toLowerCase().trim();
    const numVal = Number(value);

    // 5:30 – 7:30 AM slot (4 points)
    if (strVal.includes('7:30') || (!isNaN(numVal) && numVal >= 16)) {
      return { points: 4, maxPoints: maxPts, dot: 'green', statusLabel: '5:30–7:30 (4 pts)' };
    }
    // 5:30 – 7:00 AM slot (3 points)
    if (strVal.includes('7:00') || (!isNaN(numVal) && numVal >= 12)) {
      return { points: 3, maxPoints: maxPts, dot: 'light_green', statusLabel: '5:30–7:00 (3 pts)' };
    }
    // 5:30 – 6:30 AM slot (2 points)
    if (strVal.includes('6:30') || (!isNaN(numVal) && numVal >= 8)) {
      return { points: 2, maxPoints: maxPts, dot: 'yellow', statusLabel: '5:30–6:30 (2 pts)' };
    }
    // 5:30 – 6:00 AM slot (1 point)
    if (strVal.includes('6:00') || (!isNaN(numVal) && numVal >= 4)) {
      return { points: 1, maxPoints: maxPts, dot: 'yellow', statusLabel: '5:30–6:00 (1 pt)' };
    }
    if (!isNaN(numVal) && numVal > 0) {
      return { points: 1, maxPoints: maxPts, dot: 'yellow', statusLabel: `${numVal} rds (1 pt)` };
    }
    return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: '0 Points' };
  }

  // 3. Śrīmad Bhāgavatam Morning Class:
  // In Temple → 2 points (Green)
  // Outside Temple → 1 point (Light Green)
  // Not heard → 0 points (Red)
  if (rule.activity === 'srimad_bhagavatam') {
    const maxPts = rule.ontime_points ?? 2;
    if (!value) {
      return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'Not heard (0 pts)' };
    }
    const strVal = String(value).toLowerCase().trim();
    if (strVal === 'not heard' || strVal === 'not_heard' || strVal === 'none' || strVal === '0') {
      return { points: 0, maxPoints: maxPts, dot: 'red', statusLabel: 'Not heard (0 pts)' };
    }
    if (strVal.includes('in temple') || strVal.includes('temple') || strVal.includes('mandir')) {
      return { points: 2, maxPoints: maxPts, dot: 'green', statusLabel: 'In Temple (2 pts)' };
    }
    if (strVal.includes('outside') || strVal.includes('home') || strVal.includes('online')) {
      return { points: 1, maxPoints: maxPts, dot: 'light_green', statusLabel: 'Outside Temple (1 pt)' };
    }
    const timeMins = parseTimeToMinutes(String(value));
    if (timeMins !== null) {
      if (timeMins <= 455) { // Attended before/by 7:35 AM
        return { points: 2, maxPoints: maxPts, dot: 'green', statusLabel: 'In Temple (2 pts)' };
      }
      return { points: 1, maxPoints: maxPts, dot: 'light_green', statusLabel: 'Outside Temple (1 pt)' };
    }
    return { points: 1, maxPoints: maxPts, dot: 'light_green', statusLabel: 'Outside Temple (1 pt)' };
  }

  // 4. Book Reading:
  // No points — just minutes. Add that minutes and averages of that minutes should be given per month/week/report
  if (rule.activity === 'book_reading') {
    const mins = Number(value) || 0;
    if (mins <= 0) {
      return { points: 0, maxPoints: 0, dot: 'red', statusLabel: '0 mins (0 pts)' };
    }
    const dot = mins >= 30 ? 'green' : mins >= 15 ? 'light_green' : 'yellow';
    return { points: 0, maxPoints: 0, dot, statusLabel: `${mins} mins logged` };
  }

  // 5. Darshan Ārati (Sundays only, 0 points)
  if (rule.activity === 'darshan_arati') {
    if (!isSunday) {
      return { points: 0, maxPoints: 0, dot: 'grey', statusLabel: 'Sundays Only' };
    }
    const attended = Boolean(value);
    return {
      points: 0,
      maxPoints: 0,
      dot: attended ? 'green' : 'red',
      statusLabel: attended ? 'Darshan Attended' : 'Missed',
    };
  }

  // 6. JF (Japa Finish) Slot (0 extra points, tracked as completion)
  if (rule.activity === 'japa_finish') {
    const attended = Boolean(value);
    return {
      points: 0,
      maxPoints: 0,
      dot: attended ? 'green' : 'red',
      statusLabel: attended ? 'Completed' : 'Pending',
    };
  }

  return { points: 0, maxPoints: 0, dot: 'grey', statusLabel: 'Unknown' };
}

export interface FullSadhanaEvaluation {
  totalPoints: number;
  maxPossiblePoints: number;
  pillarDots: {
    mangala: PillarDotStatus;
    japa: PillarDotStatus;
    darshan: PillarDotStatus;
    bhagavatam: PillarDotStatus;
    jf: PillarDotStatus;
    reading: PillarDotStatus;
  };
  evaluations: Record<string, PillarEvaluation>;
}

/**
 * Master evaluation for a Sādhana record against the Guide's live rules.
 * Strictly computes total points (max 10 points, never negative) and pillar dot colors.
 */
export function evaluateSadhanaRecord(
  record: Partial<SadhanaRecord> | null | undefined,
  pointRules: PointRuleConfig[],
  isSunday: boolean
): FullSadhanaEvaluation {
  const mangalaRule = pointRules.find((r) => r.activity === 'mangala_arati');
  const japaRule = pointRules.find((r) => r.activity === 'japa');
  const darshanRule = pointRules.find((r) => r.activity === 'darshan_arati');
  const sbRule = pointRules.find((r) => r.activity === 'srimad_bhagavatam');
  const jfRule = pointRules.find((r) => r.activity === 'japa_finish');
  const bookRule = pointRules.find((r) => r.activity === 'book_reading');

  const mangalaEval = evaluateActivityRule(mangalaRule, record?.mangala_arati_time, isSunday);
  // Japa can be evaluated from slot, finish time, or rounds
  const japaValue = record?.japa_finish_slot_time || record?.japa_finish_time || record?.japa_rounds;
  const japaEval = evaluateActivityRule(japaRule, japaValue, isSunday);
  const darshanEval = evaluateActivityRule(darshanRule, record?.darshan_arati_time, isSunday);
  const sbEval = evaluateActivityRule(sbRule, record?.srimad_bhagavatam_time, isSunday);
  const jfEval = evaluateActivityRule(jfRule, record?.japa_finish_slot_time, isSunday);
  const bookEval = evaluateActivityRule(bookRule, record?.book_reading_minutes, isSunday);

  const evaluations: Record<string, PillarEvaluation> = {
    mangala_arati: mangalaEval,
    japa: japaEval,
    darshan_arati: darshanEval,
    srimad_bhagavatam: sbEval,
    japa_finish: jfEval,
    book_reading: bookEval,
  };

  // Strictly non-negative points, max 10 points
  const rawPoints =
    mangalaEval.points +
    japaEval.points +
    sbEval.points +
    darshanEval.points +
    jfEval.points +
    bookEval.points;

  const totalPoints = Math.max(0, Math.min(10, rawPoints));
  const maxPossiblePoints = 10;

  return {
    totalPoints,
    maxPossiblePoints,
    pillarDots: {
      mangala: mangalaEval.dot,
      japa: japaEval.dot,
      darshan: darshanEval.dot,
      bhagavatam: sbEval.dot,
      jf: jfEval.dot,
      reading: bookEval.dot,
    },
    evaluations,
  };
}
