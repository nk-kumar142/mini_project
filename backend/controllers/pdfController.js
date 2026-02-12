const PDFDocument = require('pdfkit');
const Allocation = require('../models/Allocation');

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

        // Check for download approval
        if (allocation.downloadRequestStatus !== 'approved') {
            return res.status(403).json({
                message: 'Download not approved. Please request permission from admin.',
            });
        }

        const doc = new PDFDocument({ margin: 50 });
        let filename = `HallTicket_${allocation.studentId.registerNumber}.pdf`;
        filename = encodeURIComponent(filename);

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // --- PDF STYLING ---
        const primaryColor = '#1e3a8a'; // Dark Blue
        const secondaryColor = '#f3f4f6'; // Light Gray Background

        // Header Banner
        doc.rect(0, 0, 612, 120).fill(primaryColor);
        doc.fillColor('white').fontSize(24).text('EXAMINATION DEPARTMENT', 50, 40, { align: 'center' });
        doc.fontSize(16).text('OFFICIAL HALL TICKET', { align: 'center' });

        doc.moveDown(4);
        doc.fillColor('black');

        // Main Content Box
        doc.rect(50, 150, 512, 450).stroke();

        // Student Info Section Header
        doc.rect(50, 150, 512, 25).fill(secondaryColor).stroke();
        doc.fillColor(primaryColor).fontSize(12).text('STUDENT INFORMATION', 60, 157, { bold: true });
        doc.fillColor('black');

        // Student Details
        let y = 190;
        const drawRow = (label, value) => {
            doc.font('Helvetica-Bold').fontSize(11).text(label, 70, y);
            doc.font('Helvetica').fontSize(11).text(`:  ${value}`, 200, y);
            y += 25;
        };

        drawRow('Name', allocation.studentId.name.toUpperCase());
        drawRow('Register Number', allocation.studentId.registerNumber);
        drawRow('Department', allocation.studentId.department);
        drawRow('Year', `${allocation.studentId.year} Year`);

        // --- SEAT NUMBER (Relocated) ---
        doc.font('Helvetica-Bold').fontSize(11).text('Seat Number', 70, y);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(primaryColor).text(`:  ${allocation.seatNumber}`, 200, y - 5);
        doc.fillColor('black');
        y += 35;

        y += 5;
        // Exam Info Section Header
        doc.rect(50, y, 512, 25).fill(secondaryColor).stroke();
        doc.fillColor(primaryColor).fontSize(12).text('EXAM DETAILS', 60, y + 7, { bold: true });
        doc.fillColor('black');
        y += 40;

        drawRow('Exam Name', allocation.examId.examName);
        drawRow('Subject', allocation.examId.subject);
        drawRow('Date', allocation.examId.examDate.toDateString());

        y += 10;
        // Hall Info Section Header
        doc.rect(50, y, 512, 25).fill(secondaryColor).stroke();
        doc.fillColor(primaryColor).fontSize(12).text('ALLOCATION DETAILS', 60, y + 7, { bold: true });
        doc.fillColor('black');
        y += 40;

        drawRow('Hall Name', allocation.hallId.hallName);
        drawRow('Building', allocation.hallId.building);

        // Seat Number Highlighting Removed from here

        // Signature Area
        doc.font('Helvetica').fontSize(10).text('_________________________', 400, 700);
        doc.text('Controller of Examinations', 410, 715);

        // Footer Instructions
        doc.fontSize(8).fillColor('gray').text(
            'Important: Please bring this hall ticket and your ID card for all exams.',
            50, 750, { align: 'center' }
        );

        doc.end();
        doc.pipe(res);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ message: error.message });
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
        res.setHeader('Content-disposition', 'attachment; filename="AllocationList.pdf"');
        res.setHeader('Content-type', 'application/pdf');

        doc.fontSize(20).text('EXAMINATION ALLOCATION LIST', { align: 'center' });
        doc.moveDown();

        allocations.forEach((alc, index) => {
            doc.fontSize(12).text(
                `${index + 1}. ${alc.studentId.name} (${alc.studentId.registerNumber}) - Hall: ${alc.hallId.hallName} - Seat: ${alc.seatNumber}`
            );
            doc.text(`   Exam: ${alc.examId.examName} | Subject: ${alc.subject || alc.examId.subject}`);
            doc.moveDown(0.5);
        });

        doc.end();
        doc.pipe(res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    downloadHallTicket,
    downloadAllocationList,
};
