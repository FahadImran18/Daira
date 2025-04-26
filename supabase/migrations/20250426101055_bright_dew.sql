/*
  # Create properties table and related tables

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, not null)
      - `address` (text, not null)
      - `city` (text, not null)
      - `location` (point)
      - `area_size` (numeric, not null)
      - `area_unit` (text, not null)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `property_type` (text, not null)
      - `purpose` (text, not null)
      - `owner_id` (uuid, references user_profiles)
      - `status` (text, not null)
      - `is_featured` (boolean)
      - `is_hot` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `property_images`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `url` (text, not null)
      - `is_primary` (boolean)
      - `created_at` (timestamptz)
    
    - `property_features`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `feature` (text, not null)
      - `created_at` (timestamptz)
    
    - `property_favorites`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `user_id` (uuid, references user_profiles)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for property owners and admins to manage their properties
    - Add policies for public viewing of approved properties
*/

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  location POINT,
  area_size NUMERIC NOT NULL,
  area_unit TEXT NOT NULL CHECK (area_unit IN ('sq_ft', 'sq_m', 'marla', 'kanal')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'plot', 'commercial', 'farmhouse')),
  purpose TEXT NOT NULL CHECK (purpose IN ('sale', 'rent')),
  owner_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Property Features Table
CREATE TABLE IF NOT EXISTS property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Property Favorites Table
CREATE TABLE IF NOT EXISTS property_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, user_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;

-- Property Policies

-- Anyone can view approved properties
CREATE POLICY "Anyone can view approved properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Property owners can view their own properties (any status)
CREATE POLICY "Property owners can view their own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Property owners can update their own properties
CREATE POLICY "Property owners can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Realtors can insert new properties
CREATE POLICY "Realtors can insert new properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'realtor'
    )
  );

-- Admins can update any property
CREATE POLICY "Admins can update any property"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any property
CREATE POLICY "Admins can delete any property"
  ON properties
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Property owners can delete their own properties
CREATE POLICY "Property owners can delete their own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Property Images Policies

-- Anyone can view images of approved properties
CREATE POLICY "Anyone can view images of approved properties"
  ON property_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.status = 'approved'
    )
  );

-- Property owners can view their own property images
CREATE POLICY "Property owners can view their own property images"
  ON property_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property owners can insert images for their properties
CREATE POLICY "Property owners can insert images for their properties"
  ON property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property owners can delete images from their properties
CREATE POLICY "Property owners can delete images from their properties"
  ON property_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property Features Policies

-- Anyone can view features of approved properties
CREATE POLICY "Anyone can view features of approved properties"
  ON property_features
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.status = 'approved'
    )
  );

-- Property owners can view features of their own properties
CREATE POLICY "Property owners can view features of their own properties"
  ON property_features
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property owners can insert features for their properties
CREATE POLICY "Property owners can insert features for their properties"
  ON property_features
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Property Favorites Policies

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON property_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can add properties to favorites
CREATE POLICY "Users can add properties to favorites"
  ON property_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can remove properties from favorites
CREATE POLICY "Users can remove properties from favorites"
  ON property_favorites
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Updated_at trigger for properties
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();