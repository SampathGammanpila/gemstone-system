// Form validation utilities

/**
 * Email validation
 */
export const validateEmail = (email: string): string => {
    if (!email) return 'Email is required';
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return '';
  };
  
  /**
   * Password validation
   */
  export const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return 'Password must include at least one uppercase letter, one lowercase letter, and one number';
    }
    
    return '';
  };
  
  /**
   * Password confirmation validation
   */
  export const validatePasswordConfirmation = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return 'Please confirm your password';
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return '';
  };
  
  /**
   * Required field validation
   */
  export const validateRequired = (value: string, fieldName: string): string => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    
    return '';
  };
  
  /**
   * Phone number validation
   */
  export const validatePhone = (phone: string): string => {
    if (!phone) return 'Phone number is required';
    
    // Basic phone validation - can be customized based on regional requirements
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return 'Please enter a valid phone number';
    }
    
    return '';
  };
  
  /**
   * URL validation
   */
  export const validateUrl = (url: string): string => {
    if (!url) return ''; // URL might be optional
    
    try {
      new URL(url);
      return '';
    } catch (error) {
      return 'Please enter a valid URL (including http:// or https://)';
    }
  };
  
  /**
   * Validate terms agreement checkbox
   */
  export const validateTermsAgreement = (agreed: boolean): string => {
    if (!agreed) {
      return 'You must agree to the terms and conditions';
    }
    
    return '';
  };
  
  /**
   * Validate file upload (type and size)
   */
  export const validateFile = (file: File | null, allowedTypes: string[], maxSizeMB: number): string => {
    if (!file) return '';
    
    const fileType = file.type;
    const fileSize = file.size / (1024 * 1024); // Convert to MB
    
    if (!allowedTypes.includes(fileType)) {
      return `File type not supported. Please upload ${allowedTypes.join(', ')}`;
    }
    
    if (fileSize > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    return '';
  };