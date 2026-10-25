(() => {
  const TARGET = "fr";
  const MAX_CONCURRENT = 3;
  const MSG_SELECTOR = ".message-in span.selectable-text, .message-out span.selectable-text";
  const DONE = "data-wtfr";
  const langNames = new Intl.DisplayNames(["fr"], { type: "language" });

  let enabled = true;
  let active = 0;
  const queue = [];

  // "de l'arabe", "de l'anglais", "du russe"...
  function fromLanguage(code) {
    let name;
    try {
      name = langNames.of(code.split("-")[0]) || code;
    } catch {
      name = code;
    }
    return /^[aeiouyhéèêâîôû]/i.test(name) ? `de l'${name}` : `du ${name}`;
  }

  function hasLetters(text) {
    return /\p{L}/u.test(text);
  }

  function render(span, { translated, lang }) {
    const bubble = span.parentElement;
    if (!bubble || !span.isConnected) return;

    const box = document.createElement("div");
    box.className = "wtfr-box";

    const text = document.createElement("div");
    text.className = "wtfr-text";
    text.textContent = translated;

    const note = document.createElement("div");
    note.className = "wtfr-note";
    note.textContent = `Traduit ${fromLanguage(lang)} · voir l'original`;
    note.title = "Afficher / masquer le message original";
    note.addEventListener("click", (e) => {
      e.stopPropagation();
      const showing = span.classList.toggle("wtfr-hidden") === false;
      note.textContent = `Traduit ${fromLanguage(lang)} · ${showing ? "masquer" : "voir"} l'original`;
    });

    box.append(text, note);
    span.classList.add("wtfr-hidden");
    span.after(box);
  }

  function pump() {
    while (active < MAX_CONCURRENT && queue.length) {
      const span = queue.shift();
      if (!span.isConnected) continue;
      const original = span.innerText.trim();
      active++;
      chrome.runtime.sendMessage({ type: "translate", text: original }, (res) => {
        active--;
        if (res?.ok && res.lang !== TARGET && !res.lang.startsWith(`${TARGET}-`) &&
            res.translated && res.translated.trim() !== original) {
          render(span, res);
        }
        pump();
      });
    }
  }

  function scan(root = document) {
    if (!enabled) return;
    root.querySelectorAll(`:is(${MSG_SELECTOR}):not([${DONE}])`).forEach((span) => {
      span.setAttribute(DONE, "1");
      if (hasLetters(span.innerText)) queue.push(span);
    });
    pump();
  }

  function clear() {
    queue.length = 0;
    document.querySelectorAll(".wtfr-box").forEach((el) => el.remove());
    document.querySelectorAll(`[${DONE}]`).forEach((el) => {
      el.removeAttribute(DONE);
      el.classList.remove("wtfr-hidden");
    });
  }

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }).observe(document.body, { childList: true, subtree: true });

  chrome.storage.sync.get({ enabled: true }, (s) => {
    enabled = s.enabled;
    scan();
  });
  chrome.storage.onChanged.addListener((changes) => {
    if (!changes.enabled) return;
    enabled = changes.enabled.newValue;
    enabled ? scan() : clear();
  });
})();
