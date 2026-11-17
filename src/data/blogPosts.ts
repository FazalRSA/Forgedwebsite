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
    more: ['forged-vs-cast-vs-flow-formed-wheels', 'are-forged-wheels-worth-it', 'protecting-wheels-from-potholes'],
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
    more: ['forged-vs-cast-vs-flow-formed-wheels', 'how-much-do-forged-wheels-cost-in-south-africa', 'bmw-g80-m3-forged-wheels'],
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
    more: ['bmw-g80-m3-forged-wheels', 'staggered-vs-square-wheel-setups', 'are-forged-wheels-worth-it'],
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
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'staggered-vs-square-wheel-setups', 'in-stock-vs-made-to-order-forged-wheels'],
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
    more: ['wheel-fitment-explained-pcd-offset-centre-bore', 'bmw-g80-m3-forged-wheels', 'protecting-wheels-from-potholes'],
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
    more: ['in-stock-vs-made-to-order-forged-wheels', 'how-to-clean-forged-wheels', 'how-much-do-forged-wheels-cost-in-south-africa'],
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
    more: ['how-to-clean-forged-wheels', 'protecting-wheels-from-potholes', 'wheel-fitment-explained-pcd-offset-centre-bore'],
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
