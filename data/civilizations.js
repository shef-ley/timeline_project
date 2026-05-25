// World History Timeline — Civilization Data
// Fields: name, r(region), c(color), s(start year BCE/CE), e(end year), w(Wikipedia slug)
// Negative years = BCE

window.CIVS = [
  // AFRICA
  { name:"Khoisan peoples",            r:"Africa",      c:"#e8aacc", s:-100000, e:2025,  w:"Khoisan" },
  { name:"Tropical forest H-G",        r:"Africa",      c:"#7ec87e", s:-60000,  e:2025,  w:"African_pygmies" },
  { name:"Bantu peoples",              r:"Africa",      c:"#a07840", s:-3000,   e:2025,  w:"Bantu_peoples" },
  { name:"Ancient Egypt",              r:"Africa",      c:"#f0d060", s:-3100,   e:641,   w:"Ancient_Egypt" },
  { name:"Kingdom of Kush",            r:"Africa",      c:"#c07840", s:-1070,   e:350,   w:"Kingdom_of_Kush" },
  { name:"Carthage",                   r:"Africa",      c:"#c06828", s:-814,    e:-146,  w:"Carthage" },
  { name:"Aksumite Empire",            r:"Africa",      c:"#d07030", s:100,     e:940,   w:"Aksumite_Empire" },
  { name:"Mali Empire",                r:"Africa",      c:"#90b040", s:1235,    e:1670,  w:"Mali_Empire" },
  { name:"Songhai Empire",             r:"Africa",      c:"#70b828", s:1430,    e:1591,  w:"Songhai_Empire" },
  { name:"Great Zimbabwe",             r:"Africa",      c:"#50a020", s:1100,    e:1450,  w:"Kingdom_of_Zimbabwe" },
  { name:"Ethiopian Empire",           r:"Africa",      c:"#d06820", s:1270,    e:1974,  w:"Ethiopian_Empire" },
  { name:"Swahili city-states",        r:"Africa",      c:"#40b870", s:700,     e:1700,  w:"Swahili_coast" },

  // EUROPE
  { name:"Minoan civilization",        r:"Europe",      c:"#8898d8", s:-2700,   e:-1100, w:"Minoan_civilization" },
  { name:"Mycenaean Greece",           r:"Europe",      c:"#7888c8", s:-1600,   e:-1100, w:"Mycenaean_Greece" },
  { name:"Ancient Greece",             r:"Europe",      c:"#6888c8", s:-800,    e:-146,  w:"Ancient_Greece" },
  { name:"Roman Republic",             r:"Europe",      c:"#f07820", s:-509,    e:-27,   w:"Roman_Republic" },
  { name:"Roman Empire",               r:"Europe",      c:"#f84800", s:-27,     e:476,   w:"Roman_Empire" },
  { name:"Byzantine Empire",           r:"Europe",      c:"#a050f0", s:395,     e:1453,  w:"Byzantine_Empire" },
  { name:"Frankish / Carolingian",     r:"Europe",      c:"#4880c0", s:481,     e:843,   w:"Carolingian_Empire" },
  { name:"Holy Roman Empire",          r:"Europe",      c:"#5870b0", s:962,     e:1806,  w:"Holy_Roman_Empire" },
  { name:"Ottoman Empire",             r:"Europe",      c:"#20a8e8", s:1299,    e:1922,  w:"Ottoman_Empire" },
  { name:"British Empire",             r:"Europe",      c:"#f06060", s:1497,    e:1997,  w:"British_Empire" },
  { name:"Viking Age",                 r:"Europe",      c:"#70a8d0", s:793,     e:1066,  w:"Viking_Age" },

  // MIDDLE EAST
  { name:"Sumer",                      r:"Middle East", c:"#c8b068", s:-4500,   e:-2004, w:"Sumer" },
  { name:"Akkadian Empire",            r:"Middle East", c:"#d0a848", s:-2334,   e:-2154, w:"Akkadian_Empire" },
  { name:"Babylonian Empire",          r:"Middle East", c:"#c89838", s:-1895,   e:-539,  w:"Babylon" },
  { name:"Assyrian Empire",            r:"Middle East", c:"#b88830", s:-2500,   e:-612,  w:"Assyria" },
  { name:"Achaemenid Empire",          r:"Middle East", c:"#f0a830", s:-550,    e:-330,  w:"Achaemenid_Empire" },
  { name:"Parthian Empire",            r:"Middle East", c:"#d09020", s:-247,    e:224,   w:"Parthian_Empire" },
  { name:"Sassanid Empire",            r:"Middle East", c:"#f0a060", s:224,     e:651,   w:"Sasanian_Empire" },
  { name:"Arab Caliphates",            r:"Middle East", c:"#40c888", s:632,     e:1258,  w:"Caliphate" },
  { name:"Safavid dynasty",            r:"Middle East", c:"#80f0a0", s:1501,    e:1736,  w:"Safavid_dynasty" },
  { name:"Ottoman (Middle East)",      r:"Middle East", c:"#30b8e8", s:1299,    e:1922,  w:"Ottoman_Empire" },

  // SOUTH ASIA
  { name:"Indus Valley Civilization",  r:"South Asia",  c:"#b0c870", s:-3300,   e:-1300, w:"Indus_Valley_Civilisation" },
  { name:"Vedic period",               r:"South Asia",  c:"#f0a870", s:-1500,   e:-500,  w:"Vedic_period" },
  { name:"Maurya Empire",              r:"South Asia",  c:"#80f0c0", s:-322,    e:-185,  w:"Maurya_Empire" },
  { name:"Gupta Empire",               r:"South Asia",  c:"#a0e8a0", s:320,     e:550,   w:"Gupta_Empire" },
  { name:"Chola dynasty",              r:"South Asia",  c:"#90e870", s:300,     e:1279,  w:"Chola_dynasty" },
  { name:"Mughal Empire",              r:"South Asia",  c:"#c090f8", s:1526,    e:1857,  w:"Mughal_Empire" },
  { name:"British Raj",                r:"South Asia",  c:"#f08888", s:1858,    e:1947,  w:"British_Raj" },

  // EAST ASIA
  { name:"Shang dynasty",              r:"East Asia",   c:"#f8e050", s:-1600,   e:-1046, w:"Shang_dynasty" },
  { name:"Zhou dynasty",               r:"East Asia",   c:"#f8c830", s:-1046,   e:-256,  w:"Zhou_dynasty" },
  { name:"Qin dynasty",                r:"East Asia",   c:"#e8a820", s:-221,    e:-206,  w:"Qin_dynasty" },
  { name:"Han dynasty",                r:"East Asia",   c:"#f8b030", s:-206,    e:220,   w:"Han_dynasty" },
  { name:"Tang dynasty",               r:"East Asia",   c:"#40c8f8", s:618,     e:907,   w:"Tang_dynasty" },
  { name:"Song dynasty",               r:"East Asia",   c:"#30b8e8", s:960,     e:1279,  w:"Song_dynasty" },
  { name:"Mongol Empire",              r:"East Asia",   c:"#88b840", s:1206,    e:1368,  w:"Mongol_Empire" },
  { name:"Ming dynasty",               r:"East Asia",   c:"#c040f8", s:1368,    e:1644,  w:"Ming_dynasty" },
  { name:"Qing dynasty",               r:"East Asia",   c:"#f85030", s:1644,    e:1912,  w:"Qing_dynasty" },
  { name:"Khmer Empire",               r:"East Asia",   c:"#60c8f8", s:802,     e:1431,  w:"Khmer_Empire" },
  { name:"Japan (Yamato+)",            r:"East Asia",   c:"#f870b0", s:250,     e:2025,  w:"History_of_Japan" },

  // AMERICAS
  { name:"Paleo-Indians",              r:"Americas",    c:"#a0c870", s:-15000,  e:-8000, w:"Paleo-Indians" },
  { name:"Olmec civilization",         r:"Americas",    c:"#90c850", s:-1500,   e:-400,  w:"Olmec" },
  { name:"Maya civilization",          r:"Americas",    c:"#40c888", s:-2000,   e:1697,  w:"Maya_civilization" },
  { name:"Teotihuacan",                r:"Americas",    c:"#c8a060", s:100,     e:550,   w:"Teotihuacan" },
  { name:"Mississippian cultures",     r:"Americas",    c:"#b0a860", s:700,     e:1600,  w:"Mississippian_culture" },
  { name:"Aztec Empire",               r:"Americas",    c:"#f88030", s:1300,    e:1521,  w:"Aztec_Empire" },
  { name:"Inca Empire",                r:"Americas",    c:"#f8c030", s:1438,    e:1533,  w:"Inca_Empire" },
  { name:"New Spain",                  r:"Americas",    c:"#f06868", s:1521,    e:1821,  w:"New_Spain" },
  { name:"United States",              r:"Americas",    c:"#4868f8", s:1776,    e:2025,  w:"History_of_the_United_States" },
  { name:"Brazil",                     r:"Americas",    c:"#40c860", s:1822,    e:2025,  w:"History_of_Brazil" },

  // OCEANIA
  { name:"Aboriginal Australians",     r:"Oceania",     c:"#a88040", s:-65000,  e:2025,  w:"Indigenous_Australians" },
  { name:"Melanesian peoples",         r:"Oceania",     c:"#80b890", s:-40000,  e:2025,  w:"Melanesia" },
  { name:"Polynesian peoples",         r:"Oceania",     c:"#60b0c8", s:-1000,   e:2025,  w:"Polynesia" },
];
