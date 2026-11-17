import React, { useMemo } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { BrandHeader } from '../brand/BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS } from '../brand/ContactCta';
import { WheelCard } from '../brand/WheelCatalogue';
import { Badge } from '../ui/badge';
import { Breadcrumb } from '../ui/breadcrumb';
import { Link } from '../../utils/router';
import { getAllBrandWheels, type BrandWheelItem } from '../../data/catalogue';
import {
  blogPillarPath,
  catalogueFacts,
  formatDate,
  getPillarById,
  readingMinutes,
  type BlogPost,
} from '../../data/blog';
import { morePosts } from '../../data/blogPosts';
import { useForgedStore } from '../../store/useForgedStore';
import { ArticleBody, postHeadings } from './ArticleBody';
import { BlogCard } from './BlogCard';
import { Faq } from './Faq';

const CONTENTS_LINK =
  'block rounded-md px-3 py-2 text-sm text-[#C2C2CC] hover:bg-[#18181D] hover:text-white transition-colors';

/** /blog/{pillar}/{post}: one article, with contents, FAQ and the guides to read next. */
export const BlogPostPage: React.FC<{ post: BlogPost }> = ({ post }) => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const facts = useMemo(() => catalogueFacts(wheels), [wheels]);
  const pillar = getPillarById(post.pillar);
  const headings = postHeadings(post);
  const next = morePosts(post);

  const renderStock = (picks: BrandWheelItem[]) => (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 not-prose">
      {picks.map((wheel, index) => (
        <WheelCard key={wheel.slug} wheel={wheel} index={index + 2} />
      ))}
    </ul>
  );

  return (
    <div className="bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />
      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-10 sm:py-14">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Blog', to: '/blog' },
            { label: pillar.name, to: blogPillarPath(pillar) },
            { label: post.title },
          ]}
        />

        <article className="mt-8">
          <header className="max-w-3xl">
            <Badge>{pillar.name}</Badge>
            <h1 className="mt-5 text-3xl sm:text-5xl font-black leading-[1.05] text-white">{post.title}</h1>
            <p className="mt-5 text-lg sm:text-xl leading-relaxed text-[#C2C2CC]">{post.description}</p>
            <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#8E8E99]">
              <span>By FORGED Custom Wheels</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                <time dateTime={post.updated}>Updated {formatDate(post.updated)}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden="true" className="h-4 w-4" />
                {readingMinutes(post, facts)} min read
              </span>
            </p>
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
            {/* Contents: a collapsible list on phones, a sticky column from 1024 px. */}
            <aside className="lg:order-none">
              <details className="rounded-xl border border-[#26262E] bg-[#18181D] lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center px-4 text-sm font-medium text-white [&::-webkit-details-marker]:hidden">
                  In this article
                </summary>
                <nav aria-label="In this article" className="px-2 pb-3">
                  {headings.map((h) => (
                    <a key={h.id} href={`#${h.id}`} className={CONTENTS_LINK}>
                      {h.text}
                    </a>
                  ))}
                </nav>
              </details>
              <nav aria-label="In this article" className="sticky top-24 hidden lg:block">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8E8E99]">
                  In this article
                </p>
                {headings.map((h) => (
                  <a key={h.id} href={`#${h.id}`} className={CONTENTS_LINK}>
                    {h.text}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 max-w-3xl">
              <ArticleBody
                post={post}
                facts={facts}
                wheels={wheels}
                renderStock={renderStock}
                renderCta={() => (
                  <ContactCta
                    message={`Hi, I read "${post.title}" on your blog and have a question about wheels for my car.`}
                    enquirySubject={`Blog: ${post.title}`}
                    label="Message us on WhatsApp"
                    fallbackLabel="Send an enquiry"
                    className={CTA_PRIMARY_CLASS}
                  />
                )}
              />
              <Faq faqs={post.faqs} facts={facts} />
            </div>
          </div>
        </article>

        {next.length > 0 && (
          <section aria-labelledby="keep-reading" className="mt-20 border-t border-[#26262E] pt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 id="keep-reading" className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
                Keep reading
              </h2>
              <Link to={blogPillarPath(pillar)} className="text-sm text-[#C2C2CC] underline underline-offset-4 hover:text-white">
                All {pillar.name.toLowerCase()} guides
              </Link>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {next.map((p) => (
                <li key={p.slug}>
                  <BlogCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};
