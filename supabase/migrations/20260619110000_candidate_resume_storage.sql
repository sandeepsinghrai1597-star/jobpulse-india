insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select
  'candidate-resumes',
  'candidate-resumes',
  false,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
where not exists (
  select 1 from storage.buckets where id = 'candidate-resumes'
);

update storage.buckets
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
where id = 'candidate-resumes';

drop policy if exists "authenticated users upload candidate resumes" on storage.objects;
create policy "authenticated users upload candidate resumes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "authenticated users update own candidate resumes" on storage.objects;
create policy "authenticated users update own candidate resumes"
on storage.objects for update
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and owner = auth.uid()
)
with check (
  bucket_id = 'candidate-resumes'
  and owner = auth.uid()
);

drop policy if exists "authenticated users delete own candidate resumes" on storage.objects;
create policy "authenticated users delete own candidate resumes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and owner = auth.uid()
);

drop policy if exists "public reads candidate resumes" on storage.objects;
drop policy if exists "authenticated users read own candidate resumes" on storage.objects;
create policy "authenticated users read own candidate resumes"
on storage.objects for select
to authenticated
using (
  bucket_id = 'candidate-resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

alter table public.resumes
  add column if not exists storage_path text;

alter table public.applications
  add column if not exists resume_storage_path text;

update public.resumes
set storage_path = nullif(
  regexp_replace(
    file_url,
    '^.*?/storage/v1/object/public/candidate-resumes/',
    ''
  ),
  file_url
)
where storage_path is null
  and file_url is not null;

update public.applications
set resume_storage_path = resumes.storage_path
from public.resumes
where applications.resume_storage_path is null
  and applications.resume_id = resumes.id
  and resumes.storage_path is not null;

update public.applications
set resume_storage_path = nullif(
  regexp_replace(
    resume_url,
    '^.*?/storage/v1/object/public/candidate-resumes/',
    ''
  ),
  resume_url
)
where resume_storage_path is null
  and resume_url is not null;
