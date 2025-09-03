import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

let ocrPipeline: any = null;

export const initializeOCR = async () => {
  if (!ocrPipeline) {
    try {
      ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed', {
        device: 'webgpu',
      });
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
      } catch (cpuError) {
        console.error('Failed to initialize OCR pipeline:', cpuError);
        throw new Error('Could not initialize text recognition. Please try again later.');
      }
    }
  }
  return ocrPipeline;
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    console.log('Starting text extraction with file:', imageFile.name, 'Size:', imageFile.size);
    
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }
    
    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Please select an image smaller than 10MB.');
    }
    
    // Create a canvas to process the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    return new Promise((resolve, reject) => {
      const image = new Image();
      
      image.onload = async () => {
        try {
          console.log('Image loaded, processing...');
          
          // Set canvas dimensions
          canvas.width = image.width;
          canvas.height = image.height;
          
          // Draw image on canvas
          ctx.drawImage(image, 0, 0);
          
          // Try to initialize OCR pipeline
          try {
            const ocr = await initializeOCR();
            console.log('OCR pipeline initialized');
            
            // Process with OCR
            const result = await ocr(image);
            console.log('OCR result:', result);
            
            if (result && result.generated_text) {
              console.log('Extracted text:', result.generated_text);
              resolve(result.generated_text.trim());
            } else if (result && typeof result === 'string') {
              console.log('Extracted text (string):', result);
              resolve(result.trim());
            } else {
              console.log('No text found in result');
              resolve('');
            }
          } catch (ocrError) {
            console.error('OCR pipeline error:', ocrError);
            reject(new Error(`Text recognition failed: ${ocrError.message || 'Unknown error'}. Please try again with a clearer image.`));
          }
          
        } catch (error) {
          console.error('Error during processing:', error);
          reject(new Error('Failed to process image'));
        }
      };
      
      image.onerror = (error) => {
        console.error('Error loading image:', error);
        reject(new Error('Failed to load image. Please try a different image.'));
      };
      
      const imageUrl = URL.createObjectURL(imageFile);
      image.src = imageUrl;
      
      // Clean up URL after processing
      const cleanup = () => URL.revokeObjectURL(imageUrl);
      image.addEventListener('load', cleanup);
      image.addEventListener('error', cleanup);
    });
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

export const captureImageFromCamera = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use 'environment' for the back camera on mobile devices
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No image selected'));
      }
    };
    
    input.click();
  });
};
