# Module Transfers

Transferts de fonds du vendeur connecté : liste, détail et synthèse.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | ✅ | `listMine` |
| `GET` | `/summary` | ✅ | `getSummary` |
| `GET` | `/:id` | ✅ | `getById` |

## Structure
```bash
transfers/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   └── type/ → Types internes
├── mapper/ → Entité interne → contrat de sortie
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Transfert introuvable.
- Ce transfert ne vous appartient pas.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`transfersRepository`, `transfersService`, `transfersController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
