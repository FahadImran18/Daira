import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import Stripe from "npm:stripe@13.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key is not configured");
    }
    
    const stripe = new Stripe(stripeSecretKey);
    
    if (req.method === "POST" && req.url.includes("/payment/create-payment-intent")) {
      const { amount, currency = "pkr", propertyId } = await req.json();
      
      // Validate input
      if (!amount || !propertyId) {
        throw new Error("Amount and property ID are required");
      }
      
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw authError;
      
      const userId = authData.user.id;
      
      // Get property info
      const { data: property, error: propertyError } = await supabaseClient
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      
      if (propertyError) throw propertyError;
      
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents/paisa
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          propertyId,
          propertyTitle: property.title
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    if (req.method === "POST" && req.url.includes("/payment/webhook")) {
      // This would handle Stripe webhooks in a production environment
      const body = await req.text();
      const signature = req.headers.get("stripe-signature") || "";
      
      // Here you would verify the webhook signature and process the event
      // For simplicity, we're just returning a success response
      
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});