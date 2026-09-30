# Module Authentification & Sécurité

## 📖 Présentation
Cycle de vie d'authentification utilisateur : inscription, connexion, rafraîchissement JWT, réinitialisation de mot de passe et OAuth2 (Google, Facebook).

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/auth/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── auth.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── auth.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── auth.repository.ts     # Couche Accès aux données (requêtes Prisma & persistance)
├── auth.routes.ts         # Définition des routes Express & middlewares de sécurité
├── auth.validators.ts     # Règles Zod de validation des requêtes
├── auth.mapper.ts         # Mappers et assainissement des données pour les réponses DTO
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
[auth.routes.ts] ──► Validation avec [dto/ / auth.validators.ts]
       │
       ▼
[auth.controller.ts]
       │
       ▼
[auth.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[auth.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  authRouter,
  // Services, DTOs et types exportés
} from "./modules/auth";
```
