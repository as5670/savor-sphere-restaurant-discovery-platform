// 1. Import React
import React from 'react';

// 2. Create Loader component with color prop (default: gold)
const Loader = ({ color = "#FFD700" }) => (
  // 3. Main container div
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Full viewport height
    backgroundColor: '#0A0A0A' // Dark background
  }}>
    {/* 4. Spinner element */}
    <div style={{
      width: '50px',
      height: '50px',
      border: `4px solid ${color}20`, // 20% opacity
      borderTop: `4px solid ${color}`, // Full color for top border
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}>
      {/* 5. CSS Animation definition */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// 6. Export component
export default Loader;