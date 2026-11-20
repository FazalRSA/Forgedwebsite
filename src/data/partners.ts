/**
 * The industry partners shown in the home page hero, under "Our Industry Partners". To add or remove
 * one, edit this list: the hero reads it and shows no partners row when it is empty. Logos live in public/images/partners/ and should be
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
    name: 'Sixnine Wheels',
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
