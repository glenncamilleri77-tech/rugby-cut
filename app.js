/* Rugby Cut — Glenn's athlete profiles (localStorage, offline) */
/* DATA RULE: history is ADDITIVE-ONLY. Never clear localStorage, never rename
   rugbycut_* keys, never require a wipe. New features may only add OPTIONAL
   fields to stored objects (e.g. v10 added startedAt / calories /
   caloriesManual / caloriesMeta on workout sessions) and must render old
   objects that lack them. */


/* ---------- active profile ---------- */
const STORAGE = {
  profile: "rugbycut_profile",
  rotationMap: "rugbycut_rotation_map",   // { profileId: "A"|"B"|"C" }
  selectedMap: "rugbycut_selected_map",
  weights: "rugbycut_weights",
  workouts: "rugbycut_workouts",
  batch: "rugbycut_batch",               // keyed later per profile in renderDiet
  lastLoads: "rugbycut_last_loads",
  progressScope: "rugbycut_progress_scope", // "current" | "all"
  draftSessions: "rugbycut_draft_sessions",
};

function getProfileId() {
  const id = localStorage.getItem(STORAGE.profile);
  return PROFILES[id] ? id : "chabal";
}
function setProfileId(id) {
  if (!PROFILES[id]) return;
  localStorage.setItem(STORAGE.profile, id);
}
function getProfile() {
  return PROFILES[getProfileId()];
}
function activeDays() {
  return getProfile().days;
}
function activeMeals() {
  return getProfile().meals;
}
function activeBatch() {
  return getProfile().batch;
}
function activeCoachRotation() {
  return getProfile().coachRotation;
}

function applyProfileUI() {
  const p = getProfile();
  const sub = document.getElementById("brandSub");
  if (sub) sub.textContent = `Glenn · ${p.name}`;
  const chip = document.getElementById("profileChip");
  if (chip) chip.textContent = p.name;
  const set = (id, val, html=false) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (html) el.innerHTML = val;
    else el.textContent = val;
  };
  set("planTitle", p.planTitle);
  set("planGoal", p.planGoal);
  set("planMeta", p.planMeta);
  const chips = document.getElementById("planChips");
  if (chips) chips.innerHTML = (p.planChips || []).map((c) => `<span class="chip">${c}</span>`).join("");
  set("proteinBadge", p.proteinBadge);
  set("proteinTarget", p.proteinTarget);
  set("proteinNote", p.proteinNote);
  set("preGymTitle", p.preGymTitle);
  set("preGymBody", p.preGymBody, true);
  document.querySelectorAll(".scope-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.scope === getProgressScope());
  });
}

function openProfileSheet() {
  const body = document.getElementById("profileSheetBody");
  const sheet = document.getElementById("profileSheet");
  const backdrop = document.getElementById("profileBackdrop");
  if (!body || !sheet) return;
  const active = getProfileId();
  body.innerHTML = PROFILE_ORDER.map((id) => {
    const p = PROFILES[id];
    return `<button type="button" class="profile-card${id === active ? " active" : ""}" data-profile="${id}">
      <div class="profile-card-top">
        <h3>${p.name}</h3>
        ${id === active ? '<span class="pill">Active</span>' : `<span class="pill" style="background:transparent;color:var(--muted);border:1px solid var(--border)">${p.short}</span>`}
      </div>
      <p class="tagline">${p.tagline}</p>
      <p class="blurb">${p.blurb}</p>
      <div class="chips">${p.chips.map((c) => `<span>${c}</span>`).join("")}</div>
    </button>`;
  }).join("");
  body.querySelectorAll("[data-profile]").forEach((btn) => {
    btn.addEventListener("click", () => selectProfile(btn.dataset.profile));
  });
  backdrop.classList.remove("hidden");
  sheet.classList.remove("hidden");
  requestAnimationFrame(() => {
    backdrop.classList.add("open");
    sheet.classList.add("open");
  });
  sheet.setAttribute("aria-hidden", "false");
}

function closeProfileSheet() {
  const sheet = document.getElementById("profileSheet");
  const backdrop = document.getElementById("profileBackdrop");
  if (!sheet || !backdrop) return;
  backdrop.classList.remove("open");
  sheet.classList.remove("open");
  sheet.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    backdrop.classList.add("hidden");
    sheet.classList.add("hidden");
  }, 220);
}

function selectProfile(id) {
  if (!PROFILES[id] || id === getProfileId()) {
    closeProfileSheet();
    return;
  }
  setProfileId(id);
  initRotationFromWeekday();
  applyProfileUI();
  renderNextWorkout();
  renderDiet();
  renderPlans();
  renderProgress();
  closeProfileSheet();
  showToast(`Switched to ${PROFILES[id].name}`);
  switchView("workout");
}


/* ---------- storage helpers ---------- */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/* ---------- burnt calories (v10, additive) ----------
   Optional fields on a workout session (old sessions simply lack them):
     startedAt      ISO string, set when a NEW session is created (timed duration)
     calories       number, latest estimate (kcal) saved at Finish / Done editing
     caloriesManual number|null, Glenn's own override; wins over the estimate
     caloriesMeta   { met, bodyKg, bodyKgSource, minutes, durationSource, exercisesDone }
   Effective value shown everywhere = caloriesManual ?? calories ?? live estimate. */
const KCAL_DEFAULT_BODY_KG = 110;     // Glenn's starting weight, used if no weigh-in logged
const KCAL_DEFAULT_MINUTES = 50;      // typical machine session when nothing to go on
const KCAL_BASE_MET = 5.0;            // moderate resistance-machine circuit (Compendium ~5)
const KCAL_MAX_MET = 6.0;

// Latest logged body weight on/before `onDate` (falls back to latest overall, then 110 kg default)
function bodyWeightFor(onDate) {
  const weights = loadJSON(STORAGE.weights, []);
  const list = (Array.isArray(weights) ? weights : [])
    .filter((w) => w && Number(w.kg) > 0)
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (!list.length) return { kg: KCAL_DEFAULT_BODY_KG, source: "default" };
  const cutoff = onDate ? new Date(onDate).getTime() : Infinity;
  const before = list.filter((w) => new Date(w.date).getTime() <= cutoff);
  const pick = (before.length ? before : list)[(before.length ? before : list).length - 1];
  return { kg: Number(pick.kg), source: "logged" };
}

function countDoneExercises(session) {
  const arr = exercisesToArray(normalizeExercises(session && session.exercises));
  return arr.filter((e) => e.savedAt || (e.sets || []).some((s) => s && (s.done || s.weight || s.reps))).length;
}

/* THE calorie formula — one place, deliberately simple:
     kcal ≈ MET × bodyKg × hours
   - bodyKg: last logged body weight (else 110 kg default)
   - hours:  startedAt → finish time if both exist and look sane (10–150 min),
             else estimated: 30 min + 4 min per exercise done, clamped 40–65 min
             (50 min if nothing saved)
   - MET:    5.0 base, +0.15 per exercise done beyond 4, capped at 6.0
   It's a rough estimate, NOT a wearable reading. */
function estimateSessionCalories(session, finishedAtIso) {
  const done = countDoneExercises(session);
  const body = bodyWeightFor(session && (session.startedAt || session.dateKey || session.date));
  let minutes = null;
  let durationSource = "estimated";
  const end = finishedAtIso || (session && session.completedAt);
  if (session && session.startedAt && end) {
    const m = (new Date(end) - new Date(session.startedAt)) / 60000;
    if (m >= 10 && m <= 150) {
      minutes = Math.round(m);
      durationSource = "timed";
    }
  }
  if (minutes == null) {
    minutes = done ? Math.min(65, Math.max(40, 30 + 4 * done)) : KCAL_DEFAULT_MINUTES;
  }
  const met = Math.min(KCAL_MAX_MET, KCAL_BASE_MET + 0.15 * Math.max(0, done - 4));
  const kcal = Math.round(met * body.kg * (minutes / 60));
  return {
    kcal,
    meta: {
      met: Math.round(met * 100) / 100,
      bodyKg: body.kg,
      bodyKgSource: body.source,
      minutes,
      durationSource,
      exercisesDone: done,
    },
  };
}

// Effective kcal for display: manual override > stored estimate > live estimate (completed only)
function sessionCalories(w) {
  if (!w) return null;
  const manual = Number(w.caloriesManual);
  if (w.caloriesManual != null && w.caloriesManual !== "" && manual > 0) {
    return { kcal: Math.round(manual), manual: true, stored: true, meta: w.caloriesMeta || null };
  }
  const stored = Number(w.calories);
  if (w.calories != null && stored > 0) {
    return { kcal: Math.round(stored), manual: false, stored: true, meta: w.caloriesMeta || null };
  }
  if (!w.completedAt) return null;
  const est = estimateSessionCalories(w);
  return { kcal: est.kcal, manual: false, stored: false, meta: est.meta };
}

function kcalLabel(info) {
  if (!info) return "";
  return info.manual ? `${info.kcal} kcal` : `~${info.kcal} kcal (est.)`;
}

function kcalBasisText(meta) {
  if (!meta) return "";
  const kg = meta.bodyKgSource === "logged"
    ? `using last logged body weight ${Number(meta.bodyKg).toFixed(1)} kg`
    : `using ${KCAL_DEFAULT_BODY_KG} kg default`;
  const dur = meta.durationSource === "timed" ? `${meta.minutes} min timed` : `~${meta.minutes} min estimate`;
  return `MET ${meta.met} × ${kg} × ${dur}`;
}

function nextLetter(cur) {
  return { A: "B", B: "C", C: "A" }[cur] || "A";
}

function getRotationMap() {
  return loadJSON(STORAGE.rotationMap, {});
}
function getRotation() {
  const v = getRotationMap()[getProfileId()];
  return v === "A" || v === "B" || v === "C" ? v : "A";
}
function setRotation(letter) {
  const map = getRotationMap();
  map[getProfileId()] = letter;
  saveJSON(STORAGE.rotationMap, map);
}

function getSelectedMap() {
  return loadJSON(STORAGE.selectedMap, {});
}
function getSelected() {
  const s = getSelectedMap()[getProfileId()];
  return s === "A" || s === "B" || s === "C" ? s : getRotation();
}
function setSelected(letter) {
  const map = getSelectedMap();
  map[getProfileId()] = letter;
  saveJSON(STORAGE.selectedMap, map);
}

function getProgressScope() {
  return localStorage.getItem(STORAGE.progressScope) === "all" ? "all" : "current";
}
function setProgressScope(scope) {
  localStorage.setItem(STORAGE.progressScope, scope === "all" ? "all" : "current");
}

function migrateLegacyStorage() {
  // One-time: migrate flat rotation/selected/workouts into profile-aware shape
  const legacyRot = localStorage.getItem("rugbycut_rotation");
  const legacySel = localStorage.getItem("rugbycut_selected");
  if (legacyRot && !localStorage.getItem(STORAGE.rotationMap)) {
    saveJSON(STORAGE.rotationMap, { chabal: legacyRot });
  }
  if (legacySel && !localStorage.getItem(STORAGE.selectedMap)) {
    saveJSON(STORAGE.selectedMap, { chabal: legacySel });
  }
  const workouts = loadJSON(STORAGE.workouts, []);
  let changed = false;
  workouts.forEach((w) => {
    if (!w.profileId) {
      w.profileId = "chabal";
      changed = true;
    }
  });
  if (changed) saveJSON(STORAGE.workouts, workouts);
  if (!localStorage.getItem(STORAGE.profile)) setProfileId("chabal");
}


/* ---------- icons (SVG) ---------- */
function exIcon(type) {
  const paths = {
    legs: '<path d="M8 4v6l-2 10h3l1.5-6L12 20h3l-2-10V4H8zM14 4h4v4l2 12h-3l-1-6-1 6h-3l2-12V4z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
    push: '<path d="M6 14h12M8 10l4-4 4 4M12 6v12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    pull: '<path d="M6 10h12M8 14l4 4 4-4M12 18V6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    hinge: '<path d="M5 18h14M8 18V9l4-4 4 4v9" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    core: '<circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M9 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    carry: '<path d="M7 8v10M17 8v10M5 8h4M15 8h4M9 12h6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
    arms: '<path d="M5 12c2-4 4-4 6 0s4 4 6 0" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>',
    fin: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/>',
  };
  const p = paths[type] || paths.legs;
  return `<svg viewBox="0 0 24 24" width="22" height="22">${p}</svg>`;
}

function dotsHTML(n) {
  let html = '<span class="dots" aria-label="difficulty">';
  for (let i = 1; i <= 4; i++) {
    html += `<span class="dot${i <= n ? " on" : ""}"></span>`;
  }
  return html + "</span>";
}

/* ---------- render workout tab ---------- */
function renderNextWorkout() {
  const letter = getSelected();
  const day = activeDays()[letter];
  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.day === letter);
  });

  const noteEl = document.getElementById("coachNote");
  const idx = (letter.charCodeAt(0) - 65) % activeCoachRotation().length;
  noteEl.textContent = day.coach || activeCoachRotation()[idx];

  const card = document.getElementById("nextWorkoutCard");
  let list = day.exercises
    .map(
      (ex) => `
    <li class="ex-item">
      ${exThumbHTML(ex.formId, ex.name) || `<div class="ex-icon">${exIcon(ex.icon)}</div>`}
      <div class="ex-info">
        <h4>${ex.name}</h4>
        <div class="ex-meta">
          <span class="ex-sets">${ex.sets}×${ex.reps}</span>
          ${dotsHTML(ex.difficulty)}
          <span class="muscle-tag">${ex.muscle}</span>
        </div>
      </div>
      ${formBtnHTML(ex.formId)}
    </li>`
    )
    .join("");

  list += `
    <li class="ex-item finisher">
      ${exThumbHTML(day.finisher.formId, day.finisher.name) || `<div class="ex-icon">${exIcon("fin")}</div>`}
      <div class="ex-info">
        <h4>Finisher · ${day.finisher.name}</h4>
        <div class="ex-meta">
          <span class="ex-sets">${day.finisher.detail}</span>
        </div>
      </div>
      ${formBtnHTML(day.finisher.formId)}
    </li>`;

  card.innerHTML = `
    <div class="workout-card-head">
      <div>
        <h3>Day ${letter} — ${day.title}</h3>
        <p>${day.focus} · ${getProfile().planMeta}</p>
      </div>
      <div class="day-letter">${letter}</div>
    </div>
    <ul class="ex-list">${list}</ul>`;
}

/* ---------- diet ---------- */
function renderDiet() {
  const list = document.getElementById("mealList");
  list.innerHTML = activeMeals().map(
    (m) => `
    <div class="meal-item${m.highlight ? " highlight" : ""}">
      <div class="meal-time">${m.time}</div>
      <div>
        <h4>${m.title}</h4>
        <p>${m.detail}</p>
      </div>
    </div>`
  ).join("");

  const checked = loadJSON(STORAGE.batch, {})[getProfileId()] || {};
  const batch = document.getElementById("batchList");
  batch.innerHTML = activeBatch().map((item, i) => {
    const id = `batch_${i}`;
    return `
      <label class="check-row">
        <input type="checkbox" class="check-box" data-batch="${i}" ${checked[i] ? "checked" : ""} />
        <span>${item}</span>
      </label>`;
  }).join("");

  batch.querySelectorAll("[data-batch]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const all = loadJSON(STORAGE.batch, {});
      const state = all[getProfileId()] || {};
      state[cb.dataset.batch] = cb.checked;
      all[getProfileId()] = state;
      saveJSON(STORAGE.batch, all);
    });
  });
}

/* ---------- plans ---------- */
function renderPlans() {
  const grid = document.getElementById("planGrid");
  const preview = document.getElementById("planPreview");
  const body = document.getElementById("planPreviewBody");

  grid.classList.remove("hidden");
  preview.classList.add("hidden");

  grid.innerHTML = ["A", "B", "C"]
    .map((L) => {
      const d = activeDays()[L];
      return `
      <button type="button" class="plan-day-card" data-preview="${L}">
        <div class="pd-top">
          <div class="day-letter">${L}</div>
          <div>
            <h3>Day ${L} — ${d.title}</h3>
            <p>${d.focus}</p>
          </div>
          <span class="ex-count">${d.exercises.length} + finisher</span>
        </div>
      </button>`;
    })
    .join("");

  grid.querySelectorAll("[data-preview]").forEach((btn) => {
    btn.addEventListener("click", () => showPlanPreview(btn.dataset.preview));
  });
}

function showPlanPreview(letter) {
  const d = activeDays()[letter];
  const grid = document.getElementById("planGrid");
  const preview = document.getElementById("planPreview");
  const body = document.getElementById("planPreviewBody");

  grid.classList.add("hidden");
  preview.classList.remove("hidden");

  body.innerHTML = `
    <div class="workout-card-head" style="padding:0 0 12px;border:none">
      <div>
        <h3>Day ${letter} — ${d.title}</h3>
        <p>${d.focus}</p>
      </div>
      <div class="day-letter">${letter}</div>
    </div>
    <ul class="ex-list" style="margin:0 -16px">
      ${d.exercises
        .map(
          (ex) => `
        <li class="ex-item">
          ${exThumbHTML(ex.formId, ex.name) || `<div class="ex-icon">${exIcon(ex.icon)}</div>`}
          <div class="ex-info">
            <h4>${ex.name}</h4>
            <div class="ex-meta">
              <span class="ex-sets">${ex.sets}×${ex.reps}</span>
              ${dotsHTML(ex.difficulty)}
              <span class="muscle-tag">${ex.muscle}</span>
            </div>
          </div>
          ${formBtnHTML(ex.formId)}
        </li>`
        )
        .join("")}
      <li class="ex-item finisher">
        ${exThumbHTML(d.finisher.formId, d.finisher.name) || `<div class="ex-icon">${exIcon("fin")}</div>`}
        <div class="ex-info">
          <h4>Finisher · ${d.finisher.name}</h4>
          <div class="ex-meta"><span class="ex-sets">${d.finisher.detail}</span></div>
        </div>
        ${formBtnHTML(d.finisher.formId)}
      </li>
    </ul>
    <button type="button" class="btn-start" style="margin-top:16px" id="previewStart">
      Start Day ${letter}
    </button>`;

  document.getElementById("previewStart").addEventListener("click", () => {
    setSelected(letter);
    renderNextWorkout();
    switchView("workout");
    openSession(letter);
  });
}

/* ---------- progress ---------- */
function renderProgress() {
  renderKcalSummary();
  renderCalendar();
  renderWeightLog();
  renderExerciseProgress();
  renderWorkoutLog();
}

// Progress summary: kcal this week (Mon-start) / this month / last 30 days, all profiles
function renderKcalSummary() {
  const el = document.getElementById("kcalSummary");
  if (!el) return;
  const workouts = loadJSON(STORAGE.workouts, []);
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekK = dateKey(weekStart);
  const monthK = dateKey(monthStart);
  const todayK = dateKey(now);
  const agg = { week: 0, weekN: 0, month: 0, monthN: 0, anyEst: false };
  (Array.isArray(workouts) ? workouts : []).forEach((w) => {
    if (!w || !w.completedAt) return;
    const info = sessionCalories(w);
    if (!info) return;
    const k = w.dateKey || dateKey(w.date);
    if (k > todayK) return;
    if (k >= weekK) { agg.week += info.kcal; agg.weekN++; }
    if (k >= monthK) { agg.month += info.kcal; agg.monthN++; }
    if (!info.manual && (k >= weekK || k >= monthK)) agg.anyEst = true;
  });
  const avg = agg.monthN ? Math.round(agg.month / agg.monthN) : 0;
  const body = bodyWeightFor();
  el.innerHTML = `
    <div class="kcal-sum-grid">
      <div class="kcal-sum-cell"><span class="kcal-sum-label">This week</span>
        <strong>${agg.week ? "~" + agg.week.toLocaleString("en-GB") : "0"}</strong><span class="kcal-sum-sub">kcal · ${agg.weekN} session${agg.weekN === 1 ? "" : "s"}</span></div>
      <div class="kcal-sum-cell"><span class="kcal-sum-label">${now.toLocaleDateString("en-GB", { month: "long" })}</span>
        <strong>${agg.month ? "~" + agg.month.toLocaleString("en-GB") : "0"}</strong><span class="kcal-sum-sub">kcal · ${agg.monthN} session${agg.monthN === 1 ? "" : "s"}</span></div>
      <div class="kcal-sum-cell"><span class="kcal-sum-label">Avg / session</span>
        <strong>${avg ? "~" + avg : "—"}</strong><span class="kcal-sum-sub">kcal this month</span></div>
    </div>
    <p class="kcal-sum-note">Estimates (MET ≈ 5–6 × body kg × hours), not a wearable. ${
      body.source === "logged"
        ? `Using last logged body weight ${body.kg.toFixed(1)} kg.`
        : `Using ${KCAL_DEFAULT_BODY_KG} kg default — log a weigh-in to refine.`
    } Manual entries override.</p>`;
}

function renderWeightLog() {
  const weights = loadJSON(STORAGE.weights, []);
  const wEl = document.getElementById("weightLog");
  if (!weights.length) {
    wEl.innerHTML = '<p class="empty">No entries yet. Log your first weigh-in.</p>';
  } else {
    wEl.innerHTML = weights
      .slice()
      .reverse()
      .slice(0, 12)
      .map(
        (w) => `
      <div class="log-row">
        <span class="date">${formatDate(w.date)}</span>
        <span class="val">${Number(w.kg).toFixed(1)} kg</span>
      </div>`
      )
      .join("");
  }
}

function renderWorkoutLog() {
  const workouts = loadJSON(STORAGE.workouts, []);
  const woEl = document.getElementById("workoutLog");
  if (!workouts.length) {
    woEl.innerHTML = '<p class="empty">No workouts logged yet.</p>';
  } else {
    woEl.innerHTML = workouts
      .slice()
      .reverse()
      .slice(0, 20)
      .map((w) => {
        const exArr = exercisesToArray(normalizeExercises(w.exercises));
        const n = exArr.filter((e) => e.sets?.some((s) => s.done || s.weight || s.reps)).length;
        const extra = exArr.length ? ` · ${n} exercises logged` : "";
        const status = w.completedAt ? "" : " · draft";
        const pname = w.profileName || (PROFILES[w.profileId || "chabal"] || {}).name || "";
        const kc = kcalLabel(sessionCalories(w));
        return `
      <div class="log-row">
        <span class="date">${formatDate(w.date)}</span>
        <span class="tag">${pname ? pname + " · " : ""}Day ${w.day}${extra}${kc ? " · " + kc : ""}${status}</span>
      </div>`;
      })
      .join("");
  }
}

function workoutsByDateKey() {
  const map = {};
  loadJSON(STORAGE.workouts, []).forEach((w) => {
    const k = dateKey(w.date);
    if (!map[k]) map[k] = [];
    map[k].push(w);
  });
  return map;
}

function renderCalendar() {
  const label = document.getElementById("calMonthLabel");
  const grid = document.getElementById("calGrid");
  if (!label || !grid) return;

  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  label.textContent = calCursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const first = new Date(year, month, 1);
  // Monday-first: getDay Sun=0 → convert
  let startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const byDate = workoutsByDateKey();
  const todayK = dateKey(new Date());

  const cells = [];
  for (let i = 0; i < startPad; i++) {
    const d = prevDays - startPad + i + 1;
    cells.push(`<button type="button" class="cal-day muted" disabled>${d}</button>`);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const k = dateKey(dt);
    const sessions = byDate[k] || [];
    const letters = [...new Set(sessions.map((s) => s.day))].join("");
    const cls = [
      "cal-day",
      sessions.length ? "has-workout" : "",
      k === todayK ? "today" : "",
      k === calSelectedKey ? "selected" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const mark = sessions.length
      ? letters
        ? `<span class="cal-badge">${letters}</span>`
        : `<span class="cal-dot"></span>`
      : "";
    cells.push(
      `<button type="button" class="${cls}" data-date="${k}" aria-label="${k}">${d}${mark}</button>`
    );
  }
  while (cells.length % 7 !== 0) {
    cells.push(`<button type="button" class="cal-day muted" disabled></button>`);
  }
  grid.innerHTML = cells.join("");
  grid.querySelectorAll(".cal-day[data-date]").forEach((btn) => {
    btn.addEventListener("click", () => {
      calSelectedKey = btn.dataset.date;
      renderCalendar();
      renderCalDetail(calSelectedKey);
    });
  });
  renderCalDetail(calSelectedKey);
}

function renderCalDetail(key) {
  const el = document.getElementById("calDetail");
  if (!el) return;
  const sessions = (workoutsByDateKey()[key] || []).slice().reverse();
  if (!sessions.length) {
    el.innerHTML = `<p class="empty">No session on ${key}. Tap a yellow-marked day.</p>`;
    return;
  }
  el.innerHTML =
    `<h4>${key}</h4>` +
    sessions
      .map((w) => {
        const time = new Date(w.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const pid = w.profileId || "chabal";
        const pname = w.profileName || (PROFILES[pid] && PROFILES[pid].name) || pid;
        const dayMeta = (PROFILES[pid] && PROFILES[pid].days[w.day]) || activeDays()[w.day];
        const exList = exercisesToArray(normalizeExercises(w.exercises));
        let exLines = "";
        if (exList.length) {
          exLines =
            `<div class="ex-mini">` +
            exList
              .map((ex) => {
                const bits = (ex.sets || [])
                  .filter((s) => s.done || s.weight || s.reps)
                  .map((s) => {
                    if (s.weight && s.reps) return `${s.weight}×${s.reps}`;
                    if (s.reps) return `${s.reps} reps`;
                    if (s.weight) return `${s.weight} kg`;
                    return s.done ? "✓" : "";
                  })
                  .filter(Boolean)
                  .join(", ");
                return `<div><strong>${ex.name}</strong>${bits ? ` — ${bits}` : " — (no sets)"}</div>`;
              })
              .join("") +
            `</div>`;
        }
        const status = w.completedAt ? "Complete" : "In progress";
        const kc = sessionCalories(w);
        const kcLine = kc
          ? `<div class="kcal-line"><span class="kcal-pill${kc.manual ? " manual" : ""}">🔥 ${kcalLabel(kc)}</span>${
              kc.manual ? '<span class="kcal-note">manual</span>' : kc.stored ? "" : '<span class="kcal-note">not saved yet · Edit → Done to store</span>'
            }</div>`
          : "";
        return `<div class="session-line" data-session-id="${w.id || ""}">
          <div><strong>Day ${w.day}</strong> · ${dayMeta ? dayMeta.title : ""} · ${time}
            <span class="profile-tag">${pname}</span>
            <span class="profile-tag">${status}</span>
          </div>
          ${kcLine}
          ${exLines}
          <button type="button" class="cal-edit-btn" data-edit-session="${w.id}">Edit session</button>
        </div>`;
      })
      .join("");

  el.querySelectorAll("[data-edit-session]").forEach((btn) => {
    btn.addEventListener("click", () => openSessionForEdit(btn.dataset.editSession));
  });
}

function renderExerciseProgress() {
  const sel = document.getElementById("exProgressSelect");
  const list = document.getElementById("exProgressList");
  const spark = document.getElementById("exSparkline");
  if (!sel || !list) return;

  const names = allExerciseNames();
  const prev = sel.value;
  sel.innerHTML =
    `<option value="">Select exercise…</option>` +
    names.map((n) => `<option value="${n.replace(/"/g, "&quot;")}">${n}</option>`).join("");
  if (prev && names.includes(prev)) sel.value = prev;

  const name = sel.value;
  if (!name) {
    list.innerHTML = '<p class="empty">Pick an exercise to see weight × reps history.</p>';
    if (spark) spark.hidden = true;
    return;
  }

  const scope = getProgressScope();
  const pid = getProfileId();
  const workouts = loadJSON(STORAGE.workouts, []);
  const rows = [];
  const weights = [];
  workouts
    .slice()
    .reverse()
    .forEach((w) => {
      const wpid = w.profileId || "chabal";
      if (scope === "current" && wpid !== pid) return;
      if (!w.exercises) return;
      const exArr = exercisesToArray(normalizeExercises(w.exercises));
      const ex = exArr.find((e) => e.name === name);
      if (!ex) return;
      const sets = (ex.sets || []).filter((s) => s.weight || s.reps || s.done);
      if (!sets.length) return;
      const label = sets
        .map((s) => (s.weight != null && s.reps != null ? `${s.weight}×${s.reps}` : s.reps != null ? `${s.reps}r` : s.weight != null ? `${s.weight}kg` : "✓"))
        .join(" · ");
      const topW = Math.max(...sets.map((s) => s.weight || 0), 0);
      if (topW) weights.push(topW);
      const pname = w.profileName || (PROFILES[wpid] && PROFILES[wpid].name) || "";
      rows.push({ date: w.date, day: w.day, label, topW, profileName: pname, profileId: wpid });
    });

  if (!rows.length) {
    list.innerHTML = '<p class="empty">No logged sets for this exercise yet.</p>';
    if (spark) spark.hidden = true;
    return;
  }

  if (spark && weights.length >= 2) {
    spark.hidden = false;
    const max = Math.max(...weights);
    const min = Math.min(...weights);
    const span = Math.max(max - min, 1);
    const pts = weights
      .slice()
      .reverse()
      .slice(-12)
      .map((w, i, arr) => {
        const x = arr.length === 1 ? 50 : (i / (arr.length - 1)) * 100;
        const y = 90 - ((w - min) / span) * 70;
        return `${x},${y}`;
      })
      .join(" ");
    spark.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="#F5C518" stroke-width="2.5" points="${pts}" />
    </svg>`;
  } else if (spark) {
    spark.hidden = true;
  }

  list.innerHTML = rows
    .slice(0, 16)
    .map(
      (r) => `
    <div class="ex-hist-row">
      <span class="date">${formatDate(r.date)}<span class="day-tag">Day ${r.day}</span>${
        getProgressScope() === "all" && r.profileName
          ? `<span class="profile-tag">${r.profileName}</span>`
          : ""
      }</span>
      <span class="sets">${r.label}</span>
    </div>`
    )
    .join("");
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}


/* ---------- set log helpers ---------- */
function parseDefaultReps(repsStr) {
  if (!repsStr) return 10;
  const m = String(repsStr).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 10;
}

function getLastLoad(exName) {
  const map = loadJSON(STORAGE.lastLoads, {});
  return map[exName] || "";
}

function rememberLoad(exName, kg) {
  if (!exName || !kg) return;
  const map = loadJSON(STORAGE.lastLoads, {});
  map[exName] = kg;
  saveJSON(STORAGE.lastLoads, map);
}

function dateKey(isoOrDate) {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function allExerciseNames() {
  const names = [];
  const ids = getProgressScope() === "all" ? PROFILE_ORDER : [getProfileId()];
  ids.forEach((pid) => {
    const days = PROFILES[pid].days;
    ["A", "B", "C"].forEach((L) => {
      days[L].exercises.forEach((ex) => names.push(ex.name));
      names.push(days[L].finisher.name);
    });
  });
  return [...new Set(names)];
}

let calCursor = new Date();
calCursor.setDate(1);
let calSelectedKey = dateKey(new Date());

/* ---------- session ---------- */
function setLogRowsHTML(exKey, exName, nSets, defaultReps, isFinisher, prefills) {
  const last = getLastLoad(exName);
  const pref = Array.isArray(prefills) ? prefills : [];
  return `<div class="set-log-list">
    ${Array.from({ length: nSets }, (_, s) => {
      const p = pref[s] || {};
      const kgVal = p.weight != null && p.weight !== "" ? p.weight : (isFinisher ? "" : last);
      const repsVal = p.reps != null && p.reps !== "" ? p.reps : defaultReps;
      const checked = p.done ? " checked" : "";
      return `
      <div class="set-log-row" data-ex="${exKey}" data-set="${s}">
        <button type="button" class="set-check${checked}" data-ex="${exKey}" data-set="${s}" aria-label="Set ${s + 1} done">${s + 1}</button>
        <div class="set-field">
          <label>kg</label>
          <input type="number" class="set-weight" inputmode="decimal" step="0.5" min="0" max="500"
            placeholder="${isFinisher ? "—" : "kg"}" value="${kgVal}" ${isFinisher ? "disabled" : ""} />
        </div>
        <div class="set-field">
          <label>reps</label>
          <input type="number" class="set-reps" inputmode="numeric" step="1" min="0" max="100"
            value="${repsVal}" />
        </div>
      </div>`;
    }).join("")}
  </div>`;
}

function exStorageKey(formId, name, fallback) {
  if (formId) return formId;
  if (name) return "name:" + name;
  return fallback || "ex";
}

function normalizeExercises(ex) {
  if (!ex) return {};
  if (!Array.isArray(ex) && typeof ex === "object") return { ...ex };
  const out = {};
  ex.forEach((e, i) => {
    const key = exStorageKey(e.formId, e.name, "ex-" + i);
    out[key] = {
      name: e.name,
      formId: e.formId || "",
      sets: e.sets || [],
      savedAt: e.savedAt || null,
    };
  });
  return out;
}

function exercisesToArray(exMap) {
  return Object.keys(exMap || {}).map((k) => {
    const e = exMap[k];
    return {
      key: k,
      name: e.name,
      formId: e.formId || "",
      sets: e.sets || [],
      savedAt: e.savedAt || null,
    };
  });
}

function migrateWorkoutsShape() {
  const workouts = loadJSON(STORAGE.workouts, []);
  let changed = false;
  const next = workouts.map((w) => {
    let out = { ...w };
    if (!out.id) {
      out.id = "sess_" + String(out.date || Date.now()).replace(/\W/g, "") + "_" + Math.random().toString(36).slice(2, 7);
      changed = true;
    }
    if (!out.dateKey) {
      out.dateKey = dateKey(out.date || new Date());
      changed = true;
    }
    if (Array.isArray(out.exercises)) {
      out.exercises = normalizeExercises(out.exercises);
      changed = true;
    } else if (!out.exercises) {
      out.exercises = {};
      changed = true;
    }
    if (out.completedAt === undefined) {
      out.completedAt = out.date || new Date().toISOString();
      changed = true;
    }
    return out;
  });
  if (changed) saveJSON(STORAGE.workouts, next);
  return next;
}

function newSessionId() {
  return "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function getWorkouts() {
  return migrateWorkoutsShape();
}

function upsertWorkout(session) {
  const workouts = getWorkouts();
  const idx = workouts.findIndex((w) => w.id === session.id);
  if (idx >= 0) workouts[idx] = session;
  else workouts.push(session);
  saveJSON(STORAGE.workouts, workouts);
  return session;
}

function findWorkoutById(id) {
  return getWorkouts().find((w) => w.id === id) || null;
}

function findOpenDraft(profileId, dayLetter, dKey) {
  return (
    getWorkouts().find(
      (w) =>
        w.profileId === profileId &&
        w.day === dayLetter &&
        w.dateKey === dKey &&
        !w.completedAt
    ) || null
  );
}

/* ---------- session ---------- */
let sessionLetter = null;
let sessionId = null;
let sessionEditMode = false;
let restTimer = null;
let restLeft = 0;

function openSession(letter, opts) {
  opts = opts || {};
  sessionLetter = letter || getSelected();
  sessionEditMode = !!opts.edit;
  const day = activeDays()[sessionLetter];
  if (!day) return;

  const pid = getProfileId();
  const dKey = opts.dateKey || dateKey(new Date());
  let session = null;

  if (opts.sessionId) session = findWorkoutById(opts.sessionId);
  if (!session && !opts.edit) session = findOpenDraft(pid, sessionLetter, dKey);
  if (!session) {
    session = {
      id: opts.sessionId || newSessionId(),
      date: new Date().toISOString(),
      dateKey: dKey,
      day: sessionLetter,
      profileId: pid,
      profileName: getProfile().name,
      exercises: {},
      completedAt: null,
      startedAt: new Date().toISOString(), // v10 optional: for timed kcal estimate
    };
  }
  sessionId = session.id;
  if (!findWorkoutById(session.id)) upsertWorkout(session);

  const savedMap = normalizeExercises(session.exercises);
  const view = document.getElementById("sessionView");
  view.classList.remove("hidden");
  view.setAttribute("aria-hidden", "false");
  document.getElementById("mainHeader").style.visibility = "hidden";
  document.getElementById("bottomNav").style.visibility = "hidden";

  document.getElementById("sessionTitle").textContent = sessionEditMode
    ? `Edit Day ${sessionLetter}`
    : `Day ${sessionLetter}`;
  document.getElementById("sessionSubtitle").textContent = sessionEditMode
    ? `${day.title} · ${session.dateKey || dKey}`
    : day.title;

  const finishBtn = document.getElementById("finishWorkoutBtn");
  if (finishBtn) {
    finishBtn.textContent = sessionEditMode ? "Done editing" : "Finish workout";
    finishBtn.classList.toggle("edit-mode", sessionEditMode);
  }

  const body = document.getElementById("sessionBody");
  const banner = sessionEditMode
    ? `<div class="session-editing-banner">Editing logged session — change sets, Save exercise, then Done editing</div>`
    : "";

  body.innerHTML =
    banner +
    day.exercises
      .map((ex, i) => {
        const key = exStorageKey(ex.formId, ex.name, "ex-" + i);
        const saved = savedMap[key];
        const defReps = parseDefaultReps(ex.reps);
        const savedLabel = saved && saved.savedAt ? "Saved" : "Not saved";
        const savedCls = saved && saved.savedAt ? "is-saved" : "";
        return `
      <div class="session-ex ${savedCls}" data-ex="${i}" data-exkey="${key}" data-name="${ex.name.replace(/"/g, "&quot;")}" data-formid="${ex.formId || ""}">
        <div class="session-ex-top">
          <div class="session-ex-title">
            ${exThumbHTML(ex.formId, ex.name)}
            <h4>${ex.name}</h4>
            ${formBtnHTML(ex.formId, true)}
          </div>
          <span>${ex.sets}×${ex.reps}</span>
        </div>
        ${setLogRowsHTML(String(i), ex.name, ex.sets, defReps, false, saved && saved.sets)}
        <div class="ex-save-row">
          <button type="button" class="btn-save-ex" data-save-ex>Save exercise</button>
          <span class="ex-saved-badge ${saved && saved.savedAt ? "" : "empty"}" data-saved-badge>${savedLabel}</span>
        </div>
      </div>`;
      })
      .join("") +
    (() => {
      const fin = day.finisher;
      const key = exStorageKey(fin.formId, fin.name, "finisher");
      const saved = savedMap[key];
      const savedLabel = saved && saved.savedAt ? "Saved" : "Not saved";
      const savedCls = saved && saved.savedAt ? "is-saved" : "";
      return `
    <div class="session-ex session-finisher ${savedCls}" data-ex="fin" data-exkey="${key}" data-name="${fin.name.replace(/"/g, "&quot;")}" data-formid="${fin.formId || ""}">
      <div class="fin-label">Finisher</div>
      <div class="session-ex-top">
        <div class="session-ex-title">
          ${exThumbHTML(fin.formId, fin.name)}
          <h4>${fin.name}</h4>
          ${formBtnHTML(fin.formId, true)}
        </div>
        <span>${fin.reps}</span>
      </div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">${fin.detail}</p>
      ${setLogRowsHTML("fin", fin.name, fin.sets, parseDefaultReps(fin.reps) || 1, true, saved && saved.sets)}
      <div class="ex-save-row">
        <button type="button" class="btn-save-ex" data-save-ex>Save exercise</button>
        <span class="ex-saved-badge ${saved && saved.savedAt ? "" : "empty"}" data-saved-badge>${savedLabel}</span>
      </div>
    </div>`;
    })();

  body.querySelectorAll(".set-check").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("checked");
      updateExDone(btn.closest(".session-ex"));
    });
  });
  body.querySelectorAll("[data-save-ex]").forEach((btn) => {
    btn.addEventListener("click", () => saveExerciseBlock(btn.closest(".session-ex")));
  });

  const kcalInput = document.getElementById("kcalManualInput");
  if (kcalInput) {
    const m = Number(session.caloriesManual);
    kcalInput.value = session.caloriesManual != null && m > 0 ? String(Math.round(m)) : "";
  }

  updateExDoneAll();
  updateSessionSaveStatus();
  stopRest();
}

function updateExDone(el) {
  if (!el) return;
  const checks = el.querySelectorAll(".set-check");
  const all = [...checks].every((c) => c.classList.contains("checked"));
  el.classList.toggle("done", all && checks.length > 0);
}

function updateExDoneAll() {
  document.querySelectorAll("#sessionBody .session-ex").forEach(updateExDone);
}

function collectBlockSets(block) {
  const name = block.dataset.name || block.querySelector("h4")?.textContent || "";
  const formId = block.dataset.formid || "";
  const key = block.dataset.exkey || exStorageKey(formId, name, block.dataset.ex);
  const rows = [...block.querySelectorAll(".set-log-row")];
  const sets = rows.map((row, idx) => {
    const done = row.querySelector(".set-check")?.classList.contains("checked") || false;
    const wEl = row.querySelector(".set-weight");
    const rEl = row.querySelector(".set-reps");
    const weight = wEl && !wEl.disabled ? parseFloat(wEl.value) || null : null;
    const reps = rEl ? parseInt(rEl.value, 10) || null : null;
    if (weight) rememberLoad(name, weight);
    return { set: idx + 1, weight, reps, done };
  });
  return { key, name, formId, sets };
}

function saveExerciseBlock(block) {
  if (!block || !sessionId) return;
  const { key, name, formId, sets } = collectBlockSets(block);
  let session = findWorkoutById(sessionId);
  if (!session) {
    session = {
      id: sessionId,
      date: new Date().toISOString(),
      dateKey: dateKey(new Date()),
      day: sessionLetter,
      profileId: getProfileId(),
      profileName: getProfile().name,
      exercises: {},
      completedAt: null,
      startedAt: new Date().toISOString(), // v10 optional
    };
  }
  const exercises = normalizeExercises(session.exercises);
  exercises[key] = { name, formId, sets, savedAt: new Date().toISOString() };
  session.exercises = exercises;
  session.date = new Date().toISOString();
  upsertWorkout(session);

  block.classList.add("is-saved");
  const badge = block.querySelector("[data-saved-badge]");
  if (badge) {
    badge.textContent = "Saved";
    badge.classList.remove("empty");
  }
  const btn = block.querySelector("[data-save-ex]");
  if (btn) {
    btn.classList.add("saved-flash");
    btn.textContent = "Saved ✓";
    setTimeout(() => {
      btn.classList.remove("saved-flash");
      btn.textContent = "Save exercise";
    }, 900);
  }
  updateSessionSaveStatus();
  showToast(name + " saved");
}

function countSavedExercises(session) {
  const day = (activeDays()[session.day] || activeDays()[sessionLetter]);
  if (!day) return { saved: 0, total: 0 };
  const keys = [
    ...day.exercises.map((ex, i) => exStorageKey(ex.formId, ex.name, "ex-" + i)),
    exStorageKey(day.finisher.formId, day.finisher.name, "finisher"),
  ];
  const map = normalizeExercises(session.exercises);
  const saved = keys.filter((k) => map[k] && map[k].savedAt).length;
  return { saved, total: keys.length };
}

function updateSessionSaveStatus() {
  const el = document.getElementById("sessionSaveStatus");
  if (!el || !sessionId) return;
  const session = findWorkoutById(sessionId);
  if (!session) {
    el.textContent = "0 exercises saved";
    el.classList.remove("has-saved");
    return;
  }
  const { saved, total } = countSavedExercises(session);
  el.textContent = saved + "/" + total + " exercises saved";
  el.classList.toggle("has-saved", saved > 0);
  updateSessionKcalUI(session);
}

// Footer kcal row: live estimate (as if finishing now / keeping original finish when editing)
function updateSessionKcalUI(session) {
  const estEl = document.getElementById("kcalEstimate");
  const basisEl = document.getElementById("kcalBasis");
  const input = document.getElementById("kcalManualInput");
  if (!estEl || !session) return;
  const finishIso = sessionEditMode && session.completedAt ? session.completedAt : new Date().toISOString();
  const est = estimateSessionCalories(session, finishIso);
  const manual = input ? parseInt(input.value, 10) : NaN;
  if (manual > 0) {
    estEl.textContent = `${manual} kcal`;
    if (basisEl) basisEl.textContent = `Manual override · estimate was ~${est.kcal} kcal`;
  } else {
    estEl.textContent = `~${est.kcal} kcal (est.)`;
    if (basisEl) basisEl.textContent = kcalBasisText(est.meta);
  }
  if (input) input.placeholder = String(est.kcal);
}

function closeSession() {
  stopRest();
  const view = document.getElementById("sessionView");
  view.classList.add("hidden");
  view.setAttribute("aria-hidden", "true");
  document.getElementById("mainHeader").style.visibility = "";
  document.getElementById("bottomNav").style.visibility = "";
  sessionLetter = null;
  sessionId = null;
  sessionEditMode = false;
}

function finishWorkout() {
  if (!sessionId || !sessionLetter) return;
  const session = findWorkoutById(sessionId);
  if (!session) return;

  const { saved, total } = countSavedExercises(session);
  if (saved === 0 && !sessionEditMode) {
    if (!confirm("No exercises saved yet. Finish anyway? You can Edit from the calendar later.")) return;
  } else if (saved < total && !sessionEditMode) {
    if (!confirm(saved + "/" + total + " exercises saved. Finish with the rest unsaved?")) return;
  }

  const wasComplete = !!session.completedAt;
  if (!sessionEditMode) {
    session.completedAt = session.completedAt || new Date().toISOString();
  } else if (!session.completedAt) {
    session.completedAt = new Date().toISOString();
  }
  session.date = new Date().toISOString();

  // v10 calories (additive optional fields). Recomputed on Finish and Done editing.
  const est = estimateSessionCalories(session, session.completedAt);
  session.calories = est.kcal;
  session.caloriesMeta = est.meta;
  const kcalInput = document.getElementById("kcalManualInput");
  const manual = kcalInput ? parseInt(kcalInput.value, 10) : NaN;
  session.caloriesManual = manual > 0 && manual < 5000 ? manual : null;
  upsertWorkout(session);
  const kcalMsg = kcalLabel(sessionCalories(session));

  if (!sessionEditMode && !wasComplete) {
    setRotation(nextLetter(sessionLetter));
    setSelected(getRotation());
  }

  const letter = sessionLetter;
  const editing = sessionEditMode;
  closeSession();
  renderNextWorkout();
  renderProgress();
  showToast(
    (editing ? ("Day " + letter + " updated") : ("Day " + letter + " finished · next: Day " + getRotation())) +
    (kcalMsg ? " · " + kcalMsg : "")
  );
  switchView("progress");
}

function openSessionForEdit(sessionIdToEdit) {
  const session = findWorkoutById(sessionIdToEdit);
  if (!session) {
    showToast("Session not found");
    return;
  }
  if (session.profileId && session.profileId !== getProfileId() && PROFILES[session.profileId]) {
    setProfileId(session.profileId);
    applyProfileUI();
    renderNextWorkout();
  }
  openSession(session.day, {
    edit: true,
    sessionId: session.id,
    dateKey: session.dateKey || dateKey(session.date),
  });
}


function startRest(seconds = 90) {
  stopRest();
  restLeft = seconds;
  const banner = document.getElementById("restBanner");
  const btn = document.getElementById("restBtn");
  banner.classList.remove("hidden");
  btn.classList.add("active");
  updateRestUI();
  restTimer = setInterval(() => {
    restLeft -= 1;
    if (restLeft <= 0) {
      stopRest();
      showToast("Rest done — next set");
      return;
    }
    updateRestUI();
  }, 1000);
}

function updateRestUI() {
  const m = Math.floor(restLeft / 60);
  const s = restLeft % 60;
  document.getElementById("restCountdown").textContent =
    `${m}:${s.toString().padStart(2, "0")}`;
}

function stopRest() {
  if (restTimer) clearInterval(restTimer);
  restTimer = null;
  document.getElementById("restBanner").classList.add("hidden");
  document.getElementById("restBtn").classList.remove("active");
}

function showToast(msg) {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.getElementById("app").appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

/* ---------- nav ---------- */
function switchView(name) {
  document.querySelectorAll(".view").forEach((v) => {
    v.classList.toggle("active", v.dataset.view === name);
  });
  document.querySelectorAll(".nav-item").forEach((n) => {
    n.classList.toggle("active", n.dataset.nav === name);
  });
  if (name === "plans") renderPlans();
  if (name === "progress") renderProgress();
  if (name === "diet") renderDiet();
  if (name === "workout") renderNextWorkout();
}

/* ---------- weekday hint for first visit ---------- */
function initRotationFromWeekday() {
  const maps = getRotationMap();
  if (maps[getProfileId()]) return;
  const dow = new Date().getDay();
  const map = { 0: "A", 1: "A", 2: "B", 3: "C", 4: "A", 5: "B", 6: "C" };
  setRotation(map[dow] || "A");
  setSelected(getRotation());
}

/* ---------- boot ---------- */
function boot() {
  migrateLegacyStorage();
  migrateWorkoutsShape();
  initRotationFromWeekday();
  applyProfileUI();

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.nav));
  });

  document.querySelectorAll(".day-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSelected(btn.dataset.day);
      renderNextWorkout();
    });
  });

  document.getElementById("calendarBtn")?.addEventListener("click", () => {
    switchView("progress");
    const card = document.getElementById("calendarCard");
    card?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("calPrev")?.addEventListener("click", () => {
    calCursor.setMonth(calCursor.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("calNext")?.addEventListener("click", () => {
    calCursor.setMonth(calCursor.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById("exProgressSelect")?.addEventListener("change", renderExerciseProgress);


  document.getElementById("startWorkoutBtn").addEventListener("click", () => {
    openSession(getSelected());
  });

  document.getElementById("exitSession").addEventListener("click", () => {
    const msg = sessionEditMode
      ? "Close editor? Saved exercises are already stored."
      : "Exit workout? Exercises you already Saved are kept.";
    if (confirm(msg)) closeSession();
  });

  document.getElementById("finishWorkoutBtn").addEventListener("click", finishWorkout);
  document.getElementById("kcalManualInput")?.addEventListener("input", () => {
    if (sessionId) updateSessionKcalUI(findWorkoutById(sessionId));
  });
  document.getElementById("kcalClearBtn")?.addEventListener("click", () => {
    const i = document.getElementById("kcalManualInput");
    if (i) i.value = "";
    if (sessionId) updateSessionKcalUI(findWorkoutById(sessionId));
  });

  document.getElementById("restBtn").addEventListener("click", () => {
    if (restTimer) stopRest();
    else startRest(90);
  });
  document.getElementById("skipRest").addEventListener("click", stopRest);

  document.getElementById("closePreview").addEventListener("click", () => {
    document.getElementById("planPreview").classList.add("hidden");
    document.getElementById("planGrid").classList.remove("hidden");
  });

  document.getElementById("weightForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("weightInput");
    const kg = parseFloat(input.value);
    if (!kg || kg < 40 || kg > 250) return;
    const weights = loadJSON(STORAGE.weights, []);
    weights.push({ date: new Date().toISOString(), kg });
    saveJSON(STORAGE.weights, weights);
    input.value = "";
    renderProgress();
    showToast(`Logged ${kg.toFixed(1)} kg`);
  });

  document.getElementById("openProfilesBtn")?.addEventListener("click", openProfileSheet);
  document.getElementById("profileSheetClose")?.addEventListener("click", closeProfileSheet);
  document.getElementById("profileBackdrop")?.addEventListener("click", closeProfileSheet);
  document.querySelectorAll(".scope-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setProgressScope(btn.dataset.scope);
      document.querySelectorAll(".scope-btn").forEach((b) => b.classList.toggle("active", b.dataset.scope === btn.dataset.scope));
      renderExerciseProgress();
    });
  });

  renderNextWorkout();
  renderDiet();
  renderPlans();
  renderProgress();
}

document.addEventListener("DOMContentLoaded", () => {
  bindFormGuideUI();
  boot();
});


/* PWA: register service worker for offline gym use */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("SW registration failed", err);
    });
  });
}
