// elfsight-loader.js
// Loads Elfsight platform script and attempts to initialize/load widgets.
(function(){
  try{
    const existing = document.querySelector('script[src^="https://elfsightcdn.com/platform.js"]');
    if(existing) return;
    const s = document.createElement('script');
    s.src = 'https://elfsightcdn.com/platform.js';
    s.async = true;
    s.defer = true;
    s.addEventListener('load', function(){
      try{
        if(window.elfsight && typeof window.elfsight.init === 'function') window.elfsight.init();
        if(window.elfsight && typeof window.elfsight.load === 'function') window.elfsight.load();
      }catch(e){}
    });
    document.body.appendChild(s);
  }catch(e){}
})();
