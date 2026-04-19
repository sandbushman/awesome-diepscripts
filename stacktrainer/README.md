# StackTrainer

Userscript for diep.io that trains temporal and spatial stack patterns.

## Users

### Requirements

- A userscript manager: [Tampermonkey](https://tampermonkey.net/) (Chrome/Firefox/Edge) or [Greasemonkey](http://greasemonkey.sourceforge.net/) (Firefox legacy)
- Access to `stacktrainer.js` in this folder

### Installation

1. Open Tampermonkey → Dashboard → Utilities
2. Paste the full contents of `stacktrainer.js` into the "Import" field, or create a new script and paste manually
3. Save (Ctrl+S)
4. Visit https://diep.io/, https://*.4v4.lol/, or https://*.4v4.online/

### Usage

Press **G** to open the sequence menu.

- **↑/↓** — navigate sequences
- **Enter** or **click** — select
- **G** or **Escape** — close/cancel

Perform inputs (mouse click or spacebar) to record your attempt. The script tracks timing and angle accuracy, then shows graded results.

#### Input Trigger Keys

| Input | Trigger |
|-------|---------|
| Click | Left mouse button |
| Space | Spacebar |

Both are enabled by default. Edit `INPUT_KEY` in the configuration section to disable either.

### Grading

**Timing** (for press/release inputs):

| Grade | Window | Color |
|-------|--------|-------|
| PERFECT | ≤10ms | Cyan |
| Great | ≤20ms | Green |
| Good | ≤40ms | Yellow |
| Miss | >40ms | Red |

**Angle** (for rotation inputs):

| Grade | Deviation | Color |
|-------|-----------|-------|
| PERFECT | ≤3° | Cyan |
| Great | ≤10° | Green |
| Good | ≤20° | Yellow |
| Miss | >20° | Red |

### Included Sequences

- `pred stack` — Predator-style stacking
- `gt eco flip` — Grasshopper twins eco flip pattern
- `spread stack` — Spread pattern (accepts either direction)
- `flipfire` — Flip-fire alternating (accepts either direction)
- `penta` — Penta-shot pattern

## Developers

### Architecture

StackTrainer is a state machine with five states:

```
IDLE → MENU_OPEN → PRACTICE_READY → RECORDING → RESULTS
```

Transitions are handled by `setState()`. Each state has an associated UI panel and optional canvas overlay.

### Key State Variables

| Variable | Purpose |
|----------|---------|
| `state` | Current state enum |
| `currentSequence` | Active sequence object |
| `processedInputs` | Sequence inputs enriched with `_type` (press/release) and `hasAngle` |
| `recordedData` | User's recorded timing/angle data per input |
| `currentInputIndex` | Next non-angle input to capture |
| `currentAngleIndex` | Next angle input to capture (time-based) |
| `completedArcs` | Persisted arc segments drawn on canvas |
| `nextRequiredAngle` | Target angle for current checkpoint |

### Adding a Sequence

Add a new object to the `SEQUENCES` array:

```js
{
  name: 'my sequence',
  inputs: [
    { time: 0.000 },                           // press at 0ms
    { time: 0.040, releaseEnd: 0.160 },        // release window
    { time: 0.760 },                           // next press
    { time: 0.960, releaseEnd: 1.120 },        // next release
    { time: 1.520 },                           // final press
    // with directed angle input:
    { time: 0.640, angle: 0, direction: 'cw' },  // rotate to 0° clockwise
    // with directionless angle input (accepts either direction):
    { time: 1.000, angle: 45 },                 // rotate 45° either way
  ],
},
```

#### Input Schema

| Field | Type | Description |
|-------|------|-------------|
| `time` | float | Seconds from sequence start |
| `releaseEnd` | float | Optional end of valid release window (seconds) |
| `angle` | float | Target rotation angle in degrees |
| `direction` | string | `'cw'` or `'ccw'` (clockwise/counterclockwise). **Optional** — if omitted, either direction is accepted |

Without `angle`, the input is a press/release. The script alternates press/release for each non-angle input unless `releaseEnd` is set (then it is a ranged release).

#### Dual-Target Angle Mode (Directionless)

When `direction` is omitted, the script accepts **either** clockwise or counterclockwise rotation to reach the target angle. At recording start it computes both possible target angles:

```js
// firstInputPolarAngle = user's starting angle at first input
cwTarget = (firstInputPolarAngle + angle) % 360
ccwTarget = (firstInputPolarAngle - angle) % 360
```

During recording, the script uses whichever target is closest to the user's actual cursor angle at checkpoint time. The results panel records which direction was taken (`CW` or `CCW`).

The canvas draws **both** target lines simultaneously so you can see the valid options at each step.

#### Angle Inputs and Coordinate System

Angles are **cumulative rotations** relative to the first cursor angle, not absolute screen angles. When a direction is specified, the sign is applied based on direction:

```js
// internal: clockwise rotations subtract from polar angle
item._effectiveAngle = firstInputPolarAngle + sign * item.angle;
```

When direction is omitted, both CW and CCW targets are computed and the closest is used at recording time.

The script normalizes to `[0, 360)`.

### Modifying Grading Thresholds

Edit the `TIMING_GRADES` and `ANGLE_GRADES` objects:

```js
const TIMING_GRADES = {
  perfect: 10,  // ms
  great:   20,
  good:    40,
};

const ANGLE_GRADES = {
  perfect: 3,   // degrees
  great:   10,
  good:    20,
};
```

### Canvas Overlay

The canvas draws three things during recording:

1. **Angle lines** — white-outlined black lines from screen center to each valid target angle (single line for directed inputs; dual lines for directionless inputs)
2. **Arcs** — `completedArcs` (persisted, at increasing radii) and a live arc from the closest target to the user's current angle, colored by grade
3. **Zero-length arcs** — a hairline arc drawn when the user's angle is equidistant from both targets (within 0.001°), indicating a tie

`drawArc()` handles the canvas coordinate system quirk: canvas uses clockwise-positive angles while math convention is counterclockwise-positive. The function negates angles internally.

### Input Handling

`INPUT_KEY` at the top of the script controls which inputs trigger recording:

```js
const INPUT_KEY = {
  click: true,  // left mouse button
  space: true,  // spacebar
};
```

### Script Scope

Each execution runs in an IIFE (`(function () { ... })()`) so it does not pollute the global scope. DOM elements created by the script are prefixed with `st-` (e.g., `st-menu`, `st-panel`, `st-canvas`).

### File Structure

```
awesome-diepscripts/
├── stacktrainer/
│   ├── stacktrainer.js   ← the userscript
│   └── README.md          ← this file
└── README.md              ← repo-level overview
```
