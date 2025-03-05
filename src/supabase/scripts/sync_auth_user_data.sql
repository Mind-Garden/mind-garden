CREATE OR REPLACE FUNCTION sync_auth_user_data()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  -- Sync user data in the auth table
  UPDATE auth.users
  SET 
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) 
    || jsonb_build_object(
      'display_name', CONCAT(NEW.first_name, ' ', NEW.last_name)
    ),
    email = NEW.email 
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the trigger
CREATE OR REPLACE TRIGGER trigger_sync_auth_user_data
AFTER UPDATE OF first_name, last_name, email
ON public.users
FOR EACH ROW
EXECUTE FUNCTION sync_auth_user_data();