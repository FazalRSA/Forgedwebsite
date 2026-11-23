import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { SITE } from '../../config/site';
import { GOOGLE_REVIEWS } from '../../data/googleReviews';
import { CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { EYEBROW_CLASS } from './sectionStyles';

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <span className="inline-flex" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-4 h-4 ${n <= Math.round(count) ? 'fill-[#FBBC04] text-[#FBBC04]' : 'text-neutral-600'}`} />
    ))}
  </span>
);

const arrowClass =
  'inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#33333E] text-[#EDEBE4] hover:border-[#1D4ED8] hover:text-white transition-colors disabled:opacity-30 disabled:hover:border-[#33333E] disabled:cursor-default cursor-pointer';

/**
 * The reviews as a row that scrolls sideways and snaps card by card. It works by swipe, scroll or
 * keyboard (the row can be focused and scrolled with the arrow keys) as well as the two buttons.
 * It does not move on its own.
 */
const ReviewCarousel: React.FC = () => {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="mt-8" role="group" aria-roledescription="carousel" aria-label="Google reviews">
      <ul
        ref={trackRef}
        onScroll={update}
        tabIndex={0}
        aria-label="Reviews, scroll sideways"
        className="relative flex items-start gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-[#1D4ED8] rounded-xl"
      >
        {GOOGLE_REVIEWS.map((review, index) => (
          <li
            key={`${review.author ?? 'google'}-${index}`}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${GOOGLE_REVIEWS.length}`}
            className="snap-start shrink-0 basis-[85%] sm:basis-[calc(50%-8px)] lg:basis-[calc(33.333%-11px)] rounded-xl border border-[#26262E] bg-[#18181D] p-5"
          >
            <figure className="h-full flex flex-col">
              <div className="flex items-center gap-2">
                <Stars count={review.stars} />
                <span className="sr-only">{review.stars} out of 5 stars</span>
              </div>
              <blockquote className="mt-3 text-neutral-200 whitespace-pre-line">{review.text}</blockquote>
              <figcaption className="mt-auto pt-3 text-sm text-neutral-400">
                {review.author ?? 'Google review'}
                {review.author && review.when ? ` \u00b7 ${review.when}` : ''}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} aria-label="Previous review" className={arrowClass}>
          <ChevronLeft aria-hidden="true" className="w-5 h-5" />
        </button>
        <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} aria-label="Next review" className={arrowClass}>
          <ChevronRight aria-hidden="true" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

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
      <span className={EYEBROW_CLASS}>Reviews</span>
      <h2 id="reviews-heading" className="mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white">
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

      {GOOGLE_REVIEWS.length > 0 && <ReviewCarousel />}

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
