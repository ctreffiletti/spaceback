/*
 * Content library for Spaceback's quote/stat card generator.
 * Add your own items anywhere in these arrays — every field is plain data,
 * no code changes needed elsewhere.
 *
 * type: "quote" -> rendered with an attribution line ("~ NAME")
 *       "fact"  -> rendered with a small source line instead of attribution
 *
 * highlight: a string, or array of strings, that must appear verbatim
 *            (case-insensitive) inside `text`. Those words are drawn in
 *            the accent color; everything else uses the base text color.
 *
 * verify: true means the stat/attribution is the commonly-cited figure
 *         online (usually via a secondary marketing blog aggregating a
 *         survey) but was not traced back to a primary report by me.
 *         Double-check the primary source before using anything flagged
 *         verify:true in anything with real stakes (a client deck, a paid
 *         placement, etc.) — secondary ad-tech blogs reword and round
 *         survey numbers a lot.
 */
const CONTENT_LIBRARY = {

  themes: [
    { id: "facts", label: "Facts & Stats" },
    { id: "creative-performance", label: "Creative Is The New Targeting" },
    { id: "ai-creative", label: "AI for Creative Production" },
    { id: "creative-fatigue", label: "Why More Creative Wins" },
    { id: "format-innovation", label: "Social-Native Ad Formats" },
    { id: "brand", label: "Spaceback Originals" },
  ],

  items: [
    // ---------------- Facts & Stats: creative vs. targeting ----------------
    {
      id: "f-01", type: "fact", theme: "facts",
      text: "Creative quality and messaging drive 49% of a brand's sales lift from advertising, more than targeting, reach, and media buying combined.",
      highlight: "49%",
      source: "Nielsen Catalina Solutions, \"Five Keys to Advertising Effectiveness\"",
      sourceUrl: "https://info.ncsolutions.com/hubfs/2023%20Five%20Keys%20to%20Advertising%20Effectiveness/NCS_Five_Keys_to_Advertising_Effectiveness_E-Book_08-23.pdf",
    },
    {
      id: "f-02", type: "fact", theme: "facts",
      text: "For digital campaigns specifically, creative drives 56% of sales lift, compared to just 30% from media factors like targeting and reach.",
      highlight: ["56%", "30%"],
      source: "Nielsen Catalina Solutions",
      sourceUrl: "https://info.ncsolutions.com/hubfs/2023%20Five%20Keys%20to%20Advertising%20Effectiveness/NCS_Five_Keys_to_Advertising_Effectiveness_E-Book_08-23.pdf",
    },
    {
      id: "f-03", type: "fact", theme: "facts",
      text: "High-quality creative delivers up to 4.7x higher ROI than average creative.",
      highlight: "4.7x higher ROI",
      source: "WARC & Kantar, \"Top-quality creative quadruples your profit\"",
      sourceUrl: "https://www.warc.com/content/feed/top-quality-creative-quadruples-your-profit/en-GB/7840",
    },
    {
      id: "f-04", type: "fact", theme: "facts",
      text: "In 2006, creative accounted for 65% of advertising's sales lift. Media's influence has since doubled, and creative still outweighs it at 49%.",
      highlight: ["65%", "49%"],
      source: "Nielsen Catalina Solutions (trend data)",
      sourceUrl: "https://www.marketingcharts.com/advertising-trends-80662",
    },

    // ---------------- Creative Is The New Targeting (verified quotes) ----------------
    {
      id: "q-01", type: "quote", theme: "creative-performance",
      text: "If it doesn't sell, it isn't creative.",
      author: "David Ogilvy", highlight: "it isn't creative",
    },
    {
      id: "q-02", type: "quote", theme: "creative-performance",
      text: "Nobody counts the number of ads you run; they just remember the impression you make.",
      author: "Bill Bernbach", highlight: "the impression you make",
    },
    {
      id: "q-03", type: "quote", theme: "creative-performance",
      text: "It took a nation to put a man on the moon, but it takes only one man to create a great ad.",
      author: "Bill Bernbach", highlight: "create a great ad",
    },
    {
      id: "q-04", type: "quote", theme: "creative-performance",
      text: "An idea can turn to dust or magic, depending on the talent that rubs against it.",
      author: "Bill Bernbach", highlight: "dust or magic",
    },
    {
      id: "q-05", type: "quote", theme: "creative-performance",
      text: "In the modern world of business, it is useless to be a creative, original thinker unless you can also sell what you create.",
      author: "David Ogilvy", highlight: "sell what you create",
    },
    {
      id: "q-06", type: "quote", theme: "creative-performance",
      text: "Make it simple. Make it memorable. Make it inviting to look at. Make it fun to read.",
      author: "Leo Burnett", highlight: "Make it memorable",
    },

    // ---------------- Facts & Stats: AI for creative production ----------------
    {
      id: "f-05", type: "fact", theme: "facts",
      text: "43% of enterprise marketing teams now use AI to generate at least some of their ad creative, up from just 8% two years earlier.",
      highlight: ["43%", "8%"], verify: true,
      source: "Industry survey, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://www.zocket.com/blog/state-of-ai-ad-creation",
    },
    {
      id: "f-06", type: "fact", theme: "facts",
      text: "58% of marketers are using generative AI for content production.",
      highlight: "58%",
      source: "Gartner survey (October), as reported by eMarketer",
      sourceUrl: "https://www.emarketer.com/content/ai-coming-your-creative-team-first--marketers-say",
    },
    {
      id: "f-07", type: "fact", theme: "facts",
      text: "86% of advertising buyers are using or plan to use generative AI to build video ad creative.",
      highlight: "86%", verify: true,
      source: "Industry survey, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://lumalabs.ai/news/ai-powered-advertising-campaign-statistics",
    },
    {
      id: "f-08", type: "fact", theme: "facts",
      text: "Marketers using generative AI for creative report saving 5+ hours a week, with AI-assisted production cutting time-to-launch by about 30%.",
      highlight: ["5+ hours a week", "30%"], verify: true,
      source: "Industry survey, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://www.digitalapplied.com/blog/ai-marketing-statistics-2026-adoption-data-points",
    },
    {
      id: "b-01", type: "quote", theme: "ai-creative",
      text: "AI doesn't replace creative judgment. It multiplies how many ideas you can test before you commit a media budget to one.",
      author: "Spaceback", highlight: "multiplies how many ideas",
    },

    // ---------------- Facts & Stats: creative fatigue ----------------
    {
      id: "f-09", type: "fact", theme: "facts",
      text: "Top-performing ads lose roughly 38% of their effectiveness after just 5 weeks running unchanged.",
      highlight: "38%", verify: true,
      source: "Ad-tech industry analysis, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://www.darkroomagency.com/observatory/creative-fatigue-performance-testing-framework",
    },
    {
      id: "f-10", type: "fact", theme: "facts",
      text: "When creative fatigue goes unaddressed, average cost-per-acquisition can rise as much as 40% within two weeks.",
      highlight: "40%", verify: true,
      source: "Ad-tech industry analysis, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://www.darkroomagency.com/observatory/creative-fatigue-performance-testing-framework",
    },
    {
      id: "f-11", type: "fact", theme: "facts",
      text: "A steady cadence of 3 to 5 new creative variations a week can extend an ad's effective lifespan from 10-14 days to 21-30 days.",
      highlight: ["3 to 5 new creative variations", "21-30 days"], verify: true,
      source: "Ad-tech industry analysis, widely cited (verify primary source before client-facing use)",
      sourceUrl: "https://www.darkroomagency.com/observatory/creative-fatigue-performance-testing-framework",
    },
    {
      id: "b-02", type: "quote", theme: "creative-fatigue",
      text: "The algorithm doesn't get tired of your audience. Your creative does.",
      author: "Spaceback", highlight: "Your creative does",
    },
    {
      id: "b-03", type: "quote", theme: "creative-fatigue",
      text: "More targeting can't fix an ad nobody wants to look at twice.",
      author: "Spaceback", highlight: "look at twice",
    },

    // ---------------- Social-Native Ad Formats ----------------
    {
      id: "b-04", type: "quote", theme: "format-innovation",
      text: "The best-performing ad on the web is rarely the one built for display. It's the one built for a feed, repurposed with intent.",
      author: "Spaceback", highlight: "repurposed with intent",
    },
    {
      id: "b-05", type: "quote", theme: "format-innovation",
      text: "Interactive doesn't mean more creative work. It means the same creative, working harder.",
      author: "Spaceback", highlight: "working harder",
    },
    {
      id: "b-06", type: "quote", theme: "format-innovation",
      text: "People already trust the look of a social post. Display advertising spent twenty years training them to distrust everything else.",
      author: "Spaceback", highlight: "trust the look of a social post",
    },

    // ---------------- Editable placeholders ----------------
    {
      id: "brand-01", type: "quote", theme: "brand",
      text: "Type a client quote, a stat from your own research, or your own line here.",
      author: "Edit me in the app", highlight: "",
    },
  ],
};

// Usable both as a browser <script> (app.js reads window.CONTENT_LIBRARY)
// and as a Node module (scripts/generate-batch.js does require(...)).
if (typeof window !== "undefined") window.CONTENT_LIBRARY = CONTENT_LIBRARY;
if (typeof module !== "undefined" && module.exports) module.exports = CONTENT_LIBRARY;
