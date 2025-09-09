import DOMPurify from 'dompurify';

// Input sanitization utility functions
export const sanitizeInput = {
  // Sanitize HTML content to prevent XSS
  html: (input: string): string => {
    if (!input) return '';
    try {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      });
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      return '';
    }
  },

  // Sanitize plain text, removing any HTML tags
  text: (input: string): string => {
    if (!input) return '';
    try {
      return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    } catch (error) {
      console.error('Error sanitizing text:', error);
      return '';
    }
  },

  // Validate and sanitize username
  username: (input: string): string => {
    const sanitized = input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') // Only allow alphanumeric and underscore
      .slice(0, 50); // Enforce length limit
    
    if (sanitized.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
    
    return sanitized;
  },

  // Validate and sanitize email
  email: (input: string): string => {
    const sanitized = input.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  },

  // Sanitize and validate bio/description text
  bio: (input: string): string => {
    if (!input) return '';
    try {
      const sanitized = DOMPurify.sanitize(input.trim(), { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [] 
      });
      
      if (sanitized.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error sanitizing bio:', error);
      return '';
    }
  },

  // Sanitize post content with basic formatting
  postContent: (input: string): string => {
    if (!input) return '';
    try {
      const sanitized = DOMPurify.sanitize(input.trim(), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: []
      });
      
      if (sanitized.length > 2000) {
        throw new Error('Post content must be 2000 characters or less');
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error sanitizing post content:', error);
      return '';
    }
  },

  // Sanitize reply content
  replyContent: (input: string): string => {
    if (!input) return '';
    try {
      const sanitized = DOMPurify.sanitize(input.trim(), {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
        ALLOWED_ATTR: []
      });
      
      if (sanitized.length > 1000) {
        throw new Error('Reply content must be 1000 characters or less');
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error sanitizing reply content:', error);
      return '';
    }
  },

  // Sanitize highlight text
  highlightText: (input: string): string => {
    if (!input) return '';
    try {
      const sanitized = DOMPurify.sanitize(input.trim(), { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [] 
      });
      
      if (sanitized.length > 1000) {
        throw new Error('Highlight text must be 1000 characters or less');
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error sanitizing highlight text:', error);
      return '';
    }
  }
};

// Rate limiting for guest users
export const guestRateLimit = {
  // Generate a pseudo-unique guest ID based on browser fingerprint
  getGuestId: (): string => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `guest_${Math.abs(hash)}`;
  },

  // Check if action is allowed for guest user
  checkLimit: (actionType: string, maxActions: number = 10): boolean => {
    const guestId = guestRateLimit.getGuestId();
    const key = `rate_limit_${guestId}_${actionType}`;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour window
    
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { count: 0, windowStart: now };
    
    // Reset if window expired
    if (now - data.windowStart > windowMs) {
      data.count = 0;
      data.windowStart = now;
    }
    
    // Check if limit exceeded
    if (data.count >= maxActions) {
      return false;
    }
    
    // Increment and store
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    
    return true;
  }
};