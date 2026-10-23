/**
 * SEED: Cosmic Dopamine Reboot & Streak Tracker
 * Complete Interactive Application Logic, Web Audio API Binaural Synthesizer,
 * 3D Cosmic Seed Canvas Renderer, 4-7-8 Breathing SOS Engine, and Persistence.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SeedApp = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'seed_cosmic_reboot_state_v1';
  const RELEASE_STORAGE_KEY = 'seed_cosmic_reboot_release_v1';
  const EDITION_STORAGE_KEY = 'seed_cosmic_reboot_edition';
  const APP_VERSION = '1.0.0';
  const DEFAULT_REMINDER_TIME = '07:00';

  const APP_EDITIONS = {
    demo: {
      id: 'demo',
      name: 'SEED — Versi Demo',
      shortBadge: 'DEMO SANDBOX',
      mobileBadge: 'DEMO',
      storageKey: STORAGE_KEY,
      manifestHref: 'manifest-demo.json',
      startUrl: './index.html?edition=demo',
      installerFilename: 'SEED-Cosmic-Reboot-Demo-v1.0.html',
      startModeLabel: 'Pre-loaded 2d 12h 42m 23s + Simulator 90 Hari',
      description:
        'Aplikasi Showcase dengan data referensi (2d 12h 42m) dan simulator waktu 24 jam hingga 90 hari.'
    },
    release: {
      id: 'release',
      name: 'SEED — Versi Rilis',
      shortBadge: 'RILIS v1.0',
      mobileBadge: 'RILIS',
      storageKey: RELEASE_STORAGE_KEY,
      manifestHref: 'manifest-release.json',
      startUrl: './index.html?edition=release',
      installerFilename: 'SEED-Cosmic-Reboot-Release-v1.0.html',
      startModeLabel: 'Mulai dari 00:00:00 (Day 1 Murni / Pribadi)',
      description:
        'Aplikasi Utama untuk perjalanan komitmen pribadi dari 0 detik dengan penyimpanan lokal terisolasi.'
    }
  };

  /**
   * Pure helper: resolve active application edition ('demo' or 'release') from query string, pathname, or saved preference
   */
  function resolveAppEdition(searchStr = '', storedEdition = null, pathnameStr = '') {
    if (typeof searchStr === 'string' && searchStr.trim()) {
      const trimmedSearch = searchStr.trim();
      if (/^\/?(?:release|rilis)\/?$/i.test(trimmedSearch)) {
        return 'release';
      }
      if (/^\/?(?:demo|sandbox|showcase)\/?$/i.test(trimmedSearch)) {
        return 'demo';
      }
      const clean = trimmedSearch.replace(/^\?/, '');
      const params = clean.split('&');
      for (let i = 0; i < params.length; i++) {
        const parts = params[i].split('=');
        const rawKey = parts[0] || '';
        const rawVal = parts.slice(1).join('=') || '';
        let decodedVal = rawVal;
        try {
          decodedVal = decodeURIComponent(rawVal);
        } catch (e) {}
        const k = rawKey.trim().toLowerCase();
        const v = decodedVal.trim().toLowerCase();
        if (k === 'edition' || k === 'mode' || k === 'app') {
          if (v === 'release' || v === 'rilis' || v === 'prod' || v === 'production' || v === 'clean') {
            return 'release';
          }
          if (v === 'demo' || v === 'sandbox' || v === 'showcase') {
            return 'demo';
          }
        }
      }
    }
    if (typeof pathnameStr === 'string' && pathnameStr.trim()) {
      const cleanPath = pathnameStr.trim().replace(/\/+$/, '').toLowerCase();
      if (cleanPath.endsWith('/release') || cleanPath.endsWith('/rilis')) {
        return 'release';
      }
      if (cleanPath.endsWith('/demo')) {
        return 'demo';
      }
    }
    if (typeof storedEdition === 'string') {
      const norm = storedEdition.trim().toLowerCase();
      if (norm === 'release' || norm === 'rilis') return 'release';
      if (norm === 'demo') return 'demo';
    }
    return 'demo';
  }

  /**
   * Pure helper: generate standalone HTML launcher installer for Demo or Release edition
   */
  function buildStandaloneInstallerHtml(edition = 'release', baseHref = './') {
    const safeEd = edition === 'demo' ? 'demo' : 'release';
    const cfg = APP_EDITIONS[safeEd];
    const normalizedBase = typeof baseHref === 'string' && baseHref.trim() ? baseHref.trim() : './';
    const targetUrl = `${normalizedBase.replace(/\/?$/, '/')}index.html?edition=${safeEd}`;

    return [
      '<!DOCTYPE html>',
      '<html lang="id">',
      '<head>',
      '  <meta charset="UTF-8" />',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />',
      '  <meta name="theme-color" content="#03040B" />',
      `  <title>${cfg.name} — Standalone Launcher</title>`,
      '  <style>',
      '    body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #03040B; color: #FFFFFF; font-family: Inter, -apple-system, sans-serif; text-align: center; padding: 24px; }',
      '    .card { max-width: 400px; width: 100%; background: #0B0E1D; border: 1px solid rgba(77,124,254,0.35); border-radius: 28px; padding: 32px 24px; box-shadow: 0 24px 64px rgba(0,0,0,0.85); }',
      '    .orb { width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 18px; background: radial-gradient(circle at 30% 35%, #9BB8FF 0%, #4364FF 45%, #040614 90%); box-shadow: 0 0 28px rgba(77,124,254,0.7); }',
      '    .badge { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; background: rgba(77,124,254,0.16); color: #9BB8FF; margin-bottom: 10px; }',
      '    h1 { font-size: 24px; font-weight: 800; margin: 0 0 8px; letter-spacing: -0.03em; }',
      '    p { font-size: 13px; line-height: 1.5; color: #94A3B8; margin: 0 0 22px; }',
      '    .btn { display: block; width: 100%; box-sizing: border-box; padding: 14px 20px; border-radius: 999px; background: linear-gradient(90deg, #4B66FF 0%, #3B52EE 100%); color: #FFFFFF; font-weight: 800; font-size: 14px; text-decoration: none; }',
      '  </style>',
      '</head>',
      '<body>',
      '  <div class="card">',
      '    <div class="orb"></div>',
      `    <span class="badge">${cfg.shortBadge}</span>`,
      `    <h1>${cfg.name}</h1>`,
      `    <p>${cfg.description}</p>`,
      `    <a class="btn" id="launcher-link" href="${targetUrl}">Buka ${cfg.name} Sekarang</a>`,
      '  </div>',
      '  <script>',
      `    try { localStorage.setItem('${EDITION_STORAGE_KEY}', '${safeEd}'); } catch (e) {}`,
      '  </script>',
      '</body>',
      '</html>'
    ].join('\n');
  }

  // Exact Reference Image 1 Streak Offset: 2 days, 12 hours, 42 minutes, 23 seconds
  const REF_STREAK_OFFSET_MS =
    ((2 * 86400) + (12 * 3600) + (42 * 60) + 23) * 1000;

  // 6 Cosmic Seed Evolution Stages (Tab 2: Seed Vault)
  const SEED_STAGES = [
    {
      id: 'origin-seed',
      stageNumber: 1,
      name: 'Origin Seed',
      stealthName: 'Origin Asteroid',
      archetype: 'Tier I • Lunar Spore',
      stealthArchetype: 'Class I • Lunar Probe',
      hoursRequired: 24,
      timeLabel: '24 hours',
      description: 'Enhanced mental clarity, self-esteem, and relationships.',
      primaryColor: '#E2E8F0',
      glowColor: 'rgba(59, 91, 255, 0.15)',
      accentHex: '#4D7CFE',
      telemetry: [
        { label: 'Stabilisasi Dopamin Awal', stealthLabel: 'Kalibrasi Sensor Awal', pct: 36 },
        { label: 'Kejernihan Mental Dasar', stealthLabel: 'Resolusi Optik Kognitif', pct: 44 },
        { label: 'Kepercayaan Diri & Komitmen', stealthLabel: 'Integritas Orbit Inti', pct: 40 }
      ]
    },
    {
      id: 'sprout-core',
      stageNumber: 2,
      name: 'Sprout Core',
      stealthName: 'Verdant Core',
      archetype: 'Tier II • Bio-Tendril Core',
      stealthArchetype: 'Class II • Bio-Reactor',
      hoursRequired: 72,
      timeLabel: '3 days',
      description: 'Passing the dopamine crash peak; energy levels begin to rise.',
      primaryColor: '#34D399',
      glowColor: 'rgba(34, 197, 94, 0.55)',
      accentHex: '#22C55E',
      telemetry: [
        { label: 'Pemulihan Energi Fisik', stealthLabel: 'Output Reaktor Termal', pct: 54 },
        { label: 'Ketahanan Puncak Craving', stealthLabel: 'Perisai Fluktuasi Gravitasi', pct: 50 },
        { label: 'Fokus Kognitif Harian', stealthLabel: 'Sinkronisasi Vektor Fokus', pct: 58 }
      ]
    },
    {
      id: 'nebula-flora',
      stageNumber: 3,
      name: 'Nebula Flora',
      stealthName: 'Nebula Blossom',
      archetype: 'Tier III • Nebula Lotus',
      stealthArchetype: 'Class III • Nebula Array',
      hoursRequired: 168,
      timeLabel: '7 days',
      description: 'Sharper focus, reduced brain fog, stronger impulse control.',
      primaryColor: '#A78BFA',
      glowColor: 'rgba(139, 92, 246, 0.58)',
      accentHex: '#8B5CF6',
      telemetry: [
        { label: 'Reduksi Brain Fog', stealthLabel: 'Pembersihan Noise Sinyal', pct: 72 },
        { label: 'Kontrol Impuls Prefrontal', stealthLabel: 'Kestabilan Gyro Navigasi', pct: 68 },
        { label: 'Kejernihan Fokus Dalam', stealthLabel: 'Akselerasi Transmisi Data', pct: 74 }
      ]
    },
    {
      id: 'aether-crystal',
      stageNumber: 4,
      name: 'Aether Crystal',
      stealthName: 'Aether Prism',
      archetype: 'Tier IV • Merkaba Prism',
      stealthArchetype: 'Class IV • Quantum Prism',
      hoursRequired: 336,
      timeLabel: '14 days',
      description: 'Deeper sleep quality, higher social confidence, balanced mood.',
      primaryColor: '#38BDF8',
      glowColor: 'rgba(56, 189, 248, 0.58)',
      accentHex: '#38BDF8',
      telemetry: [
        { label: 'Kualitas Deep Sleep (REM)', stealthLabel: 'Mode Hibernasi Kuantum', pct: 84 },
        { label: 'Kepercayaan Sosial & Mood', stealthLabel: 'Harmoni Frekuensi Resonansi', pct: 80 },
        { label: 'Sensitivitas Reseptor D2', stealthLabel: 'Sensitivitas Array Spektral', pct: 78 }
      ]
    },
    {
      id: 'supernova-tree',
      stageNumber: 5,
      name: 'Supernova Tree',
      stealthName: 'Solar Canopy',
      archetype: 'Tier V • Solar Yggdrasil',
      stealthArchetype: 'Class V • Dyson Canopy',
      hoursRequired: 720,
      timeLabel: '30 days',
      description: 'Major neural pathway rewiring and reclaimed willpower.',
      primaryColor: '#FBBF24',
      glowColor: 'rgba(245, 158, 11, 0.62)',
      accentHex: '#F59E0B',
      telemetry: [
        { label: 'Rewiring Jalur Saraf Utama', stealthLabel: 'Rekonstruksi Jaringan Inti', pct: 92 },
        { label: 'Kekuatan Willpower Mandiri', stealthLabel: 'Otonomi Propulsi Surya', pct: 90 },
        { label: 'Vitalitas & Motivasi Alami', stealthLabel: 'Efisiensi Fusi Bintang', pct: 94 }
      ]
    },
    {
      id: 'cosmic-sovereign',
      stageNumber: 6,
      name: 'Cosmic Sovereign',
      stealthName: 'Galactic Crown',
      archetype: 'Tier VI • Quasar Sovereign',
      stealthArchetype: 'Class VI • Galactic Crown',
      hoursRequired: 2160,
      timeLabel: '90 days',
      description: 'Full 90-day brain reboot completed.',
      primaryColor: '#F472B6',
      glowColor: 'rgba(236, 72, 153, 0.65)',
      accentHex: '#EC4899',
      telemetry: [
        { label: 'Homeostasis Reseptor Dopamin', stealthLabel: 'Homeostasis Kuantum Penuh', pct: 100 },
        { label: 'Kedaulatan Korteks Prefrontal', stealthLabel: 'Kedaulatan Komando Orbital', pct: 100 },
        { label: '90-Day Neural Reboot Selesai', stealthLabel: 'Sinkronisasi Galaksi 100%', pct: 100 }
      ]
    }
  ];

  // 3 Real Web Audio API Binaural Tapes (Tab 3: Rewire)
  const BINAURAL_TAPES = [
    {
      id: 1,
      headerTitle: 'The Introduction',
      title: 'Tape 1: Dopamine Reset',
      buttonLabel: 'Play Tape 1',
      waveLabel: 'Alpha Wave 10Hz — Fokus & Tenang',
      leftHz: 200,
      rightHz: 210,
      beatHz: 10,
      completedUsers: 32421,
      description:
        'This introduction equips you with the proper mental frameworks and strategies for using and implementing the SEED rewiring tapes collection. You will understand how the collection has been engineered. And you will learn how to use the tapes in the most effective way.'
    },
    {
      id: 2,
      headerTitle: 'Impulse Dissolver',
      title: 'Tape 2: Urge Dissolver',
      buttonLabel: 'Play Tape 2',
      waveLabel: 'Theta Wave 6Hz — Meredakan Impuls Kompulsif',
      leftHz: 180,
      rightHz: 186,
      beatHz: 6,
      completedUsers: 24890,
      description:
        'Engineered with 6Hz Theta binaural phase-locking to quiet hyperactive craving circuits in the striatum and restore prefrontal emotional regulation within minutes.'
    },
    {
      id: 3,
      headerTitle: 'Deep Neural Slumber',
      title: 'Tape 3: Deep Sleep Reboot',
      buttonLabel: 'Play Tape 3',
      waveLabel: 'Delta Wave 3Hz — Pemulihan Malam',
      leftHz: 140,
      rightHz: 143,
      beatHz: 3,
      completedUsers: 19640,
      description:
        'Delta 3Hz acoustic entrainment designed for late-night vulnerability hours. Accelerates deep slow-wave sleep and overnight dopamine receptor upregulation.'
    }
  ];

  // Instant Physical Challenges for SOS Mode
  const PHYSICAL_CHALLENGES = [
    'Cuci muka dengan air dingin sekarang selama 15 detik!',
    'Lakukan 15x Push-up sekarang dengan form penuh!',
    'Minum 1 gelas besar air dingin & berdiri jauh dari layar 2 menit!',
    'Lakukan 20x Jumping Jacks untuk merilis dopamin sehat!',
    'Tahan posisi Plank selama 45 detik sekarang juga!',
    'Tarik napas di dekat jendela terbuka & sebutkan 3 target besarmu!'
  ];

  // Community Challenges (Tab 4: Statistics)
  const COMMUNITY_CHALLENGES = [
    {
      id: 'no-nut-november',
      titleHtml: 'No Nut<br />November',
      stealthTitleHtml: '30-Day Deep<br />Focus Orbit',
      baseParticipants: 15032,
      targetDays: 30,
      switchLabel: 'Ganti: 30-Day Clean Challenge ⇄',
      stealthSwitchLabel: 'Ganti: Solar Zenith 30-Day Sprint ⇄'
    },
    {
      id: '30-day-clean',
      titleHtml: '30-Day Clean<br />Challenge',
      stealthTitleHtml: 'Solar Zenith<br />30-Day Sprint',
      baseParticipants: 28410,
      targetDays: 30,
      switchLabel: 'Ganti: No Nut November ⇄',
      stealthSwitchLabel: 'Ganti: 30-Day Deep Focus Orbit ⇄'
    }
  ];

  // Tab Hero Banner Configs (Matching Reference Screenshots)
  const TAB_HERO_BANNERS = {
    home: {
      titleHtml: 'Quit<br />Goon',
      stealthHtml: 'Deep<br />Focus',
      color: '#3B5BFF'
    },
    vault: {
      titleHtml: 'Gamify<br />Your Journey',
      stealthHtml: 'Orbital<br />Artifacts',
      color: '#22C55E'
    },
    rewire: {
      titleHtml: 'Rewire<br />Your Brain',
      stealthHtml: 'Acoustic<br />Entrainment',
      color: '#F59E0B'
    },
    stats: {
      titleHtml: 'Track<br />Your Progress',
      stealthHtml: 'Mission<br />Telemetry',
      color: '#EF4444'
    },
    shield: {
      titleHtml: 'Shield &amp;<br />Privacy',
      stealthHtml: 'Security &amp;<br />Protocols',
      color: '#4F8BFF'
    }
  };

  const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function formatDateString(ms = Date.now()) {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getTodayDateString(ms = Date.now()) {
    return formatDateString(ms);
  }

  /**
   * Pure helper: format timestamp into local datetime-local string (YYYY-MM-DDTHH:mm)
   */
  function formatDateTimeLocal(ms = Date.now()) {
    if (!Number.isFinite(ms) || ms < 0) return '';
    const d = new Date(ms);
    if (isNaN(d.getTime())) return '';
    const year = String(d.getFullYear()).padStart(4, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Pure helper: parse local datetime-local string (YYYY-MM-DDTHH:mm or with seconds) into timestamp ms
   */
  function parseDateTimeLocal(str) {
    if (!str || typeof str !== 'string') return null;
    const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
    if (!match) {
      const parsed = Date.parse(str);
      return Number.isFinite(parsed) ? parsed : null;
    }
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = match[6] ? parseInt(match[6], 10) : 0;
    const ms = match[7] ? parseInt(match[7].padEnd(3, '0'), 10) : 0;

    if (month < 0 || month > 11 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      return null;
    }
    const d = new Date(year, month, day, hour, minute, second, ms);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
      return null;
    }
    const ts = d.getTime();
    return Number.isFinite(ts) ? ts : null;
  }

  /**
   * Pure helper: format timestamp into human-readable Indonesian date & time
   */
  function formatIndonesianDateTime(ms = Date.now()) {
    if (!Number.isFinite(ms)) return '-';
    const d = new Date(ms);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = d.getDate();
    const month = months[d.getMonth()] || '';
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

  /**
   * Pure helper: get corresponding stage object for given total hours
   */
  function getStageForHours(hours) {
    const h = Math.max(0, Number(hours) || 0);
    let current = SEED_STAGES[0];
    for (let i = 0; i < SEED_STAGES.length; i++) {
      if (h >= SEED_STAGES[i].hoursRequired) {
        current = SEED_STAGES[i];
      }
    }
    return current;
  }

  /**
   * Pure helper: synchronize 7-day glance array with actual device calendar dates
   */
  function buildAlignedSevenDays(existingSevenDays, nowMs = Date.now(), isDayOne = false) {
    const todayDate = new Date(nowMs);
    const existingMap = new Map();
    if (Array.isArray(existingSevenDays)) {
      existingSevenDays.forEach((item) => {
        if (item && typeof item === 'object' && item.date) {
          existingMap.set(item.date, item);
        }
      });
    }

    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - (6 - i));
      const dateStr = formatDateString(d.getTime());
      const dow = d.getDay();
      const letter = DAY_LETTERS[dow];
      const dayName = DAY_NAMES[dow];
      const isToday = (i === 6);

      const matched = existingMap.get(dateStr);
      if (matched) {
        result.push({
          ...matched,
          dayLetter: letter,
          label: isToday ? `${dayName} (Hari Ini)` : dayName,
          date: dateStr,
          status: isToday ? (matched.status === 'clean' ? 'clean' : 'today') : (matched.status === 'today' ? 'empty' : matched.status)
        });
      } else {
        const fallback = (Array.isArray(existingSevenDays) && existingSevenDays[i] && typeof existingSevenDays[i] === 'object')
          ? existingSevenDays[i]
          : null;

        if (fallback && !fallback.date) {
          result.push({
            ...fallback,
            dayLetter: letter,
            label: isToday ? (isDayOne ? 'Hari Ini (Day 1)' : `${dayName} (Hari Ini)`) : (isDayOne ? fallback.label : dayName),
            date: dateStr
          });
        } else {
          result.push({
            dayLetter: letter,
            label: isToday ? (isDayOne ? 'Hari Ini (Day 1)' : `${dayName} (Hari Ini)`) : dayName,
            date: dateStr,
            status: isToday ? 'today' : 'empty',
            note: isToday
              ? (isDayOne ? 'Hari 1 Genesis — Tahan tombol Commit 3 detik untuk mengunci komitmen hari pertamamu!' : 'Hari Ini (Aktif) — Tahan tombol Commit 3 detik untuk mengunci hari ini!')
              : `Belum ada log check-in pada hari ${dayName}`
          });
        }
      }
    }
    return result;
  }

  /**
   * Pure helper: create default state matching the reference screenshots
   */
  function createDefaultState(nowMs = Date.now()) {
    const todayStr = formatDateString(nowMs);
    const baseSevenDays = [
      { dayLetter: 'S', label: 'Minggu', status: 'clean', note: 'Hari bersih & komit penuh (+25 XP)' },
      { dayLetter: 'M', label: 'Senin', status: 'empty', note: 'Belum ada log check-in pada hari Senin' },
      { dayLetter: 'T', label: 'Selasa', status: 'clean', note: 'Hari bersih & sesi Tape 1 selesai' },
      { dayLetter: 'W', label: 'Rabu', status: 'empty', note: 'Belum ada log check-in pada hari Rabu' },
      {
        dayLetter: 'T',
        label: 'Kamis',
        status: 'relapse',
        trigger: 'Larut Malam',
        time: '23:45',
        note: 'Pemicu: Larut Malam (23:45) — Doomscrolling di tempat tidur saat lelah.'
      },
      { dayLetter: 'F', label: 'Jumat', status: 'clean', note: 'Hari bersih & berhasil melewati 2 godaan' },
      { dayLetter: 'S', label: 'Sabtu (Hari Ini)', status: 'today', note: 'Hari Ini (Aktif) — Tahan tombol Commit 3 detik untuk mengunci hari ini!' }
    ];

    return {
      isDayOne: false,
      streakStartTime: nowMs - REF_STREAK_OFFSET_MS,
      longestStreakHours: 342, // 14d 6h personal record
      xp: 150,
      urgesOvercomeToday: 2,
      totalUrgesOvercome: 9,
      lastUrgeDate: todayStr,
      lastCalendarDate: todayStr,
      lastPledgeDate: null,
      reminderEnabled: false,
      reminderTime: DEFAULT_REMINDER_TIME,
      lastReminderSentDate: null,
      selectedVaultStageIndex: 0,
      unlockedStageIds: ['origin-seed'],
      seedAnimMode: 'orbit',
      statsPeriod: '7d',
      selectedTapeId: 1,
      selectedTapeDurationMin: 10,
      dailyWastedMinutes: 21, // 2.5 days * 21 mins ~= 52 mins saved this week (matches "52" in screenshot!)
      coreReason: 'Mengembalikan kejernihan pikiran, fokus penuh, dan kendali penuh atas hidupku.',
      stealthMode: false,
      pinEnabled: false,
      pinCode: '1234',
      activeChallengeIndex: 0,
      joinedChallenges: {},
      energyHistory: [4, 4, 3, 4, 3, 5, 4],
      triggers: {
        'Larut Malam': 5,
        'Bosan': 3,
        'Stres': 2,
        'Sosmed': 0,
        'Kesepian': 0
      },
      timeVulnerability: {
        'Larut Malam (21–01)': 5,
        'Sore Hari (15–19)': 2,
        'Dini Hari (01–05)': 2,
        'Siang Hari (11–15)': 1
      },
      sevenDays: baseSevenDays.map((d) => ({ ...d }))
    };
  }

  /**
   * Pure helper: create Day 1 Genesis state for fresh user onboarding simulation
   */
  function createDayOneState(nowMs = Date.now()) {
    const todayStr = formatDateString(nowMs);
    const baseDayOneSeven = [
      { dayLetter: 'S', label: 'Hari -6', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'M', label: 'Hari -5', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'T', label: 'Hari -4', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'W', label: 'Hari -3', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'T', label: 'Hari -2', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'F', label: 'Hari -1', status: 'empty', note: 'Sebelum inisiasi reboot' },
      { dayLetter: 'S', label: 'Hari Ini (Day 1)', status: 'today', note: 'Hari 1 Genesis — Tahan tombol Commit 3 detik untuk mengunci komitmen hari pertamamu!' }
    ];

    return {
      isDayOne: true,
      streakStartTime: nowMs,
      longestStreakHours: 0,
      xp: 0,
      urgesOvercomeToday: 0,
      totalUrgesOvercome: 0,
      lastUrgeDate: todayStr,
      lastCalendarDate: todayStr,
      lastPledgeDate: null,
      reminderEnabled: false,
      reminderTime: DEFAULT_REMINDER_TIME,
      lastReminderSentDate: null,
      selectedVaultStageIndex: 0,
      unlockedStageIds: [],
      seedAnimMode: 'orbit',
      statsPeriod: '7d',
      selectedTapeId: 1,
      selectedTapeDurationMin: 10,
      dailyWastedMinutes: 21,
      coreReason: 'Mengembalikan kejernihan pikiran, fokus penuh, dan kendali penuh atas hidupku.',
      stealthMode: false,
      pinEnabled: false,
      pinCode: '1234',
      activeChallengeIndex: 0,
      joinedChallenges: {},
      energyHistory: [null, null, null, null, null, null, null],
      triggers: {
        'Larut Malam': 0,
        'Bosan': 0,
        'Stres': 0,
        'Sosmed': 0,
        'Kesepian': 0
      },
      timeVulnerability: {
        'Larut Malam (21–01)': 0,
        'Sore Hari (15–19)': 0,
        'Dini Hari (01–05)': 0,
        'Siang Hari (11–15)': 0
      },
      sevenDays: buildAlignedSevenDays(baseDayOneSeven, nowMs, true)
    };
  }

  /**
   * Pure helper: Breakdown elapsed milliseconds into days, hours, minutes, seconds, and totalHours
   */
  function computeStreakBreakdown(streakStartTime, nowMs = Date.now()) {
    const start = Number.isFinite(streakStartTime) ? streakStartTime : nowMs;
    const elapsedMs = Math.max(0, nowMs - start);
    const totalSeconds = Math.floor(elapsedMs / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const totalHours = elapsedMs / (1000 * 3600);

    return {
      elapsedMs,
      totalSeconds,
      days,
      hours,
      minutes,
      seconds,
      totalHours
    };
  }

  /**
   * Pure helper: Format remaining hours into clear, Indonesian-friendly time description
   */
  function formatRemainingTime(remainingHours) {
    const safeH = Math.max(0, Number(remainingHours) || 0);
    if (safeH <= 0) return '0 jam';
    if (safeH < 1) {
      const mins = Math.max(1, Math.round(safeH * 60));
      return `${mins} menit`;
    }
    if (safeH <= 24) {
      const hrs = Math.round(safeH);
      return `${hrs} jam`;
    }
    const totalDays = safeH / 24;
    const days = Math.floor(totalDays);
    const remH = Math.round(safeH - days * 24);
    if (remH >= 24) {
      return `${days + 1} hari`;
    }
    if (remH > 0) {
      return `${days} hari ${remH} jam`;
    }
    return `${days} hari`;
  }

  /**
   * Pure helper: Compute Seed Vault stage statuses and progress toward next evolution
   */
  function computeVaultProgress(totalHours, stealthMode = false) {
    const safeHours = Math.max(0, Number(totalHours) || 0);
    const stagesWithStatus = SEED_STAGES.map((stage) => {
      const collected = safeHours >= stage.hoursRequired;
      const remainingHours = Math.max(0, stage.hoursRequired - safeHours);
      const remainingLabel = formatRemainingTime(remainingHours);
      return {
        ...stage,
        collected,
        isLocked: !collected,
        remainingHours,
        remainingLabel
      };
    });

    const collectedCount = stagesWithStatus.filter((s) => s.collected).length;
    const nextStage = stagesWithStatus.find((s) => !s.collected) || null;

    let progressPercent = 100;
    let nextLabel = stealthMode
      ? 'All 6 Orbital Artifacts Collected! (90+ Days)'
      : 'All 6 Cosmic Seeds Collected! (90+ Days)';

    if (nextStage) {
      const prevStageIndex = stagesWithStatus.indexOf(nextStage) - 1;
      const prevHours = prevStageIndex >= 0 ? stagesWithStatus[prevStageIndex].hoursRequired : 0;
      const span = Math.max(1, nextStage.hoursRequired - prevHours);
      const progressed = Math.max(0, safeHours - prevHours);
      progressPercent = Math.min(99, Math.max(0, Math.round((progressed / span) * 100)));
      const displayName = stealthMode ? nextStage.stealthName : nextStage.name;
      nextLabel = `Next: ${displayName} (${nextStage.timeLabel})`;
    }

    return {
      stages: stagesWithStatus,
      collectedCount,
      nextStage,
      progressPercent,
      nextLabel
    };
  }

  /**
   * Pure helper: Compute Trigger Breakdown percentages sorted descending
   */
  function computeTriggerBreakdown(triggersObj) {
    const entries = Object.entries(triggersObj || {});
    const total = entries.reduce((acc, [, count]) => acc + Math.max(0, Number(count) || 0), 0);

    return entries
      .map(([name, count]) => {
        const safeCount = Math.max(0, Number(count) || 0);
        const pct = total > 0 ? Math.round((safeCount / total) * 100) : 0;
        return { name, count: safeCount, percentage: pct };
      })
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Pure helper: Compute Time Vulnerability Window breakdown sorted descending
   */
  function computeVulnerabilityBreakdown(timeVulnObj) {
    const defaultObj = {
      'Larut Malam (21–01)': 5,
      'Sore Hari (15–19)': 2,
      'Dini Hari (01–05)': 2,
      'Siang Hari (11–15)': 1
    };
    const source = timeVulnObj && typeof timeVulnObj === 'object' && Object.keys(timeVulnObj).length > 0
      ? timeVulnObj
      : defaultObj;
    const entries = Object.entries(source);
    const total = entries.reduce((acc, [, count]) => acc + Math.max(0, Number(count) || 0), 0);

    const items = entries
      .map(([windowLabel, count]) => {
        const safeCount = Math.max(0, Number(count) || 0);
        const percentage = total > 0 ? Math.round((safeCount / total) * 100) : 0;
        return { windowLabel, count: safeCount, percentage };
      })
      .sort((a, b) => b.count - a.count);

    return {
      total,
      peakWindow: items[0] ? items[0].windowLabel : 'Larut Malam (21–01)',
      items
    };
  }

  /**
   * Pure helper: Compute 90-Day Brain Rewiring & Dopamine Recovery Telemetry
   */
  function computeBrainRecoveryMetrics(totalHours, stealthMode = false, isDayOne = false) {
    const safeHours = Math.max(0, Number(totalHours) || 0);

    // On fresh Day 1 Genesis initiation, recovery progress starts strictly at 0%
    if (isDayOne) {
      return {
        overallPct: 0,
        phaseBadge: stealthMode ? 'Fase 1: Kalibrasi Sensor Galaksi (Hari 1)' : 'Fase 1: Inisiasi Reboot (Hari 1)',
        metrics: [
          {
            id: 'dopamine-d2',
            label: stealthMode ? 'Sensitivitas Array Spektral (D2)' : 'Sensitivitas Reseptor Dopamin D2',
            pct: 0,
            color: 'linear-gradient(90deg, #3B5BFF 0%, #60A5FA 100%)'
          },
          {
            id: 'prefrontal',
            label: stealthMode ? 'Kestabilan Navigasi Prefrontal' : 'Kontrol Impuls Korteks Prefrontal',
            pct: 0,
            color: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
          },
          {
            id: 'clarity',
            label: stealthMode ? 'Bandwidth Fokus & Memori Kerja' : 'Kejernihan Mental & Fokus Dalam',
            pct: 0,
            color: 'linear-gradient(90deg, #F59E0B 0%, #FDE047 100%)'
          },
          {
            id: 'sleep-mood',
            label: stealthMode ? 'Sinkronisasi Sirkadian & Mood' : 'Kualitas Tidur Dalam & Mood',
            pct: 0,
            color: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)'
          }
        ]
      };
    }

    // Non-linear neuroplasticity curve over 2160 hours (90 days)
    // sqrt progress gives encouraging early momentum + steady deep completion
    const norm = Math.min(1, safeHours / 2160);
    const curved = Math.pow(norm, 0.46);

    const d2Pct = Math.min(100, Math.max(8, Math.round(8 + curved * 92)));
    const pfcPct = Math.min(100, Math.max(10, Math.round(12 + Math.pow(norm, 0.42) * 88)));
    const clarityPct = Math.min(100, Math.max(12, Math.round(15 + Math.pow(norm, 0.38) * 85)));
    const sleepPct = Math.min(100, Math.max(9, Math.round(10 + Math.pow(norm, 0.44) * 90)));
    const overallPct = Math.round((d2Pct + pfcPct + clarityPct + sleepPct) / 4);

    let phaseBadge = stealthMode ? 'Fase 1: Kalibrasi Sensor Awal' : 'Fase 1: Stabilisasi Dopamin';
    if (safeHours >= 2160) {
      phaseBadge = stealthMode ? 'Fase 6: Kedaulatan Galaksi (100%)' : 'Fase 6: Homeostasis Penuh (90+ Hari)';
    } else if (safeHours >= 720) {
      phaseBadge = stealthMode ? 'Fase 5: Rekonstruksi Jaringan Inti' : 'Fase 5: Rewiring Jalur Saraf Utama';
    } else if (safeHours >= 336) {
      phaseBadge = stealthMode ? 'Fase 4: Resonansi Kuantum Stabil' : 'Fase 4: Penguatan Korteks Prefrontal';
    } else if (safeHours >= 168) {
      phaseBadge = stealthMode ? 'Fase 3: Reduksi Interferensi' : 'Fase 3: Pemangkasan Sinapsis Kompulsif';
    } else if (safeHours >= 72) {
      phaseBadge = stealthMode ? 'Fase 2: Akselerasi Reaktor' : 'Fase 2: Pemulihan Pasca-Crash';
    }

    return {
      overallPct,
      phaseBadge,
      metrics: [
        {
          id: 'dopamine-d2',
          label: stealthMode ? 'Sensitivitas Array Spektral (D2)' : 'Sensitivitas Reseptor Dopamin D2',
          pct: d2Pct,
          color: 'linear-gradient(90deg, #3B5BFF 0%, #60A5FA 100%)'
        },
        {
          id: 'prefrontal',
          label: stealthMode ? 'Kestabilan Navigasi Prefrontal' : 'Kontrol Impuls Korteks Prefrontal',
          pct: pfcPct,
          color: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
        },
        {
          id: 'clarity',
          label: stealthMode ? 'Bandwidth Fokus & Memori Kerja' : 'Kejernihan Mental & Fokus Dalam',
          pct: clarityPct,
          color: 'linear-gradient(90deg, #F59E0B 0%, #FDE047 100%)'
        },
        {
          id: 'sleep-mood',
          label: stealthMode ? 'Sinkronisasi Sirkadian & Mood' : 'Kualitas Tidur Dalam & Mood',
          pct: sleepPct,
          color: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)'
        }
      ]
    };
  }

  /**
   * Pure helper: Compute 30-Day Consistency Heatmap Matrix synced with current streak & 7-day row
   */
  function computeThirtyDayMatrix(state, nowMs = Date.now()) {
    const safeState = state && typeof state === 'object' ? state : createDefaultState(nowMs);
    const isDayOne = Boolean(safeState.isDayOne);

    // On fresh Day 1 Genesis: matrix begins strictly with Day 1 active and days 2..30 empty targets
    if (isDayOne) {
      const cells = [];
      const isPledged = Boolean(safeState.lastPledgeDate);
      for (let i = 0; i < 30; i++) {
        const dayNumber = i + 1;
        if (i === 0) {
          cells.push({
            dayNumber: 1,
            status: isPledged ? 'clean' : 'today',
            label: isPledged ? 'Hari 1 (Genesis — Komitmen Selesai)' : 'Hari 1 (Genesis — Hari Ini)',
            note: isPledged
              ? 'Hari 1 Genesis — Komitmen harian terkunci & streak bersih dimulai! (+25 XP)'
              : 'Hari 1 Genesis — Tahan tombol Commit 3 detik untuk mengunci komitmen hari pertamamu!'
          });
        } else {
          cells.push({
            dayNumber,
            status: 'empty',
            label: `Hari ${dayNumber} (Target Kosmik)`,
            note: `Target masa depan hari ke-${dayNumber} — Belum tercapai`
          });
        }
      }

      const cleanCount = isPledged ? 1 : 0;
      const relapseCount = 0;
      const consistencyPct = isPledged ? Math.round((1 / 30) * 100) : 0;

      return {
        cells,
        cleanCount,
        relapseCount,
        consistencyPct
      };
    }

    const breakdown = computeStreakBreakdown(safeState.streakStartTime, nowMs);
    const defaultSeven = createDefaultState(nowMs).sevenDays;
    const rawSeven = Array.isArray(safeState.sevenDays) && safeState.sevenDays.length === 7
      ? safeState.sevenDays
      : defaultSeven;

    // Historical baseline for days 1..23 (0-indexed 0..22)
    const historicalPattern = [
      'clean', 'clean', 'shielded', 'clean', 'clean',
      'clean', 'relapse', 'clean', 'clean', 'shielded',
      'clean', 'clean', 'clean', 'shielded', 'clean',
      'clean', 'clean', 'relapse', 'clean', 'clean',
      'shielded', 'clean', 'clean'
    ];

    const cells = [];
    for (let i = 0; i < 30; i++) {
      const dayNumber = i + 1;
      const daysAgo = 29 - i;

      if (i >= 23) {
        const sevenIdx = i - 23;
        const candidate = rawSeven[sevenIdx];
        const dObj = candidate && typeof candidate === 'object'
          ? candidate
          : defaultSeven[sevenIdx] || { label: `Hari ${dayNumber}`, status: 'clean', note: 'Hari bersih' };
        let status = typeof dObj.status === 'string' ? dObj.status : 'clean';
        let note = typeof dObj.note === 'string' ? dObj.note : 'Hari bersih';
        const labelStr = typeof dObj.label === 'string' ? dObj.label : `Hari ${dayNumber}`;

        // If user simulated a long streak (e.g. 7d, 14d, 30d, 90d), override past days within streak as clean
        if (breakdown.days >= 7 && daysAgo <= breakdown.days && status !== 'today') {
          status = i % 5 === 0 ? 'shielded' : 'clean';
          note = status === 'shielded'
            ? `Hari ke-${dayNumber} — Bersih & berhasil menahan godaan (+50 XP)`
            : `Hari ke-${dayNumber} — Streak bersih terjaga dengan disiplin penuh`;
        }
        cells.push({
          dayNumber,
          status,
          label: `Hari ${dayNumber} (${labelStr})`,
          note
        });
      } else {
        let status = historicalPattern[i] || 'clean';
        if (breakdown.days >= 30 || daysAgo < breakdown.days) {
          status = i % 6 === 2 ? 'shielded' : 'clean';
        }
        const statusDesc =
          status === 'shielded'
            ? 'Hari bersih + berhasil mematahkan godaan dengan SOS Shield'
            : status === 'relapse'
            ? 'Evaluasi tercatat — menjadi pelajaran penting untuk streak berikutnya'
            : 'Hari bersih & disiplin terjaga';
        cells.push({
          dayNumber,
          status,
          label: `Hari ${dayNumber} (30D Orbit)`,
          note: statusDesc
        });
      }
    }

    const cleanOrShieldedCount = cells.filter(
      (c) => c.status === 'clean' || c.status === 'shielded' || c.status === 'today'
    ).length;
    const relapseCount = cells.filter((c) => c.status === 'relapse').length;
    const consistencyPct = Math.round((cleanOrShieldedCount / 30) * 100);

    return {
      cells,
      cleanCount: cleanOrShieldedCount,
      relapseCount,
      consistencyPct
    };
  }

  /**
   * Pure helper: Compute Statistics Hero Metrics (Time Saved & Improvement %) + Extended KPIs
   */
  function computeStatisticsMetrics(state, nowMs = Date.now()) {
    const safeState = state && typeof state === 'object' ? state : createDefaultState(nowMs);
    const isDayOne = Boolean(safeState.isDayOne);
    const breakdown = computeStreakBreakdown(safeState.streakStartTime, nowMs);
    const dailyMins = Math.max(5, Number(safeState.dailyWastedMinutes) || 21);
    const exactDays = breakdown.totalHours / 24;

    // At reference streak (~2.53 days) and dailyMins=21, 2.53 * 20.55 => 52; at 0 elapsed => 0
    const rawSaved = Math.round(exactDays * (dailyMins - 0.45));
    const displaySaved = isDayOne ? 0 : Math.max(0, rawSaved);

    // Count clean and relapse days in 7-day glance safely (ignoring null/malformed entries)
    const sevenDays = Array.isArray(safeState.sevenDays) ? safeState.sevenDays : [];
    const validDays = sevenDays.filter((d) => d && typeof d === 'object');
    const cleanDaysCount = validDays.filter((d) => d.status === 'clean' || d.status === 'shielded').length;
    const relapseDaysCount = validDays.filter((d) => d.status === 'relapse').length;
    const extraRelapsePenalty = Math.max(0, relapseDaysCount - 1) * 5;

    let improvementPct = 0;
    if (isDayOne) {
      improvementPct = safeState.lastPledgeDate ? 5 : 0;
    } else {
      const baseImprovement = 20 + cleanDaysCount * 3 + (safeState.lastPledgeDate ? 4 : 0) - extraRelapsePenalty;
      const streakBonus = Math.min(60, Math.floor(breakdown.days * 0.7));
      improvementPct = Math.min(99, Math.max(5, baseImprovement + (breakdown.days > 3 ? streakBonus : 0)));
    }

    // Extended KPI calculations
    const currentStreakLabel = `${breakdown.days}d ${breakdown.hours}h`;
    const storedLongestHours = Number.isFinite(safeState.longestStreakHours)
      ? Number(safeState.longestStreakHours)
      : (isDayOne ? 0 : 342);
    const bestTotalHours = Math.max(storedLongestHours, Math.floor(breakdown.totalHours));
    const bestDays = Math.floor(bestTotalHours / 24);
    const bestRemHours = bestTotalHours % 24;
    const bestStreakLabel = bestTotalHours === 0 ? '0d 0h (Day 1)' : `${bestDays}d ${bestRemHours}h`;
    const isNewRecord = Math.floor(breakdown.totalHours) >= storedLongestHours;

    const totalUrges = Math.max(0, Number(safeState.totalUrgesOvercome) || 0);
    const urgeDenom = Math.max(1, totalUrges + relapseDaysCount);
    const urgeVictoryRate = totalUrges > 0 ? Math.min(99, Math.round((totalUrges / urgeDenom) * 100)) : 0;

    const matrix = computeThirtyDayMatrix(safeState, nowMs);
    const xp = Math.max(0, Number(safeState.xp) || 0);
    let rankTitle = 'Fokus';
    if (xp >= 800) rankTitle = 'Sovereign';
    else if (xp >= 400) rankTitle = 'Vanguard';
    else if (xp >= 220) rankTitle = 'Guardian';

    const deepWorkSessionsRecovered = isDayOne ? 0 : Number((displaySaved / 25).toFixed(1));

    return {
      timeSavedValue: displaySaved,
      improvementPct,
      currentStreakLabel,
      bestStreakLabel,
      bestTotalHours,
      isNewRecord,
      totalUrgesOvercome: totalUrges,
      urgeVictoryRate,
      cleanScorePct: matrix.consistencyPct,
      rankTitle,
      deepWorkSessionsRecovered
    };
  }

  /**
   * Pure helper: 4-7-8 Breathing Phase Resolver given elapsed seconds in a 19-second cycle
   * Inhale: 4s (0..3), Hold: 7s (4..10), Exhale: 8s (11..18)
   */
  function resolveBreathing478Step(cycleSecond) {
    const sec = ((Math.floor(cycleSecond) % 19) + 19) % 19;
    if (sec < 4) {
      return {
        phase: 'inhale',
        label: 'TARIK NAPAS (4s)',
        remainingSeconds: 4 - sec
      };
    }
    if (sec < 11) {
      return {
        phase: 'hold',
        label: 'TAHAN NAPAS (7s)',
        remainingSeconds: 11 - sec
      };
    }
    return {
      phase: 'exhale',
      label: 'HEMBUSKAN (8s)',
      remainingSeconds: 19 - sec
    };
  }

  /**
   * Validate 4-digit PIN
   */
  function isValidPin(pin) {
    return typeof pin === 'string' && /^\d{4}$/.test(pin);
  }

  /**
   * Pure helper: validate HH:mm 24-hour reminder time string (e.g. "07:00", "21:30")
   */
  function isValidReminderTime(timeStr) {
    return typeof timeStr === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeStr.trim());
  }

  /**
   * Pure helper: normalize reminder time to valid HH:mm or fallback ("07:00")
   */
  function normalizeReminderTime(timeStr, fallback = DEFAULT_REMINDER_TIME) {
    const safeFallback = isValidReminderTime(fallback) ? fallback.trim() : DEFAULT_REMINDER_TIME;
    if (!isValidReminderTime(timeStr)) return safeFallback;
    return timeStr.trim();
  }

  /**
   * Pure helper: compute next daily commit reminder schedule info & human-readable status
   */
  function computeNextReminderInfo(
    reminderTime = DEFAULT_REMINDER_TIME,
    nowMs = Date.now(),
    lastSentDate = null,
    isCommittedToday = false
  ) {
    const safeTime = normalizeReminderTime(reminderTime);
    const parts = safeTime.split(':');
    const targetHour = parseInt(parts[0], 10);
    const targetMinute = parseInt(parts[1], 10);
    const targetMins = targetHour * 60 + targetMinute;

    const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const now = new Date(safeNowMs);
    const todayStr = formatDateString(safeNowMs);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const alreadySentToday = lastSentDate === todayStr && nowMins >= targetMins;
    const skipToday = alreadySentToday || Boolean(isCommittedToday);

    let nextDate;
    let isToday = false;
    let isDueNow = false;

    if (!skipToday && nowMins < targetMins) {
      nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
      isToday = true;
    } else if (!skipToday && nowMins === targetMins) {
      nextDate = new Date(safeNowMs);
      isToday = true;
      isDueNow = true;
    } else {
      nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, targetHour, targetMinute, 0, 0);
      isToday = false;
    }

    const nextTimestamp = nextDate.getTime();
    const msUntilNext = Math.max(0, nextTimestamp - safeNowMs);
    const totalMinutesUntil = Math.ceil(msUntilNext / 60000);
    const hoursUntil = Math.floor(totalMinutesUntil / 60);
    const minsUntil = totalMinutesUntil % 60;

    let countdownLabel = '';
    if (isDueNow) {
      countdownLabel = 'sekarang';
    } else if (hoursUntil > 0 && minsUntil > 0) {
      countdownLabel = `dalam ${hoursUntil} jam ${minsUntil} menit`;
    } else if (hoursUntil > 0) {
      countdownLabel = `dalam ${hoursUntil} jam`;
    } else {
      countdownLabel = `dalam ${Math.max(1, minsUntil)} menit`;
    }

    const dayWord = isToday ? 'hari ini' : 'besok';
    const statusLabel = isDueNow
      ? `Pengingat aktif pukul ${safeTime} (jadwal hari ini siap dikirim)`
      : `Pengingat aktif pukul ${safeTime} — jadwal berikutnya ${dayWord} (${countdownLabel}).`;

    return {
      reminderTime: safeTime,
      targetHour,
      targetMinute,
      isToday,
      isTomorrow: !isToday,
      isDueNow,
      alreadySentToday,
      isCommittedToday: Boolean(isCommittedToday),
      hoursUntil,
      minutesUntil: minsUntil,
      msUntilNext,
      nextTimestamp,
      statusLabel
    };
  }

  /**
   * Pure helper: determine whether the daily commit reminder should trigger at nowMs
   */
  function shouldTriggerDailyReminder(state, nowMs = Date.now()) {
    if (!state || typeof state !== 'object' || !state.reminderEnabled) {
      return false;
    }
    const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
    const todayStr = getTodayDateString(safeNowMs);
    if (state.lastReminderSentDate === todayStr) {
      return false;
    }
    if (state.lastPledgeDate === todayStr || state.lastPledgedDate === todayStr) {
      return false;
    }
    const safeTime = normalizeReminderTime(state.reminderTime);
    const parts = safeTime.split(':');
    const targetMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    const d = new Date(safeNowMs);
    const nowMins = d.getHours() * 60 + d.getMinutes();
    return nowMins >= targetMins;
  }

  /**
   * Pure helper: build notification title & body for daily commit reminder (respects Stealth Mode & commit status)
   */
  function buildCommitReminderPayload(state, nowMs = Date.now()) {
    const safeState = state && typeof state === 'object' ? state : {};
    const safeTime = normalizeReminderTime(safeState.reminderTime);
    const todayStr = getTodayDateString(Number.isFinite(nowMs) ? nowMs : Date.now());
    const isCommittedToday = safeState.lastPledgeDate === todayStr;
    const isStealth = Boolean(safeState.stealthMode);

    if (isStealth) {
      return {
        title: 'ASTRAL — Pengingat Fokus Harian',
        body: isCommittedToday
          ? `Jadwal ${safeTime}: Komitmen fokus hari ini sudah terkunci. Pertahankan orbit fokusmu!`
          : `Jadwal ${safeTime}: Saatnya buka ASTRAL dan tahan tombol "Hold 3s to Commit Today" untuk mengunci fokus hari ini.`,
        tag: 'seed-daily-commit-reminder',
        reminderTime: safeTime
      };
    }

    return {
      title: 'SEED — Saatnya Commit Hari Ini!',
      body: isCommittedToday
        ? `Pengingat ${safeTime}: Kamu sudah Commit hari ini (+25 XP). Jaga terus streak bersihmu!`
        : `Pengingat ${safeTime}: Buka aplikasi SEED dan tahan tombol "Hold 3s to Commit Today" selama 3 detik untuk mengunci komitmen harianmu (+25 XP).`,
      tag: 'seed-daily-commit-reminder',
      reminderTime: safeTime
    };
  }

  function sanitizeKeyCounts(rawObj, defObj) {
    const clean = { ...defObj };
    if (rawObj && typeof rawObj === 'object' && !Array.isArray(rawObj)) {
      Object.keys(defObj).forEach((k) => {
        const v = Number(rawObj[k]);
        if (Number.isFinite(v) && v >= 0) {
          clean[k] = Math.floor(v);
        }
      });
    }
    return clean;
  }

  function sanitizeSevenDays(rawArr, defArr) {
    if (!Array.isArray(rawArr) || rawArr.length !== 7) {
      return defArr.map((d) => ({ ...d }));
    }
    const validStatuses = ['clean', 'shielded', 'relapse', 'today', 'empty'];
    return defArr.map((fallbackDay, idx) => {
      const item = rawArr[idx];
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { ...fallbackDay };
      }
      return {
        ...fallbackDay,
        ...item,
        dayLetter:
          typeof item.dayLetter === 'string' && item.dayLetter.trim()
            ? item.dayLetter.trim().slice(0, 2)
            : fallbackDay.dayLetter,
        label:
          typeof item.label === 'string' && item.label.trim()
            ? item.label.trim()
            : fallbackDay.label,
        status: validStatuses.includes(item.status) ? item.status : fallbackDay.status,
        note:
          typeof item.note === 'string' && item.note.trim()
            ? item.note.trim()
            : fallbackDay.note
      };
    });
  }

  function sanitizeLoadedState(parsed, def, nowMs = Date.now()) {
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }
    if (!def || typeof def !== 'object') {
      if (typeof def === 'number') {
        nowMs = def;
      }
      def = createDefaultState(nowMs, Boolean(parsed.isDayOne));
    }
    const todayStr = getTodayDateString(nowMs);
    const validDurations = [5, 10, 15];
    const rawDur = Number(parsed.selectedTapeDurationMin);
    const safeDuration = validDurations.includes(rawDur) ? rawDur : def.selectedTapeDurationMin;
    const safeTapeId = [1, 2, 3].includes(Number(parsed.selectedTapeId))
      ? Number(parsed.selectedTapeId)
      : def.selectedTapeId;

    const lastUrgeDate = typeof parsed.lastUrgeDate === 'string' ? parsed.lastUrgeDate : todayStr;
    const rawUrgesToday = Number.isFinite(Number(parsed.urgesOvercomeToday))
      ? Math.max(0, Math.floor(Number(parsed.urgesOvercomeToday)))
      : def.urgesOvercomeToday;

    const validAnimModes = ['orbit', 'morph', 'hyper'];
    const safeAnimMode = validAnimModes.includes(parsed.seedAnimMode)
      ? parsed.seedAnimMode
      : def.seedAnimMode;

    const validPeriods = ['7d', '30d', '90d'];
    const safePeriod = validPeriods.includes(parsed.statsPeriod)
      ? parsed.statsPeriod
      : def.statsPeriod;

    const safeEnergyHistory =
      Array.isArray(parsed.energyHistory) && parsed.energyHistory.length === 7
        ? parsed.energyHistory.map((v) =>
            v === null ? null : Math.max(1, Math.min(5, Math.round(Number(v) || 4)))
          )
        : [...def.energyHistory];

    return {
      ...def,
      ...parsed,
      streakStartTime: Number.isFinite(Number(parsed.streakStartTime))
        ? Number(parsed.streakStartTime)
        : def.streakStartTime,
      longestStreakHours: Number.isFinite(Number(parsed.longestStreakHours))
        ? Math.max(0, Math.floor(Number(parsed.longestStreakHours)))
        : def.longestStreakHours,
      xp: Number.isFinite(Number(parsed.xp))
        ? Math.max(0, Math.floor(Number(parsed.xp)))
        : def.xp,
      urgesOvercomeToday: lastUrgeDate === todayStr ? rawUrgesToday : 0,
      lastUrgeDate: todayStr,
      totalUrgesOvercome: Number.isFinite(Number(parsed.totalUrgesOvercome))
        ? Math.max(0, Math.floor(Number(parsed.totalUrgesOvercome)))
        : def.totalUrgesOvercome,
      selectedVaultStageIndex: Number.isFinite(Number(parsed.selectedVaultStageIndex))
        ? Math.max(0, Math.min(SEED_STAGES.length - 1, Math.floor(Number(parsed.selectedVaultStageIndex))))
        : def.selectedVaultStageIndex,
      unlockedStageIds: Array.isArray(parsed.unlockedStageIds)
        ? parsed.unlockedStageIds.filter((id) => typeof id === 'string')
        : SEED_STAGES.filter(
            (s) =>
              Math.max(
                0,
                (nowMs -
                  (Number.isFinite(Number(parsed.streakStartTime))
                    ? Number(parsed.streakStartTime)
                    : def.streakStartTime)) /
                  3600000
              ) >= s.hoursRequired
          ).map((s) => s.id),
      seedAnimMode: safeAnimMode,
      statsPeriod: safePeriod,
      selectedTapeId: safeTapeId,
      selectedTapeDurationMin: safeDuration,
      dailyWastedMinutes: Number.isFinite(Number(parsed.dailyWastedMinutes))
        ? Math.max(5, Math.min(360, Math.floor(Number(parsed.dailyWastedMinutes))))
        : def.dailyWastedMinutes,
      coreReason: typeof parsed.coreReason === 'string' && parsed.coreReason.trim()
        ? parsed.coreReason.trim()
        : def.coreReason,
      stealthMode: Boolean(parsed.stealthMode),
      pinEnabled: Boolean(parsed.pinEnabled),
      pinCode: isValidPin(parsed.pinCode) ? parsed.pinCode : def.pinCode,
      reminderEnabled: Boolean(parsed.reminderEnabled),
      reminderTime: normalizeReminderTime(parsed.reminderTime, def.reminderTime || DEFAULT_REMINDER_TIME),
      lastReminderSentDate:
        typeof parsed.lastReminderSentDate === 'string' && parsed.lastReminderSentDate.trim()
          ? parsed.lastReminderSentDate.trim()
          : null,
      activeChallengeIndex: Number.isFinite(Number(parsed.activeChallengeIndex))
        ? Math.max(0, Math.floor(Number(parsed.activeChallengeIndex))) % COMMUNITY_CHALLENGES.length
        : 0,
      energyHistory: safeEnergyHistory,
      triggers: sanitizeKeyCounts(parsed.triggers, def.triggers),
      timeVulnerability: sanitizeKeyCounts(parsed.timeVulnerability, def.timeVulnerability),
      sevenDays: buildAlignedSevenDays(sanitizeSevenDays(parsed.sevenDays, def.sevenDays), nowMs, Boolean(parsed.isDayOne)),
      lastCalendarDate: typeof parsed.lastCalendarDate === 'string' ? parsed.lastCalendarDate : todayStr,
      joinedChallenges:
        parsed.joinedChallenges &&
        typeof parsed.joinedChallenges === 'object' &&
        !Array.isArray(parsed.joinedChallenges)
          ? parsed.joinedChallenges
          : {}
    };
  }

  // =========================================================================
  // Browser Interactive Controller (Runs when `document` is present)
  // =========================================================================
  function initBrowserApp() {
    if (typeof document === 'undefined' || !document.getElementById('screen-home')) {
      return null;
    }

    const searchQuery =
      typeof location !== 'undefined' && typeof location.search === 'string'
        ? location.search
        : '';
    const pathnameStr =
      typeof location !== 'undefined' && typeof location.pathname === 'string'
        ? location.pathname
        : '';
    let storedEditionPref = null;
    try {
      storedEditionPref = localStorage.getItem(EDITION_STORAGE_KEY);
    } catch (e) {}

    let currentEdition = resolveAppEdition(searchQuery, storedEditionPref, pathnameStr);
    if (
      (searchQuery && /(?:edition|mode|app)=/i.test(searchQuery)) ||
      /\/(?:release|rilis|demo)\/?$/i.test(pathnameStr)
    ) {
      try {
        localStorage.setItem(EDITION_STORAGE_KEY, currentEdition);
      } catch (e) {}
    }

    function getActiveStorageKey(ed = currentEdition) {
      return ed === 'release' ? RELEASE_STORAGE_KEY : STORAGE_KEY;
    }

    let state = loadState(currentEdition);
    let activeTab = 'home';
    let lastTickerHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;

    // SOS 4-7-8 Breathing Timer State
    let sosActive = false;
    let sosBreathCycleSec = 0;
    let sosStartNowMs = 0;
    let sosIntervalId = null;
    let currentChallengeIdx = 0;
    let lastRenderedSecondStr = null;
    let secondPulseTimeout = null;

    // 3-Second Hold Pledge State
    let holdStartMs = null;
    let holdRafId = null;
    const HOLD_DURATION_MS = 3000;

    // Relapse Modal Selected Trigger
    let selectedRelapseTrigger = 'Larut Malam';

    // Selected Day Index in Statistics 7-Day Row & 30-Day Heatmap
    let selectedDayIndex = null;
    let selectedHeatmapIndex = null;

    // PIN Keypad Buffer & Error Timer
    let enteredPinBuffer = '';
    let pinErrorTimeout = null;

    // Starfield Animation Frame Handle
    let starfieldRafId = null;

    // Web Audio API Binaural Synthesizer State
    let audioCtx = null;
    let leftOsc = null;
    let rightOsc = null;
    let padOsc = null;
    let masterGain = null;
    let analyserNode = null;
    let isPlayingAudio = false;
    let audioRemainingSeconds = state.selectedTapeDurationMin * 60;
    let audioTimerInterval = null;
    let visualizerPhase = 0;

    // 3D Seed Canvas Rotation, Inertia, Animation & Pulse State
    let seedRotY = 0.4;
    let seedRotX = 0.22;
    let seedVelY = 0;
    let seedVelX = 0;
    let isDraggingSeed = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let seedPulseEnergy = 0;
    let pulseBurstTimeout = null;

    // Precomputed 18 Fibonacci-Sphere Crater Centers for Stage 1 (Origin Seed - Ref Image 2)
    const originSeedCraters = Array.from({ length: 18 }, (_, i) => {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (i / 17) * 1.82; // Avoid extreme poles for balanced distribution
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      return {
        x: Math.cos(theta) * radiusAtY,
        y,
        z: Math.sin(theta) * radiusAtY,
        cosRadius: 0.87 + (i % 3) * 0.025, // Angular size of circular crater
        depth: 6.2 + (i % 4) * 1.4,
        rimHeight: 2.4 + (i % 3) * 0.65,
        phase: i * 0.7
      };
    });

    // 28 3D Orbiting Cosmic Spores around Seed Artifact
    const seedSpores = Array.from({ length: 28 }, (_, idx) => ({
      orbitRadius: 58 + (idx % 6) * 6,
      angleOffset: (idx / 28) * Math.PI * 2,
      speed: 0.52 + (idx % 4) * 0.22,
      yAmp: 18 + (idx % 6) * 6,
      yFreq: 0.9 + (idx % 3) * 0.35,
      size: 1.35 + (idx % 3) * 0.75
    }));

    function loadState(ed = currentEdition) {
      const storageKey = getActiveStorageKey(ed);
      const fallbackCreator = ed === 'release' ? createDayOneState : createDefaultState;
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          const initial = fallbackCreator();
          localStorage.setItem(storageKey, JSON.stringify(initial));
          return initial;
        }
        const parsed = JSON.parse(raw);
        const def = fallbackCreator();
        const sanitized = sanitizeLoadedState(parsed || {}, def);
        localStorage.setItem(storageKey, JSON.stringify(sanitized));
        return sanitized;
      } catch (e) {
        return fallbackCreator();
      }
    }

    function saveState() {
      try {
        localStorage.setItem(getActiveStorageKey(currentEdition), JSON.stringify(state));
      } catch (e) {
        // Ignore storage quota errors in restricted environments
      }
    }

    function renderEditionUI() {
      const isRelease = currentEdition === 'release';
      const cfg = APP_EDITIONS[currentEdition] || APP_EDITIONS.demo;

      if (document.body) {
        document.body.setAttribute('data-app-edition', currentEdition);
      }

      const manifestLink = document.getElementById('app-manifest-link');
      if (manifestLink) {
        manifestLink.setAttribute('href', cfg.manifestHref);
      }

      const desktopBadge = document.getElementById('desktop-edition-badge');
      if (desktopBadge) {
        desktopBadge.textContent = `v${APP_VERSION}`;
        desktopBadge.classList.toggle('badge-release', isRelease);
      }

      const versionBadge = document.getElementById('shield-version-badge');
      if (versionBadge) {
        versionBadge.textContent = state.stealthMode
          ? `ASTRAL v${APP_VERSION}`
          : `SEED v${APP_VERSION}`;
      }

      const versionDesc = document.getElementById('shield-version-desc');
      if (versionDesc) {
        versionDesc.textContent = state.stealthMode
          ? `ASTRAL Orbital Focus Timer • Build v${APP_VERSION} (Offline-First PWA & Android APK).`
          : `SEED Cosmic Dopamine Reboot • Build v${APP_VERSION} (Offline-First PWA & Android APK).`;
      }
    }

    function switchAppEdition(targetEdition) {
      const nextEd = targetEdition === 'release' ? 'release' : 'demo';
      currentEdition = nextEd;
      try {
        localStorage.setItem(EDITION_STORAGE_KEY, currentEdition);
      } catch (e) {}
      try {
        if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function') {
          const basePath =
            typeof location !== 'undefined' && typeof location.pathname === 'string'
              ? location.pathname.replace(/\/(?:release|rilis|demo)\/?$/i, '/')
              : './index.html';
          window.history.replaceState(null, '', `${basePath}?edition=${currentEdition}`);
        }
      } catch (e) {}
      if (sosActive) {
        closeSosMode();
      }
      state = loadState(currentEdition);
      lastTickerHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;
      if (!isPlayingAudio) {
        audioRemainingSeconds = state.selectedTapeDurationMin * 60;
      }
      selectedDayIndex = null;
      selectedHeatmapIndex = null;
      if (state.pinEnabled) {
        lockAppWithPin();
      } else {
        const pinOv = document.getElementById('pin-lock-overlay');
        if (pinOv) pinOv.classList.remove('locked');
      }
      renderEditionUI();
      renderAll();
      syncReminderWithServiceWorker();
      showToast(
        currentEdition === 'release'
          ? 'Beralih ke SEED Versi Rilis (Mode Pribadi • Penyimpanan Terisolasi)'
          : 'Beralih ke SEED Versi Demo (Mode Showcase & Simulator)'
      );
      return currentEdition;
    }

    function syncDailyRollover() {
      const todayStr = getTodayDateString();
      const lastDate = state.lastCalendarDate || state.lastUrgeDate;
      if (lastDate && lastDate !== todayStr) {
        state.urgesOvercomeToday = 0;
        state.sevenDays = buildAlignedSevenDays(state.sevenDays, Date.now(), Boolean(state.isDayOne));
        state.lastUrgeDate = todayStr;
        state.lastCalendarDate = todayStr;
        saveState();
      } else if (!state.lastCalendarDate) {
        state.lastCalendarDate = todayStr;
        state.lastUrgeDate = todayStr;
      }
    }

    function updateSystemClock() {
      const clockEl = document.getElementById('ios-clock');
      if (!clockEl) return;
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}`;
    }

    // Toast helper
    let toastTimeout = null;
    function showToast(message) {
      const toastEl = document.getElementById('cosmic-toast');
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.classList.add('visible');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toastEl.classList.remove('visible');
      }, 2800);
    }

    // =======================================================================
    // 1. Live Streak Timer & Home Rendering
    // =======================================================================
    function renderHome() {
      syncDailyRollover();
      updateSystemClock();
      const breakdown = computeStreakBreakdown(state.streakStartTime, Date.now());
      const currentLongest = Number.isFinite(state.longestStreakHours) ? state.longestStreakHours : 0;
      if (Math.floor(breakdown.totalHours) > currentLongest) {
        state.longestStreakHours = Math.floor(breakdown.totalHours);
      }

      const startMetaEl = document.getElementById('home-streak-start-meta');
      if (startMetaEl) {
        const isFuture = state.streakStartTime > Date.now();
        if (state.stealthMode) {
          startMetaEl.textContent = isFuture
            ? `Sesi Dijadwalkan: ${formatIndonesianDateTime(state.streakStartTime)}`
            : `Sesi Aktif: ${formatIndonesianDateTime(state.streakStartTime)}`;
        } else {
          startMetaEl.textContent = isFuture
            ? `Dijadwalkan: ${formatIndonesianDateTime(state.streakStartTime)}`
            : `Dimulai: ${formatIndonesianDateTime(state.streakStartTime)}`;
        }
      }

      const daysEl = document.getElementById('timer-days');
      const hoursEl = document.getElementById('timer-hours');
      const minutesEl = document.getElementById('timer-minutes');
      const secondsEl = document.getElementById('timer-seconds');

      if (daysEl) daysEl.textContent = String(breakdown.days);
      if (hoursEl) hoursEl.textContent = String(breakdown.hours);
      if (minutesEl) minutesEl.textContent = String(breakdown.minutes);
      if (secondsEl) {
        const nextSecStr = String(breakdown.seconds);
        if (lastRenderedSecondStr !== null && lastRenderedSecondStr !== nextSecStr) {
          secondsEl.classList.add('tick-pulse');
          if (secondPulseTimeout) clearTimeout(secondPulseTimeout);
          secondPulseTimeout = setTimeout(() => {
            secondsEl.classList.remove('tick-pulse');
          }, 180);
        }
        lastRenderedSecondStr = nextSecStr;
        secondsEl.textContent = nextSecStr;
      }

      const xpEl = document.getElementById('home-xp-value');
      const urgesEl = document.getElementById('home-urges-count');
      if (xpEl) xpEl.textContent = `${state.xp} XP`;
      if (urgesEl) urgesEl.textContent = String(state.urgesOvercomeToday);

      const reasonDisplay = document.getElementById('sos-core-reason-display');
      if (reasonDisplay) {
        reasonDisplay.textContent = `"${state.coreReason}"`;
      }

      const openSosBtn = document.getElementById('btn-open-sos');
      const openRelapseBtn = document.getElementById('btn-open-relapse');
      if (openSosBtn) {
        openSosBtn.textContent = state.stealthMode ? 'Focus Shield / SOS' : 'Urge Shield / SOS';
      }
      if (openRelapseBtn) {
        openRelapseBtn.textContent = state.stealthMode ? 'Reset Orbital Timer' : 'I Relapsed (Reset Timer)';
      }

      // Daily Commit button state
      const pledgeBtn = document.getElementById('btn-hold-pledge');
      const pledgeLabel = document.getElementById('pledge-hold-label');
      const pledgeFill = document.getElementById('pledge-hold-fill');
      const isPledgedToday = state.lastPledgeDate === getTodayDateString();

      if (pledgeBtn && pledgeLabel && pledgeFill && holdStartMs === null) {
        if (isPledgedToday) {
          pledgeBtn.classList.add('pledged-done');
          pledgeFill.style.width = '100%';
          pledgeLabel.textContent = 'Committed Today • Komitmen Terkunci';
        } else {
          pledgeBtn.classList.remove('pledged-done');
          pledgeFill.style.width = '0%';
          pledgeLabel.textContent = 'Hold 3s to Commit Today';
        }
      }
    }

    // =======================================================================
    // 2. Interactive SOS Mode (4-7-8 Breathing + Physical Challenge + +50 XP)
    // =======================================================================
    function openSosMode() {
      const homeScreen = document.getElementById('screen-home');
      if (!homeScreen) return;
      sosActive = true;
      sosBreathCycleSec = 0;
      sosStartNowMs = getNowMs();
      homeScreen.classList.add('sos-active');
      updateBreathingStepUI();

      if (sosIntervalId) clearInterval(sosIntervalId);
      sosIntervalId = setInterval(() => {
        const elapsedSec = Math.floor(Math.max(0, getNowMs() - sosStartNowMs) / 1000);
        sosBreathCycleSec = elapsedSec % 19;
        updateBreathingStepUI();
      }, 250);
    }

    function closeSosMode() {
      const homeScreen = document.getElementById('screen-home');
      if (!homeScreen) return;
      sosActive = false;
      homeScreen.classList.remove('sos-active');
      const outerShell = document.getElementById('orb-outer-shell');
      const innerRing = document.getElementById('orb-inner-ring');
      if (outerShell) outerShell.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1)';
      if (innerRing) innerRing.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1)';
      if (sosIntervalId) {
        clearInterval(sosIntervalId);
        sosIntervalId = null;
      }
    }

    function updateBreathingStepUI() {
      const homeScreen = document.getElementById('screen-home');
      const phaseLabel = document.getElementById('breath-phase-label');
      const secGiant = document.getElementById('breath-seconds-giant');
      const step = resolveBreathing478Step(sosBreathCycleSec);

      if (homeScreen) homeScreen.setAttribute('data-breath-phase', step.phase);
      if (phaseLabel) phaseLabel.textContent = step.label;
      if (secGiant) secGiant.textContent = `${step.remainingSeconds}s`;
    }

    function shufflePhysicalChallenge() {
      currentChallengeIdx = (currentChallengeIdx + 1) % PHYSICAL_CHALLENGES.length;
      const labelEl = document.getElementById('sos-challenge-label');
      if (labelEl) {
        labelEl.textContent = PHYSICAL_CHALLENGES[currentChallengeIdx];
      }
    }

    function recordTodayUrgeNote() {
      if (Array.isArray(state.sevenDays) && state.sevenDays[6] && typeof state.sevenDays[6] === 'object') {
        const count = state.urgesOvercomeToday;
        if (state.sevenDays[6].status === 'today' || state.sevenDays[6].status === 'clean') {
          state.sevenDays[6].note = `Hari Ini — Berhasil menahan ${count}x godaan hari ini!`;
        }
      }
    }

    function completeUrgeVictory() {
      syncDailyRollover();
      state.xp += 50;
      state.urgesOvercomeToday += 1;
      state.totalUrgesOvercome += 1;
      state.lastUrgeDate = getTodayDateString();
      recordTodayUrgeNote();
      saveState();
      playVictoryChime();
      closeSosMode();
      renderHome();
      renderStatistics();
      showToast('Godaan Berhasil Dilewati! +50 XP ditambahkan.');
    }

    // =======================================================================
    // 3. Hold 3 Seconds to Commit Today
    // =======================================================================
    function getNowMs() {
      return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    }

    function startHoldPledge(e) {
      if (e && e.type === 'mousedown' && e.button !== 0) return;
      if (state.lastPledgeDate === getTodayDateString()) {
        showToast('Komitmen hari ini sudah terkunci! Pertahankan streak-mu.');
        return;
      }
      if (holdStartMs !== null) return;
      holdStartMs = getNowMs();

      const pledgeFill = document.getElementById('pledge-hold-fill');
      const pledgeLabel = document.getElementById('pledge-hold-label');

      function tickHold(rafTimestamp) {
        if (holdStartMs === null) return;
        const currentNow =
          typeof rafTimestamp === 'number' && Number.isFinite(rafTimestamp) && rafTimestamp >= holdStartMs
            ? rafTimestamp
            : getNowMs();
        const elapsed = Math.max(0, currentNow - holdStartMs);
        const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
        if (pledgeFill) pledgeFill.style.width = `${pct.toFixed(1)}%`;
        const remainingSec = Math.max(0, (HOLD_DURATION_MS - elapsed) / 1000).toFixed(1);
        if (pledgeLabel) pledgeLabel.textContent = `Tahan terus... ${remainingSec}s`;

        if (elapsed >= HOLD_DURATION_MS) {
          holdStartMs = null;
          holdRafId = null;
          completeDailyPledge();
          return;
        }
        holdRafId = requestAnimationFrame(tickHold);
      }

      holdRafId = requestAnimationFrame(tickHold);
    }

    function cancelHoldPledge() {
      if (holdStartMs === null) return;
      const heldMs = Math.max(0, getNowMs() - holdStartMs);
      holdStartMs = null;
      if (holdRafId) {
        cancelAnimationFrame(holdRafId);
        holdRafId = null;
      }
      renderHome();
      if (heldMs > 220 && state.lastPledgeDate !== getTodayDateString()) {
        showToast('Tahan tombol penuh selama 3 detik untuk mengunci commit hari ini.');
      }
    }

    function completeDailyPledge() {
      state.lastPledgeDate = getTodayDateString();
      state.xp += 25;
      if (state.sevenDays && state.sevenDays[6]) {
        state.sevenDays[6].status = 'clean';
        state.sevenDays[6].note = 'Hari Ini — Komitmen harian terkunci (+25 XP)';
      }
      saveState();
      playVictoryChime();
      renderHome();
      renderStatistics();
      renderShield();
      syncReminderWithServiceWorker();
      showToast('Komitmen Harian Terkunci! +25 XP diperoleh.');
    }

    // =======================================================================
    // 4. Relapse Trigger Evaluation Modal & Reset
    // =======================================================================
    function openGenesisWelcomeModal() {
      const modal = document.getElementById('modal-genesis-welcome');
      if (modal) modal.classList.add('open');
    }

    function closeGenesisWelcomeModal() {
      const modal = document.getElementById('modal-genesis-welcome');
      if (modal) modal.classList.remove('open');
    }

    function simulateDayOneState(showModal = true) {
      const prevReminderEnabled = Boolean(state && state.reminderEnabled);
      const prevReminderTime =
        state && isValidReminderTime(state.reminderTime)
          ? state.reminderTime
          : DEFAULT_REMINDER_TIME;
      state = createDayOneState(Date.now());
      state.reminderEnabled = prevReminderEnabled;
      state.reminderTime = prevReminderTime;
      selectedDayIndex = 6;
      selectedHeatmapIndex = 0;
      saveState();
      renderAll();
      syncReminderWithServiceWorker();
      if (showModal) {
        openGenesisWelcomeModal();
      }
      showToast('Mode Day One Aktif! Timer berjalan live dari 0 detik.');
    }

    function openRelapseModal() {
      const modal = document.getElementById('modal-relapse');
      if (modal) modal.classList.add('open');
    }

    function closeRelapseModal() {
      const modal = document.getElementById('modal-relapse');
      if (modal) modal.classList.remove('open');
    }

    function confirmRelapseReset() {
      const noteInput = document.getElementById('input-relapse-note');
      const customNote = noteInput && noteInput.value.trim()
        ? noteInput.value.trim()
        : 'Evaluasi tercatat untuk pencegahan berikutnya.';

      const now = new Date();
      const hourNum = now.getHours();
      const timeStr = `${String(hourNum).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      state.streakStartTime = Date.now();
      state.lastPledgeDate = null;
      state.unlockedStageIds = [];
      state.triggers[selectedRelapseTrigger] = (state.triggers[selectedRelapseTrigger] || 0) + 1;

      // Also update time vulnerability window
      let vulnKey = 'Larut Malam (21–01)';
      if (hourNum >= 1 && hourNum < 6) vulnKey = 'Dini Hari (01–05)';
      else if (hourNum >= 11 && hourNum < 15) vulnKey = 'Siang Hari (11–15)';
      else if (hourNum >= 15 && hourNum < 21) vulnKey = 'Sore Hari (15–19)';
      if (!state.timeVulnerability) state.timeVulnerability = {};
      state.timeVulnerability[vulnKey] = (state.timeVulnerability[vulnKey] || 0) + 1;

      if (state.sevenDays && state.sevenDays[6]) {
        state.sevenDays[6] = {
          dayLetter: 'S',
          label: 'Hari Ini (Evaluasi)',
          status: 'relapse',
          trigger: selectedRelapseTrigger,
          time: timeStr,
          note: `Pemicu: ${selectedRelapseTrigger} (${timeStr}) — ${customNote}`
        };
        selectedDayIndex = 6;
      }

      if (noteInput) noteInput.value = '';
      saveState();
      closeRelapseModal();
      renderAll();
      syncReminderWithServiceWorker();
      showToast(`Timer di-reset. Pemicu "${selectedRelapseTrigger}" tercatat di Statistik.`);
    }

    // =======================================================================
    // 5. TAB 2: SEED VAULT & Multi-Layer Animated 3D Seed Canvas Renderer
    // =======================================================================
    function getStageMiniSvgMarkup(stageIdx) {
      if (stageIdx === 0) {
        // Origin Seed: Cratered Lunar Organic Spore
        return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
          <defs>
            <radialGradient id="ms0" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="65%" stop-color="#CBD5E1"/>
              <stop offset="100%" stop-color="#475569"/>
            </radialGradient>
          </defs>
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(79,139,255,0.45)" stroke-dasharray="3 2" stroke-width="1"/>
          <path d="M18 6 C25 7, 29 14, 27 22 C25 28, 19 30, 14 28 C8 25, 8 15, 12 9 C14 7, 16 6, 18 6 Z" fill="url(#ms0)"/>
          <circle cx="15" cy="14" r="2.1" fill="#64748B" opacity="0.55"/>
          <circle cx="21" cy="18" r="2.6" fill="#64748B" opacity="0.5"/>
          <circle cx="16" cy="22" r="1.8" fill="#38BDF8" opacity="0.75"/>
        </svg>`;
      }
      if (stageIdx === 1) {
        // Sprout Core: Bioluminescent Core with Living Tendrils
        return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
          <ellipse cx="18" cy="19" rx="14" ry="6" fill="none" stroke="#34D399" stroke-width="1.1" opacity="0.65" transform="rotate(-22 18 19)"/>
          <path d="M18 10 Q13 4 9 7 M18 10 Q23 3 27 7 M14 25 Q9 31 12 33 M22 25 Q27 31 24 33" stroke="#34D399" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <circle cx="18" cy="18" r="8.5" fill="#10B981"/>
          <circle cx="16" cy="16" r="4" fill="#A7F3D0"/>
        </svg>`;
      }
      if (stageIdx === 2) {
        // Nebula Flora: Blooming Cosmic Lotus
        return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
          <g fill="#A855F7" opacity="0.88" stroke="#F472B6" stroke-width="0.7">
            <path d="M18 5 C22 12, 22 20, 18 27 C14 20, 14 12, 18 5 Z"/>
            <path d="M7 14 C14 12, 21 15, 29 14 C22 21, 14 21, 7 14 Z"/>
            <path d="M9 8 C16 11, 20 18, 27 26 C18 22, 12 16, 9 8 Z"/>
            <path d="M27 8 C20 11, 16 18, 9 26 C18 22, 24 16, 27 8 Z"/>
          </g>
          <circle cx="18" cy="17" r="4.5" fill="#FDE047"/>
        </svg>`;
      }
      if (stageIdx === 3) {
        // Aether Crystal: Merkaba Prism + Floating Shards
        return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
          <polygon points="18,4 28,18 18,32 8,18" fill="#0284C7" stroke="#BAE6FD" stroke-width="1"/>
          <polygon points="18,4 28,18 18,18" fill="#38BDF8"/>
          <polygon points="18,4 8,18 18,18" fill="#7DD3FC"/>
          <circle cx="6" cy="11" r="2" fill="#BAE6FD"/>
          <circle cx="30" cy="11" r="2" fill="#BAE6FD"/>
          <circle cx="6" cy="25" r="1.8" fill="#38BDF8"/>
          <circle cx="30" cy="25" r="1.8" fill="#38BDF8"/>
        </svg>`;
      }
      if (stageIdx === 4) {
        // Supernova Tree: Solar Yggdrasil Canopy
        return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" stroke-width="1" stroke-dasharray="4 2"/>
          <path d="M18 26 L18 11 M18 16 L10 9 M18 16 L26 9 M18 13 L13 5 M18 13 L23 5" stroke="#FDE047" stroke-width="1.7" stroke-linecap="round"/>
          <circle cx="18" cy="19" r="6.5" fill="#F59E0B"/>
          <circle cx="18" cy="19" r="3.2" fill="#FEF08A"/>
        </svg>`;
      }
      // Stage 6: Cosmic Sovereign — Triple Gyro Quasar Crown
      return `<svg class="stage-mini-svg" viewBox="0 0 36 36" aria-hidden="true">
        <ellipse cx="18" cy="18" rx="15" ry="6" fill="none" stroke="#F472B6" stroke-width="1.1" transform="rotate(28 18 18)"/>
        <ellipse cx="18" cy="18" rx="15" ry="6" fill="none" stroke="#60A5FA" stroke-width="1.1" transform="rotate(-28 18 18)"/>
        <circle cx="18" cy="18" r="12" fill="none" stroke="#FDE047" stroke-width="0.9" stroke-dasharray="2 2"/>
        <circle cx="18" cy="18" r="5.5" fill="#EC4899"/>
        <circle cx="18" cy="18" r="2.8" fill="#FFFFFF"/>
      </svg>`;
    }

    function triggerSeedPulseBurst() {
      seedPulseEnergy = 1.0;
      const stageEl = document.getElementById('seed-3d-stage');
      if (stageEl) {
        stageEl.classList.remove('pulsing-burst');
        void stageEl.offsetWidth;
        stageEl.classList.add('pulsing-burst');
        if (pulseBurstTimeout) clearTimeout(pulseBurstTimeout);
        pulseBurstTimeout = setTimeout(() => {
          stageEl.classList.remove('pulsing-burst');
        }, 880);
      }
      state.xp += 5;
      saveState();
      playVictoryChime();
      renderHome();
      renderStatistics();
      const idx = Math.max(0, Math.min(SEED_STAGES.length - 1, state.selectedVaultStageIndex || 0));
      const activeStage = SEED_STAGES[idx];
      const dispName = state.stealthMode ? activeStage.stealthName : activeStage.name;
      showToast(`Gelombang Energi Kosmik dipancarkan ke ${dispName}! (+5 XP)`);
    }

    function renderVault() {
      const breakdown = computeStreakBreakdown(state.streakStartTime, Date.now());
      const vaultInfo = computeVaultProgress(breakdown.totalHours, state.stealthMode);

      const idx = Math.max(0, Math.min(SEED_STAGES.length - 1, state.selectedVaultStageIndex || 0));
      const activeStage = vaultInfo.stages[idx];

      const counterEl = document.getElementById('vault-stage-counter');
      if (counterEl) {
        counterEl.textContent = `Stage ${activeStage.stageNumber} of 6 • ${vaultInfo.collectedCount}/6 Collected`;
      }

      const statusPill = document.getElementById('seed-status-pill');
      if (statusPill) {
        statusPill.textContent = activeStage.collected ? 'Collected' : 'Locked';
        statusPill.className = `seed-status-pill ${activeStage.collected ? 'collected' : 'locked'}`;
      }

      const archetypePill = document.getElementById('seed-archetype-pill');
      if (archetypePill) {
        archetypePill.textContent = state.stealthMode
          ? (activeStage.stealthArchetype || activeStage.archetype)
          : activeStage.archetype;
        archetypePill.style.borderColor = activeStage.accentHex;
        archetypePill.style.color = activeStage.primaryColor;
      }

      const titleEl = document.getElementById('seed-hero-title');
      if (titleEl) {
        titleEl.textContent = state.stealthMode ? activeStage.stealthName : activeStage.name;
      }

      const descEl = document.getElementById('seed-hero-description');
      if (descEl) {
        descEl.textContent = activeStage.description;
      }

      const timeEl = document.getElementById('seed-nurture-time');
      if (timeEl) {
        timeEl.textContent = activeStage.timeLabel;
      }

      const glowEl = document.getElementById('seed-3d-glow');
      if (glowEl) {
        glowEl.style.background = `radial-gradient(circle, ${activeStage.glowColor} 0%, transparent 72%)`;
      }

      const stageBoxEl = document.getElementById('seed-3d-stage');
      const stasisOverlay = document.getElementById('seed-stasis-overlay');
      const stasisTimeEl = document.getElementById('stasis-lock-time');
      if (stageBoxEl) {
        stageBoxEl.setAttribute('data-anim-mode', state.seedAnimMode || 'orbit');
        if (activeStage.collected) {
          stageBoxEl.removeAttribute('data-locked');
        } else {
          stageBoxEl.setAttribute('data-locked', 'true');
        }
      }
      if (stasisOverlay) {
        stasisOverlay.classList.toggle('active', !activeStage.collected);
      }
      if (stasisTimeEl && !activeStage.collected) {
        stasisTimeEl.textContent = `Butuh ${activeStage.remainingLabel} lagi`;
      }

      const ringOuterEl = document.getElementById('seed-ring-outer');
      const ringInnerEl = document.getElementById('seed-ring-inner');
      if (ringOuterEl) ringOuterEl.style.borderColor = activeStage.glowColor;
      if (ringInnerEl) ringInnerEl.style.borderColor = activeStage.accentHex;

      document.querySelectorAll('.seed-anim-mode-btn').forEach((btn) => {
        const mode = btn.getAttribute('data-seed-anim');
        btn.classList.toggle('active', mode === (state.seedAnimMode || 'orbit'));
      });

      // Render Stage Neural Telemetry Bars
      const telemetryTag = document.getElementById('vault-telemetry-tag');
      const telemetryTitle = document.getElementById('vault-telemetry-title');
      const telemetryBars = document.getElementById('vault-telemetry-bars');
      if (telemetryTitle) {
        telemetryTitle.textContent = state.stealthMode
          ? 'Spesifikasi Telemetri Artefak'
          : 'Efek Neuro-Biologis Artefak';
      }
      if (telemetryTag) {
        telemetryTag.textContent = `Stage ${activeStage.stageNumber} • ${activeStage.timeLabel}`;
      }
      if (telemetryBars && Array.isArray(activeStage.telemetry)) {
        telemetryBars.innerHTML = '';
        activeStage.telemetry.forEach((metric) => {
          const row = document.createElement('div');
          row.className = 'telemetry-bar-row';
          const lbl = state.stealthMode && metric.stealthLabel ? metric.stealthLabel : metric.label;
          row.innerHTML = `
            <div class="telemetry-bar-labels">
              <span>${lbl}</span>
              <span>${metric.pct}%</span>
            </div>
            <div class="telemetry-bar-track">
              <div class="telemetry-bar-fill" style="width: ${metric.pct}%; background: linear-gradient(90deg, ${activeStage.accentHex}, ${activeStage.primaryColor});"></div>
            </div>
          `;
          telemetryBars.appendChild(row);
        });
      }

      const nextLabelEl = document.getElementById('vault-next-label');
      const nextPctEl = document.getElementById('vault-next-percent');
      const nextFillEl = document.getElementById('vault-progress-fill');
      if (nextLabelEl) nextLabelEl.textContent = vaultInfo.nextLabel;
      if (nextPctEl) nextPctEl.textContent = `${vaultInfo.progressPercent}%`;
      if (nextFillEl) nextFillEl.style.width = `${vaultInfo.progressPercent}%`;

      // Render 6-stage grid with animated mini-SVGs and lock badges
      const gridEl = document.getElementById('vault-stages-grid');
      if (gridEl) {
        gridEl.innerHTML = '';
        vaultInfo.stages.forEach((stage, stageIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `vault-stage-item ${stageIdx === idx ? 'active' : ''} ${stage.collected ? 'unlocked' : 'locked'}`;
          btn.setAttribute('data-stage-index', String(stageIdx));
          btn.setAttribute('data-stage-id', stage.id);
          btn.setAttribute('aria-label', `${stage.name} - ${stage.collected ? 'Collected' : `Locked, butuh ${stage.remainingLabel} lagi`}`);

          const badgeMarkup = stage.collected
            ? '<span class="stage-status-badge collected">Collected</span>'
            : `<span class="stage-status-badge locked">Locked • Butuh ${stage.remainingLabel} lagi</span>`;

          const watermarkMarkup = !stage.collected
            ? '<div class="stage-locked-watermark" aria-hidden="true">LOCK</div>'
            : '';

          btn.innerHTML = `
            <span class="stage-mini-dot ${stage.collected ? 'unlocked' : 'locked'}"></span>
            <div class="stage-mini-visual ${stage.collected ? 'unlocked' : 'locked'}">
              ${getStageMiniSvgMarkup(stageIdx)}
              ${watermarkMarkup}
            </div>
            <span class="stage-mini-name">${state.stealthMode ? stage.stealthName : stage.name}</span>
            <span class="stage-mini-time">${stage.timeLabel}</span>
            ${badgeMarkup}
          `;
          btn.addEventListener('click', () => {
            state.selectedVaultStageIndex = stageIdx;
            seedPulseEnergy = Math.max(seedPulseEnergy, 0.45);
            saveState();
            renderVault();
          });
          gridEl.appendChild(btn);
        });
      }
    }

    let fireworksAnimationId = null;

    function startFireworksEffect(stage) {
      const canvas = document.getElementById('celebration-fireworks-canvas');
      if (!canvas) return;
      const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
      if (!ctx) return;

      const width = canvas.width || 360;
      const height = canvas.height || 600;

      const colors = [
        stage.primaryColor || '#FFFFFF',
        stage.accentHex || '#60A5FA',
        '#FDE047',
        '#38BDF8',
        '#F472B6',
        '#A7F3D0',
        '#FFFFFF'
      ];

      const particles = [];
      const cx = width / 2;
      const cy = height * 0.38;

      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 2.0 + Math.random() * 4.5;
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 1.5),
          size: 1.8 + Math.random() * 3.2,
          color: colors[i % colors.length],
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.018,
          gravity: 0.04
        });
      }

      function frame() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        let activeCount = 0;
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.98;
          p.alpha -= p.decay;
          if (p.alpha > 0.02) {
            activeCount++;
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });

        if (activeCount > 0) {
          if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            fireworksAnimationId = window.requestAnimationFrame(frame);
          }
        }
      }

      if (fireworksAnimationId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(fireworksAnimationId);
      }
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        fireworksAnimationId = window.requestAnimationFrame(frame);
      } else {
        frame();
      }
    }

    function stopFireworksEffect() {
      if (fireworksAnimationId && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(fireworksAnimationId);
        fireworksAnimationId = null;
      }
      const canvas = document.getElementById('celebration-fireworks-canvas');
      if (canvas && typeof canvas.getContext === 'function') {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    let currentlyCelebratedStage = null;
    let isClaimingUnlockXp = false;

    function triggerStageUnlockCelebration(stageOrIdx) {
      let stage = null;
      if (typeof stageOrIdx === 'number') {
        stage = SEED_STAGES[stageOrIdx];
      } else if (typeof stageOrIdx === 'string') {
        stage = SEED_STAGES.find((s) => s.id === stageOrIdx || s.name === stageOrIdx);
      } else if (stageOrIdx && typeof stageOrIdx === 'object') {
        stage = stageOrIdx;
      }
      if (!stage) stage = SEED_STAGES[0];

      const stageIdx = SEED_STAGES.indexOf(stage);
      currentlyCelebratedStage = stage;
      isClaimingUnlockXp = false;

      // 1. Play celestial victory chime
      playVictoryChime();

      // 2. Radiant cosmic shockwave burst on canvas and screen
      seedPulseEnergy = 1.0;
      const phoneWrapper = document.getElementById('phone-frame-wrapper') || document.querySelector('.phone-frame');
      if (phoneWrapper) {
        phoneWrapper.classList.remove('cosmic-screen-shockwave');
        void phoneWrapper.offsetWidth;
        phoneWrapper.classList.add('cosmic-screen-shockwave');
        setTimeout(() => {
          phoneWrapper.classList.remove('cosmic-screen-shockwave');
        }, 1800);
      }

      // 3. Stardust / particle fireworks burst
      startFireworksEffect(stage);

      // 4. Populate celebration modal
      const modal = document.getElementById('modal-stage-unlocked');
      const titleEl = document.getElementById('unlock-modal-title');
      const nameEl = document.getElementById('celebration-stage-name');
      const descEl = document.getElementById('celebration-stage-desc');
      const archPill = document.getElementById('celebration-archetype-pill');
      const visualEl = document.getElementById('celebration-stage-visual');
      const auraEl = document.getElementById('celebration-glow-aura');
      const claimBtn = document.getElementById('btn-claim-unlock-xp');

      const dispName = state.stealthMode ? stage.stealthName : stage.name;
      if (titleEl) titleEl.textContent = 'ARTEFAK KOSMIK BARU TERBUKA!';
      if (nameEl) nameEl.textContent = dispName;
      if (descEl) descEl.textContent = `Selamat Master Zay! Milestone ${stage.timeLabel} telah tercapai. ${stage.description}`;
      if (archPill) {
        archPill.textContent = state.stealthMode ? (stage.stealthArchetype || stage.archetype) : stage.archetype;
        archPill.style.borderColor = stage.accentHex || '#4D7CFE';
        archPill.style.color = stage.primaryColor || '#FFFFFF';
      }
      if (visualEl) {
        visualEl.innerHTML = `
          <div class="celebration-visual-box">
            <div class="celebration-visual-ring"></div>
            ${getStageMiniSvgMarkup(stageIdx >= 0 ? stageIdx : 0)}
          </div>
        `;
      }
      if (auraEl) {
        auraEl.style.background = `radial-gradient(circle, ${stage.glowColor || 'rgba(77,124,254,0.5)'} 0%, transparent 70%)`;
      }
      if (claimBtn) {
        claimBtn.disabled = false;
        claimBtn.innerHTML = 'Klaim +100 XP & Buka Potensi!';
      }

      // 5. Open modal
      if (modal) {
        modal.classList.add('open');
      }

      // Select newly unlocked stage in vault
      if (stageIdx >= 0) {
        state.selectedVaultStageIndex = stageIdx;
      }
      renderVault();
      return stage;
    }

    function claimStageUnlockReward(stage, stageIdx) {
      if (isClaimingUnlockXp) return;
      isClaimingUnlockXp = true;

      const claimBtn = document.getElementById('btn-claim-unlock-xp');
      if (claimBtn) {
        claimBtn.disabled = true;
        claimBtn.innerHTML = '+100 XP Berhasil Diklaim!';
      }

      const activeStage = stage || currentlyCelebratedStage || SEED_STAGES[state.selectedVaultStageIndex || 0];
      const activeIdx = typeof stageIdx === 'number' && stageIdx >= 0
        ? stageIdx
        : SEED_STAGES.indexOf(activeStage);

      state.xp += 100;
      saveState();
      playVictoryChime();
      renderHome();
      renderStatistics();

      const dispName = activeStage ? (state.stealthMode ? activeStage.stealthName : activeStage.name) : 'Artefak Kosmik';
      showToast(`+100 XP Diklaim! Artefak ${dispName} kini aktif di Seed Vault.`);

      setTimeout(() => {
        closeStageUnlockModal();
        switchTab('vault');
        if (activeIdx >= 0) {
          state.selectedVaultStageIndex = activeIdx;
          seedPulseEnergy = 0.85;
          renderVault();
        }
      }, 450);
    }

    function closeStageUnlockModal() {
      const modal = document.getElementById('modal-stage-unlocked');
      if (modal) {
        modal.classList.remove('open');
      }
      isClaimingUnlockXp = false;
      currentlyCelebratedStage = null;
      stopFireworksEffect();
    }

    function checkStageUnlocks(oldHours, newHours) {
      const safeOld = Math.max(0, Number(oldHours) || 0);
      const safeNew = Math.max(0, Number(newHours) || 0);

      if (!Array.isArray(state.unlockedStageIds)) {
        state.unlockedStageIds = SEED_STAGES
          .filter((s) => safeOld >= s.hoursRequired)
          .map((s) => s.id);
      }

      if (safeNew < safeOld) {
        // Dialed back: synchronize unlocked stages to safeNew
        state.unlockedStageIds = state.unlockedStageIds.filter((id) => {
          const s = SEED_STAGES.find((x) => x.id === id);
          return s && s.hoursRequired <= safeNew;
        });
        saveState();
        return null;
      }

      const newlyUnlocked = SEED_STAGES.filter(
        (s) => safeNew >= s.hoursRequired && !state.unlockedStageIds.includes(s.id)
      );

      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((s) => {
          if (!state.unlockedStageIds.includes(s.id)) {
            state.unlockedStageIds.push(s.id);
          }
        });
        saveState();
        const highestStage = newlyUnlocked[newlyUnlocked.length - 1];
        triggerStageUnlockCelebration(highestStage);
        return highestStage;
      }
      return null;
    }

    /**
     * Draw Procedural 3D Rotating & Morphing Seed Artifact on #seed-3d-canvas
     * Each of the 6 stages has a distinct 3D sculptural topology, depth-sorted animated appendages,
     * orbiting 3D cosmic spores, and interactive energy pulse waves.
     */
    function drawSeed3DArtifact(timestamp) {
      const canvas = document.getElementById('seed-3d-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' && window.devicePixelRatio
          ? Math.max(1, Math.min(3, window.devicePixelRatio))
          : 1;
      const logicalW = 280;
      const logicalH = 280;
      const targetW = Math.round(logicalW * dpr);
      const targetH = Math.round(logicalH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      if (dpr !== 1 && typeof ctx.scale === 'function') {
        ctx.scale(dpr, dpr);
      }
      ctx.clearRect(0, 0, logicalW, logicalH);

      const w = logicalW;
      const h = logicalH;

      const t = (Number(timestamp) || 0) * 0.001;
      const idx = Math.max(0, Math.min(SEED_STAGES.length - 1, state.selectedVaultStageIndex || 0));
      const stage = SEED_STAGES[idx];
      const breakdown = computeStreakBreakdown(state.streakStartTime, Date.now());
      const isLocked = breakdown.totalHours < stage.hoursRequired;
      const animMode = state.seedAnimMode || 'orbit';

      // Guard against NaN rotation state
      if (!Number.isFinite(seedRotY)) seedRotY = 0.4;
      if (!Number.isFinite(seedRotX)) seedRotX = 0.22;
      if (!Number.isFinite(seedVelY)) seedVelY = 0;
      if (!Number.isFinite(seedVelX)) seedVelX = 0;

      // Decay interactive pulse burst energy
      if (seedPulseEnergy > 0.005) {
        seedPulseEnergy *= 0.93;
      } else {
        seedPulseEnergy = 0;
      }

      const modeSpeedMult = animMode === 'hyper' ? 2.5 : animMode === 'morph' ? 1.35 : 1.0;
      if (!isDraggingSeed) {
        seedRotY += (0.015 * modeSpeedMult) + seedPulseEnergy * 0.065 + seedVelY;
        seedRotX = Math.max(-1.1, Math.min(1.1, seedRotX + seedVelX));
        seedVelY *= 0.91;
        seedVelX *= 0.91;
        if (Math.abs(seedVelY) < 0.0002) seedVelY = 0;
        if (Math.abs(seedVelX) < 0.0002) seedVelX = 0;
      }

      const dynRotX = seedRotX + Math.sin(t * 1.5) * (animMode === 'morph' ? 0.25 : 0.11);
      const dynRotZ = Math.cos(t * 1.1) * 0.09;
      const floatOffsetY = Math.sin(t * 2.4) * 5.5;
      const cx = w / 2;
      const cy = h / 2 + floatOffsetY;

      // 3D Rotation Helper
      const cosY = Math.cos(seedRotY);
      const sinY = Math.sin(seedRotY);
      const cosX = Math.cos(dynRotX);
      const sinX = Math.sin(dynRotX);
      const cosZ = Math.cos(dynRotZ);
      const sinZ = Math.sin(dynRotZ);

      function rotate3D(x, y, z) {
        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        // Rotate Z
        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = x1 * sinZ + y2 * cosZ;
        return { x: x3, y: y3, z: z2 };
      }

      // 1. Multi-layer Ambient Nebula Halo (strictly bounded within canvas radius)
      const haloRadius = 96 + Math.sin(t * 2.8) * 4 + seedPulseEnergy * 10;
      const backGlow = ctx.createRadialGradient(cx, cy, 6, cx, cy, haloRadius);
      if (isLocked) {
        backGlow.addColorStop(0, 'rgba(239, 68, 68, 0.32)');
        backGlow.addColorStop(0.55, 'rgba(15, 23, 42, 0.6)');
        backGlow.addColorStop(1, 'rgba(5, 7, 20, 0)');
      } else {
        backGlow.addColorStop(0, stage.glowColor);
        backGlow.addColorStop(1, 'rgba(5, 7, 20, 0)');
      }
      ctx.fillStyle = backGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // Interactive Shockwave Ring when Pulse or Hyper Mode is active (strictly bounded inside canvas)
      if (seedPulseEnergy > 0.03 || animMode === 'hyper') {
        const waveProgress =
          seedPulseEnergy > 0.03 ? 1 - seedPulseEnergy : (t * 0.65) % 1;
        const waveR = 54 + waveProgress * 46;
        const fadeOut = Math.sin(waveProgress * Math.PI);
        ctx.save();
        ctx.strokeStyle = stage.primaryColor;
        ctx.lineWidth = 1.4 + seedPulseEnergy * 1.6;
        ctx.globalAlpha = Math.max(
          0,
          Math.min(0.75, (seedPulseEnergy * 0.8 + (animMode === 'hyper' ? 0.32 : 0)) * fadeOut)
        );
        ctx.beginPath();
        ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Compute 3D positions of orbiting cosmic spores (drawn behind and in front of the seed)
      const projectedSpores = seedSpores.map((sp, spIdx) => {
        const ang = sp.angleOffset + t * sp.speed * modeSpeedMult;
        const rad = sp.orbitRadius + Math.sin(t * 1.8 + spIdx) * 4 + seedPulseEnergy * 8;
        const sx = Math.cos(ang) * rad;
        const sy = Math.sin(t * sp.yFreq + spIdx) * sp.yAmp;
        const sz = Math.sin(ang) * rad;
        const rot = rotate3D(sx, sy, sz);
        return {
          ...rot,
          size: sp.size * (1 + seedPulseEnergy * 0.5),
          alpha: 0.35 + 0.45 * Math.sin(t * 3.2 + spIdx)
        };
      });

      function drawSpore(sp) {
        ctx.save();
        ctx.globalAlpha = Math.max(0.12, Math.min(1, sp.alpha));
        ctx.fillStyle = sp.z > 0 ? '#FFFFFF' : stage.primaryColor;
        ctx.beginPath();
        ctx.arc(cx + sp.x, cy + sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw background spores (z < 0)
      projectedSpores.filter((s) => s.z < 0).forEach(drawSpore);

      // 2. Build Depth-Sorted 3D Stage Appendages (Split into z < 0 Behind Core & z >= 0 Front of Core)
      const appendageDrawables = [];
      const morphAmp = (animMode === 'morph' ? 1.42 : 1.0) + seedPulseEnergy * 0.45;
      const morphPhase = t * (animMode === 'morph' ? 3.4 : 1.8);

      if (idx === 0) {
        // Stage 1 (Origin Seed): 8 Orbiting Lunar Bio-Spores with Delicate Energy Tethers
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2 + t * 0.45 * modeSpeedMult;
          const bob = Math.sin(t * 2.6 + k * 1.1) * 12;
          const orbitR = 66 + Math.sin(t * 2 + k) * 4;
          const pAnchor = rotate3D(Math.cos(ang) * 48, bob * 0.35, Math.sin(ang) * 48);
          const pNode = rotate3D(Math.cos(ang) * orbitR, bob, Math.sin(ang) * orbitR);
          appendageDrawables.push({
            z: pNode.z,
            draw() {
              ctx.save();
              ctx.strokeStyle = 'rgba(147, 197, 253, 0.38)';
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(cx + pAnchor.x, cy + pAnchor.y);
              ctx.lineTo(cx + pNode.x, cy + pNode.y);
              ctx.stroke();

              ctx.fillStyle = pNode.z >= 0 ? '#FFFFFF' : '#93C5FD';
              ctx.globalAlpha = 0.72 + 0.25 * Math.sin(t * 3.5 + k);
              ctx.beginPath();
              ctx.arc(cx + pNode.x, cy + pNode.y, 2.2 + (k % 2) * 0.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        }
      } else if (idx === 1) {
        // Stage 2 (Sprout Core): 8 Articulated 3D Waving Bio-Tendrils with Unfurling Leaf Buds
        for (let k = 0; k < 8; k++) {
          const baseAng = (k / 8) * Math.PI * 2;
          const polarDir = k % 2 === 0 ? -1 : 1;
          let prevPt = rotate3D(Math.cos(baseAng) * 34, polarDir * 16, Math.sin(baseAng) * 34);

          for (let seg = 1; seg <= 6; seg++) {
            const frac = seg / 6;
            const wave = Math.sin(t * 3.2 - seg * 0.55 + k * 0.9) * 12 * frac * morphAmp;
            const rad = 36 + frac * 36;
            const tx = Math.cos(baseAng + wave * 0.022) * rad;
            const ty = polarDir * (16 + frac * 30) + wave * 0.55;
            const tz = Math.sin(baseAng + wave * 0.022) * rad;
            const currPt = rotate3D(tx, ty, tz);
            const segFrom = prevPt;
            const isTip = seg === 6;
            const segRadius = (1 - frac * 0.42) * 4.6;

            appendageDrawables.push({
              z: currPt.z,
              draw() {
                ctx.save();
                ctx.strokeStyle = '#10B981';
                ctx.lineWidth = segRadius * 1.35;
                ctx.globalAlpha = 0.78;
                ctx.beginPath();
                ctx.moveTo(cx + segFrom.x, cy + segFrom.y);
                ctx.lineTo(cx + currPt.x, cy + currPt.y);
                ctx.stroke();

                ctx.fillStyle = isTip ? '#A7F3D0' : '#34D399';
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(cx + currPt.x, cy + currPt.y, isTip ? 3.8 : segRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            });
            prevPt = currPt;
          }
        }
      } else if (idx === 2) {
        // Stage 3 (Nebula Flora): 16 Curved 3D Lotus Petals (2 Concentric Blooming Tiers)
        const tiers = [
          { count: 8, innerR: 34, outerR: 68, yBase: 8, spread: 0.28, phaseOffset: 0 },
          { count: 8, innerR: 38, outerR: 80, yBase: 14, spread: 0.24, phaseOffset: 0.4 }
        ];
        tiers.forEach((tier, tIdx) => {
          for (let k = 0; k < tier.count; k++) {
            const ang = (k / tier.count) * Math.PI * 2 + tier.phaseOffset;
            const bloomOpen = 0.52 + 0.26 * Math.sin(t * 2.3 + k * 0.7 + tIdx);
            const midR = (tier.innerR + tier.outerR) * 0.54;

            const bL = rotate3D(
              Math.cos(ang - tier.spread * 0.65) * tier.innerR,
              tier.yBase,
              Math.sin(ang - tier.spread * 0.65) * tier.innerR
            );
            const mL = rotate3D(
              Math.cos(ang - tier.spread) * midR * Math.sin(bloomOpen + 0.35),
              tier.yBase * 0.3 - midR * Math.cos(bloomOpen) * 0.35,
              Math.sin(ang - tier.spread) * midR * Math.sin(bloomOpen + 0.35)
            );
            const tip = rotate3D(
              Math.cos(ang) * tier.outerR * Math.sin(bloomOpen + 0.42),
              -tier.outerR * Math.cos(bloomOpen) * 0.68,
              Math.sin(ang) * tier.outerR * Math.sin(bloomOpen + 0.42)
            );
            const mR = rotate3D(
              Math.cos(ang + tier.spread) * midR * Math.sin(bloomOpen + 0.35),
              tier.yBase * 0.3 - midR * Math.cos(bloomOpen) * 0.35,
              Math.sin(ang + tier.spread) * midR * Math.sin(bloomOpen + 0.35)
            );
            const bR = rotate3D(
              Math.cos(ang + tier.spread * 0.65) * tier.innerR,
              tier.yBase,
              Math.sin(ang + tier.spread * 0.65) * tier.innerR
            );

            const avgPetalZ = (bL.z + mL.z + tip.z + mR.z + bR.z) / 5;
            appendageDrawables.push({
              z: avgPetalZ,
              draw() {
                ctx.save();
                ctx.fillStyle =
                  tIdx === 0
                    ? 'rgba(192, 132, 252, 0.62)'
                    : k % 2 === 0
                    ? 'rgba(168, 85, 247, 0.54)'
                    : 'rgba(236, 72, 153, 0.48)';
                ctx.strokeStyle = '#F5D0FE';
                ctx.lineWidth = 0.95;
                ctx.beginPath();
                ctx.moveTo(cx + bL.x, cy + bL.y);
                ctx.lineTo(cx + mL.x, cy + mL.y);
                ctx.lineTo(cx + tip.x, cy + tip.y);
                ctx.lineTo(cx + mR.x, cy + mR.y);
                ctx.lineTo(cx + bR.x, cy + bR.y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
              }
            });
          }
        });
      } else if (idx === 3) {
        // Stage 4 (Aether Crystal): 8 Levitating Satellite Crystal Shards + Plasma Lightning Arcs
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2 + t * 0.65 * modeSpeedMult;
          const bobY = Math.sin(t * 3.2 + k * 1.1) * 15;
          const satR = 76 + (k % 2) * 5;
          const centerPos = rotate3D(Math.cos(ang) * satR, bobY, Math.sin(ang) * satR);
          const topTip = rotate3D(Math.cos(ang) * satR, bobY - 11.5, Math.sin(ang) * satR);
          const botTip = rotate3D(Math.cos(ang) * satR, bobY + 11.5, Math.sin(ang) * satR);
          const leftPt = rotate3D(Math.cos(ang - 0.09) * (satR - 5), bobY, Math.sin(ang - 0.09) * (satR - 5));
          const rightPt = rotate3D(Math.cos(ang + 0.09) * (satR + 5), bobY, Math.sin(ang + 0.09) * (satR + 5));

          appendageDrawables.push({
            z: centerPos.z,
            draw() {
              ctx.save();
              ctx.strokeStyle = '#7DD3FC';
              ctx.lineWidth = 1.15;
              ctx.globalAlpha = 0.48 + 0.35 * Math.sin(t * 6 + k);
              ctx.beginPath();
              ctx.moveTo(cx + centerPos.x * 0.52, cy + centerPos.y * 0.52);
              const midJitter = Math.sin(t * 14 + k * 3) * 5;
              ctx.lineTo(cx + centerPos.x * 0.76 + midJitter, cy + centerPos.y * 0.76 - midJitter);
              ctx.lineTo(cx + centerPos.x, cy + centerPos.y);
              ctx.stroke();

              ctx.fillStyle = centerPos.z >= 0 ? '#E0F2FE' : '#38BDF8';
              ctx.strokeStyle = '#7DD3FC';
              ctx.globalAlpha = 0.92;
              ctx.beginPath();
              ctx.moveTo(cx + topTip.x, cy + topTip.y);
              ctx.lineTo(cx + rightPt.x, cy + rightPt.y);
              ctx.lineTo(cx + botTip.x, cy + botTip.y);
              ctx.lineTo(cx + leftPt.x, cy + leftPt.y);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              ctx.restore();
            }
          });
        }
      } else if (idx === 4) {
        // Stage 5 (Supernova Tree): 8 Solar Yggdrasil Canopy Branches + 6 Golden Root Tendrils
        for (let k = 0; k < 8; k++) {
          const ang = (k / 8) * Math.PI * 2;
          const sway = Math.sin(t * 2.4 + k * 0.9) * 7;
          const pStart = rotate3D(Math.cos(ang) * 30, -20, Math.sin(ang) * 30);
          const pMid = rotate3D(Math.cos(ang) * 54 + sway, -50, Math.sin(ang) * 54);
          const pTip = rotate3D(Math.cos(ang) * 75 + sway * 1.3, -65 + (k % 2) * 9, Math.sin(ang) * 75);

          appendageDrawables.push({
            z: pTip.z,
            draw() {
              ctx.save();
              ctx.strokeStyle = '#FDE047';
              ctx.lineWidth = 2.1;
              ctx.globalAlpha = 0.84;
              ctx.beginPath();
              ctx.moveTo(cx + pStart.x, cy + pStart.y);
              ctx.lineTo(cx + pMid.x, cy + pMid.y);
              ctx.lineTo(cx + pTip.x, cy + pTip.y);
              ctx.stroke();

              // Golden solar foliage cluster at tip
              ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
              ctx.beginPath();
              ctx.arc(cx + pTip.x, cy + pTip.y, 6.2 + Math.sin(t * 3.5 + k) * 1.2, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(cx + pTip.x, cy + pTip.y, 3.1 + Math.sin(t * 4 + k) * 0.7, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        }
        for (let rIdx = 0; rIdx < 6; rIdx++) {
          const rAng = (rIdx / 6) * Math.PI * 2 + 0.3;
          const rSway = Math.cos(t * 2.1 + rIdx) * 5;
          const rStart = rotate3D(Math.cos(rAng) * 28, 26, Math.sin(rAng) * 28);
          const rTip = rotate3D(Math.cos(rAng) * 56 + rSway, 62, Math.sin(rAng) * 56);
          appendageDrawables.push({
            z: rTip.z,
            draw() {
              ctx.save();
              ctx.strokeStyle = '#F59E0B';
              ctx.lineWidth = 1.6;
              ctx.globalAlpha = 0.68;
              ctx.beginPath();
              ctx.moveTo(cx + rStart.x, cy + rStart.y);
              ctx.lineTo(cx + rTip.x, cy + rTip.y);
              ctx.stroke();
              ctx.restore();
            }
          });
        }
      } else if (idx === 5) {
        // Stage 6 (Cosmic Sovereign): 12-Star Constellation Halo + Polar Quasar Jets + Sacred Geometry Web
        const crownNodes = [];
        for (let k = 0; k < 12; k++) {
          const ang = (k / 12) * Math.PI * 2 - t * 0.55 * modeSpeedMult;
          const crownR = 84;
          const waveY = Math.sin(ang * 3 + t * 2.5) * 14;
          crownNodes.push(rotate3D(Math.cos(ang) * crownR, waveY, Math.sin(ang) * crownR));
        }

        for (let k = 0; k < crownNodes.length; k++) {
          const curr = crownNodes[k];
          const next = crownNodes[(k + 1) % crownNodes.length];
          const opp = crownNodes[(k + 4) % crownNodes.length];
          const isEven = k % 2 === 0;
          appendageDrawables.push({
            z: curr.z,
            draw() {
              ctx.save();
              ctx.strokeStyle = '#F472B6';
              ctx.lineWidth = 1.05;
              ctx.globalAlpha = 0.56;
              ctx.beginPath();
              ctx.moveTo(cx + curr.x, cy + curr.y);
              ctx.lineTo(cx + next.x, cy + next.y);
              if (isEven) {
                ctx.moveTo(cx + curr.x, cy + curr.y);
                ctx.lineTo(cx + opp.x, cy + opp.y);
              }
              ctx.stroke();

              ctx.fillStyle = isEven ? '#FEF08A' : '#FFFFFF';
              ctx.globalAlpha = 0.94;
              ctx.beginPath();
              ctx.arc(cx + curr.x, cy + curr.y, 2.7, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        }
      }

      appendageDrawables.sort((a, b) => a.z - b.z);

      // Draw back-hemisphere 3D appendages (z < 0) BEHIND the core mesh
      appendageDrawables.filter((d) => d.z < 0).forEach((d) => d.draw());

      // 3. Buttery-Smooth Base Depth-Lit Spherical Core
      const isCrystalStage = idx === 3;
      const baseRadius = idx === 0 ? 55 : idx === 3 ? 48 : 50;
      const lx = -0.3816;
      const ly = -0.5220;
      const lz = 0.7630;
      const hx = -0.2028;
      const hy = -0.2775;
      const hz = 0.9390;

      const baseR = baseRadius * (idx === 0 ? 1.01 : idx === 3 ? 0.94 : 0.98);
      const lightDist = baseR * 0.35;
      const gradX = cx + lx * lightDist;
      const gradY = cy + ly * lightDist;
      const baseGrad = ctx.createRadialGradient(gradX, gradY, baseR * 0.06, cx, cy, baseR * 1.05);

      if (idx === 0) {
        baseGrad.addColorStop(0, '#FFFFFF');
        baseGrad.addColorStop(0.35, '#E2E8F0');
        baseGrad.addColorStop(0.72, '#94A3B8');
        baseGrad.addColorStop(1, '#475569');
      } else if (idx === 1) {
        baseGrad.addColorStop(0, '#A7F3D0');
        baseGrad.addColorStop(0.35, '#10B981');
        baseGrad.addColorStop(0.72, '#047857');
        baseGrad.addColorStop(1, '#064E3B');
      } else if (idx === 2) {
        baseGrad.addColorStop(0, '#F5D0FE');
        baseGrad.addColorStop(0.35, '#C084FC');
        baseGrad.addColorStop(0.72, '#7E22CE');
        baseGrad.addColorStop(1, '#3B0764');
      } else if (idx === 3) {
        baseGrad.addColorStop(0, '#E0F2FE');
        baseGrad.addColorStop(0.35, '#38BDF8');
        baseGrad.addColorStop(0.72, '#0284C7');
        baseGrad.addColorStop(1, '#0C4A6E');
      } else if (idx === 4) {
        baseGrad.addColorStop(0, '#FEF08A');
        baseGrad.addColorStop(0.35, '#F59E0B');
        baseGrad.addColorStop(0.72, '#B45309');
        baseGrad.addColorStop(1, '#451A03');
      } else {
        baseGrad.addColorStop(0, '#FDF4FF');
        baseGrad.addColorStop(0.35, '#EC4899');
        baseGrad.addColorStop(0.72, '#9333EA');
        baseGrad.addColorStop(1, '#3B0764');
      }

      ctx.save();
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Generate High-Poly Displaced 3D Core Mesh with Smooth Vertex Normals & Fluid Waves
      const latBands = isCrystalStage ? 14 : 38;
      const lonSegments = isCrystalStage ? 22 : 60;

      function computeDisplacement(lat, lon, ux, uy, uz) {
        let displacement = 0;
        let craterDepthFactor = 0;
        let scaleX = 1;
        let scaleY = 1;
        let scaleZ = 1;

        if (idx === 0) {
          // Stage 1: Origin Seed — Sculpted lunar-porcelain organic seed with 18 circular craters (Ref Image 2)
          scaleY = 1.06;
          const seedTaper = lat < 0 ? 1 - 0.1 * Math.abs(Math.sin(lat)) : 1 + 0.04 * Math.sin(lat);
          scaleX = seedTaper;
          scaleZ = seedTaper;

          let craterDisp = 0;
          for (let c = 0; c < originSeedCraters.length; c++) {
            const cr = originSeedCraters[c];
            const dotCr = ux * cr.x + uy * cr.y + uz * cr.z;
            if (dotCr > cr.cosRadius) {
              const normDist = (1 - dotCr) / (1 - cr.cosRadius); // 0 at crater center, 1 at outer rim
              const breath = 1 + 0.16 * Math.sin(morphPhase * 0.85 + cr.phase);
              if (normDist < 0.68) {
                const bowl = Math.cos((normDist / 0.68) * (Math.PI * 0.5));
                craterDisp -= cr.depth * bowl * breath;
                craterDepthFactor = Math.max(craterDepthFactor, bowl);
              } else {
                const rim = Math.sin(((normDist - 0.68) / 0.32) * Math.PI);
                craterDisp += cr.rimHeight * rim * breath;
              }
            }
          }
          // Fluid organic undulations with harmonic spherical flow
          const organicUndulation =
            Math.sin(lat * 3 + lon * 2 + morphPhase * 0.5) * 1.8 +
            Math.cos(lat * 4 - lon * 3 - morphPhase * 0.4) * 1.4 +
            Math.sin(lat * 2 - morphPhase * 0.7) * Math.cos(lon * 2 + morphPhase * 0.5) * 1.2;
          displacement = (craterDisp + organicUndulation) * morphAmp;
        } else if (idx === 1) {
          // Stage 2: Sprout Core — Bioluminescent ribbed life-pod with pulsing vertical meridian veins
          scaleY = 1.1;
          displacement =
            (Math.sin(lat * 3 + morphPhase * 1.1) * 4.8 +
              Math.cos(lon * 5 - morphPhase * 0.8) * 4.2 +
              Math.sin(lat * 6 + lon * 2 + morphPhase * 0.5) * 2.2 +
              Math.sin(lat * 4) * 1.4) *
            morphAmp;
        } else if (idx === 2) {
          // Stage 3: Nebula Flora — Sculpted lotus bud heart with harmonic petal lobes
          const petalWave = Math.sin(lon * 5 + morphPhase * 0.7) * Math.cos(lat * 1.8);
          displacement =
            (petalWave * 7.5 +
              Math.cos(lat * 4 - morphPhase * 0.9) * 3.6 +
              Math.sin(lon * 3 + morphPhase * 0.4) * 2.0) *
            morphAmp;
        } else if (idx === 3) {
          // Stage 4: Aether Crystal — Sharp faceted octahedral Merkaba prism
          scaleY = 1.32;
          const octFactor = Math.abs(Math.cos(lat)) * (0.88 + 0.16 * Math.cos(lon * 4));
          displacement = (octFactor * 8 - 4 + Math.sin(morphPhase * 1.5 + lat * 3) * 1.8) * morphAmp;
        } else if (idx === 4) {
          // Stage 5: Supernova Tree — Blazing solar corona with fluid flare prominences
          displacement =
            (Math.sin(lat * 5 + lon * 4 + morphPhase * 1.3) * 6.8 +
              Math.cos(lat * 3 - lon * 5 + morphPhase * 1.1) * 4.2 +
              Math.sin(lat * 7 - morphPhase * 1.8) * 2.2) *
            morphAmp;
        } else {
          // Stage 6: Cosmic Sovereign — Sacred multidimensional harmonic star-core
          displacement =
            (Math.cos(lat * 6 + morphPhase * 1.2) * 5.0 +
              Math.sin(lon * 6 - morphPhase * 0.9) * 5.0 +
              Math.cos(lat * 3 + lon * 3 + morphPhase * 0.6) * 3.2) *
            morphAmp;
        }

        return { displacement, craterDepthFactor, scaleX, scaleY, scaleZ };
      }

      // Build 2D Vertex Grid
      const grid = [];
      for (let i = 0; i <= latBands; i++) {
        grid[i] = [];
        const lat = -Math.PI / 2 + (Math.PI * i) / latBands;
        const cosLat = Math.cos(lat);
        const sinLat = Math.sin(lat);

        for (let j = 0; j < lonSegments; j++) {
          const lon = (2 * Math.PI * j) / lonSegments;
          const ux = cosLat * Math.cos(lon);
          const uy = sinLat;
          const uz = cosLat * Math.sin(lon);

          const { displacement, craterDepthFactor, scaleX, scaleY, scaleZ } =
            computeDisplacement(lat, lon, ux, uy, uz);

          const r = baseRadius + displacement;
          const rawX = r * ux * scaleX;
          const rawY = r * uy * scaleY;
          const rawZ = r * uz * scaleZ;

          const pt = rotate3D(rawX, rawY, rawZ);
          const baseNorm = rotate3D(ux, uy, uz);

          grid[i][j] = {
            x: pt.x,
            y: pt.y,
            z: pt.z,
            baseNx: baseNorm.x,
            baseNy: baseNorm.y,
            baseNz: baseNorm.z,
            displacement,
            craterDepthFactor
          };
        }
      }

      // Compute smooth vertex normals with central differences
      for (let i = 0; i <= latBands; i++) {
        for (let j = 0; j < lonSegments; j++) {
          if (i === 0 || i === latBands) {
            grid[i][j].nx = grid[i][j].baseNx;
            grid[i][j].ny = grid[i][j].baseNy;
            grid[i][j].nz = grid[i][j].baseNz;
            continue;
          }

          const jNext = (j + 1) % lonSegments;
          const jPrev = (j - 1 + lonSegments) % lonSegments;
          const pLatPlus = grid[i + 1][j];
          const pLatMinus = grid[i - 1][j];
          const pLonPlus = grid[i][jNext];
          const pLonMinus = grid[i][jPrev];

          const vLonX = pLonPlus.x - pLonMinus.x;
          const vLonY = pLonPlus.y - pLonMinus.y;
          const vLonZ = pLonPlus.z - pLonMinus.z;

          const vLatX = pLatPlus.x - pLatMinus.x;
          const vLatY = pLatPlus.y - pLatMinus.y;
          const vLatZ = pLatPlus.z - pLatMinus.z;

          let nx = vLonY * vLatZ - vLonZ * vLatY;
          let ny = vLonZ * vLatX - vLonX * vLatZ;
          let nz = vLonX * vLatY - vLonY * vLatX;
          const len = Math.hypot(nx, ny, nz);

          if (len > 0.0001) {
            nx /= len;
            ny /= len;
            nz /= len;
            if (nx * grid[i][j].x + ny * grid[i][j].y + nz * grid[i][j].z < 0) {
              nx = -nx;
              ny = -ny;
              nz = -nz;
            }
            if (!isCrystalStage) {
              nx = nx * 0.72 + grid[i][j].baseNx * 0.28;
              ny = ny * 0.72 + grid[i][j].baseNy * 0.28;
              nz = nz * 0.72 + grid[i][j].baseNz * 0.28;
              const blendLen = Math.hypot(nx, ny, nz) || 1;
              nx /= blendLen;
              ny /= blendLen;
              nz /= blendLen;
            }
          } else {
            nx = grid[i][j].baseNx;
            ny = grid[i][j].baseNy;
            nz = grid[i][j].baseNz;
          }

          grid[i][j].nx = nx;
          grid[i][j].ny = ny;
          grid[i][j].nz = nz;
        }
      }

      // Assemble quad faces
      const faces = [];
      for (let i = 0; i < latBands; i++) {
        for (let j = 0; j < lonSegments; j++) {
          const jNext = (j + 1) % lonSegments;
          const p1 = grid[i][j];
          const p2 = grid[i][jNext];
          const p3 = grid[i + 1][jNext];
          const p4 = grid[i + 1][j];

          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          const avgNx = (p1.nx + p2.nx + p3.nx + p4.nx) / 4;
          const avgNy = (p1.ny + p2.ny + p3.ny + p4.ny) / 4;
          const avgNz = (p1.nz + p2.nz + p3.nz + p4.nz) / 4;
          const nLen = Math.hypot(avgNx, avgNy, avgNz) || 1;
          const nx = avgNx / nLen;
          const ny = avgNy / nLen;
          const nz = avgNz / nLen;

          // Backface culling: skip faces pointing away from the camera
          if (nz < -0.06 && avgZ < 0) continue;

          const avgDisp = (p1.displacement + p2.displacement + p3.displacement + p4.displacement) / 4;
          const avgCrater =
            (p1.craterDepthFactor + p2.craterDepthFactor + p3.craterDepthFactor + p4.craterDepthFactor) / 4;

          faces.push({ p1, p2, p3, p4, avgZ, nx, ny, nz, avgDisp, avgCrater });
        }
      }

      faces.sort((a, b) => a.avgZ - b.avgZ);

      // Render faces with continuous Blinn-Phong lighting
      faces.forEach((f) => {
        const dot = Math.max(0, f.nx * lx + f.ny * ly + f.nz * lz);
        const wrapDot = Math.max(0.12, (dot + 0.25) / 1.25);
        const halfZ = Math.max(0, f.nx * hx + f.ny * hy + f.nz * hz);
        const specExp = isCrystalStage ? 26 : 12;
        const specMult = isCrystalStage ? 78 : 50;
        const spec = Math.pow(halfZ, specExp) * specMult;
        const rim = Math.pow(Math.max(0, 1 - Math.abs(f.nz)), 2.4) * 46;
        let fillStyle;
        if (isLocked) {
          // Locked stage: Dark stasis / frozen silhouette with muted stasis rim
          const stasisLum = Math.min(85, Math.round(18 + wrapDot * 42 + spec * 0.22));
          fillStyle = `rgb(${Math.round(stasisLum * 0.55 + rim * 0.2)}, ${Math.round(stasisLum * 0.42)}, ${Math.round(stasisLum * 0.62 + rim * 0.25)})`;
        } else if (idx === 0) {
          // Stage 1: Pearlescent White-Silver Lunar Porcelain + Sculpted Crater Shadows (Ref Image 2)
          const craterShade = f.avgCrater || 0;
          const baseLum = Math.min(254, Math.round(96 + wrapDot * 144 + spec * 0.85 - craterShade * 54));
          const bioGlow = craterShade > 0.4 ? (craterShade - 0.4) * (38 + 18 * Math.sin(t * 3.2)) : 0;
          const rVal = Math.max(48, Math.min(255, Math.round(baseLum - craterShade * 14)));
          const gVal = Math.max(56, Math.min(255, Math.round(baseLum + 2 + bioGlow * 0.55)));
          const bVal = Math.max(72, Math.min(255, Math.round(baseLum + 14 + rim * 0.5 + bioGlow * 1.25)));
          fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
        } else if (idx === 1) {
          // Stage 2: Emerald Bioluminescent Core with Smooth Neon Fissure Veins
          const baseLum = Math.min(248, Math.round(40 + wrapDot * 180 + spec));
          const fissure = Math.max(0, Math.min(52, (-f.avgDisp - 0.8) * 20));
          fillStyle = `rgb(${Math.round(baseLum * 0.26)}, ${Math.min(255, Math.round(baseLum + fissure))}, ${Math.min(255, Math.round(baseLum * 0.74 + rim))})`;
        } else if (idx === 2) {
          // Stage 3: Iridescent Nebula Violet-Rose Core
          const baseLum = Math.min(250, Math.round(44 + wrapDot * 184 + spec));
          fillStyle = `rgb(${Math.min(255, Math.round(baseLum * 0.84 + rim))}, ${Math.round(baseLum * 0.44)}, ${Math.min(255, baseLum)})`;
        } else if (idx === 3) {
          // Stage 4: Refractive Cyan-Diamond Aether Crystal
          const facetSpec = Math.pow(dot, 4) * 85 + spec * 0.65;
          const baseLum = Math.min(255, Math.round(50 + dot * 170 + facetSpec));
          fillStyle = `rgb(${Math.min(255, Math.round(baseLum * 0.52 + facetSpec * 0.55))}, ${Math.min(255, Math.round(baseLum * 0.94))}, ${Math.min(255, baseLum)})`;
        } else if (idx === 4) {
          // Stage 5: Blazing Golden-Solar Supernova Core
          const baseLum = Math.min(255, Math.round(56 + wrapDot * 188 + spec));
          fillStyle = `rgb(${Math.min(255, baseLum)}, ${Math.min(255, Math.round(baseLum * 0.8 + spec * 0.45))}, ${Math.round(baseLum * 0.26)})`;
        } else {
          // Stage 6: Quasar Sovereign Magenta-Gold-Cyan Iridescence
          const baseLum = Math.min(255, Math.round(52 + wrapDot * 184 + spec));
          const shift = Math.sin(f.nx * 3 + t * 2) * 28;
          fillStyle = `rgb(${Math.min(255, baseLum)}, ${Math.min(255, Math.max(44, Math.round(baseLum * 0.5 + shift + spec * 0.5)))}, ${Math.min(255, Math.round(baseLum * 0.94 + rim * 0.5))})`;
        }

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = isCrystalStage ? 'rgba(224, 242, 254, 0.48)' : fillStyle;
        ctx.lineWidth = isCrystalStage ? 0.85 : 0.5;
        ctx.beginPath();
        ctx.moveTo(cx + f.p1.x, cy + f.p1.y);
        ctx.lineTo(cx + f.p2.x, cy + f.p2.y);
        ctx.lineTo(cx + f.p3.x, cy + f.p3.y);
        ctx.lineTo(cx + f.p4.x, cy + f.p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // 5. Draw Front-Hemisphere 3D Appendages (z >= 0) IN FRONT OF the core mesh
      appendageDrawables.filter((d) => d.z >= 0).forEach((d) => d.draw());

      // 6. Multi-Axis Gyroscopic Orbital Energy Rings (All 6 Stages + Hyper Mode)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(seedRotY * 0.55);
      ctx.strokeStyle = stage.accentHex;
      ctx.lineWidth = idx === 0 ? 1.15 : 1.5;
      ctx.globalAlpha = idx === 0 ? 0.42 : 0.58;
      ctx.beginPath();
      ctx.ellipse(0, 0, idx === 0 ? 80 : 86, idx === 0 ? 20 : 23, 0.34, 0, Math.PI * 2);
      ctx.stroke();

      if (idx >= 3 || animMode === 'hyper') {
        ctx.rotate(-seedRotY * 1.1);
        ctx.strokeStyle = stage.primaryColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.ellipse(0, 0, 92, 26, -0.42, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 7. Draw Foreground Orbiting Cosmic Spores (z >= 0)
      projectedSpores.filter((s) => s.z >= 0).forEach(drawSpore);

      // 8. Glowing Cosmic Lock Rune & Stasis Energy Barrier when stage is locked
      if (isLocked) {
        ctx.save();
        // Pulsing Stasis Forcefield Barrier
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 88 + Math.sin(t * 3.0) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(248, 113, 113, 0.42)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 76 + Math.cos(t * 2.5) * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Stasis Rune Nodes
        for (let r = 0; r < 6; r++) {
          const rAngle = (r / 6) * Math.PI * 2 + t * 0.4;
          const rx = cx + Math.cos(rAngle) * 88;
          const ry = cy + Math.sin(rAngle) * 88;
          ctx.fillStyle = '#FCA5A5';
          ctx.beginPath();
          ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Central Glassmorphic Stasis Lock Rune Shield
        const badgeY = cy - 2;
        ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
        ctx.strokeStyle = 'rgba(248, 113, 113, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, badgeY, 66, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Vector Padlock
        const lockY = badgeY - 11;
        ctx.strokeStyle = '#FCA5A5';
        ctx.fillStyle = '#EF4444';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(cx, lockY - 5, 5, Math.PI, 0);
        ctx.stroke();

        ctx.beginPath();
        if (typeof ctx.rect === 'function') {
          ctx.rect(cx - 6, lockY - 5, 12, 9);
        } else {
          ctx.moveTo(cx - 6, lockY - 5);
          ctx.lineTo(cx + 6, lockY - 5);
          ctx.lineTo(cx + 6, lockY + 4);
          ctx.lineTo(cx - 6, lockY + 4);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // Keyhole
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, lockY - 0.5, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Canvas Text: Status & Remaining Time
        if (typeof ctx.fillText === 'function') {
          ctx.font = 'bold 9.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FCA5A5';
          ctx.fillText('LOCKED', cx, badgeY + 6);

          const remHours = Math.max(0, stage.hoursRequired - breakdown.totalHours);
          ctx.font = '8px sans-serif';
          ctx.fillStyle = '#E2E8F0';
          ctx.fillText(`Butuh ${formatRemainingTime(remHours)} lagi`, cx, badgeY + 18);
        }
        ctx.restore();
      }

      ctx.restore();
    }

    // =======================================================================
    // 6. TAB 3: REWIRE — Real Web Audio API Binaural Synthesizer & Visualizer
    // =======================================================================
    function getActiveTape() {
      return BINAURAL_TAPES.find((t) => t.id === state.selectedTapeId) || BINAURAL_TAPES[0];
    }

    function renderRewire() {
      const tape = getActiveTape();
      const headerEl = document.getElementById('rewire-active-header');
      const descEl = document.getElementById('rewire-description-text');
      const playBtn = document.getElementById('btn-play-tape');
      const playIcon = document.getElementById('play-tape-icon');
      const playLabel = document.getElementById('play-tape-label');
      const completedEl = document.getElementById('rewire-completed-count');
      const freqReadout = document.getElementById('synth-freq-readout');

      if (headerEl) headerEl.textContent = tape.headerTitle;
      if (descEl) descEl.textContent = tape.description;
      if (completedEl) {
        completedEl.textContent = `${tape.completedUsers} users completed`;
      }
      if (freqReadout) {
        freqReadout.textContent = `${tape.beatHz}Hz (${tape.leftHz}/${tape.rightHz}Hz)`;
      }

      if (playBtn && playIcon && playLabel) {
        if (isPlayingAudio) {
          playBtn.classList.add('playing');
          playIcon.textContent = '||';
          playLabel.textContent = `Pause Tape ${tape.id}`;
        } else {
          playBtn.classList.remove('playing');
          playIcon.textContent = '▶';
          playLabel.textContent = tape.buttonLabel;
        }
      }

      // Highlight active tape button
      document.querySelectorAll('.tape-option-btn').forEach((btn) => {
        const id = Number(btn.getAttribute('data-tape-id'));
        btn.classList.toggle('active', id === tape.id);
      });

      // Highlight active duration pill
      document.querySelectorAll('.duration-pill').forEach((btn) => {
        const min = Number(btn.getAttribute('data-duration-min'));
        btn.classList.toggle('active', min === state.selectedTapeDurationMin);
      });

      updateAudioTimerDisplay();
    }

    function updateAudioTimerDisplay() {
      const timerEl = document.getElementById('synth-timer-display');
      if (!timerEl) return;
      const mins = Math.floor(audioRemainingSeconds / 60);
      const secs = audioRemainingSeconds % 60;
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function startBinauralSynth() {
      const tape = getActiveTape();
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          isPlayingAudio = true;
          startAudioCountdown();
          renderRewire();
          return;
        }

        if (!audioCtx) {
          audioCtx = new AudioContextClass();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        stopOscillatorsOnly();

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.8);

        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;

        // Left Ear Carrier Oscillator
        leftOsc = audioCtx.createOscillator();
        leftOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(tape.leftHz, audioCtx.currentTime);

        // Right Ear Carrier Oscillator (Carrier + Binaural Beat Offset)
        rightOsc = audioCtx.createOscillator();
        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(tape.rightHz, audioCtx.currentTime);

        // Warm Sub-Harmonic Cosmic Pad
        padOsc = audioCtx.createOscillator();
        padOsc.type = 'triangle';
        padOsc.frequency.setValueAtTime(tape.leftHz / 2, audioCtx.currentTime);
        const padGain = audioCtx.createGain();
        padGain.gain.setValueAtTime(0.03, audioCtx.currentTime);

        if (typeof audioCtx.createStereoPanner === 'function') {
          const leftPan = audioCtx.createStereoPanner();
          leftPan.pan.setValueAtTime(-0.85, audioCtx.currentTime);
          const rightPan = audioCtx.createStereoPanner();
          rightPan.pan.setValueAtTime(0.85, audioCtx.currentTime);

          leftOsc.connect(leftPan);
          leftPan.connect(masterGain);

          rightOsc.connect(rightPan);
          rightPan.connect(masterGain);
        } else {
          leftOsc.connect(masterGain);
          rightOsc.connect(masterGain);
        }

        padOsc.connect(padGain);
        padGain.connect(masterGain);

        masterGain.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);

        leftOsc.start();
        rightOsc.start();
        padOsc.start();

        isPlayingAudio = true;
        startAudioCountdown();
        renderRewire();
        showToast(`Memutar ${tape.title} (${tape.beatHz}Hz Binaural Beat)`);
      } catch (err) {
        isPlayingAudio = true;
        startAudioCountdown();
        renderRewire();
      }
    }

    function stopOscillatorsOnly() {
      [leftOsc, rightOsc, padOsc].forEach((osc) => {
        if (osc) {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        }
      });
      leftOsc = null;
      rightOsc = null;
      padOsc = null;
    }

    function stopBinauralSynth() {
      stopOscillatorsOnly();
      isPlayingAudio = false;
      if (audioTimerInterval) {
        clearInterval(audioTimerInterval);
        audioTimerInterval = null;
      }
      renderRewire();
    }

    function tickAudioSecond() {
      if (!isPlayingAudio) return;
      audioRemainingSeconds = Math.max(0, audioRemainingSeconds - 1);
      if (audioRemainingSeconds <= 0) {
        stopBinauralSynth();
        state.xp += 30;
        saveState();
        renderHome();
        audioRemainingSeconds = state.selectedTapeDurationMin * 60;
        updateAudioTimerDisplay();
        showToast('Sesi Binaural Rewire Selesai! +30 XP ditambahkan.');
      } else {
        updateAudioTimerDisplay();
      }
    }

    function startAudioCountdown() {
      if (audioTimerInterval) clearInterval(audioTimerInterval);
      audioTimerInterval = setInterval(tickAudioSecond, 1000);
    }

    function playVictoryChime() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(792, audioCtx.currentTime + 0.28);

        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.46);
      } catch (e) {}
    }

    function drawAudioVisualizer() {
      const canvas = document.getElementById('audio-visualizer');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' && window.devicePixelRatio
          ? Math.max(1, Math.min(3, window.devicePixelRatio))
          : 1;
      const logicalW = 310;
      const logicalH = 48;
      const targetW = Math.round(logicalW * dpr);
      const targetH = Math.round(logicalH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      if (dpr !== 1 && typeof ctx.scale === 'function') {
        ctx.scale(dpr, dpr);
      }

      const w = logicalW;
      const h = logicalH;
      ctx.clearRect(0, 0, w, h);

      const tape = getActiveTape();
      visualizerPhase += isPlayingAudio ? 0.09 : 0.02;

      // Primary Carrier Wave
      ctx.beginPath();
      ctx.strokeStyle = isPlayingAudio ? '#4F8BFF' : 'rgba(79, 139, 255, 0.35)';
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x++) {
        const amp = isPlayingAudio ? 13 : 4;
        const mod = Math.cos((x * 0.025) - visualizerPhase * 0.6);
        const y = h / 2 + Math.sin(x * 0.06 + visualizerPhase) * amp * mod;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Secondary Binaural Offset Wave
      ctx.beginPath();
      ctx.strokeStyle = isPlayingAudio ? '#F59E0B' : 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x++) {
        const amp = isPlayingAudio ? 10 : 3;
        const freqFactor = 0.05 + tape.beatHz * 0.002;
        const y = h / 2 + Math.cos(x * freqFactor - visualizerPhase * 1.2) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // =======================================================================
    // 7. TAB 4: STATISTICS & COMMUNITY CHALLENGES (Comprehensive Telemetry)
    // =======================================================================
    function drawStatsEnergyChart() {
      const canvas = document.getElementById('stats-energy-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' && window.devicePixelRatio
          ? Math.max(1, Math.min(3, window.devicePixelRatio))
          : 1;
      const logicalW = 320;
      const logicalH = 116;
      const targetW = Math.round(logicalW * dpr);
      const targetH = Math.round(logicalH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      if (dpr !== 1 && typeof ctx.scale === 'function') {
        ctx.scale(dpr, dpr);
      }

      const w = logicalW;
      const h = logicalH;
      ctx.clearRect(0, 0, w, h);

      const history =
        Array.isArray(state.energyHistory) && state.energyHistory.length === 7
          ? state.energyHistory
          : (state.isDayOne ? [null, null, null, null, null, null, null] : [4, 4, 3, 4, 3, 5, 4]);

      const padX = 28;
      const padTop = 26;
      const padBot = 24;
      const usableW = w - padX * 2;
      const usableH = h - padTop - padBot;

      // Subtle horizontal reference grid lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
      ctx.lineWidth = 1;
      [0, 0.5, 1].forEach((frac) => {
        const gy = padTop + usableH * frac;
        ctx.beginPath();
        ctx.moveTo(padX - 6, gy);
        ctx.lineTo(w - padX + 6, gy);
        ctx.stroke();
      });

      const defaultLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const points = history.map((val, idx) => {
        const hasVal = Number.isFinite(val) && val > 0;
        const clamped = hasVal ? Math.max(1, Math.min(5, Number(val))) : null;
        const x = padX + (idx / 6) * usableW;
        const y = hasVal ? padTop + (1 - (clamped - 1) / 4) * usableH : null;
        const dayObj = Array.isArray(state.sevenDays) && state.sevenDays[idx] && typeof state.sevenDays[idx] === 'object'
          ? state.sevenDays[idx]
          : null;
        const dayLetter = dayObj && typeof dayObj.dayLetter === 'string' ? dayObj.dayLetter : defaultLetters[idx];
        return { x, y, val: clamped, hasVal, dayLetter };
      });

      const validPoints = points.filter((p) => p.hasVal);

      if (validPoints.length >= 2) {
        // Area fill under smooth curve
        if (typeof ctx.createLinearGradient === 'function') {
          const areaGrad = ctx.createLinearGradient(0, padTop, 0, h - padBot);
          areaGrad.addColorStop(0, 'rgba(77, 124, 254, 0.34)');
          areaGrad.addColorStop(1, 'rgba(77, 124, 254, 0.01)');
          ctx.fillStyle = areaGrad;
        } else {
          ctx.fillStyle = 'rgba(79, 139, 255, 0.22)';
        }

        ctx.beginPath();
        ctx.moveTo(validPoints[0].x, h - padBot);
        ctx.lineTo(validPoints[0].x, validPoints[0].y);
        for (let i = 1; i < validPoints.length; i++) {
          const prev = validPoints[i - 1];
          const curr = validPoints[i];
          const cpX = (prev.x + curr.x) / 2;
          if (typeof ctx.bezierCurveTo === 'function') {
            ctx.bezierCurveTo(cpX, prev.y, cpX, curr.y, curr.x, curr.y);
          } else {
            ctx.lineTo(curr.x, curr.y);
          }
        }
        ctx.lineTo(validPoints[validPoints.length - 1].x, h - padBot);
        ctx.closePath();
        ctx.fill();

        // Main glowing trajectory line
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        validPoints.forEach((pt, idx) => {
          if (idx === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            const prev = validPoints[idx - 1];
            const cpX = (prev.x + pt.x) / 2;
            if (typeof ctx.bezierCurveTo === 'function') {
              ctx.bezierCurveTo(cpX, prev.y, cpX, pt.y, pt.x, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        });
        ctx.stroke();
      }

      // Nodes & crisp Retina labels for each of the 7 days
      points.forEach((pt, idx) => {
        const isToday = idx === 6;
        if (pt.hasVal) {
          if (isToday) {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.26)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = isToday ? '#FDE047' : '#FFFFFF';
          ctx.strokeStyle = isToday ? '#F59E0B' : '#4D7CFE';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isToday ? 4.4 : 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (typeof ctx.fillText === 'function') {
            ctx.font = '700 10.5px Inter, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = isToday ? '#FDE047' : '#94A3B8';
            ctx.fillText(pt.dayLetter, pt.x, h - 6);
            ctx.font = '800 10.5px Inter, -apple-system, sans-serif';
            ctx.fillStyle = isToday ? '#FEF08A' : '#E2E8F0';
            ctx.fillText(String(pt.val), pt.x, Math.max(12, pt.y - 8));
          }
        } else {
          // Empty/unrecorded day ring
          ctx.strokeStyle = isToday ? 'rgba(56, 189, 248, 0.45)' : 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          const ringY = padTop + usableH * 0.5;
          ctx.arc(pt.x, ringY, 3.2, 0, Math.PI * 2);
          ctx.stroke();

          if (typeof ctx.fillText === 'function') {
            ctx.font = '700 10.5px Inter, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = isToday ? '#38BDF8' : 'rgba(148, 163, 184, 0.5)';
            ctx.fillText(pt.dayLetter, pt.x, h - 6);
          }
        }
      });

      // If no valid points logged on Day 1, display a gentle prompt text on the canvas
      if (validPoints.length === 0 && typeof ctx.fillText === 'function') {
        ctx.font = '500 11px Inter, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.72)';
        ctx.fillText('Hari 1 — Pilih level energi di bawah untuk log pertama', w / 2, padTop + usableH * 0.48);
      }

      ctx.restore();
    }

    function renderStatistics() {
      const nowMs = Date.now();
      const breakdown = computeStreakBreakdown(state.streakStartTime, nowMs);
      const metrics = computeStatisticsMetrics(state, nowMs);
      const period = state.statsPeriod || '7d';

      // Period filter pills active state
      document.querySelectorAll('#stats-period-pills .stats-period-pill').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-stats-period') === period);
      });

      const savedEl = document.getElementById('stat-time-saved');
      const impEl = document.getElementById('stat-improvement-pct');
      const timeCapEl = document.getElementById('stat-time-caption');
      const impCapEl = document.getElementById('stat-improvement-caption');

      let displayedTimeSaved = metrics.timeSavedValue;
      let displayedImpPct = metrics.improvementPct;
      if (period === '30d') {
        if (metrics.timeSavedValue > 0) {
          displayedTimeSaved = Math.round(metrics.timeSavedValue * 4.2);
        }
        displayedImpPct = Math.min(99, metrics.improvementPct + 14);
      } else if (period === '90d') {
        if (metrics.timeSavedValue > 0) {
          displayedTimeSaved = Math.round(metrics.timeSavedValue * 12.5);
        }
        displayedImpPct = Math.min(99, metrics.improvementPct + 28);
      }

      if (savedEl) savedEl.textContent = String(displayedTimeSaved);
      if (impEl) impEl.textContent = String(displayedImpPct);
      if (timeCapEl) {
        if (period === '30d') timeCapEl.innerHTML = 'projected mins saved<br />in 30 days';
        else if (period === '90d') timeCapEl.innerHTML = 'projected mins saved<br />in 90 days';
        else timeCapEl.innerHTML = 'potential time saved<br />this week';
      }
      if (impCapEl) {
        if (period === '30d') impCapEl.innerHTML = 'discipline gain<br />30-day window';
        else if (period === '90d') impCapEl.innerHTML = 'reboot trajectory<br />90-day target';
        else impCapEl.innerHTML = 'improvement<br />vs last week';
      }

      // Render 4-Card KPI Telemetry Grid
      const kpiStreakEl = document.getElementById('stat-kpi-current-streak');
      const kpiStreakSubEl = document.getElementById('stat-kpi-streak-sub');
      const kpiBestEl = document.getElementById('stat-kpi-best-streak');
      const kpiBestSubEl = document.getElementById('stat-kpi-best-sub');
      const kpiUrgesEl = document.getElementById('stat-kpi-urges-total');
      const kpiUrgeRateEl = document.getElementById('stat-kpi-urge-rate');
      const kpiCleanScoreEl = document.getElementById('stat-kpi-clean-score');
      const kpiXpRankEl = document.getElementById('stat-kpi-xp-rank');

      if (kpiStreakEl) kpiStreakEl.textContent = metrics.currentStreakLabel;
      if (kpiStreakSubEl) {
        kpiStreakSubEl.textContent =
          breakdown.days >= 30
            ? 'Momentum Tinggi'
            : breakdown.days >= 7
            ? 'Fase Fokus Stabil'
            : 'Fase Awal Aktif';
      }
      if (kpiBestEl) kpiBestEl.textContent = metrics.bestStreakLabel;
      if (kpiBestSubEl) {
        kpiBestSubEl.textContent = metrics.isNewRecord ? 'Rekor Baru Aktif!' : 'Target: 90 Hari';
      }
      if (kpiUrgesEl) kpiUrgesEl.textContent = `${metrics.totalUrgesOvercome}x`;
      if (kpiUrgeRateEl) kpiUrgeRateEl.textContent = `${metrics.urgeVictoryRate}% Rasio Menang`;
      if (kpiCleanScoreEl) kpiCleanScoreEl.textContent = `${metrics.cleanScorePct}%`;
      if (kpiXpRankEl) kpiXpRankEl.textContent = `${state.xp} XP • ${metrics.rankTitle}`;

      // Render 90-Day Brain Rewiring & Dopamine Recovery Telemetry
      const isZeroRecovery = Boolean(state.isDayOne || breakdown.totalHours < 0.05);
      const brainInfo = computeBrainRecoveryMetrics(breakdown.totalHours, state.stealthMode, isZeroRecovery);
      const vaultInfo = computeVaultProgress(breakdown.totalHours, state.stealthMode);
      const brainPhaseEl = document.getElementById('stat-reboot-phase-badge');
      const brainOverallEl = document.getElementById('stat-reboot-overall-pct');
      const brainBarsEl = document.getElementById('brain-recovery-bars');
      const focusSessionsChip = document.getElementById('brain-focus-sessions-chip');
      const nextMilestoneChip = document.getElementById('brain-next-milestone-chip');

      if (brainPhaseEl) brainPhaseEl.textContent = brainInfo.phaseBadge;
      if (brainOverallEl) brainOverallEl.textContent = `${brainInfo.overallPct}%`;
      if (focusSessionsChip) {
        if (isZeroRecovery) {
          focusSessionsChip.textContent = '0 Sesi Deep Work Pulih';
        } else {
          focusSessionsChip.textContent = `~${metrics.deepWorkSessionsRecovered} Sesi Deep Work Pulih`;
        }
      }
      if (nextMilestoneChip) {
        nextMilestoneChip.textContent = vaultInfo.nextLabel;
      }
      if (brainBarsEl) {
        brainBarsEl.innerHTML = '';
        brainInfo.metrics.forEach((m) => {
          const row = document.createElement('div');
          row.className = 'brain-bar-row';
          row.innerHTML = `
            <div class="brain-bar-labels">
              <span>${m.label}</span>
              <span>${m.pct}%</span>
            </div>
            <div class="brain-bar-track">
              <div class="brain-bar-fill" style="width: ${m.pct}%; background: ${m.color};"></div>
            </div>
          `;
          brainBarsEl.appendChild(row);
        });
      }

      // Render 7 Days at a Glance Circles
      const rowEl = document.getElementById('seven-days-row');
      const inspectorText = document.getElementById('day-inspector-text');
      if (rowEl) {
        rowEl.innerHTML = '';
        state.sevenDays.forEach((dayObj, idx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `day-circle status-${dayObj.status}${selectedDayIndex === idx ? ' selected' : ''}`;
          btn.textContent = dayObj.dayLetter;
          btn.title = `${dayObj.label}: ${dayObj.note}`;
          btn.addEventListener('click', () => {
            selectedDayIndex = idx;
            selectedHeatmapIndex = null;
            if (inspectorText) {
              inspectorText.textContent = `${dayObj.label}: ${dayObj.note}`;
            }
            rowEl.querySelectorAll('.day-circle').forEach((c, cIdx) => {
              c.classList.toggle('selected', cIdx === idx);
            });
            document.querySelectorAll('#thirty-days-heatmap .heatmap-cell').forEach((cell) => {
              cell.classList.remove('selected');
            });
          });
          rowEl.appendChild(btn);
        });
        if (selectedDayIndex !== null && state.sevenDays[selectedDayIndex] && inspectorText) {
          const selDay = state.sevenDays[selectedDayIndex];
          inspectorText.textContent = `${selDay.label}: ${selDay.note}`;
        }
      }

      // Render 30-Day Consistency Heatmap Matrix
      const heatmapGridEl = document.getElementById('thirty-days-heatmap');
      const heatmapSummaryEl = document.getElementById('heatmap-summary-label');
      const matrix = computeThirtyDayMatrix(state, nowMs);

      if (heatmapSummaryEl) {
        if (state.isDayOne) {
          heatmapSummaryEl.textContent = state.lastPledgeDate ? 'Hari 1 • 1/30 Bersih (3%)' : 'Hari 1 • 0/30 Bersih (0%)';
        } else {
          heatmapSummaryEl.textContent = `${matrix.cleanCount}/30 Bersih (${matrix.consistencyPct}%)`;
        }
      }
      if (heatmapGridEl) {
        heatmapGridEl.innerHTML = '';
        matrix.cells.forEach((cellObj, cIdx) => {
          const cellBtn = document.createElement('button');
          cellBtn.type = 'button';
          cellBtn.className = `heatmap-cell cell-${cellObj.status}${selectedHeatmapIndex === cIdx ? ' selected' : ''}`;
          cellBtn.textContent = String(cellObj.dayNumber);
          cellBtn.title = `${cellObj.label}: ${cellObj.note}`;
          cellBtn.addEventListener('click', () => {
            selectedHeatmapIndex = cIdx;
            selectedDayIndex = null;
            if (inspectorText) {
              inspectorText.textContent = `${cellObj.label}: ${cellObj.note}`;
            }
            heatmapGridEl.querySelectorAll('.heatmap-cell').forEach((el, elIdx) => {
              el.classList.toggle('selected', elIdx === cIdx);
            });
            if (rowEl) {
              rowEl.querySelectorAll('.day-circle').forEach((c) => c.classList.remove('selected'));
            }
          });
          heatmapGridEl.appendChild(cellBtn);
        });
      }

      // Render 7-Day Energy & Focus Trend Chart + Active Check-in Level
      const energyHistory =
        Array.isArray(state.energyHistory) && state.energyHistory.length === 7
          ? state.energyHistory
          : (state.isDayOne ? [null, null, null, null, null, null, null] : [4, 4, 3, 4, 3, 5, 4]);
      const validEntries = energyHistory.filter((v) => Number.isFinite(v) && v > 0);
      const avgEnergy = validEntries.length > 0
        ? (validEntries.reduce((a, b) => a + b, 0) / validEntries.length).toFixed(1)
        : '0.0';
      const energyAvgBadge = document.getElementById('energy-avg-badge');
      if (energyAvgBadge) {
        if (state.isDayOne && validEntries.length === 0) {
          energyAvgBadge.textContent = '0.0 / 5.0 (Day 1)';
        } else {
          energyAvgBadge.textContent = `${avgEnergy} / 5.0`;
        }
      }
      const todayEnergy = Number.isFinite(energyHistory[6]) ? energyHistory[6] : null;
      document.querySelectorAll('#energy-checkin-row .energy-lvl-btn').forEach((btn) => {
        const lvl = Number(btn.getAttribute('data-energy-level'));
        btn.classList.toggle('active', todayEnergy !== null && lvl === todayEnergy);
      });
      drawStatsEnergyChart();

      // Render Trigger Breakdown Bar Chart (All 5 triggers)
      const barsListEl = document.getElementById('trigger-bars-list');
      const triggerTotalBadge = document.getElementById('trigger-total-badge');
      if (barsListEl) {
        const sortedTriggers = computeTriggerBreakdown(state.triggers);
        const totalTriggerLogs = sortedTriggers.reduce((acc, item) => acc + item.count, 0);
        if (triggerTotalBadge) {
          triggerTotalBadge.textContent = `${totalTriggerLogs} Log`;
        }
        barsListEl.innerHTML = '';
        sortedTriggers.forEach((item) => {
          const row = document.createElement('div');
          row.className = `trigger-bar-row${item.count === 0 ? ' is-zero' : ''}`;
          row.innerHTML = `
            <div class="trigger-bar-labels">
              <span class="trigger-bar-name">${item.name}</span>
              <span class="trigger-bar-stat"><strong>${item.percentage}%</strong> <small>(${item.count}x)</small></span>
            </div>
            <div class="trigger-bar-track">
              <div class="trigger-bar-fill" style="width: ${item.percentage}%;"></div>
            </div>
          `;
          barsListEl.appendChild(row);
        });
      }

      // Render Time Vulnerability Windows Breakdown
      const vulnGridEl = document.getElementById('time-vulnerability-grid');
      const vulnPeakBadge = document.getElementById('vuln-peak-badge');
      if (vulnGridEl) {
        const vulnInfo = computeVulnerabilityBreakdown(state.timeVulnerability);
        if (vulnPeakBadge) {
          vulnPeakBadge.textContent = `Puncak: ${vulnInfo.peakWindow}`;
        }
        vulnGridEl.innerHTML = '';
        vulnInfo.items.forEach((vItem) => {
          const match = String(vItem.windowLabel).match(/^(.+?)\s*(\([^)]+\))$/);
          const mainName = match ? match[1] : vItem.windowLabel;
          const hoursSub = match ? match[2] : '';
          const isHighRisk = vItem.percentage >= 40;
          const card = document.createElement('div');
          card.className = `vuln-slot-card${isHighRisk ? ' is-peak' : ''}`;
          card.innerHTML = `
            <div class="vuln-slot-top">
              <div class="vuln-slot-title-wrap">
                <span class="vuln-slot-name">${mainName}</span>
                ${hoursSub ? `<small class="vuln-slot-hours">${hoursSub}</small>` : ''}
              </div>
              <span class="vuln-slot-pct">${vItem.percentage}%</span>
            </div>
            <div class="vuln-slot-bar">
              <div class="vuln-slot-fill${isHighRisk ? ' high-risk' : ''}" style="width: ${vItem.percentage}%;"></div>
            </div>
          `;
          vulnGridEl.appendChild(card);
        });
      }

      // Render Community Challenge Card
      const chIdx = state.activeChallengeIndex % COMMUNITY_CHALLENGES.length;
      const challenge = COMMUNITY_CHALLENGES[chIdx];
      const isJoined = Boolean(state.joinedChallenges[challenge.id]);

      const titleEl = document.getElementById('challenge-title');
      const partEl = document.getElementById('challenge-participants');
      const switchBtn = document.getElementById('btn-switch-challenge');
      const dockEl = document.getElementById('challenge-cta-dock');

      if (titleEl) {
        titleEl.innerHTML = state.stealthMode ? challenge.stealthTitleHtml : challenge.titleHtml;
      }
      if (partEl) {
        const count = challenge.baseParticipants + (isJoined ? 1 : 0);
        partEl.textContent = `${count.toLocaleString('en-US')} participants`;
      }
      if (switchBtn) {
        switchBtn.textContent = state.stealthMode
          ? (challenge.stealthSwitchLabel || challenge.switchLabel)
          : challenge.switchLabel;
      }

      if (dockEl) {
        if (!isJoined) {
          dockEl.innerHTML = `
            <button type="button" class="btn-glossy-blue-pill" id="btn-join-challenge">
              Join the Challenge
            </button>
          `;
          const joinBtn = document.getElementById('btn-join-challenge');
          if (joinBtn) {
            joinBtn.addEventListener('click', () => {
              state.joinedChallenges[challenge.id] = true;
              state.xp += 20;
              saveState();
              renderStatistics();
              renderHome();
              showToast('Berhasil bergabung ke Community Challenge! (+20 XP)');
            });
          }
        } else {
          const dayNum = Math.min(challenge.targetDays, Math.max(1, breakdown.days + 1));
          const pct = Math.min(100, Math.round((dayNum / challenge.targetDays) * 100));
          dockEl.innerHTML = `
            <div class="challenge-progress-pill" id="challenge-joined-progress" title="Ketuk untuk keluar tantangan">
              <div class="challenge-progress-top">
                <span>Joined • Day ${dayNum} of ${challenge.targetDays}</span>
                <span>${pct}%</span>
              </div>
              <div class="challenge-progress-bar">
                <div class="challenge-progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
          const progEl = document.getElementById('challenge-joined-progress');
          if (progEl) {
            progEl.addEventListener('click', () => {
              delete state.joinedChallenges[challenge.id];
              saveState();
              renderStatistics();
            });
          }
        }
      }
    }

    // =======================================================================
    // 8. TAB 5: SHIELD & PRIVACY (Core Reason, Daily Reminder, Stealth Mode, 4-Digit PIN)
    // =======================================================================
    function getNotificationPermissionState() {
      const notifApi =
        (typeof window !== 'undefined' && window.Notification) ||
        (typeof Notification !== 'undefined' ? Notification : null);
      if (!notifApi || typeof notifApi.permission !== 'string') {
        return 'unsupported';
      }
      return notifApi.permission;
    }

    async function requestNotificationPermission() {
      const notifApi =
        (typeof window !== 'undefined' && window.Notification) ||
        (typeof Notification !== 'undefined' ? Notification : null);
      if (!notifApi) {
        return 'unsupported';
      }
      if (notifApi.permission === 'granted') {
        return 'granted';
      }
      if (typeof notifApi.requestPermission === 'function') {
        try {
          const result = await notifApi.requestPermission();
          return result || notifApi.permission || 'default';
        } catch (e) {
          return notifApi.permission || 'default';
        }
      }
      return notifApi.permission || 'default';
    }

    function getServiceWorkerContainer() {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.serviceWorker) {
        return window.navigator.serviceWorker;
      }
      if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
        return navigator.serviceWorker;
      }
      return null;
    }

    function syncReminderWithServiceWorker(nowMs = Date.now()) {
      try {
        const sw = getServiceWorkerContainer();
        if (!sw) return null;
        const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
        const isCommittedToday = state.lastPledgeDate === getTodayDateString(safeNowMs);
        const nextInfo = computeNextReminderInfo(
          state.reminderTime,
          safeNowMs,
          state.lastReminderSentDate,
          isCommittedToday
        );
        const payload = buildCommitReminderPayload(state, safeNowMs);
        const msg = {
          type: 'SYNC_DAILY_REMINDER',
          enabled: Boolean(state.reminderEnabled),
          isCommittedToday,
          reminderTime: state.reminderTime,
          delayMs: nextInfo.msUntilNext,
          title: payload.title,
          body: payload.body,
          tag: payload.tag,
          url: './index.html',
          options: {
            body: payload.body,
            icon: 'icon-192.png',
            badge: 'icon-192.png',
            tag: payload.tag,
            renotify: true,
            data: { url: './index.html' }
          }
        };
        if (sw.controller && typeof sw.controller.postMessage === 'function') {
          sw.controller.postMessage(msg);
        }
        return msg;
      } catch (e) {
        return null;
      }
    }

    function dispatchCommitNotification(customPayload = null) {
      const payload = customPayload || buildCommitReminderPayload(state, Date.now());
      playVictoryChime();
      showToast(`${payload.title} — ${payload.body}`);

      const notifApi =
        (typeof window !== 'undefined' && window.Notification) ||
        (typeof Notification !== 'undefined' ? Notification : null);
      const perm = getNotificationPermissionState();

      if (perm !== 'granted') {
        return payload;
      }

      const notifOptions = {
        body: payload.body,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: payload.tag,
        renotify: true,
        data: { url: './index.html' }
      };

      let swDispatched = false;
      try {
        const sw = getServiceWorkerContainer();
        if (sw) {
          if (sw.controller && typeof sw.controller.postMessage === 'function') {
            sw.controller.postMessage({
              type: 'SHOW_COMMIT_NOTIFICATION',
              title: payload.title,
              body: payload.body,
              tag: payload.tag,
              url: './index.html',
              options: notifOptions
            });
            swDispatched = true;
          } else if (typeof sw.getRegistration === 'function') {
            swDispatched = true;
            sw.getRegistration()
              .then((reg) => {
                if (reg && typeof reg.showNotification === 'function') {
                  return reg.showNotification(payload.title, notifOptions);
                }
                if (notifApi) {
                  new notifApi(payload.title, {
                    body: payload.body,
                    icon: 'icon-192.png',
                    tag: payload.tag
                  });
                }
              })
              .catch(() => {
                try {
                  if (notifApi) {
                    new notifApi(payload.title, {
                      body: payload.body,
                      icon: 'icon-192.png',
                      tag: payload.tag
                    });
                  }
                } catch (err) {}
              });
          }
        }
      } catch (e) {}

      if (!swDispatched && notifApi) {
        try {
          new notifApi(payload.title, {
            body: payload.body,
            icon: 'icon-192.png',
            tag: payload.tag
          });
        } catch (e) {}
      }

      return payload;
    }

    function setDailyReminderConfig(enabled, timeStr, nowMs = Date.now()) {
      const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
      const safeTime = normalizeReminderTime(timeStr, state.reminderTime || DEFAULT_REMINDER_TIME);
      state.reminderEnabled = Boolean(enabled);
      state.reminderTime = safeTime;

      if (state.reminderEnabled) {
        const parts = safeTime.split(':');
        const targetMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        const d = new Date(safeNowMs);
        const nowMins = d.getHours() * 60 + d.getMinutes();
        if (nowMins > targetMins) {
          // Chosen time has already passed earlier today -> schedule first fire for tomorrow at safeTime
          state.lastReminderSentDate = getTodayDateString(safeNowMs);
        } else {
          // Chosen time is later today (or right now) -> allow firing today when clock reaches safeTime
          state.lastReminderSentDate = null;
        }
      }

      saveState();
      renderShield();
      syncReminderWithServiceWorker(safeNowMs);
      return {
        enabled: state.reminderEnabled,
        reminderTime: state.reminderTime,
        lastReminderSentDate: state.lastReminderSentDate
      };
    }

    function checkAndTriggerDailyReminder(nowMs = Date.now()) {
      const safeNowMs = Number.isFinite(nowMs) ? nowMs : Date.now();
      // Recover gracefully if user's clock/timezone moved backward to before reminderTime today
      if (state && state.reminderEnabled && state.lastReminderSentDate) {
        const todayStr = getTodayDateString(safeNowMs);
        if (state.lastReminderSentDate === todayStr) {
          const safeTime = normalizeReminderTime(state.reminderTime);
          const parts = safeTime.split(':');
          const targetMins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
          const d = new Date(safeNowMs);
          const nowMins = d.getHours() * 60 + d.getMinutes();
          if (nowMins < targetMins) {
            state.lastReminderSentDate = null;
            saveState();
            renderShield();
            syncReminderWithServiceWorker(safeNowMs);
          }
        }
      }
      if (!shouldTriggerDailyReminder(state, safeNowMs)) {
        return null;
      }
      state.lastReminderSentDate = getTodayDateString(safeNowMs);
      saveState();
      const payload = dispatchCommitNotification(buildCommitReminderPayload(state, safeNowMs));
      renderShield();
      syncReminderWithServiceWorker(safeNowMs);
      return payload;
    }

    function renderShield() {
      const reasonInput = document.getElementById('input-core-reason');
      if (reasonInput && document.activeElement !== reasonInput) {
        reasonInput.value = state.coreReason;
      }

      // Render Daily Commit Reminder UI
      const reminderSwitch = document.getElementById('switch-daily-reminder');
      const reminderTimeInput = document.getElementById('input-reminder-time');
      const reminderPermBadge = document.getElementById('reminder-permission-badge');
      const reminderStatusEl = document.getElementById('reminder-status-text');
      const perm = getNotificationPermissionState();

      if (reminderSwitch) {
        reminderSwitch.classList.toggle('active', Boolean(state.reminderEnabled));
        reminderSwitch.setAttribute('aria-checked', String(Boolean(state.reminderEnabled)));
      }
      if (reminderTimeInput && document.activeElement !== reminderTimeInput) {
        reminderTimeInput.value = normalizeReminderTime(state.reminderTime);
      }
      if (reminderPermBadge) {
        reminderPermBadge.classList.remove('is-active', 'is-denied');
        if (perm === 'denied') {
          reminderPermBadge.textContent = 'Izin Ditolak';
          reminderPermBadge.classList.add('is-denied');
        } else if (state.reminderEnabled) {
          reminderPermBadge.textContent = 'Aktif • Setiap Hari';
          reminderPermBadge.classList.add('is-active');
        } else {
          reminderPermBadge.textContent = 'Nonaktif';
        }
      }
      if (reminderStatusEl) {
        const committedToday = state.lastPledgeDate === getTodayDateString();
        const commitSuffix = committedToday ? ' (Commit hari ini sudah terkunci)' : '';
        const permSuffix =
          perm === 'denied'
            ? ' — Izin notifikasi browser ditolak (pengingat tampil via alert dalam aplikasi).'
            : '';
        if (state.reminderEnabled) {
          const info = computeNextReminderInfo(
            state.reminderTime,
            Date.now(),
            state.lastReminderSentDate,
            committedToday
          );
          reminderStatusEl.innerHTML = `Status: <strong>${info.statusLabel}${commitSuffix}</strong>${permSuffix}`;
        } else {
          const safeTime = normalizeReminderTime(state.reminderTime);
          reminderStatusEl.innerHTML = `Status: <strong>Pengingat belum aktif${commitSuffix}</strong> — atur jam (misal <strong>${safeTime}</strong>) lalu aktifkan sakelar di atas.${permSuffix}`;
        }
      }

      const stealthSwitch = document.getElementById('switch-stealth-mode');
      const stealthBadge = document.getElementById('stealth-badge');
      if (stealthSwitch) {
        stealthSwitch.classList.toggle('active', Boolean(state.stealthMode));
        stealthSwitch.setAttribute('aria-checked', String(Boolean(state.stealthMode)));
      }
      if (stealthBadge) {
        stealthBadge.style.display = state.stealthMode ? 'inline-flex' : 'none';
      }

      // Apply Stealth Mode document title, brand labels, App Version card, and bottom nav labels
      const brandTitle = document.getElementById('desktop-brand-title');
      const navVault = document.getElementById('nav-label-vault');
      const navRewire = document.getElementById('nav-label-rewire');
      const versionBadge = document.getElementById('shield-version-badge');
      const versionDesc = document.getElementById('shield-version-desc');
      if (state.stealthMode) {
        document.title = 'ASTRAL — Deep Focus & Orbital Timer';
        if (brandTitle) brandTitle.textContent = 'ASTRAL • Orbital Focus Timer';
        if (navVault) navVault.textContent = 'Artifacts';
        if (navRewire) navRewire.textContent = 'Acoustic';
        if (versionBadge) versionBadge.textContent = `ASTRAL v${APP_VERSION}`;
        if (versionDesc) {
          versionDesc.textContent = `ASTRAL Orbital Focus Timer • Build v${APP_VERSION} (Offline-First PWA & Android APK).`;
        }
      } else {
        document.title = 'SEED — Cosmic Dopamine Reboot & Streak Tracker';
        if (brandTitle) brandTitle.textContent = 'SEED • Cosmic Reboot';
        if (navVault) navVault.textContent = 'Seed Vault';
        if (navRewire) navRewire.textContent = 'Rewire';
        if (versionBadge) versionBadge.textContent = `SEED v${APP_VERSION}`;
        if (versionDesc) {
          versionDesc.textContent = `SEED Cosmic Dopamine Reboot • Build v${APP_VERSION} (Offline-First PWA & Android APK).`;
        }
      }

      const pinSwitch = document.getElementById('switch-pin-enabled');
      const pinDesc = document.getElementById('pin-status-desc');
      const pinInput = document.getElementById('input-pin-code');
      if (pinSwitch) {
        pinSwitch.classList.toggle('active', Boolean(state.pinEnabled));
        pinSwitch.setAttribute('aria-checked', String(Boolean(state.pinEnabled)));
      }
      if (pinDesc) {
        pinDesc.textContent = state.pinEnabled
          ? `PIN 4-Digit Aktif (PIN saat ini tersimpan di localStorage)`
          : 'Kunci aplikasi dengan PIN 4 angka agar privasi streak terjaga.';
      }
      if (pinInput && document.activeElement !== pinInput) {
        pinInput.value = state.pinCode || '1234';
      }

      const dailyMinsInput = document.getElementById('input-daily-minutes');
      if (dailyMinsInput && document.activeElement !== dailyMinsInput) {
        dailyMinsInput.value = String(state.dailyWastedMinutes || 21);
      }

      const streakDateTimeInput = document.getElementById('input-streak-start-datetime');
      if (streakDateTimeInput && document.activeElement !== streakDateTimeInput) {
        streakDateTimeInput.value = formatDateTimeLocal(state.streakStartTime);
      }
      updateStreakPreviewUI();

      updateTabHeroBanner();
    }

    function updateStreakPreviewUI(customTimestamp) {
      const previewTextEl = document.getElementById('streak-start-preview-text');
      if (!previewTextEl) return;

      const ts = Number.isFinite(customTimestamp) ? customTimestamp : state.streakStartTime;
      const nowMs = Date.now();

      if (!Number.isFinite(ts)) {
        previewTextEl.textContent = 'Silakan pilih tanggal & jam yang valid.';
        return;
      }

      if (ts > nowMs) {
        const diffMs = ts - nowMs;
        const diffMins = Math.ceil(diffMs / 60000);
        const diffHours = (diffMs / 3600000).toFixed(1);
        const timeText = diffMs >= 3600000 ? `${diffHours} jam` : `${diffMins} menit`;
        previewTextEl.innerHTML = `<em>Waktu di masa depan</em> — Streak dijadwalkan dan akan dimulai otomatis dalam <strong>${timeText}</strong> lagi.`;
        return;
      }

      const b = computeStreakBreakdown(ts, nowMs);
      const stage = getStageForHours(b.totalHours);
      const stageName = state.stealthMode ? stage.stealthName : stage.name;
      previewTextEl.innerHTML = `Durasi Berjalan: <strong>${b.days} hari ${b.hours} jam ${b.minutes} menit</strong> • Tahap: <strong style="color: ${stage.accentHex || '#4D7CFE'};">${stageName}</strong>`;
    }

    function setCustomStreakStartTime(newTimestamp) {
      if (!Number.isFinite(newTimestamp)) return false;
      const oldHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;
      state.streakStartTime = newTimestamp;
      const nowMs = Date.now();
      const isStartNow = Math.abs(newTimestamp - nowMs) < 60000;
      if (isStartNow) {
        state.isDayOne = true;
        state.lastPledgeDate = null;
        state.unlockedStageIds = [];
        state.longestStreakHours = 0;
      } else {
        state.isDayOne = false;
      }
      const breakdown = computeStreakBreakdown(state.streakStartTime, nowMs);
      if (Math.floor(breakdown.totalHours) > (state.longestStreakHours || 0)) {
        state.longestStreakHours = Math.floor(breakdown.totalHours);
      }
      saveState();
      renderAll();
      checkStageUnlocks(oldHours, breakdown.totalHours);
      return true;
    }

    // PIN Lock Overlay Handlers
    function clearPinErrorTimeout() {
      if (pinErrorTimeout) {
        clearTimeout(pinErrorTimeout);
        pinErrorTimeout = null;
      }
    }

    function lockAppWithPin() {
      clearPinErrorTimeout();
      enteredPinBuffer = '';
      updatePinDotsUI(false);
      const overlay = document.getElementById('pin-lock-overlay');
      if (overlay) overlay.classList.add('locked');
    }

    function handlePinKeyInput(key) {
      clearPinErrorTimeout();
      if (key === 'clear') {
        enteredPinBuffer = '';
        updatePinDotsUI(false);
        return;
      }
      if (key === 'del') {
        enteredPinBuffer = enteredPinBuffer.slice(0, -1);
        updatePinDotsUI(false);
        return;
      }
      if (/^\d$/.test(key) && enteredPinBuffer.length < 4) {
        enteredPinBuffer += key;
        updatePinDotsUI(false);

        if (enteredPinBuffer.length === 4) {
          const targetPin = isValidPin(state.pinCode) ? state.pinCode : '1234';
          if (enteredPinBuffer === targetPin) {
            const overlay = document.getElementById('pin-lock-overlay');
            if (overlay) overlay.classList.remove('locked');
            enteredPinBuffer = '';
            updatePinDotsUI(false);
            showToast('PIN Benar • Akses Kosmik Dibuka');
          } else {
            updatePinDotsUI(true);
            pinErrorTimeout = setTimeout(() => {
              pinErrorTimeout = null;
              enteredPinBuffer = '';
              updatePinDotsUI(false);
            }, 450);
          }
        }
      }
    }

    function updatePinDotsUI(isError) {
      const dots = document.querySelectorAll('#pin-dots-row .pin-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('filled', idx < enteredPinBuffer.length);
        dot.classList.toggle('error', Boolean(isError));
      });
    }

    // =======================================================================
    // 9. Navigation & Desktop Banner Updates
    // =======================================================================
    function switchTab(tabName) {
      activeTab = tabName;
      const wrapper = document.getElementById('phone-frame-wrapper');
      if (wrapper) wrapper.setAttribute('data-active-tab', tabName);

      document.querySelectorAll('.tab-screen').forEach((sec) => {
        sec.classList.toggle('active', sec.id === `screen-${tabName}`);
      });

      document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-tab-target') === tabName);
      });

      updateTabHeroBanner();
      renderAll();
    }

    function updateTabHeroBanner() {
      const cfg = TAB_HERO_BANNERS[activeTab] || TAB_HERO_BANNERS.home;
      const headingEl = document.getElementById('tab-hero-heading');
      const underlineEl = document.getElementById('tab-hero-underline');
      if (headingEl) {
        headingEl.innerHTML = state.stealthMode ? cfg.stealthHtml : cfg.titleHtml;
      }
      if (underlineEl) {
        underlineEl.style.background = cfg.color;
        underlineEl.style.boxShadow = `0 0 16px ${cfg.color}`;
      }
    }

    function renderAll() {
      renderEditionUI();
      renderHome();
      renderVault();
      renderRewire();
      renderStatistics();
      renderShield();
    }

    // =======================================================================
    // 10. Deep Cosmic Starfield Background & 60fps SOS / Orb Shader Animations
    // =======================================================================
    let handleWindowResize = null;

    // 18 Prana Stardust Motes for the 3D Cosmic Orb & SOS Breathing Shield
    const orbPlasmaMotes = Array.from({ length: 18 }, (_, i) => ({
      baseAngle: (i / 18) * Math.PI * 2,
      speed: 0.45 + (i % 4) * 0.18,
      radiusOffset: (i % 5) * 9,
      size: 1.4 + (i % 3) * 0.65,
      phase: i * 0.85
    }));

    // 64 Multi-Depth Parallax Stars + Shooting Star State for #phone-cosmos-canvas
    const phoneCosmosStars = Array.from({ length: 64 }, (_, i) => {
      const depth = (i % 3) + 1; // 1 = far, 2 = mid, 3 = near
      return {
        x: ((i * 61.7 + (i % 7) * 19.3) % 393),
        y: ((i * 113.3 + (i % 5) * 41.9) % 852),
        r: depth === 3 ? 1.35 : depth === 2 ? 0.95 : 0.65,
        baseAlpha: 0.16 + (depth * 0.12),
        speedY: -(0.14 * depth + (i % 4) * 0.04),
        speedX: ((i % 2 === 0 ? 1 : -1) * 0.03 * depth),
        twinkleFreq: 1.2 + (i % 5) * 0.45,
        phase: i * 0.9,
        hasHalo: i % 8 === 0
      };
    });

    const shootingStar = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      alpha: 0,
      nextSpawnTime: 1.8
    };

    function drawPhoneCosmosCanvas(timestamp) {
      const pCanvas = document.getElementById('phone-cosmos-canvas');
      if (!pCanvas || typeof pCanvas.getContext !== 'function') return;
      const pCtx = pCanvas.getContext('2d');
      if (!pCtx) return;

      const pw = 393;
      const ph = 852;
      if (pCanvas.width !== pw || pCanvas.height !== ph) {
        pCanvas.width = pw;
        pCanvas.height = ph;
      }

      const t = (Number(timestamp) || 0) * 0.001;
      pCtx.clearRect(0, 0, pw, ph);

      // 1. Living Volumetric Deep-Space Nebula Aurora Clouds
      const nebulaClouds = [
        {
          x: pw * (0.72 + 0.14 * Math.sin(t * 0.32)),
          y: ph * (0.44 + 0.1 * Math.cos(t * 0.25)),
          r: 230 + 20 * Math.sin(t * 0.6),
          color: sosActive ? 'rgba(56, 189, 248, 0.13)' : 'rgba(46, 76, 255, 0.12)'
        },
        {
          x: pw * (0.28 + 0.12 * Math.cos(t * 0.28 + 1.4)),
          y: ph * (0.26 + 0.09 * Math.sin(t * 0.35 + 0.8)),
          r: 195 + 16 * Math.cos(t * 0.5),
          color: sosActive ? 'rgba(34, 197, 94, 0.09)' : 'rgba(77, 124, 254, 0.08)'
        },
        {
          x: pw * (0.5 + 0.15 * Math.sin(t * 0.22 + 2.8)),
          y: ph * (0.76 + 0.08 * Math.cos(t * 0.3 + 2.1)),
          r: 210 + 18 * Math.sin(t * 0.45 + 1.0),
          color: activeTab === 'stats' ? 'rgba(139, 92, 246, 0.11)' : 'rgba(59, 82, 238, 0.07)'
        }
      ];

      nebulaClouds.forEach((nb) => {
        const grad = pCtx.createRadialGradient(nb.x, nb.y, 8, nb.x, nb.y, nb.r);
        grad.addColorStop(0, nb.color);
        grad.addColorStop(1, 'rgba(3, 4, 11, 0)');
        pCtx.fillStyle = grad;
        pCtx.beginPath();
        pCtx.arc(nb.x, nb.y, nb.r, 0, Math.PI * 2);
        pCtx.fill();
      });

      // 2. Multi-Layer Parallax Drifting Starfield
      const warpMult = sosActive ? 2.1 : 1.0;
      phoneCosmosStars.forEach((st) => {
        st.y += st.speedY * warpMult;
        st.x += st.speedX * warpMult;
        if (st.y < -4) st.y = ph + 4;
        if (st.x < -4) st.x = pw + 4;
        if (st.x > pw + 4) st.x = -4;

        const twinkle = 0.55 + 0.45 * Math.sin(t * st.twinkleFreq + st.phase);
        const alpha = Math.max(0.08, Math.min(0.85, st.baseAlpha * twinkle));

        if (st.hasHalo) {
          pCtx.save();
          pCtx.globalAlpha = alpha * 0.28;
          pCtx.fillStyle = '#4D7CFE';
          pCtx.beginPath();
          pCtx.arc(st.x, st.y, st.r * 3.2, 0, Math.PI * 2);
          pCtx.fill();
          pCtx.restore();
        }

        pCtx.save();
        pCtx.globalAlpha = alpha;
        pCtx.fillStyle = '#FFFFFF';
        pCtx.beginPath();
        pCtx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.restore();
      });

      // 3. Periodic Cosmic Shooting Star (Meteor)
      if (!shootingStar.active && t > shootingStar.nextSpawnTime) {
        shootingStar.active = true;
        shootingStar.x = 60 + ((t * 97) % 280);
        shootingStar.y = 40 + ((t * 53) % 240);
        shootingStar.vx = -4.8;
        shootingStar.vy = 3.4;
        shootingStar.alpha = 0.92;
      }

      if (shootingStar.active) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.alpha -= 0.022;

        if (shootingStar.alpha <= 0.02 || shootingStar.x < -40 || shootingStar.y > ph + 40) {
          shootingStar.active = false;
          shootingStar.nextSpawnTime = t + 3.2 + (t % 2.4);
        } else {
          pCtx.save();
          pCtx.globalAlpha = Math.max(0, Math.min(1, shootingStar.alpha));
          pCtx.strokeStyle = '#9BB8FF';
          pCtx.lineWidth = 1.4;
          pCtx.beginPath();
          pCtx.moveTo(shootingStar.x, shootingStar.y);
          pCtx.lineTo(shootingStar.x - shootingStar.vx * 8, shootingStar.y - shootingStar.vy * 8);
          pCtx.stroke();

          pCtx.fillStyle = '#FFFFFF';
          pCtx.beginPath();
          pCtx.arc(shootingStar.x, shootingStar.y, 1.6, 0, Math.PI * 2);
          pCtx.fill();
          pCtx.restore();
        }
      }
    }

    function drawSosOrbFx(timestamp) {
      const fxCanvas = document.getElementById('sos-orb-fx-canvas');
      const outerShell = document.getElementById('orb-outer-shell');
      const innerRing = document.getElementById('orb-inner-ring');
      if (!fxCanvas || typeof fxCanvas.getContext !== 'function') return;
      const fxCtx = fxCanvas.getContext('2d');
      if (!fxCtx) return;

      const cw = 340;
      const ch = 340;
      if (fxCanvas.width !== cw || fxCanvas.height !== ch) {
        fxCanvas.width = cw;
        fxCanvas.height = ch;
      }

      const cx = cw / 2;
      const cy = ch / 2;
      const t = (Number(timestamp) || 0) * 0.001;
      fxCtx.clearRect(0, 0, cw, ch);

      if (!sosActive) {
        // Normal Home Mode: Silky 60fps breathing scale + rotating shader light arcs
        const idleScale = 1 + 0.028 * Math.sin(t * 1.15);
        const innerIdleScale = 1 - 0.022 * Math.sin(t * 1.15 + 0.9);
        if (outerShell) {
          outerShell.style.transform = `translate3d(0, 0, 0) scale3d(${idleScale.toFixed(4)}, ${idleScale.toFixed(4)}, 1)`;
        }
        if (innerRing) {
          innerRing.style.transform = `translate3d(0, 0, 0) scale3d(${innerIdleScale.toFixed(4)}, ${innerIdleScale.toFixed(4)}, 1)`;
        }

        // Subtle rotating orbital shader arcs around the 3D orb
        fxCtx.save();
        fxCtx.translate(cx, cy);
        fxCtx.rotate(t * 0.35);
        fxCtx.strokeStyle = 'rgba(155, 184, 255, 0.28)';
        fxCtx.lineWidth = 1.5;
        fxCtx.beginPath();
        fxCtx.arc(0, 0, 128, -0.5, 1.15);
        fxCtx.stroke();

        fxCtx.rotate(-t * 0.65);
        fxCtx.strokeStyle = 'rgba(77, 124, 254, 0.24)';
        fxCtx.lineWidth = 1.2;
        fxCtx.beginPath();
        fxCtx.arc(0, 0, 146, 1.8, 3.3);
        fxCtx.stroke();
        fxCtx.restore();

        // Gently orbiting plasma motes
        orbPlasmaMotes.forEach((m, idx) => {
          const ang = m.baseAngle + t * m.speed * 0.55;
          const r = 118 + m.radiusOffset + Math.sin(t * 1.8 + m.phase) * 6;
          const mx = cx + Math.cos(ang) * r;
          const my = cy + Math.sin(ang) * r;
          fxCtx.save();
          fxCtx.globalAlpha = 0.25 + 0.35 * Math.sin(t * 2.4 + idx);
          fxCtx.fillStyle = idx % 2 === 0 ? '#9BB8FF' : '#FFFFFF';
          fxCtx.beginPath();
          fxCtx.arc(mx, my, m.size, 0, Math.PI * 2);
          fxCtx.fill();
          fxCtx.restore();
        });
        return;
      }

      // SOS 4-7-8 Breathing Mode: Locked 60fps/120fps Continuous Interpolation
      const elapsedMs = Math.max(0, getNowMs() - sosStartNowMs);
      const cycleSecExact = (elapsedMs / 1000) % 19;
      const discreteSec = Math.floor(cycleSecExact);
      if (discreteSec !== sosBreathCycleSec) {
        sosBreathCycleSec = discreteSec;
        updateBreathingStepUI();
      }

      let breathScale = 1.0;
      let phaseProgress = 0;
      let ringColor = '#4D7CFE';
      let particleDir = -1; // -1 = inward (inhale), 0 = orbit (hold), 1 = outward (exhale)

      if (cycleSecExact < 4) {
        // Inhale (0..4s): Smooth sine ease-in-out from 0.85 to 1.22
        phaseProgress = cycleSecExact / 4;
        const eased = 0.5 - 0.5 * Math.cos(phaseProgress * Math.PI);
        breathScale = 0.85 + eased * 0.37;
        ringColor = '#60A5FA';
        particleDir = -1;
      } else if (cycleSecExact < 11) {
        // Hold (4..11s): Living neural resonance heartbeat pulse around 1.22
        phaseProgress = (cycleSecExact - 4) / 7;
        breathScale = 1.22 + Math.sin((cycleSecExact - 4) * Math.PI * 1.6) * 0.035;
        ringColor = '#FBBF24';
        particleDir = 0;
      } else {
        // Exhale (11..19s): Smooth cosine ease-in-out contraction from 1.22 down to 0.85
        phaseProgress = (cycleSecExact - 11) / 8;
        const eased = 0.5 - 0.5 * Math.cos(phaseProgress * Math.PI);
        breathScale = 1.22 - eased * 0.37;
        ringColor = '#34D399';
        particleDir = 1;
      }

      if (outerShell) {
        outerShell.style.transform = `translate3d(0, 0, 0) scale3d(${breathScale.toFixed(4)}, ${breathScale.toFixed(4)}, 1)`;
      }
      if (innerRing) {
        const innerScale = 0.94 + (breathScale - 0.85) * 0.28;
        innerRing.style.transform = `translate3d(0, 0, 0) scale3d(${innerScale.toFixed(4)}, ${innerScale.toFixed(4)}, 1)`;
      }

      // 1. Harmonic Breathing Ripple Rings on #sos-orb-fx-canvas
      for (let w = 0; w < 2; w++) {
        const wavePhase = (phaseProgress + w * 0.5) % 1;
        const waveR =
          particleDir === -1
            ? 152 - wavePhase * 42
            : particleDir === 1
            ? 108 + wavePhase * 46
            : 128 + Math.sin(t * 4 + w * Math.PI) * 10;
        const waveAlpha = Math.sin(wavePhase * Math.PI) * 0.48;

        fxCtx.save();
        fxCtx.strokeStyle = ringColor;
        fxCtx.lineWidth = 1.8;
        fxCtx.globalAlpha = Math.max(0.05, Math.min(0.75, waveAlpha));
        fxCtx.beginPath();
        fxCtx.arc(cx, cy, waveR, 0, Math.PI * 2);
        fxCtx.stroke();
        fxCtx.restore();
      }

      // 2. High-Precision 60fps Circular Phase Progress Arc + Leading Comet Node
      const arcRadius = 114;
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + phaseProgress * Math.PI * 2;

      fxCtx.save();
      fxCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      fxCtx.lineWidth = 3.0;
      fxCtx.beginPath();
      fxCtx.arc(cx, cy, arcRadius, 0, Math.PI * 2);
      fxCtx.stroke();

      fxCtx.strokeStyle = ringColor;
      fxCtx.lineWidth = 3.5;
      fxCtx.beginPath();
      fxCtx.arc(cx, cy, arcRadius, startAngle, endAngle);
      fxCtx.stroke();

      // Leading glowing comet dot on progress ring
      const headX = cx + Math.cos(endAngle) * arcRadius;
      const headY = cy + Math.sin(endAngle) * arcRadius;
      fxCtx.fillStyle = '#FFFFFF';
      fxCtx.beginPath();
      fxCtx.arc(headX, headY, 4.2, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();

      // 3. Prana Stardust Particles (Inward on Inhale, Orbiting on Hold, Outward on Exhale)
      orbPlasmaMotes.forEach((m, idx) => {
        const ang = m.baseAngle + t * (particleDir === 0 ? 1.1 : 0.45);
        const radialFlow =
          particleDir === -1
            ? 154 - ((t * 38 + idx * 9) % 52)
            : particleDir === 1
            ? 102 + ((t * 34 + idx * 9) % 52)
            : 126 + Math.sin(t * 3.5 + m.phase) * 8;
        const px = cx + Math.cos(ang) * radialFlow;
        const py = cy + Math.sin(ang) * radialFlow;

        fxCtx.save();
        fxCtx.globalAlpha = 0.4 + 0.45 * Math.sin(t * 4 + idx);
        fxCtx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : ringColor;
        fxCtx.beginPath();
        fxCtx.arc(px, py, m.size * 1.25, 0, Math.PI * 2);
        fxCtx.fill();
        fxCtx.restore();
      });
    }

    function initStarfieldCanvas() {
      // Populate 72 static & softly twinkling 1px and 1.5px star particles across the #03040B phone canvas (opacity 0.12 to 0.55)
      const innerStarsEl = document.getElementById('phone-inner-stars');
      if (innerStarsEl && innerStarsEl.children.length === 0) {
        for (let i = 0; i < 72; i++) {
          const star = document.createElement('span');
          star.className = 'micro-star-particle';
          const sizePx = i % 3 === 0 ? 1.5 : 1;
          const xPct = ((i * 37.3 + (i % 7) * 11.7) % 98) + 1;
          const yPct = ((i * 53.1 + (i % 5) * 17.3) % 98) + 1;
          const minOp = (0.12 + ((i % 6) * 0.03)).toFixed(2);
          const maxOp = (0.28 + ((i % 7) * 0.045)).toFixed(2);
          const dur = (3.2 + (i % 6) * 0.75).toFixed(2);
          const delay = ((i % 9) * -0.6).toFixed(2);
          star.style.width = `${sizePx}px`;
          star.style.height = `${sizePx}px`;
          star.style.left = `${xPct.toFixed(1)}%`;
          star.style.top = `${yPct.toFixed(1)}%`;
          star.style.setProperty('--star-min-op', minOp);
          star.style.setProperty('--star-max-op', maxOp);
          star.style.setProperty('--twinkle-dur', `${dur}s`);
          star.style.setProperty('--twinkle-delay', `${delay}s`);
          innerStarsEl.appendChild(star);
        }
      }

      const canvas = document.getElementById('starfield-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const stars = Array.from({ length: 75 }, (_, idx) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: idx % 3 === 0 ? 0.75 : 0.5,
        alpha: Math.random() * 0.43 + 0.12,
        speedY: -(Math.random() * 0.18 + 0.05),
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        hue: '#FFFFFF'
      }));

      handleWindowResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleWindowResize);

      function animateFrame(timestamp) {
        ctx.clearRect(0, 0, width, height);
        stars.forEach((s) => {
          s.y += s.speedY;
          if (s.y < 0) s.y = height;
          const flicker = 0.55 + 0.45 * Math.sin(timestamp * s.twinkleSpeed);
          ctx.globalAlpha = s.alpha * flicker;
          ctx.fillStyle = s.hue;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        drawPhoneCosmosCanvas(timestamp);
        drawSosOrbFx(timestamp);
        drawSeed3DArtifact(timestamp);
        drawAudioVisualizer();
        starfieldRafId = requestAnimationFrame(animateFrame);
      }

      starfieldRafId = requestAnimationFrame(animateFrame);
    }

    // =======================================================================
    // 11. Event Listeners Setup
    // =======================================================================
    const handlePointerMove = (e) => {
      if (!isDraggingSeed || !e) return;
      const cxVal = Number.isFinite(e.clientX) ? e.clientX : Number.isFinite(e.pageX) ? e.pageX : null;
      const cyVal = Number.isFinite(e.clientY) ? e.clientY : Number.isFinite(e.pageY) ? e.pageY : null;
      if (cxVal === null || cyVal === null) return;

      const dx = cxVal - lastPointerX;
      const dy = cyVal - lastPointerY;
      lastPointerX = cxVal;
      lastPointerY = cyVal;
      const deltaY = dx * 0.012;
      const deltaX = dy * 0.012;
      seedRotY += deltaY;
      seedRotX = Math.max(-1.1, Math.min(1.1, seedRotX + deltaX));
      seedVelY = Math.max(-0.14, Math.min(0.14, deltaY * 0.65));
      seedVelX = Math.max(-0.08, Math.min(0.08, deltaX * 0.45));
    };

    const handlePointerUp = () => {
      isDraggingSeed = false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isDraggingSeed = false;
        cancelHoldPledge();
      } else {
        renderHome();
        renderShield();
        checkAndTriggerDailyReminder(Date.now());
      }
    };

    const handleServiceWorkerMessage = (event) => {
      const data = event && event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'DAILY_REMINDER_FIRED') {
        const todayStr = getTodayDateString(Date.now());
        if (state.lastReminderSentDate !== todayStr) {
          state.lastReminderSentDate = todayStr;
          saveState();
          renderShield();
          syncReminderWithServiceWorker(Date.now());
        }
      } else if (data.type === 'COMMIT_NOTIFICATION_CLICKED') {
        switchTab('home');
        const pledgeBtn = document.getElementById('btn-hold-pledge');
        if (pledgeBtn && typeof pledgeBtn.focus === 'function') {
          try {
            pledgeBtn.focus();
          } catch (e) {}
        }
      }
    };

    const handleGlobalKeyDown = (e) => {
      const pinOverlay = document.getElementById('pin-lock-overlay');
      if (pinOverlay && pinOverlay.classList.contains('locked')) {
        if (/^\d$/.test(e.key)) {
          e.preventDefault();
          handlePinKeyInput(e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          handlePinKeyInput('del');
        } else if (e.key === 'Escape' || e.key === 'Delete') {
          e.preventDefault();
          handlePinKeyInput('clear');
        }
        return;
      }

      if (e.key === 'Escape') {
        if (sosActive) closeSosMode();
        closeRelapseModal();
        closeGenesisWelcomeModal();
        closeStageUnlockModal();
      }
    };

    function bindEvents() {
      // Bottom Nav Tabs
      document.querySelectorAll('.nav-tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab-target');
          if (target) switchTab(target);
        });
      });

      // Cosmic Orb & SOS Button -> Open SOS Mode
      const orbEl = document.getElementById('cosmic-orb');
      const openSosBtn = document.getElementById('btn-open-sos');
      const closeSosBtn = document.getElementById('btn-close-sos');
      const shuffleBtn = document.getElementById('btn-shuffle-challenge');
      const victoryBtn = document.getElementById('btn-urge-victory');

      if (orbEl) {
        orbEl.addEventListener('click', () => {
          if (!sosActive) openSosMode();
        });
        orbEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!sosActive) openSosMode();
          }
        });
      }
      if (openSosBtn) openSosBtn.addEventListener('click', openSosMode);
      if (closeSosBtn) closeSosBtn.addEventListener('click', closeSosMode);
      if (shuffleBtn) shuffleBtn.addEventListener('click', shufflePhysicalChallenge);
      if (victoryBtn) victoryBtn.addEventListener('click', completeUrgeVictory);

      // Hold 3s Pledge Button
      const pledgeBtn = document.getElementById('btn-hold-pledge');
      if (pledgeBtn) {
        pledgeBtn.addEventListener('mousedown', startHoldPledge);
        pledgeBtn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          startHoldPledge(e);
        }, { passive: false });
        pledgeBtn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
        pledgeBtn.addEventListener('keydown', (e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            startHoldPledge(e);
          }
        });
        pledgeBtn.addEventListener('keyup', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            cancelHoldPledge();
          }
        });
        pledgeBtn.addEventListener('mouseleave', cancelHoldPledge);
        pledgeBtn.addEventListener('blur', cancelHoldPledge);
      }

      window.addEventListener('mouseup', cancelHoldPledge);
      window.addEventListener('touchend', cancelHoldPledge);
      window.addEventListener('touchcancel', cancelHoldPledge);
      window.addEventListener('blur', cancelHoldPledge);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('keydown', handleGlobalKeyDown);
      const swContainer = getServiceWorkerContainer();
      if (swContainer && typeof swContainer.addEventListener === 'function') {
        swContainer.addEventListener('message', handleServiceWorkerMessage);
      }

      // Relapse Modal
      const openRelapseBtn = document.getElementById('btn-open-relapse');
      const cancelRelapseBtn = document.getElementById('btn-cancel-relapse');
      const confirmRelapseBtn = document.getElementById('btn-confirm-relapse');

      if (openRelapseBtn) openRelapseBtn.addEventListener('click', openRelapseModal);
      if (cancelRelapseBtn) cancelRelapseBtn.addEventListener('click', closeRelapseModal);
      if (confirmRelapseBtn) confirmRelapseBtn.addEventListener('click', confirmRelapseReset);
      const relapseFullResetBtn = document.getElementById('btn-relapse-full-reset');
      if (relapseFullResetBtn) {
        relapseFullResetBtn.addEventListener('click', () => {
          simulateDayOneState(false);
          closeRelapseModal();
          showToast('Seluruh data berhasil di-reset ke 0 (Day 1 Genesis)!');
        });
      }

      document.querySelectorAll('#relapse-triggers-grid .trigger-select-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedRelapseTrigger = btn.getAttribute('data-trigger') || 'Larut Malam';
          document.querySelectorAll('#relapse-triggers-grid .trigger-select-btn').forEach((b) => {
            b.classList.toggle('selected', b === btn);
          });
        });
      });

      // Seed Vault Top Cycle / Step Buttons, Animation Modes, Energy Pulse & 3D Canvas Drag
      const vaultPrevBtn = document.getElementById('btn-vault-prev');
      const vaultStepPrevBtn = document.getElementById('btn-vault-step-prev');
      const vaultStepNextBtn = document.getElementById('btn-vault-step-next');
      const pulseSeedBtn = document.getElementById('btn-pulse-seed');

      if (vaultPrevBtn) {
        vaultPrevBtn.addEventListener('click', () => {
          state.selectedVaultStageIndex =
            (state.selectedVaultStageIndex + 1) % SEED_STAGES.length;
          seedPulseEnergy = 0.5;
          saveState();
          renderVault();
        });
      }
      if (vaultStepPrevBtn) {
        vaultStepPrevBtn.addEventListener('click', () => {
          state.selectedVaultStageIndex =
            (state.selectedVaultStageIndex - 1 + SEED_STAGES.length) % SEED_STAGES.length;
          seedPulseEnergy = 0.45;
          saveState();
          renderVault();
        });
      }
      if (vaultStepNextBtn) {
        vaultStepNextBtn.addEventListener('click', () => {
          state.selectedVaultStageIndex =
            (state.selectedVaultStageIndex + 1) % SEED_STAGES.length;
          seedPulseEnergy = 0.45;
          saveState();
          renderVault();
        });
      }
      if (pulseSeedBtn) {
        pulseSeedBtn.addEventListener('click', triggerSeedPulseBurst);
      }

      document.querySelectorAll('.seed-anim-mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-seed-anim') || 'orbit';
          state.seedAnimMode = mode;
          seedPulseEnergy = Math.max(seedPulseEnergy, 0.55);
          saveState();
          renderVault();
        });
      });

      const seedCanvas = document.getElementById('seed-3d-canvas');
      if (seedCanvas) {
        seedCanvas.addEventListener('pointerdown', (e) => {
          isDraggingSeed = true;
          seedVelY = 0;
          seedVelX = 0;
          lastPointerX = Number.isFinite(e.clientX) ? e.clientX : Number.isFinite(e.pageX) ? e.pageX : 0;
          lastPointerY = Number.isFinite(e.clientY) ? e.clientY : Number.isFinite(e.pageY) ? e.pageY : 0;
        });
      }
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);

      // Rewire Audio Tapes & Duration Controls
      const playTapeBtn = document.getElementById('btn-play-tape');
      if (playTapeBtn) {
        playTapeBtn.addEventListener('click', () => {
          if (isPlayingAudio) stopBinauralSynth();
          else startBinauralSynth();
        });
      }

      document.querySelectorAll('.tape-option-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tapeId = Number(btn.getAttribute('data-tape-id')) || 1;
          state.selectedTapeId = tapeId;
          audioRemainingSeconds = state.selectedTapeDurationMin * 60;
          saveState();
          if (isPlayingAudio) {
            startBinauralSynth();
          } else {
            renderRewire();
          }
        });
      });

      document.querySelectorAll('.duration-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mins = Number(btn.getAttribute('data-duration-min')) || 10;
          state.selectedTapeDurationMin = mins;
          audioRemainingSeconds = mins * 60;
          saveState();
          renderRewire();
        });
      });

      // Statistics Period Filter, Energy Check-in, Quick Urge Victory & Community Challenge Switcher
      document.querySelectorAll('#stats-period-pills .stats-period-pill').forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = btn.getAttribute('data-stats-period') || '7d';
          state.statsPeriod = p;
          saveState();
          renderStatistics();
        });
      });

      document.querySelectorAll('#energy-checkin-row .energy-lvl-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const lvl = Math.max(1, Math.min(5, Number(btn.getAttribute('data-energy-level')) || 4));
          if (!Array.isArray(state.energyHistory) || state.energyHistory.length !== 7) {
            state.energyHistory = state.isDayOne ? [null, null, null, null, null, null, null] : [4, 4, 3, 4, 3, 5, 4];
          }
          state.energyHistory[6] = lvl;
          saveState();
          renderStatistics();
          showToast(`Level Energi & Fokus hari ini dicatat: Level ${lvl}/5`);
        });
      });

      const quickUrgeBtn = document.getElementById('btn-stats-quick-urge');
      if (quickUrgeBtn) {
        quickUrgeBtn.addEventListener('click', () => {
          syncDailyRollover();
          state.xp += 25;
          state.urgesOvercomeToday += 1;
          state.totalUrgesOvercome += 1;
          state.lastUrgeDate = getTodayDateString();
          recordTodayUrgeNote();
          saveState();
          playVictoryChime();
          renderHome();
          renderStatistics();
          showToast('Kemenangan atas godaan berhasil dicatat di Statistik! (+25 XP)');
        });
      }

      const switchChallengeBtn = document.getElementById('btn-switch-challenge');
      if (switchChallengeBtn) {
        switchChallengeBtn.addEventListener('click', () => {
          state.activeChallengeIndex =
            (state.activeChallengeIndex + 1) % COMMUNITY_CHALLENGES.length;
          saveState();
          renderStatistics();
        });
      }

      // Shield & Privacy Controls
      const saveReasonBtn = document.getElementById('btn-save-reason');
      if (saveReasonBtn) {
        saveReasonBtn.addEventListener('click', () => {
          const reasonInput = document.getElementById('input-core-reason');
          if (!reasonInput) return;
          const trimmed = reasonInput.value.trim();
          if (!trimmed) {
            reasonInput.value = state.coreReason;
            showToast('Alasan utama tidak boleh kosong.');
            return;
          }
          state.coreReason = trimmed;
          saveState();
          renderHome();
          renderShield();
          showToast('"My Core Reason" berhasil disimpan ke localStorage!');
        });
      }

      // Daily Commit Reminder Controls
      const reminderSwitch = document.getElementById('switch-daily-reminder');
      const reminderTimeInput = document.getElementById('input-reminder-time');
      const saveReminderBtn = document.getElementById('btn-save-reminder');
      const testReminderBtn = document.getElementById('btn-test-reminder');

      if (reminderSwitch) {
        reminderSwitch.addEventListener('click', async () => {
          const rawTime =
            reminderTimeInput && reminderTimeInput.value
              ? reminderTimeInput.value.trim()
              : state.reminderTime;
          const safeTime = normalizeReminderTime(rawTime, state.reminderTime);
          const nextEnabled = !state.reminderEnabled;
          if (nextEnabled) {
            await requestNotificationPermission();
          }
          setDailyReminderConfig(nextEnabled, safeTime);
          showToast(
            nextEnabled
              ? `Pengingat Commit Harian diaktifkan setiap pukul ${state.reminderTime}!`
              : 'Pengingat Commit Harian dinonaktifkan.'
          );
        });
      }

      if (reminderTimeInput) {
        reminderTimeInput.addEventListener('change', () => {
          const rawVal = reminderTimeInput.value ? reminderTimeInput.value.trim() : '';
          if (isValidReminderTime(rawVal)) {
            setDailyReminderConfig(state.reminderEnabled, rawVal);
          }
        });
      }

      if (saveReminderBtn) {
        saveReminderBtn.addEventListener('click', async () => {
          const rawVal =
            reminderTimeInput && reminderTimeInput.value
              ? reminderTimeInput.value.trim()
              : '';
          if (!isValidReminderTime(rawVal)) {
            showToast('Format jam pengingat tidak valid (gunakan HH:mm, misal 07:00).');
            return;
          }
          await requestNotificationPermission();
          setDailyReminderConfig(true, rawVal);
          showToast(`Jadwal pengingat Commit harian disimpan untuk pukul ${state.reminderTime}!`);
        });
      }

      if (testReminderBtn) {
        testReminderBtn.addEventListener('click', async () => {
          await requestNotificationPermission();
          dispatchCommitNotification(buildCommitReminderPayload(state, Date.now()));
          renderShield();
        });
      }

      const stealthSwitch = document.getElementById('switch-stealth-mode');
      if (stealthSwitch) {
        stealthSwitch.addEventListener('click', () => {
          state.stealthMode = !state.stealthMode;
          saveState();
          renderAll();
          syncReminderWithServiceWorker();
          showToast(
            state.stealthMode
              ? 'Stealth Mode Aktif: Tampilan disamarkan menjadi ASTRAL.'
              : 'Stealth Mode Nonaktif: Kembali ke tampilan SEED.'
          );
        });
      }

      const pinSwitch = document.getElementById('switch-pin-enabled');
      const savePinBtn = document.getElementById('btn-save-pin');
      const lockNowBtn = document.getElementById('btn-lock-now');

      if (pinSwitch) {
        pinSwitch.addEventListener('click', () => {
          state.pinEnabled = !state.pinEnabled;
          saveState();
          renderShield();
          showToast(state.pinEnabled ? 'PIN Lock 4-Digit Diaktifkan' : 'PIN Lock Dinonaktifkan');
        });
      }

      if (savePinBtn) {
        savePinBtn.addEventListener('click', () => {
          const pinInput = document.getElementById('input-pin-code');
          const val = pinInput ? pinInput.value.trim() : '';
          if (!isValidPin(val)) {
            showToast('PIN harus terdiri dari tepat 4 angka (contoh: 1234).');
            return;
          }
          state.pinCode = val;
          state.pinEnabled = true;
          saveState();
          renderShield();
          showToast(`PIN 4-Digit berhasil disimpan!`);
        });
      }

      if (lockNowBtn) {
        lockNowBtn.addEventListener('click', () => {
          lockAppWithPin();
        });
      }

      document.querySelectorAll('#pin-keypad-grid .pin-key-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-pin-key');
          if (key) handlePinKeyInput(key);
        });
      });

      // Custom Streak Start Date & Time Handlers
      const streakDateTimeInput = document.getElementById('input-streak-start-datetime');
      const saveStreakStartBtn = document.getElementById('btn-save-streak-start');
      const setStreakNowBtn = document.getElementById('btn-set-streak-now');
      const setStreakYesterdayBtn = document.getElementById('btn-set-streak-yesterday');

      if (streakDateTimeInput) {
        streakDateTimeInput.addEventListener('input', () => {
          const val = streakDateTimeInput.value;
          const parsed = parseDateTimeLocal(val);
          if (parsed !== null) {
            updateStreakPreviewUI(parsed);
          } else {
            const previewTextEl = document.getElementById('streak-start-preview-text');
            if (previewTextEl) previewTextEl.textContent = 'Silakan pilih tanggal & jam yang valid.';
          }
        });
      }

      if (saveStreakStartBtn) {
        saveStreakStartBtn.addEventListener('click', () => {
          if (!streakDateTimeInput) return;
          const parsed = parseDateTimeLocal(streakDateTimeInput.value);
          if (parsed === null) {
            showToast('Format tanggal atau jam tidak valid.');
            return;
          }
          setCustomStreakStartTime(parsed);
          const nowMs = Date.now();
          if (parsed > nowMs) {
            showToast(`Waktu mulai streak dijadwalkan: ${formatIndonesianDateTime(parsed)} (dimulai otomatis).`);
          } else {
            const breakdown = computeStreakBreakdown(state.streakStartTime, nowMs);
            showToast(`Tanggal & jam mulai streak disimpan: ${breakdown.days}h ${breakdown.hours}j ${breakdown.minutes}m berjalan!`);
          }
        });
      }

      if (setStreakNowBtn) {
        setStreakNowBtn.addEventListener('click', () => {
          const nowMs = Date.now();
          if (streakDateTimeInput) {
            streakDateTimeInput.value = formatDateTimeLocal(nowMs);
          }
          simulateDayOneState(false);
          showToast('Waktu mulai streak & seluruh statistik di-reset ke sekarang (00:00:00).');
        });
      }

      if (setStreakYesterdayBtn) {
        setStreakYesterdayBtn.addEventListener('click', () => {
          const yesterdayMs = Date.now() - 86400000;
          if (streakDateTimeInput) {
            streakDateTimeInput.value = formatDateTimeLocal(yesterdayMs);
          }
          setCustomStreakStartTime(yesterdayMs);
          showToast('Waktu mulai diatur ke 24 jam lalu (1 Hari berjalan).');
        });
      }

      const dailyMinutesInput = document.getElementById('input-daily-minutes');
      if (dailyMinutesInput) {
        dailyMinutesInput.addEventListener('change', () => {
          const v = Math.max(5, Math.min(360, Number(dailyMinutesInput.value) || 21));
          state.dailyWastedMinutes = v;
          saveState();
          renderStatistics();
          showToast(`Estimasi waktu harian diperbarui (${v} menit/hari).`);
        });
      }

      const simulateDay1Btn = document.getElementById('btn-simulate-day1');
      if (simulateDay1Btn) {
        simulateDay1Btn.addEventListener('click', () => {
          document.querySelectorAll('[data-preset-streak]').forEach((c) => c.classList.remove('active'));
          const day1Chip = document.getElementById('chip-preset-day1');
          if (day1Chip) day1Chip.classList.add('active');
          simulateDayOneState(true);
        });
      }

      const resetAllZeroBtn = document.getElementById('btn-reset-all-zero');
      if (resetAllZeroBtn) {
        resetAllZeroBtn.addEventListener('click', () => {
          document.querySelectorAll('[data-preset-streak]').forEach((c) => c.classList.remove('active'));
          const day1Chip = document.getElementById('chip-preset-day1');
          if (day1Chip) day1Chip.classList.add('active');
          simulateDayOneState(false);
          showToast('Seluruh data berhasil di-reset ke 0 (Day 1 Genesis)!');
        });
      }

      const startGenesisBtn = document.getElementById('btn-start-genesis');
      if (startGenesisBtn) {
        startGenesisBtn.addEventListener('click', () => {
          closeGenesisWelcomeModal();
          playVictoryChime();
          switchTab('home');
          showToast('Inisiasi Dimulai! Timer Day One berjalan live.');
        });
      }

      // Desktop Showcase Preset Streak Buttons & Frame Toggle
      document.querySelectorAll('[data-preset-streak]').forEach((chip) => {
        chip.addEventListener('click', () => {
          if (currentEdition === 'release') return;
          const preset = chip.getAttribute('data-preset-streak');
          document.querySelectorAll('[data-preset-streak]').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');

          const oldHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;

          if (preset === 'ref') {
            state.streakStartTime = Date.now() - REF_STREAK_OFFSET_MS;
            state.selectedVaultStageIndex = 0;
            state.isDayOne = false;
            const defState = createDefaultState(Date.now());
            state.energyHistory = defState.energyHistory;
            state.sevenDays = defState.sevenDays;
            state.longestStreakHours = defState.longestStreakHours;
            state.totalUrgesOvercome = defState.totalUrgesOvercome;
            state.xp = defState.xp;
            state.triggers = defState.triggers;
            state.timeVulnerability = defState.timeVulnerability;
          } else if (preset === 'day1') {
            simulateDayOneState(true);
            return;
          } else {
            const days = Number(preset) || 1;
            state.streakStartTime = Date.now() - (days * 86400 * 1000 + 15000);
            state.isDayOne = false;
            const matchingIdx = SEED_STAGES.findIndex((s) => Math.round(s.hoursRequired / 24) === days);
            if (matchingIdx >= 0) {
              state.selectedVaultStageIndex = matchingIdx;
            }
          }
          const newHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;
          seedPulseEnergy = 0.65;
          saveState();
          renderAll();
          checkStageUnlocks(oldHours, newHours);
          showToast(`Simulasi Streak diatur ke preset: ${chip.textContent}`);
        });
      });

      const claimUnlockXpBtn = document.getElementById('btn-claim-unlock-xp');
      if (claimUnlockXpBtn) {
        claimUnlockXpBtn.addEventListener('click', () => {
          const stage = currentlyCelebratedStage || SEED_STAGES[state.selectedVaultStageIndex || 0];
          const idx = SEED_STAGES.indexOf(stage);
          claimStageUnlockReward(stage, idx >= 0 ? idx : state.selectedVaultStageIndex || 0);
        });
      }

      const closeUnlockModalBtn = document.getElementById('btn-close-stage-unlocked');
      if (closeUnlockModalBtn) {
        closeUnlockModalBtn.addEventListener('click', () => {
          closeStageUnlockModal();
        });
      }

      const unlockModal = document.getElementById('modal-stage-unlocked');
      if (unlockModal) {
        unlockModal.addEventListener('click', (e) => {
          if (e.target === unlockModal) {
            closeStageUnlockModal();
          }
        });
      }

      const toggleFrameBtn = document.getElementById('btn-toggle-frame');
      if (toggleFrameBtn) {
        toggleFrameBtn.addEventListener('click', () => {
          document.body.classList.toggle('fullscreen-mobile-mode');
        });
      }

      // PWA Install Button Handler
      let deferredInstallPrompt = null;
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault();
          deferredInstallPrompt = e;
          const btn = document.getElementById('btn-install-pwa');
          if (btn) {
            btn.textContent = 'Pasang ke HP Sekarang';
          }
        });

        window.addEventListener('appinstalled', () => {
          deferredInstallPrompt = null;
          showToast('Aplikasi SEED berhasil terpasang di HP Master!');
        });
      }

      const btnInstallPwa = document.getElementById('btn-install-pwa');
      if (btnInstallPwa) {
        btnInstallPwa.addEventListener('click', async () => {
          if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            try {
              const res = await deferredInstallPrompt.userChoice;
              if (res && res.outcome === 'accepted') {
                showToast('Memasang SEED ke Layar Utama...');
              }
            } catch (err) {}
            deferredInstallPrompt = null;
          } else {
            showToast('Di Chrome HP: Ketuk menu kanan atas lalu Tambahkan ke Layar Utama');
          }
        });
      }
    }

    // Start live 1-second ticker for Home Streak Timer & Daily Commit Reminder
    bindEvents();
    renderAll();
    initStarfieldCanvas();

    if (state.pinEnabled) {
      lockAppWithPin();
    }

    lastTickerHours = computeStreakBreakdown(state.streakStartTime, Date.now()).totalHours;
    const homeTickerInterval = setInterval(() => {
      renderHome();
      const nowMs = Date.now();
      const currentHours = computeStreakBreakdown(state.streakStartTime, nowMs).totalHours;
      if (currentHours > lastTickerHours) {
        checkStageUnlocks(lastTickerHours, currentHours);
      }
      lastTickerHours = currentHours;
      checkAndTriggerDailyReminder(nowMs);
    }, 1000);

    function destroy() {
      clearInterval(homeTickerInterval);
      stopFireworksEffect();
      if (sosIntervalId) clearInterval(sosIntervalId);
      if (audioTimerInterval) clearInterval(audioTimerInterval);
      if (toastTimeout) clearTimeout(toastTimeout);
      if (pulseBurstTimeout) clearTimeout(pulseBurstTimeout);
      if (secondPulseTimeout) clearTimeout(secondPulseTimeout);
      clearPinErrorTimeout();
      if (holdRafId) {
        cancelAnimationFrame(holdRafId);
        holdRafId = null;
      }
      if (starfieldRafId) {
        cancelAnimationFrame(starfieldRafId);
        starfieldRafId = null;
      }
      stopOscillatorsOnly();
      window.removeEventListener('mouseup', cancelHoldPledge);
      window.removeEventListener('touchend', cancelHoldPledge);
      window.removeEventListener('touchcancel', cancelHoldPledge);
      window.removeEventListener('blur', cancelHoldPledge);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      const swContainer = getServiceWorkerContainer();
      if (swContainer && typeof swContainer.removeEventListener === 'function') {
        swContainer.removeEventListener('message', handleServiceWorkerMessage);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      if (handleWindowResize) {
        window.removeEventListener('resize', handleWindowResize);
      }
    }

    const initialSw = getServiceWorkerContainer();
    if (
      initialSw &&
      typeof location !== 'undefined' &&
      (location.protocol === 'http:' || location.protocol === 'https:')
    ) {
      let swRefreshing = false;
      if (typeof initialSw.addEventListener === 'function') {
        initialSw.addEventListener('controllerchange', () => {
          if (swRefreshing) return;
          swRefreshing = true;
          if (typeof location.reload === 'function') {
            location.reload();
          }
        });
      }
      if (typeof initialSw.register === 'function') {
        initialSw
          .register('./sw.js')
          .then((reg) => {
            if (reg && typeof reg.update === 'function') {
              reg.update().catch(() => {});
            }
            syncReminderWithServiceWorker();
          })
          .catch(() => {});
      }
    }

    return {
      getState: () => state,
      getEdition: () => currentEdition,
      getActiveEdition: () => currentEdition,
      getActiveStorageKey: () => getActiveStorageKey(currentEdition),
      switchAppEdition,
      renderEditionUI,
      renderAll,
      switchTab,
      openSosMode,
      closeSosMode,
      startHoldPledge,
      cancelHoldPledge,
      completeDailyPledge,
      confirmRelapseReset,
      completeUrgeVictory,
      shufflePhysicalChallenge,
      triggerSeedPulseBurst,
      drawSeed3DArtifact,
      drawPhoneCosmosCanvas,
      drawSosOrbFx,
      renderVault,
      checkStageUnlocks,
      triggerStageUnlockCelebration,
      claimStageUnlockReward,
      closeStageUnlockModal,
      handlePinKeyInput,
      lockAppWithPin,
      startBinauralSynth,
      stopBinauralSynth,
      tickAudioSecond,
      simulateDayOne: () => simulateDayOneState(true),
      openGenesisWelcomeModal,
      closeGenesisWelcomeModal,
      sanitizeLoadedState,
      setCustomStreakStartTime,
      updateStreakPreviewUI,
      updateSystemClock,
      setDailyReminderConfig,
      checkAndTriggerDailyReminder,
      dispatchCommitNotification,
      requestNotificationPermission,
      syncReminderWithServiceWorker,
      handleServiceWorkerMessage,
      formatDateTimeLocal,
      parseDateTimeLocal,
      formatIndonesianDateTime,
      getTodayDateString,
      buildAlignedSevenDays,
      destroy
    };
  }

  // =========================================================================
  // Official Install Website Controller (Runs when `#install-web-root` exists)
  // =========================================================================
  function initInstallPage() {
    if (typeof document === 'undefined' || !document.getElementById('install-web-root')) {
      return null;
    }

    const initialSearch =
      typeof location !== 'undefined' && typeof location.search === 'string'
        ? location.search
        : '';
    let selectedEdition = /(?:edition|mode|app)=(?:demo|sandbox|showcase)/i.test(initialSearch)
      ? 'demo'
      : 'release';
    let activeFilter = 'all';
    let deferredInstallPrompt = null;
    let installToastTimeout = null;
    let installStarfieldRaf = null;
    let previewAudioCtx = null;
    let previewLeftOsc = null;
    let previewRightOsc = null;
    let isPlayingPreviewTape = false;

    function showInstallToast(message) {
      const toastEl = document.getElementById('install-portal-toast');
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.classList.add('visible');
      if (installToastTimeout) clearTimeout(installToastTimeout);
      installToastTimeout = setTimeout(() => {
        toastEl.classList.remove('visible');
      }, 2800);
    }

    function ensureEditionStorageInitialized(edition) {
      const safeEd = edition === 'demo' ? 'demo' : 'release';
      const storageKey = safeEd === 'release' ? RELEASE_STORAGE_KEY : STORAGE_KEY;
      try {
        const existing = localStorage.getItem(storageKey);
        if (!existing) {
          const initial = safeEd === 'release' ? createDayOneState(Date.now()) : createDefaultState(Date.now());
          localStorage.setItem(storageKey, JSON.stringify(initial));
        }
      } catch (e) {}
    }

    function updateInstallLivePreviews() {
      const nowMs = Date.now();

      // 1. Release Edition Live Preview
      const relTimerEl = document.getElementById('release-live-timer-preview');
      const relMetaEl = document.getElementById('release-live-meta-preview');
      try {
        const rawRel = localStorage.getItem(RELEASE_STORAGE_KEY);
        if (rawRel) {
          const parsedRel = JSON.parse(rawRel);
          const b = computeStreakBreakdown(parsedRel.streakStartTime, nowMs);
          if (relTimerEl) {
            relTimerEl.textContent = `${b.days}d : ${String(b.hours).padStart(2, '0')}h : ${String(b.minutes).padStart(2, '0')}m : ${String(b.seconds).padStart(2, '0')}s`;
          }
          if (relMetaEl) {
            relMetaEl.textContent = `Streak Pribadi Aktif (${Number(parsedRel.xp) || 0} XP • ${Number(parsedRel.totalUrgesOvercome) || 0} Godaan Ditolak • Vault Pribadi)`;
          }
        } else {
          if (relTimerEl) relTimerEl.textContent = '0d : 00h : 00m : 00s';
          if (relMetaEl) {
            relMetaEl.textContent = 'Siap dimulai bersih dari Hari ke-1 (0 XP • 0 Godaan • Penyimpanan Terisolasi)';
          }
        }
      } catch (e) {}

      // 2. Demo Edition Live Preview & Poster 1 Live Timer
      const demoTimerEl = document.getElementById('demo-live-timer-preview');
      const demoMetaEl = document.getElementById('demo-live-meta-preview');
      let demoBreakdown = computeStreakBreakdown(nowMs - REF_STREAK_OFFSET_MS, nowMs);
      let demoXp = 150;
      try {
        const rawDemo = localStorage.getItem(STORAGE_KEY);
        if (rawDemo) {
          const parsedDemo = JSON.parse(rawDemo);
          demoBreakdown = computeStreakBreakdown(parsedDemo.streakStartTime, nowMs);
          demoXp = Number.isFinite(Number(parsedDemo.xp)) ? Number(parsedDemo.xp) : 150;
        }
      } catch (e) {}

      if (demoTimerEl) {
        demoTimerEl.textContent = `${demoBreakdown.days}d : ${String(demoBreakdown.hours).padStart(2, '0')}h : ${String(demoBreakdown.minutes).padStart(2, '0')}m : ${String(demoBreakdown.seconds).padStart(2, '0')}s`;
      }
      if (demoMetaEl) {
        demoMetaEl.textContent = `Data Referensi Aktif (${demoXp} XP • 52m Dihemat • 29% Peningkatan • Simulator 24h–90d)`;
      }

      const pDays = document.getElementById('poster-timer-days');
      const pHours = document.getElementById('poster-timer-hours');
      const pMins = document.getElementById('poster-timer-minutes');
      const pSecs = document.getElementById('poster-timer-seconds');
      if (pDays) pDays.textContent = String(demoBreakdown.days);
      if (pHours) pHours.textContent = String(demoBreakdown.hours);
      if (pMins) pMins.textContent = String(demoBreakdown.minutes);
      if (pSecs) pSecs.textContent = String(demoBreakdown.seconds);
    }

    function setEditionFilter(filterVal) {
      activeFilter = ['all', 'release', 'demo'].includes(filterVal) ? filterVal : 'all';
      document.querySelectorAll('#edition-filter-tabs [data-edition-filter]').forEach((btn) => {
        const isMatch = btn.getAttribute('data-edition-filter') === activeFilter;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });

      document.querySelectorAll('[data-edition-card]').forEach((card) => {
        const cardEd = card.getAttribute('data-edition-card');
        const shouldShow = activeFilter === 'all' || activeFilter === cardEd;
        card.classList.toggle('hidden-by-filter', !shouldShow);
      });
      return activeFilter;
    }

    function selectInstallEdition(edition) {
      selectedEdition = edition === 'demo' ? 'demo' : 'release';
      const cfg = APP_EDITIONS[selectedEdition];

      if (document.body) {
        document.body.setAttribute('data-selected-edition', selectedEdition);
      }

      try {
        localStorage.setItem(EDITION_STORAGE_KEY, selectedEdition);
      } catch (e) {}

      ensureEditionStorageInitialized(selectedEdition);

      const manifestLink = document.getElementById('install-manifest-link');
      if (manifestLink) {
        manifestLink.setAttribute('href', cfg.manifestHref);
      }

      const badgeEl = document.getElementById('install-modal-badge');
      const titleEl = document.getElementById('install-modal-title');
      const descEl = document.getElementById('install-modal-desc');
      const manifestNameEl = document.getElementById('install-modal-manifest-name');
      const storageNameEl = document.getElementById('install-modal-storage-name');
      const startModeEl = document.getElementById('install-modal-start-mode');
      const openAppLink = document.getElementById('btn-modal-open-app');

      if (badgeEl) {
        badgeEl.textContent = cfg.shortBadge;
        badgeEl.className = `edition-tag-pill ${selectedEdition === 'release' ? 'tag-release' : 'tag-demo'}`;
      }
      if (titleEl) titleEl.textContent = `Siap Memasang ${cfg.name}`;
      if (descEl) descEl.textContent = cfg.description;
      if (manifestNameEl) manifestNameEl.textContent = cfg.manifestHref;
      if (storageNameEl) storageNameEl.textContent = cfg.storageKey;
      if (startModeEl) startModeEl.textContent = cfg.startModeLabel;
      if (openAppLink) {
        openAppLink.setAttribute('href', cfg.startUrl);
        openAppLink.textContent = `Buka & Jalankan ${cfg.name} Sekarang`;
      }

      updateInstallLivePreviews();
      return selectedEdition;
    }

    function openInstallWizard(edition) {
      selectInstallEdition(edition);
      const modal = document.getElementById('install-wizard-modal');
      if (modal) {
        modal.classList.add('open');
      }
      showInstallToast(`Konfigurasi ${APP_EDITIONS[selectedEdition].name} siap dipasang!`);
    }

    function closeInstallWizard() {
      const modal = document.getElementById('install-wizard-modal');
      if (modal) {
        modal.classList.remove('open');
      }
    }

    function triggerInstallerDownload(edition) {
      const safeEd = selectInstallEdition(edition);
      const cfg = APP_EDITIONS[safeEd];
      const baseHref =
        typeof location !== 'undefined' &&
        typeof location.origin === 'string' &&
        /^https?:/i.test(location.protocol || '')
          ? `${location.origin}${String(location.pathname || '/').replace(/\/(?:install|boost|download)\/?$/i, '/').replace(/\/[^/]*$/, '/')}`
          : './';
      const htmlContent = buildStandaloneInstallerHtml(safeEd, baseHref);

      try {
        const urlApi =
          typeof window !== 'undefined' && window.URL && typeof window.URL.createObjectURL === 'function'
            ? window.URL
            : typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
            ? URL
            : null;
        if (typeof Blob !== 'undefined' && urlApi) {
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const blobUrl = urlApi.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = cfg.installerFilename;
          document.body.appendChild(a);
          const navObj =
            typeof window !== 'undefined' && window.navigator
              ? window.navigator
              : typeof navigator !== 'undefined'
              ? navigator
              : null;
          const isJsdom = Boolean(navObj && /jsdom/i.test(navObj.userAgent || ''));
          if (!isJsdom) {
            a.click();
          }
          document.body.removeChild(a);
          setTimeout(() => {
            if (typeof urlApi.revokeObjectURL === 'function') {
              urlApi.revokeObjectURL(blobUrl);
            }
          }, 1500);
        }
      } catch (e) {}

      showInstallToast(`File installer ${cfg.installerFilename} berhasil disiapkan!`);
      return {
        filename: cfg.installerFilename,
        edition: safeEd,
        htmlContent
      };
    }

    function resetReleaseToFresh() {
      const fresh = createDayOneState(Date.now());
      try {
        localStorage.setItem(RELEASE_STORAGE_KEY, JSON.stringify(fresh));
      } catch (e) {}
      updateInstallLivePreviews();
      showInstallToast('Data SEED Versi Rilis berhasil di-reset bersih ke 00:00:00 (Day 1)!');
      return fresh;
    }

    function resetDemoToDefault() {
      const def = createDefaultState(Date.now());
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
      } catch (e) {}
      updateInstallLivePreviews();
      showInstallToast('Data SEED Versi Demo dikembalikan ke state referensi (2d 12h 42m 23s)!');
      return def;
    }

    function stopPosterPreviewAudio() {
      if (previewLeftOsc) {
        try { previewLeftOsc.stop(); previewLeftOsc.disconnect(); } catch (e) {}
        previewLeftOsc = null;
      }
      if (previewRightOsc) {
        try { previewRightOsc.stop(); previewRightOsc.disconnect(); } catch (e) {}
        previewRightOsc = null;
      }
      isPlayingPreviewTape = false;
      const playBtn = document.getElementById('btn-poster-play-tape');
      const playIcon = document.getElementById('poster-play-icon');
      const playLabel = document.getElementById('poster-play-label');
      if (playBtn) playBtn.setAttribute('aria-pressed', 'false');
      if (playIcon) playIcon.textContent = '▶';
      if (playLabel) playLabel.textContent = 'Play Tape 1';
    }

    function togglePosterPreviewAudio() {
      if (isPlayingPreviewTape) {
        stopPosterPreviewAudio();
        showInstallToast('Pratinjau Audio Binaural Tape 1 dihentikan.');
        return false;
      }
      const AudioContextClass =
        (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null;
      if (!AudioContextClass) {
        showInstallToast('Audio Binaural 10Hz Alpha siap di dalam aplikasi.');
        return false;
      }
      try {
        if (!previewAudioCtx) {
          previewAudioCtx = new AudioContextClass();
        }
        if (previewAudioCtx.state === 'suspended' && typeof previewAudioCtx.resume === 'function') {
          previewAudioCtx.resume();
        }
        const gain = previewAudioCtx.createGain();
        gain.gain.setValueAtTime(0.08, previewAudioCtx.currentTime);
        gain.connect(previewAudioCtx.destination);

        previewLeftOsc = previewAudioCtx.createOscillator();
        previewRightOsc = previewAudioCtx.createOscillator();
        previewLeftOsc.type = 'sine';
        previewRightOsc.type = 'sine';
        previewLeftOsc.frequency.setValueAtTime(200, previewAudioCtx.currentTime);
        previewRightOsc.frequency.setValueAtTime(210, previewAudioCtx.currentTime);

        if (typeof previewAudioCtx.createStereoPanner === 'function') {
          const panL = previewAudioCtx.createStereoPanner();
          const panR = previewAudioCtx.createStereoPanner();
          panL.pan.setValueAtTime(-0.8, previewAudioCtx.currentTime);
          panR.pan.setValueAtTime(0.8, previewAudioCtx.currentTime);
          previewLeftOsc.connect(panL);
          previewRightOsc.connect(panR);
          panL.connect(gain);
          panR.connect(gain);
        } else {
          previewLeftOsc.connect(gain);
          previewRightOsc.connect(gain);
        }

        previewLeftOsc.start();
        previewRightOsc.start();
        isPlayingPreviewTape = true;

        const playBtn = document.getElementById('btn-poster-play-tape');
        const playIcon = document.getElementById('poster-play-icon');
        const playLabel = document.getElementById('poster-play-label');
        if (playBtn) playBtn.setAttribute('aria-pressed', 'true');
        if (playIcon) playIcon.textContent = '■';
        if (playLabel) playLabel.textContent = 'Stop Tape 1 (10Hz Alpha)';
        showInstallToast('Memutar Pratinjau Tape 1: 10Hz Alpha Binaural Reset (200Hz / 210Hz)');
        return true;
      } catch (e) {
        return false;
      }
    }

    function drawInstallSeedPreview(timestamp) {
      const seedCanvas = document.getElementById('install-seed-canvas');
      if (!seedCanvas || typeof seedCanvas.getContext !== 'function') return;
      const ctx = seedCanvas.getContext('2d');
      if (!ctx) return;

      const w = 180;
      const h = 180;
      const cx = w / 2;
      const cy = h / 2;
      const t = (Number(timestamp) || 0) * 0.001;

      ctx.clearRect(0, 0, w, h);

      // Ambient cosmic blue-silver halo matching Reference Image 1 Panel 3
      const halo = ctx.createRadialGradient(cx, cy, 8, cx, cy, 82);
      halo.addColorStop(0, 'rgba(77, 124, 254, 0.28)');
      halo.addColorStop(0.6, 'rgba(59, 91, 255, 0.08)');
      halo.addColorStop(1, 'rgba(3, 4, 11, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, 82, 0, Math.PI * 2);
      ctx.fill();

      // Sculpted 3D Asteroid Origin Seed sphere with organic bumpy silhouette
      const baseR = 46;
      const bodyGrad = ctx.createRadialGradient(cx - 14, cy - 16, 5, cx, cy, baseR + 4);
      bodyGrad.addColorStop(0, '#FFFFFF');
      bodyGrad.addColorStop(0.38, '#E2E8F0');
      bodyGrad.addColorStop(0.75, '#94A3B8');
      bodyGrad.addColorStop(1, '#334155');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      const lobes = 28;
      for (let i = 0; i <= lobes; i++) {
        const theta = (i / lobes) * Math.PI * 2;
        const bump =
          Math.sin(theta * 5 + t * 0.8) * 2.1 +
          Math.cos(theta * 8 - t * 0.5) * 1.4;
        const r = baseR + bump;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Rotating 3D surface craters with rim highlights & inner shadows
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + t * 0.45;
        const ring = i % 3 === 0 ? 13 : i % 3 === 1 ? 25 : 34;
        const crX = cx + Math.cos(angle) * ring * 0.92;
        const crY = cy + Math.sin(angle * 0.9 + 0.4) * ring * 0.78;
        const crR = 3.6 + (i % 3) * 2.1;

        // Crater rim highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
        ctx.beginPath();
        ctx.arc(crX - 0.9, crY - 0.9, crR + 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Crater recessed basin
        ctx.fillStyle = 'rgba(51, 65, 85, 0.45)';
        ctx.beginPath();
        ctx.arc(crX + 0.6, crY + 0.6, crR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initInstallStarfield() {
      const sCanvas = document.getElementById('install-starfield-canvas');
      if (!sCanvas || typeof sCanvas.getContext !== 'function') return;
      const ctx = sCanvas.getContext('2d');
      if (!ctx) return;

      const w = (sCanvas.width = typeof window !== 'undefined' ? window.innerWidth || 1024 : 1024);
      const h = (sCanvas.height = typeof window !== 'undefined' ? window.innerHeight || 768 : 768);

      const stars = Array.from({ length: 70 }, (_, i) => ({
        x: ((i * 97.3) % w),
        y: ((i * 137.7) % h),
        r: i % 3 === 0 ? 1.4 : 0.9,
        alpha: 0.18 + (i % 5) * 0.1
      }));

      function step(ts) {
        ctx.clearRect(0, 0, w, h);
        stars.forEach((st, idx) => {
          const tw = 0.55 + 0.45 * Math.sin((Number(ts) || 0) * 0.002 + idx);
          ctx.globalAlpha = st.alpha * tw;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        drawInstallSeedPreview(ts);
        installStarfieldRaf = requestAnimationFrame(step);
      }
      installStarfieldRaf = requestAnimationFrame(step);
    }

    // Bind Install Page Events
    document.querySelectorAll('#edition-filter-tabs [data-edition-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setEditionFilter(btn.getAttribute('data-edition-filter') || 'all');
      });
    });

    const installReleaseBtn = document.getElementById('btn-install-release');
    const heroInstallReleaseBtn = document.getElementById('btn-hero-install-release');
    const installDemoBtn = document.getElementById('btn-install-demo');
    const heroInstallDemoBtn = document.getElementById('btn-hero-install-demo');

    if (installReleaseBtn) {
      installReleaseBtn.addEventListener('click', () => openInstallWizard('release'));
    }
    if (heroInstallReleaseBtn) {
      heroInstallReleaseBtn.addEventListener('click', () => openInstallWizard('release'));
    }
    if (installDemoBtn) {
      installDemoBtn.addEventListener('click', () => openInstallWizard('demo'));
    }
    if (heroInstallDemoBtn) {
      heroInstallDemoBtn.addEventListener('click', () => openInstallWizard('demo'));
    }

    const downloadReleaseBtn = document.getElementById('btn-download-release');
    const downloadDemoBtn = document.getElementById('btn-download-demo');
    const modalDownloadBtn = document.getElementById('btn-modal-download-file');

    if (downloadReleaseBtn) {
      downloadReleaseBtn.addEventListener('click', () => triggerInstallerDownload('release'));
    }
    if (downloadDemoBtn) {
      downloadDemoBtn.addEventListener('click', () => triggerInstallerDownload('demo'));
    }
    if (modalDownloadBtn) {
      modalDownloadBtn.addEventListener('click', () => triggerInstallerDownload(selectedEdition));
    }

    const resetReleaseBtn = document.getElementById('btn-reset-release-fresh');
    const resetDemoBtn = document.getElementById('btn-reset-demo-default');
    if (resetReleaseBtn) {
      resetReleaseBtn.addEventListener('click', resetReleaseToFresh);
    }
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', resetDemoToDefault);
    }

    const closeInstallModalBtn = document.getElementById('btn-close-install-modal');
    if (closeInstallModalBtn) {
      closeInstallModalBtn.addEventListener('click', closeInstallWizard);
    }

    const wizardModalBackdrop = document.getElementById('install-wizard-modal');
    if (wizardModalBackdrop) {
      wizardModalBackdrop.addEventListener('click', (e) => {
        if (e.target === wizardModalBackdrop) {
          closeInstallWizard();
        }
      });
    }

    const posterPlayBtn = document.getElementById('btn-poster-play-tape');
    if (posterPlayBtn) {
      posterPlayBtn.addEventListener('click', togglePosterPreviewAudio);
    }

    function handleInstallKeyDown(e) {
      if (e && e.key === 'Escape') {
        closeInstallWizard();
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleInstallKeyDown);
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
      });
    }

    const modalTriggerPwaBtn = document.getElementById('btn-modal-trigger-pwa');
    if (modalTriggerPwaBtn) {
      modalTriggerPwaBtn.addEventListener('click', async () => {
        ensureEditionStorageInitialized(selectedEdition);
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          try {
            const choice = await deferredInstallPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') {
              showInstallToast(`Memasang ${APP_EDITIONS[selectedEdition].name} ke Layar Utama...`);
            }
          } catch (e) {}
          deferredInstallPrompt = null;
        } else {
          showInstallToast(
            `Siap dipasang! Ketuk menu browser lalu pilih Tambahkan ke Layar Utama, atau klik Buka Aplikasi Sekarang.`
          );
        }
      });
    }

    updateInstallLivePreviews();
    drawInstallSeedPreview(1000);
    initInstallStarfield();
    const previewTicker = setInterval(updateInstallLivePreviews, 1000);

    function destroy() {
      clearInterval(previewTicker);
      if (installToastTimeout) clearTimeout(installToastTimeout);
      if (installStarfieldRaf) {
        cancelAnimationFrame(installStarfieldRaf);
        installStarfieldRaf = null;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleInstallKeyDown);
      }
      stopPosterPreviewAudio();
    }

    return {
      getSelectedEdition: () => selectedEdition,
      getActiveModalEdition: () => selectedEdition,
      getActiveFilter: () => activeFilter,
      selectInstallEdition,
      setEditionFilter,
      openInstallWizard,
      closeInstallWizard,
      triggerInstallerDownload,
      resetReleaseToFresh,
      resetDemoToDefault,
      togglePosterPreviewAudio,
      stopPosterPreviewAudio,
      updateInstallLivePreviews,
      drawInstallSeedPreview,
      destroy
    };
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const boot = () => {
      if (document.getElementById('screen-home')) {
        window.__seedController = initBrowserApp();
      }
      if (document.getElementById('install-web-root')) {
        window.__seedInstallController = initInstallPage();
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  return {
    STORAGE_KEY,
    RELEASE_STORAGE_KEY,
    EDITION_STORAGE_KEY,
    APP_EDITIONS,
    APP_VERSION,
    DEFAULT_REMINDER_TIME,
    REF_STREAK_OFFSET_MS,
    SEED_STAGES,
    BINAURAL_TAPES,
    PHYSICAL_CHALLENGES,
    COMMUNITY_CHALLENGES,
    resolveAppEdition,
    buildStandaloneInstallerHtml,
    createDefaultState,
    createDayOneState,
    computeStreakBreakdown,
    computeVaultProgress,
    formatRemainingTime,
    computeTriggerBreakdown,
    computeVulnerabilityBreakdown,
    computeBrainRecoveryMetrics,
    computeThirtyDayMatrix,
    computeStatisticsMetrics,
    resolveBreathing478Step,
    isValidPin,
    isValidReminderTime,
    normalizeReminderTime,
    computeNextReminderInfo,
    shouldTriggerDailyReminder,
    buildCommitReminderPayload,
    formatDateString,
    formatDateTimeLocal,
    parseDateTimeLocal,
    formatIndonesianDateTime,
    getStageForHours,
    getTodayDateString,
    buildAlignedSevenDays,
    sanitizeLoadedState,
    initBrowserApp,
    initInstallPage
  };
});


