# Module Categories

Arborescence et taxonomie des catégories de produits, slugification et hiérarchie parent-enfant.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | — | `list` |
| `GET` | `/:slug` | — | `getBySlug` |
| `POST` | `/` | ✅ (ADMIN) | `create` |
| `PATCH` | `/reorder` | ✅ (ADMIN) | `reorder` |
| `GET` | `/id/:id` | ✅ (ADMIN) | `getById` |
| `PATCH` | `/:id` | ✅ (ADMIN) | `update` |
| `DELETE` | `/:id` | ✅ (ADMIN) | `remove` |

## Structure
```bash
categories/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   └── helper/ → Fonctions utilitaires
├── mapper/ → Entité interne → contrat de sortie
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Catégorie introuvable.
- Impossible de supprimer : … produit(s) sont encore rattachés à cette catégorie.

## Dépendances

- `@prisma/client`
- `express`
- `slugify`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`categoriesRepository`, `categoriesService`, `categoriesController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
