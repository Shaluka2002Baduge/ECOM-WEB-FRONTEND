import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Lock,
  UserCheck,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Utensils,
  ChevronDown
} from 'lucide-react';
import Button from '../common/Button';
import StaffModal from './StaffModal';
import staffService from '../../services/staffService';

/**
 * Role-Based Access Control (RBAC) & Staff Team Registry
 * Full functional database management for staff clearance, station assignments, and shift scheduling.
 */
export const StaffManagement = ({ onNotify }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'MANAGER' | 'KITCHEN_STAFF' | 'WAITER'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Load staff records from backend
  const loadStaff = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await staffService.getStaff();
      const list = response?.data || [];
      setStaffMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading staff list:', err);
      setError(err.message || 'Unable to connect to staff registry.');
      // Fallback sample data if server disconnected
      if (staffMembers.length === 0) {
        setStaffMembers([
          { id: '1', name: 'Duminda Alwis', email: 'admin@ralahami.lk', role: 'ADMIN', department: 'Executive Management', status: 'Active Shift', phone: '+94771234567' },
          { id: '2', name: 'Nimalka Perera', email: 'kitchen@ralahami.lk', role: 'KITCHEN_STAFF', department: 'Hot Line & Curry Station', status: 'Active Shift', phone: '+94773456789' },
          { id: '3', name: 'Kasun Bandara', email: 'manager@ralahami.lk', role: 'MANAGER', department: 'Dining Hall & Reservations', status: 'Active Shift', phone: '+94772345678' }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  // Filtered staff based on search and role
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const role = (staff.role || '').toUpperCase();
      if (roleFilter !== 'ALL' && role !== roleFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (staff.name || staff.display_name || '').toLowerCase();
        const email = (staff.email || '').toLowerCase();
        const dept = (staff.department || '').toLowerCase();
        const phone = (staff.phone || '').toLowerCase();

        return name.includes(q) || email.includes(q) || dept.includes(q) || phone.includes(q) || role.includes(q);
      }

      return true;
    });
  }, [staffMembers, roleFilter, searchQuery]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = staffMembers.length;
    const active = staffMembers.filter((s) => (s.status || s.shift_status) === 'Active Shift').length;
    const offDuty = staffMembers.filter((s) => (s.status || s.shift_status) === 'Off Duty').length;
    const kitchen = staffMembers.filter((s) => s.role === 'KITCHEN_STAFF').length;

    return { total, active, offDuty, kitchen };
  }, [staffMembers]);

  const handleOpenModal = (staff = null) => {
    setSelectedStaff(staff ? { ...staff } : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  // Create or Update Staff via Modal
  const handleSaveStaff = async (savedData, id) => {
    try {
      if (id) {
        // Update existing staff
        const response = await staffService.updateStaff(id, savedData);
        const updated = response?.data;
        setStaffMembers((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
        );
        if (typeof onNotify === 'function') {
          onNotify({
            type: 'success',
            title: 'Staff Clearance Updated',
            message: `${savedData.name || 'Staff member'} records successfully synchronized.`
          });
        }
      } else {
        // Create new staff
        const response = await staffService.createStaff(savedData);
        const created = response?.data;
        setStaffMembers((prev) => [created, ...prev]);
        if (typeof onNotify === 'function') {
          onNotify({
            type: 'success',
            title: 'Staff Privileges Granted',
            message: `${savedData.name || 'Staff member'} registered with role ${savedData.role}.`
          });
        }
      }
      loadStaff();
    } catch (err) {
      console.error('Error saving staff:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Operation Failed',
          message: err.message || 'Could not save staff credentials.'
        });
      }
      throw err;
    }
  };

  // Direct Role Selector Sync
  const handleUpdateStaffRole = async (staffId, newRole) => {
    try {
      const response = await staffService.updateRole(staffId, newRole);
      const updated = response?.data;
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, role: newRole, ...updated } : s))
      );
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'success',
          title: 'Security Role Modified',
          message: `Staff clearance set to ${newRole}.`
        });
      }
    } catch (err) {
      console.error('Error updating role:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Role Update Failed',
          message: err.message || 'Could not change staff security role.'
        });
      }
    }
  };

  // Toggle Shift Status
  const handleToggleShiftStatus = async (staff) => {
    const currentStatus = staff.status || staff.shift_status || 'Active Shift';
    const nextStatus = currentStatus === 'Active Shift' ? 'Off Duty' : 'Active Shift';

    try {
      const response = await staffService.updateStaff(staff.id, { shiftStatus: nextStatus });
      const updated = response?.data;
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, status: nextStatus, shift_status: nextStatus, ...updated } : s))
      );
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'info',
          title: 'Shift Status Updated',
          message: `${staff.name || staff.display_name} is now marked as ${nextStatus}.`
        });
      }
    } catch (err) {
      console.error('Error toggling shift status:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Status Toggle Failed',
          message: err.message || 'Could not update shift status.'
        });
      }
    }
  };

  // Delete Staff Member
  const handleDeleteStaff = async (staff) => {
    const staffName = staff.name || staff.display_name || 'this member';
    if (!window.confirm(`Are you sure you want to permanently revoke RBAC credentials for "${staffName}"?`)) {
      return;
    }

    try {
      await staffService.deleteStaff(staff.id);
      setStaffMembers((prev) => prev.filter((s) => s.id !== staff.id));
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'info',
          title: 'Credentials Revoked',
          message: `${staffName} has been removed from the staff team registry.`
        });
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'error',
          title: 'Delete Failed',
          message: err.message || 'Could not remove staff account.'
        });
      }
    }
  };

  const getRoleBadge = (role) => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN') {
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
    }
    if (r === 'MANAGER') {
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
    }
    if (r === 'KITCHEN_STAFF') {
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' };
    }
    return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.3)' };
  };

  return (
    <section aria-label="Staff and Role Management" className="fade-in" style={{ padding: '0.5rem 0' }}>
      {/* 1. Header & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Staff & Role Clearance (RBAC Registry)
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage staff security clearance levels for Kitchen Prep Displays, Tables, and Operational Back-office.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadStaff} 
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Button variant="primary" size="sm" onClick={() => handleOpenModal(null)}>
            <Plus size={16} style={{ marginRight: '0.4rem' }} />
            Assign Staff Privileges
          </Button>
        </div>
      </div>

      {/* 2. Metrics Counter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Staff Roster</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.25rem 0 0 0' }}>{stats.total}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active on Shift</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10B981', margin: '0.25rem 0 0 0' }}>{stats.active}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Off Duty / Leave</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--accent-amber)', margin: '0.25rem 0 0 0' }}>{stats.offDuty}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '0.8rem', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kitchen Brigade</span>
          <p style={{ fontSize: '1.75rem', fontWeight: '800', color: '#60A5FA', margin: '0.25rem 0 0 0' }}>{stats.kitchen}</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
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
        {/* Role Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Staff (${stats.total})` },
            { id: 'ADMIN', label: 'Admins' },
            { id: 'MANAGER', label: 'Managers' },
            { id: 'KITCHEN_STAFF', label: `Kitchen (${stats.kitchen})` },
            { id: 'WAITER', label: 'Waiters' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: roleFilter === tab.id ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: roleFilter === tab.id ? '#000000' : 'var(--text-secondary)',
                border: roleFilter === tab.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search staff, station, email..."
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

      {/* 4. Staff Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--accent-gold)' }} />
            <p>Loading staff security roster from database...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={36} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-gold)', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Staff Members Found</h3>
            <p style={{ fontSize: '0.9rem' }}>
              {searchQuery ? 'No records match your search criteria.' : 'No staff accounts currently match this security role.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
                <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Member</th>
                <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Station / Department</th>
                <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Role & Clearance</th>
                <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shift Status</th>
                <th style={{ padding: '0.85rem 0.75rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => {
                const staffName = staff.name || staff.display_name || 'Staff Member';
                const staffShift = staff.status || staff.shift_status || 'Active Shift';
                const roleColors = getRoleBadge(staff.role);

                return (
                  <tr key={staff.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)', transition: 'background-color 0.15s ease' }}>
                    {/* Team Member Column */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>{staffName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{staff.email}</span>
                      {staff.phone && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', display: 'block', marginTop: '0.15rem' }}>
                          {staff.phone}
                        </span>
                      )}
                    </td>

                    {/* Department / Station Column */}
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <span 
                        style={{
                          display: 'inline-block',
                          backgroundColor: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {staff.department || 'General Operations'}
                      </span>
                    </td>

                    {/* Security Role Selector */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <select
                        value={staff.role}
                        onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)}
                        style={{
                          backgroundColor: roleColors.bg,
                          color: roleColors.text,
                          border: `1px solid ${roleColors.border}`,
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="ADMIN" style={{ backgroundColor: '#111827', color: '#EF4444' }}>ADMIN (Full Clearance)</option>
                        <option value="MANAGER" style={{ backgroundColor: '#111827', color: '#F59E0B' }}>MANAGER (Operations)</option>
                        <option value="KITCHEN_STAFF" style={{ backgroundColor: '#111827', color: '#10B981' }}>KITCHEN_STAFF (Prep KDS)</option>
                        <option value="WAITER" style={{ backgroundColor: '#111827', color: '#60A5FA' }}>WAITER (Floor Dispatch)</option>
                      </select>
                    </td>

                    {/* Shift Status Button */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleShiftStatus(staff)}
                        title="Click to toggle Shift Status"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: staffShift === 'Active Shift' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: staffShift === 'Active Shift' ? '#10B981' : 'var(--accent-amber)',
                          border: staffShift === 'Active Shift' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                        }}
                      >
                        <span 
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: staffShift === 'Active Shift' ? '#10B981' : '#F59E0B'
                          }} 
                        />
                        {staffShift}
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(staff)}
                          title="Edit staff details and department"
                        >
                          <Edit3 size={14} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStaff(staff)}
                          title="Revoke staff account"
                          style={{ color: 'var(--accent-danger)' }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. Add / Edit Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staff={selectedStaff}
        onSaved={handleSaveStaff}
      />
    </section>
  );
};

export default StaffManagement;
