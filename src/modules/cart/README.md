# Module Panier d'achat

## 📖 Présentation
Gestion du panier des clients, vérification des stocks, synchronisation des quantités et calcul des totaux avant commande.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/cart/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── cart.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── cart.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── cart.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── cart.routes.ts         # Définition des routes Express & middlewares de sécurité
├── cart.validators.ts     # Règles Zod de validation des requêtes
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
[cart.routes.ts] ──► Validation avec [dto/ / cart.validators.ts]
       │
       ▼
[cart.controller.ts]
       │
       ▼
[cart.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[cart.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  cartRouter,
  // Services, DTOs et types exportés
} from "./modules/cart";
```
