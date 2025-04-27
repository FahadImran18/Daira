-- Create advisor profiles table
CREATE TABLE advisor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    expertise TEXT NOT NULL,
    bio TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    stripe_session_id TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Create advisor consultations table
CREATE TABLE advisor_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advisor_id UUID REFERENCES advisor_profiles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE
    SET NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        stripe_session_id TEXT,
        amount INTEGER NOT NULL DEFAULT 1500,
        -- $15.00
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Create consultation messages table
CREATE TABLE consultation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID REFERENCES advisor_consultations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- Create RLS policies
ALTER TABLE advisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_messages ENABLE ROW LEVEL SECURITY;
-- Advisor profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON advisor_profiles FOR
SELECT USING (is_active = true);
CREATE POLICY "Users can update their own profile" ON advisor_profiles FOR
UPDATE USING (auth.uid() = user_id);
-- Advisor consultations policies
CREATE POLICY "Users can view their own consultations" ON advisor_consultations FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() IN (
            SELECT user_id
            FROM advisor_profiles
            WHERE id = advisor_consultations.advisor_id
        )
    );
CREATE POLICY "Users can create consultations" ON advisor_consultations FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Consultation messages policies
CREATE POLICY "Participants can view consultation messages" ON consultation_messages FOR
SELECT USING (
        auth.uid() IN (
            SELECT user_id
            FROM advisor_consultations
            WHERE id = consultation_messages.consultation_id
            UNION
            SELECT user_id
            FROM advisor_profiles
            WHERE id = (
                    SELECT advisor_id
                    FROM advisor_consultations
                    WHERE id = consultation_messages.consultation_id
                )
        )
    );
CREATE POLICY "Participants can insert messages" ON consultation_messages FOR
INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id
            FROM advisor_consultations
            WHERE id = consultation_id
            UNION
            SELECT user_id
            FROM advisor_profiles
            WHERE id = (
                    SELECT advisor_id
                    FROM advisor_consultations
                    WHERE id = consultation_id
                )
        )
    );
-- Create functions
CREATE OR REPLACE FUNCTION match_advisors_by_area(property_area TEXT, property_city TEXT) RETURNS SETOF advisor_profiles LANGUAGE sql SECURITY DEFINER AS $$
SELECT *
FROM advisor_profiles
WHERE is_active = true
    AND city ILIKE property_city
    AND (
        area ILIKE property_area
        OR property_area ILIKE '%' || area || '%'
        OR area ILIKE '%' || property_area || '%'
    )
ORDER BY created_at DESC;
$$;