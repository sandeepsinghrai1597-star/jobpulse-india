insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select
  'candidate-resumes',
  'candidate-resumes',
  true,
  5242880,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
where not exists (
  select 1 from storage.buckets where id = 'candidate-resumes'
);

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
create policy "public reads candidate resumes"
on storage.objects for select
to public
using (bucket_id = 'candidate-resumes');
