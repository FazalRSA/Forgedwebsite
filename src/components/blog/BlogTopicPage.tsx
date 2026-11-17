import React from 'react';
import { BrandHeader } from '../brand/BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS } from '../brand/ContactCta';
import { Breadcrumb } from '../ui/breadcrumb';
import { Link } from '../../utils/router';
import { BLOG_PILLARS, blogPillarPath, type BlogPillar } from '../../data/blog';
import { postsInPillar } from '../../data/blogPosts';
import { BlogCard, PILLAR_ICONS } from './BlogCard';
import { Inline } from './Inline';

/** /blog/{pillar}: one content pillar, with the topic explained and every guide that belongs to it. */
export const BlogTopicPage: React.FC<{ pillar: BlogPillar }> = ({ pillar }) => {
  const posts = postsInPillar(pillar.id);
  const Icon = PILLAR_ICONS[pillar.id];
  const others = BLOG_PILLARS.filter((p) => p.id !== pillar.id);
  return (
    <div className="bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />
      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-10 sm:py-16">
        <Breadcrumb
          items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: pillar.name }]}
        />
        <header className="mt-8 max-w-3xl">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8]/15 text-[#BFD0FF]">
            <Icon aria-hidden="true" className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-3xl sm:text-5xl font-black leading-[1.05] text-white">{pillar.title}</h1>
          {pillar.intro.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-lg leading-relaxed text-[#C2C2CC]">
              <Inline text={paragraph} />
            </p>
          ))}
        </header>

        <section aria-labelledby="guides-heading" className="mt-12">
          <h2 id="guides-heading" className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
            {posts.length} {posts.length === 1 ? 'guide' : 'guides'} in this topic
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="other-topics" className="mt-16 border-t border-[#26262E] pt-10">
          <h2 id="other-topics" className="text-xl font-semibold text-white">
            Other topics
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {others.map((other) => (
              <li key={other.id}>
                <Link
                  to={blogPillarPath(other)}
                  className="inline-flex min-h-11 items-center rounded-full border border-[#33333E] px-4 text-sm text-[#EDEBE4] hover:border-[#1D4ED8] hover:text-white transition-colors"
                >
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
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
