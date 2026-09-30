# Module Favoris

## 📖 Présentation
Gestion des listes de souhaits et articles mis en favoris par les utilisateurs.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/favorites/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── favorites.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── favorites.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── favorites.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── favorites.routes.ts         # Définition des routes Express & middlewares de sécurité
├── favorites.validators.ts     # Règles Zod de validation des requêtes
└── index.ts                # Façade publique du module centralisant tous les exports
```

---

## 🔄 Flux d'interaction

```text
[Requête Client]
       │
       ▼
[Middlewares de sécurité & Auth]
       │
       ▼
[favorites.routes.ts] ──► Validation avec [dto/ / favorites.validators.ts]
       │
       ▼
[favorites.controller.ts]
       │
       ▼
[favorites.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[favorites.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  favoritesRouter,
  // Services, DTOs et types exportés
} from "./modules/favorites";
```
