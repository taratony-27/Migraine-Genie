// Helpers that turn a stored DailyInput into the plain values the AI prompts use.

// Mirrors client/src/constants/vmPathi.ts: each of the 25 items is scored 0-4.
const SEVERITY_POINTS: Record<string, number> = {
  no: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
  extreme: 4,
};

/**
 * Trigger labels for one log. DailyInput.trigger is an object
 * ({ potentialTrigger: "stress, less sleep", weather, food, activity });
 * older logs may hold a plain string or an array.
 */
export function triggerLabels(trigger: unknown): string[] {
  if (!trigger) return [];

  const parts: string[] = [];
  const add = (val: unknown, prefix = "") => {
    for (const p of String(val ?? "").split(/[;,]/)) {
      const label = p.trim().replace(/\s+/g, " ").toLowerCase();
      if (label) parts.push(prefix + label);
    }
  };

  if (Array.isArray(trigger)) {
    trigger.forEach((t) => add(t));
  } else if (typeof trigger === "object") {
    const t = trigger as Record<string, unknown>;
    add(t.potentialTrigger);
    add(t.weather, "weather: ");
    add(t.food, "food: ");
    add(t.activity, "activity: ");
  } else {
    add(trigger);
  }
  return parts;
}

/** VM-PATHI score (0-100) for one log: the stored score, else summed from its symptoms. */
export function vmPathiScoreOf(entry: { vmPathiScore?: unknown; symptoms?: unknown }): number | null {
  const stored = Number(entry.vmPathiScore);
  if (entry.vmPathiScore !== null && entry.vmPathiScore !== undefined && Number.isFinite(stored)) {
    return stored;
  }

  const symptoms = entry.symptoms;
  if (!symptoms || typeof symptoms !== "object" || Array.isArray(symptoms)) return null;

  let total = 0;
  let scored = 0;
  for (const value of Object.values(symptoms as Record<string, unknown>)) {
    const points = SEVERITY_POINTS[String(value ?? "").trim().toLowerCase()];
    if (points !== undefined) {
      total += points;
      scored++;
    }
  }
  return scored > 0 ? total : null;
}
