// Vercel serverless entry point. An Express app is itself a (req, res) handler,
// so we can export it directly. `vercel.json` rewrites all /api/* requests here,
// and Express matches the original path (e.g. /api/chat). The ANTHROPIC_API_KEY
// is read from Vercel's server-side environment variables inside server/app.js.
import app from '../server/app.js'

export default app
