// 悬停 2 秒显示完整标题的提示（fixed 定位，避免被滚动容器裁剪）
export const hoverTip = {
  mounted(el) {
    const tip = document.createElement('div')
    tip.className = 'lg-tooltip'
    document.body.appendChild(tip)
    let timer = null
    const show = () => {
      tip.textContent = el.textContent
      const page = document.querySelector('.page')
      tip.classList.toggle('light', !!(page && page.classList.contains('light-mode')))
      const r = el.getBoundingClientRect()
      tip.style.opacity = '1'
      tip.style.left = Math.min(r.left, window.innerWidth - tip.offsetWidth - 12) + 'px'
      tip.style.top = r.bottom + 8 + 'px'
    }
    const hide = () => { clearTimeout(timer); tip.style.opacity = '0' }
    el.addEventListener('mouseenter', () => { timer = setTimeout(show, 500) })
    el.addEventListener('mouseleave', hide)
    el.__hoverTip = tip
  },
  unmounted(el) {
    if (el.__hoverTip) el.__hoverTip.remove()
  },
}
