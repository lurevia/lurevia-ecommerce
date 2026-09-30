# Module Newsletter

## 📖 Présentation
Abonnement, confirmation par email et désinscription à la newsletter de la plateforme.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/newsletter/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── newsletter.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── newsletter.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── newsletter.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── newsletter.routes.ts         # Définition des routes Express & middlewares de sécurité
├── newsletter.validators.ts     # Règles Zod de validation des requêtes
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
[newsletter.routes.ts] ──► Validation avec [dto/ / newsletter.validators.ts]
       │
       ▼
[newsletter.controller.ts]
       │
       ▼
[newsletter.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[newsletter.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  newsletterRouter,
  // Services, DTOs et types exportés
} from "./modules/newsletter";
```
