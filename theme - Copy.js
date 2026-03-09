// Simple, reliable theme toggle (dark/light) for SubtronicsLLC.com
// - Stores preference in localStorage
// - Respects user's OS preference on first visit

(function () {
  // Single theme key used site-wide
  var STORAGE_KEY = 'subtronics_theme_v2';

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

      // Support BOTH button variants used across the site:
      // 1) <span class="sun">☀️</span><span class="moon">🌙</span>
      // 2) <span class="icon">🌙</span><span class="label">Dark</span>
      var sun = btn.querySelector('.sun');
      var moon = btn.querySelector('.moon');
      if (sun && moon) {
        sun.style.display = pressed ? 'none' : 'inline';
        moon.style.display = pressed ? 'inline' : 'none';
      }

      var icon = btn.querySelector('.icon');
      var label = btn.querySelector('.label');
      if (icon) icon.textContent = pressed ? '🌙' : '☀️';
      if (label) label.textContent = pressed ? 'Dark' : 'Light';
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
