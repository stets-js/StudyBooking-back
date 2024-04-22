const {TeacherType} = require('./../models/relation');

const createBasicTeacherTypes = async () => {
  try {
    const basicTypes = [
      {
        type: 'soft'
      },
      {
        type: 'tech'
      },
      {type: 'ulti'}
    ];

    for (const type of basicTypes) {
      await TeacherType.findOrCreate({
        where: {type: type.type},
        defaults: type
      });
    }

    console.log('Basic types checked and created if needed!');
  } catch (error) {
    console.error('Error creating types:', error);
  }
};

module.exports = createBasicTeacherTypes;
