const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { JSDOM } = require('jsdom');

const SeedApp = require('../app.js');
const server = require('../server.js');

test('1. Reference Streak Timer Breakdown matches Reference Image 1 (2d 12h 42m 23s) and handles edge cases', () => {
  const now = 1_700_000_000_000;
  const defState = SeedApp.createDefaultState(now);
  const b = SeedApp.computeStreakBreakdown(defState.streakStartTime, now);

  assert.equal(b.days, 2);
  assert.equal(b.hours, 12);
  assert.equal(b.minutes, 42);
  assert.equal(b.seconds, 23);

  // Edge case: Future timestamp is clamped to 0 (no negative timer values)
  const future = SeedApp.computeStreakBreakdown(now + 50000, now);
  assert.equal(future.days, 0);
  assert.equal(future.hours, 0);
  assert.equal(future.minutes, 0);
  assert.equal(future.seconds, 0);

  // Edge case: NaN / invalid timestamp defaults to 0 elapsed
  const invalid = SeedApp.computeStreakBreakdown(NaN, now);
  assert.equal(invalid.totalSeconds, 0);
});

test('2. 4-7-8 Breathing SOS Engine transitions accurately across 19-second cycle', () => {
  // Inhale: 0..3 (4 seconds)
  assert.deepEqual(SeedApp.resolveBreathing478Step(0), {
    phase: 'inhale',
    label: 'TARIK NAPAS (4s)',
    remainingSeconds: 4
  });
  assert.equal(SeedApp.resolveBreathing478Step(3).phase, 'inhale');
  assert.equal(SeedApp.resolveBreathing478Step(3).remainingSeconds, 1);

  // Hold: 4..10 (7 seconds)
  assert.equal(SeedApp.resolveBreathing478Step(4).phase, 'hold');
  assert.equal(SeedApp.resolveBreathing478Step(4).remainingSeconds, 7);
  assert.equal(SeedApp.resolveBreathing478Step(10).phase, 'hold');
  assert.equal(SeedApp.resolveBreathing478Step(10).remainingSeconds, 1);

  // Exhale: 11..18 (8 seconds)
  assert.equal(SeedApp.resolveBreathing478Step(11).phase, 'exhale');
  assert.equal(SeedApp.resolveBreathing478Step(11).remainingSeconds, 8);
  assert.equal(SeedApp.resolveBreathing478Step(18).phase, 'exhale');
  assert.equal(SeedApp.resolveBreathing478Step(18).remainingSeconds, 1);

  // Wrap-around at second 19 -> back to inhale 4s
  assert.equal(SeedApp.resolveBreathing478Step(19).phase, 'inhale');
  assert.equal(SeedApp.resolveBreathing478Step(19).remainingSeconds, 4);
});

test('3. Seed Vault 6 Evolution Stages unlock at exact hour thresholds (24h, 3d, 7d, 14d, 30d, 90d)', () => {
  assert.equal(SeedApp.SEED_STAGES.length, 6);
  const expectedNames = [
    'Origin Seed',
    'Sprout Core',
    'Nebula Flora',
    'Aether Crystal',
    'Supernova Tree',
    'Cosmic Sovereign'
  ];
  assert.deepEqual(
    SeedApp.SEED_STAGES.map((s) => s.name),
    expectedNames
  );

  // At 0 hours: 0 collected, next is Origin Seed
  const atZero = SeedApp.computeVaultProgress(0);
  assert.equal(atZero.collectedCount, 0);
  assert.equal(atZero.nextStage.name, 'Origin Seed');
  assert.equal(atZero.progressPercent, 0);

  // At 24 hours: Origin Seed collected, next is Sprout Core
  const at24h = SeedApp.computeVaultProgress(24);
  assert.equal(at24h.collectedCount, 1);
  assert.equal(at24h.stages[0].collected, true);
  assert.equal(at24h.stages[1].collected, false);
  assert.equal(at24h.nextStage.name, 'Sprout Core');
  assert.equal(at24h.nextLabel, 'Next: Sprout Core (3 days)');

  // Stealth mode uses stealthName in nextLabel
  const at24hStealth = SeedApp.computeVaultProgress(24, true);
  assert.equal(at24hStealth.nextLabel, 'Next: Verdant Core (3 days)');

  // At Reference Streak (~60.7 hours): Origin Seed collected, 76% towards Sprout Core
  const atRef = SeedApp.computeVaultProgress(60.7);
  assert.equal(atRef.collectedCount, 1);
  assert.equal(atRef.progressPercent, 76);

  // At 90 days (2160 hours): All 6 collected
  const at90d = SeedApp.computeVaultProgress(2160);
  assert.equal(at90d.collectedCount, 6);
  assert.equal(at90d.nextStage, null);
  assert.equal(at90d.progressPercent, 100);
  assert.equal(SeedApp.computeVaultProgress(2160, true).nextLabel, 'All 6 Orbital Artifacts Collected! (90+ Days)');
});

test('4. Web Audio Binaural Tapes match Alpha 10Hz, Theta 6Hz, and Delta 3Hz specifications', () => {
  assert.equal(SeedApp.BINAURAL_TAPES.length, 3);
  const [tape1, tape2, tape3] = SeedApp.BINAURAL_TAPES;

  assert.equal(tape1.beatHz, 10);
  assert.equal(tape1.rightHz - tape1.leftHz, 10);
  assert.equal(tape1.completedUsers, 32421);

  assert.equal(tape2.beatHz, 6);
  assert.equal(tape2.rightHz - tape2.leftHz, 6);

  assert.equal(tape3.beatHz, 3);
  assert.equal(tape3.rightHz - tape3.leftHz, 3);
});

test('5. Statistics Hero Metrics & Trigger Breakdown match reference values (52 & 29%, 50%/30%/20%) and zero/relapse edge cases', () => {
  const now = 1_700_000_000_000;
  const defState = SeedApp.createDefaultState(now);

  const metrics = SeedApp.computeStatisticsMetrics(defState, now);
  assert.equal(metrics.timeSavedValue, 52);
  assert.equal(metrics.improvementPct, 29);

  // Edge case: Reset streak (0 seconds elapsed) and extra relapse -> 0 time saved and reduced improvementPct
  const resetState = {
    ...defState,
    streakStartTime: now,
    sevenDays: defState.sevenDays.map((d, idx) => (idx === 6 ? { ...d, status: 'relapse' } : d))
  };
  const resetMetrics = SeedApp.computeStatisticsMetrics(resetState, now);
  assert.equal(resetMetrics.timeSavedValue, 0);
  assert.equal(resetMetrics.improvementPct, 24);

  const breakdown = SeedApp.computeTriggerBreakdown(defState.triggers);
  assert.equal(breakdown[0].name, 'Larut Malam');
  assert.equal(breakdown[0].percentage, 50);
  assert.equal(breakdown[1].name, 'Bosan');
  assert.equal(breakdown[1].percentage, 30);
  assert.equal(breakdown[2].name, 'Stres');
  assert.equal(breakdown[2].percentage, 20);

  // Edge case: Empty triggers object does not divide by zero
  const emptyBreakdown = SeedApp.computeTriggerBreakdown({ Bosan: 0, Stres: 0 });
  assert.equal(emptyBreakdown[0].percentage, 0);
});

test('6. 4-Digit PIN validator accepts only 4 numeric digits', () => {
  assert.equal(SeedApp.isValidPin('1234'), true);
  assert.equal(SeedApp.isValidPin('0000'), true);
  assert.equal(SeedApp.isValidPin('123'), false);
  assert.equal(SeedApp.isValidPin('12345'), false);
  assert.equal(SeedApp.isValidPin('12a4'), false);
  assert.equal(SeedApp.isValidPin(''), false);
  assert.equal(SeedApp.isValidPin(null), false);
});

test('7. Local HTTP Server serves assets with HTTP 200 and blocks directory traversal / malformed URIs', async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  function fetchText(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${urlPath}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }).on('error', reject);
    });
  }

  try {
    const indexRes = await fetchText('/');
    assert.equal(indexRes.statusCode, 200);
    assert.match(indexRes.body, /id="screen-home"/);
    assert.match(indexRes.body, /id="screen-vault"/);
    assert.match(indexRes.body, /id="screen-rewire"/);
    assert.match(indexRes.body, /id="screen-stats"/);
    assert.match(indexRes.body, /id="screen-shield"/);
    assert.match(indexRes.body, /Hold 3s to Commit Today/);
    assert.match(indexRes.body, /I Relapsed \(Reset Timer\)/);
    assert.match(indexRes.body, /Godaan Berhasil Dilewati \(\+50 XP\)/);
    assert.match(indexRes.body, /Play Tape 1/);
    assert.match(indexRes.body, /Join the Challenge/);

    const cssRes = await fetchText('/styles.css');
    assert.equal(cssRes.statusCode, 200);
    assert.match(cssRes.body, /#050714/);

    const manifestRes = await fetchText('/manifest.json');
    assert.equal(manifestRes.statusCode, 200);
    const manifestJson = JSON.parse(manifestRes.body);
    assert.equal(manifestJson.short_name, 'SEED');

    const swRes = await fetchText('/sw.js');
    assert.equal(swRes.statusCode, 200);

    // Path traversal & malformed URI protection
    const traversalRes = await fetchText('/..%5cseed-cosmic-reboot-other/secret.txt');
    assert.equal(traversalRes.statusCode, 403);

    const malformedRes = await fetchText('/%E0%A4%A');
    assert.equal(malformedRes.statusCode, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('8. Full DOM Integration (JSDOM): All 5 Tabs, SOS Mode (+50 XP), Daily Pledge (+25 XP), Relapse Evaluation (All 5 Triggers), Web Audio Synth, Stealth Mode & 4-Digit PIN Lock', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  // Mock Web Audio API & Canvas 2D Context on window
  const createdFrequencies = [];
  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    resume() {}
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {}
      };
    }
    createAnalyser() {
      return { fftSize: 256, connect() {} };
    }
    createStereoPanner() {
      return { pan: { setValueAtTime() {} }, connect() {} };
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime(hz) {
            createdFrequencies.push(hz);
          },
          exponentialRampToValueAtTime() {}
        },
        connect() {},
        start() {},
        stop() {},
        disconnect() {}
      };
    }
  }

  dom.window.AudioContext = MockAudioContext;
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  // Bind globals for initBrowserApp (preserve Node's native global.performance so JSDOM hr-time does not recurse)
  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller, 'Controller initialized in DOM');

  try {
    // 1. Verify initial Home screen renders 2 days, 12 hours, 42 minutes
    assert.equal(document.getElementById('timer-days').textContent, '2');
    assert.equal(document.getElementById('timer-hours').textContent, '12');
    assert.equal(document.getElementById('timer-minutes').textContent, '42');
    assert.equal(document.getElementById('home-xp-value').textContent, '150 XP');

    // 2. Activate SOS Mode by clicking Cosmic Orb -> verify SOS active & shuffle physical challenge
    document.getElementById('cosmic-orb').click();
    assert.equal(document.getElementById('screen-home').classList.contains('sos-active'), true);
    const initialChallenge = document.getElementById('sos-challenge-label').textContent;
    document.getElementById('btn-shuffle-challenge').click();
    const nextChallenge = document.getElementById('sos-challenge-label').textContent;
    assert.notEqual(initialChallenge, nextChallenge);

    // 3. Complete Urge Victory (+50 XP)
    document.getElementById('btn-urge-victory').click();
    assert.equal(document.getElementById('screen-home').classList.contains('sos-active'), false);
    assert.equal(document.getElementById('home-xp-value').textContent, '200 XP');
    assert.equal(document.getElementById('home-urges-count').textContent, '3');

    // 4. Complete 3-Second Daily Pledge (+25 XP)
    controller.completeDailyPledge();
    assert.equal(document.getElementById('home-xp-value').textContent, '225 XP');
    assert.equal(document.getElementById('btn-hold-pledge').classList.contains('pledged-done'), true);

    // 5. Switch to Tab 2 (Seed Vault) & test stage selection + preset time-travel to 90d
    controller.switchTab('vault');
    assert.equal(document.getElementById('screen-vault').classList.contains('active'), true);
    assert.equal(document.getElementById('seed-hero-title').textContent, 'Origin Seed');
    assert.equal(document.getElementById('seed-status-pill').textContent, 'Collected');

    const preset90dBtn = document.querySelector('[data-preset-streak="90"]');
    preset90dBtn.click();
    assert.equal(document.getElementById('seed-hero-title').textContent, 'Cosmic Sovereign');
    assert.equal(document.getElementById('seed-status-pill').textContent, 'Collected');
    assert.equal(document.getElementById('vault-next-percent').textContent, '100%');

    // 6. Switch to Tab 3 (Rewire) & test Web Audio Binaural Synthesizer across Tapes 1, 2, 3
    controller.switchTab('rewire');
    assert.equal(document.getElementById('screen-rewire').classList.contains('active'), true);
    createdFrequencies.length = 0;
    document.getElementById('btn-play-tape').click();
    assert.ok(createdFrequencies.includes(200) && createdFrequencies.includes(210), 'Tape 1 200Hz/210Hz oscillators started');

    // Switch to Tape 2 (Theta 6Hz: 180Hz/186Hz) while playing
    createdFrequencies.length = 0;
    document.querySelector('[data-tape-id="2"]').click();
    assert.ok(createdFrequencies.includes(180) && createdFrequencies.includes(186), 'Tape 2 180Hz/186Hz oscillators started');
    controller.stopBinauralSynth();

    // 7. Switch to Tab 4 (Statistics) & test 7-day circle inspector, all 5 Trigger Breakdown rows, Community Challenge Join, and Relapse Reset
    controller.switchTab('stats');
    const dayCircles = document.querySelectorAll('#seven-days-row .day-circle');
    assert.equal(dayCircles.length, 7);
    const triggerRows = document.querySelectorAll('#trigger-bars-list .trigger-bar-row');
    assert.equal(triggerRows.length, 5, 'All 5 relapse triggers rendered in Trigger Breakdown');

    // Click Thursday (index 4, status-relapse) to inspect trigger note & verify .selected class
    dayCircles[4].click();
    assert.equal(dayCircles[4].classList.contains('selected'), true);
    assert.match(document.getElementById('day-inspector-text').textContent, /Larut Malam/);

    // Join Community Challenge
    document.getElementById('btn-join-challenge').click();
    assert.equal(document.getElementById('challenge-participants').textContent, '15,033 participants');
    assert.ok(document.getElementById('challenge-joined-progress'), 'Progress bar rendered after joining challenge');

    // Trigger Relapse Reset with "Sosmed"
    const sosmedBtn = document.querySelector('[data-trigger="Sosmed"]');
    sosmedBtn.click();
    controller.confirmRelapseReset();
    assert.equal(document.getElementById('timer-days').textContent, '0');
    assert.equal(document.getElementById('stat-time-saved').textContent, '0');
    assert.equal(controller.getState().triggers['Sosmed'], 1);

    // 8. Switch to Tab 5 (Shield & Privacy) & test Core Reason validation, Stealth Mode across all screens, and 4-Digit PIN Lock
    controller.switchTab('shield');
    const reasonInput = document.getElementById('input-core-reason');
    // Empty input is rejected and restores previous reason
    reasonInput.value = '   ';
    document.getElementById('btn-save-reason').click();
    assert.ok(reasonInput.value.length > 0, 'Empty core reason restored to valid reason');

    reasonInput.value = 'Menjadi versi terbaik diriku untuk masa depan!';
    document.getElementById('btn-save-reason').click();
    assert.equal(
      document.getElementById('sos-core-reason-display').textContent,
      '"Menjadi versi terbaik diriku untuk masa depan!"'
    );

    // Toggle Stealth Mode ON & verify complete disguise across Home, Vault, Statistics, and Nav
    document.getElementById('switch-stealth-mode').click();
    assert.equal(document.title, 'ASTRAL — Deep Focus & Orbital Timer');
    assert.equal(document.getElementById('btn-open-relapse').textContent, 'Reset Orbital Timer');
    assert.equal(document.getElementById('btn-open-sos').textContent, 'Focus Shield / SOS');
    assert.equal(document.getElementById('nav-label-vault').textContent, 'Artifacts');
    assert.equal(document.getElementById('nav-label-rewire').textContent, 'Acoustic');
    assert.equal(document.getElementById('btn-switch-challenge').textContent, 'Ganti: Solar Zenith 30-Day Sprint ⇄');
    assert.equal(document.getElementById('vault-next-label').textContent, 'Next: Origin Asteroid (24 hours)');

    // Set 4-Digit PIN to "2580", Lock App, test wrong PIN then right PIN
    const pinInput = document.getElementById('input-pin-code');
    pinInput.value = '2580';
    document.getElementById('btn-save-pin').click();
    document.getElementById('btn-lock-now').click();

    const pinOverlay = document.getElementById('pin-lock-overlay');
    assert.equal(pinOverlay.classList.contains('locked'), true);

    // Enter wrong PIN "0000" -> stays locked
    ['0', '0', '0', '0'].forEach((k) => controller.handlePinKeyInput(k));
    assert.equal(pinOverlay.classList.contains('locked'), true);

    // Clear and enter right PIN "2580" -> unlocks without race-condition timeout wiping buffer!
    controller.handlePinKeyInput('clear');
    ['2', '5', '8', '0'].forEach((k) => controller.handlePinKeyInput(k));
    assert.equal(pinOverlay.classList.contains('locked'), false);
  } finally {
    controller.destroy();
  }
});

test('9. Deep Edge Cases: 3-Second Hold-to-Pledge RAF Progression & Interruption, Daily Urge Rollover, Corrupted Storage Sanitization, and Audio Countdown Completion', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  let lastRafCallback = null;

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = (cb) => {
    lastRafCallback = cb;
    return 42;
  };
  global.cancelAnimationFrame = () => {
    lastRafCallback = null;
  };

  // Seed localStorage with yesterday's date for lastUrgeDate AND corrupted fields
  localStorage.setItem(
    SeedApp.STORAGE_KEY,
    JSON.stringify({
      xp: 300,
      urgesOvercomeToday: 7,
      totalUrgesOvercome: 19,
      lastUrgeDate: '2020-01-01',
      selectedTapeDurationMin: 'corrupted-duration',
      pinCode: 'bad-pin'
    })
  );

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // 1. Verify daily rollover reset urgesOvercomeToday to 0 while keeping totalUrgesOvercome = 19
    assert.equal(controller.getState().urgesOvercomeToday, 0);
    assert.equal(controller.getState().totalUrgesOvercome, 19);
    assert.equal(document.getElementById('home-urges-count').textContent, '0');

    // 2. Verify corrupted duration and PIN fell back to safe defaults (10m => 10:00, PIN => 1234)
    assert.equal(controller.getState().selectedTapeDurationMin, 10);
    assert.equal(document.getElementById('synth-timer-display').textContent, '10:00');
    assert.equal(controller.getState().pinCode, '1234');

    // 3. Test 3-Second Hold-to-Pledge interrupted mid-hold (at 1500ms -> 50%)
    const start1 = performance.now();
    controller.startHoldPledge();
    assert.ok(lastRafCallback, 'RAF scheduled on hold start');

    lastRafCallback(start1 + 1500); // 1500ms elapsed -> 50%
    assert.equal(document.getElementById('pledge-hold-fill').style.width, '50%');
    assert.match(document.getElementById('pledge-hold-label').textContent, /1\.5s/);

    // Simulate touchcancel / interruption before 3000ms -> resets to 0% without pledging
    window.dispatchEvent(new dom.window.Event('touchcancel'));
    assert.equal(document.getElementById('pledge-hold-fill').style.width, '0%');
    assert.equal(controller.getState().lastPledgeDate, null);

    // 4. Test full 3-Second Hold-to-Pledge completion (0ms -> 3000ms+)
    controller.startHoldPledge();
    lastRafCallback(performance.now() + 3005); // >= 3000ms elapsed -> 100%
    assert.equal(document.getElementById('btn-hold-pledge').classList.contains('pledged-done'), true);
    assert.equal(controller.getState().xp, 325); // 300 + 25 XP

    // 5. Test Audio Countdown completion awards +30 XP and resets timer
    document.querySelector('[data-duration-min="5"]').click();
    assert.equal(document.getElementById('synth-timer-display').textContent, '05:00');
    controller.startBinauralSynth();
    // Tick 300 seconds (5 minutes)
    for (let i = 0; i < 300; i++) {
      controller.tickAudioSecond();
    }
    assert.equal(controller.getState().xp, 355); // 325 + 30 XP
    assert.equal(document.getElementById('synth-timer-display').textContent, '05:00');
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 10. Pure Helpers: Brain Recovery, 30-Day Matrix, Time Vulnerability & KPIs
// ============================================================================
test('10. Enhanced Statistics pure calculators handle 0h, reference streak, 90d cap, and empty/custom logs', () => {
  // 10a. Brain Recovery at 0h, reference (60.7h), 168h (7d), 720h (30d), and 2500h (clamped at 100%)
  const brZero = SeedApp.computeBrainRecoveryMetrics(0, false);
  assert.equal(brZero.overallPct, 11);
  assert.equal(brZero.metrics.length, 4);
  assert.match(brZero.phaseBadge, /Fase 1/i);

  const brRef = SeedApp.computeBrainRecoveryMetrics(60.7, false);
  assert.ok(brRef.overallPct > 11 && brRef.overallPct < 60);
  assert.match(brRef.phaseBadge, /Fase 1/i);

  const brStealth = SeedApp.computeBrainRecoveryMetrics(400, true);
  assert.match(brStealth.phaseBadge, /Fase 4: Resonansi Kuantum Stabil/i);

  const brMax = SeedApp.computeBrainRecoveryMetrics(2500, false);
  assert.equal(brMax.overallPct, 100);
  assert.ok(brMax.metrics.every((m) => m.pct === 100));
  assert.match(brMax.phaseBadge, /Fase 6/i);

  // 10b. 30-Day Consistency Matrix with default state vs long streak & relapse state
  const nowMs = Date.now();
  const baseState = SeedApp.createDefaultState(nowMs);
  const matrixRef = SeedApp.computeThirtyDayMatrix(baseState, nowMs);
  assert.equal(matrixRef.cells.length, 30);
  assert.equal(matrixRef.cells[29].dayNumber, 30);
  assert.ok(matrixRef.cleanCount >= 25);
  assert.equal(matrixRef.consistencyPct, Math.round((matrixRef.cleanCount / 30) * 100));

  // Long 45-day streak makes all 30 days clean/shielded (0 relapses)
  const longStreakMatrix = SeedApp.computeThirtyDayMatrix(
    {
      ...baseState,
      streakStartTime: nowMs - 45 * 86400 * 1000
    },
    nowMs
  );
  assert.equal(longStreakMatrix.relapseCount, 0);
  assert.equal(longStreakMatrix.cleanCount, 30);
  assert.equal(longStreakMatrix.consistencyPct, 100);

  // 10c. Time Vulnerability Breakdown across default, custom slots, and empty zero state
  const vulnDefault = SeedApp.computeVulnerabilityBreakdown(baseState.timeVulnerability);
  assert.equal(vulnDefault.items.length, 4);
  assert.equal(vulnDefault.peakWindow, 'Larut Malam (21–01)');

  const vulnZero = SeedApp.computeVulnerabilityBreakdown({
    'Larut Malam (21–01)': 0,
    'Sore Hari (15–19)': 0,
    'Dini Hari (01–05)': 0,
    'Siang Hari (11–15)': 0
  });
  assert.equal(vulnZero.total, 0);
  assert.ok(vulnZero.items.every((item) => item.percentage === 0));

  // 10d. Extended KPI fields in computeStatisticsMetrics
  const stats = SeedApp.computeStatisticsMetrics(baseState, nowMs);
  assert.equal(stats.timeSavedValue, 52);
  assert.equal(stats.improvementPct, 29);
  assert.equal(stats.currentStreakLabel, '2d 12h');
  assert.equal(stats.bestStreakLabel, '14d 6h');
  assert.equal(stats.urgeVictoryRate, 90); // 9 / (9 + 1) = 90%
  assert.equal(stats.rankTitle, 'Fokus'); // 150 XP default

  const highXpStats = SeedApp.computeStatisticsMetrics({ ...baseState, xp: 450 }, nowMs);
  assert.equal(highXpStats.rankTitle, 'Vanguard');
});

// ============================================================================
// 11. Full JSDOM Integration: Enhanced 3D Seed Vault & Comprehensive Statistics
// ============================================================================
test('11. Enhanced Seed Vault 3D Animations & Comprehensive Statistics Interactive Flows', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  let canvasArcCalls = 0;
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {
      canvasArcCalls += 1;
    },
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // --- A. Seed Vault 3D Stage Navigation, Animation Modes, Energy Burst & All 6 Stages ---
    controller.switchTab('vault');

    // Verify all 6 stage cards have mini-SVGs rendered
    const miniSvgs = document.querySelectorAll('#vault-stages-grid svg.stage-mini-svg');
    assert.equal(miniSvgs.length, 6);

    // Verify stage neural telemetry bars rendered
    const telemetryBars = document.querySelectorAll('#vault-telemetry-bars .telemetry-bar-row');
    assert.equal(telemetryBars.length, 3);

    // Step through all 6 stages using Next/Prev buttons and render 3D canvas for each stage
    const nextBtn = document.getElementById('btn-vault-step-next');
    const prevBtn = document.getElementById('btn-vault-step-prev');
    assert.equal(controller.getState().selectedVaultStageIndex, 0);

    for (let step = 1; step <= 6; step++) {
      nextBtn.click();
      const expectedIdx = step % 6;
      assert.equal(controller.getState().selectedVaultStageIndex, expectedIdx);
      controller.drawSeed3DArtifact(1000 + step * 500);
    }
    prevBtn.click();
    assert.equal(controller.getState().selectedVaultStageIndex, 5); // Wrapped around to Cosmic Sovereign

    // Switch animation modes: morph -> hyper -> orbit
    const morphBtn = document.querySelector('[data-seed-anim="morph"]');
    const hyperBtn = document.querySelector('[data-seed-anim="hyper"]');
    const orbitBtn = document.querySelector('[data-seed-anim="orbit"]');
    const stage3dEl = document.getElementById('seed-3d-stage');

    morphBtn.click();
    assert.equal(controller.getState().seedAnimMode, 'morph');
    assert.equal(stage3dEl.getAttribute('data-anim-mode'), 'morph');
    controller.drawSeed3DArtifact(2500);

    hyperBtn.click();
    assert.equal(controller.getState().seedAnimMode, 'hyper');
    assert.equal(stage3dEl.getAttribute('data-anim-mode'), 'hyper');
    controller.drawSeed3DArtifact(3500);

    orbitBtn.click();
    assert.equal(controller.getState().seedAnimMode, 'orbit');
    assert.equal(stage3dEl.getAttribute('data-anim-mode'), 'orbit');

    // Trigger Energy Burst (+5 XP & shockwave ring)
    const xpBeforeBurst = controller.getState().xp;
    document.getElementById('btn-pulse-seed').click();
    assert.equal(controller.getState().xp, xpBeforeBurst + 5);
    assert.equal(stage3dEl.classList.contains('pulsing-burst'), true);
    controller.drawSeed3DArtifact(4200);
    assert.ok(canvasArcCalls > 20, 'Canvas 3D renderer drew spheres, spores, and shockwaves');

    // --- B. Comprehensive Statistics Controls & Interactive Analytics ---
    controller.switchTab('stats');

    // 1. Period Filter Pills ('7d' -> '30d' -> '90d')
    assert.equal(document.getElementById('stat-time-saved').textContent, '52');
    assert.equal(document.getElementById('stat-improvement-pct').textContent, '29');

    document.querySelector('[data-stats-period="30d"]').click();
    assert.equal(controller.getState().statsPeriod, '30d');
    assert.equal(document.getElementById('stat-time-saved').textContent, '218'); // 52 * 4.2 rounded
    assert.match(document.getElementById('stat-time-caption').textContent, /30 days/i);

    document.querySelector('[data-stats-period="90d"]').click();
    assert.equal(controller.getState().statsPeriod, '90d');
    assert.equal(document.getElementById('stat-time-saved').textContent, '650'); // 52 * 12.5
    assert.match(document.getElementById('stat-time-caption').textContent, /90 days/i);

    document.querySelector('[data-stats-period="7d"]').click();
    assert.equal(document.getElementById('stat-time-saved').textContent, '52');

    // 2. Verify 4 KPI cards & 90-Day Brain Rewiring bars
    assert.equal(document.getElementById('stat-kpi-current-streak').textContent, '2d 12h');
    assert.equal(document.getElementById('stat-kpi-best-streak').textContent, '14d 6h');
    assert.equal(document.getElementById('stat-kpi-urges-total').textContent, '9x');
    assert.equal(document.querySelectorAll('#brain-recovery-bars .brain-bar-row').length, 4);

    // 3. 30-Day Consistency Heatmap interaction
    const heatmapCells = document.querySelectorAll('#thirty-days-heatmap .heatmap-cell');
    assert.equal(heatmapCells.length, 30);
    heatmapCells[0].click();
    assert.equal(heatmapCells[0].classList.contains('selected'), true);
    assert.match(document.getElementById('day-inspector-text').textContent, /Hari 1/i);

    // 4. 7-Day Energy & Focus Check-In (Level 5 updates average badge and state)
    const energyBtn5 = document.querySelector('[data-energy-level="5"]');
    energyBtn5.click();
    assert.equal(controller.getState().energyHistory[6], 5);
    assert.equal(energyBtn5.classList.contains('active'), true);
    assert.ok(document.getElementById('energy-avg-badge').textContent.includes('/ 5.0'));

    // 5. Peak Time Vulnerability Grid
    assert.equal(document.querySelectorAll('#time-vulnerability-grid .vuln-slot-card').length, 4);
    assert.match(document.getElementById('vuln-peak-badge').textContent, /Puncak: Larut Malam/i);

    // 6. Quick Urge Victory Logger (+25 XP & increments urge counters)
    const urgesBefore = controller.getState().totalUrgesOvercome;
    const xpBeforeUrge = controller.getState().xp;
    document.getElementById('btn-stats-quick-urge').click();
    assert.equal(controller.getState().totalUrgesOvercome, urgesBefore + 1);
    assert.equal(controller.getState().xp, xpBeforeUrge + 25);
    assert.equal(document.getElementById('stat-kpi-urges-total').textContent, `${urgesBefore + 1}x`);
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 12. Day One Genesis Simulation (Fresh First-Time Open Flow)
// ============================================================================
test('12. Day One Genesis Simulation (Fresh First-Time Open Flow)', () => {
  const nowMs = 1_700_000_000_000;
  const day1State = SeedApp.createDayOneState(nowMs);

  assert.equal(day1State.streakStartTime, nowMs);
  assert.equal(day1State.longestStreakHours, 0);
  assert.equal(day1State.urgesOvercomeToday, 0);
  assert.equal(day1State.totalUrgesOvercome, 0);
  assert.equal(day1State.lastPledgeDate, null);
  assert.equal(day1State.selectedVaultStageIndex, 0);

  // Day One Statistics Metrics - must strictly start at 0
  const stats = SeedApp.computeStatisticsMetrics(day1State, nowMs);
  assert.equal(stats.timeSavedValue, 0);
  assert.equal(stats.improvementPct, 0);
  assert.equal(stats.cleanScorePct, 0);
  assert.equal(stats.currentStreakLabel, '0d 0h');
  assert.equal(stats.bestStreakLabel, '0d 0h (Day 1)');
  assert.equal(stats.deepWorkSessionsRecovered, 0);

  // Day One Brain Recovery Telemetry - must strictly be 0% across all 4 metrics
  const brainDay1 = SeedApp.computeBrainRecoveryMetrics(0, false, true);
  assert.equal(brainDay1.overallPct, 0);
  assert.ok(brainDay1.metrics.every((m) => m.pct === 0));
  assert.match(brainDay1.phaseBadge, /Fase 1/i);

  // Day One 30-Day Heatmap Matrix - must have 1 active/today cell and 29 empty targets
  const matrixDay1 = SeedApp.computeThirtyDayMatrix(day1State, nowMs);
  assert.equal(matrixDay1.cleanCount, 0);
  assert.equal(matrixDay1.relapseCount, 0);
  assert.equal(matrixDay1.consistencyPct, 0);
  assert.equal(matrixDay1.cells[0].status, 'today');
  assert.ok(matrixDay1.cells.slice(1).every((c) => c.status === 'empty'));

  // Day One Seed Vault Progress (0% towards Origin Seed)
  const vault = SeedApp.computeVaultProgress(0);
  assert.equal(vault.collectedCount, 0);
  assert.equal(vault.progressPercent, 0);
  assert.equal(vault.nextStage.name, 'Origin Seed');
  assert.equal(vault.nextLabel, 'Next: Origin Seed (24 hours)');

  // Full DOM Genesis Interaction Simulation
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // 1. Trigger Day 1 simulation via the top toolbar chip
    const day1Chip = document.getElementById('chip-preset-day1');
    assert.ok(day1Chip, 'Day 1 chip exists in top toolbar');
    day1Chip.click();

    // Verify timer starts at 0d 0h 0m
    assert.equal(document.getElementById('timer-days').textContent, '0');
    assert.equal(document.getElementById('timer-hours').textContent, '0');
    assert.equal(document.getElementById('timer-minutes').textContent, '0');

    // Verify Genesis Onboarding Modal opens
    const genesisModal = document.getElementById('modal-genesis-welcome');
    assert.ok(genesisModal.classList.contains('open'), 'Genesis Onboarding modal opens on Day 1 start');

    // 2. Click Start Day One button
    const startGenesisBtn = document.getElementById('btn-start-genesis');
    assert.ok(startGenesisBtn);
    startGenesisBtn.click();
    assert.equal(genesisModal.classList.contains('open'), false, 'Modal closes after clicking start');

    // 3. Verify Day 1 Pledge is unlocked and can be completed
    assert.equal(document.getElementById('btn-hold-pledge').classList.contains('pledged-done'), false);
    controller.completeDailyPledge();
    assert.equal(document.getElementById('btn-hold-pledge').classList.contains('pledged-done'), true);

    // 4. Test Day 1 simulation button inside Shield (Settings) tab
    controller.switchTab('shield');
    const simulateDay1ShieldBtn = document.getElementById('btn-simulate-day1');
    assert.ok(simulateDay1ShieldBtn);
    simulateDay1ShieldBtn.click();
    assert.ok(genesisModal.classList.contains('open'));
    controller.closeGenesisWelcomeModal();
    assert.equal(genesisModal.classList.contains('open'), false);

    // 5. Verify Day 1 Statistics screen renders strictly from 0
    controller.switchTab('stats');
    assert.equal(document.getElementById('stat-time-saved').textContent, '0');
    assert.equal(document.getElementById('stat-improvement-pct').textContent, '0');
    assert.equal(document.getElementById('stat-reboot-overall-pct').textContent, '0%');
    assert.equal(document.getElementById('stat-kpi-clean-score').textContent, '0%');
    assert.match(document.getElementById('heatmap-summary-label').textContent, /0\/30 Bersih \(0%\)/);
    assert.match(document.getElementById('energy-avg-badge').textContent, /0\.0 \/ 5\.0/);
    assert.equal(document.getElementById('brain-focus-sessions-chip').textContent, '0 Sesi Deep Work Pulih');
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 13. Seed Vault Locked Stages: Remaining Time Formatter, Stasis Barrier Visuals & Padlock Indicators
// ============================================================================
test('13. Seed Vault Locked Stages: Remaining Time Formatter, Stasis Barrier Visuals & Padlock Indicators', () => {
  // A. Test formatRemainingTime pure helper across all boundary conditions
  assert.equal(SeedApp.formatRemainingTime(0), '0 jam');
  assert.equal(SeedApp.formatRemainingTime(-5), '0 jam');
  assert.equal(SeedApp.formatRemainingTime(NaN), '0 jam');
  assert.equal(SeedApp.formatRemainingTime(0.5), '30 menit');
  assert.equal(SeedApp.formatRemainingTime(0.25), '15 menit');
  assert.equal(SeedApp.formatRemainingTime(11.3), '11 jam');
  assert.equal(SeedApp.formatRemainingTime(24), '24 jam');
  assert.equal(SeedApp.formatRemainingTime(25), '1 hari 1 jam');
  assert.equal(SeedApp.formatRemainingTime(48), '2 hari');
  assert.equal(SeedApp.formatRemainingTime(72), '3 hari');
  assert.equal(SeedApp.formatRemainingTime(168), '7 hari');
  assert.equal(SeedApp.formatRemainingTime(336), '14 hari');
  assert.equal(SeedApp.formatRemainingTime(720), '30 hari');
  assert.equal(SeedApp.formatRemainingTime(2160), '90 hari');
  assert.equal(SeedApp.formatRemainingTime(107.3), '4 hari 11 jam');

  // B. Test computeVaultProgress with isLocked and remaining attributes
  // At 0 hours: all 6 stages are locked
  const zeroVault = SeedApp.computeVaultProgress(0);
  assert.equal(zeroVault.stages.every((s) => s.isLocked && !s.collected), true);
  assert.equal(zeroVault.stages[0].remainingLabel, '24 jam');
  assert.equal(zeroVault.stages[1].remainingLabel, '3 hari');
  assert.equal(zeroVault.stages[5].remainingLabel, '90 hari');

  // At 24 hours: Stage 0 is collected, stages 1-5 are locked
  const h24Vault = SeedApp.computeVaultProgress(24);
  assert.equal(h24Vault.stages[0].collected, true);
  assert.equal(h24Vault.stages[0].isLocked, false);
  assert.equal(h24Vault.stages[1].isLocked, true);
  assert.equal(h24Vault.stages[1].remainingHours, 48);
  assert.equal(h24Vault.stages[1].remainingLabel, '2 hari');

  // C. Full DOM Verification: Locked vs Unlocked UI in Tab 2
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000',
    runScripts: 'outside-only'
  });

  let canvasArcCalls = 0;
  const canvasFillTextCalls = [];
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() { canvasArcCalls += 1; },
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {},
    fillText(text, x, y) {
      canvasFillTextCalls.push({ text, x, y });
    }
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    controller.switchTab('vault');

    // 1. Initial State at Reference Streak (~60.7 hours):
    // Stage 0 (Origin Seed) is selected and collected
    const statusPill = document.getElementById('seed-status-pill');
    const stageBox = document.getElementById('seed-3d-stage');
    const stasisOverlay = document.getElementById('seed-stasis-overlay');

    assert.equal(statusPill.textContent, 'Collected');
    assert.equal(statusPill.classList.contains('collected'), true);
    assert.equal(stageBox.hasAttribute('data-locked'), false);
    assert.equal(stasisOverlay.classList.contains('active'), false);

    // Grid cards inspection: card 0 is unlocked, cards 1..5 are locked
    const gridCards = document.querySelectorAll('#vault-stages-grid .vault-stage-item');
    assert.equal(gridCards.length, 6);
    assert.equal(gridCards[0].classList.contains('unlocked'), true);
    assert.ok(gridCards[0].querySelector('.stage-status-badge.collected'));

    for (let i = 1; i < 6; i++) {
      assert.equal(gridCards[i].classList.contains('locked'), true);
      const lockBadge = gridCards[i].querySelector('.stage-status-badge.locked');
      assert.ok(lockBadge);
      assert.match(lockBadge.textContent, /Locked • Butuh/);
      assert.ok(gridCards[i].querySelector('.stage-locked-watermark'));
    }

    // 2. Select locked stage 1 (Sprout Core):
    gridCards[1].click();
    assert.equal(controller.getState().selectedVaultStageIndex, 1);
    assert.equal(statusPill.textContent, 'Locked');
    assert.equal(statusPill.classList.contains('locked'), true);
    assert.equal(stageBox.getAttribute('data-locked'), 'true');
    assert.equal(stasisOverlay.classList.contains('active'), true);
    assert.match(document.getElementById('stasis-lock-time').textContent, /Butuh 11 jam lagi/);

    // Draw 3D canvas for locked stage and verify drawing executed
    controller.drawSeed3DArtifact(2000);
    assert.ok(canvasArcCalls > 10, 'Canvas drew stasis energy rings and rune nodes');
    assert.ok(canvasFillTextCalls.some((c) => c.text === 'LOCKED'), 'Canvas drew LOCKED status');
    assert.ok(canvasFillTextCalls.some((c) => c.text.includes('Butuh 11 jam lagi')), 'Canvas drew remaining time');

    // 3. Step to locked stage 5 (Cosmic Sovereign):
    const prevBtn = document.getElementById('btn-vault-step-prev');
    prevBtn.click(); // wraps from 1 to 0
    prevBtn.click(); // wraps from 0 to 5
    assert.equal(controller.getState().selectedVaultStageIndex, 5);
    assert.equal(statusPill.textContent, 'Locked');
    assert.match(document.getElementById('stasis-lock-time').textContent, /Butuh 87 hari/);

    // 4. Click back to stage 0 (Origin Seed) -> status returns to Collected and stasis deactivated
    gridCards[0].click();
    assert.equal(statusPill.textContent, 'Collected');
    assert.equal(stageBox.hasAttribute('data-locked'), false);
    assert.equal(stasisOverlay.classList.contains('active'), false);
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 14. Epic Cosmic Unlock Celebration Flow: Shockwave, Modal Banner, Fireworks Burst, Victory Chime & XP Claim
// ============================================================================
test('14. Epic Cosmic Unlock Celebration Flow: Shockwave, Modal Banner, Fireworks Burst, Victory Chime & XP Claim', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost:3000',
    runScripts: 'outside-only'
  });

  let audioOscillatorStarted = false;
  dom.window.AudioContext = class {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
      this.state = 'running';
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {},
        start() {
          audioOscillatorStarted = true;
        },
        stop() {}
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {}
      };
    }
    resume() {}
  };

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {},
    fillText() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // 1. Manually trigger stage celebration for Sprout Core (Stage 1)
    const sproutStage = SeedApp.SEED_STAGES[1];
    controller.triggerStageUnlockCelebration(sproutStage);

    const unlockModal = document.getElementById('modal-stage-unlocked');
    assert.ok(unlockModal.classList.contains('open'), 'Celebration modal opens on stage unlock');
    assert.equal(document.getElementById('unlock-modal-title').textContent, 'ARTEFAK KOSMIK BARU TERBUKA!');
    assert.equal(document.getElementById('celebration-stage-name').textContent, 'Sprout Core');
    assert.match(document.getElementById('celebration-stage-desc').textContent, /Sprout Core|3 days/i);
    assert.ok(audioOscillatorStarted, 'Victory chime AudioContext oscillator was triggered');

    const phoneWrapper = document.getElementById('phone-frame-wrapper');
    assert.ok(phoneWrapper.classList.contains('cosmic-screen-shockwave'), 'Radiant screen shockwave class triggered');

    // 2. Claim Reward (+100 XP)
    const xpBefore = controller.getState().xp;
    const claimBtn = document.getElementById('btn-claim-unlock-xp');
    assert.ok(claimBtn);
    assert.match(claimBtn.textContent, /\+100 XP/);

    claimBtn.click();
    assert.equal(controller.getState().xp, xpBefore + 100, 'Claim button granted +100 XP');
    assert.match(claimBtn.textContent, /Berhasil Diklaim/i);

    // Modal can be closed programmatically
    controller.closeStageUnlockModal();
    assert.equal(unlockModal.classList.contains('open'), false);

    // 3. Milestone Preset Progression Flow (Simulating Day 1 -> 24h milestone unlock)
    const day1Chip = document.getElementById('chip-preset-day1');
    day1Chip.click();
    assert.deepEqual(controller.getState().unlockedStageIds, [], 'Day 1 resets unlocked stages to empty');

    // Click 24h preset (1 day) -> Origin Seed unlocks and triggers celebration
    const chip24h = document.querySelector('[data-preset-streak="1"]');
    assert.ok(chip24h);
    chip24h.click();

    assert.ok(controller.getState().unlockedStageIds.includes('origin-seed'), 'Origin Seed added to unlockedStageIds');
    assert.ok(unlockModal.classList.contains('open'), 'Celebration modal opened for Origin Seed');
    assert.equal(document.getElementById('celebration-stage-name').textContent, 'Origin Seed');
    controller.closeStageUnlockModal();

    // Click 3d preset -> Sprout Core unlocks and triggers celebration
    const chip3d = document.querySelector('[data-preset-streak="3"]');
    assert.ok(chip3d);
    chip3d.click();
    assert.ok(controller.getState().unlockedStageIds.includes('sprout-core'), 'Sprout Core added to unlockedStageIds');
    assert.ok(unlockModal.classList.contains('open'), 'Celebration modal opened for Sprout Core');
    assert.equal(document.getElementById('celebration-stage-name').textContent, 'Sprout Core');

    // 4. Test Double-Claim Protection Guard
    const xpBeforeDoubleClaim = controller.getState().xp;
    controller.claimStageUnlockReward(sproutStage, 1);
    const xpAfterFirstClaim = controller.getState().xp;
    assert.equal(xpAfterFirstClaim, xpBeforeDoubleClaim + 100);
    // Attempt second claim while still active -> should not grant additional XP
    controller.claimStageUnlockReward(sproutStage, 1);
    assert.equal(controller.getState().xp, xpAfterFirstClaim, 'Double claim was blocked by guard');
    controller.closeStageUnlockModal();

    // 5. Test Close Button (#btn-close-stage-unlocked)
    controller.triggerStageUnlockCelebration(sproutStage);
    assert.ok(unlockModal.classList.contains('open'));
    const closeBtn = document.getElementById('btn-close-stage-unlocked');
    assert.ok(closeBtn, 'Close button exists in celebration modal');
    closeBtn.click();
    assert.equal(unlockModal.classList.contains('open'), false, 'Close button dismissed modal');

    // 6. Test Escape Key Dismissal
    controller.triggerStageUnlockCelebration(sproutStage);
    assert.ok(unlockModal.classList.contains('open'));
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(unlockModal.classList.contains('open'), false, 'Escape key dismissed modal');

    // 7. Test sanitizeLoadedState with missing unlockedStageIds
    const now = Date.now();
    // Case A: 0h streak (Day 1) -> empty unlockedStageIds
    const sanitized0h = controller.sanitizeLoadedState({ streakStartTime: now }, SeedApp.createDefaultState(), now);
    assert.deepEqual(sanitized0h.unlockedStageIds, [], '0h streak initializes empty unlockedStageIds');

    // Case B: 90d streak (2160+ hours) -> all 6 stages unlocked
    const sanitized90d = controller.sanitizeLoadedState(
      { streakStartTime: now - 91 * 86400 * 1000 },
      SeedApp.createDefaultState(),
      now
    );
    assert.equal(sanitized90d.unlockedStageIds.length, 6, '90d streak initializes all 6 unlockedStageIds');
  } finally {
    controller.destroy();
  }
});

test('15. Custom Streak Start Date & Time pure calculations, parsing, formatting, and boundary guards', () => {
  const fixedNow = 1792468800000; // Tuesday, Oct 20, 2026, 11:00:00 (approx)
  const d = new Date(fixedNow);
  const expectedLocal = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  // 1. Test formatDateTimeLocal
  const formatted = SeedApp.formatDateTimeLocal(fixedNow);
  assert.equal(formatted, expectedLocal);
  assert.equal(SeedApp.formatDateTimeLocal(NaN), '');
  assert.equal(SeedApp.formatDateTimeLocal(null), '');

  // 2. Test parseDateTimeLocal
  const parsed = SeedApp.parseDateTimeLocal(expectedLocal);
  assert.ok(Number.isFinite(parsed));
  const reparsed = new Date(parsed);
  assert.equal(reparsed.getFullYear(), d.getFullYear());
  assert.equal(reparsed.getMonth(), d.getMonth());
  assert.equal(reparsed.getDate(), d.getDate());
  assert.equal(reparsed.getHours(), d.getHours());
  assert.equal(reparsed.getMinutes(), d.getMinutes());

  // 3. Test invalid and boundary inputs for parseDateTimeLocal
  assert.equal(SeedApp.parseDateTimeLocal(''), null);
  assert.equal(SeedApp.parseDateTimeLocal(null), null);
  assert.equal(SeedApp.parseDateTimeLocal('not-a-date'), null);

  // 4. Test formatIndonesianDateTime
  const indoStr = SeedApp.formatIndonesianDateTime(fixedNow);
  assert.ok(indoStr.includes(String(d.getFullYear())));
  assert.ok(indoStr.includes(String(d.getDate())));
  assert.equal(SeedApp.formatIndonesianDateTime(NaN), '-');

  // 5. Test getStageForHours
  assert.equal(SeedApp.getStageForHours(0).id, 'origin-seed');
  assert.equal(SeedApp.getStageForHours(24).id, 'origin-seed');
  assert.equal(SeedApp.getStageForHours(72).id, 'sprout-core');
  assert.equal(SeedApp.getStageForHours(168).id, 'nebula-flora');
  assert.equal(SeedApp.getStageForHours(336).id, 'aether-crystal');
  assert.equal(SeedApp.getStageForHours(720).id, 'supernova-tree');
  assert.equal(SeedApp.getStageForHours(2160).id, 'cosmic-sovereign');
});

test('16. Full DOM Integration: Tab 5 Custom Streak Start Date & Time picker, Live Preview, Instant Reset/Yesterday buttons, System Clock, and LocalStorage persistence', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // 1. Verify system clock updated in status bar
    const clockEl = document.getElementById('ios-clock');
    assert.ok(clockEl);
    assert.match(clockEl.textContent, /^\d{2}:\d{2}$/, 'Clock matches HH:mm format');

    // 2. Switch to Tab 5 (Shield & Settings)
    controller.switchTab('shield');
    const dtInput = document.getElementById('input-streak-start-datetime');
    assert.ok(dtInput, 'Datetime-local input element exists');
    assert.ok(dtInput.value.length >= 16, 'Datetime-local initialized with value');

    const previewEl = document.getElementById('streak-start-preview-text');
    assert.ok(previewEl, 'Streak start preview element exists');
    assert.match(previewEl.textContent, /Durasi Berjalan:/, 'Preview describes running duration');

    // 3. Simulate setting custom start time to 3 days ago (72 hours)
    const threeDaysAgoMs = Date.now() - 3 * 86400 * 1000 - 15000;
    dtInput.value = SeedApp.formatDateTimeLocal(threeDaysAgoMs);
    dtInput.dispatchEvent(new dom.window.Event('input'));

    assert.match(previewEl.textContent, /3 hari/, 'Preview reflects 3 days duration');
    assert.match(previewEl.textContent, /Sprout Core/, 'Preview reflects Sprout Core stage');

    // 4. Click Save Button (#btn-save-streak-start)
    const saveBtn = document.getElementById('btn-save-streak-start');
    saveBtn.click();

    // Verify state and localStorage updated
    const savedState = JSON.parse(localStorage.getItem(SeedApp.STORAGE_KEY));
    assert.ok(Math.abs(savedState.streakStartTime - SeedApp.parseDateTimeLocal(dtInput.value)) < 1000);

    // Verify Tab 1 Home screen updated
    controller.switchTab('home');
    assert.equal(document.getElementById('timer-days').textContent, '3');
    const startMetaEl = document.getElementById('home-streak-start-meta');
    assert.ok(startMetaEl);
    assert.match(startMetaEl.textContent, /Dimulai:/);

    // 5. Test Quick Action: Start 24h Ago (#btn-set-streak-yesterday)
    controller.switchTab('shield');
    const yesterdayBtn = document.getElementById('btn-set-streak-yesterday');
    yesterdayBtn.click();
    assert.equal(document.getElementById('timer-days').textContent, '1');

    // 6. Test Quick Action: Start Right Now (#btn-set-streak-now)
    const nowBtn = document.getElementById('btn-set-streak-now');
    nowBtn.click();
    assert.equal(document.getElementById('timer-days').textContent, '0');
    assert.equal(document.getElementById('timer-hours').textContent, '0');

    // 7. Test Future Date validation in preview
    const futureMs = Date.now() + 3600 * 1000 * 5; // 5 hours in future
    dtInput.value = SeedApp.formatDateTimeLocal(futureMs);
    dtInput.dispatchEvent(new dom.window.Event('input'));
    assert.match(previewEl.textContent, /Waktu di masa depan/);

    // 8. Test Invalid Date rejection on Save
    dtInput.value = 'invalid-date';
    saveBtn.click();
    // Streak time is untouched
    assert.ok(Number.isFinite(controller.getState().streakStartTime));
  } finally {
    controller.destroy();
  }
});

test('17. Calendar Alignment & Daily Rollover: 7-day glance day letter & name alignment, midnight rollover date shifting, and state persistence', () => {
  // 17a. Verify buildAlignedSevenDays aligns days with local day of week
  const fixedTuesday = new Date(2026, 9, 20, 12, 0, 0).getTime(); // Tuesday, Oct 20, 2026
  const alignedDays = SeedApp.buildAlignedSevenDays(SeedApp.createDefaultState(fixedTuesday).sevenDays, fixedTuesday);

  assert.equal(alignedDays.length, 7);
  // Index 6 is Tuesday
  assert.equal(alignedDays[6].dayLetter, 'T');
  assert.match(alignedDays[6].label, /Selasa \(Hari Ini\)/);
  assert.equal(alignedDays[6].status, 'today');

  // Index 5 is Monday
  assert.equal(alignedDays[5].dayLetter, 'M');
  assert.match(alignedDays[5].label, /Senin/);

  // Index 0 is Wednesday (6 days ago)
  assert.equal(alignedDays[0].dayLetter, 'W');
  assert.match(alignedDays[0].label, /Rabu/);

  // 17b. Rollover simulation across midnight: Oct 20 -> Oct 21
  // User pledged on Oct 20
  alignedDays[6].status = 'clean';
  alignedDays[6].note = 'Pledged clean';

  const fixedWednesday = new Date(2026, 9, 21, 0, 1, 0).getTime(); // Wednesday, Oct 21, 2026
  const rolledOver = SeedApp.buildAlignedSevenDays(alignedDays, fixedWednesday);

  // Yesterday (Oct 20, index 5) retains clean status
  assert.equal(rolledOver[5].dayLetter, 'T');
  assert.match(rolledOver[5].label, /Selasa/);
  assert.equal(rolledOver[5].status, 'clean');
  assert.equal(rolledOver[5].note, 'Pledged clean');

  // Today (Oct 21, index 6) is fresh today
  assert.equal(rolledOver[6].dayLetter, 'W');
  assert.match(rolledOver[6].label, /Rabu \(Hari Ini\)/);
  assert.equal(rolledOver[6].status, 'today');

  // 17c. Exported getTodayDateString helper returns YYYY-MM-DD
  assert.match(SeedApp.getTodayDateString(fixedTuesday), /^2026-10-20$/);
});

test('18. Edge Case Robustness: longestStreakHours 0-baseline growth, strict date-time parsing boundaries, and future scheduled streak start banner', () => {
  // 18a. sanitizeLoadedState preserves longestStreakHours: 0 (does NOT clamp to 24)
  const def = SeedApp.createDefaultState();
  const loadedDay1 = SeedApp.sanitizeLoadedState({ longestStreakHours: 0, streakStartTime: Date.now() }, def);
  assert.equal(loadedDay1.longestStreakHours, 0, 'Day 1 state must preserve longestStreakHours: 0 without artificial clamp');

  // 18b. parseDateTimeLocal handles seconds, whitespace, and rejects invalid dates like Feb 31
  const validWithSec = SeedApp.parseDateTimeLocal('2026-10-20T14:30:45');
  assert.ok(Number.isFinite(validWithSec));
  const dateWithSec = new Date(validWithSec);
  assert.equal(dateWithSec.getSeconds(), 45);

  const validSpaceSep = SeedApp.parseDateTimeLocal('2026-10-20 14:30:00');
  assert.ok(Number.isFinite(validSpaceSep));

  // Invalid dates must return null
  assert.equal(SeedApp.parseDateTimeLocal('2026-02-31T12:00'), null, 'Feb 31 is invalid calendar date');
  assert.equal(SeedApp.parseDateTimeLocal('2026-13-10T12:00'), null, 'Month 13 is invalid');
  assert.equal(SeedApp.parseDateTimeLocal('2026-10-20T25:00'), null, 'Hour 25 is invalid');
  assert.equal(SeedApp.parseDateTimeLocal('2026-10-20T12:60'), null, 'Minute 60 is invalid');

  // 18c. Full DOM test: Future streak start displays scheduled chip in Tab 1
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // Schedule streak 2 hours into the future
    const futureMs = Date.now() + 2 * 3600 * 1000;
    controller.setCustomStreakStartTime(futureMs);

    const startMetaEl = document.getElementById('home-streak-start-meta');
    assert.ok(startMetaEl);
    assert.match(startMetaEl.textContent, /Dijadwalkan:/, 'Meta chip indicates scheduled start');

    // Timer display shows 0 across all units
    assert.equal(document.getElementById('timer-days').textContent, '0');
    assert.equal(document.getElementById('timer-hours').textContent, '0');
    assert.equal(document.getElementById('timer-minutes').textContent, '0');
    assert.equal(document.getElementById('timer-seconds').textContent, '0');

    // Longest streak updates from 0 baseline when streak is active
    controller.getState().longestStreakHours = 0;
    const pastTenHoursMs = Date.now() - 10 * 3600 * 1000;
    controller.setCustomStreakStartTime(pastTenHoursMs);
    assert.equal(controller.getState().longestStreakHours, 10, 'longestStreakHours grew from 0 to 10');
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 19. Full Reset to Zero Verification (Fixing "pas di reset ininya ga ke reset")
// ============================================================================
test('19. Full Reset to Zero: btn-reset-all-zero, btn-set-streak-now, and relapse modal full reset clear all statistics to 0', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // A. Start from demo state with 14d 6h, 175 XP, 10 urges, 83% clean score
    controller.switchTab('shield');
    const resetAllBtn = document.getElementById('btn-reset-all-zero');
    assert.ok(resetAllBtn, 'Reset All to 0 button exists in Shield tab');

    // Click Reset All to 0
    resetAllBtn.click();

    // Verify state is clean Genesis
    const s = controller.getState();
    assert.equal(s.isDayOne, true);
    assert.equal(s.longestStreakHours, 0);
    assert.equal(s.xp, 0);
    assert.equal(s.totalUrgesOvercome, 0);

    // Verify Tab 4 Statistics is completely 0
    controller.switchTab('stats');
    assert.equal(document.getElementById('stat-time-saved').textContent, '0');
    assert.equal(document.getElementById('stat-improvement-pct').textContent, '0');
    assert.equal(document.getElementById('stat-reboot-overall-pct').textContent, '0%');
    assert.equal(document.getElementById('stat-kpi-clean-score').textContent, '0%');
    assert.equal(document.getElementById('stat-kpi-best-streak').textContent, '0d 0h (Day 1)');
    assert.equal(document.getElementById('stat-kpi-urges-total').textContent, '0x');

    // B. Test "Mulai Dari Sekarang" in Custom Streak Card
    controller.switchTab('shield');
    const setStreakNowBtn = document.getElementById('btn-set-streak-now');
    assert.ok(setStreakNowBtn);
    setStreakNowBtn.click();
    assert.equal(controller.getState().isDayOne, true);
    assert.equal(controller.getState().xp, 0);

    // C. Test Relapse Modal Full Reset button
    controller.switchTab('home');
    const openRelapseBtn = document.getElementById('btn-open-relapse');
    openRelapseBtn.click();
    const modal = document.getElementById('modal-relapse');
    assert.ok(modal.classList.contains('open'));

    const relapseFullResetBtn = document.getElementById('btn-relapse-full-reset');
    assert.ok(relapseFullResetBtn);
    relapseFullResetBtn.click();

    assert.equal(modal.classList.contains('open'), false, 'Relapse modal closed after full reset');
    assert.equal(controller.getState().isDayOne, true);
    assert.equal(controller.getState().longestStreakHours, 0);
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 20. Principal Apple Design Award UI/UX (Swiss Editorial + Deep Cosmic Space)
// ============================================================================
test('20. Swiss Editorial Typography + Deep Cosmic Space Anti-AI-Slop & Exact Screen Geometry Verification', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const cssPath = path.join(__dirname, '..', 'styles.css');
  const jsPath = path.join(__dirname, '..', 'app.js');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  // 1. Strict Anti-Emoji Rule: zero emojis in HTML & JS (only minimal ✕ and ▶ allowed per Rule 2)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(htmlContent.replace(/✕/g, '')), false, 'Zero emojis in index.html');
  assert.equal(emojiRegex.test(jsContent.replace(/✕/g, '')), false, 'Zero emojis in app.js');

  // 2. Global Canvas & Atmosphere (#03040B, 393px x 852px, rounded-[48px], tabular-nums, #4D7CFE)
  assert.match(cssContent, /#03040B/i, 'Abyssal cosmos #03040B background present');
  assert.match(cssContent, /width:\s*393px/i, 'iPhone 16 Pro 393px width');
  assert.match(cssContent, /height:\s*852px/i, 'iPhone 16 Pro 852px height');
  assert.match(cssContent, /border-radius:\s*48px/i, '48px viewport border radius');
  assert.match(cssContent, /#4D7CFE/i, 'Electric Sky Blue #4D7CFE accent present');
  assert.match(cssContent, /tabular-nums/i, 'tabular-nums typography enforced');

  // 3. DOM Verification of Screen A, B, C, D
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/',
    pretendToBeVisual: true
  });

  const recordedSeedArcs = [];
  dom.window.HTMLCanvasElement.prototype.getContext = function () {
    const isSeedCanvas = this && this.id === 'seed-3d-canvas';
    return {
      clearRect() {},
      createRadialGradient: () => ({ addColorStop() {} }),
      beginPath() {},
      arc(x, y, r) {
        if (isSeedCanvas) {
          recordedSeedArcs.push({ x, y, r });
        }
      },
      fill() {},
      stroke() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      ellipse() {},
      scale() {},
      fillText() {}
    };
  };

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();
  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // Verify 60-80 micro-star particles generated inside #phone-inner-stars
    const starParticles = document.querySelectorAll('#phone-inner-stars .micro-star-particle');
    assert.ok(starParticles.length >= 60 && starParticles.length <= 80, `Expected 60-80 stars, got ${starParticles.length}`);

    // Verify Screen B (Origin Seed) has no useless X button (#btn-vault-prev) & has exact description & nurture time
    assert.equal(document.getElementById('btn-vault-prev'), null, 'Useless top-left X button removed from Seed Vault');
    assert.equal(
      document.getElementById('seed-hero-description').textContent,
      'Enhanced mental clarity, self-esteem, and relationships.'
    );
    assert.equal(document.getElementById('seed-nurture-time').textContent, '24 hours');

    // Verify all circles drawn in #seed-3d-canvas across orbit, morph, and hyper modes never clip outside 280x280
    ['orbit', 'morph', 'hyper'].forEach((mode) => {
      document.querySelector(`[data-seed-anim="${mode}"]`).click();
      for (let tStep = 0; tStep < 6; tStep++) {
        controller.drawSeed3DArtifact(tStep * 750);
      }
    });
    assert.ok(recordedSeedArcs.length > 50, 'Seed 3D canvas recorded arc draws');
    recordedSeedArcs.forEach(({ x, y, r }) => {
      // Only check full canvas coordinate arcs (not local translated lock icons near 0,0)
      if (x > 40 && y > 40) {
        assert.ok(x - r >= 0 && x + r <= 280, `Horizontal circle bounds clipped: x=${x}, r=${r}`);
        assert.ok(y - r >= 0 && y + r <= 280, `Vertical circle bounds clipped: y=${y}, r=${r}`);
      }
    });

    // Verify Screen C (Rewire) completed count string "32421 users completed"
    assert.equal(document.getElementById('rewire-completed-count').textContent, '32421 users completed');

    // Verify Screen D (Statistics) 7-Day Glance letters S, M, T, W, T, F, S
    const dayLetters = Array.from(document.querySelectorAll('#seven-days-row .day-circle')).map((el) => el.textContent);
    assert.deepEqual(dayLetters, ['S', 'M', 'T', 'W', 'T', 'F', 'S']);

    // Verify 60fps Phone Cosmos Canvas & SOS Orb FX Canvas animations (idle & SOS active)
    assert.ok(document.getElementById('phone-cosmos-canvas'), 'Phone cosmos background canvas exists');
    assert.ok(document.getElementById('sos-orb-fx-canvas'), 'SOS orb 60fps FX canvas exists');
    controller.drawPhoneCosmosCanvas(2500);
    controller.drawSosOrbFx(2500);
    assert.match(document.getElementById('orb-outer-shell').style.transform, /scale3d/);

    controller.openSosMode();
    controller.drawSosOrbFx(3200);
    assert.match(document.getElementById('orb-outer-shell').style.transform, /scale3d/);
    controller.closeSosMode();
  } finally {
    controller.destroy();
  }
});

// ============================================================================
// 21. Official App Installation Website, Dual Manifests, Route Aliases & Pure Helpers
// ============================================================================
test('21. Official App Installation Website: resolveAppEdition, buildStandaloneInstallerHtml, Dual Manifests, Anti-Emoji & Server Routes (/install, /boost, /download)', async () => {
  // 21a. resolveAppEdition pure resolution priority (query param > stored preference > default 'demo')
  assert.equal(SeedApp.resolveAppEdition('?edition=release', null), 'release');
  assert.equal(SeedApp.resolveAppEdition('?edition=rilis', null), 'release');
  assert.equal(SeedApp.resolveAppEdition('?edition=prod', null), 'release');
  assert.equal(SeedApp.resolveAppEdition('?mode=clean', null), 'release');
  assert.equal(SeedApp.resolveAppEdition('?edition=demo', 'release'), 'demo');
  assert.equal(SeedApp.resolveAppEdition('?edition=sandbox', 'release'), 'demo');
  assert.equal(SeedApp.resolveAppEdition('', 'release'), 'release');
  assert.equal(SeedApp.resolveAppEdition('', 'demo'), 'demo');
  assert.equal(SeedApp.resolveAppEdition('', null), 'demo');
  assert.equal(SeedApp.resolveAppEdition('?edition=unknown', 'invalid'), 'demo');

  // Pathname-based route alias resolution (/release, /rilis, /demo)
  assert.equal(SeedApp.resolveAppEdition('', null, '/release'), 'release');
  assert.equal(SeedApp.resolveAppEdition('', 'demo', '/rilis/'), 'release');
  assert.equal(SeedApp.resolveAppEdition('', 'release', '/demo'), 'demo');

  // Verify sanitizeLoadedState preserves null entries in energyHistory for Day 1 / Release mode
  const freshRelease = SeedApp.createDayOneState(1700000000000);
  const sanitizedRelease = SeedApp.sanitizeLoadedState(JSON.parse(JSON.stringify(freshRelease)), freshRelease, 1700000000000);
  assert.deepEqual(sanitizedRelease.energyHistory, [null, null, null, null, null, null, null]);

  // 21b. buildStandaloneInstallerHtml generates self-contained launcher HTML for both editions
  const releaseInstaller = SeedApp.buildStandaloneInstallerHtml('release', 'https://example.com/');
  assert.match(releaseInstaller, /<!DOCTYPE html>/);
  assert.match(releaseInstaller, /Versi Rilis/);
  assert.match(releaseInstaller, /https:\/\/example\.com\/index\.html\?edition=release/);

  const demoInstaller = SeedApp.buildStandaloneInstallerHtml('demo', 'https://example.com');
  assert.match(demoInstaller, /Versi Demo/);
  assert.match(demoInstaller, /https:\/\/example\.com\/index\.html\?edition=demo/);

  // 21c. Verify manifest-release.json and manifest-demo.json schemas
  const manifestRelease = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest-release.json'), 'utf8'));
  const manifestDemo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest-demo.json'), 'utf8'));
  assert.equal(manifestRelease.id, 'seed-cosmic-reboot-release');
  assert.equal(manifestRelease.start_url, './index.html?edition=release');
  assert.equal(manifestDemo.id, 'seed-cosmic-reboot-demo');
  assert.equal(manifestDemo.start_url, './index.html?edition=demo');

  // 21d. Verify zero forbidden emojis in install.html and fixed viewport rules in styles.css
  const installHtml = fs.readFileSync(path.join(__dirname, '..', 'install.html'), 'utf8');
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(installHtml.replace(/✕/g, '')), false, 'Zero forbidden emojis in install.html');

  const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert.match(stylesCss, /\.install-portal-body\s+\.cosmic-modal-backdrop\s*\{[\s\S]*?position:\s*fixed;/);
  assert.match(stylesCss, /\.install-portal-body\s+\.cosmic-toast\s*\{[\s\S]*?position:\s*fixed;/);

  // 21e. Verify HTTP server serves /install, /boost, /download, /manifest-release.json, /manifest-demo.json
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  function fetchText(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${urlPath}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }).on('error', reject);
    });
  }

  try {
    for (const route of ['/install', '/install.html', '/boost', '/download']) {
      const res = await fetchText(route);
      assert.equal(res.statusCode, 200, `Route ${route} should return HTTP 200`);
      assert.match(res.body, /QUIT GOON<br \/>FOR GOOD\./);
      assert.match(res.body, /id="card-install-release"/);
      assert.match(res.body, /id="card-install-demo"/);
    }

    const relManifestRes = await fetchText('/manifest-release.json');
    assert.equal(relManifestRes.statusCode, 200);
    assert.match(relManifestRes.body, /seed-cosmic-reboot-release/);

    const demoManifestRes = await fetchText('/manifest-demo.json');
    assert.equal(demoManifestRes.statusCode, 200);
    assert.match(demoManifestRes.body, /seed-cosmic-reboot-demo/);

    const releaseAliasRes = await fetchText('/release');
    assert.equal(releaseAliasRes.statusCode, 200);
    assert.match(releaseAliasRes.body, /id="screen-home"/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ============================================================================
// 22. Full DOM Integration on install.html (initInstallPage)
// ============================================================================
test('22. Full DOM Integration on install.html: Showcase Posters, Edition Filter, Install Wizard Modal, Reset Storage & 10Hz Audio Preview', async () => {
  const installHtmlPath = path.join(__dirname, '..', 'install.html');
  const installHtmlContent = fs.readFileSync(installHtmlPath, 'utf8');

  const dom = new JSDOM(installHtmlContent, {
    url: 'http://localhost:4173/install.html',
    pretendToBeVisual: true
  });

  const createdFrequencies = [];
  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    resume() {}
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {}
        },
        connect() {}
      };
    }
    createStereoPanner() {
      return { pan: { setValueAtTime() {} }, connect() {} };
    }
    createOscillator() {
      return {
        type: 'sine',
        frequency: {
          setValueAtTime(hz) {
            createdFrequencies.push(hz);
          }
        },
        connect() {},
        start() {},
        stop() {},
        disconnect() {}
      };
    }
  }

  let seedCanvasArcCount = 0;
  dom.window.AudioContext = MockAudioContext;
  dom.window.HTMLCanvasElement.prototype.getContext = function () {
    const isSeedPreview = this && this.id === 'install-seed-canvas';
    return {
      clearRect() {},
      createRadialGradient: () => ({ addColorStop() {} }),
      beginPath() {},
      arc() {
        if (isSeedPreview) seedCanvasArcCount++;
      },
      fill() {},
      stroke() {},
      moveTo() {},
      lineTo() {},
      closePath() {},
      save() {},
      restore() {},
      translate() {},
      rotate() {},
      ellipse() {}
    };
  };

  let lastDownloadedHref = null;
  let lastDownloadedBlobText = '';
  dom.window.URL.createObjectURL = (blob) => {
    lastDownloadedHref = 'blob:seed-installer-url';
    if (blob && typeof blob.text === 'function') {
      blob.text().then((t) => {
        lastDownloadedBlobText = t;
      });
    }
    return lastDownloadedHref;
  };
  dom.window.URL.revokeObjectURL = () => {};

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();

  const installController = SeedApp.initInstallPage();
  assert.ok(installController, 'initInstallPage initialized controller');

  try {
    // 1. Verify Boost/Seed Reference Showcase Elements & 6 Distinct Reference Posters
    const heroSection = document.getElementById('hero-boost-showcase');
    assert.ok(heroSection);
    assert.ok(document.getElementById('boost-poster-statement'), 'Hero Panel 1 statement poster exists');
    assert.ok(document.getElementById('boost-poster-seed-orb'), 'Hero Panel 2 rising orb poster exists');
    assert.match(heroSection.textContent, /#1/);
    assert.match(heroSection.textContent, /App to Quit Goon/);
    assert.match(heroSection.textContent, /4\.7 ratings/);
    assert.match(heroSection.textContent, /QUIT GOON\s*FOR GOOD\./);
    assert.match(heroSection.textContent, /Science-Backed\s*Approach/);

    assert.ok(document.getElementById('poster-quit-porn'));
    assert.ok(document.getElementById('poster-gamify-journey'));
    assert.ok(document.querySelector('#poster-gamify-journey .ref-vault-close-circle'));
    assert.ok(document.getElementById('poster-rewire-brain'));
    assert.ok(document.getElementById('poster-track-progress'));
    assert.match(document.getElementById('poster-rewire-brain').textContent, /Immersive Hypnosis &/);
    assert.match(document.getElementById('poster-rewire-brain').textContent, /Binaural Sounds/);
    assert.ok(seedCanvasArcCount >= 12, '3D Origin Seed preview canvas rendered bumpy asteroid with craters');

    // 2. Verify Edition Filter Tabs (all, release, demo)
    const releaseCard = document.getElementById('card-install-release');
    const demoCard = document.getElementById('card-install-demo');
    document.querySelector('[data-edition-filter="release"]').click();
    assert.equal(releaseCard.classList.contains('hidden-by-filter'), false);
    assert.equal(demoCard.classList.contains('hidden-by-filter'), true);

    document.querySelector('[data-edition-filter="demo"]').click();
    assert.equal(releaseCard.classList.contains('hidden-by-filter'), true);
    assert.equal(demoCard.classList.contains('hidden-by-filter'), false);

    document.querySelector('[data-edition-filter="all"]').click();
    assert.equal(releaseCard.classList.contains('hidden-by-filter'), false);
    assert.equal(demoCard.classList.contains('hidden-by-filter'), false);

    // 3. Verify Interactive Installation Wizard Modal (#install-wizard-modal)
    const wizardModal = document.getElementById('install-wizard-modal');
    assert.equal(wizardModal.classList.contains('open'), false);

    document.getElementById('btn-install-release').click();
    assert.equal(wizardModal.classList.contains('open'), true);
    assert.equal(installController.getActiveModalEdition(), 'release');
    assert.equal(document.getElementById('install-manifest-link').getAttribute('href'), 'manifest-release.json');
    assert.equal(document.getElementById('btn-modal-open-app').getAttribute('href'), './index.html?edition=release');

    // Switch to Demo via Install Demo button
    document.getElementById('btn-install-demo').click();
    assert.equal(installController.getActiveModalEdition(), 'demo');
    assert.equal(document.getElementById('install-manifest-link').getAttribute('href'), 'manifest-demo.json');
    assert.equal(document.getElementById('btn-modal-open-app').getAttribute('href'), './index.html?edition=demo');

    // Simulate beforeinstallprompt event and trigger native PWA install button
    let promptCalled = false;
    const fakeInstallEvent = new dom.window.Event('beforeinstallprompt');
    fakeInstallEvent.prompt = () => {
      promptCalled = true;
    };
    fakeInstallEvent.userChoice = Promise.resolve({ outcome: 'accepted' });
    dom.window.dispatchEvent(fakeInstallEvent);

    const nativeBtn = document.getElementById('btn-modal-trigger-pwa');
    await nativeBtn.click();
    assert.equal(promptCalled, true, 'Deferred PWA prompt() was invoked');

    // Close modal via Escape key
    dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(wizardModal.classList.contains('open'), false);

    // 4. Verify Standalone HTML Installer Download embeds live origin URL
    document.getElementById('btn-download-release').click();
    assert.equal(lastDownloadedHref, 'blob:seed-installer-url');
    await new Promise((r) => setTimeout(r, 15));
    if (lastDownloadedBlobText) {
      assert.match(lastDownloadedBlobText, /http:\/\/localhost:4173\/index\.html\?edition=release/);
    }

    // 5. Verify Reset Release to 00:00:00 and Reset Demo to 2d 12h 42m 23s
    document.getElementById('btn-reset-release-fresh').click();
    const relSaved = JSON.parse(localStorage.getItem(SeedApp.RELEASE_STORAGE_KEY));
    assert.equal(relSaved.isDayOne, true);
    assert.equal(relSaved.xp, 0);
    assert.deepEqual(relSaved.energyHistory, [null, null, null, null, null, null, null]);
    assert.match(document.getElementById('release-live-meta-preview').textContent, /0 XP/);

    document.getElementById('btn-reset-demo-default').click();
    const demoSaved = JSON.parse(localStorage.getItem(SeedApp.STORAGE_KEY));
    assert.equal(demoSaved.isDayOne, false);
    assert.equal(demoSaved.xp, 150);
    assert.match(document.getElementById('demo-live-timer-preview').textContent, /2d : 12h : 42m/);

    // 6. Verify Interactive 10Hz Alpha Binaural Audio Preview in Poster 3
    const audioBtn = document.getElementById('btn-poster-play-tape');
    audioBtn.click();
    assert.equal(audioBtn.getAttribute('aria-pressed'), 'true');
    assert.ok(createdFrequencies.includes(200) && createdFrequencies.includes(210), '200Hz + 210Hz (10Hz Alpha binaural) oscillators started');
    audioBtn.click();
    assert.equal(audioBtn.getAttribute('aria-pressed'), 'false');
  } finally {
    installController.destroy();
  }
});

// ============================================================================
// 23. Dual Edition App Isolation & Live Switching in index.html (Release vs Demo)
// ============================================================================
test('23. Dual Edition App Isolation & Live Switching: ?edition=release and /release start at 00:00:00 with isolated storage, preserve null energyHistory, sync URL, and block Demo presets', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/release',
    pretendToBeVisual: true
  });

  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {},
    scale() {},
    fillText() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();

  const controller = SeedApp.initBrowserApp();
  assert.ok(controller);

  try {
    // 1. Verify app booted on /release route alias in Release edition with clean 00:00:00 state and no in-app edition switchers
    assert.equal(controller.getActiveEdition(), 'release');
    assert.equal(controller.getActiveStorageKey(), SeedApp.RELEASE_STORAGE_KEY);
    assert.equal(document.body.dataset.appEdition, 'release');
    assert.equal(document.getElementById('app-manifest-link').getAttribute('href'), 'manifest-release.json');
    assert.equal(document.getElementById('home-edition-strip'), null, 'In-app home edition strip removed');
    assert.equal(document.getElementById('card-app-editions'), null, 'In-app Shield edition switcher card removed');
    assert.equal(document.getElementById('btn-restore-ref-demo'), null, 'Reset ke Data Demo button removed from Shield');
    assert.equal(document.getElementById('btn-edition-demo'), null, 'Desktop showcase Demo button removed');
    assert.equal(document.getElementById('btn-edition-release'), null, 'Desktop showcase Release button removed');
    assert.equal(document.getElementById('link-open-install-web'), null, 'Desktop showcase Web Install link removed');
    assert.equal(document.getElementById('shield-version-badge').textContent, 'SEED v1.0.0');
    assert.deepEqual(controller.getState().energyHistory, [null, null, null, null, null, null, null]);

    assert.equal(document.getElementById('timer-days').textContent, '0');
    assert.equal(document.getElementById('timer-hours').textContent, '0');
    assert.equal(document.getElementById('timer-minutes').textContent, '0');
    assert.equal(document.getElementById('home-xp-value').textContent, '0 XP');

    // 2. Verify Demo preset buttons are blocked while in Release mode
    const preset90Btn = document.querySelector('[data-preset-streak="2160"]');
    if (preset90Btn) preset90Btn.click();
    assert.equal(controller.getState().xp, 0, 'Demo presets cannot overwrite Release state');
    assert.equal(document.getElementById('timer-days').textContent, '0');

    // 3. Earn +50 XP via SOS victory in Release edition -> stored only in RELEASE_STORAGE_KEY
    controller.openSosMode();
    document.getElementById('btn-urge-victory').click();
    assert.equal(controller.getState().xp, 50);
    const savedRelease = JSON.parse(localStorage.getItem(SeedApp.RELEASE_STORAGE_KEY));
    assert.equal(savedRelease.xp, 50);
    assert.deepEqual(savedRelease.energyHistory, [null, null, null, null, null, null, null]);
    assert.equal(localStorage.getItem(SeedApp.STORAGE_KEY), null, 'Demo storage remains untouched while in Release edition');

    // 4. Switch live to Demo edition via controller API -> syncs URL search parameter
    controller.switchAppEdition('demo');
    assert.equal(controller.getActiveEdition(), 'demo');
    assert.equal(controller.getActiveStorageKey(), SeedApp.STORAGE_KEY);
    assert.equal(document.body.dataset.appEdition, 'demo');
    assert.equal(dom.window.location.search, '?edition=demo');
    assert.equal(document.getElementById('app-manifest-link').getAttribute('href'), 'manifest-demo.json');

    // Demo shows Reference 2d 12h 42m & 150 XP
    assert.equal(document.getElementById('timer-days').textContent, '2');
    assert.equal(document.getElementById('timer-hours').textContent, '12');
    assert.equal(document.getElementById('timer-minutes').textContent, '42');
    assert.equal(document.getElementById('home-xp-value').textContent, '150 XP');

    // 5. Switch back to Release edition via controller API -> restores user's 50 XP Release state & null energyHistory
    controller.switchAppEdition('release');
    assert.equal(controller.getActiveEdition(), 'release');
    assert.equal(dom.window.location.search, '?edition=release');
    assert.equal(controller.getState().xp, 50);
    assert.deepEqual(controller.getState().energyHistory, [null, null, null, null, null, null, null]);
    assert.equal(document.getElementById('home-xp-value').textContent, '50 XP');
  } finally {
    controller.destroy();
  }
});

test('24. Daily Commit Reminder Notification, Hold 3s to Commit Today Wording & App Version Card', async () => {
  const vm = require('node:vm');

  // 1. Pure helper unit tests
  assert.equal(SeedApp.APP_VERSION, '1.0.0');
  assert.equal(SeedApp.DEFAULT_REMINDER_TIME, '07:00');
  assert.equal(SeedApp.isValidReminderTime('07:00'), true);
  assert.equal(SeedApp.isValidReminderTime('23:59'), true);
  assert.equal(SeedApp.isValidReminderTime('00:00'), true);
  assert.equal(SeedApp.isValidReminderTime('24:00'), false);
  assert.equal(SeedApp.isValidReminderTime('7:00'), false);
  assert.equal(SeedApp.isValidReminderTime('invalid'), false);
  assert.equal(SeedApp.normalizeReminderTime('06:30'), '06:30');
  assert.equal(SeedApp.normalizeReminderTime('bad'), '07:00');

  // Next reminder info calculation & backward clock shift protection
  const morning6am = new Date(2026, 9, 21, 6, 15, 0).getTime(); // 06:15 local
  const nextAt7am = SeedApp.computeNextReminderInfo('07:00', morning6am);
  assert.equal(nextAt7am.isTomorrow, false);
  assert.equal(nextAt7am.hoursUntil, 0);
  assert.equal(nextAt7am.minutesUntil, 45);

  const morning8am = new Date(2026, 9, 21, 8, 0, 0).getTime(); // 08:00 local
  const nextTomorrow7am = SeedApp.computeNextReminderInfo('07:00', morning8am);
  assert.equal(nextTomorrow7am.isTomorrow, true);
  assert.equal(nextTomorrow7am.hoursUntil, 23);

  const todayStr = SeedApp.getTodayDateString(morning8am);
  // If useralready committed today at 06:15, next reminder at 07:00 should skip today and schedule for tomorrow
  const nextWhenCommittedAt6am = SeedApp.computeNextReminderInfo('07:00', morning6am, null, true);
  assert.equal(nextWhenCommittedAt6am.isTomorrow, true);

  // If clock shifted backward to 06:15 while lastReminderSentDate is todayStr, it should schedule for today (45m), not 24h45m
  const nextAfterBackwardClock = SeedApp.computeNextReminderInfo('07:00', morning6am, todayStr, false);
  assert.equal(nextAfterBackwardClock.isTomorrow, false);
  assert.equal(nextAfterBackwardClock.hoursUntil, 0);
  assert.equal(nextAfterBackwardClock.minutesUntil, 45);

  // Trigger decision logic
  assert.equal(
    SeedApp.shouldTriggerDailyReminder(
      { reminderEnabled: true, reminderTime: '07:00', lastPledgedDate: null, lastReminderSentDate: null },
      morning6am
    ),
    false,
    'Should not trigger before scheduled time (06:15 < 07:00)'
  );
  assert.equal(
    SeedApp.shouldTriggerDailyReminder(
      { reminderEnabled: true, reminderTime: '07:00', lastPledgedDate: null, lastReminderSentDate: null },
      morning8am
    ),
    true,
    'Should trigger at or after scheduled time when enabled and not yet committed or notified today'
  );
  assert.equal(
    SeedApp.shouldTriggerDailyReminder(
      { reminderEnabled: true, reminderTime: '07:00', lastPledgedDate: todayStr, lastReminderSentDate: null },
      morning8am
    ),
    false,
    'Should not trigger if user already committed today'
  );
  assert.equal(
    SeedApp.shouldTriggerDailyReminder(
      { reminderEnabled: true, reminderTime: '07:00', lastPledgedDate: null, lastReminderSentDate: todayStr },
      morning8am
    ),
    false,
    'Should not trigger twice on the same day'
  );
  assert.equal(
    SeedApp.shouldTriggerDailyReminder(
      { reminderEnabled: false, reminderTime: '07:00', lastPledgedDate: null, lastReminderSentDate: null },
      morning8am
    ),
    false,
    'Should not trigger when reminderEnabled is false'
  );

  // Notification payload in normal vs Stealth mode
  const normalPayload = SeedApp.buildCommitReminderPayload({ stealthMode: false, streakStartTimestamp: morning8am - 86400000 * 3 }, morning8am);
  assert.match(normalPayload.title, /Saatnya Commit Hari Ini/);
  assert.match(normalPayload.body, /Hold 3s to Commit Today/);
  const stealthPayload = SeedApp.buildCommitReminderPayload({ stealthMode: true, streakStartTimestamp: morning8am - 86400000 * 3 }, morning8am);
  assert.match(stealthPayload.title, /ASTRAL/);
  assert.doesNotMatch(stealthPayload.body, /Relapse|Porn|Orb|SEED/i);

  // 2. Service Worker (sw.js) VM execution test: verify SHOW_COMMIT_NOTIFICATION & SYNC_DAILY_REMINDER payload fidelity
  const swCode = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  const swListeners = {};
  const swShownNotifications = [];
  const swClientMessages = [];
  let swActiveTimers = new Map();
  let nextTimerId = 1;

  const swSandbox = {
    self: {
      addEventListener(type, fn) {
        swListeners[type] = fn;
      },
      skipWaiting() {},
      clients: {
        claim: () => Promise.resolve(),
        matchAll: () =>
          Promise.resolve([
            {
              url: 'http://localhost:4173/index.html',
              focus: () => Promise.resolve(),
              postMessage: (msg) => swClientMessages.push(msg)
            }
          ])
      },
      registration: {
        showNotification(title, options) {
          swShownNotifications.push({ title, options });
          return Promise.resolve();
        }
      }
    },
    caches: {
      open: () => Promise.resolve({ addAll: () => Promise.resolve(), put: () => Promise.resolve() }),
      keys: () => Promise.resolve([]),
      delete: () => Promise.resolve(),
      match: () => Promise.resolve(null)
    },
    setTimeout(fn, delay) {
      const id = nextTimerId++;
      swActiveTimers.set(id, {
        fn: () => {
          swActiveTimers.delete(id);
          fn();
        },
        delay
      });
      return id;
    },
    clearTimeout(id) {
      swActiveTimers.delete(id);
    },
    Promise
  };
  vm.runInNewContext(swCode, swSandbox);

  // Test SHOW_COMMIT_NOTIFICATION with Stealth Mode top-level body/tag
  swListeners.message({
    data: {
      type: 'SHOW_COMMIT_NOTIFICATION',
      title: stealthPayload.title,
      body: stealthPayload.body,
      tag: stealthPayload.tag
    }
  });
  assert.equal(swShownNotifications.length, 1);
  assert.equal(swShownNotifications[0].title, stealthPayload.title);
  assert.equal(swShownNotifications[0].options.body, stealthPayload.body, 'SW must preserve Stealth Mode body');
  assert.equal(swShownNotifications[0].options.tag, stealthPayload.tag);

  // Test SYNC_DAILY_REMINDER schedules timer and cancels it when isCommittedToday becomes true
  swListeners.message({
    data: {
      type: 'SYNC_DAILY_REMINDER',
      enabled: true,
      isCommittedToday: false,
      delayMs: 2700000,
      title: stealthPayload.title,
      body: stealthPayload.body,
      tag: stealthPayload.tag
    }
  });
  assert.equal(swActiveTimers.size, 1, 'SW timer should be scheduled when enabled and not committed today');
  // Simulate timer firing in SW and broadcasting DAILY_REMINDER_FIRED to clients
  const scheduledTimer = Array.from(swActiveTimers.values())[0];
  scheduledTimer.fn();
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(swShownNotifications.length, 2);
  assert.equal(swShownNotifications[1].options.body, stealthPayload.body);
  assert.ok(swClientMessages.some((m) => m.type === 'DAILY_REMINDER_FIRED'), 'SW broadcasts DAILY_REMINDER_FIRED');

  // Re-sync and then cancel via isCommittedToday: true
  swListeners.message({
    data: {
      type: 'SYNC_DAILY_REMINDER',
      enabled: true,
      isCommittedToday: false,
      delayMs: 1800000,
      title: normalPayload.title,
      body: normalPayload.body
    }
  });
  assert.equal(swActiveTimers.size, 1);
  swListeners.message({
    data: {
      type: 'SYNC_DAILY_REMINDER',
      enabled: true,
      isCommittedToday: true,
      delayMs: 86400000,
      title: normalPayload.title,
      body: normalPayload.body
    }
  });
  assert.equal(swActiveTimers.size, 0, 'SW timer must be cleared when user commits today');

  // 3. Full DOM integration test for Daily Commit Reminder & App Version card
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:4173/release',
    pretendToBeVisual: true
  });

  const sentNotifications = [];
  const postedSwMessages = [];
  class MockNotification {
    constructor(title, options) {
      sentNotifications.push({ title, options });
    }
    static async requestPermission() {
      MockNotification.permission = 'granted';
      return 'granted';
    }
  }
  MockNotification.permission = 'default';

  dom.window.Notification = MockNotification;
  Object.defineProperty(dom.window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      controller: {
        postMessage(msg) {
          postedSwMessages.push(msg);
        }
      },
      register: () => Promise.resolve({ update: () => Promise.resolve() }),
      addEventListener() {},
      removeEventListener() {}
    }
  });
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    clearRect() {},
    createRadialGradient: () => ({ addColorStop() {} }),
    beginPath() {},
    arc() {},
    fill() {},
    stroke() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    ellipse() {},
    scale() {},
    fillText() {}
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.localStorage = dom.window.localStorage;
  global.navigator = dom.window.navigator;
  global.location = dom.window.location;
  global.requestAnimationFrame = () => 1;
  global.cancelAnimationFrame = () => {};

  localStorage.clear();
  const controller = SeedApp.initBrowserApp();

  try {
    // Check Hold 3s to Commit Today wording on Home tab
    assert.equal(document.getElementById('pledge-hold-label').textContent.trim(), 'Hold 3s to Commit Today');

    // Switch to Shield tab and inspect Version card + Daily Reminder card
    controller.switchTab('shield');
    assert.equal(document.getElementById('shield-version-badge').textContent, 'SEED v1.0.0');
    assert.equal(document.getElementById('input-reminder-time').value, '07:00');
    assert.equal(document.getElementById('switch-daily-reminder').getAttribute('aria-checked'), 'false');

    // Set reminder time to 06:45 and save reminder (triggers Notification.requestPermission -> granted)
    const timeInput = document.getElementById('input-reminder-time');
    timeInput.value = '06:45';
    document.getElementById('btn-save-reminder').click();
    await new Promise((r) => setTimeout(r, 20));

    assert.equal(controller.getState().reminderEnabled, true);
    assert.equal(controller.getState().reminderTime, '06:45');
    assert.equal(document.getElementById('switch-daily-reminder').getAttribute('aria-checked'), 'true');
    assert.equal(document.getElementById('reminder-permission-badge').textContent, 'Aktif • Setiap Hari');
    assert.match(document.getElementById('reminder-status-text').textContent, /Pengingat aktif pukul 06:45/);

    // Verify Mulai Dari Sekarang (#btn-set-streak-now) preserves reminderEnabled & reminderTime
    document.getElementById('btn-set-streak-now').click();
    assert.equal(controller.getState().reminderEnabled, true, 'Mulai Dari Sekarang must preserve reminderEnabled');
    assert.equal(controller.getState().reminderTime, '06:45', 'Mulai Dari Sekarang must preserve reminderTime');

    // Test notification button dispatches SHOW_COMMIT_NOTIFICATION with options to Service Worker
    const swCountBeforeTest = postedSwMessages.length;
    document.getElementById('btn-test-reminder').click();
    await new Promise((r) => setTimeout(r, 20));
    const showMsg = postedSwMessages.slice(swCountBeforeTest).find((m) => m.type === 'SHOW_COMMIT_NOTIFICATION');
    assert.ok(showMsg, 'SHOW_COMMIT_NOTIFICATION posted to SW controller');
    assert.match(showMsg.title, /Saatnya Commit Hari Ini/);
    assert.equal(showMsg.options.body, showMsg.body);

    // Toggle Stealth mode -> App version badge disguises as ASTRAL v1.0.0 & syncs SW with disguised payload
    document.getElementById('switch-stealth-mode').click();
    assert.equal(document.getElementById('shield-version-badge').textContent, 'ASTRAL v1.0.0');
    const lastSyncAfterStealth = postedSwMessages[postedSwMessages.length - 1];
    assert.equal(lastSyncAfterStealth.type, 'SYNC_DAILY_REMINDER');
    assert.match(lastSyncAfterStealth.title, /ASTRAL/);
    assert.doesNotMatch(lastSyncAfterStealth.body, /SEED/);

    // Complete Daily Commit -> label updates to Committed Today • Komitmen Terkunci & syncs isCommittedToday: true
    controller.completeDailyPledge();
    assert.equal(document.getElementById('pledge-hold-label').textContent, 'Committed Today • Komitmen Terkunci');
    assert.match(document.getElementById('reminder-status-text').textContent, /Commit hari ini sudah terkunci/);
    const lastSyncAfterCommit = postedSwMessages[postedSwMessages.length - 1];
    assert.equal(lastSyncAfterCommit.type, 'SYNC_DAILY_REMINDER');
    assert.equal(lastSyncAfterCommit.isCommittedToday, true);

    // Verify COMMIT_NOTIFICATION_CLICKED message switches active tab back to Home
    controller.switchTab('shield');
    assert.equal(document.getElementById('screen-shield').classList.contains('active'), true);
    controller.handleServiceWorkerMessage({ data: { type: 'COMMIT_NOTIFICATION_CLICKED' } });
    assert.equal(document.getElementById('screen-home').classList.contains('active'), true);

    // Verify denied permission badge & status warning when Notification.permission === 'denied'
    MockNotification.permission = 'denied';
    controller.renderAll();
    assert.equal(document.getElementById('reminder-permission-badge').textContent, 'Izin Ditolak');
    assert.match(document.getElementById('reminder-status-text').textContent, /Izin notifikasi browser ditolak/);
  } finally {
    controller.destroy();
  }
});







