-- Vision 3D pour 8 fiches supplémentaires.
-- La schizophrénie reste « bientôt » : le PRD exige que la scène soit co-écrite avec un témoin.

alter table public.conditions drop constraint conditions_vision_kind_check;
alter table public.conditions add constraint conditions_vision_kind_check check (vision_kind in (
  'auditive', 'moteur', 'visuelle', 'autisme',
  'dys', 'tdah', 'alzheimer', 'intellectuelle', 'epilepsie', 'parkinson', 'sep', 'sla'));

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
