import type { GetStaticPaths, GetStaticProps } from "next";
import fs from "fs/promises";
import { dirname, extname, join, relative, sep } from "path";
import klaw from "klaw";
import matter from "gray-matter";
import type { Post } from "../../../../../types/post";
import { POSTSDIR, POSTSPERPAGE } from "../../../../../constants";
import { parseMarkdown } from "../../../../../util/markdown";

import React, { useState } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import Link from "next/link";
import { H1, Main } from "@expo/html-elements";
import Header from "../../../../../components/header";
import Footer from "../../../../../components/footer";
import Card from "../../../../../components/card";
import { COLOR_TEXT_BG, STYLE_HEADING } from "../../../../../theme";

const Day: React.FC<{
	posts: Post[];
	year: string;
	month: string;
	day: string;
	page: number;
	total: number;
}> = ({ posts, year, month, day, page, total }) => {
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
				<H1
					style={[
						STYLE_HEADING,
						{ alignSelf: "center", color: COLOR_TEXT_BG },
					]}>
					{new Date(`${year}-${month}-${day}`).toLocaleDateString(
						"lt",
					)}
				</H1>
				<Main style={{ flex: 1 }}>
					{posts.map((post, i) => (
						<Card key={i} post={post} />
					))}
				</Main>
				<Footer page={page} total={total} />
			</ScrollView>
		</SafeAreaView>
	);
};

export default Day;

export const getStaticPaths: GetStaticPaths = async () => {
	const counter: Record<string, number> = {};
	for await (let { path } of klaw(POSTSDIR, { depthLimit: 4 })) {
		const parts = relative(POSTSDIR, dirname(path)).split(sep);
		if (parts.length === 3) {
			const slug = parts.join("-");
			if (slug in counter) {
				counter[slug]++;
			} else {
				counter[slug] = 1;
			}
		}
	}
	return {
		paths: Object.entries(counter)
			.map(([slug, count]) =>
				new Array(Math.ceil(count / POSTSPERPAGE))
					.fill(null)
					.map((_, i) => {
						const [year, month, day] = slug.split("-");
						return {
							params: {
								page: !!i ? [`${++i}`] : [],
								year,
								month,
								day,
							},
						};
					}),
			)
			.flat(1),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const year = params?.year as string;
	const month = params?.month as string;
	const day = params?.day as string;
	const page = parseInt(params?.page?.[0] || "1") - 1;
	const root = join(POSTSDIR, year, month, day);
	const posts: { [slug: string]: Post } = {};
	for await (let { path, stats } of klaw(root, { depthLimit: 1 })) {
		if (stats.isFile() && path.endsWith(".md")) {
			const raw = await fs.readFile(path, "utf8");
			const matt = matter(raw, {
				excerpt: true,
				excerpt_separator: "<!--more-->",
			});
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
	return {
		props: {
			year,
			month,
			day,
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
