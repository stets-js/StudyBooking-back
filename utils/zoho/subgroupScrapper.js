const courseKeywords = {
  108: ['ADVANCED PROGRAM', 'ADVANCED'],
  109: ['ART', 'ARTS'],
  110: ['INTERNAL'],
  111: ['MARATHON', 'MARATH'],
  112: ['MINI_COURSE', 'MINI'],
  113: ['DEMO'],
  114: ['SCHOOL_FOR_TEACHERS', 'TEACHERS'],
  115: ['SCHOOL'],
  116: ['Design', 'DES'],
  117: ['DIGITAL_DESIGN', 'DIGITAL'],
  118: ['DESIGN_JUNIOR', 'DESIGN_JR', 'DA_JUN', 'JUNIOR_DESIGN'],
  120: ['FrontEnd Eng', 'FRONTEND', 'FRONT-END', 'FE'],
  121: ['FRONTEND_JUNIOR', 'FRONTEND_JR', 'FE_JUN', 'FE_KIDS'],
  122: ['GAMEDEV', 'GAME_DEV', 'GAMING'],
  123: ['Graphic design', 'GRAPHIC', 'GRAPHICS', 'GD'],
  124: ['Logic', 'LOG'],
  125: ['MATH', 'MATHS', 'MAT'],
  126: ['Math 1', 'MATH1'],
  127: ['Math 2', 'MATH2'],
  128: ['Math 3', 'MATH3'],
  129: ['Math 4', 'MATH4'],
  130: ['Math 5', 'MATH5'],
  131: ['Math 6', 'MATH6'],
  132: ['Math Teens (7-9)', 'TEENS_MATH'],
  133: ['MINECRAFT', 'MINE'],
  134: ['Minecraft Ed', 'MINE_ED', 'MINECRAFT_ED'],
  135: ['MINECRAFT_KIDS', 'MINE_KIDS', , 'MINE_JUN'],
  136: ['Motion design', 'MOTION', 'MOTION_DESIGN'],
  137: ['PYTHON', 'PYTHON_PROG'],
  138: ['PYTHON_JUNIOR', 'PYTHON_JR'],
  139: ['Roblox', 'ROBLOX'],
  140: ['Roblox kids', 'ROBLOX_KIDS'],
  141: ['SCRATCH', 'SCR'],
  142: ['DRAWING', 'DRAW'],
  143: ['Web design', 'WEB', 'WEB_DESIGN'],
  144: ['TEST'],
  145: ['LEADER', 'LEAD'],
  119: ['FRONTEND', 'FRONT'],
  147: ['Test123123', 'TEST123'],
  148: ['Summer_Eng', 'SUMMER', 'ENG'],
  149: ['NMT']
};

function findCourseBySubgroupName(streamName) {
  console.log(streamName);
  const lowerStreamName = streamName.toLowerCase();

  for (const [id, keywords] of Object.entries(courseKeywords)) {
    for (const keyword of keywords) {
      if (lowerStreamName.includes(keyword.toLowerCase())) {
        return {id: id, name: keywords[0]};
      }
    }
  }
  return null;
}

module.exports = findCourseBySubgroupName;
