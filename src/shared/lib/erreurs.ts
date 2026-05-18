// ============================================================
// ERREURS SERVICES — Messages exploitables côté interface
// ============================================================

export class ErreurService extends Error {
  constructor(
    message: string,
    public causeOriginale?: unknown
  ) {
    super(message)
    this.name = 'ErreurService'
  }
}

export function messageErreur(error: unknown, fallback = 'Une erreur est survenue.') {
  if (error instanceof ErreurService) return error.message
  if (error instanceof Error) return error.message || fallback
  return fallback
}

export function leverErreurService(error: unknown, contexte: string): never {
  throw new ErreurService(`${contexte}. ${messageErreur(error, 'Veuillez réessayer.')}`, error)
}
