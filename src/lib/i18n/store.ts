// ── Advanced Derma — i18n runtime store + machine-translation cache ────────
'use client';

import type { Lang } from './dictionary';

const LANG_KEY = 'adx_lang';
const LANG_EVENT = 'adx-lang-change';

export function getLang(): Lang {
  if (typeof window === 'undefined') return 'el';
  const v = window.localStorage.getItem(LANG_KEY);
  return v === 'en' || v === 'ar' ? v : 'el';
}

export function setLang(lang: Lang): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new CustomEvent<Lang>(LANG_EVENT, { detail: lang }));
}

export function onLangChange(cb: (lang: Lang) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Lang>).detail);
  window.addEventListener(LANG_EVENT, handler);
  return () => window.removeEventListener(LANG_EVENT, handler);
}

// ── Machine-translation cache (localStorage-backed) ───────────────────────
const cache: Record<Lang, Map<string, string>> = {
  el: new Map(),
  en: new Map(),
  ar: new Map(),
};
let loaded = false;

function cacheKey(lang: Lang) {
  return `adx_mt_${lang}`;
}

function loadCache() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  (['en', 'ar'] as Lang[]).forEach((lang) => {
    try {
      const raw = window.localStorage.getItem(cacheKey(lang));
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, string>;
        Object.entries(obj).forEach(([k, v]) => cache[lang].set(k, v));
      }
    } catch {
      /* ignore corrupt cache */
    }
  });
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(lang: Lang) {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const obj: Record<string, string> = {};
      cache[lang].forEach((v, k) => (obj[k] = v));
      window.localStorage.setItem(cacheKey(lang), JSON.stringify(obj));
    } catch {
      /* storage full — non-fatal */
    }
  }, 800);
}

export function getCached(lang: Lang, key: string): string | undefined {
  loadCache();
  return cache[lang].get(key);
}

export function setCached(lang: Lang, key: string, value: string): void {
  cache[lang].set(key, value);
  scheduleSave(lang);
}

// ── Machine translation providers (keyless, CORS-friendly) ────────────────
// Primary: Google's public gtx endpoint (higher quality, handles long text).
// Fallback: MyMemory (reliable CORS, ~500 char limit, daily quota).
async function gtx(text: string, target: Lang): Promise<string | null> {
  try {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=el&tl=' +
      target +
      '&dt=t&q=' +
      encodeURIComponent(text);
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const out = data[0]
        .map((seg: unknown) => (Array.isArray(seg) ? seg[0] : ''))
        .join('');
      return out || null;
    }
  } catch {
    /* network / CORS — fall through */
  }
  return null;
}

async function myMemory(text: string, target: Lang): Promise<string | null> {
  try {
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(text) +
      '&langpair=el|' +
      target;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const out = data?.responseData?.translatedText;
    if (typeof out === 'string' && out && !/^MYMEMORY WARNING/i.test(out)) return out;
  } catch {
    /* ignore */
  }
  return null;
}

export async function machineTranslate(text: string, target: Lang): Promise<string | null> {
  return (await gtx(text, target)) ?? (await myMemory(text, target));
}
