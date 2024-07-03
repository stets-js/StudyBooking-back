const createSheetForCourse = async (sheets, spreadsheetId, courseName) => {
  const request = {
    spreadsheetId,
    resource: {
      requests: [
        {
          addSheet: {
            properties: {
              title: courseName
            }
          }
        }
      ]
    }
  };

  await sheets.spreadsheets.batchUpdate(request);
};

module.exports = createSheetForCourse;
