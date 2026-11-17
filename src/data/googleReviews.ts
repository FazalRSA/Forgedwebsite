/**
 * Google reviews shown on the home page. Copy each review word for word from the Google Business
 * Profile, with the name and star rating Google shows, and only with the reviewer's name as it
 * appears there. Leave the list empty until real reviews are added: the section then shows only the
 * rating (when SITE.googleRating is set) and the links, or nothing at all.
 */
export interface GoogleReview {
  /** Reviewer name as shown on Google. */
  author: string;
  /** Whole stars, 1 to 5. */
  stars: 1 | 2 | 3 | 4 | 5;
  /** The review text, unchanged. */
  text: string;
  /** When it was posted, as Google shows it (for example "2 months ago" or "March 2026"). */
  when?: string;
}

export const GOOGLE_REVIEWS: readonly GoogleReview[] = [];
