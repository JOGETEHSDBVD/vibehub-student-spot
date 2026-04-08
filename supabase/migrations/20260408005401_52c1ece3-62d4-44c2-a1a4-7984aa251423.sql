CREATE POLICY "Admins can read all mbti results"
ON public.mbti_results
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));