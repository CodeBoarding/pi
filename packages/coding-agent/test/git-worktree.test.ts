import { join } from "path";
import { describe, expect, it } from "vitest";
import { linkedWorktreeName } from "../src/core/git-worktree.ts";

describe("linkedWorktreeName", () => {
	it("returns null for the main checkout", () => {
		const repoDir = join("/repo", "app");
		const commonGitDir = join(repoDir, ".git");
		expect(linkedWorktreeName({ repoDir, commonGitDir, headPath: join(commonGitDir, "HEAD") })).toBeNull();
	});

	it("names a linked worktree after its directory", () => {
		const commonGitDir = join("/repo", "app", ".git");
		const headPath = join(commonGitDir, "worktrees", "feature-x", "HEAD");
		expect(linkedWorktreeName({ repoDir: join("/repo", "feature-x"), commonGitDir, headPath })).toBe("feature-x");
	});
});
