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
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }
    
    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Please select an image smaller than 10MB.');
    }
    
    const ocr = await initializeOCR();
    
    const imageUrl = URL.createObjectURL(imageFile);
    const image = new Image();
    
    return new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          // The pipeline can process the Image object directly.
          const result = await ocr(image);
          
          URL.revokeObjectURL(imageUrl);
          
          if (result && result.generated_text) {
            resolve(result.generated_text.trim());
          } else if (result && typeof result === 'string') {
            resolve(result.trim());
          } else {
            resolve('');
          }
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      image.onerror = (error) => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image. Please try a different image.'));
      };
      
      image.src = imageUrl;
    });
  } catch (error) {
    throw new Error(`Failed to initialize text extraction: ${error.message}`);
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
