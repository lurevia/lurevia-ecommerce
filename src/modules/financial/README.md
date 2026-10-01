# Module Financial

Gestion financière, calcul des commissions, chiffre d'affaires, rapports comptables et grands livres.

## Structure
```bash
financial/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   └── helper/ → Fonctions utilitaires
├── repository/ → Accès Prisma
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Vendeur introuvable.
- Cet utilisateur n'est pas un vendeur.
- Ce vendeur est désactivé.
- Un contrat en attente existe déjà pour ce vendeur.
- Contrat introuvable.
- Ce contrat a déjà été traité.
- Settlement introuvable.
- Ce settlement ne peut pas être transféré (statut actuel : …).
- Cette clé d'idempotence est déjà utilisée pour un autre transfert.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`

## Consommateurs externes

- **admin**
- **seller**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`financialRepository`, `financialService`, `financialController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
