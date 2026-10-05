// Shared VM-PATHI (Vestibular Migraine Patient Assessment Tool and Handicap Inventory) definitions.
// Item order/wording matches the official UCSF VM-PATHI survey. Each item is scored 0-4
// (0 = No problem ... 4 = Problem is as bad as it can be); the VM-PATHI score is the sum
// of all 25 items, so the total ranges from 0 to 100.

export type SymptomInput = {
  key: string;
  label: string;
};

export const problemOptions = [
  { label: 'No problem', value: 0 },
  { label: 'Mild problem', value: 1 },
  { label: 'Moderate problem', value: 2 },
  { label: 'Severe problem', value: 3 },
  { label: 'Problem is as bad as it can be', value: 4 },
];

export const severityLabels = ['No', 'Mild', 'Moderate', 'Severe', 'Extreme'];

export const severityMap: Record<string, number> = {
  No: 0,
  Mild: 1,
  Moderate: 2,
  Severe: 3,
  Extreme: 4,
};

export const symptomInputs: SymptomInput[] = [
  { key: 'imbalance', label: 'Imbalance' },
  { key: 'soundDiscomfort', label: 'Discomfort with loud sounds' },
  { key: 'spinningSensation', label: 'Spinning sensation' },
  { key: 'lightsDiscomfort', label: 'Discomfort with bright lights' },
  { key: 'lightheadedness', label: 'Lightheadedness' },
  { key: 'stress', label: 'Stress' },
  { key: 'headBodyDizziness', label: 'Dizziness with head or body movement' },
  { key: 'earPressure', label: 'Ear pressure or ear fullness' },
  { key: 'visualSceneDizziness', label: 'Dizziness with busy visual scenes, like a shopping mall or an intersection' },
  { key: 'motionSensitivity', label: 'Motion sensitivity/motion sickness' },
  { key: 'walkingDifficulty', label: 'Difficulty walking around' },
  { key: 'stairsDifficulty', label: 'Difficulty using stairs' },
  { key: 'reducedProductivity', label: 'Reduced productivity at work' },
  { key: 'concentratingDifficulty', label: 'Difficulty concentrating' },
  { key: 'sadness', label: 'Sadness' },
  { key: 'socialSituationAvoidance', label: 'Avoiding social situations' },
  { key: 'fallingFear', label: 'Fear of falling' },
  { key: 'abnormalLifeFear', label: "Fear that life won't be normal again" },
  { key: 'headaches', label: 'Headaches' },
  { key: 'memoryDifficulty', label: 'Trouble remembering things' },
  { key: 'nausea', label: 'Nausea' },
  { key: 'headPressure', label: 'Head pressure' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'movementSensation', label: 'Sensation of movement, when you are NOT moving' },
  { key: 'fatigue', label: 'Fatigue' },
];

// Mirrors the official survey's 3 page breaks (items 1-9, 10-17, 18-25),
// used to split the form into neater, separated sections.
export const symptomSections: SymptomInput[][] = [
  symptomInputs.slice(0, 9),
  symptomInputs.slice(9, 17),
  symptomInputs.slice(17, 25),
];

export const VM_PATHI_MAX_SCORE = symptomInputs.length * 4; // 100

const SYMPTOM_LABELS: Record<string, string> = Object.fromEntries(symptomInputs.map((s) => [s.key, s.label]));

/** Readable name for a stored symptom key: "soundDiscomfort" -> "Discomfort with loud sounds". */
export const symptomLabel = (key: string): string =>
  SYMPTOM_LABELS[key] ??
  key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

export function computeVmPathiScore(symptoms: Record<string, unknown> | null | undefined): number {
  if (!symptoms) return 0;
  return symptomInputs.reduce((sum, { key }) => {
    const raw = symptoms[key];
    const numeric = typeof raw === 'number' ? raw : severityMap[String(raw)] ?? 0;
    return sum + numeric;
  }, 0);
}
