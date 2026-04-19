// ==UserScript==
// @name         StackTrainer
// @namespace    stacktrainer
// @version      1.1.3
// @description  practice temporial/spatial stack for various tanks (diep.io) - dual-angle mode now available
// @author       bee (prompt-eng'd, vibe-spec'd, vibe-coded)
// @license      GPLv2
// @match        https://diep.io/*
// @match        https://*.4v4.lol/*
// @match        https://*.4v4.online/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ============================================================
  // CONFIGURATION — edit these to customize your sequences
  // ============================================================

  const SEQUENCES = [
    {
      name: 'pred stack',
      inputs: [
        { time: 0.000 },
        { time: 0.040, releaseEnd: 0.160 },
        { time: 0.760 },
        { time: 0.960, releaseEnd: 1.120 },
        { time: 1.520 },
      ],
    },
    {
      name: 'gt eco flip',
      inputs: [
        { time: 0.000 },
        { time: 0.040, releaseEnd: 0.200 },
        { time: 0.360 },
        { time: 0.480, releaseEnd: 0.40 },
        { time: 0.480, angle: 180 },
        { time: 0.560 },
        { time: 0.800, angle: 180 },
        { time: 0.960, angle: 0 },
        { time: 1.120, angle: 180 },
        { time: 1.760, angle: 180 },
        { time: 1.920, angle: 0 },
        { time: 2.080, angle: 180 },
        { time: 2.720, angle: 180 },
        { time: 2.880, angle: 0 },
      ],
    },
    {
      name: 'spread stack',//lao put this in, not me
      inputs: [
        { time: 0.000 },
      { time: 0.040, releaseEnd: 0.480 },
      { time: 0.540 },//between 0.52 and 0.56
      { time: 0.640, angle: 0 },
      { time: 0.660, angle: 15 },
      { time: 0.780, angle: 30 },
      { time: 0.860, angle: 45 },
      { time: 0.980, angle: 60 },
      { time: 1.100, angle: 75 },
      { time: 1.280, angle: 0 },
      { time: 1.300, angle: 15 },
      { time: 1.420, angle: 30 },
      { time: 1.500, angle: 45 },
      { time: 1.620, angle: 60 },
      { time: 1.740, angle: 75 },
      { time: 1.920, angle: 0 },
      { time: 1.940, angle: 15 },
      { time: 2.060, angle: 30 },
      { time: 2.140, angle: 45 },
      { time: 2.260, angle: 60 },
      { time: 2.380, angle: 75 },
      { time: 2.560, angle: 0 },
      { time: 2.580, angle: 15 },
      { time: 2.700, angle: 30 },
      { time: 2.780, angle: 45 },
      { time: 2.900, angle: 60 },
      { time: 3.020, angle: 75 },
      ],
    },
    {
      name: 'flipfire',
      inputs: [
        { time: 0.000 },
        { time: 0.160, angle: 150 },
        { time: 0.320, angle: 0 },
        { time: 0.480, angle: 150 },
        { time: 0.640, angle: 0 },
        { time: 0.800, angle: 150 },
        { time: 0.960, angle: 0 },
        { time: 1.120, angle: 150 },
        { time: 1.280, angle: 0 },
        { time: 1.440, angle: 150 },
        { time: 1.600, angle: 0 },
        { time: 1.760, angle: 150 },
        { time: 1.920, angle: 0 },
        { time: 2.080, angle: 150 },
        { time: 2.240, angle: 0 },
        { time: 2.400, angle: 150 },
        { time: 2.560, angle: 0 },
      ],
    },
    {
      name: 'penta',
      inputs: [
        { time: 0.00 },
        { time: 0.04, releaseEnd: 0.08 },
        { time: 0.26 },
        { time: 0.32, angle: 0 },
        { time: 0.38, angle: 22.5 },
        { time: 0.50, angle: 45 },
        { time: 0.64, angle: 0 },
        { time: 0.70, angle: 22.5 },
        { time: 0.82, angle: 45 },
        { time: 0.96, angle: 0 },
        { time: 1.02, angle: 22.5 },
        { time: 1.14, angle: 45 },
      ],
    },
  ];

  // Which inputs trigger sequence steps
  const INPUT_KEY = {
    click: true,  // left mouse button
    space: true,  // spacebar
  };

  // Timing accuracy grades (milliseconds)
  const TIMING_GRADES = {
    perfect: 10,  // <=10ms  → blue-green + "PERFECT"
    great:   20,  // <=20ms  → green
    good:    40,  // <=40ms  → yellow
    // >40ms            → red
  };

  // Angle accuracy grades (degrees)
  const ANGLE_GRADES = {
    perfect: 3,   // <=3°   → blue-green + "PERFECT"
    great:   10,  // <=10°  → green
    good:    20,  // <=20°  → yellow
    // >20°             → red
  };

  // Colors for grades
  const COLORS = {
    perfect: '#00e5cc',
    great:   '#44dd44',
    good:    '#dddd00',
    bad:     '#ee3333',
    dimText: '#aaaaaa',
  };

  // Visual settings
  const VISUAL = {
    panelWidth:      '33vw',
    panelBg:         'rgba(10, 10, 20, 0.95)',
 panelBorder:     '2px solid rgba(255,255,255,0.12)',
 lineHeight:      '360px',   // length of the required-angle line from center
 lineWidth:       '3px',
 lineColor:       '#000000',
 lineOutline:     '#ffffff',
 xSize:           16,        // half-size of the X cross (in px)
xWidth:          '3px',
arcRadius:       60,        // base radius for first arc (px)
arcIncrement:    7,        // px added per subsequent arc
arcWidth:        '3px',
fontSize:        '18px',
headerFontSize:  '24px',
menuFont:        '20px',
menuHover:       'rgba(0, 229, 204, 0.15)',
 menuActive:      'rgba(0, 229, 204, 0.3)',
  };

  // Key to toggle menu (G by default)
  const TOGGLE_KEY = 'KeyG';

  // ============================================================
  // END OF CONFIGURATION — no need to edit below
  // ============================================================

  const State = {
    IDLE:           'IDLE',
    MENU_OPEN:      'MENU_OPEN',
    PRACTICE_READY: 'PRACTICE_READY',
    RECORDING:      'RECORDING',
    RESULTS:        'RESULTS',
  };

  let state = State.IDLE;
  let currentSequence = null;
  let processedInputs = [];
  let recordingStartTime = 0;
  let currentInputIndex = 0;
  let currentAngleIndex = 0;
  let cursorPosition = { x: 0, y: 0 };
  let firstInputCursor = { x: 0, y: 0 };
  let firstInputPolarAngle = 0;
  let recordedData = [];
  let completedArcs = [];
  let nextRequiredAngle = null;
  let liveRAF = null;

  // ---- Process sequence inputs: separate press/release and angle ----
  function processSequence(seq) {
    const items = [];
    for (const inp of seq.inputs) {
      items.push({ ...inp, hasAngle: inp.angle !== undefined });

      // Detect directionless angle inputs and initialize targets array
      if (!inp.direction && inp.angle !== undefined) {
        inp._hasDirection = false;
        inp._targets = [];  // Will be filled in startRecording after firstInputPolarAngle is known
      } else if (inp.direction) {
        inp._hasDirection = true;
        inp._targets = [inp.angle];  // Single target
      }
    }
    // Assign press/release alternately to non-angle items
    let prToggle = 'press';
    for (const item of items) {
      if (!item.hasAngle) {
        item._type = prToggle;
        prToggle = prToggle === 'press' ? 'release' : 'press';
      }
    }
    return items;
  }

  // ---- Validate angle inputs have time field ----
  function validateAngleInputs(items) {
    for (const item of items) {
      if (item.hasAngle && item.time === undefined) {
        throw new Error(
          `Angle input at index ${items.indexOf(item)} missing time field. ` +
          `Expected format: { time: 0.000, angle: 180, direction: 'cw' } or ` +
          `{ time: 0.000, angle: 180 }`
        );
      }
    }
  }

  // ---- State transitions ----
  function setState(newState) {
    const old = state;
    state = newState;
    onStateChange(old, newState);
  }

  function onStateChange(oldState, newState) {
    removeMenu();
    removePanel();
    if (newState !== State.RESULTS) stopCanvas();
    if (newState === State.MENU_OPEN) {
      showMenu();
    } else if (newState === State.PRACTICE_READY) {
      showPracticePanel();
    } else if (newState === State.RECORDING) {
      showRecordingPanel();
      startCanvas();
    } else if (newState === State.RESULTS) {
      showResultsPanel();
    }
    // IDLE: nothing shown
  }

  // ---- Menu ----
  let menuEl = null;
  let menuFocusedIdx = 0;

  function showMenu() {
    menuEl = document.createElement('div');
    menuEl.id = 'st-menu';
    Object.assign(menuEl.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.82)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  zIndex: '2147483647', fontFamily: 'monospace',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      background: VISUAL.panelBg,
      border: VISUAL.panelBorder,
      borderRadius: '12px',
      padding: '32px 40px',
      minWidth: '320px',
      maxWidth: '500px',
    });

    const title = document.createElement('div');
    title.textContent = 'StackTrainer';
    Object.assign(title.style, {
      color: COLORS.perfect,
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '8px',
      textAlign: 'center',
    });
    box.appendChild(title);

    const hint = document.createElement('div');
    hint.textContent = 'Select a sequence (↑↓ then Enter, or click):';
    Object.assign(hint.style, {
      color: COLORS.dimText,
      fontSize: '14px',
      marginBottom: '18px',
      textAlign: 'center',
    });
    box.appendChild(hint);

    SEQUENCES.forEach((seq, i) => {
      const row = document.createElement('div');
      row.textContent = seq.name;
      Object.assign(row.style, {
        padding: '10px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: VISUAL.menuFont,
        color: i === menuFocusedIdx ? '#ffffff' : COLORS.dimText,
        background: i === menuFocusedIdx ? VISUAL.menuActive : 'transparent',
        transition: 'background 0.1s',
      });
      row.addEventListener('mouseenter', () => {
        menuFocusedIdx = i;
        highlightMenuItem();
      });
      row.addEventListener('click', () => {
        menuFocusedIdx = i;
        selectSequence(menuFocusedIdx);
      });
      row.dataset.idx = i;
      box.appendChild(row);
    });

    const esc = document.createElement('div');
    esc.textContent = 'Press G or Escape to close';
    Object.assign(esc.style, {
      color: COLORS.dimText,
      fontSize: '13px',
      marginTop: '16px',
      textAlign: 'center',
    });
    box.appendChild(esc);

    menuEl.appendChild(box);
    document.body.appendChild(menuEl);
  }

  function highlightMenuItem() {
    if (!menuEl) return;
    menuEl.querySelectorAll('[data-idx]').forEach((row, i) => {
      row.style.color = i === menuFocusedIdx ? '#ffffff' : COLORS.dimText;
      row.style.background = i === menuFocusedIdx ? VISUAL.menuActive : 'transparent';
    });
  }

  function removeMenu() {
    if (menuEl) {
      menuEl.remove();
      menuEl = null;
    }
  }

  function selectSequence(idx) {
    currentSequence = SEQUENCES[idx];
    processedInputs = processSequence(currentSequence);
    setState(State.PRACTICE_READY);
  }

  // ---- Panel helpers ----
  let panelEl = null;

  function createPanel(extraContent) {
    panelEl = document.createElement('div');
    panelEl.id = 'st-panel';
    Object.assign(panelEl.style, {
      position: 'fixed', top: '0', left: '0',
      width: VISUAL.panelWidth, height: '100vh',
      background: VISUAL.panelBg,
      borderRight: VISUAL.panelBorder,
      zIndex: '2147483646',
      fontFamily: 'monospace',
      overflowY: 'auto',
      padding: '24px',
      boxSizing: 'border-box',
      color: '#ffffff',
    });
    if (extraContent) extraContent(panelEl);
    document.body.appendChild(panelEl);
  }

  function removePanel() {
    if (panelEl) {
      panelEl.remove();
      panelEl = null;
    }
  }

  // ---- Practice-ready panel ----
  function showPracticePanel() {
    createPanel((panel) => {
      const name = document.createElement('div');
      name.textContent = currentSequence.name;
      Object.assign(name.style, {
        fontSize: VISUAL.headerFontSize,
        fontWeight: 'bold',
        color: COLORS.perfect,
        marginBottom: '12px',
      });
      panel.appendChild(name);

      const hint = document.createElement('div');
      hint.textContent = 'Press G to exit and open the menu again';
      Object.assign(hint.style, {
        color: COLORS.dimText,
        fontSize: '13px',
        marginBottom: '20px',
      });
      panel.appendChild(hint);

      const list = buildInputList();
      panel.appendChild(list);

      const start = document.createElement('div');
      start.textContent = 'Perform the first input to start recording...';
      Object.assign(start.style, {
        color: COLORS.perfect,
        fontSize: VISUAL.fontSize,
        marginTop: '16px',
      });
      panel.appendChild(start);
    });
  }

  function buildInputList() {
    const list = document.createElement('div');
    list.id = 'st-input-list';
    processedInputs.forEach((inp, i) => {
      const row = document.createElement('div');
      row.dataset.inputIdx = i;

      const timeStr = inp.time.toFixed(3) + 's';
      let label = '';
      if (inp.hasAngle) {
        const dir = inp._hasDirection
          ? (inp.direction === 'cw' ? 'CW' : 'CCW')
          : '(either)';
        label = `↗ ${timeStr}  angle ${inp.angle}° ${dir}`;
      } else if (inp._type) {
        label = `${inp._type === 'press' ? '▼ Press' : '▲ Release'}  ${timeStr}`;
        if (inp.releaseEnd) {
          label += ` → ${inp.releaseEnd.toFixed(3)}s`;
        }
      }
      row.textContent = label;
      Object.assign(row.style, {
        fontSize: VISUAL.fontSize,
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      });
      list.appendChild(row);
    });
    return list;
  }

  // ---- Recording panel ----
  function showRecordingPanel() {
    createPanel((panel) => {
      const name = document.createElement('div');
      name.textContent = currentSequence.name;
      Object.assign(name.style, {
        fontSize: VISUAL.headerFontSize,
        fontWeight: 'bold',
        color: COLORS.perfect,
        marginBottom: '12px',
      });
      panel.appendChild(name);

      const hint = document.createElement('div');
      hint.textContent = 'Press G to cancel and close';
      Object.assign(hint.style, {
        color: COLORS.dimText,
        fontSize: '13px',
        marginBottom: '20px',
      });
      panel.appendChild(hint);

      const list = buildInputList();
      panel.appendChild(list);
    });
  }

  // ---- Results panel ----
  function showResultsPanel() {
    createPanel((panel) => {
      const name = document.createElement('div');
      name.textContent = currentSequence.name + ' — Results';
      Object.assign(name.style, {
        fontSize: VISUAL.headerFontSize,
        fontWeight: 'bold',
        color: COLORS.perfect,
        marginBottom: '12px',
      });
      panel.appendChild(name);

      const hint = document.createElement('div');
      hint.textContent = 'Press G to exit · Perform first input to restart';
      Object.assign(hint.style, {
        color: COLORS.dimText,
        fontSize: '13px',
        marginBottom: '20px',
      });
      panel.appendChild(hint);

      recordedData.forEach((rec, i) => {
        const inp = processedInputs[i];
        const row = document.createElement('div');
        row.style.marginBottom = '10px';

        const timeStr = inp.time.toFixed(3) + 's';
        let primaryLabel = '';
        if (inp.hasAngle) {
          const dir = rec.angleDirection
            ? rec.angleDirection
            : (inp._hasDirection
                ? (inp.direction === 'cw' ? 'CW' : 'CCW')
                : '(either)');
          primaryLabel = `↗ ${timeStr}  angle ${inp.angle}° ${dir}`;
        } else if (inp._type) {
          primaryLabel = `${inp._type === 'press' ? '▼ Press' : '▲ Release'}  ${timeStr}`;
          if (inp.releaseEnd) {
            primaryLabel += ` → ${inp.releaseEnd.toFixed(3)}s`;
          }
        }
        const primary = document.createElement('div');
        primary.textContent = primaryLabel;
        Object.assign(primary.style, { fontSize: VISUAL.fontSize });
        row.appendChild(primary);

        if (inp.hasAngle) {
          const diff = rec.angleDiff;
          const absDiff = Math.abs(diff);
          const { color, label } = gradeAngle(absDiff);
          const detail = document.createElement('div');
          detail.textContent = `  → ${diff >= 0 ? '+' : ''}${diff.toFixed(1)}° ${label}`;
          detail.style.color = color;
          detail.style.fontSize = '15px';
          detail.style.marginLeft = '8px';
          row.appendChild(detail);
        } else if (inp._type) {
          const diff = rec.timeDiffMs;
          const absDiff = Math.abs(diff);
          if (inp._type === 'release' && inp.releaseEnd) {
            const within = rec.actualTime >= inp.time && rec.actualTime <= inp.releaseEnd;
            const color = within ? COLORS.great : COLORS.bad;
            const label = within ? 'IN WINDOW' : 'MISSED WINDOW';
            const detail = document.createElement('div');
            const sign = diff >= 0 ? '+' : '';
            detail.textContent = `  → ${sign}${diff.toFixed(0)}ms ${label}`;
            detail.style.color = color;
            detail.style.fontSize = '15px';
            detail.style.marginLeft = '8px';
            row.appendChild(detail);
          } else {
            const { color, label } = gradeTiming(absDiff);
            const detail = document.createElement('div');
            const sign = diff >= 0 ? '+' : '';
            detail.textContent = `  → ${sign}${diff.toFixed(0)}ms ${label}`;
            detail.style.color = color;
            detail.style.fontSize = '15px';
            detail.style.marginLeft = '8px';
            row.appendChild(detail);
          }
        }

        panel.appendChild(row);
      });
    });
  }

  // ---- Grading helpers ----
  function gradeTiming(absMs) {
    if (absMs <= TIMING_GRADES.perfect) return { color: COLORS.perfect, label: 'PERFECT' };
    if (absMs <= TIMING_GRADES.great)   return { color: COLORS.great,   label: '' };
    if (absMs <= TIMING_GRADES.good)    return { color: COLORS.good,    label: '' };
    return { color: COLORS.bad, label: '' };
  }

  function gradeAngle(absDeg) {
    if (absDeg <= ANGLE_GRADES.perfect) return { color: COLORS.perfect, label: 'PERFECT' };
    if (absDeg <= ANGLE_GRADES.great)   return { color: COLORS.great,   label: '' };
    if (absDeg <= ANGLE_GRADES.good)    return { color: COLORS.good,    label: '' };
    return { color: COLORS.bad, label: '' };
  }

  // ---- Canvas (line, X, arc) ----
  let canvasEl = null;
  let ctx = null;

  function startCanvas() {
    if (canvasEl) canvasEl.remove();
    canvasEl = document.createElement('canvas');
    canvasEl.id = 'st-canvas';
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    Object.assign(canvasEl.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      zIndex: '2147483645',
      pointerEvents: 'none',
    });
    document.body.appendChild(canvasEl);
    ctx = canvasEl.getContext('2d');
    drawFrame();
    liveRAF = requestAnimationFrame(animationLoop);
  }

  function stopCanvas() {
    if (liveRAF) {
      cancelAnimationFrame(liveRAF);
      liveRAF = null;
    }
    if (canvasEl) {
      canvasEl.remove();
      canvasEl = null;
      ctx = null;
    }
  }

  function animationLoop() {
    if (state === State.RECORDING) {
      processPassedAngles();
      checkSequenceComplete();
      drawFrame();
      liveRAF = requestAnimationFrame(animationLoop);
    }
  }

  function checkSequenceComplete() {
    const allNonAngleDone = processedInputs.every((pi, i) => {
      if (pi.hasAngle) return true;
      return recordedData[i] !== undefined;
    });
    const allAnglesDone = currentAngleIndex >= processedInputs.filter(p => p.hasAngle).length;
    if (allNonAngleDone && allAnglesDone) {
      finishRecording();
      return true;
    }
    return false;
  }

  function drawFrame() {
    if (!ctx || !canvasEl) return;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (state !== State.RECORDING && state !== State.RESULTS) return;

    const hasAngleInput = processedInputs.some(p => p.hasAngle);
    if (!hasAngleInput) return;

    const cx = canvasEl.width / 2;
    const cy = canvasEl.height / 2;
    const lineLen = parseInt(VISUAL.lineHeight) || 240;

    // Draw required angle lines (both for dual targets)
    if (nextRequiredAngle !== null) {
      // Find current angle input
      const angleInputs = processedInputs.filter(p => p.hasAngle);
      const currentInput = angleInputs[currentAngleIndex];

      if (currentInput && currentInput._targets) {
        // Dual targets: draw both lines
        for (const targetAngle of currentInput._targets) {
          const rad = targetAngle * Math.PI / 180;
          const ex = cx + Math.cos(rad) * lineLen;
          const ey = cy - Math.sin(rad) * lineLen;

          ctx.strokeStyle = VISUAL.lineOutline;
          ctx.lineWidth = parseInt(VISUAL.lineWidth) + 2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(ex, ey);
          ctx.stroke();

          ctx.strokeStyle = VISUAL.lineColor;
          ctx.lineWidth = parseInt(VISUAL.lineWidth);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      } else {
        // Single target: draw single line (backward compat)
        const rad = nextRequiredAngle * Math.PI / 180;
        const ex = cx + Math.cos(rad) * lineLen;
        const ey = cy - Math.sin(rad) * lineLen;

        ctx.strokeStyle = VISUAL.lineOutline;
        ctx.lineWidth = parseInt(VISUAL.lineWidth) + 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.strokeStyle = VISUAL.lineColor;
        ctx.lineWidth = parseInt(VISUAL.lineWidth);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }

    // Draw completed arcs (persisted, at increasing radii)
    for (const arc of completedArcs) {
      drawArc(cx, cy, arc.fromAngle, arc.toAngle, arc.color, arc.radius);
    }

    // Draw live arc during recording (next checkpoint)
    if (state === State.RECORDING && nextRequiredAngle !== null) {
      const userAngle = getUserAngle();
      const angleInputs = processedInputs.filter(p => p.hasAngle);
      const currentInput = angleInputs[currentAngleIndex];

      if (currentInput && currentInput._targets) {
        // Dual targets: find closest and draw single arc
        let closestAngle = currentInput._targets[0];
        let minDiff = Infinity;

        for (const t of currentInput._targets) {
          let diff = Math.abs(userAngle - t);
          if (diff > 180) diff = 360 - diff;
          if (diff < minDiff) {
            minDiff = diff;
            closestAngle = t;
          }
        }

        // Calculate direction based on shortest path
        let diff = userAngle - closestAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        const anticlockwise = diff > 0;

        const { color } = gradeAngle(minDiff);
        const liveRadius = VISUAL.arcRadius + currentAngleIndex * VISUAL.arcIncrement;
        drawArc(cx, cy, closestAngle, userAngle, color, liveRadius);
      } else {
        // Single target: draw single arc (backward compat)
        let absDiff = Math.abs(userAngle - nextRequiredAngle);
        if (absDiff > 180) absDiff = 360 - absDiff;
        const { color } = gradeAngle(absDiff);
        const liveRadius = VISUAL.arcRadius + currentAngleIndex * VISUAL.arcIncrement;
        drawArc(cx, cy, nextRequiredAngle, userAngle, color, liveRadius);
      }
    }
  }

  function getUserAngle() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = cursorPosition.x - cx;
    const dy = -(cursorPosition.y - cy); // flip Y for math convention
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }

  function drawX(x, y, color, alpha) {
    if (!ctx) return;
    const s = VISUAL.xSize;
    ctx.save();
    if (alpha) ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = parseInt(VISUAL.xWidth) || 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - s, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s, y - s);
    ctx.lineTo(x - s, y + s);
    ctx.stroke();
    ctx.restore();
  }

  function drawArc(cx, cy, fromAngle, toAngle, color, radius) {
    if (!ctx) return;
    const r = radius || VISUAL.arcRadius;

    // Special case: zero-length arc (equidistant, hairline)
    if (Math.abs(fromAngle - toAngle) < 0.001) {
      const startRad = fromAngle * Math.PI / 180;
      const endRad = startRad;
      const canvasStart = -startRad;
      const canvasEnd = canvasStart;
      const anticlockwise = false;

      // Draw 1px arc to show direction
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, canvasStart, canvasEnd, anticlockwise);
      ctx.stroke();
      return;
    }

    // Calculate the shortest arc direction
    let diff = toAngle - fromAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const startRad = fromAngle * Math.PI / 180;
    const endRad = (fromAngle + diff) * Math.PI / 180;

    // Canvas angles: 0=right, clockwise positive. Math: 0=right, CCW positive.
    // Convert: canvas_angle = -math_angle
    const canvasStart = -startRad;
    const canvasEnd = -endRad;

    const anticlockwise = diff > 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = parseInt(VISUAL.arcWidth) || 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, canvasStart, canvasEnd, anticlockwise);
    ctx.stroke();
  }

  // ---- Resize handler ----
  window.addEventListener('resize', () => {
    if (canvasEl) {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    }
  });

  // ---- Input handling ----

  function handlePress() {
    if (state === State.PRACTICE_READY) {
      processedInputs = processSequence(currentSequence);
      startRecording();
      // Also record this first press (time ~0)
      const next = findNextNonAngle(currentInputIndex);
      if (next !== null) recordInputAtIndex(next);
      return;
    }
    if (state === State.RESULTS) {
      processedInputs = processSequence(currentSequence);
      startRecording();
      const next = findNextNonAngle(currentInputIndex);
      if (next !== null) recordInputAtIndex(next);
      return;
    }
    if (state !== State.RECORDING) return;
    const next = findNextNonAngle(currentInputIndex);
    if (next === null) return;
    if (processedInputs[next]._type !== 'press') return;
    recordInputAtIndex(next);
  }

  function handleRelease() {
    if (state !== State.RECORDING) return;
    const next = findNextNonAngle(currentInputIndex);
    if (next === null) return;
    if (processedInputs[next]._type !== 'release') return;
    recordInputAtIndex(next);
  }

  function findNextNonAngle(fromIdx) {
    for (let i = fromIdx; i < processedInputs.length; i++) {
      if (!processedInputs[i].hasAngle) return i;
    }
    return null;
  }

  function recordInputAtIndex(targetIdx) {
    const now = performance.now();
    const elapsed = (now - recordingStartTime) / 1000;
    const inp = processedInputs[targetIdx];
    const diffMs = (now - recordingStartTime) - inp.time * 1000;

    recordedData[targetIdx] = {
      actualTime: elapsed,
      timeDiffMs: diffMs,
      cursorX: cursorPosition.x,
      cursorY: cursorPosition.y,
    };

    currentInputIndex = targetIdx + 1;
    processPassedAngles();

    if (!checkSequenceComplete()) {
      highlightCurrentInput();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === TOGGLE_KEY) {
      e.preventDefault();
      handleToggle();
      return;
    }
    if (e.code === 'Escape') {
      e.preventDefault();
      if (state === State.MENU_OPEN) {
        setState(State.IDLE);
      } else if (state === State.RECORDING) {
        cancelRecording();
      } else if (state === State.PRACTICE_READY) {
        setState(State.IDLE);
      } else if (state === State.RESULTS) {
        setState(State.IDLE);
      }
      return;
    }
    if (e.code === 'Enter' && state === State.MENU_OPEN) {
      e.preventDefault();
      selectSequence(menuFocusedIdx);
      return;
    }
    if (e.code === 'ArrowUp' && state === State.MENU_OPEN) {
      e.preventDefault();
      menuFocusedIdx = (menuFocusedIdx - 1 + SEQUENCES.length) % SEQUENCES.length;
      highlightMenuItem();
      return;
    }
    if (e.code === 'ArrowDown' && state === State.MENU_OPEN) {
      e.preventDefault();
      menuFocusedIdx = (menuFocusedIdx + 1) % SEQUENCES.length;
      highlightMenuItem();
      return;
    }
    if (INPUT_KEY.space && e.code === 'Space') {
      e.preventDefault();
      handlePress();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (INPUT_KEY.space && e.code === 'Space' && state === State.RECORDING) {
      e.preventDefault();
      handleRelease();
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('#st-menu')) return;
    if (e.target.closest('#st-panel')) return;
    if (INPUT_KEY.click) {
      handlePress();
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('#st-menu')) return;
    if (e.target.closest('#st-panel')) return;
    if (INPUT_KEY.click && state === State.RECORDING) {
      handleRelease();
    }
  });

  document.addEventListener('mousemove', (e) => {
    cursorPosition.x = e.clientX;
    cursorPosition.y = e.clientY;
  });

  function handleToggle() {
    if (state === State.IDLE) {
      menuFocusedIdx = 0;
      setState(State.MENU_OPEN);
    } else if (state === State.MENU_OPEN) {
      setState(State.IDLE);
    } else if (state === State.PRACTICE_READY) {
      setState(State.IDLE);
    } else if (state === State.RECORDING) {
      cancelRecording();
    } else if (state === State.RESULTS) {
      setState(State.IDLE);
    }
  }

  function cancelRecording() {
    stopCanvas();
    removePanel();
    state = State.IDLE;
  }

  // ---- Recording logic ----

  function startRecording() {
    // Validate angle inputs have time field
    validateAngleInputs(processedInputs);

    recordedData = [];
    completedArcs = [];
    currentInputIndex = 0;
    currentAngleIndex = 0;
    recordingStartTime = performance.now();
    firstInputCursor = { x: cursorPosition.x, y: cursorPosition.y };
    firstInputPolarAngle = getUserAngle();

    // Compute _targets for every angle input
    for (const item of processedInputs) {
      if (item.hasAngle) {
        if (!item._hasDirection) {
          // Directionless: calculate both CW and CCW targets
          const cwTarget = ((firstInputPolarAngle + item.angle) % 360 + 360) % 360;
          const ccwTarget = ((firstInputPolarAngle - item.angle) % 360 + 360) % 360;
          item._targets = [cwTarget, ccwTarget];
        } else {
          // Direction specified: single target
          const sign = item.direction === 'cw' ? -1 : 1;
          item._effectiveAngle = firstInputPolarAngle + sign * item.angle;
          // Normalize to [0, 360)
          item._effectiveAngle = ((item._effectiveAngle % 360) + 360) % 360;
          item._targets = [item._effectiveAngle];
        }
      }
    }

    updateNextRequiredAngle();
    setState(State.RECORDING);
  }

  function processPassedAngles() {
    const now = performance.now();
    const elapsed = (now - recordingStartTime) / 1000;

    const angleInputs = processedInputs.filter(p => p.hasAngle);
    while (currentAngleIndex < angleInputs.length) {
      const aInp = angleInputs[currentAngleIndex];
      if (elapsed >= aInp.time) {
        const globalIdx = processedInputs.indexOf(aInp);
        const userAngle = getUserAngle();

        let closestAngle = null;
        let minDiff = Infinity;
        let direction = '';

        if (aInp._hasDirection) {
          // Single target
          closestAngle = aInp._effectiveAngle;
          let diff = userAngle - closestAngle;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          direction = aInp.direction === 'cw' ? 'CW' : 'CCW';
          minDiff = Math.abs(diff);
        } else {
          // Dual targets
          for (const t of aInp._targets) {
            let diff = Math.abs(userAngle - t);
            if (diff > 180) diff = 360 - diff;
            if (diff < minDiff) {
              minDiff = diff;
              closestAngle = t;
            }
          }
          // Determine direction for display (pick first target if tie)
          direction = closestAngle === aInp._targets[0] ? 'CW' : 'CCW';
        }

        // Calculate actual diff for grading
        let diff = userAngle - closestAngle;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        const absDiff = Math.abs(diff);
        const { color } = gradeAngle(absDiff);

        const arcRadius = VISUAL.arcRadius + currentAngleIndex * VISUAL.arcIncrement;
        completedArcs.push({
          fromAngle: closestAngle,
          toAngle: userAngle,
          color: color,
          radius: arcRadius,
        });

        recordedData[globalIdx] = {
          actualTime: elapsed,
          timeDiffMs: (now - recordingStartTime) - aInp.time * 1000,
          angleDiff: diff,
          angleDirection: direction,
          cursorX: cursorPosition.x,
          cursorY: cursorPosition.y,
        };

        currentAngleIndex++;
      } else {
        break;
      }
    }
    updateNextRequiredAngle();
  }

  function updateNextRequiredAngle() {
    const angleInputs = processedInputs.filter(p => p.hasAngle);
    if (currentAngleIndex < angleInputs.length) {
      const currentInput = angleInputs[currentAngleIndex];
      if (currentInput._hasDirection) {
        // Single target
        nextRequiredAngle = currentInput._effectiveAngle;
      } else {
        // Dual targets: set to first target for now
        nextRequiredAngle = currentInput._targets[0];
      }
    } else {
      nextRequiredAngle = null;
    }
  }

  function finishRecording() {
    processPassedAngles();
    setState(State.RESULTS);
    drawFrame();
  }

  function highlightCurrentInput() {
    const list = document.getElementById('st-input-list');
    if (!list) return;
    const rows = list.querySelectorAll('[data-input-idx]');
    rows.forEach((row, i) => {
      if (i === currentInputIndex) {
        row.style.color = COLORS.perfect;
        row.style.fontWeight = 'bold';
      } else if (recordedData[i] && i < currentInputIndex) {
        row.style.color = COLORS.dimText;
        row.style.fontWeight = 'normal';
      } else {
        row.style.color = '#ffffff';
        row.style.fontWeight = 'normal';
      }
    });
  }

  // ---- Prevent default for toggle key while script is active ----
  // (already handled in keydown)

})();
