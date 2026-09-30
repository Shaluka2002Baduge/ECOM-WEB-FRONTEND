import React from 'react';
import { ShoppingBag, ChefHat, Truck, CheckCircle2, Flame, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';

/**
 * Maps order status and fulfillment type to stepper configuration
 */
export const getStepperConfig = (fulfillmentType = 'Delivery', status = 'PENDING', overrideStep = null) => {
  const normType = String(fulfillmentType || '').toLowerCase().replace(/[-_ ]/g, '');
  let normStatus = String(status || '').toUpperCase().trim().replace(/[\s-]+/g, '_');
  normStatus = normStatus.replace(/^\d+[\._\s]+/, ''); // Strip leading step numbers e.g. "4._"

  // Normalize common aliases and typos
  if (normStatus === 'OUT_OF_DELIVERY' || normStatus === 'OUT_DELIVERY' || normStatus === 'OUT_FOR_DELIVERY') {
    normStatus = 'OUT_FOR_DELIVERY';
  } else if (normStatus.includes('OUT') || (normStatus.includes('DELIVER') && !normStatus.includes('DELIVERED'))) {
    normStatus = 'OUT_FOR_DELIVERY';
  }
  const isDineIn = normType.includes('dine');
  const isTakeaway = !isDineIn && (normType.includes('takeaway') || normType.includes('pickup'));

  // 1. DINE-IN (Strict 3-Stage Pipeline: Placed -> Preparing -> Served)
  if (isDineIn) {
    const steps = [
      {
        title: 'Order Placed',
        desc: 'Reservation & feast placed successfully',
        icon: UtensilsCrossed,
        key: 'PENDING'
      },
      {
        title: 'Preparing',
        desc: 'Claypot slow cooking / chef preparing your feast',
        icon: Flame,
        key: 'PREPARING'
      },
      {
        title: 'Served',
        desc: 'Served hot at your reserved table - Enjoy your royal feast!',
        icon: CheckCircle2,
        key: 'SERVED'
      }
    ];

    let activeStep = 0;
    let isFullyCompleted = false;

    if (overrideStep !== null && overrideStep !== undefined) {
      activeStep = Math.min(overrideStep, steps.length - 1);
    } else {
      if (normStatus === 'PENDING' || normStatus === 'CONFIRMED' || normStatus === 'PLACED') {
        activeStep = 0;
      } else if (
        normStatus === 'PREPARING' ||
        normStatus === 'COOKING' ||
        normStatus === 'IN_PREPARATION'
      ) {
        activeStep = 1;
      } else if (
        normStatus === 'SERVED' ||
        normStatus === 'COMPLETED' ||
        normStatus === 'DELIVERED'
      ) {
        activeStep = 2;
        isFullyCompleted = true;
      }
    }

    return {
      type: 'Dine-In',
      isDineIn: true,
      isTakeaway: false,
      isDelivery: false,
      steps,
      activeStep,
      isFullyCompleted
    };
  }

  // 2. TAKEAWAY (Strict 3-Stage Pipeline: Placed -> Preparing -> Ready for Pickup)
  if (isTakeaway) {
    const steps = [
      {
        title: 'Order Placed',
        desc: 'Received by royal kitchen',
        icon: ShoppingBag,
        key: 'PENDING'
      },
      {
        title: 'Preparing',
        desc: 'Simmering & packing your feast',
        icon: Flame,
        key: 'PREPARING'
      },
      {
        title: 'Ready for Pickup / Completed',
        desc: 'Your feast is boxed and ready at our royal counter',
        icon: CheckCircle2,
        key: 'READY_FOR_PICKUP'
      }
    ];

    let activeStep = 0;
    let isFullyCompleted = false;

    if (overrideStep !== null && overrideStep !== undefined) {
      activeStep = Math.min(overrideStep, steps.length - 1);
    } else {
      if (normStatus === 'PENDING' || normStatus === 'PLACED') {
        activeStep = 0;
      } else if (
        normStatus === 'CONFIRMED' ||
        normStatus === 'PREPARING' ||
        normStatus === 'IN_PREPARATION' ||
        normStatus === 'COOKING'
      ) {
        activeStep = 1;
      } else if (normStatus === 'READY_FOR_PICKUP' || normStatus === 'READY') {
        activeStep = 2;
      } else if (normStatus === 'DELIVERED' || normStatus === 'COMPLETED' || normStatus === 'SERVED') {
        activeStep = 2;
        isFullyCompleted = true;
      }
    }

    return {
      type: 'Takeaway',
      isDineIn: false,
      isTakeaway: true,
      isDelivery: false,
      steps,
      activeStep,
      isFullyCompleted
    };
  }

  // 3. HOME DELIVERY (5-Stage Expedition Pipeline)
  const steps = [
    {
      title: 'Order Placed',
      desc: 'Received & routed to royal kitchen',
      icon: ShoppingBag,
      key: 'PENDING'
    },
    {
      title: 'Kitchen Confirmed',
      desc: 'Head chef assigned ingredients',
      icon: ChefHat,
      key: 'CONFIRMED'
    },
    {
      title: 'Cooking & Simmering',
      desc: 'Claypot slow cooking in progress',
      icon: Flame,
      key: 'PREPARING'
    },
    {
      title: 'Out for Delivery',
      desc: 'Dispatched in insulated warmth',
      icon: Truck,
      key: 'OUT_FOR_DELIVERY'
    },
    {
      title: 'Delivered',
      desc: 'Enjoy your royal feast',
      icon: CheckCircle2,
      key: 'DELIVERED'
    }
  ];

  let activeStep = 0;
  let isFullyCompleted = false;

  if (overrideStep !== null && overrideStep !== undefined) {
    activeStep = Math.min(overrideStep, steps.length - 1);
  } else {
    if (normStatus === 'PENDING' || normStatus === 'PLACED') {
      activeStep = 0;
    } else if (normStatus === 'KITCHEN_CONFIRMED' || normStatus === 'CONFIRMED') {
      activeStep = 1;
    } else if (
      normStatus === 'COOKING' ||
      normStatus === 'PREPARING' ||
      normStatus === 'IN_PREPARATION'
    ) {
      activeStep = 2;
    } else if (
      normStatus === 'OUT_FOR_DELIVERY' ||
      normStatus === 'DISPATCHED' ||
      normStatus === 'READY_FOR_PICKUP'
    ) {
      activeStep = 3;
    } else if (
      normStatus === 'DELIVERED' ||
      normStatus === 'COMPLETED' ||
      normStatus === 'SERVED'
    ) {
      activeStep = 4;
      isFullyCompleted = true;
    }
  }

  return {
    type: 'Home Delivery',
    isDineIn: false,
    isTakeaway: false,
    isDelivery: true,
    steps,
    activeStep,
    isFullyCompleted
  };
};

/**
 * Accessible OrderStatusTracker Component
 * Visual and ARIA-compliant milestone tracker supporting Dine-In, Takeaway, and Delivery
 */
export const OrderStatusTracker = ({
  fulfillmentType = 'Delivery',
  status = 'PREPARING',
  currentStep = null,
  estimatedMinutes = 25,
  order = null
}) => {
  const resolvedFulfillment =
    fulfillmentType ||
    order?.fulfillment_type ||
    order?.fulfillmentType ||
    order?.orderType ||
    'Delivery';

  const resolvedStatus = status || order?.status || 'PREPARING';

  const { type, isDineIn, isTakeaway, steps, activeStep, isFullyCompleted } = getStepperConfig(
    resolvedFulfillment,
    resolvedStatus,
    currentStep
  );

  return (
    <div
      className="glass-panel"
      style={{
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid rgba(229, 169, 60, 0.25)',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: 'var(--shadow-lg, 0 12px 36px rgba(0,0,0,0.6))',
        background: 'linear-gradient(180deg, rgba(26, 20, 15, 0.85) 0%, rgba(15, 12, 10, 0.95) 100%)'
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(244, 237, 228, 0.08)',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              className="badge"
              style={{
                background: isDineIn
                  ? 'rgba(212, 175, 55, 0.18)'
                  : isTakeaway
                  ? 'rgba(229, 169, 60, 0.15)'
                  : 'rgba(59, 130, 246, 0.15)',
                color: isDineIn || isTakeaway ? 'var(--accent-gold, #E5A93C)' : '#60A5FA',
                border: `1px solid ${
                  isDineIn || isTakeaway
                    ? 'rgba(229, 169, 60, 0.35)'
                    : 'rgba(59, 130, 246, 0.35)'
                }`,
                padding: '0.25rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {isDineIn ? (
                <UtensilsCrossed size={13} />
              ) : isTakeaway ? (
                <ShoppingBag size={13} />
              ) : (
                <Truck size={13} />
              )}
              {isDineIn
                ? 'Royal Dine-In Experience'
                : isTakeaway
                ? 'Takeaway Pickup Order'
                : 'Home Delivery Expedition'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary, #F4EDE4)', margin: 0, fontWeight: '700' }}>
            {isDineIn
              ? 'Royal Table Preparation & Service'
              : isTakeaway
              ? 'Takeaway Preparation Stepper'
              : 'Live Expedition Progress'}
          </h3>
          <p
            style={{
              fontSize: '0.88rem',
              color: 'var(--text-muted, #A89F91)',
              margin: '0.25rem 0 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Clock size={14} color="var(--accent-gold, #E5A93C)" />
            {isFullyCompleted
              ? isDineIn
                ? 'Feast served hot at your royal table. Bon appétit!'
                : 'Order completed. Savor every royal bite!'
              : `Estimated completion in ~${estimatedMinutes} minutes`}
          </p>
        </div>

        <div
          className="badge"
          style={{
            backgroundColor: isFullyCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.2)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            padding: '0.45rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
              boxShadow: '0 0 8px #10B981',
              animation: isFullyCompleted ? 'none' : 'pulse 1.8s infinite'
            }}
          />
          {isFullyCompleted
            ? isDineIn
              ? 'Table Served'
              : 'Feast Concluded'
            : 'Live Kitchen Feed Active'}
        </div>
      </div>

      {/* Accessible Stepper Container */}
      <ol
        aria-label={`${type} order milestones`}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
          gap: '1.25rem',
          position: 'relative'
        }}
      >
        {steps.map((step, index) => {
          const isStepDone = isFullyCompleted || index < activeStep;
          const isCurrent = !isFullyCompleted && index === activeStep;
          const StepIcon = step.icon;

          return (
            <li
              key={step.title}
              aria-current={isCurrent ? 'step' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                padding: '0 0.5rem'
              }}
            >
              {/* Top Node with Icon / Step Number */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: '1rem',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    width: '2.85rem',
                    height: '2.85rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1rem',
                    backgroundColor: isStepDone
                      ? '#10B981'
                      : isCurrent
                      ? 'var(--accent-gold)'
                      : 'var(--bg-secondary)',
                    color: isStepDone || isCurrent ? '#0B0D11' : 'var(--text-muted)',
                    border: isCurrent
                      ? '3px solid var(--border-focus)'
                      : isStepDone
                      ? '2px solid #10B981'
                      : '1px solid var(--border-medium)',
                    boxShadow: isCurrent
                      ? '0 0 20px rgba(229, 169, 60, 0.6), 0 4px 12px rgba(0,0,0,0.2)'
                      : isStepDone
                      ? '0 0 12px rgba(16, 185, 129, 0.35)'
                      : 'none',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 2,
                    flexShrink: 0
                  }}
                  aria-hidden="true"
                >
                  {isStepDone ? (
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  ) : (
                    <StepIcon size={18} strokeWidth={2.2} />
                  )}
                </div>

                {/* Connecting Line to next step */}
                {index < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '2.85rem',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '3px',
                      backgroundColor:
                        index < activeStep || isFullyCompleted
                          ? '#10B981'
                          : 'var(--border-subtle)',
                      transition: 'background-color 0.4s ease',
                      zIndex: 1
                    }}
                  />
                )}
              </div>

              {/* Step Labels */}
              <div style={{ paddingRight: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: isCurrent
                      ? 'var(--accent-gold, #E5A93C)'
                      : isStepDone
                      ? '#10B981'
                      : 'var(--text-muted, #7A7265)',
                    marginBottom: '0.2rem'
                  }}
                >
                  Step {index + 1}
                </span>

                <h4
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: isCurrent ? '700' : '600',
                    color: isCurrent
                      ? 'var(--accent-gold, #E5A93C)'
                      : isStepDone
                      ? 'var(--text-primary, #F4EDE4)'
                      : 'var(--text-muted, #7A7265)',
                    margin: '0 0 0.3rem 0',
                    lineHeight: '1.3'
                  }}
                >
                  {step.title}
                </h4>

                <p
                  style={{
                    fontSize: '0.8rem',
                    color: isCurrent ? 'var(--text-secondary, #D5CBBF)' : 'var(--text-muted, #7A7265)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderStatusTracker;
