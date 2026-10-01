# Module Shipping Zones

Zones et tarifs de livraison : consultation publique et administration (création, modification, suppression).

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/public` | — | `listPublic` |
| `GET` | `/admin` | ✅ (ADMIN) | `list` |
| `GET` | `/admin/:id` | ✅ (ADMIN) | `getById` |
| `POST` | `/admin` | ✅ (ADMIN) | `create` |
| `PATCH` | `/admin/:id` | ✅ (ADMIN) | `update` |
| `DELETE` | `/admin/:id` | ✅ (ADMIN) | `remove` |

## Structure
```bash
shipping-zones/
├── controller/ → Traduction HTTP ↔ métier
├── dto/ → Contrats entrée/sortie (réexport des schémas Zod + types de sortie)
├── lib/
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

- Zone de livraison introuvable.
- Une zone avec ce nom existe déjà.
- Impossible de supprimer : … commande(s) utilisent cette zone. Désactivez-la plutôt.

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

## Consommateurs externes

- **orders**

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`shippingZonesRepository`, `shippingZonesService`, `shippingZonesController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
