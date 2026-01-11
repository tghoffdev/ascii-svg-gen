# // ASCII_ANIMATE

Transform SVG graphics into interactive, animated ASCII art with mouse-reactive glow effects.

**[Live Demo](https://ascii-svg-gen.vercel.app)** | **[Portfolio](https://tommyhoffman.io)**

---

## Features

- **SVG to ASCII** - Convert any SVG into animated ASCII art
- **20+ Built-in Icons** - Font Awesome icons ready to use
- **Character Animation** - Matrix-style character cycling effect
- **Mouse Glow** - Interactive glow that follows your cursor
- **Customizable** - Full control over colors, characters, and effects
- **Export** - Download as self-contained HTML file

## Parameters

| Control | Description |
|---------|-------------|
| Grid Width | Number of ASCII columns (detail level) |
| Cell Size | Font size in pixels |
| Glow Radius | Size of mouse glow effect |
| Glow Intensity | Brightness of the glow |
| Base Opacity | Visibility of non-hovered characters |
| Base Brightness | Color intensity of non-hovered characters |
| Character Set | Presets: Standard, Dense, Blocks, Binary, etc. |
| Glow Color | Color of the glow effect |
| Background | Canvas background color |

## Character Set Presets

- **Standard** - ` .:-=+*#%@`
- **Dense** - ` .:;!|+*=#%@`
- **Minimal** - ` .oO@`
- **Blocks** - ` ░▒▓█`
- **Binary** - `01`
- **Dots** - ` ·•●`

## Export Options

- **Fullscreen** - 100vw × 100vh (covers viewport)
- **Contained** - 100% × 100% (fills parent container)
- **Fixed** - Custom pixel dimensions

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- [Svelte 5](https://svelte.dev) - Frontend framework
- [Vite](https://vitejs.dev) - Build tool
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) - Monospace font
- HTML Canvas - Rendering

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tghoffdev/ascii-svg-gen)

Or manually:

```bash
npm i -g vercel
vercel
```

## License

MIT

---

Made by [Tommy Hoffman](https://tommyhoffman.io)
