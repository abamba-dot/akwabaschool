/// <reference types="vitest/globals" />
import {
  nettoyerColonnes,
  mapperEleve,
  mapperEnseignant,
  mapperClasse,
  mapperPaiement,
  mapperNote,
  mapperAbsence,
  colonnesEleve,
  colonnesEnseignant,
} from '@/shared/lib/mappers'

describe('nettoyerColonnes', () => {
  it('supprime les propriétés undefined', () => {
    const result = nettoyerColonnes({ nom: 'Dupont', prenom: undefined, age: 12 })
    expect(result).toEqual({ nom: 'Dupont', age: 12 })
    expect(result).not.toHaveProperty('prenom')
  })

  it('conserve les valeurs falsy sauf undefined', () => {
    const result = nettoyerColonnes({ a: null, b: 0, c: '', d: false, e: undefined })
    expect(result).toEqual({ a: null, b: 0, c: '', d: false })
  })
})

describe('mapperEleve', () => {
  it('convertit snake_case en camelCase', () => {
    const row = {
      id: 'uuid-1',
      matricule: 'AK-24-0001',
      nom: 'Kone',
      prenom: 'Amadou',
      date_naissance: '2010-05-12',
      lieu_naissance: 'Abidjan',
      sexe: 'M',
      email: 'amadou@example.com',
      telephone: '0123456789',
      adresse: 'Rue des Ecoles',
      photo_url: 'https://photo.jpg',
      tuteur_nom: 'Kone Papa',
      tuteur_telephone: '0987654321',
      tuteur_email: 'papa@example.com',
      tuteur_relation: 'Père',
      classe_id: 'cl-1',
      annee_scolaire_id: 'as-1',
      statut: 'actif',
      statut_paiement: 'paye',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const eleve = mapperEleve(row)

    expect(eleve.id).toBe('uuid-1')
    expect(eleve.matricule).toBe('AK-24-0001')
    expect(eleve.nom).toBe('Kone')
    expect(eleve.prenom).toBe('Amadou')
    expect(eleve.dateNaissance).toBe('2010-05-12')
    expect(eleve.lieuNaissance).toBe('Abidjan')
    expect(eleve.sexe).toBe('M')
    expect(eleve.email).toBe('amadou@example.com')
    expect(eleve.telephone).toBe('0123456789')
    expect(eleve.adresse).toBe('Rue des Ecoles')
    expect(eleve.photoUrl).toBe('https://photo.jpg')
    expect(eleve.tuteurNom).toBe('Kone Papa')
    expect(eleve.tuteurTelephone).toBe('0987654321')
    expect(eleve.tuteurEmail).toBe('papa@example.com')
    expect(eleve.tuteurRelation).toBe('Père')
    expect(eleve.classeId).toBe('cl-1')
    expect(eleve.anneeScolaireId).toBe('as-1')
    expect(eleve.statut).toBe('actif')
    expect(eleve.statutPaiement).toBe('paye')
    expect(eleve.creeLe).toBe('2024-01-01T00:00:00Z')
    expect(eleve.misAJourLe).toBe('2024-01-02T00:00:00Z')
  })

  it('applique les valeurs par défaut', () => {
    const row = { id: 'uuid-2', nom: 'Test', matricule: 'AK-24-0002' }
    const eleve = mapperEleve(row)

    expect(eleve.sexe).toBe('M')
    expect(eleve.statut).toBe('actif')
    expect(eleve.statutPaiement).toBe('en_attente')
    expect(eleve.email).toBeUndefined()
    expect(eleve.photoUrl).toBeUndefined()
  })
})

describe('mapperEnseignant', () => {
  it('mappe correctement un enseignant', () => {
    const row = {
      id: 'ens-1',
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'marie@akwaba.edu',
      telephone: '0102030405',
      adresse: 'Rue du Lycée',
      photo_url: 'https://pic.jpg',
      specialite: 'Mathématiques',
      date_embauche: '2020-09-01',
      statut: 'actif',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const ens = mapperEnseignant(row)

    expect(ens.id).toBe('ens-1')
    expect(ens.nom).toBe('Dupont')
    expect(ens.prenom).toBe('Marie')
    expect(ens.email).toBe('marie@akwaba.edu')
    expect(ens.telephone).toBe('0102030405')
    expect(ens.adresse).toBe('Rue du Lycée')
    expect(ens.photoUrl).toBe('https://pic.jpg')
    expect(ens.specialite).toBe('Mathématiques')
    expect(ens.dateEmbauche).toBe('2020-09-01')
    expect(ens.statut).toBe('actif')
    expect(ens.creeLe).toBe('2024-01-01T00:00:00Z')
  })
})

describe('mapperClasse', () => {
  it('mappe une classe avec effectif', () => {
    const row = {
      id: 'cl-1',
      nom: '6ème A',
      niveau: '6ème',
      salle: 'Salle 101',
      capacite_max: 35,
      enseignant_principal_id: 'ens-1',
      annee_scolaire_id: 'as-1',
      eleves: [{ count: 28 }],
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const classe = mapperClasse(row)

    expect(classe.nom).toBe('6ème A')
    expect(classe.niveau).toBe('6ème')
    expect(classe.capaciteMax).toBe(35)
    expect(classe.effectif).toBe(28)
  })

  it('gère une classe sans effectif', () => {
    const row = {
      id: 'cl-2',
      nom: '5ème B',
      niveau: '5ème',
      capacite_max: 40,
      annee_scolaire_id: 'as-1',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const classe = mapperClasse(row)
    expect(classe.effectif).toBeUndefined()
  })
})

describe('mapperPaiement', () => {
  it('mappe un paiement avec élève joint', () => {
    const row = {
      id: 'pay-1',
      eleve_id: 'elv-1',
      eleve: { id: 'elv-1', nom: 'Kone', prenom: 'Amadou', matricule: 'AK-24-0001', classe_id: 'cl-1' },
      montant: 150000,
      date_paiement: '2024-09-01',
      methode: 'especes',
      type: 'scolarite',
      statut: 'paye',
      reference: 'REF-2024-001',
      description: 'Scolarité annuelle',
      recu_url: 'https://recu.pdf',
      annee_scolaire_id: 'as-1',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const paiement = mapperPaiement(row)

    expect(paiement.montant).toBe(150000)
    expect(paiement.eleve?.nom).toBe('Kone')
    expect(paiement.methode).toBe('especes')
    expect(paiement.statut).toBe('paye')
  })
})

describe('mapperNote', () => {
  it('mappe une note avec trimestre', () => {
    const row = {
      id: 'note-1',
      eleve_id: 'elv-1',
      matiere: 'Mathématiques',
      type: 'devoir',
      valeur: 15.5,
      bareme: 20,
      coefficient: 2,
      commentaire: 'Bon travail',
      date_evaluation: '2024-10-15',
      trimestre: 1,
      annee_scolaire_id: 'as-1',
      enseignant_id: 'ens-1',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const note = mapperNote(row)

    expect(note.valeur).toBe(15.5)
    expect(note.trimestre).toBe(1)
    expect(note.bareme).toBe(20)
    expect(note.coefficient).toBe(2)
  })

  it('gère le trimestre au format texte T1', () => {
    const row = {
      id: 'note-2',
      eleve_id: 'elv-1',
      matiere: 'Français',
      type: 'examen',
      valeur: 12,
      trimestre: 'T2',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const note = mapperNote(row)
    expect(note.trimestre).toBe(2)
  })
})

describe('mapperAbsence', () => {
  it('mappe une absence avec justification', () => {
    const row = {
      id: 'abs-1',
      eleve_id: 'elv-1',
      type: 'absence',
      date: '2024-10-01',
      heure_debut: '08:00',
      heure_fin: '12:00',
      matiere: 'Mathématiques',
      statut: 'justifiee',
      justification: 'Maladie',
      enseignant_id: 'ens-1',
      cree_le: '2024-01-01T00:00:00Z',
      mis_a_jour_le: '2024-01-02T00:00:00Z',
    }

    const absence = mapperAbsence(row)

    expect(absence.statut).toBe('justifiee')
    expect(absence.justification).toBe('Maladie')
    expect(absence.heureDebut).toBe('08:00')
    expect(absence.heureFin).toBe('12:00')
  })
})

describe('colonnesEleve', () => {
  it('convertit camelCase en snake_case pour Supabase', () => {
    const cols = colonnesEleve({
      nom: 'Kone',
      prenom: 'Amadou',
      dateNaissance: '2010-05-12',
      classeId: 'cl-1',
      statutPaiement: 'paye',
    })

    expect(cols).toHaveProperty('nom', 'Kone')
    expect(cols).toHaveProperty('prenom', 'Amadou')
    expect(cols).toHaveProperty('date_naissance', '2010-05-12')
    expect(cols).toHaveProperty('classe_id', 'cl-1')
    expect(cols).toHaveProperty('statut_paiement', 'paye')
    expect(cols).not.toHaveProperty('dateNaissance')
  })
})

describe('colonnesEnseignant', () => {
  it('ignore les propriétés undefined', () => {
    const cols = colonnesEnseignant({
      nom: 'Dupont',
      prenom: undefined,
      email: 'dupont@akwaba.edu',
    })

    expect(cols).toHaveProperty('nom')
    expect(cols).not.toHaveProperty('prenom')
    expect(cols).toHaveProperty('email')
  })
})
