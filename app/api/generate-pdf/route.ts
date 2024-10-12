import { NextRequest, NextResponse } from "next/server";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export async function POST(req: NextRequest) {
  try {
    // Retrieve data from request body
    const { id } = await req.json();

    // Check if ID is provided
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Dummy invoice data
    const invoice = {
      invNumber: "123456",
      date: "10.10.2024",
      client: {
        name: "Dummy Client",
        clientAddress: "123 Fake Street",
        city: "Faketown",
        zip: "12345",
        country: "Dummyland",
        clientOIB: "12345678901"
      },
      invoiceItems: [
        { description: "Service 1", quantity: 2, price: 100, total: 200 },
        { description: "Service 2", quantity: 1, price: 50, total: 50 }
      ],
      subtotal: 250,
      tax: 62.5,
      total: 312.5
    };

  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docDefinition: any = {
      content: [
        { text: `Invoice no. ${invoice.invNumber}`, style: 'title' },
        { text: `Date: ${invoice.date}`, style: 'paragraph' },
        { text: 'Client:', style: 'sectionHeader' },
        { text: invoice.client.name, style: 'paragraph' },
        { text: `${invoice.client.clientAddress}, ${invoice.client.zip} ${invoice.client.city}`, style: 'paragraph' },
        { text: invoice.client.country, style: 'paragraph' },
        { text: ' ', margin: [0, 5] }, // Space

        // Table with items
        {
          style: 'tableExample',
          table: {
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [{ text: 'Description', style: 'tableHeader' }, { text: 'Quantity', style: 'tableHeader' }, { text: 'Price', style: 'tableHeader' }, { text: 'Total', style: 'tableHeader' }],
              [{ text: 'Service 1' }, { text: '2' }, { text: '100.00' }, { text: '200.00' }],
              [{ text: 'Service 2' }, { text: '1' }, { text: '50.00' }, { text: '50.00' }],
            ]
          }
        },

        // Totals
        { text: ' ', margin: [0, 5] }, // Space
        {
          style: 'tableNoBorders',
          table: {
            widths: ['*', 'auto'],
            body: [
              [{ text: 'Total without tax:', alignment: 'right' }, { text: '250.00 €', alignment: 'right' }],
              [{ text: 'Tax 25%:', alignment: 'right' }, { text: '62.50 €', alignment: 'right' }],
              [{ text: 'Total amount due:', bold: true, alignment: 'right' }, { text: '312.50 €', bold: true, alignment: 'right' }]
            ]
          },
          layout: 'noBorders'
        }
      ],
      styles: {
        title: { fontSize: 18, bold: true },
        paragraph: { fontSize: 12, margin: [0, 5, 0, 5] },
        sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        tableHeader: { fontSize: 12, bold: true, fillColor: '#eeeeee' },
        tableExample: { margin: [0, 5, 0, 15] },
        tableNoBorders: { margin: [0, 5, 0, 15] }
      }
    };

    // Generate PDF as buffer
    const pdfDoc = pdfMake.createPdf(docDefinition);
    const pdfBuffer: Uint8Array = await new Promise((resolve) => {
      pdfDoc.getBuffer((buffer: Uint8Array) => {
        resolve(buffer);
      });
    });
    
    // Set headers for downloading
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invNumber}.pdf"`
    });

    return new Response(pdfBuffer, { headers });
  } catch (error: unknown) {
    // Check if error is an object and has a message
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
