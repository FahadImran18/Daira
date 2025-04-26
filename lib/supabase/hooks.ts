import { useEffect, useState } from 'react';
import { createClient } from './client';
import { useSupabase } from './provider';

export function useProperties(options: {
  city?: string;
  type?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
} = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient();
        let query = supabase
          .from('properties')
          .select(`
            *,
            owner:owner_id(email, full_name),
            images:property_images(url, is_primary),
            features:property_features(feature)
          `)
          .eq('status', 'approved');

        if (options.city) {
          query = query.eq('city', options.city);
        }
        if (options.type) {
          query = query.eq('property_type', options.type);
        }
        if (options.purpose) {
          query = query.eq('purpose', options.purpose);
        }
        if (options.minPrice) {
          query = query.gte('price', options.minPrice);
        }
        if (options.maxPrice) {
          query = query.lte('price', options.maxPrice);
        }
        if (options.featured) {
          query = query.eq('is_featured', true);
        }

        const { data, error: err } = await query;
        
        if (err) throw err;
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [options]);

  return { properties, loading, error };
}

export function useUserProperties() {
  const { user } = useSupabase();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('properties')
          .select(`
            *,
            images:property_images(url, is_primary),
            features:property_features(feature)
          `)
          .eq('owner_id', user.id);

        if (err) throw err;
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  return { properties, loading, error };
}

export function useFavoriteProperties() {
  const { user } = useSupabase();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('property_favorites')
          .select(`
            property:property_id (
              *,
              owner:owner_id(email, full_name),
              images:property_images(url, is_primary),
              features:property_features(feature)
            )
          `)
          .eq('user_id', user.id);

        if (err) throw err;
        setFavorites(data.map(f => f.property));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  return { favorites, loading, error };
}

export function useConversations() {
  const { user } = useSupabase();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from('conversations')
          .select(`
            *,
            participants:conversation_participants(
              user:user_id(*)
            ),
            last_message:messages(
              content,
              created_at,
              sender:sender_id(*)
            )
          `)
          .eq('conversation_participants.user_id', user.id)
          .order('updated_at', { ascending: false });

        if (err) throw err;
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  return { conversations, loading, error };
}