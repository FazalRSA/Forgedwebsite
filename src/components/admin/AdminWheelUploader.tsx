import React, { useRef, useState } from 'react';
import {
  Lock,
  Unlock,
  Upload,
  Plus,
  CheckCircle2,
  ArrowUpRight,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { BrandHeader } from '../brand/BrandHeader';
import { useForgedStore } from '../../store/useForgedStore';
import { useRouter } from '../../utils/router';
import {
  SpokeGeometryType,
  WHEEL_FINISHES,
  WheelFinishId,
  getModelsForMake,
  formatZAR,
} from '../../data/catalogue';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';

const GEOMETRY_OPTIONS: Array<{ id: SpokeGeometryType; label: string }> = [
  { id: 'y-spoke-forged', label: 'Y-Spoke Motorsport Forged (Type 52)' },
  { id: 'ten-spoke-ring', label: '10-Spoke Tension Ring (LD RS)' },
  { id: 'split-five-rs', label: '5-Twin Concave Split (RS 3.0)' },
  { id: 'aero-disc-f1', label: 'F1 Aero Louvered Disc (F1-X)' },
  { id: 'multi-spoke-gt', label: 'Multi-Spoke Motorsport (Le Mans GT)' },
  { id: 'dish-beadlock', label: 'Heavy-Duty Beadlock Ring (Defend 1983)' },
  { id: 'directional-turbine', label: '20-Fin Directional Turbine (Vengeance)' },
  { id: 'classic-horseshoe', label: 'Heritage Horseshoe Monoblock (Mondial)' },
];

export const AdminWheelUploader: React.FC = () => {
  const { navigate } = useRouter();
  const {
    isAdminAuthenticated,
    loginAdmin,
    logoutAdmin,
    addCustomWheelAndProduct,
    customBrandWheels,
    removeCustomWheel,
  } = useForgedStore();

  // Auth gate state
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Wheel Uploader Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('75000');
  const [brand] = useState<'BMW'>('BMW');
  const [bmwModel, setBmwModel] = useState('M3');
  const [series, setSeries] = useState('FORGED SERIES');
  const [diameterBadge, setDiameterBadge] = useState<'20"' | '20-21"' | '22"' | '23"'>('20-21"');
  const [defaultFinish, setDefaultFinish] = useState<WheelFinishId>('satin-black');
  const [geometry, setGeometry] = useState<SpokeGeometryType>('y-spoke-forged');
  const [partNo, setPartNo] = useState('');
  const [description, setDescription] = useState(
    'Direct hub-centric 6061-T6 forged aluminium monoblock wheel set engineered exclusively for BMW M architecture.'
  );

  // Image Upload Placeholder State
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission feedback
  const [formError, setFormError] = useState<string | null>(null);
  const [createdWheel, setCreatedWheel] = useState<{
    wheelSlug: string;
    productSlug: string;
    model: string;
    priceZAR: number;
  } | null>(null);

  const bmwModels = getModelsForMake('BMW');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const ok = loginAdmin(passcode);
    if (!ok) {
      setAuthError('Invalid studio passcode.');
    }
  };

  const processImageFile = (file: File) => {
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Please enter a wheel name (e.g. TYPE 68 FORGED).');
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setFormError('Please enter a valid positive price in Rand (set of 4).');
      return;
    }

    try {
      const { brandWheel, storeProduct } = addCustomWheelAndProduct({
        name: trimmedName,
        series,
        priceZAR: numericPrice,
        imageUrl: imagePreviewUrl.trim() || undefined,
        marques: ['BMW'],
        make: 'BMW',
        vehicleModel: bmwModel,
        yearRange: bmwModel === 'M2' ? '2023 ONWARDS' : '2024 ONWARDS',
        diameterBadge,
        defaultFinish,
        geometry,
        partNo: partNo.trim() || undefined,
        description,
      });

      setCreatedWheel({
        wheelSlug: brandWheel.slug,
        productSlug: storeProduct.slug,
        model: brandWheel.model,
        priceZAR: brandWheel.priceZAR,
      });

      // Reset primary name & partNo for next entry
      setName('');
      setPartNo('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add wheel entry.');
    }
  };

  // Protected Route Authentication Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] flex flex-col justify-between">
        <BrandHeader />

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div
            data-testid="admin-auth-gate"
            className="w-full max-w-md bg-[#121215] border border-[#26262E] rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.15em] text-[#FF5500] font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>PROTECTED ROUTE · /ADMIN/WHEELS</span>
              </span>
              <span className="text-[10px] font-tech-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#18181D] border border-[#26262E] text-[#FF5500]">
                BMW STUDIO ONLY
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-[#F5F5F7]">
                Admin <span className="font-editorial-serif italic text-[#FF5500]">Wheel Uploader</span>.
              </h1>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                This route is restricted to authorised FORGED Custom wheels BMW catalogue administrators. Enter your studio key to unlock the wheel uploader.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-passcode-input"
                  className="block text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC] mb-2"
                >
                  STUDIO ADMIN PASSCODE
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#FF5500] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-passcode-input"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter studio passcode"
                    className="w-full h-12 pl-10 pr-4 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>
              </div>

              {authError && (
                <p className="text-xs font-tech-mono text-[#FF5500]">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-[#FF5500] text-white hover:bg-[#FF6B1A] rounded-full text-xs font-tech-mono font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <Unlock className="w-4 h-4" />
                <span>UNLOCK ADMIN WHEEL UPLOADER</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] flex flex-col justify-between">
      <BrandHeader />

      <main className="flex-1">
        {/* Top Dark Admin Header Banner */}
        <section className="bg-[#0A0A0A] text-[#F5F5F7] px-6 md:px-10 py-10 border-b border-[#26262E]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.15em] text-[#FF5500] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>AUTHENTICATED · PROTECTED ADMIN ROUTE (/ADMIN/WHEELS)</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.03em] leading-none text-[#F5F5F7]">
                Admin <span className="font-editorial-serif italic text-[#FF5500]">Wheel Uploader</span>.
              </h1>
              <p className="text-sm text-[#C2C2CC] max-w-2xl">
                Register new forged wheels directly into the FORGED Custom wheels editorial archive and BMW fitment engine.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/#catalogue')}
                className="border border-[#26262E] hover:border-[#FF5500] hover:text-[#FF5500] text-[#F5F5F7] rounded-full px-5 py-2.5 text-xs font-tech-mono uppercase tracking-[0.12em] transition-colors cursor-pointer"
              >
                View Catalogue
              </button>
              <button
                type="button"
                onClick={logoutAdmin}
                className="bg-[#18181D] border border-[#26262E] hover:border-[#FF5500] text-[#C2C2CC] hover:text-white rounded-full px-5 py-2.5 text-xs font-tech-mono uppercase tracking-[0.12em] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Lock Admin Route</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Admin Uploader Content */}
        <section
          data-testid="admin-wheel-uploader"
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12"
        >
          {createdWheel && (
            <div className="mb-8 p-6 bg-[#121215] text-[#F5F5F7] rounded-3xl border border-[#26262E] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.14em] text-[#25D366]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>NEW BMW WHEEL PUBLISHED LIVE</span>
                </div>
                <h2 className="text-2xl font-medium tracking-tight text-[#F5F5F7]">
                  {createdWheel.model} — {formatZAR(createdWheel.priceZAR)} (BMW)
                </h2>
                <p className="text-xs font-tech-mono text-[#C2C2CC]">
                  Synchronised across the FORGED Custom wheels 360° Catalogue and BMW Storefront.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/wheels/${createdWheel.wheelSlug}`)}
                  className="bg-[#FF5500] text-white hover:bg-[#FF6B1A] rounded-full px-5 py-2.5 text-xs font-tech-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>360° Brand Showcase</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/store/products/${createdWheel.productSlug}`)}
                  className="border border-[#26262E] bg-[#18181D] hover:border-[#FF5500] hover:text-[#FF5500] text-[#F5F5F7] rounded-full px-5 py-2.5 text-xs font-tech-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Store Technical PDP</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Column (5 cols): Interactive Image Upload Placeholder */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#121215] border border-[#26262E] rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech-mono font-bold uppercase tracking-[0.14em] text-[#FF5500]">
                    IMAGE UPLOAD PLACEHOLDER
                  </span>
                  <span className="text-[11px] font-tech-mono uppercase tracking-widest text-[#C2C2CC]">
                    1:1 STUDIO FRAME
                  </span>
                </div>

                {/* Clickable / Droppable Image Placeholder Frame */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="wheel-image-upload-placeholder"
                  className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden ${
                    isDraggingOver
                      ? 'border-[#FF5500] bg-[#18181D]'
                      : 'border-[#26262E] bg-[#141418] hover:border-[#FF5500]'
                  }`}
                >
                  {/* Architectural Corner Ticks */}
                  <div className="absolute inset-4 pointer-events-none">
                    <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#33333E]" />
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#33333E]" />
                    <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#33333E]" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#33333E]" />
                  </div>

                  {imagePreviewUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={imagePreviewUrl}
                        alt={name || 'Uploaded BMW Wheel Preview'}
                        className="w-4/5 h-4/5 object-contain"
                      />
                      <span className="mt-2 px-3 py-1 rounded-full bg-[#FF5500] text-white text-[10px] font-tech-mono uppercase tracking-widest">
                        {imageFileName || 'CUSTOM IMAGE ACTIVE'} · CLICK TO REPLACE
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 z-10">
                      <div className="w-36 h-36 opacity-80">
                        <WheelRenderSVG
                          geometry={geometry}
                          finish={defaultFinish}
                          showShadow={false}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FF5500] text-white text-[11px] font-tech-mono uppercase tracking-[0.14em] shadow-md hover:bg-[#FF6B1A]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>UPLOAD WHEEL IMAGE</span>
                        </div>
                        <p className="text-xs font-tech-mono text-[#C2C2CC] pt-1">
                          IMAGE PLACEHOLDER · DRAG &amp; DROP OR CLICK
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          PNG, JPG, WEBP up to 10MB (defaults to 3D CAD render if empty)
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Direct Image URL Input or Reset */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="admin-wheel-image-url"
                      className="text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] inline-flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>OR PASTE IMAGE URL</span>
                    </label>
                    {imagePreviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviewUrl('');
                          setImageFileName('');
                        }}
                        className="text-[11px] font-tech-mono uppercase text-[#FF5500] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Placeholder</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="admin-wheel-image-url"
                    type="text"
                    value={imagePreviewUrl}
                    onChange={(e) => {
                      setImagePreviewUrl(e.target.value);
                      setImageFileName('EXTERNAL URL');
                    }}
                    placeholder="https://example.com/bmw-wheel.png"
                    className="w-full h-10 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Wheel Entry Form */}
            <div className="lg:col-span-7 space-y-8">
              <form
                onSubmit={handleUploadSubmit}
                className="bg-[#121215] border border-[#26262E] rounded-3xl p-6 sm:p-10 space-y-6"
              >
                <div className="border-b border-[#26262E] pb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-tech-mono uppercase tracking-[0.14em] text-[#FF5500] font-bold">
                      NEW CATALOGUE ENTRY
                    </p>
                    <h2 className="text-2xl font-normal tracking-[-0.02em] text-[#F5F5F7]">
                      Wheel Specification &amp; Fitment
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#18181D] border border-[#26262E] text-[#FF5500] text-[11px] font-tech-mono uppercase tracking-widest font-bold">
                    BMW EXCLUSIVE
                  </span>
                </div>

                {/* Required Core Fields: Name, Price, Brand (BMW Only) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="admin-wheel-name"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      WHEEL NAME *
                    </label>
                    <input
                      id="admin-wheel-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. TYPE 68 FORGED"
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-price"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      PRICE (ZAR, SET OF 4) *
                    </label>
                    <input
                      id="admin-wheel-price"
                      type="number"
                      min="100"
                      step="50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="4850"
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono tabular-nums text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-brand"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      VEHICLE BRAND (BMW ONLY) *
                    </label>
                    <select
                      id="admin-wheel-brand"
                      value={brand}
                      disabled
                      aria-label="Vehicle Brand (BMW Only)"
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono font-bold uppercase text-[#FF5500] cursor-not-allowed"
                    >
                      <option value="BMW">BMW</option>
                    </select>
                  </div>
                </div>

                {/* Secondary BMW Fitment Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="admin-bmw-model"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      BMW CHASSIS MODEL
                    </label>
                    <select
                      id="admin-bmw-model"
                      value={bmwModel}
                      onChange={(e) => setBmwModel(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    >
                      {bmwModels.map((mod) => (
                        <option key={mod} value={mod}>
                          BMW {mod}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-series"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      SERIES COLLECTION
                    </label>
                    <input
                      id="admin-wheel-series"
                      type="text"
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      placeholder="FORGED SERIES"
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-diameter"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      DIAMETER SPEC
                    </label>
                    <select
                      id="admin-wheel-diameter"
                      value={diameterBadge}
                      onChange={(e) =>
                        setDiameterBadge(e.target.value as '20"' | '20-21"' | '22"' | '23"')
                      }
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    >
                      <option value='20"'>20&quot; SQUARE</option>
                      <option value='20-21"'>20-21&quot; STAGGERED</option>
                      <option value='22"'>22&quot; MONOBLOCK</option>
                      <option value='23"'>23&quot; COMPETITION</option>
                    </select>
                  </div>
                </div>

                {/* Finish, Spoke Geometry & Part Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="admin-wheel-finish"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      PRIMARY FINISH
                    </label>
                    <select
                      id="admin-wheel-finish"
                      value={defaultFinish}
                      onChange={(e) => setDefaultFinish(e.target.value as WheelFinishId)}
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    >
                      {Object.values(WHEEL_FINISHES).map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-geometry"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      CAD SPOKE PROFILE
                    </label>
                    <select
                      id="admin-wheel-geometry"
                      value={geometry}
                      onChange={(e) => setGeometry(e.target.value as SpokeGeometryType)}
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    >
                      {GEOMETRY_OPTIONS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-wheel-partno"
                      className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                    >
                      PART NUMBER (OPTIONAL)
                    </label>
                    <input
                      id="admin-wheel-partno"
                      type="text"
                      value={partNo}
                      onChange={(e) => setPartNo(e.target.value)}
                      placeholder="AUTO-GENERATED IF BLANK"
                      className="w-full h-11 px-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                {/* Editorial / Technical Description */}
                <div>
                  <label
                    htmlFor="admin-wheel-description"
                    className="block text-[11px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC] mb-1.5"
                  >
                    TECHNICAL / EDITORIAL SUMMARY
                  </label>
                  <textarea
                    id="admin-wheel-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 bg-[#18181D] border border-[#26262E] rounded-xl text-xs leading-relaxed text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-tech-mono text-[#FF5500]">{formError}</p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-[11px] font-tech-mono text-[#C2C2CC]">
                    BOLT PATTERN: 5×112 · CENTER BORE: 66.6MM (BMW HUB-CENTRIC)
                  </span>

                  <button
                    type="submit"
                    className="bg-[#FF5500] text-white hover:bg-[#FF6B1A] rounded-full px-7 py-3.5 text-xs font-tech-mono font-bold uppercase tracking-[0.15em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>PUBLISH BMW WHEEL ENTRY</span>
                  </button>
                </div>
              </form>

              {/* Manage Custom Uploaded Wheels */}
              <div className="bg-[#121215] border border-[#26262E] rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-tech-mono font-bold uppercase tracking-[0.14em] text-[#F5F5F7]">
                    UPLOADED CUSTOM BMW WHEELS ({customBrandWheels.length})
                  </h3>
                  <span className="text-xs font-tech-mono text-[#C2C2CC]">
                    PERSISTED IN LOCAL CATALOGUE
                  </span>
                </div>

                {customBrandWheels.length === 0 ? (
                  <p className="text-xs font-tech-mono text-neutral-500 py-4">
                    No custom wheels uploaded in this session yet. Use the uploader above to publish a new BMW wheel.
                  </p>
                ) : (
                  <div className="divide-y divide-[#26262E]">
                    {customBrandWheels.map((wheel) => (
                      <div
                        key={wheel.slug}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold font-tech-mono uppercase text-[#F5F5F7]">
                            {wheel.model}{' '}
                            <span className="text-neutral-500 font-normal">|</span>{' '}
                            <span className="text-[#C2C2CC] font-normal">{wheel.series}</span>
                          </p>
                          <p className="text-xs font-tech-mono text-[#FF5500]">
                            BRAND: BMW · {formatZAR(wheel.priceZAR)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/wheels/${wheel.slug}`)}
                            className="px-3.5 py-1.5 rounded-full border border-[#26262E] hover:border-[#FF5500] hover:text-[#FF5500] text-xs font-tech-mono uppercase cursor-pointer text-[#F5F5F7]"
                          >
                            Inspect 360°
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/store/products/${wheel.compatibleStoreProductSlug}`)
                            }
                            className="px-3.5 py-1.5 rounded-full bg-[#18181D] border border-[#26262E] hover:border-[#FF5500] hover:text-[#FF5500] text-white text-xs font-tech-mono uppercase cursor-pointer"
                          >
                            Store PDP
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCustomWheel(wheel.slug)}
                            aria-label={`Delete ${wheel.model}`}
                            className="p-2 text-neutral-400 hover:text-[#FF5500] cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
