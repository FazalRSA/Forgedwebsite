import React from 'react';
import { SIXNINE_ABOUT, SIXNINE_PERSONALISATION, SIXNINE_SOURCES } from '../../data/sixnineAbout';
import { SIXNINE_RANGE } from '../../data/sixnineRange';

const EYEBROW = 'text-sm uppercase tracking-[0.14em] text-neutral-400';
const H2 = 'mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white';
const H3 = 'mt-2 text-2xl sm:text-3xl font-light tracking-[-0.02em] leading-tight text-white';

const formatCount = (n: number) => n.toLocaleString('en-ZA').replace(/ /g, ' ');

/** A picture of a Sixnine wheel on a dark tile, contained, as Sixnine shows its renders. */
const Render: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#26262E] bg-[#16161A]">
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.08),transparent_65%)]"
    />
    <img
      src={src}
      alt={alt}
      width={720}
      height={720}
      loading="lazy"
      decoding="async"
      className="relative h-full w-full object-contain p-[8%]"
    />
  </div>
);

/**
 * "About Sixnine" on /sixnine-wheels, laid out the way Sixnine's own About page is: a short head with
 * the key facts, two picture-and-text chapters (who they are, how the wheels are made), then the ways to
 * personalise the modular designs. Every fact comes from src/data/sixnineAbout.ts, which names its sources.
 */
export const SixnineAboutSection: React.FC = () => {
  const ffOne = SIXNINE_RANGE.find((d) => d.id === 'ff-one');
  const ffThree = SIXNINE_RANGE.find((d) => d.id === 'ff-three');
  const stats = [
    { value: String(SIXNINE_RANGE.length), label: 'wheel designs' },
    { value: String(SIXNINE_ABOUT.ffOneDesigns), label: 'looks in one FF-ONE' },
    { value: formatCount(SIXNINE_ABOUT.configuratorLooks), label: 'possible looks with accessories' },
  ];

  return (
    <section
      aria-labelledby="sixnine-about-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
    >
      <p className={EYEBROW}>About Sixnine</p>
      <h2 id="sixnine-about-heading" className={H2}>
        Designed and developed in Germany.
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-neutral-300">
        {SIXNINE_ABOUT.company} is an aftermarket wheel brand from {SIXNINE_ABOUT.home}, {SIXNINE_ABOUT.reach}. We are its
        dealer in South Africa.
      </p>

      <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-[#26262E] bg-[#26262E]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse gap-2 bg-[#111111] p-6">
            <dt className="text-sm text-neutral-400">{s.label}</dt>
            <dd className="text-5xl font-semibold tracking-[-0.04em] text-white tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid items-center gap-8 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {ffOne && <Render src={ffOne.image} alt="The SIXNINE FF-ONE" />}
        <div>
          <p className={EYEBROW}>Who they are</p>
          <h3 className={H3}>Friends from the trade</h3>
          <div className="mt-4 max-w-xl space-y-4 text-neutral-300">
            <p>
              Sixnine was started by a group of friends, each with many years in the car and aftermarket industries,
              to bring new ideas to wheels.
            </p>
            <p>
              The brand stands for tailor-made wheels, new ways of making them and new combinations of materials. Its
              best-known idea is the FF-ONE: one wheel that takes swappable inlays, so it can wear five different
              designs.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 grid items-center gap-8 lg:gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {ffThree && (
          <div className="lg:order-2">
            <Render src={ffThree.image} alt="The SIXNINE FF-THREE" />
          </div>
        )}
        <div className="lg:order-1">
          <p className={EYEBROW}>How they are made</p>
          <h3 className={H3}>Built with a global partner</h3>
          <div className="mt-4 max-w-xl space-y-4 text-neutral-300">
            <p>
              Sixnine designs and develops its wheels in Germany and produces them in a partnership with one of the
              largest alloy wheel manufacturers in the world.
            </p>
            <p>
              Its main series are flow-formed. A smaller{' '}
              <a
                href={SIXNINE_SOURCES.forgedSeries}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Forged Series
              </a>{' '}
              offers selected designs and sizes forged. The range below says how each design is made.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <p className={EYEBROW}>Make it yours</p>
        <h3 className={H3}>One wheel, many looks</h3>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {SIXNINE_PERSONALISATION.map((item, i) => (
            <li key={item.title} className="rounded-2xl border border-[#26262E] bg-[#16161A] p-6">
              <span className="text-xs font-semibold tracking-[0.12em] text-neutral-500 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-lg text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-10 text-sm text-neutral-400">
        Source:{' '}
        <a
          href={SIXNINE_SOURCES.about}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-neutral-300"
        >
          sixnine-wheels.com
        </a>
        . Sixnine's figures and claims are its own.
      </p>
    </section>
  );
};
