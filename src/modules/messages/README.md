# Module Messagerie

## 📖 Présentation
Système de messagerie privée entre acheteurs, vendeurs et support client.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/messages/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── messages.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── messages.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── messages.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── messages.routes.ts         # Définition des routes Express & middlewares de sécurité
├── messages.validators.ts     # Règles Zod de validation des requêtes
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
[messages.routes.ts] ──► Validation avec [dto/ / messages.validators.ts]
       │
       ▼
[messages.controller.ts]
       │
       ▼
[messages.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[messages.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  messagesRouter,
  // Services, DTOs et types exportés
} from "./modules/messages";
```
