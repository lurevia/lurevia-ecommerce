# Module Finances & Comptabilité

## 📖 Présentation
Gestion financière, calcul des commissions, chiffre d'affaires, rapports comptables et grands livres.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/financial/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── financial.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── financial.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── financial.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── financial.validators.ts     # Règles Zod de validation des requêtes
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
[financial.routes.ts] ──► Validation avec [dto/ / financial.validators.ts]
       │
       ▼
[financial.controller.ts]
       │
       ▼
[financial.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[financial.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  financialRouter,
  // Services, DTOs et types exportés
} from "./modules/financial";
```
