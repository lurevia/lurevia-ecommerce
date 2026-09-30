# Module Médias & Téléchargement

## 📖 Présentation
Téléchargement sécurisé, validation des formats et métadonnées d'images et de fichiers multimédias.

---

## 🏛️ Architecture & Packaging

Le module suit l'architecture en couches de Lurevia pour garantir la séparation des responsabilités (Single Responsibility Principle) et l'encapsulation orientée objet :

```
src/modules/media/
├── dto/                    # Schémas de validation Zod et contrats DTO (Data Transfer Objects)
│   └── index.ts            # Point d'entrée des DTOs et types du module
├── media.controller.ts     # Couche Contrôleur (gestion des requêtes HTTP et codes réponses)
├── media.service.ts        # Couche Service Métier (règles de gestion et logique applicative)
├── media.routes.ts         # Définition des routes Express & middlewares de sécurité
├── media.validators.ts     # Règles Zod de validation des requêtes
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
[media.routes.ts] ──► Validation avec [dto/ / media.validators.ts]
       │
       ▼
[media.controller.ts]
       │
       ▼
[media.service.ts] (Logique métier, transactions, calculs)
       │
       ▼
[media.repository.ts] (Requêtes Prisma ORM)
       │
       ▼
[Base de données PostgreSQL]
```

---

## 🚀 Utilisation & Importation

Pour consommer les fonctionnalités de ce module dans d'autres parties de l'application :

```typescript
import {
  mediaRouter,
  // Services, DTOs et types exportés
} from "./modules/media";
```
