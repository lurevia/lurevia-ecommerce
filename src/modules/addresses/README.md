### 🥇 Niveau 1 : Constantes

| Mot-clé | Quand l'utiliser | Pourquoi |
|---|---|---|
| `const` | **Par défaut** pour toute variable | Empêche la réassignation → moins de bugs |
| `let` | Seulement si la valeur **doit** changer | Réassignation explicite = intention claire |
| `var` | ❌ **Jamais** | Portée floue, hoisting, déprécié en 2026 |

**Exemple** :
```typescript
const MAX = 10;      // ✅ Par défaut
let count = 0;       // ✅ Va changer
var old = "non";     // ❌ À bannir
```

**Ta règle perso** : si tu hésites, mets `const`. Si TS râle, passe à `let`.

---

### 🥈 Niveau 2 : Immutabilité

| Mot-clé | Quand l'utiliser | Pourquoi |
|---|---|---|
| `as const` | Sur une **valeur** qu'on grave dans le marbre | Fige le type (littéral) + `readonly` sur tout |
| `readonly` | Sur une **propriété** d'interface/type | Empêche la mutation après création |
| `Object.freeze` | Rarement — runtime uniquement | Bloque la mutation à l'exécution (perte de perfs) |

**Analogie** :
- `const` = écrire au **stylo** (tu ne réécris pas par-dessus)
- `as const` = **graver dans la pierre** (aucun changement possible)
- `readonly` = **règle affichée** (interdit la modif, mais pas physique)
- `Object.freeze` = **cadenas réel** (personne ne peut ouvrir)

**Exemples concrets** :

```typescript
// ✅ Constante figée
export const ROLES = ["ADMIN", "USER"] as const;
// Type : readonly ["ADMIN", "USER"]

// ✅ Propriété immuable
interface Config {
  readonly host: string;
  readonly port: number;
}

// ❌ Rarement nécessaire
const CACHE = Object.freeze({ key: "value" });
```

**Ta règle perso** : utilise `as const` sur tes constantes, `readonly` dans tes types quand une propriété ne change jamais. **Oublie `Object.freeze`** sauf besoin explicite.

---

### 🥉 Niveau 3 : Types utilitaires

| Type | Quand l'utiliser | Pourquoi |
|---|---|---|
| `Record<K, V>` | Objet avec **toutes les clés connues** | TS t'oblige à compléter toutes les clés |
| `Partial<T>` | Objet où **certaines clés sont optionnelles** | Utile pour les updates |
| `Pick<T, K>` | Extraire certaines propriétés | Utile pour les DTOs de sortie |
| `Omit<T, K>` | Exclure certaines propriétés | Utile pour cacher des champs sensibles |
| `Readonly<T>` | Rendre tout `readonly` | Rare — préfère `as const` |

**Exemple concret — `Record` sur ton projet** :
```typescript
export const REGIONS_BY_PROVINCE = {
  ANTANANARIVO: ["ITASY", "ANALAMANGA"],
  // ...
} satisfies Record<ProvinceMadagascar, readonly RegionMadagascar[]>;
```

**Pourquoi `satisfies Record` ici ?**
- TS vérifie que **chaque province** a bien sa liste de régions
- Si tu oublies une province → erreur immédiate
- Tu gardes le type **précis** (`readonly RegionMadagascar[]`) grâce à `satisfies`

**Ta règle perso** : utilise `Record<K, V>` quand tu as un **objet de configuration** ou un **mapping**. Évite `Readonly<T>` si `as const` suffit.

---

### 🎯 Niveau 4 : `satisfies` — Le plus subtil

**Le problème à résoudre** :

```typescript
// ❌ Avec annotation `:` — on perd la précision
const COLORS: Record<string, string> = {
  primary: "#2F7BF6",
  secondary: "#0A1B3D",
};
// Type : Record<string, string> — TS oublie "primary" et "secondary"

// ❌ Sans annotation — aucune vérification
const COLORS = {
  primray: "#2F7BF6",   // typo non détectée !
  secondery: "#0A1B3D",
};
// Type : { primray: string; secondery: string }
```

**Solution — `satisfies`** :
```typescript
// ✅ Vérification + précision
type ColorKeys = "primary" | "secondary" | "accent";

const COLORS = {
  primary: "#2F7BF6",
  secondary: "#0A1B3D",
  accent: "#E8A33D",
} satisfies Record<ColorKeys, string>;
// Type : { primary: string; secondary: string; accent: string }
```

**Différence clé** :

| Syntaxe | Vérifie ? | Garde le type précis ? |
|---|---|---|
| `const x: Type = {...}` | ✅ | ❌ Non (élargit) |
| `const x = {...}` | ❌ | ✅ Oui |
| `const x = {...} satisfies Type` | ✅ | ✅ **Oui** |

**Ta règle perso** : `satisfies` **quand tu veux les deux** — vérification **ET** précision. Sinon, `:` suffit.

**Le `satisfies` sur ton fichier** :
```typescript
} satisfies Record<ProvinceMadagascar, readonly RegionMadagascar[]>;
// ✅ Vérifie : toutes les provinces présentes
// ✅ Garde : les clés exactes ("ANTANANARIVO", "ANTSIRANANA"...) + readonly
```

---

### 🏆 Niveau 5 : Les imports

| Syntaxe | Quand l'utiliser | Pourquoi |
|---|---|---|
| `import { X }` | Valeur utilisée à **l'exécution** | Le code est chargé en mémoire |
| `import type { X }` | Type utilisé **uniquement** à la compilation | Rien dans le bundle final |

**Exemple** :
```typescript
import type { ProvinceMadagascar } from "@prisma/client";
// ✅ ProvinceMadagascar est un TYPE (enum TS), pas une valeur

import { prisma } from "../../lib/prisma";
// ✅ prisma est une VALEUR (instance de client)
```

**Pourquoi c'est important ?**
- Moins de code chargé au runtime
- Évite les imports circulaires
- Le bundler fait du tree-shaking plus agressif

**Ta règle perso** : dès que tu importes un **type**, une **interface**, un **enum** (utilisé comme type), mets `import type`. Si tu ne sais pas → regarde si TS râle en l'enlevant.

---

### 📊 Fiche mémo finale

| Mot-clé | Usage | Exemple de ton projet |
|---|---|---|
| `const` | **Par défaut** | `const MAX = 10;` |
| `let` | Si réassignation nécessaire | `let counter = 0;` |
| `as const` | Figer une valeur littérale | `ADDRESS_LIMITS = {...} as const` |
| `readonly` | Propriété immuable | `interface Config { readonly host: string }` |
| `Record<K, V>` | Objet avec clés exhaustives | `REGIONS_BY_PROVINCE` |
| `satisfies` | Vérifier **sans** perdre la précision | `} satisfies Record<...>` |
| `Partial<T>` | Champs optionnels | `UpdateAddressInput` |
| `Pick<T, K>` | Extraire des propriétés | DTO de sortie |
| `Omit<T, K>` | Cacher des champs | Cacher `passwordHash` |
| `import type` | Types uniquement | `import type { Province }` |
| `Object.freeze` | Rare | À éviter |

---

### 🧠 Règle d'or pour éviter "tout mettre dans le code"

Pose-toi **3 questions** avant de créer un fichier :

1. **Cette donnée change-t-elle souvent ?**
   - Jamais → `lib/constant/`
   - Parfois → `lib/types/`
   - Souvent → laisse dans le service

2. **Est-ce un contrat avec l'extérieur ?**
   - Oui (API entrée/sortie) → `dto/`
   - Non (interne) → `lib/types/`

3. **Est-ce une règle métier ?**
   - Oui → `service/`
   - Non → autre part

**Analogie** : ton code est une **maison**.
- `lib/constant/` = les **fondations** (ne bougent jamais)
- `lib/types/` = la **plomberie** (stable mais peut évoluer)
- `dto/` = les **portes et fenêtres** (communiquent avec l'extérieur)
- `service/` = les **habitants** (font vivre la maison)
- `repository/` = le **garage** (accès extérieur)

---
