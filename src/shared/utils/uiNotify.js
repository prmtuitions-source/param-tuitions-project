const uiNotify = {
  alert(msg) {
    if (typeof globalThis !== 'undefined' && typeof globalThis.alert === 'function') {
      try { globalThis.alert(msg); } catch (e) { console.warn('alert failed', e); }
      return;
    }
    console.warn('alert:', msg);
  },
  confirm(msg) {
    if (typeof globalThis !== 'undefined' && typeof globalThis.confirm === 'function') {
      try { return globalThis.confirm(msg); } catch (e) { console.warn('confirm failed', e); }
    }
    return true;
  },
  prompt(msg, defaultValue = '') {
    if (typeof globalThis !== 'undefined' && typeof globalThis.prompt === 'function') {
      try { return globalThis.prompt(msg, defaultValue); } catch (e) { console.warn('prompt failed', e); }
    }
    return defaultValue;
  }
};

export default uiNotify;
