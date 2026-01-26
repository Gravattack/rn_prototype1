# React Native Web Playground

A web-based React Native playground similar to Expo Snack that allows developers to write, preview, and share React Native code directly in the browser.

## 🚀 Features

- **Monaco Editor**: Full-featured code editor with TypeScript/JSX syntax highlighting
- **Live Preview**: Instant preview using react-native-web
- **File Explorer**: Multi-file project support with folder structure
- **Console**: Real-time logs, errors, and warnings
- **Resizable Panels**: Customizable workspace layout
- **Dark Mode**: Automatic dark mode support

## 📋 Project Status

### ✅ Phase 0 & 1: Foundation (Complete)
- Next.js 14+ with App Router
- TypeScript with strict mode
- ESLint & Prettier configuration
- Three-panel resizable UI layout
- Monaco editor integration
- Basic component structure

### 🚧 Upcoming Phases
- **Phase 2**: Enhanced editor features and project templates
- **Phase 3**: React Native Web runtime integration
- **Phase 4**: Metro-like bundling system
- **Phase 5**: Native API stubs
- **Phase 6**: Persistence and shareable URLs
- **Phase 7**: Security and sandboxing
- **Phase 8**: Native preview (Android emulator)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Editor**: Monaco Editor
- **Runtime**: React Native Web (planned)
- **Styling**: Tailwind CSS
- **UI Components**: Lucide Icons, react-resizable-panels

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd playground

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

## 📁 Project Structure

```
playground/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main playground page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PlaygroundLayout.tsx  # Main layout
│   ├── Editor/            # Monaco editor wrapper
│   ├── Preview/           # Preview iframe
│   ├── FileExplorer/      # File tree
│   └── Console/           # Console panel
├── lib/                   # Core libraries
│   ├── bundler/           # Babel transformer (coming)
│   ├── runtime/           # RN web runtime (coming)
│   └── stubs/             # Native API stubs (coming)
├── docs/                  # Documentation
│   └── vision.md          # Project vision & scope
└── public/                # Static assets
```

## 🎯 Supported React Native APIs

See [docs/vision.md](docs/vision.md) for detailed API support classification:

- **Green List**: Fully supported (View, Text, StyleSheet, etc.)
- **Yellow List**: Partially supported with stubs
- **Red List**: Not supported (native modules)

## 🤝 Contributing

This is currently in active development. Check the [task breakdown](.gemini/antigravity/brain/cf9ff710-c1a5-4a0b-8eff-70116a5b5ba3/task.md) for upcoming work.

## 📄 License

MIT

---

**Note**: This project is in early development. Many features are planned but not yet implemented.
