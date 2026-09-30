# Module Administration

## 📖 Présentation
Tableau de bord et fonctionnalités d'administration générale (statistiques, gestion des utilisateurs, journalisation des audits et modération).

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/admin/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── admin.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── admin.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── admin.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── admin.routes.ts         # Définition des routes Express & middlewares de sécurité
├── admin.validators.ts     # Règles Zod de validation des requêtes
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
[admin.routes.ts] ──► Validation avec [dto/ / admin.validators.ts]
       │
       ▼
[admin.controller.ts]
       │
       ▼
[admin.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[admin.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  adminRouter,
  // Services, DTOs et types exportés
} from "./modules/admin";
```
