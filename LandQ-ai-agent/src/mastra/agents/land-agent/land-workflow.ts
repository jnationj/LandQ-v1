// src/agents/land-agent/land-workflow.ts

import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "../../config";
import * as turf from "@turf/turf";

const landAgent = new Agent({
  name: "Land Intelligence Agent",
  model,
  instructions: `
You are a helpful land-mapping assistant designed to help users evaluate land parcels.

Your core responsibilities include:
1. Checking if a submitted polygon overlaps with existing land records.
2. Fetching real-world amenities (like 🏫schools, 🏥hospitals, 🏦banks) around the land.
3. Suggesting an appropriate land use type (e.g., residential, commercial, 🌽agricultural).
4. Providing human-readable summaries of the land’s characteristics.

🧠 Guidelines:
- If the user provides a polygon (4 coordinates), begin by checking overlaps and fetching amenities.
- Always describe whether the land overlaps with existing data.
- Include a short summary of what amenities are found nearby and what land use is ideal.
- Keep responses simple, friendly, and informative.
- Use the real Overpass API for live amenities around the polygon centroid.
`,
});

const polygonSchema = z.array(z.tuple([z.number(), z.number()])).min(4);

const checkLandStep = createStep({
  id: "check-land",
  description: "Check polygon overlap and nearby amenities from real API",
  inputSchema: z.object({
    coordinates: polygonSchema,
  }),
  outputSchema: z.object({
    overlap: z.boolean(),
    message: z.string(),
    overlapName: z.string().optional(),
    overlapLink: z.string().optional(),
    landUseSuggestion: z.string(),
    amenities: z.array(
      z.object({
        type: z.string(),
        name: z.string().optional(),
        distance: z.number(),
      })
    ),
  }),
  execute: async ({ inputData }) => {
    const polygon = inputData.coordinates;

    // Step 1: Fetch actual landNFTs from real API
    
    const apiRes = await fetch("https://landai-api.onrender.com/landNFTs");
    const existing = await apiRes.json();

    const submittedPolygon = turf.polygon([[...polygon, polygon[0]]]);

    let overlap = false;
    let overlapName: string | undefined;
    let overlapLink: string | undefined;


    for (const record of existing) {
      if (!record.coordinates?.length) continue;

      const coords = record.coordinates.map((pair: string) => {
        const [lat, lon] = pair.split(",").map(Number);
        return [lat, lon] as [number, number];
      });

      const polygonB = turf.polygon([[...coords, coords[0]]]);
      if (turf.booleanOverlap(submittedPolygon, polygonB) || turf.booleanEqual(submittedPolygon, polygonB)) {
        overlap = true;
        overlapName = record.name;
        overlapLink = record.openseaUrl;
        break;
      }
    }

    // Step 2: Fetch amenities from Overpass API (centroid-based)

    const latAvg = polygon.reduce((sum, c) => sum + c[0], 0) / polygon.length;
    const lonAvg = polygon.reduce((sum, c) => sum + c[1], 0) / polygon.length;

    const overpassUrl = "https://overpass-api.de/api/interpreter";
    const query = `
      [out:json][timeout:25];
      (
        node(around:2000,${latAvg},${lonAvg})["amenity"];
      );
      out body;
    `;

    const amenityRes = await fetch(overpassUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    const raw = await amenityRes.json();
    const results = raw.elements || [];

    function haversine([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) {
      const R = 6371e3;
      const toRad = (x: number) => (x * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    const amenities = results.map((a: any) => {
      return {
        type: a.tags?.amenity || "unknown",
        name: a.tags?.name,
        distance: haversine([latAvg, lonAvg], [a.lat, a.lon]),
      };
    })
    .sort((a: { type: string; name?: string; distance: number }, b: { type: string; name?: string; distance: number }) => a.distance - b.distance)
    .slice(0, 5);


    // Step 3: Determine land use suggestion based on amenities ✅
    const typesAround = amenities.map((a: { type: string; name?: string; distance: number }) => a.type);
    const landUseSuggestion = typesAround.some((t: string) =>
      ["school", "clinic", "residential", "church"].includes(t)
    )
      ? "Residential"
      : typesAround.includes("farm")
      ? "Agricultural"
      : "Mixed use";

    return {
      overlap,
      message: overlap 
      ? `This land overlaps with '${overlapName}' and It is located at '[OpenSea](${overlapLink}'.` 
      : "No conflict found. This land is available.",
      overlapName,
      overlapLink,
      landUseSuggestion,
      amenities,
    };
  },
});

const summarizeLandUse = createStep({
  id: "summarize-land",
  description: "Summarize land evaluation with human-friendly output",
  inputSchema: checkLandStep.outputSchema,
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    const {
      overlap,
      message,
      landUseSuggestion,
      amenities,
      overlapName,
      overlapLink,
    } = inputData;

    const grouped = amenities.map((a) => {
      const icon = 
      a.type.includes("bank") ? "🏦" : 
      a.type.includes("hospital") ? "🏥" : 
      a.type.includes("school") ? "🏫" :
      a.type.includes("bus_station") ? "🚌" :
      a.type.includes("place_of_worship") ? "🛐" :
      "📍";

      const distLabel = a.distance < 1000 ? `within walking distance about ${Math.round(a.distance)} meters` 
        : a.distance < 2000
          ? `${Math.round(a.distance)} meters`
          : `${(a.distance / 1000).toFixed(1)} km`;
      return `${icon} ${capitalizeFirstLetter(a.type)}${a.type}${a.name ? ` (${a.name})` : ""} - ${distLabel}`;
    });

    const openSeaMarkdown = overlapLink
      ? `<a href="${overlapLink}" target="_blank" rel="noopener noreferrer">View on OpenSea</a>`
      : "";

    const prompt = `
You are evaluating a plot of land based on the following data:

📌 Overlap: ${overlap ? "Yes" : "No"}
📝 Note: ${message}
${overlapName ? `🏷️ Land Name: ${overlapName}` : ""}
${overlapLink ? `🔗 NFT: [OpenSea](${openSeaMarkdown}` : ""}

Nearby amenities:
${grouped.join("\n")}

🏗️ Suggested use: ${landUseSuggestion}

Your response should:
- Start with a summary of availability or ownership
- Comment on amenities nearby
- Mention specific land use recommendations
- Use clear, friendly, concise language
`;

  const response = await landAgent.stream([
    {
      role: "user",
      content: prompt,
    },
  ]);

  let fullText = "";
  for await (const chunk of response.textStream) {
    process.stdout.write(chunk);
    fullText += chunk;
  }

  return { summary: fullText };
  },
});

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const landWorkflow = createWorkflow({
  id: "land-workflow",
  inputSchema: z.object({
    coordinates: polygonSchema,
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
})
  .then(checkLandStep)
  .then(summarizeLandUse);

landWorkflow.commit(); 