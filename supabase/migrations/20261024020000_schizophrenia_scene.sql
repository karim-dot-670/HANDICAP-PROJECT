-- Vision 3D provisoire pour la schizophrénie : à réécrire avec un témoin avant publication (PRD, section 5).

alter table public.conditions drop constraint conditions_vision_kind_check;
alter table public.conditions add constraint conditions_vision_kind_check check (vision_kind in (
  'auditive', 'moteur', 'visuelle', 'autisme',
  'dys', 'tdah', 'alzheimer', 'intellectuelle', 'epilepsie', 'parkinson', 'sep', 'sla', 'schizophrenie'));

update public.conditions set vision_kind = 'schizophrenie',
  scene_description = 'Vous êtes assis côté fenêtre dans un bus, la ville défile. En phase prodromique, rien n’est franc : des passagers rient, quelqu’un se retourne, vous vous demandez si c’est pour vous. En phase aiguë, des voix chuchotées vous parlent, tantôt à gauche, tantôt à droite (« Ils te regardent », « Tout le monde sait »), pendant que vous vous répétez qu’elles ne sont pas réelles et comptez les arrêts. Une fois la maladie stabilisée, le trajet redevient ordinaire : musique dans les écouteurs, un chuchotement lointain qui passe. Scène provisoire, à réécrire avec un témoin.',
  vision_warning = 'Vous allez entendre des voix chuchotées, à gauche et à droite. Ce contenu peut être éprouvant. Pas de flash. Le son démarre quand vous le décidez. Scène provisoire, en cours d’écriture avec un témoin.',
  updated_at = now() where slug = 'schizophrenie';

-- Stabilisation = la phase la plus apaisée de la simulation.
update public.stages set intensity = 0.15 where condition_slug = 'schizophrenie' and label = 'Stabilisation';
