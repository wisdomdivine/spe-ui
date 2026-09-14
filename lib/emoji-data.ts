export interface EmojiPuzzle {
  id: number;
  emojis: string;
  answer: string;
  category: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  /** Alternate acceptable answers */
  alternates?: string[];
}

export const CATEGORIES = [
  "Petroleum & Energy",
  "Nigerian Culture",
  "Movies",
  "TV Shows",
  "Songs",
  "Countries",
  "Foods",
  "Phrases",
  "Sports",
  "Animals",
  "Books",
  "Occupations",
  "Landmarks",
  "Science & Tech",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Emoji Decode puzzle bank — 360+ hand-crafted puzzles with petroleum & Nigerian culture depth */
export const EMOJI_PUZZLES: EmojiPuzzle[] = [
  // ── Petroleum & Energy (SPE UI Chapter Special) ──────────────────────────
  { id: 1001, emojis: "🛢️🌊🏭", answer: "Offshore Drilling", category: "Petroleum & Energy", difficulty: "medium", alternates: ["offshore rig", "offshore platform"] },
  { id: 1002, emojis: "🪨🔬🧪", answer: "Petrophysics", category: "Petroleum & Energy", difficulty: "hard" },
  { id: 1003, emojis: "🕳️⚙️💧", answer: "Hydraulic Fracturing", category: "Petroleum & Energy", difficulty: "hard", alternates: ["fracking", "hydrofracking"] },
  { id: 1004, emojis: "⛽🚗💰", answer: "Fuel Subsidy", category: "Petroleum & Energy", difficulty: "easy", alternates: ["petrol subsidy", "fuel price"] },
  { id: 1005, emojis: "🛢️📉💥", answer: "Oil Price Crash", category: "Petroleum & Energy", difficulty: "medium", alternates: ["oil crash", "crude crash"] },
  { id: 1006, emojis: "🚢🛢️🌍", answer: "Crude Oil Tanker", category: "Petroleum & Energy", difficulty: "medium", alternates: ["oil tanker", "supertanker", "vlcc"] },
  { id: 1007, emojis: "⚡🌿☀️", answer: "Renewable Energy", category: "Petroleum & Energy", difficulty: "easy", alternates: ["clean energy", "green energy"] },
  { id: 1008, emojis: "🌋🧪🔥", answer: "Geothermal Energy", category: "Petroleum & Energy", difficulty: "hard" },
  { id: 1009, emojis: "📊🛢️📉", answer: "OPEC Quota", category: "Petroleum & Energy", difficulty: "hard", alternates: ["opec", "opec cut"] },
  { id: 1010, emojis: "🛢️⛽🪨", answer: "Reservoir Engineering", category: "Petroleum & Energy", difficulty: "hard", alternates: ["oil reservoir"] },
  { id: 1011, emojis: "🔥🏭💨", answer: "Gas Flaring", category: "Petroleum & Energy", difficulty: "medium", alternates: ["gas flare", "natural gas flare"] },
  { id: 1012, emojis: "👷‍♂️🦺🛢️", answer: "Roughneck", category: "Petroleum & Energy", difficulty: "hard", alternates: ["rig worker", "roustabout", "driller"] },
  { id: 1013, emojis: "🛢️🛢️💰", answer: "Barrel of Oil", category: "Petroleum & Energy", difficulty: "easy", alternates: ["oil barrel", "bbl"] },
  { id: 1014, emojis: "⚙️🕳️📉", answer: "Drilling Mud", category: "Petroleum & Energy", difficulty: "hard", alternates: ["drilling fluid"] },
  { id: 1015, emojis: "🏗️🛢️🌊", answer: "Jackup Rig", category: "Petroleum & Energy", difficulty: "expert", alternates: ["jack up rig", "oil platform"] },
  { id: 1016, emojis: "🧪🛢️🧼", answer: "Enhanced Oil Recovery", category: "Petroleum & Energy", difficulty: "expert", alternates: ["eor", "chemical flooding"] },
  { id: 1017, emojis: "🪨🕳️💧", answer: "Porosity and Permeability", category: "Petroleum & Energy", difficulty: "expert", alternates: ["porosity", "permeability"] },
  { id: 1018, emojis: "📈🛢️⚡", answer: "Energy Transition", category: "Petroleum & Energy", difficulty: "medium", alternates: ["energy transition"] },
  { id: 1019, emojis: "🛢️🔬📈", answer: "PVT Analysis", category: "Petroleum & Energy", difficulty: "expert", alternates: ["pvt"] },
  { id: 1020, emojis: "🛑💥🛢️", answer: "Blowout Preventer", category: "Petroleum & Energy", difficulty: "expert", alternates: ["bop", "blowout"] },

  // ── Nigerian Culture & Slang ────────────────────────────
  { id: 1, emojis: "🏃‍♂️💨✈️", answer: "Japa", category: "Nigerian Culture", difficulty: "easy", alternates: ["japa syndrome", "relocation"] },
  { id: 2, emojis: "⚡❌🕯️", answer: "NEPA", category: "Nigerian Culture", difficulty: "easy", alternates: ["phcn", "no light", "up nepa", "power outage"] },
  { id: 3, emojis: "🚌🟡💨", answer: "Danfo", category: "Nigerian Culture", difficulty: "easy", alternates: ["yellow bus", "molue"] },
  { id: 4, emojis: "🎉🥳🌙", answer: "Owambe", category: "Nigerian Culture", difficulty: "easy", alternates: ["party", "aso ebi party"] },
  { id: 5, emojis: "👮‍♂️💸🛑", answer: "Checkpoint", category: "Nigerian Culture", difficulty: "medium", alternates: ["police checkpoint", "roger"] },
  { id: 6, emojis: "🍽️🌶️🥩", answer: "Asun", category: "Nigerian Culture", difficulty: "medium", alternates: ["goat meat", "peppered goat"] },
  { id: 7, emojis: "🎶🎺🥁", answer: "Fela Kuti", category: "Nigerian Culture", difficulty: "medium", alternates: ["fela", "afrobeat pioneer"] },
  { id: 8, emojis: "🔌⚡🚫", answer: "National Grid", category: "Nigerian Culture", difficulty: "medium", alternates: ["grid collapse", "national grid collapse"] },
  { id: 9, emojis: "🍚🍲🎉", answer: "Party Jollof", category: "Nigerian Culture", difficulty: "easy", alternates: ["jollof rice", "party rice"] },
  { id: 10, emojis: "🛵💨📦", answer: "Dispatch Rider", category: "Nigerian Culture", difficulty: "medium", alternates: ["delivery guy", "okada delivery"] },
  { id: 11, emojis: "🏢💰💻", answer: "Yahoo Yahoo", category: "Nigerian Culture", difficulty: "medium", alternates: ["yahoo boy", "yahoo"] },
  { id: 12, emojis: "🏊‍♂️🏝️🏖️", answer: "Tarkwa Bay", category: "Nigerian Culture", difficulty: "hard", alternates: ["tarkwa bay beach"] },
  { id: 13, emojis: "🎤👑🦍", answer: "Burna Boy", category: "Nigerian Culture", difficulty: "easy", alternates: ["african giant", "burna"] },
  { id: 14, emojis: "🦅0️⃣0️⃣1️⃣", answer: "Davido", category: "Nigerian Culture", difficulty: "easy", alternates: ["001", "obon", "o.b.o", "obo"] },
  { id: 15, emojis: "🌟🦅🌍", answer: "Wizkid", category: "Nigerian Culture", difficulty: "easy", alternates: ["machala", "starboy", "wizzy"] },
  { id: 16, emojis: "🍛🏪🔥", answer: "Mama Put", category: "Nigerian Culture", difficulty: "easy", alternates: ["buka", "bukateria", "local canteen"] },
  { id: 17, emojis: "📚😰✏️", answer: "JAMB", category: "Nigerian Culture", difficulty: "easy", alternates: ["utme", "jamb exam"] },
  { id: 18, emojis: "💰📱❌", answer: "Transfer Failed", category: "Nigerian Culture", difficulty: "medium", alternates: ["failed transfer", "network error"] },
  { id: 19, emojis: "🎓🎉🎊", answer: "Convocation", category: "Nigerian Culture", difficulty: "easy", alternates: ["graduation", "final year"] },
  { id: 20, emojis: "👔🤵💃", answer: "Aso Ebi", category: "Nigerian Culture", difficulty: "easy", alternates: ["aso-ebi", "uniform cloth"] },
  { id: 21, emojis: "🍞🫘", answer: "Agege Bread and Beans", category: "Nigerian Culture", difficulty: "medium", alternates: ["bread and ewa", "ewa aganyin and bread"] },
  { id: 22, emojis: "💼🎓⏳", answer: "NYSC", category: "Nigerian Culture", difficulty: "easy", alternates: ["corps member", "kopa", "national service"] },
  { id: 23, emojis: "🍲🌶️🫘", answer: "Ewa Aganyin", category: "Nigerian Culture", difficulty: "medium", alternates: ["ewa agoyin", "aganyin beans"] },
  { id: 24, emojis: "🍌🔥🥘", answer: "Dodo", category: "Nigerian Culture", difficulty: "easy", alternates: ["fried plantain", "plantain"] },
  { id: 25, emojis: "🚦🚗😤", answer: "Lagos Traffic", category: "Nigerian Culture", difficulty: "easy", alternates: ["third mainland traffic", "go slow"] },

  // ── Movies ──────────────────────────────────────────────
  { id: 101, emojis: "💊🔴🔵🕶️", answer: "The Matrix", category: "Movies", difficulty: "medium", alternates: ["matrix"] },
  { id: 102, emojis: "⏰🔄🔁🏝️", answer: "Groundhog Day", category: "Movies", difficulty: "hard" },
  { id: 103, emojis: "🚢🧊🎻💔", answer: "Titanic", category: "Movies", difficulty: "easy" },
  { id: 104, emojis: "🪐⏳🧑‍🚀🌽", answer: "Interstellar", category: "Movies", difficulty: "medium" },
  { id: 105, emojis: "🌀💭⏳💤", answer: "Inception", category: "Movies", difficulty: "medium" },
  { id: 106, emojis: "🦖🌴🚙🌋", answer: "Jurassic Park", category: "Movies", difficulty: "easy", alternates: ["jurassic world"] },
  { id: 107, emojis: "🧙‍♂️🧝‍♂️🏹💍", answer: "The Lord of the Rings", category: "Movies", difficulty: "medium", alternates: ["lord of the rings", "lotr", "fellowship of the ring"] },
  { id: 108, emojis: "🪞😈📱💀", answer: "Black Mirror", category: "TV Shows", difficulty: "medium" },
  { id: 109, emojis: "🤡🎈🌧️⛵", answer: "It", category: "Movies", difficulty: "easy", alternates: ["pennywise", "it chapter one"] },
  { id: 110, emojis: "🍫🏭🎩🎫", answer: "Charlie and the Chocolate Factory", category: "Movies", difficulty: "medium", alternates: ["willy wonka", "willy wonka and the chocolate factory"] },
  { id: 111, emojis: "🕷️🕸️🧑🔴", answer: "Spider-Man", category: "Movies", difficulty: "easy", alternates: ["spiderman", "spider man"] },
  { id: 112, emojis: "🦇🃏🌃💥", answer: "The Dark Knight", category: "Movies", difficulty: "easy", alternates: ["dark knight", "batman"] },
  { id: 113, emojis: "🦸‍♂️🛡️⭐🇺🇸", answer: "Captain America", category: "Movies", difficulty: "easy", alternates: ["first avenger"] },
  { id: 114, emojis: "⚡🔨⚡👑", answer: "Thor", category: "Movies", difficulty: "easy", alternates: ["thor ragnarok"] },
  { id: 115, emojis: "🦹‍♂️🧤💎🪐", answer: "Avengers Infinity War", category: "Movies", difficulty: "medium", alternates: ["infinity war", "avengers", "endgame"] },
  { id: 116, emojis: "🥊🥩🏆🇺🇸", answer: "Rocky", category: "Movies", difficulty: "medium", alternates: ["rocky balboa", "creed"] },
  { id: 117, emojis: "👻🚫🔫🚗", answer: "Ghostbusters", category: "Movies", difficulty: "medium" },
  { id: 118, emojis: "🛸🚴🌕🚲", answer: "E.T.", category: "Movies", difficulty: "medium", alternates: ["et", "extra terrestrial"] },
  { id: 119, emojis: "🏎️⚡💨🏁", answer: "Fast and Furious", category: "Movies", difficulty: "easy", alternates: ["fast & furious", "the fast and the furious"] },
  { id: 120, emojis: "🥋🐍🥋🏆", answer: "Cobra Kai", category: "TV Shows", difficulty: "medium", alternates: ["karate kid"] },
  { id: 121, emojis: "🎈🏠👴👦", answer: "Up", category: "Movies", difficulty: "easy" },
  { id: 122, emojis: "🧛‍♂️🩸🌙💔", answer: "Twilight", category: "Movies", difficulty: "easy" },
  { id: 123, emojis: "🔪🚿😱", answer: "Psycho", category: "Movies", difficulty: "medium" },
  { id: 124, emojis: "🚗⏱️⚡88", answer: "Back to the Future", category: "Movies", difficulty: "medium", alternates: ["back to future"] },
  { id: 125, emojis: "🦸‍♂️👨‍👩‍👧‍👦🦸‍♀️", answer: "The Incredibles", category: "Movies", difficulty: "easy", alternates: ["incredibles"] },
  { id: 126, emojis: "🏃‍♂️🍫🌲🪶", answer: "Forrest Gump", category: "Movies", difficulty: "medium" },
  { id: 127, emojis: "🎃🎄👻🎅", answer: "The Nightmare Before Christmas", category: "Movies", difficulty: "hard", alternates: ["nightmare before christmas"] },
  { id: 128, emojis: "🤖❤️👦🎈", answer: "Big Hero 6", category: "Movies", difficulty: "medium", alternates: ["big hero six", "baymax"] },
  { id: 129, emojis: "🧞‍♀️🌊💙", answer: "Moana", category: "Movies", difficulty: "easy" },
  { id: 130, emojis: "🎸🤘🏫🎤", answer: "School of Rock", category: "Movies", difficulty: "medium" },
  { id: 131, emojis: "👽🛸🌍💥", answer: "Independence Day", category: "Movies", difficulty: "medium" },
  { id: 132, emojis: "🐀🎻🧀🇫🇷", answer: "Ratatouille", category: "Movies", difficulty: "medium" },
  { id: 133, emojis: "🧙‍♀️👠🐕🌪️", answer: "The Wizard of Oz", category: "Movies", difficulty: "medium", alternates: ["wizard of oz"] },
  { id: 134, emojis: "🎭🎤🌟👑", answer: "The Greatest Showman", category: "Movies", difficulty: "medium", alternates: ["greatest showman"] },
  { id: 135, emojis: "🦈🩸🏖️", answer: "Jaws", category: "Movies", difficulty: "easy" },
  { id: 136, emojis: "🧊👸⛄❄️", answer: "Frozen", category: "Movies", difficulty: "easy", alternates: ["elsa"] },
  { id: 137, emojis: "💀🌮🎸", answer: "Coco", category: "Movies", difficulty: "easy" },
  { id: 138, emojis: "🦁👑🌅", answer: "The Lion King", category: "Movies", difficulty: "easy", alternates: ["lion king"] },
  { id: 139, emojis: "🤖🚗🕶️💥", answer: "Transformers", category: "Movies", difficulty: "easy", alternates: ["bumblebee", "optimus prime"] },
  { id: 140, emojis: "👨‍🚀🔴🥔🚜", answer: "The Martian", category: "Movies", difficulty: "hard", alternates: ["martian"] },

  // ── TV Shows ──────────────────────────────────────────
  { id: 201, emojis: "👨‍🏫🧪🚬💵", answer: "Breaking Bad", category: "TV Shows", difficulty: "easy", alternates: ["heisenberg"] },
  { id: 202, emojis: "♟️👑💊🏆", answer: "The Queen's Gambit", category: "TV Shows", difficulty: "medium", alternates: ["queens gambit"] },
  { id: 203, emojis: "👑🐉🔥⚔️", answer: "House of the Dragon", category: "TV Shows", difficulty: "easy", alternates: ["game of thrones", "got", "hotd"] },
  { id: 204, emojis: "🧪💊😷🌵", answer: "Better Call Saul", category: "TV Shows", difficulty: "medium" },
  { id: 205, emojis: "🎮🟥🟩💀", answer: "Squid Game", category: "TV Shows", difficulty: "easy" },
  { id: 206, emojis: "👨‍🍳🔪🍳⭐", answer: "The Bear", category: "TV Shows", difficulty: "medium", alternates: ["bear"] },
  { id: 207, emojis: "🕵️‍♀️👠💄🏙️", answer: "Emily in Paris", category: "TV Shows", difficulty: "easy" },
  { id: 208, emojis: "🧟‍♂️🚶‍♂️🏹", answer: "The Walking Dead", category: "TV Shows", difficulty: "easy", alternates: ["walking dead"] },
  { id: 209, emojis: "👑📺🇬🇧👸", answer: "The Crown", category: "TV Shows", difficulty: "medium", alternates: ["crown"] },
  { id: 210, emojis: "🏢📎☕😂", answer: "The Office", category: "TV Shows", difficulty: "easy", alternates: ["office"] },
  { id: 211, emojis: "🩸💉🔪🔬", answer: "Dexter", category: "TV Shows", difficulty: "medium" },
  { id: 212, emojis: "💰🏦🎭🎭", answer: "Money Heist", category: "TV Shows", difficulty: "easy", alternates: ["la casa de papel", "casa de papel"] },
  { id: 213, emojis: "🧇🚲🚲🚲👾", answer: "Stranger Things", category: "TV Shows", difficulty: "easy" },
  { id: 214, emojis: "🎩🐎🥃🇬🇧", answer: "Peaky Blinders", category: "TV Shows", difficulty: "medium" },
  { id: 215, emojis: "🛋️☕👫👭", answer: "Friends", category: "TV Shows", difficulty: "easy" },

  // ── Songs ───────────────────────────────────────────────
  { id: 301, emojis: "💃🕺🪩✨", answer: "Levitating", category: "Songs", difficulty: "easy", alternates: ["dua lipa levitating"] },
  { id: 302, emojis: "🌧️☔😢🎤", answer: "Set Fire to the Rain", category: "Songs", difficulty: "easy", alternates: ["set fire to rain", "adele"] },
  { id: 303, emojis: "🎤👑🐝🍋", answer: "Crazy in Love", category: "Songs", difficulty: "easy", alternates: ["beyonce crazy in love", "lemonade"] },
  { id: 304, emojis: "🌙🚶‍♂️🎸🕶️", answer: "Blinding Lights", category: "Songs", difficulty: "easy", alternates: ["the weeknd blinding lights"] },
  { id: 305, emojis: "🎸🤠🐎🛤️", answer: "Old Town Road", category: "Songs", difficulty: "easy", alternates: ["lil nas x"] },
  { id: 306, emojis: "💔📞☎️🎵", answer: "Call Me Maybe", category: "Songs", difficulty: "easy", alternates: ["carly rae jepsen"] },
  { id: 307, emojis: "🌍🕊️🎶❤️", answer: "Heal the World", category: "Songs", difficulty: "easy", alternates: ["michael jackson heal the world"] },
  { id: 308, emojis: "🌊👁️👁️", answer: "Ocean Eyes", category: "Songs", difficulty: "easy", alternates: ["billie eilish ocean eyes"] },
  { id: 309, emojis: "🎹👑🎤🇬🇧", answer: "Bohemian Rhapsody", category: "Songs", difficulty: "medium", alternates: ["queen bohemian rhapsody"] },
  { id: 310, emojis: "💎✨🌌🎤", answer: "Diamonds", category: "Songs", difficulty: "easy", alternates: ["diamonds rihanna", "shine bright like a diamond"] },
  { id: 311, emojis: "🧟‍♂️🕺🌃🌙", answer: "Thriller", category: "Songs", difficulty: "easy", alternates: ["michael jackson thriller"] },
  { id: 312, emojis: "💃💃💃🪗", answer: "Despacito", category: "Songs", difficulty: "easy", alternates: ["luis fonsi despacito"] },
  { id: 313, emojis: "🎤🌟⭐🚀", answer: "Starboy", category: "Songs", difficulty: "easy", alternates: ["the weeknd starboy"] },
  { id: 314, emojis: "☀️👓😎🌃", answer: "Sunglasses at Night", category: "Songs", difficulty: "medium" },
  { id: 315, emojis: "🔥🔥🔥🎤", answer: "We Didn't Start the Fire", category: "Songs", difficulty: "hard", alternates: ["we didnt start the fire"] },

  // ── Idioms & Phrases ────────────────────────────────────
  { id: 401, emojis: "🐦🪨🪨", answer: "Kill Two Birds with One Stone", category: "Phrases", difficulty: "easy", alternates: ["two birds one stone", "kill 2 birds with 1 stone"] },
  { id: 402, emojis: "🧈🍞", answer: "Bread and Butter", category: "Phrases", difficulty: "easy" },
  { id: 403, emojis: "🪙🧠💭", answer: "Penny for Your Thoughts", category: "Phrases", difficulty: "medium" },
  { id: 404, emojis: "🕯️🔥🔚", answer: "Burning the Candle at Both Ends", category: "Phrases", difficulty: "hard", alternates: ["burning candle at both ends"] },
  { id: 405, emojis: "🐴👄🔍", answer: "Look a Gift Horse in the Mouth", category: "Phrases", difficulty: "hard", alternates: ["dont look a gift horse in the mouth"] },
  { id: 406, emojis: "🐱👜🗣️", answer: "Let the Cat Out of the Bag", category: "Phrases", difficulty: "medium" },
  { id: 407, emojis: "💧🌊🪣", answer: "Drop in the Ocean", category: "Phrases", difficulty: "medium", alternates: ["drop in the bucket"] },
  { id: 408, emojis: "🪓🧊🤝", answer: "Break the Ice", category: "Phrases", difficulty: "easy", alternates: ["icebreaker"] },
  { id: 409, emojis: "🍎🌲👀", answer: "The Apple Doesn't Fall Far from the Tree", category: "Phrases", difficulty: "medium", alternates: ["apple doesnt fall far from tree"] },
  { id: 410, emojis: "👅🔒🔑", answer: "Bite Your Tongue", category: "Phrases", difficulty: "medium" },
  { id: 411, emojis: "🐘🏠", answer: "Elephant in the Room", category: "Phrases", difficulty: "easy" },
  { id: 412, emojis: "🍰✨👌", answer: "Piece of Cake", category: "Phrases", difficulty: "easy" },
  { id: 413, emojis: "🌧️🐱🐶", answer: "Raining Cats and Dogs", category: "Phrases", difficulty: "easy" },
  { id: 414, emojis: "🐦🪱⏰", answer: "Early Bird Gets the Worm", category: "Phrases", difficulty: "easy", alternates: ["early bird"] },
  { id: 415, emojis: "🏠❤️", answer: "Home Sweet Home", category: "Phrases", difficulty: "easy" },
  { id: 416, emojis: "👁️🍎", answer: "Apple of My Eye", category: "Phrases", difficulty: "easy" },
  { id: 417, emojis: "🐢🏁", answer: "Slow and Steady Wins the Race", category: "Phrases", difficulty: "easy", alternates: ["slow and steady"] },
  { id: 418, emojis: "🌧️🌈", answer: "Every Cloud Has a Silver Lining", category: "Phrases", difficulty: "medium", alternates: ["silver lining"] },
  { id: 419, emojis: "🐺🐑👕", answer: "Wolf in Sheep's Clothing", category: "Phrases", difficulty: "medium", alternates: ["wolf in sheeps clothing"] },
  { id: 420, emojis: "🎯🔨💥", answer: "Hit the Nail on the Head", category: "Phrases", difficulty: "medium", alternates: ["hit nail on head"] },

  // ── Science, Tech & Energy ──────────────────────────────
  { id: 501, emojis: "🍎🪑🌍📐", answer: "Newton's Laws of Motion", category: "Science & Tech", difficulty: "hard", alternates: ["laws of motion", "gravity", "newtons laws"] },
  { id: 502, emojis: "⚛️💣💥", answer: "Atomic Bomb", category: "Science & Tech", difficulty: "medium", alternates: ["nuclear bomb", "oppenheimer"] },
  { id: 503, emojis: "🧬🔍🧪", answer: "DNA Double Helix", category: "Science & Tech", difficulty: "medium", alternates: ["dna", "genetics"] },
  { id: 504, emojis: "💻🤖🧠⚡", answer: "Artificial Intelligence", category: "Science & Tech", difficulty: "easy", alternates: ["ai", "machine learning"] },
  { id: 505, emojis: "🌐🕸️💻", answer: "World Wide Web", category: "Science & Tech", difficulty: "easy", alternates: ["internet", "www"] },
  { id: 506, emojis: "🚀🔴🚗", answer: "SpaceX Mars Mission", category: "Science & Tech", difficulty: "hard", alternates: ["spacex mars", "spacex", "starship"] },
  { id: 507, emojis: "🧲⚡🔄", answer: "Electromagnetic Induction", category: "Science & Tech", difficulty: "expert", alternates: ["electromagnetism", "faraday law"] },
  { id: 508, emojis: "🧪🌡️❄️🔥", answer: "Thermodynamics", category: "Science & Tech", difficulty: "hard" },
  { id: 509, emojis: "🔭🌌🪐✨", answer: "James Webb Space Telescope", category: "Science & Tech", difficulty: "hard", alternates: ["james webb", "jwst", "hubble"] },
  { id: 510, emojis: "🔋⚡🚗", answer: "Electric Vehicle", category: "Science & Tech", difficulty: "easy", alternates: ["ev", "tesla"] },

  // ── Landmarks ───────────────────────────────────────────
  { id: 601, emojis: "🗼🇫🇷🍷", answer: "Eiffel Tower", category: "Landmarks", difficulty: "easy" },
  { id: 602, emojis: "🗽🇺🇸🍔", answer: "Statue of Liberty", category: "Landmarks", difficulty: "easy" },
  { id: 603, emojis: "🧱🐉🇨🇳", answer: "Great Wall of China", category: "Landmarks", difficulty: "easy", alternates: ["great wall"] },
  { id: 604, emojis: "🕌💎🇮🇳", answer: "Taj Mahal", category: "Landmarks", difficulty: "easy" },
  { id: 605, emojis: "🔺🏜️🐪", answer: "Pyramids of Giza", category: "Landmarks", difficulty: "easy", alternates: ["pyramids", "great pyramid", "giza"] },
  { id: 606, emojis: "🌉🌁🇺🇸", answer: "Golden Gate Bridge", category: "Landmarks", difficulty: "easy" },
  { id: 607, emojis: "🏛️🇬🇷🏺", answer: "Parthenon", category: "Landmarks", difficulty: "medium", alternates: ["acropolis"] },
  { id: 608, emojis: "🗿🌊🇨🇱", answer: "Easter Island Moai", category: "Landmarks", difficulty: "medium", alternates: ["easter island", "moai"] },
  { id: 609, emojis: "🧗‍♂️🏔️❄️", answer: "Mount Everest", category: "Landmarks", difficulty: "medium", alternates: ["everest"] },
  { id: 610, emojis: "🏜️🐫🏛️", answer: "Petra", category: "Landmarks", difficulty: "hard", alternates: ["petra jordan"] },
  { id: 611, emojis: "🌊🐠🪸", answer: "Great Barrier Reef", category: "Landmarks", difficulty: "medium" },
  { id: 612, emojis: "🏰🐭🎆", answer: "Disneyland", category: "Landmarks", difficulty: "easy", alternates: ["disney world", "magic kingdom"] },

  // ── Countries ───────────────────────────────────────────
  { id: 701, emojis: "🗼🥖🍷", answer: "France", category: "Countries", difficulty: "easy" },
  { id: 702, emojis: "🍕🍝🏛️", answer: "Italy", category: "Countries", difficulty: "easy" },
  { id: 703, emojis: "🌮🌯🎺", answer: "Mexico", category: "Countries", difficulty: "easy" },
  { id: 704, emojis: "🏯🍱🗻", answer: "Japan", category: "Countries", difficulty: "easy" },
  { id: 705, emojis: "🦘🐨🏄", answer: "Australia", category: "Countries", difficulty: "easy" },
  { id: 706, emojis: "⚽🎭🌴", answer: "Brazil", category: "Countries", difficulty: "easy" },
  { id: 707, emojis: "🕌🌶️🐘", answer: "India", category: "Countries", difficulty: "easy" },
  { id: 708, emojis: "🍁🍂🏒", answer: "Canada", category: "Countries", difficulty: "easy" },
  { id: 709, emojis: "🦁🐘🥁", answer: "Kenya", category: "Countries", difficulty: "easy" },
  { id: 710, emojis: "🌍🟢⚪🟢", answer: "Nigeria", category: "Countries", difficulty: "easy" },
  { id: 711, emojis: "🐉🥡🧧", answer: "China", category: "Countries", difficulty: "easy" },
  { id: 712, emojis: "🎭🥁🌴🇬🇭", answer: "Ghana", category: "Countries", difficulty: "easy" },
  { id: 713, emojis: "🗽🍔🦅", answer: "United States", category: "Countries", difficulty: "easy", alternates: ["usa", "america", "us"] },
  { id: 714, emojis: "🏴󠁧󠁢󠁥󠁮󠁧󠁿☕👑", answer: "United Kingdom", category: "Countries", difficulty: "easy", alternates: ["uk", "britain", "england"] },
  { id: 715, emojis: "🏔️🍫🧀⏰", answer: "Switzerland", category: "Countries", difficulty: "medium" },

  // ── Foods ───────────────────────────────────────────────
  { id: 801, emojis: "🍚🍅🔥", answer: "Jollof Rice", category: "Foods", difficulty: "easy", alternates: ["jollof"] },
  { id: 802, emojis: "🥩🌶️🍢", answer: "Suya", category: "Foods", difficulty: "easy" },
  { id: 803, emojis: "🥘🍲🌿", answer: "Egusi Soup", category: "Foods", difficulty: "easy", alternates: ["egusi"] },
  { id: 804, emojis: "🍩🔥🛢️", answer: "Puff Puff", category: "Foods", difficulty: "easy", alternates: ["puff puff"] },
  { id: 805, emojis: "🌽🫘", answer: "Adalu", category: "Foods", difficulty: "medium", alternates: ["beans and corn"] },
  { id: 806, emojis: "🍜🌶️🥩", answer: "Pepper Soup", category: "Foods", difficulty: "easy" },
  { id: 807, emojis: "🍔🍟", answer: "Burger and Fries", category: "Foods", difficulty: "easy", alternates: ["burger", "hamburger"] },
  { id: 808, emojis: "🍣🐟🍚", answer: "Sushi", category: "Foods", difficulty: "easy" },
  { id: 809, emojis: "🥞🍯🧈", answer: "Pancakes", category: "Foods", difficulty: "easy", alternates: ["pancake"] },
  { id: 810, emojis: "🍕🧀🍅", answer: "Pizza", category: "Foods", difficulty: "easy" },
  { id: 811, emojis: "🌮🥑🥩", answer: "Tacos", category: "Foods", difficulty: "easy", alternates: ["taco"] },
  { id: 812, emojis: "🍛🥄🍤", answer: "Fried Rice", category: "Foods", difficulty: "easy" },

  // ── Sports ──────────────────────────────────────────────
  { id: 901, emojis: "⚽🏆🌍", answer: "World Cup", category: "Sports", difficulty: "easy", alternates: ["fifa world cup"] },
  { id: 902, emojis: "🏀🏀🔥", answer: "Basketball", category: "Sports", difficulty: "easy", alternates: ["nba"] },
  { id: 903, emojis: "🏎️🏁⚡", answer: "Formula 1", category: "Sports", difficulty: "easy", alternates: ["f1", "formula one", "f1 racing"] },
  { id: 904, emojis: "🥊🥊👑", answer: "Boxing", category: "Sports", difficulty: "easy" },
  { id: 905, emojis: "🎾🍓🇬🇧", answer: "Wimbledon", category: "Sports", difficulty: "medium", alternates: ["tennis wimbledon"] },
  { id: 906, emojis: "🏏🇮🇳🏟️", answer: "Cricket", category: "Sports", difficulty: "easy", alternates: ["ipl"] },
  { id: 907, emojis: "🏊🚴🏃", answer: "Triathlon", category: "Sports", difficulty: "medium", alternates: ["ironman"] },
  { id: 908, emojis: "⛳🏌️⛳", answer: "Golf", category: "Sports", difficulty: "easy", alternates: ["pga"] },
  { id: 909, emojis: "🏈🏟️🌭", answer: "Super Bowl", category: "Sports", difficulty: "medium", alternates: ["american football", "nfl"] },
  { id: 910, emojis: "🏸🏸", answer: "Badminton", category: "Sports", difficulty: "easy" },

  // ── Books & Stories ─────────────────────────────────────
  { id: 1101, emojis: "⚡👓🪄", answer: "Harry Potter", category: "Books", difficulty: "easy" },
  { id: 1102, emojis: "🐇🎩🕳️", answer: "Alice in Wonderland", category: "Books", difficulty: "easy" },
  { id: 1103, emojis: "🧪⚗️🧟", answer: "Frankenstein", category: "Books", difficulty: "medium" },
  { id: 1104, emojis: "🔍🎩🐕", answer: "Sherlock Holmes", category: "Books", difficulty: "easy", alternates: ["sherlock"] },
  { id: 1105, emojis: "🌹🐻🏰", answer: "Beauty and the Beast", category: "Books", difficulty: "easy" },
  { id: 1106, emojis: "🏝️👦📕", answer: "Lord of the Flies", category: "Books", difficulty: "medium" },
  { id: 1107, emojis: "📖✝️🕊️", answer: "The Bible", category: "Books", difficulty: "easy", alternates: ["bible", "holy bible"] },
  { id: 1108, emojis: "🐉🔥👦", answer: "Eragon", category: "Books", difficulty: "medium" },
  { id: 1109, emojis: "🐋🌊⚓", answer: "Moby Dick", category: "Books", difficulty: "hard" },
  { id: 1110, emojis: "👴🌊🎣", answer: "The Old Man and the Sea", category: "Books", difficulty: "hard" },

  // ── Occupations ─────────────────────────────────────────
  { id: 1201, emojis: "💻⌨️🐛", answer: "Software Engineer", category: "Occupations", difficulty: "easy", alternates: ["programmer", "developer", "coder"] },
  { id: 1202, emojis: "🩺💉🏥", answer: "Doctor", category: "Occupations", difficulty: "easy", alternates: ["physician", "medical doctor"] },
  { id: 1203, emojis: "✈️👨‍✈️🌍", answer: "Pilot", category: "Occupations", difficulty: "easy" },
  { id: 1204, emojis: "👨‍🍳🔥🍳", answer: "Chef", category: "Occupations", difficulty: "easy", alternates: ["cook"] },
  { id: 1205, emojis: "⚖️📜🏛️", answer: "Lawyer", category: "Occupations", difficulty: "easy", alternates: ["attorney", "barrister"] },
  { id: 1206, emojis: "🚀👨‍🚀🪐", answer: "Astronaut", category: "Occupations", difficulty: "easy" },
  { id: 1207, emojis: "🛢️⚙️👷", answer: "Petroleum Engineer", category: "Occupations", difficulty: "medium", alternates: ["drilling engineer"] },
  { id: 1208, emojis: "🎨🖌️🖼️", answer: "Artist", category: "Occupations", difficulty: "easy", alternates: ["painter"] },
  { id: 1209, emojis: "📐🏗️🏛️", answer: "Architect", category: "Occupations", difficulty: "easy" },
  { id: 1210, emojis: "📰🎤🎥", answer: "Journalist", category: "Occupations", difficulty: "easy", alternates: ["reporter"] },
];

/** Clean and normalize a string for tolerant matching */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple Levenshtein distance for fuzzy matching */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/** Check if an answer is correct (case-insensitive, trimmed, smart fuzzy matching) */
export function checkAnswer(puzzle: EmojiPuzzle, input: string): boolean {
  const cleanInput = normalizeText(input);
  if (!cleanInput) return false;

  const validAnswers = [puzzle.answer, ...(puzzle.alternates || [])];

  for (const target of validAnswers) {
    const cleanTarget = normalizeText(target);
    if (cleanInput === cleanTarget) return true;

    // Check with 'the' / 'a' prefix stripped
    const targetNoArticle = cleanTarget.replace(/^(the|a|an)\s+/, "");
    const inputNoArticle = cleanInput.replace(/^(the|a|an)\s+/, "");
    if (inputNoArticle === targetNoArticle) return true;

    // Fuzzy match for minor typo (1 char typo on strings > 5 chars)
    if (cleanTarget.length > 5 && Math.abs(cleanInput.length - cleanTarget.length) <= 1) {
      if (levenshtein(cleanInput, cleanTarget) <= 1) return true;
    }
  }

  return false;
}

/** Shuffle an array (Fisher-Yates) */
export function shufflePuzzles(puzzles: EmojiPuzzle[]): EmojiPuzzle[] {
  const arr = [...puzzles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Get hint: reveals specific letters from the answer */
export function getHint(answer: string, revealCount: number): string {
  const chars = answer.split("");
  const letterIndices: number[] = [];

  chars.forEach((ch, i) => {
    if (/[a-zA-Z0-9]/.test(ch)) letterIndices.push(i);
  });

  // Pick deterministic positions to reveal based on revealCount
  const step = Math.max(1, Math.floor(letterIndices.length / (revealCount + 1)));
  const toReveal = new Set<number>();
  for (let i = 0; i < revealCount && i < letterIndices.length; i++) {
    toReveal.add(letterIndices[(i * step) % letterIndices.length]);
  }

  return chars
    .map((ch, i) => {
      if (!/[a-zA-Z0-9]/.test(ch)) return ch;
      if (toReveal.has(i)) return ch.toUpperCase();
      return "_";
    })
    .join(" ");
}

/** Generate scrambled letter pool for an anagram assistance keyboard */
export function getScrambledLetters(answer: string): string[] {
  const letters = answer
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .split("");

  // Add 3-4 extra distractor letters if answer is short
  const distractors = ["A", "E", "R", "S", "T", "O", "L", "N", "M", "P"];
  while (letters.length < 12) {
    const randomDistractor = distractors[Math.floor(Math.random() * distractors.length)];
    letters.push(randomDistractor);
  }

  // Shuffle letters
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }

  return letters.slice(0, 14);
}
