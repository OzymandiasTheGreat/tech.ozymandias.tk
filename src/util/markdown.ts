import { unified } from "unified";
import markdown from "remark-parse";
import gfm from "remark-gfm";
import type { Root } from "remark-parse/lib";

export const parseMarkdown = (content: string): Root => {
	const engine = unified().use(markdown).use(gfm);
	const ast = engine.parse(content);
	return engine.runSync(ast);
};
