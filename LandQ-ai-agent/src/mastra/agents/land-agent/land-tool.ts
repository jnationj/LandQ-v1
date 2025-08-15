// src/agents/land-agent/land-tool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as turf from "@turf/turf";

// Type for OSM element returned from Overpass API
type OverpassElement = {
  tags?: {
    amenity?: string;
    name?: string;
  };
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
};

// Helper function to compute Haversine distance (in meters)
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

// Helper: Get centroid of polygon
function getCentroid(coords: [number, number][]): [number, number] {
  const num = coords.length;
  const [sumLat, sumLon] = coords.reduce(([a, b], [lat, lon]) => [a + lat, b + lon], [0, 0]);
  return [sumLat / num, sumLon / num];
}

// Overpass API query
async function queryOverpass(lat: number, lon: number): Promise<OverpassElement[]> {
  const query = `
    [out:json][timeout:25];
    (
      node(around:2000,${lat},${lon})["amenity"];
    );
    out body;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  const data = await response.json();
  return data.elements || [];
}

// ✅ Full landTool implementation
export const landTool = createTool({
  id: "check-land-and-amenities",
  description: "Check for land overlap and nearby amenities",
  inputSchema: z.object({
    coordinates: z.array(z.tuple([z.number(), z.number()])).min(4),
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
        distance: z.number(), // in meters
      })
    ),
  }),
  async execute({ context }) {
    const polygon = context.coordinates;
    const [centroidLat, centroidLon] = getCentroid(polygon);

    const submitted = turf.polygon([
      polygon.map(([lat, lon]) => [lon, lat]).concat([[polygon[0][1], polygon[0][0]]]),
    ]);

    // ✅ 1. Fetch all existing landNFTs
    const apiRes = await fetch("https://landai-api.onrender.com/landNFTs");
    const landNFTs = await apiRes.json();

    let overlap = false;
    let overlapName: string | undefined;
    let overlapLink: string | undefined;

    for (const record of landNFTs) {
      if (!record.coordinates?.length) continue;

      const coords = record.coordinates.map((p: string) => {
        const [lat, lon] = p.split(",").map(Number);
        return [lon, lat] as [number, number];
      });

      const existing = turf.polygon([[...coords, coords[0]]]);

      if (
        turf.booleanOverlap(submitted, existing) ||
        turf.booleanEqual(submitted, existing)
      ) {
        overlap = true;
        overlapName = record.name;
        overlapLink = record.openseaUrl;
        break;
      }
    }


    // ✅ 2. Fetch OSM amenities from Overpass
    const rawAmenities = await queryOverpass(centroidLat, centroidLon);

    const amenities = rawAmenities
      .map((a): { type: string; name?: string; distance: number; distanceLabel: string; } => {
        const lat = a.lat ?? a.center?.lat;
        const lon = a.lon ?? a.center?.lon;
        const dist = lat && lon ? haversine([centroidLat, centroidLon], [lat, lon]) : 0;
        const distanceLabel =
          dist < 1000
              ? `within walking distance of about ${Math.round(dist)} meters`
          : dist < 2000
              ? `${Math.round(dist)} meters`
              : `${(dist / 1000).toFixed(1)} km`;

        return {
          type: a.tags?.amenity ?? "unknown",
          name: a.tags?.name,
          distance: dist,
          distanceLabel,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    // ✅ 3. Suggest land use
    const typesAround = amenities.map((a) => a.type);
    const landUseSuggestion = typesAround.some((t) =>
      ["school", "clinic", "residential", "church"].includes(t)
    )
      ? "Residential"
      : typesAround.includes("farm")
      ? "Agricultural"
      : "Mixed use";

    return {
      overlap,
      message: overlap
        ? `This land overlaps with existing "${overlapName}" and you can view it on "[OpenSea](${overlapLink}"`
        : "No conflict found. This land is available.",
      overlapName,
      overlapLink,
      landUseSuggestion,
      amenities,
    };
  },
});
