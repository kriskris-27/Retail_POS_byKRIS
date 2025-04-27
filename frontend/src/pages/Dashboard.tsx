import DebugAuth from '../components/DebugAuth';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome to your Bill Vision POS dashboard.</p>
      
      {/* Debug Component */}
      <DebugAuth />
    </div>
  );
};

export default Dashboard;