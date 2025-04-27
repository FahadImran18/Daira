import { NextResponse } from "next/server";
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
    console.log("Starting create-advisor-session...");
    
    const body = await req.json();
    console.log("Received request body:", body);
    
    const { userId, email } = body;
    
    if (!userId || !email) {
      console.error("Missing required fields:", { userId, email });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the base URL from the request
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    console.log("Using base URL:", baseUrl);

    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Advisor Registration Fee",
              description: "One-time registration fee for becoming an advisor",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/api/stripe/advisor-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/signup/advisor`,
      customer_email: email,
      metadata: {
        userId,
        type: "advisor_registration",
      },
    });

    console.log("Stripe session created:", {
      sessionId: session.id,
      url: session.url
    });

    if (!session.id) {
      throw new Error("Failed to create Stripe session");
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to create checkout session",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 