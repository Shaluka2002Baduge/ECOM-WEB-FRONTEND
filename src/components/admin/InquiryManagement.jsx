import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Trash2, 
  Eye, 
  UserCheck, 
  Check, 
  Crown,
  Sparkles
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import InquiryReplyModal from './InquiryReplyModal';
import inquiryService from '../../services/inquiryService';

/**
 * Admin Inquiries Management Component
 * Allows restaurant managers and administrators to view customer messages,
 * filter by status, compose manual replies, and automatically dispatch email responses.
 */
export const InquiryManagement = ({ onNotify }) => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'REPLIED' | 'RESOLVED'

  const [selectedInquiryForReply, setSelectedInquiryForReply] = useState(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Load inquiries from backend
  const loadInquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inquiryService.getAdminInquiries();
      const list = response?.data || [];
      setInquiries(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setError(err.message || 'Unable to fetch customer inquiries.');
      // Fallback sample data if backend connection unavailable
      if (inquiries.length === 0) {
        setInquiries([
          {
            id: 1,
            full_name: 'Hon. Sanduni Perera',
            email: 'sanduni.perera@example.com',
            phone: '+94 77 123 4567',
            inquiry_type: 'Private Suite & Banqueting',
            message: 'We would like to book the VIP Chieftain Chamber for a family anniversary banquet next Friday evening.',
            status: 'PENDING',
            admin_reply: null,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Filtered inquiries based on active tab and search
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const itemStatus = (item.status || 'PENDING').toUpperCase();

      // Tab filter (Strict mutually exclusive matching: PENDING vs REPLIED vs RESOLVED)
      if (activeTab !== 'ALL' && itemStatus !== activeTab) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (item.full_name || item.fullName || '').toLowerCase();
        const email = (item.email || '').toLowerCase();
        const type = (item.inquiry_type || item.inquiryType || '').toLowerCase();
        const msg = (item.message || '').toLowerCase();
        const reply = (item.admin_reply || item.adminReply || '').toLowerCase();

        return name.includes(q) || email.includes(q) || type.includes(q) || msg.includes(q) || reply.includes(q);
      }

      return true;
    });
  }, [inquiries, activeTab, searchQuery]);

  // Statistics calculation (Strict mutually exclusive counts)
  const stats = useMemo(() => {
    const total = inquiries.length;
    const pending = inquiries.filter((i) => (i.status || '').toUpperCase() === 'PENDING').length;
    const replied = inquiries.filter((i) => (i.status || '').toUpperCase() === 'REPLIED').length;
    const resolved = inquiries.filter((i) => (i.status || '').toUpperCase() === 'RESOLVED').length;

    return { total, pending, replied, resolved };
  }, [inquiries]);

  // Open Reply Modal
  const handleOpenReplyModal = (inquiry) => {
    setSelectedInquiryForReply(inquiry);
    setIsReplyModalOpen(true);
  };

  // Close Reply Modal
  const handleCloseReplyModal = () => {
    setSelectedInquiryForReply(null);
    setIsReplyModalOpen(false);
  };

  // Handle Send Reply & Dispatch Email
  const handleSendReply = async (inquiryId, replyData) => {
    try {
      const response = await inquiryService.replyToInquiry(inquiryId, replyData);
      const updated = response?.data;

      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiryId ? { ...item, ...updated } : item))
      );

      if (typeof onNotify === 'function') {
        onNotify({
          type: 'success',
          title: 'Royal Reply Dispatched',
          message: `Response saved and email notification sent to ${updated?.email || 'customer'}.`
        });
      }

      // Reload fresh list
      loadInquiries();
    } catch (err) {
      console.error('Error sending reply:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Reply Failed',
          message: err.message || 'Could not dispatch reply email.'
        });
      }
      throw err;
    }
  };

  // Quick mark status as RESOLVED
  const handleQuickResolve = async (inquiry) => {
    try {
      const response = await inquiryService.replyToInquiry(inquiry.id, {
        adminReply: inquiry.admin_reply || 'Inquiry marked as resolved by Palace Concierge.',
        status: 'RESOLVED'
      });

      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, status: 'RESOLVED' } : item))
      );

      if (typeof onNotify === 'function') {
        onNotify({
          type: 'info',
          title: 'Inquiry Resolved',
          message: `Inquiry #${inquiry.id} marked as resolved.`
        });
      }

      // Reload fresh list from backend
      loadInquiries();
    } catch (err) {
      console.error('Error resolving inquiry:', err);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (inquiry) => {
    if (!window.confirm(`Are you sure you want to remove the inquiry record from "${inquiry.full_name || 'Customer'}"?`)) {
      return;
    }

    try {
      await inquiryService.deleteInquiry(inquiry.id);
      setInquiries((prev) => prev.filter((item) => item.id !== inquiry.id));

      if (typeof onNotify === 'function') {
        onNotify({
          type: 'info',
          title: 'Inquiry Removed',
          message: `Inquiry #${inquiry.id} has been deleted.`
        });
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Delete Failed',
          message: err.message || 'Could not delete inquiry.'
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'REPLIED') {
      return (
        <span 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle2 size={13} />
          REPLIED
        </span>
      );
    }
    if (s === 'RESOLVED') {
      return (
        <span 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}
        >
          <UserCheck size={13} />
          RESOLVED
        </span>
      );
    }
    return (
      <span 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: 'var(--accent-amber)',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <Clock size={13} />
        PENDING
      </span>
    );
  };

  return (
    <div className="inquiry-management" style={{ padding: '0.5rem 0' }}>
      {/* 1. Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Palace Inquiries & Concierge Desk
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Manage patron messages, VIP banquet requests, and dispatch email replies directly to guests.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadInquiries} 
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh List
        </Button>
      </div>

      {/* 2. Metrics Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inquiries</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0 0 0' }}>{stats.total}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-amber)', margin: '0.25rem 0 0 0' }}>{stats.pending}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Handled & Replied</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981', margin: '0.25rem 0 0 0' }}>{stats.replied}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#60A5FA', margin: '0.25rem 0 0 0' }}>{stats.resolved}</p>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
          marginBottom: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All (${stats.total})` },
            { id: 'PENDING', label: `Pending (${stats.pending})` },
            { id: 'REPLIED', label: `Replied (${stats.replied})` },
            { id: 'RESOLVED', label: `Resolved (${stats.resolved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: activeTab === tab.id ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: activeTab === tab.id ? '#000000' : 'var(--text-secondary)',
                border: activeTab === tab.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search inquiries, patrons, emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.85rem 0.5rem 2.25rem',
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* 4. Inquiries List View */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--accent-gold)' }} />
          <p>Loading royal patron inquiries from database...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <MessageSquare size={36} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-gold)', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Inquiries Found</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchQuery ? 'No inquiries matched your search criteria.' : 'All incoming customer messages and banquet requests have been addressed.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredInquiries.map((inquiry) => {
            const customerName = inquiry.full_name || inquiry.fullName || 'Valued Guest';
            const inquirySubject = inquiry.inquiry_type || inquiry.inquiryType || 'General Inquiry';
            const submittedDate = inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : 'Recent';

            return (
              <div 
                key={inquiry.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  border: inquiry.status?.toUpperCase() === 'PENDING' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Top Row: Patron info & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        {customerName}
                      </span>
                      {getStatusBadge(inquiry.status)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        #{inquiry.id} • {submittedDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} style={{ color: 'var(--accent-gold)' }} />
                        <a href={`mailto:${inquiry.email}`} style={{ color: 'var(--accent-amber)', textDecoration: 'none' }}>
                          {inquiry.email}
                        </a>
                      </span>

                      {inquiry.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} style={{ color: 'var(--accent-gold)' }} />
                          <a href={`tel:${inquiry.phone}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            {inquiry.phone}
                          </a>
                        </span>
                      )}

                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {inquirySubject}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      variant="gold" 
                      size="sm" 
                      onClick={() => handleOpenReplyModal(inquiry)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Send size={13} />
                      {inquiry.admin_reply ? 'Update Reply & Email' : 'Reply & Email'}
                    </Button>

                    {inquiry.status?.toUpperCase() !== 'RESOLVED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleQuickResolve(inquiry)}
                        title="Mark as Resolved"
                      >
                        <Check size={14} />
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteInquiry(inquiry)}
                      title="Delete inquiry record"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Message Content */}
                <div 
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '3px solid var(--accent-gold)'
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    "{inquiry.message}"
                  </p>
                </div>

                {/* Admin Reply Thread (If exists) */}
                {inquiry.admin_reply && (
                  <div 
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={13} />
                        Dispatched Royal Response {inquiry.replied_by ? `(by ${inquiry.replied_by})` : ''}:
                      </span>
                      {inquiry.replied_at && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(inquiry.replied_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#E5E7EB', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {inquiry.admin_reply}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Reply Modal */}
      <InquiryReplyModal 
        inquiry={selectedInquiryForReply}
        isOpen={isReplyModalOpen}
        onClose={handleCloseReplyModal}
        onSendReply={handleSendReply}
      />
    </div>
  );
};

export default InquiryManagement;
