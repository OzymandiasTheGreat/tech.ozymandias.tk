import type { GetStaticPaths, GetStaticProps } from "next";
import fs from "fs/promises";
import { dirname, extname, join, relative, sep } from "path";
import klaw from "klaw";
import matter from "gray-matter";
import type { Post } from "../../../../../types/post";
import { POSTSDIR } from "../../../../../constants";
import { parseMarkdown } from "../../../../../util/markdown";

import React, { useEffect, useState } from "react";
import {
	useWindowDimensions,
	Image,
	SafeAreaView,
	ScrollView,
	Text,
	View,
} from "react-native";
import Link from "next/link";
import { A, EM, H1, HR, Main, P, Time } from "@expo/html-elements";
import Icon from "@mdi/react";
import { mdiCopyright, mdiDevTo } from "@mdi/js";
import { Markdown } from "@ozymandiasthegreat/react-native-markdown/src";
import Header from "../../../../../components/header";
import Footer from "../../../../../components/footer";
import {
	COLOR_GREEN,
	COLOR_TEXT_BG,
	COLOR_TEXT_FG,
	FONT_CODE,
	FONT_REGULAR,
	setOpacity,
	STYLE_EMPHASIS,
	STYLE_HEADING,
	STYLE_REGULAR,
	STYLE_STRONG,
} from "../../../../../theme";

const PostRenderer: React.FC<{ post: Post }> = ({ post }) => {
	const { width } = useWindowDimensions();
	const [small, setSmall] = useState(true);
	const [header, setHeader] = useState(true);
	const [comments, setComments] = useState(false);

	useEffect(() => setSmall(width < 600), [width]);

	const headerCallback = (offset: number) => {
		if (offset <= 100 !== header) {
			setHeader(!header);
		}
	};
	const loadComments = () => setComments(true);

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
					<View
						style={{
							backgroundColor: COLOR_TEXT_BG,
							alignSelf: "center",
							width: small ? "98%" : "80%",
							maxWidth: 800,
							paddingVertical: 25,
							paddingHorizontal: small ? 15 : 50,
							borderTopLeftRadius: 3,
							borderTopRightRadius: 3,
							marginTop: 50,
						}}>
						<H1 style={[STYLE_HEADING, { color: COLOR_TEXT_FG }]}>
							{post.title}
						</H1>
						<View
							style={{
								width: "100%",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
								}}>
								{!!post.medium && (
									<A
										href={post.medium}
										style={{ marginRight: 10 }}>
										<Image
											source={{
												uri: "/medium.svg",
												width: 22,
												height: 22,
											}}
											style={{
												opacity: 0.8,
											}}
										/>
									</A>
								)}
								{!!post.devto && (
									<A href={post.devto}>
										<Icon
											path={mdiDevTo}
											size="28px"
											color={COLOR_TEXT_FG}
											style={{ verticalAlign: "middle" }}
										/>
									</A>
								)}
							</View>
							<Time>
								<Link
									passHref
									href={{
										pathname: `/posts/${dirname(
											post.slug,
										)}`,
									}}>
									<A
										style={[
											STYLE_STRONG,
											{ fontSize: 14, opacity: 0.75 },
										]}>
										{new Date(
											post.date,
										).toLocaleDateString("lt")}
									</A>
								</Link>
							</Time>
						</View>
					</View>
					<View
						style={{
							alignSelf: "stretch",
							width: "100%",
						}}>
						<Image
							source={{
								uri: post.image.link,
								width: width,
								height: Math.floor(width * 0.45),
							}}
							style={{
								width: width - 28,
								borderColor: COLOR_TEXT_BG,
								borderWidth: 7,
								borderRadius: 3,
							}}
							resizeMode="cover"
						/>
						<P
							style={[
								STYLE_REGULAR,
								{
									fontSize: 14,
									color: setOpacity(COLOR_TEXT_FG, 0.7),
									backgroundColor: COLOR_TEXT_BG,
									alignSelf: "center",
									width: small ? "98%" : "80%",
									maxWidth: 800,
									textAlign: "center",
									textAlignVertical: "center",
									margin: 0,
								},
							]}>
							<Icon
								path={mdiCopyright}
								size="24px"
								color={setOpacity(COLOR_TEXT_FG, 0.7)}
								style={{
									verticalAlign: "middle",
									marginRight: 10,
								}}
							/>
							Image by{" "}
							<A
								href={post.image.author.link}
								style={{ textDecorationLine: "underline" }}>
								{post.image.author.name}
							</A>{" "}
							from{" "}
							<A
								href={post.image.source.link}
								style={{ textDecorationLine: "underline" }}>
								{post.image.source.name}
							</A>
						</P>
					</View>
					<View
						style={{
							backgroundColor: COLOR_TEXT_BG,
							alignSelf: "center",
							width: small ? "98%" : "80%",
							maxWidth: 800,
							paddingVertical: 25,
							paddingHorizontal: small ? 15 : 50,
							borderBottomLeftRadius: 3,
							borderBottomRightRadius: 3,
						}}>
						<Markdown
							source={{ ast: post.content }}
							style={{
								width: "100%",
								padding: 0,
							}}
							pStyle={{
								...STYLE_REGULAR,
								color: COLOR_TEXT_FG,
							}}
							hStyle={{ ...STYLE_HEADING, color: COLOR_TEXT_FG }}
							aStyle={{ color: COLOR_GREEN }}
							fontMap={{
								normal: FONT_REGULAR,
								italic: FONT_REGULAR,
								bold: FONT_REGULAR,
								monospace: FONT_CODE,
							}}
						/>
						<HR
							style={{
								backgroundColor: setOpacity(
									COLOR_TEXT_FG,
									0.7,
								),
								width: "98%",
							}}
						/>
						{!!post.source && (
							<P
								style={[
									STYLE_REGULAR,
									{
										color: COLOR_TEXT_FG,
										fontSize: 14,
									},
								]}>
								via{" "}
								<A
									href={post.source}
									style={{ color: COLOR_GREEN }}>
									{post.source}
								</A>
							</P>
						)}
						<P
							style={[
								STYLE_REGULAR,
								{
									color: setOpacity(COLOR_TEXT_FG, 0.6),
									fontSize: 14,
									marginRight: 10,
								},
							]}>
							Tagged:{" "}
							{post.tags.map((tag) => (
								<Link
									key={tag}
									passHref
									href={{ pathname: `/tags/${tag}` }}>
									<A
										style={[
											STYLE_EMPHASIS,
											{
												textDecorationLine:
													"underline",
												marginRight: 10,
											},
										]}>
										{tag}
									</A>
								</Link>
							))}
						</P>
					</View>
				</Main>
				<Footer />
			</ScrollView>
		</SafeAreaView>
	);
};

export default PostRenderer;

export const getStaticPaths: GetStaticPaths = async () => {
	const paths: {
		params: { year: string; month: string; day: string; slug: string };
	}[] = [];
	for await (let { path, stats } of klaw(POSTSDIR)) {
		if (stats.isFile() && path.endsWith(".md")) {
			const [year, month, day, slug] = relative(
				POSTSDIR,
				path.slice(0, -extname(path).length),
			).split(sep);
			paths.push({ params: { year, month, day, slug } });
		}
	}
	return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { year, month, day, slug } = params as any;
	const raw = await fs.readFile(
		join(POSTSDIR, year, month, day, `${slug}.md`),
	);
	const matt = matter(raw);
	const post = {
		...matt.data,
		slug: `${year}/${month}/${day}/${slug}`,
		tags: matt.data.tags.split(" "),
		content: parseMarkdown(matt.content),
	} as Post;
	return { props: { post } };
};
