async function uploadDataToGoogleSheet(sheets, spreadsheetId, sheetName, data) {
  const range = `${sheetName}!A1`; // Вкажіть діапазон для вставки даних

  const resource = {
    values: data
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource
  });
}

module.exports = uploadDataToGoogleSheet;
