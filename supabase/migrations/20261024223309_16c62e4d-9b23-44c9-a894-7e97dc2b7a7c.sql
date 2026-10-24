alter view public.sellers_public set (security_invoker = true);

revoke execute on function public.has_role(uuid, text) from public, anon, authenticated;
grant execute on function public.has_role(uuid, text) to service_role;

create policy "Użytkownik widzi własne role" on public.user_roles
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Brak bezpośredniego dostępu z przeglądarki" on public.ai_access_blocks
  for select to authenticated
  using (false);