import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { eventId, title, description, date, time, location } = await req.json();

    if (!eventId || !title) {
      throw new Error('Event ID and title are required');
    }

    // Extract book name from description (look for patterns like "book:", "reading", etc.)
    const bookNameMatch = description?.match(/(?:book|reading|novel|story|author)[\s:]*([^.!?]+)/i);
    const bookName = bookNameMatch ? bookNameMatch[1].trim() : '';

    // Create a comprehensive prompt for the image
    const prompt = `Create a beautiful, professional book event poster with these details: 
    Event: "${title}"
    ${bookName ? `Book: "${bookName}"` : ''}
    Date: ${date}
    Time: ${time}
    Location: ${location}
    
    Style: Modern, clean design with book-themed elements like bookshelves, reading symbols, or literary motifs. 
    Use warm, inviting colors that convey a sense of community and learning. 
    Include subtle textures and elegant typography. 
    The image should feel welcoming and sophisticated, suitable for a book club or literary event.
    Ultra high resolution.`;

    console.log('Generating image with prompt:', prompt);

    // Generate image using OpenAI API
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      }),
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${imageResponse.status} - ${errorData}`);
    }

    const imageData = await imageResponse.json();
    console.log('Image generation response:', imageData);

    if (!imageData.data || !imageData.data[0] || !imageData.data[0].b64_json) {
      throw new Error('No image data returned from OpenAI');
    }

    // Convert base64 to blob
    const base64Data = imageData.data[0].b64_json;
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create filename
    const fileName = `event_${eventId}_${Date.now()}.png`;
    const filePath = `${eventId}/${fileName}`;

    console.log('Uploading image to storage:', filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;
    console.log('Image uploaded successfully:', imageUrl);

    // Store reference in database
    const { error: dbError } = await supabase
      .from('event_images')
      .insert({
        event_id: eventId,
        image_url: imageUrl,
        file_name: fileName,
        file_size: imageBuffer.length
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Don't throw here as the image was uploaded successfully
    }

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl: imageUrl,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-event-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});