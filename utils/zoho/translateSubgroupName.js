const generateNames = name => {
  const Sequelize = require('sequelize');
  const Op = Sequelize.Op;
  const names = [
    {
      name: {
        [Op.iLike]: `${name}`
      }
    },
    {
      name: {
        [Op.iLike]: `${name.replace('GoITeens_UA_', '')}`
      }
    }
  ];

  const changedSubgroup = name.includes('Підгрупа');
  if (changedSubgroup) {
    let new_name = name.replace('GoITeens_UA_', '');
    let subgroupNumber = new_name.match(/\d+/)[0];
    new_name = new_name.replace(/Підгрупа \d+ /, '');
    new_name = new_name.replace('UA_', '');

    // Replace "Підгрупа" patterns and add variations
    names.push(
      {
        name: {
          [Op.iLike]: `${new_name} (${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} група ${subgroupNumber}`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ${subgroupNumber} підгрупа`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} підгрупа ${subgroupNumber}`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ${subgroupNumber} група`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} (група ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ( група ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} (${subgroupNumber} група)`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ( ${subgroupNumber} група)`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} (підгрупа ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ( підгрупа ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} (${subgroupNumber} підгрупа)`
        }
      },
      {
        name: {
          [Op.iLike]: `${new_name} ( ${subgroupNumber} підгрупа)`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} (${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} група ${subgroupNumber}`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ${subgroupNumber} підгрупа`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} підгрупа ${subgroupNumber}`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ${subgroupNumber} група`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} (група ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ( група ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} (${subgroupNumber} група)`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ( ${subgroupNumber} група)`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} (підгрупа ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ( підгрупа ${subgroupNumber})`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} (${subgroupNumber} підгрупа)`
        }
      },
      {
        name: {
          [Op.iLike]: `GoIteens_UA_${new_name} ( ${subgroupNumber} підгрупа)`
        }
      }
    );
  }

  return names;
};

module.exports = generateNames;
