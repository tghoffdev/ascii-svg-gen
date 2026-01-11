<script>
  let { config = $bindable(), onUpdate } = $props()

  const charSetPresets = [
    { name: 'Standard', value: ' .:-=+*#%@' },
    { name: 'Dense', value: ' .:;!|+*=#%@' },
    { name: 'Minimal', value: ' .oO@' },
    { name: 'Blocks', value: ' ░▒▓█' },
    { name: 'Binary', value: '01' },
    { name: 'Dots', value: ' ·•●' },
    { name: 'Arrows', value: ' ←↑→↓' },
    { name: 'Slashes', value: ' /|\\' },
    { name: 'Custom', value: '' }
  ]

  let selectedPreset = $state('Standard')

  function handleChange() {
    onUpdate?.()
  }

  function handlePresetChange(e) {
    const preset = charSetPresets.find(p => p.name === e.target.value)
    if (preset && preset.value) {
      config.charSet = preset.value
    }
    selectedPreset = e.target.value
  }
</script>

<div class="controls">
  <h3>Parameters</h3>

  <div class="control-group">
    <label for="gridWidth">Grid Width: {config.gridWidth}</label>
    <input
      type="range"
      id="gridWidth"
      bind:value={config.gridWidth}
      min="40"
      max="150"
      step="5"
      onchange={handleChange}
    />
  </div>

  <div class="control-group">
    <label for="cellSize">Cell Size: {config.cellSize}px</label>
    <input
      type="range"
      id="cellSize"
      bind:value={config.cellSize}
      min="8"
      max="24"
      step="1"
    />
  </div>

  <div class="control-group">
    <label for="glowRadius">Glow Radius: {config.glowRadius}px</label>
    <input
      type="range"
      id="glowRadius"
      bind:value={config.glowRadius}
      min="50"
      max="400"
      step="10"
    />
  </div>

  <div class="control-group">
    <label for="glowIntensity">Glow Intensity: {config.glowIntensity.toFixed(1)}</label>
    <input
      type="range"
      id="glowIntensity"
      bind:value={config.glowIntensity}
      min="0.1"
      max="2"
      step="0.1"
    />
  </div>

  <div class="control-group">
    <label for="baseOpacity">Base Opacity: {config.baseOpacity.toFixed(2)}</label>
    <input
      type="range"
      id="baseOpacity"
      bind:value={config.baseOpacity}
      min="0.05"
      max="0.8"
      step="0.05"
    />
  </div>

  <div class="control-group">
    <label for="baseBrightness">Base Brightness: {config.baseBrightness.toFixed(2)}</label>
    <input
      type="range"
      id="baseBrightness"
      bind:value={config.baseBrightness}
      min="0.1"
      max="1.0"
      step="0.05"
    />
  </div>

  <div class="control-row">
    <div class="control-group">
      <label for="glowColor">Glow Color</label>
      <input
        type="color"
        id="glowColor"
        bind:value={config.glowColor}
      />
    </div>

    <div class="control-group">
      <label for="bgColor">Background</label>
      <input
        type="color"
        id="bgColor"
        bind:value={config.bgColor}
      />
    </div>
  </div>

  <div class="control-group">
    <label for="charSetPreset">Character Set</label>
    <select
      id="charSetPreset"
      value={selectedPreset}
      onchange={handlePresetChange}
    >
      {#each charSetPresets as preset}
        <option value={preset.name}>{preset.name}</option>
      {/each}
    </select>
  </div>

  <div class="control-group">
    <label for="charSet">Custom Characters</label>
    <input
      type="text"
      id="charSet"
      bind:value={config.charSet}
      placeholder=" .:-=+*#%@"
      onfocus={() => selectedPreset = 'Custom'}
    />
  </div>

  <div class="presets">
    <label>Presets</label>
    <div class="preset-buttons">
      <button onclick={() => {
        config.glowColor = '#4fc3f7'
        config.bgColor = '#000000'
        config.charSet = ' .:-=+*#%@'
      }}>Neon Blue</button>
      <button onclick={() => {
        config.glowColor = '#00ff00'
        config.bgColor = '#000000'
        config.charSet = ' .oO@'
      }}>Matrix</button>
      <button onclick={() => {
        config.glowColor = '#ff6b6b'
        config.bgColor = '#1a1a2e'
        config.charSet = ' .:+*#'
      }}>Synthwave</button>
      <button onclick={() => {
        config.glowColor = '#ffd700'
        config.bgColor = '#0d0d0d'
        config.charSet = ' -=+*%@'
      }}>Gold</button>
    </div>
  </div>
</div>

<style>
  .controls {
    padding: 16px;
    border-top: 1px solid var(--border);
  }

  h3 {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .control-group {
    margin-bottom: 16px;
  }

  .control-group label {
    display: block;
    margin-bottom: 6px;
  }

  .control-group input[type="range"] {
    width: 100%;
  }

  .control-group input[type="text"],
  .control-group select {
    width: 100%;
  }

  .control-row {
    display: flex;
    gap: 16px;
  }

  .control-row .control-group {
    flex: 1;
  }

  .presets {
    margin-top: 24px;
  }

  .presets label {
    display: block;
    margin-bottom: 8px;
  }

  .preset-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .preset-buttons button {
    font-size: 11px;
    padding: 8px;
  }
</style>
