import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(new URL('/error?message=No session ID provided', request.url));
    }

    // Verify the payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(new URL('/error?message=Payment not completed', request.url));
    }

    // Get the user ID from the session metadata
    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.redirect(new URL('/error?message=User ID not found', request.url));
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Create or update user profile with advisor role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: session.customer_email,
        role: 'advisor',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return NextResponse.redirect(new URL('/error?message=Failed to create user profile', request.url));
    }

    // Create advisor profile
    const { error: advisorError } = await supabase
      .from('advisor_profiles')
      .upsert({
        user_id: userId,
        email: session.customer_email,
        is_active: true,
        payment_status: 'completed',
        stripe_session_id: sessionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (advisorError) {
      console.error('Error creating advisor profile:', advisorError);
      return NextResponse.redirect(new URL('/error?message=Failed to create advisor profile', request.url));
    }

    // Update the user's role in auth.users
    const { error: roleError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: 'advisor' } }
    );

    if (roleError) {
      console.error('Error updating user role:', roleError);
      return NextResponse.redirect(new URL('/error?message=Failed to update user role', request.url));
    }

    return NextResponse.redirect(new URL('/advisor/dashboard?message=Advisor profile created successfully', request.url));
  } catch (error) {
    console.error('Error in advisor success handler:', error);
    return NextResponse.redirect(new URL('/error?message=An unexpected error occurred', request.url));
  }
} 