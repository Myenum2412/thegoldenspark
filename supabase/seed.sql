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
(21, 'SP25-75 CM ELECTRIC SPARKLERS', 'Electric & Colour Sparklers', 'TUBE', 990, 198),
(22, 'SP26-10 CM RAINBOW SPARKLERS 4 IN 1', 'Electric & Colour Sparklers', 'Box', 1000, 200);

-- GROUND CHAKKARS & TWINKLING STARS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(22, 'R11-GROUND CHAKKAR ASHOKA', 'Ground Chakkars & Twinkling Stars', 'Box', 670, 134),
(23, 'R12-GROUND CHAKKAR DELUXE', 'Ground Chakkars & Twinkling Stars', 'Box', 1170, 234),
(24, 'R10-GROUND CHAKKAR BIG', 'Ground Chakkars & Twinkling Stars', 'Box', 350, 70),
(25, 'R15-2''TWINKLING STAR', 'Ground Chakkars & Twinkling Stars', 'Box', 570, 114),
(26, 'R16-4''TWINKLING STAR', 'Ground Chakkars & Twinkling Stars', 'Box', 1020, 204);

-- FLOWER POTS & COLOUR POTS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(27, 'R24-FLOWER POTS BIG', 'Flower Pots & Colour Pots', 'Box', 820, 164),
(28, 'R25-FLOWER POTS SPECIAL', 'Flower Pots & Colour Pots', 'Box', 1170, 234),
(29, 'R26-FLOWER POTS SUPER', 'Flower Pots & Colour Pots', 'Box', 1530, 306),
(30, 'R27-FLOWER POTS GIANT', 'Flower Pots & Colour Pots', 'Box', 1660, 332),
(31, 'R30-FLOWER POTS 2 IN 1 SPECIAL', 'Flower Pots & Colour Pots', 'Box', 1230, 246),
(32, 'R29-FLOWER POTS MAHA', 'Flower Pots & Colour Pots', 'Box', 1000, 200),
(33, 'R33-COLOUR KOTI', 'Flower Pots & Colour Pots', 'Box', 1870, 374),
(34, 'R27A-FLOWER POT MEGA GIANT', 'Flower Pots & Colour Pots', 'Box', 2000, 400);

-- BIJILI, BOMBS & OTHER CRACKERS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(35, 'R35-RECTANGULAR BOMB GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 500, 100),
(36, 'R56-RED BIJILI CRACKERS', 'Bijili, Bombs & Other Crackers', 'BAGS', 325, 65),
(37, 'R58-STRIPPED BIJILI CRACKERS', 'Bijili, Bombs & Other Crackers', 'BAGS', 350, 70),
(38, 'R59-CHIT PUT', 'Bijili, Bombs & Other Crackers', 'Box', 420, 84),
(39, 'R31-THREE COLOUR POTS GIANT', 'Bijili, Bombs & Other Crackers', 'Box', 1180, 236),
(40, 'R32-RED COLOUR POTS DELUXE', 'Bijili, Bombs & Other Crackers', 'Box', 1520, 304),
(41, 'R38-KING OF KANGO GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 1000, 200),
(42, 'R48-56 ANGERY BIRD', 'Bijili, Bombs & Other Crackers', 'PKTS', 430, 86),
(43, 'R36-VIKRANTH GREEN', 'Bijili, Bombs & Other Crackers', 'Box', 570, 114);

-- FANCY ITEMS, SHOTS & WHEELS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(44, 'F158-1" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 560, 112),
(45, 'F161-3" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 2400, 480),
(46, 'F161A-4" FANCY MIX', 'Fancy Items, Shots & Wheels', 'PCS', 2640, 528),
(47, 'F163-1.5" FANCY 3 PCS MIX', 'Fancy Items, Shots & Wheels', 'Box', 2420, 484),
(48, 'F166-12 SHOTS MIX', 'Fancy Items, Shots & Wheels', 'PCS', 1580, 316),
(49, 'F167-FOUNTAIN MIX', 'Fancy Items, Shots & Wheels', 'PCS', 700, 140),
(50, 'F132-WETWO''S 7 SHOT', 'Fancy Items, Shots & Wheels', 'Box', 1165, 233),
(51, 'F133-CHINNA CHOTTA FANCY', 'Fancy Items, Shots & Wheels', 'PACK', 1370, 274),
(52, 'F168-ARC', 'Fancy Items, Shots & Wheels', 'Box', 1260, 252),
(53, 'F169-BOW MIX', 'Fancy Items, Shots & Wheels', 'Box', 1260, 252),
(54, 'F124 CLASIC HITS FIVE IN ONE', 'Fancy Items, Shots & Wheels', 'PACK', 1600, 320),
(55, 'F203-WETWOS WHEEL', 'Fancy Items, Shots & Wheels', 'Box', 2000, 400),
(56, 'N30-Wetwo''s Sword', 'Fancy Items, Shots & Wheels', 'Box', 2000, 400),
(57, 'F201-WETWOS THOGAI', 'Fancy Items, Shots & Wheels', 'Box', 2500, 500);

-- AERIAL SHOTS & SKY FIREWORKS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(58, 'W11-60 SHOTS', 'Aerial Shots & Sky Fireworks', 'Box', 10700, 2140),
(59, 'F121A-SKY WAR 120 SHOTS', 'Aerial Shots & Sky Fireworks', 'PCS', 18600, 3720),
(60, 'F122-COLORFULL SKY 240 SHOTS', 'Aerial Shots & Sky Fireworks', 'PCS', 33350, 6670),
(61, 'N17-VERA LEVEL BRO 10 X 10', 'Aerial Shots & Sky Fireworks', 'Box', 26150, 5230),
(62, 'W09C-30SHOTS FIRE STORM(UV)', 'Aerial Shots & Sky Fireworks', 'Box', 5060, 1012),
(63, 'W09A-30SHOTS (SQUARE)', 'Aerial Shots & Sky Fireworks', 'Box', 4025, 805),
(64, 'W09B-30SHOTS ELITE(UV)', 'Aerial Shots & Sky Fireworks', 'Box', 5060, 1012);

-- KIDS ITEMS & SPECIAL AERIAL FIREWORKS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(65, 'R47-28 ANGRY BIRD', 'Kids Items & Special Aerial Fireworks', 'PKTS', 220, 44),
(66, 'R49-100 ANGRY BIRD', 'Kids Items & Special Aerial Fireworks', 'PKTS', 750, 150),
(67, 'W01-MINI', 'Kids Items & Special Aerial Fireworks', 'Box', 420, 84),
(68, 'W02-NANO', 'Kids Items & Special Aerial Fireworks', 'Box', 1210, 242),
(69, 'W04-TOY', 'Kids Items & Special Aerial Fireworks', 'Box', 2140, 428),
(70, 'W05-MARVEL', 'Kids Items & Special Aerial Fireworks', 'Box', 3100, 620),
(71, 'W07-MONSTER', 'Kids Items & Special Aerial Fireworks', 'Box', 6270, 1254),
(72, 'F202-WETWOS 25 RIDER', 'Kids Items & Special Aerial Fireworks', 'PCS', 3000, 600),
(73, 'W08-VIP', 'Kids Items & Special Aerial Fireworks', 'Box', 15200, 3040),
(74, 'W08A-5K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 12000, 2400),
(75, 'W09-10K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 24000, 4800),
(76, 'W03-2K LIKES', 'Kids Items & Special Aerial Fireworks', 'Box', 4000, 800),
(77, 'W06-MARVEL YELLOW', 'Kids Items & Special Aerial Fireworks', 'Box', 2700, 540);

-- GIFT BOXES & GIFT BAGS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(78, 'G09-GIFT BOX - KURINJI (A)', 'Gift Boxes & Gift Bags', 'Box', 3210, 642),
(79, 'G10-GIFT BOX - MULLAI (B)', 'Gift Boxes & Gift Bags', 'Box', 3900, 780),
(80, 'G11-GIFT BOX - MARUTHAM (C)', 'Gift Boxes & Gift Bags', 'Box', 4590, 918),
(81, 'G12-GIFT BOX - NEITHAL (D)', 'Gift Boxes & Gift Bags', 'Box', 6925, 1385),
(82, 'G12-GIFT BOX - PALAI (E)', 'Gift Boxes & Gift Bags', 'Box', 7610, 1522),
(83, 'G100-TRAVEL GIFT BAG', 'Gift Boxes & Gift Bags', 'BAGS', 22500, 4500);

-- SMOKE EFFECTS, TINS & SPECIAL ITEMS
insert into products (item_no, name, category, packing, mrp, special_rate) values
(84, 'F183-Mystic Burst Tin', 'Smoke Effects, Tins & Special Items', 'PCS', 1500, 300),
(85, 'F208-METEOR SHOWER', 'Smoke Effects, Tins & Special Items', 'Box', 1600, 320),
(86, 'F209-TRI COLOUR SMOKE', 'Smoke Effects, Tins & Special Items', 'Box', 1500, 300),
(87, 'F184-Gliter Stream Tin', 'Smoke Effects, Tins & Special Items', 'PCS', 1750, 350),
(88, 'F185-Colour Smoke Candle', 'Smoke Effects, Tins & Special Items', 'Box', 1500, 300),
(89, 'F180-SILVER BLAZE TIN', 'Smoke Effects, Tins & Special Items', 'PCS', 750, 150),
(90, 'F180-SILVER BLAZE TIN', 'Smoke Effects, Tins & Special Items', 'PCS', 750, 150);
