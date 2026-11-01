import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  reviewCount = null,
  interactive = false,
  onChange = () => {},
  size = 18,
  showValue = true,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const displayRating = hoverRating || rating || 0;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= Math.round(displayRating);
          return (
            <button
              key={starIndex}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => onChange(starIndex) : undefined}
              onMouseEnter={interactive ? () => setHoverRating(starIndex) : undefined}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: interactive ? 'pointer' : 'default',
                display: 'inline-flex',
                color: filled ? '#f59e0b' : 'rgba(156, 163, 175, 0.4)',
                transition: 'transform 0.15s ease',
              }}
              title={interactive ? `Rate ${starIndex} of 5` : `${rating} out of 5`}
            >
              <Star
                size={size}
                fill={filled ? '#f59e0b' : 'none'}
                strokeWidth={filled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: rating > 0 ? '#f59e0b' : 'var(--text-muted)',
            marginLeft: '0.2rem',
          }}
        >
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}

      {reviewCount !== null && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
