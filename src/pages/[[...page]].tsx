import { basename, extname, relative } from "path";
import fs from "fs/promises";
import klaw from "klaw";
import matter from "gray-matter";
import { parseMarkdown } from "../util/markdown";
import { POSTSDIR, POSTSPERPAGE } from "../constants";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { Post } from "../types/post";

import React, { useState } from "react";
import { Image, SafeAreaView, ScrollView } from "react-native";
import { Main } from "@expo/html-elements";
import Header from "../components/header";
import Card from "../components/card";

const App: React.FC<{ posts: Post[]; page: number; total: number }> = ({
	posts,
	page,
	total,
}) => {
	const [header, setHeader] = useState(true);

	const headerCallback = (offset: number) => {
		if (offset <= 100 !== header) {
			setHeader(!header);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ScrollView
				onScroll={(ev) =>
					headerCallback(ev.nativeEvent.contentOffset.y)
				}
				scrollEventThrottle={100}
				stickyHeaderIndices={[0]}>
				<Header opaque={header}></Header>
				<Main style={{ alignSelf: "center" }}>
					{posts.map((post, i) => (
						<Card key={i} post={post} />
					))}
				</Main>
			</ScrollView>
		</SafeAreaView>
	);
};

export default App;

export const getStaticPaths: GetStaticPaths = async () => {
	let counter = 0;
	for await (let { path, stats } of klaw(POSTSDIR, {
		depthLimit: 4,
	})) {
		if (stats.isFile() && path.endsWith(".md")) {
			counter++;
		}
	}
	return {
		paths: new Array(Math.ceil(counter / POSTSPERPAGE))
			.fill(null)
			.map((_, i) => ({ params: { page: !!i ? [`${++i}`] : [] } })),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const page = parseInt(params?.page?.[0] || "1") - 1;
	const posts: { [slug: string]: Post } = {};
	for await (let { path, stats } of klaw(POSTSDIR, {
		depthLimit: 4,
	})) {
		if (stats.isFile() && path.endsWith(".md")) {
			const raw = await fs.readFile(path, "utf8");
			const matt = matter(raw, {
				excerpt: true,
				excerpt_separator: "<!--more-->",
			});
			const slug = basename(path, extname(path));
			const uri = relative(POSTSDIR, path).slice(
				0,
				-extname(path).length,
			);
			posts[slug] = {
				...matt.data,
				slug: uri,
				tags: matt.data.tags.split(" "),
				excerpt: parseMarkdown(matt.excerpt as string),
			} as Post;
		}
	}
	return {
		props: {
			posts: Object.values(posts)
				.sort((a, b) => a.date.localeCompare(b.date))
				.reverse()
				.slice(
					page * POSTSPERPAGE,
					page * POSTSPERPAGE + POSTSPERPAGE,
				),
			page,
			total: Math.ceil(Object.values(posts).length / POSTSPERPAGE),
		},
	};
};
