// Google Translate API endpoint (free, no API key needed for basic use)
const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';
const DEBUG = false; // Set to false to disable debug logs

// Debug logger
function log(...args) {
  if (DEBUG) {
    console.log('[Ninja ReCaptions BG]', ...args);
  }
}

log('=== Background Service Worker Initialized ===');

// Listen for translation requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    log('📩 Translation request received');
    log('  Text:', request.text);
    log('  Target language:', request.targetLang);
    log('  From tab:', sender.tab?.id);

    translateText(request.text, request.targetLang)
      .then(translatedText => {
        log('✓ Translation successful');
        log('  Original:', request.text);
        log('  Translated:', translatedText);
        sendResponse({ translatedText });
      })
      .catch(error => {
        log('✗ Translation failed:', error.message);
        console.error('[Ninja ReCaptions BG] Translation error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep message channel open for async response
  }
});

// Translate using Google Translate's public API
async function translateText(text, targetLang) {
  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto', // Auto-detect source language
      tl: targetLang,
      dt: 't',
      q: text
    });

    const url = `${TRANSLATE_API}?${params}`;
    log('  Fetching from API:', url);

    const response = await fetch(url);

    log('  API Response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    log('  API Response data structure:', {
      hasData: !!data,
      firstLevel: data ? typeof data[0] : 'undefined',
      secondLevel: data && data[0] ? typeof data[0][0] : 'undefined',
      thirdLevel: data && data[0] && data[0][0] ? typeof data[0][0][0] : 'undefined'
    });

    // Parse the response format
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      const translated = data[0][0][0];
      log('  Extracted translation:', translated);
      return translated;
    }

    log('⚠ Could not extract translation, returning original text');
    log('  Raw response data:', JSON.stringify(data).substring(0, 200));
    return text; // Return original if translation fails
  } catch (error) {
    log('✗ Exception in translateText:', error);
    console.error('[Ninja ReCaptions BG] Translation error:', error);
    throw error;
  }
}
