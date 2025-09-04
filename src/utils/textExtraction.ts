// Mistral OCR API integration
const MISTRAL_OCR_API_URL = 'https://api.aimlapi.com/v1/ocr';

// Get API key from environment or prompt user
const getAPIKey = async (): Promise<string> => {
  // In a real app, you'd store this securely
  let apiKey = localStorage.getItem('mistral_api_key');
  
  if (!apiKey) {
    apiKey = prompt('Please enter your AI/ML API key for Mistral OCR:');
    if (apiKey) {
      localStorage.setItem('mistral_api_key', apiKey);
    } else {
      throw new Error('API key is required for OCR functionality');
    }
  }
  
  return apiKey;
};

// Convert file to base64 for API
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    console.log('Starting text extraction with Mistral OCR:', { name: imageFile.name, size: imageFile.size });
    
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    
    if (imageFile.size > 50 * 1024 * 1024) {
      throw new Error('Image too large. Please select an image smaller than 50MB');
    }

    // Get API key
    const apiKey = await getAPIKey();
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    console.log('Processing image with Mistral OCR...');
    
    // Call Mistral OCR API
    const response = await fetch(MISTRAL_OCR_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral/mistral-ocr-latest',
        document: {
          type: 'document_base64',
          document_base64: base64Image
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Mistral OCR result:', result);
    
    // Extract text from response
    let extractedText = '';
    if (result.choices && result.choices[0] && result.choices[0].message) {
      extractedText = result.choices[0].message.content || '';
    } else if (result.text) {
      extractedText = result.text;
    } else if (result.content) {
      extractedText = result.content;
    }
    
    // Clean up the extracted text
    let cleanedText = extractedText
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Check if we have meaningful text
    if (cleanedText && cleanedText.length >= 3) {
      console.log('Successfully extracted text:', cleanedText);
      return cleanedText;
    }
    
    // If text is too short, throw a helpful error
    throw new Error('No readable text found in the image. Please ensure the image contains clear, readable text.');
    
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error instanceof Error ? error : new Error('Failed to extract text from image');
  }
};

// Utility function to generate and download quote as JPEG
export const downloadQuoteAsImage = async (quote: string, bookTitle: string, author?: string): Promise<void> => {
  try {
    // Create a temporary div to render the quote
    const quoteDiv = document.createElement('div');
    quoteDiv.style.cssText = `
      width: 800px;
      padding: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: 'Georgia', serif;
      position: fixed;
      top: -9999px;
      left: -9999px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    quoteDiv.innerHTML = `
      <div style="text-align: center; min-height: 400px; display: flex; flex-direction: column; justify-content: center;">
        <div style="font-size: 32px; line-height: 1.6; margin-bottom: 40px; font-style: italic;">
          "${quote}"
        </div>
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">
          ${bookTitle}
        </div>
        ${author ? `<div style="font-size: 16px; opacity: 0.8; margin-bottom: 40px;">by ${author}</div>` : '<div style="margin-bottom: 40px;"></div>'}
        <div style="font-size: 14px; opacity: 0.7; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;">
          Beyond Pages
        </div>
      </div>
    `;
    
    document.body.appendChild(quoteDiv);
    
    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default;
    
    // Convert to canvas
    const canvas = await html2canvas(quoteDiv, {
      backgroundColor: null,
      scale: 2,
      useCORS: true
    });
    
    // Clean up
    document.body.removeChild(quoteDiv);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quote-${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.9);
    
  } catch (error) {
    console.error('Error generating quote image:', error);
    throw new Error('Failed to generate quote image');
  }
};

export const captureImageFromCamera = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    const timeout = setTimeout(() => {
      reject(new Error('Camera capture timed out'));
    }, 30000);
    
    input.onchange = (event) => {
      clearTimeout(timeout);
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No image captured'));
      }
    };
    
    // Handle user cancellation
    const handleFocus = () => {
      setTimeout(() => {
        if (!document.contains(input)) {
          clearTimeout(timeout);
          document.removeEventListener('focus', handleFocus);
          reject(new Error('Camera capture cancelled'));
        }
      }, 1000);
    };
    
    document.addEventListener('focus', handleFocus);
    input.click();
  });
};

// Cleanup function - no longer needed for Mistral OCR
export const cleanupOCR = async () => {
  // No cleanup needed for API-based OCR
  console.log('OCR cleanup complete');
};