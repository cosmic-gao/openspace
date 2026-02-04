import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Login Page</h2>
            <p>This page is inside <code>pages/(auth)/login.tsx</code></p>
            <p>The URL is <code>/login</code> (group name omitted).</p>
            <button onClick={() => navigate('/dashboard')}>Login & Go to Dashboard</button>
        </div>
    );
}
