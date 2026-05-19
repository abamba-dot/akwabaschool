'use client'

import {
  Settings,
  Building2,
  Users,
  Shield,
  Calendar,
  Upload,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

// ─── Page des paramètres ─────────────────────────────────────────────────────

type Section = 'ecole' | 'annee' | 'utilisateurs' | 'roles'

const utilisateursDemo = [
  { id: '1', nom: 'Kofi', prenom: 'Admin', email: 'admin@akwaba.edu', role: 'Administrateur', actif: true },
  { id: '2', nom: 'Mensah', prenom: 'Marie', email: 'marie@akwaba.edu', role: 'Secrétaire', actif: true },
  { id: '3', nom: 'Asante', prenom: 'Jean', email: 'jean@akwaba.edu', role: 'Enseignant', actif: false },
]

const rolesDemo = [
  { id: '1', nom: 'Administrateur', permissions: ['Tout gérer', 'Paramètres', 'Utilisateurs'], couleur: '#EF4444' },
  { id: '2', nom: 'Secrétaire', permissions: ['Élèves', 'Paiements', 'Classes'], couleur: '#4F7FFF' },
  { id: '3', nom: 'Enseignant', permissions: ['Notes', 'Absences', 'Emploi du temps'], couleur: '#10B981' },
]

export default function PageParametres() {
  const [section, setSection] = useState<Section>('ecole')
  const [sauvegarde, setSauvegarde] = useState(false)

  // Données école
  const [ecole, setEcole] = useState({
    nom: 'Akwaba IT School',
    slogan: "L'excellence pour tous",
    email: 'contact@akwaba-it.edu',
    telephone: '+225 07 00 00 00',
    adresse: "Abidjan, Côte d'Ivoire",
    siteWeb: 'www.akwaba-it.edu',
  })

  const sauvegarder = async () => {
    setSauvegarde(true)
    await new Promise((r) => setTimeout(r, 800))
    setSauvegarde(false)
    toast.success('Paramètres sauvegardés !')
  }

  const sections = [
    { id: 'ecole', label: 'Profil école', icone: Building2 },
    { id: 'annee', label: 'Année scolaire', icone: Calendar },
    { id: 'utilisateurs', label: 'Utilisateurs', icone: Users },
    { id: 'roles', label: 'Rôles & Permissions', icone: Shield },
  ] as const

  return (
    <div className="animate-fade-in p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-akwaba-texte">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-akwaba-bleu/10">
            <Settings className="h-4 w-4 text-akwaba-bleu" />
          </div>
          Paramètres
        </h1>
        <p className="mt-1 text-akwaba-muted">Configurez votre plateforme Akwaba IT</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navigation latérale */}
        <aside className="flex-shrink-0 lg:w-56">
          <nav className="space-y-1">
            {sections.map(({ id, label, icone: Icone }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  section === id
                    ? 'bg-akwaba-bleu/10 text-akwaba-bleu'
                    : 'text-akwaba-muted hover:bg-akwaba-surface hover:text-akwaba-texte'
                }`}
              >
                <Icone className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenu */}
        <div className="min-w-0 flex-1">
          {/* ─── Profil école ─── */}
          {section === 'ecole' && (
            <div className="carte-principale space-y-6 p-6">
              <div>
                <h2 className="font-semibold text-akwaba-texte">Profil de l'école</h2>
                <p className="mt-1 text-sm text-akwaba-muted">Informations générales de votre établissement</p>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-akwaba-bleu to-akwaba-violet text-2xl font-bold text-white">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-akwaba-texte">Logo de l'école</p>
                  <p className="mt-0.5 text-xs text-akwaba-muted">PNG, JPG · Max 2 Mo · 256×256px recommandé</p>
                  <button className="mt-2 flex items-center gap-2 rounded-lg border border-akwaba-bordure px-3 py-1.5 text-xs text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte">
                    <Upload className="h-3 w-3" />
                    Changer le logo
                  </button>
                </div>
              </div>

              <div className="h-px bg-akwaba-bordure" />

              {/* Formulaire */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Nom de l'école</label>
                  <input
                    type="text"
                    value={ecole.nom}
                    onChange={(e) => setEcole({ ...ecole, nom: e.target.value })}
                    className="champ-saisie"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Slogan</label>
                  <input
                    type="text"
                    value={ecole.slogan}
                    onChange={(e) => setEcole({ ...ecole, slogan: e.target.value })}
                    className="champ-saisie"
                  />
                </div>
                <ChampParametre
                  icone={Mail}
                  label="Email"
                  valeur={ecole.email}
                  onChange={(v) => setEcole({ ...ecole, email: v })}
                />
                <ChampParametre
                  icone={Phone}
                  label="Téléphone"
                  valeur={ecole.telephone}
                  onChange={(v) => setEcole({ ...ecole, telephone: v })}
                />
                <ChampParametre
                  icone={Globe}
                  label="Site web"
                  valeur={ecole.siteWeb}
                  onChange={(v) => setEcole({ ...ecole, siteWeb: v })}
                />
                <ChampParametre
                  icone={MapPin}
                  label="Adresse"
                  valeur={ecole.adresse}
                  onChange={(v) => setEcole({ ...ecole, adresse: v })}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={sauvegarder}
                  disabled={sauvegarde}
                  className="btn-principal flex items-center gap-2 disabled:opacity-50"
                >
                  {sauvegarde ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Année scolaire ─── */}
          {section === 'annee' && (
            <div className="space-y-4">
              <div className="carte-principale p-6">
                <h2 className="mb-1 font-semibold text-akwaba-texte">Année scolaire active</h2>
                <p className="mb-4 text-sm text-akwaba-muted">Configurez l'année scolaire en cours</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Libellé</label>
                    <input type="text" defaultValue="2024 - 2025" className="champ-saisie" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Début</label>
                    <input type="date" defaultValue="2024-09-01" className="champ-saisie" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">Fin</label>
                    <input type="date" defaultValue="2025-06-30" className="champ-saisie" />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button onClick={sauvegarder} className="btn-principal flex items-center gap-2">
                    <Save className="h-4 w-4" /> Sauvegarder
                  </button>
                </div>
              </div>

              {/* Trimestres */}
              <div className="carte-principale p-6">
                <h3 className="mb-4 font-semibold text-akwaba-texte">Trimestres</h3>
                <div className="space-y-3">
                  {['1er Trimestre', '2ème Trimestre', '3ème Trimestre'].map((trimestre, i) => {
                    const debuts = ['2024-09-01', '2025-01-06', '2025-04-07']
                    const fins = ['2024-12-20', '2025-03-28', '2025-06-30']
                    return (
                      <div key={trimestre} className="flex items-center gap-3 rounded-lg bg-akwaba-surface p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-akwaba-bleu/10 text-sm font-bold text-akwaba-bleu">
                          {i + 1}
                        </div>
                        <span className="flex-1 text-sm font-medium text-akwaba-texte">{trimestre}</span>
                        <span className="text-xs text-akwaba-muted">
                          {debuts[i]} → {fins[i]}
                        </span>
                        <button className="p-1 text-akwaba-muted hover:text-akwaba-texte">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Utilisateurs ─── */}
          {section === 'utilisateurs' && (
            <div className="carte-principale overflow-hidden">
              <div className="flex items-center justify-between border-b border-akwaba-bordure p-6">
                <div>
                  <h2 className="font-semibold text-akwaba-texte">Utilisateurs</h2>
                  <p className="mt-0.5 text-sm text-akwaba-muted">Gérez les accès à la plateforme</p>
                </div>
                <button
                  onClick={() => toast.success('Fonctionnalité bientôt disponible')}
                  className="btn-principal flex items-center gap-2 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" /> Inviter
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-akwaba-bordure">
                    <th className="p-4 text-left text-xs font-medium uppercase text-akwaba-muted">Utilisateur</th>
                    <th className="p-4 text-left text-xs font-medium uppercase text-akwaba-muted">Email</th>
                    <th className="p-4 text-left text-xs font-medium uppercase text-akwaba-muted">Rôle</th>
                    <th className="p-4 text-center text-xs font-medium uppercase text-akwaba-muted">Statut</th>
                    <th className="p-4 text-right text-xs font-medium uppercase text-akwaba-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisateursDemo.map((user) => (
                    <tr key={user.id} className="ligne-tableau">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-akwaba-bleu/20 text-xs font-bold text-akwaba-bleu">
                            {user.prenom[0]}
                            {user.nom[0]}
                          </div>
                          <span className="text-sm font-medium text-akwaba-texte">
                            {user.prenom} {user.nom}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-akwaba-muted">{user.email}</td>
                      <td className="p-4">
                        <span className="badge-info text-xs">{user.role}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={user.actif ? 'badge-succes' : 'badge-erreur'}>
                          {user.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toast.error('Impossible de supprimer cet utilisateur')}
                          className="p-1.5 text-akwaba-muted transition-colors hover:text-akwaba-rouge"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Rôles ─── */}
          {section === 'roles' && (
            <div className="space-y-4">
              {rolesDemo.map((role) => (
                <div key={role.id} className="carte-principale p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.couleur }} />
                      <h3 className="font-semibold text-akwaba-texte">{role.nom}</h3>
                    </div>
                    <button className="p-1.5 text-akwaba-muted hover:text-akwaba-texte">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissions.map((p) => (
                      <span
                        key={p}
                        className="flex items-center gap-1 rounded-md bg-akwaba-surface px-2 py-1 text-xs text-akwaba-muted"
                      >
                        <CheckCircle className="h-3 w-3 text-akwaba-vert" />
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Composant champ avec icône ──────────────────────────────────────────────

function ChampParametre({
  icone: Icone,
  label,
  valeur,
  onChange,
}: {
  icone: React.ElementType
  label: string
  valeur: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-akwaba-texte">{label}</label>
      <div className="relative">
        <Icone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-akwaba-muted" />
        <input type="text" value={valeur} onChange={(e) => onChange(e.target.value)} className="champ-saisie pl-9" />
      </div>
    </div>
  )
}
