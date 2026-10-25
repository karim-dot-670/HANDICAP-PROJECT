# Autrement vu (nom provisoire)

Site de sensibilisation au handicap au quotidien. React (Vite, TypeScript) pour le front, Supabase pour les données.
Construit d'après le PRD v2 et le design system v1 (`Design system et maquettes Meshy/`).

## Lancer le projet

```bash
npm install
npm run dev
```

Les clés publiques Supabase sont dans `.env.local` (modèle : `.env.example`). La clé publishable peut être
exposée côté navigateur : la sécurité repose sur les règles RLS.

`npm run build` produit le site statique dans `dist/` (à héberger en Europe, avec une redirection de toutes
les routes vers `index.html`).

## Ce qui est en place (MVP du PRD)

- Accueil : phrase forte et grille des 13 cartes, du plus courant au moins courant.
- Fiche : transition carte → fiche (View Transitions API, 560 ms), sélecteur de stade (radios natives,
  le stade est dans l'URL `?stade=3` pour le partage), texte en fondu enchaîné.
- **Vision 3D** pour les 13 handicaps : avertissement, ouverture en zoom depuis le bouton, déplacement
  souris / doigt / clavier, bouton Quitter + Échap, sous-titres, description textuelle, message de fin
  « Une minute ici ne remplace pas une vie ». Three.js n'est chargé qu'au clic.
  - Surdité (café, son filtré), moteur (rue en fauteuil), visuelle (supermarché : flou, tunnel, DMLA, cécité),
    autisme (gare, surcharge sensorielle).
  - DYS (consigne aux lettres mouvantes), TDAH (mail interrompu en open space), Alzheimer (cuisine : objets
    déplacés, étiquettes illisibles, visages effacés), déficience intellectuelle (guichet, formulaire et agent pressé),
    épilepsie (le lendemain d'une crise, aucune crise simulée), Parkinson (verre porté jusqu'au salon, marche figée),
    SEP (journée qui s'alourdit, épisodes de vue trouble), SLA (écrire avec le regard, l'ami qui finit vos phrases).
  - Schizophrénie (trajet en bus, voix chuchotées à gauche et à droite, selon la phase) : **scène provisoire**,
    signalée comme telle dans l'avertissement ; le PRD demande de la réécrire avec un témoin.
  - Code : `src/vision/` (`scenes.ts`, `scenes-more.ts`, outils communs dans `helpers.ts`).
- **Dans sa tête** : panneau latéral, pensées phrase par phrase (+600 ms), voix off optionnelle (voix de synthèse
  en attendant les enregistrements), contenu selon le stade.
- Témoignage (portrait ou illustration, vidéo/audio sous-titré si fourni, transcription, journée type),
  « Ce que je peux faire » (3 gestes), partage, quiz idées reçues, formulaire de contact, page éthique et sources.
- Accessibilité : focus lime visible partout, lien d'évitement, navigation clavier complète, « réduire les
  animations » → fondus de 150 ms, aucun flash, aucun son sans action.
- Vie privée : polices auto-hébergées, aucun cookie ; mesure anonyme sans identifiant persistant.

## Modifier les contenus sans coder

Dans le Studio Supabase, **Table Editor** :

| Table | Contenu |
| --- | --- |
| `conditions` | Les 13 fiches (texte, chiffres, scène, `vision_kind` = scène 3D disponible, `published`) |
| `stages` | Stades : libellé, description, pensées « Dans sa tête » (`thoughts`), intensité de simulation 0 → 1 |
| `gestures` | Les 3 gestes par fiche (`aider`, `eviter`, `amenager`) |
| `testimonies` | Témoignages ; `published` pour publier ou retirer, `is_example` pour les textes d'exemple |
| `quiz_questions` | Questions vrai/faux |
| `contact_messages` | Messages reçus (lecture réservée au Studio) |

Schéma et contenu initial : `supabase/migrations/` et `supabase/seed.sql`.

## Indicateurs du PRD

Dans le **SQL Editor** : `select * from kpi_summary;` (part des visites ayant terminé un témoignage, ouvert une
Vision 3D, ouvert « Dans sa tête », cliqué « Ce que je peux faire »…).
Avant le lancement, videz les événements de test : `truncate events;`.

## À faire avant publication

- Remplacer les témoignages d'exemple et les pensées par les textes écrits et validés avec les témoins.
- Vérifier les chiffres de prévalence (marqués « à vérifier »).
- Enregistrer les voix off ; ajouter portraits et médias (Supabase Storage, champs `portrait_url`, `media_url`, `captions_url`).
- Faire valider chaque scène par les témoins et une association ; réécrire la scène schizophrénie avec un témoin ;
  vidéo 360° de secours, audit RGAA.
