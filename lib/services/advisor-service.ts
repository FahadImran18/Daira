import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export class AdvisorService {
  private supabase = createClientComponentClient();

  async getAdvisorsByArea(propertyArea: string, propertyCity: string) {
    const { data, error } = await this.supabase.rpc("match_advisors_by_area", {
      property_area: propertyArea,
      property_city: propertyCity,
    });

    if (error) throw error;
    return data;
  }

  async createConsultation(advisorId: string, propertyId: string) {
    const { data: session, error: sessionError } = await fetch(
      "/api/stripe/create-consultation-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advisorId,
          propertyId,
        }),
      }
    ).then((res) => res.json());

    if (sessionError) throw sessionError;
    return session;
  }

  async getConsultations(userId: string) {
    const { data, error } = await this.supabase
      .from("advisor_consultations")
      .select(`
        *,
        advisor:advisor_profiles(
          id,
          name,
          expertise
        ),
        property:properties(
          id,
          title,
          location
        ),
        messages:consultation_messages(
          id,
          message,
          created_at,
          sender:sender_id(
            id,
            email,
            user_metadata->name
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAdvisorConsultations(advisorId: string) {
    const { data, error } = await this.supabase
      .from("advisor_consultations")
      .select(`
        *,
        user:user_id(
          id,
          email,
          user_metadata->name
        ),
        property:properties(
          id,
          title,
          location
        ),
        messages:consultation_messages(
          id,
          message,
          created_at,
          sender:sender_id(
            id,
            email,
            user_metadata->name
          )
        )
      `)
      .eq("advisor_id", advisorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async sendMessage(consultationId: string, message: string) {
    const { data, error } = await this.supabase
      .from("consultation_messages")
      .insert({
        consultation_id: consultationId,
        message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 