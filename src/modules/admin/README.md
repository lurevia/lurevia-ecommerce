# Module Admin

Tableau de bord et fonctionnalités d'administration générale (statistiques, gestion des utilisateurs, journalisation des audits et modération).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/financial/stats` | ✅ | `stats` |
| `GET` | `/financial/contracts` | ✅ | `contracts` |
| `POST` | `/financial/contracts/:id/review` | ✅ | `reviewContract` |
| `GET` | `/financial/settlements` | ✅ | `settlements` |
| `GET` | `/financial/commissions` | ✅ | `commissions` |
| `GET` | `/financial/transfers` | ✅ | `transfers` |
| `POST` | `/financial/settlements/:id/transfer` | ✅ | `createTransfer` |
| `GET` | `/stats` | ✅ | `stats` |
| `GET` | `/users` | ✅ | `listUsers` (`page`, `limit`, `search`, `role`, `gender`, `age`, `sortField`, `sortOrder`) |
| `GET` | `/users/:id` | ✅ | `getUser` |
| `PATCH` | `/users/:id/role` | ✅ | `updateUserRole` |
| `DELETE` | `/users/:id` | ✅ | `removeUser` |
| `GET` | `/sellers` | ✅ | `listSellers` |
| `POST` | `/admins` | ✅ | `createAdmin` |
| `GET` | `/orders` | ✅ | `listOrders` |
| `GET` | `/orders/:id` | ✅ | `getOrder` |
| `GET` | `/reviews` | ✅ | `listReviews` |
| `POST` | `/reviews/:id/approve` | ✅ | `approveReview` |
| `POST` | `/reviews/:id/reject` | ✅ | `rejectReview` |
| `DELETE` | `/reviews/:id` | ✅ | `removeReview` |
| `GET` | `/feedback` | ✅ | `listFeedback` |
| `PATCH` | `/feedback/:id` | ✅ | `respondToFeedback` |
| `DELETE` | `/feedback/:id` | ✅ | `removeFeedback` |
| `GET` | `/deletion-requests` | ✅ | `listDeletionRequests` |
| `POST` | `/deletion-requests/:id/approve` | ✅ | `approveDeletionRequest` |
| `POST` | `/deletion-requests/:id/reject` | ✅ | `rejectDeletionRequest` |
| `GET` | `/verifications` | ✅ | `listVerifications` |
| `POST` | `/verifications/:id/approve` | ✅ | `approveVerification` |
| `POST` | `/verifications/:id/reject` | ✅ | `rejectVerification` |
| `GET` | `/identity-verifications` | ✅ | `listIdentityVerifications` (CIN à valider manuellement) |
| `POST` | `/identity-verifications/:id/approve` | ✅ | `approveIdentityVerification` |
| `POST` | `/identity-verifications/:id/reject` | ✅ | `rejectIdentityVerification` |
| `GET` | `/profile-change-requests` | ✅ | `listProfileChanges` |
| `POST` | `/profile-change-requests/:id/review` | ✅ | `reviewProfileChange` |
| `POST` | `/messages` | ✅ | `sendMessage` |
| `GET` | `/notifications` | ✅ | `listNotifications` |
| `GET` | `/notifications/unread-count` | ✅ | `unreadNotificationsCount` |
| `POST` | `/notifications/:id/read` | ✅ | `markNotificationRead` |
| `POST` | `/notifications/read-all` | ✅ | `markAllNotificationsRead` |

## Structure
```bash
admin/
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

- Demande de suppression introuvable.
- Cette demande a déjà été traitée.
- Demande de modification de profil introuvable.
- L'adresse e-mail ou le téléphone est déjà utilisé.
- Destinataire introuvable.
- Utilisateur introuvable.
- Un compte doit être vérifié avant de devenir vendeur.
- Un compte lié à des commandes ne peut pas être supprimé directement ; sa demande de suppression/anonymisation doit être traitée.
- Demande de vérification introuvable.
- Avis introuvable.
- Cet avis a déjà été rejeté.
- Feedback introuvable.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/rateLimit.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`
- `utils/password`
- `utils/phone`
- module `financial`
- module `orders`
- module `products`

## Consommateurs externes

- **users**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`adminRepository`, `adminService`, `adminController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
