# Module Products

Catalogue produits : liste filtrée et paginée, détail par id ou slug, produits similaires, suggestions de recherche et gestion des produits du vendeur.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | — | `list` |
| `GET` | `/search/suggestions` | — | `searchSuggestions` |
| `GET` | `/slug/:slug` | — | `getBySlug` |
| `GET` | `/:id` | — | `getById` |
| `GET` | `/:id/related` | — | `getRelated` |
| `GET` | `/seller/mine` | ✅ (SELLER, ADMIN) | `listMine` |
| `POST` | `/` | ✅ (SELLER, ADMIN) | `create` |
| `PATCH` | `/:id` | ✅ (SELLER, ADMIN) | `update` |
| `DELETE` | `/:id` | ✅ (SELLER, ADMIN) | `remove` |

## Structure
```bash
products/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   ├── helper/ → Fonctions utilitaires
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
- Ce SKU est déjà utilisé.
- Ce produit ne vous appartient pas.

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
- `utils/slug`

## Consommateurs externes

- **admin**
- **bids**
- **cart**
- **favorites**
- **reviews**
- **seller**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`productsRepository`, `productsService`, `productsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
