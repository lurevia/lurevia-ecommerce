# Module Vérification d'Identité (KYC)

## 📖 Présentation
Vérification des cartes d'identité (CIN), statut des mineurs avec vérification de tuteur légal et conformité légale.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/identity-verifications/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── identity-verifications.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── identity-verifications.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── identity-verifications.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── identity-verifications.routes.ts         # Définition des routes Express & middlewares de sécurité
├── identity-verifications.validators.ts     # Règles Zod de validation des requêtes
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
[identity-verifications.routes.ts] ──► Validation avec [dto/ / identity-verifications.validators.ts]
       │
       ▼
[identity-verifications.controller.ts]
       │
       ▼
[identity-verifications.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[identity-verifications.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  identityVerificationsRouter,
  // Services, DTOs et types exportés
} from "./modules/identity-verifications";
```
