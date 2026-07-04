// Local development entry point: starts a long-running Express server.
// (On Vercel the same app is served as a serverless function via /api/index.js.)
import app from './app.js'

const PORT = process.env.PORT || 8787
app.listen(PORT, () => console.log(`VademAI API on http://localhost:${PORT}`))
