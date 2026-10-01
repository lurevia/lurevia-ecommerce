# Module Bids

Gestion des offres négociées et des surenchères en direct avec historique, validation des montants minimums et offres automatiques (auto-bids).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/` | ✅ | `createBid` |
| `GET` | `/me` | ✅ | `getMyBids` |
| `GET` | `/product/:productId` | ✅ (ADMIN, SELLER) | `getProductBids` |
| `PATCH` | `/:id/status` | ✅ (ADMIN, SELLER) | `updateStatus` |

## Structure
```bash
bids/
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
- Ce produit n'est plus disponible.
- Vous ne pouvez pas enchérir sur votre propre produit.
- Ce produit n'accepte pas d'offres.
- Vous avez déjà une offre en attente pour ce produit.
- Cette enchère n'est plus active.
- Cette enchère est terminée.
- Cette enchère est mal configurée.
- Offre introuvable.
- Vous n'êtes pas autorisé à modifier cette offre.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/auction`
- `utils/pagination`
- module `products`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`bidsRepository`, `bidsService`, `bidsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
