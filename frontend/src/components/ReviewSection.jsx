import React, { useEffect, useState } from "react";
import api from "../api";

export default function ReviewSection({ movieId, user }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoadingReviews(true);
    api
      .get(`/reviews/${movieId}`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/reviews/${movieId}`, { rating, comment });
      setComment("");
      setRating(5);
      // Refetch reviews after submit
      const res = await api.get(`/reviews/${movieId}`);
      setReviews(res.data.reviews || []);
      setShowAll(false); // Reset to show only 3 after new review
    } catch (err) {
        console.error("Failed to submit review:", err);
      alert("Failed to submit review");
    }
    setSubmitting(false);
  };

  const reviewsToShow = showAll
    ? reviews.slice().reverse()
    : reviews.slice().reverse().slice(0, 3);

  return (
    <div className="w-[95%] md:w-[60%] mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {user && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col gap-2 bg-gray-900 rounded-lg p-4"
        >
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-200">Your Rating:</span>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="bg-gray-800 text-white rounded px-2 py-1"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ★
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a public review..."
            className="bg-gray-800 text-white rounded px-3 py-2 mt-2 resize-none"
            rows={2}
            maxLength={300}
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}
      <div className="flex flex-col gap-4">
        {loadingReviews ? (
          <div className="text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-400">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <>
            {reviewsToShow.map((review, idx) => (
              <div
                key={review._id || idx}
                className="flex gap-3 items-start bg-gray-900 rounded-lg p-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">
                  {review.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-200">
                      {review.user?.name || "User"}
                    </span>
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <div className="text-gray-100 mt-1">{review.comment}</div>
                </div>
              </div>
            ))}
            {reviews.length > 3 && !showAll && (
              <button
                className="mt-2 text-red-500 hover:underline font-semibold self-center"
                onClick={() => setShowAll(true)}
              >
                View more reviews
              </button>
            )}
            {showAll && reviews.length > 3 && (
              <button
                className="mt-2 text-gray-400 hover:underline font-semibold self-center"
                onClick={() => setShowAll(false)}
              >
                Show less
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
