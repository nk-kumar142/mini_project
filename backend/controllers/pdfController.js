const PDFDocument = require('pdfkit');
const Allocation = require('../models/Allocation');
const Exam = require('../models/Exam');
const Hall = require('../models/Hall');
const User = require('../models/User');

// @desc    Download Hall Ticket
// @route   GET /api/pdf/hall-ticket/:allocationId
// @access  Student
const downloadHallTicket = async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.allocationId)
            .populate('studentId')
            .populate('hallId')
            .populate('examId');

        if (!allocation) {
            return res.status(404).json({ message: 'Allocation not found' });
        }

        // Ownership check — student can only download their own ticket
        if (allocation.studentId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const doc = new PDFDocument({ margin: 50 });

        const studentReg = allocation.studentId.registerNumber || allocation.studentId.name.replace(/\s+/g, '_');
        const filename = encodeURIComponent(`HallTicket_${studentReg}.pdf`);

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Pipe MUST come before any doc writes
        doc.pipe(res);

        const primaryColor = '#1e3a8a';
        const bgGray = '#f3f4f6';

        // ── Header Banner ──────────────────────────────────────────────────────
        doc.rect(0, 0, 612, 110).fill(primaryColor);
        doc.fillColor('white')
            .fontSize(22).font('Helvetica-Bold')
            .text('EXAMINATION DEPARTMENT', 50, 28, { align: 'center' });
        doc.fontSize(14).font('Helvetica')
            .text('OFFICIAL HALL TICKET', { align: 'center' });

        doc.fillColor('black');

        // ── Outer box ──────────────────────────────────────────────────────────
        doc.rect(40, 130, 532, 480).stroke();

        // ── Helper ─────────────────────────────────────────────────────────────
        let y = 130;
        const sectionHeader = (title) => {
            doc.rect(40, y, 532, 22).fill(bgGray).stroke();
            doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11)
                .text(title, 52, y + 6);
            doc.fillColor('black');
            y += 32;
        };
        const row = (label, value) => {
            doc.font('Helvetica-Bold').fontSize(10).text(label, 60, y);
            doc.font('Helvetica').fontSize(10).text(`:  ${value || '—'}`, 200, y);
            y += 22;
        };

        // ── Student Info ───────────────────────────────────────────────────────
        sectionHeader('STUDENT INFORMATION');
        row('Name', allocation.studentId.name?.toUpperCase());
        row('Register Number', allocation.studentId.registerNumber);
        row('Department', allocation.studentId.department);
        row('Year', allocation.studentId.year ? `${allocation.studentId.year} Year` : '—');

        // Seat highlight
        doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Seat Number', 60, y);
        doc.font('Helvetica-Bold').fontSize(20).fillColor(primaryColor).text(`${allocation.seatNumber}`, 200, y - 4);
        doc.fillColor('black');
        y += 30;

        // ── Exam Details ───────────────────────────────────────────────────────
        y += 5;
        sectionHeader('EXAM DETAILS');
        row('Exam Name', allocation.examId?.examName);
        row('Subject', allocation.examId?.subject);
        row('Date', allocation.examId?.examDate ? new Date(allocation.examId.examDate).toDateString() : '—');
        row('Session', allocation.examId?.session);

        // ── Hall Info ──────────────────────────────────────────────────────────
        y += 5;
        sectionHeader('HALL ALLOCATION');
        row('Hall Name', allocation.hallId?.hallName);
        row('Building', allocation.hallId?.building);

        // ── Signature ─────────────────────────────────────────────────────────
        doc.font('Helvetica').fontSize(10).fillColor('black')
            .text('_________________________', 390, 660)
            .text('Controller of Examinations', 395, 675);

        // ── Footer ─────────────────────────────────────────────────────────────
        doc.fontSize(8).fillColor('gray')
            .text(
                'Important: Bring this hall ticket and a valid ID card to every examination.',
                40, 720, { align: 'center', width: 532 }
            );

        doc.end();

    } catch (error) {
        console.error('PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Download All Allocations as PDF
// @route   GET /api/pdf/allocations
// @access  Admin
const downloadAllocationList = async (req, res) => {
    try {
        const allocations = await Allocation.find({})
            .populate('studentId')
            .populate('hallId')
            .populate('examId');

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename="AllocationList.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('EXAMINATION ALLOCATION LIST', { align: 'center' });
        doc.moveDown();

        allocations.forEach((alc, index) => {
            doc.font('Helvetica-Bold').fontSize(12).text(
                `${index + 1}. ${alc.studentId?.name} (${alc.studentId?.registerNumber}) — Hall: ${alc.hallId?.hallName} — Seat: ${alc.seatNumber}`
            );
            doc.font('Helvetica').fontSize(11).text(
                `   Exam: ${alc.examId?.examName} | Subject: ${alc.examId?.subject}`
            );
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (error) {
        console.error('Allocation PDF Error:', error);
        if (!res.headersSent) res.status(500).json({ message: error.message });
    }
};

// @desc    Download Unified Hall Ticket (All subjects in one)
// @route   GET /api/pdf/my-hall-ticket
// @access  Student
const downloadUnifiedHallTicket = async (req, res) => {
    try {
        const allocations = await Allocation.find({ studentId: req.user._id })
            .populate('studentId')
            .populate('hallId')
            .populate('examId');

        console.log(`[PDF] Found ${allocations?.length} allocations for user ${req.user._id}`);

        if (!allocations || allocations.length === 0) {
            return res.status(404).json({ message: 'No allocations found for this student.' });
        }

        const student = allocations[0].studentId;
        const studentReg = student.registerNumber || student.name.replace(/\s+/g, '_');
        const filename = encodeURIComponent(`HallTicket_${studentReg}.pdf`);

        // Buffer-based: collect all PDF data, send once complete
        const chunks = [];
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 0, bottom: 30, left: 30, right: 30 },
            info: { Title: 'Hall Ticket', Author: 'Examination Department' }
        });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            res.end(pdfBuffer);
            console.log(`[PDF] Successfully sent ${pdfBuffer.length} bytes`);
        });
        doc.on('error', err => {
            console.error('[PDF] Error:', err);
            if (!res.headersSent) res.status(500).json({ message: err.message });
        });

        const W = 595;   // A4 width in points
        const navy = '#1a3566';
        const gold = '#c8a84b';
        const lightBlue = '#eef2ff';
        const dark = '#1e293b';
        const gray = '#64748b';

        // ═══════════════════════════════════════════════════════
        // HEADER
        // ═══════════════════════════════════════════════════════
        doc.rect(0, 0, W, 75).fill(navy);

        // Gold accent line
        doc.rect(0, 73, W, 3).fill(gold);

        doc.fillColor('white').font('Helvetica-Bold').fontSize(18)
            .text('EXAMINATION DEPARTMENT', 0, 14, { align: 'center', width: W });
        doc.font('Helvetica').fontSize(10).fillColor(gold)
            .text('OFFICIAL HALL TICKET', 0, 38, { align: 'center', width: W });
        doc.font('Helvetica').fontSize(8).fillColor('#b0c0e0')
            .text('— Present this ticket at the examination hall —', 0, 56, { align: 'center', width: W });

        // ═══════════════════════════════════════════════════════
        // STUDENT DETAILS BAND
        // ═══════════════════════════════════════════════════════
        const sdY = 85;
        doc.rect(30, sdY, W - 60, 68).fill(lightBlue).stroke('#c7d7fa');

        doc.fillColor(navy).font('Helvetica-Bold').fontSize(7)
            .text('STUDENT INFORMATION', 40, sdY + 6, { characterSpacing: 1.5 });

        // Row 1
        const col1x = 40, col2x = 180, col3x = 330, col4x = 450;
        const r1y = sdY + 18;
        doc.fillColor(gray).font('Helvetica').fontSize(7).text('Name', col1x, r1y);
        doc.fillColor(dark).font('Helvetica-Bold').fontSize(8.5)
            .text(student.name?.toUpperCase() || '—', col1x, r1y + 9);

        doc.fillColor(gray).font('Helvetica').fontSize(7).text('Register Number', col2x, r1y);
        doc.fillColor(dark).font('Helvetica-Bold').fontSize(8.5)
            .text(student.registerNumber || '—', col2x, r1y + 9);

        doc.fillColor(gray).font('Helvetica').fontSize(7).text('Department', col3x, r1y);
        doc.fillColor(dark).font('Helvetica-Bold').fontSize(8.5)
            .text(student.department || '—', col3x, r1y + 9, { width: 110 });

        doc.fillColor(gray).font('Helvetica').fontSize(7).text('Year', col4x, r1y);
        doc.fillColor(dark).font('Helvetica-Bold').fontSize(8.5)
            .text(student.year || '—', col4x, r1y + 9);

        // ═══════════════════════════════════════════════════════
        // EXAM SCHEDULE TABLE
        // ═══════════════════════════════════════════════════════
        const tStart = sdY + 72 + 8;

        // Table heading
        doc.fillColor(navy).font('Helvetica-Bold').fontSize(7)
            .text('EXAMINATION SCHEDULE', 30, tStart, { characterSpacing: 1.5 });

        const thY = tStart + 12;
        doc.rect(30, thY, W - 60, 16).fill(dark);

        // Column X positions
        const c = { date: 35, session: 120, time: 185, subject: 265, hall: 395, building: 455, seat: 520 };

        doc.fillColor('white').font('Helvetica-Bold').fontSize(7);
        doc.text('DATE', c.date, thY + 5, { width: 80 });
        doc.text('SESSION', c.session, thY + 5, { width: 62 });
        doc.text('TIME', c.time, thY + 5, { width: 75 });
        doc.text('SUBJECT', c.subject, thY + 5, { width: 125 });
        doc.text('HALL', c.hall, thY + 5, { width: 55 });
        doc.text('BUILDING', c.building, thY + 5, { width: 60 });
        doc.text('SEAT', c.seat, thY + 5, { width: 35, align: 'center' });

        let rowY = thY + 16;
        const rowH = 20;

        allocations.forEach((alc, idx) => {
            const bg = idx % 2 === 0 ? '#f8faff' : '#ffffff';
            doc.rect(30, rowY, W - 60, rowH).fill(bg);

            // Light divider
            doc.rect(30, rowY + rowH - 0.5, W - 60, 0.5).fill('#e2e8f0');

            const dateStr = alc.examId?.examDate
                ? new Date(alc.examId.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';

            doc.fillColor('#334155').font('Helvetica').fontSize(7.5);
            doc.text(dateStr, c.date, rowY + 6, { width: 80 });
            doc.text(alc.examId?.session || '—', c.session, rowY + 6, { width: 62 });
            doc.text(alc.examId?.time || '—', c.time, rowY + 6, { width: 75 });
            doc.font('Helvetica-Bold').fillColor(navy)
                .text(alc.examId?.subject || '—', c.subject, rowY + 6, { width: 125 });
            doc.font('Helvetica').fillColor('#334155')
                .text(alc.hallId?.hallName || '—', c.hall, rowY + 6, { width: 55 });
            doc.text(alc.hallId?.building || '—', c.building, rowY + 6, { width: 60 });
            doc.font('Helvetica-Bold').fillColor(navy)
                .text(String(alc.seatNumber || '—'), c.seat, rowY + 6, { width: 35, align: 'center' });

            rowY += rowH;
        });

        // Table outer border
        doc.rect(30, thY, W - 60, rowY - thY).stroke('#c7d7fa');

        // ═══════════════════════════════════════════════════════
        // INSTRUCTIONS
        // ═══════════════════════════════════════════════════════
        const instrY = rowY + 12;
        doc.rect(30, instrY, W - 60, 38).fill('#fffbeb').stroke('#fde68a');

        doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(7)
            .text('IMPORTANT INSTRUCTIONS', 40, instrY + 6, { characterSpacing: 1 });
        doc.fillColor('#78350f').font('Helvetica').fontSize(6.5)
            .text(
                '1. Bring this hall ticket with a valid ID card to every examination.    ' +
                '2. Report 30 minutes before the scheduled time.    ' +
                '3. Electronic gadgets are strictly prohibited inside the hall.',
                40, instrY + 17, { width: W - 80, lineGap: 1 }
            );

        // ═══════════════════════════════════════════════════════
        // SIGNATURE + FOOTER
        // ═══════════════════════════════════════════════════════
        const sigY = instrY + 52;
        doc.font('Helvetica').fontSize(7.5).fillColor(gray)
            .text('Candidate Signature: ______________________', 40, sigY);
        doc.text('Controller of Examinations: ______________________', W - 270, sigY);

        // Gold footer line
        doc.rect(0, 815, W, 3).fill(gold);
        doc.rect(0, 818, W, 24).fill(navy);
        doc.fillColor('#b0c0e0').font('Helvetica').fontSize(7)
            .text(
                `Generated on ${new Date().toLocaleString('en-IN')}  |  This is a computer-generated document.`,
                0, 825, { align: 'center', width: W }
            );

        doc.end();

    } catch (error) {
        console.error('Unified PDF Generation Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = {
    downloadHallTicket,
    downloadAllocationList,
    downloadUnifiedHallTicket,
};

