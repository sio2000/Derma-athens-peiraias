'use client';

// ── Advanced Derma — client-side DOM translation engine ───────────────────
// Renders nothing. On language change it walks the DOM, replacing Greek text
// (and translatable attributes) with the selected language. Curated strings
// come from the dictionary; everything else is machine-translated once and
// cached. Works uniformly across server + client components and the large
// treatments database — no per-component refactor required.

import { useEffect } from 'react';
import { DICTIONARY, normalize, type Lang } from '@/lib/i18n/dictionary';
import { getLang, onLangChange, getCached, setCached, machineTranslate } from '@/lib/i18n/store';

const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
]);
// Attributes whose (visible) text should also be translated.
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
// Must contain at least one Greek letter to be worth translating
// (skips brand names, emails, phone numbers, "Botox", handles, etc.).
// Greek & Coptic (U+0370–03FF) + Greek Extended (U+1F00–1FFF).
const GREEK_RE = /[\u0370-\u03FF\u1F00-\u1FFF]/;

// Original Greek text, captured once per node so switching between languages
// (and back to Greek) always derives from the source.
const origText = new WeakMap<Text, string>();
const origAttr = new WeakMap<Element, Record<string, string>>();

function isSkippable(node: Node): boolean {
  let el: Node | null = node.parentElement;
  while (el && el instanceof Element) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute('data-no-translate') || el.getAttribute('translate') === 'no') return true;
    el = el.parentElement;
  }
  return false;
}

function resolve(lang: Lang, greek: string): string | null {
  const key = normalize(greek);
  if (!key) return greek;
  if (lang === 'el') return greek; // handled by restore path
  const dict = DICTIONARY[key];
  if (dict && dict[lang]) return dict[lang];
  const cached = getCached(lang, key);
  if (cached !== undefined) return cached;
  return null; // needs machine translation
}

type Pending = { key: string; apply: (value: string) => void };

function collect(root: Node, lang: Lang, pending: Pending[]) {
  // Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = n.nodeValue || '';
      if (!t.trim()) return NodeFilter.FILTER_REJECT;
      if (isSkippable(n)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const texts: Text[] = [];
  let cur = walker.nextNode();
  while (cur) {
    texts.push(cur as Text);
    cur = walker.nextNode();
  }
  for (const node of texts) {
    let greek = origText.get(node);
    if (greek === undefined) {
      greek = node.nodeValue || '';
      origText.set(node, greek);
    }
    if (lang === 'el') {
      if (node.nodeValue !== greek) node.nodeValue = greek;
      continue;
    }
    if (!GREEK_RE.test(greek)) continue;
    // preserve leading/trailing whitespace around the translated core
    const lead = greek.match(/^\s*/)?.[0] ?? '';
    const trail = greek.match(/\s*$/)?.[0] ?? '';
    const resolved = resolve(lang, greek);
    if (resolved !== null) {
      const val = lead + normalize(resolved) + trail;
      if (node.nodeValue !== val) node.nodeValue = val;
    } else {
      const key = normalize(greek);
      pending.push({
        key,
        apply: (value) => {
          if (origText.get(node) === greek && node.isConnected) {
            node.nodeValue = lead + normalize(value) + trail;
          }
        },
      });
    }
  }

  // Translatable attributes
  const els = (root instanceof Element ? [root] : []).concat(
    Array.from((root instanceof Element || root instanceof Document ? root : document).querySelectorAll('*')),
  );
  for (const el of els) {
    if (SKIP_TAGS.has(el.tagName) && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') continue;
    if (el.hasAttribute('data-no-translate') || el.getAttribute('translate') === 'no') continue;
    for (const attr of ATTRS) {
      if (!el.hasAttribute(attr)) continue;
      let store = origAttr.get(el);
      if (!store) {
        store = {};
        origAttr.set(el, store);
      }
      let greek = store[attr];
      if (greek === undefined) {
        greek = el.getAttribute(attr) || '';
        store[attr] = greek;
      }
      if (lang === 'el') {
        if (el.getAttribute(attr) !== greek) el.setAttribute(attr, greek);
        continue;
      }
      if (!GREEK_RE.test(greek)) continue;
      const resolved = resolve(lang, greek);
      if (resolved !== null) {
        if (el.getAttribute(attr) !== resolved) el.setAttribute(attr, normalize(resolved));
      } else {
        const captured = greek;
        pending.push({
          key: normalize(greek),
          apply: (value) => {
            if ((origAttr.get(el)?.[attr]) === captured) el.setAttribute(attr, normalize(value));
          },
        });
      }
    }
  }
}

async function apply(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const pending: Pending[] = [];
  collect(document.body, lang, pending);
  if (lang === 'el' || pending.length === 0) return;

  // Deduplicate by key; translate each unique string once.
  const byKey = new Map<string, Pending[]>();
  for (const p of pending) {
    const arr = byKey.get(p.key);
    if (arr) arr.push(p);
    else byKey.set(p.key, [p]);
  }

  const keys = Array.from(byKey.keys());
  const CONCURRENCY = 6;
  let idx = 0;
  async function worker() {
    while (idx < keys.length) {
      const key = keys[idx++];
      const cached = getCached(lang, key);
      let value = cached;
      if (value === undefined) {
        const mt = await machineTranslate(key, lang);
        if (mt) {
          value = mt;
          setCached(lang, key, mt);
        }
      }
      if (value) {
        // language may have changed mid-flight
        if (getLang() !== lang) return;
        byKey.get(key)!.forEach((p) => p.apply(value!));
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

export default function TranslationEngine() {
  useEffect(() => {
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
      const lang = getLang();
      apply(lang);
    };

    // initial (restores persisted language after hydration)
    run();

    const off = onLangChange(() => run());

    // Re-translate content added by client-side navigation / dynamic UI.
    const observer = new MutationObserver((mutations) => {
      const hasAdded = mutations.some((m) => m.addedNodes.length > 0);
      if (!hasAdded) return;
      if (getLang() === 'el') return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(run, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      off();
      observer.disconnect();
      if (debounce) clearTimeout(debounce);
    };
  }, []);

  return null;
}
