// Parent → child relationships between civilizations
// type: succession | influence | conquest | emergence | split

window.BRANCHES = [
  // Africa
  { f:"Ancient Egypt",             t:"Kingdom of Kush",        type:"influence"  },
  { f:"Bantu peoples",             t:"Swahili city-states",    type:"emergence"  },
  { f:"Bantu peoples",             t:"Great Zimbabwe",         type:"emergence"  },
  { f:"Aksumite Empire",           t:"Ethiopian Empire",       type:"succession" },
  // Europe
  { f:"Minoan civilization",       t:"Mycenaean Greece",       type:"influence"  },
  { f:"Mycenaean Greece",          t:"Ancient Greece",         type:"succession" },
  { f:"Ancient Greece",            t:"Roman Republic",         type:"influence"  },
  { f:"Roman Republic",            t:"Roman Empire",           type:"succession" },
  { f:"Roman Empire",              t:"Byzantine Empire",       type:"split"      },
  { f:"Frankish / Carolingian",    t:"Holy Roman Empire",      type:"succession" },
  // Middle East
  { f:"Sumer",                     t:"Akkadian Empire",        type:"emergence"  },
  { f:"Akkadian Empire",           t:"Babylonian Empire",      type:"succession" },
  { f:"Assyrian Empire",           t:"Achaemenid Empire",      type:"succession" },
  { f:"Achaemenid Empire",         t:"Parthian Empire",        type:"succession" },
  { f:"Parthian Empire",           t:"Sassanid Empire",        type:"succession" },
  { f:"Sassanid Empire",           t:"Arab Caliphates",        type:"conquest"   },
  { f:"Arab Caliphates",           t:"Safavid dynasty",        type:"emergence"  },
  // South Asia
  { f:"Indus Valley Civilization", t:"Vedic period",           type:"succession" },
  { f:"Vedic period",              t:"Maurya Empire",          type:"emergence"  },
  { f:"Maurya Empire",             t:"Gupta Empire",           type:"succession" },
  { f:"Mughal Empire",             t:"British Raj",            type:"conquest"   },
  // East Asia
  { f:"Shang dynasty",             t:"Zhou dynasty",           type:"succession" },
  { f:"Zhou dynasty",              t:"Qin dynasty",            type:"succession" },
  { f:"Qin dynasty",               t:"Han dynasty",            type:"succession" },
  { f:"Han dynasty",               t:"Tang dynasty",           type:"succession" },
  { f:"Tang dynasty",              t:"Song dynasty",           type:"succession" },
  { f:"Song dynasty",              t:"Ming dynasty",           type:"succession" },
  { f:"Ming dynasty",              t:"Qing dynasty",           type:"succession" },
  // Americas
  { f:"Paleo-Indians",             t:"Olmec civilization",     type:"emergence"  },
  { f:"Olmec civilization",        t:"Maya civilization",      type:"influence"  },
  { f:"Maya civilization",         t:"Aztec Empire",           type:"influence"  },
  { f:"Aztec Empire",              t:"New Spain",              type:"conquest"   },
  { f:"Inca Empire",               t:"Brazil",                 type:"conquest"   },
  { f:"Paleo-Indians",             t:"Mississippian cultures", type:"emergence"  },
];
