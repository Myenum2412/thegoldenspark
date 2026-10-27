export const SETUP_SQL = `-- The Appwrite "Billing" database is the backend (TablesDB).
-- Configuration lives in .env.local locally, or in the host's env vars:
--   1. NEXT_PUBLIC_APPWRITE_DATABASE_ID      (default: billing_db)
--   2. NEXT_PUBLIC_APPWRITE_TABLE_PRODUCTS   (default: products)
--      NEXT_PUBLIC_APPWRITE_TABLE_CLIENTS    (default: clients)
--      NEXT_PUBLIC_APPWRITE_TABLE_SALES      (default: sales)
--   3. APPWRITE_API_KEY — optional server-only key (databases.read + tables.read/write).
--      The Billing tables allow anonymous access, so it is not required.
-- The login user lives under Auth → Users in the Appwrite console.`;

export type Customer = {
  id: string | number;
  name: string;
  address: string;
  pincode: string;
  phone: string;
  created_at?: string;
};

export type Product = {
  id: string | number;
  ordr?: number;
  item_no: number;
  barcode: string;
  name: string;
  category: string;
  packing: string;
  mrp: number;
  special_rate: number;
  stock: number;
  image?: string;
  min_qty?: number;
  created_at?: string;
};

// Minimum start quantity per product when adding to cart.
// Products not listed default to 1.
export const PRODUCT_MIN_QTY_BY_NAME: Record<string, number> = {
  // 5 count start:
  "3.5\" LAKSHMI CRACKERS": 5,
  "4\" LAKSHMI CRACKERS": 5,
  "LAKSHMI DLX CRACKERS": 5,
  "7 CM ELECTRIC SPARKLERS": 5,
  "10 CM ELECTRIC SPARKLERS": 5,
  "12 CM RED SPARKLERS": 5,
  "12 CM GREEN SPARKLERS": 5,
  "10 CM RAINBOW SPARKLERS 4 IN 1": 5,

  // 10 count start:
  "2.5\" WETWO CRACKERS": 10,

  // 2 count start:
  "15 CM ELECTRIC SPARKLERS": 2,
  "30 CM COLOUR SPARKLERS": 2,
  "15 CM RED SPARKLERS": 2,
  "15 CM GREEN SPARKLERS": 2,
  "30 CM RED SPARKLERS": 2,
  "30 CM GREEN SPARKLERS": 2,
  "GROUND CHAKKAR BIG": 2,
  "RED BIJILI CRACKERS": 2,
  "STRIPPED BIJILI CRACKERS": 2,
  "56 ANGERY BIRD": 2,
  "28 ANGERY BIRD": 2,
  "SUPER SHOW": 2,
  "AMBER SHOW": 2,
  "RUBY SHOW": 2,
  "MINI": 2,
  "MINI (100 wala)": 2,
};

// Also support matching by barcode/item code as fallback
export const PRODUCT_MIN_QTY_BY_CODE: Record<string, number> = {
  R03: 5, // 3.5" LAKSHMI CRACKERS
  R01: 5, // 4" LAKSHMI CRACKERS
  R05: 10, // 2.5" WETWO CRACKERS
  R07: 5, // LAKSHMI DLX CRACKERS
  S01: 5, // 7 CM ELECTRIC SPARKLERS
  S02: 5, // 10 CM ELECTRIC SPARKLERS
  S16: 5, // 12 CM RED SPARKLERS
  S15: 5, // 12 CM GREEN SPARKLERS
  SP26: 5, // 10 CM RAINBOW SPARKLERS 4 IN 1
  S04: 2, // 15 CM ELECTRIC SPARKLERS
  S10: 2, // 30 CM COLOUR SPARKLERS
  S18: 2, // 15 CM RED SPARKLERS
  S17: 2, // 15 CM GREEN SPARKLERS
  S20: 2, // 30 CM RED SPARKLERS
  S19: 2, // 30 CM GREEN SPARKLERS
  R10: 2, // GROUND CHAKKAR BIG
  R56: 2, // RED BIJILI CRACKERS
  R58: 2, // STRIPPED BIJILI CRACKERS
  R48: 2, // 56 ANGERY BIRD
  "CRK-054": 2, // 28 ANGERY BIRD
  "CRK-057": 2, // SUPER SHOW
  "CRK-058": 2, // AMBER SHOW
  "CRK-059": 2, // RUBY SHOW
  W01: 2, // MINI (100 wala)
};

export function getProductMinQty(
  product?: {
    name?: string;
    barcode?: string;
    min_qty?: number;
    id?: string | number;
  } | null
): number {
  if (!product) return 1;
  if (typeof product.min_qty === "number" && product.min_qty > 0) {
    return product.min_qty;
  }
  const name = (product.name ?? "").trim().toUpperCase();
  if (PRODUCT_MIN_QTY_BY_NAME[name]) {
    return PRODUCT_MIN_QTY_BY_NAME[name];
  }
  for (const [key, qty] of Object.entries(PRODUCT_MIN_QTY_BY_NAME)) {
    if (name === key.toUpperCase() || name.startsWith(key.toUpperCase())) {
      return qty;
    }
  }
  const code = (product.barcode ?? "").trim().toUpperCase();
  if (PRODUCT_MIN_QTY_BY_CODE[code]) {
    return PRODUCT_MIN_QTY_BY_CODE[code];
  }
  return 1;
}

const DIWALI_FILE_MAP: Record<string, string> = {
  "10cmelectricsparklers": "10 CM Electric Sparklers.webp",
  "10klikescosmicfireworksbox": "10K Likes Cosmic Fireworks Box.png",
  "240shots": "240shots.png",
  "25riderfireworksboxmockup": "25 Rider Fireworks Box Mockup.png",
  "30shotssquare": "30 Shots Square.webp",
  "60shots": "60 Shots.webp",
  "7cmcoloursparklers": "7 CM Colour Sparklers.webp",
  "ambershowfireworkspack": "AMBER SHOW Fireworks Pack.png",
  "arc": "ARC.png",
  "bloodrainfireworksbox": "Blood Rain Fireworks Box.png",
  "bloodyblazesredshowerfireworkbox": "Bloody Blazes Red Shower Firework Box.png",
  "chinnachottafancy": "CHINNA CHOTTA FANCY.jpg",
  "chitputcartoonfireworkbox": "Chitput Cartoon Firework Box.png",
  "classichitsfireworkboxcollection": "Classic Hits Firework Box Collection.png",
  "colourkotipeacockfireworksbox": "Colour Koti Peacock Fireworks Box.png",
  "coloursmokefireworksbox": "Colour Smoke Fireworks Box.png",
  "colourful7shotsfireworksbox": "Colourful 7 Shots Fireworks Box.png",
  "colourfulflowerpotfireworksbox": "Colourful Flower Pot Fireworks Box.png",
  "colourfulflowerpotfireworkspackaging": "Colourful Flower Pot Fireworks Packaging.png",
  "colourfulgoddesslabelledfirecrackerbundle": "Colourful Goddess-Labelled Firecracker Bundle.png",
  "colourfulwetwofirecrackerbundle": "Colourful WeTwo Firecracker Bundle.png",
  "comicstylerectangularbombfireworksbox": "Comic-Style Rectangular Bomb Fireworks Box.png",
  "discolightsfireworksbox": "Disco Lights Fireworks Box.png",
  "diwalifirecrackerpackwithgoddesslabels": "Diwali Firecracker Pack with Goddess Labels.png",
  "electricgiantcrackerspackage": "Electric Giant Crackers Package.png",
  "elite30multicolourfireworksbox": "Elite 30 Multicolour Fireworks Box.png",
  "f123ajusticeleague": "F123A - JUSTICE LEAGUE.jpeg",
  "firestormfireworksboxpackaging": "Fire Storm Fireworks Box Packaging.png",
  "giantflowerpotsfireworksbox": "Giant Flower Pots Fireworks Box.png",
  "giftboxneithal": "GIFT BOX - NEITHAL.png",
  "glitterstreamfireworktube": "Glitter Stream Firework Tube.png",
  "goldenyellowbowfireworksbox": "Golden Yellow Bow Fireworks Box.png",
  "googoowhiteshowerfireworkbox": "Goo Goo White Shower Firework Box.png",
  "greensparklerboxproductpackshot2": "Green Sparkler Box Product Packshot (2).png",
  "groundchakkardeluxefireworksbox": "Ground Chakkar Deluxe Fireworks Box.png",
  "lakshmideluxefireworkbundle": "Lakshmi Deluxe Firework Bundle.png",
  "magentapopcornbowfireworksbox": "Magenta Pop Corn Bow Fireworks Box.png",
  "maruthamagriculturallandgiftbox": "Marutham Agricultural Land Gift Box.png",
  "mastimagicfireworksbox": "Masti Magic Fireworks Box.png",
  "meteorshowerfireworksbox": "Meteor Shower Fireworks Box.png",
  "minikinglionfireworksbox": "Mini King Lion Fireworks Box.png",
  "multicolourfireworksbox30shots": "Multicolour Fireworks Box_ 30 Shots.png",
  "mysticburstgreenfireworkscanister": "Mystic Burst Green Fireworks Canister.png",
  "nayagarafallsfireworksbox": "Nayagara Falls Fireworks Box.png",
  "packagedfirecrackerbundleonwhite": "Packaged Firecracker Bundle on White.png",
  "palai": "palai.png",
  "pyromarvelkingfireworksbox": "Pyro Marvel King Fireworks Box.png",
  "pyrovipkinglionfireworksbox": "Pyro VIP King Lion Fireworks Box.png",
  "r58strippedbijilicrackers": "R58-STRIPPED BIJILI CRACKERS.jpeg",
  "rainbowsparklerboxpackaging": "Rainbow Sparkler Box Packaging.png",
  "redbijilicrackerspackaging": "Red Bijili Crackers Packaging.png",
  "redbowfireworksbox": "Red Bow Fireworks Box.png",
  "redfireworksgiftbagproductphoto": "Red Fireworks Gift Bag Product Photo.png",
  "regallionnanofireworksbox": "Regal Lion Nano Fireworks Box.png",
  "regallionpyrotoykingbox": "Regal Lion Pyro Toy King Box.png",
  "robin7upcartoonmatchboxpackaging": "Robin 7UP Cartoon Matchbox Packaging.png",
  "robinclassic5in1": "Robin Classic 5 in 1.webp",
  "robinsuperdeluxe10in1": "Robin Super Deluxe 10 in 1.webp",
  "robintop10fireworksbox": "Robin Top 10 Fireworks Box.png",
  "rocketbombfireworkboxpackaging": "Rocket Bomb Firework Box Packaging.png",
  "royallionmonsterfireworksbox": "Royal Lion Monster Fireworks Box.png",
  "rubyshowfireworktwinpack": "Ruby Show Firework Twin Pack.png",
  "seaofstarsfireworksbox": "Sea of Stars Fireworks Box.png",
  "silverblazefireworkstin": "Silver Blaze Fireworks Tin.png",
  "silverbowfireworksbox": "Silver Bow Fireworks Box.png",
  "strippedbijilicrackers": "STRIPPED BIJILI CRACKERS.jpeg",
  "tricoloursmokefireworksbox": "Tricolour Smoke Fireworks Box.png",
  "twinpackbluefireworksboxes": "Twin-Pack Blue Fireworks Boxes.png",
  "twinklingstarfairyfireworksbox": "Twinkling Star Fairy Fireworks Box.png",
  "vibrantcarnivalfountainfireworksbox": "Vibrant Carnival Fountain Fireworks Box.png",
  "vibrantcracklingfountainfireworksbox": "Vibrant Crackling Fountain Fireworks Box.png",
  "vibrantflowerpotsfireworksbox": "Vibrant Flower Pots Fireworks Box.png",
  "vibrantflowerpotssuperfireworksbox": "Vibrant Flower Pots Super Fireworks Box.png",
  "vibrantgreengardenfireworksbox": "Vibrant Green Garden Fireworks Box.png",
  "vibrantmahaflowerpotsfireworksbox": "Vibrant Maha Flower Pots Fireworks Box.png",
  "vibrantmulticolourshotsfireworksbox": "Vibrant Multicolour Shots Fireworks Box.png",
  "vibrantnaturefountainfireworksbox": "Vibrant Nature Fountain Fireworks Box.png",
  "vibrantpurplecoloursparklerspackaging": "Vibrant Purple Colour Sparklers Packaging.png",
  "vibrantrobindiwalimatchesbox": "Vibrant Robin Diwali Matches Box.png",
  "vibrantskywarfireworksbox": "Vibrant Sky War Fireworks Box.png",
  "vibrantthogaifireworkspackage": "Vibrant Thogai Fireworks Package.png",
  "vibrantwetwos3colourpotsfireworksbox": "Vibrant WeTwo’s 3 Colour Pots Fireworks Box.png",
  "wetwosswordfireworksbox": "We Two’s Sword Fireworks Box.png",
  "wetwo40itemfireworksgiftbox1": "WeTwo 40-Item Fireworks Gift Box (1).png",
  "wetwoelectricsparklersbox": "WeTwo Electric Sparklers Box.png",
  "wetwoelectricsparklerstwinboxes2": "WeTWO Electric Sparklers Twin Boxes (2).png",
  "wetwoelectricsparklerstwinboxes": "WeTWO Electric Sparklers Twin Boxes.png",
  "wetwofireworksgiftboxcatalogue": "Wetwo Fireworks Gift Box Catalogue.png",
  "wetwoflowerpotsbigfireworksbox": "WeTwo Flower Pots Big Fireworks Box.png",
  "wetwosfireworksboxpair": "WeTwo's Fireworks Box Pair.png",
  "wetwosasokagroundchakkarbox": "WeTwo’s Asoka Ground Chakkar Box.png",
  "wetwoscarnivalferriswheelfireworks": "WeTwo’s Carnival Ferris Wheel Fireworks.png",
  "wetwoscolourfulflowerpots2in1box": "WeTwo’s Colourful Flower Pots 2-in-1 Box.png",
  "wetwoscracklingbowfireworksbox": "WeTwo’s Crackling Bow Fireworks Box.png",
  "wetwoselectricfountainfireworktube": "WeTwo’s Electric Fountain Firework Tube.png",
  "wetwosflowerpotsfireworksbox": "WeTwo’s Flower Pots Fireworks Box.png",
  "wetwosgroundchakkarfireworksbox": "WeTwo’s Ground Chakkar Fireworks Box.png",
  "wetwospopcornfountainbox": "WeTwo’s Popcorn Fountain Box.png",
  "wetwosredcolourpotdeluxebox": "WeTwo’s Red Colour Pot Deluxe Box.png",
  "yesgiftboxfireworksassortment": "Yes Gift Box Fireworks Assortment.png",
};

function normalizeFileSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/^.*[\/\\]/, "")
    .replace(/\.(png|jpe?g|webp|svg|gif)$/i, "")
    .replace(/[^a-z0-9]/g, "");
}

// Product images live in /public/Diwali. The stored value may be a bare
// filename ("Lakshmi Deluxe Firework Bundle.png"), a root-relative path, a
// legacy asset slug, or a full URL.
export function productImageSrc(image?: string | null): string | null {
  if (!image) return null;
  const value = image.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const slug = normalizeFileSlug(value);
  const matched = DIWALI_FILE_MAP[slug];
  let fileName = matched || value.replace(/^.*[\/\\]/, "");

  if (!matched && !/\.(png|jpe?g|webp|svg|gif)$/i.test(fileName)) {
    fileName = `${fileName}.png`;
  }

  const path = fileName.startsWith("/") ? fileName : `/Diwali/${fileName}`;
  return encodeURI(path);
}

