# Module Offres & Enchères (Bids)

## 📖 Présentation
Gestion des offres négociées et des surenchères en direct avec historique, validation des montants minimums et offres automatiques (auto-bids).

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/bids/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── bids.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── bids.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── bids.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── bids.routes.ts         # Définition des routes Express & middlewares de sécurité
├── bids.validators.ts     # Règles Zod de validation des requêtes
├── bids.mapper.ts         # Mappers et assainissement des données pour les réponses DTO
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
[bids.routes.ts] ──► Validation avec [dto/ / bids.validators.ts]
       │
       ▼
[bids.controller.ts]
       │
       ▼
[bids.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[bids.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  bidsRouter,
  // Services, DTOs et types exportés
} from "./modules/bids";
```
