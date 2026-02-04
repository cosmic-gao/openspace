import { useParams, Link } from "react-router-dom";

export default function PostDetail() {
    const { id } = useParams();

    return (
        <div>
            <h2>Post Detail</h2>
            <p>Post ID: <strong>{id}</strong></p>
            <Link to="/posts">Back to List</Link>
        </div>
    );
}
