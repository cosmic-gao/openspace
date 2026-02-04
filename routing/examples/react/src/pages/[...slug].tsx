import { useLocation, Link } from "react-router-dom";

export default function NotFound() {
    const location = useLocation();

    return (
        <div style={{ padding: '20px', color: 'red' }}>
            <h2>404 - Not Found</h2>
            <p>The path <code>{location.pathname}</code> does not exist.</p>
            <Link to="/">Go Home</Link>
        </div>
    );
}
