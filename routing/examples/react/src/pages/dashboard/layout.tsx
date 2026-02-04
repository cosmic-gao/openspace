import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div style={{ display: 'flex', border: '1px solid #ddd', minHeight: '300px' }}>
            <aside style={{ width: '200px', background: '#f5f5f5', padding: '10px' }}>
                <h3>Dashboard</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li><Link to="/dashboard">Overview</Link></li>
                    <li><Link to="/dashboard/settings">Settings</Link></li>
                </ul>
            </aside>
            <div style={{ padding: '20px', flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
}
