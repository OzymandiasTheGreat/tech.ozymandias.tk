import type { GetStaticPaths, GetStaticProps } from "next";
import fs from "fs/promises";
import { dirname, extname, relative, sep } from "path";
import klaw from "klaw";
import matter from "gray-matter";
import type { Post } from "../../../types/post";
import { POSTSDIR, POSTSPERPAGE } from "../../../constants";
import { parseMarkdown } from "../../../util/markdown";

import React, { useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1, Main } from "@expo/html-elements";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import Card from "../../../components/card";
import { COLOR_TEXT_BG, STYLE_HEADING } from "../../../theme";

const TagListing: React.FC<{
	tag: string;
	posts: Post[];
	page: number;
	total: number;
}> = ({ tag, posts, page, total }) => {
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
				<Header opaque={header} />
				<Main style={{ flex: 1 }}>
					<H1
						style={[
							STYLE_HEADING,
							{ alignSelf: "center", color: COLOR_TEXT_BG },
						]}>
						Tagged: {tag}
					</H1>
					{posts.map((post, i) => (
						<Card key={i} post={post} />
					))}
				</Main>
				<Footer page={page} total={total} />
			</ScrollView>
		</SafeAreaView>
	);
};

export default TagListing;

export const getStaticPaths: GetStaticPaths = async () => {
	const counter: Record<string, number> = {};
	for await (let { path, stats } of klaw(POSTSDIR)) {
		if (stats.isFile() && path.endsWith(".md")) {
			const raw = await fs.readFile(path, "utf8");
			const matt = matter(raw);
			for (let tag of matt.data.tags.split(" ")) {
				if (tag in counter) {
					counter[tag]++;
				} else {
					counter[tag] = 1;
				}
			}
		}
	}
	return {
		paths: Object.entries(counter)
			.map(([tag, count]) =>
				new Array(Math.ceil(count / POSTSPERPAGE))
					.fill(null)
					.map((_, i) => ({
						params: {
							tag,
							page: !!i ? [`${++i}`] : [],
						},
					})),
			)
			.flat(1),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const tag = params?.tag as string;
	const page = parseInt(params?.page?.[0] || "1") - 1;
	const posts: { [slug: string]: Post } = {};
	for await (let { path, stats } of klaw(POSTSDIR)) {
		if (stats.isFile() && path.endsWith(".md")) {
			const raw = await fs.readFile(path, "utf8");
			const matt = matter(raw, {
				excerpt: true,
				excerpt_separator: "<!--more-->",
			});
			if (matt.data.tags.includes(tag)) {
				const slug = relative(POSTSDIR, path).slice(
					0,
					-extname(path).length,
				);
				posts[slug] = {
					...matt.data,
					slug,
					tags: matt.data.tags.split(" "),
					excerpt: parseMarkdown(matt.excerpt as string),
				} as Post;
			}
		}
	}
	return {
		props: {
			tag,
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
