// Simple, reliable theme toggle (dark/light) for SubtronicsLLC.com
// - Stores preference in localStorage
// - Respects user's OS preference on first visit

(function () {
  var STORAGE_KEY = 'subtronics_theme_v1';

  function getPreferred() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}

    // Default to OS preference
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    root.setAttribute('data-theme', theme);

    var btn = document.getElementById('themeToggle');
    if (btn) {
      var pressed = theme === 'dark';
      btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');

      // Optional icon swaps
      var sun = btn.querySelector('.sun');
      var moon = btn.querySelector('.moon');
      if (sun && moon) {
        sun.style.display = pressed ? 'inline' : 'none';
        moon.style.display = pressed ? 'none' : 'inline';
      }
    }
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    setTheme(getPreferred());
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
