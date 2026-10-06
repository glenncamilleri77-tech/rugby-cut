/* Rugby Cut — offline form guides (SVGs + cues). No network needed. */

const FORM_GUIDES = {
  "leg-press": {
    title: "Leg press",
    muscles: ["Quads", "Glutes", "Adductors"],
    diagram: "legPress",
    cues: [
      "Feet mid-platform, roughly shoulder-width; toes slightly out.",
      "Unlock safely, then lower until knees ~90° without hips lifting.",
      "Drive through mid-foot / heels — don’t let knees cave in.",
      "Stop just short of full lockout to keep tension on quads.",
      "Brace abs; keep low back glued to the pad the whole set.",
    ],
    mistakes: [
      "Hips/butt popping off the seat at the bottom (too deep or feet too high).",
      "Knees collapsing inward or bouncing out of the hole.",
      "Locking out hard and resting with knees hyperextended.",
    ],
    breath: "Inhale on the way down; brace and exhale as you press up. Tempo ~3-1-2.",
  },
  "leg-curl": {
    title: "Lying / seated leg curl",
    muscles: ["Hamstrings", "Calves (assist)"],
    diagram: "legCurl",
    cues: [
      "Pad sits just above the heels; hips stay pinned to the seat/pad.",
      "Curl in a controlled arc — think “heels to glutes.”",
      "Squeeze hard at peak for a beat before lowering.",
      "Keep ankles dorsiflexed (toes toward shins) for more hamstring bias.",
      "Use a full stretch at the bottom without letting the stack slam.",
    ],
    mistakes: [
      "Hips hiking or lifting off the pad to cheat the weight up.",
      "Using momentum / swinging instead of a smooth curl.",
      "Partial range — never reaching a true peak squeeze.",
    ],
    breath: "Exhale on the curl; inhale on the eccentric. Tempo ~2-1-3.",
  },
  "chest-press": {
    title: "Machine / Smith chest press",
    muscles: ["Chest", "Front delts", "Triceps"],
    diagram: "chestPress",
    cues: [
      "Handles at mid-chest; scapulae set down and back on the pad.",
      "Elbows ~45–70° from torso — not flared flat to 90°.",
      "Press in a slight arc; don’t shrug the shoulders up.",
      "Lower under control to a soft stretch at the chest.",
      "Stop short of slamming plates / hard lockout bounce.",
    ],
    mistakes: [
      "Bouncing out of the bottom or bouncing the bar off the chest.",
      "Shoulders rolling forward — losing scapular contact with the pad.",
      "Elbows flared extremely wide (shoulder stress).",
    ],
    breath: "Inhale down; exhale press. Tempo ~3-0-2 — no bounce.",
  },
  "lunges": {
    title: "Walking / reverse lunges (Smith / hack)",
    muscles: ["Quads", "Glutes", "Core"],
    diagram: "lunge",
    cues: [
      "Tall torso; front shin mostly vertical over mid-foot.",
      "Step back (reverse) for easier balance on Smith/hack.",
      "Front knee tracks over toes; don’t let it cave inward.",
      "Back knee drops straight down toward the floor.",
      "Push through the front mid-foot to stand — don’t shove off the back toe.",
    ],
    mistakes: [
      "Front knee shooting far past toes with heel lifting.",
      "Torso collapsing forward or twisting side to side.",
      "Short, shallow steps that turn it into a mini-squat.",
    ],
    breath: "Inhale as you drop; exhale drive up. Even tempo each leg.",
  },
  "pec-deck": {
    title: "Pec deck / cable fly",
    muscles: ["Chest", "Front delts"],
    diagram: "fly",
    cues: [
      "Slight elbow bend locked for the set — arms as long levers.",
      "Bring handles / pads together in front of mid-chest.",
      "Squeeze pecs at the midline for a full second.",
      "Open until you feel a chest stretch — don’t overstretch the shoulder.",
      "Ribs down; don’t arch hard off the pad to cheat.",
    ],
    mistakes: [
      "Turning it into a press by bending/extending the elbows a lot.",
      "Cranking weight with momentum and bouncing at the stretch.",
      "Shoulders shrugging up toward ears.",
    ],
    breath: "Exhale on the squeeze; inhale on the open. Tempo ~2-1-3.",
  },
  "crunch": {
    title: "Machine / cable crunch",
    muscles: ["Abs (rectus)", "Obliques (assist)"],
    diagram: "crunch",
    cues: [
      "Anchor hips; curl the ribcage toward the pelvis — spine flexes.",
      "Think “shorten the abs,” not “pull the rope with arms.”",
      "Exhale hard as you crunch; keep chin slightly tucked.",
      "Control the return — don’t let the stack yank you upright.",
      "Stop when abs are fully shortened; extra range is usually hip flexors.",
    ],
    mistakes: [
      "Yanking with arms / lats instead of trunk flexion.",
      "Hyperextending the low back on the way up.",
      "Tiny pulses with no real shortening of the abs.",
    ],
    breath: "Big exhale on the crunch; inhale on the way up. Tempo ~2-1-2.",
  },
  "fin-bike-rower": {
    title: "Assault bike / rower intervals",
    muscles: ["Legs", "Lungs", "Upper body (rower)"],
    diagram: "intervals",
    cues: [
      "Hard = near-max sustainable for 20 sec; easy = truly recover.",
      "Bike: push and pull the pedals; keep chest up, loose grip.",
      "Rower: legs → hinge → arms on the drive; reverse on the recovery.",
      "Stay tall — don’t collapse into the handles when tired.",
      "Hit all 6 rounds; pace round 1 so round 6 still exists.",
    ],
    mistakes: [
      "Going anaerobic in round 1 then dying for the rest.",
      "Rower: early arm pull before the legs finish.",
      "Easy intervals that are still too hard — recover properly.",
    ],
    breath: "Hard: short forceful breaths. Easy: nasal if you can. Clock rules.",
  },
  "pull-through-rdl": {
    title: "Pull-through / Smith RDL",
    muscles: ["Hamstrings", "Glutes", "Erectors"],
    diagram: "hinge",
    cues: [
      "Soft knees, then push hips back — bar/rope travels close to legs.",
      "Feel stretch in hamstrings; spine stays long (neutral).",
      "Drive hips forward to stand; squeeze glutes at the top.",
      "Pull-through: rope between legs, hinge until torso ~45°, then snap hips.",
      "Shoulders packed; don’t round the upper back into the stretch.",
    ],
    mistakes: [
      "Squatting the weight (knees slide forward) instead of hinging.",
      "Rounding the low back to reach deeper.",
      "Hyperextending / over-arching at lockout.",
    ],
    breath: "Inhale into the hinge; brace and exhale as hips drive through. Tempo ~3-1-2.",
  },
  "seated-row": {
    title: "Seated cable / chest-supported row",
    muscles: ["Lats", "Rhomboids", "Rear delts", "Biceps"],
    diagram: "row",
    cues: [
      "Sit tall (or chest on pad); start with arms long, scapulae free.",
      "Initiate by driving elbows back — squeeze shoulder blades.",
      "Pull to lower ribs / upper abs depending on grip.",
      "Control the stretch forward without rounding or bouncing.",
      "Keep wrists neutral; don’t shrug traps to the ears.",
    ],
    mistakes: [
      "Using hip rock / lower-back heave to move the stack.",
      "Only bending elbows — no scapular retraction.",
      "Finishing with shrugged traps and a short ROM.",
    ],
    breath: "Exhale on the pull; inhale on the reach. Tempo ~2-1-3.",
  },
  "lat-pulldown": {
    title: "Lat pulldown",
    muscles: ["Lats", "Biceps", "Upper back"],
    diagram: "pulldown",
    cues: [
      "Grip slightly outside shoulders; lean back a touch (not a swing).",
      "Pull elbows down toward hips; bar to upper chest.",
      "Depress scapulae first — “pockets” the lats.",
      "Control the eccentric until arms are long overhead.",
      "Ribs down; don’t yank the bar behind the neck.",
    ],
    mistakes: [
      "Half-reps that never reach the chest or full stretch.",
      "Extreme lean-back / kip to move heavier weight.",
      "Pulling behind the neck (unnecessary shoulder risk).",
    ],
    breath: "Exhale pull down; inhale return. Tempo ~2-1-3.",
  },
  "hip-thrust": {
    title: "Hip thrust (machine / Smith)",
    muscles: ["Glutes", "Hamstrings", "Core"],
    diagram: "hipThrust",
    cues: [
      "Pad on hips; chin tucked slightly, eyes forward.",
      "Feet flat so shins are ~vertical at the top.",
      "Drive through heels; squeeze glutes hard at lockout.",
      "Ribs down — don’t fling into a big low-back arch.",
      "Lower under control until you feel a glute stretch.",
    ],
    mistakes: [
      "Overarching the lumbar to fake a higher lockout.",
      "Feet too far forward (hamstring cramp) or too close (quad-dominant).",
      "Partial lockouts with no glute squeeze.",
    ],
    breath: "Inhale down; brace and exhale hard at the squeeze. Pause 1 sec at top.",
  },
  "face-pulls": {
    title: "Face pulls (cable)",
    muscles: ["Rear delts", "External rotators", "Upper back"],
    diagram: "facePull",
    cues: [
      "Cable at upper-chest / face height; rope ends in each hand.",
      "Pull toward the face — elbows high, outside line of sight.",
      "Externally rotate at the end: hands beside ears, “show biceps.”",
      "Light–moderate load; own the end range.",
      "Slow return — don’t let the rope snap forward.",
    ],
    mistakes: [
      "Turning it into a heavy row with low elbows.",
      "Using so much weight you can’t rotate at the finish.",
      "Shrugging and jutting the head forward.",
    ],
    breath: "Exhale pull + rotate; inhale return. Tempo ~2-1-3, high reps.",
  },
  "farmer-carry": {
    title: "Farmer carry / sled",
    muscles: ["Grip", "Traps", "Core", "Legs"],
    diagram: "carry",
    cues: [
      "Stand tall: ribs stacked over pelvis, eyes forward.",
      "Short, quick steps — don’t waddle or overstride.",
      "Handles close to thighs; shoulders packed down.",
      "Sled: lean slightly into the harness; drive legs, keep arms long.",
      "Breathe in a rhythm; don’t hold a death-breath the whole distance.",
    ],
    mistakes: [
      "Rounded upper back and shrugged traps under load.",
      "Twisting torso or leaning hard to one side.",
      "Sled: bent-over “butt high” position with no leg drive.",
    ],
    breath: "Steady breathing every few steps. Reset posture every 10 m.",
  },
  "fin-incline-ski": {
    title: "Incline treadmill / ski-erg intervals",
    muscles: ["Glutes", "Calves", "Lungs", "Lats (ski)"],
    diagram: "intervals",
    cues: [
      "Hard 30 / easy 30 — easy must actually drop heart rate.",
      "Incline walk/run: slightly forward lean from ankles, not a hunch.",
      "Ski: hinge, plant poles/handles, then drive hips + arms together.",
      "Stay springy on the hard intervals; shake out on easy.",
      "Count rounds out loud if needed — finish all 6.",
    ],
    mistakes: [
      "Holding the treadmill rails and cheating posture.",
      "Ski: all arms, no hip hinge (low power, angry low back).",
      "Easy intervals still at hard pace.",
    ],
    breath: "Hard: match breath to steps/strokes. Easy: slow nasal recovery.",
  },
  "hack-squat": {
    title: "Hack squat / Smith squat",
    muscles: ["Quads", "Glutes", "Adductors"],
    diagram: "squat",
    cues: [
      "Shoulders and back flat on the pad; feet forward enough to hit depth.",
      "Break at knees and hips together; descend to at least parallel.",
      "Knees track over toes; push the floor away to stand.",
      "Keep heels down; don’t let the low back peel off the pad.",
      "Smith: bar path fixed — still own depth and knee tracking.",
    ],
    mistakes: [
      "Cutting depth high because the load is ego-heavy.",
      "Knees caving or heels lifting in the hole.",
      "Butt wink / rounding off the pad at the bottom.",
    ],
    breath: "Big belly breath at the top; hold brace down; exhale drive up. Tempo ~3-1-2.",
  },
  "shoulder-press": {
    title: "Seated shoulder press machine",
    muscles: ["Front/side delts", "Triceps", "Upper chest"],
    diagram: "shoulderPress",
    cues: [
      "Seat so handles start around chin / upper-chest height.",
      "Ribs down, low back gently into the pad — no big arch.",
      "Press up in a slight arc; don’t shrug into the ears.",
      "Lower until elbows are ~90° or handles at chin — controlled.",
      "Wrists stacked over elbows throughout.",
    ],
    mistakes: [
      "Bench-pressing with a huge lumbar arch to move more weight.",
      "Flaring elbows behind the plane of the torso awkwardly.",
      "Bouncing out of the bottom with no control.",
    ],
    breath: "Inhale down; exhale press. Tempo ~3-0-2.",
  },
  "leg-extension": {
    title: "Leg extension",
    muscles: ["Quads (esp. vastus medialis)"],
    diagram: "legExt",
    cues: [
      "Pad on lower shins; knees aligned with machine axis.",
      "Extend to full lockout and squeeze quads hard.",
      "Lower slowly to a deep stretch without slamming.",
      "Hips stay glued — no bouncing out of the seat.",
      "Ankles relaxed or slightly dorsiflexed; don’t point hard.",
    ],
    mistakes: [
      "Using momentum and swinging the stack.",
      "Partial lockouts with no peak contraction.",
      "Hips lifting / gripping the seat to cheat heavy loads.",
    ],
    breath: "Exhale extend; inhale lower. Tempo ~2-1-3 — own the squeeze.",
  },
  "single-arm-row": {
    title: "Single-arm cable / machine row",
    muscles: ["Lats", "Rhomboids", "Rear delts", "Core"],
    diagram: "singleRow",
    cues: [
      "Square hips/shoulders; slight athletic stance or seated square.",
      "Pull elbow to hip pocket; finish with a lat squeeze.",
      "Let the shoulder blade reach forward on the stretch.",
      "Resist rotating the torso — anti-rotate with the core.",
      "Match reps each arm; start with the weaker side.",
    ],
    mistakes: [
      "Twisting and heaving with the low back each rep.",
      "Shrugging the working shoulder to the ear.",
      "Tiny ROM — never reaching or never retracting.",
    ],
    breath: "Exhale pull; inhale reach. Tempo ~2-1-3.",
  },
  "pushdown-curl": {
    title: "Cable pushdown + cable curl",
    muscles: ["Triceps", "Biceps"],
    diagram: "arms",
    cues: [
      "Pushdown: elbows pinned to sides; only forearms move.",
      "Pushdown: full extension + squeeze; don’t lean into it.",
      "Curl: elbows slightly in front of torso; no shoulder swing.",
      "Curl: squeeze at the top; lower to a full stretch.",
      "Superset cleanly — same cable stack if available; rest as needed.",
    ],
    mistakes: [
      "Pushdown with elbows flaring and shoulders dominating.",
      "Curl swinging with hip drive / momentum.",
      "Partial reps that skip the hard lockout or stretch.",
    ],
    breath: "Exhale on the effort (push or curl); inhale on the lower. Tempo ~2-1-2.",
  },
  "knee-raise": {
    title: "Hanging knee raise / captain’s chair",
    muscles: ["Abs", "Hip flexors", "Grip (hang)"],
    diagram: "kneeRaise",
    cues: [
      "Dead hang or back flat on the chair pad; ribs slightly down.",
      "Curl pelvis toward ribs as knees rise — abs, not just hip flexors.",
      "Raise thighs above parallel if you can without swinging.",
      "Lower slowly; stop the pendulum before the next rep.",
      "Exhale at the top; keep shoulders packed (hanging).",
    ],
    mistakes: [
      "Wild swinging / kipping every rep.",
      "Only lifting knees with a hollow low back (pure hip flexor).",
      "Chin poking forward and shrugging hard.",
    ],
    breath: "Exhale raise + curl; inhale lower. Tempo ~2-1-3, no swing.",
  },
  "fin-circuit": {
    title: "Circuit finisher × 3",
    muscles: ["Full body", "Conditioning"],
    diagram: "circuit",
    cues: [
      "15 swings: hinge, snap hips, soft knees — arms are ropes.",
      "8 burpees: chest to floor (or hands), jump soft — keep moving.",
      "20 mountain climbers: count total taps; ribs down, steady hips.",
      "Rest 60 sec between rounds — walk, don’t collapse.",
      "Round 3 should still look like round 1 form, just slower.",
    ],
    mistakes: [
      "Swing: squatting instead of hinging, or hyperextending at the top.",
      "Burpees: worming the low back / incomplete plank.",
      "Mountain climbers: bouncing hips and holding breath.",
    ],
    breath: "Swing: exhale on the snap. Burpees/climbers: find a rhythm. Rest: recover.",
  },
};

/* ---------- diagram SVGs (viewBox 0 0 200 140) ---------- */
function formDiagramSVG(key) {
  const ink = "#94a3b8";
  const accent = "#F5C518";
  const strong = "#e2e8f0";
  const green = "#c8e06a";
  const muted = "#475569";

  const frame = (inner) =>
    `<svg class="form-diagram" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="200" height="140" rx="12" fill="#0d1320"/>
      <text x="10" y="16" fill="${muted}" font-size="9" font-family="system-ui">START</text>
      <text x="155" y="16" fill="${muted}" font-size="9" font-family="system-ui">FINISH</text>
      ${inner}
    </svg>`;

  const stick = {
    legPress: frame(`
      <path d="M30 110h50" stroke="${muted}" stroke-width="3"/>
      <rect x="28" y="70" width="44" height="28" rx="4" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="50" cy="62" r="6" fill="${strong}"/>
      <path d="M50 68v10M42 95l8-12 8 12M38 110l4-15M62 110l-4-15" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M85 85h20" stroke="${accent}" stroke-width="2" marker-end="url(#a)"/>
      <rect x="120" y="48" width="50" height="22" rx="4" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="40" r="6" fill="${strong}"/>
      <path d="M145 46v8M132 78l13-18 13 18M128 100l6-22M162 100l-6-22" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M118 100h64" stroke="${muted}" stroke-width="3"/>
      <circle cx="145" cy="70" r="3" fill="${green}"/>
    `),
    legCurl: frame(`
      <path d="M40 100h50" stroke="${muted}" stroke-width="3"/>
      <ellipse cx="65" cy="78" rx="28" ry="12" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="48" cy="70" r="5" fill="${strong}"/>
      <path d="M52 72h30M82 78v22M78 100h12" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 70h16" stroke="${accent}" stroke-width="2"/>
      <ellipse cx="145" cy="78" rx="28" ry="12" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="128" cy="70" r="5" fill="${strong}"/>
      <path d="M132 72h24M156 78c0 18-8 28-14 30" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="142" cy="108" r="4" fill="${green}"/>
    `),
    chestPress: frame(`
      <rect x="35" y="50" width="14" height="50" rx="2" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="55" cy="55" r="6" fill="${strong}"/>
      <path d="M55 61v28M48 72h20M68 72v8M48 88h8" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="72" y="68" width="18" height="8" rx="2" fill="${accent}" opacity="0.5"/>
      <path d="M100 75h14" stroke="${accent}" stroke-width="2"/>
      <rect x="125" y="50" width="14" height="50" rx="2" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="155" cy="50" r="6" fill="${strong}"/>
      <path d="M155 56v30M148 68h24M172 60v16M148 90h8" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="168" y="64" width="14" height="8" rx="2" fill="${green}"/>
    `),
    lunge: frame(`
      <circle cx="55" cy="40" r="6" fill="${strong}"/>
      <path d="M55 46v28M55 74l-18 30M55 74l22 16M37 104h14M77 90h12" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M55 58h16" stroke="${ink}" stroke-width="2"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="38" r="6" fill="${strong}"/>
      <path d="M145 44v26M145 70l-14 34M145 70l28 20M131 104h12M173 90h10" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M131 104l0-8" stroke="${green}" stroke-width="3"/>
    `),
    fly: frame(`
      <circle cx="50" cy="55" r="6" fill="${strong}"/>
      <path d="M50 61v34M35 70L20 55M65 70L80 55M42 95h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M22 52h-8M78 52h8" stroke="${ink}" stroke-width="2"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="55" r="6" fill="${strong}"/>
      <path d="M145 61v34M130 72l10-4M160 72l-10-4M137 95h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="145" cy="68" r="10" fill="none" stroke="${green}" stroke-width="2"/>
    `),
    crunch: frame(`
      <path d="M30 100h50" stroke="${muted}" stroke-width="2"/>
      <circle cx="45" cy="78" r="5" fill="${strong}"/>
      <path d="M48 82c12 0 28-4 36-2M45 83v18" stroke="${strong}" stroke-width="2.5" fill="none"/>
      <path d="M95 75h14" stroke="${accent}" stroke-width="2"/>
      <path d="M120 100h50" stroke="${muted}" stroke-width="2"/>
      <circle cx="148" cy="58" r="5" fill="${strong}"/>
      <path d="M145 62c-8 8-18 18-22 28M148 63c8 10 16 22 18 30" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M135 78c8 4 16 4 24 0" stroke="${green}" stroke-width="2" fill="none"/>
    `),
    hinge: frame(`
      <circle cx="55" cy="42" r="6" fill="${strong}"/>
      <path d="M55 48l8 22M63 70l-20 35M63 70l22 32M45 55h28" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M48 78h30" stroke="${ink}" stroke-width="3"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="36" r="6" fill="${strong}"/>
      <path d="M145 42v32M145 74l-16 30M145 74l16 30M130 55h30" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="145" cy="74" r="5" fill="${green}"/>
    `),
    row: frame(`
      <circle cx="70" cy="45" r="6" fill="${strong}"/>
      <path d="M70 51v40M55 70L30 62M85 70L95 78M62 91h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M28 58h-10" stroke="${ink}" stroke-width="2"/>
      <path d="M105 70h12" stroke="${accent}" stroke-width="2"/>
      <circle cx="150" cy="45" r="6" fill="${strong}"/>
      <path d="M150 51v40M135 68l-8 4M165 68l15-8M142 91h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M128 72h8" stroke="${green}" stroke-width="3"/>
    `),
    pulldown: frame(`
      <path d="M40 28h50" stroke="${ink}" stroke-width="3"/>
      <circle cx="65" cy="55" r="6" fill="${strong}"/>
      <path d="M50 28v20M80 28v20M65 61v35M55 96h20" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 60h14" stroke="${accent}" stroke-width="2"/>
      <path d="M120 28h50" stroke="${accent}" stroke-width="3"/>
      <circle cx="145" cy="70" r="6" fill="${strong}"/>
      <path d="M130 28v30M160 28v30M145 76v28M135 104h20" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M130 58h30" stroke="${green}" stroke-width="2.5"/>
    `),
    hipThrust: frame(`
      <rect x="35" y="78" width="40" height="12" rx="2" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="45" cy="70" r="5" fill="${strong}"/>
      <path d="M50 72h28M78 78v28M70 106h16M48 78v10" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M95 80h14" stroke="${accent}" stroke-width="2"/>
      <rect x="120" y="55" width="40" height="12" rx="2" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="130" cy="48" r="5" fill="${strong}"/>
      <path d="M135 50h28M163 58v28M155 86h16M133 58v8" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="148" cy="55" r="4" fill="${green}"/>
    `),
    facePull: frame(`
      <path d="M25 40h40" stroke="${ink}" stroke-width="2"/>
      <circle cx="80" cy="55" r="6" fill="${strong}"/>
      <path d="M80 61v35M65 70L40 48M95 70L110 75M72 96h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M115 65h12" stroke="${accent}" stroke-width="2"/>
      <path d="M135 40h40" stroke="${accent}" stroke-width="2"/>
      <circle cx="155" cy="58" r="6" fill="${strong}"/>
      <path d="M155 64v32M140 62l-5-8M170 62l5-8M147 96h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M138 50h8M164 50h8" stroke="${green}" stroke-width="2.5"/>
    `),
    carry: frame(`
      <circle cx="100" cy="36" r="6" fill="${strong}"/>
      <path d="M100 42v40M100 82l-14 28M100 82l14 28M86 55h-16M114 55h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="62" y="52" width="12" height="20" rx="2" fill="${accent}"/>
      <rect x="126" y="52" width="12" height="20" rx="2" fill="${accent}"/>
      <path d="M40 120h120" stroke="${muted}" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="M160 110l12-8 4 10" stroke="${green}" stroke-width="2" fill="none"/>
    `),
    squat: frame(`
      <circle cx="55" cy="36" r="6" fill="${strong}"/>
      <path d="M55 42v20M55 62l-16 42M55 62l16 42M42 55h26" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="48" r="6" fill="${strong}"/>
      <path d="M145 54v16M145 70l-22 40M145 70l22 40M125 62h40" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M123 110h44" stroke="${green}" stroke-width="2"/>
    `),
    shoulderPress: frame(`
      <circle cx="55" cy="70" r="6" fill="${strong}"/>
      <path d="M55 76v30M40 85L28 95M70 85L82 95M47 106h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="24" y="90" width="10" height="8" rx="1" fill="${ink}"/>
      <rect x="78" y="90" width="10" height="8" rx="1" fill="${ink}"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="48" r="6" fill="${strong}"/>
      <path d="M145 54v52M130 60L130 40M160 60L160 40M137 106h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="126" y="32" width="10" height="8" rx="1" fill="${green}"/>
      <rect x="154" y="32" width="10" height="8" rx="1" fill="${green}"/>
    `),
    legExt: frame(`
      <rect x="40" y="55" width="36" height="40" rx="4" fill="none" stroke="${ink}" stroke-width="2"/>
      <circle cx="52" cy="48" r="5" fill="${strong}"/>
      <path d="M55 52v20M58 78l24 4M82 82v20" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 75h14" stroke="${accent}" stroke-width="2"/>
      <rect x="120" y="55" width="36" height="40" rx="4" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="132" cy="48" r="5" fill="${strong}"/>
      <path d="M135 52v20M138 72l8-22M146 50h8" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="150" cy="48" r="3" fill="${green}"/>
    `),
    singleRow: frame(`
      <circle cx="70" cy="48" r="6" fill="${strong}"/>
      <path d="M70 54v40M58 72L35 68M82 72L95 78M62 94h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M32 65h-12" stroke="${ink}" stroke-width="2"/>
      <path d="M105 70h12" stroke="${accent}" stroke-width="2"/>
      <circle cx="150" cy="48" r="6" fill="${strong}"/>
      <path d="M150 54v40M138 70l-18 2M162 70l12 6M142 94h16" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="128" cy="70" r="3" fill="${green}"/>
    `),
    arms: frame(`
      <circle cx="50" cy="50" r="5" fill="${strong}"/>
      <path d="M50 55v20M40 70L28 55M60 70L72 85" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="30" y="108" fill="${ink}" font-size="10" font-family="system-ui">Pushdown</text>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <circle cx="150" cy="50" r="5" fill="${strong}"/>
      <path d="M150 55v20M140 70L128 85M160 70L172 55" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <text x="128" y="108" fill="${accent}" font-size="10" font-family="system-ui">Curl</text>
    `),
    kneeRaise: frame(`
      <path d="M50 25v15M40 25h20" stroke="${ink}" stroke-width="2"/>
      <circle cx="50" cy="50" r="5" fill="${strong}"/>
      <path d="M50 55v35M50 90l-8 20M50 90l8 20" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M95 70h14" stroke="${accent}" stroke-width="2"/>
      <path d="M145 25v15M135 25h20" stroke="${accent}" stroke-width="2"/>
      <circle cx="145" cy="50" r="5" fill="${strong}"/>
      <path d="M145 55v25M145 80l-18 8M145 80l18 8" stroke="${strong}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M127 88h36" stroke="${green}" stroke-width="2"/>
    `),
    intervals: frame(`
      <path d="M30 100h140" stroke="${muted}" stroke-width="2"/>
      <path d="M40 100V60h18V100M70 100V45h18V100M100 100V70h18V100M130 100V40h18V100" fill="${accent}" opacity="0.35" stroke="${accent}" stroke-width="1"/>
      <text x="42" y="55" fill="${strong}" font-size="8" font-family="system-ui">H</text>
      <text x="72" y="40" fill="${strong}" font-size="8" font-family="system-ui">E</text>
      <text x="102" y="65" fill="${strong}" font-size="8" font-family="system-ui">E</text>
      <text x="132" y="35" fill="${green}" font-size="8" font-family="system-ui">H</text>
      <text x="55" y="120" fill="${muted}" font-size="9" font-family="system-ui">Hard / Easy intervals</text>
    `),
    circuit: frame(`
      <circle cx="50" cy="55" r="22" fill="none" stroke="${ink}" stroke-width="2"/>
      <text x="42" y="58" fill="${strong}" font-size="11" font-family="system-ui">SW</text>
      <circle cx="100" cy="55" r="22" fill="none" stroke="${accent}" stroke-width="2"/>
      <text x="90" y="58" fill="${strong}" font-size="11" font-family="system-ui">BU</text>
      <circle cx="150" cy="55" r="22" fill="none" stroke="${green}" stroke-width="2"/>
      <text x="140" y="58" fill="${strong}" font-size="11" font-family="system-ui">MC</text>
      <path d="M72 55h6M122 55h6" stroke="${muted}" stroke-width="2"/>
      <text x="35" y="100" fill="${muted}" font-size="9" font-family="system-ui">15 swings → 8 burpees → 20 climbers</text>
      <text x="55" y="118" fill="${ink}" font-size="9" font-family="system-ui">× 3 rounds · 60s rest</text>
    `),
  };

  return stick[key] || stick.squat;
}


const FORM_IMAGE_MODES = {
  "leg-press": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "leg-curl": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "chest-press": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "lunges": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "pec-deck": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "crunch": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "pull-through-rdl": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "seated-row": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "lat-pulldown": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "hip-thrust": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "face-pulls": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "farmer-carry": {
    "mode": "single",
    "labels": [
      "Demo"
    ]
  },
  "hack-squat": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "shoulder-press": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "leg-extension": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "single-arm-row": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "pushdown-curl": {
    "mode": "dual",
    "labels": [
      "Pushdown",
      "Curl"
    ]
  },
  "knee-raise": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  },
  "fin-bike-rower": {
    "mode": "dual",
    "labels": [
      "Bike",
      "Rower"
    ]
  },
  "fin-incline-ski": {
    "mode": "single",
    "labels": [
      "Demo"
    ]
  },
  "fin-circuit": {
    "mode": "sf",
    "labels": [
      "START",
      "FINISH"
    ]
  }
};

function exerciseImagePaths(formId) {
  return {
    sf: "images/exercises/" + formId + "-sf.png",
    thumb: "images/exercises/" + formId + "-thumb.png",
  };
}

function formVisualHTML(formId, g) {
  const paths = exerciseImagePaths(formId);
  const meta = FORM_IMAGE_MODES[formId] || { mode: "sf", labels: ["START", "FINISH"] };
  const labels = meta.labels || [];
  const mode = meta.mode || "sf";
  let altExtra = "form diagram";
  if (mode === "sf") altExtra = "start and finish";
  else if (mode === "single") altExtra = (labels[0] || "Demo").toLowerCase() + " diagram";
  else altExtra = labels.join(" / ");
  // No stick-SVG fallback — Everkinetic PNGs are the only visuals.
  return '<div class="form-photo-wrap" data-visual-mode="' + mode + '">' +
    '<img class="form-photo" src="' + paths.sf + '" alt="' + g.title + ' — ' + altExtra + '" ' +
    'loading="eager" decoding="async" />' +
    '</div>';
}

function exThumbHTML(formId, alt) {
  if (!formId) return "";
  const thumb = exerciseImagePaths(formId).thumb;
  return '<div class="ex-thumb-wrap">' +
    '<img class="ex-thumb" src="' + thumb + '" alt="" width="56" height="56" loading="lazy" decoding="async" />' +
    '</div>';
}

function formBtnHTML(formId, compact) {
  if (!formId || !FORM_GUIDES[formId]) return "";
  const cls = compact ? "form-btn form-btn-sm" : "form-btn";
  return `<button type="button" class="${cls}" data-form="${formId}" aria-label="Form guide">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7.5v.5"/>
    </svg>
    ${compact ? "" : "<span>Form</span>"}
  </button>`;
}

function openFormGuide(formId) {
  const g = FORM_GUIDES[formId];
  if (!g) return;
  const sheet = document.getElementById("formSheet");
  const backdrop = document.getElementById("formBackdrop");
  if (!sheet || !backdrop) return;

  document.getElementById("formSheetTitle").textContent = g.title;
  document.getElementById("formSheetDiagram").innerHTML = formVisualHTML(formId, g);
  document.getElementById("formSheetMuscles").innerHTML = (g.muscles || [])
    .map((m) => `<span class="form-muscle">${m}</span>`)
    .join("");
  document.getElementById("formSheetCues").innerHTML = g.cues
    .map((c) => `<li>${c}</li>`)
    .join("");
  document.getElementById("formSheetMistakes").innerHTML = g.mistakes
    .map((m) => `<li>${m}</li>`)
    .join("");
  const breath = document.getElementById("formSheetBreath");
  if (g.breath) {
    breath.textContent = g.breath;
    breath.parentElement.classList.remove("hidden");
  } else {
    breath.parentElement.classList.add("hidden");
  }

  backdrop.classList.remove("hidden");
  sheet.classList.remove("hidden");
  requestAnimationFrame(() => {
    backdrop.classList.add("open");
    sheet.classList.add("open");
  });
  sheet.setAttribute("aria-hidden", "false");
}

function closeFormGuide() {
  const sheet = document.getElementById("formSheet");
  const backdrop = document.getElementById("formBackdrop");
  if (!sheet || !backdrop) return;
  backdrop.classList.remove("open");
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    backdrop.classList.add("hidden");
    sheet.classList.add("hidden");
  }, 220);
}

function bindFormGuideUI() {
  document.getElementById("formSheetClose")?.addEventListener("click", closeFormGuide);
  document.getElementById("formBackdrop")?.addEventListener("click", closeFormGuide);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-form]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openFormGuide(btn.dataset.form);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFormGuide();
  });
}
