import express from 'express';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/quizzes/create
// @desc    Create a new quiz with questions (Teachers only)
// @access  Private (Teacher)
router.post('/create', protect, async (req, res) => {
  const client = await pool.connect();

  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create quizzes' });
    }

    const { title, subject, topic, grade_level, time_limit_minutes, questions } = req.body;

    // Validation
    if (!title || !subject || !topic || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title, subject, topic, and at least one question are required' });
    }

    // Validate questions format
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
        return res.status(400).json({ message: 'All question fields are required' });
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
        return res.status(400).json({ message: 'Correct answer must be A, B, C, or D' });
      }
    }

    await client.query('BEGIN');

    // Calculate total marks
    const total_marks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    // Create quiz
    const quizResult = await client.query(
      `INSERT INTO quizzes
       (title, subject, topic, grade_level, total_marks, time_limit_minutes, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING quiz_id, title, subject, topic, total_marks, status, created_at`,
      [title, subject, topic, grade_level || null, total_marks, time_limit_minutes || null, req.user.id, 'pending']
    );

    const quiz = quizResult.rows[0];

    // Insert questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await client.query(
        `INSERT INTO quiz_questions
         (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, question_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          quiz.quiz_id,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer.toUpperCase(),
          q.explanation || null,
          q.marks || 1,
          i + 1
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Quiz created successfully. Awaiting admin approval.',
      quiz: quiz
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Server error during quiz creation', error: error.message });
  } finally {
    client.release();
  }
});

// @route   GET /api/quizzes/my-quizzes
// @desc    Get all quizzes created by the logged-in teacher
// @access  Private (Teacher)
router.get('/my-quizzes', protect, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT q.quiz_id, q.title, q.subject, q.topic, q.grade_level, q.total_marks,
              q.time_limit_minutes, q.status, q.rejection_reason, q.created_at, q.approved_at,
              COUNT(qq.question_id) as question_count
       FROM quizzes q
       LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
       WHERE q.created_by = $1
       GROUP BY q.quiz_id
       ORDER BY q.created_at DESC`,
      [req.user.id]
    );

    res.json({ quizzes: result.rows });
  } catch (error) {
    console.error('Error fetching teacher quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/quizzes/approved
// @desc    Get all approved quizzes (for students)
// @access  Public
router.get('/approved', async (req, res) => {
  try {
    const { subject, grade_level, search } = req.query;

    let query = `
      SELECT q.quiz_id, q.title, q.subject, q.topic, q.grade_level, q.total_marks,
             q.time_limit_minutes, q.created_at, q.approved_at,
             u.name as created_by_name,
             COUNT(qq.question_id) as question_count
      FROM quizzes q
      JOIN users u ON q.created_by = u.id
      LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
      WHERE q.status = 'approved'
    `;

    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND q.subject = $${paramCount}`;
      params.push(subject);
      paramCount++;
    }

    if (grade_level) {
      query += ` AND q.grade_level = $${paramCount}`;
      params.push(grade_level);
      paramCount++;
    }

    if (search) {
      query += ` AND (q.title ILIKE $${paramCount} OR q.topic ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' GROUP BY q.quiz_id, u.name ORDER BY q.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ quizzes: result.rows });
  } catch (error) {
    console.error('Error fetching approved quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz details with questions (for taking quiz)
// @access  Public (for approved quizzes)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get quiz details
    const quizResult = await pool.query(
      `SELECT q.quiz_id, q.title, q.subject, q.topic, q.grade_level, q.total_marks,
              q.time_limit_minutes, q.status, u.name as created_by_name
       FROM quizzes q
       JOIN users u ON q.created_by = u.id
       WHERE q.quiz_id = $1`,
      [id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    // Only allow access to approved quizzes (unless it's the teacher who created it)
    if (quiz.status !== 'approved') {
      return res.status(403).json({ message: 'This quiz is not yet approved' });
    }

    // Get questions (without correct answers for students)
    const questionsResult = await pool.query(
      `SELECT question_id, question_text, option_a, option_b, option_c, option_d,
              marks, question_order
       FROM quiz_questions
       WHERE quiz_id = $1
       ORDER BY question_order`,
      [id]
    );

    quiz.questions = questionsResult.rows;

    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/quizzes/submit/:id
// @desc    Submit quiz answers and get auto-graded results
// @access  Private (Student)
router.post('/submit/:id', protect, async (req, res) => {
  const client = await pool.connect();

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit quizzes' });
    }

    const { id } = req.params;
    const { answers, time_taken_seconds } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: 'No answers provided' });
    }

    await client.query('BEGIN');

    // Get quiz and questions
    const quizResult = await client.query(
      'SELECT * FROM quizzes WHERE quiz_id = $1 AND status = $2',
      [id, 'approved']
    );

    if (quizResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Quiz not found or not approved' });
    }

    const quiz = quizResult.rows[0];

    // Get all questions with correct answers
    const questionsResult = await client.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_order',
      [id]
    );

    const questions = questionsResult.rows;

    // Grade the quiz
    let score = 0;
    const results = [];

    for (const question of questions) {
      const studentAnswer = answers[question.question_id];
      const isCorrect = studentAnswer && studentAnswer.toUpperCase() === question.correct_answer;

      if (isCorrect) {
        score += question.marks;
      }

      results.push({
        question_id: question.question_id,
        question_text: question.question_text,
        student_answer: studentAnswer || null,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        marks: question.marks,
        explanation: question.explanation
      });
    }

    const percentage = ((score / quiz.total_marks) * 100).toFixed(2);

    // Create quiz attempt record
    const attemptResult = await client.query(
      `INSERT INTO quiz_attempts
       (student_id, quiz_id, score, total_marks, percentage, time_taken_seconds, completed_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
       RETURNING attempt_id`,
      [req.user.id, id, score, quiz.total_marks, percentage, time_taken_seconds || null, 'completed']
    );

    const attemptId = attemptResult.rows[0].attempt_id;

    // Save individual answers
    for (const result of results) {
      await client.query(
        `INSERT INTO quiz_attempt_answers
         (attempt_id, question_id, student_answer, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, result.question_id, result.student_answer, result.is_correct]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: 'Quiz submitted successfully',
      attempt_id: attemptId,
      score: score,
      total_marks: quiz.total_marks,
      percentage: percentage,
      results: results
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Server error during quiz submission', error: error.message });
  } finally {
    client.release();
  }
});

// @route   GET /api/quizzes/pending
// @desc    Get all pending quizzes (for admin review)
// @access  Private (Admin only)
router.get('/admin/pending', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      `SELECT q.*, u.name as teacher_name, u.email as teacher_email,
              COUNT(qq.question_id) as question_count
       FROM quizzes q
       JOIN users u ON q.created_by = u.id
       LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
       WHERE q.status = 'pending'
       GROUP BY q.quiz_id, u.name, u.email
       ORDER BY q.created_at ASC`
    );

    res.json({ quizzes: result.rows });
  } catch (error) {
    console.error('Error fetching pending quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/quizzes/approve/:id
// @desc    Approve a quiz
// @access  Private (Admin only)
router.put('/approve/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can approve quizzes' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE quizzes
       SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
       WHERE quiz_id = $2
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz approved successfully', quiz: result.rows[0] });
  } catch (error) {
    console.error('Error approving quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/quizzes/reject/:id
// @desc    Reject a quiz
// @access  Private (Admin only)
router.put('/reject/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can reject quizzes' });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const result = await pool.query(
      `UPDATE quizzes
       SET status = 'rejected', rejection_reason = $1
       WHERE quiz_id = $2
       RETURNING *`,
      [rejection_reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz rejected', quiz: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz (Teacher can delete their own, Admin can delete any)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM quizzes WHERE quiz_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const quiz = result.rows[0];

    // Check if user has permission to delete
    if (req.user.role !== 'admin' && quiz.created_by !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this quiz' });
    }

    // Delete quiz (cascade will delete questions and attempts)
    await pool.query('DELETE FROM quizzes WHERE quiz_id = $1', [id]);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
