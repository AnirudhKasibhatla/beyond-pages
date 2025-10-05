import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
interface EventImageRequest {
  eventId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
}

const validateInput = (data: any): EventImageRequest => {
  const { eventId, title, description, date, time, location } = data;
  
  // Validate required fields
  if (!eventId || typeof eventId !== 'string' || !eventId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid or missing eventId');
  }
  if (!title || typeof title !== 'string' || title.length === 0 || title.length > 200) {
    throw new Error('Title must be between 1 and 200 characters');
  }
  if (description && (typeof description !== 'string' || description.length > 1000)) {
    throw new Error('Description must be less than 1000 characters');
  }
  if (!date || typeof date !== 'string' || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error('Invalid date format (expected YYYY-MM-DD)');
  }
  if (!time || typeof time !== 'string' || time.length > 50) {
    throw new Error('Time must be less than 50 characters');
  }
  if (!location || typeof location !== 'string' || location.length > 200) {
    throw new Error('Location must be less than 200 characters');
  }
  
  return { eventId, title, description, date, time, location };
};

// Sanitize input to prevent prompt injection
const sanitize = (str: string): string => {
  return str
    .replace(/["\\]/g, '')  // Remove quotes and backslashes
    .replace(/\n/g, ' ')    // Replace newlines with spaces
    .replace(/\r/g, '')     // Remove carriage returns
    .trim()
    .slice(0, 500);         // Limit length as extra safety
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
    
    // Get and validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse and validate input
    const rawInput = await req.json();
    const validated = validateInput(rawInput);
    const { eventId, title, description, date, time, location } = validated;
    
    // Verify user owns the event (authorization check)
    const { data: event, error: eventError } = await supabase
      .from('book_events')
      .select('creator_id')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      console.error('Event lookup error:', eventError);
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (event.creator_id !== user.id) {
      console.error('Authorization failed: user', user.id, 'tried to generate image for event owned by', event.creator_id);
      return new Response(JSON.stringify({ error: 'Unauthorized: You do not own this event' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs before using in prompt
    const safeTitle = sanitize(title);
    const safeDescription = description ? sanitize(description) : '';
    const safeDate = sanitize(date);
    const safeTime = sanitize(time);
    const safeLocation = sanitize(location);

    // Extract book name from description (look for patterns like "book:", "reading", etc.)
    const bookNameMatch = safeDescription?.match(/(?:book|reading|novel|story|author)[\s:]*([^.!?]+)/i);
    const bookName = bookNameMatch ? bookNameMatch[1].trim().slice(0, 100) : '';

    // Create a comprehensive prompt for the image with sanitized inputs
    const prompt = `Create a beautiful, professional book event poster with these details: 
    Event: ${safeTitle}
    ${bookName ? `Book: ${bookName}` : ''}
    Date: ${safeDate}
    Time: ${safeTime}
    Location: ${safeLocation}
    
    Style: Modern, clean design with book-themed elements like bookshelves, reading symbols, or literary motifs. 
    Use warm, inviting colors that convey a sense of community and learning. 
    Include subtle textures and elegant typography. 
    The image should feel welcoming and sophisticated, suitable for a book club or literary event.
    Ultra high resolution.`;

    console.log('Generating image for event:', eventId, 'by user:', user.id);

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