-- Contenu initial d'Autrement vu, tiré du PRD v2 (24 octobre 2026).
-- Chiffres = ordres de grandeur à vérifier avant publication.
-- Pensées « Dans sa tête » et témoignages = exemples de ton, à réécrire avec les témoins.

insert into public.conditions
  (slug, rank, name, prevalence, prevalence_unverified, scale_label, stages_summary, intro,
   scene_title, scene_description, vision_warning, vision_kind, invisible)
values
('surdite', 1, 'Déficience auditive', '≈ 5,2 millions', false, 'Classification BIAP',
 '4 stades · de légère à profonde',
 'Entendre mal, ce n’est pas entendre moins fort : c’est entendre flou. Les voix se mélangent au bruit, les consonnes disparaissent. Le vrai obstacle, c’est un lieu bruyant, une annonce sans affichage, quelqu’un qui parle en tournant la tête.',
 'café bondé',
 'Vous êtes assis au comptoir d’un café plein. Derrière vous, des conversations, des tasses, la machine à espresso. Le serveur vous parle en regardant ailleurs. Selon le stade, ses mots arrivent de plus en plus étouffés : à « sévère », vous ne saisissez que des fragments ; à « profonde », vous ne voyez plus que ses lèvres bouger. Les sous-titres montrent ce que la personne comprend réellement.',
 'Vous allez entendre des voix brouillées dans un café. Pas de flash. Le son démarre quand vous le décidez.',
 'auditive', true),
('dys', 2, 'Troubles DYS', '≈ 6 à 8 % de la population', true, 'Léger, modéré, sévère',
 '3 niveaux · dyslexie, dyspraxie…',
 'Dyslexie, dysorthographie, dyspraxie, dyscalculie : le cerveau traite autrement l’écrit, le geste ou les nombres. Rien à voir avec l’intelligence. L’obstacle, c’est une consigne écrite en tout petit, un temps limité, un tableau recopié à la main.',
 'page de texte',
 'Une page de consigne dont les lettres se déplacent, s’inversent (b et d, p et q) et se mélangent. Plus le niveau augmente, plus il faut d’effort pour reconstituer chaque mot.',
 'Vous allez lire un texte dont les lettres bougent. Pas de flash. Vous pouvez quitter à tout moment.',
 null, true),
('moteur', 3, 'Handicap moteur', '≈ 2,3 millions', false, 'Selon le niveau d’autonomie (lésion médullaire : échelle ASIA)',
 '3 niveaux · de la canne au fauteuil électrique',
 'Paraplégie, amputation, maladie neuromusculaire… Le handicap moteur se voit, mais pas ce qu’il coûte : chaque trajet se prépare. Une marche de 5 cm, une porte lourde, un ascenseur en panne suffisent à fermer une ville.',
 'rue à hauteur de fauteuil',
 'Vous avancez dans une rue, à la hauteur d’une personne en fauteuil roulant. Devant la boulangerie, une marche. Le trottoir n’a pas de bateau pour traverser. La porte de la pharmacie est lourde et s’ouvre vers vous. Selon le niveau, votre regard est plus bas et vous avancez plus lentement.',
 'Vous allez vous déplacer dans une rue à hauteur de fauteuil roulant. Pas de flash, pas de son.',
 'moteur', false),
('tdah', 4, 'TDAH', '≈ 5 % des enfants, 2 à 3 % des adultes', true, 'Léger, modéré, sévère (DSM-5)',
 '3 niveaux · de léger à sévère',
 'Le trouble du déficit de l’attention, avec ou sans hyperactivité, n’est pas un manque de volonté. Le cerveau n’arrive pas à filtrer : chaque bruit, chaque mouvement réclame la même attention. L’obstacle, c’est un open space, une réunion sans pause, une consigne donnée à l’oral et jamais écrite.',
 'bureau en open space',
 'Un bureau en 3D où chaque bruit, notification ou mouvement attire le regard. Plus le niveau augmente, plus les distractions se multiplient et plus il est difficile de revenir à la tâche.',
 'Vous allez être sollicité par des sons et des notifications. Pas de flash. Le son démarre quand vous le décidez.',
 null, true),
('visuelle', 5, 'Déficience visuelle', '≈ 1,7 million', false, 'Catégories OMS 1 à 5',
 '3 stades · de la malvoyance à la cécité',
 'Malvoyance ou cécité, la vue peut être floue, réduite à un tunnel (glaucome), trouée au centre (DMLA)… ou absente. L’obstacle : un panneau écrit trop petit, un prix illisible, un site web sans contraste, un objet laissé au milieu du trottoir.',
 'supermarché',
 'Vous êtes dans l’allée d’un supermarché. Des rayons de part et d’autre, des panneaux suspendus, des étiquettes de prix. Selon le stade et le type de vision choisi, l’image devient floue, se réduit à un tunnel ou se troue au centre, jusqu’au noir complet en cas de cécité.',
 'Vous allez voir une scène floue ou partiellement masquée. Pas de flash, pas de son.',
 'visuelle', false),
('alzheimer', 6, 'Alzheimer et maladies apparentées', '≈ 1 million', false, 'Léger, modéré, sévère (ou 7 stades de Reisberg)',
 '3 stades · de léger à sévère',
 'La maladie efface d’abord les souvenirs récents, puis les repères, puis les visages. La personne reste une personne : elle ressent, elle comprend le ton d’une voix. L’obstacle, c’est l’impatience, les questions-pièges (« tu te souviens ? ») et les lieux sans repères.',
 'sa propre cuisine',
 'Votre cuisine, que vous connaissez par cœur. Mais les objets changent de place, les étiquettes deviennent illisibles, et sur les photos du frigo les visages s’effacent peu à peu.',
 'Vous allez voir des objets et des visages disparaître. Pas de flash, pas de son.',
 null, true),
('autisme', 7, 'Autisme (TSA)', '≈ 1 % de la population ; 120 000 personnes suivies (2017)', true, '3 niveaux de soutien (DSM-5)',
 '3 niveaux · il n’existe pas de « stade 4 »',
 'L’autisme est une autre façon de percevoir et de traiter le monde, pas une maladie. Beaucoup de personnes autistes perçoivent les sons, les lumières et les foules avec une intensité que les autres filtrent sans y penser. Le niveau décrit le besoin de soutien, pas la valeur de la personne.',
 'gare à l’heure de pointe',
 'Un hall de gare en vue subjective. Les néons, les annonces, la foule qui vous frôle. Au niveau 1, c’est fatigant mais gérable. Au niveau 3, les lumières, les bruits et les mouvements s’amplifient jusqu’à la surcharge sensorielle : il devient impossible de penser à autre chose qu’à trouver un endroit calme.',
 'Vous allez entendre une foule et des annonces de plus en plus fortes. Lumières qui pulsent lentement, pas de flash. Le son démarre quand vous le décidez.',
 'autisme', true),
('deficience-intellectuelle', 8, 'Déficience intellectuelle', '≈ 650 000 à 700 000', false, 'Légère, moyenne, grave, profonde',
 '4 niveaux · dont trisomie 21',
 'Comprendre prend plus de temps, et l’abstrait est difficile. Mais l’obstacle principal, c’est le monde qui va trop vite : des formulaires écrits en langage administratif, des gens qui parlent à l’accompagnant plutôt qu’à la personne.',
 'guichet administratif',
 'Un guichet : le formulaire est rempli de mots compliqués, l’employé parle vite et regarde sa montre.',
 'Vous allez être face à un formulaire et un interlocuteur pressé. Pas de flash, pas de son.',
 null, true),
('schizophrenie', 9, 'Schizophrénie', '≈ 1 % de la population', true, 'Phases de la maladie',
 '3 phases · prodromique, aiguë, stabilisation',
 'La schizophrénie se soigne, et la plupart des personnes vivent stabilisées. Elle peut faire entendre des voix ou désorganiser la pensée. L’obstacle le plus lourd n’est souvent pas la maladie, c’est la peur qu’elle inspire et les clichés de violence.',
 'trajet en bus',
 'Un trajet en bus avec des voix chuchotées en son 3D. Scène co-écrite avec un témoin et précédée d’un avertissement.',
 'Vous allez entendre des voix chuchotées. Ce contenu peut être éprouvant. Pas de flash. Le son démarre quand vous le décidez.',
 null, true),
('epilepsie', 10, 'Épilepsie', '≈ 500 000', false, 'Pas de stades : selon l’équilibre du traitement',
 '2 situations · équilibrée ou pharmacorésistante',
 'Il n’y a pas de stades mais des types de crises (focales, généralisées) et une maladie plus ou moins équilibrée par le traitement. Entre les crises, la vie est souvent ordinaire. L’obstacle : l’interdiction de conduire, la peur des employeurs, les lumières stroboscopiques.',
 'le lendemain d’une crise',
 'Aucune simulation de crise : ce serait dangereux pour les visiteurs photosensibles. On montre le lendemain : la fatigue, les trous de mémoire, la journée à réorganiser.',
 'Aucune crise n’est simulée. Pas de flash, pas de son.',
 null, true),
('parkinson', 11, 'Maladie de Parkinson', '≈ 100 000 et plus', true, 'Stades de Hoehn et Yahr',
 '5 stades · de 1 à 5',
 'La maladie ralentit les gestes, peut faire trembler et parfois figer la marche. La tête reste vive. L’obstacle, c’est le regard des autres sur un tremblement, une file d’attente qui s’impatiente, un code de carte bancaire à taper vite.',
 'servir un verre',
 'Des mains 3D qui tremblent en servant un verre ; une marche qui se fige devant une porte.',
 'Vous allez voir des mains trembler. Pas de flash, pas de son.',
 null, false),
('sep', 12, 'Sclérose en plaques', '≈ 80 000 et plus', true, 'Formes de la maladie (échelle EDSS de 0 à 10)',
 '3 formes · rémittente à progressive',
 'Maladie du système nerveux, souvent diagnostiquée entre 20 et 40 ans. Fatigue écrasante, troubles de la vue, de l’équilibre : beaucoup de symptômes ne se voient pas. L’obstacle : « tu as pourtant l’air en forme ».',
 'une journée qui s’alourdit',
 'La scène s’alourdit au fil de la journée, la vue se trouble par moments.',
 'Vous allez voir une scène se troubler progressivement. Pas de flash, pas de son.',
 null, true),
('sla', 13, 'SLA (maladie de Charcot)', '≈ 1 000 nouveaux cas par an', false, 'Stades de King',
 '4 stades · de 1 à 4',
 'La sclérose latérale amyotrophique paralyse progressivement les muscles, jusqu’à la parole et la respiration. La pensée, elle, reste intacte. L’obstacle : qu’on parle à la personne comme si elle ne comprenait plus.',
 'communiquer par le regard',
 'La main ne répond plus ; vous communiquez par le regard sur une tablette, lettre par lettre.',
 'Vous allez écrire avec les yeux, lentement. Pas de flash, pas de son.',
 null, false);

-- Stades : description + pensées « Dans sa tête » (phrase par phrase) + intensité de simulation.
insert into public.stages (condition_slug, position, label, description, thoughts, intensity) values
('surdite', 1, 'Légère', 'Les voix faibles et les chuchotements passent mal. En tête-à-tête, ça va ; dans un groupe, des mots se perdent.',
 array['Ils rient. J’ai raté la fin de la blague.', 'Je ris aussi, un peu en retard.', 'Personne n’a rien vu.'], 0.2),
('surdite', 2, 'Moyenne', 'La parole à voix normale n’est comprise qu’en partie. La lecture labiale devient un appui permanent.',
 array['« Vous voulez… sur place ou… ? »', 'Je réponds « oui ». Je ne sais pas à quoi.', 'S’il pouvait juste me regarder quand il parle.'], 0.45),
('surdite', 3, 'Sévère', 'Seuls les sons forts passent. Une conversation à deux demande la lecture labiale.',
 array['Je hoche la tête, mais je n’ai compris qu’un mot sur trois.', 'Je n’ose plus faire répéter.', 'La troisième fois, les gens soupirent.'], 0.75),
('surdite', 4, 'Profonde', 'La parole n’est plus perçue. On communique par l’écrit, la langue des signes ou la lecture labiale.',
 array['Ses lèvres bougent. Il a une moustache : impossible de lire.', 'Je sors mon téléphone et j’écris : « Un café, s’il vous plaît. »', 'Il sourit. Ça marche très bien, en fait.'], 1),

('dys', 1, 'Léger', 'La lecture est lente et fatigante, mais les stratégies compensent la plupart du temps.',
 array['Je relis la phrase. Ça va, j’ai compris.', 'Mais je suis déjà fatigué, et il est 10 h.'], 0.25),
('dys', 2, 'Modéré', 'Lire, écrire ou coordonner ses gestes demande un effort constant ; les erreurs reviennent malgré le travail.',
 array['Je relis la consigne pour la quatrième fois.', 'Les autres ont déjà fini.', 'Je connais la réponse. C’est la question que je n’arrive pas à lire.'], 0.6),
('dys', 3, 'Sévère', 'Sans aménagement (lecture à voix haute, ordinateur, temps majoré), la tâche devient presque impossible.',
 array['Les lettres glissent.', 'b, d, p, q : c’est la même lettre qui tourne.', 'On m’a dit « fais un effort ». J’en fais un énorme.'], 1),

('moteur', 1, 'Marche avec aide', 'Déplacements possibles avec une canne ou des béquilles, mais lents et fatigants. Les escaliers et les longues distances sont des obstacles.',
 array['Trois cents mètres jusqu’à la boulangerie.', 'Il y a un banc à mi-chemin. Je le connais bien.'], 0.3),
('moteur', 2, 'Fauteuil manuel', 'Autonomie complète sur terrain plat. Une marche, un trottoir sans bateau ou une pente raide bloquent le passage.',
 array['Il y a une marche.', 'Je fais demi-tour, ou je demande à un inconnu ?', 'Cinq centimètres. C’est tout ce qui me sépare d’une baguette.'], 0.65),
('moteur', 3, 'Fauteuil électrique', 'Mobilité dépendante d’un fauteuil électrique lourd. Aucune marche n’est franchissable ; les transports doivent être réservés.',
 array['Le bus arrive. La rampe est en panne.', 'Le prochain, dans vingt minutes. Peut-être.', 'J’ai prévenu au travail que je serai en retard. Encore.'], 1),

('tdah', 1, 'Léger', 'L’attention décroche dans les tâches longues ou répétitives ; quelques astuces suffisent souvent.',
 array['Je dois finir ce mail.', 'Je mets une alarme dans vingt minutes. Ça devrait aller.'], 0.3),
('tdah', 2, 'Modéré', 'Les distractions prennent le dessus plusieurs fois par heure ; l’organisation demande des outils et beaucoup d’énergie.',
 array['Je dois finir ce mail.', 'Tiens, la fenêtre.', 'Le mail. Le café. Le mail…'], 0.65),
('tdah', 3, 'Sévère', 'Concentration, impulsivité et agitation entravent le travail et la vie sociale sans accompagnement.',
 array['Quatorze onglets ouverts.', 'Je ne sais plus lequel était important.', 'On me dit « concentre-toi ». Comme si je n’y avais pas pensé.'], 1),

('visuelle', 1, 'Malvoyance modérée', 'Catégorie 1. Lire un panneau, reconnaître un visage de loin ou distinguer un prix demande de s’approcher très près.',
 array['Ce panneau dit « Sortie » ou « Sorbet » ?', 'Je vais suivre la foule.'], 0.35),
('visuelle', 2, 'Malvoyance sévère', 'Catégorie 2. Les détails disparaissent ; on s’oriente aux couleurs, aux contrastes, à la mémoire des lieux.',
 array['Ils ont changé les rayons de place.', 'Tout ce que je connaissais par cœur est à réapprendre.', 'Je demande. On me répond « c’est là-bas », avec le doigt.'], 0.7),
('visuelle', 3, 'Cécité', 'Catégories 3 à 5. Peu ou pas de perception visuelle. Canne blanche, chien guide, lecteur d’écran, braille.',
 array['Ma canne touche un carton laissé au milieu de l’allée.', 'Quelqu’un me prend le bras sans rien dire.', 'J’aurais préféré qu’on me demande d’abord.'], 1),

('alzheimer', 1, 'Léger', 'Oublis des faits récents, difficulté à trouver ses mots ; la personne s’en rend compte, ce qui l’inquiète.',
 array['Où ai-je mis mes clés ?', 'C’est la troisième fois cette semaine. Je ne le dis à personne.'], 0.3),
('alzheimer', 2, 'Modéré', 'Les repères dans le temps et l’espace se brouillent ; l’aide devient nécessaire au quotidien.',
 array['Quel jour on est ?', 'Il faut que j’aille chercher les enfants à l’école.', 'On me dit qu’ils ont quarante ans.'], 0.65),
('alzheimer', 3, 'Sévère', 'Mémoire et langage très atteints ; les émotions et le ton de la voix restent perçus.',
 array['Cette dame est gentille.', 'Elle dit qu’elle est ma fille.', 'Je ne sais pas qui elle est, mais je suis bien avec elle.'], 1),

('autisme', 1, 'Niveau 1', 'Besoin de soutien. Autonomie au quotidien, mais les imprévus, le bruit et les codes sociaux implicites coûtent beaucoup d’énergie.',
 array['Le train a changé de quai.', 'Ce n’était pas prévu. Je respire.', 'Je mettrai deux heures à m’en remettre ce soir.'], 0.3),
('autisme', 2, 'Niveau 2', 'Besoin d’un soutien important. Les environnements bruyants et changeants deviennent difficiles à supporter sans aménagements.',
 array['Les annonces se superposent.', 'Le néon grésille.', 'Mon casque anti-bruit est dans mon sac. Vite.'], 0.65),
('autisme', 3, 'Niveau 3', 'Besoin d’un soutien très important. La surcharge sensorielle peut submerger complètement la personne.',
 array['Le néon grésille.', 'Trop de voix.', 'Il me faut un endroit calme, maintenant.'], 1),

('deficience-intellectuelle', 1, 'Légère', 'Apprentissages plus lents, autonomie possible avec des consignes claires et des repères.',
 array['J’ai mon travail, mon appartement.', 'Le plus dur, ce sont les papiers.'], 0.25),
('deficience-intellectuelle', 2, 'Moyenne', 'Besoin d’accompagnement pour les démarches et les situations nouvelles.',
 array['Je ne comprends pas.', 'Mais si je le dis, il va me parler comme à un enfant.'], 0.5),
('deficience-intellectuelle', 3, 'Grave', 'Communication souvent non verbale ou simple ; accompagnement quotidien.',
 array['Ils parlent de moi.', 'Devant moi.', 'Comme si je n’étais pas là.'], 0.8),
('deficience-intellectuelle', 4, 'Profonde', 'Dépendance importante ; la communication passe par les gestes, les expressions, la présence.',
 array['La musique est douce.', 'Quelqu’un me sourit.', 'C’est une bonne journée.'], 1),

('schizophrenie', 1, 'Prodromique', 'Avant la première crise : repli, fatigue, impression que quelque chose change, souvent pris pour de la paresse.',
 array['Tout le monde me regarde, aujourd’hui.', 'Non. Je suis juste fatigué.'], 0.3),
('schizophrenie', 2, 'Aiguë', 'Hallucinations, idées délirantes, pensée désorganisée. Un temps de soin est nécessaire.',
 array['Ils parlent de moi, dans le bus.', 'Je sais que ces voix ne sont pas réelles.', 'Les ignorer me demande un effort constant.'], 1),
('schizophrenie', 3, 'Stabilisation', 'Avec un traitement et un suivi, la plupart des personnes reprennent une vie sociale et professionnelle.',
 array['Ça fait deux ans que je vais bien.', 'Mais si je le dis au travail, tout change.'], 0.4),

('epilepsie', 1, 'Équilibrée', 'Le traitement contrôle les crises. Restent les contraintes : sommeil régulier, permis suspendu pendant un temps.',
 array['Je n’ai plus eu de crise depuis un an.', 'Je dois quand même me coucher tôt. Toujours.'], 0.4),
('epilepsie', 2, 'Pharmacorésistante', 'Les crises persistent malgré les traitements ; chaque journée se construit autour du risque.',
 array['Je n’ai plus le droit de conduire.', 'Comment je vais au travail demain ?', 'Et hier, qu’est-ce que j’ai fait hier ?'], 1),

('parkinson', 1, 'Stade 1', 'Symptômes d’un seul côté du corps : un léger tremblement, une main plus lente.',
 array['Ma main droite tremble un peu.', 'Je la mets dans ma poche.'], 0.2),
('parkinson', 2, 'Stade 2', 'Symptômes des deux côtés, sans trouble de l’équilibre.',
 array['Boutonner ma chemise : cinq minutes.', 'Je prévois dix.'], 0.4),
('parkinson', 3, 'Stade 3', 'Troubles de l’équilibre ; la personne reste autonome mais les chutes deviennent un risque.',
 array['Mes pieds refusent d’avancer.', 'Derrière moi, les gens s’impatientent.'], 0.6),
('parkinson', 4, 'Stade 4', 'Handicap marqué ; la marche reste possible mais une aide devient nécessaire.',
 array['Je voudrais servir le café moi-même.', 'Laissez-moi le temps, c’est tout.'], 0.8),
('parkinson', 5, 'Stade 5', 'Fauteuil ou lit ; aide pour la plupart des gestes du quotidien.',
 array['Mon corps ralentit.', 'Ma tête, elle, suit très bien la conversation.'], 1),

('sep', 1, 'Rémittente', 'Des poussées suivies de récupérations, parfois complètes. Entre deux poussées, les symptômes peuvent être invisibles.',
 array['Ce matin tout va bien.', 'Cet après-midi, je ne pourrai plus marcher jusqu’à la voiture.'], 0.35),
('sep', 2, 'Secondairement progressive', 'Après des années de poussées, le handicap s’installe progressivement.',
 array['Avant, je récupérais après chaque poussée.', 'Maintenant, il reste toujours un petit quelque chose.'], 0.7),
('sep', 3, 'Progressive primaire', 'Évolution lente et continue dès le début, sans poussée nette.',
 array['« Tu as pourtant l’air en forme. »', 'Je suis épuisée. Ça ne se voit juste pas.'], 1),

('sla', 1, 'Stade 1', 'Une seule région du corps est touchée : une main maladroite, une jambe qui accroche.',
 array['Je n’arrive plus à tourner la clé.', 'C’est sûrement le froid.'], 0.25),
('sla', 2, 'Stade 2', 'Deux régions touchées ; les gestes fins deviennent difficiles.',
 array['J’écris avec la main gauche maintenant.', 'Mon écriture ressemble à celle d’un enfant.'], 0.5),
('sla', 3, 'Stade 3', 'Trois régions touchées ; la parole ou la déglutition peuvent être atteintes.',
 array['Ma tête va très bien.', 'C’est mon corps qui ne suit plus.'], 0.75),
('sla', 4, 'Stade 4', 'Besoin d’une aide pour se nourrir ou respirer ; la communication passe par le regard et la technologie.',
 array['J’écris avec les yeux, lettre par lettre.', 'Attendez la fin de ma phrase.', 'Ne la finissez pas pour moi.'], 1);

-- « Ce que je peux faire » : 3 gestes par fiche (aider, éviter, aménager).
insert into public.gestures (condition_slug, position, kind, title, body) values
('surdite', 1, 'aider', 'Parlez face à la personne, sans exagérer l’articulation.', 'Elle lit sur vos lèvres : gardez la bouche visible, pas de main devant, pas de chewing-gum.'),
('surdite', 2, 'eviter', 'Ne dites pas « laisse tomber, ce n’était pas important ».', 'Reformulez plutôt avec d’autres mots, ou écrivez. Ce qui est dit compte pour tout le monde.'),
('surdite', 3, 'amenager', 'Affichez ce qui est annoncé à voix haute.', 'Écran, sous-titres, numéro de commande visible : une information doublée à l’écrit sert à tous.'),
('dys', 1, 'aider', 'Donnez les consignes à l’oral et à l’écrit.', 'Laissez du temps, proposez de lire à voix haute, acceptez un rendu à l’ordinateur.'),
('dys', 2, 'eviter', 'N’évoquez pas la paresse ou le manque d’effort.', 'La personne en fait souvent plus que les autres pour un résultat qui ne le montre pas.'),
('dys', 3, 'amenager', 'Aérez vos documents.', 'Police sans empattement, taille 14 minimum, interligne 1,5, phrases courtes, pas de texte justifié.'),
('moteur', 1, 'aider', 'Demandez avant d’aider, et écoutez la réponse.', 'Ne poussez jamais un fauteuil sans accord : c’est comme saisir quelqu’un par le bras.'),
('moteur', 2, 'eviter', 'Ne dites pas « cloué dans un fauteuil ».', 'Le fauteuil libère, il n’enferme pas. Dites « en fauteuil roulant » et parlez à la personne, pas à son accompagnant.'),
('moteur', 3, 'amenager', 'Une rampe amovible, une sonnette à l’entrée.', 'Pour un commerce, une rampe pliable et une sonnette à 80 cm de haut ouvrent la porte à tous, poussettes comprises.'),
('tdah', 1, 'aider', 'Découpez les tâches et écrivez les priorités.', 'Une liste courte, une échéance claire, un point régulier : la structure aide plus que les rappels à l’ordre.'),
('tdah', 2, 'eviter', 'Ne dites pas « tout le monde est un peu TDAH ».', 'Le trouble n’est pas une distraction passagère : il pèse sur toute la journée, tous les jours.'),
('tdah', 3, 'amenager', 'Proposez un espace calme.', 'Un bureau au calme, des écouteurs autorisés, des pauses courtes et fréquentes.'),
('visuelle', 1, 'aider', 'Présentez-vous et proposez votre bras.', 'Dites qui vous êtes, demandez si la personne veut de l’aide, et laissez-la prendre votre bras plutôt que de la guider.'),
('visuelle', 2, 'eviter', 'Ne dites pas « c’est là-bas ».', 'Soyez précis : « à deux mètres sur votre droite, juste après la caisse ». Et ne caressez pas le chien guide : il travaille.'),
('visuelle', 3, 'amenager', 'Contrastes, grands caractères, passages dégagés.', 'Prix lisibles, panneaux contrastés, rien au milieu des allées. Sur le web : alternatives textuelles et contrastes suffisants.'),
('alzheimer', 1, 'aider', 'Présentez-vous à chaque fois, simplement.', '« Bonjour, c’est Julie, votre voisine. » Une phrase, un sourire, et la conversation peut commencer.'),
('alzheimer', 2, 'eviter', 'Ne demandez pas « tu ne te souviens pas ? ».', 'La question met en échec. Racontez plutôt : « Je me souviens de ce jour où… »'),
('alzheimer', 3, 'amenager', 'Des repères visibles et stables.', 'Pictogrammes sur les portes, horloge avec la date, objets toujours rangés au même endroit.'),
('autisme', 1, 'aider', 'Annoncez les changements à l’avance.', 'Un imprévu expliqué tôt coûte beaucoup moins d’énergie qu’une surprise.'),
('autisme', 2, 'eviter', 'Ne forcez pas le regard ou le contact physique.', 'Une personne peut écouter parfaitement sans vous regarder. Respectez la distance qu’elle choisit.'),
('autisme', 3, 'amenager', 'Proposez une heure calme.', 'Lumière baissée, musique coupée : de nombreux magasins le font déjà. Un coin calme suffit souvent.'),
('deficience-intellectuelle', 1, 'aider', 'Parlez à la personne, pas à son accompagnant.', 'Phrases courtes, un message à la fois, et vérifiez qu’elle a compris en lui demandant de reformuler.'),
('deficience-intellectuelle', 2, 'eviter', 'Ne parlez pas comme à un enfant.', 'Simplifier les mots, ce n’est pas simplifier la personne. Un adulte reste un adulte.'),
('deficience-intellectuelle', 3, 'amenager', 'Écrivez en FALC.', 'Facile à lire et à comprendre : phrases courtes, mots simples, une idée par phrase, des images pour illustrer.'),
('schizophrenie', 1, 'aider', 'Restez calme et écoutez sans juger.', 'Vous n’avez pas à valider ni à contredire ce que la personne entend : reconnaissez simplement ce qu’elle ressent.'),
('schizophrenie', 2, 'eviter', 'N’employez pas « schizo » comme insulte ou pour dire « incohérent ».', 'Ce mot blesse des centaines de milliers de personnes, et la maladie n’a rien à voir avec un dédoublement de personnalité.'),
('schizophrenie', 3, 'amenager', 'Acceptez des horaires souples.', 'Les traitements peuvent fatiguer le matin. Un temps partiel ou des horaires décalés permettent souvent de garder un emploi.'),
('epilepsie', 1, 'aider', 'Pendant une crise : protégez la tête, chronométrez.', 'Ne mettez rien dans la bouche, ne retenez pas les mouvements. Mettez en position latérale de sécurité après. Appelez le 15 si la crise dure plus de 5 minutes.'),
('epilepsie', 2, 'eviter', 'Ne racontez pas la crise devant tout le monde.', 'La personne ne s’en souvient souvent pas. Laissez-la se reposer et décider de ce qu’elle partage.'),
('epilepsie', 3, 'amenager', 'Pas de lumières stroboscopiques.', 'Dans les lieux publics, les vidéos et les soirées : moins de 3 flashs par seconde, toujours.'),
('parkinson', 1, 'aider', 'Laissez le temps.', 'À la caisse, au guichet, au téléphone : quelques secondes de patience valent mieux qu’une aide imposée.'),
('parkinson', 2, 'eviter', 'Ne confondez pas le tremblement avec l’alcool ou la nervosité.', 'Ce soupçon est fréquent, et il humilie. Le tremblement est un symptôme, rien d’autre.'),
('parkinson', 3, 'amenager', 'Le paiement sans contact et des sièges.', 'Moins de gestes fins, un siège dans la file d’attente : de petits détails qui changent une sortie.'),
('sep', 1, 'aider', 'Croyez la fatigue qu’on vous décrit.', 'Une personne qui annule au dernier moment n’est pas paresseuse : la fatigue de la SEP n’est pas celle d’une mauvaise nuit.'),
('sep', 2, 'eviter', 'Ne dites pas « tu as pourtant l’air en forme ».', 'La plupart des symptômes ne se voient pas. Demandez plutôt : « Comment ça va, aujourd’hui ? »'),
('sep', 3, 'amenager', 'Télétravail et pauses.', 'Quelques jours de télétravail et une pièce pour se reposer prolongent souvent la vie professionnelle de plusieurs années.'),
('sla', 1, 'aider', 'Attendez la fin de la phrase.', 'Avec une tablette à commande oculaire, une phrase prend du temps. Ne la terminez pas à la place de la personne.'),
('sla', 2, 'eviter', 'Ne parlez pas à l’entourage comme si elle n’était pas là.', 'La pensée est intacte. Regardez la personne, adressez-vous à elle.'),
('sla', 3, 'amenager', 'Préparez les questions fermées.', 'Des questions auxquelles on répond par oui ou non accélèrent l’échange, en attendant la tablette.');

-- Quiz « Idées reçues ».
insert into public.quiz_questions (position, statement, is_true, explanation, condition_slug) values
(1, 'La plupart des handicaps se voient.', false, 'Environ 80 % des handicaps sont invisibles : surdité, troubles DYS, fatigue chronique, maladies psychiques… D’où l’importance de ne pas juger sur l’apparence.', null),
(2, 'Une personne sourde peut lire sur les lèvres tout ce qu’on dit.', false, 'La lecture labiale ne permet de saisir qu’une partie des sons : le reste se devine par le contexte. C’est épuisant, et impossible si vous tournez la tête.', 'surdite'),
(3, 'La dyslexie n’a rien à voir avec l’intelligence.', true, 'Les troubles DYS concernent le traitement de l’écrit, du geste ou des nombres. Ils touchent des personnes de tous niveaux intellectuels.', 'dys'),
(4, 'Il faut toujours aider spontanément une personne en fauteuil.', false, 'Proposez, puis écoutez la réponse. Pousser un fauteuil sans accord revient à saisir quelqu’un par le bras.', 'moteur'),
(5, 'L’autisme est une maladie qui se guérit.', false, 'L’autisme est une façon différente de fonctionner, présente toute la vie. On ne guérit pas : on aménage et on accompagne.', 'autisme'),
(6, 'Les personnes schizophrènes sont souvent dangereuses.', false, 'Elles sont bien plus souvent victimes de violences qu’auteures. Ce cliché est l’un des obstacles les plus lourds à leur insertion.', 'schizophrenie'),
(7, 'Pendant une crise d’épilepsie, il faut mettre quelque chose dans la bouche de la personne.', false, 'Surtout pas : on risque de la blesser. Protégez sa tête, éloignez ce qui est dangereux, chronométrez, puis position latérale de sécurité.', 'epilepsie'),
(8, 'Une rampe d’accès sert aussi aux poussettes, aux livreurs et aux personnes âgées.', true, 'C’est le principe de l’accessibilité : ce qui est indispensable pour certains est utile à tous.', 'moteur');

-- Témoignages d'exemple (is_example = true) : à remplacer par les récits validés par les témoins.
insert into public.testimonies (condition_slug, witness_name, witness_age, is_pseudonym, is_example, quote, transcript, day_story, published) values
('surdite', 'Camille', 41, true, true,
 'Je hoche la tête, mais je n’ai compris qu’un mot sur trois.',
 'Je suis devenue malentendante vers trente ans. Au début, je faisais répéter. Puis j’ai arrêté, parce qu’à la troisième fois les gens soupirent. Alors je hoche la tête. Je souris. Je devine.

Le pire, ce n’est pas le silence, c’est le bruit. Un restaurant le vendredi soir, c’est une bouillie de sons où je ne distingue plus rien. Je rentre épuisée, comme après une journée de travail.

Ce qui change tout ? Quelqu’un qui me regarde quand il parle. Un serveur qui écrit le prix sur un papier sans faire de drame. Une annonce en gare affichée sur l’écran. Ce sont de toutes petites choses.',
 array['8 h · Réunion en visio : je demande que les sous-titres soient activés.', '12 h 30 · Cantine bruyante : je m’assois dos au mur, face à mes collègues.', '18 h · Gare : l’annonce de changement de quai n’est pas affichée. Je suis la foule.', '21 h · Je retire mes appareils. Enfin le calme.'],
 true),
('moteur', 'Malik', 34, true, true,
 'Il y a une marche. Je fais demi-tour, ou je demande à un inconnu ?',
 'Je suis paraplégique depuis un accident de moto, il y a douze ans. Mon fauteuil, c’est mes jambes. Je ne suis pas « cloué » dedans : sans lui, je serais cloué au lit.

Ce qui m’empêche de vivre normalement, ce n’est pas mon corps. C’est la marche devant la boulangerie. L’ascenseur du métro en panne depuis trois semaines. Les toilettes « accessibles » au sous-sol.

Le plus simple pour m’aider ? Me demander. Parfois je dirai oui, parfois non. Et ne jamais toucher mon fauteuil sans prévenir.',
 array['7 h 30 · Je vérifie sur l’application que l’ascenseur de ma station fonctionne.', '9 h · Au bureau, la porte coupe-feu est trop lourde : un collègue la cale pour moi.', '13 h · Restaurant choisi pour son entrée de plain-pied, pas pour sa carte.', '19 h · Basket fauteuil avec l’équipe. Le meilleur moment de la semaine.'],
 true),
('visuelle', 'Hélène', 58, true, true,
 'Ce panneau dit « Sortie » ou « Sorbet » ? Je vais suivre la foule.',
 'J’ai une DMLA : le centre de ma vision est une tache. Je vois les bords, les formes, les couleurs, mais pas les visages ni les mots.

On me dit souvent « mais vous voyez, puisque vous m’avez évité ». Oui, je vois votre silhouette. Je ne vois pas votre sourire.

Au supermarché, les prix sont écrits minuscule, sur des étiquettes brillantes. Alors je demande. Ce qui m’aide, c’est qu’on me lise le prix sans me parler plus fort : je vois mal, j’entends très bien.',
 array['8 h · Je règle mon téléphone en très gros caractères et en lecture vocale.', '10 h · Courses : je repère le rayon à sa couleur, je demande pour le reste.', '15 h · Le bus : j’écoute l’annonce de l’arrêt. Quand elle ne marche pas, je compte.', '20 h · Livre audio. J’ai lu plus de livres depuis que je ne vois plus les lignes.'],
 true),
('autisme', 'Théo', 23, true, true,
 'Le néon grésille. Trop de voix. Il me faut un endroit calme, maintenant.',
 'J’ai été diagnostiqué autiste à dix-neuf ans. Avant, je pensais que tout le monde entendait le néon grésiller, le frigo ronronner, les conversations des tables d’à côté en même temps que la mienne.

En gare, à l’heure de pointe, mon cerveau reçoit tout, sans filtre. Ce n’est pas que je n’aime pas les gens. C’est que tout arrive au même volume.

Mon casque anti-bruit m’a changé la vie. Et quand un ami me prévient la veille que le programme change, je peux m’y préparer. Ça ne coûte rien, et ça me sauve une journée.',
 array['7 h · Même petit-déjeuner, même ordre. Ça me laisse de l’énergie pour la suite.', '8 h 15 · Train : je voyage en voiture calme, casque sur les oreilles.', '12 h · Je déjeune seul, dehors. Ce n’est pas de la timidité, c’est une pause.', '18 h · Retour à la maison, lumière tamisée. Je recharge.'],
 true);

-- Scènes Vision 3D ajoutées après le MVP (voir migration 20261024010000).
update public.conditions set vision_kind = 'dys', scene_title = 'contrôle de français',
  scene_description = 'Vous êtes assis en classe, pendant un contrôle de français. Devant vous, la feuille de consigne. Selon le niveau, de plus en plus de lettres glissent, s’inversent (b et d, p et q, n et u) ou échangent leur place avec leur voisine. L’enseignante annonce le temps restant ; les autres élèves écrivent déjà.',
  vision_warning = 'Vous allez lire un texte dont les lettres bougent lentement. Pas de flash, pas de son. Vous pouvez quitter à tout moment.',
  updated_at = now() where slug = 'dys';

update public.conditions set vision_kind = 'tdah',
  scene_description = 'Vous êtes à votre bureau, dans un open space, et vous devez finir un mail. Le texte s’écrit tant que vous restez concentré. Notifications à l’écran, téléphone qui vibre, oiseau à la fenêtre, collègue qui propose un café : chaque distraction interrompt l’écriture. Plus le niveau augmente, plus elles sont fréquentes, et au niveau sévère vous perdez le fil et devez reprendre des phrases.',
  updated_at = now() where slug = 'tdah';

update public.conditions set vision_kind = 'alzheimer',
  scene_description = 'Votre cuisine, que vous connaissez par cœur. Selon le stade, les objets (tasse, bouilloire, clés, lunettes) changent de place quand vous ne regardez pas, les étiquettes des placards deviennent illisibles, le calendrier n’affiche plus le même jour, et sur les photos du réfrigérateur les visages s’effacent peu à peu.',
  updated_at = now() where slug = 'alzheimer';

update public.conditions set vision_kind = 'intellectuelle',
  scene_description = 'Vous êtes au guichet d’une administration, avec une file d’attente derrière vous. Le formulaire posé devant vous est rédigé en langage administratif : selon le niveau, de plus en plus de mots deviennent des blocs incompréhensibles. L’agent parle de plus en plus vite, en regardant son écran ; au-delà du niveau moyen, quelqu’un soupire derrière vous.',
  vision_warning = 'Vous allez être face à un formulaire et un interlocuteur pressé. Pas de flash, pas de son.',
  updated_at = now() where slug = 'deficience-intellectuelle';

update public.conditions set vision_kind = 'epilepsie',
  scene_description = 'Aucune crise n’est simulée. Vous vous réveillez chez vous le lendemain d’une crise, à 11 h 40. Le calendrier a un trou à la date d’hier, un message demande si vous vous souvenez de la veille, les clés de la voiture rappellent que vous n’avez plus le droit de conduire. Vos déplacements sont lents et votre vue légèrement voilée, de plus en plus avec une épilepsie pharmacorésistante. La lumière ne varie jamais.',
  vision_warning = 'Aucune crise n’est simulée. Ni flash, ni variation de lumière, ni son.',
  updated_at = now() where slug = 'epilepsie';

update public.conditions set vision_kind = 'parkinson', scene_title = 'porter un verre au salon',
  scene_description = 'Vous portez un verre d’eau du couloir jusqu’au salon. Votre main tremble au repos, de plus en plus selon le stade : l’eau déborde à chaque pas. À partir du stade 3, devant la porte du salon, vos pieds se figent par moments et refusent d’avancer. La vue, elle, ne tremble pas.',
  vision_warning = 'Vous allez voir une main trembler. La vue reste stable. Pas de flash, pas de son.',
  updated_at = now() where slug = 'parkinson';

update public.conditions set vision_kind = 'sep',
  scene_description = 'Vous marchez dans un parc jusqu’à votre voiture, garée à 70 mètres. Plus vous avancez, plus la journée passe, de 9 h à 18 h : la lumière baisse, la fatigue s’accumule et vous avancez jusqu’à quatre fois moins vite. Par moments, votre vue se trouble pendant quelques secondes. Selon la forme de la maladie, ces effets sont plus ou moins marqués.',
  vision_warning = 'Vous allez voir une scène se troubler progressivement, par moments. Pas de flash, pas de son.',
  updated_at = now() where slug = 'sep';

update public.conditions set vision_kind = 'sla',
  scene_description = 'Vous êtes assis dans votre salon, en face d’un ami. Votre main ne répond plus : vous écrivez avec les yeux, sur une tablette à commande oculaire, en fixant chaque lettre jusqu’à ce qu’elle soit validée. Plus le stade est avancé, plus il faut fixer longtemps. Pendant que vous écrivez, votre ami essaie de deviner et finit vos phrases à votre place.',
  vision_warning = 'Vous allez écrire avec le regard, lentement. Pas de flash, pas de son.',
  updated_at = now() where slug = 'sla';

-- Scène schizophrénie provisoire (voir migration 20261024020000).
update public.conditions set vision_kind = 'schizophrenie',
  scene_description = 'Vous êtes assis côté fenêtre dans un bus, la ville défile. En phase prodromique, rien n’est franc : des passagers rient, quelqu’un se retourne, vous vous demandez si c’est pour vous. En phase aiguë, des voix chuchotées vous parlent, tantôt à gauche, tantôt à droite (« Ils te regardent », « Tout le monde sait »), pendant que vous vous répétez qu’elles ne sont pas réelles et comptez les arrêts. Une fois la maladie stabilisée, le trajet redevient ordinaire : musique dans les écouteurs, un chuchotement lointain qui passe. Scène provisoire, à réécrire avec un témoin.',
  vision_warning = 'Vous allez entendre des voix chuchotées, à gauche et à droite. Ce contenu peut être éprouvant. Pas de flash. Le son démarre quand vous le décidez. Scène provisoire, en cours d’écriture avec un témoin.',
  updated_at = now() where slug = 'schizophrenie';

-- Stabilisation = la phase la plus apaisée de la simulation.
update public.stages set intensity = 0.15 where condition_slug = 'schizophrenie' and label = 'Stabilisation';
