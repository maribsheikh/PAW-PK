import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import api from "../../utils/api";
import { formatDate } from "../../utils/format";

const AdminReviews = () => {
  const [statusFilter, setStatusFilter] = useState("pending");
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery(
    ["adminReviews", statusFilter],
    async () => {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await api.get(`/admin/reviews${params}`);
      return response.data;
    },
  );

  const moderateMutation = useMutation(
    ({ id, status }) => api.patch(`/admin/reviews/${id}`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("adminReviews");
        alert("Review status updated");
      },
    },
  );

  const handleModerate = (reviewId, status) => {
    moderateMutation.mutate({ id: reviewId, status });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Manage Reviews</h1>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-4 py-2"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading reviews...</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{review.user_name}</h3>
                    <p className="text-sm text-gray-600">
                      {review.product_title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(review.id, "approved")}
                    className="btn-primary text-sm"
                    disabled={review.status === "approved"}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate(review.id, "rejected")}
                    className="btn-secondary text-sm"
                    disabled={review.status === "rejected"}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                No reviews found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
