import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const pdfDir = path.resolve('public', 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

async function createSamplePdf(filename, title, refNo, pagesText) {
  const pdfDoc = await PDFDocument.create();
  const timesFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pagesText.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points
    const { width, height } = page.getSize();

    // Top Header line
    page.drawLine({
      start: { x: 40, y: height - 50 },
      end: { x: width - 40, y: height - 50 },
      thickness: 2,
      color: rgb(0.1, 0.3, 0.55),
    });

    // Title / Header text
    page.drawText(title, {
      x: 40,
      y: height - 40,
      size: 14,
      font: timesFont,
      color: rgb(0.1, 0.3, 0.55),
    });

    page.drawText(`Ref: ${refNo} | Page ${i + 1} of ${pagesText.length}`, {
      x: width - 200,
      y: height - 40,
      size: 10,
      font: regularFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Decorative emblem box
    page.drawRectangle({
      x: width / 2 - 25,
      y: height - 120,
      width: 50,
      height: 50,
      borderColor: rgb(0.78, 0.58, 0.16),
      borderWidth: 2,
      color: rgb(0.98, 0.96, 0.92),
    });
    page.drawText('STAMP', {
      x: width / 2 - 18,
      y: height - 100,
      size: 9,
      font: timesFont,
      color: rgb(0.78, 0.58, 0.16),
    });

    // Document Title Banner
    page.drawRectangle({
      x: 40,
      y: height - 170,
      width: width - 80,
      height: 35,
      color: rgb(0.95, 0.96, 0.98),
      borderColor: rgb(0.85, 0.88, 0.92),
      borderWidth: 1,
    });
    page.drawText(pagesText[i].heading || title, {
      x: 60,
      y: height - 155,
      size: 12,
      font: timesFont,
      color: rgb(0.1, 0.3, 0.55),
    });

    // Content paragraphs
    let yPos = height - 210;
    const lines = pagesText[i].paragraphs;
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y: yPos,
        size: 11,
        font: regularFont,
        color: rgb(0.15, 0.15, 0.2),
      });
      yPos -= 24;
    }

    // Bottom Footer
    page.drawLine({
      start: { x: 40, y: 70 },
      end: { x: width - 40, y: 70 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText(`Official Document File: public/pdfs/${filename}`, {
      x: 50,
      y: 50,
      size: 9,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(pdfDir, filename), pdfBytes);
  console.log(`Created ${filename} (${pdfBytes.length} bytes)`);
}

async function main() {
  await createSamplePdf('sample1.pdf', 'Budget Approval Request 2026', 'IEC-2026-001', [
    {
      heading: 'Executive Overview & Financial Proposal',
      paragraphs: [
        'To: Director General Office',
        'Subject: Operational Budget Authorization for Annual Cultural Symposium 2026',
        'Date: August 12, 2026',
        '',
        'We respectfully submit the detailed financial estimate breakdown for the upcoming symposium.',
        'The preparatory committee has finalized host arrangements, technical equipment, and media coverage.',
        'Itemized Budget Allocation:',
        '1. Venue and Stage AV Equipment: 45,000 EGP',
        '2. Delegate Kits & Publications: 22,500 EGP',
        '3. External Guest Hospitality: 35,000 EGP',
        '4. Keynote Speaker Honorariums: 60,000 EGP',
        'Total Requested Fund: 175,000 EGP',
        '',
        'Kindly review and approve for immediate financial allocation and routing.'
      ]
    },
    {
      heading: 'Detailed Expenditure Breakdown & Signatures',
      paragraphs: [
        'Section 2: Cost Optimization Report',
        'Costs have been optimized by 15% compared to previous year fiscal period.',
        'Procurement department has audited all vendor bids.',
        '',
        'Signatures & Authorization:',
        'Prepared By: Cultural Affairs Department',
        'Reviewed By: Budget & Finance Committee Head',
        'Approved By: Pending Executive Endorsement (Annotation Required)'
      ]
    }
  ]);

  await createSamplePdf('sample2.pdf', 'Digital Transformation Seminar Invitation', 'IEC-2026-002', [
    {
      heading: 'Official Invitation & Keynote Workshop Request',
      paragraphs: [
        'From: Ministry of Communications & Information Technology',
        'To: Director General - Administrative Correspondence Authority',
        'Ref: EXT-9942/2026',
        '',
        'We cordially invite your esteemed organization to participate in the upcoming',
        'National Seminar on Digital Transformation and Smart Electronic Archiving.',
        '',
        'Event Details:',
        'Date: August 25, 2026',
        'Location: International Convention Center, Hall A',
        '',
        'We request your delegation to present a 30-minute demonstration on your successful',
        'implementation of the Electronic Marginal Notes & Routing System.'
      ]
    }
  ]);

  await createSamplePdf('sample3.pdf', 'Semi-Annual Internal Audit Report', 'IEC-2026-003', [
    {
      heading: 'Internal Audit & Administrative Compliance',
      paragraphs: [
        'From: Internal Audit & Governance Department',
        'To: Office of the Director General',
        'Period: January - June 2026',
        '',
        'Key Findings & Performance Indicators:',
        '1. Correspondence processing SLA compliance increased from 68% to 91%.',
        '2. Queue turnaround time for pending marginal notes reduced under 24 hours.',
        '3. Digital archiving completion rate reached 99.4%.',
        '',
        'Recommendations:',
        'A. Enable automatic alert notifications for items pending over 24 hours.',
        'B. Conduct monthly cross-departmental review sessions.'
      ]
    }
  ]);

  await createSamplePdf('sample4.pdf', 'Human Resources Training MOU', 'IEC-2026-004', [
    {
      heading: 'Memorandum of Understanding for Strategic Training',
      paragraphs: [
        'Between: General Authority for Administrative Development',
        'And: Higher Institute for Management & Leadership',
        '',
        'Articles of Agreement:',
        'Article 1: The Institute will deliver 12 specialized executive workshops annually.',
        'Article 2: Partner staff will receive a 30% preferred training discount.',
        'Article 3: Valid for one full calendar year, renewable upon mutual consent.',
        '',
        'Pending Final Executive Signature and Seal.'
      ]
    }
  ]);
}

main().catch(console.error);
