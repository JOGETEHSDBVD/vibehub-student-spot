
CREATE TABLE public.mbti_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lang TEXT NOT NULL DEFAULT 'en',
  answers JSONB NOT NULL,
  scores JSONB NOT NULL,
  dna_code TEXT NOT NULL,
  rarity_title TEXT NOT NULL,
  rarity_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.mbti_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results"
  ON public.mbti_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON public.mbti_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_not_banned());

CREATE POLICY "Users can update own results"
  ON public.mbti_results
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_not_banned())
  WITH CHECK (auth.uid() = user_id AND is_not_banned());

CREATE POLICY "Users can delete own results"
  ON public.mbti_results
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_not_banned());
