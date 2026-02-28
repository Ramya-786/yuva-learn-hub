
-- Fix: allow librarian user_type or skip profile for librarians
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check CHECK (user_type IN ('student', 'staff', 'librarian'));

-- Update trigger to handle librarian
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  INSERT INTO public.profiles (user_id, name, roll_number, staff_code, department, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    CASE WHEN _role = 'student' THEN NEW.raw_user_meta_data->>'identifier' ELSE NULL END,
    CASE WHEN _role = 'staff' THEN NEW.raw_user_meta_data->>'identifier' ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    _role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role::app_role);

  RETURN NEW;
END;
$$;
