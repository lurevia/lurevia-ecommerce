# Module Messages

Système de messagerie privée entre acheteurs, vendeurs et support client.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | ✅ | `list` |
| `GET` | `/unread-count` | ✅ | `unreadCount` |
| `POST` | `/read-all` | ✅ | `markAllRead` |
| `GET` | `/:id` | ✅ | `getById` |
| `POST` | `/:id/read` | ✅ | `markRead` |

## Structure
```bash
messages/
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

- Message introuvable.
- Ce message ne vous appartient pas.

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

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`messagesRepository`, `messagesService`, `messagesController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
