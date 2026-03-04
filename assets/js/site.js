// Site helpers (theme toggle)
(function(){
  function preferredTheme(){
    try{
      const stored = localStorage.getItem('theme');
      if(stored === 'light' || stored === 'dark') return stored;
    }catch(e){}
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    try{ localStorage.setItem('theme', theme); }catch(e){}
    const btn = document.getElementById('themeToggle');
    if(btn){
      const isLight = theme === 'light';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      btn.querySelector('.icon').textContent = isLight ? '☀️' : '🌙';
      btn.querySelector('.label').textContent = isLight ? 'Light' : 'Dark';
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    applyTheme(preferredTheme());
    const btn = document.getElementById('themeToggle');
    if(btn){
      btn.addEventListener('click', function(){
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();