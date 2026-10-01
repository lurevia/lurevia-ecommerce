# Module Auth

Cycle de vie d'authentification utilisateur : inscription, connexion, rafraîchissement JWT, réinitialisation de mot de passe et OAuth2 (Google, Facebook).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/login` | — | `login` |
| `POST` | `/oauth/callback` | — | `oauthCallback` |
| `POST` | `/refresh` | — | `refresh` |
| `POST` | `/logout` | — | `logout` |
| `GET` | `/me` | ✅ | `me` |
| `POST` | `/verification/request` | ✅ | `requestVerification` |
| `GET` | `/verification/status` | ✅ | `verificationStatus` |

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
- Ce compte n'a pas de mot de passe. Connectez-vous avec Google ou Facebook.
- Session invalide, veuillez vous reconnecter.
- Session expirée, veuillez vous reconnecter.
- Utilisateur introuvable.
- Votre compte est déjà vérifié.
- Ajoutez votre numéro de téléphone avant de demander la validation.
- Token Google invalide.
- Token Facebook invalide.
- Fournisseur OAuth non supporté.

## Dépendances

- `@prisma/client`
- `axios`
- `express`
- `google-auth-library`
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
