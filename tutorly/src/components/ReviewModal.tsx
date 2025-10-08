import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  lessonId,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // ✅ Hook into Convex mutation
  const createReview = useMutation(api.reviews.createReview);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      await createReview({
        lessonId, 
        rating,
        comment,
      });

      // Optionally reset state
      setRating(0);
      setComment("");

      onClose(); // close modal after submit
    } catch (err) {
      console.error("Failed to create review:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Leave a Review</h2>

        {/* Rating */}
        <div className="mb-4">
          <label className="block mb-1">Rating:</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  rating >= star ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block mb-1">Comment:</label>
          <textarea
            rows={4}
            className="w-full p-2 border rounded"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Submit + Close */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};


export default ReviewModal;
