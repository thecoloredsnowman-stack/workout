/* ═══════════════════════════════════════════════════════════
   MyBar — 60-day program data (v2: PPL, mass focus)
   Cycle: Mon P · Tue L · Wed H · Thu P · Fri L · Sat H · Sun R
   Blocks: 1–14 Foundation · 15–28 Build · 29–44 Strength · 45–60 Peak
   exposes window.MYBAR
═══════════════════════════════════════════════════════════ */
(function () {
  const e = (name, sets, reps, note, gloves) => ({ name, sets, reps, note, gloves: !!gloves });

  const TYPE_CYCLE = ['P', 'L', 'H', 'P', 'L', 'H', 'R'];
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const TYPE_INFO = {
    P: { letter: 'P', name: 'Push',        short: 'Push',        focus: 'Chest · shoulders · triceps' },
    L: { letter: 'L', name: 'Pull',        short: 'Pull',        focus: 'Back · biceps · grip' },
    H: { letter: 'H', name: 'Legs + Core', short: 'Legs · Core', focus: 'Quads · glutes · hamstrings · calves + core' },
    R: { letter: 'R', name: 'Rest',        short: 'Rest',        focus: 'Full recovery — muscle grows here' },
  };

  const BLOCKS = [
    { n: 1, name: 'Foundation', from: 1,  to: 14, tagline: 'Establish volume, build the baseline' },
    { n: 2, name: 'Build',      from: 15, to: 28, tagline: 'Reps and variations climb' },
    { n: 3, name: 'Strength',   from: 29, to: 44, tagline: 'Hard variations · volume peak' },
    { n: 4, name: 'Peak',       from: 45, to: 60, tagline: 'Complexity and intensity held' },
  ];

  function blockOf(day) {
    return BLOCKS.find(b => day >= b.from && day <= b.to);
  }

  // ── Workouts by block (1-indexed) and type ──
  const W = {
    1: {
      P: [
        { name: 'Push', exercises: [
          e('Parallette Dips', 3, '10', 'Lean slightly forward, full lockout at top'),
          e('Push-up', 4, '15', 'Chest near-floor, controlled tempo'),
          e('Pike Push-up', 3, '10', 'Hips high, head dips toward floor'),
          e('Wide Push-up', 3, '12', 'Hands wider than shoulders'),
          e('Diamond Push-up', 3, '10', 'Hands form a diamond under the chest'),
          e('Deep Parallette Push-up', 2, '10', 'Full stretch at the bottom — go as deep as form allows'),
        ]},
      ],
      L: [
        { name: 'Pull', exercises: [
          e('Pull-up', 4, '6', 'Chin over bar, controlled lower'),
          e('Chin-up', 3, '8', 'Palms facing you, full range'),
          e('Scapular Pull-up', 3, '8', 'Arms straight, shrug shoulders down/back'),
          e('Negative Pull-up', 2, '4', 'Jump up, lower 5s under control'),
          e('Dead Hang', 3, '30s', 'Full bodyweight, relaxed shoulders'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Bulgarian Split Squat', 3, '10 ea', 'Rear foot elevated, knee toward floor'),
          e('Tempo Squat', 4, '15', '3s down, drive up — slow controlled descent'),
          e('Reverse Lunge', 3, '12 ea', 'Step back, rear knee toward floor'),
          e('Glute Bridge', 3, '20', 'Squeeze glutes hard at the top'),
          e('Single-leg Calf Raise', 3, '15 ea', 'Off a step — full range'),
          e('Wall Sit', 3, '45s', 'Thighs parallel, back flat'),
        ]},
        { name: 'Core', exercises: [
          e('Tuck L-sit Hold', 3, '18s', 'Parallettes — knees tucked, support body weight'),
          e('Hanging Knee Raise', 3, '12', 'Hang from bar, raise knees to chest'),
          e('Plank', 3, '45s', 'Straight line, head to heels'),
        ]},
      ],
    },
    2: {
      P: [
        { name: 'Push', exercises: [
          e('Parallette Dips', 4, '12', 'Controlled, full lockout'),
          e('Decline Push-up', 4, '12', 'Feet elevated on a ledge/bench'),
          e('Pike Push-up', 4, '12', 'Hips high, head toward floor'),
          e('Diamond Push-up', 3, '12', 'Diamond under chest'),
          e('Archer Push-up', 3, '6 ea', 'One arm extended sideways, lower to one side'),
          e('Pseudo-planche Lean Hold', 3, '18s', 'Parallettes — shoulders forward over hands'),
        ]},
      ],
      L: [
        { name: 'Pull', exercises: [
          e('Pull-up', 4, '8', 'Chin over bar, controlled'),
          e('Chin-up', 4, '10', 'Palms facing you'),
          e('Scapular Pull-up', 3, '10', 'Shrug shoulders down/back'),
          e('Negative Pull-up', 2, '5', 'Lower 5s under control'),
          e('Dead Hang', 3, '40s', 'Full bodyweight'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Bulgarian Split Squat', 4, '12 ea', 'Rear foot elevated, controlled'),
          e('Pause Squat', 4, '20', '2s hold at the bottom of each rep'),
          e('Walking / Reverse Lunge', 3, '15 ea', 'Long step, knee toward floor'),
          e('Single-leg Glute Bridge', 3, '12 ea', 'One foot flat, drive hips up'),
          e('Single-leg Calf Raise', 4, '20 ea', 'Off a step — full range'),
          e('Wall Sit', 3, '60s', 'Thighs parallel'),
        ]},
        { name: 'Core', exercises: [
          e('Advanced Tuck L-sit', 3, '20s', 'Parallettes — knees move away from chest, back rounds less'),
          e('Hanging Leg Raise (knees bent)', 3, '12', 'Hang from bar, knees up'),
          e('Hollow Body Hold', 3, '30s', 'Lower back pressed to floor'),
        ]},
      ],
    },
    3: {
      P: [
        { name: 'Push', exercises: [
          e('Parallette Dips (tempo)', 4, '12', '3s down, pause at bottom'),
          e('Archer Push-up', 4, '8 ea', 'One arm extended sideways'),
          e('Elevated Pike Push-up', 4, '10', 'Feet raised — toward handstand push-up'),
          e('Pseudo-planche Push-up', 3, '7', 'Parallettes — shoulders forward over hands'),
          e('Diamond Push-up', 3, '15', 'Diamond under chest'),
          e('Deep Parallette Push-up', 3, '12', 'Full stretch at the bottom'),
        ]},
      ],
      L: [
        { name: 'Pull', exercises: [
          e('Pull-up', 5, '8', 'Chin over bar, controlled'),
          e('Chin-up', 4, '12', 'Palms facing you'),
          e('Wide Pull-up', 3, '6', 'Hands wider than shoulders'),
          e('Negative Pull-up', 3, '5', 'Lower 5s under control'),
          e('Scapular Pull-up', 3, '12', 'Shrug down/back'),
          e('Dead Hang', 3, '50s', 'Full bodyweight'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Bulgarian Split Squat', 4, '15 ea', 'Rear foot elevated'),
          e('Box / Assisted Pistol Squat', 3, '5 ea', 'Sit to a box or hold support'),
          e('Jump Squat', 4, '15', 'Explosive, soft landing'),
          e('Pause Squat', 4, '20', '2s hold at bottom'),
          e('Single-leg Glute Bridge (foot elevated)', 3, '15 ea', 'Foot on a low ledge'),
          e('Single-leg Calf Raise (slow)', 4, '20 ea', 'Controlled tempo'),
        ]},
        { name: 'Core', exercises: [
          e('Advanced Tuck / One-leg L-sit', 3, '18s', 'Parallettes — progress toward full L-sit'),
          e('Hanging Leg Raise', 3, '12', 'Straighter legs as you can'),
          e('Hollow Body Hold', 3, '40s', 'Lower back pressed down'),
        ]},
      ],
    },
    4: {
      P: [
        { name: 'Push', exercises: [
          e('Parallette Dips (pause)', 4, '15', 'Pause at the bottom of each rep'),
          e('Pseudo-planche Push-up', 4, '10', 'Shoulders forward over hands'),
          e('Elevated Pike Push-up', 4, '8', 'Toward handstand push-up'),
          e('Archer Push-up', 4, '8 ea', 'One arm extended sideways'),
          e('Deep Parallette Push-up', 4, '12', 'Full stretch at bottom'),
          e('Pseudo-planche Hold', 3, '28s', 'Parallettes — lean as far forward as you can hold'),
        ]},
      ],
      L: [
        { name: 'Pull', exercises: [
          e('Pull-up (tempo)', 5, '10', '3s up tempo, controlled lower'),
          e('Wide Pull-up', 4, '8', 'Hands wider than shoulders'),
          e('Chin-up', 4, '12', 'Palms facing you'),
          e('Archer / Typewriter Pull-up', 3, '4 ea', 'Pull to one side, shift across'),
          e('Negative Pull-up (slow)', 3, '5', 'Lower as slowly as possible'),
          e('Towel Dead Hang', 3, '50s', 'Grip a towel over the bar'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Bulgarian Split Squat (tempo)', 4, '15 ea', '3s down on each rep'),
          e('Pistol Squat Progression', 4, '6 ea', 'Box, assisted, or full pistol'),
          e('Jump Squat', 4, '20', 'Explosive, soft landing'),
          e('Pause Squat', 4, '25', '2s hold at bottom'),
          e('Single-leg RDL', 3, '8 ea', 'Hinge on one leg, flat back — Nordic negatives if anchorable'),
          e('Single-leg Calf Raise', 4, '25 ea', 'Off a step, full range'),
        ]},
        { name: 'Core', exercises: [
          e('L-sit (full or one-leg)', 4, '18s', 'Parallettes — both legs straight if you can'),
          e('Toes-to-bar or Straight Leg Raise', 4, '10', 'Hang from bar, raise straight legs'),
          e('Hollow Body Hold', 3, '45s', 'Lower back pressed down'),
        ]},
      ],
    },
  };

  // Build all 60 day objects
  const DAYS = [];
  for (let d = 1; d <= 60; d++) {
    const type = TYPE_CYCLE[(d - 1) % 7];
    const wd = (d - 1) % 7;
    const block = blockOf(d);
    const sections = type === 'R' ? [] : W[block.n][type];
    DAYS.push({
      day: d,
      type,
      typeName: TYPE_INFO[type].name,
      weekday: WEEKDAYS[wd],
      weekdayIdx: wd,
      block: block.n,
      blockName: block.name,
      sections,
    });
  }

  function isTimed(reps) { return /^\d+s$/.test(String(reps).trim()); }
  function targetSeconds(reps) { const m = String(reps).match(/^(\d+)s$/); return m ? +m[1] : 0; }
  function totalSets(day) {
    return (DAYS[day - 1].sections || []).reduce(
      (a, s) => a + s.exercises.reduce((b, ex) => b + ex.sets, 0), 0);
  }

  window.MYBAR = {
    DAYS, BLOCKS, TYPE_INFO, TYPE_CYCLE, WEEKDAYS, WEEKDAY_INITIALS,
    blockOf, isTimed, targetSeconds, totalSets,
  };
})();
