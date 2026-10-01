# Module Places

Passerelle HTTP vers le service de recherche de lieux (statut du service et recherche par texte).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/status` | — | `getStatus` |
| `GET` | `/search` | — | `search` |

## Structure
```bash
places/
├── controller/ → Traduction HTTP ↔ métier
├── routes/ → Routes Express
├── index.ts → API publique du module
└── README.md
```

## Dépendances

- `express`
- `services/places.service`
- `utils/apiResponse`
- `utils/asyncHandler`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`placesRepository`, `placesService`, `placesController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
