import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BrandWheelItem,
  getWheelImages,
  WheelFinishId,
  formatZAR,
} from '../../data/catalogue';
import { SafeImage } from '../shared/SafeImage';
import { ContactCta } from './ContactCta';

interface WheelLightboxModalProps {
  wheel: BrandWheelItem | null;
  initialAngleIdx?: 0 | 1 | 2;
  /** Accepted so existing callers still compile. A listing is one finish, and its photos are shown as shot. */
  initialFinish?: WheelFinishId;
  onClose: () => void;
}

export const WheelLightboxModal: React.FC<WheelLightboxModalProps> = ({
  wheel,
  initialAngleIdx = 0,
  onClose,
}) => {
  const [activeAngleIdx, setActiveAngleIdx] = useState<0 | 1 | 2>(initialAngleIdx);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (wheel) {
      setActiveAngleIdx(initialAngleIdx);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [wheel, initialAngleIdx]);

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

  // Touch equivalents: one finger drags/pans when zoomed in (mirrors mouse
  // drag), two fingers pinch-zoom (mirrors the wheel-zoom step).
  const pinchDistRef = useRef<number | null>(null);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchDistRef.current = getTouchDistance(e.touches);
      return;
    }
    if (zoomLevel <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      if (dist != null && pinchDistRef.current != null) {
        const delta = dist - pinchDistRef.current;
        if (Math.abs(delta) > 4) {
          setZoomLevel((prev) => {
            const next = Math.max(1, Math.min(2.5, +(prev + (delta > 0 ? 0.08 : -0.08)).toFixed(2)));
            if (next === 1) setPanOffset({ x: 0, y: 0 });
            return next;
          });
          pinchDistRef.current = dist;
        }
      }
      return;
    }
    if (!isDragging || zoomLevel <= 1) return;
    const touch = e.touches[0];
    const maxOffset = (zoomLevel - 1) * 300;
    const newX = Math.max(-maxOffset, Math.min(maxOffset, touch.clientX - dragStart.x));
    const newY = Math.max(-maxOffset, Math.min(maxOffset, touch.clientY - dragStart.y));
    setPanOffset({ x: newX, y: newY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchDistRef.current = null;
    }
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
  const displayPrice = `${formatZAR(wheel.priceZAR)} per set of 4`;
  const design = wheel.modelCode || wheel.model;
  const finishName = wheel.finishName ?? '';
  const heading = finishName ? `${design} ${finishName}` : design;
  const enquiryMessage = `Hi, I'd like to ask about the ${design}${finishName ? ` in ${finishName}` : ''}${
    wheel.sizesAvailable ? ` (${wheel.sizesAvailable})` : ''
  }. Is it still available?`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${heading} photos`}
      className="fixed inset-0 z-50 bg-[#070709]/95 backdrop-blur-xl flex flex-col justify-between select-none overflow-hidden text-[#EDEBE4] animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Minimal Header: Title + Quiet Spec Line + Close */}
      <header className="relative z-20 px-6 sm:px-10 py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-medium tracking-tight text-white truncate">
            {heading}
          </h2>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {[wheel.sizesAvailable, displayPrice].filter(Boolean).join(', ')}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`relative flex-1 w-full flex items-center justify-center overflow-hidden px-4 sm:px-12 select-none touch-none ${
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
          <SafeImage
            src={activeImage}
            alt={`${heading}, photo ${activeAngleIdx + 1} of 3`}
            fallbackLabel={activeLabel}
            fallbackClassName="w-full h-full min-h-[280px] rounded-xl"
            loading="eager"
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
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
          aria-label="Previous photo"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNextAngle();
          }}
          aria-label="Next photo"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>

      {/* Footer: photo thumbnails and the enquiry button */}
      <footer className="relative z-20 px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Centered 3-Angle Thumbnails (Clean squares without text clutter) */}
        <div className="flex items-center gap-3">
          {wheelData.images.map((imgUrl, idx) => {
            const isActive = activeAngleIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectAngle(idx as 0 | 1 | 2)}
                aria-label={`Show photo ${idx + 1}`}
                className={`w-12 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  isActive
                    ? 'border-white scale-105 opacity-100'
                    : 'border-white/15 opacity-50 hover:opacity-80'
                }`}
              >
                <SafeImage
                  src={imgUrl}
                  alt=""
                  fallbackLabel={wheelData.labels[idx]}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>

        {/* One action: WhatsApp with the wheel already named, or the enquiry form when WhatsApp is not set up */}
        <ContactCta
          message={enquiryMessage}
          enquirySubject={`${heading} enquiry`}
          label="Enquire on WhatsApp"
          fallbackLabel="Enquire"
          onActivate={onClose}
          className="inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-full bg-white text-black hover:bg-neutral-200 text-sm font-medium transition-colors cursor-pointer"
        />
      </footer>
    </div>
  );
};
