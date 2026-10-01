# Module Settings

Paramètres de la plateforme (enregistrement unique) : lecture publique, lecture complète et mise à jour auditée.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/public` | — | `getPublic` |
| `GET` | `/admin` | ✅ (ADMIN) | `get` |
| `PATCH` | `/admin` | ✅ (ADMIN) | `update` |

## Structure
```bash
settings/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   └── type/ → Types internes
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
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`settingsRepository`, `settingsService`, `settingsController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
