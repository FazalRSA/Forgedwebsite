/**
 * Google Tag Manager (see README → Search and visit statistics).
 *
 * The container ID lives in config/site.ts. An empty or malformed ID adds nothing to the page, and
 * the privacy notice describes Google Tag Manager and Google Analytics only while this returns an
 * ID, so the two cannot disagree.
 *
 * scripts/prerender-meta.ts writes Google's standard container snippet into every built HTML file:
 * the script as high in <head> as possible and the <noscript> fallback straight after <body>, as
 * Google's install instructions ask. The script runs only on the production host, so a preview on
 * the Render address never reaches the container, and `npm run dev` serves the raw index.html,
 * which has no snippet at all.
 *
 * Consent (src/utils/consent.ts): before the container loads, the snippet sets every Google
 * Consent Mode type to "denied", then grants analytics_storage only if this browser accepted the
 * cookie banner earlier. Google Analytics therefore sets no cookie until the visitor says yes.
 *
 * What the container loads (Google Analytics today) is chosen in Google Tag Manager, not here. When a
 * new tag is published there, update the privacy notice to match.
 */
import { SITE, type SiteConfig } from '../config/site';
import { CONSENT_STORAGE_KEY } from './consent';

type TagManagerConfig = Pick<SiteConfig, 'googleTagManagerId' | 'host'>;

/** Container IDs look like GTM-P554MVX4. Anything else is refused, since the ID is written into HTML and script. */
const CONTAINER_ID = /^GTM-[A-Z0-9]{4,12}$/;

/** A valid Google Tag Manager container ID from the configuration, or null when none is set up. */
export function googleTagManagerId(config: TagManagerConfig = SITE): string | null {
  return CONTAINER_ID.test(config.googleTagManagerId) ? config.googleTagManagerId : null;
}

/** The host is written into a script string; only hostname characters are allowed. */
function safeHost(host: string): string | null {
  return /^[a-z0-9.-]+$/i.test(host) ? host : null;
}

/**
 * Google's container snippet for <head>, with two changes: it runs only when the page is served from
 * the production host, and it sets the Consent Mode defaults (everything denied, analytics granted
 * only after an earlier "Accept") before the container loads. '' when no container is set up.
 */
export function googleTagManagerHead(config: TagManagerConfig = SITE): string {
  const id = googleTagManagerId(config);
  const host = safeHost(config.host);
  if (!id || !host) return '';
  return [
    '<!-- Google Tag Manager (production host only; see src/utils/googleTagManager.ts) -->',
    `<script>if(location.hostname==='${host}'){`,
    `(function(w){w.dataLayer=w.dataLayer||[];w.gtag=w.gtag||function(){w.dataLayer.push(arguments);};`,
    `w.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});`,
    `try{if(w.localStorage.getItem('${CONSENT_STORAGE_KEY}')==='granted')w.gtag('consent','update',{analytics_storage:'granted'});}catch(e){}})(window);`,
    `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':`,
    `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],`,
    `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=`,
    `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);`,
    `})(window,document,'script','dataLayer','${id}');}</script>`,
    '<!-- End Google Tag Manager -->',
  ].join('\n');
}

/** Google's <noscript> fallback, placed straight after <body>. '' when no container is set up. */
export function googleTagManagerBody(config: TagManagerConfig = SITE): string {
  const id = googleTagManagerId(config);
  if (!id) return '';
  return [
    '<!-- Google Tag Manager (noscript) -->',
    `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}"`,
    'height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>',
    '<!-- End Google Tag Manager (noscript) -->',
  ].join('\n');
}

/**
 * Add the container snippet to a built HTML shell, once. The script goes straight after the
 * charset declaration (which must stay first in <head>), or after <head> when there is none; the
 * <noscript> goes straight after the opening <body> tag. A shell that already has the snippet, or
 * has no <head> or <body> to add it to, or a configuration with no container, is returned unchanged.
 */
export function withGoogleTagManager(shell: string, config: TagManagerConfig = SITE): string {
  const head = googleTagManagerHead(config);
  const body = googleTagManagerBody(config);
  if (!head || !body || shell.includes('googletagmanager.com/gtm.js')) return shell;

  const charset = shell.match(/<meta charset="[^"]*"\s*\/?>/i);
  const headOpen = shell.match(/<head[^>]*>/i);
  const bodyOpen = shell.match(/<body[^>]*>/i);
  const anchor = charset ?? headOpen;
  if (!anchor || !bodyOpen) return shell;

  const indent = '\n    ';
  let html = shell.replace(anchor[0], () => `${anchor[0]}${indent}${head.split('\n').join(indent)}`);
  html = html.replace(bodyOpen[0], () => `${bodyOpen[0]}${indent}${body.split('\n').join(indent)}`);
  return html;
}
