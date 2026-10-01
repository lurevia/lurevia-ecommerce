# Module Cart

Gestion du panier des clients, vérification des stocks, synchronisation des quantités et calcul des totaux avant commande.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | ✅ | `get` |
| `POST` | `/items` | ✅ | `addItem` |
| `PATCH` | `/items/:productId` | ✅ | `updateItem` |
| `DELETE` | `/items/:productId` | ✅ | `removeItem` |
| `DELETE` | `/` | ✅ | `clear` |

## Structure
```bash
cart/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
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
- Ce produit est en rupture de stock.
- Couleur invalide pour ce produit.
- Taille invalide pour ce produit.

## Dépendances

- `express`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- module `products`

## Consommateurs externes

- **orders**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`cartRepository`, `cartService`, `cartController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
