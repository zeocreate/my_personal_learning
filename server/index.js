import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "developer_knowledge_hub",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const toIso = (value) => (value ? new Date(value).toISOString() : null);

async function verifyDatabaseConnection() {
  const [rows] = await pool.query("SELECT DATABASE() AS db");
  const activeDb = rows?.[0]?.db || "(none)";
  console.log(`Connected to MySQL database: ${activeDb}`);
}

const mapCategory = (row) => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapTopic = (row) => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description || "",
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapTag = (row) => ({
  id: row.id,
  name: row.name,
  color: row.color,
});

const mapLearningSession = (row) => ({
  id: row.id,
  categoryId: row.category_id,
  title: row.title,
  status: row.status,
  startedAt: toIso(row.started_at),
  pausedAt: toIso(row.paused_at),
  completedAt: toIso(row.completed_at),
  totalDurationMinutes: row.total_duration_minutes || 0,
  notes: row.notes || "",
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapLearningProgress = (row) => ({
  id: row.id,
  sessionId: row.session_id,
  noteId: row.note_id,
  progressPercentage: row.progress_percentage || 0,
  lastAccessedAt: toIso(row.last_accessed_at),
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

const mapTimeTracking = (row) => ({
  id: row.id,
  date:
    row.date instanceof Date ? row.date.toISOString().split("T")[0] : row.date,
  totalLearningMinutes: row.total_learning_minutes || 0,
  sessionsCount: row.sessions_count || 0,
  categoryId: row.category_id,
  notes: row.notes || "",
  createdAt: toIso(row.created_at),
  updatedAt: toIso(row.updated_at),
});

async function buildState() {
  const [categoryRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_categories ORDER BY created_at DESC",
  );
  const [topicRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_topics ORDER BY created_at DESC",
  );
  const [tagRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_tags ORDER BY name ASC",
  );
  const [noteRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_notes ORDER BY updated_at DESC",
  );
  const [blockRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_note_blocks ORDER BY block_order ASC",
  );
  const [noteTagRows] = await pool.query(
    `SELECT nt.note_id, t.name
     FROM my_personal_tracker_note_tags nt
     JOIN my_personal_tracker_tags t ON t.id = nt.tag_id`,
  );
  const [noteLinkRows] = await pool.query(
    "SELECT source_note_id, target_note_id FROM my_personal_tracker_note_links",
  );
  const [learningSessionRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_learning_sessions ORDER BY created_at DESC",
  );
  const [learningProgressRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_learning_progress ORDER BY updated_at DESC",
  );
  const [timeTrackingRows] = await pool.query(
    "SELECT * FROM my_personal_tracker_time_tracking ORDER BY date DESC",
  );

  const blocksByNote = new Map();
  for (const block of blockRows) {
    const current = blocksByNote.get(block.note_id) || [];
    current.push({
      id: block.id,
      type: block.type,
      content: block.content || "",
      language: block.language || undefined,
      checked: Boolean(block.checked),
      order: block.block_order,
    });
    blocksByNote.set(block.note_id, current);
  }

  const tagsByNote = new Map();
  for (const row of noteTagRows) {
    const current = tagsByNote.get(row.note_id) || [];
    current.push(row.name);
    tagsByNote.set(row.note_id, current);
  }

  const linksByNote = new Map();
  for (const row of noteLinkRows) {
    const current = linksByNote.get(row.source_note_id) || [];
    current.push(row.target_note_id);
    linksByNote.set(row.source_note_id, current);
  }

  return {
    categories: categoryRows.map(mapCategory),
    topics: topicRows.map(mapTopic),
    tags: tagRows.map(mapTag),
    notes: noteRows.map((row) => ({
      id: row.id,
      topicId: row.topic_id,
      categoryId: row.category_id,
      title: row.title,
      blocks: blocksByNote.get(row.id) || [],
      tags: tagsByNote.get(row.id) || [],
      linkedNoteIds: linksByNote.get(row.id) || [],
      isFavorite: Boolean(row.is_favorite),
      isPinned: Boolean(row.is_pinned),
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at),
      lastViewedAt: toIso(row.last_viewed_at),
    })),
    learningSessions: learningSessionRows.map(mapLearningSession),
    learningProgress: learningProgressRows.map(mapLearningProgress),
    timeTracking: timeTrackingRows.map(mapTimeTracking),
  };
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/api/state", async (_req, res) => {
  try {
    res.json(await buildState());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/debug/counts", async (_req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_categories",
    );
    const [topics] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_topics",
    );
    const [notes] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_notes",
    );
    const [tags] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_tags",
    );
    const [learningSessions] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_learning_sessions",
    );
    const [timeTracking] = await pool.query(
      "SELECT COUNT(*) AS total FROM my_personal_tracker_time_tracking",
    );

    res.json({
      categories: categories[0].total,
      topics: topics[0].total,
      notes: notes[0].total,
      tags: tags[0].total,
      learningSessions: learningSessions[0].total,
      timeTracking: timeTracking[0].total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const id = req.body.id || randomUUID();
    const { name, icon, color } = req.body;
    await pool.query(
      "INSERT INTO my_personal_tracker_categories (id, name, icon, color) VALUES (?, ?, ?, ?)",
      [id, name, icon, color],
    );
    const [rows] = await pool.query(
      "SELECT * FROM my_personal_tracker_categories WHERE id = ?",
      [id],
    );
    res.status(201).json(mapCategory(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    await pool.query(
      "UPDATE my_personal_tracker_categories SET name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, icon, color, id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM my_personal_tracker_categories WHERE id = ?",
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/topics", async (req, res) => {
  try {
    const id = req.body.id || randomUUID();
    const { categoryId, name, description } = req.body;
    await pool.query(
      "INSERT INTO my_personal_tracker_topics (id, category_id, name, description) VALUES (?, ?, ?, ?)",
      [id, categoryId, name, description],
    );
    const [rows] = await pool.query(
      "SELECT * FROM my_personal_tracker_topics WHERE id = ?",
      [id],
    );
    res.status(201).json(mapTopic(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await pool.query(
      "UPDATE my_personal_tracker_topics SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description, id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/topics/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM my_personal_tracker_topics WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/notes", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const id = req.body.id || randomUUID();
    const { topicId, categoryId, title } = req.body;
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO my_personal_tracker_notes
      (id, topic_id, category_id, title, is_favorite, is_pinned, last_viewed_at)
      VALUES (?, ?, ?, ?, FALSE, FALSE, CURRENT_TIMESTAMP)`,
      [id, topicId, categoryId, title],
    );
    await connection.query(
      "INSERT INTO my_personal_tracker_note_blocks (id, note_id, type, content, block_order) VALUES (?, ?, ?, ?, ?)",
      [randomUUID(), id, "text", "", 0],
    );
    await connection.commit();
    res.status(201).json({ ok: true, id });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.patch("/api/notes/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const updates = req.body || {};
    await connection.beginTransaction();

    const scalarFields = [];
    const scalarValues = [];

    if (typeof updates.topicId === "string") {
      scalarFields.push("topic_id = ?");
      scalarValues.push(updates.topicId);
    }
    if (typeof updates.categoryId === "string") {
      scalarFields.push("category_id = ?");
      scalarValues.push(updates.categoryId);
    }
    if (typeof updates.title === "string") {
      scalarFields.push("title = ?");
      scalarValues.push(updates.title);
    }
    if (typeof updates.isFavorite === "boolean") {
      scalarFields.push("is_favorite = ?");
      scalarValues.push(updates.isFavorite);
    }
    if (typeof updates.isPinned === "boolean") {
      scalarFields.push("is_pinned = ?");
      scalarValues.push(updates.isPinned);
    }
    if (typeof updates.lastViewedAt === "string") {
      scalarFields.push("last_viewed_at = ?");
      scalarValues.push(new Date(updates.lastViewedAt));
    }

    if (scalarFields.length > 0) {
      scalarValues.push(id);
      await connection.query(
        `UPDATE my_personal_tracker_notes SET ${scalarFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        scalarValues,
      );
    }

    if (Array.isArray(updates.blocks)) {
      await connection.query(
        "DELETE FROM my_personal_tracker_note_blocks WHERE note_id = ?",
        [id],
      );
      for (const block of updates.blocks) {
        await connection.query(
          `INSERT INTO my_personal_tracker_note_blocks
          (id, note_id, type, content, language, checked, block_order)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            block.id || randomUUID(),
            id,
            block.type,
            block.content || "",
            block.language || null,
            Boolean(block.checked),
            Number(block.order || 0),
          ],
        );
      }
    }

    if (Array.isArray(updates.tags)) {
      await connection.query(
        "DELETE FROM my_personal_tracker_note_tags WHERE note_id = ?",
        [id],
      );
      for (const rawTag of updates.tags) {
        const tagName = String(rawTag).trim().toLowerCase();
        if (!tagName) continue;

        const [existingRows] = await connection.query(
          "SELECT id FROM my_personal_tracker_tags WHERE name = ? LIMIT 1",
          [tagName],
        );
        const tagId = existingRows[0]?.id || randomUUID();

        if (!existingRows[0]) {
          await connection.query(
            "INSERT INTO my_personal_tracker_tags (id, name, color) VALUES (?, ?, ?)",
            [tagId, tagName, "hsl(168, 70%, 45%)"],
          );
        }

        await connection.query(
          "INSERT INTO my_personal_tracker_note_tags (note_id, tag_id) VALUES (?, ?)",
          [id, tagId],
        );
      }
    }

    if (Array.isArray(updates.linkedNoteIds)) {
      await connection.query(
        "DELETE FROM my_personal_tracker_note_links WHERE source_note_id = ?",
        [id],
      );
      for (const targetId of updates.linkedNoteIds) {
        if (!targetId || targetId === id) continue;
        await connection.query(
          "INSERT IGNORE INTO my_personal_tracker_note_links (id, source_note_id, target_note_id) VALUES (?, ?, ?)",
          [randomUUID(), id, targetId],
        );
      }
    }

    await connection.commit();
    res.json({ ok: true });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM my_personal_tracker_notes WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/notes/:id/toggle-favorite", async (req, res) => {
  try {
    await pool.query(
      "UPDATE my_personal_tracker_notes SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/notes/:id/toggle-pin", async (req, res) => {
  try {
    await pool.query(
      "UPDATE my_personal_tracker_notes SET is_pinned = NOT is_pinned, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/notes/:id/view", async (req, res) => {
  try {
    await pool.query(
      "UPDATE my_personal_tracker_notes SET last_viewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/tags", async (req, res) => {
  try {
    const normalized = String(req.body.name || "")
      .trim()
      .toLowerCase();
    if (!normalized) {
      return res.status(400).json({ message: "Tag name is required" });
    }
    const [existingRows] = await pool.query(
      "SELECT * FROM my_personal_tracker_tags WHERE name = ? LIMIT 1",
      [normalized],
    );
    if (existingRows[0]) {
      return res.json(mapTag(existingRows[0]));
    }

    const id = req.body.id || randomUUID();
    const color = req.body.color || "hsl(168, 70%, 45%)";
    await pool.query(
      "INSERT INTO my_personal_tracker_tags (id, name, color) VALUES (?, ?, ?)",
      [id, normalized, color],
    );
    const [rows] = await pool.query(
      "SELECT * FROM my_personal_tracker_tags WHERE id = ?",
      [id],
    );
    return res.status(201).json(mapTag(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.delete("/api/tags/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM my_personal_tracker_tags WHERE id = ?", [
      req.params.id,
    ]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/learning-sessions", async (req, res) => {
  try {
    const id = req.body.id || randomUUID();
    const { categoryId, title } = req.body;
    await pool.query(
      `INSERT INTO my_personal_tracker_learning_sessions
      (id, category_id, title, status, started_at, notes)
      VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, '')`,
      [id, categoryId, title],
    );
    const [rows] = await pool.query(
      "SELECT * FROM my_personal_tracker_learning_sessions WHERE id = ?",
      [id],
    );
    res.status(201).json(mapLearningSession(rows[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/learning-sessions/:id/pause", async (req, res) => {
  try {
    await pool.query(
      `UPDATE my_personal_tracker_learning_sessions
       SET status = 'paused', paused_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/learning-sessions/:id/resume", async (req, res) => {
  try {
    await pool.query(
      `UPDATE my_personal_tracker_learning_sessions
       SET status = 'active', paused_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/learning-sessions/:id/complete", async (req, res) => {
  try {
    await pool.query(
      `UPDATE my_personal_tracker_learning_sessions
       SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id],
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/learning-progress", async (req, res) => {
  try {
    const { sessionId, noteId, progressPercentage } = req.body;
    const [rows] = await pool.query(
      "SELECT id FROM my_personal_tracker_learning_progress WHERE session_id = ? AND note_id <=> ? LIMIT 1",
      [sessionId, noteId || null],
    );

    if (rows[0]) {
      await pool.query(
        `UPDATE my_personal_tracker_learning_progress
         SET progress_percentage = ?, last_accessed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [progressPercentage, rows[0].id],
      );
      return res.json({ ok: true, id: rows[0].id });
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO my_personal_tracker_learning_progress
      (id, session_id, note_id, progress_percentage, last_accessed_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, sessionId, noteId || null, progressPercentage],
    );

    return res.status(201).json({ ok: true, id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/api/time-tracking/upsert", async (req, res) => {
  try {
    const { date, categoryId, minutes } = req.body;
    const [rows] = await pool.query(
      `SELECT id FROM my_personal_tracker_time_tracking
       WHERE date = ? AND category_id <=> ?
       LIMIT 1`,
      [date, categoryId || null],
    );

    if (rows[0]) {
      await pool.query(
        `UPDATE my_personal_tracker_time_tracking
         SET total_learning_minutes = total_learning_minutes + ?,
             sessions_count = sessions_count + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [Number(minutes || 0), rows[0].id],
      );
      return res.json({ ok: true, id: rows[0].id });
    }

    const id = randomUUID();
    await pool.query(
      `INSERT INTO my_personal_tracker_time_tracking
      (id, date, total_learning_minutes, sessions_count, category_id, notes)
      VALUES (?, ?, ?, 1, ?, '')`,
      [id, date, Number(minutes || 0), categoryId || null],
    );
    return res.status(201).json({ ok: true, id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const port = Number(process.env.API_PORT || 4000);
verifyDatabaseConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MySQL connection failed:", error.message);
    process.exit(1);
  });
