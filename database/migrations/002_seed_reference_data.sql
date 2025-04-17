-- Reference data seed script for Enhanced Gemstone System

-- Gemstone Families
INSERT INTO gemstone_families 
  (name, category, description, hardness_min, hardness_max, chemical_formula, crystal_system, refractive_index_min, refractive_index_max, specific_gravity_min, specific_gravity_max, cleavage, luster) 
VALUES
  ('Diamond', 'Native Element', 'Diamonds are the hardest known natural material and one of the most popular gemstones.', 10.0, 10.0, 'C', 'Cubic', 2.417, 2.419, 3.50, 3.53, 'Perfect octahedral', 'Adamantine'),
  ('Ruby', 'Oxide', 'Ruby is a pink to blood-red colored gemstone, a variety of the mineral corundum (aluminum oxide).', 9.0, 9.0, 'Al₂O₃', 'Hexagonal', 1.762, 1.770, 3.97, 4.05, 'None', 'Vitreous to adamantine'),
  ('Sapphire', 'Oxide', 'Sapphires are gemstones that are formed from corundum and come in many colors, though blue is most common.', 9.0, 9.0, 'Al₂O₃', 'Hexagonal', 1.762, 1.770, 3.95, 4.03, 'None', 'Vitreous to adamantine'),
  ('Emerald', 'Silicate', 'Emerald is a variety of beryl colored green by trace amounts of chromium and sometimes vanadium.', 7.5, 8.0, 'Be₃Al₂(SiO₃)₆', 'Hexagonal', 1.565, 1.599, 2.67, 2.78, 'Imperfect basal', 'Vitreous'),
  ('Aquamarine', 'Silicate', 'Aquamarine is a blue or cyan variety of beryl and is closely related to emerald.', 7.5, 8.0, 'Be₃Al₂(SiO₃)₆', 'Hexagonal', 1.567, 1.590, 2.66, 2.80, 'Imperfect basal', 'Vitreous'),
  ('Amethyst', 'Silicate', 'Amethyst is a violet variety of quartz often used in jewelry.', 7.0, 7.0, 'SiO₂', 'Hexagonal', 1.544, 1.553, 2.63, 2.65, 'None', 'Vitreous'),
  ('Citrine', 'Silicate', 'Citrine is a variety of quartz whose color ranges from a pale yellow to brown.', 7.0, 7.0, 'SiO₂', 'Hexagonal', 1.544, 1.553, 2.63, 2.65, 'None', 'Vitreous'),
  ('Topaz', 'Silicate', 'Topaz is a silicate mineral that comes in various colors including colorless, blue, brown, orange, gray, yellow, and pink.', 8.0, 8.0, 'Al₂SiO₄(F,OH)₂', 'Orthorhombic', 1.609, 1.643, 3.49, 3.57, 'Perfect basal', 'Vitreous'),
  ('Garnet', 'Silicate', 'Garnets are a group of silicate minerals that have been used since the Bronze Age as gemstones.', 6.5, 7.5, 'X₃Y₂(SiO₄)₃', 'Cubic', 1.72, 1.94, 3.1, 4.3, 'None', 'Vitreous to resinous'),
  ('Opal', 'Silicate', 'Opal is a hydrated amorphous form of silica.', 5.5, 6.5, 'SiO₂·nH₂O', 'Amorphous', 1.450, 1.460, 1.98, 2.20, 'None', 'Vitreous to waxy'),
  ('Peridot', 'Silicate', 'Peridot is gem-quality olivine. Olivine is a silicate mineral that occurs in peridotite rock.', 6.5, 7.0, '(Mg,Fe)₂SiO₄', 'Orthorhombic', 1.654, 1.690, 3.27, 3.37, 'Poor', 'Vitreous'),
  ('Tanzanite', 'Silicate', 'Tanzanite is the blue and violet variety of the mineral zoisite, a calcium aluminium hydroxy sorosilicate.', 6.0, 7.0, 'Ca₂Al₃(SiO₄)₃(OH)', 'Orthorhombic', 1.691, 1.700, 3.10, 3.38, 'Perfect', 'Vitreous'),
  ('Tourmaline', 'Silicate', 'Tourmaline is a crystalline boron silicate mineral compounded with elements such as aluminium, iron, magnesium, sodium, lithium, or potassium.', 7.0, 7.5, 'XY₃Z₆(T₆O₁₈)(BO₃)₃V₃W', 'Hexagonal', 1.624, 1.644, 3.06, 3.22, 'None', 'Vitreous'),
  ('Turquoise', 'Phosphate', 'Turquoise is an opaque, blue-to-green mineral that is a hydrated phosphate of copper and aluminium.', 5.0, 6.0, 'CuAl₆(PO₄)₄(OH)₈·4H₂O', 'Triclinic', 1.610, 1.650, 2.60, 2.90, 'Perfect', 'Waxy to subvitreous'),
  ('Lapis Lazuli', 'Silicate', 'Lapis Lazuli is a deep blue metamorphic rock used as a semi-precious stone that has been prized since antiquity for its intense blue color.', 5.0, 5.5, 'Complex mixture', 'Cubic', 1.50, 1.54, 2.70, 3.00, 'None', 'Dull to waxy'),
  ('Jade', 'Silicate', 'Jade is a term applied to two different metamorphic rocks that are made up of different silicate minerals: nephrite and jadeite.', 6.0, 7.0, 'NaAlSi₂O₆', 'Monoclinic', 1.654, 1.680, 3.30, 3.38, 'Good', 'Vitreous to waxy'),
  ('Moonstone', 'Silicate', 'Moonstone is a variety of the feldspar orthoclase. It is composed of two feldspar minerals, orthoclase and albite.', 6.0, 6.5, '(Na,K)AlSi₃O₈', 'Triclinic to monoclinic', 1.518, 1.526, 2.56, 2.59, 'Perfect', 'Vitreous'),
  ('Morganite', 'Silicate', 'Morganite is a pink to orange-pink variety of beryl.', 7.5, 8.0, 'Be₃Al₂(SiO₃)₆', 'Hexagonal', 1.562, 1.600, 2.71, 2.90, 'Imperfect basal', 'Vitreous'),
  ('Alexandrite', 'Oxide', 'Alexandrite is a variety of chrysoberyl that displays different colors in different light sources.', 8.5, 8.5, 'BeAl₂O₄', 'Orthorhombic', 1.746, 1.755, 3.73, 3.80, 'Good', 'Vitreous');

-- Cut Shapes
INSERT INTO cut_shapes 
  (name, category, description, image_url) 
VALUES
  ('Round Brilliant', 'Faceted', 'The standard round brilliant cut is the most common and popular diamond cut.', '/assets/images/cuts/round-brilliant.png'),
  ('Princess', 'Faceted', 'The princess cut is the second most popular cut for diamonds. It is a square version of the brilliant cut.', '/assets/images/cuts/princess.png'),
  ('Emerald', 'Step Cut', 'The emerald cut is a step cut with elongated shape, large open table, and straight linear facets.', '/assets/images/cuts/emerald.png'),
  ('Asscher', 'Step Cut', 'The Asscher cut is a square step cut with cropped corners, resembling an octagon.', '/assets/images/cuts/asscher.png'),
  ('Cushion', 'Mixed Cut', 'The cushion cut combines a square cut with rounded corners, much like a pillow.', '/assets/images/cuts/cushion.png'),
  ('Radiant', 'Mixed Cut', 'The radiant cut combines the elegance of the emerald cut with the brilliance of the round brilliant cut.', '/assets/images/cuts/radiant.png'),
  ('Oval', 'Faceted', 'The oval cut is an elongated round brilliant cut with similar fire and brilliance.', '/assets/images/cuts/oval.png'),
  ('Marquise', 'Faceted', 'The marquise cut is a football-shaped diamond with pointed ends.', '/assets/images/cuts/marquise.png'),
  ('Pear', 'Faceted', 'The pear cut combines the round and marquise cuts, with a tapered point at one end.', '/assets/images/cuts/pear.png'),
  ('Heart', 'Faceted', 'The heart cut is a modified brilliant cut and is the ultimate symbol of romance.', '/assets/images/cuts/heart.png'),
  ('Standard Cabochon', 'Cabochon', 'A cabochon is a stone that is shaped and polished with a flat bottom and domed top, without faceting.', '/assets/images/cuts/std-cabochon.png'),
  ('High-Dome Cabochon', 'Cabochon', 'A high-dome cabochon has a more pronounced dome than the standard cabochon.', '/assets/images/cuts/high-dome-cabochon.png'),
  ('Double Cabochon', 'Cabochon', 'A double cabochon is rounded on both sides, rather than having a flat bottom.', '/assets/images/cuts/double-cabochon.png'),
  ('Trillion', 'Fancy', 'The trillion cut is a triangular-shaped brilliant cut with three equal sides.', '/assets/images/cuts/trillion.png'),
  ('Baguette', 'Step Cut', 'The baguette cut is a long, rectangular step cut often used as an accent stone.', '/assets/images/cuts/baguette.png'),
  ('Rose', 'Antique', 'The rose cut has a flat bottom with a dome-shaped crown that rises to a single apex, giving it a rose-like appearance.', '/assets/images/cuts/rose.png'),
  ('Briolette', 'Fantasy', 'The briolette is a teardrop-shaped stone covered with triangular or diamond-shaped facets.', '/assets/images/cuts/briolette.png'),
  ('Fantasy', 'Fantasy', 'Fantasy cuts are non-traditional cuts that may incorporate curves, and unusual facet arrangements.', '/assets/images/cuts/fantasy.png');

-- Colors
INSERT INTO colors 
  (name, display_name, hex_code, category) 
VALUES
  ('red', 'Red', '#ff0000', 'Red'),
  ('ruby-red', 'Ruby Red', '#e0115f', 'Red'),
  ('burgundy', 'Burgundy', '#800020', 'Red'),
  ('pink', 'Pink', '#ffc0cb', 'Pink'),
  ('rose', 'Rose', '#ff007f', 'Pink'),
  ('hot-pink', 'Hot Pink', '#ff69b4', 'Pink'),
  ('orange', 'Orange', '#ffa500', 'Orange'),
  ('peach', 'Peach', '#ffe5b4', 'Orange'),
  ('yellow', 'Yellow', '#ffff00', 'Yellow'),
  ('canary', 'Canary', '#ffff99', 'Yellow'),
  ('green', 'Green', '#00ff00', 'Green'),
  ('emerald-green', 'Emerald Green', '#50c878', 'Green'),
  ('forest-green', 'Forest Green', '#228b22', 'Green'),
  ('mint', 'Mint', '#98ff98', 'Green'),
  ('teal', 'Teal', '#008080', 'Green-Blue'),
  ('blue', 'Blue', '#0000ff', 'Blue'),
  ('sapphire-blue', 'Sapphire Blue', '#0f52ba', 'Blue'),
  ('royal-blue', 'Royal Blue', '#4169e1', 'Blue'),
  ('sky-blue', 'Sky Blue', '#87ceeb', 'Blue'),
  ('navy', 'Navy', '#000080', 'Blue'),
  ('purple', 'Purple', '#800080', 'Purple'),
  ('lavender', 'Lavender', '#e6e6fa', 'Purple'),
  ('violet', 'Violet', '#ee82ee', 'Purple'),
  ('amethyst', 'Amethyst', '#9966cc', 'Purple'),
  ('brown', 'Brown', '#a52a2a', 'Brown'),
  ('chocolate', 'Chocolate', '#7b3f00', 'Brown'),
  ('cognac', 'Cognac', '#c77c40', 'Brown'),
  ('champagne', 'Champagne', '#f7e7ce', 'Brown'),
  ('black', 'Black', '#000000', 'Black'),
  ('jet-black', 'Jet Black', '#101010', 'Black'),
  ('white', 'White', '#ffffff', 'White'),
  ('colorless', 'Colorless', '#f8f8ff', 'White'),
  ('multi', 'Multicolor', '#ffffff', 'Multicolor');

-- Color Grades
INSERT INTO color_grades 
  (grade, description) 
VALUES
  ('AAA', 'Top quality, best color and clarity for the stone type'),
  ('AA', 'High quality, excellent color and clarity'),
  ('A', 'Good quality, good color and clarity'),
  ('B', 'Fair quality, acceptable color and clarity'),
  ('C', 'Low quality, poor color and clarity');

-- Clarity Grades for diamonds
INSERT INTO clarity_grades 
  (grade, description, category) 
VALUES
  ('FL', 'Flawless - No inclusions or blemishes visible under 10x magnification', 'Diamond'),
  ('IF', 'Internally Flawless - No inclusions visible under 10x magnification, only small blemishes on the surface', 'Diamond'),
  ('VVS1', 'Very, Very Slightly Included 1 - Inclusions so slight they are difficult for a skilled grader to see under 10x magnification', 'Diamond'),
  ('VVS2', 'Very, Very Slightly Included 2 - Inclusions difficult for a skilled grader to see under 10x magnification', 'Diamond'),
  ('VS1', 'Very Slightly Included 1 - Inclusions difficult to see under 10x magnification', 'Diamond'),
  ('VS2', 'Very Slightly Included 2 - Inclusions somewhat easy to see under 10x magnification', 'Diamond'),
  ('SI1', 'Slightly Included 1 - Inclusions easy to see under 10x magnification, but usually not visible to the naked eye', 'Diamond'),
  ('SI2', 'Slightly Included 2 - Inclusions very easy to see under 10x magnification, sometimes visible to the naked eye', 'Diamond'),
  ('I1', 'Included 1 - Inclusions visible to the naked eye', 'Diamond'),
  ('I2', 'Included 2 - Inclusions easily visible to the naked eye, may affect brilliance', 'Diamond'),
  ('I3', 'Included 3 - Inclusions very obvious to the naked eye, affect brilliance and may affect durability', 'Diamond');

-- Clarity Grades for colored stones
INSERT INTO clarity_grades 
  (grade, description, category) 
VALUES
  ('Loupe Clean', 'No inclusions visible under 10x magnification', 'Colored Stone'),
  ('Eye Clean', 'No inclusions visible to the naked eye, but visible under magnification', 'Colored Stone'),
  ('Slightly Included', 'Minor inclusions visible to the naked eye upon close inspection', 'Colored Stone'),
  ('Moderately Included', 'Noticeable inclusions visible to the naked eye', 'Colored Stone'),
  ('Heavily Included', 'Obvious inclusions visible to the naked eye, may affect brilliance', 'Colored Stone'),
  ('Severely Included', 'Significant inclusions that affect appearance and possibly durability', 'Colored Stone');

-- Mining Locations
INSERT INTO mining_locations 
  (name, country, region, locality, latitude, longitude, description) 
VALUES
  ('Kimberley', 'South Africa', 'Northern Cape', 'Kimberley', -28.7282, 24.7499, 'Historic diamond mining region, home to the Big Hole'),
  ('Argyle', 'Australia', 'Western Australia', 'East Kimberley', -16.7128, 128.3917, 'Famous for producing pink diamonds, now closed'),
  ('Jwaneng', 'Botswana', 'Southern District', 'Jwaneng', -24.5226, 24.7266, 'Known as the richest diamond mine in the world by value'),
  ('Mogok', 'Myanmar', 'Mandalay Region', 'Mogok', 22.9177, 96.5079, 'Historic source of fine rubies, known as "Pigeon''s Blood" rubies'),
  ('Montepuez', 'Mozambique', 'Cabo Delgado Province', 'Montepuez', -13.1288, 38.9981, 'One of the world''s most significant ruby deposits'),
  ('Kashmir', 'India', 'Jammu and Kashmir', 'Zanskar Range', 33.7782, 76.5762, 'Source of the famous Kashmir sapphires, now mostly depleted'),
  ('Ratnapura', 'Sri Lanka', 'Sabaragamuwa Province', 'Ratnapura', 6.7056, 80.3847, 'Known as the "City of Gems", source of high-quality sapphires and other gems'),
  ('Muzo', 'Colombia', 'Boyacá Department', 'Muzo', 5.5322, -74.1040, 'Produces some of the finest emeralds in the world'),
  ('Zambia Mines', 'Zambia', 'Copperbelt Province', 'Kafubu', -13.0500, 28.6392, 'Known for high-quality emeralds with a bluish-green color'),
  ('Minas Gerais', 'Brazil', 'Minas Gerais State', 'Various localities', -18.5122, -44.5550, 'Rich source of various gemstones including aquamarine, topaz, and tourmaline'),
  ('Ilakaka', 'Madagascar', 'Ihorombe Region', 'Ilakaka', -22.6934, 45.2170, 'Major source of sapphires and other gemstones'),
  ('Umba River Valley', 'Tanzania', 'Tanga Region', 'Umba River', -4.4833, 38.5833, 'Known for producing a variety of gemstones including sapphires, garnets, and tourmalines'),
  ('Jegdalek', 'Afghanistan', 'Kabul Province', 'Sarobi District', 34.5853, 69.7517, 'Historic source of high-quality rubies'),
  ('Luc Yen', 'Vietnam', 'Yen Bai Province', 'Luc Yen District', 22.1147, 104.7408, 'Known for fine rubies and sapphires'),
  ('Opal Fields', 'Australia', 'South Australia', 'Coober Pedy', -29.0135, 134.7544, 'World''s largest source of precious opals');

-- Create additional indexes for efficient searches
CREATE INDEX idx_gemstone_families_name ON gemstone_families(name);
CREATE INDEX idx_gemstone_families_category ON gemstone_families(category);
CREATE INDEX idx_cut_shapes_name ON cut_shapes(name);
CREATE INDEX idx_cut_shapes_category ON cut_shapes(category);
CREATE INDEX idx_colors_name ON colors(name);
CREATE INDEX idx_colors_category ON colors(category);
CREATE INDEX idx_clarity_grades_grade ON clarity_grades(grade);
CREATE INDEX idx_clarity_grades_category ON clarity_grades(category);
CREATE INDEX idx_mining_locations_country ON mining_locations(country);