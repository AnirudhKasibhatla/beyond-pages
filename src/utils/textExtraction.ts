// Reliable text extraction using Tesseract.js
import { createWorker } from 'tesseract.js';

let ocrWorker: any = null;

// Initialize OCR with Tesseract.js
const initializeOCR = async () => {
  if (ocrWorker) return ocrWorker;
  
  try {
    console.log('Initializing Tesseract OCR worker...');
    ocrWorker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    // Configure for better accuracy
    await ocrWorker.setParameters({
      tessedit_pageseg_mode: '3', // Fully automatic page segmentation
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?:;"\'-() ',
    });
    
    console.log('Tesseract OCR initialized successfully');
    return ocrWorker;
  } catch (error) {
    console.error('Failed to initialize OCR:', error);
    throw new Error('OCR service is currently unavailable. Please try again later.');
  }
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    console.log('Starting text extraction:', { name: imageFile.name, size: imageFile.size });
    
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('Image too large. Please select an image smaller than 10MB');
    }

    // Initialize Tesseract worker
    const worker = await initializeOCR();
    console.log('Processing image with Tesseract OCR...');
    
    try {
      // Recognize text from the image file directly
      const { data: { text } } = await worker.recognize(imageFile);
      console.log('Raw OCR result:', text);
      
      // Clean up the extracted text
      let cleanedText = text
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[^\w\s.,!?'"()-]/g, '') // Remove unusual characters
        .trim();
      
      // Check if we have meaningful text
      if (cleanedText && cleanedText.length >= 3) {
        console.log('Successfully extracted text:', cleanedText);
        return cleanedText;
      }
      
      // If text is too short, throw a helpful error
      throw new Error('No readable text found in the image. Please ensure the image contains clear, readable text with good lighting and focus.');
      
    } catch (ocrError) {
      console.error('Tesseract OCR error:', ocrError);
      throw new Error('Could not extract text from this image. Please try with a clearer image with better lighting and contrast.');
    }
    
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

// Cleanup function to free memory
export const cleanupOCR = async () => {
  if (ocrWorker) {
    try {
      await ocrWorker.terminate();
      console.log('OCR worker terminated successfully');
    } catch (error) {
      console.warn('Error terminating OCR worker:', error);
    }
    ocrWorker = null;
  }
};