# Module Reviews

Avis sur les produits : liste, note moyenne, avis de l'utilisateur, éligibilité, création, modification et suppression.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | — | `listForProduct` |
| `GET` | `/rating` | — | `getRating` |
| `GET` | `/eligibility` | — | `getEligibility` |
| `GET` | `/me` | ✅ | `getMine` |
| `POST` | `/` | ✅ | `create` |
| `PATCH` | `/:id` | — | `update` |
| `DELETE` | `/:id` | — | `remove` |

## Structure
```bash
reviews/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
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

- Produit introuvable.
- Vous n'êtes pas éligible pour laisser un avis sur ce produit.
- Avis introuvable.
- Cet avis ne vous appartient pas.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `config/env`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/rateLimit.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`
- module `products`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`reviewsRepository`, `reviewsService`, `reviewsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
