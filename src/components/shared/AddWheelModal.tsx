import React, { useState } from 'react';
import {
  X,
  Plus,
  Terminal,
  Copy,
  Check,
  Upload,
  Trash2,
  ArrowUpRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useForgedStore } from '../../store/useForgedStore';
import {
  MARQUE_FILTERS,
  MarqueFilter,
  SpokeGeometryType,
  WHEEL_FINISHES,
  WheelFinishId,
  getAvailableMakes,
  getModelsForMake,
  formatZAR,
} from '../../data/catalogue';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';
import { useRouter } from '../../utils/router';

const GEOMETRY_OPTIONS: Array<{ id: SpokeGeometryType; label: string }> = [
  { id: 'y-spoke-forged', label: 'Y-Spoke Motorsport Forged' },
  { id: 'ten-spoke-ring', label: '10-Spoke Tension Ring' },
  { id: 'split-five-rs', label: '5-Twin Concave Split' },
  { id: 'aero-disc-f1', label: 'F1 Aero Louvered Disc (F1-X)' },
  { id: 'multi-spoke-gt', label: 'Multi-Spoke Motorsport' },
  { id: 'dish-beadlock', label: 'Heavy-Duty Beadlock Ring (Defend 1983)' },
  { id: 'directional-turbine', label: '20-Fin Directional Turbine' },
  { id: 'classic-horseshoe', label: 'Heritage Horseshoe Monoblock' },
];

export const AddWheelModal: React.FC = () => {
  const { navigate } = useRouter();
  const {
    isAddWheelModalOpen,
    setAddWheelModalOpen,
    addCustomWheelAndProduct,
    customBrandWheels,
    removeCustomWheel,
  } = useForgedStore();

  const [name, setName] = useState('');
  const [series, setSeries] = useState('FORGED SERIES');
  const [priceZAR, setPriceZAR] = useState('75000');
  const [originalPriceZAR, setOriginalPriceZAR] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrlsInput, setGalleryUrlsInput] = useState('');
  const [selectedMarques, setSelectedMarques] = useState<Exclude<MarqueFilter, 'ALL'>[]>([
    'BMW',
  ]);
  const [make, setMake] = useState('BMW');
  const [vehicleModel, setVehicleModel] = useState('M3');
  const [yearRange, setYearRange] = useState('2024 ONWARDS');
  const [diameterBadge, setDiameterBadge] = useState<'20"' | '20-21"' | '22"' | '23"'>('20-21"');
  const [defaultFinish, setDefaultFinish] = useState<WheelFinishId>('satin-black');
  const [geometry, setGeometry] = useState<SpokeGeometryType>('aero-disc-f1');
  const [partNo, setPartNo] = useState('');
  const [frontWheelSize, setFrontWheelSize] = useState('9.5 X 20 ET18');
  const [rearWheelSize, setRearWheelSize] = useState('10.5 X 21 ET20');
  const [boltPattern, setBoltPattern] = useState('5 X 112');
  const [headline, setHeadline] = useState('Carbon-lip forged architecture.');
  const [description, setDescription] = useState(
    'CNC-machined from 6061-T6 aerospace forging blocks with weight-optimized spoke pockets and direct hub-centric OEM fitment.'
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [copiedCli, setCopiedCli] = useState(false);
  const [createdWheelSlugs, setCreatedWheelSlugs] = useState<{
    wheelSlug: string;
    productSlug: string;
    model: string;
  } | null>(null);

  if (!isAddWheelModalOpen) return null;

  const availableMakes = getAvailableMakes();
  const availableModels = make ? getModelsForMake(make) : [];

  const toggleMarque = (m: Exclude<MarqueFilter, 'ALL'>) => {
    setSelectedMarques((prev) =>
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const cliCommand = [
    'npm run add-wheel --',
    `--name "${name || 'NEW WHEEL'}"`,
    `--series "${series || 'FORGED SERIES'}"`,
    `--price ${Number(priceZAR) || 75000}`,
    originalPriceZAR ? `--original-price ${Number(originalPriceZAR)}` : '',
    imageUrl && !imageUrl.startsWith('data:') ? `--image "${imageUrl}"` : '',
    `--marques "${selectedMarques.join(',') || 'BMW'}"`,
    `--make "${make}"`,
    `--model "${vehicleModel}"`,
    `--diameter '${diameterBadge}'`,
    `--finish "${defaultFinish}"`,
    `--geometry "${geometry}"`,
    partNo ? `--part-no "${partNo}"` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleCopyCli = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cliCommand).catch(() => {});
    }
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormError(null);
      const galleryImages = galleryUrlsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { brandWheel, storeProduct } = addCustomWheelAndProduct({
        name,
        series,
        priceZAR: Number(priceZAR),
        originalPriceZAR: originalPriceZAR ? Number(originalPriceZAR) : undefined,
        imageUrl: imageUrl.trim() || undefined,
        galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
        marques: selectedMarques.length > 0 ? selectedMarques : ['BMW'],
        make,
        vehicleModel,
        yearRange,
        diameterBadge,
        defaultFinish,
        geometry,
        partNo,
        frontWheelSize,
        rearWheelSize,
        boltPattern,
        headline,
        description,
      });

      setCreatedWheelSlugs({
        wheelSlug: brandWheel.slug,
        productSlug: storeProduct.slug,
        model: brandWheel.model,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to add wheel.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add New Wheel to FORGED Custom wheels Catalogue & Store"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-5xl bg-[#0A0A0A] text-[#F5F5F7] border border-[#26262E] shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-[#0A0A0A] text-[#F5F5F7] flex items-center justify-between border-b border-[#26262E] shrink-0">
          <div>
            <p className="text-[11px] font-tech-mono uppercase tracking-[0.16em] text-[#FF5500] font-bold">
              FORGED CUSTOM WHEELS CATALOGUE ENGINE
            </p>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#F5F5F7]">
              ADD NEW FORGED WHEEL (UI + CLI SCRIPT GENERATOR)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setCreatedWheelSlugs(null);
              setAddWheelModalOpen(false);
            }}
            aria-label="Close Add Wheel Modal"
            className="w-9 h-9 flex items-center justify-center text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Live Stage Preview + CLI Script Box + Added Wheels List */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#121215] border border-[#26262E] p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[11px] font-tech-mono uppercase text-[#C2C2CC] mb-2">
                <span>LIVE WHEEL PREVIEW</span>
                <span className="text-[#FF5500] font-bold">{diameterBadge}</span>
              </div>
              <div className="w-56 h-56 flex items-center justify-center">
                <WheelRenderSVG
                  geometry={geometry}
                  finish={defaultFinish}
                  imageUrl={imageUrl.trim() || undefined}
                />
              </div>
              <div className="w-full mt-4 pt-3 border-t border-[#26262E] flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-bold font-tech-mono uppercase text-[#F5F5F7]">
                    {name || 'UNTITLED'} <span className="text-neutral-500">|</span>{' '}
                    <span className="font-normal text-[#C2C2CC]">{series}</span>
                  </p>
                  <p className="text-[11px] font-tech-mono text-[#C2C2CC]">
                    FITMENT: {make} {vehicleModel}
                  </p>
                </div>
                <span className="text-base font-extrabold font-tech-mono tabular-nums text-[#FF5500]">
                  {formatZAR(Number(priceZAR) || 0)}
                </span>
              </div>
            </div>

            {/* Equivalent Terminal CLI Script Command */}
            <div className="bg-[#141418] text-[#F5F5F7] p-4 border border-[#26262E] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-tech-mono uppercase tracking-wider text-[#FF5500] inline-flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 shrink-0" />
                  <span>CLI SCRIPT (scripts/add-wheel.ts)</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCli}
                  className="px-2.5 py-1 bg-[#18181D] hover:bg-[#26262E] border border-[#26262E] text-[11px] font-tech-mono uppercase inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 text-[#F5F5F7]"
                >
                  {copiedCli ? (
                    <>
                      <Check className="w-3 h-3 text-[#25D366]" />
                      <span className="text-[#25D366]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#FF5500]" />
                      <span>COPY CLI</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[11px] font-tech-mono text-[#C2C2CC] overflow-x-auto whitespace-pre-wrap break-all bg-[#0A0A0A] p-2.5 border border-[#26262E]">
                {cliCommand}
              </pre>
              <p className="text-[11px] text-[#C2C2CC] leading-relaxed">
                Run in terminal to append directly to <code className="text-[#FF5500]">src/data/customWheels.json</code>, or submit the form on the right to add immediately in the browser.
              </p>
            </div>

            {/* Session Custom Wheels List */}
            {customBrandWheels.length > 0 && (
              <div className="border border-[#26262E] p-4 space-y-2.5 bg-[#121215]">
                <p className="text-xs font-tech-mono font-bold uppercase tracking-wider text-[#F5F5F7]">
                  CUSTOM WHEELS IN CATALOGUE ({customBrandWheels.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {customBrandWheels.map((cw) => (
                    <div
                      key={cw.slug}
                      className="flex items-center justify-between p-2 bg-[#18181D] border border-[#26262E] text-xs font-tech-mono"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setAddWheelModalOpen(false);
                          navigate(`/wheels/${cw.slug}`);
                        }}
                        className="font-bold uppercase hover:underline text-left truncate pr-2 cursor-pointer text-[#F5F5F7] hover:text-[#FF5500]"
                      >
                        {cw.model} ({cw.series}) — {formatZAR(cw.priceZAR)}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomWheel(cw.slug)}
                        aria-label={`Remove ${cw.model}`}
                        className="text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Wheel Specification Form */}
          <div className="lg:col-span-7">
            {createdWheelSlugs && (
              <div className="mb-5 p-4 bg-emerald-950/40 border border-emerald-800 space-y-3">
                <p className="text-xs font-tech-mono font-bold uppercase text-emerald-400">
                  ✓ {createdWheelSlugs.model} ADDED TO BRAND CATALOGUE &amp; VEHICLE STOREFRONT
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = createdWheelSlugs.wheelSlug;
                      setCreatedWheelSlugs(null);
                      setAddWheelModalOpen(false);
                      navigate(`/wheels/${target}`);
                    }}
                    className="px-4 py-2 bg-[#FF5500] text-white text-xs font-tech-mono font-bold uppercase inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#FF6B1A]"
                  >
                    <span>OPEN 360° BRAND SHOWCASE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = createdWheelSlugs.productSlug;
                      setCreatedWheelSlugs(null);
                      setAddWheelModalOpen(false);
                      navigate(`/store/products/${target}`);
                    }}
                    className="px-4 py-2 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono font-bold uppercase inline-flex items-center gap-1.5 cursor-pointer hover:border-[#FF5500] hover:text-[#FF5500]"
                  >
                    <span>OPEN TECHNICAL STORE PDP</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Wheel Name, Series, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="wheel-name-input"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1 whitespace-nowrap"
                  >
                    WHEEL NAME *
                  </label>
                  <input
                    id="wheel-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. FSA005"
                    className="w-full h-10 px-3 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="wheel-series-input"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1 whitespace-nowrap"
                  >
                    SERIES *
                  </label>
                  <input
                    id="wheel-series-input"
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="FORGED / CARBON"
                    className="w-full h-10 px-3 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wheel-price-input"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1 whitespace-nowrap"
                  >
                    PRICE (ZAR, SET OF 4) *
                  </label>
                  <input
                    id="wheel-price-input"
                    type="number"
                    min="100"
                    step="50"
                    value={priceZAR}
                    onChange={(e) => setPriceZAR(e.target.value)}
                    className="w-full h-10 px-3 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono tabular-nums focus:outline-none focus:border-[#FF5500]"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Image URL + Upload Local Image */}
              <div className="p-3.5 bg-[#121215] border border-[#26262E] space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="wheel-image-url"
                    className="text-[11px] font-tech-mono font-bold uppercase tracking-wider text-[#F5F5F7] inline-flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>PRIMARY WHEEL IMAGE URL OR UPLOAD PHOTO</span>
                  </label>
                  <label className="px-3 py-1 bg-[#18181D] border border-[#26262E] hover:border-[#FF5500] hover:text-[#FF5500] text-[#F5F5F7] text-[11px] font-tech-mono uppercase inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3 h-3 text-[#FF5500]" />
                    <span>UPLOAD IMAGE FILE</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <input
                  id="wheel-image-url"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/wheel.png (leave blank to use 3D Forged SVG CAD render)"
                  className="w-full h-10 px-3 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono focus:outline-none focus:border-[#FF5500]"
                />

                <div>
                  <label
                    htmlFor="wheel-gallery-urls"
                    className="block text-[10px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    ADDITIONAL 2X2 GALLERY IMAGE URLS (COMMA-SEPARATED, OPTIONAL)
                  </label>
                  <input
                    id="wheel-gallery-urls"
                    type="text"
                    value={galleryUrlsInput}
                    onChange={(e) => setGalleryUrlsInput(e.target.value)}
                    placeholder="https://example.com/angle-1.jpg, https://example.com/angle-2.jpg"
                    className="w-full h-9 px-3 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              {/* Row 3: Vehicle Fitment Make, Model, Diameter, Part No */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="wheel-fitment-make"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    FITMENT MAKE
                  </label>
                  <select
                    id="wheel-fitment-make"
                    value={make}
                    onChange={(e) => {
                      const nextMake = e.target.value;
                      setMake(nextMake);
                      const nextModels = getModelsForMake(nextMake);
                      if (nextModels.length > 0) setVehicleModel(nextModels[0]);
                    }}
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono uppercase"
                  >
                    {availableMakes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wheel-fitment-model"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    FITMENT MODEL
                  </label>
                  <select
                    id="wheel-fitment-model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono uppercase"
                  >
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wheel-diameter"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    DIAMETER BADGE
                  </label>
                  <select
                    id="wheel-diameter"
                    value={diameterBadge}
                    onChange={(e) =>
                      setDiameterBadge(e.target.value as '20"' | '20-21"' | '22"' | '23"')
                    }
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono uppercase"
                  >
                    <option value='20"'>20&quot;</option>
                    <option value='20-21"'>20-21&quot; STAGGERED</option>
                    <option value='22"'>22&quot;</option>
                    <option value='23"'>23&quot;</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wheel-partno"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    PART NO
                  </label>
                  <input
                    id="wheel-partno"
                    type="text"
                    value={partNo}
                    onChange={(e) => setPartNo(e.target.value)}
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono uppercase"
                  />
                </div>
              </div>

              {/* Row 4: Spoke Geometry & Default Finish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="wheel-geometry"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    3D SPOKE GEOMETRY (CAD / FALLBACK)
                  </label>
                  <select
                    id="wheel-geometry"
                    value={geometry}
                    onChange={(e) => setGeometry(e.target.value as SpokeGeometryType)}
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono"
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
                    htmlFor="wheel-finish"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                  >
                    DEFAULT FINISH SWATCH
                  </label>
                  <select
                    id="wheel-finish"
                    value={defaultFinish}
                    onChange={(e) => setDefaultFinish(e.target.value as WheelFinishId)}
                    className="w-full h-10 px-2.5 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono uppercase"
                  >
                    {Object.values(WHEEL_FINISHES).map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5: Compatible Marques Filter Pills */}
              <div>
                <span className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5">
                  DEVELOPED FOR MARQUES (BRAND CATALOGUE FILTER):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MARQUE_FILTERS.filter((m): m is Exclude<MarqueFilter, 'ALL'> => m !== 'ALL').map(
                    (m) => {
                      const active = selectedMarques.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMarque(m)}
                          className={`px-3 py-1 text-[11px] font-tech-mono uppercase border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FF5500] text-white border-[#FF5500] font-bold'
                              : 'bg-[#18181D] text-[#C2C2CC] border-[#26262E] hover:border-[#FF5500] hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Row 6: Editorial Description */}
              <div>
                <label
                  htmlFor="wheel-description"
                  className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1"
                >
                  TECHNICAL / EDITORIAL DESCRIPTION
                </label>
                <textarea
                  id="wheel-description"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {formError && (
                <p className="text-xs font-tech-mono text-[#FF5500]">{formError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddWheelModalOpen(false)}
                  className="px-5 py-3 border border-[#26262E] text-[#C2C2CC] text-xs font-tech-mono uppercase tracking-wider hover:border-neutral-500 hover:text-white cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#FF5500] text-white text-xs font-tech-mono font-bold uppercase tracking-[0.16em] hover:bg-[#FF6B1A] inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD WHEEL TO CATALOGUE &amp; STORE</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
