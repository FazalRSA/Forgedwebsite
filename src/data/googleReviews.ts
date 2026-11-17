/**
 * Google reviews shown on the home page. Copy each review word for word from the Google Business
 * Profile, with the name and star rating Google shows, and only with the reviewer's name as it
 * appears there. Leave the list empty until real reviews are added: the section then shows only the
 * rating (when SITE.googleRating is set) and the links, or nothing at all.
 */
export interface GoogleReview {
  /** Reviewer name as shown on Google. Leave out when it is not known: the card then shows no name. */
  author?: string;
  /** Whole stars, 1 to 5. */
  stars: 1 | 2 | 3 | 4 | 5;
  /** The review text, unchanged. */
  text: string;
  /** When it was posted, as Google shows it (for example "2 months ago" or "March 2026"). */
  when?: string;
}

export const GOOGLE_REVIEWS: readonly GoogleReview[] = [
  {
    stars: 5,
    text:
      'Absolutely exceptional service from Mo and the entire team at Forged SA! Purchased a stunning set of SIXNINE FF-THREE rims in Gloss Black, and I couldn\u2019t be happier! From start to finish, the service was outstanding \u2014 incredibly professional, efficient, and super quick turnaround times. Mo went above and beyond to ensure everything was perfect. It\u2019s rare to find this level of customer service these days. Highly recommend Forged SA! Will definitely be back!',
  },
  {
    author: 'Ashley Ramsumair',
    stars: 5,
    text: 'Best in the business.',
  },
  {
    stars: 5,
    text:
      'It was such an amazing experience the service , the price , the attention to detail they really made me feel like I was not buying a set of rims I felt like I was supporting a person I have know my whole life who has got my back.\nThank you so much Mo',
  },
];
