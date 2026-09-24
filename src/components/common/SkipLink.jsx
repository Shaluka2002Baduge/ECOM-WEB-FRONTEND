import React from 'react';

/**
 * Accessible Skip to Main Content Link
 * Essential WCAG 2.1 Bypass Blocks (2.4.1) requirement
 */
const SkipLink = ({ targetId = 'main-content', text = 'Skip to main content' }) => {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {text}
    </a>
  );
};

export default SkipLink;
