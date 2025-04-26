-- Create enum types if they don't exist
DO $$ BEGIN CREATE TYPE property_status AS ENUM ('active', 'pending', 'sold', 'rented');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE chat_status AS ENUM ('active', 'archived');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE advice_status AS ENUM ('pending', 'accepted', 'rejected', 'completed');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'realtor', 'advisor');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    property_type TEXT NOT NULL,
    status property_status DEFAULT 'active',
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(10, 2),
    images TEXT [],
    features JSONB,
    realtor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    realtor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status chat_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS advice_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    status advice_status DEFAULT 'pending',
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes if they don't exist
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_properties_realtor ON properties(realtor_id);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_chats_property ON chats(property_id);
CREATE INDEX IF NOT EXISTS idx_chats_users ON chats(user_id, realtor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_advice_requests_user ON advice_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_requests_advisor ON advice_requests(advisor_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Realtors can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Realtors can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON chat_messages;
DROP POLICY IF EXISTS "Users can view their own advice requests" ON advice_requests;
DROP POLICY IF EXISTS "Users can create advice requests" ON advice_requests;
DROP POLICY IF EXISTS "Advisors can update advice requests" ON advice_requests;
DROP POLICY IF EXISTS "Users can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
-- Create policies
CREATE POLICY "Properties are viewable by everyone" ON properties FOR
SELECT USING (true);
CREATE POLICY "Realtors can insert their own properties" ON properties FOR
INSERT WITH CHECK (auth.uid() = realtor_id);
CREATE POLICY "Realtors can update their own properties" ON properties FOR
UPDATE USING (auth.uid() = realtor_id);
CREATE POLICY "Users can view their own chats" ON chats FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = realtor_id
    );
CREATE POLICY "Users can create chats" ON chats FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in their chats" ON chat_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM chats
            WHERE chats.id = chat_messages.chat_id
                AND (
                    chats.user_id = auth.uid()
                    OR chats.realtor_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can send messages in their chats" ON chat_messages FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM chats
            WHERE chats.id = chat_messages.chat_id
                AND (
                    chats.user_id = auth.uid()
                    OR chats.realtor_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can view their own advice requests" ON advice_requests FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = advisor_id
    );
CREATE POLICY "Users can create advice requests" ON advice_requests FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Advisors can update advice requests" ON advice_requests FOR
UPDATE USING (auth.uid() = advisor_id);
CREATE POLICY "Users can view all user profiles" ON user_profiles FOR
SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Create or replace the update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_chats_updated_at ON chats;
DROP TRIGGER IF EXISTS update_advice_requests_updated_at ON advice_requests;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
-- Create triggers
CREATE TRIGGER update_properties_updated_at BEFORE
UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_chats_updated_at BEFORE
UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_advice_requests_updated_at BEFORE
UPDATE ON advice_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE
UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();