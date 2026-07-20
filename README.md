# Sankhofa — Frontend (version démo, backend mocké)

Ce projet est le frontend Sankhofa (marketplace africaine + logistique Sankhofa Ship),
amélioré pour fonctionner **entièrement sans backend réel**, grâce à une couche de
simulation qui reproduit fidèlement le comportement de la future API.

Tout fonctionne comme si un vrai serveur tournait : connexion, inscription, catalogue,
panier, commandes, demandes d'expédition avec code de vérification, gestion de stock,
réseau de collaboration entre vendeurs, itinéraires de transporteurs... Les données sont
persistées dans le `localStorage` du navigateur, donc elles survivent à un rafraîchissement
de page.

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:8080](http://localhost:8080).

```bash
npm run build     # build de production dans dist/
npm run preview   # sert le build de production
```

## Comptes de démonstration

La page `/auth` affiche directement ces comptes (cliquables pour pré-remplir le
formulaire). Mot de passe identique pour les trois :

| Rôle | Email | Mot de passe |
|---|---|---|
| Acheteur | `client@sankhofa.africa` | `password123` |
| Vendeur | `vendeur@sankhofa.africa` | `password123` |
| Transporteur | `transporteur@sankhofa.africa` | `password123` |

Le compte acheteur a 3 commandes pré-remplies (livrée, expédiée, payée en attente
d'expédition). Le compte vendeur possède 3 produits et au moins une commande à traiter.
Le compte transporteur a 2 itinéraires publiés et une expédition en cours (code de
vérification `7K2X9P`) plus une demande en attente.

Tu peux aussi créer un nouveau compte via `/auth` (inscription) — il rejoint
immédiatement les données mockées, avec persistance en `localStorage`.

## Ce qui a été ajouté / corrigé par rapport à la version fournie

### 1. Un vrai "faux backend" (`src/services/mockDb.ts` + `src/services/api.ts`)

L'ancien `services/api.ts` appelait un backend Django sur `http://127.0.0.1:8000/api`
qui n'existe pas dans cet environnement. Il a été entièrement réécrit pour simuler ce
backend en mémoire + `localStorage`, **en conservant exactement les mêmes noms de
fonctions et les mêmes formes de réponse** (`authService`, `orderService`,
`productService`, `collaborationService`, `logisticsService`).

Concrètement : **aucune page, aucun composant n'a eu besoin d'être modifié** pour
consommer ces données — ils continuent d'appeler `authService.login(...)`,
`productService.getProducts(...)`, etc. exactement comme avant. Le fichier original est
conservé dans `src/services/api.ts.original-axios-backup` pour référence, le jour où le
vrai backend sera prêt (il suffira de remplacer le contenu de `api.ts` par un client
axios respectant le même contrat, documenté en commentaire dans `mockDb.ts`).

Le mock reproduit fidèlement :
- L'authentification (connexion, inscription avec les 3 rôles CLIENT/SELLER/TRANSPORTER,
  gestion du profil, changement de mot de passe), avec les mêmes messages d'erreur que
  l'API réelle attendait (email déjà utilisé, mot de passe incorrect...).
- Le catalogue produits, avec filtres (catégorie, pays, recherche, devise, fourchette de
  prix) et gestion de stock (seuil d'alerte, `is_low_stock` calculé).
- Les commandes (création au checkout, historique acheteur, vue vendeur).
- **Le cycle de vie complet d'une expédition** : demande → acceptée → récupérée → en
  transit → livrée (avec vérification du code de sécurité — un mauvais code est
  rejeté), et répercussion automatique du statut sur la commande liée.
- Les itinéraires transporteurs (création, suppression).
- Le réseau de collaboration entre vendeurs (demandes, acceptation, refus).

Toutes ces fonctions ont été testées bout-en-bout avant livraison (33 scénarios
vérifiés : connexion, erreurs, filtres, checkout, expédition avec mauvais/bon code,
mise à jour de commande, CRUD produit, collaboration, itinéraires, inscription).

### 2. Connexion et protection des routes (`src/components/sankhofa/RequireAuth.tsx`)

Dans la version fournie, n'importe qui pouvait taper `/seller/dashboard` dans la barre
d'adresse sans être connecté. Un garde-fou a été ajouté sur toutes les routes de
tableau de bord :
- Redirection vers `/auth` si personne n'est connecté.
- Redirection vers le bon tableau de bord si le rôle connecté ne correspond pas à
  l'espace demandé (ex: un acheteur qui tente `/seller/dashboard` est renvoyé vers
  `/client/dashboard`).

### 3. Navbar consciente de la connexion

Le bouton "Commencer" pointait toujours vers `/auth`, même une fois connecté. Il affiche
désormais "Mon espace" (lien vers le bon tableau de bord selon le rôle) et un bouton de
déconnexion quand quelqu'un est authentifié.

### 4. Correction d'un bug d'image dans le panier

`CartDrawer.tsx` préfixait les images avec `http://127.0.0.1:8000` (l'ancien backend
mort dans ce contexte), cassant l'affichage des visuels produits dans le panier. Corrigé
pour utiliser directement l'image fournie.

### 5. Correctif : le vendeur ne voyait jamais ses commandes à expédier

L'onglet "Sankhofa Ship" de l'espace vendeur appelait `orderService.getOrders()`
(qui ne renvoie que les commandes de l'acheteur connecté) au lieu de
`orderService.getSellerOrders()`. Résultat : un vendeur ne voyait jamais aucune
commande à expédier depuis son propre tableau de bord. Corrigé.

Un bug d'import a aussi été corrigé dans `DashboardSeller.tsx` (`X is not
defined` dans l'onglet Réseau & Collaboration, l'icône n'était pas importée).

### 6. Le client choisit qui gère l'expédition — dès la commande

Au moment de passer commande (panier → étape "Finalisation"), le client
choisit maintenant explicitement qui s'occupera de l'expédition :

- **"Je m'en occupe moi-même"** — il choisira un transporteur via Sankhofa
  Ship après la commande, comme avant.
- **"Confier au vendeur"** — le vendeur choisira et prendra en charge
  l'expédition à sa place.

Ce choix est enregistré immédiatement sur la commande (`shipping_delegated`).
Il reste aussi possible de changer d'avis après coup, depuis
`/client/dashboard/orders` : un bouton "Confier au vendeur" reste disponible
sur toute commande payée pas encore confiée.

- Côté acheteur (`/client/dashboard/orders`) : une commande confiée affiche
  "Expédition confiée au vendeur" à la place des actions d'expédition, et
  n'apparaît plus dans son propre sélecteur d'expédition
  (`/client/dashboard/shipping`).
- Côté vendeur (`/seller/dashboard/orders` et `/seller/dashboard/shipping`) :
  les commandes confiées sont mises en avant avec un badge "Confié par le
  client" et remontées en tête de liste, pour que le vendeur sache
  immédiatement lesquelles nécessitent son action.

Nouvelle fonction : `orderService.delegateShipping(orderId)` dans
`services/api.ts`, pour le changement d'avis après coup (seul l'acheteur
propriétaire de la commande peut l'appeler, et uniquement sur une commande au
statut `PAID`). Le choix initial passe lui directement dans le payload de
`orderService.createOrder(...)` via le champ `shipping_delegated`.

Pour tester immédiatement cette fonctionnalité sans repasser par le panier :
le compte vendeur de démo a déjà une commande (#1004) pré-confiée par le
client dans les données de seed.



Toutes les données mockées vivent dans le `localStorage` sous des clés préfixées
`sankhofa_mock_*`. Pour repartir de zéro (retrouver les comptes et données d'origine) :

```js
// Dans la console du navigateur
Object.keys(localStorage).filter(k => k.startsWith('sankhofa_mock_')).forEach(k => localStorage.removeItem(k));
location.reload();
```

### 7. Tarification par type de produit pour les itinéraires transporteur

Certaines entreprises de transport facturent le même prix au kg quel que soit
le produit ; d'autres facturent différemment selon le type de marchandise
(un tissu léger ne coûte pas pareil à transporter qu'un meuble). Le
formulaire "Nouvel itinéraire" du transporteur permet maintenant de choisir :

- **"Même prix pour tous les produits"** — un seul tarif au kg (comportement
  d'origine, conservé par défaut).
- **"Prix différent selon le type de produit"** — un tarif au kg propre à
  chaque catégorie du catalogue (Mode, Alimentaire, Décoration, Accessoires,
  Beauté).

Et dans les deux cas, il est possible d'ajouter des **exceptions sur un
produit précis** : un produit donné peut avoir son propre tarif, différent de
celui de sa catégorie (ex: un tabouret en bois massif coûte plus cher à
transporter que le reste de la catégorie "Décoration").

**Ordre de priorité appliqué** (fonction `resolveRoutePrice` dans
`services/mockDb.ts`) :
1. Exception spécifique au produit, si elle existe
2. Sinon, prix de la catégorie du produit (si l'itinéraire est en mode "par
   catégorie")
3. Sinon, le prix par défaut de l'itinéraire

En mode "par catégorie", si le transporteur ne renseigne pas de prix par
défaut explicite, celui-ci est calculé automatiquement (moyenne des prix de
catégorie saisis) — il sert uniquement de filet de sécurité si une nouvelle
catégorie de produit apparaissait plus tard sans tarif dédié.

L'itinéraire #202 des données de démo illustre ce mode (tarifs différents par
catégorie + une exception sur le "Tabouret Ashanti").



| Entité | Contenu de démo |
|---|---|
| Utilisateurs | 3 comptes de démo (1 par rôle) + 5 autres (4 vendeurs, 2 transporteurs additionnels) pour peupler les annuaires publics |
| Produits | Les 10 produits déjà présents dans `src/data/products.ts`, répartis entre 4 comptes vendeurs |
| Commandes | 3 commandes pour le compte acheteur de démo (statuts variés) |
| Expéditions | 2 expéditions pour le compte transporteur de démo |
| Itinéraires | 2 itinéraires pour le compte transporteur de démo |
| Demandes de collaboration | 2 demandes (1 en attente, 1 acceptée) impliquant le compte vendeur de démo |

## Stack technique (inchangée)

React 18 + Vite + TypeScript, React Router, TanStack Query, Tailwind CSS + shadcn/ui,
Framer Motion, Zod + React Hook Form, Sonner (toasts).
