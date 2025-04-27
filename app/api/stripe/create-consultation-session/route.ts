import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const { advisorId, propertyId } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Get the advisor's details
    const { data: advisor } = await supabase
      .from("advisor_profiles")
      .select("*")
      .eq("id", advisorId)
      .single();

    if (!advisor) {
      return NextResponse.json(
        { error: "Advisor not found" },
        { status: 404 }
      );
    }

    // Get the user's details
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Create a consultation record
    const { data: consultation, error: consultationError } = await supabase
      .from("advisor_consultations")
      .insert({
        advisor_id: advisorId,
        user_id: user.id,
        property_id: propertyId,
        amount: 1500, // $15.00
      })
      .select()
      .single();

    if (consultationError) {
      throw consultationError;
    }

    // Get the base URL from the request
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Property Consultation",
              description: `Consultation with ${advisor.name} about property`,
            },
            unit_amount: 1500, // $15.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/api/stripe/consultation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/properties/${propertyId}`,
      customer_email: user.email,
      metadata: {
        consultationId: consultation.id,
        advisorId,
        propertyId,
        userId: user.id,
      },
    });

    // Update the consultation with the Stripe session ID
    await supabase
      .from("advisor_consultations")
      .update({ stripe_session_id: session.id })
      .eq("id", consultation.id);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error("Error creating consultation session:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create consultation session",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 