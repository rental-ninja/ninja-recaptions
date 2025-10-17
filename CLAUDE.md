# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ninja ReCaptions is a Chrome extension (Manifest V3) that provides real-time translation of Loom video captions. It monitors caption changes on Loom video pages, translates them via Google Translate API, and displays translations in an overlay above the video player.

## Architecture

### Three-Component Extension Pattern

1. **content.js** (Content Script)
   - Runs on `loom.com/share/*` pages
   - Monitors DOM mutations to detect caption changes
   - Implements caption detection logic with extensive filtering to avoid translating UI elements
   - Manages translation overlay positioning and display
   - Caches translations in a Map to reduce API calls
   - Communicates with background script via chrome.runtime.sendMessage

2. **background.js** (Service Worker)
   - Handles translation requests from content script
   - Makes fetch requests to Google Translate API endpoint
   - Uses free public API (`translate.googleapis.com/translate_a/single`) with no API key required
   - Returns translated text to content script

3. **popup.js** + popup.html (Extension Popup UI)
   - Provides user controls for enabling/disabling translation
   - Language selector dropdown with 18+ supported languages
   - Uses chrome.storage.sync for persistent settings
   - Settings changes propagate to content script via chrome.storage.onChanged

### Key Technical Details

- **Caption Detection Strategy**: Uses MutationObserver on the video player container to detect new caption elements
- **Filtering Logic**: Extensive skip patterns to avoid translating UI elements (controls, menus, settings)
- **Overlay Positioning**: Absolutely positioned inside video container (not body), uses debouncing to prevent flickering
- **State Management**: Settings stored in chrome.storage.sync, shared across content script and popup

## Development Commands

There are no build commands - this is a vanilla JavaScript Chrome extension with no compilation step.

### Testing the Extension

1. **Load unpacked extension**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select this repository directory

2. **Test on Loom**:
   - Navigate to any Loom video (`https://www.loom.com/share/*`)
   - Enable captions in the video player
   - Click the extension icon to configure settings
   - Translation overlay should appear at the top of the video

3. **Debug logging**:
   - Set `DEBUG = true` in content.js and/or background.js
   - Open DevTools Console tab to see detailed logs
   - Content script logs: Inspect the Loom page
   - Background script logs: chrome://extensions/ → "Inspect views: service worker"

### Packaging for Chrome Web Store

```bash
# Create a zip file excluding development files
zip -r ninja-recaptions-v1.0.0.zip . -x "*.git*" "*.DS_Store" "*node_modules*" "*.md" "*backup*" "*.zip"
```

## Common Modification Areas

### Adding New Languages

Edit both files:
- `popup.html`: Add `<option>` elements to the language select dropdown
- Language codes follow ISO 639-1 standard (e.g., 'es' for Spanish, 'zh-CN' for Chinese Simplified)

### Adjusting Caption Detection

Caption detection logic is in `content.js`:
- `shouldSkipElement()`: Filter out non-caption elements by class, role, attributes
- `isCaptionText()`: Validate that text content looks like a caption
- `NON_CAPTION_PATTERNS`: Regex patterns to skip UI elements
- `SKIP_CLASSES` and `SKIP_CLASS_PATTERNS`: Class name filters

### Modifying Translation Overlay Appearance

Overlay styling in `content.js` → `createTranslationOverlay()`:
- Position: Currently top center of video player
- Styling: Inline styles in cssText (background, padding, font-size, etc.)
- Container: Appended to video container element, not document.body

### Changing Translation API

Translation API call in `background.js` → `translateText()`:
- Current: Google Translate free public API
- To use different API: Modify the fetch URL and response parsing logic
- May require API key handling and additional permissions in manifest.json

## Important Constraints

- **Target Platform**: Chrome only (Manifest V3)
- **Target Website**: Loom videos only (`https://www.loom.com/share/*`)
- **No External Dependencies**: Pure vanilla JavaScript, no npm packages or bundlers
- **No API Key Required**: Uses free public Google Translate endpoint
- **Storage**: chrome.storage.sync has 100KB limit total, 8KB per item

## File Structure

```
├── manifest.json           # Extension configuration
├── content.js             # Caption monitoring and overlay (main logic)
├── background.js          # Translation API service worker
├── popup.html             # Extension popup UI
├── popup.js               # Popup UI logic
├── icons/                 # Extension icons (16, 64, 128px)
└── privacy-policy.html    # Privacy policy page
```
