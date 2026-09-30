# Module Suivi de Livraison

## 📖 Présentation
Suivi en temps réel des colis et expéditions, géolocalisation des livreurs et synchronisation des statuts de livraison.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/delivery-tracking/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── delivery-tracking.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── delivery-tracking.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── delivery-tracking.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── delivery-tracking.routes.ts         # Définition des routes Express & middlewares de sécurité
├── delivery-tracking.validators.ts     # Règles Zod de validation des requêtes
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
[delivery-tracking.routes.ts] ──► Validation avec [dto/ / delivery-tracking.validators.ts]
       │
       ▼
[delivery-tracking.controller.ts]
       │
       ▼
[delivery-tracking.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[delivery-tracking.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  deliveryTrackingRouter,
  // Services, DTOs et types exportés
} from "./modules/delivery-tracking";
```
