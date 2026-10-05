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

  // Darshan Ārati is enabled strictly on Sundays
  if (rule.activity === 'darshan_arati' && !isSunday) {
    return { points: 0, maxPoints: 0, dot: 'grey', statusLabel: 'Sunday Only' };
  }

  const maxPoints = rule.ontime_points ?? rule.points ?? 0;

  // 1. Time-based activities (Maṅgala, Darshan, Śrīmad Bhāgavatam, JF)
  if (
    rule.activity === 'mangala_arati' ||
    rule.activity === 'darshan_arati' ||
    rule.activity === 'srimad_bhagavatam' ||
    rule.activity === 'japa_finish'
  ) {
    if (!value || typeof value !== 'string' || !value.trim()) {
      return { points: 0, maxPoints, dot: 'red', statusLabel: 'Not Attended' };
    }

    const timeMins = parseTimeToMinutes(value);
    if (timeMins === null) {
      return { points: 0, maxPoints, dot: 'red', statusLabel: 'Invalid Time' };
    }

    // Check On-Time window (Green)
    if (isTimeInRange(timeMins, rule.ontime_from, rule.ontime_to)) {
      const pts = rule.ontime_points ?? rule.points;
      return { points: pts, maxPoints, dot: 'green', statusLabel: 'On Time' };
    }

    // Check Late window (Light Green)
    if (isTimeInRange(timeMins, rule.late_from, rule.late_to)) {
      const pts = rule.late_points ?? Math.round(maxPoints * 0.7);
      return { points: pts, maxPoints, dot: 'light_green', statusLabel: 'Late Attendance' };
    }

    // Check Last-Minute window (Yellow)
    if (isTimeInRange(timeMins, rule.lastmin_from, rule.lastmin_to)) {
      const pts = rule.lastmin_points ?? Math.round(maxPoints * 0.4);
      return { points: pts, maxPoints, dot: 'yellow', statusLabel: 'Last Minutes' };
    }

    // If JF only specifies completion without strict cutoffs, award full points if completed
    if (rule.activity === 'japa_finish' && !rule.ontime_from && !rule.ontime_to) {
      return { points: maxPoints, maxPoints, dot: 'green', statusLabel: 'Completed' };
    }

    // Past all cutoffs -> 0 points (Red)
    return { points: 0, maxPoints, dot: 'red', statusLabel: 'Missed Cutoff' };
  }

  // 2. Japa Rounds (Numeric)
  if (rule.activity === 'japa') {
    const rounds = Number(value) || 0;
    if (rounds <= 0) {
      return { points: 0, maxPoints, dot: 'red', statusLabel: '0 Rounds' };
    }

    const ontimeThreshold = 16;
    const lateThreshold = 12;
    const lastminThreshold = 8;

    if (rounds >= ontimeThreshold) {
      const pts = rule.ontime_points ?? rule.points;
      return { points: pts, maxPoints, dot: 'green', statusLabel: `${rounds} Rounds (Full)` };
    }

    if (rounds >= lateThreshold) {
      const pts = rule.late_points ?? Math.round(maxPoints * 0.7);
      return { points: pts, maxPoints, dot: 'light_green', statusLabel: `${rounds} Rounds (Good)` };
    }

    if (rounds >= lastminThreshold) {
      const pts = rule.lastmin_points ?? Math.round(maxPoints * 0.4);
      return { points: pts, maxPoints, dot: 'yellow', statusLabel: `${rounds} Rounds (Moderate)` };
    }

    const minPts = Math.round((rule.lastmin_points ?? Math.round(maxPoints * 0.4)) / 2);
    return { points: minPts, maxPoints, dot: 'yellow', statusLabel: `${rounds} Rounds` };
  }

  // 3. Book Reading Minutes (Numeric)
  if (rule.activity === 'book_reading') {
    const mins = Number(value) || 0;
    if (mins <= 0) {
      return { points: 0, maxPoints, dot: 'red', statusLabel: '0 Mins' };
    }

    if (mins >= 30) {
      const pts = rule.ontime_points ?? rule.points;
      return { points: pts, maxPoints, dot: 'green', statusLabel: `${mins}m Read` };
    }

    if (mins >= 15) {
      const pts = rule.late_points ?? Math.round(maxPoints * 0.7);
      return { points: pts, maxPoints, dot: 'light_green', statusLabel: `${mins}m Read` };
    }

    if (mins >= 5) {
      const pts = rule.lastmin_points ?? Math.round(maxPoints * 0.4);
      return { points: pts, maxPoints, dot: 'yellow', statusLabel: `${mins}m Read` };
    }

    return { points: 0, maxPoints, dot: 'red', statusLabel: '< 5 Mins' };
  }

  return { points: 0, maxPoints, dot: 'grey', statusLabel: 'Unknown' };
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
 * Strictly computes total points and dot colors dynamically from whatever the Guide configured.
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
  const japaEval = evaluateActivityRule(japaRule, record?.japa_rounds, isSunday);
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

  const totalPoints =
    mangalaEval.points +
    japaEval.points +
    darshanEval.points +
    sbEval.points +
    jfEval.points +
    bookEval.points;

  const maxPossiblePoints =
    mangalaEval.maxPoints +
    japaEval.maxPoints +
    darshanEval.maxPoints +
    sbEval.maxPoints +
    jfEval.maxPoints +
    bookEval.maxPoints;

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
