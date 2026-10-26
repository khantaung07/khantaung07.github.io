/** A small, dependency-free pixel ocean. All coordinates are native pixels. */
const HEIGHT = 120;
// Align the wider wave pattern with the repeating background texture.
const LOOP_SECONDS = 24;

const COLORS = Object.freeze({
  sky: '#f5f5f2',
  water: '#62b5c8',
  foam: '#f5f5f2',
  cloudShadow: '#eab53d',
});

const TAU = Math.PI * 2;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const CALM_Y = 96;
const WAVE_PERIOD = 480;
const FOAM_DEPTH = 32;
const SWELL_RADIUS = 82;
const CREST_RADIUS = 7;
// Keep each swell's shape, with open water between successive waves.
const swells = [
  { center: 80, height: 40 },
  { center: 320, height: 34 },
];

type WaveOptions = {
  speed: number;
  waveHeight: number;
  getSurferWidth: () => number;
  onFrame: (frame: { surfaceX: number; surfaceY: number; surfaceAngle: number }) => void;
};

function hash(x: number, y: number) {
  let n = Math.imul(x + 71, 374761393) ^ Math.imul(y + 19, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}

/** Back edge of the foreground wave; its foam extends toward the viewer. */
function surfaceAt(x: number, seconds: number) {
  // Water moves right while the surfer faces left.
  const p = mod(x - mod(seconds, LOOP_SECONDS) * 40, WAVE_PERIOD);
  let lift = 0;
  for (const swell of swells) {
    const distance = Math.abs(mod(p - swell.center + WAVE_PERIOD / 2, WAVE_PERIOD) - WAVE_PERIOD / 2);
    lift = Math.max(lift, swell.height * Math.max(0,
      Math.min(1, (SWELL_RADIUS - distance) / (SWELL_RADIUS - CREST_RADIUS))));
  }
  return CALM_Y - lift;
}

function ridingSurfaceAt(x: number, seconds: number) {
  const surface = surfaceAt(x, seconds);
  // Ride halfway down the foam face, easing into the flat water between waves.
  const depth = Math.min(FOAM_DEPTH / 2, (CALM_Y - surface) * 0.6);
  return surface + depth;
}

/** Match the board's tilt to its path across the foreground wave face. */
function ridingSlopeAt(x: number, seconds: number) {
  const halfSpan = 8;
  return (ridingSurfaceAt(x + halfSpan, seconds) - ridingSurfaceAt(x - halfSpan, seconds)) / (halfSpan * 2);
}

function rectangle(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, compact = false) {
  // A shallow, stepped cloud with the reference's warm underside.
  const silhouette = compact ? [
    [7, 11], [4, 14], [1, 17], [0, 18], [2, 16], [6, 12],
  ] : [
    [23, 33], [19, 37], [5, 40], [1, 42], [0, 43],
    [2, 42], [6, 40], [20, 37], [24, 33],
  ];
  const inside = (px: number, py: number) => py >= 0 && py < silhouette.length &&
    px >= silhouette[py][0] && px < silhouette[py][1];
  for (let row = 0; row < silhouette.length; row++) {
    const [a, b] = silhouette[row];
    for (let px = a; px < b; px++) {
      const edge = !inside(px - 1, row) || !inside(px + 1, row) ||
        !inside(px, row - 1) || !inside(px, row + 1);
      rectangle(ctx, edge ? COLORS.water : row >= (compact ? 3 : 5) ? COLORS.cloudShadow : COLORS.sky,
        x + px, y + row);
    }
  }
  if (!compact) {
    rectangle(ctx, COLORS.sky, x + 4, y + 4, 7, 2);
    rectangle(ctx, COLORS.sky, x + 14, y + 4, 5, 2);
    rectangle(ctx, COLORS.sky, x + 23, y + 4, 16, 2);
  }
}

/** Draw one deterministic frame; the full animation repeats every LOOP_SECONDS. */
function renderWaveFrame(ctx: CanvasRenderingContext2D, seconds: number) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const oceanTop = height - HEIGHT;
  const t = mod(seconds, LOOP_SECONDS);
  const shift = -Math.floor(t * 40);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  const drift = Math.round(2 * Math.sin(TAU * t / 8));
  const horizon = oceanTop + 48;
  if (width < 320) {
    for (let index = 0; index < 4; index++) {
      const direction = index % 2 === 0 ? 1 : -1;
      cloud(ctx, width - 94 + index * 24 + drift * direction,
        horizon - (index % 2 === 0 ? 16 : 10), true);
    }
  } else {
    const left = Math.max(width * 0.42, 182);
    const spacing = (width - 51 - left) / 3;
    const heights = [0.14, 0.52, 0.3, 0.72];
    for (let index = 0; index < 4; index++) {
      const direction = index % 2 === 0 ? 1 : -1;
      cloud(ctx, left + spacing * index + drift * direction,
        horizon * heights[index]);
    }
  }

  ctx.save();
  ctx.translate(0, oceanTop);
  rectangle(ctx, COLORS.water, 0, 48, width, HEIGHT - 48);

  // Tiny moving notches along the distant horizon.
  const distantShift = -Math.floor(t * 10);
  for (let x = 0; x < width; x++) {
    const p = mod(x + distantShift, 20);
    if (p < 3 || (p > 10 && p < 13)) rectangle(ctx, COLORS.sky, x, 48, 1, 1);
    if (p === 6) rectangle(ctx, COLORS.foam, x, 50);
  }

  // Three scrolling texture bands give a subtle sense of depth.
  for (let y = 52; y < HEIGHT; y += 2) {
    const band = y < 67 ? 0 : y < 88 ? 1 : 2;
    const offset = -Math.floor(t * (10 + band * 10) / 2) * 2;
    for (let x = 0; x < width; x += 2) {
      const px = mod(x + offset, 80) / 2;
      const h = hash(px, y / 2);
      if (h % 17 === 0) {
        rectangle(ctx, COLORS.foam, x, y, (h >>> 8) % 4 === 0 ? 4 : 2, 2);
        if ((h >>> 16) % 7 === 0) rectangle(ctx, COLORS.foam, x + 2, y - 2, 2, 2);
      }
    }
  }

  // Leave the background texture visible in the gaps between swells.
  for (let x = 0; x < width; x += 2) {
    const surface = surfaceAt(x, t);
    if (surface >= CALM_Y) continue;
    const y = Math.round(surface / 2) * 2;
    rectangle(ctx, COLORS.water, x, y, 2, HEIGHT - y);
    const world = mod(x + shift, WAVE_PERIOD);
    const cell = Math.floor(world / 2);
    const crest = swells.find(swell =>
      Math.abs(mod(world - swell.center + WAVE_PERIOD / 2, WAVE_PERIOD) - WAVE_PERIOD / 2) <= CREST_RADIUS);

    // Broad foam caps break into checkerboard pockets and jagged ribbons.
    for (let dy = 0; dy < FOAM_DEPTH && y + dy < HEIGHT; dy += 2) {
      const ribbon = Math.floor(dy / 8);
      const tooth = mod(cell + ribbon * 3, 7) < 2 ? 2 : 0;
      const edge = mod(dy + tooth, 8);
      let foam = edge < 2 && mod(cell + ribbon * 5, 23) > 1;
      if (edge === 2 && mod(cell + ribbon, 5) < 2) foam = true;

      if (crest) {
        const pocketX = mod(Math.floor((world - crest.center) / 2) + Math.floor(dy / 10), 7);
        const pocketY = mod(dy / 2, 7);
        const pocket = (pocketX >= 2 && pocketX <= 3 && pocketY >= 2 && pocketY <= 4)
          || (pocketX === 1 && pocketY === 3) || (pocketX === 4 && pocketY === 4);
        foam = !pocket;
      }
      if (foam) rectangle(ctx, COLORS.foam, x, y + dy, 2, 2);
    }
  }
  ctx.restore();
}

/** Attach the animation to a canvas. Returns a cleanup function for React. */
export function startWaveBackground(canvas: HTMLCanvasElement, options: WaveOptions) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const { speed, waveHeight, getSurferWidth, onFrame } = options;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let rendered = -1;
  let visible = true;
  let destroyed = false;
  let riderHome = 0;
  let riderOffset = 0;
  let riderVelocity = 0;
  let riderMin = 0;
  let riderMax = 0;

  function advanceRider(delta: number) {
    const riderX = riderHome + riderOffset;
    const slope = ridingSlopeAt(riderX, elapsed);
    const downhillSlope = Math.min(0, slope);
    const openWater = surfaceAt(riderX, elapsed) >= CALM_Y;
    // Boost only the descent; return toward home in the gaps between waves.
    const acceleration = 900 * downhillSlope / (1 + downhillSlope * downhillSlope)
      - (openWater ? riderOffset * 6 : 0) - riderVelocity * 2.8;
    riderVelocity += acceleration * delta;
    // Avoid a rightward drift that would slow the wave's normal upward motion.
    if (slope > 0) riderVelocity = Math.min(0, riderVelocity);
    const nextOffset = riderOffset + riderVelocity * delta;
    riderOffset = Math.max(riderMin - riderHome, Math.min(riderMax - riderHome, nextOffset));
    if (riderOffset !== nextOffset) riderVelocity = 0;
  }

  const paint = () => {
    renderWaveFrame(ctx, elapsed);
    const riderX = riderHome + riderOffset;
    onFrame({
      surfaceX: riderX / canvas.width,
      surfaceY: (canvas.height - HEIGHT + Math.round(ridingSurfaceAt(riderX, elapsed))) / canvas.height,
      surfaceAngle: Math.atan(ridingSlopeAt(riderX, elapsed)) * 180 / Math.PI,
    });
  };

  function tick(now: number) {
    frame = 0;
    if (destroyed || !visible || document.hidden || media.matches) return;
    if (previous) {
      const delta = Math.min((now - previous) / 1000, 0.1);
      elapsed = mod(elapsed + delta * speed, LOOP_SECONDS);
      advanceRider(delta);
    }
    previous = now;
    const index = Math.floor(elapsed * 20);
    if (index !== rendered) { paint(); rendered = index; }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    paint();
    if (!destroyed && visible && !document.hidden && !media.matches && speed > 0) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    // Extend the repeating ocean while keeping the displayed pixels square.
    const scale = HEIGHT / waveHeight;
    const nextWidth = Math.max(1, Math.round(width * scale));
    const nextHeight = Math.max(HEIGHT, Math.round(height * scale));
    if (canvas.width !== nextWidth) canvas.width = nextWidth;
    if (canvas.height !== nextHeight) canvas.height = nextHeight;
    const spriteWidth = getSurferWidth();
    const margin = Math.min(nextWidth / 2, spriteWidth && width > 0
      ? spriteWidth * nextWidth / width * 1.05 : nextWidth * 0.16);
    riderHome = Math.max(margin, Math.min(nextWidth - margin,
      0.72 * nextWidth));
    const range = Math.min(36, nextWidth * 0.1);
    riderMin = Math.max(margin, riderHome - range);
    riderMax = Math.min(nextWidth - margin, riderHome + range);
    const boundedOffset = Math.max(riderMin - riderHome, Math.min(riderMax - riderHome, riderOffset));
    if (boundedOffset !== riderOffset) riderVelocity = 0;
    riderOffset = boundedOffset;
    sync();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  resize();

  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', sync);
    media.removeEventListener('change', sync);
  };
}
