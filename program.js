// 60-day calisthenics program. Single source of truth.
// A = Push + Legs, B = Pull + Core, R = Rest.
// Blocks: 1 (1–12), 2 (13–24), 3 (25–42), 4 (43–60).

const BLOCKS = [
  { id: 1, name: "Foundation",   days: [1, 12],  intent: "Learn movement patterns. Build grip tolerance. Let joints adapt." },
  { id: 2, name: "Build",        days: [13, 24], intent: "Reps increase. First variations. Legs start feeling the load." },
  { id: 3, name: "Strength",     days: [25, 42], intent: "Harder variations. Volume peaks. Pull-ups introduced." },
  { id: 4, name: "Peak",         days: [43, 60], intent: "Hold peak intensity. Add complexity, prevent plateau." },
];

// Day-type rotation: A, B, R repeating.
function typeForDay(day) {
  const i = (day - 1) % 3;
  return i === 0 ? "A" : i === 1 ? "B" : "R";
}

function blockForDay(day) {
  return BLOCKS.find((b) => day >= b.days[0] && day <= b.days[1]).id;
}

// Workouts per block × type. Reps as strings (handles "5–8", "20 sec").
const WORKOUTS = {
  "1A": [
    { name: "Push-up",          sets: 3, reps: "8",       note: "Chest near floor, full extension, controlled." },
    { name: "Split Squat",      sets: 3, reps: "8 / leg", note: "Rear knee toward floor, slow descent." },
    { name: "Jump Squat",       sets: 3, reps: "8",       note: "Explosive up, soft landing — bend knees." },
    { name: "Wall Sit",         sets: 3, reps: "20 sec",  note: "Back flat, thighs parallel." },
  ],
  "1B": [
    { name: "Australian Pull-up", sets: 3, reps: "8",     note: "Bent knees. Chest to bar, squeeze shoulder blades." },
    { name: "Dead Hang",        sets: 3, reps: "20 sec",  note: "Arms straight, shoulders engaged." },
    { name: "Scapular Pull-up", sets: 3, reps: "8",       note: "Depress shoulders without bending arms." },
    { name: "Plank",            sets: 3, reps: "20 sec",  note: "Straight line head to heels." },
  ],
  "2A": [
    { name: "Push-up",          sets: 3, reps: "12",      note: "Same form, more reps." },
    { name: "Wide Push-up",     sets: 2, reps: "10",      note: "Hands wider than shoulders." },
    { name: "Split Squat",      sets: 3, reps: "10 / leg", note: "Controlled descent." },
    { name: "Jump Squat",       sets: 3, reps: "12",      note: "Soft landing." },
    { name: "Wall Sit",         sets: 3, reps: "30 sec",  note: "Thighs parallel, breathe." },
  ],
  "2B": [
    { name: "Australian Pull-up", sets: 3, reps: "10",    note: "Straight legs now." },
    { name: "Chin-up",          sets: 3, reps: "5–8",     note: "Use gloves. Clean form only." },
    { name: "Dead Hang",        sets: 3, reps: "30 sec",  note: "Shoulders packed." },
    { name: "Hollow Body Hold", sets: 3, reps: "20 sec",  note: "Lower back pressed down." },
    { name: "Plank",            sets: 3, reps: "30 sec",  note: "No hip sag." },
  ],
  "3A": [
    { name: "Push-up",              sets: 4, reps: "12",      note: "Full ROM, no rushing." },
    { name: "Diamond Push-up",      sets: 3, reps: "10",      note: "Hands form diamond under chest." },
    { name: "Bulgarian Split Squat", sets: 3, reps: "10 / leg", note: "Rear foot elevated. Controlled." },
    { name: "Jump Squat",           sets: 4, reps: "12",      note: "Soft landing every rep." },
    { name: "Wall Sit",             sets: 3, reps: "45 sec",  note: "Hold the line." },
  ],
  "3B": [
    { name: "Australian Pull-up", sets: 4, reps: "10",       note: "Feet elevated on low surface." },
    { name: "Chin-up",          sets: 3, reps: "8",          note: "Clean reps, gloves." },
    { name: "Pull-up",          sets: 3, reps: "3–5",        note: "Quality over quantity." },
    { name: "Dead Hang",        sets: 3, reps: "40 sec",     note: "Build grip." },
    { name: "Knee Raise (bar)", sets: 3, reps: "10",         note: "Knees to chest, controlled." },
    { name: "Plank",            sets: 3, reps: "45 sec",     note: "Tight body." },
  ],
  "4A": [
    { name: "Pike Push-up",         sets: 3, reps: "10",       note: "Hips high, head dips down." },
    { name: "Archer Push-up",       sets: 3, reps: "6 / side", note: "Lower to one side, other arm extended." },
    { name: "Diamond Push-up",      sets: 3, reps: "12",       note: "Triceps focus." },
    { name: "Bulgarian Split Squat", sets: 4, reps: "12 / leg", note: "Slow controlled." },
    { name: "Jump Squat",           sets: 4, reps: "15",       note: "Soft landings." },
    { name: "Wall Sit",             sets: 3, reps: "60 sec",   note: "Final hold of the block." },
  ],
  "4B": [
    { name: "Australian Pull-up", sets: 4, reps: "10",       note: "Tempo 3s up / 3s down." },
    { name: "Pull-up",          sets: 4, reps: "4–6",        note: "Clean form, full ROM." },
    { name: "Chin-up",          sets: 3, reps: "10",         note: "Steady cadence." },
    { name: "Scapular Pull-up", sets: 3, reps: "10",         note: "Pure scap movement." },
    { name: "Dead Hang",        sets: 3, reps: "45–60 sec",  note: "Grip endurance." },
    { name: "Knee Raise (bar)", sets: 3, reps: "12",         note: "Controlled, no swing." },
    { name: "Hollow Body Hold", sets: 3, reps: "30 sec",     note: "Lower back glued down." },
  ],
};

// Build the 60-day plan array.
const PROGRAM = Array.from({ length: 60 }, (_, i) => {
  const day = i + 1;
  const type = typeForDay(day);
  const block = blockForDay(day);
  const exercises = type === "R" ? [] : WORKOUTS[`${block}${type}`];
  return { day, type, block, exercises };
});

window.PROGRAM = PROGRAM;
window.BLOCKS = BLOCKS;
window.typeForDay = typeForDay;
window.blockForDay = blockForDay;
