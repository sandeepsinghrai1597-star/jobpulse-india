grant usage on schema public to service_role;

grant select, insert, update, delete on public.companies to service_role;
grant select, insert, update, delete on public.jobs to service_role;

grant usage, select on all sequences in schema public to service_role;
