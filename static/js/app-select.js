/* ── DSU KnotSpot App-Select ── */
(function () {
  function initSelects() {
    document.querySelectorAll('.app-select:not([data-init])').forEach(function (wrap) {
      wrap.setAttribute('data-init', '1');
      var native = wrap.querySelector('.app-select-native, select');
      var trigger = wrap.querySelector('.app-select-trigger');
      var valueEl = wrap.querySelector('.app-select-value');
      var list = wrap.querySelector('.app-select-list');
      if (!native || !trigger) return;

      function updateDisplay() {
        var opt = native.options[native.selectedIndex];
        if (opt && opt.value && valueEl) {
          valueEl.textContent = opt.textContent;
          valueEl.classList.remove('is-placeholder');
        } else if (valueEl) {
          valueEl.textContent = native.dataset.placeholder || trigger.dataset.placeholder || 'Select…';
          valueEl.classList.add('is-placeholder');
        }
      }
      updateDisplay();

      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = wrap.classList.toggle('is-open');
        if (isOpen && list) {
          document.querySelectorAll('.app-select.is-open').forEach(function (w) {
            if (w !== wrap) w.classList.remove('is-open');
          });
        }
      });

      if (list) {
        Array.from(native.options).forEach(function (opt, i) {
          if (!opt.value) return;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'app-select-option' + (native.selectedIndex === i ? ' is-selected' : '');
          btn.textContent = opt.textContent;
          btn.addEventListener('click', function () {
            native.value = opt.value;
            native.dispatchEvent(new Event('change', { bubbles: true }));
            list.querySelectorAll('.app-select-option').forEach(function (b) { b.classList.remove('is-selected'); });
            btn.classList.add('is-selected');
            updateDisplay();
            wrap.classList.remove('is-open');
          });
          list.appendChild(btn);
        });
      }

      native.addEventListener('change', updateDisplay);
    });

    document.addEventListener('click', function () {
      document.querySelectorAll('.app-select.is-open').forEach(function (w) {
        w.classList.remove('is-open');
      });
    }, { capture: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelects);
  } else {
    initSelects();
  }
})();
