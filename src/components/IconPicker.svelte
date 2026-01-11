<script>
  let { icons, onSelect } = $props()
  let selectedIndex = $state(0)

  function select(icon, index) {
    selectedIndex = index
    onSelect(icon)
  }
</script>

<div class="icon-picker">
  <div class="icon-grid">
    {#each icons as icon, i}
      <button
        class="icon-btn"
        class:selected={i === selectedIndex}
        onclick={() => select(icon, i)}
        title={icon.name}
      >
        {@html icon.svg}
      </button>
    {/each}
  </div>
</div>

<style>
  .icon-picker {
    padding: 16px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .icon-btn {
    aspect-ratio: 1;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .icon-btn:hover {
    border-color: var(--accent-dim);
    background: var(--bg-primary);
  }

  .icon-btn.selected {
    border-color: var(--accent);
    background: var(--bg-primary);
    box-shadow: 0 0 12px rgba(79, 195, 247, 0.3);
  }

  .icon-btn :global(svg) {
    width: 24px;
    height: 24px;
    fill: var(--text-secondary);
    transition: fill 0.15s ease;
  }

  .icon-btn:hover :global(svg),
  .icon-btn.selected :global(svg) {
    fill: var(--accent);
  }
</style>
