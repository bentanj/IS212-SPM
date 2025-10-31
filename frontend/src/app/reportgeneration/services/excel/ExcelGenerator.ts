// src/services/excel/ExcelGenerator.ts
import * as XLSX from 'xlsx';

/**
 * Options for Excel generation
 */
export interface ExcelOptions {
  fileName: string;
  sheetName?: string;
}

/**
 * Generate Excel file from array of objects
 * 
 * Takes any array of objects and converts it to Excel:
 * - Object keys become column headers (snake_case/camelCase → Title Case)
 * - Each object becomes a row
 * - Auto-fits column widths
 * - Styles header row (bold, blue background)
 * - Downloads file automatically
 * 
 * @param data - Array of objects (each object = 1 row)
 * @param options - File name and optional sheet name
 */
export function generateExcel(
  data: Array<Record<string, any>>,
  options: ExcelOptions
): void {
  // Validate input
  if (!data || data.length === 0) {
    alert('No data available to export');
    return;
  }

  try {
    // Convert keys to readable headers
    const formattedData = data.map(row => {
      const formattedRow: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        const readableHeader = convertToTitleCase(key);
        formattedRow[readableHeader] = row[key];
      });
      return formattedRow;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Style header row (bold + blue background)
    styleHeaderRow(worksheet, Object.keys(formattedData[0]));

    // Auto-fit column widths
    autoFitColumns(worksheet, formattedData);

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

    // Download file
    XLSX.writeFile(workbook, `${options.fileName}.xlsx`);

    console.log(`✓ Excel file generated: ${options.fileName}.xlsx`);
  } catch (error) {
    console.error('Error generating Excel:', error);
    alert('Failed to generate Excel file');
  }
}

/**
 * Convert key to Title Case
 * Examples:
 *   user_name → User Name
 *   totalHours → Total Hours
 *   taskID → Task ID
 */
function convertToTitleCase(key: string): string {
  // Handle snake_case
  if (key.includes('_')) {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Handle camelCase
  return key
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Style the header row (first row)
 */
function styleHeaderRow(worksheet: XLSX.WorkSheet, headers: string[]): void {
  headers.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (!worksheet[cellAddress]) return;

    worksheet[cellAddress].s = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: '2196F3' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };
  });
}

/**
 * Auto-fit column widths based on content
 */
function autoFitColumns(worksheet: XLSX.WorkSheet, data: any[]): void {
  const headers = Object.keys(data[0]);
  const columnWidths = headers.map(header => {
    // Start with header length
    let maxWidth = header.length;

    // Check each row
    data.forEach(row => {
      const cellValue = String(row[header] || '');
      maxWidth = Math.max(maxWidth, cellValue.length);
    });

    // Add padding, set min/max limits
    return { wch: Math.min(Math.max(maxWidth + 2, 10), 50) };
  });

  worksheet['!cols'] = columnWidths;
}