# Lurevia — API Backend

Backend complet pour la boutique en ligne **Lurevia** (artisanat malgache), conçu pour remplacer le stockage `localStorage` du frontend par une vraie API REST sécurisée, scalable et prête pour la production.

**Stack** : Node.js · Express · TypeScript · Prisma ORM · PostgreSQL

---

## Sommaire

1. [Démarrage rapide avec Docker](#1-démarrage-rapide-avec-docker)
2. [Installation manuelle](#2-installation-manuelle)
3. [Variables d'environnement](#3-variables-denvironnement)
4. [Comptes de démonstration](#4-comptes-de-démonstration)
5. [Structure du projet](#5-structure-du-projet)
6. [Vue d'ensemble de l'API](#6-vue-densemble-de-lapi)
7. [Choix de sécurité importants](#7-choix-de-sécurité-importants)
8. [Tests](#8-tests)
9. [Déploiement en production](#9-déploiement-en-production)
10. [Connexion avec le frontend](#10-connexion-avec-le-frontend)
11. [Limitations connues & pistes d'évolution](#11-limitations-connues--pistes-dévolution)

---

## 1. Démarrage rapide avec Docker

Prérequis : Docker + Docker Compose.

```bash
cd lurevia-backend

# 1. Créez un fichier .env à la racine avec au minimum :
cat > .env <<'EOF'
JWT_ACCESS_SECRET=changez-moi-en-une-chaine-aleatoire-de-32-caracteres-minimum
JWT_REFRESH_SECRET=changez-moi-aussi-en-une-autre-chaine-aleatoire-differente
EOF

# 2. Lancez PostgreSQL + l'API
docker compose up --build
```

L'API démarre sur `http://localhost:4000/api/v1`. Le conteneur applique automatiquement le schéma à la base de données au démarrage.

Pour peupler la base avec le catalogue de démonstration (30 produits, 6 catégories, 2 comptes) :

```bash
docker compose exec api npm run seed
```

---

## 2. Installation manuelle

Prérequis : Node.js ≥ 20, PostgreSQL ≥ 14 (local ou distant).

```bash
cd lurevia-backend
npm install

# Copiez et complétez le fichier d'environnement
cp .env.example .env
# → éditez .env : DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET au minimum

# Appliquer les migrations versionnées (développement)
npm run prisma:migrate:dev

# En production/Render, appliquer uniquement les migrations existantes
npm run prisma:migrate

# Peuple la base avec le catalogue de démonstration
npm run seed

# Lance le serveur en mode développement (rechargement à chaud)
npm run dev
```

L'API est alors disponible sur `http://localhost:4000/api/v1`.

**Commandes utiles :**

| Commande                    | Description                                        |
|------------------------------|-----------------------------------------------------|
| `npm run dev`                | Serveur de développement avec rechargement à chaud  |
| `npm run build`               | Compilation TypeScript → `dist/`                   |
| `npm start`                   | Lance le build compilé (production)                |
| `npm run typecheck`           | Vérifie les types sans compiler                    |
| `npm run lint`                | Analyse statique du code                           |
| `npm test`                    | Exécute la suite de tests                          |
| `npm run prisma:studio`       | Interface graphique pour explorer la base          |
| `npm run prisma:migrate:dev`  | Crée une nouvelle migration après modif du schéma  |
| `npm run seed`                | Réimporte le catalogue de démonstration            |

> ⚠️ **Important** : `prisma generate` (exécuté automatiquement via `postinstall`) télécharge le moteur Prisma correspondant à votre OS lors du premier `npm install`. Cela nécessite un accès internet sortant normal — aucune configuration réseau particulière n'est requise sur une machine de développement ou un serveur standard.

---

## 3. Variables d'environnement

Voir `.env.example` pour la liste complète et les valeurs par défaut. Les plus importantes :

| Variable                  | Description                                                                 |
|----------------------------|------------------------------------------------------------------------------|
| `DATABASE_URL`             | Chaîne de connexion PostgreSQL                                              |
| `JWT_ACCESS_SECRET`        | Secret du token d'accès (≥ 32 caractères, à générer avec `openssl rand -base64 64`) |
| `JWT_REFRESH_SECRET`       | Secret du refresh token (différent du précédent)                           |
| `CORS_ORIGINS`             | Origines autorisées, séparées par des virgules (ex: URL de votre frontend) |
| `COOKIE_SECURE`            | Mettre à `true` en production (HTTPS obligatoire)                          |
| `DEFAULT_SHIPPING_COST`    | Frais de livraison par défaut, en Ariary                                   |
| `FREE_SHIPPING_THRESHOLD`  | Montant au-delà duquel la livraison est gratuite                           |
| `REVIEW_DELAY_DAYS`        | Délai avant qu'un client puisse laisser un avis après achat                |
| `ADMIN_RATE_LIMIT_MAX`     | Limite dédiée aux opérations d'administration (plus permissive que l'auth) |

Le serveur **refuse de démarrer** si une variable requise est absente ou invalide (validation stricte via Zod dans `src/config/env.ts`) — c'est volontaire : mieux vaut échouer immédiatement au démarrage qu'en pleine production.

---

## 4. Comptes de démonstration

Créés par `npm run seed` :

| Rôle       | Identifiant           | Mot de passe   |
|------------|------------------------|----------------|
| Admin      | `admin@lurevia.mg`     | `Admin1234!`   |
| Client     | `client@lurevia.mg`    | `Client1234!`  |

**Changez ces mots de passe (ou supprimez ces comptes) avant toute mise en production réelle.**

---

## 5. Structure du projet

```text
prisma/
  schema.prisma        Modèle de données complet
  seed.ts               Script de peuplement (catalogue + comptes démo)
  seed-src/              Données extraites du frontend (catégories, produits)
src/
  config/env.ts          Validation des variables d'environnement (Zod)
  lib/                   Client Prisma singleton, logger structuré (Pino)
  errors/AppError.ts     Hiérarchie d'erreurs métier
  middlewares/           Auth, validation, gestion d'erreurs, rate limiting
  utils/                 JWT, hashing, pagination, cookies, slugs...
  modules/<domaine>/     Un dossier par domaine métier :
    *.validators.ts        Schémas Zod (validation des entrées)
    *.repository.ts         Accès aux données (Prisma)
    *.service.ts             Logique métier
    *.controller.ts           Adaptation requête/réponse HTTP
    *.routes.ts                 Déclaration des routes Express
  routes/index.ts        Assemblage de toutes les routes client et admin
  app.ts                  Pipeline de middlewares Express
  server.ts               Point d'entrée, démarrage, arrêt propre
tests/                  Tests unitaires et d'intégration (Vitest)
```

Architecture en couches **Route → Controller → Service → Repository → Prisma**, cohérente sur l'ensemble des modules. Les deux anciens backends sont remplacés par cette seule application et ce seul singleton Prisma.

La matrice complète des accès est disponible dans [docs/access-matrix.md](docs/access-matrix.md).

---

## 6. Vue d'ensemble de l'API

Toutes les routes sont préfixées par `/api/v1` (configurable via `API_PREFIX`).

| Domaine | Routes principales |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| **Utilisateur** | `PATCH /users/me`, `POST /users/me/change-password` |
| **Adresses** | `GET/POST /addresses`, `PATCH/DELETE /addresses/:id`, `POST /addresses/:id/default` |
| **Catégories** | `GET /categories`, `GET /categories/:slug`, CRUD admin |
| **Produits** | `GET /products` (filtres : catégorie, prix, taille, couleur, stock, recherche, tri, pagination), `GET /products/:id`, `GET /products/:id/related`, `GET /products/search/suggestions`, CRUD admin |
| **Panier** | `GET /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/:productId`, `DELETE /cart` |
| **Favoris** | `GET /favorites`, `POST /favorites/:productId/toggle` |
| **Commandes** | `POST /orders` (checkout), `GET /orders`, `GET /orders/:id`, `POST /orders/:id/cancel`, `PATCH /orders/:id/status` (admin) |
| **Avis produits** | `GET /products/:id/reviews`, `GET /products/:id/reviews/rating`, `GET /products/:id/reviews/eligibility`, `POST /products/:id/reviews`, `PATCH/DELETE /reviews/:id` |
| **Feedback service** | `GET /feedback`, `GET /feedback/stats`, `POST /feedback`, `PATCH/DELETE /feedback/:id` |
| **Notifications** | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all`, `DELETE /notifications` |
| **Newsletter** | `POST /newsletter/subscribe` |
| **Santé** | `GET /health` |

Toutes les réponses suivent le format `{ "data": ... }` en succès et `{ "error": { "code", "message", "details?" } }` en erreur.

### Authentification

- Le token d'accès (**JWT**, 15 min par défaut) se transmet via l'en-tête `Authorization: Bearer <token>`.
- Le refresh token (opaque, 30 jours par défaut) est stocké dans un **cookie httpOnly** — il n'est jamais accessible en JavaScript côté client, ce qui limite l'exposition aux attaques XSS.
- Rotation automatique à chaque `POST /auth/refresh`, avec détection de rejeu (un token déjà utilisé/révoqué invalide immédiatement toutes les sessions de l'utilisateur, par précaution).

---

## 7. Choix de sécurité importants

- **Mots de passe** hashés avec bcrypt (12 rounds), jamais renvoyés dans les réponses API.
- **Aucune donnée de carte bancaire brute** (numéro, CVV) n'est acceptée par cette API — ce serait une violation PCI-DSS. Le paiement par carte doit être confirmé côté client via un prestataire tiers (Stripe, etc.) qui renvoie un jeton, jamais les données de carte.
- **Rate limiting** renforcé sur les routes d'authentification (`/auth/*`) pour limiter le brute-force et le credential stuffing.
- **Validation systématique** de toutes les entrées avec Zod — le frontend n'est jamais considéré comme une source de confiance.
- **Totaux de commande calculés côté serveur**, jamais confiés au client.
- **Autorisation vérifiée à chaque endpoint** sensible (propriété des ressources : une adresse, un panier, une commande, un avis n'appartenant pas à l'utilisateur connecté renvoie 403/404).
- **En-têtes de sécurité** via Helmet, CORS strict par liste blanche, protection contre la pollution de paramètres HTTP (hpp).
- **Gestion d'erreurs centralisée** : aucune stack trace, requête SQL ou secret n'est jamais renvoyé au client en production.
- **Décrémentation atomique du stock** lors du checkout (transaction Prisma avec vérification conditionnelle) pour éviter la survente en cas de requêtes concurrentes.

---

## 8. Tests

```bash
npm test          # exécution unique
npm run test:watch # mode watch
```

La suite couvre actuellement les utilitaires critiques (pagination, parsing de durées) et un test d'intégration du endpoint de santé. Le module `orders` (checkout, annulation, restauration de stock) et `auth` (rotation de tokens) sont les priorités naturelles pour étendre la couverture avant une mise en production réelle — une base de test PostgreSQL dédiée (ou `testcontainers`) serait alors recommandée.

---

## 9. Déploiement en production

1. Générez des secrets JWT forts et uniques (`openssl rand -base64 64`).
2. Positionnez `NODE_ENV=production` et `COOKIE_SECURE=true` (nécessite HTTPS).
3. Renseignez `CORS_ORIGINS` avec l'URL exacte de votre frontend déployé.
4. Committez le dossier `prisma/migrations` généré par `prisma migrate dev` avant le premier déploiement, puis utilisez `prisma migrate deploy` (déjà intégré dans `docker-compose.yml` et le `Dockerfile`) — jamais `migrate dev` en production.
5. Placez l'API derrière un reverse proxy (Nginx, Caddy) ou une plateforme gérée (Railway, Render, Fly.io) assurant la terminaison TLS.
6. Surveillez les logs structurés (JSON via Pino) avec votre solution d'observabilité habituelle.

Le `Dockerfile` fourni est un build multi-étapes minimal (image Alpine, utilisateur non-root, healthcheck intégré).

---

## 10. Connexion avec le frontend

Le frontend actuel stocke tout dans `localStorage` via des Context React (`AuthContext`, `CartContext`, `OrdersContext`, etc.). Pour le brancher sur cette API :

- Remplacez les fonctions de chaque Context par des appels `fetch`/`axios` vers les endpoints correspondants, en conservant `credentials: "include"` pour que le cookie de refresh token soit transmis.
- Stockez le token d'accès en mémoire (variable React/état global), jamais dans `localStorage`, pour limiter l'exposition XSS.
- **Différence volontaire** : les lignes de commande (`order.items`) renvoient un instantané figé (`titleSnapshot`, `priceSnapshot`) plutôt qu'une référence complète au produit — cela garantit que l'historique d'une commande reste exact même si le produit change de prix ou est supprimé par la suite. Adaptez le composant d'affichage des commandes en conséquence.
- Le statut favori d'un produit (`isFavorite`) n'est plus embarqué dans chaque objet produit : récupérez la liste des favoris séparément via `GET /favorites` et croisez côté client, ou demandez une extension de l'API si un champ combiné est nécessaire.

---

## 11. Limitations connues & pistes d'évolution

Ces choix ont été faits pour rester simples et proportionnés au besoin actuel (voir les commentaires dans le code source aux endroits concernés) :

- **Upload d'avatar** : l'API accepte une URL d'image déjà hébergée plutôt qu'un upload de fichier binaire. Ajouter un stockage (S3, Cloudinary...) est une extension naturelle.
- **Paiement** : aucune intégration réelle avec un prestataire (Mobile Money, Stripe...) n'est câblée — le statut de transaction est simulé (`SUCCESS` immédiat pour carte/mobile money, `PENDING` pour le paiement à la livraison). À remplacer par de vrais webhooks de confirmation en production.
- **Notifications** : les rappels "avis en attente" sont générés à la lecture (`GET /notifications`) plutôt que par une tâche planifiée — largement suffisant au volume actuel, mais une vraie tâche cron serait préférable à grande échelle.
- **Métrique de popularité** : le tri "populaire" des produits utilise le nombre d'avis comme approximation, faute d'un système de tracking des vues/ventes dédié.
- **Avis de démonstration** : les avis fictifs du catalogue mock (auteurs non rattachés à de vrais comptes) ne sont pas importés comme lignes `ProductReview` — seule la note moyenne agrégée est reprise, pour ne pas créer de fausses relations utilisateur.
