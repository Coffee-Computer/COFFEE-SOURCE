# LYFE (coffee.play template)

Tiny **life simulator**: **hunger**, **energy**, and **fun** decay over time. **Click** an appliance (Fridge, Bed, TV, Computer) to walk there and complete a **timed action** (gain need, pay cost; Computer also earns money). **Click** empty floor to **move** and cancel a pending interaction.

## Stack

| Piece | File |
|-------|------|
| Input + loop | `coffee.play` (`../../coffee-play.js`) |
| Headless rules | `coffee.playLyfeGame` (`../../logic/coffee-play-lyfe-game.js`) |
| Drawing | `coffee.playShapes` — `drawLyfeFloorGrid`, `drawLyfeRoomBorder`, `drawLyfeAppliance`, `drawLyfeCharacter` |
| Prereqs | `coffee-dot.js`, `coffee-cup.js` |

Load order: **dot → cup → shapes → lyfe logic → play**.

## POC vs template

| | **`LYFE1-POC.html`** | **`LYFE.html`** |
|---|----------------------|-----------------|
| Loop | Manual `requestAnimationFrame` | `coffee.play` |
| Click | `getBoundingClientRect` once | `canvasToLocal` (scaled canvas) |
| Action timer | ~120 frames | **`actionDurationMs`** (default **2000**), scaled by `dt` |
| UI | Same bars + bubble | Same; bubble uses **client** coords from canvas space |

## API sketch (`coffee.playLyfeGame.create`)

- **`step(dtMs, { now? })`** — decay, movement, complete action when within **arrival threshold** and timer elapsed.
- **`click(canvasX, canvasY)`** — canvas **buffer** coordinates (template converts from pointer).
- **`getState()`** — `lyfer`, `objects`, `bubble` `{ visible, text, x, y }` (canvas coords for bubble anchor), `tileSize`, room margin hints, `now`.
- **`reset()`** — restore lyfer + default object layout.
- **`DEFAULT_OBJECTS`**, **`config`** on the instance.

**`callbacks.onNeeds({ hunger, energy, fun, money })`** — fired after init and each `step` / `click`.

### Object fields (layout data)

`name`, `x`, `y`, `w`, `h`, `color`, `need` (`hunger` | `energy` | `fun`), `gain`, `cost`, `msg`. Optional **`workReward`** (e.g. **10** on Computer) added to money when the action completes.

## Customize

Pass **`config`** (`tileSize`, `actionDurationMs`, decay rates, `startNeeds`, `startMoney`, …) or replace **`objects`** array in `create({ objects: [...] })`.
