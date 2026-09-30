import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';
import Button from '../common/Button';
import StaffModal from './StaffModal';

const INITIAL_STAFF = [
  { id: 'st-1', name: 'Duminda Alwis', email: 'admin@raalahami.lk', role: 'ADMIN', department: 'Executive Management', status: 'Active Shift' },
  { id: 'st-2', name: 'Nimalka Perera', email: 'kitchen@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Hot Line & Curry Station', status: 'Active Shift' },
  { id: 'st-3', name: 'Samantha Jayasinghe', email: 'samantha.chef@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Seafood & Grill Station', status: 'Active Shift' },
  { id: 'st-4', name: 'Kasun Bandara', email: 'kasun.manager@raalahami.lk', role: 'MANAGER', department: 'Dining Hall & Reservations', status: 'Active Shift' },
  { id: 'st-5', name: 'Roshan Silva', email: 'roshan.kitchen@raalahami.lk', role: 'KITCHEN_STAFF', department: 'Hopper & Prep Station', status: 'Off Duty' }
];

export const StaffManagement = ({ onNotify }) => {
  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const handleOpenModal = (staff = null) => {
    try {
      setSelectedStaff(staff ? { ...staff } : null);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error opening staff modal:', err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  const handleSaveStaff = async (savedData, id) => {
    try {
      if (!savedData) return;
      if (id) {
        setStaffMembers((prev) =>
          (prev || []).map((s) => (s?.id === id ? { ...s, ...savedData, id } : s))
        );
        if (typeof onNotify === 'function') {
          onNotify({ type: 'success', title: 'Staff Updated', message: `${savedData.name || 'Staff'} record updated.` });
        }
      } else {
        const newStaff = {
          id: 'st-' + Date.now(),
          status: 'Active Shift',
          ...savedData
        };
        setStaffMembers((prev) => [newStaff, ...(prev || [])]);
        if (typeof onNotify === 'function') {
          onNotify({
            type: 'success',
            title: 'Staff Member Added',
            message: `${savedData.name || 'Staff'} assigned role ${savedData.role} with backend RBAC credentials.`
          });
        }
      }
    } catch (err) {
      console.error('Error saving staff:', err);
      if (typeof onNotify === 'function') {
        onNotify({ type: 'error', title: 'Save Failed', message: 'Could not update staff roster.' });
      }
    }
  };

  const handleUpdateStaffRole = (staffId, newRole) => {
    try {
      if (!staffId) return;
      setStaffMembers((prev) =>
        (prev || []).map((s) => (s?.id === staffId ? { ...s, role: newRole } : s))
      );
      if (typeof onNotify === 'function') {
        onNotify({
          type: 'info',
          title: 'Role Privileges Updated',
          message: 'Staff clearance level modified.'
        });
      }
    } catch (err) {
      console.error('Error updating staff role:', err);
    }
  };

  const handleDeleteStaff = (staff) => {
    try {
      if (!staff?.id) return;
      if (window.confirm(`Are you sure you want to revoke credentials for "${staff.name || 'this member'}"?`)) {
        setStaffMembers((prev) => (prev || []).filter((s) => s?.id !== staff.id));
        if (typeof onNotify === 'function') {
          onNotify({ type: 'info', title: 'Staff Access Revoked', message: `${staff.name || 'Staff'} removed from roster.` });
        }
      }
    } catch (err) {
      console.error('Error removing staff:', err);
    }
  };

  return (
    <section aria-label="Staff and Role Management" className="fade-in">
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
          <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
            Role-Based Access Control (RBAC) & Team Registry
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Manage staff clearance levels for Kitchen Prep Displays, Tables, and Operational Back-office.
          </p>
        </div>

        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          <Plus size={16} style={{ marginRight: '0.4rem' }} />
          Assign Staff Privileges
        </Button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--accent-gold)' }}>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Team Member</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Station / Department</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assigned Security Role</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase' }}>Shift Status</th>
              <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff.id} style={{ borderBottom: '1px solid rgba(42, 48, 66, 0.4)' }}>
                <td style={{ padding: '0.85rem 0.5rem' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{staff.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.email}</span>
                </td>
                <td style={{ padding: '0.85rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {staff.department}
                </td>
                <td style={{ padding: '0.85rem 0.5rem' }}>
                  <select
                    value={staff.role}
                    onChange={(e) => handleUpdateStaffRole(staff.id, e.target.value)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color:
                        staff.role === 'ADMIN'
                          ? 'var(--accent-gold)'
                          : staff.role === 'KITCHEN_STAFF'
                          ? 'var(--accent-emerald)'
                          : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="KITCHEN_STAFF">KITCHEN_STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </td>
                <td style={{ padding: '0.85rem 0.5rem' }}>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: staff.status === 'Active Shift' ? 'var(--accent-emerald-muted)' : 'var(--bg-secondary)',
                      color: staff.status === 'Active Shift' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      border: staff.status === 'Active Shift' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    ● {staff.status}
                  </span>
                </td>
                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(staff)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(staff)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--accent-danger)',
                        color: 'var(--accent-danger)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
