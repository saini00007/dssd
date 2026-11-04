# Foundation API (phase A): for page builders

These are built, tested, and used in `/lab`. Read the source in `src/components/**` for details. **Reuse them; don't re-implement.**

## Rules for page authors

- The root layout already renders `<main id="main" tabIndex={-1}>`. **Pages must not render `<main>`.**
- Wrap each page's content in `<PageTransition>` **inside `page.tsx`**, never in a layout.
- `cacheComponents`: previous pages stay in the DOM, hidden. **Don't hard-code element `id`s** that two pages could share. **Scope every GSAP query** with `useGSAP(..., { scope })`. Tests must target the **visible** page.
- One `<h1>` per page (`<TypeIn as="h1" …>` is fine).
- The footer arch picks up the background of the last visible section automatically.
- Dark sections set `data-header-theme="dark"`, or use `Section tone="red|maroon"`, so the header switches to cream.
- If the same product appears twice on a page, pass `morph={false}` on one `PackCard`. Duplicate view-transition names break the morph.
- `params` are Promises: `export default async function Page(props: PageProps<'/products/[slug]'>) { const { slug } = await props.params }`, plus `generateStaticParams`.
- SEO: `export const metadata = pageMetadata({...})` or `generateMetadata`, from `@/lib/seo`. JSON-LD via `jsonLd(obj)`.

## Motion: `@/components/motion/*` (client)

| Export | Notes |
|---|---|
| `gsap.ts` | `{ gsap, ScrollTrigger, SplitText, useGSAP }` registered once |
| `<SmoothScroll>`, `useLenis()` | already in the root layout |
| `<TypeIn as? text trigger?="scroll"\|"load" delay? className? style? id?>` | text always in SSR; `trigger="load"` waits for the home loader; reduced motion shows the text as is |
| `<Reveal as? y?=40 x? delay? stagger? duration? start?="top 80%">` | `stagger` reveals direct children one by one |
| `<Pop as? delay? from?=0.6 trigger?>`, `popElement(el,{from,delay,y})` | the "pop" |
| `<RingBurst ref color className?>`, `ref.current.burst()` | place inside a `relative` parent; it's 150% of the parent, centred |
| `<MagneticWrap strength?=0.28>` | fine pointer only |
| `useReducedMotion()`, `useFinePointer()`, `useIsTouch()`, `useMediaQuery(q, serverValue?)` | — |
| `whenLoaderDone(cb)`, `LOADER_DONE_EVENT` | home hero entrance; `html[data-yb-loader]` is `on` → `leaving` → removed |

## Layout: `@/components/layout/*`

| Export | Notes |
|---|---|
| `useMenu()` | `{ open, setOpen, toggle, buttonRef }` |
| `useCursorLabel(text)` | spread `{ onPointerEnter, onPointerLeave }` onto an element; mouse only |
| `<PageTransition>` | ViewTransition with the curtain enter/exit |
| Header, MenuOverlay, Footer, Loader, CursorLabel | already wired in the root layout |

## UI: `@/components/ui/*`

| Component | Props |
|---|---|
| `<TransitionLink href direction?="forward"\|"back" eager? transitionTypes?>` | plus all `next/link` props |
| `<Container size?="default"\|"narrow"\|"wide" as?>` | — |
| `<Section tone?="cream"\|"soft"\|"red"\|"maroon"\|"yellow"\|"flavour" arch? behind? flavour?={color,ink} padded?=true>` | `arch` gives the scroll-scrubbed arched top; `behind` is the colour in the arch corners |
| `<ButtonLink href variant?="solid"\|"ghost"\|"cream"\|"yellow" size?="sm"\|"md"\|"lg" arrow? magnetic?>` | also `Button` (a real button), `buttonClass()`, `SlideArrow` |
| `<Pill tone?="outline"\|"cream"\|"red"\|"yellow"\|"ink"\|"flavour" size?>` | `Chip` is an alias; for flavour, set `style={{"--flavour":c,"--flavour-ink":i}}` |
| `<Eyebrow dot?>` | — |
| `<OutlineHeading as?="h2" text solid? stroke?>` | — |
| `<Icon name title?>` | names: arrow, arrow-left, plus, close, check, star, instagram, facebook, linkedin, mail, phone, pin, leaf, olive, no-palm, no-preservative, protein, gluten-free, veg-mark |
| `<VegMark>` | — |

## Product: `@/components/product/*`

| Component | Props |
|---|---|
| `<PackCard product priority? morph?=true eager? headingLevel?=2\|3\|4>` | ring burst, lift, Buddy peek, cursor label, one morph link |
| `<PackImage product size?="sm"\|"md"\|"lg"\|"hero" sizes? priority? morph? fit? decorative?>` | The product hero uses `<PackImage morph priority size="hero" product={p}/>`, the same morph name as the card. Uses the cut-out, else the flavour placeholder SVG. |
| `<FlavourBuddy flavour={ingredient,name} pose?="peek" width? hand?={x,y,size,rotate} active? popOnMount? priority? ref>` | `ref.current.pop()`; pops when `active` turns true |

## Sections: `@/components/sections/*`

| Component | Props |
|---|---|
| `<PartnerBand variant?="full"\|"slim" behind?>` | CTA → `/contact#partner`, so the contact page needs `id="partner"` |
| `<ClaimMarquee items? tone?="red"\|"maroon"\|"cream"\|"yellow" duration? label?>` | — |
| `<FilterPills options={value,label,count}[] value? defaultValue? onChange? label tone?>` | radiogroup |
| `<PillFaq items={q,a}[] columns?=2 tone? multiple?>` | — |
| `<InsetOpener title eyebrow? subtitle? image={src,alt} as?="h1">` | P20 |
| `<Statement shapes?=ShapeName[] tone? eyebrow? as? arch?>` | children; `<em>` marks the highlight; P21 |
| `<NumberedCard number title href? tone?>` | children |
| `DriftShapes` | — |

## Libs

| Module | Exports |
|---|---|
| `@/lib/seo` | `pageMetadata({ title, description, path, image?, type?, noindex?, publishedTime? })`, `jsonLd()`, `SITE_URL` |
| `@/lib/tokens` | `dur`, `ease`, `stagger`, `reveal`, `lenis`, `colors`, `mq` |
| `@/lib/media` | `logo`, `shapeSrc(name)`, `buddyImage(pose)`, `buddySrc(pose)`, `packSrc(product)` |
| `@/lib/cn` | `cn()` |

**Tailwind utilities:** `bg-red`, `bg-cream`, `text-ink`, `rounded-pill`, `rounded-card`, `ease-roast`, `text-hero`, `display-type`, `text-outline`, `px-gutter`, `py-section`, `tabular`, `bg-flavour`, `text-flavour-ink`.

## Data: `@/data`

- `products`, `getProduct`, `productsByCategory`, `productsByFlavour`, `siblingFormats`, `bestsellers`, `relatedProducts(p, 6)`
- `flavours`, `getFlavour`; `categories`, `getCategory`
- `articles`, `getArticle`, `articlesByDate`, `moreArticles`
- `reviews`, `reviewAggregate`, **`SHOW_REVIEWS` (false: don't render reviews, aggregate or review schema)**
- `site` (`primaryNav`, `menuPages`, `footerColumns`, `claims`, `claimChips`, contact, social)
- `homeCopy`, `productsCopy`, `bestsellersCopy`, `aboutCopy`, `whyCopy`, `benefitsCopy`, `ingredientsCopy`, `blogCopy`, `contactCopy`, `notFoundCopy`, each keyed by overview section ID
- `assets` (`packAssets`, `buddy`, `photos`, `blogImages`, `shapes`); `MAKHANA_STAGE_ORDER` from `@/data/keys`

## Buddy poses available

Only `point` and `sit` exist. The others fall back: peek, walk, thumbs and pop → point; wave and confused → sit.
