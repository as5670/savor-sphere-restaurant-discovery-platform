import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UserProfile = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/users/${id}`)
            .then((res) => res.json())
            .then((data) => setUser(data))
            .catch((err) => setError(err.message));

        fetch(`http://localhost:5000/api/users/${id}/reservations`)
            .then((res) => res.json())
            .then((data) => setReservations(data))
            .catch((err) => setError(err.message));

        fetch(`http://localhost:5000/api/users/${id}/reviews`)
            .then((res) => res.json())
            .then((data) => setReviews(data))
            .catch((err) => setError(err.message));
    }, [id]);

    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!user) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "center" }}>
            <h2>User Profile</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>

            <h3>Reservations</h3>
            {reservations.length > 0 ? (
                <ul>
                    {reservations.map((res) => (
                        <li key={res.id}>{res.restaurant_name} - {res.date}</li>
                    ))}
                </ul>
            ) : <p>No reservations yet.</p>}

            <h3>Reviews</h3>
            {reviews.length > 0 ? (
                <ul>
                    {reviews.map((review) => (
                        <li key={review.id}>{review.restaurant_name}: {review.rating}⭐ - "{review.comment}"</li>
                    ))}
                </ul>
            ) : <p>No reviews posted yet.</p>}
        </div>
    );
};

export default UserProfile;
