import { useState, useEffect } from 'react';
import { Star, Send, Trash2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getProductReviews, submitReview, canUserReview, deleteReview, type ProductReview } from '@/firebase/reviews';

interface Props {
  productId: string;
  isAdmin?: boolean;
  showToast?: (msg: string) => void;
}

export default function ProductReviews({ productId, isAdmin, showToast }: Props) {
  const { user, isLoggedIn } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (isLoggedIn && user) {
      canUserReview(user.uid, productId).then(setCanReview);
    }
  }, [isLoggedIn, user, productId]);

  const loadReviews = async () => {
    const data = await getProductReviews(productId);
    setReviews(data);
  };

  const handleSubmit = async () => {
    if (!comment.trim() || !user) return;
    setLoading(true);
    const ok = await submitReview({
      productId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      rating,
      comment: comment.trim(),
    });
    if (ok) {
      setComment('');
      setRating(5);
      await loadReviews();
      setCanReview(false);
      showToast?.('Review submitted!');
    }
    setLoading(false);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    const ok = await deleteReview(reviewId);
    if (ok) {
      await loadReviews();
      showToast?.('Review deleted');
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
        Reviews ({reviews.length}) {reviews.length > 0 && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>{avgRating} <Star size={14} style={{ display: 'inline', fill: '#f59e0b', color: '#f59e0b' }} /></span>}
      </h3>

      {/* Review form */}
      {isLoggedIn && canReview && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>Write a review (1 per week)</p>
          <div className="flex items-center gap-1" style={{ marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                className="cursor-pointer border-none bg-transparent" style={{ padding: '2px' }}>
                <Star size={20} style={{ color: s <= (hoverStar || rating) ? '#f59e0b' : 'var(--border)', fill: s <= (hoverStar || rating) ? '#f59e0b' : 'transparent', transition: 'all 0.15s' }} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience with this product..." rows={3}
            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', marginBottom: '10px' }} />
          <button onClick={handleSubmit} disabled={loading || !comment.trim()}
            className="cursor-pointer border-none flex items-center gap-2" style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', opacity: loading ? 0.6 : 1 }}>
            <Send size={12} /> {loading ? 'Posting...' : 'Post Review'}
          </button>
        </div>
      )}

      {!isLoggedIn && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><a href="#/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</a> to leave a review (1 per week)</p>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No reviews yet. Be the first!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>
                    <User size={14} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.userName}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} style={{ color: s <= r.rating ? '#f59e0b' : 'var(--border)', fill: s <= r.rating ? '#f59e0b' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : 'Recently'}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDelete(r.id)} className="cursor-pointer border-none bg-transparent" style={{ color: '#ef4444', padding: '2px' }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text)', lineHeight: 1.5 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
