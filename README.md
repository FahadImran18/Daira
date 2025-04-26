# Zameen Insight - Pakistan Real Estate Platform

A modern real estate platform focused on the Pakistani market, built with Next.js and Supabase.

## Features

- Role-based user system (Customer, Realtor, Advisor, Admin)
- Property listings with search, filtering, and AI-powered insights
- Real-time chat between customers, realtors, and advisors
- Interactive dashboards for each role
- 360° virtual property tours
- Secure payment processing with Stripe
- Market analysis and trends

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **APIs**: Gemini AI, Stripe, Google Maps
- **Deployment**: Vercel or Netlify

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Connect to Supabase to set up your environment variables:
   - Click the "Connect to Supabase" button in your editor
   - Create a new Supabase project or connect to an existing one

4. Copy `.env.example` to `.env.local` and fill in the required API keys:

```bash
cp .env.example .env.local
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) to see the application

## Project Structure

```
├── app/                   # Next.js app router
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   └── properties/        # Property listing pages
├── components/            # Reusable UI components
├── lib/                   # Utility functions and hooks
├── public/                # Static assets
└── supabase/              # Supabase configuration and migrations
    ├── functions/         # Edge functions
    └── migrations/        # Database migrations
```

## Development Notes

- Run database migrations in the Supabase dashboard or using the CLI
- The app uses Server Components where possible, with "use client" directives only when necessary
- Real-time features use Supabase's Realtime functionality