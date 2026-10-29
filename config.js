/**
 * ============================================================================
 * CONFIG.JS — FULL PERSONALISATION & CONTENT SYSTEM
 * ============================================================================
 * Edit this file to customise every name, date, passcode, photo, video, song,
 * letter paragraph, quiz question, character style, and theme token.
 * No coding experience required! You can also edit everything live in the
 * browser using the Gear (Edit Mode) icon after unlocking.
 *
 * SECURITY NOTE:
 * Only the SHA-256 hash of your passcode is stored here — never plain text.
 * Default passcode for preview/testing: "0214" (Valentine's Day: Feb 14)
 * ============================================================================
 */
window.LOVE_CONFIG = {
  names: {
    from: "Aman",
    to: "Bella",
    initials: "A ♥ B",
    petName: "My Cutie"
  },

  // Relationship & special dates (ISO YYYY-MM-DDTHH:mm:ss)
  relationshipStartDate: "2022-02-14T19:30:00",
  birthdayDate: "10-29",
  specialDateISO: "2022-02-14",

  // Passcode security (4 to 6 digits supported)
  passcodeLength: 4,
  // SHA-256 hash of "0214"
  passcodeHash: "025ac3ddef52e0aaa62896954c6fe57948a7c144cb203610499a912b832fd473",
  hints: {
    first: "Hint: our special date — Month & Day (try 1234)",
    second: "Friendly 2nd hint: Special Day in 4 digits → 1 2 3 4 ✨"
  },

  // Scene 3: Heart of Words vocabulary
  heartWords: [
    "love", "forever", "you", "always", "home", "together",
    "soulmate", "warmth", "starlight", "endless", "darling", "magic",
    "heartbeat", "us", "cherish", "destiny", "haven", "serendipity",
    "laughter", "kindness", "moonlight", "promise", "eternity", "adore"
  ],

  // Scene 4: Date Quiz & Verification
  quiz: {
    title: "Do You Remember Our Beginning?",
    subtitle: "Pick the exact date our story officially began…",
    acceptedDates: ["2022-02-14", "2026-10-29"],
    cartoonCaption: "Us on day one — nervous smiles & warm coffee",
    cartoonSvgType: "couple-cameo",
    customCartoonSrc: "",
    wrongMessages: [
      "Hmm, not quite that day! Hint: Valentine’s Day 2022 💌",
      "Close, my love! Try February 14, 2022 ✨",
      "Playful penalty: you owe me one forehead kiss! (Try 2022-02-14)"
    ],
    successMessage: "You remembered! Every second since February 14, 2022 has been pure magic."
  },

  // All editorial texts, hero copy, wish & love letter
  texts: {
    heroEyebrow: "AN INTERACTIVE FILM FOR ELENA",
    heroTitle: "Every Universe Leads Back to You",
    heroSubtitle: "Thirteen chapters of our little moments, midnight rooftops, and the garden we grew together.",
    mysteryPrompt: "Three secret keepsakes await. Choose a box to unseal — or open all three.",
    runawayQuestion: "Before we go further… will you let me spoil you today, tomorrow, and for the next hundred years?",
    gardenTitle: "A Living Garden for You",
    gardenSubtitle: "Tap the soil to plant blooms, long-press for a bouquet, or brush the petals in the wind.",
    memorySpaceTitle: "Little Moments & Our Clothesline",
    memorySpaceSubtitle: "Floating 3D keepsakes, taped scrapbook memories, and polaroids swaying in the evening breeze.",
    rooftopTitle: "Midnight Rooftop Sketch",
    rooftopSubtitle: "Drawn in single-line ink under an OLED sky — where city noise fades and only starlight remains.",
    clockTitle: "Every Second Since We Met",
    clockSubtitle: "Time measured not in hours, but in shared coffee cups, quiet walks, and late-night laughter.",
    cakeTitle: "Make a Birthday Wish",
    cakeSubtitle: "Tap the candles to light them, then blow gently into your microphone (or tap Blow Out) to release your wish.",
    wishText: "Happy Birthday, Elena! May every dream you whisper tonight bloom brighter than the stars above.",
    letterTitle: "My Dearest Elena,",
    letterParagraphs: [
      "If someone had told me years ago that a single conversation under string lights would redefine my entire sense of home, I would have smiled and called them a romantic dreamer. Yet here we are — building a thousand quiet memories that outshine every movie ever filmed.",
      "I love the way your eyes crinkle when you try not to laugh at my terrible jokes, the calm you bring to stormy afternoons, and the effortless grace with which you turn ordinary Tuesdays into chapters worth keeping forever.",
      "Whether we are sitting on a midnight rooftop watching shooting stars, getting caught under a single umbrella in the pouring rain, or growing our own little garden of dreams, my favourite place in this world will always be right beside you."
    ],
    letterClosing: "Forever and a day,",
    signature: "Julian ♥",
    finaleHeadline: "There’s more where that came from",
    finaleSubtext: "To be continued… in every sunrise we haven’t watched yet."
  },

  // Photos used across Memory Wall, Polaroid Clothesline, Mystery Boxes & Letter
  photos: [
    {
      id: "photo-1",
      src: "",
      svgPreset: "rooftop-coffee",
      title: "Golden Hour on the Terrace",
      caption: "Two espresso cups & the skyline turning rose-gold",
      date: "Feb 14, 2022",
      story: "Our very first anniversary evening. The wind was chilly, your hands were warm around your mug, and we talked until the café lights flickered off.",
      tilt: "tilt-left",
      size: "wide",
      nextScene: 6
    },
    {
      id: "photo-2",
      src: "",
      svgPreset: "rainy-umbrella",
      title: "Caught in the April Downpour",
      caption: "One tiny umbrella, four soaked sneakers",
      date: "Apr 22, 2022",
      story: "We could have run for the metro, but instead we stood laughing under the awning while raindrops made little ripples around our feet.",
      tilt: "tilt-right",
      size: "tall",
      nextScene: 7
    },
    {
      id: "photo-3",
      src: "",
      svgPreset: "sunflower-field",
      title: "Sunday at the Botanical Meadow",
      caption: "You tucked a wildflower behind my ear",
      date: "Jul 09, 2023",
      story: "Golden fields stretching to the horizon. A honeybee landed right on your sleeve and you stayed statue-still so you wouldn't startle it.",
      tilt: "straight",
      size: "square",
      nextScene: 9
    },
    {
      id: "photo-4",
      src: "",
      svgPreset: "midnight-stargaze",
      title: "Perseids Meteor Shower",
      caption: "Three shooting stars & one unspoken wish",
      date: "Aug 12, 2023",
      story: "Blankets on the hood of the car at 2:00 AM. Every time a meteor streaked past, I didn't look at the sky — I looked at you.",
      tilt: "tilt-left",
      size: "square",
      nextScene: 10
    },
    {
      id: "photo-5",
      src: "",
      svgPreset: "autumn-lanterns",
      title: "Lantern Festival by the River",
      caption: "Paper lights drifting into the reflection",
      date: "Nov 04, 2024",
      story: "Hundreds of warm amber lanterns rising over the water. We wrote our initials on the ribbon and watched it climb toward Orion.",
      tilt: "tilt-right",
      size: "wide",
      nextScene: 11
    },
    {
      id: "photo-6",
      src: "",
      svgPreset: "birthday-sparkler",
      title: "Midnight Sparklers & Cake",
      caption: "Frosting on the tip of your nose ✨",
      date: "Oct 29, 2025",
      story: "Countdown to midnight with sparklers fizzing in the dark and a wish that still makes my heart race.",
      tilt: "straight",
      size: "tall",
      nextScene: 12
    }
  ],

  // Videos (supports MP4/WebM URL, uploaded data URI, YouTube/Vimeo embed, or procedural cinema reel)
  videos: [
    {
      id: "video-1",
      src: "",
      youtubeUrl: "",
      reelPreset: "starlight-reel",
      poster: "",
      title: "Super-8 Film Reel: Our First Roadtrip",
      caption: "Coastal highway at sunset — windows down, favourite song on repeat",
      date: "Aug 2023",
      nextScene: 8
    },
    {
      id: "video-2",
      src: "",
      youtubeUrl: "",
      reelPreset: "rain-waltz",
      poster: "",
      title: "Slow Dancing in the Kitchen",
      caption: "2:00 AM pancakes & spinning on the checkerboard floor",
      date: "Dec 2024",
      nextScene: 12
    }
  ],

  // Music playlist (synthesised polyphonic romantic arrangements + external MP3/audio support)
  music: [
    {
      id: "track-1",
      title: "Midnight on the Rooftop (Music Box & Piano)",
      artist: "Julian & Elena Ensemble",
      src: "",
      coverPreset: "vinyl-midnight",
      tempo: 88,
      notes: [261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 440.00, 349.23, 440.00, 523.25, 659.25, 587.33, 493.88, 392.00, 523.25]
    },
    {
      id: "track-2",
      title: "Wildflowers in Golden Hour",
      artist: "Meadow Strings Quartet",
      src: "",
      coverPreset: "vinyl-garden",
      tempo: 96,
      notes: [293.66, 369.99, 440.00, 587.33, 554.37, 440.00, 369.99, 493.88, 392.00, 493.88, 587.33, 739.99, 659.25, 554.37, 440.00, 587.33]
    },
    {
      id: "track-3",
      title: "Paper Lanterns & Starlight Waltz",
      artist: "Celesta Nocturne",
      src: "",
      coverPreset: "vinyl-rose",
      tempo: 82,
      notes: [349.23, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 587.33, 466.16, 587.33, 698.46, 880.00, 783.99, 659.25, 523.25, 698.46]
    }
  ],

  // Theme & Visual Tokens
  theme: {
    mode: "midnight", // "midnight" or "paper"
    colors: {
      midnightNavy: "#040711",
      warmCream: "#f8edd9",
      gold: "#f0be72",
      rose: "#ff8aa1"
    },
    particleType: "hearts-sparkles",
    flowerTypes: ["rose", "tulip", "sunflower", "lotus", "daisy", "wildflower"],
    shape3DType: "all", // "hearts", "orbs", "rings", "all"
    transitionStyle: "heart-wipe" // "heart-wipe", "petal-wipe", "circular-reveal", "cross-fade"
  },

  // Character Settings for Scene 6 (Boy & Girl Outline Story)
  characters: {
    boyName: "Julian",
    girlName: "Elena",
    boyColor: "#9cc4ff",
    girlColor: "#ff8aa1",
    boyHair: "tousled",   // "tousled", "curly", "classic"
    girlHair: "waves",    // "waves", "bun", "bob"
    customArtworkSrc: ""  // Optional uploaded image/GIF override
  }
};
