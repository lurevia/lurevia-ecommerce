# Module Exportation de Données

## 📖 Présentation
Génération de rapports Excel/CSV (commandes, profil utilisateur, historiques d'activité) dans le respect du RGPD.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/export/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── export.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── export.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── export.routes.ts         # Définition des routes Express & middlewares de sécurité
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
[export.routes.ts] ──► Validation avec [dto/ / export.validators.ts]
       │
       ▼
[export.controller.ts]
       │
       ▼
[export.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[export.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  exportRouter,
  // Services, DTOs et types exportés
} from "./modules/export";
```
