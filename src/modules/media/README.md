# Module Media

Téléchargement sécurisé, validation des formats et métadonnées d'images et de fichiers multimédias.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/` | ✅ | `list` |
| `POST` | `/import` | ✅ | `import` |
| `POST` | `/upload` | ✅ | `upload` |
| `DELETE` | `/:id` | ✅ | `remove` |

## Structure
```bash
media/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
│   ├── media-security.ts
│   ├── media-storage.ts
├── routes/ → Routes Express
├── services/ → Logique métier
├── validator/ → Schémas Zod de validation
├── index.ts → API publique du module
└── README.md
```

## Règles métier (erreurs levées par le service)

- Un data URL image valide est requis
- La taille de l'image dépasse la limite autorisée
- Le serveur source ne fournit pas un type image autorisé
- Média introuvable.
- Ce média ne vous appartient pas.

## Dépendances

- `@prisma/client`
- `axios`
- `express`
- `node:crypto`
- `node:dns/promises`
- `node:net`
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
- `utils/pagination`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`mediaRepository`, `mediaService`, `mediaController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
