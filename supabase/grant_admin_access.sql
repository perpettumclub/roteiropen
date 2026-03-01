-- Execute este comando no SQL Editor do Supabase para dar acesso total (Tier Desafio 45)
-- ao usuário felipevidalbk@gmail.com

UPDATE public.profiles
SET tier = 'desafio_45'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'felipevidalbk@gmail.com'
);

-- Opcional: Para confirmar se funcionou, rode:
-- SELECT * FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'felipevidalbk@gmail.com');
