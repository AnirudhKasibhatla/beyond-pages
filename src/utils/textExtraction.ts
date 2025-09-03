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

// No longer needed - Tesseract handles image processing internally

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