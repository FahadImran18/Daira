import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Mock function for AI analysis - in production, this would call Gemini API
const analyzeProperty = async (propertyData: any) => {
  // This would be replaced with actual Gemini API call
  const { city, propertyType, areaSize, areaUnit, price, bedrooms, bathrooms } = propertyData;
  
  // Simulated ROI calculation
  const roiPercentage = 4.5 + (Math.random() * 3);
  
  // Simulated neighborhood score (1-10)
  const neighborhoodScore = 7 + (Math.random() * 3);
  
  // Simulated estimated value
  const estimatedValue = price * (0.95 + (Math.random() * 0.1));
  
  // Investment rating based on ROI
  let investmentRating = 'average';
  if (roiPercentage > 7) investmentRating = 'excellent';
  else if (roiPercentage > 5.5) investmentRating = 'good';
  else if (roiPercentage < 4) investmentRating = 'below_average';
  else if (roiPercentage < 3) investmentRating = 'poor';
  
  // Analysis summary
  const summaries = [
    `This ${propertyType} in ${city} offers a solid investment opportunity with an estimated annual ROI of ${roiPercentage.toFixed(2)}%. The property is in a neighborhood with a score of ${neighborhoodScore.toFixed(1)}/10, indicating good amenities and safety.`,
    `Based on market trends, this ${bedrooms}-bedroom ${propertyType} is priced ${estimatedValue > price ? 'below' : 'above'} its estimated value of PKR ${Math.round(estimatedValue).toLocaleString()}. The area shows stable growth and demand.`,
    `With ${bedrooms} bedrooms and ${bathrooms} bathrooms in a ${areaSize} ${areaUnit} space, this property is suitable for a growing family. The investment potential is ${investmentRating}, with an expected annual return of ${roiPercentage.toFixed(2)}%.`
  ];
  
  const analysisSummary = summaries[Math.floor(Math.random() * summaries.length)];
  
  return {
    roiPercentage,
    estimatedValue,
    neighborhoodScore,
    investmentRating,
    analysisSummary
  };
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

    // Only accept POST requests
    if (req.method === "POST") {
      const { propertyId } = await req.json();
      
      if (!propertyId) {
        throw new Error("Property ID is required");
      }
      
      // Fetch property data
      const { data: property, error: propertyError } = await supabaseClient
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      
      if (propertyError) throw propertyError;
      if (!property) throw new Error("Property not found");
      
      // Analyze property using AI (simulated)
      const analysisResult = await analyzeProperty(property);
      
      // Check if insight already exists
      const { data: existingInsight, error: insightError } = await supabaseClient
        .from("property_insights")
        .select("id")
        .eq("property_id", propertyId)
        .maybeSingle();
      
      if (insightError) throw insightError;
      
      // Update or insert the analysis results
      let result;
      if (existingInsight) {
        const { data, error } = await supabaseClient
          .from("property_insights")
          .update({
            roi_percentage: analysisResult.roiPercentage,
            estimated_value: analysisResult.estimatedValue,
            neighborhood_score: analysisResult.neighborhoodScore,
            investment_rating: analysisResult.investmentRating,
            analysis_summary: analysisResult.analysisSummary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingInsight.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabaseClient
          .from("property_insights")
          .insert({
            property_id: propertyId,
            roi_percentage: analysisResult.roiPercentage,
            estimated_value: analysisResult.estimatedValue,
            neighborhood_score: analysisResult.neighborhoodScore,
            investment_rating: analysisResult.investmentRating,
            analysis_summary: analysisResult.analysisSummary,
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }
      
      return new Response(JSON.stringify(result), {
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