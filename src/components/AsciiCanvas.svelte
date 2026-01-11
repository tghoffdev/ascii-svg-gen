<script>
  import { onMount } from 'svelte'

  let { gridData, config } = $props()

  let canvas
  let ctx
  let mouseX = $state(-1000)
  let mouseY = $state(-1000)
  let targetMouseX = -1000
  let targetMouseY = -1000
  let animationId
  let time = 0

  // Character animation state - stores random offsets for each cell
  let charOffsets = []
  let lastGridWidth = 0
  let lastGridHeight = 0

  onMount(() => {
    ctx = canvas.getContext('2d')
    resize()
    window.addEventListener('resize', resize)
    render()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) cancelAnimationFrame(animationId)
    }
  })

  function resize() {
    if (!canvas) return
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  function getCharForBrightness(brightness, cellOffset = 0) {
    const charSet = config.charSet || ' .:-=+*#%@'
    // Add time-based cycling: offset changes which character is selected
    const cycleOffset = Math.floor((time * 0.003 + cellOffset) % charSet.length)
    const baseIndex = Math.floor(brightness * (charSet.length - 1))
    // Cycle through nearby characters based on time
    const index = (baseIndex + cycleOffset) % charSet.length
    return charSet[Math.min(index, charSet.length - 1)]
  }

  function initCharOffsets(width, height) {
    // Only reinitialize if grid size changed
    if (width === lastGridWidth && height === lastGridHeight) return
    lastGridWidth = width
    lastGridHeight = height
    charOffsets = []
    for (let y = 0; y < height; y++) {
      const row = []
      for (let x = 0; x < width; x++) {
        // Random offset and speed for each cell
        row.push({
          offset: Math.random() * 100,
          speed: 0.5 + Math.random() * 1.5
        })
      }
      charOffsets.push(row)
    }
  }

  function render() {
    if (!ctx || !canvas) {
      animationId = requestAnimationFrame(render)
      return
    }

    // Increment time for animation
    time++

    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * 0.15
    mouseY += (targetMouseY - mouseY) * 0.15

    // Clear canvas
    ctx.fillStyle = config.bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!gridData?.grid) {
      animationId = requestAnimationFrame(render)
      return
    }

    // Initialize character offsets for animation
    initCharOffsets(gridData.width, gridData.height)

    const cellWidth = config.cellSize * 0.6
    const cellHeight = config.cellSize

    // Calculate offset to center the grid
    const totalWidth = gridData.width * cellWidth
    const totalHeight = gridData.height * cellHeight
    const offsetX = (canvas.width - totalWidth) / 2
    const offsetY = (canvas.height - totalHeight) / 2

    ctx.font = `${config.cellSize}px "DM Mono", "SF Mono", "Fira Code", monospace`
    ctx.textBaseline = 'top'

    const glowRgb = hexToRgb(config.glowColor)

    for (let y = 0; y < gridData.height; y++) {
      for (let x = 0; x < gridData.width; x++) {
        const brightness = gridData.grid[y][x]
        if (brightness < 0.05) continue // Skip very dark cells

        const px = offsetX + x * cellWidth
        const py = offsetY + y * cellHeight

        // Calculate distance from mouse
        const dx = px - mouseX
        const dy = py - mouseY
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Calculate glow intensity based on distance
        let glowFactor = 0
        if (distance < config.glowRadius) {
          glowFactor = Math.pow(1 - distance / config.glowRadius, 2) * config.glowIntensity
        }

        // Combine base opacity with glow
        const opacity = Math.min(1, config.baseOpacity + glowFactor * (1 - config.baseOpacity))

        // Get character based on brightness with animation offset
        const cellData = charOffsets[y]?.[x] || { offset: 0, speed: 1 }
        const animOffset = cellData.offset + time * cellData.speed * 0.01
        const char = getCharForBrightness(brightness, animOffset)

        // Calculate color with glow (baseBrightness controls non-hovered intensity)
        const baseBright = config.baseBrightness || 0.5
        const r = Math.round(glowRgb.r * (baseBright + glowFactor * (1 - baseBright)))
        const g = Math.round(glowRgb.g * (baseBright + glowFactor * (1 - baseBright)))
        const b = Math.round(glowRgb.b * (baseBright + glowFactor * (1 - baseBright)))

        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`

        // Add glow effect for bright areas
        if (glowFactor > 0.3) {
          ctx.shadowColor = config.glowColor
          ctx.shadowBlur = glowFactor * 15
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillText(char, px, py)
      }
    }

    ctx.shadowBlur = 0
    animationId = requestAnimationFrame(render)
  }

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect()
    targetMouseX = e.clientX - rect.left
    targetMouseY = e.clientY - rect.top
  }

  function handleMouseLeave() {
    targetMouseX = -1000
    targetMouseY = -1000
  }
</script>

<canvas
  bind:this={canvas}
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
></canvas>

<style>
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
