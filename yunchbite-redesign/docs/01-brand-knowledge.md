# Yunch Bite — brand knowledge

Source: a read-through of every page on the sitemap of the current site (preview build on Vercel), October–November 2026. Items marked **verify** are re-checked when the asset harvester runs, which writes exact copy, URLs and files to `research/current-site/`.

## 1. Brand core

| | |
|---|---|
| Name | **Yunch Bite**. "Yunch" comes from *Yan* + *Chi*: energy + vitality. |
| Founded | 18 October 2023, by Nitin Rathi |
| Category | Healthy snacking (Indian D2C) |
| Hero product | **Makhana** (fox nuts) |
| Tagline | "Yunchy, Crunchy, Healthy Bite" |
| Brand line / humour | Hinglish, playful: "Ye Hai Yunchy Jindgi" |
| Mascot | **Makhana Buddy**, a mischievous kid character (GIF animations exist on the current site) |
| Base | Faridabad, Haryana |

### Product claims (as stated on the site)

- Slow-roasted in **olive oil**
- **Zero palm oil**
- **No preservatives**
- **High protein and fibre**
- **Vegetarian** and **gluten-free**

> **Claim conflict to resolve:** the site says "no artificial additives", but ingredient lists include **INS 330** (citric acid) and **INS 551** (silicon dioxide, an anti-caking agent). The new site's claims should match the pack label and FSSAI labelling rules. We need the client's approved claim wording.

### Personality (what the new site must carry)

- **Playful, cheeky, desi**: mascot mischief, Hinglish lines, a sense of humour.
- **Better-for-you, without being preachy**: the health claims are proof points, not the headline mood.
- **Crunch**: the sensory hook is in the name itself ("Yunchy, Crunchy"). It suggests snappy, tactile motion, which we'll test against the references.

## 2. Product range

20 product pages in 3 categories (**verify** exact SKU names and pack sizes in the harvest):

| Category | Range | Formats |
|---|---|---|
| Makhana | 7 flavours + raw makhana | 12 g pillow pack, 50 g zipper pouch, 80 g jar |
| Popcorn | 3 flavours | **verify** |
| Dry fruits | Cashews and almonds, raw and roasted | **verify** |

- 11 products are marked **bestseller**.
- Each product page has **ingredients, nutrition table, allergens and shelf life**. This structured data carries over to the new product template.
- No prices and no buy buttons anywhere. The client confirmed the new site also has **no shop pages** (same sitemap).

## 3. Sitemap (stays the same)

| Group | Count | Notes |
|---|---|---|
| Main pages | 9 | Home, about, contact, products hub and other static pages (**verify** exact list) |
| Category pages | 3 | Makhana, Popcorn, Dry fruits |
| Product pages | 20 | One template, with the data listed above |
| Articles | 5 | Blog / knowledge posts |

38 URLs were read in the first pass, but the groups add up to 37; the harvest settles the exact list. **All URLs keep their current paths** so existing links and search rankings carry over.

## 4. Contact and social

- Address: Faridabad (full address: **verify**)
- Email: wecare@yunchbite.com
- Social: Instagram, Facebook and LinkedIn, all **@yunchbite**
- Phone shown: "+91 97850 009977". That's 11 digits after +91, but Indian mobile numbers have 10, so **one digit is wrong. Need the correct number.**

## 5. Problems on the current site (the new site must fix these)

| Area | Problem |
|---|---|
| Copy | Typos: "Heathy", "Protien", "catergries" |
| Links | Menu links point to the Vercel **preview** host instead of yunchbite.com |
| Structure | **No footer** on any page |
| SEO | yunchbite.com serves an empty HTML shell to non-JS clients, so search engines see almost nothing. The new build must be server-rendered or statically generated, with real HTML, metadata and Product/Article structured data. |
| Data | Dry fruits page: the "Roasted Nuts" tab repeats the raw nuts |
| Claims | "No artificial additives" vs INS 330 / INS 551 (see §1) |
| Trust | All 6 reviews are dated within one week of May 2024 and only 1 has a photo. Need real, current reviews (or remove the section). |
| Contact | Phone number has one digit too many |

## 6. Open items for the client

1. Correct phone number and full address.
2. Approved claims wording (especially "no additives").
3. Real customer reviews (with permission), if a reviews section stays.
4. Packaging print files or exact colour values (Pantone/CMYK/HEX) and brand fonts, if they exist. The new site must match the packaging, so print files are the most accurate source.
5. Logo in vector form (SVG/AI/PDF), if the site only has raster versions.
