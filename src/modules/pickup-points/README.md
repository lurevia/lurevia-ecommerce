# Module Pickup Points

Points relais (Cotisse, Transpost...) : consultation publique par région et administration (création, modification, suppression).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/public` | — | `listPublic` |
| `GET` | `/public/by-region` | — | `listByRegion` |
| `GET` | `/admin` | ✅ (ADMIN) | `list` |
| `GET` | `/admin/:id` | ✅ (ADMIN) | `getById` |
| `POST` | `/admin` | ✅ (ADMIN) | `create` |
| `PATCH` | `/admin/:id` | ✅ (ADMIN) | `update` |
| `DELETE` | `/admin/:id` | ✅ (ADMIN) | `remove` |

## Structure
```bash
pickup-points/
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

- Point relais introuvable.
- Un point relais "…" (…) existe déjà à ….
- Zone de livraison introuvable.
- Impossible de supprimer : … adresse(s) et … commande(s) utilisent ce point relais. Désactivez-le plutôt.

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
- `utils/geo`
- `utils/pagination`
- `utils/phone`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`pickupPointsRepository`, `pickupPointsService`, `pickupPointsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
