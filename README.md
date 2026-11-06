# Liste d’attente Mariages 2028 — L’Atelier Fleurs & Sens

Cette version est prévue pour un dépôt GitHub et GitHub Pages. Les clientes remplissent le formulaire sans créer de compte. Le suivi est disponible dans `gestion.html`, après connexion Firebase de l’atelier.

**À lire avant de partager le lien : publier les fichiers sur GitHub ne suffit pas pour enregistrer les coordonnées. Il faut aussi installer le service Cloudflare fourni et renseigner son adresse dans `js/config.js`.** Tant que cette adresse reste vide, le bouton d’inscription reste désactivé : aucune confirmation fictive n’est affichée.

## Les fichiers

| Fichier ou dossier | Utilisation |
|---|---|
| `index.html` | Formulaire public et informations sur la liste d’attente |
| `gestion.html` | Connexion et tableau privé de suivi |
| `confidentialite.html` | Explication de l’utilisation des coordonnées |
| `assets/` | Logo, icône, présentation |
| `js/config.js` | Adresse du service Cloudflare et configuration Firebase existante |
| `js/waitlist.js` | Envoi du formulaire et confirmation |
| `js/gestion.js` | Tableau, recherche, notes, statuts, suppression et export Excel |
| `backend/worker.mjs` | Service complet à installer dans un **nouveau** Worker Cloudflare |
| `backend/schema.sql` | Tables à créer dans une **nouvelle** base D1 |
| `backend/wrangler.exemple.jsonc` | Configuration facultative pour une installation en ligne de commande |
| `INSTALLATION.html` | Guide illustré par des tableaux, à ouvrir dans votre navigateur |
| `tests/worker.test.mjs` | Tests automatiques sans envoi d’e-mail réel |

## 1. Publier les pages sur GitHub

1. Décompressez l’archive.
2. Créez un **nouveau dépôt**, par exemple `mariages-2028`.
3. Ajoutez le **contenu du dossier décompressé** à la racine du dépôt. Le fichier `index.html` doit être visible directement à la racine, au même niveau que `gestion.html`, `assets` et `js`.
4. Dans **Settings > Pages**, choisissez **Deploy from a branch**, la branche `main` et **/ (root)**, puis **Save**.
5. Copiez l’adresse affichée par GitHub Pages. Elle ressemble à `https://VOTRE-COMPTE.github.io/mariages-2028/`.

Gardez le dépôt de votre espace mariage actuel tel quel : ce projet utilise un nouveau dépôt.

## 2. Créer la base des inscriptions dans Cloudflare

1. Ouvrez votre compte Cloudflare.
2. Dans **Storage & databases > D1** (le libellé peut varier), créez une base nommée, par exemple, `mariages-2028`.
3. Ouvrez la console SQL de cette **nouvelle base**.
4. Copiez et exécutez le contenu de `backend/schema.sql`, **une seule fois**.

Les tables créées sont `registrations`, `notification_emails` et `rate_limits`. Les coordonnées sont enregistrées dans D1, jamais dans le dépôt GitHub. Les règles Firestore de votre espace mariage existant n’ont pas besoin d’être modifiées.

## 3. Installer le service Cloudflare

1. Dans **Workers & Pages**, créez un **nouveau Worker**, par exemple `atelier-fleurs-attente2028`.
2. Ouvrez l’éditeur de code et remplacez l’exemple par **tout le contenu de `backend/worker.mjs`**. Ce fichier est autonome : il n’y a pas de dépendance à installer.
3. Enregistrez et déployez.
4. Ajoutez une liaison D1 dans les paramètres du Worker : **nom de la variable `DB`**, puis sélectionnez la base créée à l’étape précédente.
5. Dans les variables du Worker, ajoutez les valeurs suivantes, puis redéployez.

| Nom exact | Valeur à saisir |
|---|---|
| `ALLOWED_ORIGINS` | L’origine du site, **sans chemin et sans barre finale**. Exemple : `https://VOTRE-COMPTE.github.io` |
| `PUBLIC_SITE_URL` | L’adresse **complète** du dossier publié, avec la barre finale. Exemple : `https://VOTRE-COMPTE.github.io/mariages-2028/` |
| `ADMIN_EMAILS` | `latelierfleursetsens@gmail.com` |

Les exemples `VOTRE-COMPTE` doivent être remplacés par votre vraie adresse. Si vous autorisez plusieurs origines ou comptes administrateurs, séparez les valeurs par une virgule. Une adresse administratrice doit correspondre à un compte Firebase dont l’adresse e-mail est vérifiée.

Le projet Firebase est déjà celui de votre espace mariage : `l-atelier-fleurs-et-sens`. Ses identifiants publics sont repris dans les fichiers. Il n’y a aucun mot de passe ni clé privée à ajouter au dépôt. Si la clé API Firebase a une restriction empêchant les appels serveur à Identity Toolkit, utilisez une configuration compatible côté Worker ; ne retirez pas de protection au hasard.

Les e-mails utilisent votre service existant `atelier-fleurs-mail.latelierfleursetsens.workers.dev` : ne remplacez pas son code. La notification atelier est adressée à `latelierfleursetsens@gmail.com`.

## 4. Relier le formulaire au Worker

1. Copiez l’adresse réelle du **nouveau Worker** donnée par Cloudflare.
2. Dans GitHub, ouvrez `js/config.js` et remplacez :

```js
API_URL: "",
```

par l’adresse copiée, par exemple :

```js
API_URL: "https://ADRESSE-REELLE-DU-WORKER.workers.dev",
```

3. Enregistrez la modification dans GitHub.
4. Dans votre navigateur, ouvrez l’adresse du Worker suivie de `/health`. Le résultat attendu est `{"ok":true,"service":"Mariages 2028"}`. Si ce n’est pas le cas, vérifiez la liaison `DB`, les tables et les variables du Worker.

## 5. Autoriser votre connexion au tableau privé

1. Ouvrez **Firebase Console > Authentication > Settings > Authorized domains**.
2. Ajoutez le **nom d’hôte** du site GitHub, par exemple `VOTRE-COMPTE.github.io`, sans `https://` et sans chemin.
3. Vérifiez que la connexion Google est activée dans les méthodes de connexion, comme pour votre espace mariage actuel.
4. Ouvrez votre site, puis cliquez sur **Espace Élodie** en bas de page.
5. Connectez-vous avec le compte Google **latelierfleursetsens@gmail.com**. Un autre compte n’aura pas accès aux fiches, sauf si vous l’ajoutez explicitement à `ADMIN_EMAILS` dans le Worker.

La connexion e-mail/mot de passe fonctionne aussi pour un compte Firebase existant dont l’adresse est vérifiée. Il ne s’agit pas nécessairement du mot de passe de votre boîte mail. Le site ne propose pas la création publique d’un compte administrateur.

L’adresse `gestion.html` peut être ouverte par une visiteuse, mais aucun contact n’est fourni sans vérification de son identité et de son autorisation côté serveur.

## 6. Faire une inscription d’essai avant de partager le lien

- Inscrivez-vous avec vos propres coordonnées, une date de 2028 et un nom mentionnant « TEST ».
- Vérifiez la confirmation à l’écran : reprise de contact au **printemps 2027** ; aucune date réservée.
- Vérifiez la réception de l’e-mail cliente et de la notification atelier, y compris dans les indésirables.
- Connectez-vous à `gestion.html` : la fiche doit être visible.
- Essayez le statut, les notes et l’export Excel.
- Supprimez la fiche d’essai quand les vérifications sont terminées.

Une coupure du service e-mail ne supprime pas une fiche enregistrée. Le tableau indique les envois à vérifier et permet de relancer ceux qui ne sont pas confirmés. Vérifiez votre messagerie avant une relance, car un délai réseau peut survenir après la réception effective d’un e-mail.

## Domaine personnalisé : facultatif

Commencez avec l’adresse GitHub Pages. Vous pourrez ensuite utiliser un sous-domaine, par exemple `mariages2028.latelierfleursetsens.fr`, après configuration dans GitHub Pages et dans les DNS de votre domaine.

Si vous changez d’adresse, mettez aussi à jour `PUBLIC_SITE_URL`, `ALLOWED_ORIGINS` et les domaines autorisés Firebase. Aucun fichier `CNAME` actif n’est inclus pour ne pas imposer un domaine non configuré.

## Contrôles réalisés

- Syntaxe des scripts vérifiée.
- 14 tests automatiques du service validés avec une base SQLite et des services e-mail/Firebase simulés : enregistrement, doublons, contrôles de saisie, consentement, autorisation, export, suppression et relance d’e-mails.
- Vérification des liens relatifs et des éléments requis par les scripts.

Le fonctionnement réel de votre nouveau Worker, la réception des e-mails et la connexion sur votre domaine doivent être testés **après votre installation**. Aucune inscription réelle ni aucun e-mail d’essai n’ont été créés pendant la préparation de cette archive.

Pour relancer les tests, utiliser Node.js 24 puis `node --test tests/worker.test.mjs`.

## Références techniques officielles

- [Publication GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Base D1 et liaison au Worker](https://developers.cloudflare.com/d1/get-started/)
- [Firebase Auth REST : informations associées à un ID token](https://firebase.google.com/docs/reference/rest/auth#section-get-account-info)
