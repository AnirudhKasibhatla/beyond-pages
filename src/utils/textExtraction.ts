import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

let ocrPipeline: any = null;

export const initializeOCR = async () => {
  if (!ocrPipeline) {
    try {
      console.log('Initializing OCR pipeline with WebGPU...');
      ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed', {
        device: 'webgpu',
      });
      console.log('OCR pipeline initialized with WebGPU');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        console.log('Initializing OCR pipeline with CPU...');
        ocrPipeline = await pipeline('image-to-text', 'Xenova/trocr-base-printed');
        console.log('OCR pipeline initialized with CPU');
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
    console.log('Starting text extraction for file:', imageFile.name, imageFile.type, imageFile.size);
    
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }
    
    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      throw new Error('File too large. Please select an image smaller than 10MB.');
    }
    
    const ocr = await initializeOCR();
    console.log('OCR pipeline initialized successfully');
    
    // Convert file to image
    const imageUrl = URL.createObjectURL(imageFile);
    const image = new Image();
    
    return new Promise((resolve, reject) => {
      image.onload = async () => {
        try {
          console.log('Image loaded successfully, dimensions:', image.width, 'x', image.height);
          
          // Create canvas to ensure proper image format
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Could not create canvas context');
          }
          
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          
          console.log('Starting OCR processing...');
          const result = await ocr(canvas);
          console.log('OCR result:', result);
          
          URL.revokeObjectURL(imageUrl);
          
          if (result && result.generated_text) {
            const extractedText = result.generated_text.trim();
            console.log('Extracted text:', extractedText);
            resolve(extractedText);
          } else if (result && typeof result === 'string') {
            // Handle case where result is directly a string
            const extractedText = result.trim();
            console.log('Extracted text (string):', extractedText);
            resolve(extractedText);
          } else {
            console.log('No text found in image');
            resolve('');
          }
        } catch (error) {
          console.error('Error during OCR processing:', error);
          URL.revokeObjectURL(imageUrl);
          reject(error);
        }
      };
      
      image.onerror = (error) => {
        console.error('Error loading image:', error);
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image. Please try a different image.'));
      };
      
      image.src = imageUrl;
    });
  } catch (error) {
    console.error('Error initializing text extraction:', error);
    throw new Error(`Failed to initialize text extraction: ${error.message}`);
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