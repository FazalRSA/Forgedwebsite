import React from 'react';
import { Star } from 'lucide-react';
import { SITE } from '../../config/site';
import { GOOGLE_REVIEWS } from '../../data/googleReviews';
import { CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <span className="inline-flex" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-4 h-4 ${n <= Math.round(count) ? 'fill-[#FBBC04] text-[#FBBC04]' : 'text-neutral-600'}`} />
    ))}
  </span>
);

/**
 * Google reviews on the home page. The review text is real, crawlable HTML (not an iframe or a
 * script), copied from the Google Business Profile into src/data/googleReviews.ts. The rating and
 * count come from SITE and are shown only when set. No review structured data is added: Google does
 * not show stars for a business's own reviews of itself, so it would only risk a manual action.
 * Hidden until there is a reviews link or at least one review.
 */
export const GoogleReviewsSection: React.FC = () => {
  const { googleRating, googleReviewCount, googleReviewsUrl, googleWriteReviewUrl } = SITE;
  const hasRating = googleRating !== null && googleReviewCount !== null && googleReviewCount > 0;
  if (GOOGLE_REVIEWS.length === 0 && !googleReviewsUrl && !hasRating) return null;

  return (
    <section
      id="reviews"
      data-testid="google-reviews-section"
      aria-labelledby="reviews-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
    >
      <h2 id="reviews-heading" className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white">
        What customers say on Google
      </h2>
      {hasRating && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-300">
          <span className="text-2xl font-light text-white tabular-nums">{googleRating!.toFixed(1)}</span>
          <Stars count={googleRating!} />
          <span>
            {googleReviewCount} Google {googleReviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </p>
      )}

      {GOOGLE_REVIEWS.length > 0 && (
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GOOGLE_REVIEWS.map((review) => (
            <li key={`${review.author}-${review.text.slice(0, 24)}`} className="rounded-xl border border-[#26262E] bg-[#18181D] p-5">
              <figure>
                <div className="flex items-center gap-2">
                  <Stars count={review.stars} />
                  <span className="sr-only">{review.stars} out of 5 stars</span>
                </div>
                <blockquote className="mt-3 text-neutral-200">{review.text}</blockquote>
                <figcaption className="mt-3 text-sm text-neutral-400">
                  {review.author}
                  {review.when ? ` · ${review.when}` : ''}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}

      {(googleReviewsUrl || googleWriteReviewUrl) && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {googleReviewsUrl && (
            <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className={CTA_PRIMARY_CLASS}>
              Read all reviews on Google
            </a>
          )}
          {googleWriteReviewUrl && (
            <a href={googleWriteReviewUrl} target="_blank" rel="noopener noreferrer" className={CTA_SECONDARY_CLASS}>
              Leave a review
            </a>
          )}
        </div>
      )}
    </section>
  );
};
