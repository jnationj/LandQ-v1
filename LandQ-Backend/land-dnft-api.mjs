import express from 'express';
import multer from 'multer';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PinataSDK } from 'pinata';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT
});

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 4000;

app.use(express.json());

function toGatewayUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

console.log("📥 Initializing land-dNFT API");

app.post('/create-land-dnft', upload.single('landDocument'), async (req, res) => {
  console.log("📬 Received create-land-dnft request");

  try {
    const { name, description, coordinates, price, country, state } = req.body;

    if (!country || !state) {
      throw new Error('Missing required fields: country or state');
    }

    const coords = JSON.parse(coordinates);

    // 1. Render snapshot
    const html = `
      <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
        <style>body,html,#map{margin:0;padding:0;width:1000px;height:1000px;}</style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          const coords = ${JSON.stringify(coords)};
          const map = L.map('map').setView(coords[0], 18);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          const polygon = L.polygon(coords, { color: 'yellow' }).addTo(map);
          coords.forEach(pt => L.circleMarker(pt, { radius: 5, color: 'red' }).addTo(map));
          map.fitBounds(polygon.getBounds().pad(1));
        </script>
      </body>
      </html>
    `;

    const timestamp = Date.now();
    const snapshotPath = path.join(__dirname, 'uploads', `snapshot-${timestamp}.png`);
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1000 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: snapshotPath });
    await browser.close();

    // Upload snapshot to Pinata
    const fileBuffer = await fs.readFile(snapshotPath);
    const blob = new Blob([fileBuffer]);
    const file = new File([blob], `snapshot-${timestamp}.png`, { type: 'image/png' });
    const imageUpload = await pinata.upload.public.file(file);
    const imageCid = imageUpload.cid;
    await fs.unlink(snapshotPath);

    // Upload landDocument to IPFS (if provided)
    let documentCid = null;
    if (req.file) {
      const docBuffer = await fs.readFile(req.file.path);
      const docBlob = new Blob([docBuffer]);
      const docFile = new File([docBlob], req.file.originalname, {
        type: req.file.mimetype || 'application/pdf'
      });
      const uploaded = await pinata.upload.public.file(docFile);
      documentCid = uploaded.cid;
      await fs.unlink(req.file.path);
    }

    // Build attributes with country and state included
    const attributes = [
      { trait_type: "Price (USD)", value: price },
      { trait_type: "Coordinates", value: coords.map(coord => coord.join(",")).join(" | ") },
      { trait_type: "Country", value: country },
      { trait_type: "State", value: state }
    ];

    if (documentCid) {
      attributes.push({
        trait_type: "Land Document",
        value: `ipfs://${documentCid}`
      });
    }

    // Compose metadata including country and state fields
    const metadata = {
      name: name || `Land Parcel ${timestamp}`,
      description: description || 'A unique land parcel',
      image: `ipfs://${imageCid}`,
      coordinates: coords,
      price: price || '0',
      country,
      state,
      attributes
    };

    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataBlob = new Blob([metadataBuffer]);
    const metadataFile = new File([metadataBlob], `metadata-${timestamp}.json`, { type: 'application/json' });

    // Upload metadata to IPFS
    const metadataUpload = await pinata.upload.public.file(metadataFile);
    const metadataCid = metadataUpload.cid;

    res.json({
      metadataUri: `ipfs://${metadataCid}`,
      metadata,
      gateway: {
        image: toGatewayUrl(imageCid),
        metadata: toGatewayUrl(metadataCid),
        ...(documentCid && { document: toGatewayUrl(documentCid) })
      }
    });

  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Land dNFT API listening on http://localhost:${PORT}`);
});
