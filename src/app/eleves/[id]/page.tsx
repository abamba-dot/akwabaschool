'use client'

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import {
  calculerMoyenne,
  couleurAvatar,
  formaterDate,
  formaterMontant,
  obtenirInitiales,
  obtenirMention,
} from '@/shared/lib/utils'
import { eleveService } from '@/features/eleves/services/eleveService'
import { messageErreur } from '@/shared/lib/erreurs'
import type { Absence, Classe, EleveAvecDetails, Paiement } from '@/shared/types'

type Onglet = 'infos' | 'paiements' | 'notes' | 'absences'

const statutPaiement_LABELS: Record<string, string> = {
  paye: 'Paiement à jour',
  en_attente: 'En attente',
  retard: 'En retard',
}

export default function PageFicheEleve() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [ongletActif, setOngletActif] = useState<Onglet>('infos')
  const [eleve, setEleve] = useState<EleveAvecDetails | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    async function chargerEleve() {
      setChargement(true)
      setErreur(null)
      try {
        setEleve(await eleveService.obtenirParId(params.id))
      } catch (error) {
        setErreur(messageErreur(error))
      } finally {
        setChargement(false)
      }
    }

    chargerEleve()
  }, [params.id])

  const classe = eleve?.classe
  const paiements = useMemo(() => eleve?.paiements ?? [], [eleve?.paiements])
  const notes = useMemo(() => eleve?.notes ?? [], [eleve?.notes])
  const absences = useMemo(() => eleve?.absences ?? [], [eleve?.absences])

  if (chargement) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-56 rounded-xl" />
      </div>
    )
  }

  if (!eleve) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-akwaba-surface">
          <User className="h-8 w-8 text-akwaba-muted" />
        </div>
        <p className="text-akwaba-muted">{erreur ?? 'Élève introuvable'}</p>
        <Link href="/eleves" className="btn-principal">
          Retour à la liste
        </Link>
      </div>
    )
  }

  const moyenneGenerale = calculerMoyenne(notes)
  const mention = obtenirMention(moyenneGenerale)
  const totalPaye = paiements.filter((p) => p.statut === 'paye').reduce((s, p) => s + p.montant, 0)
  const absencesNonJustifiees = absences.filter((a) => a.statut === 'non_justifiee').length

  const onglets = [
    { id: 'infos', label: 'Informations', icone: User, badge: 0 },
    { id: 'paiements', label: 'Paiements', icone: CreditCard, badge: paiements.length },
    { id: 'notes', label: 'Notes', icone: BookOpen, badge: notes.length },
    { id: 'absences', label: 'Absences', icone: Clock, badge: absences.length },
  ] as const

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-sm text-akwaba-muted">
          <Link href="/eleves" className="transition-colors hover:text-akwaba-texte">
            Eleves
          </Link>
          <span className="mx-2">/</span>
          <span className="text-akwaba-texte">
            {eleve.prenom} {eleve.nom}
          </span>
        </div>
      </div>

      <section className="carte-principale">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold ${couleurAvatar(eleve.id)}`}
          >
            {obtenirInitiales(eleve.nom, eleve.prenom)}
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-akwaba-texte">
                  {eleve.prenom} {eleve.nom}
                </h1>
                <p className="mt-1 font-mono text-sm text-akwaba-muted">{eleve.matricule}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {classe && (
                    <span className="badge-info flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {classe.nom}
                    </span>
                  )}
                  <span className={eleve.statut === 'actif' ? 'badge-succes' : 'badge-erreur'}>
                    {eleve.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                  <span
                    className={
                      eleve.statutPaiement === 'paye'
                        ? 'badge-succes'
                        : eleve.statutPaiement === 'retard'
                          ? 'badge-erreur'
                          : 'badge-avertissement'
                    }
                  >
                    {statutPaiement_LABELS[eleve.statutPaiement]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-2 rounded-lg border border-akwaba-bordure px-3 py-2 text-sm text-akwaba-muted transition-colors hover:bg-akwaba-surface hover:text-akwaba-texte"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                  Imprimer
                </button>
                <button className="btn-principal px-3 py-2 text-sm">
                  <Edit2 className="h-4 w-4" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-akwaba-bordure pt-6 sm:grid-cols-4">
          <StatRapide
            titre="Moyenne générale"
            valeur={moyenneGenerale.toFixed(1)}
            detail={mention.libelle}
            classeDetail={`text-akwaba-${mention.couleur}`}
          />
          <StatRapide
            titre="Paiements effectués"
            valeur={String(paiements.filter((p) => p.statut === 'paye').length)}
            detail={formaterMontant(totalPaye)}
            classeDetail="text-akwaba-vert"
          />
          <StatRapide
            titre="Absences totales"
            valeur={String(absences.length)}
            detail={`${absencesNonJustifiees} non justifiée(s)`}
            classeDetail="text-akwaba-rouge"
          />
          <StatRapide
            titre="Evaluations"
            valeur={String(notes.length)}
            detail="Ce trimestre"
            classeDetail="text-akwaba-bleu"
          />
        </div>
      </section>

      <div className="flex w-fit gap-1 rounded-xl bg-akwaba-surface p-1">
        {onglets.map(({ id, label, icone: Icone, badge }) => (
          <button
            key={id}
            onClick={() => setOngletActif(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              ongletActif === id
                ? 'bg-akwaba-carte text-akwaba-texte shadow-sm'
                : 'text-akwaba-muted hover:text-akwaba-texte'
            }`}
          >
            <Icone className="h-4 w-4" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-akwaba-bleu text-xs text-white">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {ongletActif === 'infos' && <InfosEleve eleve={eleve} classe={classe} />}
      {ongletActif === 'paiements' && <TablePaiements paiements={paiements} />}
      {ongletActif === 'notes' && (
        <TableSimple
          vide="Aucune note enregistrée"
          entetes={['Matière', 'Type', 'Trimestre', 'Coeff.', 'Note / 20']}
          lignes={notes.map((note) => [
            note.matiere,
            note.type,
            `T${note.trimestre}`,
            String(note.coefficient),
            String(note.valeur),
          ])}
        />
      )}
      {ongletActif === 'absences' && <TableAbsences absences={absences} />}
    </div>
  )
}

function StatRapide({
  titre,
  valeur,
  detail,
  classeDetail,
}: {
  titre: string
  valeur: string
  detail: string
  classeDetail: string
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-akwaba-texte">{valeur}</p>
      <p className="mt-1 text-xs text-akwaba-muted">{titre}</p>
      <p className={`mt-1 text-xs font-medium ${classeDetail}`}>{detail}</p>
    </div>
  )
}

function InfosEleve({ eleve, classe }: { eleve: EleveAvecDetails; classe?: Classe }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="carte-principale space-y-4">
        <h3 className="flex items-center gap-2 font-semibold text-akwaba-texte">
          <User className="h-4 w-4 text-akwaba-bleu" />
          Informations personnelles
        </h3>
        <InfoLigne icone={Calendar} label="Date de naissance" valeur={formaterDate(eleve.dateNaissance)} />
        <InfoLigne icone={MapPin} label="Lieu de naissance" valeur={eleve.lieuNaissance} />
        <InfoLigne icone={Phone} label="Téléphone" valeur={eleve.telephone} />
        <InfoLigne icone={Mail} label="Email" valeur={eleve.email} />
        <InfoLigne icone={MapPin} label="Adresse" valeur={eleve.adresse} />
      </div>

      <div className="carte-principale space-y-4">
        <h3 className="flex items-center gap-2 font-semibold text-akwaba-texte">
          <User className="h-4 w-4 text-akwaba-violet" />
          Parent / Tuteur
        </h3>
        <InfoLigne icone={User} label="Nom complet" valeur={eleve.tuteurNom} />
        <InfoLigne icone={Phone} label="Téléphone" valeur={eleve.tuteurTelephone} />
        <InfoLigne icone={Mail} label="Email" valeur={eleve.tuteurEmail} />
        <InfoLigne icone={User} label="Relation" valeur={eleve.tuteurRelation} />
      </div>

      <div className="carte-principale space-y-4 lg:col-span-2">
        <h3 className="flex items-center gap-2 font-semibold text-akwaba-texte">
          <GraduationCap className="h-4 w-4 text-akwaba-orange" />
          Informations scolaires
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <InfoLigne icone={GraduationCap} label="Classe" valeur={classe?.nom} />
          <InfoLigne icone={GraduationCap} label="Niveau" valeur={classe?.niveau} />
          <InfoLigne icone={MapPin} label="Salle" valeur={classe?.salle} />
        </div>
      </div>
    </div>
  )
}

function TablePaiements({ paiements }: { paiements: Paiement[] }) {
  return (
    <TableSimple
      vide="Aucun paiement enregistré"
      entetes={['Date', 'Référence', 'Type', 'Méthode', 'Montant', 'Statut']}
      lignes={paiements.map((paiement) => [
        formaterDate(paiement.datePaiement),
        paiement.reference,
        paiement.type,
        paiement.methode,
        formaterMontant(paiement.montant),
        paiement.statut,
      ])}
    />
  )
}

function TableAbsences({ absences }: { absences: Absence[] }) {
  return (
    <TableSimple
      vide="Aucune absence enregistrée"
      entetes={['Date', 'Type', 'Matière', 'Statut', 'Justification']}
      lignes={absences.map((absence) => [
        formaterDate(absence.date),
        absence.type,
        absence.matiere ?? 'Journee entiere',
        absence.statut === 'justifiee'
          ? 'Justifiee'
          : absence.statut === 'non_justifiee'
            ? 'Non justifiee'
            : 'En attente',
        absence.justification ?? '-',
      ])}
    />
  )
}

function TableSimple({ entetes, lignes, vide }: { entetes: string[]; lignes: string[][]; vide: string }) {
  if (lignes.length === 0) {
    return (
      <div className="carte-principale p-12 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-akwaba-muted" />
        <p className="text-akwaba-muted">{vide}</p>
      </div>
    )
  }

  return (
    <div className="carte-principale overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-akwaba-bordure">
              {entetes.map((entete) => (
                <th key={entete} className="p-4 text-left text-xs font-medium uppercase text-akwaba-muted">
                  {entete}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-akwaba-bordure">
            {lignes.map((ligne, index) => (
              <tr key={index} className="ligne-tableau">
                {ligne.map((cellule, celluleIndex) => (
                  <td key={celluleIndex} className="p-4 text-sm text-akwaba-texte">
                    {celluleIndex === ligne.length - 1 && (cellule === 'justifiee' || cellule === 'Justifiee') ? (
                      <span className="badge-succes inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {cellule}
                      </span>
                    ) : celluleIndex === ligne.length - 1 &&
                      (cellule === 'non_justifiee' || cellule === 'Non justifiee') ? (
                      <span className="badge-erreur inline-flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> {cellule}
                      </span>
                    ) : (
                      cellule
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoLigne({ icone: Icone, label, valeur }: { icone: React.ElementType; label: string; valeur?: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-akwaba-surface">
        <Icone className="h-4 w-4 text-akwaba-muted" />
      </div>
      <div>
        <p className="text-xs text-akwaba-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-akwaba-texte">{valeur ?? '-'}</p>
      </div>
    </div>
  )
}
