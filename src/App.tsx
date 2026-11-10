import React, { Suspense, lazy, useEffect } from 'react';
import { RouterProvider, useRouter } from './utils/router';
import { normalizePath } from './utils/redirects';
import { applyPageMeta, isHomePath, metaForPath } from './utils/seo';
import { findWheelBySlug } from './data/catalogue';
import { useForgedStore } from './store/useForgedStore';
import { BrandHeader } from './components/brand/BrandHeader';
import { HeroSection } from './components/brand/HeroSection';
import { EditorialFlow } from './components/brand/EditorialFlow';
import { WheelCatalogue } from './components/brand/WheelCatalogue';
import { IndustryPartnersSection } from './components/brand/IndustryPartnersSection';
import { GlobalOverlays } from './components/shared/GlobalOverlays';
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer';

// Lazy-loaded route components for code-splitting and faster initial bundle evaluation
const NotFoundPage = lazy(() =>
  import('./components/brand/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);
const ClientFitmentsPage = lazy(() =>
  import('./components/brand/ClientFitmentsPage').then((m) => ({
    default: m.ClientFitmentsPage,
  }))
);
const ContactPage = lazy(() =>
  import('./components/brand/ContactPage').then((m) => ({
    default: m.ContactPage,
  }))
);
const SixnineDealerPage = lazy(() =>
  import('./components/brand/SixnineDealerPage').then((m) => ({
    default: m.SixnineDealerPage,
  }))
);
const WheelShowcasePDP = lazy(() =>
  import('./components/brand/WheelShowcasePDP').then((m) => ({
    default: m.WheelShowcasePDP,
  }))
);
const AdminWheelUploader = lazy(() =>
  import('./components/admin/AdminWheelUploader').then((m) => ({
    default: m.AdminWheelUploader,
  }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./components/brand/PrivacyPolicyPage').then((m) => ({
    default: m.PrivacyPolicyPage,
  }))
);
const StudioPreviewPage = lazy(() =>
  import('./components/brand/StudioPreviewPage').then((m) => ({
    default: m.StudioPreviewPage,
  }))
);

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-[#0A0A0A] text-[#F5F5F7]"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#26262E] border-t-[#FF5500] animate-spin" />
      </div>
      <span className="mt-4 text-xs font-mono tracking-[0.2em] uppercase text-neutral-400">
        Loading
      </span>
    </div>
  );
}

function BrandHomePage() {
  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader />
      <main>
        <HeroSection />
        <WheelCatalogue />
        <EditorialFlow />
        <IndustryPartnersSection />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useRouter();
  const { customBrandWheels } = useForgedStore();

  // Give every route its own title, description, canonical URL and structured data.
  useEffect(() => {
    try {
      applyPageMeta(metaForPath(pathname));
    } catch (err) {
      // Metadata is an enhancement: a failure here must never stop the page rendering.
      console.error('Could not set page metadata for', pathname, err);
    }
  }, [pathname]);

  // Old addresses (/store, /client-fitments, ...) are redirected by the router before this runs.
  const path = normalizePath(pathname);

  // /wheels/:slug: one in-stock listing. A sold or unknown wheel is not a page on this site.
  if (path.startsWith('/wheels/')) {
    const slug = path.slice('/wheels/'.length).split('/')[0];
    if (!findWheelBySlug(slug, customBrandWheels)) return <NotFoundPage />;
    return <WheelShowcasePDP slug={slug} />;
  }

  // /installs: real customer cars on the wheels
  if (path === '/installs') return <ClientFitmentsPage />;

  // /sixnine-wheels: the shop's page as an official Sixnine Wheels dealer
  if (path === '/sixnine-wheels') return <SixnineDealerPage />;

  // /contact: WhatsApp, phone, address, areas served
  if (path === '/contact') return <ContactPage />;

  if (path === '/privacy-policy') return <PrivacyPolicyPage />;

  // Unlisted: /studio/:slug previews a wheel's 3D model before it is in the catalogue.
  if (path.startsWith('/studio/')) {
    const slug = path.slice('/studio/'.length).split('/')[0];
    return <StudioPreviewPage slug={slug} />;
  }

  // Unlisted: /admin and anything under it. Not linked from anywhere on the site.
  if (path === '/admin' || path.startsWith('/admin/')) return <AdminWheelUploader />;

  // /: in-stock wheels, then proof of work, then industry partners
  if (isHomePath(path)) return <BrandHomePage />;

  // Anything else is not a page on this site.
  return <NotFoundPage />;
}

function MainLayout() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0A0A] text-[#F5F5F7]">
      <div className="flex-1">
        <Suspense fallback={<RouteLoadingFallback />}>
          <AppRoutes />
        </Suspense>
      </div>
      <StackedCircularFooter onNavigate={navigate} useBrandLinks={true} />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <MainLayout />
      <GlobalOverlays />
    </RouterProvider>
  );
}
