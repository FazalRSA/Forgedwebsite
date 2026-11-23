import React from 'react';
import { CLIENT_FITMENTS } from '../../data/clientFitments';
import { Link } from '../../utils/router';
import { fitmentCar, fitmentTitle, fitmentWheels } from './fitmentFormat';
import { fitmentImageSrcSet } from '../../utils/fitmentImageSrcSet';
import { EYEBROW_CLASS } from './sectionStyles';

/** How many installs the home page previews; the rest are on /installs. */
const STRIP_COUNT = 4;

/** How wide a strip picture is drawn: two columns on a phone, four from 1024 px, inside the 1280 px page. */
const STRIP_SIZES = '(min-width:1280px) 282px, (min-width:1024px) 24vw, 47vw';

/**
 * Below the wheels on the home page: a short look at real customer cars.
 */
export const EditorialFlow: React.FC = () => {
  const installs = CLIENT_FITMENTS.slice(0, STRIP_COUNT);

  return (
    <>
      {installs.length > 0 && (
        <section
          id="installs"
          aria-labelledby="installs-heading"
          className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className={EYEBROW_CLASS}>Installs</span>
              <h2
                id="installs-heading"
                className="mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
              >
                Customer installs
              </h2>
            </div>
            <Link
              to="/installs"
              className="inline-flex items-center min-h-11 text-sm font-medium text-[#F43F5E] hover:text-[#F43F5E] whitespace-nowrap"
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
                      {...fitmentImageSrcSet(fitment.images[0], STRIP_SIZES)}
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
    </>
  );
};
