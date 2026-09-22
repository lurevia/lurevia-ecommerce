# Matrice d'accès de l'API unifiée

Toutes les routes sont préfixées par `/api/v1`.

| Domaine | Public | CUSTOMER authentifié | ADMIN |
|---|---|---|---|
| `GET /products`, `GET /categories`, recherche et avis publics | Oui | Oui | Oui |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` | Oui | Oui | Oui |
| `GET/PATCH /users/me`, changement de mot de passe, demande de suppression | Non | Propre compte uniquement | Oui |
| `/addresses`, `/cart`, `/favorites`, `/notifications` | Non | Propre compte uniquement | Oui |
| `POST /orders` (checkout) | Non | Compte vérifié requis | Oui |
| `GET /orders`, `GET/PATCH/DELETE` avis et feedbacks personnels | Non | Propre compte ; avis vérifié requis | Oui |
| `/products` mutations et `/categories` mutations | Non | Non | ADMIN requis |
| `/admin/*` (statistiques, commandes, utilisateurs, modération, vérifications) | Non | Non | ADMIN requis |
| `POST /newsletter/subscribe`, `GET /feedback`, `GET /health` | Oui | Oui | Oui |

Les contrôleurs ne reçoivent que des entrées validées par Zod. Les services
réappliquent les contrôles de propriété avant toute lecture ou mutation d'une
ressource utilisateur.
