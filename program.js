(function () {
  /* ── Storage key (matches app.jsx) ── */
  const LS_START = 'mybar.start.v1';
  const DAY_MS = 86400000;
  function midnight(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

  let startTs = +localStorage.getItem(LS_START);
  if (!startTs) { startTs = midnight(Date.now()); localStorage.setItem(LS_START, String(startTs)); }

  /* ── Constants ── */
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const BLOCKS = [
    { n: 1, name: 'Foundation', from: 1,  to: 15, tagline: 'Build the base' },
    { n: 2, name: 'Build',      from: 16, to: 30, tagline: 'Add reps & load' },
    { n: 3, name: 'Strength',   from: 31, to: 45, tagline: 'Peak volume' },
    { n: 4, name: 'Peak',       from: 46, to: 60, tagline: 'Hold the edge' },
  ];

  const TYPE_INFO = {
    P: { name: 'Push', short: 'Push', focus: 'Chest · Shoulders · Triceps' },
    L: { name: 'Pull', short: 'Pull', focus: 'Back · Biceps · Grip' },
    H: { name: 'Legs', short: 'Legs', focus: 'Quads · Glutes · Hamstrings' },
    R: { name: 'Rest', short: 'Rest', focus: 'Recovery & mobility' },
  };

  /* Day type rotation: P → L → H → R */
  function typeForDay(day) { return ['P', 'L', 'H', 'R'][(day - 1) % 4]; }

  function blockOf(day) { return BLOCKS.find(b => day >= b.from && day <= b.to); }

  /* ── Workout library [block][type] → sections ── */
  const W = {
    /* ── Block 1: Foundation ── */
    '1P': [{ name: 'Push', exercises: [
      { name: 'Push-up',         sets: 3, reps: '8',      note: 'Chest near floor, full extension, controlled.' },
      { name: 'Wide Push-up',    sets: 3, reps: '6',      note: 'Hands wider than shoulders, elbows flared.' },
      { name: 'Pike Push-up',    sets: 3, reps: '6',      note: 'Hips high, head dips toward floor.' },
    ]}],
    '1L': [
      { name: 'Pull', exercises: [
        { name: 'Australian Pull-up', sets: 3, reps: '8',      note: 'Bent knees. Chest to bar, squeeze shoulder blades.' },
        { name: 'Dead Hang',          sets: 3, reps: '20 sec',  note: 'Arms straight, shoulders engaged.' },
        { name: 'Scapular Pull-up',   sets: 3, reps: '8',      note: 'Depress shoulders without bending arms.' },
      ]},
      { name: 'Core', exercises: [
        { name: 'Plank',              sets: 3, reps: '20 sec',  note: 'Straight line head to heels.' },
      ]},
    ],
    '1H': [{ name: 'Legs', exercises: [
      { name: 'Split Squat',     sets: 3, reps: '8 ea',    note: 'Rear knee toward floor, slow descent.' },
      { name: 'Jump Squat',      sets: 3, reps: '8',       note: 'Explosive up, soft landing — bend knees.' },
      { name: 'Wall Sit',        sets: 3, reps: '20 sec',  note: 'Back flat, thighs parallel.' },
    ]}],

    /* ── Block 2: Build ── */
    '2P': [{ name: 'Push', exercises: [
      { name: 'Push-up',          sets: 3, reps: '12',     note: 'Same form, more reps.' },
      { name: 'Wide Push-up',     sets: 3, reps: '10',     note: 'Hands wider than shoulders.' },
      { name: 'Diamond Push-up',  sets: 2, reps: '8',      note: 'Hands form diamond under chest.' },
    ]}],
    '2L': [
      { name: 'Pull', exercises: [
        { name: 'Australian Pull-up', sets: 3, reps: '10',     note: 'Straight legs now.' },
        { name: 'Chin-up',            sets: 3, reps: '5–8',    note: 'Use gloves. Clean form only.', gloves: true },
        { name: 'Dead Hang',          sets: 3, reps: '30 sec', note: 'Shoulders packed.' },
      ]},
      { name: 'Core', exercises: [
        { name: 'Hollow Body Hold',   sets: 3, reps: '20 sec', note: 'Lower back pressed down.' },
        { name: 'Plank',              sets: 3, reps: '30 sec', note: 'No hip sag.' },
      ]},
    ],
    '2H': [{ name: 'Legs', exercises: [
      { name: 'Split Squat',     sets: 3, reps: '10 ea',   note: 'Controlled descent.' },
      { name: 'Jump Squat',      sets: 3, reps: '12',      note: 'Soft landing.' },
      { name: 'Wall Sit',        sets: 3, reps: '30 sec',  note: 'Thighs parallel, breathe.' },
    ]}],

    /* ── Block 3: Strength ── */
    '3P': [{ name: 'Push', exercises: [
      { name: 'Push-up',          sets: 4, reps: '12',     note: 'Full ROM, no rushing.' },
      { name: 'Diamond Push-up',  sets: 3, reps: '10',     note: 'Hands form diamond under chest.' },
      { name: 'Pike Push-up',     sets: 3, reps: '8',      note: 'Hips high, head dips down.' },
    ]}],
    '3L': [
      { name: 'Pull', exercises: [
        { name: 'Australian Pull-up', sets: 4, reps: '10',     note: 'Feet elevated on low surface.' },
        { name: 'Chin-up',            sets: 3, reps: '8',      note: 'Clean reps, gloves.', gloves: true },
        { name: 'Pull-up',            sets: 3, reps: '3–5',    note: 'Quality over quantity.', gloves: true },
        { name: 'Dead Hang',          sets: 3, reps: '40 sec', note: 'Build grip.' },
      ]},
      { name: 'Core', exercises: [
        { name: 'Knee Raise (bar)',    sets: 3, reps: '10',     note: 'Knees to chest, controlled.' },
        { name: 'Plank',              sets: 3, reps: '45 sec', note: 'Tight body.' },
      ]},
    ],
    '3H': [{ name: 'Legs', exercises: [
      { name: 'Bulgarian Split Squat', sets: 3, reps: '10 ea',  note: 'Rear foot elevated. Controlled.' },
      { name: 'Jump Squat',            sets: 4, reps: '12',     note: 'Soft landing every rep.' },
      { name: 'Wall Sit',              sets: 3, reps: '45 sec', note: 'Hold the line.' },
    ]}],

    /* ── Block 4: Peak ── */
    '4P': [{ name: 'Push', exercises: [
      { name: 'Pike Push-up',     sets: 3, reps: '10',     note: 'Hips high, head dips down.' },
      { name: 'Archer Push-up',   sets: 3, reps: '6 ea',   note: 'Lower to one side, other arm extended.' },
      { name: 'Diamond Push-up',  sets: 3, reps: '12',     note: 'Triceps focus.' },
    ]}],
    '4L': [
      { name: 'Pull', exercises: [
        { name: 'Australian Pull-up', sets: 4, reps: '10',     note: 'Tempo 3s up / 3s down.' },
        { name: 'Pull-up',            sets: 4, reps: '4–6',    note: 'Clean form, full ROM.', gloves: true },
        { name: 'Chin-up',            sets: 3, reps: '10',     note: 'Steady cadence.', gloves: true },
        { name: 'Scapular Pull-up',   sets: 3, reps: '10',     note: 'Pure scap movement.' },
        { name: 'Dead Hang',          sets: 3, reps: '45 sec', note: 'Grip endurance.' },
      ]},
      { name: 'Core', exercises: [
        { name: 'Knee Raise (bar)',   sets: 3, reps: '12',     note: 'Controlled, no swing.' },
        { name: 'Hollow Body Hold',   sets: 3, reps: '30 sec', note: 'Lower back glued down.' },
      ]},
    ],
    '4H': [{ name: 'Legs', exercises: [
      { name: 'Bulgarian Split Squat', sets: 4, reps: '12 ea',  note: 'Slow controlled.' },
      { name: 'Jump Squat',            sets: 4, reps: '15',     note: 'Soft landings.' },
      { name: 'Wall Sit',              sets: 3, reps: '60 sec', note: 'Final hold of the block.' },
    ]}],
  };

  function isTimed(reps) { return /sec/.test(String(reps)); }
  function targetSeconds(reps) { const m = String(reps).match(/(\d+)/); return m ? +m[1] : 30; }

  const DAYS = Array.from({ length: 60 }, (_, i) => {
    const day = i + 1;
    const type = typeForDay(day);
    const block = blockOf(day);
    const weekdayIdx = new Date(startTs + i * DAY_MS).getDay();
    return {
      day,
      type,
      typeName: TYPE_INFO[type].name,
      weekday: WEEKDAYS[weekdayIdx],
      weekdayIdx,
      block: block.n,
      blockName: block.name,
      sections: type === 'R' ? [] : (W[`${block.n}${type}`] || []),
    };
  });

  function totalSets(day) {
    const d = DAYS[day - 1];
    if (!d || d.type === 'R') return 0;
    return d.sections.reduce((sum, sec) =>
      sum + sec.exercises.reduce((s, ex) => s + ex.sets, 0), 0);
  }

  window.MYBAR = { DAYS, BLOCKS, TYPE_INFO, WEEKDAY_INITIALS, blockOf, totalSets, isTimed, targetSeconds };
})();
