import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TreatmentCTA from '@/components/TreatmentCTA';
import TreatmentMedia from '@/components/TreatmentMedia';
import { prosopoTreatments, type TherapySection } from '@/data/treatments';

// Soft rose band used for the » navigation and the tinted content sections
// (mirrors the reference layout of the fractional-laser page).
const TINT = 'rgb(237, 221, 214)';

/** Renders inline **bold** markers as colored <strong> emphasis. */
function renderRich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: 'rgb(110, 90, 51)', fontWeight: 700 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

/** Heading + paragraphs for a single section (bold-aware, anchor-aware). */
function SectionInner({ sec }: { sec: TherapySection }) {
  return (
    <>
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
      {sec.body.map((para, i) => (
        <p
          key={i}
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
      ))}
    </>
  );
}

export async function generateStaticParams() {
  return prosopoTreatments.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const treatment = prosopoTreatments.find((t) => t.slug === params.slug);
  if (!treatment) return {};
  return {
    title: `${treatment.name} | Θεραπείες Προσώπου | Advanced Derma`,
    description: treatment.description.slice(0, 160),
  };
}

export default function ProsopoTreatmentPage({ params }: { params: { slug: string } }) {
  const treatment = prosopoTreatments.find((t) => t.slug === params.slug);
  if (!treatment) notFound();

  // One image goes in the hero; every other image/video is collected and shown
  // at the bottom of the page (after the text, before the CTA).
  const galleryMedia = [
    ...(treatment.sections?.flatMap((s) => s.media ?? []) ?? []),
    ...(treatment.media ?? []),
  ];

  // Some hero images (e.g. promo graphics with text) must be shown whole, not
  // cropped. For those we fit the image inside the frame on a cream backdrop.
  const heroContain = treatment.slug === 'apotrixosi-laser-alexandrite';

  return (
    <>
      <Navbar />

      {/* Hero — bright treatment image at the start of the page */}
      <section
        className="ad-thero"
        style={{
          width: '100%',
          backgroundColor: 'rgb(244, 238, 224)',
          marginTop: '135px',
          overflow: 'hidden',
        }}
      >
        <div
          className="ad-thero-inner"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: '48px',
            padding: '56px 64px',
            minHeight: '420px',
          }}
        >
          <div
            className="ad-thero-img"
            style={{
              flex: '0 0 46%',
              maxWidth: '46%',
              position: 'relative',
              height: '380px',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 8px 28px rgba(110, 90, 51, 0.18)',
              backgroundColor: heroContain ? 'rgb(244, 238, 224)' : undefined,
            }}
          >
            <Image
              src={treatment.heroImage}
              alt={treatment.name}
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
              style={{ objectFit: heroContain ? 'contain' : 'cover', objectPosition: 'center' }}
              priority
            />
          </div>
          <div className="ad-thero-text" style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: 'HarmoniaSans, sans-serif',
                fontSize: 'clamp(30px, 4vw, 48px)',
                fontWeight: 700,
                color: 'rgb(110, 90, 51)',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {treatment.name}
            </h1>
            <p
              style={{
                fontFamily: 'HarmoniaSans, sans-serif',
                fontSize: '16px',
                color: '#5a4a30',
                lineHeight: 1.7,
                margin: '20px 0 28px',
                maxWidth: '520px',
              }}
            >
              {treatment.description}
            </p>
            <Link
              href="/el/booking-request/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgb(203, 179, 121)',
                color: '#000',
                fontFamily: 'HarmoniaSans, sans-serif',
                fontSize: '16px',
                fontWeight: 500,
                padding: '12px 24px',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
            >
              Κλείστε ραντεβού
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* » Table of contents band (only for treatments that define it) */}
      {treatment.toc && (
        <nav style={{ width: '100%', backgroundColor: TINT, padding: '16px 0' }}>
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px 28px',
            }}
          >
            {treatment.toc.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                style={{
                  fontFamily: 'HarmoniaSans, sans-serif',
                  fontSize: '16px',
                  color: 'rgb(110, 90, 51)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                » {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Breadcrumb */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '20px 24px 0',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Αρχική', href: '/' },
          { label: 'Υπηρεσίες', href: '/el/ypiresies/prosopo/' },
          { label: 'Θεραπείες Προσώπου', href: '/el/ypiresies/prosopo/' },
          { label: treatment.name, href: null },
        ].map((crumb, idx, arr) => (
          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{
                  fontFamily: 'HarmoniaSans, sans-serif',
                  fontSize: '16px',
                  color: 'rgb(110, 90, 51)',
                  textDecoration: 'none',
                  opacity: 0.75,
                }}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: 'HarmoniaSans, sans-serif',
                  fontSize: '16px',
                  color: 'rgb(110, 90, 51)',
                  fontWeight: 600,
                }}
              >
                {crumb.label}
              </span>
            )}
            {idx < arr.length - 1 && (
              <span style={{ color: 'rgba(110, 90, 51,0.4)', fontSize: '16px' }}>›</span>
            )}
          </span>
        ))}
      </div>

      {/* Content — banded layout (with tinted sections) when a TOC is defined,
          otherwise the standard single-column layout used by every other page. */}
      {treatment.toc ? (
        <div style={{ padding: '8px 0 72px' }}>
          {treatment.sections.map((sec, idx) =>
            sec.tint ? (
              <div key={sec.heading} style={{ width: '100%', backgroundColor: TINT, padding: '44px 0', margin: '20px 0' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
                  <SectionInner sec={sec} />
                </div>
              </div>
            ) : (
              <div
                key={sec.heading}
                style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', marginTop: idx === 0 ? '40px' : '36px' }}
              >
                <SectionInner sec={sec} />
              </div>
            )
          )}
          {galleryMedia.length > 0 && (
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 0' }}>
              <TreatmentMedia media={galleryMedia} />
            </div>
          )}
        </div>
      ) : (
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

          {treatment.sections &&
            treatment.sections.map((sec) => (
              <div key={sec.heading} style={{ marginBottom: '36px' }}>
                <h2
                  style={{
                    fontFamily: 'HarmoniaSans, sans-serif',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: 'rgb(110, 90, 51)',
                    marginTop: '40px',
                    marginBottom: '14px',
                    lineHeight: 1.3,
                  }}
                >
                  {sec.heading}
                </h2>
                {sec.body.map((para, i) => (
                  <p
                    key={i}
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
                ))}
              </div>
            ))}

          {galleryMedia.length > 0 && <TreatmentMedia media={galleryMedia} />}
        </section>
      )}

      <TreatmentCTA />

      <Footer />
    </>
  );
}
