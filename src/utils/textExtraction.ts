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
      console.warn('WebGPU not available, falling back to CPU');
      ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
    }
  }
  return ocrPipeline;
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    const ocr = await initializeOCR();
    
    // Convert file to image
    const imageUrl = URL.createObjectURL(imageFile);
    const image = new Image();
    
    return new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          const result = await ocr(image);
          URL.revokeObjectURL(imageUrl);
          
          if (result && result.generated_text) {
            resolve(result.generated_text.trim());
          } else {
            resolve('');
          }
        } catch (error) {
          console.error('Error extracting text:', error);
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };
      
      image.src = imageUrl;
    });
  } catch (error) {
    console.error('Error initializing OCR:', error);
    throw new Error('Failed to initialize text extraction');
  }
};

export const captureImageFromCamera = (): Promise<File> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'camera';
    
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