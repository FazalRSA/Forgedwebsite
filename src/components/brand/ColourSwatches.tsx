import React from 'react';
import { MessageCircle } from 'lucide-react';
import {
  WHEEL_FINISHES,
  TO_ORDER_LEAD_TIME,
  TO_ORDER_NOTICE,
  type WheelFinishId,
  type WheelFinishOption,
} from '../../data/catalogue';
import { FinishSwatch } from '../../wheel-viewer';
import { toStudioFinish } from '../visuals/WheelStudio';
import { Link } from '../../utils/router';

/**
 * The colour choices on a wheel page, all as photoreal swatches (a ball in the finish's own paint under
 * the studio's reflections, so each swatch looks like the wheel will).
 *
 *  - the colour in stock on this page: selected while it is the one shown in 3D;
 *  - the same design in another colour that is in stock: a swatch that opens that listing;
 *  - the colours of the design that are not in stock: a swatch that shows the colour on the 3D wheel,
 *    always beside the lead-time notice, with an "Ask about" button for the colour on show.
 *
 * A swatch is a studio render of the wheel itself in that colour (src/data/finishStills.ts), the same picture
 * the 3D view's finish chips show; a design without renders gets the paint ball instead.
 */

const SWATCH_SIZE = 36;

export interface InStockColour {
  /** Listing slug: the swatch opens /wheels/<slug>. */
  slug: string;
  finishId: WheelFinishId;
  /** The listing's own finish name, e.g. "Black Matte" (a matte name gives a matte swatch). */
  name: string;
}

interface ColourSwatchesProps {
  /** The wheel's design code ("FSA003"): which renders the swatches show. */
  design?: string;
  /** The colour in stock on this page. */
  current: { finishId: WheelFinishId; name: string };
  /** Other in-stock colours of the design. */
  siblings: InStockColour[];
  /** Colours of the design that are made to order. */
  toOrder: WheelFinishOption[];
  /** The colour being shown on the 3D wheel. */
  shown: WheelFinishId;
  /** Show this colour on the 3D wheel (the page opens the 3D view if it is closed). */
  onShow: (finishId: WheelFinishId) => void;
  /** Open the enquiry form for a to-order colour. */
  onAskAbout: (finish: WheelFinishOption) => void;
  /** Without a 3D model a swatch has nothing to show the colour on, so to-order colours go straight to the enquiry. */
  has3D: boolean;
}

const TILE =
  'group relative inline-flex min-h-11 items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-4 text-sm transition-colors cursor-pointer';
const TILE_IDLE = 'border-[#33333E] text-neutral-200 hover:border-[#1D4ED8] hover:text-white';
const TILE_ON = 'border-white bg-white/10 text-white font-medium';

export const ColourSwatches: React.FC<ColourSwatchesProps> = ({
  design,
  current,
  siblings,
  toOrder,
  shown,
  onShow,
  onAskAbout,
  has3D,
}) => {
  const shownToOrder = toOrder.find((f) => f.id === shown);

  return (
    <div data-testid="finish-options">
      <p className="text-sm text-neutral-400" id="colours-in-stock">
        In stock
      </p>
      <ul className="mt-2 flex flex-wrap gap-2" aria-labelledby="colours-in-stock">
        <li>
          <button
            type="button"
            aria-pressed={shown === current.finishId}
            onClick={() => onShow(current.finishId)}
            className={`${TILE} ${shown === current.finishId ? TILE_ON : TILE_IDLE}`}
          >
            <Swatch finishId={current.finishId} name={current.name} design={design} />
            {current.name}
          </button>
        </li>
        {siblings.map((s) => (
          <li key={s.slug}>
            <Link to={`/wheels/${s.slug}`} className={`${TILE} ${TILE_IDLE}`}>
              <Swatch finishId={s.finishId} name={s.name} design={design} />
              {s.name}
            </Link>
          </li>
        ))}
      </ul>

      {toOrder.length > 0 && (
        <div className="mt-4" data-testid="to-order-finishes">
          <p className="text-sm text-neutral-400" id="colours-to-order">
            Other colours, to order ({TO_ORDER_LEAD_TIME} lead time)
          </p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-labelledby="colours-to-order">
            {toOrder.map((finish) => {
              const on = shown === finish.id;
              return (
                <li key={finish.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={`${finish.name}, made to order, ${TO_ORDER_LEAD_TIME} lead time${
                      has3D ? '. Show on the wheel' : '. Ask about this colour'
                    }`}
                    onClick={() => (has3D ? onShow(finish.id) : onAskAbout(finish))}
                    className={`${TILE} border-dashed ${on ? TILE_ON : TILE_IDLE}`}
                  >
                    <Swatch finishId={finish.id} design={design} />
                    {finish.name}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm text-neutral-300">
            {TO_ORDER_NOTICE} {has3D ? 'Tap a colour to see it on the wheel.' : 'Tap a colour to ask about it.'}
          </p>
          {shownToOrder && has3D && (
            <button
              type="button"
              onClick={() => onAskAbout(shownToOrder)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#1D4ED8] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]/20 cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask about {shownToOrder.name}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * The swatch for a catalogue colour: the studio render of the wheel `design` in that colour, or the photoreal
 * paint ball when there is none. `name` is the listing's own finish name ("Black Matte"), which decides matte
 * or gloss; without it the palette's name is used.
 */
export const CatalogueSwatch: React.FC<{ finishId: WheelFinishId; name?: string; size?: number; design?: string }> = ({
  finishId,
  name,
  size = SWATCH_SIZE,
  design,
}) => {
  const finish = toStudioFinish(finishId, name ?? WHEEL_FINISHES[finishId]?.name, design);
  if (!finish) return null;
  return <FinishSwatch finish={finish} size={size} />;
};
const Swatch = CatalogueSwatch;
