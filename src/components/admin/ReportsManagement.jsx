import React from 'react';
import { TrendingUp, Sparkles, DollarSign, ShoppingBag, Users, Award } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export const ReportsManagement = () => {
  const topDishes = [
    { rank: 1, name: 'Royal Dutch Burgher Lamprais', rev: 'LKR 1,280,000', count: 692, margin: '68%' },
    { rank: 2, name: 'Jaffna Spiced Mud Crab Curry', rev: 'LKR 950,000', count: 250, margin: '62%' },
    { rank: 3, name: 'Slow-Cooked Black Pork Curry', rev: 'LKR 616,000', count: 280, margin: '74%' },
    { rank: 4, name: 'Royal Heritage Watalappan', rev: 'LKR 340,000', count: 400, margin: '81%' }
  ];

  return (
    <section aria-label="Financial and Operations Reports" className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
          Executive Financial Velocity & User Intelligence
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
          Real-time Gross Revenue, AOV, Table Turnover, and Culinary Line Margins.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Revenue (MTD)</span>
            <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
            LKR 4,825,000
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
            ↑ +18.4% vs previous 30 days
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Orders</span>
            <ShoppingBag size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            1,482
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Avg Dine-in ticket: LKR 3,250
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seated Covers Today</span>
            <Users size={18} style={{ color: '#60a5fa' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            214 Guests
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
            94% Capacity Utilization
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Kitchen Margin</span>
            <Award size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            71.8%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Optimal food cost ratio
          </div>
        </div>
      </div>

      {/* Top Dishes Velocity */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Top Grossing Culinary Specialties (Last 30 Days)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rank</th>
              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Signature Dish</th>
              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Units Sold</th>
              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Gross Revenue</th>
              <th style={{ padding: '0.65rem 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {topDishes.map((dish) => (
              <tr key={dish.rank} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.3)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                  #{dish.rank}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {dish.name}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                  {dish.count} orders
                </td>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                  {dish.rev}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                  {dish.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ReportsManagement;
