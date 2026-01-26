# React Native Web Playground - Vision & Scope

## Project Goal

Build a web-based React Native playground similar to Expo Snack that allows developers to write, preview, and share React Native code directly in the browser.

## Core Features

### Phase 1: Foundation (Current)
- **Editor**: Monaco-based code editor with TypeScript/JSX support
- **Preview**: Web-only execution using react-native-web
- **File Management**: Multi-file projects with file explorer
- **Console**: Real-time logs and errors

### Future Phases
- **Bundling**: Metro-like transformation for npm dependencies
- **Persistence**: Shareable URLs and session storage
- **Security**: Sandboxed execution environment
- **Native Preview**: Android emulator streaming (Phase 8)

## Supported React Native APIs

### Green List (Fully Supported via react-native-web)
- **Core Components**: View, Text, Image, TextInput, ScrollView, FlatList, SectionList
- **Touchables**: TouchableOpacity, TouchableHighlight, Pressable
- **Layout**: StyleSheet, Dimensions, Platform (web)
- **Hooks**: useState, useEffect, useCallback, useMemo, etc.

### Yellow List (Partially Supported with Stubs)
- **Navigation**: Limited support via react-navigation web
- **AsyncStorage**: Web localStorage fallback
- **Animations**: react-native-web animations (limited)
- **Gestures**: Basic touch events only

### Red List (Not Supported - Will Show Errors)
- **Native Modules**: Camera, Location, Bluetooth, etc.
- **Native Navigation**: Native stack, bottom tabs hardware features
- **Background Tasks**: Push notifications, background fetch
- **Device APIs**: Haptics, sensors, biometrics

## Execution Modes

### Default: Web Preview
- Uses react-native-web for component rendering
- Executes in sandboxed iframe
- Instant feedback, no build required
- Full browser DevTools support

### Future: Native Preview (Phase 8)
- Android emulator via WebRTC streaming
- Real device testing capabilities
- Touch event injection
- Full native API access

## Technical Constraints

1. **Security**: All code runs in sandboxed iframes with CSP headers
2. **Performance**: Client-side bundling with caching
3. **Dependencies**: npm packages resolved via CDN (unpkg/jsdelivr)
4. **Browser Support**: Modern browsers only (Chrome, Firefox, Safari, Edge)

## Success Criteria

- ✅ Users can write React Native code in the browser
- ✅ Instant preview updates as they type
- ✅ Clear error messages for unsupported APIs
- ✅ Shareable project URLs
- ✅ Beautiful, intuitive UI matching modern code playgrounds
