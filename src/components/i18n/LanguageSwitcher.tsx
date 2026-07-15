'use client';

// ── Advanced Derma — language switcher (ΕΛ / EN / AR) ─────────────────────
import { useEffect, useState } from 'react';
import { LANGUAGES, type Lang } from '@/lib/i18n/dictionary';
import { getLang, setLang, onLangChange } from '@/lib/i18n/store';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [lang, setCurrent] = useState<Lang>('el');

  useEffect(() => {
    setCurrent(getLang());
    return onLangChange((l) => setCurrent(l));
  }, []);

  return (
    <div
      data-no-translate
      translate="no"
      role="group"
      aria-label="Language / Γλώσσα / اللغة"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        border: '1px solid rgba(110, 90, 51,0.35)',
        borderRadius: '6px',
        padding: '2px',
        backgroundColor: compact ? 'transparent' : '#fff',
      }}
    >
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.native}
            style={{
              fontFamily: 'HarmoniaSans, sans-serif',
              fontSize: '13px',
              fontWeight: active ? 700 : 500,
              lineHeight: 1,
              padding: '6px 8px',
              minWidth: '34px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              color: active ? '#000' : 'rgb(110, 90, 51)',
              backgroundColor: active ? 'rgb(203, 179, 121)' : 'transparent',
              transition: 'background-color 0.15s, color 0.15s',
            }}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
