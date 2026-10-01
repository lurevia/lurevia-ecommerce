# Module Identity Verifications

Vérification d'identité par soumission d'un numéro CIN uniquement. Aucune
photo de document n'est collectée; faute d'API officielle vérifiable accessible,
un administrateur examine la demande manuellement.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/` | ✅ | `submit` |
| `GET` | `/` | ✅ | `listMine` |
| `GET` | `/status` | ✅ | `getStatus` |
| `GET` | `/:id` | ✅ | `getById` |
| `DELETE` | `/:id` | ✅ | `cancel` |

## Structure
```bash
identity-verifications/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── mapper/ → Entité interne → contrat de sortie
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Utilisateur introuvable.
- Votre identité est déjà vérifiée.
- Vous avez déjà une demande de vérification en cours de traitement.
- Ce numéro CIN est déjà associé à un autre compte.
- Une demande utilisant ce numéro CIN est déjà en cours.
- Les pièces jointes ne sont pas acceptées.
- Vérification introuvable.
- Cette vérification ne vous appartient pas.
- Seule une demande en attente peut être annulée.

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
- `utils/pagination`
- `utils/phone`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`identityVerificationsRepository`, `identityVerificationsService`, `identityVerificationsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
