import { Link, Outlet } from "react-router-dom";

export default function RootLayout() {
    return (
        <div className="app-container">
            <header style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
                <h1>Routing React Example</h1>
                <nav style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/">Home</Link>
                    <Link to="/posts">Posts</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/login">Login (Group)</Link>
                    <Link to="/unknown-path">404</Link>
                </nav>
            </header>
            <main style={{ padding: '20px' }}>
                <Outlet />
            </main>
            <footer style={{ borderTop: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
                <small>Powered by @routing/core</small>
            </footer>
        </div>
    );
}
