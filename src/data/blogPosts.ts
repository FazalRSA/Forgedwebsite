/**
 * The blog articles. See blog.ts for the model and the rules these follow:
 *
 *  - No price, size, offset, bolt pattern, centre bore, lead time or stock count is typed here. Text
 *    that needs one is a function of the live catalogue (`(f) => ...`), so it cannot drift from the
 *    wheel pages (AGENTS.md rule 4). blog.test.ts checks this.
 *  - No claim the business has not confirmed: no warranty, certification, test standard, opening
 *    hours or service area (rule 2). Fitment is never promised: the shop confirms it per car.
 *  - Inline markup: [link text](/path) and **bold**. Internal links are checked by blog.test.ts.
 */
import { getPillar, getPillarById, joinList, type BlogPillar, type BlogPost, type CatalogueFacts } from './blog';

const BASICS = '/blog/forged-wheel-basics';
const FITMENT = '/blog/bmw-m-wheel-fitment';
const BUYING = '/blog/buying-forged-wheels-south-africa';
const CARE = '/blog/wheel-care';

const PUBLISHED = '2026-11-17';
const PUBLISHED_2 = '2026-11-23';

const NUMBER_WORDS: Record<string, string> = { '3': 'three', '4': 'four', '5': 'five', '6': 'six' };

/** "5×112" -> "five bolts on a 112 mm circle". Falls back to the raw value when it is not in that shape. */
function pcdPhrase(pcd: string): string {
  const [count, diameter] = pcd.split(/[×x]/i).map((part) => part.trim());
  if (!count || !diameter) return pcd;
  return `${NUMBER_WORDS[count] ?? count} bolts on a ${diameter} mm circle`;
}

const mm = (values: string[]): string => joinList(values.map((value) => `${value} mm`));

export const BLOG_POSTS: readonly BlogPost[] = [
  /* ============================================================ BASICS */
  {
    slug: 'forged-vs-cast-vs-flow-formed-wheels',
    pillar: 'basics',
    title: 'Forged vs cast vs flow-formed wheels: what actually differs',
    metaTitle: 'Forged vs cast vs flow-formed wheels explained',
    description:
      'How forged, cast and flow-formed wheels are made, how they differ in weight, strength and price, and which suits a BMW M car.',
    excerpt:
      'Three words you will meet when shopping for wheels, and what each one really means for weight, strength and cost.',
    keyword: 'forged vs cast wheels',
    related: ['flow formed wheels', 'forged wheels vs cast', 'are forged wheels stronger', 'what are forged wheels'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'If you are shopping for wheels for a BMW M car you will meet three words again and again: cast, flow-formed and forged. They describe how the wheel is made, and that decides how much it weighs, how strong it is for its weight and what it costs. Here is what each one means, without the marketing.',
      },
      { type: 'h2', text: 'The short answer' },
      {
        type: 'p',
        text: 'A **cast** wheel is made by pouring molten aluminium alloy into a mould. A **flow-formed** wheel starts life as a cast wheel; its barrel, the part the tyre sits on, is then heated and spun while rollers press it thinner and longer. A **forged** wheel is shaped from a solid block of aluminium alloy under enormous pressure, then machined to its final design.',
      },
      {
        type: 'table',
        caption: 'General tendencies. Individual designs vary, so always compare the stated weight of the wheel you are considering.',
        head: ['', 'Cast', 'Flow-formed', 'Forged'],
        rows: [
          ['Made by', 'Pouring molten alloy into a mould', 'Casting the wheel, then spinning and rolling the barrel', 'Pressing a solid block of alloy, then machining it'],
          ['Weight for the same strength', 'Heaviest', 'In between', 'Lightest'],
          ['Price position', 'Lowest', 'Middle', 'Highest'],
          ['Where the strength comes from', 'Thickness of the wheel', 'A thinner, stretched barrel', 'Dense, aligned metal'],
        ],
      },
      { type: 'h2', text: 'Why forging makes a lighter wheel' },
      {
        type: 'p',
        text: 'Pouring metal into a mould can leave tiny voids and an uneven grain inside the wheel. To be sure a cast wheel is strong enough, the designer adds material. Forging compresses the metal and lines up its grain, which removes most of that uncertainty. The result is a denser material, so the same strength can be had from less of it. That is the whole reason a forged wheel is usually lighter than a cast wheel of the same size and design.',
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'Lighter is a tendency, not a promise',
        text: 'Spoke design, width and diameter all change the weight. When you compare wheels, compare the stated weight of each wheel at the size you want, not the label on the box.',
      },
      { type: 'h2', text: 'What flow-forming adds' },
      {
        type: 'p',
        text: 'Flow-forming improves a cast wheel’s barrel. The spinning and rolling thins and stretches the barrel and tightens the metal there, so the wheel can be lighter than a plain cast one. The centre of the wheel, where the spokes are, is still cast, which is why flow-formed wheels usually sit between cast and forged on both weight and price.',
      },
      { type: 'h2', text: 'How a forged wheel is made, in four steps' },
      {
        type: 'ol',
        items: [
          '**Billet.** The wheel starts as a solid piece of aluminium alloy.',
          '**Forging.** A press shapes the billet under very high pressure, which compresses the metal and lines up its grain.',
          '**Machining.** The rough forging is cut to its final design: spokes, face and barrel. Because the shape is cut rather than poured, one process can make many designs and sizes without a new mould for each.',
          '**Finishing.** The wheel is painted, coated or polished, and checked.',
        ],
      },
      { type: 'h2', text: 'Four myths about forged wheels' },
      {
        type: 'ul',
        items: [
          `**“Forged means unbreakable.”** No wheel is. A hard enough impact bends or cracks any wheel; see [how to protect your wheels from potholes](${CARE}/protecting-wheels-from-potholes).`,
          '**“Forged is always lighter.”** Usually, for a given design and size, but the design and the size change the weight a great deal. Compare stated weights.',
          '**“Flow-formed is forged-lite.”** It is a different process: a cast wheel with a better barrel.',
          '**“A bigger wheel is a better wheel.”** A larger diameter adds weight and leaves less tyre sidewall. Choose the size that suits the car and the roads you drive.',
        ],
      },
      { type: 'h2', text: 'What this means on a BMW M car' },
      {
        type: 'p',
        text: `BMW M cars are heavy, quick and brake hard, and they carry large wheels. A large wheel is a heavy wheel unless it is well made, so the weight of the wheel matters more here than on a small hatchback. A forged set can bring that weight down. Read [unsprung weight explained](${BASICS}/unsprung-weight-explained) for why that matters on the road.`,
      },
      { type: 'h2', text: 'Where cast and flow-formed still make sense' },
      {
        type: 'p',
        text: `A cast wheel is a sensible choice when the budget is tight, when the car mostly does short daily trips, or when you simply want a good look at the lowest cost. Flow-formed is a reasonable step up if you want some weight saving without the full price of forged. Forged makes sense when weight, a particular fitment or a particular finish matters to you and the budget allows it. Whether that is you is the subject of [are forged wheels worth it?](${BASICS}/are-forged-wheels-worth-it)`,
      },
      { type: 'h2', text: 'What to check besides the label' },
      {
        type: 'ul',
        items: [
          'The stated weight of the wheel at the size you want.',
          `That it matches your car’s fitment numbers: bolt pattern, offset and centre bore (see [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore)).`,
          `The finish, and how it should be cleaned ([how to clean forged wheels](${CARE}/how-to-clean-forged-wheels)).`,
          'Who is selling it, and whether they will confirm the fit for your exact car before you pay.',
        ],
      },
      { type: 'stock', heading: 'Forged wheels in stock now' },
    ],
    faqs: [
      {
        q: 'Are forged wheels stronger than cast wheels?',
        a: 'For the same weight, yes. Forged metal is denser, so a forged wheel can be made as strong as a cast one using less material. Strength still depends on how the wheel is designed and engineered, so a poorly designed forged wheel is not automatically stronger than a well designed cast one.',
      },
      {
        q: 'Is flow-formed the same as forged?',
        a: 'No. A flow-formed wheel starts as a cast wheel and only the barrel is stretched and thinned by rollers. A forged wheel is shaped from a solid block of alloy under pressure.',
      },
      {
        q: 'Are forged wheels always lighter?',
        a: 'Usually, for the same size and design, but not automatically. A large, wide forged wheel can still weigh more than a small cast one. Compare the stated weight at the size you want.',
      },
      {
        q: 'Do you sell cast or flow-formed wheels?',
        a: 'This site lists forged wheel sets for BMW M cars. See what is in stock on the [wheels page](/#catalogue).',
      },
    ],
    more: ['unsprung-weight-explained', 'are-forged-wheels-worth-it', 'how-much-do-forged-wheels-cost-in-south-africa'],
  },

  {
    slug: 'unsprung-weight-explained',
    pillar: 'basics',
    title: 'Unsprung weight explained: why lighter wheels change how a car drives',
    metaTitle: 'Unsprung weight explained for BMW M owners',
    description:
      'What unsprung weight is, why the weight of your wheels matters more than weight elsewhere in the car, and what lighter forged wheels can and cannot do.',
    excerpt: 'Why a kilogram at the wheel is not the same as a kilogram in the boot, and how much it really matters.',
    keyword: 'unsprung weight',
    related: ['lightweight wheels', 'rotating mass', 'wheel weight performance', 'why lighter wheels are better'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Every car carries two kinds of weight: the weight its springs hold up, and the weight that hangs below them. The second kind is called unsprung weight, and wheels are the biggest part of it. It is the reason a lighter wheel is worth more than the same saving anywhere else in the car.',
      },
      { type: 'h2', text: 'What counts as unsprung weight' },
      {
        type: 'p',
        text: 'Unsprung mass is everything that moves with the wheel instead of being carried by the springs: the wheels and tyres, the brake discs and calipers, the hubs and the lower parts of the suspension arms. The body, engine, seats and passengers are sprung weight.',
      },
      { type: 'h2', text: 'Why it matters' },
      {
        type: 'p',
        text: 'When a wheel meets a bump, the wheel and tyre are thrown upward and the suspension has to push them back down onto the road. The more mass the wheel has, the more momentum it carries and the more work the spring and damper must do to keep the tyre in contact with the surface. A lighter wheel is easier to control, so the tyre can follow the road more closely. That tends to help grip and ride quality on uneven roads.',
      },
      {
        type: 'p',
        text: 'There is a second effect, which is rotation. A wheel also has to be spun up when you accelerate and slowed when you brake, and weight at the rim counts for more than weight near the hub. Less rotating mass makes the car a little easier to accelerate and to stop. The effect is real but small, and anyone who promises big numbers should be asked to show their test.',
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'Keep it in proportion',
        text: 'Wheel weight is one of several things that shape how a car feels. Tyres, dampers and alignment usually matter at least as much. A lighter wheel helps most when everything else is already in good order.',
      },
      { type: 'h2', text: 'Where forged wheels come in' },
      {
        type: 'p',
        text: `Because forging produces dense, strong metal, a forged wheel can use less of it than a cast wheel of the same size and design (see [forged vs cast vs flow-formed wheels](${BASICS}/forged-vs-cast-vs-flow-formed-wheels)). Less metal at the wheel means less unsprung and rotating mass, which is the benefit people buy forged wheels for.`,
      },
      { type: 'h2', text: 'What you can and cannot feel' },
      {
        type: 'p',
        text: 'Owners who move to a lighter set most often notice two things: the steering feels slightly more responsive, because there is less rotating mass to turn, and the car settles a little faster after a bump. What you should not expect is a transformation in acceleration or lap time. The honest test is a before-and-after drive on a road you know well, with the tyres at the same pressure.',
      },
      { type: 'h2', text: 'Three mistakes that cancel the benefit' },
      {
        type: 'ol',
        items: [
          '**Going up in size without checking weight.** A larger wheel with a lower-profile tyre can weigh more overall, even when it is forged.',
          '**Fitting a heavy tyre.** The tyre is part of the unsprung mass as well.',
          '**Comparing labels instead of weights.** Ask for the stated weight of the wheel at your size.',
        ],
      },
      { type: 'h2', text: 'What this means on South African roads' },
      {
        type: 'p',
        text: `Road surfaces here can be broken or patched, which makes the difference between a car that follows the road and one that skips over it easy to feel. A lighter wheel will not fix poor tyres or tired dampers, but it helps both do their job. A lower-profile tyre also has less sidewall to absorb impacts, so read [how to protect your wheels from potholes](${CARE}/protecting-wheels-from-potholes) before you choose a size.`,
      },
    ],
    faqs: [
      {
        q: 'What is unsprung weight in simple terms?',
        a: 'It is the weight of everything that is not held up by the car’s springs: mainly the wheels, tyres and brakes. Because this mass has to be pushed around by the suspension on every bump, reducing it has a bigger effect than reducing the weight of the body.',
      },
      {
        q: 'Does a lighter wheel improve fuel economy?',
        a: 'Any change is likely to be small. Driving style, tyres and conditions have a much larger effect on fuel use than the weight of the wheels.',
      },
      {
        q: 'How do I find out what a wheel weighs?',
        a: 'Ask the seller for the weight of each wheel at the size you want. If a listing does not state it, ask before you buy.',
      },
    ],
    more: ['forged-vs-cast-vs-flow-formed-wheels', 'are-forged-wheels-worth-it', 'protecting-wheels-from-potholes', 'how-to-read-a-wheel-load-rating'],
  },

  {
    slug: 'are-forged-wheels-worth-it',
    pillar: 'basics',
    title: 'Are forged wheels worth it on a BMW M car?',
    metaTitle: 'Are forged wheels worth it on a BMW M car?',
    description:
      'An honest look at who benefits from forged wheels, what they cost in Rand and when cast or flow-formed is the smarter buy for a BMW M3 or M4.',
    excerpt: 'Who gets real value from a forged set, who does not, and a simple way to decide.',
    keyword: 'are forged wheels worth it',
    related: ['forged wheels worth the money', 'forged vs cast', 'should I buy forged wheels', 'BMW M3 forged wheels'],
    intent: 'commercial',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Forged wheels cost more than cast ones, and plenty of the reasons given for buying them are marketing. Here is a straight way to decide whether they are worth it for you.',
      },
      { type: 'h2', text: 'What you are paying for' },
      {
        type: 'ul',
        items: [
          'Lower weight for a given size and strength.',
          'More freedom in size, offset and finish, because the wheel is machined rather than poured into a fixed mould.',
          'A denser, stronger metal.',
        ],
      },
      { type: 'h2', text: 'Who gets the most from forged wheels' },
      {
        type: 'ul',
        items: [
          'Owners who drive hard on good roads or take the car to track days, where the tyres and brakes are working.',
          'Owners who want a specific size, offset or finish that off-the-shelf cast wheels do not offer.',
          'Owners who plan to keep the car and want a wheel they will not outgrow.',
        ],
      },
      { type: 'h2', text: 'Who may not need them' },
      {
        type: 'ul',
        items: [
          'Daily drivers on a tight budget, where a good cast wheel will do the job.',
          'Anyone for whom looks matter but weight does not: a well finished cast wheel can look the part.',
          'Cars that spend most of their time in traffic, where unsprung weight is hard to notice.',
        ],
      },
      { type: 'h2', text: 'Three typical owners' },
      {
        type: 'table',
        caption: 'Typical cases, not rules. Your car, roads and budget decide.',
        head: ['Owner', 'What matters most', 'Forged?'],
        rows: [
          ['Weekend driver who enjoys the car', 'Feel, looks and a wheel that suits the car', 'A good fit if the budget allows'],
          ['Track-day owner', 'Low weight and strength under load', 'Where forged is worth the most'],
          ['Daily commuter on a tight budget', 'Cost and tyre choice', 'Cast or flow-formed is usually the better value'],
        ],
      },
      { type: 'h2', text: 'What forged wheels cost here' },
      {
        type: 'p',
        text: (f) =>
          f.priceRange
            ? `The forged wheel sets listed on this site are priced from ${f.minPrice} to ${f.maxPrice} per set of four, in Rand. The price depends on the design, the finish and the size. Our guide to [what forged wheels cost in South Africa](${BUYING}/how-much-do-forged-wheels-cost-in-south-africa) breaks it down.`
            : `Prices depend on the design, the finish and the size. Our guide to [what forged wheels cost in South Africa](${BUYING}/how-much-do-forged-wheels-cost-in-south-africa) breaks it down.`,
      },
      { type: 'h2', text: 'A simple way to decide' },
      {
        type: 'ol',
        items: [
          'Write down what you want from the wheels: lower weight, a particular look, a specific size, or all three.',
          `Check the wheel fits your car: bolt pattern, offset, centre bore and brake clearance ([fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore)).`,
          'Compare stated weights, not labels.',
          'Add the rest of the cost: tyres if the size changes, fitting and balancing.',
          'Ask the seller to confirm the fit for your exact car before you pay.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Questions worth asking any wheel seller',
        text: 'What does each wheel weigh at my size? Which offsets and which centre bore? Is this set in stock, or made to order, and how long will it take? Who confirms that it fits my car?',
      },
      { type: 'stock', heading: 'Forged wheels in stock now' },
      {
        type: 'cta',
        heading: 'Not sure which set suits your car?',
        text: 'Message us with your model and the wheels you like. We will tell you what fits and what is in stock.',
      },
    ],
    faqs: [
      {
        q: 'Are forged wheels worth the extra cost?',
        a: 'It depends on how you drive and what you want from the car. If lower weight, a specific fitment or a particular finish matters to you, forged is worth considering. If you simply want a cheaper wheel that looks good, cast may be the better value.',
      },
      {
        q: 'Will forged wheels make my M3 faster?',
        a: 'Not by themselves. Lower wheel weight can help acceleration, braking and ride quality a little, but the car’s power, tyres and setup do far more. Expect a car that feels better, not a different car.',
      },
      {
        q: 'Can I fit forged wheels without other changes?',
        a: 'In most cases the wheels bolt on, provided the bolt pattern, centre bore, offset and brake clearance suit your car. We confirm the fit for your exact car before anything is ordered.',
      },
    ],
    more: ['forged-vs-cast-vs-flow-formed-wheels', 'how-much-do-forged-wheels-cost-in-south-africa', 'bmw-g80-m3-forged-wheels', 'what-to-ask-before-buying-forged-wheels'],
  },

  /* ============================================================ FITMENT */
  {
    slug: 'wheel-fitment-explained-pcd-offset-centre-bore',
    pillar: 'fitment',
    title: 'Wheel fitment explained: bolt pattern, offset and centre bore',
    metaTitle: 'Wheel fitment explained: PCD, offset, centre bore',
    description:
      'A plain guide to the numbers that decide whether a wheel fits your BMW: bolt pattern (PCD), offset (ET), centre bore, width, diameter and brake clearance.',
    excerpt: 'The handful of measurements that decide whether a wheel fits, in plain English.',
    keyword: 'wheel offset PCD centre bore',
    related: ['BMW bolt pattern', 'wheel offset explained', 'centre bore hub rings', 'what is ET on a wheel', 'PCD meaning'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Fitment is a handful of measurements. If they match your car the wheel fits. If one is wrong, the wheel will not fit, or worse, it will seem to fit and not be safe. This is what each number means.',
      },
      { type: 'h2', text: 'Bolt pattern (PCD)' },
      {
        type: 'p',
        text: (f: CatalogueFacts) =>
          `The bolt pattern, or PCD (pitch circle diameter), is written as the number of bolts followed by the diameter of the circle they sit on, in millimetres.${
            f.pcd.length
              ? ` The wheels in stock on this site are listed as ${joinList(f.pcd)}, which means ${joinList(f.pcd.map(pcdPhrase))}.`
              : ''
          }`,
      },
      {
        type: 'p',
        text: 'The pattern has to match your hub exactly. A wheel that is out by a few millimetres can look as if it bolts on but will not seat correctly. BMW has used more than one pattern across its M generations, so a wheel made for an older M3 does not automatically fit a newer one.',
      },
      { type: 'h2', text: 'Offset (ET)' },
      {
        type: 'p',
        text: 'Offset, written ET (from the German Einpresstiefe), is the distance in millimetres between the wheel’s mounting face and the centreline of the wheel. A lower ET pushes the wheel further out towards the arch; a higher ET tucks it further in. Too far out and the tyre can rub the arch or stand proud of the bodywork. Too far in and it can foul the suspension or brakes.',
      },
      {
        type: 'p',
        text: (f) =>
          f.offsetRange
            ? `The sets in stock state offsets between ${f.offsetRange}. Offsets differ by design, and each wheel’s page shows the exact line for that set.`
            : '',
      },
      { type: 'h2', text: 'Centre bore' },
      {
        type: 'p',
        text: 'The centre bore is the hole in the middle of the wheel. BMW wheels are normally hub-centric, which means the wheel is centred on the car by that hole rather than by the bolts. If the wheel’s bore is larger than the hub, a ring fills the gap. If it is smaller, the wheel will not go on.',
      },
      {
        type: 'p',
        text: (f) =>
          f.centreBore.length ? `The wheels in stock list a centre bore of ${mm(f.centreBore)}.` : '',
      },
      { type: 'h2', text: 'Width and diameter' },
      {
        type: 'p',
        text: 'Diameter is the size of the wheel in inches and width is how wide the rim is. Together with the offset they decide how the wheel sits in the arch and which tyres can be fitted. Wider is not automatically better: the tyre, the offset and the arch all have to agree.',
      },
      { type: 'h2', text: 'Brake clearance and the bolt seat' },
      {
        type: 'p',
        text: 'Two details are easy to miss. First, the spokes have to clear your brake calipers, so a car with larger or upgraded brakes needs a wheel designed to clear them. Second, the bolt seat, the shape where the wheel bolt meets the wheel, has to match the bolts. Conical and ball seats are not interchangeable.',
      },
      {
        type: 'table',
        caption: 'The five checks and what goes wrong if one is missed.',
        head: ['Check', 'What it is', 'If it is wrong'],
        rows: [
          ['PCD', 'Bolt count and the circle the bolts sit on', 'The wheel does not seat on the hub'],
          ['Offset (ET)', 'Where the wheel sits in the arch', 'Rubbing, or a wheel that fouls the suspension or brakes'],
          ['Centre bore', 'The hole in the middle of the wheel', 'The wheel will not fit, or is not centred properly'],
          ['Diameter and width', 'The size of the rim', 'A tyre mismatch or rubbing'],
          ['Bolt seat', 'The shape where bolt meets wheel', 'The bolts do not clamp the wheel properly'],
        ],
      },
      { type: 'h2', text: 'A worked example: reading a listing' },
      {
        type: 'p',
        text: (f) =>
          f.example
            ? `Take a real listing: the ${f.example.design} in ${f.example.finish} carries the spec line “${f.example.spec}”. Read it left to right. The first part is the bolt pattern, the part that starts with ET gives the offsets that set is made with, and the part that starts with CB is the centre bore. Each of those has to agree with your car.`
            : '',
      },
      {
        type: 'p',
        text: 'The spec line is only the wheel’s half of the conversation. The other half is your car: its model, year and brake option. That is why we ask for them, and why we confirm the fit before anything is ordered.',
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Never guess a fit',
        text: 'If a seller cannot tell you the bolt pattern, offset and centre bore for the wheel, find another seller. We state them on each wheel’s page and confirm the fit for your exact car before anything is ordered.',
      },
      {
        type: 'cta',
        heading: 'Want us to check a fit?',
        text: 'Send your model, year and the wheel you like. We will confirm whether it suits your car.',
      },
    ],
    faqs: [
      {
        q: 'What does ET mean on a wheel?',
        a: 'ET is the offset: the distance in millimetres from the wheel’s mounting face to the centreline of the wheel. It comes from the German word Einpresstiefe. A lower number pushes the wheel further out; a higher number tucks it further in.',
      },
      {
        q: 'Can I use hub rings?',
        a: 'Yes, if the wheel’s centre bore is larger than your car’s hub, a hub-centric ring fills the gap so the wheel is centred properly. Ask the seller whether the wheel needs one for your car.',
      },
      {
        q: 'Where do I find my car’s bolt pattern?',
        a: 'Look up your exact model and chassis code (for example G80 for the current M3), or send it to us and we will confirm it.',
      },
    ],
    more: ['bmw-g80-m3-forged-wheels', 'staggered-vs-square-wheel-setups', 'are-forged-wheels-worth-it', 'hub-centric-rings-when-you-need-them'],
  },

  {
    slug: 'bmw-g80-m3-forged-wheels',
    pillar: 'fitment',
    title: 'Forged wheels for the BMW G80 M3: what to check before you order',
    metaTitle: 'Forged wheels for the BMW G80 M3: fitment guide',
    description:
      'Forged wheels for the BMW G80 M3: the fitment numbers, sizes and designs in stock, and what to check for brakes, tyres and sensors before you order.',
    excerpt: 'The G80 M3 checklist: fitment numbers, the designs in stock, and what to confirm before you order.',
    keyword: 'BMW G80 M3 forged wheels',
    related: ['G82 M4 forged wheels', 'BMW M3 wheels South Africa', 'G80 M3 wheel fitment', 'M3 Competition forged wheels', 'BMW M3 rims'],
    intent: 'commercial',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: (f) =>
          `The G80 is the current BMW M3 sedan. ${
            f.cars.length
              ? `The forged wheels in stock on this site right now are listed for: ${joinList(f.cars)}.`
              : 'Forged wheels for it are listed here whenever they are in stock.'
          } This guide is the checklist: the numbers, the designs and what to confirm before you order.`,
      },
      { type: 'h2', text: 'The fitment numbers' },
      {
        type: 'p',
        text: (f) => {
          const parts = [
            f.pcd.length && `a bolt pattern of ${joinList(f.pcd)}`,
            f.centreBore.length && `a centre bore of ${mm(f.centreBore)}`,
            f.offsetRange && `offsets in the range ${f.offsetRange}`,
            f.sizes.length && `sizes of ${joinList(f.sizes)}`,
          ].filter(Boolean) as string[];
          return parts.length
            ? `Every set carries its own spec. Today the sets in stock have ${joinList(parts)}. Each wheel’s page shows the exact line for that set. If any of those terms are new, read [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore).`
            : '';
        },
      },
      { type: 'h2', text: 'Designs in stock for the G80' },
      { type: 'designTable', caption: 'One row per design. The price is the lowest in stock for that design, per set of four.' },
      { type: 'h2', text: 'Two sizes in one listing' },
      {
        type: 'p',
        text: `Each listing states two sizes. That is a staggered set: a different wheel size for each axle. Read [staggered vs square setups](${FITMENT}/staggered-vs-square-wheel-setups) to see what that means for tyres and rotation, and confirm with us which size goes on which axle.`,
      },
      { type: 'h2', text: 'What to check before you order' },
      {
        type: 'ul',
        items: [
          '**Your exact model.** Standard, Competition, CS, with or without xDrive, and the year. Tell us all of it.',
          '**Brakes.** Say whether your car has the standard M brakes or the optional carbon ceramic ones, because the wheel has to clear the calipers.',
          '**Tyres.** Confirm the tyre sizes that suit the new wheel sizes and offsets. Do not reuse old tyres without checking.',
          '**Tyre pressure sensors.** Check that the sensors are transferred to the new wheels or replaced, and who will do it.',
          '**Wheel bolts.** Confirm that the bolt seat of the new wheels matches the bolts you will use.',
        ],
      },
      { type: 'h2', text: 'On fitting day' },
      {
        type: 'ol',
        items: [
          'Confirm that the wheel and tyre sizes match what was ordered before anything is fitted.',
          'Check that the hub faces are clean and that the wheel bolts are the right type for the wheels.',
          'Make sure each wheel goes on the right axle, because the sizes differ front and rear.',
          `Have the bolts tightened with a calibrated torque wrench to your car’s specified figure (see [how to torque wheel bolts](${CARE}/wheel-bolt-torque-and-care)).`,
          'Re-check the torque after the first short drive.',
        ],
      },
      { type: 'h2', text: 'What about the G82 M4?' },
      {
        type: 'p',
        text: 'The G82 M4 is the coupe of the same generation. We list each set against the cars it is listed for, and the sets in stock today are listed for the cars named at the top of this page. If you drive an M4, message us with your model and year and we will tell you which sets, if any, suit it, or whether one can be ordered.',
      },
      { type: 'stock', heading: 'Forged wheels in stock for the M3' },
      {
        type: 'cta',
        heading: 'Check a set against your car',
        text: 'Send your model, year and brake option. We confirm the fit before anything is ordered.',
      },
    ],
    faqs: [
      {
        q: 'Which forged wheels fit a BMW G80 M3?',
        a: (f) =>
          f.cars.length
            ? `The sets in stock today are listed for ${joinList(f.cars)}. Each wheel’s page shows its spec, and we confirm the fit for your exact car before anything is ordered.`
            : 'Message us with your model and year and we will tell you what is available.',
      },
      {
        q: 'What bolt pattern do the G80 M3 wheels in stock have?',
        a: (f) =>
          f.pcd.length
            ? `The forged sets in stock are listed with a bolt pattern of ${joinList(f.pcd)}. We confirm the fit for your car before you order.`
            : 'The bolt pattern is shown on each wheel’s page.',
      },
      {
        q: 'Do these wheels fit the M3 Competition?',
        a: (f) => {
          const competition = f.cars.filter((car) => /competition/i.test(car));
          return competition.length
            ? `The listings include ${joinList(competition)}. We confirm the fit for your exact model before anything is ordered.`
            : 'Ask us. We confirm the fit for your exact model before anything is ordered.';
        },
      },
      {
        q: 'Can I order a colour that is not in stock?',
        a: (f) => `Yes. Other colours of a design can be ordered. ${f.toOrderNotice}`,
      },
    ],
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'staggered-vs-square-wheel-setups', 'in-stock-vs-made-to-order-forged-wheels', 'tyre-pressure-sensors-after-a-wheel-change'],
  },

  {
    slug: 'staggered-vs-square-wheel-setups',
    pillar: 'fitment',
    title: 'Staggered vs square wheel setups on a BMW M3',
    metaTitle: 'Staggered vs square wheels on a BMW M3 explained',
    description:
      'What a staggered wheel setup is, how it differs from a square setup, and what each means for tyres, rotation and handling on a BMW M3 or M4.',
    excerpt: 'Different sizes front and rear, or the same all round? What each means for tyres and handling.',
    keyword: 'staggered vs square wheels BMW',
    related: ['staggered wheel setup', 'square wheel setup', 'M3 staggered wheels', 'can you rotate staggered tyres'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'When you look at a wheel listing for a BMW M car you will often see two sizes instead of one. That is a staggered set. Here is what it means, why performance cars use it and what changes if you go square instead.',
      },
      { type: 'h2', text: 'Staggered and square, defined' },
      {
        type: 'p',
        text: 'A **staggered** setup uses a different wheel size at the front and the rear, usually a wider wheel (and sometimes a larger one) on the rear axle. A **square** setup uses the same size on all four corners.',
      },
      { type: 'h2', text: 'Why performance cars are often staggered' },
      {
        type: 'p',
        text: 'Many rear-wheel-drive performance cars carry wider wheels and tyres at the rear to help put the power down and to balance the car. BMW M cars have commonly used this layout, which is why the sets listed for them state two sizes.',
      },
      {
        type: 'p',
        text: (f) =>
          f.sizes.length
            ? `The sets in stock on this site are listed with sizes of ${joinList(f.sizes)}.`
            : '',
      },
      { type: 'h2', text: 'The trade-offs' },
      {
        type: 'table',
        head: ['', 'Staggered', 'Square'],
        rows: [
          ['Grip and balance', 'A wider rear tyre helps traction and balance', 'The rear tyre is no wider than the front, so rear grip can be lower'],
          ['Tyre rotation', 'Front-to-rear rotation is not possible', 'Tyres can be rotated front to rear for even wear'],
          ['Tyres to stock', 'Two different sizes', 'One size'],
          ['Factory match', 'Matches how many M cars leave the factory', 'A change from the way the car was designed'],
        ],
      },
      { type: 'h2', text: 'What staggered means for your tyres' },
      {
        type: 'ul',
        items: [
          'You buy two tyre sizes, and the fronts and rears usually wear at different rates, so they are often replaced separately.',
          'Keep a note of which tyre size belongs on which axle, so the right one is ordered each time.',
          'A front tyre cannot stand in for a rear one, so the spare plan (a tyre, a repair kit or a call-out) needs to allow for two sizes.',
        ],
      },
      { type: 'h2', text: 'Which should you choose?' },
      {
        type: 'p',
        text: 'For most owners the answer is to stay with the layout the car was designed around. The suspension, the stability systems and the tyre choices are all set up for it. Going square is possible, but it changes the handling balance and needs the right offsets and tyres, so talk to us before you decide.',
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Do not mix up the axles',
        text: 'Staggered wheels are not interchangeable from front to rear. Check which size goes on which axle before the tyres are fitted.',
      },
      {
        type: 'cta',
        heading: 'Unsure which layout suits your car?',
        text: 'Tell us your model and year and we will confirm what each set is sized for.',
      },
    ],
    faqs: [
      {
        q: 'Can I rotate tyres on a staggered setup?',
        a: 'Not from front to rear, because the sizes differ. Tyres can only be swapped side to side on the same axle, and only if they are not directional.',
      },
      {
        q: 'Is staggered better than square?',
        a: 'Neither is better in every case. Staggered suits cars designed for it and gives a wider rear tyre. Square makes tyre rotation easier and needs only one tyre size.',
      },
      {
        q: 'Can I run a square setup on an M3?',
        a: 'It can be done, but it changes the tyres, the offsets and the handling balance. Message us before you decide.',
      },
    ],
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'bmw-g80-m3-forged-wheels', 'protecting-wheels-from-potholes', 'plus-sizing-wheels-and-tyres'],
  },

  /* ============================================================ BUYING */
  {
    slug: 'how-much-do-forged-wheels-cost-in-south-africa',
    pillar: 'buying',
    title: 'How much do forged wheels cost in South Africa?',
    metaTitle: 'How much do forged wheels cost in South Africa?',
    description:
      'What drives the price of a forged wheel set in Rand, what the sets on this site cost per set of four today and what else to budget for.',
    excerpt: 'What moves the price of a forged set in Rand, what is in stock today and what else to budget for.',
    keyword: 'forged wheels price South Africa',
    related: ['forged rims price', 'BMW M3 rims price South Africa', 'how much do forged wheels cost', 'forged wheels for sale South Africa'],
    intent: 'commercial',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: (f) =>
          f.priceRange
            ? `Right now the forged wheel sets listed on this site cost ${f.priceRange} per set of four, in Rand. That is a wide range, so here is what moves the price and what else to budget for.`
            : 'Forged wheel prices depend on several things. Here is what moves the price and what else to budget for.',
      },
      { type: 'h2', text: 'Prices here are per set of four' },
      {
        type: 'p',
        text: 'Every price on this site is in South African Rand for a complete set of four wheels, not for one wheel. When you compare with another seller, check which of the two they are quoting.',
      },
      { type: 'h2', text: 'What decides the price' },
      {
        type: 'ul',
        items: [
          '**Design.** Complex spoke designs take more machining.',
          '**Size.** Larger and wider wheels use more material.',
          '**Finish.** Some finishes cost more than others.',
          `**In stock or made to order.** See [in-stock vs made-to-order wheels](${BUYING}/in-stock-vs-made-to-order-forged-wheels).`,
          '**The exchange rate and shipping.** Many forged wheels sold in South Africa are made abroad, so the Rand exchange rate and shipping costs can move prices over time.',
        ],
      },
      { type: 'h2', text: 'What the sets in stock cost' },
      { type: 'designTable', caption: 'The lowest price in stock for each design, per set of four, in Rand.' },
      { type: 'h2', text: 'Where the money goes' },
      {
        type: 'p',
        text: 'A forged wheel costs more than a cast one because more of the work is done by machine and by hand: the alloy is pressed and then machined to shape, and the finish is applied to a surface that must be right. Add freight and the seller’s own costs of stocking, advising and confirming the fit, and the price of a set follows.',
      },
      {
        type: 'p',
        text: 'Two quotes are only comparable when they cover the same things. If one seller quotes per set of four with the wheel bolts included and another quotes per wheel without them, the two numbers describe different purchases. Line the items up before you compare the totals.',
      },
      { type: 'h2', text: 'What else to budget for' },
      {
        type: 'ul',
        items: [
          'Tyres, if the new wheels are a different size or your current tyres are worn.',
          'Fitting and balancing.',
          'Tyre pressure sensors, if they need to be transferred or replaced.',
          'Wheel bolts, if the new wheels need a different bolt seat.',
        ],
      },
      { type: 'p', text: 'Ask any seller to list exactly what is included in the price, so you can compare like with like.' },
      { type: 'h2', text: 'How to compare quotes fairly' },
      {
        type: 'ol',
        items: [
          'Compare the same size, offset and finish.',
          'Check whether the price is per wheel or per set of four.',
          'Check whether the set is in stock or has a lead time.',
          'Check what is included.',
          'Check who confirms the fit for your car.',
        ],
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'Prices and stock change',
        text: 'The figures on this page come from the live catalogue, but confirm both price and stock with the shop before you rely on them.',
      },
      { type: 'stock', heading: 'Forged wheels in stock now' },
      {
        type: 'cta',
        heading: 'Want a quote for your car?',
        text: 'Message us with your model and the wheels you like. We will confirm the price, the fit and the stock.',
      },
    ],
    faqs: [
      {
        q: 'Is the price per wheel or per set?',
        a: 'Every price on this site is per set of four, in South African Rand.',
      },
      {
        q: 'Why do prices differ between designs?',
        a: 'Design, size and finish all change the price, and for some designs the price differs from one finish to another. Each listing shows its own price.',
      },
      {
        q: 'Do prices change?',
        a: 'Yes. Prices and stock change, so confirm both with the shop before you rely on them.',
      },
    ],
    more: ['are-forged-wheels-worth-it', 'in-stock-vs-made-to-order-forged-wheels', 'choosing-a-wheel-finish-for-your-bmw-m-car'],
  },

  {
    slug: 'in-stock-vs-made-to-order-forged-wheels',
    pillar: 'buying',
    title: 'In-stock vs made-to-order forged wheels: how it works',
    metaTitle: 'In-stock vs made-to-order forged wheels',
    description:
      'How in-stock and made-to-order forged wheels work: what a listing means, how other colours are ordered and the lead time to expect.',
    excerpt: 'What a listing means, how other colours are ordered and how long to plan for.',
    keyword: 'made to order forged wheels',
    related: ['forged wheels lead time', 'custom forged wheels South Africa', 'order forged wheels', 'wheels in stock'],
    intent: 'commercial',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Every wheel on this site is either in stock or made to order, and the two work differently. Knowing which is which saves you time when you plan the work on your car.',
      },
      { type: 'h2', text: 'What an in-stock listing means' },
      {
        type: 'p',
        text: 'Each wheel listing is one design in one finish that we have in stock right now. A wheel appears on the site only while it is in stock. When a set is sold it comes off the site, so you never see a wheel we cannot supply.',
      },
      { type: 'h2', text: 'What made to order means' },
      {
        type: 'p',
        text: (f) =>
          `${f.toOrderNotice} Each wheel’s page lists the other colours of that design that can be ordered. Plan around the lead time if you need the car back on the road with the new set by a particular date.`,
      },
      { type: 'h2', text: 'In stock or made to order: which is right?' },
      {
        type: 'table',
        head: ['', 'Good when', 'Watch out for'],
        rows: [
          ['In stock', 'You want the wheels soon and you like the colour', 'Quantities are small, and a sold set is gone'],
          ['Made to order', 'You want a specific colour and can wait', (f: CatalogueFacts) => `A lead time of ${f.leadTime} applies`],
        ],
      },
      { type: 'h2', text: 'How to order' },
      {
        type: 'ol',
        items: [
          'Browse the wheels in stock and open the design you like.',
          'On the wheel’s page, look at the colours listed as made to order.',
          'Send us your car’s model and year and the colour you want, using the enquiry form or WhatsApp.',
          'We confirm the fit for your car and the lead time before anything is ordered.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Colour families',
        text: (f) =>
          f.finishFamilies.length
            ? `The colour families we work with are ${joinList(f.finishFamilies)}. Read [how to choose a wheel colour and finish](${BUYING}/choosing-a-wheel-finish-for-your-bmw-m-car) for help picking one.`
            : '',
      },
      { type: 'stock', heading: 'Wheels in stock now' },
    ],
    faqs: [
      {
        q: 'How long does a made-to-order set take?',
        a: (f) => `A lead time of ${f.leadTime} applies to colours that are not in stock.`,
      },
      {
        q: 'What if the set I want is sold?',
        a: 'A sold set is removed from the site. Message us, because we may be able to order the same design in another colour, with the lead time that applies.',
      },
      {
        q: 'Do you confirm the fit before ordering?',
        a: 'Yes. We confirm the fit for your exact car before anything is ordered.',
      },
    ],
    more: ['how-much-do-forged-wheels-cost-in-south-africa', 'choosing-a-wheel-finish-for-your-bmw-m-car', 'bmw-g80-m3-forged-wheels'],
  },

  {
    slug: 'choosing-a-wheel-finish-for-your-bmw-m-car',
    pillar: 'buying',
    title: 'How to choose a wheel colour and finish for your BMW M car',
    metaTitle: 'Choosing a wheel colour for your BMW M car',
    description:
      'Silver, black, bronze or hyper black: how to choose a wheel colour and finish for your BMW M car, with paint pairings and care differences.',
    excerpt: 'Silver, black, bronze or hyper black: how to pick a finish, and what each asks of you.',
    keyword: 'BMW M3 wheel colour',
    related: ['best wheel colour for BMW', 'bronze wheels BMW', 'black wheels M3', 'matte vs gloss wheels'],
    intent: 'commercial',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'The finish changes how a set of wheels looks on your car more than almost any other choice you will make, and it changes how you look after them. Here is how to think about it.',
      },
      { type: 'h2', text: 'The finish families' },
      {
        type: 'p',
        text: (f) =>
          f.finishFamilies.length
            ? `Our finishes come in four families: ${joinList(f.finishFamilies)}.${
                f.finishes.length ? ` The finishes in stock right now are ${joinList(f.finishes)}.` : ''
              }`
            : '',
      },
      { type: 'h2', text: 'Matching a finish to your paint' },
      {
        type: 'ul',
        items: [
          '**Silver and liquid metal.** A clean look that works on almost any paint, and shows off the spoke design on darker cars.',
          '**Black, matte or gloss.** Subtle on dark paint and a strong contrast on light paint. Gloss reflects light; matte absorbs it.',
          '**Gold and bronze.** Warm tones that stand out on black, grey and blue paint.',
          '**Hyper black.** A very dark finish for a low-key, uniform look.',
        ],
      },
      {
        type: 'p',
        text: 'These are starting points, not rules. The best way to judge is to see the wheels on a real car, and our [installs page](/installs) shows customer cars on their wheels.',
      },
      { type: 'h2', text: 'Practical differences' },
      {
        type: 'ul',
        items: [
          'Every finish shows brake dust and road grime. Regular cleaning matters whichever you choose.',
          'Matte surfaces should not be treated with polishes made for gloss, which can leave shiny patches.',
          'A polished face needs gentler cleaning than a painted one.',
        ],
      },
      {
        type: 'p',
        text: `Our guide to [how to clean forged wheels](${CARE}/how-to-clean-forged-wheels) covers each finish.`,
      },
      { type: 'h2', text: 'If the colour you want is not in stock' },
      {
        type: 'p',
        text: (f) =>
          `${f.toOrderNotice} Each wheel’s page lists the colours of that design that can be ordered, and [in-stock vs made-to-order wheels](${BUYING}/in-stock-vs-made-to-order-forged-wheels) explains how ordering works.`,
      },
      { type: 'stock', heading: 'Finishes in stock now' },
    ],
    faqs: [
      {
        q: 'Does the finish change the price?',
        a: 'For some designs, yes. Each listing shows its own price per set of four.',
      },
      {
        q: 'How do I look after a matte finish?',
        a: `Use a pH-neutral wheel cleaner and a soft brush, and avoid polishes made for gloss. See [how to clean forged wheels](${CARE}/how-to-clean-forged-wheels).`,
      },
      {
        q: 'Can I see the wheels on a real car?',
        a: 'Yes. The [installs page](/installs) shows customer cars on their wheels.',
      },
    ],
    more: ['in-stock-vs-made-to-order-forged-wheels', 'how-to-clean-forged-wheels', 'how-much-do-forged-wheels-cost-in-south-africa', 'painted-powder-coated-and-polished-wheel-finishes'],
  },

  /* ============================================================ CARE */
  {
    slug: 'how-to-clean-forged-wheels',
    pillar: 'care',
    title: 'How to clean forged wheels without damaging the finish',
    metaTitle: 'How to clean forged wheels safely',
    description:
      'A step-by-step method for cleaning forged wheels safely: what to use, what to avoid, how often, and how to treat matte, gloss and polished finishes.',
    excerpt: 'A safe step-by-step wash, what to avoid and how to treat matte, gloss and polished faces.',
    keyword: 'how to clean forged wheels',
    related: ['clean matte wheels', 'brake dust removal', 'wheel cleaner pH neutral', 'wheel care'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Most damage to a wheel’s finish comes from the cleaning, not from the road. Harsh chemicals, hard brushes and hot wheels do more harm than brake dust. This is a safe method that works on forged wheels in any finish.',
      },
      { type: 'h2', text: 'Step by step' },
      {
        type: 'ol',
        items: [
          '**Let the wheels cool.** Cleaner dries on a hot wheel and can stain the finish. Park in the shade for a few minutes after driving.',
          '**Rinse first.** Wash off loose dirt and brake dust with plenty of water, so you do not drag grit across the surface.',
          '**Apply a pH-neutral wheel cleaner.** Check that it is safe for your finish. Avoid strongly acidic or alkaline products unless the finish’s maker says they are safe.',
          '**Agitate gently.** Use a soft brush for the barrel and around the bolts, and a separate soft mitt for the face.',
          '**Rinse thoroughly.** Include the barrel and the area behind the spokes.',
          '**Dry with a clean microfibre towel.** This prevents water spots.',
          '**Optional: add protection.** A sealant or coating made for wheels and suited to your finish makes later cleaning easier.',
        ],
      },
      { type: 'h2', text: 'What to avoid' },
      {
        type: 'ul',
        items: [
          'Stiff-bristled brushes and abrasive pads.',
          'Household cleaners, bleach and oven cleaner.',
          'Cleaning wheels while they are hot.',
          'A pressure washer held very close to the wheel, especially near edges and the valve.',
          'Polishes made for gloss paint on matte finishes.',
        ],
      },
      { type: 'h2', text: 'Matte, gloss and polished finishes' },
      {
        type: 'p',
        text: '**Matte** surfaces should never be rubbed with polish, because it can leave shiny patches. Use a gentle cleaner and a soft cloth. **Gloss** finishes tolerate a little more, but still need soft tools. **Polished faces** are the most delicate: use the mildest cleaner and avoid anything abrasive.',
      },
      { type: 'h2', text: 'How often' },
      {
        type: 'p',
        text: 'Brake dust left to bake on can damage some finishes, so a regular rinse and wash beats an occasional deep clean. As a guide, wash the wheels whenever you wash the car, and sooner after wet weather or dusty roads. If the finish’s maker or your supplier gives care instructions, follow them.',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Not sure about a product?',
        text: 'Test it on a small, hidden area first, and ask the seller if you are unsure whether it suits your finish.',
      },
      {
        type: 'p',
        text: `Choosing a finish and want to know how much care it needs? Read [how to choose a wheel colour and finish](${BUYING}/choosing-a-wheel-finish-for-your-bmw-m-car).`,
      },
    ],
    faqs: [
      {
        q: 'What can I use to clean forged wheels?',
        a: 'A pH-neutral wheel cleaner, soft brushes and mitts, plenty of water and a microfibre towel. Check that the cleaner is safe for your finish.',
      },
      {
        q: 'Can I use a pressure washer on forged wheels?',
        a: 'For rinsing, yes, at a sensible distance. Keep the nozzle back from edges and the valve, and do not use it to blast a dry, dirty wheel at close range.',
      },
      {
        q: 'How do I remove stubborn brake dust?',
        a: 'Repeat the pH-neutral clean with a little more contact time, without letting the cleaner dry. Use a specialist remover only if the finish’s maker says it is safe.',
      },
      {
        q: 'Does a wheel coating help?',
        a: 'A coating made for wheels can make cleaning easier. Choose one suited to your finish and apply it to a perfectly clean wheel.',
      },
    ],
    more: ['wheel-bolt-torque-and-care', 'choosing-a-wheel-finish-for-your-bmw-m-car', 'protecting-wheels-from-potholes'],
  },

  {
    slug: 'wheel-bolt-torque-and-care',
    pillar: 'care',
    title: 'How to torque wheel bolts correctly (and why it matters)',
    metaTitle: 'How to torque wheel bolts correctly',
    description:
      'Why wheel bolts need the right torque, how to tighten them in the correct sequence with a torque wrench, and when to re-check them after fitting new wheels.',
    excerpt: 'Why the right torque matters, the correct tightening sequence and when to re-check.',
    keyword: 'wheel bolt torque',
    related: ['BMW wheel bolt torque', 'torque wrench wheels', 'lug bolt care', 'tightening wheel bolts'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Wheel bolts hold the wheel to the car, so tightening them correctly is a safety job rather than a cosmetic one. It takes a few minutes and a torque wrench.',
      },
      { type: 'h2', text: 'Why torque matters' },
      {
        type: 'p',
        text: 'A bolt that is too loose lets the wheel move on the hub, which can loosen the bolts further and cause vibration. A bolt that is too tight can stretch, damage its thread, or distort the wheel and brake disc. The specified torque is the figure that clamps the wheel firmly without overloading anything.',
      },
      { type: 'h2', text: 'Use the figure for your car' },
      {
        type: 'p',
        text: 'Every car has a specified wheel bolt torque. Find it in the owner’s manual or ask a BMW dealer, and use that figure. Do not copy a number from a forum or from a different car. If the wheel’s maker states a figure for the wheel, tell your fitter so they can compare the two.',
      },
      { type: 'h2', text: 'Step by step' },
      {
        type: 'ol',
        items: [
          '**Clean the mating surfaces.** Wipe the hub face and the back of the wheel so metal meets clean metal.',
          '**Check the bolts.** The bolt seat must match the wheel’s seat.',
          '**Start every bolt by hand.** This avoids cross-threading.',
          '**Snug the bolts in a star pattern.** Work across the wheel, not around it, until it sits flat against the hub.',
          '**Lower the car so the tyre touches the ground.** This stops the wheel turning while you tighten.',
          '**Torque with a calibrated wrench.** Bring each bolt to the specified torque, again in a star pattern. An impact gun can run bolts on, but it should not set the final torque.',
          '**Re-check after the first drive.**',
        ],
      },
      { type: 'h2', text: 'Common mistakes' },
      {
        type: 'ul',
        items: [
          'Tightening bolts in a circle instead of a star pattern.',
          'Using an impact gun for the final tightening.',
          'Tightening with the wheel in the air, so the wheel turns.',
          'Mixing bolts with different seats, or reusing bolts that do not suit the wheels.',
          'Skipping the re-check after the first drive.',
        ],
      },
      { type: 'h2', text: 'Re-check after the first drive' },
      {
        type: 'p',
        text: 'It is common practice to re-check the torque after the first short drive following any wheel change, because the mating surfaces settle together. Ask your fitter or the wheel’s maker what they recommend.',
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Check your wrench',
        text: 'A torque wrench that is not calibrated can be wrong without you knowing. Have yours checked from time to time, and replace one that has been dropped.',
      },
      {
        type: 'p',
        text: `Fitting new forged wheels? Read [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore) to be sure the bolt seat and the rest of the fitment suit your car.`,
      },
    ],
    faqs: [
      {
        q: 'Can I use an impact wrench to fit wheels?',
        a: 'An impact wrench can run the bolts on, but the final tightening should be done with a calibrated torque wrench to the specified figure. Impact tools do not control the final torque.',
      },
      {
        q: 'Should I put grease on the bolt threads?',
        a: 'Follow the instructions for your car and bolts. Some manufacturers specify clean, dry threads, and lubricant changes how much clamping force a given torque produces. If you are unsure, ask your fitter.',
      },
      {
        q: 'How often should I check wheel bolt torque?',
        a: 'After the first short drive following any wheel change, and whenever the wheels have been off the car. Ask your fitter if you want a routine check.',
      },
    ],
    more: ['how-to-clean-forged-wheels', 'protecting-wheels-from-potholes', 'wheel-fitment-explained-pcd-offset-centre-bore', 'wheel-balancing-and-alignment-after-new-wheels'],
  },

  {
    slug: 'protecting-wheels-from-potholes',
    pillar: 'care',
    title: 'How to protect your wheels from potholes and road damage',
    metaTitle: 'Protecting wheels from potholes and road damage',
    description:
      'Practical ways to reduce wheel and tyre damage on rough South African roads: tyre pressure, sidewall height, driving over potholes and checks after a hit.',
    excerpt: 'Tyre pressure, sidewall height, how to drive over a pothole and what to check after a hard hit.',
    keyword: 'pothole damage wheels',
    related: ['bent rim', 'tyre sidewall damage', 'protect alloy wheels', 'low profile tyres potholes'],
    intent: 'informational',
    published: PUBLISHED,
    updated: PUBLISHED,
    body: [
      {
        type: 'p',
        text: 'Rough roads and potholes are an everyday hazard in South Africa, and a performance wheel with a low-profile tyre is more exposed than most. You cannot avoid every hole, but a few habits lower the risk and the cost.',
      },
      { type: 'h2', text: 'How wheels get damaged' },
      {
        type: 'p',
        text: 'The edge of a pothole can hit the tyre hard enough to pinch the sidewall against the rim. The result can be a bent rim, a cracked wheel, a damaged tyre or a bulge in the sidewall.',
      },
      { type: 'h2', text: 'How to reduce the risk' },
      {
        type: 'ul',
        items: [
          '**Keep the tyres at the right pressure.** Use the figure on your car’s tyre placard or in the owner’s manual. Under-inflated tyres pinch more easily.',
          '**Slow down before the hole,** rather than braking while you are in it.',
          '**Look well ahead** and leave extra space behind the car in front, so you see the road surface in time.',
          '**Be wary of standing water,** which can hide a pothole.',
          '**Choose the tyre size sensibly.** A taller sidewall protects the rim better than a very low profile.',
        ],
      },
      { type: 'h2', text: 'The size trade-off' },
      {
        type: 'p',
        text: `Larger wheels with lower-profile tyres look good and sharpen the feel of the car, but they leave less rubber to cushion an impact. A lighter wheel helps the suspension follow the road (see [unsprung weight explained](${BASICS}/unsprung-weight-explained)), but it does not make the wheel immune to a hard hit.`,
      },
      { type: 'h2', text: 'What to check after a hard hit' },
      {
        type: 'ul',
        items: [
          'Vibration through the steering wheel at speed.',
          'The car pulling to one side.',
          'A visible bend, crack or flat spot on the rim.',
          'A bulge or cut in the tyre’s sidewall.',
          'A tyre that keeps losing pressure.',
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'If in doubt, stop',
        text: 'Have the wheel and tyre inspected before you drive at speed. A cracked or bent wheel should not be ignored.',
      },
      {
        type: 'p',
        text: 'Forged wheels are strong for their weight, but a hard enough impact can still bend or crack any wheel.',
      },
    ],
    faqs: [
      {
        q: 'Are forged wheels more resistant to pothole damage?',
        a: 'A well-made forged wheel is strong for its weight, but no wheel is immune. Tyre pressure, tyre size and how you drive over a hole matter as much.',
      },
      {
        q: 'Can a bent wheel be repaired?',
        a: 'It depends on the damage and on the wheel. Have it inspected by a specialist, and do not drive on a wheel you suspect is cracked.',
      },
      {
        q: 'What tyre pressure should I run?',
        a: 'The pressure on your car’s tyre placard or in the owner’s manual, for the load you are carrying.',
      },
    ],
    more: ['unsprung-weight-explained', 'how-to-clean-forged-wheels', 'wheel-bolt-torque-and-care'],
  },
  /* ====================================================== MORE (23 Nov 2026) */
  {
    slug: 'hub-centric-rings-when-you-need-them',
    pillar: 'fitment',
    title: 'Hub-centric rings: when you need them and when you do not',
    metaTitle: 'Hub-centric rings: when your wheels need them',
    description:
      'What hub-centric rings are, when a wheel needs them, how a poor fit shows up as vibration, and how to check a wheel’s centre bore against your BMW’s hub.',
    excerpt: 'Rings fill the gap between a wheel’s centre hole and your hub. When you need one, and when you do not.',
    keyword: 'hub centric rings BMW',
    related: ['hub centric vs lug centric', 'centre bore hub rings', 'wheel vibration at speed', 'do I need hub rings'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'Most wheels made for a BMW M car are centred on the hub by the hole in the middle of the wheel, not by the wheel bolts. That is what hub-centric means. If the wheel’s centre hole is bigger than your car’s hub, a hub-centric ring fills the gap. If the hole already matches the hub, you do not need one.',
      },
      { type: 'h2', text: 'What hub-centric means' },
      {
        type: 'p',
        text: 'A hub-centric wheel sits on a short collar of the hub, called the spigot. The collar centres the wheel, and the bolts then only clamp it in place. A lug-centric wheel is centred by the tapered seats of the bolts alone. Hub-centric centring is accurate and repeatable, which is why it is the normal design for BMW wheels.',
      },
      { type: 'h2', text: 'When you need a ring' },
      {
        type: 'p',
        text: 'You need rings when the wheel’s centre bore is larger than your hub and the wheel’s maker specifies rings for your car. If the two match, rings are not needed. If the wheel’s bore is smaller than the hub, the wheel will not fit at all, and a ring cannot help. Never machine a hub or force a wheel on.',
      },
      {
        type: 'p',
        text: (f) =>
          f.centreBore.length
            ? `The wheels in stock list a centre bore of ${mm(f.centreBore)}. Each wheel’s page shows the exact figure for that set, and we confirm it against your car before anything is ordered. Read [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore) for how the centre bore sits alongside the other fitment numbers.`
            : `Read [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore) for how the centre bore sits alongside the other fitment numbers.`,
      },
      { type: 'h2', text: 'What a poor fit feels like' },
      {
        type: 'p',
        text: `If a wheel is not centred properly, the usual sign is a vibration that builds with speed and does not go away after balancing: a shake in the steering wheel or a buzz through the seat. Centring is one possible cause, but a bent wheel or a faulty tyre gives the same symptoms, so ask the fitter to check before assuming. [Balancing and alignment after new wheels](${CARE}/wheel-balancing-and-alignment-after-new-wheels) covers the other checks.`,
      },
      { type: 'h2', text: 'Choosing and fitting rings' },
      {
        type: 'ul',
        items: [
          '**Match both sizes.** The ring’s outer diameter must fit the wheel’s bore, and its inner diameter must fit your hub.',
          '**Ask what the wheel’s maker recommends.** Rings are made in plastic and in metal.',
          '**Clean the hub, the ring and the wheel seat** before fitting, so there is no grit between them.',
          `**Tighten the wheel bolts to the specified figure** once the wheel is on (see [how to torque wheel bolts](${CARE}/wheel-bolt-torque-and-care)).`,
          '**Refit the rings every time the wheels come off.** A loose ring is easy to lose.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Check before you buy',
        text: 'Ask the seller for the wheel’s centre bore and your car’s hub size in writing. If they differ, ask which ring is needed and whether it comes with the wheels.',
      },
      {
        type: 'cta',
        heading: 'Not sure what your car needs?',
        text: 'Send us your model and year. We will tell you what the wheel needs to fit your car.',
      },
    ],
    faqs: [
      {
        q: 'Do I need hub-centric rings?',
        a: 'Only if the wheel’s centre bore is larger than your car’s hub and the wheel’s maker specifies rings. If the bore matches the hub, the wheel centres on the hub by itself and no ring is needed.',
      },
      {
        q: 'Can a ring make a wheel fit when its centre hole is too small?',
        a: 'No. A ring fills the gap between a larger hole and a smaller hub. A hole that is too small for the hub cannot be fixed with a ring.',
      },
      {
        q: 'Are hub-centric rings safe?',
        a: 'They are widely used and are safe when they are the right size, clean and fitted with the wheel bolts tightened to the specified figure. The bolts, not the ring, clamp the wheel to the car.',
      },
    ],
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'wheel-balancing-and-alignment-after-new-wheels', 'wheel-bolt-torque-and-care'],
  },

  {
    slug: 'tyre-pressure-sensors-after-a-wheel-change',
    pillar: 'fitment',
    title: 'Tyre pressure sensors after a wheel change on a BMW',
    metaTitle: 'Tyre pressure sensors after a wheel change',
    description:
      'What happens to your BMW’s tyre pressure monitoring when you change wheels: moving the sensors, fitting new ones, the reset and what to ask your fitter.',
    excerpt: 'Move the old sensors or fit new ones, then tell the car. What to do and what to ask your fitter.',
    keyword: 'tyre pressure sensors BMW wheel change',
    related: ['TPMS new wheels BMW', 'RDC reset after wheel change', 'tyre pressure warning new wheels', 'transfer TPMS sensors'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'Many current BMWs watch your tyre pressures with a sensor in each wheel. When you change to a new set of wheels, those sensors have to move across or be replaced, and the car has to be told about the change. It is a short job, but it is easy to get wrong.',
      },
      { type: 'h2', text: 'How the system works' },
      {
        type: 'p',
        text: 'A direct system has a small battery-powered sensor inside each wheel, normally fixed to the valve, which sends the pressure to the car. Each sensor’s identity is registered with the car so it knows which signals are its own. Some cars use an indirect system that works out pressure from wheel speed instead. Which type your car has, and the exact steps for it, are in your owner’s manual.',
      },
      { type: 'h2', text: 'Two ways to do it' },
      {
        type: 'ul',
        items: [
          '**Move your existing sensors** to the new wheels. The car already knows them, but ask for fresh valve seals when they are moved, because the old ones have been disturbed.',
          '**Fit new sensors** in the new wheels. They have to be registered so the car recognises them. The fitter does this with a tool, and on some cars the car learns them as you drive. The method depends on the car and the sensors.',
        ],
      },
      { type: 'h2', text: 'After the wheels are on' },
      {
        type: 'ol',
        items: [
          'Set every tyre to the recommended pressure, from the placard in the door frame or your owner’s manual.',
          'Reset or confirm the pressure monitoring in the car’s menu, as your owner’s manual describes.',
          'Drive for a short while, because the car may need to learn the sensors.',
          'Check that the warning light is off and that all four pressures show.',
        ],
      },
      { type: 'h2', text: 'What can go wrong' },
      {
        type: 'ul',
        items: [
          'A warning light stays on because a sensor was not registered, or is faulty.',
          'With two sets of wheels, for example summer and winter, each set needs its sensors registered, or the system needs a reset at every swap.',
          'Sensor batteries wear out over the years, so an old sensor can fail soon after the swap.',
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Do not ignore a pressure warning',
        text: 'It may only be a sensor fault, but it may also be a real puncture or a slow leak. Check the tyres before you assume the sensor is at fault.',
      },
      { type: 'h2', text: 'Questions to ask your fitter' },
      {
        type: 'ul',
        items: [
          'Will you move my sensors or fit new ones?',
          'Will the valve seals be replaced?',
          'Who registers the sensors with the car, and how do you confirm it worked?',
          'What should I do if the warning light comes back?',
        ],
      },
      {
        type: 'p',
        text: `Planning a wheel change for your M3? The [G80 M3 guide](${FITMENT}/bmw-g80-m3-forged-wheels) lists everything else to check before you order.`,
      },
    ],
    faqs: [
      {
        q: 'Do I need new tyre pressure sensors with new wheels?',
        a: 'Not necessarily. Your existing sensors can be moved to the new wheels, or new ones fitted. Which is better depends on the age and condition of the sensors.',
      },
      {
        q: 'Will the car need coding?',
        a: 'Usually the car only needs to be told about the sensors, which is a registration or a reset rather than coding. Coding is mostly needed when the system is added or removed. Follow your owner’s manual, or ask a BMW specialist.',
      },
      {
        q: 'Can I drive without the sensors?',
        a: 'It is usually not a good idea. The car will typically show a warning, and you lose an early warning of a puncture or a slow leak.',
      },
    ],
    more: ['bmw-g80-m3-forged-wheels', 'wheel-bolt-torque-and-care', 'wheel-fitment-explained-pcd-offset-centre-bore'],
  },

  {
    slug: 'plus-sizing-wheels-and-tyres',
    pillar: 'fitment',
    title: 'Plus-sizing wheels and tyres without changing the rolling diameter',
    metaTitle: 'Plus-sizing wheels: keep the rolling diameter',
    description:
      'How plus-sizing works: a bigger wheel with a lower-profile tyre, why the overall diameter should stay close to the original, and what changes in ride and risk.',
    excerpt: 'A bigger wheel and a shorter tyre can keep the car’s height the same. How to do it, and what it costs you.',
    keyword: 'plus sizing wheels tyres',
    related: ['plus size wheels', 'rolling diameter', 'tyre size calculator', 'speedometer error new tyres'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'Plus-sizing means fitting a larger-diameter wheel together with a lower-profile tyre, so that the wheel and tyre are about the same overall height as before. The bigger wheel takes a tyre with a shorter sidewall, and the two changes cancel out. Done well, the car drives the same and looks different. Done badly, the speedometer is wrong and the tyre rubs.',
      },
      { type: 'h2', text: 'Why the overall diameter matters' },
      {
        type: 'ul',
        items: [
          '**The speedometer and odometer** count wheel turns. A taller or shorter wheel and tyre makes them read wrongly.',
          '**The stability, braking and traction systems** compare the speeds of the four wheels, and are set up for the original rolling circumference.',
          '**Clearance** in the arch and around the suspension changes when the overall height does.',
        ],
      },
      {
        type: 'p',
        text: 'A common rule of thumb is to stay within about three per cent of the original overall diameter. It is a guide only: matching the diameter does not prove that everything will clear and work, so treat it as a starting point and not as proof of fit.',
      },
      { type: 'h2', text: 'How to work it out' },
      {
        type: 'p',
        text: 'The overall diameter is the wheel’s diameter plus twice the height of the sidewall. The sidewall height is the tyre’s width multiplied by its aspect ratio, which is the second number in the tyre size, divided by one hundred. You do not need to do this by hand: a tyre-size calculator compares your current size with the one you want, and shows the difference in overall diameter and in speedometer reading.',
      },
      { type: 'h2', text: 'What changes besides the size' },
      {
        type: 'ul',
        items: [
          '**Ride.** A shorter sidewall cushions less, so the car feels firmer and bumps are felt more.',
          `**Road damage.** There is less rubber between the rim and a pothole, so the risk goes up (see [how to protect your wheels from potholes](${CARE}/protecting-wheels-from-potholes)).`,
          `**Weight.** A larger wheel can weigh more, even when it is forged, which works against what lighter wheels are for (see [unsprung weight explained](${BASICS}/unsprung-weight-explained)).`,
          '**Choice and cost.** Fewer tyres are made in very low profiles, and they often cost more.',
        ],
      },
      { type: 'h2', text: 'On a staggered M car' },
      {
        type: 'p',
        text: (f) =>
          `On a staggered car the front and the rear are worked out separately, and the relationship between them stays as the car was designed. Read [staggered vs square wheel setups](${FITMENT}/staggered-vs-square-wheel-setups) first.${
            f.sizes.length ? ` The sets in stock are listed with sizes of ${joinList(f.sizes)}. Ask us which tyre sizes suit each one on your car.` : ''
          }`,
      },
      {
        type: 'callout',
        tone: 'warning',
        title: 'Matching diameter is not the same as fitting',
        text: 'A wheel can match the overall diameter and still rub if it is wider or sits further out. Check the width and the offset as well (see wheel fitment explained).',
      },
    ],
    faqs: [
      {
        q: 'What is plus-sizing?',
        a: 'It is fitting a larger-diameter wheel with a lower-profile tyre so the combined height stays about the same as the original.',
      },
      {
        q: 'Will plus-sizing change my speedometer?',
        a: 'If the overall diameter stays within a small margin of the original, the change is small. If it grows or shrinks, the speedometer and odometer read differently, because they are based on how often the wheel turns.',
      },
      {
        q: 'Is a bigger wheel always better?',
        a: 'No. A bigger wheel gives a firmer ride and more exposure to road damage, and can weigh more. Choose the size that suits the car and the roads you drive.',
      },
    ],
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'staggered-vs-square-wheel-setups', 'protecting-wheels-from-potholes'],
  },

  {
    slug: 'how-to-read-a-wheel-load-rating',
    pillar: 'basics',
    title: 'How to read a wheel’s load rating (and why tyres have their own)',
    metaTitle: 'How to read a wheel’s load rating',
    description:
      'What a wheel’s load rating means, where to find it, how it differs from a tyre’s load index and why both must cover the weight on each corner of your car.',
    excerpt: 'The number that says how much a wheel can carry, and the separate one on your tyre.',
    keyword: 'wheel load rating',
    related: ['tyre load index', 'wheel weight capacity', 'wheel load rating BMW M', 'is my wheel strong enough'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'A wheel carries part of the weight of the car, and a rating says how much. On a heavy performance car it matters, because the load on each corner is large and gets larger in corners, under braking and over bumps. Here is where to find the rating and how to check it.',
      },
      { type: 'h2', text: 'What the rating means' },
      {
        type: 'p',
        text: 'The load rating is the most weight a wheel is designed to carry, normally given in kilograms for one wheel. It is usually marked on the wheel or listed in the maker’s specification. A wheel without a stated rating is a wheel you cannot check, which is a reason to ask before you buy.',
      },
      { type: 'h2', text: 'How to check it against your car' },
      {
        type: 'ol',
        items: [
          'Find the wheel’s load rating from the seller or the maker.',
          'Find your car’s maximum axle weights, which are on the car’s data plate or in the owner’s manual.',
          'Halve each axle figure for a rough load per wheel on that axle.',
          'Check that the wheel’s rating is comfortably above that figure.',
          'Check the tyre’s load index separately (see below).',
        ],
      },
      { type: 'h2', text: 'Tyres have their own rating' },
      {
        type: 'p',
        text: 'The load index is a number on the tyre’s sidewall that corresponds to the maximum weight the tyre can carry, in a standard table. The tyre and the wheel each have a limit, and the lower of the two sets what that corner can carry safely. A wheel with a high rating does not help if the tyre’s index is too low, and the reverse is also true.',
      },
      { type: 'h2', text: 'Why you want margin' },
      {
        type: 'p',
        text: 'The load on a wheel is not constant. Cornering, hard braking and bumps raise it well above the static figure, so a wheel’s rating should comfortably exceed the weight you worked out, not just meet it.',
      },
      { type: 'h2', text: 'What to ask the seller' },
      {
        type: 'ul',
        items: [
          'What is the load rating of this wheel, at the size I want?',
          'Is that figure from the wheel’s maker?',
          'Is the rating enough for my car’s axle weights?',
        ],
      },
      {
        type: 'callout',
        tone: 'note',
        title: 'Strength and weight are different questions',
        text: `A strong wheel can still be heavy, and a light wheel still needs a rating that suits the car. Read [forged vs cast vs flow-formed wheels](${BASICS}/forged-vs-cast-vs-flow-formed-wheels) for how the way a wheel is made affects both.`,
      },
    ],
    faqs: [
      {
        q: 'Where do I find a wheel’s load rating?',
        a: 'Look for a figure marked on the wheel, or ask the seller for the maker’s specification. If neither can give you a rating, treat that as a warning sign.',
      },
      {
        q: 'What is the difference between a wheel’s load rating and a tyre’s load index?',
        a: 'The load rating belongs to the wheel and is given in kilograms. The load index belongs to the tyre and is a number on its sidewall that maps to a weight in a standard table. Both must cover the load on that corner of the car.',
      },
      {
        q: 'Do forged wheels have a higher load rating?',
        a: 'Not automatically. The rating comes from how the wheel is designed and engineered. Forging allows a strong wheel at a low weight, but you should still check the figure for the exact wheel.',
      },
    ],
    more: ['forged-vs-cast-vs-flow-formed-wheels', 'unsprung-weight-explained', 'protecting-wheels-from-potholes'],
  },

  {
    slug: 'painted-powder-coated-and-polished-wheel-finishes',
    pillar: 'basics',
    title: 'Painted, powder-coated and polished wheel finishes compared',
    metaTitle: 'Painted, powder-coated and polished finishes',
    description:
      'How painted, powder-coated and polished wheel finishes differ in look and care, and what to ask a seller about the finish on the wheels you are buying.',
    excerpt: 'Three ways to finish a wheel, how each looks and wears, and what to ask before you buy.',
    keyword: 'wheel finishes painted powder coated polished',
    related: ['powder coat vs paint wheels', 'polished wheels care', 'matte vs gloss wheels', 'wheel finish durability'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'The finish is the surface layer of a wheel, and there are three common ways to make it: paint, powder coat, or polishing the bare metal. They look different, wear differently and ask different things of you. This guide explains each, so you know what to ask before you choose a colour.',
      },
      { type: 'h2', text: 'Painted' },
      {
        type: 'p',
        text: 'A painted wheel has liquid paint applied in layers, usually finished with a clear coat. It offers the widest choice of colours and sheens, and small chips can often be touched in.',
      },
      { type: 'h2', text: 'Powder-coated' },
      {
        type: 'p',
        text: 'A powder coat is a dry powder that is sprayed on and then baked, so it melts into one continuous layer. It is typically harder against chips than ordinary paint, which is why it is common on wheels that see rough use.',
      },
      { type: 'h2', text: 'Polished' },
      {
        type: 'p',
        text: 'A polished finish leaves the metal itself bright. It has a distinctive look, but bare metal marks and dulls if it is not looked after, so polished wheels are usually protected by a clear layer or need regular polishing.',
      },
      {
        type: 'table',
        caption: 'General tendencies. The exact process and coating on a given wheel varies, so ask.',
        head: ['', 'Painted', 'Powder-coated', 'Polished'],
        rows: [
          ['Look', 'Widest range of colours and sheens', 'A solid, even colour', 'Bright bare metal'],
          ['Chips and wear', 'Chips can often be touched in', 'Typically harder against chips', 'Marks and dulls without care'],
          ['Care', 'Gentle wash and soft tools', 'Gentle wash and soft tools', 'The most delicate; use the mildest cleaner'],
        ],
      },
      { type: 'h2', text: 'Matte, satin and gloss are separate' },
      {
        type: 'p',
        text: (f) =>
          `Matte, satin and gloss describe the sheen, not the process. A painted wheel and a powder-coated wheel can each be any of them.${
            f.finishes.length ? ` The finishes in stock right now are ${joinList(f.finishes)}.` : ''
          }`,
      },
      { type: 'h2', text: 'What to ask before you buy' },
      {
        type: 'ul',
        items: [
          'Which process was used on this wheel: paint, powder coat or polish?',
          'Is there a clear coat on top, and what are the cleaning instructions?',
          'Can chips be repaired, and by whom?',
        ],
      },
      {
        type: 'p',
        text: `A listing may give the colour without saying how it is applied, so ask. When you know what you have, [how to clean forged wheels](${CARE}/how-to-clean-forged-wheels) covers each finish, and [how to choose a wheel colour and finish](${BUYING}/choosing-a-wheel-finish-for-your-bmw-m-car) helps with the look.`,
      },
    ],
    faqs: [
      {
        q: 'Is powder coating better than paint?',
        a: 'Powder coat is typically harder against chips, while paint offers more colours and is easier to touch in. Neither is better in every case, so choose by the look you want and how you will look after the wheel.',
      },
      {
        q: 'Do polished wheels need more care?',
        a: 'Yes. Bare metal marks and dulls more easily than a coated surface, so a polished face needs gentler cleaning and more regular attention.',
      },
      {
        q: 'Is matte a different process from gloss?',
        a: 'No. Matte, satin and gloss describe how shiny the surface is. The same painted or powder-coated process can produce any of them.',
      },
    ],
    more: ['choosing-a-wheel-finish-for-your-bmw-m-car', 'how-to-clean-forged-wheels', 'forged-vs-cast-vs-flow-formed-wheels'],
  },

  {
    slug: 'wheel-balancing-and-alignment-after-new-wheels',
    pillar: 'care',
    title: 'Wheel balancing and alignment after fitting new wheels',
    metaTitle: 'Wheel balancing and alignment after new wheels',
    description:
      'Why new wheels need balancing, what centring has to do with it, when an alignment check is worth doing and how to spot a problem on the first drives.',
    excerpt: 'Balance every new wheel, know what a vibration means, and decide whether you need an alignment check.',
    keyword: 'wheel balancing new wheels',
    related: ['balance new tyres', 'wheel alignment after new wheels', 'steering wheel vibration new wheels', 'road force balancing'],
    intent: 'informational',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'A new set of wheels and tyres should always be balanced before you drive away, and sometimes an alignment check is worth doing too. They are two different jobs. Balancing is about weight spread around the wheel. Alignment is about the angles the wheels sit at. This guide explains what each does and how to tell if something is wrong.',
      },
      { type: 'h2', text: 'What balancing does' },
      {
        type: 'p',
        text: 'No wheel and tyre is perfectly even all the way round. A heavy spot makes the wheel wobble as it spins, which you feel as a vibration at speed. Balancing measures the heavy spot and adds small weights to cancel it. Every wheel and tyre assembly should be balanced when the tyre is fitted.',
      },
      { type: 'h2', text: 'Why centring matters' },
      {
        type: 'p',
        text: `A wheel has to be centred on the balancing machine the way it is centred on your car, or it will balance well in the workshop and vibrate on the road. If your wheels need hub-centric rings, they should be used when balancing too (see [hub-centric rings](${FITMENT}/hub-centric-rings-when-you-need-them)). Some workshops offer a road-force balance, which also checks how round the wheel and tyre are under load.`,
      },
      { type: 'h2', text: 'What alignment does' },
      {
        type: 'p',
        text: 'Alignment sets the angles of the wheels to each other and to the road. Changing wheels on its own does not change those settings. A different offset or size can change how the car feels, however, and any change to the suspension or a hard knock can move the angles. If the car pulls to one side, the steering wheel sits off-centre, or the tyres wear unevenly, have the alignment checked.',
      },
      { type: 'h2', text: 'Spotting a problem on the first drives' },
      {
        type: 'ul',
        items: [
          '**Vibration through the steering wheel or seat** that changes with speed usually points to balance or centring.',
          '**The car pulling to one side** points to alignment, tyre pressures or a faulty tyre.',
          '**A shake only under braking** can come from the brakes, not the wheels.',
          '**Uneven tyre wear** after a few weeks is a sign to have the alignment checked.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Re-check the bolts too',
        text: `Check the wheel bolt torque after the first short drive, as described in [how to torque wheel bolts correctly](${CARE}/wheel-bolt-torque-and-care). A loose wheel also causes vibration.`,
      },
    ],
    faqs: [
      {
        q: 'Do new wheels need balancing?',
        a: 'Yes. Every wheel and tyre assembly should be balanced when the tyre is fitted, because no assembly is perfectly even.',
      },
      {
        q: 'Do I need an alignment after changing wheels?',
        a: 'Changing wheels does not change the alignment on its own, so it is not always needed. Have it checked if the car pulls, the steering wheel is off-centre, the tyres wear unevenly, or the offset or size has changed noticeably.',
      },
      {
        q: 'What causes a vibration at speed after new wheels?',
        a: 'The most common causes are balance, centring, a bent wheel, a faulty tyre or loose wheel bolts. Ask the fitter to check these in turn.',
      },
    ],
    more: ['wheel-bolt-torque-and-care', 'hub-centric-rings-when-you-need-them', 'protecting-wheels-from-potholes'],
  },

  {
    slug: 'what-to-ask-before-buying-forged-wheels',
    pillar: 'buying',
    title: 'What to ask before you buy forged wheels: a checklist',
    metaTitle: 'What to ask before buying forged wheels',
    description:
      'A practical checklist of questions to ask any seller before buying forged wheels: fitment, weight, stock, lead time, what is included and who confirms the fit.',
    excerpt: 'Ten questions that tell you whether a set will fit, arrive and last, and whether the seller knows.',
    keyword: 'buying forged wheels checklist',
    related: ['questions to ask wheel seller', 'forged wheels buyers guide', 'how to buy forged wheels', 'forged wheels South Africa'],
    intent: 'commercial',
    published: PUBLISHED_2,
    updated: PUBLISHED_2,
    body: [
      {
        type: 'p',
        text: 'A set of forged wheels is a large purchase, and most of the things that go wrong can be avoided by asking the right questions first. Use this checklist with any seller. A seller who answers clearly, in writing, is a good sign. One who cannot, or will not, is a reason to look elsewhere.',
      },
      { type: 'h2', text: 'The checklist' },
      {
        type: 'ol',
        items: [
          `**Does it fit my exact car?** Give the model, year and brake option, and ask who confirms the fit (see [wheel fitment explained](${FITMENT}/wheel-fitment-explained-pcd-offset-centre-bore)).`,
          '**What are the bolt pattern, offset and centre bore?** All three, for each axle, in writing.',
          `**Does the wheel need hub-centric rings?** And if so, are they included (see [hub-centric rings](${FITMENT}/hub-centric-rings-when-you-need-them))?`,
          `**What does each wheel weigh at my size?** Compare stated weights, not labels (see [unsprung weight explained](${BASICS}/unsprung-weight-explained)).`,
          `**What is the load rating?** And is it enough for my car (see [how to read a wheel’s load rating](${BASICS}/how-to-read-a-wheel-load-rating))?`,
          `**Is it staggered, and which size goes where?** Check front and rear separately (see [staggered vs square setups](${FITMENT}/staggered-vs-square-wheel-setups)).`,
          '**Is this set in stock, or made to order?** And if it is made to order, how long will it take?',
          `**What finish is it, and how is it applied?** (see [painted, powder-coated and polished finishes](${BASICS}/painted-powder-coated-and-polished-wheel-finishes))`,
          '**What is included in the price?** Wheel bolts, rings, sensors and fitting are all separate questions.',
          '**Who do I call if something is wrong?** Know how to reach the seller after the sale.',
        ],
      },
      { type: 'h2', text: 'What the answers should tell you' },
      {
        type: 'p',
        text: (f) =>
          f.priceRange
            ? `Prices on this site are in Rand per set of four, and the forged sets listed now run from ${f.minPrice} to ${f.maxPrice}. ${f.toOrderNotice} Prices and stock change, so confirm both before you rely on them. The guide to [what forged wheels cost in South Africa](${BUYING}/how-much-do-forged-wheels-cost-in-south-africa) shows how to compare quotes fairly.`
            : `Prices on this site are in Rand per set of four, and stock changes, so confirm both before you rely on them. The guide to [what forged wheels cost in South Africa](${BUYING}/how-much-do-forged-wheels-cost-in-south-africa) shows how to compare quotes fairly.`,
      },
      { type: 'h2', text: 'Red flags' },
      {
        type: 'ul',
        items: [
          'The seller cannot say what the bolt pattern, offset or centre bore is.',
          'The seller will not confirm the fit for your exact car, or only says “it should fit”.',
          'There is no stated weight or load rating, and no explanation for why.',
          'The price is quoted per wheel in one place and per set in another, with no clear total.',
          'You are pushed to pay before the fit and the lead time are confirmed.',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Get the fit confirmed for your car, not for “a car like it”',
        text: 'Two cars from the same generation can have different brakes or options. The seller who asks for your exact model, year and brake option is the one who is checking.',
      },
      { type: 'stock', heading: 'Forged wheels in stock now' },
      {
        type: 'cta',
        heading: 'Want these questions answered for your car?',
        text: 'Send us your model, year and brake option. We will tell you what fits, what is in stock and how long a made-to-order set takes.',
      },
    ],
    faqs: [
      {
        q: 'What is the most important question to ask a wheel seller?',
        a: 'Who confirms that the wheel fits your exact car. Fitment depends on the bolt pattern, offset, centre bore, width and brake clearance together, and a seller who checks all of them for your car is worth more than a low price.',
      },
      {
        q: 'Should I get the answers in writing?',
        a: 'Yes, for the fitment numbers and for what is included in the price. It keeps both sides clear about what was agreed.',
      },
      {
        q: 'Can I buy forged wheels without knowing my car’s fitment numbers?',
        a: 'You can, if the seller works them out for you. Give them your model, year and brake option, and ask them to confirm the fit before you pay.',
      },
    ],
    more: ['are-forged-wheels-worth-it', 'how-much-do-forged-wheels-cost-in-south-africa', 'in-stock-vs-made-to-order-forged-wheels'],
  },

];

/* ---------------------------------------------------------------- accessors */

export function getPost(pillarSlug: string, postSlug: string): BlogPost | undefined {
  const post = BLOG_POSTS.find((p) => p.slug === postSlug.toLowerCase());
  return post && pillarPath(post) === pillarSlug.toLowerCase() ? post : undefined;
}

function pillarPath(post: BlogPost): string {
  return getPillarById(post.pillar).slug;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function postsInPillar(pillarId: BlogPost['pillar']): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.pillar === pillarId);
}

/** Newest first; posts published on the same day keep the order they are written in. */
export function latestPosts(count = BLOG_POSTS.length): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published)).slice(0, count);
}

/** The posts a post points on to, resolved from its `more` slugs. */
export function morePosts(post: BlogPost): BlogPost[] {
  return post.more.map(getPostBySlug).filter((p): p is BlogPost => Boolean(p));
}

/** What a /blog path is: the hub, a pillar page, an article, or nothing (not a page on this site). */
export type BlogRoute =
  | { kind: 'index' }
  | { kind: 'pillar'; pillar: BlogPillar }
  | { kind: 'post'; post: BlogPost };

/** Works out which blog page a path is, or null when it is not one. Paths are matched exactly, with no extra segments. */
export function resolveBlogPath(rawPath: string): BlogRoute | null {
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, '');
  if (path === '/blog') return { kind: 'index' };
  if (!path.startsWith('/blog/')) return null;
  const parts = path.slice('/blog/'.length).split('/');
  if (parts.length === 1) {
    const pillar = getPillar(parts[0]);
    return pillar ? { kind: 'pillar', pillar } : null;
  }
  if (parts.length === 2) {
    const post = getPost(parts[0], parts[1]);
    return post ? { kind: 'post', post } : null;
  }
  return null;
}
