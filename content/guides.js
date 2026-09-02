/**
 * Authored guidance for the rules that actually matter.
 *
 * WebAIM's Million (Feb 2026) found six problems account for 96% of every
 * error detected across a million home pages. Those six get written properly.
 * The other 64 rules get a reference page built from axe's own metadata, which
 * is accurate and useful and does not pretend to be more.
 *
 * The refusal here is the important part: generating "how to fix X in Y" for
 * 70 rules x 12 platforms would produce 840 pages, and 830 of them would be the
 * same paragraph with a noun swapped. That is the scaled-content abuse Google
 * has been demoting since March 2024, and it would be true even if it were not
 * penalised — nobody is served by it. Depth where it is read, accuracy
 * everywhere.
 *
 * `platforms` entries are only written where the platform genuinely changes the
 * answer. Shopify's theme editor and a React component tree fail contrast for
 * different reasons and are fixed in different places; a generic "check your
 * CSS" note for a platform we have nothing specific to say about is omitted
 * rather than padded.
 */

export const GUIDES = {
  "color-contrast": {
    whatItLooksLike:
      "Grey text on a white background. Placeholder text inside form fields. " +
      "A pale caption under an image. Light-coloured link text that was chosen " +
      "to look calm and ended up unreadable. It is almost always small, " +
      "secondary text that somebody deliberately de-emphasised.",
    whyItMatters:
      "Contrast is not a preference. Roughly one in twelve men has some colour " +
      "vision deficiency, and everyone's contrast sensitivity declines with " +
      "age — which means the readers most likely to fail on your low-contrast " +
      "text are also the ones most likely to have money. It is also the failure " +
      "that survives sunlight, cheap screens and phone brightness turned down.",
    theRule:
      "Normal text needs a contrast ratio of at least 4.5:1 against its " +
      "background. Large text — 18pt (24px), or 14pt (18.66px) if bold — needs " +
      "3:1. The ratio is computed from relative luminance, so it is not about " +
      "how different two colours look; a mid-grey and a mid-blue can look very " +
      "different and still fail.",
    howToFix: [
      "Find the computed foreground and background, not the CSS you think applies. Semi-transparent text composites against whatever is behind it, and that is the colour that gets measured.",
      "Darken the FOREGROUND rather than lightening the background. The background is usually load-bearing for the design; the text colour rarely is.",
      "Give yourself headroom. Landing on 4.51:1 means the next small change to a background colour silently breaks it again, and nobody will notice for a year.",
      "Fix the token, not the component. If the colour comes from a design token, one change fixes every use of it — but check for hardcoded copies of the same hex that will quietly override the token you just fixed.",
      "Re-check any colour that sits on a TINT of itself — a coloured chip or badge — separately. A colour that clears AA on the page can fail on a pale wash of its own hue.",
    ],
    gotcha:
      "A scanner cannot check text over a gradient, a background image, or a " +
      "video, and will report those as 'needs review' rather than pass or fail. " +
      "Those are exactly the places contrast tends to be worst.",
    platforms: {
      shopify:
        "Most themes expose text and background colours in Theme editor → Colors, and the failing pair is usually a 'secondary' or 'subdued' text setting used for prices, captions and stock notices. Change it there rather than in theme.liquid, or a theme update will overwrite you.",
      wordpress:
        "Block themes define colours in theme.json under settings.color.palette. Editing the palette entry fixes every block using it; editing a single block's colour in the editor produces an inline style that the next editor will not find.",
      tailwind:
        "The default grey scale is where this comes from: text-gray-400 on white is about 3.0:1 and text-gray-500 is about 4.6:1 — so the common 'muted text' choice is one step below passing. Move to at least text-gray-600 for body-sized text, and set it in your theme rather than per-component.",
      react:
        "Contrast failures in component libraries usually live in a theme object, not in JSX. Fix the palette entry. If you are using CSS-in-JS with opacity for muted text, remember the composite is what gets measured — alpha 0.6 black on white is roughly 4.4:1 and fails.",
      wix: "The colour palette is global (Site Design → Colors). Changing the palette slot fixes it everywhere; overriding one text element does not.",
    },
  },

  "image-alt": {
    whatItLooksLike:
      "An <img> with no alt attribute at all, or an alt that says 'image', " +
      "'photo', a filename, or the word the marketing team used for the asset " +
      "in the CMS.",
    whyItMatters:
      "A screen reader encountering an image with no alt announces the file " +
      "name, character by character in the worst cases. An image that carries " +
      "meaning — a product, a chart, a diagram of your pricing — is simply " +
      "absent for that reader. This is also the single most common accessibility " +
      "complaint in retail litigation, because product images are the product.",
    theRule:
      "Every <img> needs an alt attribute. Not every image needs alt TEXT: a " +
      "decorative image needs alt=\"\" — an empty alt, deliberately present — " +
      "which tells assistive technology to skip it. A missing attribute and an " +
      "empty one mean opposite things.",
    howToFix: [
      "Ask what the image is FOR. If removing it would lose information, describe that information. If removing it would lose nothing but atmosphere, use alt=\"\".",
      "Describe the content and function, not the appearance. For a link or button wrapped around an image, the alt should say where it goes or what it does.",
      "Do not begin with 'image of' or 'picture of'. The screen reader already announced that it is an image.",
      "Charts and diagrams need the DATA, not the shape. 'Bar chart of revenue' is useless; the trend or the figures are the content.",
      "Never leave the CMS filename in. 'IMG_4021-final-v2-USE-THIS.jpg' is worse than nothing, because it cannot be automatically detected as missing.",
    ],
    gotcha:
      "A scanner can only tell you the attribute exists. It cannot tell you the " +
      "alt is accurate, or that it describes the right thing. alt=\"image\" " +
      "passes every automated check and helps nobody — which is precisely why a " +
      "clean scan is not conformance.",
    platforms: {
      shopify:
        "Product images take alt text in the admin (Products → media → Add alt text), and most themes render it. Theme-level decorative images live in sections and often ship with no alt at all — those need alt=\"\" adding in the Liquid.",
      wordpress:
        "The Media Library has an Alt Text field, and it is not the Title, Caption or Description field beside it — those do not become alt. Bulk-check with the Media list view.",
      react:
        "ESLint's jsx-a11y/alt-text rule catches missing alt at build time, which is cheaper than catching it in a scan. Add it before you fix the backlog, or the backlog refills.",
    },
  },

  label: {
    whatItLooksLike:
      "A search box with a magnifying-glass icon and placeholder text but no " +
      "label. A newsletter signup that is just an input and a button. A " +
      "checkout field labelled only by the text sitting visually above it.",
    whyItMatters:
      "Without a programmatic label, a screen reader announces 'edit text, " +
      "blank'. The user knows there is a field and has no idea what belongs in " +
      "it. On a checkout form that is the end of the transaction. Labels also " +
      "make the hit area bigger for everyone, which matters on a phone.",
    theRule:
      "Every form control needs an accessible name, and it must be attached " +
      "programmatically — not merely positioned nearby. A <label for=\"id\">, a " +
      "wrapping <label>, aria-label, or aria-labelledby all work.",
    howToFix: [
      "Prefer a real, visible <label for=\"…\"> matching the input's id. It helps sighted users too, and it survives translation and reflow.",
      "A placeholder is NOT a label. It disappears the moment someone types, it fails contrast far more often than not, and it leaves users who paused mid-form with no way to recall what the field was.",
      "If the design genuinely has no room for a visible label, use aria-label on the input — but treat that as the compromise it is.",
      "For a group of radios or checkboxes, the group needs a name too: wrap it in a <fieldset> with a <legend>.",
      "Check that the label text matches what a voice-control user would say. 'Search' as visible text with aria-label='Site search field' means a voice user saying 'click search' may miss.",
    ],
    gotcha:
      "An input can have a label and still be unusable — if the label is wrong, " +
      "or if it labels the field next to it because the `for` and `id` drifted " +
      "apart during a refactor. Automated checks confirm a name exists, not that " +
      "it is the right one.",
    platforms: {
      wordpress:
        "Most form plugins (Contact Form 7, Gravity Forms, WPForms) emit labels correctly by default and then lose them when a theme hides labels with CSS for a 'cleaner' look. display:none removes it from the accessibility tree — use a visually-hidden class instead.",
      react:
        "Controlled inputs frequently get an id from a generator. Make sure the label's htmlFor uses the same generated id — useId() exists for exactly this.",
      shopify:
        "Theme search forms are the usual offender: an input with a placeholder and an icon button. Add a visually-hidden label in the section's Liquid.",
    },
  },

  "link-name": {
    whatItLooksLike:
      "An icon-only link — a cart, a social icon, a chevron. A link wrapped " +
      "around an image with no alt. A 'Read more' repeated fifteen times down a " +
      "blog index.",
    whyItMatters:
      "Screen reader users routinely navigate by pulling up a list of every " +
      "link on the page. If yours reads 'link, link, link, read more, read " +
      "more', that list is useless and the page has to be read linearly instead. " +
      "An empty link is announced as its own URL, which for a modern app URL is " +
      "unbearable.",
    theRule:
      "Every link needs discernible text. That can be its visible text, the alt " +
      "of an image inside it, or an aria-label.",
    howToFix: [
      "For icon-only links, add a visually-hidden span with real text, or aria-label on the anchor. The icon itself should then be aria-hidden=\"true\".",
      "Make the link text meaningful out of context, because that is how it will be read. 'Read more about the pricing change' beats 'Read more'.",
      "If an image is the whole link, the image's alt IS the link text — describe the destination, not the picture.",
      "Do not put the URL in as the label. A screen reader reading out a query string is worse than the empty link you started with.",
      "Watch out for links containing only whitespace or an empty element left behind by a template.",
    ],
    gotcha:
      "aria-label on a link overrides its visible text entirely for screen " +
      "reader users. If the two disagree, voice-control users who say what they " +
      "see will fail to activate it — and no scanner will tell you.",
    platforms: {
      shopify:
        "Header social icons and the cart link are the two that fail on nearly every theme. They are in header.liquid or an icon snippet.",
      react:
        "Icon component libraries often render an <svg> with no title inside an <a>. Wrap with aria-label on the anchor and aria-hidden on the icon.",
    },
  },

  "button-name": {
    whatItLooksLike:
      "A hamburger menu. A close X on a modal. A play button. Anything where " +
      "the entire visible content is an icon or an SVG.",
    whyItMatters:
      "Same as an empty link, with higher stakes: buttons usually do something " +
      "irreversible. A close button that announces as 'button' gives a screen " +
      "reader user no way to know whether pressing it dismisses a dialog or " +
      "deletes their basket.",
    theRule:
      "Every button needs an accessible name — visible text, aria-label, " +
      "aria-labelledby, or the alt of an image it contains.",
    howToFix: [
      "aria-label on the <button>, and aria-hidden=\"true\" on the icon inside it. Two attributes, and it is done.",
      "Name it after the ACTION, not the icon. 'Close dialog', not 'X'. 'Open menu', not 'hamburger'.",
      "If the button toggles, the name should not change with state — use aria-expanded or aria-pressed for the state. A name that flips between 'Open' and 'Close' is announced at the wrong moment.",
      "Elements with role=\"button\" need a name too, and they also need keyboard handling that a real <button> gives you free. Prefer the real element.",
    ],
    gotcha:
      "An icon font renders as a private-use character. Some screen readers " +
      "announce nothing, some announce a garbage glyph name. Automated tools " +
      "may see 'text content' and pass it.",
    platforms: {
      react:
        "eslint-plugin-jsx-a11y does not catch this reliably when the child is a component rather than an element, because it cannot see what the component renders. A scan in CI catches what the linter cannot.",
    },
  },

  "target-size": {
    whatItLooksLike:
      "A row of small social icons in a footer. A close X on a modal that is " +
      "16 pixels square. Pagination links sitting shoulder to shoulder. A " +
      "table with an edit and a delete icon two pixels apart. Almost always it " +
      "is an icon that looked balanced on a designer's 27-inch monitor and is " +
      "being tapped with a thumb.",
    whyItMatters:
      "A finger pad is about 10mm across — roughly 40 CSS pixels. Anything much " +
      "smaller is a guess, and a wrong guess next to a delete button is " +
      "destructive rather than merely annoying. It hits hardest for people with " +
      "tremor, limited dexterity, or anyone using a phone one-handed on a " +
      "moving train, which is to say most people some of the time.",
    theRule:
      "WCAG 2.5.8 Target Size (Minimum), level AA, new in WCAG 2.2. Pointer " +
      "targets must be at least 24 by 24 CSS pixels. There are real exceptions: " +
      "a target smaller than that passes if a 24px circle centred on it does " +
      "not overlap the circle of any other target — the SPACING exception — and " +
      "also if it is inline in a sentence, if the size is browser-determined, " +
      "or if an equivalent control of adequate size exists elsewhere on the page.",
    howToFix: [
      "Make the target 24x24 CSS pixels. This is usually padding, not a bigger icon — the icon can stay 16px inside a 24px hit area, so nothing about the design has to change visually.",
      "If you cannot grow it, buy the spacing exception instead: leave at least 24px between the CENTRES of adjacent targets. Two 20px buttons 28px apart pass; the same two buttons touching do not.",
      "Do not use `transform: scale()` to enlarge a target. The hit area comes from layout, and a scaled element keeps the box it started with.",
      "Watch inline links in prose — those are exempt, so do not add padding that breaks your line height chasing a failure that is not one.",
      "Check it at mobile widths as well as desktop. A nav that passes at 1280px often collapses into a tight icon row at 375px, and the scanner will only tell you about the viewport it rendered.",
    ],
    gotcha:
      "This is the criterion most likely to be MISSED entirely rather than " +
      "failed loudly, because it arrived in WCAG 2.2 and most audits still " +
      "target 2.1. Our own scan of large organisations — several of whom sell " +
      "accessibility services — found it failing on a meaningful share. It is also " +
      "the one a scanner judges only at the viewport it happened to render.",
    platforms: {
      shopify:
        "Theme header icon rows — search, account, cart — are the usual failure, and they are in header.liquid or an icon snippet rather than in the theme editor. Add padding to the anchor, not width to the SVG, or you will scale the glyph as well as the target.",
      wordpress:
        "Block themes set button padding in theme.json under styles.elements.button. Social-icon blocks are the common offender and take their size from a block-level setting rather than from your CSS.",
      tailwind:
        "`p-1` on a 16px icon gives a 24px box and clears the rule; `p-0.5` gives 20px and does not. For icon buttons the reliable pattern is a fixed `size-6` (24px) flex container with the icon centred inside, rather than padding that changes with the icon.",
      react:
        "Icon-button components usually take a `size` prop that sets the ICON, not the hit area. Check what the rendered element measures, not what the prop says — a `size=\"sm\"` icon button is frequently a 20px target.",
      wix: "Wix elements are absolutely positioned, so targets can end up overlapping their neighbours' 24px zones even when each is individually large enough. Check spacing in the editor at mobile breakpoint, which Wix lays out separately.",
    },
  },

  "html-has-lang": {
    whatItLooksLike:
      "<html> with no lang attribute. It is invisible, it breaks nothing " +
      "visually, and it is one attribute.",
    whyItMatters:
      "A screen reader picks its pronunciation rules from the document " +
      "language. Without it, the reader uses the user's default voice — so an " +
      "English page read by someone whose system is set to Spanish is " +
      "pronounced with Spanish phonetics and is close to incomprehensible. It " +
      "also drives hyphenation, quotation marks and translation offers.",
    theRule:
      "The <html> element needs a valid lang attribute, and any passage in a " +
      "different language needs its own lang on a wrapping element.",
    howToFix: [
      "Add lang=\"en\" (or your actual language) to <html>. This is the single cheapest accessibility fix that exists.",
      "Use a valid BCP 47 tag. 'en', 'en-GB', 'fr' are fine; 'english' and 'EN_gb' are not.",
      "Set it from the content's real language, not the site's default, if you serve more than one.",
      "Mark inline foreign-language passages with their own lang so they are pronounced correctly.",
    ],
    gotcha:
      "A valid lang that is WRONG is worse than a missing one, because nothing " +
      "will flag it. A German page declaring lang=\"en\" reads as gibberish and " +
      "passes every automated check.",
    platforms: {
      wordpress:
        "language_attributes() in header.php emits it from Settings → General → Site Language. If it is missing, the theme has hardcoded <html> instead of calling it.",
      react:
        "In Next.js this is the lang prop on <html> in your root layout — easy to miss because the file is generated once and never revisited.",
    },
  },
}

export const guideFor = (id) => GUIDES[id] || null
