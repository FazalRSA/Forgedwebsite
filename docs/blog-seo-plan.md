# Blog SEO plan

The strategy behind `/blog`, the keyword each page targets, and how to check and refine it with Google Search Console. The code side (how to write an article, the rules the tests enforce) is in the README under [The blog](../README.md#the-blog).

## Read this first: where the keywords came from

The keywords below were chosen from **web research and the shape of the catalogue, not from this site's Search Console data**. The build session had no Search Console access, and `SITE.searchConsoleToken` in `src/config/site.ts` is empty, so the property may not be verified yet. Treat this plan as a well-grounded first version, then replace guesses with your own numbers (see [Check it in Search Console](#check-it-in-search-console)).

What the research showed:

- Searches for forged wheels for the G80 M3 and G82 M4 are dominated by overseas sellers (US and Australian), almost all of them product pages. A South African, Rand-priced, in-stock answer is scarce, which is the opening.
- The questions people ask around the product are informational and well served by plain explanations: forged vs cast, unsprung weight, offset and bolt pattern, cleaning.
- Many pages that rank repeat the same weight and price claims without a source. The articles here make no such claims.

## Structure: a silo

```
/blog                               hub: all pillars, latest guides
├─ /blog/forged-wheel-basics        pillar 1
├─ /blog/bmw-m-wheel-fitment        pillar 2
├─ /blog/buying-forged-wheels-south-africa   pillar 3 (commercial)
└─ /blog/wheel-care                 pillar 4
   each pillar: /blog/<pillar>/<article>
```

Each article links to its pillar (breadcrumb and "all guides" link), to two to four sibling articles, and to the catalogue. Each pillar links to every article in it. The hub links to every pillar. The home page, header and footer link to the hub. Money pages (the wheel pages) are reached from the articles through live "in stock" blocks, so the blog passes visitors and link equity to the catalogue.

## Keyword map

| Page | Primary keyword | Also answers | Intent |
| --- | --- | --- | --- |
| `/blog` | forged wheel guides BMW M | | Hub |
| Pillar: forged wheel basics | forged wheels | cast vs forged, what are forged wheels | Informational |
| Pillar: BMW M wheel fitment | BMW M3 wheel fitment | G80 wheel fitment, M4 wheel fitment | Informational |
| Pillar: buying | forged wheels South Africa | forged rims South Africa | Commercial |
| Pillar: wheel care | how to clean forged wheels | wheel care | Informational |
| Forged vs cast vs flow-formed | forged vs cast wheels | flow formed wheels, are forged wheels stronger | Informational |
| Unsprung weight explained | unsprung weight | lightweight wheels, rotating mass | Informational |
| Are forged wheels worth it | are forged wheels worth it | should I buy forged wheels | Commercial |
| Wheel fitment explained | wheel offset PCD centre bore | BMW bolt pattern, what is ET on a wheel | Informational |
| Forged wheels for the G80 M3 | BMW G80 M3 forged wheels | G82 M4 forged wheels, M3 rims South Africa | Commercial |
| Staggered vs square | staggered vs square wheels BMW | can you rotate staggered tyres | Informational |
| What forged wheels cost | forged wheels price South Africa | BMW M3 rims price South Africa | Commercial |
| In stock vs made to order | made to order forged wheels | forged wheels lead time | Commercial |
| Choosing a colour and finish | BMW M3 wheel colour | bronze wheels BMW, matte vs gloss wheels | Commercial |
| How to clean forged wheels | how to clean forged wheels | clean matte wheels, brake dust | Informational |
| Wheel bolt torque | wheel bolt torque | BMW wheel bolt torque | Informational |
| Protecting wheels from potholes | pothole damage wheels | bent rim, low profile tyres potholes | Informational |

The primary keyword for every article is also in `src/data/blogPosts.ts` (`keyword` and `related`) and is checked by a test to appear in the title or description.

## On-page checklist (applied to every article)

- One H1; the title and description unique across the site; title 60 characters or fewer with the site name; description 100 to 160 characters.
- The first paragraph answers the question; sections are H2s with anchors, and a contents list links to them.
- A visible FAQ, repeated as `FAQPage` data. (Google now shows FAQ rich results only for a few kinds of site, so expect no rich result; the questions still help readers and AI assistants.)
- `BlogPosting` and `BreadcrumbList` structured data; a real `lastmod` in the sitemap; an RSS feed.
- Article text is in the prerendered HTML, so it is indexable before JavaScript runs.
- Current prices, stock, sizes and lead time come from the catalogue, so an article cannot go stale on those.

## Check it in Search Console

1. Verify the property. Either add a DNS record for `forgedsa.co.za` (the domain property covers `www` and the bare domain) or set `searchConsoleToken` in `src/config/site.ts` (see the README).
2. *Sitemaps*: submit `https://www.forgedsa.co.za/sitemap.xml`. It now lists the blog.
3. *URL inspection*: inspect `/blog` and one article; use *Test live URL* and confirm the rendered page shows the full text.
4. After two to four weeks, open *Performance > Search results* and filter **Pages** by `/blog/`:
   - Sort **Queries** by impressions. Queries with many impressions and a position of 8 to 30 are the ones to improve: expand that article, add a section that answers the query, and put the phrase in a heading.
   - Queries you did not target but appear for: write a section or a new article for each.
   - Low click-through at a good position: rewrite the title and description.
5. Re-run the keyword map above with real data. Replace guesses with the queries you actually get, and add them to `related`.
6. Check *Pages > Why pages aren't indexed* after the first deploy, and see the deploy note in `AGENTS.md` about blank pages on Render.

## What would make the blog stronger (needs the business)

These can only come from you, and search engines weigh them as proof of experience. None is invented in the articles.

- **Real install stories.** For each customer car on `/installs`, a short write-up (car, wheels, what the owner wanted) that links to the article it illustrates.
- **Photographs and measurements.** Photographs of the shop and the work, and the weight of each wheel you stock. A weight table would be the most linkable page on the site.
- **A named author** with a short bio, for the byline and `author` data.
- **Confirmed facts** to unlock articles that are now blocked: which cars beyond the G80 M3 you can supply (G82 M4, G87 M2, M5), what is included in a set (bolts, rings, sensors), and whether fitting is offered.

## Next articles, in order of value

1. Forged wheels for the BMW G82 M4 (once a set is confirmed for it).
2. Forged wheels for the BMW G87 M2 (as above).
3. Hub-centric rings: when you need them.
4. Tyre pressure sensors after a wheel change.
5. Plus-sizing wheels and tyres without changing the rolling diameter.
6. How to read a wheel's load rating.
7. Painted, powder-coated and polished wheel finishes compared.
8. Wheel weight by design (needs the weights).
9. Customer install write-ups (needs the stories).
