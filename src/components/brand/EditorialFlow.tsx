import React, { useMemo } from 'react';
import { getAllBrandWheels } from '../../data/catalogue';
import { CLIENT_FITMENTS } from '../../data/clientFitments';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';
import { designOf } from './WheelCatalogue';
import { fitmentCar, fitmentTitle, fitmentWheels } from './fitmentFormat';

/** How many installs the home page previews; the rest are on /installs. */
const STRIP_COUNT = 4;

/**
 * Below the wheels on the home page: a short look at real customer cars, then a row of facts.
 * Every number here is counted from the same data the rest of the site uses.
 */
export const EditorialFlow: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const designCount = useMemo(() => new Set(wheels.map(designOf)).size, [wheels]);
  const installs = CLIENT_FITMENTS.slice(0, STRIP_COUNT);

  const facts: { value: number; label: string }[] = [];
  if (wheels.length > 0) {
    facts.push({ value: designCount, label: designCount === 1 ? 'design in stock' : 'designs in stock' });
    facts.push({ value: wheels.length, label: wheels.length === 1 ? 'wheel to choose from' : 'wheels to choose from' });
  }
  if (CLIENT_FITMENTS.length > 0) {
    facts.push({
      value: CLIENT_FITMENTS.length,
      label: CLIENT_FITMENTS.length === 1 ? 'customer car on the installs page' : 'customer cars on the installs page',
    });
  }

  return (
    <>
      {installs.length > 0 && (
        <section
          id="installs"
          aria-labelledby="installs-heading"
          className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
        >
          <div className="flex items-end justify-between gap-4">
            <h2
              id="installs-heading"
              className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
            >
              Customer installs
            </h2>
            <Link
              to="/installs"
              className="inline-flex items-center min-h-11 text-sm font-medium text-[#FF5500] hover:text-[#FF6B1A] whitespace-nowrap"
            >
              See all installs
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8">
            {installs.map((fitment) => (
              <li key={fitment.id}>
                <Link to="/installs" className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[#18181D]">
                    <img
                      src={fitment.images[0]}
                      alt={`${fitmentTitle(fitment)} on forged wheels`}
                      width={1600}
                      height={1200}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="mt-3 text-base font-medium text-white group-hover:underline underline-offset-4">
                    {fitmentCar(fitment)}
                  </h3>
                  <p className="text-sm text-neutral-300">{fitment.paint}</p>
                  <p className="text-sm text-neutral-400">{fitmentWheels(fitment)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {facts.length > 0 && (
        <section
          aria-label="The site in numbers"
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 border-t border-[#26262E]"
        >
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-12 gap-y-3">
            {facts.map((fact) => (
              <li key={fact.label} className="text-base text-neutral-300">
                <span className="font-medium text-white tabular-nums">{fact.value}</span> {fact.label}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};
