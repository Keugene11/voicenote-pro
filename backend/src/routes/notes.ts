import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory store for demo (use database in production)
interface Note {
  id: string;
  userId: string;
  title?: string;
  audioUrl?: string;
  originalText: string;
  rephrasedText?: string;
  tone: string;
  durationSeconds: number;
  folder?: string;
  tags: string[];
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notes: Map<string, Note> = new Map();

/**
 * GET /notes
 * Get all notes for the authenticated user
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userNotes = Array.from(notes.values())
      .filter((note) => note.userId === req.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({
      success: true,
      data: userNotes,
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to get notes' });
  }
});

/**
 * GET /notes/:id
 * Get a specific note
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = notes.get(req.params.id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to get note' });
  }
});

/**
 * POST /notes
 * Create a new note
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      audioUrl,
      originalText,
      rephrasedText,
      tone = 'professional',
      durationSeconds = 0,
      folder,
      tags = [],
    } = req.body;

    if (!originalText) {
      res.status(400).json({ error: 'Original text is required' });
      return;
    }

    const note: Note = {
      id: uuidv4(),
      userId: req.userId!,
      title: title || `Note ${new Date().toLocaleDateString()}`,
      audioUrl,
      originalText,
      rephrasedText,
      tone,
      durationSeconds,
      folder,
      tags,
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    notes.set(note.id, note);

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

/**
 * PUT /notes/:id
 * Update a note
 */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = notes.get(req.params.id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const {
      title,
      originalText,
      rephrasedText,
      tone,
      folder,
      tags,
      isStarred,
    } = req.body;

    const updatedNote: Note = {
      ...note,
      title: title !== undefined ? title : note.title,
      originalText: originalText !== undefined ? originalText : note.originalText,
      rephrasedText: rephrasedText !== undefined ? rephrasedText : note.rephrasedText,
      tone: tone !== undefined ? tone : note.tone,
      folder: folder !== undefined ? folder : note.folder,
      tags: tags !== undefined ? tags : note.tags,
      isStarred: isStarred !== undefined ? isStarred : note.isStarred,
      updatedAt: new Date(),
    };

    notes.set(note.id, updatedNote);

    res.json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

/**
 * DELETE /notes/:id
 * Delete a note
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = notes.get(req.params.id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    notes.delete(note.id);

    res.json({
      success: true,
      message: 'Note deleted',
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

/**
 * POST /notes/:id/star
 * Toggle star status
 */
router.post('/:id/star', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const note = notes.get(req.params.id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (note.userId !== req.userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    note.isStarred = !note.isStarred;
    note.updatedAt = new Date();
    notes.set(note.id, note);

    res.json({
      success: true,
      data: { isStarred: note.isStarred },
    });
  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({ error: 'Failed to toggle star' });
  }
});

export default router;
