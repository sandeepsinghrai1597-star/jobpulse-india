create or replace function private.sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  derived_name text;
  derived_role public.app_role;
begin
  derived_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1),
    'User'
  );

  derived_role := case
    when new.raw_app_meta_data->>'role' = 'admin'
      then 'admin'::public.app_role
    when coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate') in ('candidate', 'employer')
      then coalesce(new.raw_app_meta_data->>'role', new.raw_user_meta_data->>'role', 'candidate')::public.app_role
    else 'candidate'::public.app_role
  end;

  insert into public.users (id, name, email, phone, role)
  values (new.id, derived_name, new.email, new.phone, derived_role)
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    phone = excluded.phone,
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;
