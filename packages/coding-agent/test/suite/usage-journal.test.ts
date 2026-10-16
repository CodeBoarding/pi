import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fauxAssistantMessage } from "@earendil-works/pi-ai";
import { expect, it } from "vitest";
import usageJournal from "../../examples/extensions/usage-journal.ts";
import { createHarness } from "./harness.ts";

it("appends distinct run usage without copying conversation content or earlier runs", async () => {
	let usage = fauxAssistantMessage("").usage;
	const harness = await createHarness({
		extensionFactories: [
			(pi) => {
				pi.on("message_end", (event) => {
					if (event.message.role === "assistant") return { message: { ...event.message, usage } };
				});
			},
			usageJournal,
		],
	});
	try {
		const first = fauxAssistantMessage("private response one");
		first.usage = {
			input: 13,
			output: 7,
			cacheRead: 3,
			cacheWrite: 2,
			totalTokens: 25,
			cost: { input: 0.13, output: 0.07, cacheRead: 0.03, cacheWrite: 0.02, total: 0.25 },
		};
		const second = fauxAssistantMessage("private response two");
		second.usage = {
			input: 5,
			output: 11,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 16,
			cost: { input: 0.05, output: 0.11, cacheRead: 0, cacheWrite: 0, total: 0.16 },
		};
		harness.setResponses([first, second]);
		usage = first.usage;
		await harness.session.prompt("private prompt one");
		usage = second.usage;
		await harness.session.prompt("private prompt two");

		const text = await readFile(join(harness.tempDir, ".pi", "usage.jsonl"), "utf8");
		const records = text
			.trim()
			.split("\n")
			.map((line) => JSON.parse(line));
		expect(records).toEqual([
			{
				sessionId: harness.sessionManager.getSessionId(),
				timestamp: expect.any(String),
				messages: [{ provider: expect.any(String), model: expect.any(String), usage: first.usage }],
			},
			{
				sessionId: harness.sessionManager.getSessionId(),
				timestamp: expect.any(String),
				messages: [{ provider: expect.any(String), model: expect.any(String), usage: second.usage }],
			},
		]);
		expect(text).not.toContain("private");
	} finally {
		harness.cleanup();
	}
});
