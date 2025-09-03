// Optimized text extraction with reliable OCR
let ocrWorker: any = null;

// Initialize OCR with multiple fallback models
const initializeOCR = async () => {
  if (ocrWorker) return ocrWorker;
  
  try {
    const { pipeline } = await import('@huggingface/transformers');
    
    // Use the most reliable OCR model for printed text
    ocrWorker = await pipeline('image-to-text', 'Xenova/trocr-base-printed', {
      device: 'cpu',
      dtype: 'fp32'
    });
    
    console.log('OCR initialized successfully');
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

    // Create optimized image for OCR
    const processedImage = await preprocessImage(imageFile);
    
    try {
      const ocr = await initializeOCR();
      console.log('Processing with OCR...');
      
      // Convert image to canvas for pipeline compatibility
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas not supported');
      }
      
      canvas.width = processedImage.width;
      canvas.height = processedImage.height;
      ctx.drawImage(processedImage, 0, 0);
      
      const result = await ocr(canvas);
      console.log('OCR result:', result);
      
      // Handle different result formats
      let extractedText = '';
      
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0] as any;
        if (firstResult.generated_text) {
          extractedText = firstResult.generated_text.trim();
        }
      } else if (result && typeof result === 'object') {
        const singleResult = result as any;
        if (singleResult.generated_text) {
          extractedText = singleResult.generated_text.trim();
        }
      }
      
      // If we got text, clean it up and return
      if (extractedText && extractedText.length > 2) {
        // Clean up common OCR artifacts
        extractedText = extractedText
          .replace(/[^\w\s.,!?'"()-]/g, '') // Remove unusual characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (extractedText.length > 2) {
          console.log('Extracted text:', extractedText);
          return extractedText;
        }
      }
      
      // Fallback: try handwritten model
      return await fallbackTextExtraction(processedImage);
      
    } catch (ocrError) {
      console.error('OCR error:', ocrError);
      // Try fallback method
      return await fallbackTextExtraction(processedImage);
    }
    
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error instanceof Error ? error : new Error('Failed to extract text from image');
  }
};

// Preprocess image for better OCR results
const preprocessImage = async (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }
    
    img.onload = () => {
      // Optimize image size for OCR
      const maxSize = 1024;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        const scale = Math.min(maxSize / width, maxSize / height);
        width *= scale;
        height *= scale;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw with better contrast for OCR
      ctx.filter = 'contrast(1.2) brightness(1.1)';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert back to image
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to process image'));
          return;
        }
        
        const processedImg = new Image();
        processedImg.onload = () => resolve(processedImg);
        processedImg.onerror = () => reject(new Error('Failed to load processed image'));
        processedImg.src = URL.createObjectURL(blob);
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Fallback text extraction method
const fallbackTextExtraction = async (image: HTMLImageElement): Promise<string> => {
  try {
    // Convert image to canvas for pipeline compatibility
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas not supported');
    }
    
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    // Try with handwritten model as fallback
    const { pipeline } = await import('@huggingface/transformers');
    const fallbackOCR = await pipeline('image-to-text', 'Xenova/trocr-base-handwritten', {
      device: 'cpu',
      dtype: 'fp32'
    });
    
    const result = await fallbackOCR(canvas);
    
    // Handle different result formats
    let extractedText = '';
    
    if (Array.isArray(result) && result.length > 0) {
      const firstResult = result[0] as any;
      if (firstResult.generated_text) {
        extractedText = firstResult.generated_text.trim();
      }
    } else if (result && typeof result === 'object') {
      const singleResult = result as any;
      if (singleResult.generated_text) {
        extractedText = singleResult.generated_text.trim();
      }
    }
    
    // Clean up and validate text
    if (extractedText && extractedText.length > 2) {
      extractedText = extractedText
        .replace(/[^\w\s.,!?'"()-]/g, '') // Remove unusual characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (extractedText.length > 2) {
        return extractedText;
      }
    }
  } catch (error) {
    console.error('Fallback OCR failed:', error);
  }
  
  // If all else fails, return empty string with a suggestion
  throw new Error('Could not extract text from this image. Please try with a clearer image or better lighting.');
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
export const cleanupOCR = () => {
  if (ocrWorker) {
    try {
      ocrWorker.dispose?.();
    } catch (error) {
      console.warn('Error disposing OCR worker:', error);
    }
    ocrWorker = null;
  }
};