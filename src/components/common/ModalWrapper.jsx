import React from 'react';
import Modal from './Modal';

/**
 * ModalWrapper Component
 * Provides a standardized wrapper around Modal with support for conditional draggability,
 * viewport containment, and accessible keyboard dismissal.
 */
export const ModalWrapper = (props) => {
  return <Modal {...props} />;
};

export default ModalWrapper;
