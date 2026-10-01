# Module Newsletter

Abonnement, confirmation par email et désinscription à la newsletter de la plateforme.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `POST` | `/subscribe` | — | `subscribe` |
| `POST` | `/confirm` | — | `confirm` |
| `POST` | `/unsubscribe` | — | `unsubscribe` |
| `GET` | `/` | ✅ (ADMIN) | `list` |

## Structure
```bash
newsletter/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   └── helper/ → Fonctions utilitaires
├── repository/ → Accès Prisma
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Lien de confirmation introuvable.

## Dépendances

- `express`
- `node:crypto`
- `zod`
- `errors/AppError`
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `services/email.service`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/pagination`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`newsletterRepository`, `newsletterService`, `newsletterController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
