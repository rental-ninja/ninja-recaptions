// Configuration
let targetLanguage = 'en'; // Default target language
let isTranslationEnabled = false;
let captionCache = new Map(); // Cache translations
let lastCaptionText = ''; // Track last caption to avoid duplicates
let translationOverlay = null; // The overlay div element
let updateTimeout = null; // Debounce timer for overlay updates
const DEBUG = false; // Set to false to disable debug logs
const DEBOUNCE_DELAY = 300; // ms to wait before updating overlay

// UI element classes to skip (these are NOT captions)
const SKIP_CLASSES = [
  'LayersContainer',
  'VideoLayersContainer',
  'controls',
  'button',
  'menu',
  'slider',
  'volume',
  'playback',
  'timeline',
  'progress'
];

// Patterns that indicate this is NOT a caption
const NON_CAPTION_PATTERNS = [
  /\d+[.,]?\d*×.*\d+[.,]?\d*×/,  // Multiple playback speeds (0.8×1×1.2× or 0,8×1×1,2×)
  /⚡/,            // Lightning bolt icon
  /Your user agent/i,  // Error messages
  /HTML5/i,       // Technical messages
  /\d+\s*(min|hour)/i,  // Time indicators anywhere in text
  /does not support/i,  // Error messages
  /css-[a-z0-9]+/i,  // CSS class names (css-6jcuy3)
  /quality/i,     // Quality settings
  /\d+p\b/i,      // Resolution (1080p, 720p, 480p, 360p)
  /^\d+p$/i,      // Just resolution number
  /auto.*quality/i,  // Auto quality
  /settings?/i,   // Settings menu
  /speed/i,       // Playback speed
  /volume/i,      // Volume controls
  /mute/i,        // Mute button
  /play/i,        // Play button (if standalone)
  /pause/i,       // Pause button
  /fullscreen/i,  // Fullscreen
  /captions?/i,   // Caption menu itself
  /subtitles?/i,  // Subtitle menu
  /transcript/i,  // Transcript menu
  /download/i,    // Download button
  /share/i,       // Share button
  /embed/i,       // Embed button
];

// Additional class patterns to skip
const SKIP_CLASS_PATTERNS = [
  /quality/i,
  /settings/i,
  /controls/i,
  /menu/i,
  /button/i,
  /icon/i,
];

// Debug logger
function log(...args) {
  if (DEBUG) {
    console.log('[Ninja ReCaptions]', ...args);
  }
}

// Load settings from storage
chrome.storage.sync.get(['targetLanguage', 'translationEnabled'], (data) => {
  targetLanguage = data.targetLanguage || 'en';
  isTranslationEnabled = data.translationEnabled !== false;
  log('Settings loaded:', { targetLanguage, isTranslationEnabled });
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.targetLanguage) {
    targetLanguage = changes.targetLanguage.newValue;
    captionCache.clear();
    log('Target language changed to:', targetLanguage);
  }
  if (changes.translationEnabled) {
    isTranslationEnabled = changes.translationEnabled.newValue;
    log('Translation enabled:', isTranslationEnabled);

    // Hide overlay if translation is disabled
    if (!isTranslationEnabled) {
      hideTranslation();
    }
  }
});

// Check if element should be skipped (not a caption)
function shouldSkipElement(element) {
  // Check class names for known UI elements
  const className = element.className || '';

  // Check against all skip classes
  for (const skipClass of SKIP_CLASSES) {
    if (className.includes(skipClass)) {
      log('  ⊘ Skipping UI element class:', skipClass);
      return true;
    }
  }

  // Check against skip class patterns
  for (const pattern of SKIP_CLASS_PATTERNS) {
    if (pattern.test(className)) {
      log('  ⊘ Skipping class pattern:', pattern);
      return true;
    }
  }

  // Check element attributes for UI hints
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');

  if (role && (role.includes('button') || role.includes('menu') || role.includes('slider'))) {
    log('  ⊘ Skipping element with role:', role);
    return true;
  }

  if (ariaLabel) {
    log('  ⊘ Skipping element with aria-label:', ariaLabel);
    return true;
  }

  // Check text content patterns
  const text = element.textContent?.trim() || '';

  // Skip if text matches non-caption patterns
  for (const pattern of NON_CAPTION_PATTERNS) {
    if (pattern.test(text)) {
      log('  ⊘ Skipping non-caption pattern:', pattern, '- text:', text.substring(0, 30));
      return true;
    }
  }

  // Skip if text is too long (likely not a single caption)
  if (text.length > 300) {
    log('  ⊘ Text too long for a caption:', text.length, 'chars');
    return true;
  }

  // Skip if element has multiple children (complex UI structure)
  if (element.children.length > 5) {
    log('  ⊘ Too many child elements:', element.children.length);
    return true;
  }

  // Skip if same as last caption (avoid duplicates)
  if (text === lastCaptionText) {
    log('  ⊘ Duplicate caption text');
    return true;
  }

  // Skip if it's a clickable element (likely a button/control)
  if (element.onclick || element.hasAttribute('onclick')) {
    log('  ⊘ Skipping clickable element');
    return true;
  }

  return false;
}

// Check if text looks like a real caption
function isCaptionText(text) {
  if (!text || text.length === 0) {
    log('  ⊘ Empty text');
    return false;
  }
  if (text.length < 2) {
    log('  ⊘ Text too short:', text.length);
    return false;
  }
  if (text.length > 300) {
    log('  ⊘ Text too long:', text.length);
    return false;
  }

  // Check for non-caption patterns
  for (const pattern of NON_CAPTION_PATTERNS) {
    if (pattern.test(text)) {
      log('  ⊘ Matched non-caption pattern:', pattern, 'in text:', text.substring(0, 30));
      return false;
    }
  }

  // Must have at least some letters (not just symbols/numbers)
  const hasLetters = /[a-zA-Z]/.test(text);
  if (!hasLetters) {
    log('  ⊘ No letters in text');
    return false;
  }

  return true;
}

// Create translation overlay div inside video player
function createTranslationOverlay() {
  if (translationOverlay && document.body.contains(translationOverlay)) {
    log('Translation overlay already exists');
    return translationOverlay;
  }

  // Find the video container
  const videoContainer = findVideoContainer();
  if (!videoContainer) {
    log('⚠ Video container not found, retrying in 1s...');
    setTimeout(createTranslationOverlay, 1000);
    return null;
  }

  translationOverlay = document.createElement('div');
  translationOverlay.id = 'loom-translation-overlay';
  translationOverlay.style.cssText = `
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 18px;
    font-family: Arial, sans-serif;
    z-index: 999999;
    max-width: 90%;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: none;
    display: none;
    line-height: 1.4;
  `;

  // Ensure video container has position relative
  const currentPosition = window.getComputedStyle(videoContainer).position;
  if (currentPosition === 'static') {
    videoContainer.style.position = 'relative';
  }

  videoContainer.appendChild(translationOverlay);
  log('✓ Translation overlay created inside video player');
  log('  Container:', videoContainer.tagName, videoContainer.className);
  return translationOverlay;
}

// Find the video player container
function findVideoContainer() {
  // Try multiple selectors to find the video container
  const selectors = [
    'article',  // Main article container
    'video',    // Video element itself
    '[class*="VideoContainer"]',
    '[class*="PlayerContainer"]',
    '[class*="player"]'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      log('Found video container using selector:', selector);
      // If it's a video element, get its parent
      if (element.tagName === 'VIDEO') {
        return element.parentElement;
      }
      return element;
    }
  }

  log('⚠ No video container found');
  return null;
}

// Show translation in overlay (with debounce to prevent flickering)
function showTranslation(text) {
  // Clear any pending updates
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  // Debounce the update to prevent flickering
  updateTimeout = setTimeout(() => {
    if (!translationOverlay) {
      createTranslationOverlay();
    }

    // If overlay still doesn't exist (video container not ready), try again later
    if (!translationOverlay) {
      log('⚠ Overlay not ready, queueing translation...');
      setTimeout(() => showTranslation(text), 500);
      return;
    }

    if (text && text.trim().length > 0) {
      // Only update if text has actually changed
      if (translationOverlay.textContent !== text) {
        translationOverlay.textContent = text;
        translationOverlay.style.display = 'block';
        log('📺 Displaying translation in overlay:', text);
      }
    } else {
      hideTranslation();
    }
  }, DEBOUNCE_DELAY);
}

// Hide translation overlay
function hideTranslation() {
  if (translationOverlay) {
    translationOverlay.style.display = 'none';
    log('🔲 Hiding translation overlay');
  }
}

// More reliable: observe the entire player for caption changes
function observeCaptions() {
  const playerContainer = document.querySelector('article') || document.querySelector('video')?.parentElement;

  if (!playerContainer) {
    log('Player container not found, retrying in 1s...');
    setTimeout(observeCaptions, 1000);
    return;
  }

  log('Found player container:', playerContainer.tagName, playerContainer.className);

  // Create the translation overlay
  createTranslationOverlay();

  // MutationObserver to detect caption changes
  let mutationCount = 0;
  const observer = new MutationObserver((mutations) => {
    mutationCount++;
    log(`Mutation #${mutationCount}: ${mutations.length} changes detected`);

    mutations.forEach((mutation, index) => {
      log(`  Mutation ${index + 1}:`, {
        type: mutation.type,
        target: mutation.target.nodeName,
        addedNodes: mutation.addedNodes.length,
        removedNodes: mutation.removedNodes.length
      });

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if this is a caption element
          const textContent = node.textContent?.trim();
          if (textContent && isCaptionText(textContent)) {
            log('    ✓ Added node with text:', textContent.substring(0, 50) + '...');
            if (!shouldSkipElement(node)) {
              handleCaptionChange(node, textContent);
            }
          }
        }
      });

      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        const target = mutation.target.nodeType === Node.TEXT_NODE
          ? mutation.target.parentElement
          : mutation.target;

        if (target && target.textContent) {
          const textContent = target.textContent.trim();
          if (isCaptionText(textContent)) {
            log('    ✓ Changed text detected:', textContent.substring(0, 50) + '...');
            if (!shouldSkipElement(target)) {
              handleCaptionChange(target, textContent);
            }
          }
        }
      }
    });
  });

  observer.observe(playerContainer, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });

  log('✓ Monitoring captions on:', playerContainer.tagName);
  log('Settings:', { targetLanguage, isTranslationEnabled });
}

// Handle caption text changes
async function handleCaptionChange(element, text) {
  if (!isTranslationEnabled) {
    log('⊗ Translation disabled, skipping:', text.substring(0, 30) + '...');
    hideTranslation();
    return;
  }

  if (!text || text.length === 0) {
    log('⊗ Empty text, skipping');
    hideTranslation();
    return;
  }

  log('→ Processing caption:', text);
  log('  Element:', element.tagName, element.className);

  // Update last caption text
  lastCaptionText = text;

  // Check cache first
  if (captionCache.has(text)) {
    const cached = captionCache.get(text);
    log('✓ Using cached translation:', cached);
    showTranslation(cached);
    return;
  }

  // Translate the caption
  try {
    log('  Requesting translation to', targetLanguage + '...');
    const translatedText = await translateText(text, targetLanguage);

    if (translatedText && translatedText !== text) {
      log('✓ Translation received:', translatedText);
      showTranslation(translatedText);
      captionCache.set(text, translatedText);
      log(`  Cache size: ${captionCache.size}`);
    } else {
      log('⚠ Translation same as original or empty');
      // Show original text if translation is the same
      showTranslation(text);
    }
  } catch (error) {
    log('✗ Translation error:', error);
    console.error('[Ninja ReCaptions] Translation error:', error);
    // Show original text on error
    showTranslation(text);
  }
}

// Send text to background for translation
function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    log('  Sending to background worker...');
    chrome.runtime.sendMessage(
      {
        action: 'translate',
        text: text,
        targetLang: targetLang
      },
      (response) => {
        if (chrome.runtime.lastError) {
          log('✗ Runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response && response.error) {
          log('✗ Response error:', response.error);
          reject(response.error);
        } else if (response && response.translatedText) {
          log('  Background worker response OK');
          resolve(response.translatedText);
        } else {
          log('✗ Invalid response:', response);
          reject(new Error('Invalid response from background worker'));
        }
      }
    );
  });
}

// Initialize when page loads
log('=== Ninja ReCaptions Initialized ===');
log('Document ready state:', document.readyState);
log('URL:', window.location.href);

if (document.readyState === 'loading') {
  log('Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    log('DOMContentLoaded fired');
    observeCaptions();
  });
} else {
  log('Document already loaded, starting observer');
  observeCaptions();
}
