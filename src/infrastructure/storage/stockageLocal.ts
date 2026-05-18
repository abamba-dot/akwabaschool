// ============================================================
// STOCKAGE LOCAL — Mode démonstration persistant sans Supabase
// ============================================================

export function lireCollectionLocale<T>(cle: string, donneesInitiales: T[]): T[] {
  if (typeof window === 'undefined') return donneesInitiales

  const contenu = window.localStorage.getItem(cle)
  if (!contenu) {
    window.localStorage.setItem(cle, JSON.stringify(donneesInitiales))
    return donneesInitiales
  }

  try {
    return JSON.parse(contenu) as T[]
  } catch {
    window.localStorage.setItem(cle, JSON.stringify(donneesInitiales))
    return donneesInitiales
  }
}

export function ecrireCollectionLocale<T>(cle: string, donnees: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(cle, JSON.stringify(donnees))
}

export function creerIdentifiant(prefixe: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefixe}-${crypto.randomUUID()}`
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
