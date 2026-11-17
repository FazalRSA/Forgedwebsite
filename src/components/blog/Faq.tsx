import React from 'react';
import { Accordion, AccordionItem } from '../ui/accordion';
import { resolveText, type BlogFaq, type CatalogueFacts } from '../../data/blog';
import { Inline } from './Inline';

/** An article's frequently asked questions. The same questions feed its FAQPage structured data. */
export const Faq: React.FC<{ faqs: BlogFaq[]; facts: CatalogueFacts }> = ({ faqs, facts }) => {
  const items = faqs.map((faq) => ({ q: faq.q, a: resolveText(faq.a, facts) })).filter((item) => item.a);
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-14">
      <h2 id="faq-heading" className="mb-5 scroll-mt-24 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white">
        Frequently asked questions
      </h2>
      <Accordion>
        {items.map((item) => (
          <AccordionItem key={item.q} question={item.q}>
            <Inline text={item.a} />
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
