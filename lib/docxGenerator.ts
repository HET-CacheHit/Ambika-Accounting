import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  ShadingType,
} from 'docx';
import { Expense, AccountSettings } from './types';

// Convert base64 data URL to Uint8Array and type for docx ImageRun
function getBase64ImageDetails(base64DataUrl: string): { bytes: Uint8Array; type: 'png' | 'jpg' | 'gif' | 'bmp' } | null {
  try {
    const parts = base64DataUrl.split(',');
    if (parts.length < 2) return null;
    
    let imgType: 'png' | 'jpg' | 'gif' | 'bmp' = 'png';
    const header = parts[0].toLowerCase();
    if (header.includes('jpeg') || header.includes('jpg')) imgType = 'jpg';
    else if (header.includes('gif')) imgType = 'gif';
    else if (header.includes('bmp')) imgType = 'bmp';

    const base64 = parts[1];
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return { bytes, type: imgType };
  } catch (e) {
    console.error('Error parsing base64 image for docx', e);
    return null;
  }
}

export async function generateExpenseWordDocument(
  expenses: Expense[],
  settings: AccountSettings,
  filterDescription: string = 'All Expenses Statement'
): Promise<Blob> {
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = settings.initialBalance - totalExpense;
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currency = settings.currencySymbol || '₹';

  // Table header row
  const tableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 15, type: WidthType.PERCENTAGE },
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true, color: 'FFFFFF' })] })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Title / Description', bold: true, color: 'FFFFFF' })] })],
        }),
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true, color: 'FFFFFF' })] })],
        }),
        new TableCell({
          width: { size: 18, type: WidthType.PERCENTAGE },
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [new Paragraph({ children: [new TextRun({ text: 'Payment Method', bold: true, color: 'FFFFFF' })] })],
        }),
        new TableCell({
          width: { size: 17, type: WidthType.PERCENTAGE },
          shading: { fill: '1E293B', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: `Amount (${currency})`, bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
      ],
    }),
  ];

  // Table data rows
  expenses.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const bgFill = isEven ? 'F8FAFC' : 'FFFFFF';

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.date, size: 18 })] })],
          }),
          new TableCell({
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: item.title, bold: true, size: 20 }),
                  item.receiptImage ? new TextRun({ text: '  [Bill Attached]', italics: true, color: '0D9488', size: 16 }) : new TextRun({ text: '' }),
                ],
              }),
            ],
          }),
          new TableCell({
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.category, size: 18 })] })],
          }),
          new TableCell({
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: item.paymentMethod, size: 18 })] })],
          }),
          new TableCell({
            shading: { fill: bgFill, type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${currency}${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  // Table Total Row
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 4,
          shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'TOTAL EXPENDITURE:', bold: true, size: 22, color: '0F172A' })],
            }),
          ],
        }),
        new TableCell({
          shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: `${currency}${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                  bold: true,
                  size: 22,
                  color: 'DC2626',
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Build Bill Screenshots section elements
  const billScreenshotsElements: Paragraph[] = [];

  const expensesWithBills = expenses.filter((e) => e.receiptImage);

  if (expensesWithBills.length > 0) {
    billScreenshotsElements.push(
      new Paragraph({
        text: 'Attached Bill Receipts & Proof Screenshots',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This section contains ${expensesWithBills.length} verified bill screenshot(s) associated with your accounting entries.`,
            italics: true,
            color: '64748B',
          }),
        ],
        spacing: { after: 300 },
      })
    );

    expensesWithBills.forEach((exp, idx) => {
      billScreenshotsElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Receipt #${idx + 1}: ${exp.title}`,
              bold: true,
              size: 22,
              color: '0F172A',
            }),
          ],
          spacing: { before: 300, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Date: `, bold: true }),
            new TextRun({ text: `${exp.date}  |  ` }),
            new TextRun({ text: `Amount: `, bold: true }),
            new TextRun({ text: `${currency}${exp.amount.toLocaleString()}  |  ` }),
            new TextRun({ text: `Category: `, bold: true }),
            new TextRun({ text: `${exp.category}  |  ` }),
            new TextRun({ text: `Method: `, bold: true }),
            new TextRun({ text: `${exp.paymentMethod}` }),
          ],
          spacing: { after: 150 },
        })
      );

      if (exp.notes) {
        billScreenshotsElements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Note: `, bold: true, italics: true }),
              new TextRun({ text: exp.notes, italics: true }),
            ],
            spacing: { after: 150 },
          })
        );
      }

      // Embed base64 image
      if (exp.receiptImage) {
        const imgDetails = getBase64ImageDetails(exp.receiptImage);
        if (imgDetails) {
          billScreenshotsElements.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: imgDetails.bytes,
                  type: imgDetails.type,
                  transformation: {
                    width: 460,
                    height: 300,
                  },
                }),
              ],
              spacing: { after: 400 },
            })
          );
        } else {
          billScreenshotsElements.push(
            new Paragraph({
              children: [new TextRun({ text: '[Unable to render receipt image]', color: 'EF4444', italics: true })],
              spacing: { after: 300 },
            })
          );
        }
      }
    });
  } else {
    billScreenshotsElements.push(
      new Paragraph({
        text: 'Attached Bill Receipts',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 150 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'No bill screenshots attached for the selected expenses in this report.',
            italics: true,
            color: '64748B',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Create Docx Document structure
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header title
          new Paragraph({
            text: 'AMBIKA ACCOUNTING',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'Personal Financial Expense & Balance Report', bold: true, size: 24, color: '2563EB' }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Generated on: ${todayFormatted}  |  Report Scope: ${filterDescription}`, size: 18, color: '64748B' }),
            ],
            spacing: { after: 400 },
          }),

          // Financial Summary Card Box Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'INITIAL BALANCE', size: 16, bold: true, color: '475569' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${currency}${settings.initialBalance.toLocaleString('en-IN')}`, size: 26, bold: true, color: '2563EB' })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    shading: { fill: 'FEF2F2', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TOTAL EXPENSES', size: 16, bold: true, color: '991B1B' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${currency}${totalExpense.toLocaleString('en-IN')}`, size: 26, bold: true, color: 'DC2626' })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 34, type: WidthType.PERCENTAGE },
                    shading: { fill: remainingBalance >= 0 ? 'F0FDF4' : 'FEF2F2', type: ShadingType.CLEAR },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'REMAINING BALANCE', size: 16, bold: true, color: remainingBalance >= 0 ? '166534' : '991B1B' })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${currency}${remainingBalance.toLocaleString('en-IN')}`, size: 26, bold: true, color: remainingBalance >= 0 ? '16A34A' : 'DC2626' })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 300 } }),

          // Expense Details Section
          new Paragraph({
            text: 'Itemized Expenses Ledger',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),

          // Ledger Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Attached Bill Screenshots Section
          ...billScreenshotsElements,

          // Footer
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '--- End of Ambika Accounting Statement ---',
                italics: true,
                size: 16,
                color: '94A3B8',
              }),
            ],
            spacing: { before: 500 },
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}
