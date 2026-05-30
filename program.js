/* ═══════════════════════════════════════════════════════════
   MyBar — 60-day program data (hardcoded, single source of truth)
   Cycle: Mon P · Tue L · Wed H · Thu P · Fri L · Sat H · Sun R
   Blocks: 1–12 Foundation · 13–24 Build · 25–42 Strength · 43–60 Peak
   exposes window.MYBAR
═══════════════════════════════════════════════════════════ */
(function () {
  // exercise helper
  const e = (name, sets, reps, note, gloves) => ({ name, sets, reps, note, gloves: !!gloves });

  const TYPE_CYCLE = ['P', 'L', 'H', 'P', 'L', 'H', 'R'];
  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const TYPE_INFO = {
    P: { letter: 'P', name: 'Push + Legs',       short: 'Push · Legs',          focus: 'Quads / glutes + all pushing — no grip' },
    L: { letter: 'L', name: 'Pull + Grip + Core', short: 'Pull · Grip · Core',  focus: 'Low-grip back, grip track + core' },
    H: { letter: 'H', name: 'Legs + Core',        short: 'Legs · Core',          focus: 'Hamstrings / calves + core' },
    R: { letter: 'R', name: 'Rest',               short: 'Rest',                 focus: 'Full recovery — muscle grows here' },
  };

  const BLOCKS = [
    { n: 1, name: 'Foundation', from: 1,  to: 12, tagline: 'Form, tendons & a low grip base' },
    { n: 2, name: 'Build',      from: 13, to: 24, tagline: 'Reps and rounds climb' },
    { n: 3, name: 'Strength',   from: 25, to: 42, tagline: 'Harder variations · vertical pull' },
    { n: 4, name: 'Peak',       from: 43, to: 60, tagline: 'Hold intensity · add complexity' },
  ];

  function blockOf(day) {
    return BLOCKS.find(b => day >= b.from && day <= b.to);
  }

  // ── Workouts by block (1-indexed) and type ──
  // Each: array of { name, exercises:[ e(...) ] }
  const W = {
    1: {
      P: [
        { name: 'Push', exercises: [
          e('Push-up', 3, '12', 'Chest near-floor, full extension, controlled'),
          e('Wide Push-up', 3, '10', 'Hands wider than shoulders'),
          e('Pike Push-up', 3, '8', 'Hips high, head dips toward the floor'),
        ]},
        { name: 'Legs', exercises: [
          e('Jump Squat', 3, '10', 'Explosive up, land soft with bent knees'),
          e('Split Squat', 3, '8 ea', 'One foot forward, rear knee toward floor'),
          e('Wall Sit', 3, '25s', 'Back flat on wall, thighs parallel'),
        ]},
      ],
      L: [
        { name: 'Back', exercises: [
          e('Australian Pull-up', 3, '10', 'Chest to bar, controlled', true),
          e('Prone Y-T-W Raises', 3, '8', 'Face down, squeeze shoulder blades'),
        ]},
        { name: 'Grip', exercises: [
          e('Supported Dead Hang', 5, '10s', 'Toes assisting — never to failure'),
          e('Towel Hang', 3, '8s', 'Grip towel over the bar, supported if needed'),
        ]},
        { name: 'Core', exercises: [
          e('Hollow Body Hold', 3, '20s', 'Lower back pressed to the floor'),
          e('Plank', 3, '25s', 'Straight line, head to heels'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Single-leg Romanian Deadlift', 3, '8 ea', 'Balance on one leg, hinge, flat back'),
          e('Single-leg Glute Bridge', 3, '10 ea', 'One foot flat, drive the hips up'),
          e('Calf Raise', 3, '15', 'Full range on a step or ledge'),
        ]},
        { name: 'Core', exercises: [
          e('Floor Leg Raise', 3, '12', 'Lying flat, raise legs — no hanging'),
          e('Plank', 3, '25s', 'Straight line, head to heels'),
        ]},
      ],
    },
    2: {
      P: [
        { name: 'Push', exercises: [
          e('Push-up', 4, '15', 'Chest near-floor, full extension'),
          e('Wide Push-up', 3, '12', 'Hands wider than shoulders'),
          e('Pike Push-up', 3, '10', 'Hips high, head dips toward floor'),
          e('Diamond Push-up', 3, '10', 'Hands form a diamond under the chest'),
        ]},
        { name: 'Legs', exercises: [
          e('Jump Squat', 4, '12', 'Explosive up, land soft'),
          e('Split Squat', 3, '10 ea', 'Rear knee toward floor, controlled'),
          e('Wall Sit', 3, '35s', 'Thighs parallel, hold'),
        ]},
      ],
      L: [
        { name: 'Back', exercises: [
          e('Australian Pull-up', 4, '12', 'Chest to bar, controlled', true),
          e('Feet-elevated Australian Pull-up', 3, '8', 'Feet up on a low ledge — harder angle'),
          e('Prone Y-T-W Raises', 3, '10', 'Squeeze shoulder blades'),
        ]},
        { name: 'Grip', exercises: [
          e('Supported Dead Hang', 6, '12s', 'Toes assisting — more rounds, still supported'),
          e('Towel Hang', 3, '12s', 'Supported if needed'),
        ]},
        { name: 'Core', exercises: [
          e('Hollow Body Hold', 3, '25s', 'Lower back pressed down'),
          e('Bicycle Crunch', 3, '16', 'Alternating elbow to opposite knee'),
          e('Plank', 3, '35s', 'Straight line, head to heels'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Single-leg Romanian Deadlift', 3, '10 ea', 'Hinge, flat back, balance'),
          e('Nordic Curl (negatives)', 3, '5', 'Lower slowly — negatives only'),
          e('Single-leg Glute Bridge', 3, '12 ea', 'Drive hips up'),
          e('Calf Raise', 4, '18', 'Full range, high reps'),
        ]},
        { name: 'Core', exercises: [
          e('Floor Leg Raise', 3, '15', 'Raise legs, no hanging'),
          e('Hollow Body Hold', 3, '25s', 'Lower back pressed down'),
        ]},
      ],
    },
    3: {
      P: [
        { name: 'Push', exercises: [
          e('Push-up', 4, '18', 'Chest near-floor, full extension'),
          e('Diamond Push-up', 3, '12', 'Diamond under the chest'),
          e('Pike Push-up', 4, '10', 'Hips high, controlled'),
          e('Wide Push-up', 3, '12', 'Hands wide'),
        ]},
        { name: 'Legs', exercises: [
          e('Jump Squat', 4, '15', 'Land soft, never lock out'),
          e('Bulgarian Split Squat', 3, '10 ea', 'Rear foot elevated on a bench'),
          e('Wall Sit', 3, '45s', 'Thighs parallel'),
        ]},
      ],
      L: [
        { name: 'Back', exercises: [
          e('Australian Pull-up', 4, '14', 'Chest to bar, controlled', true),
          e('Feet-elevated Australian Pull-up', 3, '10', 'Feet up on a ledge'),
          e('Towel Pull-up Negatives', 3, '4', 'Jump up, lower 3–5s under control'),
          e('Prone Y-T-W Raises', 3, '12', 'Squeeze shoulder blades'),
        ]},
        { name: 'Grip', exercises: [
          e('Dead Hang (lightly supported)', 5, '20s', 'Less support — longer holds'),
          e('Towel Hang', 3, '15s', 'Crushing grip'),
        ]},
        { name: 'Core', exercises: [
          e('Floor Leg Raise', 3, '15', 'Raise legs, no hanging'),
          e('Hollow Body Hold', 3, '30s', 'Lower back pressed down'),
          e('Plank', 3, '45s', 'Straight line'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Single-leg Romanian Deadlift', 3, '12 ea', 'Hinge, flat back'),
          e('Nordic Curl (negatives)', 3, '6', 'Lower slowly — negatives only'),
          e('Single-leg Glute Bridge', 3, '14 ea', 'Drive hips up'),
          e('Calf Raise', 4, '20', 'Full range'),
          e('Single-leg Calf Raise', 3, '10 ea', 'Progression — one leg'),
        ]},
        { name: 'Core', exercises: [
          e('Bicycle Crunch', 3, '20', 'Elbow to opposite knee'),
          e('Hollow Body Hold', 3, '30s', 'Lower back pressed down'),
        ]},
      ],
    },
    4: {
      P: [
        { name: 'Push', exercises: [
          e('Archer Push-up', 3, '6 ea', 'One arm extended sideways, lower to one side'),
          e('Diamond Push-up', 3, '14', 'Diamond under the chest'),
          e('Pike Push-up', 4, '12', 'Hips high'),
          e('Push-up', 3, '20', 'Full range, controlled'),
        ]},
        { name: 'Legs', exercises: [
          e('Jump Squat', 4, '18', 'Land soft'),
          e('Bulgarian Split Squat', 4, '12 ea', 'Rear foot elevated'),
          e('Wall Sit', 3, '60s', 'Thighs parallel, hold'),
        ]},
      ],
      L: [
        { name: 'Back', exercises: [
          e('Australian Pull-up — slow tempo', 4, '12', '3s up / 3s down', true),
          e('Feet-elevated Australian Pull-up', 4, '10', 'Feet up on a ledge'),
          e('Towel Pull-up Negatives', 4, '5', 'Jump up, lower under control'),
          e('Prone Y-T-W Raises', 3, '14', 'Squeeze shoulder blades'),
        ]},
        { name: 'Grip', exercises: [
          e('Dead Hang (unsupported)', 5, '25s', 'Full bodyweight — grip has earned it'),
          e('Towel Hang', 4, '18s', 'Crushing grip'),
        ]},
        { name: 'Core', exercises: [
          e('Floor Leg Raise', 3, '18', 'Raise legs, no hanging'),
          e('Hollow Body Hold', 3, '35s', 'Lower back pressed down'),
          e('Plank', 3, '60s', 'Straight line'),
        ]},
      ],
      H: [
        { name: 'Legs', exercises: [
          e('Single-leg Romanian Deadlift', 4, '12 ea', 'Hinge, flat back'),
          e('Nordic Curl (negatives)', 4, '6', 'Lower slowly — negatives only'),
          e('Single-leg Glute Bridge', 4, '15 ea', 'Drive hips up'),
          e('Single-leg Calf Raise', 4, '12 ea', 'One leg, full range'),
          e('Calf Raise', 3, '25', 'High reps'),
        ]},
        { name: 'Core', exercises: [
          e('Bicycle Crunch', 3, '24', 'Elbow to opposite knee'),
          e('Hollow Body Hold', 3, '35s', 'Lower back pressed down'),
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

  // is this rep a timed hold? ("25s","10s",...)
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
