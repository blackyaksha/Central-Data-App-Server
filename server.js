// server.js
import express from 'express';
import fetch from 'node-fetch'; // If using Node 18+, you can skip this import
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow your front-end to call this server
app.use(express.json());

// ---------------- CONFIGURE ----------------
const FLOW_URL = 'https://e0ffbd29750ce27abc181dd6358937.97.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/13ad1bf5cd9d40faae5866a10b8e5d5e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=r0hMO5PRRh_wKy5Y1DV5tejG2smmJjiWhJMvjQrGrK4'; 
// Example: 'https://<env>.api.powerplatform.com/.../triggers/manual/paths/invoke?api-version=1&sp=/triggers/manual/run&sv=1.0&sig=XYZ'

app.post('/fetch-files', async (req, res) => {
  try {
    const { pageSize = 5000, nextLink = '' } = req.body;

    // Call your Flow
    const response = await fetch(FLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageSize, nextLink })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Flow request failed: ${response.status}` });
    }

    const data = await response.json();

    // Respond with data to your front-end
    res.json({
      items: data.items ?? [],
      nextLink: data.nextLink ?? null
    });

  } catch (err) {
    console.error('Error calling Flow:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
