import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, Tag, CreditCard, Sparkles, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'STAFF_PAYROLL', label: 'Staff Salary & Wages' },
  { value: 'INVENTORY_PURCHASE', label: 'Kitchen Ingredients & Food Stock' },
  { value: 'UTILITIES', label: 'Electricity, Gas & Water Bills' },
  { value: 'OPERATIONAL_OVERHEAD', label: 'Restaurant Maintenance & Cleaning' },
  { value: 'MARKETING', label: 'Marketing & Advertising' },
  { value: 'EQUIPMENT', label: 'Kitchen Tools & Tableware' },
  { value: 'OTHER', label: 'Other Miscellaneous Expense' }
];

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash Payment' },
  { value: 'ONLINE', label: 'Credit Card / Online' },
  { value: 'DIRECT_DEBIT', label: 'Automatic Bank Debit' }
];

export const ExpenseModal = ({ isOpen, onClose, onSave, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'STAFF_PAYROLL',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'BANK_TRANSFER',
    description: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a description or purpose for this expense';
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount in LKR';
    }
    if (!formData.expense_date) {
      newErrors.expense_date = 'Please pick a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 15, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#111827',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 158, 11, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(17, 24, 39, 0) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                Add New Expense or Salary
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Record money spent to calculate accurate take-home profit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close expense modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Expense Name / Description *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Chef Monthly Salary, Fresh Fish Purchase, Gas Cylinder"
              className="luxury-input"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: errors.title ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            {errors.title && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.title}</span>}
          </div>

          {/* Amount & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Amount Paid (LKR) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: '700' }}>
                  LKR
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="luxury-input"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 3rem',
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: errors.amount ? '1px solid #EF4444' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>
              {errors.amount && <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.amount}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Expense Type
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="luxury-input"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ backgroundColor: '#1F2937' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Date Paid *
              </label>
              <input
                type="date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="luxury-input"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                How Was It Paid?
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="luxury-input"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value} style={{ backgroundColor: '#1F2937' }}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Notes / Receipt Details (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Paid to seafood supplier in Negombo, Bill #482"
              className="luxury-input"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(245, 158, 11, 0.15)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
              style={{
                padding: '0.6rem 1.15rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.4rem',
                fontSize: '0.85rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B45309 100%)',
                color: '#111827',
                fontWeight: '700',
                border: 'none'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
