# Akwaba IT — Documentation Projet

> Système de gestion scolaire complet (ERP école) construit avec Next.js 14, TypeScript, TailwindCSS et Supabase.

---

## 1. Vue d'ensemble

**Akwaba IT** est une application web de gestion scolaire destinée aux établissements d'enseignement en Côte d'Ivoire. Elle permet de gérer :

- Les élèves (inscription, fiches, scolarité)
- Les enseignants et leur affectation aux classes
- Les classes et niveaux
- Les notes et évaluations par trimestre
- Les paiements de scolarité et frais annexes
- Les absences et retards
- Un tableau de bord avec statistiques en temps réel

Le projet est conçu pour fonctionner **en mode démo sans Supabase** (données stockées dans `localStorage`) ou **en mode production** avec une base PostgreSQL Supabase.

---

## 2. Stack technique

| Couche          | Technologie                      | Version |
| --------------- | -------------------------------- | ------- |
| Framework       | Next.js (App Router)             | 14      |
| Langage         | TypeScript                       | strict  |
| Styling         | TailwindCSS                      | 3.x     |
| UI Components   | Radix UI + composants custom     | —       |
| Base de données | Supabase (PostgreSQL + RLS)      | —       |
| Auth            | Supabase Auth (JWT + cookies)    | —       |
| SSR / Cookies   | `@supabase/ssr`                  | 0.1.0   |
| Validation      | Zod                              | 3.x     |
| Tests           | Vitest + jsdom                   | 4.x     |
| Lint            | ESLint (import/order) + Prettier | —       |
| CI/CD           | GitHub Actions                   | Node 20 |

### Alias de chemin

```ts
"@/*" → "./*"  // racine du projet
```

---

## 3. Architecture des dossiers

```
├── app/                    # Next.js App Router (routes + pages)
│   ├── absences/           # Page absences
│   ├── auth/               # Pages auth (connexion, mdp oublié...)
│   ├── classes/            # Page classes
│   ├── dashboard/          # Page d'accueil
│   ├── eleves/             # Page élèves + fiche détail [id]
│   ├── enseignants/        # Page enseignants
│   ├── notes/              # Page notes
│   ├── paiements/          # Page paiements
│   ├── parametres/         # Page paramètres
│   └── layout.tsx          # Root layout
├── composants/
│   ├── dashboard/          # Cartes stats, graphiques
│   ├── eleves/             # ModaleAjoutEleve
│   ├── layout/             # Sidebar, Topbar, ContenuPrincipal
│   ├── paiements/          # ModalePaiement
│   └── ui/                 # Modale, ModaleSuppression
├── hooks/                  # Hooks React métier
│   ├── useAuth.ts
│   ├── useCollections.ts   # Hooks CRUD réutilisables
│   └── useEleves.ts
├── lib/                    # Utils, contextes, validation
│   ├── donnees-mock.ts     # Données de démo
│   ├── sidebar-context.tsx
│   ├── supabase.ts         # Client Supabase + types
│   ├── utils.ts            # Helpers (formatage, calculs)
│   └── validation.ts       # Schémas Zod
├── services/               # Logique métier / API
│   ├── factory.ts          # Factory CRUD générique
│   ├── index.ts            # Services spécifiques
│   ├── eleveService.ts     # Service élèves (pagination)
│   ├── paiementService.ts  # Service paiements
│   ├── mappers.ts          # snake_case ↔ camelCase
│   ├── stockageLocal.ts    # localStorage fallback
│   └── erreurs.ts          # Gestion d'erreurs
├── supabase/
│   ├── migrations/           # Migrations SQL versionnées
│   ├── schema.sql            # Schéma complet (référence)
│   ├── seed.sql              # Données initiales
│   └── config.toml           # Config Supabase CLI
├── types/
│   └── index.ts              # Types TypeScript métier
├── types/supabase.ts         # Types Database Supabase
├── __tests__/unit/           # Tests unitaires
└── .github/workflows/ci.yml  # Pipeline CI
```

---

## 4. Base de données

### 4.1 Tables principales

| Table                | Description                              | Soft Delete      |
| -------------------- | ---------------------------------------- | ---------------- |
| `eleves`             | Données des élèves inscrits              | ✅ `supprime_le` |
| `enseignants`        | Corps enseignant                         | ✅ `supprime_le` |
| `classes`            | Classes et niveaux                       | ✅ `supprime_le` |
| `notes`              | Notes et évaluations                     | ✅ `supprime_le` |
| `paiements`          | Paiements scolaires                      | ✅ `supprime_le` |
| `absences`           | Registre des absences                    | ✅ `supprime_le` |
| `annees_scolaires`   | Années scolaires                         | ✅ `supprime_le` |
| `utilisateurs`       | Profils utilisateurs (liés à auth.users) | ✅ `supprime_le` |
| `enseignant_classes` | Liaison N-N enseignants ↔ classes        | ✅ `supprime_le` |
| `matieres`           | Matières normalisées                     | ✅ `supprime_le` |

### 4.2 Colonnnes communes

Toutes les tables principales possèdent :

- `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- `cree_le TIMESTAMPTZ DEFAULT NOW()`
- `mis_a_jour_le TIMESTAMPTZ DEFAULT NOW()`
- `supprime_le TIMESTAMPTZ` (soft delete — `NULL` = actif)

### 4.3 Types énumérés

```sql
role_utilisateur        ENUM ('admin', 'directeur', 'secretaire', 'enseignant')
statut_eleve            ENUM ('actif', 'inactif', 'suspendu', 'diplome')
statut_paiement         ENUM ('paye', 'en_attente', 'retard')
statut_paiement_record  ENUM ('paye', 'en_attente', 'annule', 'rembourse')
methode_paiement        ENUM ('especes', 'virement', 'mobile_money', 'cheque', 'carte')
type_paiement           ENUM ('scolarite', 'inscription', 'cantine', 'transport', 'activite', 'autre')
type_note               ENUM ('devoir', 'examen', 'controle', 'tp', 'projet')
statut_absence          ENUM ('non_justifiee', 'en_attente', 'justifiee')
statut_enseignant       ENUM ('actif', 'conge', 'inactif')
niveau_classe           ENUM ('CP1','CP2','CE1','CE2','CM1','CM2','6ème','5ème','4ème','3ème','2nde','1ère','Terminale','BTS1','BTS2')
```

### 4.4 Indexes stratégiques

```sql
-- Élèves
idx_eleves_classe      ON eleves(classe_id)
idx_eleves_statut      ON eleves(statut)
idx_eleves_matricule   ON eleves(matricule)
idx_eleves_annee       ON eleves(annee_scolaire_id)
idx_eleves_recherche   ON eleves USING gin (nom gin_trgm_ops, prenom gin_trgm_ops)

-- Paiements
idx_paiements_eleve    ON paiements(eleve_id)
idx_paiements_date     ON paiements(date_paiement DESC)
idx_paiements_statut   ON paiements(statut)

-- Notes
idx_notes_eleve        ON notes(eleve_id)
idx_notes_matiere      ON notes(matiere)
idx_notes_trimestre    ON notes(trimestre)

-- Absences
idx_absences_eleve     ON absences(eleve_id)
idx_absences_date      ON absences(date DESC)
idx_absences_statut    ON absences(statut)

-- Soft delete (partiels)
idx_*_supprime         ON <table>(supprime_le) WHERE supprime_le IS NULL
```

### 4.5 Triggers

| Trigger                | Table                    | Action                                                  |
| ---------------------- | ------------------------ | ------------------------------------------------------- |
| `tg_<table>_timestamp` | Toutes les tables métier | `BEFORE UPDATE` → met à jour `mis_a_jour_le`            |
| `tg_eleves_matricule`  | `eleves`                 | `BEFORE INSERT` → génère le matricule auto `AK-YY-XXXX` |

> **Note** : L'ancien trigger `sync_statut_paiement_eleve` a été supprimé en P0 car il était unidirectionnel et ne gérait pas les annulations/remboursements.

### 4.6 Vues

```sql
vue_eleves          -- Élèves avec nom de classe et niveau (security_invoker)
vue_stats_classes   -- Stats par classe (nb élèves, taux paiement)
```

### 4.7 Row Level Security (RLS)

**Politique de lecture**

- `utilisateurs` : staff uniquement (`admin`, `directeur`)
- `paiements` : staff uniquement (`admin`, `directeur`, `secretaire`)
- Autres tables : tout utilisateur authentifié

**Politique d'écriture**

- `eleves`, `paiements` : `admin`, `secretaire`
- `classes`, `enseignants`, `enseignant_classes` : `admin`, `directeur`, `secretaire`
- `notes`, `absences` : `admin`, `directeur`, `secretaire`, `enseignant`
- `annees_scolaires` : `admin`, `directeur`

---

## 5. Authentification et sécurité

### 5.1 Auth Supabase

- `useAuth` utilise `supabase.auth.getUser()` (validation serveur du JWT) et non `getSession()`
- Le rôle est lu depuis la table `utilisateurs`, jamais depuis `user_metadata`
- Le middleware valide la session et redirige vers `/auth/connexion` si non authentifié

### 5.2 Mode démo

Protégé par la variable d'environnement `NEXT_PUBLIC_ENABLE_DEMO_MODE` :

- Si `true` et Supabase non configuré : un cookie de session demo est créé
- Si `false` : pas de backdoor, le middleware bloque l'accès aux routes protégées

### 5.3 Sécurité implémentée (P0)

- ✅ Backdoor `admin123` supprimé
- ✅ `getUser()` au lieu de `getSession()`
- ✅ Rôle depuis `utilisateurs` table
- ✅ Middleware corrigé (plus de bypass)
- ✅ RLS restrictif (plus de `USING (true)` global)
- ✅ Indexes `pg_trgm` pour recherche texte
- ✅ Contraintes `CHECK` sur les dates et valeurs numériques

---

## 6. Services (couche métier)

### 6.1 Factory CRUD (`services/factory.ts`)

Génère automatiquement les opérations CRUD pour une entité :

```ts
const enseignantCRUD = creerServiceCRUD<Enseignant, FormulaireEnseignant>({
  cleLocal: 'akwaba.enseignants',
  initiales: ENSEIGNANTS_MOCK,
  tableSupabase: 'enseignants',
  mapper: mapperEnseignant,
  colonnes: colonnesEnseignant,
  prefixeId: 'ens',
  messages: { lister: '...', creer: '...', modifier: '...', supprimer: '...' },
  ordreParDefaut: { colonne: 'nom', asc: true },
})
```

**Méthodes générées :**

- `lister()` — select avec `.is('supprime_le', null).limit(100)`
- `creer(donnees)` — insert avec timestamps
- `modifier(id, donnees)` — update partiel
- `supprimer(id)` — **soft delete** (`UPDATE supprime_le = NOW()`)

### 6.2 Services spécifiques

| Service            | Particularité                                                               |
| ------------------ | --------------------------------------------------------------------------- |
| `eleveService`     | Pagination serveur (`page`, `parPage`), recherche `ilike`, `count: 'exact'` |
| `classeService`    | Calcule l'effectif depuis les élèves actifs                                 |
| `noteService`      | Filtres par `eleveId`, `matiere`, `trimestre`                               |
| `absenceService`   | Filtres par `eleveId`, `date`, `statut`                                     |
| `paiementService`  | Filtres par `eleveId`, `statut`, `type`                                     |
| `dashboardService` | `Promise.all` pour charger toutes les stats en parallèle                    |

### 6.3 Fallback localStorage

Si Supabase n'est pas configuré (`NEXT_PUBLIC_SUPABASE_URL` manquant), tous les services basculent automatiquement sur `localStorage` avec les données mock comme initiales.

---

## 7. Hooks React

### 7.1 `useCollections.ts`

Hooks génériques pour chaque entité :

- `useClasses()` — `{ classes, chargement, erreur, rafraichir, creer, modifier, supprimer }`
- `useEnseignants()`
- `usePaiements()`
- `useNotes()`
- `useAbsences()`
- `useDashboard()` — retourne `StatsDashboard`

### 7.2 `useEleves.ts`

Hook dédié aux élèves avec :

- Pagination (`page`, `parPage: 100`, `total`)
- Filtres (`recherche`, `classeId`, `statut`, `statutPaiement`)
- Mutations (`ajouterEleve`, `modifierEleve`, `supprimerEleve`)

### 7.3 `useAuth.ts`

Gestion de l'authentification :

- Lecture utilisateur connecté
- Rôle depuis la base
- Demo mode conditionnel

---

## 8. Composants UI

### 8.1 Système de modales (Radix UI)

Toutes les modales utilisent `@radix-ui/react-dialog` pour :

- **Focus trap** (piège de focus)
- **Scroll lock** (blocage du scroll du body)
- **Portal** (rendu dans `document.body`)
- **Overlay** avec backdrop blur

**Composants :**

- `Modale` — composant générique réutilisable
- `ModaleSuppression` — confirmation de suppression (alerte rouge)
- `ModaleAjoutEleve` — formulaire en 2 étapes
- `ModalePaiement` — formulaire de paiement

### 8.2 Layout

- `Sidebar` — navigation responsive (collapsible)
- `Topbar` — titre de page + actions
- `ContenuPrincipal` — wrapper avec gestion du sidebar state

---

## 9. Validation Zod (`lib/validation.ts`)

Schémas utilisés dans les formulaires pour valider côté client avant envoi :

```ts
schemaEleve // nom, prenom, dateNaissance, sexe, email, adresse, classeId...
schemaEnseignant // nom, prenom, email, specialite, statut...
schemaClasse // nom, niveau, capaciteMax, anneeScolaireId...
schemaPaiement // eleveId, montant > 0, methode, type, datePaiement...
schemaNote // eleveId, matiere, valeur 0-20, trimestre 1|2|3...
schemaAbsence // eleveId, type, date, statut...
```

Les erreurs sont affichées en temps réel sous chaque champ du formulaire.

---

## 10. Tests

| Fichier                                   | Couverture                                        |
| ----------------------------------------- | ------------------------------------------------- |
| `__tests__/unit/services/mappers.test.ts` | 13 tests — tous les mappers et `nettoyerColonnes` |

**Lancer les tests :**

```bash
npm test        # mode CLI
npm run test:ui # mode UI (Vitest browser)
```

---

## 11. CI/CD

Fichier `.github/workflows/ci.yml` :

```yaml
jobs:
  lint-and-type:
    - Checkout
    - Setup Node 20
    - npm ci
    - npm run lint
    - npm run type-check

  test:
    - Checkout
    - Setup Node 20
    - npm ci
    - npm test
```

Déclenchement : push/PR sur `main` et `develop`.

---

## 12. Guide d'installation

### 12.1 Prérequis

- Node.js 20+
- Compte Supabase (optionnel pour le mode démo)

### 12.2 Configuration

```bash
# 1. Cloner et installer
git clone <repo>
cd akwaba-it
npm install

# 2. Variables d'environnement
cp .env.example .env.local
```

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<cle-publique>
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

### 12.3 Démarrage

```bash
npm run dev      # Développement (localhost:3000)
npm run build    # Build production
npm start        # Démarrage production
```

### 12.4 Base de données

```bash
# Lancer Supabase local (si CLI installé)
npx supabase start

# Appliquer les migrations
npx supabase db reset

# Générer les types TypeScript
npm run db:types
```

---

## 13. Historique des priorités implémentées

### P0 — Sécurité & Stabilité (Critique)

- Auth sécurisé (`getUser`, rôle depuis DB)
- Middleware corrigé (plus de bypass)
- Dashboard avec données réelles
- Hooks robustes (`try/catch` partout)
- RLS corrigé, indexes ajoutés, trigger supprimé

### P1 — Qualité & Tooling

- Prettier + ESLint (`import/order`, `no-console`)
- Factory CRUD (`creerServiceCRUD`) réduisant ~70% de duplication
- 13 tests unitaires sur les mappers
- CI/CD GitHub Actions (lint + type-check + test)

### P2 — Accessibilité & Pagination

- Pagination serveur (`.limit(100)` sur tous les services)
- Modales Radix UI (focus trap, scroll lock, portal)
- Types Supabase (`Database` interface prête pour génération CLI)

### P3 — Fonctionnalités avancées

- **Soft delete** (`supprime_le` sur toutes les tables, filtres automatiques)
- **Validation Zod** (schémas complets, intégrés aux modales)
- **Matières normalisées** (table `matieres` avec 14 matières initiales)
- Refactor complet des modales avec Radix Dialog

---

## 14. Notes techniques

### 14.1 Pourquoi `@supabase/ssr` v0.1.0 sans generic `Database` ?

Le generic `createBrowserClient<Database>()` n'est pas activé car la v0.1.0 de `@supabase/ssr` ne résout pas correctement les types customs. Le type `Database` reste disponible dans `types/supabase.ts` pour un usage manuel dans les services. Il sera activé automatiquement après génération via `npm run db:types`.

### 14.2 Stratégie de pagination

- **Élèves** : vraie pagination serveur (`range`, `count: 'exact'`, `parPage: 100`)
- **Autres entités** : `.limit(100)` par défaut (filtres côté client pour l'instant)

### 14.3 Gestion des erreurs

Toutes les erreurs Supabase passent par `leverErreurService()` qui extrait le message d'erreur lisible. Les hooks affichent l'erreur via `setErreur`.

### 14.4 Mappers snake_case ↔ camelCase

Les mappers (`mapperEleve`, `mapperPaiement`, etc.) convertissent automatiquement les colonnes PostgreSQL (`snake_case`) vers les propriétés TypeScript (`camelCase`) et vice-versa via `colonnesEleve()`, `colonnesPaiement()`, etc.

---

## 15. Contact & Licence

Propriété intellectuelle d'**Akwaba IT**.
Développé pour la gestion scolaire en Côte d'Ivoire.
