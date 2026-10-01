# Module Addresses

Gestion des adresses de livraison des utilisateurs (livraison à domicile ou en point relais).

## But

Ce module permet à chaque utilisateur de :
- Créer, modifier, supprimer ses adresses
- Définir une adresse par défaut
- Choisir un point relais (Cotisse, Transpost...) pour la livraison

## Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `GET`    | `/api/v1/addresses`           | ✅ | Liste paginée des adresses |
| `GET`    | `/api/v1/addresses/:id`       | ✅ | Détail d'une adresse |
| `POST`   | `/api/v1/addresses`           | ✅ | Créer une adresse |
| `PATCH`  | `/api/v1/addresses/:id`       | ✅ | Modifier une adresse |
| `DELETE` | `/api/v1/addresses/:id`       | ✅ | Supprimer une adresse |
| `POST`   | `/api/v1/addresses/:id/default` | ✅ | Définir comme adresse par défaut |

## Structure
```bash
addresses/
├── dto/ → Contrats entrée/sortie (Zod + Output)
├── controller/ → Traduction HTTP ↔ métier
├── route/ → Routes Express
├── service/ → Logique métier
├── repository/ → Accès Prisma
├── lib/
│ ├── constant/ → Limites, mapping province → régions
│ └── types/ → Types internes (AddressWithPickup, AddressFilter)
├── index.ts → API publique du module
└── README.md
```


## Règles métier

1. **Une seule adresse par défaut par utilisateur** : quand on en définit une nouvelle, l'ancienne est décochée automatiquement.
2. **La première adresse est toujours par défaut** : même si l'utilisateur ne le demande pas.
3. **Le point relais doit être actif** : impossible de rattacher une adresse à un point relais désactivé.
4. **La région doit appartenir à la province** : contrainte géographique de Madagascar.
5. **Latitude et longitude vont ensemble** : les deux ou aucune.

## Dépendances internes

- `@prisma/client` — Types et client DB
- `lib/prisma` — Instance singleton Prisma
- `utils/phone` — Normalisation E.164 des numéros malgaches
- `errors/AppError` — Hiérarchie d'erreurs typées
- `utils/apiResponse` — Formatage uniforme des réponses

## Consommateurs externes

- **orders** : utilise `addressesService.getById` pour snapshotter l'adresse au checkout

## POO — Choix de design

- **Classes** avec `this` et injection de dépendances explicite
- **Instances uniques** exportées (`addressesService`, `addressesRepository`, `addressesController`)
- **Mapper statique** (`AddressMapper.toOutput`) — pas d'état, juste une transformation
- **Méthodes privées** dans le service pour l'assertion de règles métier