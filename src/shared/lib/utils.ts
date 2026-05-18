// ============================================================
// UTILITAIRES — Fonctions helpers réutilisables
// ============================================================

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fusion de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatage monétaire FCFA
export function formaterMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant)
}

// Formatage de date française
export function formaterDate(date: string, format: 'court' | 'long' | 'relatif' = 'court'): string {
  const dateObj = new Date(date)

  if (format === 'relatif') {
    const maintenant = new Date()
    const diff = maintenant.getTime() - dateObj.getTime()
    const absDiff = Math.abs(diff)
    const minutes = Math.floor(absDiff / 60000)
    const heures = Math.floor(minutes / 60)
    const jours = Math.floor(heures / 24)
    const futur = diff < 0

    if (minutes < 60) return futur ? `Dans ${minutes} min` : `Il y a ${minutes} min`
    if (heures < 24) return futur ? `Dans ${heures}h` : `Il y a ${heures}h`
    if (jours < 7)
      return futur ? `Dans ${jours} jour${jours > 1 ? 's' : ''}` : `Il y a ${jours} jour${jours > 1 ? 's' : ''}`
    return dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Calcul de l'âge
export function calculerAge(dateNaissance: string): number {
  const naissance = new Date(dateNaissance)
  const maintenant = new Date()
  let age = maintenant.getFullYear() - naissance.getFullYear()
  const mois = maintenant.getMonth() - naissance.getMonth()
  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age--
  }
  return age
}

// Générer des initiales depuis un nom
export function obtenirInitiales(nom: string, prenom?: string): string {
  if (prenom) {
    return `${nom.charAt(0)}${prenom.charAt(0)}`.toUpperCase()
  }
  const parties = nom.split(' ')
  if (parties.length >= 2) {
    return `${parties[0].charAt(0)}${parties[1].charAt(0)}`.toUpperCase()
  }
  return nom.slice(0, 2).toUpperCase()
}

// Tronquer un texte avec ellipsis
export function tronquer(texte: string, longueur: number): string {
  if (texte.length <= longueur) return texte
  return `${texte.slice(0, longueur)}…`
}

// Générer un matricule unique
export function genererMatricule(annee: number, sequence: number): string {
  const seq = String(sequence).padStart(3, '0')
  return `AKW-${annee}-${seq}`
}

// Générer une référence de paiement
export function genererReference(annee: number, sequence: number): string {
  const seq = String(sequence).padStart(4, '0')
  return `REF-${annee}-${seq}`
}

// Calculer la moyenne des notes
export function calculerMoyenne(notes: { valeur: number; bareme: number; coefficient: number }[]): number {
  if (!notes.length) return 0
  let totalPoints = 0
  let totalCoefficients = 0

  notes.forEach(({ valeur, bareme, coefficient }) => {
    const noteSur20 = (valeur / bareme) * 20
    totalPoints += noteSur20 * coefficient
    totalCoefficients += coefficient
  })

  return totalCoefficients > 0 ? Math.round((totalPoints / totalCoefficients) * 100) / 100 : 0
}

// Mention selon la moyenne
export function obtenirMention(moyenne: number): { libelle: string; couleur: string } {
  if (moyenne >= 16) return { libelle: 'Très Bien', couleur: 'vert' }
  if (moyenne >= 14) return { libelle: 'Bien', couleur: 'bleu' }
  if (moyenne >= 12) return { libelle: 'Assez Bien', couleur: 'bleu' }
  if (moyenne >= 10) return { libelle: 'Passable', couleur: 'orange' }
  return { libelle: 'Insuffisant', couleur: 'rouge' }
}

// Couleur aléatoire d'avatar (stable selon l'id)
export function couleurAvatar(id: string): string {
  const couleurs = [
    'bg-akwaba-bleu/20 text-akwaba-bleu',
    'bg-akwaba-vert/20 text-akwaba-vert',
    'bg-akwaba-violet/20 text-akwaba-violet',
    'bg-akwaba-orange/20 text-akwaba-orange',
    'bg-pink-500/20 text-pink-400',
    'bg-cyan-500/20 text-cyan-400',
  ]
  const index = id.charCodeAt(id.length - 1) % couleurs.length
  return couleurs[index]
}

// Statistiques de liste
export function calculerStats<T>(items: T[], prop: keyof T): Record<string, number> {
  const stats: Record<string, number> = {}
  items.forEach((item) => {
    const valeur = String(item[prop])
    stats[valeur] = (stats[valeur] || 0) + 1
  })
  return stats
}

// Pagination
export function paginer<T>(items: T[], page: number, parPage: number): T[] {
  const debut = (page - 1) * parPage
  return items.slice(debut, debut + parPage)
}

// Filtrer et chercher dans une liste
export function rechercherDans<T>(items: T[], recherche: string, champs: (keyof T)[]): T[] {
  if (!recherche.trim()) return items
  const terme = recherche.toLowerCase().trim()
  return items.filter((item) =>
    champs.some((champ) =>
      String(item[champ] || '')
        .toLowerCase()
        .includes(terme)
    )
  )
}
