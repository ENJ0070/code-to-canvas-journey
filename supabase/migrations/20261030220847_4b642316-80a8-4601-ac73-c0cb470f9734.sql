INSERT INTO public.settings(key,value) VALUES ('profile_views','817') ON CONFLICT (key) DO NOTHING;
CREATE OR REPLACE FUNCTION public.increment_profile_views() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v integer;
BEGIN
  INSERT INTO public.settings(key,value) VALUES ('profile_views','818')
  ON CONFLICT (key) DO UPDATE SET value = (COALESCE(NULLIF(regexp_replace(public.settings.value,'\D','','g'),''),'817')::integer + 1)::text
  RETURNING value::integer INTO v;
  RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.increment_profile_views() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_views() TO service_role;