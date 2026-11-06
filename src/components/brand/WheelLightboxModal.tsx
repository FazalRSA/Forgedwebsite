import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BrandWheelItem,
  getWheelImages,
  WHEEL_FINISHES,
  WheelFinishId,
} from '../../data/kahnData';
import { useKahnStore } from '../../store/useKahnStore';

interface WheelLightboxModalProps {
  wheel: BrandWheelItem | null;
  initialAngleIdx?: 0 | 1 | 2;
  initialFinish?: WheelFinishId;
  onClose: () => void;
}

export const WheelLightboxModal: React.FC<WheelLightboxModalProps> = ({
  wheel,
  initialAngleIdx = 0,
  initialFinish,
  onClose,
}) => {
  const { openEnquiryModal } = useKahnStore();

  const [activeAngleIdx, setActiveAngleIdx] = useState<0 | 1 | 2>(initialAngleIdx);
  const [selectedFinish, setSelectedFinish] = useState<WheelFinishId>(
    initialFinish || wheel?.defaultFinish || 'silver'
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (wheel) {
      setActiveAngleIdx(initialAngleIdx);
      setSelectedFinish(initialFinish || wheel.defaultFinish);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [wheel, initialAngleIdx, initialFinish]);

  const handleSelectAngle = useCallback((idx: 0 | 1 | 2) => {
    setActiveAngleIdx(idx);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setImageLoaded(false);
  }, []);

  const handleNextAngle = useCallback(() => {
    handleSelectAngle(((activeAngleIdx + 1) % 3) as 0 | 1 | 2);
  }, [activeAngleIdx, handleSelectAngle]);

  const handlePrevAngle = useCallback(() => {
    handleSelectAngle(((activeAngleIdx - 1 + 3) % 3) as 0 | 1 | 2);
  }, [activeAngleIdx, handleSelectAngle]);

  useEffect(() => {
    if (!wheel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextAngle();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevAngle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wheel, onClose, handleNextAngle, handlePrevAngle]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(1, +(prev - 0.25).toFixed(2));
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    const maxOffset = (zoomLevel - 1) * 300;
    const newX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - dragStart.x));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - dragStart.y));
    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const handleStageBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && zoomLevel === 1) {
      onClose();
    }
  };

  if (!wheel) return null;

  const wheelData = getWheelImages(wheel);
  const activeImage = wheelData.images[activeAngleIdx];
  const activeLabel = wheelData.labels[activeAngleIdx];
  const activeFinishObj = WHEEL_FINISHES[selectedFinish] || WHEEL_FINISHES.silver;
  const displayPrice =
    wheel.priceFormatted || `R ${wheel.basePriceGBP.toLocaleString('en-ZA')}`;

  const finishFilterMap: Record<WheelFinishId, string> = {
    silver: 'contrast(1.04) brightness(1.03)',
    'satin-black': 'brightness(0.84) contrast(1.18) saturate(0.75)',
    'champagne-bronze': 'sepia(0.28) saturate(1.35) hue-rotate(-8deg) contrast(1.06)',
    'dark-gunmetal': 'brightness(0.92) contrast(1.12) saturate(0.85)',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${wheel.model} Lightbox`}
      className="fixed inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl flex flex-col justify-between select-none overflow-hidden text-[#F5F5F7] animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Minimal Header: Title + Quiet Spec Line + Close */}
      <header className="relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-medium tracking-tight text-white truncate">
            {wheel.model}
          </h2>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {[wheel.sizesAvailable, wheel.compatibleCars, displayPrice]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Lightbox (ESC)"
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Stage */}
      <main
        onClick={handleStageBackdropClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        className={`relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 sm:px-12 select-none ${
          zoomLevel > 1
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-default'
        }`}
      >
        <div
          onClick={handleImageClick}
          className={`relative max-w-4xl max-h-[72vh] w-full h-full flex items-center justify-center ${
            zoomLevel === 1 ? 'cursor-zoom-in' : 'cursor-zoom-out'
          }`}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <img
            src={activeImage}
            alt={`${wheel.model} - ${activeLabel}`}
            loading="eager"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            style={{ filter: finishFilterMap[selectedFinish] }}
            className={`max-w-full max-h-[70vh] object-contain rounded-xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-30'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevAngle();
          }}
          aria-label="Previous Angle"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNextAngle();
          }}
          aria-label="Next Angle"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>

      {/* Minimal Footer: Clean Angle Thumbnails + Subtle Finish Dots + Enquire */}
      <footer className="relative z-20 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Finish Swatch Dots (Only shown if multiple finishes exist) */}
        <div className="flex items-center gap-2">
          {wheel.availableFinishes.length > 1 &&
            wheel.availableFinishes.map((fId) => {
              const finish = WHEEL_FINISHES[fId];
              const isActive = selectedFinish === fId;
              return (
                <button
                  key={fId}
                  type="button"
                  onClick={() => setSelectedFinish(fId)}
                  title={finish.name}
                  aria-label={finish.name}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    isActive ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: finish.swatchHex }}
                  />
                </button>
              );
            })}
        </div>

        {/* Centered 3-Angle Thumbnails (Clean squares without text clutter) */}
        <div className="flex items-center gap-3">
          {wheelData.images.map((imgUrl, idx) => {
            const isActive = activeAngleIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAngle(idx as 0 | 1 | 2)}
                aria-label={`View angle ${idx + 1}`}
                className={`w-12 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  isActive
                    ? 'border-white scale-105 opacity-100'
                    : 'border-white/15 opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={imgUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* Single Clean Action */}
        <button
          type="button"
          onClick={() => {
            const finishName = wheel.finishName || activeFinishObj.name;
            onClose();
            openEnquiryModal({
              subject: `${wheel.model} Enquiry (${finishName})`,
              finish: finishName,
              priceGBP: wheel.basePriceGBP,
              domain: 'brand',
            });
          }}
          className="px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-medium tracking-wide transition-colors cursor-pointer"
        >
          Enquire
        </button>
      </footer>
    </div>
  );
};
