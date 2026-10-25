// Les appels réseau passent par le service worker pour éviter les restrictions CORS de WhatsApp Web.
const TARGET = "fr";
const cache = new Map();

async function translate(text) {
  if (cache.has(text)) return cache.get(text);
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&dt=t" +
    `&tl=${TARGET}&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const result = {
    translated: (data[0] || []).map((part) => part[0]).join(""),
    lang: data[2] || "und",
  };
  if (cache.size > 2000) cache.clear();
  cache.set(text, result);
  return result;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "translate") return;
  translate(msg.text)
    .then((r) => sendResponse({ ok: true, ...r }))
    .catch((e) => sendResponse({ ok: false, error: String(e) }));
  return true; // réponse asynchrone
});
