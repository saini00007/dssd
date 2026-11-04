# Current site content inventory: Yunch Bite

Source: `research/current-site/` (harvested 2026-11-04). Read-only extraction from `pages/*/content.md`, `pages/*/meta.json`, `assets/manifest.json`. Image files are manifest local names under `assets/`.

**Summary**
- **Coverage:** 38 of the 44 sitemap entries: 9 main pages, 3 category pages, 21 product pages, 5 articles. The 6 duplicate routes (`/catergries/*`, `/products/{makhana,popcorn,dry-fruits}`) are noted at the end.
- **Header:** identical on all 44 harvested pages. Logo (links to `/`), search field, and six nav items: Home, About Us, Bestsellers, Our Product, Blogs and Reviews, Contact Us. Described once below.
- **No footer:** no footer block on any page, and no copyright, privacy or terms text anywhere.
- **Most reusable copy:** `/about` (brand story and quotes), `/why-yunch-bite` and `/benefits` (audience and claims), `/ingredients-quality` (ingredient lists), and the home page taglines.
- **Biggest problems:** all 21 product pages carry a "BEST SELLER" badge; 3 product images show the wrong flavour; the Makhana range page repeats all 14 products under every format tab; flavour names are spelt three ways. Full list at the bottom.

## Header (all pages)

- Logo `images/yunchbite-logo-official.png`, links to `/`.
- Search: text input "Search".
- Nav: Home (`/`) · About Us (`/about`) · Bestsellers (`/bestsellers`) · Our Product (`/products`) · Blogs and Reviews (`/blogs-reviews`) · Contact Us (`/contact`).
- Not in the header nav: Benefits, Why Yunch Bite, Ingredients & Quality, the category pages. These are reached from the home page and body links only.
- No cart, account or price elements were captured on any page.

## Main pages

## / (Home): Yunch Bite
Meta description: Discover crunchy, slow-roasted lotus seeds (makhana), popcorn, and superfood dry fruits roasted in cold-pressed oil with zero palm oil. Delicious healthy snacking for all ages.
H1 in the DOM is only "OUR" (split headline).
Sections in order:
1. [Hero carousel, H1 "OUR"] Slides: "Let the Crunch Begin", "Flavours That Spark Joy", "The Crunch You'll Remember", "100% Roasted Zero Guilt". Images: `images/banner-slide-2.png` (alt "A Crunch Worth Sharing - Yunchy Crunchy Healthy Bite"), `images/banner-slide-3.png` (alt "Ye Hai Aam Jindgi vs Ye Hai Yunchy Jindgi - Peri Peri Paradise Makhana"). CTA: slide links to `/products/makhana`. Also a "Scroll down to cycle menu • 0%" UI line.
2. [H3 "OUR MENU" / "SERVED ACROSS" / H1 "OUR" / H3 "CATEGORIES"] Intro: "HANDCRAFTED SLOW-ROASTED MAKHANA, POPS & ROYAL DRY FRUITS, ROASTED TO PERFECTION WITH ZERO PALM OIL AND VIRGIN COLD-PRESSED OIL." CTA: EXPLORE ALL → `/products`. 3 category cards, each with a CTA:
   - Makhana (`images/homepage_14.png`): "Explore All Makhana Flavors" → `/catergries/makhana`
   - Popcorn (`images/homepage_15.png`): "Explore Gourmet Popcorn" → `/catergries/popcorn`
   - Dry Fruits (`images/homepage_16.png`): "Explore Premium Dry Fruits" → `/catergries/dry-fruits`
3. [Brand block, no heading] "Yunchy Crunchy Heathy Bite" (sic). "Yunch Bite brings together the power of energy and the joy of a bite, symbolising our belief that every snack should be delicious, nourishing, and full of life. It reflects our Mission to make healthy snacking a delightful part of everyday living." Images: `gif/Bowl-Rotate.gif`, `gif/kid-blinking-isolated.gif` (mascot). No CTA.
4. [Three numbered link cards, no heading] "01 Why you should prefer Yunch Bite?" → `/why-yunch-bite`; "02 What are the benefits of Yunch Bite products?" → `/benefits`; "03 All about ingredients and quality" → `/ingredients-quality`. Image: `images/question-mark-3d.png`.
5. [H2 "Purity in Every Pack"] "At Yunch Bite, every pack is made with **premium ingredients, hygienic processing** and **strict quality control** to give you a healthy and tasty snack you can trust." Images: `images/factory-photo-hq.png` (alt "Yunch Bite factory workers in yellow uniforms inspecting makhana on production conveyor belt"), `images/mascot-photo-hq.png` (alt "Yunch Bite Makhana Buddy mascot character with bowl of makhana on cutting board").
6. [H2 "Meet our Makhana Buddy!"] "Say 'Hello' to our fun-loving, energetic & mischievous little buddy who makes every snack moment more exciting, and brings a lot of smiles to every bite!" No CTA.

Reusable copy worth keeping:
- "Let the Crunch Begin" / "Flavours That Spark Joy" / "The Crunch You'll Remember" / "100% Roasted Zero Guilt"
- "Yunchy, Crunchy, Healthy Bite" (og:title)
- "Purity in Every Pack"
- "Say 'Hello' to our fun-loving, energetic & mischievous little buddy"

## /about: About Us
Meta description: Learn about Yunch Bite: our journey to revolutionize everyday snacking with authentic slow-roasted lotus seeds (makhana), zero palm oil, and wholesome ingredients.
Sections in order:
1. [H1 "About Us"] "Yunch Bite is an Indian FMCG healthy-snacking brand founded on **18 October, 2023** by **Mr. Nitin Rathi, Founder & Managing Director**." "Healthy snacking should never mean compromising on great taste." Image: `images/about-hero-banner.png` (alt "Yunch Bite - Crafted for Every Generation - 100% Natural, Roasted in Olive Oil, High in Protein"). CTAs (section jumps): Our Story, Our Journey, Our Mission & Vision, Our Product Philosophy, Our Founder.
2. [H3 "Our Story"] Makhana was the starting point and "continues to be the **hero category of Yunch Bite.**" Name draws on "Yan" and "Chi" (energy and vitality). Ends: "**Better snacking should be delicious, not boring.**"
3. [H3 "Our Journey"] Began with Makhana, then Popcorn and Dry Fruits. Objective: "Create better snacks. Make them delicious. Make them accessible."
4. [H3 "Our Mission & Vision"] "Our mission is **to make better snacking delicious, accessible and enjoyable for everyone**." Vision: "one of India's most trusted healthy-snacking FMCG brands". Closing line: "Great taste. Better choices. A healthier way to snack."
5. [H3 "Our Product Philosophy"] Four cards: "Taste Without Compromise", "Quality Comes First", "Thoughtfully Crafted Flavours", "Variety for Every Preference". The last lists the range: Makhana (Peri Peri Paradise, Chatpata Masala, Pudina Masala, Himalayan Salt & Pepper, Black Salt, Raw Makhana); Dry Fruits (Roasted Cashews, Raw Cashews, Roasted Almonds, Raw Almonds); Popcorn (Salted, Butter, Pudina).
6. [H3 "Better Snacking for Everyone" and "Our Quality Promise"] Six bullets: Quality Ingredients, Consistent Taste, Carefully Developed Flavours, Hygienic Manufacturing, Quality Packaging, Continuous Improvement. Pull quote: "This tastes great, and I can trust what I'm eating."
7. [H3 "Our Founder"] "Mr. Nitin Rathi", "Founder & Managing Director". Brand is "building a long-term FMCG brand based on trust, quality and enjoyable everyday snacking." Image: `images/promotional-collage.png` (alt "Yunch Bite snacking lifestyle collage").
8. [Closing H2 in quotes] "ONE BITE, AND YOUR TASTE BUDS WILL NEVER SETTLE FOR ANYTHING LESS."

Reusable copy worth keeping:
- "Healthy snacking should never mean compromising on great taste."
- "Better snacking should be delicious, not boring."
- "Great taste. Better choices. A healthier way to snack."
- "This tastes great, and I can trust what I'm eating."
- "ONE BITE, AND YOUR TASTE BUDS WILL NEVER SETTLE FOR ANYTHING LESS."

## /benefits: Health Benefits of Yunch Bite
Meta description: Discover why Yunch Bite roasted makhana and healthy snacks are wholesome choices: high in protein, dietary fiber, roasted in pure olive oil, and 100% preservative-free.
H1: "What Are the Benefits of Yunch Bite Products?"
Sections in order:
1. [Intro, no heading] "At Yunch Bite, every product is thoughtfully crafted to deliver the perfect balance of taste, nutrition, and quality." Image: `images/info-pages-makhana-bowl.png` (alt "Bowl of seasoned crunchy makhana with scattered foxnuts").
2. [01, H2 "Wholesome Benefits for a Better You"] Seven cards: High in Protein; Rich in Fiber; Roasted in Olive Oil; No Preservatives or Additives; Gluten Free; Great Taste, Guilt-Free; Goodness in Every Bite. Quote: "We keep it real and clean. No artificial colors, flavors, or preservatives – ever."
3. [02, H2 "Nutritional Value You Can Trust"] Table per 100 g of roasted makhana (Energy 347 kcal / 17% DV; Protein 9.7 g / 19%; Carbohydrates 76.9 g / 26%; Dietary Fiber 7.6 g / 27%; Total Fat 0.1 g; Saturated 0 g; Trans 0 g; Cholesterol 0 mg; Sodium 5 mg; Iron 4.9 mg / 27%; Calcium 60 mg / 6%; Potassium 430 mg / 12%). Footnotes: "*Values may vary slightly with flavor." "**% Daily Value based on a 2000 kcal diet." Sub-block "Clean & Quality Ingredients": six bullets (premium-quality makhana, nuts & kernels; roasted in olive oil for better health; natural spices & seasonings; no artificial colors or flavors; no preservatives or MSG).
4. [03, H2 "Packaging That Protects Goodness"] Five cards: Hygienic & Food-Grade Packaging; Resealable Pouches / Jars; Moisture & Air Protection; Travel & On-the-Go Friendly; Eco-Conscious Materials ("We are moving towards sustainable and recyclable packaging solutions.").
5. [04, H2 "Quality You Can Rely On"] "Every Yunch Bite product goes through strict quality checks at every step." Taglines: "Better Ingredients. Better You." / "Healthy Crunch. Happy Life." Four chips: Better Taste, Better Nutrition, Better Choices, Better You. Closing: "Yunch Bite is not just a snack – it's a better choice for a healthier, happier and more balanced lifestyle."
No CTAs. No images beyond the intro bowl.

Reusable copy worth keeping:
- "Goodness in Every Bite"
- "Great Taste, Guilt-Free"
- "We keep it real and clean. No artificial colors, flavors, or preservatives – ever."
- "Healthy Crunch. Happy Life."
- "Better Ingredients. Better You."

## /bestsellers: Bestsellers
Meta description: Discover our bestselling slow-roasted foxnuts, popcorn, and premium dry fruits. 100% vegetarian, gluten-free, and roasted in cold-pressed oil with zero palm oil.
Sections in order:
1. [H1 "Bestsellers"] Tagline: "Wholesome, crunchy & made with premium ingredients for a better you." Background video `video/bestsellers-rotating-video.mp4`.
2. [Product grid, 11 cards, no heading] Each card: image, H2 name, size, one-line description, link.
   - Peri-Peri Paradise, 12 gm (pillow) → `/products/makhana-pillow-peri-peri`
   - Chatpataa Masala, 12 gm (pillow) → `/products/makhana-pillow-chatpataa`
   - Peri-Peri Paradise, 50 gm (zipper) → `/products/makhana-zipper-peri-peri`
   - Chatpataa Masala, 50 gm (zipper) → `/products/makhana-zipper-chatpataa`
   - Himalayan Salt & Pepper, 50 gm (zipper) → `/products/makhana-zipper-salt-pepper`
   - Peri-Peri Paradise, 80 gm (jar) → `/products/makhana-jar-peri-peri`
   - Chatpataa Masala, 80 gm (jar) → `/products/makhana-jar-chatpataa`
   - Salted Popcorn, 30 gm → `/products/popcorn-salted`
   - Classic Butter Popcorn, 30 gm → `/products/popcorn-butter`
   - Slow Roasted Cashews, 100 gm → `/products/dryfruits-roasted-cashews`
   - Slow Roasted Almonds, 100 gm → `/products/dryfruits-roasted-almonds`
   Images: `images/makhana-peri.jpg`, `images/makhana-cheese.jpg`, `images/makhana-salt.jpg`, `images/popcorn-salted-hq.jpg`, `images/popcorn-butter-hq.jpg`, `images/dryfruits-roasted-cashews-hq.jpg`, `images/dryfruits-roasted-almonds-hq.jpg`. Note: the Chatpataa and Peri-Peri card images are the wrong flavour packs (see Copy problems).
   Card copy, exact: Peri-Peri: "roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend. A healthy snack that satisfy your cravings!" Chatpataa: "Slow-roasted fox nuts tossed in authentic Indian chaat masala, tangy dry mango, black salt, and roasted cumin in virgin olive oil." Salted popcorn: "Crisp, fluffy popcorn tossed with pure Himalayan salt for a light, guilt-free munching experience."
3. No CTA beyond the card links.

Reusable copy worth keeping:
- "Wholesome, crunchy & made with premium ingredients for a better you."
- "A healthy snack that satisfy your cravings!"
- "Slow-roasted fox nuts tossed in authentic Indian chaat masala"
- "Rich, buttery, golden popped kernels bringing classic movie theater magic right to your home."

## /blogs-reviews: Blogs & Customer Reviews
Meta description: Read our health & wellness articles, nutritional insights, and verified customer reviews about Yunch Bite gourmet roasted foxnuts and healthy snacks.
H1: none (page has no H1).
Sections in order:
1. [H2 "Blogs"] "Subscribe for regular Updates" with one checkbox. No email field was captured, so the newsletter sign-up is (unclear). Filter buttons: All Blogs, Health & Wellness, Snacking Tips, Our Products, Sustainability, Lifestyle. Five article cards (table below). No article is tagged Sustainability.
2. [H2 "Customer Reviews"] Aggregate 4.8, "Based on customer reviews". Distribution: 5 stars 82%, 4 stars 13%, 3 stars 4%, 2 stars 1%, 1 star 0%. CTA: "Write a Review". Sort label "Most Recent". Six reviews (table below). Per-review star ratings are not in the harvested text.

Blog cards on this page (also the /articles set):

| Card title | Category | Date | Read time |
|---|---|---|---|
| Why Makhana is the Perfect Smart Snack | Health & Wellness | 24 May 2024 | 4 min |
| The Power of Nuts: Small Bite, Big Benefits | Health & Wellness | 20 May 2024 | 3 min |
| Popcorn: The Crunchy Snack You Can Feel Good About | Snacking Tips | 18 May 2024 | 3 min |
| Discover Our Range of Healthy Snacks | Our Products | 15 May 2024 | 2 min |
| Healthy Snacking Habits for the Whole Family | Lifestyle | 12 May 2024 | 4 min |

Note: the card dates run 12 to 24 May 2024. Article pages show the same dates.

Reviews (exact text as harvested; all "Verified Buyer"):

| Reviewer | Date | Title (H3) | Body (exact) |
|---|---|---|---|
| Neha Sharma | 24 May 2024 | Super crunchy and so healthy! | "Yunch Bite makhana is my go-to snack! It's light, crunchy and full of flavour. I feel good about giving it to my kids too." |
| Rohit Verma | 23 May 2024 | Whole family loves it! | "Finally a snack that the whole family enjoys. The quality, taste and packaging – everything is top notch." |
| Priya Malhotra | 22 May 2024 | Tasty, healthy and guilt-free! | "I love that it's roasted, not fried. Perfect snack for work breaks. Totally guilt-free and very tasty." |
| Amit Khanna | 21 May 2024 | Amazing quality! | "You can really taste the freshness and quality in every bite. The flavours are just perfect." |
| Sneha Iyer | 20 May 2024 | My evening snack fix! | "Light, crunchy and super tasty, I keep a pack in my bag always. Highly recommended!" |
| Vivek Singh | 19 May 2024 | Great taste, better choice. | "Love the healthy ingredients and zero compromises on taste. Yunch Bite is simply the best!" |

Images: `images/blog-makhana-hq.jpg`, `images/blog-nuts-hq.jpg`, `images/blog-popcorn-hq.jpg`, `images/blog-products-hq.jpg`, `images/blog-family-hq.jpg`, and `images/avatar-female-hq.jpg` (reviewer avatar alt "Neha Sharma"; other reviewers show initials, not images).

Reusable copy worth keeping:
- "Super crunchy and so healthy!"
- "I love that it's roasted, not fried."
- "Great taste, better choice."
- "Yunch Bite is simply the best!"

## /contact: Contact Us
Meta description: Get in touch with Yunch Bite. Inquire about distribution, retail partnerships, or reach our support team directly.
Sections in order:
1. [H1 "Contact Us"] Image: `images/contact-mascot-hero.png` (alt "Yunch Bite Mascot pointing towards Contact Us"). Details: phone +91 97850 009977 (tel link); email wecare@yunchbite.com (mailto); address "Khasra No.- 25/ 32, Killa No.- 14, 2, Tigaon, Faridabad, Haryana, India- 121101". Page title: "Contact Us | Partner & Connect With Yunch Bite | Yunch Bite".
2. [H2 "Partnership with us?"] "Interested in stocking or distributing Yunch Bite products?" Form: Name (text), Phone Number (text), E-mail ID (email), "I am interested in" (dropdown; options not captured, so (unclear)). CTA: "Submit Partnership Inquiry".
3. [H2 "Have a Question?"] "Fill out the form and we'll get back to you as soon as possible." Form: Name (text), Phone Number (text), E-mail ID (email), Message (textarea). CTA: "Send Message".
4. [H2 "Follow Yunch Bite"] @yunchbite on Instagram (instagram.com/yunchbite), Facebook (facebook.com/yunchbite), LinkedIn (linkedin.com/company/yunchbite).
No required-field markers or validation messages were captured.

Reusable copy worth keeping:
- "Partner & Connect With Yunch Bite"
- "Interested in stocking or distributing Yunch Bite products?"
- "Fill out the form and we'll get back to you as soon as possible"

## /ingredients-quality: Ingredients & Product Quality
Meta description: Complete ingredient transparency for Yunch Bite roasted makhana, popcorn, cashews, and almonds. Roasted in pure olive oil with natural herbs and zero artificial additives.
H1: "All About Ingredients & Product Quality". No images on this page.
Sections in order:
1. [Intro] "At Yunch Bite, quality isn't a claim – it's our commitment."
2. [01, H2 "Clean & Carefully Chosen Ingredients"] Five bullets: High quality raw materials; No artificial colors, flavors or preservatives; 100% Vegetarian; Gluten Free; Wholesome & nutritious by nature.
3. [02, H2 "Product Quality You Can Trust"] Sub-block "The Goodness of Olive Oil": "Our makhana, nuts and popcorn are roasted / popped in premium quality olive oil – never fried." Four chips: Supports Heart Health; Rich in Natural Antioxidants; Helps Maintain Healthy Cholesterol; Adds a Better Crunch.
4. [03, H2 "Packaging That Protects Quality"] Six chips: Food-grade materials; Resealable pouches / jars; Moisture & air protection; Travel & on-the-go friendly; Eco-conscious & recyclable; Quality sealed for freshness.
5. [04, H2 "Our Commitment"] "Better Ingredients. Better Quality. Better Snacks. Better Life." Five chips: Quality Sourced; Quality Tested; Hygienically Processed; Packed with Care; Loved by Families. Sign-off "Yunch Bite – Yunchy Crunchy Healthy Bite".
6. [06 (no 05), H2 "Ingredients by Product Category"] Three tables, exact text:
   - A. Fox Nuts (Makhana): Raw Makhana = "Makhana (Fox Nuts)." Flavoured rows all start with "Makhana (Fox Nuts), Olive Oil," plus seasoning: Berry Berry Paradise (sugar, mixed berry powder, citric acid INS 330, natural berry flavour); Pudina Masala; Himalayan Salt & Pepper (Himalayan pink salt, black pepper); Black Salt (black salt, cumin, INS 330); Chatpata Masala (chat masala, INS 330). Note: "All our makhana is roasted in olive oil – never fried."
   - B. Popcorn: Salted = "Popcorn, Olive Oil, Iodized Salt."; Pudina = "Popcorn, Olive Oil, Pudina Seasoning [...]"; Butter = "Popcorn, Olive Oil, Butter Seasoning [Maltodextrin, Butter Powder, ..., Anticaking Agent (INS 551)]." Note: "Our popcorn is popped in olive oil – not fried."
   - C. Nuts: Roasted Cashews (Salted) = "Cashews, Olive Oil, Iodized Salt."; Raw Cashews = "Cashews."; Roasted Almonds (Salted) = "Almonds, Olive Oil, Iodized Salt."; Raw Almonds = "Almonds." Note: "Our nuts are carefully sourced and roasted in olive oil to retain natural goodness and crunch."
   Berry Berry, Pudina and Black Salt ingredient lists are in this table (they are not all in the same format group, so the table is the only place that lists all seven fox-nut flavours).

Reusable copy worth keeping:
- "quality isn't a claim – it's our commitment"
- "roasted / popped in premium quality olive oil – never fried"
- "Better Ingredients. Better Quality. Better Snacks. Better Life."
- "Goodness should reach you the way it's made."

## /products: Our Products
Meta description: Explore the full range of Yunch Bite healthy snacks: slow-roasted makhana pouches and jars, gourmet popcorn, and premium dry fruits crafted with wholesome goodness.
Sections in order:
1. [H1 "Our Products"] Tagline "Wholesome, crunchy & made with premium ingredients for a better you." Image `images/products-hero-banner.png` (alt "Yunch Bite Products Podium Showcase").
2. [Quality badge marquee] "Roasted in Olive Oil" · "No Preservatives" · "High in Protien & Fiber" · "100% Vegetarian" · "Gluten Free".
3. [H2 category cards, three] Makhana (`images/category-makhana-card.png`) CTA "Explore Makhana" → `/products/makhana`. Popcorn (`images/category-popcorn-card.png`) CTA "Explore Popcorn" → `/products/popcorn`. Dry Fruits (`images/category-dryfruits-card.png`) CTA "Explore Dry Fruits" → `/products/dry-fruits`.
4. [H2 "Best Selling Products"] Same 11 cards as /bestsellers, with the same images and links.

Reusable copy worth keeping:
- "Wholesome, crunchy & made with premium ingredients for a better you."
- "Gourmet Roasted Makhana, Popcorn & Dry Fruits" (title tag)
- "Explore the full range of Yunch Bite healthy snacks" (meta description)

## /why-yunch-bite: Why Choose Yunch Bite
Meta description: Discover why consumers, parents, retailers, and distributors trust Yunch Bite. Wholesome olive oil roasted makhana, no preservatives, and guilt-free snacking for everyone.
H1: "Why You Should Prefer Yunch Bite?"
Sections in order:
1. [Intro] "Every product we create is built on a simple promise: great taste with higher standards." Image `images/info-pages-makhana-bowl.png`.
2. [01, H2 "For Health-Conscious Consumers"] "You deserve snacks that are both delicious and good for you." Six cards: Wholesome Ingredients; Roasted in Olive Oil; High in Protein & Fiber; No Preservatives or Additives; Clean, Safe & Hygienic; Great Taste, Better Choices. Close: "Yunch Bite is perfect for all age groups – from kids to adults to seniors."
3. [02, H2 "For Parents"] "Your child's health matters the most." Four bullets: Made with natural ingredients you can trust; Loved by kids for their crunch and taste; Goodness of protein and essential nutrients; No junk, no worries – only healthy smiles.
4. [03, H2 "For Retailers"] Five cards: High Demand Category ("Healthy snacking is one of the fastest growing segments."); Wide Range of Products; Repeat Purchase Guaranteed; Attractive Margins ("Competitive pricing and better turnover for your business."); Marketing Support.
5. [04, H2 "For Distributors & Business Partners"] Four bullets: Strong brand reputation and growing market reach; Consistent product quality and timely supply; Flexible business opportunities; Dedicated support every step of the way.
6. [05, H2 "For Everyone, Every Day"] Four chips: Light yet satisfying; Perfect for anytime munching; Fits into every lifestyle; Better for you, better for the planet. Tagline "Better Ingredients. Better You." Closing: "At Yunch Bite, we don't just make snacks – we create better choices for a healthier, happier world."
No CTAs. No images beyond the intro bowl.

Reusable copy worth keeping:
- "great taste with higher standards"
- "Your child's health matters the most."
- "No junk, no worries – only healthy smiles"
- "Repeat Purchase Guaranteed"
- "we don't just make snacks – we create better choices for a healthier, happier world."

## Category pages (3)

## /categories/makhana: Makhana Range
Title: "Makhana Range | Gourmet Roasted Healthy Snacks | Yunch Bite". Meta description field: "Crunchy Outside, Wholesome Inside!!!" (same as H1, not a real meta description).
Sections in order:
1. [H1 "Crunchy Outside, Wholesome Inside!!!"] Sub-line "Light. Crunchy. Full of Goodness." Banner `images/homepage_14.png` (alt "Makhana Banner"). Filter buttons: All, Raw, Pillow Pouch, Zipper Pouch, Jar.
2. [Four format sections: Raw, Pillow Pouch, Zipper Pouch, Jar] Each section lists the same 14 cards (each product link appears four times in the DOM, so the filter does not split the list in the harvest). Cards and listed sizes:
   - Raw Makhana: 250 gm (`/products/makhana-raw-1`)
   - Peri- Peri Paradise: 12 gm, 50 gm, 80 gm (pillow, zipper, jar links)
   - Chatpataa Masala: 12 gm, 50 gm, 80 gm
   - Himalayan Salt & Pepper: 12 gm, 50 gm, 80 gm
   - Berry Berry Paradise: 50 gm (zipper only exists)
   - Pudina Masala: 50 gm (zipper only)
   - Black Salt: 50 gm (zipper only)
   - Tangy Cheese & Herbs: 50 gm (zipper only)
   Same chips appear in every format section, including the Pillow and Jar sections, where Berry Berry, Pudina, Black Salt and Tangy Cheese & Herbs have no product page.
3. Quality ribbon "Roasted in Olive Oil · No Preservatives · High in Protien & Fiber · 100% Vegetarian · Gluten Free".
Card images: `images/category-makhana-card.png` (Raw), `images/makhana-peri.jpg`, `images/makhana-cheese.jpg`, `images/makhana-salt.jpg`, `images/makhana-pudina.jpg`. Pudina card uses `images/makhana-pudina.jpg`. Black Salt card uses `images/makhana-salt.jpg` (Himalayan pack) and Chatpataa uses `images/makhana-cheese.jpg` (Cheese pack); see Copy problems.

Reusable copy worth keeping: "Crunchy Outside, Wholesome Inside!!!" / "Light. Crunchy. Full of Goodness."

## /categories/popcorn: Popcorn Range
Title: "Popcorn Range | Gourmet Roasted Healthy Snacks | Yunch Bite". Meta description field: "Simple Ingredients, Extra Happiness!!!" (same as H1).
Sections in order:
1. [H1 "Simple Ingredients, Extra Happiness!!!"] Sub-line "Always a good idea for munching." Banner `images/homepage_15.png` (alt "Popcorn Banner"). Filters: All, Pillow Pouch.
2. [H2 "Pillow Pouch"] Three cards: Salted Popcorn 30 gm (`images/popcorn-salted-hq.jpg`); Pudina Masala Popcorn 30 gm (`images/popcorn-pudina-hq.jpg`); Butter Popcorn 30 gm (`images/popcorn-butter-hq.jpg`).
3. Quality ribbon (same five chips as the makhana page, with "Protien").

Reusable copy worth keeping: "Simple Ingredients, Extra Happiness!!!" / "Always a good idea for munching."

## /categories/dry-fruits: Dry Fruits Range
Title: "Dry Fruits Range | Gourmet Roasted Healthy Snacks | Yunch Bite". Meta description field: "Nourishment for Healthier Tomorrow!!!" (same as H1).
Sections in order:
1. [H1 "Nourishment for Healthier Tomorrow!!!"] Sub-line "Pure. Natural. Perfect for you." Banner `images/homepage_16.png` (alt "Dry Fruits Banner"). Filters: All, Raw Nuts, Roasted Nuts.
2. [H2 "Raw Nuts"] Four cards, all 100 gm: Whole Raw Cashews; California Raw Almonds; Slow Roasted Cashews; Slow Roasted Almonds. Includes two roasted items.
3. [H2 "Roasted Nuts"] The same four cards, in the same order. Includes two raw items.
4. Quality ribbon (same five chips, with "Protien").
Card images: `images/dryfruits-raw-cashews-hq.jpg`, `images/dryfruits-raw-almonds-hq.jpg`, `images/dryfruits-roasted-cashews-hq.jpg`, `images/dryfruits-roasted-almonds-hq.jpg`.

Reusable copy worth keeping: "Nourishment for Healthier Tomorrow!!!" / "Pure. Natural. Perfect for you."


## Product pages (21)

## Product page template (example: /products/makhana-zipper-peri-peri)
Title: "Peri-Peri Paradise | Gourmet Roasted Snacks | Yunch Bite". H1: "Peri- Peri Paradise | Yunch Bite Makhana". Meta description: "Yunch Bite Makhana is roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend, packed in a resealable zip-lock pouch for lasting freshness."
Modules in order:
1. Badge "BEST SELLER" (present on all 21 product pages).
2. Hero image `images/makhana-peri.jpg` (alt = H1).
3. H1 product name.
4. Format label "Zipper Pouch" with size chips "50 gm | 80 gm | 100 gm". The chips are the only size control. No price, add-to-cart or where-to-buy element was captured.
5. Rating "4.9" (no review count shown).
6. H2 "Description": one paragraph. Its first sentence is the card blurb used on category and bestseller pages.
7. Accordion buttons (H3), each with body text:
   - Ingredients: "Makhana (Fox Nuts), Olive Oil, Peri-Peri Seasoning [Chilli, Garlic, Onion, Black Pepper, Iodized Salt, Citric Acid (INS 330), Natural Spices]."
   - Nutritional Information (per 100 g, serving size 100g): energy 428 kcal; protein 9.5 g; carbohydrates 66.4 g; dietary fiber 11.8 g; total fat 14.2 g; saturated fat 1.9 g; trans fat 0 g; cholesterol 0 mg; sodium 390 mg.
   - Allergen Information: "Processed in a clean facility that also handles nuts and dairy. Naturally gluten-free."
   - Storage Instructions: "Reseal zipper tightly after opening. Store in a cool, dry place."
   - Shelf Life: "6 Months from the date of manufacturing."
   - Country of Origin: "India"
8. H2 "Other Related Products": 20 cards (name, size, blurb, link) that exclude the current page. Mix of makhana in all formats, the Raw Makhana card, popcorn and dry-fruit cards. Images: manifest files used by those products.

Reusable copy worth keeping: "Yunch Bite Makhana is roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend." / "Reseal zipper tightly after opening." / "Processed in a clean facility that also handles nuts and dairy."

## Product table (21 products)
Format uses the page label: Zipper Pouch = zipper, Pillow Pouch = pillow, Jar = jar, Raw = single. Sizes are the on-page size chips. Badge "yes" means the text "BEST SELLER" appears on the page. Image is the hero image's manifest file. Three rows (Chatpataa jar/pillow/zipper use `makhana-cheese.jpg`, Black Salt uses `makhana-salt.jpg`, Berry Berry uses `makhana-peri.jpg`) show another flavour's pack; see Copy problems.

| Path | Product (H1) | Category | Format | Sizes listed | Bestseller badge | Rating | Image file | One-line description (first sentence) |
|---|---|---|---|---|---|---|---|---|
| /products/dryfruits-raw-almonds | California Raw Almonds \| Yunch Bite Dry Fruits | Dry Fruits | zipper | 100 gm, 250 gm, 500 gm | yes | 4.9 | `images/dryfruits-raw-almonds-hq.jpg` | Crisp, nutrient-dense California nonpareil almonds loaded with Vitamin E, protein, and dietary fiber. |
| /products/dryfruits-raw-cashews | Whole Raw Cashews \| Yunch Bite Dry Fruits | Dry Fruits | zipper | 100 gm, 250 gm, 500 gm | yes | 4.8 | `images/dryfruits-raw-cashews-hq.jpg` | Finest whole cashew nuts hand-picked from the lush groves of Mangalore. |
| /products/dryfruits-roasted-almonds | Slow Roasted Almonds \| Yunch Bite Dry Fruits | Dry Fruits | zipper | 100 gm, 250 gm, 500 gm | yes | 4.9 | `images/dryfruits-roasted-almonds-hq.jpg` | Evenly dry-roasted California almonds with a delightful snap and light seasoning. |
| /products/dryfruits-roasted-cashews | Slow Roasted Cashews \| Yunch Bite Dry Fruits | Dry Fruits | zipper | 100 gm, 250 gm, 500 gm | yes | 4.9 | `images/dryfruits-roasted-cashews-hq.jpg` | Jumbo cashews slow dry-roasted to a golden crisp and sprinkled with natural rock salt. |
| /products/makhana-jar-chatpataa | Chatpataa Masala \| Yunch Bite Makhana | Makhana | jar | 80 gm, 120 gm, 150 gm | yes | 4.8 | `images/makhana-cheese.jpg` | Tangy and savory chaat spice blend tossed with crunchy fox nuts, packed in an airtight clear countertop snack jar. |
| /products/makhana-jar-peri-peri | Peri- Peri Paradise \| Yunch Bite Makhana | Makhana | jar | 80 gm, 120 gm, 150 gm | yes | 4.9 | `images/makhana-peri.jpg` | Yunch Bite Makhana is roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend. |
| /products/makhana-jar-salt-pepper | Himalayan Salt & Pepper \| Yunch Bite Makhana | Makhana | jar | 80 gm, 120 gm, 150 gm | yes | 4.9 | `images/makhana-salt.jpg` | Classic pink salt & cracked black pepper roasted fox nuts in a clear tabletop jar for convenient everyday guilt-free snacking. |
| /products/makhana-pillow-chatpataa | Chatpataa Masala \| Yunch Bite Makhana | Makhana | pillow | 12 gm, 50 gm, 80 gm | yes | 4.8 | `images/makhana-cheese.jpg` | Slow-roasted fox nuts tossed in authentic Indian chaat masala, tangy dry mango, black salt, and roasted cumin in virgin olive oil. |
| /products/makhana-pillow-peri-peri | Peri- Peri Paradise \| Yunch Bite Makhana | Makhana | pillow | 12 gm, 50 gm, 80 gm | yes | 4.9 | `images/makhana-peri.jpg` | Yunch Bite Makhana is roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend, that delivers the perfect balance of crunch and spice. |
| /products/makhana-pillow-salt-pepper | Himalayan Salt & Pepper \| Yunch Bite Makhana | Makhana | pillow | 12 gm, 50 gm, 80 gm | yes | 4.9 | `images/makhana-salt.jpg` | Subtle, aromatic, and comforting. |
| /products/makhana-raw-1 | Raw Makhana \| Yunch Bite Makhana | Makhana | single | 250 gm, 500 gm, 1 kg | yes | 4.9 | `images/category-makhana-card.png` | Hand-graded, jumbo-sized raw fox nuts sourced directly from the fresh water ponds of Bihar. |
| /products/makhana-zipper-berry-berry | Berry Berry Paradise \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.7 | `images/makhana-peri.jpg` | Sweet, zesty natural wild berry extract dusted onto olive oil roasted crunchy makhana for an indulgent, guilt-free sweet crunch. |
| /products/makhana-zipper-black-salt | Black Salt \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.7 | `images/makhana-salt.jpg` | Traditional roasted fox nuts sprinkled with mineral-rich Indian black salt (kala namak) and digestive roasted cumin. |
| /products/makhana-zipper-chatpataa | Chatpataa Masala \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.8 | `images/makhana-cheese.jpg` | Tangy and savory street chaat spices blended over slow-roasted crispy fox nuts, preserved in an airtight zipper pouch. |
| /products/makhana-zipper-cheese-herbs | Tangy Cheese & Herbs \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.9 | `images/makhana-cheese.jpg` | Rich cheddar cheese essence paired with aromatic Mediterranean oregano and basil, slow-roasted over crunchy fox nuts. |
| /products/makhana-zipper-peri-peri | Peri- Peri Paradise \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.9 | `images/makhana-peri.jpg` | Yunch Bite Makhana is roasted to perfection in olive oil and seasoned with a unique & fiery peri-peri blend, packed in a resealable zip-lock pouch for lasting freshness. |
| /products/makhana-zipper-pudina | Pudina Masala \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.8 | `images/makhana-pudina.jpg` | Refreshing garden mint leaves and rock salt crushed over slow-roasted makhana kernels in virgin olive oil. |
| /products/makhana-zipper-salt-pepper | Himalayan Salt & Pepper \| Yunch Bite Makhana | Makhana | zipper | 50 gm, 80 gm, 100 gm | yes | 4.9 | `images/makhana-salt.jpg` | Pink Himalayan salt and fragrant cracked black pepper over slow-roasted fox nuts in olive oil, presented in a resealable stand-up zipper pouch. |
| /products/popcorn-butter | Butter Popcorn \| Yunch Bite Popcorn | Popcorn | pillow | 30 gm, 60 gm, 100 gm | yes | 4.9 | `images/popcorn-butter-hq.jpg` | Rich, buttery, golden popped kernels bringing classic movie theater magic right to your home. |
| /products/popcorn-pudina | Pudina Masala Popcorn \| Yunch Bite Popcorn | Popcorn | pillow | 30 gm, 60 gm, 100 gm | yes | 4.7 | `images/popcorn-pudina-hq.jpg` | Crispy corn kernels infused with aromatic mint leaves and tangy Indian chaat spices. |
| /products/popcorn-salted | Salted Popcorn \| Yunch Bite Popcorn | Popcorn | pillow | 30 gm, 60 gm, 100 gm | yes | 4.8 | `images/popcorn-salted-hq.jpg` | Crisp, fluffy popcorn tossed with pure Himalayan salt for a light, guilt-free munching experience. |

## Article pages (5)

## Article page template (example: /articles/why-makhana-is-the-perfect-smart-snack)
Title: "Why Makhana is the Perfect Smart Snack | Healthy Snacking Guide | Yunch Bite". H1 = article title. Meta description: "Discover why fox nuts (makhana) are celebrated by nutritionists worldwide as the ultimate crunch snack packed with plant-based protein, antioxidants, and vital minerals."
Modules in order:
1. Breadcrumb: Home › Blogs & Reviews › category.
2. Category label (Health & Wellness, Snacking Tips, Our Products or Lifestyle).
3. H1 article title.
4. Byline: author avatar, name, role, date and read time. All five use the same file, `images/avatar-female-hq.jpg`.
5. Hero image: `images/blog-*-hq.jpg`, alt = title.
6. Lead quote in curly quotes (same text as the meta description, or a shorter pull quote).
7. 1 to 3 H2 sections of plain text. No inline images. The makhana article uses a numbered list of five benefits.
8. "Back to Blogs & Reviews" link.
9. H3 "More from YunchBite Journal": three related article cards, plus "View All" → `/blogs-reviews#blogs-section`.
No CTA buttons were captured in article bodies.

Authors (exact):
- Discover Our Range of Healthy Snacks: "YunchBite Culinary Team", "Flavor Innovation & Quality Lab"
- Healthy Snacking Habits for the Whole Family: "Simran Kapoor", "Family Wellness Advocate"
- Popcorn: The Crunchy Snack You Can Feel Good About: "Pooja Singhania", "Culinary Nutritionist"
- The Power of Nuts: Small Bite, Big Benefits: "Karan Malhotra", "Sports Dietitian"
- Why Makhana is the Perfect Smart Snack: "Dr. Ananya Roy", "Holistic Nutritionist & Wellness Coach"

Article table. Word count is approximate and counts the body text only (from the H1 to "Back to Blogs"). It excludes the byline, the related cards and the nav.

| Path | Title | Hero image file | Word count (approx) | H2 section headings |
|---|---|---|---|---|
| /articles/discover-our-range-of-healthy-snacks | Discover Our Range of Healthy Snacks | `images/blog-products-hq.jpg` | 97 | Our Commitment to Conscious Crunching |
| /articles/healthy-snacking-habits-for-the-whole-family | Healthy Snacking Habits for the Whole Family | `images/blog-family-hq.jpg` | 94 | Building a Healthy Pantry Together |
| /articles/popcorn-the-crunchy-snack-you-can-feel-good-about | Popcorn: The Crunchy Snack You Can Feel Good About | `images/blog-popcorn-hq.jpg` | 118 | 100% Whole Grain Goodness; Clean Popcorn, Zero Artificial Additives |
| /articles/the-power-of-nuts-small-bite-big-benefits | The Power of Nuts: Small Bite, Big Benefits | `images/blog-nuts-hq.jpg` | 128 | Nutrient Density in Every Handful; Why Slow Roasting Matters |
| /articles/why-makhana-is-the-perfect-smart-snack | Why Makhana is the Perfect Smart Snack | `images/blog-makhana-hq.jpg` | 290 | The Ancient Superfood of Modern Snacking; Top 5 Scientifically Proven Health Benefits; The YunchBite Difference: Slow-Roasted in Olive Oil |

## Duplicate routes (not inventoried)
- `/catergries/makhana`, `/catergries/popcorn`, `/catergries/dry-fruits`: same H1, title and cards as `/categories/*`. The home page category cards link here.
- `/products/makhana`, `/products/popcorn`, `/products/dry-fruits`: same card set as `/categories/*` (similar length). Their title is "Yunch Bite" and their H1 is "Yunchy, Crunchy, Healthy Bite". The products page "Explore" buttons link here.

## Copy problems seen

Names and spelling
- "Peri- Peri Paradise" (space after the hyphen) in H1s and card titles on the 3 Peri-Peri product pages (jar, pillow, zipper), `/bestsellers`, `/products`, `/categories/makhana`. "Peri-Peri Paradise" in title tags and product blurbs. 147 vs 74 harvested occurrences. Pick one.
- "Chatpataa Masala" (product names, most pages) vs "Chatpata Masala" in `/about` (Product Philosophy list) and `/ingredients-quality` (ingredients table row), and "chatpata makhanas" in `/articles/healthy-snacking-habits-for-the-whole-family`. The ingredients table also says "Chat Masala".
- "Yunch Bite" (the brand name in most copy, 1,579 occurrences) vs "YunchBite" in all five articles (14 occurrences, e.g. "YunchBite Culinary Team") and in `/about` ("Yunchbite" in two places, "Yunch bite was created" lowercase in one place).
- "Yunch Bite Makhana" product label is repeated in every H1 and card title ("Peri- Peri Paradise | Yunch Bite Makhana"). The brand name is part of every product name, which makes the H1 very long.
- Nav label "Our Product" (header) vs page H1 "Our Products" (`/products`).

Typos
- `/` "Yunchy Crunchy Heathy Bite" (block title; "Heathy").
- "High in Protien & Fiber" in the quality-badge ribbon on `/products` and the three category pages (appears 11 times in total).
- `/` banner-slide-3 alt text: "Ye Hai Aam Jindgi vs Ye Hai Yunchy Jindgi" ("Jindgi", likely "Zindagi"). Alt text only; check the visible banner.
- `/products/makhana-pillow-salt-pepper` blurb: "Subtle, aromatic, and comforting." is a fragment that ends at the first full stop; the rest of the blurb follows in the same paragraph. Not a typo, but the card blurb reads as a one-word fragment.
- Peri-Peri pillow blurb on `/products/makhana-pillow-peri-peri` and `/bestsellers`: "A healthy snack that satisfy your cravings!" (should read "satisfies").
- `/products/*` nutrition labels are lowercase in the harvested text: "serving Size", "energy", "dietary Fiber" (on all 21 product pages). Check whether this is a markup or CSS artefact.
- `/ingredients-quality` numbering goes 01, 02, 03, 04, then 06. There is no 05.

Oil and frying claims (inconsistent)
- Home intro: "virgin cold-pressed oil". `/bestsellers` and the home meta description: "cold-pressed oil". `/benefits` meta: "pure olive oil". Product pages: "olive oil". `/ingredients-quality`: "premium quality olive oil". Articles: "pure olive oil". Pick one wording.
- Slow-roasted nuts: the Slow Roasted Cashews card copy (`/bestsellers`, `/categories/dry-fruits`) says "slow dry-roasted ... sprinkled with natural rock salt", and the article "The Power of Nuts" says the process "locks in natural nut oils". The ingredients table for the same products lists "Cashews, Olive Oil, Iodized Salt." and "Almonds, Olive Oil, Iodized Salt."
- Nutrition per 100 g for makhana disagrees. `/benefits` table: energy 347 kcal, protein 9.7 g, fibre 7.6 g. The Peri-Peri product page (per 100 g): energy 428 kcal, protein 9.5 g, fibre 11.8 g. The benefits table says "Values may vary slightly with flavor", but the gap is about 23% on energy.
- "No artificial colors, flavors or preservatives" and "zero artificial additives" (`/ingredients-quality`, `/articles/popcorn...`) sit alongside INS-coded additives in the ingredient lists: INS 330 (citric acid or acidity regulator) in Berry Berry, Pudina, Black Salt, Chatpata and Peri-Peri; anticaking agent (INS 551) in Butter Popcorn. Check the claim wording.
- Berry Berry Paradise ingredient list includes sugar ("Sugar, Mixed Berry Powder ..."). The copy calls it "guilt-free sweet crunch" and "natural wild berry extract". Check the claim.

Badges, sizes and images
- "BEST SELLER" badge on all 21 product pages, but `/bestsellers` and the "Best Selling Products" grid on `/products` show 11 items. The badge does not mark the same set as the bestseller pages.
- Category size chips do not match the product pages. Example: the Jar tab on `/categories/makhana` shows 12 gm, 50 gm and 80 gm, but the Jar product pages list 80 gm, 120 gm and 150 gm. Popcorn cards show 30 gm only (product pages: 30, 60, 100 gm). Dry-fruit cards show 100 gm only (product pages: 100, 250, 500 gm). Raw Makhana cards show 250 gm only (product page: 250 gm, 500 gm, 1 kg).
- Makhana category tabs (Pillow, Zipper, Jar) list Berry Berry Paradise, Pudina Masala, Black Salt and Tangy Cheese & Herbs, but those flavours have product pages only in the zipper format.
- Dry Fruits category: the "Raw Nuts" tab includes the two slow-roasted products, and the "Roasted Nuts" tab includes the two raw products. Both tabs show all four cards.
- Makhana category: the Raw, Pillow, Zipper and Jar tabs each show all 14 products. Whether the tabs filter is unclear from the harvest.
- Mismatched images (checked by viewing the files):
  - `images/makhana-cheese.jpg` (a Tangy Cheese & Herbs pack) is used on the three Chatpataa Masala product pages (`/products/makhana-jar-chatpataa`, `/products/makhana-pillow-chatpataa`, `/products/makhana-zipper-chatpataa`) and on the Chatpataa cards on `/bestsellers`, `/products`, and `/categories/makhana`. There is no Chatpataa pack image in the manifest.
  - `images/makhana-salt.jpg` (a Himalayan Salt & Pepper pack) is used on `/products/makhana-zipper-black-salt` (Black Salt). There is no Black Salt pack image.
  - `images/makhana-peri.jpg` (a Peri Peri pack) is used on `/products/makhana-zipper-berry-berry` (Berry Berry Paradise) and on its related-product cards.
  - Pack-art net weights do not match the listed sizes: the Himalayan pack reads "45g" and the Peri Peri pack reads "NET WT. 100g". The Peri-Peri zipper page lists 50 gm, 80 gm and 100 gm.
  - `images/category-makhana-card.png` (a category card, not a product shot) is the only image on `/products/makhana-raw-1`.
  - All five articles use the same female avatar, including "Karan Malhotra" (`images/avatar-female-hq.jpg`). Check the author photos.

Claims and content
- Health claims needing substantiation or legal review: "Low Glycemic Index ... ideal choice for diabetic and fitness-conscious eaters" and "Top 5 Scientifically Proven Health Benefits" (`/articles/why-makhana-is-the-perfect-smart-snack`); "Clinical studies consistently show" (`/articles/the-power-of-nuts-...`); "Helps Maintain Healthy Cholesterol" (`/ingredients-quality`); "Supports Heart Health"; "Popcorn ... 100% unprocessed whole grain" (`/articles/popcorn-...`).
- Competitor-style claim: "Most commercial dry fruit snacks are flash-fried in cheap palm oil" (`/articles/the-power-of-nuts-...`).
- `/articles/popcorn-the-crunchy-snack-you-can-feel-good-about` says the range is "classic salted and butter popcorn". It omits Pudina Masala Popcorn, which is on the site.
- Banner/UI text left in the page: "Scroll down to cycle menu • 0%" (`/`).
- `/blogs-reviews` has no H1. Its "Subscribe for regular Updates" box has only a checkbox in the harvest, so the sign-up is unclear.
- `/categories/*` meta description equals the H1 (for example, "Crunchy Outside, Wholesome Inside!!!"). There is no real meta description.
- `/contact` partnership form: the "I am interested in" dropdown options are not captured (unclear). The partnership form has no message field, and the question form has no product or topic field.
- Reviews: the harvested page shows six reviews, but the aggregate says "Based on customer reviews" with 4.8 stars and no count. Product pages show ratings of 4.7 to 4.9 with no count. Check whether those ratings are backed by the reviews on `/blogs-reviews`.
