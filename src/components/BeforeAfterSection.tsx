import Image from 'next/image';

/* Πριν & Μετά — κάθε εικόνα περιέχει ήδη το «πριν» (αριστερά) και το «μετά» (δεξιά).
   Αντιστοιχούν στα αρχεία αποτελεσμάτων του πελάτη (gallery/g02..g32). */
type BAItem = { type: 'image' | 'video'; src: string };

const beforeAfter: BAItem[] = [
  ...['g02', 'g03', 'g04', 'g11', 'g13', 'g14', 'g16', 'g17', 'g28', 'g31'].map(
    (g): BAItem => ({ type: 'image', src: `/images/gallery/${g}.png` })
  ),
  { type: 'image', src: '/images/gallery/akmi.jpeg' },
  // Επιπλέον αποτελέσματα ασθενών
  { type: 'image', src: '/images/results/9602.jpg' },
  { type: 'image', src: '/images/results/652349.jpg' },
  { type: 'image', src: '/images/results/5061.jpg' },
  { type: 'image', src: '/images/results/9993.png' },
  { type: 'image', src: '/images/results/23323.png' },
  { type: 'image', src: '/images/results/4323.png' },
  { type: 'image', src: '/images/results/23432.png' },
  { type: 'image', src: '/images/results/78456.png' },
  { type: 'image', src: '/images/results/6795.png' },
  { type: 'video', src: '/videos/before-after-1.mp4' },
  { type: 'image', src: '/images/results/1835.jpg' },
  { type: 'image', src: '/images/results/portada.jpg' },
];

export default function BeforeAfterSection() {
  return (
    <section style={{ width: '100%', backgroundColor: '#fff', padding: '60px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <p
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgb(147, 123, 76)',
            textAlign: 'center',
            marginBottom: '12px',
          }}
        >
          Αποτελέσματα που μιλούν
        </p>
        <h2
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '40px',
            fontWeight: 700,
            color: 'rgb(110, 90, 51)',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          Πριν &amp; Μετά
        </h2>
        <p
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '16px',
            color: '#777',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Δείτε πραγματικά αποτελέσματα θεραπειών του Advanced Derma
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {beforeAfter.map((item, i) => (
            <div
              key={item.src}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '3 / 4',
                borderRadius: '10px',
                overflow: 'hidden',
                boxShadow: '0 2px 14px rgba(110, 90, 51,0.12)',
                backgroundColor: 'rgb(244, 238, 224)',
              }}
            >
              {item.type === 'video' ? (
                <video
                  controls
                  playsInline
                  preload="metadata"
                  data-no-lightbox
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000',
                  }}
                >
                  <source src={item.src} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={item.src}
                  alt={`Πριν και Μετά — αποτέλεσμα θεραπείας ${i + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 600px) 100vw, 260px"
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: 'HarmoniaSans, sans-serif',
            fontSize: '16px',
            color: '#999',
            textAlign: 'center',
            marginTop: '28px',
          }}
        >
          * Τα αποτελέσματα ενδέχεται να διαφέρουν ανά άτομο. Όλες οι φωτογραφίες είναι πραγματικών ασθενών με τη συγκατάθεσή τους.
        </p>
      </div>
    </section>
  );
}
