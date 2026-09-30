/**
 * Raalahami Restaurant - Form & Data Integrity Validators
 * Safe, pure helper functions for frontend input verification and sanitation
 */

/**
 * Validate standard email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validate Sri Lankan and International phone numbers
 * Accepts formats: +947XXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+94|0)?7[0-9]{8}$/.test(cleaned) || /^\+?[0-9]{9,15}$/.test(cleaned);
};

/**
 * Validate Order Reference identifier (e.g. RAALAHAMI-782194, ORD-1234, alphanumeric with dashes/underscores)
 * @param {string} ref
 * @returns {boolean}
 */
export const isValidOrderReference = (ref) => {
  if (!ref || typeof ref !== 'string') return false;
  const clean = ref.trim().replace(/^#/, '');
  return /^[A-Za-z0-9\-_]{3,40}$/.test(clean);
};

/**
 * Validate realistic positive price bounds (between 0.01 and 1,000,000 LKR)
 * @param {number|string} price
 * @returns {boolean}
 */
export const isValidPrice = (price) => {
  if (price === null || price === undefined || price === '') return false;
  const num = Number(price);
  return !isNaN(num) && num > 0 && num <= 1000000;
};

/**
 * Validate integer quantity within sensible dining bounds (1 to 100)
 * @param {number|string} qty
 * @returns {boolean}
 */
export const isValidQuantity = (qty) => {
  if (qty === null || qty === undefined || qty === '') return false;
  const num = Number(qty);
  return Number.isInteger(num) && num > 0 && num <= 100;
};

/**
 * Validate text length bounds
 * @param {string} text
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isValidTextLength = (text, min = 2, max = 255) => {
  if (typeof text !== 'string') return false;
  const len = text.trim().length;
  return len >= min && len <= max;
};

/**
 * Validate password requirements
 * @param {string} password
 * @param {number} min
 * @returns {boolean}
 */
export const isValidPassword = (password, min = 6) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= min;
};

/**
 * Basic XSS and injection sanitizer for string inputs
 * @param {*} input
 * @returns {*}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export default {
  isValidEmail,
  isValidPhone,
  isValidOrderReference,
  isValidPrice,
  isValidQuantity,
  isValidTextLength,
  isValidPassword,
  sanitizeInput
};
