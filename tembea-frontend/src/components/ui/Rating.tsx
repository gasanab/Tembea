import { Star } from "lucide-react";

type RatingProps = {
  value: number;
  reviews?: number;
  size?: number;
  showNumber?: boolean;
};

export function Rating({ value, reviews, size = 14, showNumber = true }: RatingProps) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= fullStars
                ? "star-filled"
                : star === fullStars + 1 && hasHalfStar
                  ? "star-half"
                  : "star-empty"
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm font-bold text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className="text-xs font-semibold text-gray-500">
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}