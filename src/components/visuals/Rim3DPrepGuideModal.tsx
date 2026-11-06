import React, { useState } from 'react';
import {
  X,
  FileCode2,
  Layers,
  Compass,
  Palette,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Box,
  HardDrive,
  Download,
} from 'lucide-react';

interface Rim3DPrepGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUploadFile?: () => void;
}

export const Rim3DPrepGuideModal: React.FC<Rim3DPrepGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectUploadFile,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'cad' | 'materials' | 'checklist'>('quick');

  if (!isOpen) return null;

  const specSummaryText = `
FORGED WHEEL 3D ASSET SPECIFICATION (WebGL / Three.js)
======================================================
1. File Format: .GLB (Binary glTF 2.0 with embedded buffers and textures)
2. Origin & Pivot: Center of wheel bore / axle at (0.0, 0.0, 0.0)
3. Orientation: Front wheel face facing +Z (forward elevation), Axle spins on Z-axis
4. Dimensions: Real-world scale in Meters (e.g. 22" wheel = ~0.558m diameter, 10.5J = ~0.267m barrel width)
   * Note: The viewer includes an auto-normalizer that automatically scales models in mm or cm.
5. Geometry & Polycount:
   - Target: 35,000 to 80,000 triangles total (Max 120,000 for complex multi-piece)
   - Clean manifold topology, smoothed normals, micro-chamfered bevels
   - No tire geometry (rim only)
6. Object Hierarchy & Sub-Mesh Naming:
   - "Rim_Barrel": Outer stepped forged rim and inner barrel
   - "Rim_Face_Spokes": Monoblock center spokes / disc
   - "Hardware_Bolts": Lug nuts and perimeter 2-piece / 3-piece rim bolts
   - "Center_Cap": Billet center cap / crest disc
7. PBR Materials (Metallic-Roughness):
   - Albedo / BaseColor: sRGB 2048x2048 (PNG or WebP)
   - Normal Map: OpenGL format (Y+ Green Up) 2048x2048
   - Roughness + Metalness + AO: Packed ORM texture (R: AO, G: Roughness, B: Metalness)
   - Clearcoat: 0.05 - 0.25 roughness for gloss clear finishes
======================================================
`.trim();

  const handleCopySpec = async () => {
    try {
      await navigator.clipboard.writeText(specSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prep-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0E0E12] border border-[#26262E] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 font-sans">
        {/* Header */}
        <div className="p-5 sm:px-7 sm:py-5 border-b border-[#22222A] bg-[#121217] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF5500]/10 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="prep-guide-title" className="text-base sm:text-lg font-bold uppercase tracking-tight text-white font-mono">
                  Photorealistic 3D Rim Specification
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A1A22] border border-[#2E2E38] text-[#FF5500]">
                  GLTF 2.0 / GLB
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Technical pipeline for preparing CAD and 3D DCC models for real-time WebGL studio rendering
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close specification guide"
            className="w-8 h-8 rounded-lg bg-[#181820] border border-[#26262E] hover:border-neutral-500 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-7 pt-3 bg-[#111116] border-b border-[#22222A] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'quick'
                ? 'border-[#FF5500] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            01 / Fast Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cad')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'cad'
                ? 'border-[#FF5500] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            02 / Origin, Scale & Hierarchy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'materials'
                ? 'border-[#FF5500] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            03 / PBR Textures & Materials
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-[#FF5500] text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            04 / Export Checklist
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {activeTab === 'quick' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span>Container Format</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono">.GLB (Binary)</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Single self-contained file with embedded geometry, materials, and textures. Target file size: <strong>under 15MB</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>Polycount Target</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono">40k - 80k Tris</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Retain clean CNC chamfers and curved spoke fillets while ensuring 60 FPS fluidity on desktop and mobile GPUs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Axle & Pivot</span>
                  </div>
                  <p className="text-base font-bold text-white font-mono">Center (0, 0, 0)</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Hub bore placed at the world origin. Rim face oriented toward <strong>+Z</strong>, rotational axis around <strong>Z-axis</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#16161D] border border-[#2A2A34]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold mb-2">
                  Key Requirements for Photorealism in WebGL:
                </h3>
                <ul className="space-y-2 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span><strong>No Tires:</strong> Keep the model as bare forged rim only (barrel, spokes, bolts, cap). The studio shadow and clearance rig are calibrated directly to bare rims.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span><strong>PBR Standard:</strong> Metallic-Roughness workflow. Do NOT use legacy specular/glossiness or Phong shaders.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span><strong>Micro-Bevels:</strong> Ensure spoke edges have a 0.5mm - 1.0mm chamfer or baked normal map so studio highlights catch rim silhouettes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                    <span><strong>Separate Sub-Meshes:</strong> Keep barrel, spokes, center cap, and bolts in distinct meshes so the viewer can explode layers and apply finish swatches dynamically.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'cad' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Pivot Coordinates & Alignment</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-300">
                  <div className="bg-[#0B0B0E] p-3.5 rounded-lg border border-[#1F1F27] space-y-1.5 font-mono">
                    <p className="text-[#FF5500] font-bold">Pivot Center: (0.0, 0.0, 0.0)</p>
                    <p>• Axle Bore center = (0, 0, 0)</p>
                    <p>• Front Rim Face = +Z (facing camera)</p>
                    <p>• Rear Inner Barrel = -Z (facing hub)</p>
                    <p>• Up Vector = +Y (vertical)</p>
                    <p>• Spin Vector = Rotate around Z-axis</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Why this matters:</p>
                    <p className="text-neutral-400">
                      When you use the rotational speed & direction slider, the scene rotates the wheel around its axle vector. If the pivot is offset, the wheel will wobble or orbit eccentric to its hub.
                    </p>
                    <p className="text-neutral-400 mt-2">
                      In Blender: Select object, <code className="bg-[#1C1C24] px-1 py-0.5 rounded text-white">Object &gt; Set Origin &gt; Origin to Geometry</code>, then set Location to <code className="bg-[#1C1C24] px-1 py-0.5 rounded text-white">(0, 0, 0)</code>, then <code className="bg-[#1C1C24] px-1 py-0.5 rounded text-white">Ctrl + A &gt; Apply All Transforms</code>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Sub-Mesh Hierarchy & Naming</span>
                </div>
                <p className="text-xs text-neutral-300 mb-3">
                  Organize your wheel into these 4 top-level child meshes inside the root glTF scene to unlock interactive exploded views and finish swaps:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A]">
                    <span className="text-[#FF5500] font-semibold">1. Rim_Barrel</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Forged drop-center barrel, bead seats, outer stepped lip flange, and rear barrel lip.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A]">
                    <span className="text-[#FF5500] font-semibold">2. Rim_Face_Spokes</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Front CNC milled spokes, concave spider, and hub face.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A]">
                    <span className="text-[#FF5500] font-semibold">3. Hardware_Bolts</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">5 lug nuts / centerlock ring + outer perimeter assembly bolts.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A]">
                    <span className="text-[#FF5500] font-semibold">4. Center_Cap</span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Forged center cap with branded emblem and retaining bezel.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF5500] uppercase mb-2">
                  <Palette className="w-4 h-4" />
                  <span>PBR Metallic-Roughness Setup</span>
                </div>
                <p className="text-xs text-neutral-300 mb-3">
                  For lifelike brushed, diamond-cut, satin, and gloss forged finishes, follow the standard glTF PBR channel mapping:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-white font-mono">BaseColor / Albedo</strong>
                      <p className="text-neutral-400">sRGB color space. Linear values. 2048x2048 max resolution.</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#FF5500]">RGB (No Alpha needed)</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-white font-mono">Normal Map</strong>
                      <p className="text-neutral-400">OpenGL format (Green Channel = Y+ Up). Non-color data.</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#FF5500]">Tangent Space (RGB)</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#0E0E14] border border-[#22222A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-white font-mono">Packed ORM (Occlusion / Roughness / Metalness)</strong>
                      <p className="text-neutral-400">Red: Ambient Occlusion | Green: Roughness | Blue: Metalness.</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#FF5500]">glTF Standard Spec</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold mb-2">
                  Typical Material Values for Forged Wheels:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded bg-[#0A0A0E] border border-[#22222A]">
                    <p className="font-bold text-white font-mono">Brushed Silver / Titanium</p>
                    <p className="text-neutral-400 mt-1 font-mono text-[11px]">Metalness: 0.95</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Roughness: 0.18 - 0.24</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Radial anisotropic brush</p>
                  </div>
                  <div className="p-3 rounded bg-[#0A0A0E] border border-[#22222A]">
                    <p className="font-bold text-white font-mono">Satin Black / Dark Gunmetal</p>
                    <p className="text-neutral-400 mt-1 font-mono text-[11px]">Metalness: 0.82</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Roughness: 0.35 - 0.42</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Micro-fine grain texture</p>
                  </div>
                  <div className="p-3 rounded bg-[#0A0A0E] border border-[#22222A]">
                    <p className="font-bold text-white font-mono">Gloss Gold / Bronze</p>
                    <p className="text-neutral-400 mt-1 font-mono text-[11px]">Metalness: 0.90</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Roughness: 0.12 - 0.16</p>
                    <p className="text-neutral-400 font-mono text-[11px]">Clearcoat: 0.85 (Clearcoat rough 0.05)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14141A] border border-[#22222A]">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#FF5500] font-bold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Final Pre-Flight Checklist Before Exporting .GLB</span>
                </h3>

                <div className="space-y-2.5 text-xs text-neutral-300">
                  <label className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-[#FF5500]" />
                    <span><strong>Origin:</strong> Center bore is located at (0, 0, 0) and all transforms are applied (<code className="bg-[#1C1C24] px-1 py-0.5 rounded text-white">Ctrl+A</code>).</span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-[#FF5500]" />
                    <span><strong>No Tire:</strong> The tire object has been removed or hidden from the export.</span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-[#FF5500]" />
                    <span><strong>Scale:</strong> Scale values are set to (1.0, 1.0, 1.0) with real-world dimensions.</span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-[#FF5500]" />
                    <span><strong>UV Unwrapping:</strong> Clean UV map with non-overlapping islands for spokes and machined barrel faces.</span>
                  </label>
                  <label className="flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 accent-[#FF5500]" />
                    <span><strong>glTF Settings:</strong> Export format = <strong>glTF Binary (.glb)</strong>, Include Selected Objects, Apply Modifiers, Tangents enabled.</span>
                  </label>
                </div>
              </div>

              {/* CAD Converter workflow callout */}
              <div className="p-4 rounded-xl bg-[#16161F] border border-[#2A2A38] text-xs">
                <span className="font-mono text-white font-bold block mb-1">
                  Exporting from SolidWorks / Fusion 360 / Rhino / STEP Files:
                </span>
                <p className="text-neutral-400 leading-normal">
                  CAD tools generate raw unoptimized NURBS tessellations. The industry standard pipeline is:
                  Export STEP / OBJ from CAD &rarr; Import into Blender &rarr; Apply <strong className="text-neutral-200">Quad Remesh</strong> or <strong className="text-neutral-200">Decimate</strong> to ~60k triangles &rarr; Mark Seams & Unwrap UVs &rarr; Export as <strong className="text-[#FF5500]">.glb</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-7 sm:py-4 border-t border-[#22222A] bg-[#111116] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopySpec}
            className="px-3.5 py-2 rounded-lg bg-[#181820] border border-[#2E2E38] hover:border-neutral-500 text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Spec Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Technical Spec Sheet</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {onSelectUploadFile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectUploadFile();
                }}
                className="px-4 py-2 rounded-lg bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Test Upload .GLB File</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1D1D26] hover:bg-[#252532] text-xs font-mono text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
