import { basename, dirname, resolve } from "path";
import type { GitPaths } from "./footer-data-provider.ts";

/**
 * Name of the linked worktree that `paths` belongs to, or null for the main checkout.
 * A linked worktree's HEAD lives under `<common>/worktrees/<name>/`, apart from the shared git dir.
 */
export function linkedWorktreeName(paths: GitPaths): string | null {
	const gitDir = resolve(dirname(paths.headPath));
	if (gitDir === resolve(paths.commonGitDir)) return null;
	return basename(paths.repoDir);
}
