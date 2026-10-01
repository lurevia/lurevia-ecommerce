# Module Auth

Cycle de vie d'authentification utilisateur : inscription et connexion par email/mot de passe, connexion Facebook et rafraîchissement JWT.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/register` | — | `register` |
| `POST` | `/login` | — | `login` |
| `POST` | `/oauth/callback` | — | `oauthCallback` (Facebook uniquement) |
| `POST` | `/refresh` | — | `refresh` |
| `POST` | `/logout` | — | `logout` |
| `GET` | `/me` | ✅ | `me` |

## Structure
```bash
auth/
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

- Identifiants ou mot de passe incorrect.
- Ce compte n'a pas de mot de passe. Connectez-vous avec Facebook puis complétez votre compte.
- Session invalide, veuillez vous reconnecter.
- Session expirée, veuillez vous reconnecter.
- Utilisateur introuvable.
- Token Facebook invalide.
- Une adresse email ou un numéro de téléphone est déjà utilisé.

## Dépendances

- `@prisma/client`
- `axios`
- `express`
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
- `utils/cookies`
- `utils/jwt`
- `utils/password`
- `utils/phone`
- `utils/refreshToken`

## Consommateurs externes

- **users**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`authRepository`, `authService`, `authController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
