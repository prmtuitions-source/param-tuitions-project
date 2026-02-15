import DOMPurify from 'dompurify';

const sanitizeHtml = (html) => {
  if (!html) return '';
  // Use DOMPurify default profile for HTML; tweak options if you need stricter rules.
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};

export default sanitizeHtml;
