import { Outlet, Link } from "react-router-dom";

function App() {
    return (
        <div>
            <h1>Routing React Example</h1>
            <nav>
                <Link to="/">Home</Link> | <Link to="/about">About</Link>
            </nav>
            <hr />
            <Outlet />
        </div>
    );
}

export default App;
