import React from 'react';
import { Link } from '../../utils/router';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  designRows,
  headingId,
  resolveText,
  type Block,
  type BlogPost,
  type CatalogueFacts,
} from '../../data/blog';
import { designOf } from '../../utils/designCards';
import type { BrandWheelItem } from '../../data/catalogue';
import { BODY_LINK_CLASS, Inline } from './Inline';

/** The headings that make up an article's contents list. */
export function postHeadings(post: BlogPost): { id: string; text: string }[] {
  return post.body
    .filter((block): block is Extract<Block, { type: 'h2' }> => block.type === 'h2')
    .map((block) => ({ id: headingId(block.text), text: block.text }));
}

/** One listing per design, in catalogue order, up to `count`: what an article's stock block shows. */
export function stockPicks(wheels: BrandWheelItem[], count = 4): BrandWheelItem[] {
  const seen = new Set<string>();
  const picks: BrandWheelItem[] = [];
  for (const wheel of wheels) {
    const design = designOf(wheel);
    if (seen.has(design)) continue;
    seen.add(design);
    picks.push(wheel);
    if (picks.length === count) break;
  }
  return picks;
}

export interface ArticleBodyProps {
  post: BlogPost;
  facts: CatalogueFacts;
  /** The listings in stock (the stock rule is applied by whoever builds this list: getAllBrandWheels). */
  wheels: BrandWheelItem[];
  /** The photo cards for a stock block. Left out (prerendering), the block is a plain list of links. */
  renderStock?: (picks: BrandWheelItem[]) => React.ReactNode;
  /** The enquiry button for a call-to-action block. Left out (prerendering), it is a link to /contact. */
  renderCta?: (heading: string, text: string) => React.ReactNode;
}

const H2_CLASS = 'mt-14 mb-4 scroll-mt-24 text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white';
const H3_CLASS = 'mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-[-0.01em] text-white';
const CAPTION_CLASS = 'mt-3 text-xs leading-relaxed text-[#8E8E99]';
const P_CLASS = 'my-5 text-[17px] leading-[1.75] text-[#D4D4DC]';
const LIST_CLASS = 'my-5 space-y-2.5 pl-6 text-[17px] leading-[1.7] text-[#D4D4DC] marker:text-[#1D4ED8]';

/**
 * An article's body, from its blocks. Pure: no hooks and no store, so the same component renders in
 * the browser and, through renderToStaticMarkup, into the prerendered HTML that crawlers read.
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({ post, facts, wheels, renderStock, renderCta }) => {
  const rows = designRows(wheels);

  return (
    <div>
      {post.body.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={key} id={headingId(block.text)} className={H2_CLASS}>
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} id={headingId(block.text)} className={H3_CLASS}>
                {block.text}
              </h3>
            );
          case 'p': {
            const text = resolveText(block.text, facts);
            return text ? (
              <p key={key} className={P_CLASS}>
                <Inline text={text} />
              </p>
            ) : null;
          }
          case 'ul':
          case 'ol': {
            const items = block.items.map((item) => resolveText(item, facts)).filter(Boolean);
            if (!items.length) return null;
            const List = block.type;
            return (
              <List key={key} className={`${LIST_CLASS} ${block.type === 'ul' ? 'list-disc' : 'list-decimal'}`}>
                {items.map((item, i) => (
                  <li key={i} className="pl-1">
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case 'callout': {
            const text = resolveText(block.text, facts);
            if (!text) return null;
            return (
              <Alert key={key} variant={block.tone ?? 'note'} className="my-8">
                {block.title && <AlertTitle>{block.title}</AlertTitle>}
                <AlertDescription>
                  <Inline text={text} />
                </AlertDescription>
              </Alert>
            );
          }
          case 'table':
            return (
              <figure key={key} className="my-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {block.head.map((cell, i) => (
                        <TableHead key={i}>{cell || <span className="sr-only">Aspect</span>}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.rows.map((row, r) => (
                      <TableRow key={r}>
                        {row.map((cell, c) =>
                          c === 0 ? (
                            <TableHead key={c} scope="row" className="h-auto py-3 text-sm normal-case tracking-normal text-white">
                              {resolveText(cell, facts)}
                            </TableHead>
                          ) : (
                            <TableCell key={c}>{resolveText(cell, facts)}</TableCell>
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {block.caption && <figcaption className={CAPTION_CLASS}>{block.caption}</figcaption>}
              </figure>
            );
          case 'designTable':
            if (!rows.length) return null;
            return (
              <figure key={key} className="my-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Design</TableHead>
                      <TableHead className="whitespace-nowrap">From, per set of 4</TableHead>
                      <TableHead>Finishes in stock</TableHead>
                      <TableHead>Sizes</TableHead>
                      <TableHead>Spec</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.design}>
                        <TableHead scope="row" className="h-auto py-3 text-sm normal-case tracking-normal">
                          <Link to={`/wheels/${row.slug}`} className={BODY_LINK_CLASS}>
                            {row.design}
                          </Link>
                        </TableHead>
                        <TableCell className="whitespace-nowrap tabular-nums text-white">{row.from}</TableCell>
                        <TableCell>{row.finishes.join(', ')}</TableCell>
                        <TableCell>{row.sizes.join(', ')}</TableCell>
                        <TableCell className="min-w-[12rem]">{row.spec}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {block.caption && <figcaption className={CAPTION_CLASS}>{block.caption}</figcaption>}
              </figure>
            );
          case 'stock': {
            const picks = stockPicks(wheels);
            if (!picks.length) return null;
            const intro = block.intro ? resolveText(block.intro, facts) : '';
            return (
              <section key={key} className="my-12" aria-label={block.heading}>
                <h2 id={headingId(block.heading)} className={H2_CLASS.replace('mt-14', 'mt-0')}>
                  {block.heading}
                </h2>
                {intro && (
                  <p className={P_CLASS}>
                    <Inline text={intro} />
                  </p>
                )}
                {renderStock ? (
                  renderStock(picks)
                ) : (
                  <ul className={`${LIST_CLASS} list-disc`}>
                    {picks.map((wheel) => (
                      <li key={wheel.slug}>
                        <Link to={`/wheels/${wheel.slug}`} className={BODY_LINK_CLASS}>
                          {wheel.model} {wheel.finishName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          }
          case 'cta': {
            const text = resolveText(block.text, facts);
            return (
              <aside
                key={key}
                className="my-12 rounded-2xl border border-[#26262E] bg-gradient-to-br from-[#18181D] to-[#111111] p-6 sm:p-8"
              >
                <p className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white">{block.heading}</p>
                <p className="mt-2 max-w-xl text-[#C2C2CC]">{text}</p>
                <div className="mt-5">
                  {renderCta ? (
                    renderCta(block.heading, text)
                  ) : (
                    <Link to="/contact" className={BODY_LINK_CLASS}>
                      Contact us
                    </Link>
                  )}
                </div>
              </aside>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
};
