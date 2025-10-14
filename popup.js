// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['targetLanguage', 'translationEnabled'], (data) => {
    document.getElementById('languageSelect').value = data.targetLanguage || 'en';
    document.getElementById('enableToggle').checked = data.translationEnabled !== false;
  });
});

// Save language selection
document.getElementById('languageSelect').addEventListener('change', (e) => {
  const language = e.target.value;
  chrome.storage.sync.set({ targetLanguage: language }, () => {
    showStatus('Language updated!');
  });
});

// Save toggle state
document.getElementById('enableToggle').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ translationEnabled: enabled }, () => {
    showStatus(enabled ? 'Translation enabled!' : 'Translation disabled');
  });
});

// Show status message
function showStatus(message) {
  const status = document.getElementById('status');
  status.textContent = message;
  setTimeout(() => {
    status.textContent = 'Ready to translate!';
  }, 2000);
}
