-- Golden Spark store seed script.
-- Run ONCE in Supabase → SQL Editor → paste → Run.
-- Creates customers + products tables, permissions, and loads the full pricelist.

create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  address text not null,
  pincode text not null,
  phone text not null,
  created_at timestamptz default now()
);

drop table if exists products;
create table products (
  id bigint generated always as identity primary key,
  item_no integer not null,
  name text not null,
  category text not null default 'General',
  packing text not null default 'Box',
  mrp numeric not null default 0,
  special_rate numeric not null default 0,
  stock integer not null default 0,
  created_at timestamptz default now()
);

alter table customers enable row level security;
alter table products enable row level security;

drop policy if exists "public read customers" on customers;
create policy "public read customers" on customers
  for select using (true);

drop policy if exists "public insert customers" on customers;
create policy "public insert customers" on customers
  for insert with check (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (true);

drop policy if exists "public insert products" on products;
create policy "public insert products" on products
  for insert with check (true);

drop policy if exists "public update products" on products;
create policy "public update products" on products
  for update using (true);

drop policy if exists "public delete products" on products;
create policy "public delete products" on products
  for delete using (true);

-- LAKSHMI & WETWO CRACKERS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(1, 'R03-3.5" LAKSHMI CRACKERS', 'Lakshmi & Wetwo Crackers', 'PKTS', 140, 28),
(2, 'R01-4" LAKSHMI CRACKERS', 'Lakshmi & Wetwo Crackers', 'PKTS', 220, 44),
(3, 'R05-2.5" WETWO CRACKERS', 'Lakshmi & Wetwo Crackers', 'PKTS', 90, 18),
(4, 'R07-LAKSHMI DLX CRACKERS', 'Lakshmi & Wetwo Crackers', 'PKTS', 380, 76);

-- ELECTRIC & COLOUR SPARKLERS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(5, 'S01-7 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'Box', 100, 20),
(6, 'S02-10 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'Box', 210, 42),
(7, 'S04-15 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'Box', 400, 80),
(8, 'S05-30 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'Box', 400, 80),
(9, 'S06-7 CM COLOUR SPARKLERS', 'Electric & Colour Sparklers', 'Box', 110, 22),
(10, 'S07-10 CM COLOUR SPARKLERS', 'Electric & Colour Sparklers', 'Box', 220, 44),
(11, 'S09-15 CM COLOUR SPARKLERS', 'Electric & Colour Sparklers', 'Box', 410, 82),
(12, 'S10-30 CM COLOUR SPARKLERS', 'Electric & Colour Sparklers', 'Box', 410, 82),
(13, 'S16-12 CM RED SPARKLERS', 'Electric & Colour Sparklers', 'Box', 300, 60),
(14, 'S15-12 CM GREEN SPARKLERS', 'Electric & Colour Sparklers', 'Box', 290, 58),
(15, 'S18-15 CM RED SPARKLERS', 'Electric & Colour Sparklers', 'Box', 440, 88),
(16, 'S17-15 CM GREEN SPARKLERS', 'Electric & Colour Sparklers', 'Box', 430, 86),
(17, 'S20-30CM RED SPARKLERS', 'Electric & Colour Sparklers', 'Box', 490, 98),
(18, 'S19-30 CM GREEN SPARKLERS', 'Electric & Colour Sparklers', 'Box', 480, 96),
(19, 'S22-50 CM ELECTRIC SPARKLERS(TUBE)', 'Electric & Colour Sparklers', 'TUBE', 960, 192),
(20, 'S24-50 CM COLOUR SPARKLERS(TUBE)', 'Electric & Colour Sparklers', 'TUBE', 990, 198),
(59, 'SP25-75 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'TUBE', 990, 198),
(61, 'SP26-10 CM RAINBOW SPARKLERS 4 IN 1', 'Electric & Colour Sparklers', 'Box', 1000, 200);

-- GROUND CHAKKARS & TWINKLING STARS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(21, 'R11-GROUND CHAKKAR ASHOKA', 'Ground Chakkars & Twinkling Stars', 'Box', 670, 134),
(22, 'R12-GROUND CHAKKAR DELUXE', 'Ground Chakkars & Twinkling Stars', 'Box', 1170, 234),
(23, 'R10-GROUND CHAKKAR BIG', 'Ground Chakkars & Twinkling Stars', 'Box', 350, 70),
(24, 'R15-2''TWINKLING STAR', 'Ground Chakkars & Twinkling Stars', 'Box', 570, 114),
(25, 'R16-4''TWINKLING STAR', 'Ground Chakkars & Twinkling Stars', 'Box', 1020, 204);

-- FLOWER POTS & COLOUR POTS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(26, 'R24-FLOWER POTS BIG', 'Flower Pots & Colour Pots', 'Box', 820, 164),
(27, 'R25-FLOWER POTS SPECIAL', 'Flower Pots & Colour Pots', 'Box', 1170, 234),
(28, 'R26-FLOWER POTS SUPER', 'Flower Pots & Colour Pots', 'Box', 1530, 306),
(29, 'R27-FLOWER POTS GIANT', 'Flower Pots & Colour Pots', 'Box', 1660, 332),
(30, 'R30-FLOWER POTS 2 IN 1 SPECIAL', 'Flower Pots & Colour Pots', 'Box', 1230, 246),
(31, 'R31-THREE COLOUR POTS GIANT', 'Flower Pots & Colour Pots', 'Box', 1180, 236),
(32, 'R32-RED COLOUR POTS DELUXE', 'Flower Pots & Colour Pots', 'Box', 1520, 304),
(33, 'R29-FLOWER POTS MAHA', 'Flower Pots & Colour Pots', 'Box', 1000, 200),
(34, 'R33-COLOUR KOTI', 'Flower Pots & Colour Pots', 'Box', 1870, 374),
(58, 'R27A-FLOWER POT MEGA GIANT', 'Flower Pots & Colour Pots', 'Box', 2000, 400);

-- BIJILI, BOMBS & OTHER CRACKERS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(35, 'R38-KING OF KANGO GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 1000, 200),
(36, 'R35-RECTANGULAR BOMB GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 500, 100),
(37, 'R56-RED BIJILI CRACKERS', 'Bijili, Bombs & Other Crackers', 'BAGS', 325, 65),
(38, 'R58-STRIPPED BIJILI CRACKERS', 'Bijili, Bombs & Other Crackers', 'BAGS', 350, 70),
(39, 'R59-CHIT PUT', 'Bijili, Bombs & Other Crackers', 'Box', 420, 84),
(55, 'R47-28 ANGRY BIRD', 'Bijili, Bombs & Other Crackers', 'PKTS', 220, 44),
(56, 'R48-56 ANGERY BIRD', 'Bijili, Bombs & Other Crackers', 'PKTS', 430, 86),
(57, 'R49-100 ANGRY BIRD', 'Bijili, Bombs & Other Crackers', 'PKTS', 750, 150),
(62, 'R36-VIKRANTH GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 570, 114);

-- FANCY ITEMS, SHOTS & WHEELS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(40, 'F158-1" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 560, 112),
(41, 'F161-3" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 2400, 480),
(42, 'F161A-4" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 2640, 528),
(43, 'F163-1.5" FANCY 3 PCS MIX', 'Fancy Items, Shots & Wheels', 'Box', 2420, 484),
(44, 'F166-12 SHOTS MIX', 'Fancy Items, Shots & Wheels', 'PCS', 1580, 316),
(45, 'F167-FOUNTAIN MIX', 'Fancy Items, Shots & Wheels', 'PCS', 700, 140),
(46, 'F132-WETWO''S 7 SHOT', 'Fancy Items, Shots & Wheels', 'Box', 1165, 233),
(47, 'F133-CHINNA CHOTTA FANCY', 'Fancy Items, Shots & Wheels', 'PACK', 1370, 274),
(48, 'F168-ARC', 'Fancy Items, Shots & Wheels', 'Box', 1260, 252),
(49, 'F169-BOW MIX', 'Fancy Items, Shots & Wheels', 'Box', 1260, 252),
(60, 'F124 CLASIC HITS FIVE IN ONE', 'Fancy Items, Shots & Wheels', 'PACK', 1600, 320),
(68, 'F202-WETWOS 25 RIDER', 'Fancy Items, Shots & Wheels', 'PCS', 3000, 600),
(70, 'F203-WETWOS WHEEL', 'Fancy Items, Shots & Wheels', 'Box', 2000, 400),
(71, 'N30-Wetwo''s Sword', 'Fancy Items, Shots & Wheels', 'Box', 2000, 400),
(81, 'F201-WETWOS THOGAI', 'Fancy Items, Shots & Wheels', 'Box', 2500, 500);

-- GIFT BOXES & GIFT BAGS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(50, 'G09-GIFT BOX - KURINJI (A)', 'Gift Boxes & Gift Bags', 'Box', 3210, 642),
(51, 'G10-GIFT BOX - MULLAI (B)', 'Gift Boxes & Gift Bags', 'Box', 3900, 780),
(52, 'G11-GIFT BOX - MARUTHAM (C)', 'Gift Boxes & Gift Bags', 'Box', 4590, 918),
(53, 'G12-GIFT BOX - NEITHAL (D)', 'Gift Boxes & Gift Bags', 'Box', 6925, 1385),
(54, 'G12-GIFT BOX - PALAI (E)', 'Gift Boxes & Gift Bags', 'Box', 7610, 1522),
(88, 'G100-TRAVEL GIFT BAG', 'Gift Boxes & Gift Bags', 'BAGS', 22500, 4500);

-- KIDS ITEMS & SPECIAL AERIAL FIREWORKS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(63, 'W01-MINI', 'Kids Items & Special Aerial Fireworks', 'Box', 420, 84),
(64, 'W02-NAΑΝΟ', 'Kids Items & Special Aerial Fireworks', 'Box', 1210, 242),
(65, 'W04-ΤΟΥ', 'Kids Items & Special Aerial Fireworks', 'Box', 2140, 428),
(66, 'W05-MARVEL', 'Kids Items & Special Aerial Fireworks', 'Box', 3100, 620),
(67, 'W07-MONSTER', 'Kids Items & Special Aerial Fireworks', 'Box', 6270, 1254),
(75, 'W08-VIP', 'Kids Items & Special Aerial Fireworks', 'Box', 15200, 3040),
(76, 'W08A-5K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 12000, 2400),
(77, 'W09-10K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 24000, 4800),
(82, 'W03-2K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 4000, 800),
(84, 'W06-MARVEL YELLOW', 'Kids Items & Special Aerial Fireworks', 'Box', 2700, 540);

-- AERIAL SHOTS & SKY FIREWORKS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(69, 'W11-60 SHOTS', 'Aerial Shots & Sky Fireworks', 'Box', 10700, 2140),
(78, 'F121A-SKY WAR 120 SHOTS', 'Aerial Shots & Sky Fireworks', 'PCS', 18600, 3720),
(79, 'F122-COLORFULL SKY 240 SHOTS', 'Aerial Shots & Sky Fireworks', 'PCS', 33350, 6670),
(80, 'N17-VERA LEVEL BRO 10 X 10', 'Aerial Shots & Sky Fireworks', 'Box', 26150, 5230),
(86, 'W09C-30SHOTS FIRE STORM(UV)', 'Aerial Shots & Sky Fireworks', 'Box', 5060, 1012),
(87, 'W09A-30SHOTS (SQUARE)', 'Aerial Shots & Sky Fireworks', 'Box', 4025, 805),
(90, 'W09B-30SHOTS ELITE(UV)', 'Aerial Shots & Sky Fireworks', 'Box', 5060, 1012);

-- SMOKE EFFECTS, TINS & SPECIAL ITEMS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(72, 'F183-Mystic Burst Tin', 'Smoke Effects, Tins & Special Items', 'PCS', 1500, 300),
(73, 'F208-METEOR SHOWER', 'Smoke Effects, Tins & Special Items', 'Box', 1600, 320),
(74, 'F209-TRI COLOUR SMOKE', 'Smoke Effects, Tins & Special Items', 'Box', 1500, 300),
(83, 'F184-Gliter Stream Tin', 'Smoke Effects, Tins & Special Items', 'PCS', 1750, 350),
(85, 'F185-Colour Smoke Candle', 'Smoke Effects, Tins & Special Items', 'Box', 1500, 300),
(89, 'F180-SILVER BLAZE TIN', 'Smoke Effects, Tins & Special Items', 'PCS', 750, 150);
