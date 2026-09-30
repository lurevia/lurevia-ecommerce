# Module Catégories

## 📖 Présentation
Arborescence et taxonomie des catégories de produits, slugification et hiérarchie parent-enfant.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/categories/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── categories.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── categories.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── categories.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── categories.routes.ts         # Définition des routes Express & middlewares de sécurité
├── categories.validators.ts     # Règles Zod de validation des requêtes
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
[categories.routes.ts] ──► Validation avec [dto/ / categories.validators.ts]
       │
       ▼
[categories.controller.ts]
       │
       ▼
[categories.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[categories.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  categoriesRouter,
  // Services, DTOs et types exportés
} from "./modules/categories";
```
