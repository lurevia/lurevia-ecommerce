# Module Payments

Paiements Mobile Money (MVola, Orange Money, Airtel Money) : initiation, webhooks signés des opérateurs, consultation des transactions et remboursement.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/webhooks/:provider` | — | `webhook` |
| `POST` | `/initiate` | ✅ | `initiate` |
| `GET` | `/` | ✅ | `listMine` |
| `GET` | `/:transactionId` | ✅ | `getById` |
| `POST` | `/:transactionId/refund` | ✅ (ADMIN) | `refund` |

## Structure
```bash
payments/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   └── type/ → Types internes
├── mapper/ → Entité interne → contrat de sortie
├── operators/ → Connecteurs opérateurs Mobile Money
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Commande introuvable.
- Cette commande ne vous appartient pas.
- Cette commande ne peut plus être payée (statut : …).
- L'opérateur … n'est pas disponible pour le moment.
- Impossible de joindre …. Réessayez plus tard.
- Transaction introuvable.
- Cette transaction ne vous appartient pas.
- Signature invalide.
- Seule une transaction réussie peut être remboursée.

## Dépendances

- `@prisma/client`
- `axios`
- `express`
- `node:crypto`
- `zod`
- `config/env`
- `errors/AppError`
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/rateLimit.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/orderNumber`
- `utils/pagination`
- `utils/phone`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`paymentsRepository`, `paymentsService`, `paymentsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
