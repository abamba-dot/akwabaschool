const icone = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#111827"/>
  <path d="M32 12 8 24l24 12 24-12-24-12Z" fill="#4f7fff"/>
  <path d="M18 31v10c0 5 6 9 14 9s14-4 14-9V31l-14 7-14-7Z" fill="#7c3aed"/>
</svg>`

export function GET() {
  return new Response(icone, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'image/svg+xml',
    },
  })
}
