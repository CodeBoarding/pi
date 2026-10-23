import { describe, expect, it, vi } from "vitest";
import { sleep } from "../src/utils/sleep.ts";

describe("sleep", () => {
	it("resolves after the delay", async () => {
		await expect(sleep(1)).resolves.toBeUndefined();
	});

	it("rejects at once when the signal is already aborted", async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(sleep(1000, controller.signal)).rejects.toThrow("Aborted");
	});

	it("rejects when aborted mid-wait", async () => {
		const controller = new AbortController();
		const waiting = sleep(1000, controller.signal);
		controller.abort();
		await expect(waiting).rejects.toThrow("Aborted");
	});

	it("removes its abort listener once the timer fires", async () => {
		const controller = new AbortController();
		const remove = vi.spyOn(controller.signal, "removeEventListener");
		await sleep(1, controller.signal);
		expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
	});
});
