-- Create guest-media storage bucket
insert into storage.buckets (id, name, public)
values ('guest-media', 'guest-media', true)
on conflict (id) do update set public = true;

drop policy if exists "guest_media_public_select" on storage.objects;
create policy "guest_media_public_select" on storage.objects
  for select to anon, authenticated using (bucket_id = 'guest-media');

drop policy if exists "guest_media_service_role_insert" on storage.objects;
create policy "guest_media_service_role_insert" on storage.objects
  for insert to anon, authenticated, service_role with check (bucket_id = 'guest-media');

drop policy if exists "guest_media_service_role_delete" on storage.objects;
create policy "guest_media_service_role_delete" on storage.objects
  for delete to anon, authenticated, service_role using (bucket_id = 'guest-media');
