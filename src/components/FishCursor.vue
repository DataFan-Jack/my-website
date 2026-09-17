<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const fishEl = ref(null)
let raf = 0
let targetX = -9999
let targetY = -9999
let fishX = 0
let fishY = 0
let angle = 0
let tailPhase = 0

function onMouseMove(e) {
  targetX = e.clientX
  targetY = e.clientY
}

function tick() {
  if (!fishEl.value) return

  // spring follow
  const dx = targetX - fishX
  const dy = targetY - fishY
  fishX += dx * 0.08
  fishY += dy * 0.08

  // rotate toward movement direction
  if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
    const targetAngle = Math.atan2(dy, dx)
    let diff = targetAngle - angle
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    angle += diff * 0.1
  }

  // tail wag
  tailPhase += 0.15
  const tailSwing = Math.sin(tailPhase) * 8

  fishEl.value.style.transform = `translate(${fishX - 40}px, ${fishY - 20}px) rotate(${angle + Math.PI / 2}deg)`

  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  fishX = window.innerWidth / 2
  fishY = window.innerHeight / 2
  window.addEventListener('mousemove', onMouseMove)
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div ref="fishEl" class="fish-cursor">
    <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
      <!-- body -->
      <ellipse cx="35" cy="24" rx="28" ry="14" fill="#4ade80" />
      <!-- tail -->
      <path d="M 60 24 L 78 12 Q 74 24 78 36 Z" fill="#22c55e" class="fish-tail" />
      <!-- eye -->
      <circle cx="20" cy="20" r="3" fill="#0a0a0a" />
      <circle cx="21" cy="19" r="1" fill="#fff" />
      <!-- fin -->
      <path d="M 35 12 Q 40 4 48 10" fill="#16a34a" />
      <!-- belly highlight -->
      <ellipse cx="30" cy="28" rx="15" ry="5" fill="#86efac" opacity="0.5" />
    </svg>
  </div>
</template>

<style scoped>
.fish-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
  transition: none;
  filter: drop-shadow(0 0 12px rgba(74, 222, 128, 0.4));
}
</style>
