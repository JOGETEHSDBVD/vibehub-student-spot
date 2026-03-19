-- Change default member_type to NULL so we can detect incomplete onboarding
ALTER TABLE public.profiles ALTER COLUMN member_type SET DEFAULT NULL;

-- Reset the test user so they can go through onboarding
UPDATE public.profiles SET member_type = NULL WHERE email = 'suportlinkfinal@gmail.com';