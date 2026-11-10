import React, { Suspense, lazy, useEffect } from 'react';
import { RouterProvider, useRouter } from './utils/router';
import { applyPageMeta, metaForPath } from './utils/seo';
import { FirebaseProvider } from './context/FirebaseContext';
import { BrandHeader } from './components/brand/BrandHeader';
import { HeroSection } from './components/brand/HeroSection';
import { TrustedByBmwSection } from './components/brand/TrustedByBmwSection';
import { EditorialFlow } from './components/brand/EditorialFlow';
import { WheelCatalogue } from './components/brand/WheelCatalogue';
import { GlobalOverlays } from './components/shared/GlobalOverlays';
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer';

// Lazy-loaded route components for code-splitting and faster initial bundle evaluation
const DealerApplicationPage = lazy(() =>
  import('./components/brand/DealerApplicationPage').then((m) => ({
    default: m.DealerApplicationPage,
  }))
);
const ClientFitmentsPage = lazy(() =>
  import('./components/brand/ClientFitmentsPage').then((m) => ({
    default: m.ClientFitmentsPage,
  }))
);
const WheelShowcasePDP = lazy(() =>
  import('./components/brand/WheelShowcasePDP').then((m) => ({
    default: m.WheelShowcasePDP,
  }))
);
const AccountGaragePage = lazy(() =>
  import('./components/brand/AccountGaragePage').then((m) => ({
    default: m.AccountGaragePage,
  }))
);
const AdminWheelUploader = lazy(() =>
  import('./components/admin/AdminWheelUploader').then((m) => ({
    default: m.AdminWheelUploader,
  }))
);
const VehicleFitmentWidget = lazy(() =>
  import('./components/store/VehicleFitmentWidget').then((m) => ({
    default: m.VehicleFitmentWidget,
  }))
);
const FitmentCollectionView = lazy(() =>
  import('./components/store/FitmentCollectionView').then((m) => ({
    default: m.FitmentCollectionView,
  }))
);
const TechnicalProductView = lazy(() =>
  import('./components/store/TechnicalProductView').then((m) => ({
    default: m.TechnicalProductView,
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

const SixnineDealerPage = lazy(() =>
  import('./components/brand/SixnineDealerPage').then((m) => ({
    default: m.SixnineDealerPage,
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
        LOADING ARCHITECTURE...
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
        <TrustedByBmwSection />
        <WheelCatalogue />
        <EditorialFlow />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useRouter();

  // Give every route its own title, description, canonical URL and structured data.
  useEffect(() => {
    try {
      applyPageMeta(metaForPath(pathname));
    } catch (err) {
      // Metadata is an enhancement: a failure here must never stop the page rendering.
      console.error('Could not set page metadata for', pathname, err);
    }
  }, [pathname]);

  // Route: /sixnine-wheels — Official Dealer of Sixnine Wheels
  if (
    pathname === '/sixnine-wheels' ||
    pathname === '/sixnine-wheels/' ||
    pathname === '/official-dealer-sixnine-wheels' ||
    pathname === '/official-dealer-sixnine-wheels/'
  ) {
    return <SixnineDealerPage />;
  }

  // Route: /account or /garage — Client Account & Vehicle Garage
  if (
    pathname === '/account' ||
    pathname === '/account/' ||
    pathname === '/garage' ||
    pathname === '/garage/'
  ) {
    return <AccountGaragePage />;
  }

  // Route: /privacy-policy — Legal Governance & Data Privacy Policy
  if (pathname === '/privacy-policy' || pathname === '/privacy-policy/') {
    return <PrivacyPolicyPage />;
  }

  // Protected Route: /admin or /admin/wheels — Admin Wheel Uploader
  if (
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname.startsWith('/admin/')
  ) {
    return <AdminWheelUploader />;
  }

  // Route: /dealer-application — Dealer & Trade Partner Application Page
  if (
    pathname === '/dealer-application' ||
    pathname === '/dealer-application/' ||
    pathname === '/store/dealer-application'
  ) {
    return <DealerApplicationPage />;
  }

  // Route: /client-fitments — 4x4 Scrollable Bento Grid of Client Fitments with Lightbox
  if (
    pathname === '/client-fitments' ||
    pathname === '/client-fitments/' ||
    pathname === '/store/client-fitments'
  ) {
    return <ClientFitmentsPage />;
  }

  // Route: /studio/[slug] — unlisted 3D studio preview for a wheel not yet in the catalogue
  if (pathname.startsWith('/studio/')) {
    const slug = pathname.replace('/studio/', '').split('/')[0];
    return <StudioPreviewPage slug={slug} />;
  }

  // Route 2: /wheels/[slug] — Editorial Wheel Showcase PDP with 360° 3D Studio
  if (pathname.startsWith('/wheels/')) {
    const slug = pathname.replace('/wheels/', '').split('/')[0] || 'ld-rs';
    return <WheelShowcasePDP slug={slug} />;
  }

  // Route 4: /store/collections/[fitmentSlug] — Filtered Vehicle Fitment PLP
  if (pathname.startsWith('/store/collections/')) {
    const fitmentSlug =
      pathname.replace('/store/collections/', '').split('/')[0] ||
      'bmw-m3-2024-onwards-alloy-wheels';
    return <FitmentCollectionView fitmentSlug={fitmentSlug} />;
  }

  // Route 5: /store/products/[productSlug] — Technical E-Commerce PDP with 360° 3D Studio
  if (pathname.startsWith('/store/products/')) {
    const productSlug =
      pathname.replace('/store/products/', '').split('/')[0] ||
      'bmw-m3-type-52-forged';
    return <TechnicalProductView productSlug={productSlug} />;
  }

  // Route 3: /store — Storefront & Vehicle Fitment Finder
  if (pathname === '/store' || pathname === '/store/') {
    return <VehicleFitmentWidget />;
  }

  // Route 1: / — Brand Editorial Landing Page & Interactive Wheel Catalogue
  return <BrandHomePage />;
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
    <FirebaseProvider>
      <RouterProvider>
        <MainLayout />
        <GlobalOverlays />
      </RouterProvider>
    </FirebaseProvider>
  );
}
