/**
 * Per-tool call counts for the current process, so a session can report which tools the
 * agent leaned on and how many of their calls failed.
 */
export interface ToolCallStat {
	calls: number;
	errors: number;
}

const stats = new Map<string, ToolCallStat>();

export function recordToolCall(toolName: string, isError: boolean): void {
	const stat = stats.get(toolName) ?? { calls: 0, errors: 0 };
	stat.calls += 1;
	if (isError) stat.errors += 1;
	stats.set(toolName, stat);
}

/** A snapshot, most-called tool first. */
export function getToolCallStats(): Array<{ toolName: string } & ToolCallStat> {
	return [...stats.entries()]
		.map(([toolName, stat]) => ({ toolName, ...stat }))
		.sort((a, b) => b.calls - a.calls);
}

export function resetToolCallStats(): void {
	stats.clear();
}
