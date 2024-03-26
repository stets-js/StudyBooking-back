const ExcelJS = require('exceljs');

exports.createSheet = async (req, res, next) => {
  try {
    // Створюємо новий документ Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    // Додаємо дані до електронної таблиці
    sheet.addRow(['Name', 'Age', 'Country']);
    sheet.addRow(['John Doe', 30, 'USA']);
    sheet.addRow(['Jane Smith', 25, 'UK']);

    // Генеруємо електронну таблицю у форматі Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Відправляємо створену електронну таблицю як відповідь на запит
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="example.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    res.status(500).send('Internal Server Error');
  }
};
