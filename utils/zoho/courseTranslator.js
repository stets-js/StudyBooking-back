const courseTranslator = {
  'advanced program': {id: 108, name: 'ADVANCED PROGRAM'},
  'Art JUN': {id: 109, name: 'ART'},
  'Art KIDS': {id: 109, name: 'ART'},
  'Art JUN Andr': {id: 109, name: 'ART'},
  'Art KIDS Andr': {id: 109, name: 'ART'},
  'design-junior': {id: 118, name: 'DESIGN_JUNIOR'},
  'digital-design': {id: 117, name: 'DIGITAL_DESIGN'},
  english: {id: 110, name: 'INTERNAL'},
  frontend: {id: 119, name: 'FRONTEND'},
  'Frontend REC': {id: 119, name: 'FRONTEND'},
  'frontend-jun': {id: 121, name: 'FRONTEND_JUNIOR'},
  gamedev: {id: 122, name: 'GAMEDEV'},
  'Graphic Design REC': {id: 123, name: 'Graphic design'},
  'graphic-design': {id: 123, name: 'Graphic design'},
  'Indiv FE Light': {id: 119, name: 'FRONTEND'},
  'Indiv FE Normal': {id: 119, name: 'FRONTEND'},
  'Indiv FE Super': {id: 119, name: 'FRONTEND'},
  'Indiv Jun Light': {id: 110, name: 'INTERNAL'},
  'Indiv Jun Normal': {id: 110, name: 'INTERNAL'},
  'Indiv Jun Super': {id: 110, name: 'INTERNAL'},
  'Indiv Kids Light': {id: 110, name: 'INTERNAL'},
  'Indiv Kids Normal': {id: 110, name: 'INTERNAL'},
  'Indiv Kids Super': {id: 110, name: 'INTERNAL'},
  'Indiv Paid Trial Jun': {id: 110, name: 'INTERNAL'},
  'Indiv Paid Trial Kids': {id: 110, name: 'INTERNAL'},
  'Indiv Paid Trial Pro': {id: 110, name: 'INTERNAL'},
  'Indiv Pro Light': {id: 110, name: 'INTERNAL'},
  'Indiv Pro Normal': {id: 110, name: 'INTERNAL'},
  'Indiv Pro Super': {id: 110, name: 'INTERNAL'},
  leader: {id: 145, name: 'LEADER'},
  'leader 1 session': {id: 145, name: 'LEADER'},
  'leader premium': {id: 145, name: 'LEADER'},
  'leader standard': {id: 145, name: 'LEADER'},
  logic: {id: 124, name: 'Logic'},
  'math 1': {id: 126, name: 'Math 1'},
  'math 2': {id: 127, name: 'Math 2'},
  'math 3': {id: 128, name: 'Math 3'},
  'math 4': {id: 129, name: 'Math 4'},
  'math 5-6': {id: 130, name: 'Math 5'},
  'math 7-9': {id: 132, name: 'Math Teens (7-9)'},
  'Math NEW': {id: 125, name: 'MATH'},
  minecraft: {id: 133, name: 'MINECRAFT'},
  'minecraft TAB': {id: 134, name: 'Minecraft Ed'},
  'minecraft-kids': {id: 135, name: 'MINECRAFT_KIDS'},
  'minecraft-kids TAB': {id: 134, name: 'Minecraft Ed'},
  'motion-design': {id: 136, name: 'Motion design'},
  NMT: {id: 110, name: 'INTERNAL'},
  'NMT 1 product': {id: 110, name: 'INTERNAL'},
  'NMT 2 products': {id: 110, name: 'INTERNAL'},
  'NMT 3 products': {id: 110, name: 'INTERNAL'},
  'NMT 4 products': {id: 110, name: 'INTERNAL'},
  python: {id: 137, name: 'PYTHON'},
  'python Advanced': {id: 137, name: 'PYTHON'},
  'python Jun': {id: 138, name: 'PYTHON_JUNIOR'},
  'python Pro': {id: 137, name: 'PYTHON'},
  roblox: {id: 139, name: 'Roblox'},
  'roblox KIDS': {id: 140, name: 'Roblox kids'},
  scratch: {id: 141, name: 'SCRATCH'},
  Summer_Jun: {id: 110, name: 'INTERNAL'},
  Summer_Kids: {id: 110, name: 'INTERNAL'},
  Summer_Pro: {id: 110, name: 'INTERNAL'},
  'web-design': {id: 143, name: 'Web design'}
};

function translateCourse(courseName) {
  return courseTranslator[courseName] || {id: null, name: 'UNKNOWN COURSE'};
}

module.exports = translateCourse;
