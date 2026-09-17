<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const TWO_PI = Math.PI * 2;

const props = defineProps({
  dotRadius: { type: Number, default: 1.5 },
  dotSpacing: { type: Number, default: 14 },
  cursorRadius: { type: Number, default: 500 },
  cursorForce: { type: Number, default: 0.5 },
  bulgeOnly: { type: Boolean, default: true },
  bulgeStrength: { type: Number, default: 67 },
  glowRadius: { type: Number, default: 160 },
  glowColor: { type: String, default: '#14110E' },
  sparkle: { type: Boolean, default: false },
  waveAmplitude: { type: Number, default: 0 },
  gradientFrom: { type: String, default: 'rgba(124, 255, 103, 0.35)' },
  gradientTo: { type: String, default: 'rgba(160, 255, 188, 0.25)' },
  className: { type: String, default: '' },
  paused: { type: Boolean, default: false },
});

const root = ref(null);
const canvas = ref(null);
const glowEl = ref(null);
const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`;

let dots = [];
const mouse = {
  x: -9999,
  y: -9999,
  prevX: -9999,
  prevY: -9999,
  speed: 0
};

let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
let glowOpacity = 0;
let engagement = 0;
let raf = 0;
let resizeTimer;
let speedInterval;
let frameCount = 0;
let globalOffsetX = 0;
let globalOffsetY = 0;

function buildDots(w, h) {
  const step = props.dotRadius + props.dotSpacing;
  const cols = Math.floor(w / step);
  const rows = Math.floor(h / step);
  const padX = (w % step) / 2;
  const padY = (h % step) / 2;
  const nextDots = new Array(rows * cols);
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ax = padX + col * step + step / 2;
      const ay = padY + row * step + step / 2;
      nextDots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
    }
  }
  dots = nextDots;
}

function updateMouseSpeed() {
  const dx = mouse.prevX - mouse.x;
  const dy = mouse.prevY - mouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  mouse.speed += (dist - mouse.speed) * 0.5;
  if (mouse.speed < 0.001) mouse.speed = 0;
  mouse.prevX = mouse.x;
  mouse.prevY = mouse.y;
}

function setupCanvas() {
  if (!root.value || !canvas.value) return;
  const ctx = canvas.value.getContext('2d', { alpha: true });
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cachedGrad = null;
  let cachedGradKey = '';

  function doResize() {
    if (!root.value || !canvas.value || !ctx) return;
    const rect = root.value.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.value.width = w * dpr;
    canvas.value.height = h * dpr;
    canvas.value.style.width = `${w}px`;
    canvas.value.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    size = {
      w,
      h,
      offsetX: rect.left + window.scrollX,
      offsetY: rect.top + window.scrollY
    };
    buildDots(w, h);
  }

  function resize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 100);
  }

  function onMouseMove(e) {
    mouse.x = e.pageX - size.offsetX;
    mouse.y = e.pageY - size.offsetY;
  }

  let frozen = false;

  function render() {
    if (!ctx) return;
    frameCount++;
    const { w, h } = size;
    const t = frameCount * 0.02;

    const targetEngagement = Math.min(mouse.speed / 5, 1);
    engagement += (targetEngagement - engagement) * 0.06;
    if (engagement < 0.001) engagement = 0;

    glowOpacity += (engagement - glowOpacity) * 0.08;
    if (glowEl.value) {
      glowEl.value.setAttribute('cx', String(mouse.x));
      glowEl.value.setAttribute('cy', String(mouse.y));
      glowEl.value.style.opacity = String(glowOpacity);
    }

    const step = props.dotRadius + props.dotSpacing;
    if (!frozen) {
      globalOffsetX = (globalOffsetX - 0.33) % step;
      globalOffsetY = (globalOffsetY - 0.33) % step;
    }

    ctx.clearRect(0, 0, w, h);
    // 缓存渐变：尺寸/颜色不变时复用，避免每帧重建
    const gradKey = `${w}|${h}|${props.gradientFrom}|${props.gradientTo}`;
    if (cachedGradKey !== gradKey) {
      cachedGrad = ctx.createLinearGradient(0, 0, w, h);
      cachedGrad.addColorStop(0, props.gradientFrom);
      cachedGrad.addColorStop(1, props.gradientTo);
      cachedGradKey = gradKey;
    }
    ctx.fillStyle = cachedGrad;

    const crSq = props.cursorRadius * props.cursorRadius;
    const rad = props.dotRadius / 2;
    ctx.beginPath();

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = mouse.x - d.ax;
      const dy = mouse.y - d.ay;
      const distSq = dx * dx + dy * dy;

      if (distSq < crSq && engagement > 0.01) {
        const dist = Math.sqrt(distSq);
        const angle = Math.atan2(dy, dx);
        if (props.bulgeOnly) {
          const falloff = 1 - dist / props.cursorRadius;
          const push = falloff * falloff * props.bulgeStrength * engagement;
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
        } else {
          const safeDist = Math.max(dist, 0.001);
          const move = (500 / safeDist) * (mouse.speed * props.cursorForce);
          d.vx += Math.cos(angle) * -move;
          d.vy += Math.sin(angle) * -move;
        }
      } else if (props.bulgeOnly) {
        d.sx += (d.ax - d.sx) * 0.1;
        d.sy += (d.ay - d.sy) * 0.1;
      }

      if (!props.bulgeOnly) {
        d.vx *= 0.9;
        d.vy *= 0.9;
        d.x = d.ax + d.vx;
        d.y = d.ay + d.vy;
        d.sx += (d.x - d.sx) * 0.1;
        d.sy += (d.y - d.sy) * 0.1;
      }

      let drawX = d.sx + globalOffsetX;
      let drawY = d.sy + globalOffsetY;

      if (props.waveAmplitude > 0) {
        drawY += Math.sin(d.ax * 0.03 + t) * props.waveAmplitude;
        drawX += Math.cos(d.ay * 0.03 + t * 0.7) * props.waveAmplitude * 0.5;
      }

      if (props.sparkle) {
        const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
        if (hash % 100 < 3) {
          ctx.moveTo(drawX + rad * 1.8, drawY);
          ctx.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
        } else {
          ctx.moveTo(drawX + rad, drawY);
          ctx.arc(drawX, drawY, rad, 0, TWO_PI);
        }
      } else {
        ctx.moveTo(drawX + rad, drawY);
        ctx.arc(drawX, drawY, rad, 0, TWO_PI);
      }
    }
    ctx.fill();
  }

  function tick() {
    render();
    raf = requestAnimationFrame(tick);
  }

  doResize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
  speedInterval = setInterval(updateMouseSpeed, 20);
  if (props.paused) {
    // 初始即暂停：只绘制一次静态画面，不启动动画循环
    frozen = true;
    render();
  } else {
    raf = requestAnimationFrame(tick);
  }

  watch(
    () => props.paused,
    (p) => {
      if (p) {
        cancelAnimationFrame(raf);
        frozen = true;
        // 归位：所有点回到横竖网格，清整体流动与交互状态
        for (const d of dots) {
          d.sx = d.ax;
          d.sy = d.ay;
        }
        globalOffsetX = 0;
        globalOffsetY = 0;
        mouse.speed = 0;
        engagement = 0;
        glowOpacity = 0;
        if (glowEl.value) glowEl.value.style.opacity = '0';
        render();
      } else {
        frozen = false;
        raf = requestAnimationFrame(tick);
      }
    }
  );
}

function cleanup() {
  cancelAnimationFrame(raf);
  clearInterval(speedInterval);
  clearTimeout(resizeTimer);
}

watch(
  () => [props.dotRadius, props.dotSpacing],
  async () => {
    await nextTick();
    if (size.w > 0 && size.h > 0) {
      buildDots(size.w, size.h);
    }
  }
);

onMounted(() => {
  setupCanvas();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<template>
  <div ref="root" class="dot-root" :class="className">
    <canvas ref="canvas" class="dot-canvas" />
    <svg class="dot-glow" aria-hidden="true">
      <defs>
        <radialGradient :id="glowId">
          <stop offset="0%" :stop-color="glowColor" :stop-opacity="1" />
          <stop offset="70%" :stop-color="glowColor" :stop-opacity="1" />
          <stop offset="100%" :stop-color="glowColor" :stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle
        ref="glowEl"
        cx="-9999"
        cy="-9999"
        :r="glowRadius"
        :fill="`url(#${glowId})`"
        style="opacity: 0; will-change: opacity"
      />
    </svg>
  </div>
</template>

<style scoped>
.dot-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.dot-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%),
                      linear-gradient(to right, transparent 0%, black 6%, black 92%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%),
              linear-gradient(to right, transparent 0%, black 6%, black 92%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.dot-glow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
