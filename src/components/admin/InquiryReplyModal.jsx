import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  Phone, 
  Calendar, 
  Sparkles, 
  Crown, 
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '../common/Button';

/**
 * Inquiry Reply Modal
 * Allows administrators to compose customized responses to customer inquiries
 * and triggers automated Nodemailer email notifications.
 */
const InquiryReplyModal = ({ inquiry, isOpen, onClose, onSendReply }) => {
  const [adminReply, setAdminReply] = useState(inquiry?.admin_reply || inquiry?.adminReply || '');
  const [status, setStatus] = useState(inquiry?.status || 'REPLIED');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when active inquiry prop changes
  useEffect(() => {
    if (inquiry) {
      setAdminReply(inquiry.admin_reply || inquiry.adminReply || '');
      setStatus(inquiry.status || 'REPLIED');
      setErrorMsg('');
    }
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const handleTemplateSelect = (templateText) => {
    setAdminReply(templateText);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminReply.trim()) {
      setErrorMsg('Please enter a response message to dispatch to the customer.');
      return;
    }

    setIsSending(true);
    setErrorMsg('');
    try {
      await onSendReply(inquiry.id, {
        adminReply: adminReply.trim(),
        status: status || 'REPLIED'
      });
      setIsSending(false);
      onClose();
    } catch (err) {
      setIsSending(false);
      setErrorMsg(err.message || 'Failed to dispatch email response. Please check server logs.');
    }
  };

  const customerName = inquiry.full_name || inquiry.name || inquiry.fullName || 'Valued Guest';
  const customerEmail = inquiry.email;
  const customerPhone = inquiry.phone;
  const inquirySubject = inquiry.inquiry_type || inquiry.subject || 'General Inquiry';
  const originalMessage = inquiry.message || '';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Crown size={20} style={{ color: 'var(--accent-gold)' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                Palace Concierge Reply
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Ref #{inquiry.id} • {inquirySubject}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Customer Information Card */}
        <div 
          style={{
            backgroundColor: 'rgba(212, 175, 55, 0.06)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patron Name</span>
              <p style={{ margin: '0.1rem 0 0 0', fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                {customerName}
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Email</span>
              <p style={{ margin: '0.1rem 0 0 0', color: 'var(--accent-amber)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} />
                {customerEmail}
              </p>
            </div>

            {customerPhone && (
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone / WhatsApp</span>
                <p style={{ margin: '0.1rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} />
                  {customerPhone}
                </p>
              </div>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Original Inquiry Message</span>
            <p style={{ margin: '0.25rem 0 0 0', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              "{originalMessage}"
            </p>
          </div>
        </div>

        {/* Quick Response Templates */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>
            Quick Concierge Templates:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleTemplateSelect(`Ayubowan ${customerName}, thank you for contacting Raalahami Restaurant. We have reviewed your reservation inquiry and are delighted to confirm that seating is available for your preferred date. Our maître d' will contact you directly to finalize your seating preferences.`)}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--accent-gold)',
                cursor: 'pointer'
              }}
            >
              + Reservation Seating Confirmed
            </button>

            <button
              type="button"
              onClick={() => handleTemplateSelect(`Ayubowan ${customerName}, regarding your VIP Chieftain Chamber inquiry: our executive culinary team can curate a bespoke 5-course degustation feast tailored to your dietary requirements. Please let us know your preferred banquet timing.`)}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--accent-gold)',
                cursor: 'pointer'
              }}
            >
              + VIP Chamber Degustation
            </button>

            <button
              type="button"
              onClick={() => handleTemplateSelect(`Ayubowan ${customerName}, thank you for your warm feedback and message. We deeply appreciate your patronage and look forward to welcoming you back to our Riverside sanctuary in Ratnapura.`)}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: 'var(--accent-gold)',
                cursor: 'pointer'
              }}
            >
              + Patron Appreciation
            </button>
          </div>
        </div>

        {errorMsg && (
          <div 
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#EF4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Reply Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label 
              htmlFor="modal-admin-reply"
              style={{
                display: 'block',
                marginBottom: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}
            >
              Admin Response Message <span style={{ color: 'var(--accent-amber)' }}>*</span>
            </label>
            <textarea
              id="modal-admin-reply"
              rows={5}
              placeholder="Compose the official palace response that will be emailed directly to the customer..."
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="modal-reply-status" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Set Status:
              </label>
              <select
                id="modal-reply-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="REPLIED">REPLIED (Email Sent)</option>
                <option value="RESOLVED">RESOLVED (Complete)</option>
                <option value="PENDING">PENDING (Keep Pending)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" size="md" disabled={isSending}>
                {isSending ? (
                  'Dispatching Email...'
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: '0.4rem' }} />
                    Send Reply & Email Customer
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InquiryReplyModal;
