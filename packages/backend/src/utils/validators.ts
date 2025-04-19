/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Password strength validation
   * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  export const isStrongPassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers
    );
  };
  
  /**
   * Password validation errors
   */
  export const getPasswordValidationErrors = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must include at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must include at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must include at least one number');
    }
    
    return errors;
  };
  
  /**
   * Phone number validation
   */
  export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    // Allow for international formatting with country code
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  };
  
  /**
   * Username validation
   * Alphanumeric with underscores and hyphens, 3-20 characters
   */
  export const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };
  
  /**
   * Validate that string is not empty
   */
  export const isNonEmptyString = (value: string): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  };
  
  /**
   * Validate that passwords match
   */
  export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  };
  
  /**
   * Validate token format
   */
  export const isValidToken = (token: string): boolean => {
    // Token should be a hexadecimal string of the right length
    const tokenRegex = /^[a-f0-9]{24,128}$/i;
    return tokenRegex.test(token);
  };
  
  /**
   * Validate URL
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Sanitize data for safe output (prevent XSS)
   */
  export const sanitizeData = (data: string): string => {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  /**
   * Check if a refresh token is valid
   */
  export const isValidRefreshToken = (token: string): boolean => {
    // Refresh tokens should be at least 64 characters
    return isValidToken(token) && token.length >= 64;
  };