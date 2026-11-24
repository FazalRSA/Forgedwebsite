/**
 * Facts about Sixnine Wheels for the "About Sixnine" section on /sixnine-wheels.
 *
 * Read on 2026-11-23 from Sixnine's own site: the About page, the home page, the Forged Series page,
 * the FF-THREE page and the legal notice (links below). Every line here is Sixnine's own claim, put in
 * our words; nothing is added. Sixnine's German road approval (TÜV report) is left out on purpose:
 * it is a German approval and says nothing about registering a car in South Africa.
 */

export const SIXNINE_SOURCES = {
  about: 'https://sixnine-wheels.com/en/pages/about',
  home: 'https://sixnine-wheels.com/en',
  configurator: 'https://sixnine-wheels.com/en/pages/konfigurator',
  legalNotice: 'https://sixnine-wheels.com/en/policies/legal-notice',
} as const;

export const SIXNINE_ABOUT = {
  /** The company as its legal notice gives it. */
  company: 'Six Nine Wheels GmbH',
  home: 'Neumarkt in der Oberpfalz, Germany',
  /** Sixnine calls itself a global aftermarket wheel brand and says its wheels are available worldwide (home page). */
  reach: 'sold worldwide',
  /** Looks the accessory configurator can build for FF-ONE and FF-THREE (home page, "Make them yours"). */
  configuratorLooks: 3950,
  /** FF-ONE: "One wheel, five designs" (home page). */
  ffOneDesigns: 5,
} as const;

/** The three ways to personalise FF-ONE and FF-THREE, as the configurator offers them. */
export const SIXNINE_PERSONALISATION: readonly { title: string; text: string }[] = [
  {
    title: 'Swappable inlays',
    text: 'FF-ONE and FF-THREE take bolt-on inlays (V-ONE, V-TWO and X-ONE) that change the spoke design without changing the wheel.',
  },
  {
    title: 'Colour details',
    text: 'Inlays, inlay screws, the AeroRing and centre caps come in their own colours, so the details can contrast with the wheel.',
  },
  {
    title: 'Change it later',
    text: 'The inlays are parts, not paint: a new look is a new set of inlays, not a new set of wheels.',
  },
];
