import type { Root } from "remark-parse/lib";

export interface Post {
	title: string;
	slug: string;
	date: string;
	tags: string[];
	image: {
		link: string;
		author: {
			name: string;
			link: string;
		};
		source: {
			name: string;
			link: string;
		};
	};
	medium?: string;
	devto?: string;
	excerpt?: Root;
	content?: Root;
}
