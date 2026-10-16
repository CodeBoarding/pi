/**
 * Run with: pi -e ./packages/coding-agent/examples/extensions/usage-journal.ts
 * Appends usage metadata to .pi/usage.jsonl in the working directory.
 * Each record covers one low-level agent run, not an entire session.
 * Prompts, responses, and tool arguments are never written to the journal.
 */
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("agent_end", async (event, ctx) => {
		const messages = event.messages.filter((message) => message.role === "assistant");
		if (messages.length === 0) return;

		const directory = join(ctx.cwd, ".pi");
		await mkdir(directory, { recursive: true });
		await appendFile(
			join(directory, "usage.jsonl"),
			`${JSON.stringify({
				sessionId: ctx.sessionManager.getSessionId(),
				timestamp: new Date().toISOString(),
				messages: messages.map((message) => ({
					provider: message.provider,
					model: message.model,
					usage: message.usage,
				})),
			})}\n`,
			{ mode: 0o600 },
		);
	});
}
