/**
 * Export the ASCII art to a standalone HTML file
 */
export function exportToHtml(gridData, config, embedSettings = { mode: 'fullscreen' }) {
  const html = generateHtml(gridData, config, embedSettings)

  // Create and trigger download
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ascii-animate.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generateHtml(gridData, config, embedSettings) {
  const gridJson = JSON.stringify(gridData.grid)

  // Generate sizing CSS based on embed mode
  let containerStyles = ''
  let canvasStyles = ''

  switch (embedSettings.mode) {
    case 'fullscreen':
      containerStyles = 'width: 100vw; height: 100vh;'
      canvasStyles = 'width: 100%; height: 100%;'
      break
    case 'contained':
      containerStyles = 'width: 100%; height: 100%;'
      canvasStyles = 'width: 100%; height: 100%;'
      break
    case 'fixed':
      containerStyles = `width: ${embedSettings.width}px; height: ${embedSettings.height}px;`
      canvasStyles = 'width: 100%; height: 100%;'
      break
    default:
      containerStyles = 'width: 100vw; height: 100vh;'
      canvasStyles = 'width: 100%; height: 100%;'
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASCII Animate</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 100%;
      background: ${config.bgColor};
      overflow: hidden;
    }
    .ascii-container {
      ${containerStyles}
      background: ${config.bgColor};
      overflow: hidden;
    }
    canvas {
      display: block;
      ${canvasStyles}
    }
  </style>
</head>
<body>
  <div class="ascii-container">
    <canvas id="canvas"></canvas>
  </div>
  <script>
    (function() {
      const CONFIG = {
        gridWidth: ${gridData.width},
        gridHeight: ${gridData.height},
        cellSize: ${config.cellSize},
        charSet: '${config.charSet.replace(/'/g, "\\'")}',
        glowColor: '${config.glowColor}',
        bgColor: '${config.bgColor}',
        glowRadius: ${config.glowRadius},
        glowIntensity: ${config.glowIntensity},
        baseOpacity: ${config.baseOpacity},
        baseBrightness: ${config.baseBrightness || 0.5}
      };

      const GRID = ${gridJson};

      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const container = document.querySelector('.ascii-container');

      let mouseX = -1000;
      let mouseY = -1000;
      let targetMouseX = -1000;
      let targetMouseY = -1000;
      let time = 0;

      // Character animation offsets
      const charOffsets = [];
      for (let y = 0; y < CONFIG.gridHeight; y++) {
        const row = [];
        for (let x = 0; x < CONFIG.gridWidth; x++) {
          row.push({
            offset: Math.random() * 100,
            speed: 0.5 + Math.random() * 1.5
          });
        }
        charOffsets.push(row);
      }

      function resize() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      function hexToRgb(hex) {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
      }

      function getCharForBrightness(brightness, cellOffset) {
        const cycleOffset = Math.floor((time * 0.003 + cellOffset) % CONFIG.charSet.length);
        const baseIndex = Math.floor(brightness * (CONFIG.charSet.length - 1));
        const index = (baseIndex + cycleOffset) % CONFIG.charSet.length;
        return CONFIG.charSet[Math.min(index, CONFIG.charSet.length - 1)];
      }

      function render() {
        time++;

        // Smooth mouse movement
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;

        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellWidth = CONFIG.cellSize * 0.6;
        const cellHeight = CONFIG.cellSize;

        // Calculate offset to center the grid
        const totalWidth = CONFIG.gridWidth * cellWidth;
        const totalHeight = CONFIG.gridHeight * cellHeight;
        const offsetX = (canvas.width - totalWidth) / 2;
        const offsetY = (canvas.height - totalHeight) / 2;

        ctx.font = CONFIG.cellSize + 'px "DM Mono", "SF Mono", "Fira Code", monospace';
        ctx.textBaseline = 'top';

        const glowRgb = hexToRgb(CONFIG.glowColor);

        for (let y = 0; y < CONFIG.gridHeight; y++) {
          for (let x = 0; x < CONFIG.gridWidth; x++) {
            const brightness = GRID[y][x];
            if (brightness < 0.05) continue;

            const px = offsetX + x * cellWidth;
            const py = offsetY + y * cellHeight;

            // Calculate distance from mouse
            const dx = px - mouseX;
            const dy = py - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate glow intensity based on distance
            let glowFactor = 0;
            if (distance < CONFIG.glowRadius) {
              glowFactor = Math.pow(1 - distance / CONFIG.glowRadius, 2) * CONFIG.glowIntensity;
            }

            // Combine base opacity with glow
            const opacity = Math.min(1, CONFIG.baseOpacity + glowFactor * (1 - CONFIG.baseOpacity));

            // Get character with animation
            const cellData = charOffsets[y][x];
            const animOffset = cellData.offset + time * cellData.speed * 0.01;
            const char = getCharForBrightness(brightness, animOffset);

            // Calculate color with glow (baseBrightness controls non-hovered intensity)
            const baseBright = CONFIG.baseBrightness;
            const r = Math.round(glowRgb.r * (baseBright + glowFactor * (1 - baseBright)));
            const g = Math.round(glowRgb.g * (baseBright + glowFactor * (1 - baseBright)));
            const b = Math.round(glowRgb.b * (baseBright + glowFactor * (1 - baseBright)));

            ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';

            if (glowFactor > 0.3) {
              ctx.shadowColor = CONFIG.glowColor;
              ctx.shadowBlur = glowFactor * 15;
            } else {
              ctx.shadowBlur = 0;
            }

            ctx.fillText(char, px, py);
          }
        }

        ctx.shadowBlur = 0;
        requestAnimationFrame(render);
      }

      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left;
        targetMouseY = e.clientY - rect.top;
      });

      canvas.addEventListener('mouseleave', () => {
        targetMouseX = -1000;
        targetMouseY = -1000;
      });

      window.addEventListener('resize', resize);

      resize();
      render();
    })();
  </script>
</body>
</html>`
}
