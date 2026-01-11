/**
 * Parse an SVG string and convert it to a grid of brightness values
 */
export async function parseSvgToGrid(svgString, gridWidth = 80) {
  return new Promise((resolve) => {
    // Create an offscreen canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Replace currentColor with white (currentColor has no CSS context in offscreen canvas)
    const processedSvg = svgString.replace(/currentColor/gi, '#ffffff')

    // Create an image from the SVG
    const img = new Image()
    const blob = new Blob([processedSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.height / img.width
      const gridHeight = Math.round(gridWidth * aspectRatio * 0.5) // 0.5 for character aspect ratio

      // Set canvas size (use higher resolution for better sampling)
      const sampleMultiplier = 4
      canvas.width = gridWidth * sampleMultiplier
      canvas.height = gridHeight * sampleMultiplier

      // Fill with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw SVG (white on black for easy detection)
      ctx.fillStyle = '#ffffff'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Sample the canvas to create grid
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const grid = []

      for (let y = 0; y < gridHeight; y++) {
        const row = []
        for (let x = 0; x < gridWidth; x++) {
          // Sample a region for each grid cell
          let totalBrightness = 0
          let samples = 0

          for (let sy = 0; sy < sampleMultiplier; sy++) {
            for (let sx = 0; sx < sampleMultiplier; sx++) {
              const px = x * sampleMultiplier + sx
              const py = y * sampleMultiplier + sy
              const idx = (py * canvas.width + px) * 4

              // Get brightness from RGB
              const r = imageData.data[idx]
              const g = imageData.data[idx + 1]
              const b = imageData.data[idx + 2]
              const brightness = (r + g + b) / 3 / 255

              totalBrightness += brightness
              samples++
            }
          }

          // Average brightness for this cell (0-1)
          row.push(totalBrightness / samples)
        }
        grid.push(row)
      }

      URL.revokeObjectURL(url)
      resolve({
        grid,
        width: gridWidth,
        height: gridHeight
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

/**
 * Get ASCII character based on brightness value
 */
export function getCharForBrightness(brightness, charSet = ' .:-=+*#%@') {
  const index = Math.floor(brightness * (charSet.length - 1))
  return charSet[Math.min(index, charSet.length - 1)]
}
