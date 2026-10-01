# Module Feedback

Collecte des avis, signalements et retours d'expérience sur la plateforme Lurevia.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | — | `listPublic` |
| `GET` | `/stats` | — | `stats` |
| `GET` | `/me` | ✅ | `listMine` |
| `POST` | `/` | ✅ | `create` |
| `PATCH` | `/:id` | ✅ | `update` |
| `DELETE` | `/:id` | ✅ | `remove` |

## Structure
```bash
feedback/
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

- Cette commande ne vous appartient pas.
- Le produit n'appartient pas à cette commande.
- Vous ne pouvez pas rattacher ce produit à votre feedback.
- Feedback introuvable.
- Ce feedback ne vous appartient pas.
- Un feedback approuvé ne peut plus être modifié. Contactez le support.

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
- **Instances uniques** exportées (`feedbackRepository`, `feedbackService`, `feedbackController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
