import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDeleteReview, adminGetReviews } from '../../../lib/api';
import SectionShell from '../SectionShell';

const ReviewsSection = () => {
  const qc = useQueryClient();
  const { data: reviewsData } = useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: () => adminGetReviews({ page: 1, limit: 100 })
  });
  const reviews = reviewsData?.reviews ?? [];

  const deleteMutation = useMutation({
    mutationFn: adminDeleteReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reviews'] })
  });

  return (
    <SectionShell title="Reviews" subtitle="Moderate feedback and ratings.">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Review list</h3>
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-xl bg-black/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">{review.product?.name}</p>
                <span className="text-amber-300">{review.rating} *</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {review.user?.fullName || review.user?.username} - {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-stone-200 mt-2">{review.comment}</p>
              <button
                onClick={() => deleteMutation.mutate(review._id)}
                className="mt-3 btn-ghost text-xs text-red-400 hover:text-red-200"
              >
                Delete review
              </button>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-stone-400">No reviews available.</p>}
        </div>
      </div>
    </SectionShell>
  );
};

export default ReviewsSection;
