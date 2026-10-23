/**
 * Sleep helper that respects abort signal.
 * The abort listener is removed once the timer fires, so a long-lived signal does not collect one per call.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new Error("Aborted"));
			return;
		}

		const onAbort = () => {
			clearTimeout(timeout);
			reject(new Error("Aborted"));
		};
		const timeout = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
