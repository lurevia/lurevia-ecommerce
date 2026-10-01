# Module Export

Génération de rapports Excel/CSV (commandes, profil utilisateur, historiques d'activité) dans le respect du RGPD.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/me` | ✅ | `exportUserBackup` |

## Structure
```bash
export/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── constant/ → Constantes, includes/selects Prisma
│   └── helper/ → Fonctions utilitaires
├── routes/ → Routes Express
├── services/ → Logique métier
├── sheets/ → Feuilles Excel
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Utilisateur introuvable.

## Dépendances

- `exceljs`
- `express`
- `errors/AppError`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/rateLimit.middleware`
- `utils/asyncHandler`
- `utils/currency`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`exportRepository`, `exportService`, `exportController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
