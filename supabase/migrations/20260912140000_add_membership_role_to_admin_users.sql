-- Add 'membership' to admin_users role check constraint
alter table admin_users drop constraint if exists admin_users_role_check;
alter table admin_users add constraint admin_users_role_check 
  check (role in ('admin', 'programs', 'editorial', 'dni', 'overall', 'partnership', 'electoral', 'membership'));
