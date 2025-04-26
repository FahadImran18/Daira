-- Create viewings table
CREATE TABLE IF NOT EXISTS public.viewings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('pending', 'approved', 'rejected', 'completed')
    ),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    realtor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_viewings_property_id ON public.viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_user_id ON public.viewings(user_id);
CREATE INDEX IF NOT EXISTS idx_viewings_scheduled_at ON public.viewings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_chats_property_id ON public.chats(property_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON public.chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_realtor_id ON public.chats(realtor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
-- Set up Row Level Security (RLS) policies
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
-- Viewings policies
CREATE POLICY "Users can view their own viewings" ON public.viewings FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Realtors can view viewings for their properties" ON public.viewings FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.properties
            WHERE properties.id = viewings.property_id
                AND properties.realtor_id = auth.uid()
        )
    );
CREATE POLICY "Users can create viewings" ON public.viewings FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Realtors can update viewing status" ON public.viewings FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.properties
            WHERE properties.id = viewings.property_id
                AND properties.realtor_id = auth.uid()
        )
    );
-- Chats policies
CREATE POLICY "Users can view their own chats" ON public.chats FOR
SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = realtor_id
    );
CREATE POLICY "Users can create chats" ON public.chats FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chats" ON public.chats FOR
UPDATE USING (
        auth.uid() = user_id
        OR auth.uid() = realtor_id
    );
-- Chat messages policies
CREATE POLICY "Users can view messages in their chats" ON public.chat_messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.chats
            WHERE chats.id = chat_messages.chat_id
                AND (
                    chats.user_id = auth.uid()
                    OR chats.realtor_id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can send messages in their chats" ON public.chat_messages FOR
INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1
            FROM public.chats
            WHERE chats.id = chat_messages.chat_id
                AND (
                    chats.user_id = auth.uid()
                    OR chats.realtor_id = auth.uid()
                )
        )
    );
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create triggers for updated_at
CREATE TRIGGER update_viewings_updated_at BEFORE
UPDATE ON public.viewings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE
UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();