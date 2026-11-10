/**
 * The industry partners shown on the home page. To add or remove one, edit this list: the section
 * reads it and shows nothing when it is empty. Logos live in public/images/partners/ and should be
 * transparent, square and about 480 px wide.
 */
export interface Partner {
  id: string;
  name: string;
  /** Logo path under /public. */
  logo: string;
  /** Short line under the logo. Leave out when the name says it all. */
  caption?: string;
  /** A page on this site the logo opens. Leave out for a plain logo. */
  href?: string;
}

export const PARTNERS: readonly Partner[] = [
  {
    id: 'sixnine',
    name: 'SIXNINE Wheels',
    logo: '/images/partners/sixnine.webp',
    caption: 'Official dealer',
    href: '/sixnine-wheels',
  },
  {
    id: 'bmw',
    name: 'BMW',
    logo: '/images/partners/bmw.webp',
  },
];
