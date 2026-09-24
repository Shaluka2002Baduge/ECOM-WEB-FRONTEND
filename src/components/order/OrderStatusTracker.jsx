import React from 'react';

/**
 * Accessible OrderStatusTracker Component
 * Visual and ARIA-compliant milestone tracker for food preparation and delivery
 */
export const OrderStatusTracker = ({ currentStep = 2, estimatedMinutes = 25 }) => {
  const steps = [
    { title: 'Order Placed', desc: 'Received & routed to royal kitchen' },
    { title: 'Kitchen Confirmed', desc: 'Head chef assigned ingredients' },
    { title: 'Cooking & Simmering', desc: 'Claypot slow cooking in progress' },
    { title: 'Out for Delivery', desc: 'Dispatched in insulated warmth' },
    { title: 'Delivered', desc: 'Enjoy your royal feast' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
            Live Preparation Progress
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Estimated completion in ~{estimatedMinutes} minutes
          </p>
        </div>
        <div className="badge badge-emerald">
          ● Live Kitchen Feed Active
        </div>
      </div>

      {/* Accessible Stepper */}
      <ol
        aria-label="Order lifecycle milestones"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          position: 'relative'
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li
              key={step.title}
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                paddingLeft: '0.5rem'
              }}
            >
              {/* Step indicator node */}
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  marginBottom: '0.75rem',
                  backgroundColor: isCompleted
                    ? 'var(--accent-emerald)'
                    : isCurrent
                    ? 'var(--accent-gold)'
                    : 'var(--bg-secondary)',
                  color: isCompleted || isCurrent ? '#0B0D11' : 'var(--text-muted)',
                  border: isCurrent
                    ? '3px solid var(--accent-gold)'
                    : '1px solid var(--border-medium)',
                  boxShadow: isCurrent ? 'var(--shadow-glow)' : 'none',
                  transition: 'all var(--transition-normal)'
                }}
                aria-hidden="true"
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step labels */}
              <span
                style={{
                  fontWeight: isCurrent ? '700' : '600',
                  fontSize: '0.95rem',
                  color: isCurrent ? 'var(--accent-gold)' : isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                  marginBottom: '0.2rem'
                }}
              >
                {step.title}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {step.desc}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderStatusTracker;
