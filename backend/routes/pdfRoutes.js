import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   POST /api/pdfs/upload
// @desc    Upload PDF summary (Teachers only)
// @access  Private (Teacher)
router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      // Delete uploaded file if user is not a teacher
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ message: 'Only teachers can upload PDF summaries' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const { subject, topic, grade_level } = req.body;

    if (!subject || !topic) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    // Insert PDF record into database
    const result = await pool.query(
      `INSERT INTO pdf_summaries
       (subject, topic, grade_level, file_path, file_name, file_size, uploaded_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        subject,
        topic,
        grade_level || null,
        req.file.path,
        req.file.originalname,
        req.file.size,
        req.user.id,
        'pending' // Status is pending until admin approves
      ]
    );

    res.status(201).json({
      message: 'PDF uploaded successfully. Awaiting admin approval.',
      pdf: {
        file_id: result.rows[0].file_id,
        subject: result.rows[0].subject,
        topic: result.rows[0].topic,
        grade_level: result.rows[0].grade_level,
        file_name: result.rows[0].file_name,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    // Delete uploaded file if database insert fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error during PDF upload', error: error.message });
  }
});

// @route   GET /api/pdfs/my-pdfs
// @desc    Get all PDFs uploaded by the logged-in teacher
// @access  Private (Teacher)
router.get('/my-pdfs', protect, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT file_id, subject, topic, grade_level, file_name, file_size,
              status, rejection_reason, created_at, approved_at
       FROM pdf_summaries
       WHERE uploaded_by = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ pdfs: result.rows });
  } catch (error) {
    console.error('Error fetching teacher PDFs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pdfs/approved
// @desc    Get all approved PDFs (for students)
// @access  Public
router.get('/approved', async (req, res) => {
  try {
    const { subject, grade_level, search } = req.query;

    let query = `
      SELECT p.file_id, p.subject, p.topic, p.grade_level, p.file_name,
             p.file_size, p.created_at, p.approved_at,
             u.name as uploaded_by_name
      FROM pdf_summaries p
      JOIN users u ON p.uploaded_by = u.id
      WHERE p.status = 'approved'
    `;

    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND p.subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (grade_level) {
      query += ` AND p.grade_level = $${paramCount}`;
      params.push(grade_level);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.topic ILIKE $${paramCount} OR p.subject ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ pdfs: result.rows });
  } catch (error) {
    console.error('Error fetching approved PDFs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pdfs/download/:id
// @desc    Download a PDF file
// @access  Public (for approved PDFs)
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM pdf_summaries WHERE file_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const pdf = result.rows[0];

    // Only allow download if PDF is approved
    if (pdf.status !== 'approved') {
      return res.status(403).json({ message: 'This PDF is not yet approved for download' });
    }

    // Check if file exists
    if (!fs.existsSync(pdf.file_path)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf.file_name}"`);

    // Stream the file
    const fileStream = fs.createReadStream(pdf.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/pdfs/:id
// @desc    Delete a PDF (Teacher can delete their own, Admin can delete any)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM pdf_summaries WHERE file_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const pdf = result.rows[0];

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && pdf.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this PDF' });
    }

    // Delete file from filesystem
    if (fs.existsSync(pdf.file_path)) {
      fs.unlinkSync(pdf.file_path);
    }

    // Delete from database
    await pool.query('DELETE FROM pdf_summaries WHERE file_id = $1', [id]);

    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pdfs/pending
// @desc    Get all pending PDFs (for admin review)
// @access  Private (Admin only)
router.get('/pending', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT p.*, u.name as teacher_name, u.email as teacher_email
       FROM pdf_summaries p
       JOIN users u ON p.uploaded_by = u.id
       WHERE p.status = 'pending'
       ORDER BY p.created_at ASC`
    );

    res.json({ pdfs: result.rows });
  } catch (error) {
    console.error('Error fetching pending PDFs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/pdfs/approve/:id
// @desc    Approve a PDF
// @access  Private (Admin only)
router.put('/approve/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve PDFs' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE pdf_summaries
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE file_id = $2
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.json({ message: 'PDF approved successfully', pdf: result.rows[0] });
  } catch (error) {
    console.error('Error approving PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/pdfs/reject/:id
// @desc    Reject a PDF
// @access  Private (Admin only)
router.put('/reject/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject PDFs' });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const result = await pool.query(
      `UPDATE pdf_summaries
       SET status = 'rejected', rejection_reason = $1
       WHERE file_id = $2
       RETURNING *`,
      [rejection_reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.json({ message: 'PDF rejected', pdf: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
