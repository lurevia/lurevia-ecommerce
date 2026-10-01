# Module Delivery Tracking

Suivi en temps réel des colis et expéditions, géolocalisation des livreurs et synchronisation des statuts de livraison.

## Endpoints

| Méthode | Route (relative au montage du router) | Auth | Handler |
|---|---|---|---|
| `GET` | `/my-deliveries` | ✅ (SELLER, ADMIN) | `listMyDeliveries` |
| `GET` | `/my-stats` | ✅ (SELLER, ADMIN) | `getMyStats` |
| `POST` | `/:orderId/ping` | ✅ (SELLER, ADMIN) | `ping` |
| `GET` | `/:orderId/latest` | ✅ | `getLatest` |
| `GET` | `/:orderId/history` | ✅ | `getHistory` |

## Structure
```bash
delivery-tracking/
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

- Commande introuvable.
- Cette commande n'est pas en cours de livraison (statut : …).
- Vous ne pouvez pas livrer votre propre commande.
- Cette livraison est déjà assignée à un autre livreur.
- Accès refusé.

## Dépendances

- `@prisma/client`
- `express`
- `zod`
- `errors/AppError`
- `lib/logger`
- `lib/prisma`
- `middlewares/auth.middleware`
- `middlewares/validate.middleware`
- `utils/apiResponse`
- `utils/asyncHandler`
- `utils/geo`
- `utils/pagination`

## POO — Choix de design

- **Classes** avec `this` et injection explicite du repository (service) ou du service (controller) par le constructeur
- **Instances uniques** exportées (`deliveryTrackingRepository`, `deliveryTrackingService`, `deliveryTrackingController` selon les fichiers présents)
- **Mapper** sans état : une classe par transformation entité → DTO de sortie
- **Types, constantes et helpers** rangés dans `lib/`, jamais dans les services
