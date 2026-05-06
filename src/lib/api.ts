/**
 * Base URL for API (χωρίς καταληκτικό /).
 * Κενό = ίδια προέλευση: production Netlify (`/api/*` → function), dev = Vite proxy → `localhost:3001`.
 * Για ξεχωριστό backend: ορίζετε `VITE_API_URL` στο build (π.χ. https://api.example.com).
 */
export function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
  if (!path.startsWith('/')) return `${base}/${path}`
  return base ? `${base}${path}` : path
}
