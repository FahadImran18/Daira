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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    if (!session.metadata) {
      return NextResponse.json(
        { error: "Missing session metadata" },
        { status: 400 }
      );
    }

    const { consultationId, userId } = session.metadata;

    if (!consultationId || !userId) {
      return NextResponse.json(
        { error: "Missing required metadata" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Update the consultation status
    const { error: updateError } = await supabase
      .from("advisor_consultations")
      .update({
        payment_status: "completed",
        status: "active",
      })
      .eq("stripe_session_id", sessionId);

    if (updateError) {
      throw updateError;
    }

    // Create an initial message in the consultation chat
    const { error: messageError } = await supabase
      .from("consultation_messages")
      .insert({
        consultation_id: consultationId,
        sender_id: userId,
        message: "Hello! I've just booked a consultation. Looking forward to your advice about this property.",
      });

    if (messageError) {
      throw messageError;
    }

    // Redirect to the consultation chat
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/consultations/${consultationId}`
    );
  } catch (error: any) {
    console.error("Error processing consultation success:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to process consultation success",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 