// Simple test component to verify rendering works
export default function DashboardTest() {
  return (
    <div style={{ padding: '20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '20px' }}>
        Dashboard Test - If you see this, rendering works!
      </h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <p style={{ color: '#374151' }}>This is a test to verify the dashboard can render content.</p>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>
          If you can see this message, the component is rendering correctly.
        </p>
      </div>
    </div>
  )
}

