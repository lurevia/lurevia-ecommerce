# Module Auctions

Gestion des enchères en direct (produits en vente aux enchères, chronomètres anti-sniping, socket temps réel, chat d'enchères et watchers).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | — | `list` |
| `GET` | `/:productId` | — | `getByProductId` |
| `GET` | `/:productId/stats` | — | `getStats` |
| `GET` | `/:productId/messages` | — | `listMessages` |
| `GET` | `/:productId/watchers/count` | — | `watcherCount` |
| `POST` | `/:productId/watch` | ✅ | `watch` |
| `DELETE` | `/:productId/watch` | ✅ | `unwatch` |
| `POST` | `/:productId/messages` | ✅ | `postMessage` |
| `DELETE` | `/:productId/messages/:messageId` | ✅ | `deleteMessage` |

## Structure
```bash
auctions/
├── controller/ → Traduction HTTP ↔ métier
├── cron/ → Tâches planifiées
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   ├── helper/ → Fonctions utilitaires
│   └── type/ → Types internes
├── mapper/ → Entité interne → contrat de sortie
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── socket/ → Temps réel (Socket.IO)
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Enchère introuvable.
- Cette enchère est terminée.
- Message introuvable.
- Vous ne pouvez pas supprimer ce message.

## Dépendances

- `@prisma/client`
- `express`
- `node:http`
- `socket.io`
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
- `utils/pagination`
- module `notifications`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`auctionsRepository`, `auctionsService`, `auctionsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
