import { Link } from "react-router-dom";

export default function PostsIndex() {
    const posts = [1, 2, 3];

    return (
        <div>
            <h2>Posts List</h2>
            <ul>
                {posts.map(id => (
                    <li key={id}>
                        <Link to={`/posts/${id}`}>View Post {id}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
