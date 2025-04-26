/*
  # Create AI insights and analysis tables

  1. New Tables
    - `property_insights`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `roi_percentage` (numeric)
      - `estimated_value` (numeric)
      - `neighborhood_score` (numeric)
      - `investment_rating` (text)
      - `analysis_summary` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `market_trends`
      - `id` (uuid, primary key)
      - `city` (text, not null)
      - `area` (text)
      - `property_type` (text, not null)
      - `date` (date, not null)
      - `average_price` (numeric, not null)
      - `price_change_percentage` (numeric)
      - `transaction_volume` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for viewing insights
*/

-- Property Insights Table
CREATE TABLE IF NOT EXISTS property_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  roi_percentage NUMERIC,
  estimated_value NUMERIC,
  neighborhood_score NUMERIC,
  investment_rating TEXT CHECK (investment_rating IN ('excellent', 'good', 'average', 'below_average', 'poor')),
  analysis_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Market Trends Table
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  area TEXT,
  property_type TEXT NOT NULL,
  date DATE NOT NULL,
  average_price NUMERIC NOT NULL,
  price_change_percentage NUMERIC,
  transaction_volume INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE property_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- Property Insights Policies

-- Anyone can view insights for approved properties
CREATE POLICY "Anyone can view insights for approved properties"
  ON property_insights
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_insights.property_id
      AND properties.status = 'approved'
    )
  );

-- Property owners can view insights for their own properties
CREATE POLICY "Property owners can view insights for their own properties"
  ON property_insights
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_insights.property_id
      AND properties.owner_id = auth.uid()
    )
  );

-- Admins can insert and update property insights
CREATE POLICY "Admins can insert property insights"
  ON property_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update property insights"
  ON property_insights
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Market Trends Policies

-- Anyone can view market trends
CREATE POLICY "Anyone can view market trends"
  ON market_trends
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can insert and update market trends
CREATE POLICY "Admins can insert market trends"
  ON market_trends
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update market trends"
  ON market_trends
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger for property_insights
CREATE TRIGGER update_property_insights_updated_at
BEFORE UPDATE ON property_insights
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();