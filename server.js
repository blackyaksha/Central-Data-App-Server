import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors()); // Allow your frontend to call this
app.use(express.json());

const PAGE_SIZE = 5000; // default, can be overridden by frontend

// Endpoint for fetching SharePoint items
app.post('/fetch-files', async (req, res) => {
  try {
    const { nextLink = '', pageSize = PAGE_SIZE } = req.body;

    // SharePoint REST API endpoint
    const SHAREPOINT_SITE = 'https://energyregcomm.sharepoint.com/sites/CentralDatabase';
    const LIST_GUID = '36c3e3fe-6115-4088-9f76-66173c2a0060';
    let apiUrl = '';

    if (nextLink) {
      apiUrl = nextLink; // continue from previous batch
    } else {
      apiUrl = `${SHAREPOINT_SITE}/_api/web/lists(guid'${LIST_GUID}')/items?$top=${pageSize}&$select=ID,Title,FileLeafRef,FilePath,FileType,FileURL,IsFolder&$orderby=ID asc`;
    }

    // Authentication: use SharePoint App registration + token
    const TOKEN = process.env.SHAREPOINT_TOKEN; // get token from Render environment variable
    if (!TOKEN) throw new Error('Missing SharePoint token in environment variables');

    const spResponse = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json;odata=verbose',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (!spResponse.ok) {
      const text = await spResponse.text();
      throw new Error(`SharePoint request failed: ${spResponse.status} - ${text}`);
    }

    const data = await spResponse.json();

    // extract items and nextLink
    const items = data.d?.results || [];
    const nextLinkUrl = data.d?.__next || null;

    res.json({ items, nextLink: nextLinkUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
