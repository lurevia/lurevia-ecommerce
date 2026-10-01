# Module Notifications

Notifications utilisateur (liste, compteur de non-lues, lecture, suppression) et déclencheurs transactionnels (commande expédiée/livrée, enchères, vérification d'identité, promotions, rappels d'avis).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | ✅ | `list` |
| `GET` | `/unread-count` | ✅ | `unreadCount` |
| `POST` | `/read-all` | ✅ | `markAllRead` |
| `POST` | `/:id/read` | ✅ | `markRead` |
| `DELETE` | `/` | ✅ | `clear` |

## Structure
```bash
notifications/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   └── helper/ → Fonctions utilitaires
├── mapper/ → Entité interne → contrat de sortie
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `config/env`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`

## Consommateurs externes

- **auctions**
- **orders**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`notificationsRepository`, `notificationsService`, `notificationsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
