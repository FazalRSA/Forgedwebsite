import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  /** Id placed on the trigger button — target this from an existing `<label htmlFor>`. */
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Plain strings are used as both value and label. */
  options: string[] | StyledSelectOption[];
  /**
   * Fallback label shown on the trigger when `value` matches nothing in
   * `options` (e.g. before the caller has added its own `{ value: '',
   * label: '...' }` placeholder row — see call sites in
   * VehicleFitmentWidget, which include that row in `options` directly so
   * it stays selectable from the open list, mirroring the native
   * `<option value="">PLACEHOLDER</option>` row it replaces).
   */
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const normalizeOptions = (options: string[] | StyledSelectOption[]): StyledSelectOption[] =>
  options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );

/**
 * Accessible replacement for a native `<select>` that matches the dark,
 * on-brand aesthetic in both its closed and open states (the browser's own
 * OS-styled option list otherwise breaks the illusion). Implements the
 * WAI-ARIA "select-only combobox" pattern: a `<button role="combobox">`
 * trigger that keeps focus at all times, and an absolutely-positioned
 * `<ul role="listbox">` of `<li role="option">` rows driven via
 * `aria-activedescendant` rather than real DOM focus moves.
 */
export const StyledSelect: React.FC<StyledSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
}) => {
  const normalized = normalizeOptions(options);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = `${id}-listbox`;
  const getOptionId = (index: number) => `${id}-option-${index}`;

  const selectedIndex = normalized.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? normalized[selectedIndex] : undefined;

  // Close and reset the active option whenever the trigger becomes
  // disabled (e.g. MAKE is cleared, disabling MODEL) so a stale open list
  // never lingers on an unusable control. (Deliberately not keyed on
  // `options`/`value`: callers like VehicleFitmentWidget pass a fresh
  // array literal on every render, which would otherwise close the list
  // on any unrelated parent re-render while a user is navigating it.)
  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const openList = (initialIndex: number) => {
    if (disabled || normalized.length === 0) return;
    setIsOpen(true);
    setActiveIndex(initialIndex);
  };

  const closeList = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const commitIndex = (index: number) => {
    const option = normalized[index];
    if (!option) return;
    onChange(option.value);
    closeList();
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    if (isOpen) {
      closeList();
    } else {
      openList(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openList(selectedIndex >= 0 ? selectedIndex : 0);
        } else {
          setActiveIndex((prev) => Math.min(prev + 1, normalized.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openList(selectedIndex >= 0 ? selectedIndex : normalized.length - 1);
        } else {
          setActiveIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          event.preventDefault();
          setActiveIndex(normalized.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          openList(selectedIndex >= 0 ? selectedIndex : 0);
        } else if (activeIndex >= 0) {
          commitIndex(activeIndex);
        } else {
          closeList();
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeList();
        }
        break;
      case 'Tab':
        // Let Tab move focus normally; just drop the open list first.
        if (isOpen) closeList();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={`w-full h-12 px-4 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-wider disabled:opacity-45 disabled:cursor-not-allowed focus:border-[#FF5500] focus:outline-none cursor-pointer flex items-center justify-between gap-2 text-left ${className}`}
      >
        <span className={selectedOption && selectedOption.value !== '' ? '' : 'text-[#C2C2CC]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#C2C2CC] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-[#18181D] border border-[#26262E] shadow-2xl py-1"
        >
          {normalized.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value || `empty-${index}`}
                id={getOptionId(index)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  // Prevent the trigger's blur/outside-click handling from
                  // firing before the click is registered.
                  event.preventDefault();
                }}
                onClick={() => commitIndex(index)}
                className={`px-4 py-2.5 text-xs font-tech-mono uppercase tracking-wider cursor-pointer ${
                  isActive ? 'bg-[#FF5500] text-white' : 'text-[#F5F5F7]'
                } ${isSelected && !isActive ? 'text-[#FF5500]' : ''}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
