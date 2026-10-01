# Module Orders

Passage de commande (checkout depuis le panier ou une adresse enregistrée), calcul des totaux et des frais de livraison côté serveur, consultation, annulation et changement de statut par l'administration.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/` | ✅ | `checkout` |
| `GET` | `/` | ✅ | `list` |
| `GET` | `/:id` | ✅ | `getById` |
| `POST` | `/:id/cancel` | ✅ | `cancel` |
| `PATCH` | `/:id/status` | ✅ (ADMIN) | `adminUpdateStatus` |

## Structure
```bash
orders/
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

- Votre panier est vide.
- Adresse introuvable.
- Point relais introuvable.
- Méthode de paiement invalide.
- Le stock de certains articles a changé entre-temps.
- Une commande déjà expédiée ou livrée ne peut plus être annulée.
- Cette commande est déjà annulée.
- Commande introuvable.
- Statut de commande invalide.
- Cette commande ne vous appartient pas.

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
- `utils/orderNumber`
- `utils/pagination`
- `utils/phone`
- module `addresses`
- module `cart`
- module `notifications`
- module `shipping-zones`

## Consommateurs externes

- **admin**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`ordersRepository`, `ordersService`, `ordersController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
