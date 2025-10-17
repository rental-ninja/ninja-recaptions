# Chrome Web Store Submission Guide

## Package Ready
✅ **ninja-recaptions-v1.0.0.zip** has been created and is ready for upload

## Submission Steps

### 1. Developer Account Setup
- Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Sign in with your Google account
- If first time: Pay one-time $5 developer registration fee

### 2. Upload Your Extension
1. Click **"New Item"** button
2. Upload **ninja-recaptions-v1.0.0.zip**
3. Chrome will validate your package

### 3. Store Listing Information

#### **Product Details**
- **Name**: Ninja ReCaptions
- **Summary** (132 characters max):
  ```
  Translate Loom video captions to 18+ languages in real-time while watching videos
  ```

#### **Description** (you can use the README content, formatted for the store):
```
Instantly translate Loom video captions to 18+ languages in real-time while watching videos.

FEATURES:
• Real-time Translation - Automatically translates captions as they appear
• 18+ Languages - Support for major world languages including English, Spanish, French, German, Chinese, Japanese, Arabic, and more
• Auto-detect Source - Automatically detects the source language of captions
• Smart Caching - Caches translations for faster performance and reduced API usage
• Easy Toggle - Enable/disable translation with a single click
• Clean Overlay - Non-intrusive overlay positioned at the top of the video player
• Persistent Settings - Your language preference is saved across sessions

HOW TO USE:
1. Install the extension
2. Click the extension icon and toggle "Enable Translation"
3. Select your target language
4. Watch any Loom video with captions enabled
5. Translations appear automatically in an overlay

SUPPORTED LANGUAGES:
English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese (Simplified & Traditional), Arabic, Hindi, Dutch, Polish, Turkish, Vietnamese, Thai

PRIVACY & SECURITY:
✓ No data collection or storage outside your browser
✓ Caption text sent to Google Translate API only
✓ Settings stored locally in your browser
✓ No tracking, no analytics, no data sharing

Made to break down language barriers and make video content accessible to everyone.
```

#### **Category**
- Primary: **Productivity**
- Secondary: **Communication** or **Accessibility**

#### **Language**
- English

### 4. Required Visual Assets

You need to create these promotional images:

#### **Screenshots** (Required - at least 1, up to 5)
- **Size**: 1280x800 or 640x400 pixels
- **Show**:
  1. Extension popup with settings
  2. Loom video with translation overlay in action
  3. Multiple language options
  4. Before/after comparison

#### **Store Icon** (Required)
- **Size**: 128x128 pixels
- ✅ You already have this: `icons/icon128.png`

#### **Promotional Images** (Optional but recommended)
- **Small tile**: 440x280 pixels
- **Large tile**: 920x680 pixels
- **Marquee**: 1400x560 pixels

**Tip**: Use Canva or Figma to create these quickly using screenshots of your extension in action.

### 5. Privacy Settings

#### **Permissions Justification**
You'll need to explain why you need each permission:

- **storage**: "Store user language preferences and translation cache locally"
- **host_permissions (loom.com)**: "Required to inject caption translation overlay into Loom video pages"
- **host_permissions (translate.googleapis.com)**: "Access Google Translate API to translate caption text"

#### **Privacy Policy**
You should host a privacy policy. Options:
1. Add to your website: https://try.rental-ninja.com/ninja-recaptions/privacy
2. Use GitHub Pages: Create a privacy.html in your repo

**Sample Privacy Policy**:
```
Privacy Policy for Ninja ReCaptions

Data Collection:
- No personal data is collected
- No usage analytics or tracking
- No data is stored on external servers

Data Processing:
- Caption text is sent to Google Translate API for translation only
- User preferences (language selection, toggle state) are stored locally in browser
- Translation cache is stored locally in browser for performance

Third-Party Services:
- Google Translate API: Caption text is transmitted for translation

Data Retention:
- All data remains on your device
- Clear browser extension data to remove all stored information

Contact: [your email or support link]
Last Updated: October 14, 2024
```

### 6. Distribution Settings
- **Visibility**: Public
- **Pricing**: Free
- **Regions**: All regions (or select specific ones)

### 7. Review Process
- Submit for review
- Typically takes **1-3 business days**
- You'll receive email notification
- Check dashboard for status updates

### 8. After Approval
- Extension will be live on Chrome Web Store
- You'll get a public URL like: `https://chrome.google.com/webstore/detail/[extension-id]`
- Update your README.md with the Chrome Web Store link

## Quick Checklist

Before submitting:
- [x] manifest.json is valid and updated
- [x] All icons are present and correct sizes
- [x] Extension package (zip) created
- [ ] Screenshots prepared (1-5 images at 1280x800)
- [ ] Privacy policy URL ready
- [ ] Promotional images created (optional)
- [ ] Developer account registered ($5 fee)
- [ ] Store listing description written
- [ ] Permission justifications prepared

## Need Screenshots?

To capture good screenshots:
1. Install your extension locally (chrome://extensions/ → Load unpacked)
2. Visit a Loom video: https://www.loom.com/share/[any-video]
3. Enable captions and your extension
4. Use screenshot tool to capture:
   - Extension popup
   - Video with translation overlay
   - Settings panel

## Useful Links
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Publication Guidelines](https://developer.chrome.com/docs/webstore/program-policies/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best_practices/)

---

Good luck with your submission! 🚀
