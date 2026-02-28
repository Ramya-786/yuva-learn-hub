
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'staff', 'librarian');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  roll_number TEXT,
  staff_code TEXT,
  department TEXT,
  user_type TEXT NOT NULL DEFAULT 'student' CHECK (user_type IN ('student', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create book_entries table
CREATE TABLE public.book_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'staff')),
  book_name TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  author TEXT NOT NULL,
  published_year INT NOT NULL,
  issue_date DATE NOT NULL,
  last_date DATE NOT NULL,
  return_status TEXT NOT NULL DEFAULT 'Issued' CHECK (return_status IN ('Issued', 'Returned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_entries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Book entries: students/staff can only INSERT
CREATE POLICY "Students and staff can insert book entries"
  ON public.book_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (public.has_role(auth.uid(), 'student') OR public.has_role(auth.uid(), 'staff'))
  );

-- Book entries: librarian can SELECT all
CREATE POLICY "Librarian can view all book entries"
  ON public.book_entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

-- Book entries: librarian can UPDATE return_status
CREATE POLICY "Librarian can update book entries"
  ON public.book_entries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

-- Librarian can view all profiles (to see who entered books)
CREATE POLICY "Librarian can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'librarian'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, roll_number, staff_code, department, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'identifier',
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'staff' THEN NEW.raw_user_meta_data->>'identifier' ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::app_role
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
