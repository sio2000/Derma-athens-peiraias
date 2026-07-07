import { Fragment } from 'react';
import TreatmentMedia from '@/components/TreatmentMedia';
import type { Treatment, TherapySection } from '@/data/treatments';

// Soft rose band used for the tinted content sections (mirrors the reference layout).
const TINT = 'rgb(237, 221, 214)';

/** Renders inline **bold** markers as colored <strong> emphasis. */
function renderRich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: 'rgb(110, 90, 51)', fontWeight: 700 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

/** Renders a section body. Consecutive "• " lines are grouped into a symmetric
 *  two-column bullet grid; every other line is a normal paragraph. */
function renderBody(body: string[]) {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string | number) => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    // Short items (e.g. «Χείλη», «Κρόταφοι») go in a symmetric two-column grid;
    // longer descriptive bullets stay in a single readable column.
    const isShort = items.every((b) => b.replace(/\*\*/g, '').length <= 46);
    out.push(
      <ul
        key={`ul-${key}`}
        className={isShort ? 'ad-two-col' : undefined}
        style={{ listStyle: 'none', padding: 0, margin: '4px 0 18px' }}
      >
        {items.map((b, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              fontFamily: 'HarmoniaSans, sans-serif',
              fontSize: '16px',
              color: '#444',
              lineHeight: 1.6,
              marginBottom: '8px',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'rgb(203, 179, 121)',
                marginTop: '8px',
              }}
            />
            <span>{renderRich(b)}</span>
          </li>
        ))}
      </ul>
    );
  };

  body.forEach((para, i) => {
    if (para.startsWith('• ')) {
      bullets.push(para.slice(2));
    } else {
      flushBullets(i);
      out.push(
        <p
          key={`p-${i}`}
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '16px',
            lineHeight: 1.8,
            color: '#444',
            marginBottom: '14px',
          }}
        >
          {renderRich(para)}
        </p>
      );
    }
  });
  flushBullets('end');
  return out;
}

/** Heading + body (+ inline media) for a single section. */
function SectionInner({ sec }: { sec: TherapySection }) {
  return (
    <>
      {sec.heading && (
        <h2
          id={sec.anchor}
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '26px',
            fontWeight: 700,
            color: 'rgb(110, 90, 51)',
            margin: '0 0 14px',
            lineHeight: 1.3,
            scrollMarginTop: '150px',
          }}
        >
          {sec.heading}
        </h2>
      )}
      {renderBody(sec.body)}
      {sec.media && sec.media.length > 0 && <TreatmentMedia media={sec.media} />}
    </>
  );
}

/**
 * Shared content renderer for treatment pages (prosopo & soma).
 * - Sections render with inline media and symmetric two-column bullet lists.
 * - Any treatment-level media (e.g. a treatment video) is placed *within* the
 *   text, right after the middle section — never dumped at the very bottom.
 */
export default function TreatmentContent({ treatment }: { treatment: Treatment }) {
  const sections = treatment.sections ?? [];
  const media = treatment.media ?? [];
  // Insert the treatment video roughly in the middle of the article.
  const midIndex = sections.length > 1 ? Math.floor(sections.length / 2) : sections.length - 1;

  const MediaBlock =
    media.length > 0 ? (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4px 24px 8px' }}>
        <TreatmentMedia media={media} />
      </div>
    ) : null;

  // Banded layout (tinted sections) when a table of contents is defined.
  if (treatment.toc) {
    return (
      <div style={{ padding: '8px 0 72px' }}>
        {sections.map((sec, idx) => {
          const block = sec.tint ? (
            <div
              key={sec.heading}
              style={{ width: '100%', backgroundColor: TINT, padding: '44px 0', margin: '20px 0' }}
            >
              <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
                <SectionInner sec={sec} />
              </div>
            </div>
          ) : (
            <div
              key={sec.heading}
              style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '0 24px',
                marginTop: idx === 0 ? '40px' : '36px',
              }}
            >
              <SectionInner sec={sec} />
            </div>
          );
          return idx === midIndex ? (
            <Fragment key={sec.heading}>
              {block}
              {MediaBlock}
            </Fragment>
          ) : (
            block
          );
        })}
      </div>
    );
  }

  // Standard single-column layout.
  return (
    <section style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {treatment.bullets && treatment.bullets.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px 24px',
          }}
        >
          {treatment.bullets.map((b) => (
            <li
              key={b}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                fontFamily: 'HarmoniaSans, sans-serif',
                fontSize: '16px',
                color: '#444',
                lineHeight: 1.5,
              }}
            >
              <span style={{ flexShrink: 0, width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgb(203, 179, 121)', marginTop: '7px' }} />
              {b}
            </li>
          ))}
        </ul>
      )}

      {sections.map((sec, idx) => (
        <Fragment key={sec.heading}>
          <div style={{ marginBottom: '36px' }}>
            <SectionInner sec={sec} />
          </div>
          {idx === midIndex && media.length > 0 && (
            <div style={{ marginBottom: '36px' }}>
              <TreatmentMedia media={media} />
            </div>
          )}
        </Fragment>
      ))}
    </section>
  );
}
