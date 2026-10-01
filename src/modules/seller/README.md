# Module Seller

Espace vendeur : candidature, gestion de ses produits, commandes, retours clients et statistiques.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/apply` | ✅ Compte vérifié | `apply` |
| `GET` | `/public` | Non | Répertoire des boutiques vérifiées, filtrable par recherche |
| `GET` | `/public/:id` | Non | Boutique publique et produits actifs |
| `GET` | `/profile` | ✅ Vendeur vérifié | Profil de sa boutique |
| `PATCH` | `/profile` | ✅ Vendeur vérifié | Modification des champs publics de la boutique |
| `POST` | `/contracts` | ✅ | `createContract` |
| `GET` | `/stats` | ✅ | `stats` |
| `GET` | `/feedback` | ✅ | `feedback` |
| `GET` | `/products` | ✅ | `products` |
| `POST` | `/products` | ✅ | `createProduct` |
| `PATCH` | `/products/:id` | ✅ | `updateProduct` |
| `DELETE` | `/products/:id` | ✅ | `removeProduct` |
| `GET` | `/orders` | ✅ | `orders` |
| `GET` | `/orders/:id` | ✅ | `order` |
| `PATCH` | `/orders/:id/status` | ✅ | `status` |

Toutes les autres routes vendeur exigent un compte authentifié, vérifié et ayant le rôle `SELLER`.

## Structure
```bash
seller/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Utilisateur introuvable.
- Votre compte doit être vérifié avant de devenir vendeur.
- Vous êtes déjà vendeur.
- Ce compte ne peut pas devenir vendeur.
- Commande introuvable.
- Cette commande contient des articles d'un autre vendeur et ne peut pas être modifiée globalement.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/asyncHandler`
- module `financial`
- module `products`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`sellerRepository`, `sellerService`, `sellerController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
