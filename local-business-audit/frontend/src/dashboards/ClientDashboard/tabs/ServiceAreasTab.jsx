// File: src/dashboards/ClientDashboard/tabs/ServiceAreasTab.jsx
import React, { useState, useEffect } from 'react';

// Colors configuration
const colors = {
  primary: "#2A3B4A",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

// Status Badge Component
const StatusBadge = ({ status, children }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'inactive':
        return { bg: '#F3F4F6', color: '#6B7280' };
      default:
        return { bg: colors.lightGray, color: '#666' };
    }
  };

  const style = getStatusStyle();
  
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

// Service Area Card Component
const ServiceAreaCard = ({ area, onEdit, onToggleStatus }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${area.status === 'active' ? colors.success : colors.warning}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>📍</span>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
              {area.city}, {area.state}
            </h3>
          </div>
          
          {/* Area Details */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#666', margin: '4px 0', fontSize: '14px' }}>
              <strong>Radius:</strong> {area.radius} miles
            </p>
            <p style={{ color: '#666', margin: '4px 0', fontSize: '14px' }}>
              <strong>ZIP Codes:</strong> {area.zipCodes?.join(', ') || 'Not specified'}
            </p>
            <p style={{ color: '#666', margin: '4px 0', fontSize: '14px' }}>
              <strong>Population:</strong> {area.population?.toLocaleString() || 'Unknown'}
            </p>
          </div>

          {/* Performance Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginTop: '16px'
          }}>
            <div style={{ textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary }}>
                {area.monthlyLeads || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Monthly Leads</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>
                {area.conversionRate || 0}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Conversion</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.info }}>
                ${area.avgJobValue || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Avg Job Value</div>
            </div>
          </div>
        </div>
        
        <StatusBadge status={area.status}>
          {area.status === 'active' ? 'Active' : area.status === 'pending' ? 'Pending' : 'Inactive'}
        </StatusBadge>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.lightGray}`
      }}>
        <button
          onClick={() => onEdit(area)}
          style={{
            background: colors.primary,
            color: colors.white,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ✏️ Edit Area
        </button>
        <button
          onClick={() => onToggleStatus(area)}
          style={{
            background: area.status === 'active' ? colors.warning : colors.success,
            color: colors.white,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {area.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
        </button>
        <button
          style={{
            background: colors.white,
            color: colors.info,
            border: `2px solid ${colors.info}`,
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 Analytics
        </button>
      </div>
    </div>
  );
};

// Main ServiceAreasTab Component
const ServiceAreasTab = ({ businessId, filter, onApprove, onReject }) => {
  const [serviceAreas, setServiceAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Mock service areas data (replace with real API call later)
  useEffect(() => {
    setServiceAreas([
      {
        id: 1,
        city: 'Eagle Mountain',
        state: 'UT',
        radius: 15,
        zipCodes: ['84005', '84043'],
        population: 32000,
        status: 'active',
        monthlyLeads: 45,
        conversionRate: 23,
        avgJobValue: 2800
      },
      {
        id: 2,
        city: 'Lehi',
        state: 'UT',
        radius: 20,
        zipCodes: ['84043', '84042'],
        population: 75000,
        status: 'active',
        monthlyLeads: 62,
        conversionRate: 28,
        avgJobValue: 3200
      },
      {
        id: 3,
        city: 'Saratoga Springs',
        state: 'UT',
        radius: 18,
        zipCodes: ['84045'],
        population: 35000,
        status: 'active',
        monthlyLeads: 38,
        conversionRate: 25,
        avgJobValue: 2950
      },
      {
        id: 4,
        city: 'American Fork',
        state: 'UT',
        radius: 25,
        zipCodes: ['84003', '84006'],
        population: 45000,
        status: 'pending',
        monthlyLeads: 15,
        conversionRate: 18,
        avgJobValue: 2600
      },
      {
        id: 5,
        city: 'Draper',
        state: 'UT',
        radius: 22,
        zipCodes: ['84020', '84092'],
        population: 50000,
        status: 'inactive',
        monthlyLeads: 8,
        conversionRate: 12,
        avgJobValue: 3100
      }
    ]);
  }, [businessId]);

  const handleEdit = (area) => {
    alert(`Edit functionality for ${area.city} would open a modal here`);
  };

  const handleToggleStatus = (area) => {
    const newStatus = area.status === 'active' ? 'inactive' : 'active';
    setServiceAreas(prev => 
      prev.map(a => a.id === area.id ? { ...a, status: newStatus } : a)
    );
  };

  // Calculate totals
  const activeAreas = serviceAreas.filter(area => area.status === 'active');
  const totalLeads = activeAreas.reduce((sum, area) => sum + (area.monthlyLeads || 0), 0);
  const avgConversion = activeAreas.length > 0 
    ? Math.round(activeAreas.reduce((sum, area) => sum + (area.conversionRate || 0), 0) / activeAreas.length)
    : 0;

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: colors.primary }}>Loading service areas...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: colors.primary }}>
          📍 Service Areas
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            background: colors.success,
            color: colors.white,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Add New Area
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.primary}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>
            {serviceAreas.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Areas</div>
        </div>
        
        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.success}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.success, marginBottom: '8px' }}>
            {activeAreas.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Active Areas</div>
        </div>

        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.warning}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.warning, marginBottom: '8px' }}>
            {totalLeads}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Monthly Leads</div>
        </div>

        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.info}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.info, marginBottom: '8px' }}>
            {avgConversion}%
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Avg Conversion</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: colors.primary,
            color: colors.white,
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          All ({serviceAreas.length})
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: colors.lightGray,
            color: '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Active ({activeAreas.length})
        </button>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: colors.lightGray,
            color: '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Pending ({serviceAreas.filter(a => a.status === 'pending').length})
        </button>
      </div>

      {/* Service Areas List */}
      {serviceAreas.length === 0 ? (
        <div style={{
          background: colors.lightGray,
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>No Service Areas</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Add your first service area to start targeting customers in specific locations.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {serviceAreas.map((area) => (
            <ServiceAreaCard 
              key={area.id} 
              area={area}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Add Form Modal Placeholder */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.white,
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Service Area</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>
              This would open a form to add a new service area with city, radius, and targeting options.
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                background: colors.primary,
                color: colors.white,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceAreasTab;