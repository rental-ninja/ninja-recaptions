# Ninja ReCaptions

Instantly translate Loom video captions to 18+ languages in real-time while watching videos.

## Features

- **Real-time Translation**: Automatically translates captions as they appear on screen
- **18+ Languages**: Support for major world languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more
- **Auto-detect Source**: Automatically detects the source language of captions
- **Smart Caching**: Caches translations for faster performance and reduced API usage
- **Easy Toggle**: Enable/disable translation with a single click
- **Overlay Display**: Clean, non-intrusive overlay positioned at the top of the video player
- **Persistent Settings**: Your language preference is saved across browser sessions

## How to Use

1. **Install the Extension**
   - Install from the Chrome Web Store
   - The extension icon will appear in your browser toolbar

2. **Configure Your Settings**
   - Click the extension icon
   - Toggle "Enable Translation" on
   - Select your preferred target language from the dropdown menu

3. **Watch Loom Videos**
   - Navigate to any Loom video (e.g., `https://www.loom.com/share/...`)
   - Make sure captions are enabled in the video player
   - Translations will automatically appear in an overlay at the top of the video

4. **Change Settings Anytime**
   - Click the extension icon to change your target language
   - Toggle translation on/off as needed
   - Settings are automatically saved

## Supported Languages

- English, Spanish, French, German, Italian, Portuguese
- Russian, Japanese, Korean
- Chinese (Simplified & Traditional)
- Arabic, Hindi, Dutch, Polish, Turkish
- Vietnamese, Thai

## How It Works

1. **Caption Detection**: Monitors the Loom video player for caption changes
2. **Translation**: Sends caption text to Google Translate API
3. **Display**: Shows translated text in a clean overlay above the video
4. **Caching**: Stores translations to minimize API calls and improve speed

## Privacy & Security

- No data is collected or stored outside your browser
- Caption text is sent to Google Translate API for translation only
- Settings are stored locally in your browser
- No tracking, no analytics, no data sharing

## Troubleshooting

### Captions not translating?
1. Make sure the translation toggle is enabled (click the extension icon)
2. Verify that captions are enabled in the Loom video player
3. Try refreshing the page
4. Check that you're on a Loom video page (`loom.com/share/*`)

### Translation quality
- The extension uses Google Translate's automatic translation
- For specialized or technical content, translations may vary in accuracy
- Use as a general understanding aid for multilingual content

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: Storage, Active Tab, Loom domains, Google Translate API
- **Architecture**: Content script + Service worker pattern
- **Translation API**: Google Translate public API (no API key required)

## Support & Feedback

If you encounter issues or have suggestions for improvement, please report them through the Chrome Web Store support section.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension is not affiliated with or endorsed by Loom or Google. It's an independent tool created to enhance accessibility of Loom videos through real-time caption translation.

---

**Made to break down language barriers and make video content accessible to everyone.**
