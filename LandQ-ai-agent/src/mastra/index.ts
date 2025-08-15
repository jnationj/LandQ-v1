import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { landAgent } from "./agents/land-agent/land-agent"; // Build your agent here
import { landWorkflow } from "./agents/land-agent/land-workflow";

export const mastra = new Mastra({
	/* workflows: { landWorkflow }, // can be deleted later */
	agents: { landAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
