<script>
  import IconPicker from './components/IconPicker.svelte'
  import AsciiCanvas from './components/AsciiCanvas.svelte'
  import Controls from './components/Controls.svelte'
  import { icons } from './lib/icons.js'
  import { parseSvgToGrid } from './lib/svgParser.js'
  import { exportToHtml } from './lib/exporter.js'

  // State
  let config = $state({
    gridWidth: 80,
    cellSize: 12,
    charSet: ' .:-=+*#%@',
    glowColor: '#4fc3f7',
    secondaryColor: '#8b9dc3',
    bgColor: '#000000',
    glowRadius: 150,
    glowIntensity: 1.0,
    baseOpacity: 0.3,
    baseBrightness: 0.5,
    cursorHalo: false
  })

  let currentSvg = $state(null)
  let gridData = $state(null)
  let inputMode = $state('icons') // 'icons' | 'upload' | 'paste'
  let pasteValue = $state('')
  let showHelp = $state(false)
  let embedMode = $state('fullscreen') // 'fullscreen' | 'contained' | 'fixed'
  let fixedWidth = $state(800)
  let fixedHeight = $state(600)

  // Load default icon on mount
  $effect(() => {
    if (!currentSvg && icons.length > 0) {
      selectIcon(icons[0])
    }
  })

  function selectIcon(icon) {
    currentSvg = icon.svg
    updateGrid()
  }

  function handleFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        currentSvg = e.target.result
        updateGrid()
      }
      reader.readAsText(file)
    }
  }

  function handlePaste() {
    if (pasteValue.trim()) {
      currentSvg = pasteValue
      updateGrid()
    }
  }

  async function updateGrid() {
    if (currentSvg) {
      gridData = await parseSvgToGrid(currentSvg, config.gridWidth)
    }
  }

  function handleExport() {
    if (gridData) {
      const embedSettings = {
        mode: embedMode,
        width: fixedWidth,
        height: fixedHeight
      }
      exportToHtml(gridData, config, embedSettings)
    }
  }

  // Update grid when width changes
  $effect(() => {
    if (currentSvg) {
      config.gridWidth // track dependency
      updateGrid()
    }
  })
</script>

<div class="app">
  <header>
    <div class="header-left">
      <h1><span class="accent">//</span> ASCII_ANIMATE</h1>
      <button class="help-btn" onclick={() => showHelp = true}>?</button>
    </div>
    <button class="primary" onclick={handleExport} disabled={!gridData}>
      Export HTML
    </button>
  </header>

  <main>
    <aside class="sidebar">
      <div class="input-tabs">
        <button
          class:active={inputMode === 'icons'}
          onclick={() => inputMode = 'icons'}
        >
          Icons
        </button>
        <button
          class:active={inputMode === 'upload'}
          onclick={() => inputMode = 'upload'}
        >
          Upload
        </button>
        <button
          class:active={inputMode === 'paste'}
          onclick={() => inputMode = 'paste'}
        >
          Paste
        </button>
      </div>

      {#if inputMode === 'icons'}
        <IconPicker {icons} onSelect={selectIcon} />
      {:else if inputMode === 'upload'}
        <div class="upload-area">
          <input
            type="file"
            accept=".svg"
            onchange={handleFileUpload}
            id="svg-upload"
          />
          <label for="svg-upload" class="upload-label">
            Drop SVG or click to browse
          </label>
        </div>
      {:else if inputMode === 'paste'}
        <div class="paste-area">
          <textarea
            bind:value={pasteValue}
            placeholder="Paste SVG code here..."
            rows="10"
          ></textarea>
          <button onclick={handlePaste}>Load SVG</button>
        </div>
      {/if}

      <Controls bind:config onUpdate={updateGrid} />

      <div class="embed-options">
        <h3>Export Settings</h3>
        <div class="control-group">
          <label for="embedMode">Sizing Mode</label>
          <select id="embedMode" bind:value={embedMode}>
            <option value="fullscreen">Fullscreen (100vw x 100vh)</option>
            <option value="contained">Contained (100% x 100%)</option>
            <option value="fixed">Fixed Dimensions</option>
          </select>
        </div>
        {#if embedMode === 'fixed'}
          <div class="fixed-dims">
            <div class="control-group">
              <label for="fixedWidth">Width (px)</label>
              <input type="number" id="fixedWidth" bind:value={fixedWidth} min="200" max="3000" />
            </div>
            <div class="control-group">
              <label for="fixedHeight">Height (px)</label>
              <input type="number" id="fixedHeight" bind:value={fixedHeight} min="200" max="2000" />
            </div>
          </div>
        {/if}
      </div>
    </aside>

    <section class="preview">
      <AsciiCanvas {gridData} {config} />
    </section>
  </main>

  <footer>
    <span class="footer-left">ASCII_ANIMATE v1.0</span>
    <div class="footer-links">
      <a href="https://github.com/tghoffdev/ascii-svg-gen" target="_blank" rel="noopener">GitHub</a>
      <span class="divider">|</span>
      <a href="https://tommyhoffman.io" target="_blank" rel="noopener">tommyhoffman.io</a>
    </div>
  </footer>

  {#if showHelp}
    <div class="modal-overlay" onclick={() => showHelp = false}>
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2><span class="accent">//</span> Help</h2>
          <button class="close-btn" onclick={() => showHelp = false}>×</button>
        </div>
        <div class="modal-content">
          <section>
            <h3>Getting Started</h3>
            <p>Select an icon from the library, upload your own SVG, or paste SVG code to generate animated ASCII art with a mouse-reactive glow effect.</p>
          </section>
          <section>
            <h3>Controls</h3>
            <ul>
              <li><strong>Grid Width:</strong> Number of ASCII columns (higher = more detail)</li>
              <li><strong>Cell Size:</strong> Font size in pixels</li>
              <li><strong>Glow Radius:</strong> Size of the mouse glow effect</li>
              <li><strong>Glow Intensity:</strong> Brightness of the glow</li>
              <li><strong>Base Opacity:</strong> Visibility of non-glowing characters</li>
              <li><strong>Base Brightness:</strong> Color intensity of non-glowing characters</li>
              <li><strong>Primary Color:</strong> Glow/hover color</li>
              <li><strong>Secondary Color:</strong> Base character color (two-tone effect)</li>
              <li><strong>Cursor Halo:</strong> Floating ASCII characters orbit the cursor</li>
              <li><strong>Character Set:</strong> Characters used for brightness mapping (dark → bright)</li>
            </ul>
          </section>
          <section>
            <h3>Export Settings</h3>
            <ul>
              <li><strong>Fullscreen:</strong> Canvas fills entire viewport</li>
              <li><strong>Contained:</strong> Canvas fills parent container (use CSS to size)</li>
              <li><strong>Fixed:</strong> Canvas uses specified pixel dimensions</li>
            </ul>
          </section>
          <section>
            <h3>Embedding</h3>
            <p>The exported HTML is self-contained. Add it to your site via iframe or embed directly. The animation responds to mouse movement automatically.</p>
          </section>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h1 {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    letter-spacing: 2px;
  }

  h1 .accent {
    color: var(--accent);
  }

  .help-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    border-color: var(--border-subtle);
  }

  .help-btn:hover {
    color: var(--accent);
    border-color: var(--accent-dim);
  }

  main {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    width: 300px;
    border-right: 1px solid var(--border);
    background: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .input-tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
  }

  .input-tabs button {
    flex: 1;
    border: none;
    border-radius: 0;
    padding: 10px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
  }

  .input-tabs button.active {
    color: var(--accent);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--accent);
  }

  .preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--bg-primary);
  }

  .upload-area {
    padding: 20px;
    text-align: center;
  }

  .upload-area input[type="file"] {
    display: none;
  }

  .upload-label {
    display: block;
    padding: 40px 20px;
    border: 1px dashed var(--border);
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.12s ease;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .upload-label:hover {
    border-color: var(--accent-dim);
    background: var(--bg-tertiary);
    color: var(--accent);
  }

  .paste-area {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .paste-area textarea {
    resize: vertical;
    min-height: 120px;
    font-size: 11px;
  }

  .embed-options {
    padding: 16px;
    border-top: 1px solid var(--border);
  }

  .embed-options h3 {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .embed-options .control-group {
    margin-bottom: 12px;
  }

  .embed-options label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
  }

  .embed-options select,
  .embed-options input {
    width: 100%;
  }

  .fixed-dims {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 12px;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 20px;
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
    font-size: 10px;
    color: var(--text-dim);
  }

  .footer-left {
    letter-spacing: 1px;
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-links a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.12s ease;
  }

  .footer-links a:hover {
    color: var(--accent);
  }

  .footer-links .divider {
    color: var(--border);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 4px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1px;
  }

  .modal-header h2 .accent {
    color: var(--accent);
  }

  .close-btn {
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 18px;
    line-height: 1;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-content section {
    margin-bottom: 20px;
  }

  .modal-content section:last-child {
    margin-bottom: 0;
  }

  .modal-content h3 {
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .modal-content p {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .modal-content ul {
    list-style: none;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-secondary);
  }

  .modal-content li strong {
    color: var(--text-primary);
  }
</style>
