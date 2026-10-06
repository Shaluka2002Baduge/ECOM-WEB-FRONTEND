import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  Download,
  PlusCircle,
  RefreshCw,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Trash2,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import financialService from '../../services/financialService';
import { generateFinancialPDF } from '../../utils/pdfReportGenerator';
import ExpenseModal from './ExpenseModal';
import { useAuth } from '../../context/AuthContext';

const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Last 7 Days' },
  { id: 'month', label: 'Last 30 Days' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' }
];

export const ReportsManagement = ({ onNotify }) => {
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState('month');
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [error, setError] = useState(null);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Load Financial Data
  const loadFinancialData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = {};
      if (isCustomRange && customStartDate && customEndDate) {
        params.range = 'custom';
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        params.range = selectedRange;
      }

      const data = await financialService.getSummary(params);
      setFinancialData(data);
    } catch (err) {
      console.error('Failed to load financial summary:', err);
      setError(err.response?.data?.message || 'Failed to load financial data from the database.');
      if (onNotify) {
        onNotify('Failed to retrieve financial metrics', 'error');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRange, isCustomRange, customStartDate, customEndDate, onNotify]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  // Handle PDF Export
  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      
      const exportParams = {};
      if (isCustomRange && customStartDate && customEndDate) {
        exportParams.range = 'custom';
        exportParams.startDate = customStartDate;
        exportParams.endDate = customEndDate;
      } else {
        exportParams.range = selectedRange;
      }

      // Fetch tailored report payload for selected timeframe
      const exportData = await financialService.exportReport(exportParams);
      const dataset = exportData?.summary || exportData?.data || financialData;

      if (!dataset) {
        throw new Error('No financial data available to export.');
      }

      const filename = generateFinancialPDF(dataset, user?.email || 'Admin');
      if (onNotify) {
        onNotify(`Financial report downloaded successfully: ${filename}`, 'success');
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      if (onNotify) {
        onNotify(err.message || 'Failed to generate PDF report.', 'error');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Handle Expense Creation
  const handleSaveExpense = async (expenseFormData) => {
    try {
      setIsSubmittingExpense(true);
      await financialService.createExpense(expenseFormData);
      if (onNotify) {
        onNotify(`Expense "${expenseFormData.title}" saved and deducted from net profit!`, 'success');
      }
      setIsExpenseModalOpen(false);
      await loadFinancialData(true);
    } catch (err) {
      console.error('Failed to record expense:', err);
      if (onNotify) {
        onNotify(err.response?.data?.message || 'Failed to record expense.', 'error');
      }
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Handle Expense Deletion
  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete this expense record: "${title}"?`)) {
      return;
    }

    try {
      await financialService.deleteExpense(id);
      if (onNotify) {
        onNotify('Expense record deleted successfully.', 'success');
      }
      await loadFinancialData(true);
    } catch (err) {
      console.error('Failed to delete expense:', err);
      if (onNotify) {
        onNotify(err.response?.data?.message || 'Failed to delete expense.', 'error');
      }
    }
  };

  const kpis = financialData?.kpis || {};
  const expBreakdown = financialData?.expensesBreakdown || {};
  const channels = financialData?.channels || {};
  const topDishes = financialData?.topDishes || [];
  const recentExpenses = financialData?.recentExpenses || [];

  const grossRev = kpis.grossRevenue || 0;
  const netProfit = kpis.netProfit || 0;
  const isNetProfitPositive = netProfit >= 0;

  const formatCategoryBadge = (cat) => {
    switch (cat) {
      case 'STAFF_PAYROLL': return 'Staff Salary';
      case 'INVENTORY_PURCHASE': return 'Ingredients & Stock';
      case 'UTILITIES': return 'Electricity & Gas';
      case 'OPERATIONAL_OVERHEAD': return 'Maintenance & Supplies';
      case 'MARKETING': return 'Advertising';
      default: return (cat || 'Other').replace(/_/g, ' ');
    }
  };

  return (
    <section aria-label="Restaurant Financial & Reports" className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* 1. Header & Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>
            Financial Overview & Reports
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Track total sales, staff salaries, kitchen expenses, and net profit in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => loadFinancialData(true)}
            disabled={isRefreshing || loading}
            title="Refresh latest financial data"
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 0.9rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--accent-gold)'
            }}
          >
            <PlusCircle size={15} />
            Add Expense / Salary
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF || loading || !financialData}
            className="btn btn-primary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-gold) 0%, #B45309 100%)',
              color: '#111827',
              border: 'none',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
            }}
          >
            <Download size={15} />
            {isExportingPDF ? 'Preparing PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {/* 2. Simple Period Filter */}
      <div
        className="glass-panel"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem', fontWeight: '600' }}>
            Time Period:
          </span>
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period.id}
              onClick={() => {
                setIsCustomRange(false);
                setSelectedRange(period.id);
              }}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: selectedRange === period.id && !isCustomRange ? '700' : '500',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor:
                  selectedRange === period.id && !isCustomRange
                    ? 'var(--accent-gold)'
                    : 'rgba(31, 41, 55, 0.6)',
                color: selectedRange === period.id && !isCustomRange ? '#111827' : 'var(--text-secondary)'
              }}
            >
              {period.label}
            </button>
          ))}

          <button
            onClick={() => {
              const nextState = !isCustomRange;
              setIsCustomRange(nextState);
              if (nextState && !customStartDate && !customEndDate) {
                // Initialize with sensible default: 1st of current month to today
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const today = now.toISOString().split('T')[0];
                setCustomStartDate(firstDay);
                setCustomEndDate(today);
              }
            }}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: isCustomRange ? '700' : '500',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isCustomRange ? 'var(--accent-gold)' : 'rgba(31, 41, 55, 0.6)',
              color: isCustomRange ? '#111827' : 'var(--text-secondary)'
            }}
          >
            Custom Range Picker
          </button>
        </div>

        {/* Custom Date Pickers */}
        {isCustomRange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="luxury-input"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                colorScheme: 'dark'
              }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="luxury-input"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(17, 24, 39, 0.8)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                colorScheme: 'dark'
              }}
            />
            <button
              onClick={() => loadFinancialData(true)}
              disabled={isRefreshing || loading || !customStartDate || !customEndDate}
              className="btn btn-secondary"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: '700',
                borderRadius: '6px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              Apply Custom Range
            </button>
          </div>
        )}

        {financialData?.period?.label && (
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} />
            Showing: <strong>{financialData.period.label}</strong>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#EF4444',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Four Core Financial Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Card 1: Total Sales (Earnings) */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Sales (Earnings)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '-0.02em' }}>
            {kpis.grossRevenueFormatted || `LKR ${(grossRev).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpRight size={14} />
            <span>{kpis.totalOrders || 0} total orders received</span>
          </div>
        </div>

        {/* Card 2: Total Spending (Expenses) */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Expenses (Spent)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: 'var(--accent-gold)' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {expBreakdown.totalOperationalCostFormatted || `LKR ${(expBreakdown.totalOperationalCost || 0).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Salaries, ingredients, utilities & maintenance
          </div>
        </div>

        {/* Card 3: Net Profit (Take Home) */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Net Profit (Take Home)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: isNetProfitPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} style={{ color: isNetProfitPositive ? '#10B981' : '#EF4444' }} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: isNetProfitPositive ? 'var(--accent-emerald)' : '#EF4444',
              letterSpacing: '-0.02em'
            }}
          >
            {kpis.netProfitFormatted || `LKR ${(netProfit).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Sales minus all expenses and salaries
          </div>
        </div>

        {/* Card 4: Average Sale Per Order */}
        <div className="glass-panel" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Avg Sale Per Order
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} style={{ color: '#60a5fa' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {kpis.averageOrderValueFormatted || `LKR ${(kpis.averageOrderValue || 0).toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Food Profit Margin: <strong style={{ color: 'var(--accent-emerald)' }}>{kpis.grossKitchenMargin || '71.5%'}</strong>
          </div>
        </div>
      </div>

      {/* 4. Simple Breakdowns: Sales by Order Type vs Expense Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Box 1: Sales by Order Type */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} style={{ color: 'var(--accent-gold)' }} />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              Sales by Order Type
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Dine-In */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>🍽️ Dine-In (Table Dining)</span>
                <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>
                  {channels.dineIn?.formatted || 'LKR 0'} ({channels.dineIn?.count || 0} orders)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--accent-gold)',
                    width: `${grossRev > 0 ? Math.min(100, (((channels.dineIn?.revenue || 0) / grossRev) * 100)) : 0}%`,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>

            {/* Takeaway */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>🛍️ Takeaway (Pickups)</span>
                <span style={{ color: '#60a5fa', fontWeight: '700' }}>
                  {channels.takeaway?.formatted || 'LKR 0'} ({channels.takeaway?.count || 0} orders)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#60a5fa',
                    width: `${grossRev > 0 ? Math.min(100, (((channels.takeaway?.revenue || 0) / grossRev) * 100)) : 0}%`,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>

            {/* Home Delivery */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>🚀 Home Delivery</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>
                  {channels.delivery?.formatted || 'LKR 0'} ({channels.delivery?.count || 0} orders)
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: 'var(--accent-emerald)',
                    width: `${grossRev > 0 ? Math.min(100, (((channels.delivery?.revenue || 0) / grossRev) * 100)) : 0}%`,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Expense Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} style={{ color: '#F59E0B' }} />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              Where the Money Went (Expenses)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>👨‍🍳 Staff Salaries & Wages:</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {expBreakdown.staffSalariesFormatted || 'LKR 0'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🌾 Ingredients & Kitchen Stock:</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {expBreakdown.inventoryPurchasesFormatted || 'LKR 0'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>⚡ Electricity & Cooking Gas:</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {expBreakdown.utilitiesFormatted || 'LKR 0'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🏛️ Maintenance & Other Costs:</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {expBreakdown.operationalOverheadFormatted || 'LKR 0'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Best Selling Dishes Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              Popular & Best Selling Dishes
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              Ranked by total sales revenue from customer orders.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '0.3rem 0.65rem', borderRadius: '9999px', fontWeight: '700' }}>
            Live Sales
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rank</th>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Dish Name</th>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Orders Sold</th>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Sales</th>
                <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Profit Margin</th>
              </tr>
            </thead>
            <tbody>
              {topDishes.map((dish) => (
                <tr key={dish.rank} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.35)', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                    #{dish.rank}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {dish.name}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {dish.category}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    {dish.count} orders
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                    {dish.rev}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--accent-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      {dish.margin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Recent Expenses & Salaries Paid Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              Expenses & Salaries Log
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
              List of recent salary payments, food purchases, bills, and maintenance costs.
            </p>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn btn-secondary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderRadius: '6px',
              color: 'var(--accent-gold)'
            }}
          >
            <PlusCircle size={14} />
            Add Expense Record
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No expenses recorded yet. Click "Add Expense / Salary" to log spending.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Expense Description</th>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Paid Via</th>
                  <th style={{ padding: '0.75rem 0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.35)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {exp.expense_date ? new Date(exp.expense_date).toISOString().split('T')[0] : 'Recent'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{exp.title}</div>
                      {exp.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{exp.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: exp.category === 'STAFF_PAYROLL' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: exp.category === 'STAFF_PAYROLL' ? '#60a5fa' : 'var(--accent-amber)'
                        }}
                      >
                        {formatCategoryBadge(exp.category)}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      LKR {parseFloat(exp.amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {(exp.payment_method || 'BANK').replace(/_/g, ' ')}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        title="Delete expense"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          borderRadius: '6px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        isSubmitting={isSubmittingExpense}
      />
    </section>
  );
};

export default ReportsManagement;
