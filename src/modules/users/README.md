# Module Users

Compte utilisateur : mise à jour du profil, finalisation du profil OAuth, changement de mot de passe et demande de suppression de compte.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `PATCH` | `/me` | ✅ | `updateMe` |
| `PATCH` | `/me/oauth-profile` | ✅ | `completeOAuthProfile` |
| `POST` | `/me/change-password` | ✅ | `changePassword` |
| `POST` | `/me/deletion-request` | ✅ | `requestDeletion` |

## Structure
```bash
users/
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
- Cette route est réservée aux comptes sociaux incomplets.
- Ce numéro est déjà utilisé.
- Une demande de modification de profil est déjà en attente.
- Aucun mot de passe n'est défini sur ce compte. Utilisez la connexion sociale.
- Mot de passe actuel incorrect.
- Le nouveau mot de passe doit différer de l'ancien.
- Une demande de suppression est déjà en attente de traitement.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/rateLimit.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/password`
- `utils/phone`
- module `admin`
- module `auth`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`usersRepository`, `usersService`, `usersController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
