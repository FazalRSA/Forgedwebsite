import React from 'react';
import { BrandHeader } from '../brand/BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from '../brand/ContactCta';
import { Link } from '../../utils/router';
import { BLOG_PILLARS } from '../../data/blog';
import { BLOG_POSTS, latestPosts, postsInPillar } from '../../data/blogPosts';
import { BlogCard, PillarCard } from './BlogCard';

/** /blog: the hub. Every content pillar, then the newest guides. */
export const BlogIndexPage: React.FC = () => {
  const latest = latestPosts(6);
  return (
    <div className="bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />
      <main id="main">
        <section className="relative overflow-hidden border-b border-[#26262E]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(29,78,216,0.22),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-16 sm:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E8E99]">The FORGED blog</p>
            <h1 className="mt-4 max-w-3xl text-4xl sm:text-6xl font-black leading-[1.02] text-white">
              Forged wheel guides for BMW M owners
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#C2C2CC]">
              Plain-English answers on forged wheels: how they are made, what fits a BMW M car, what they cost in
              Rand in South Africa, and how to look after them. {BLOG_POSTS.length} guides in {BLOG_PILLARS.length}{' '}
              topics.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/#catalogue" className={CTA_PRIMARY_CLASS}>
                See wheels in stock
              </Link>
              <Link to="/installs" className={CTA_SECONDARY_CLASS}>
                See customer installs
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="topics-heading" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-14 sm:py-20">
          <h2 id="topics-heading" className="text-2xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Start with a topic
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BLOG_PILLARS.map((pillar) => (
              <li key={pillar.id}>
                <PillarCard pillar={pillar} count={postsInPillar(pillar.id).length} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="latest-heading" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 pb-14 sm:pb-20">
          <h2 id="latest-heading" className="text-2xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Latest guides
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[#26262E]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-14 sm:py-20 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
                Have a question the guides do not answer?
              </h2>
              <p className="mt-3 max-w-xl text-[#C2C2CC]">
                Send us your car and the wheels you like. We will tell you what fits and what is in stock.
              </p>
            </div>
            <ContactCta
              message="Hi, I read your blog and have a question about forged wheels."
              enquirySubject="Blog question"
              label="Ask us on WhatsApp"
              fallbackLabel="Send an enquiry"
              className={CTA_PRIMARY_CLASS}
            />
          </div>
        </section>
      </main>
    </div>
  );
};
