// src/agents/land-agent/land-agent.ts

import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { landTool } from "./land-tool";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./mastra.db", // Or your database URL
  }),
  options: {
    // Keep last 20 messages in context
    lastMessages: 20,
  },
});



export const landAgent = new Agent({
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
- If the user provides a polygon (4 coordinates), use the 'check-land-and-amenities' tool.
- Always describe whether the land overlaps with existing data (mention the land name and link).
- Include a short summary of what amenities are found nearby and what land use is ideal.
- Keep responses simple, friendly, and informative.
- Only use tools if required — if a user is just asking about land use types, respond directly.
  `,
  tools: { landTool },
  memory,
});