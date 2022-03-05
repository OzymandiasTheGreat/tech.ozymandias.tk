import type { GetStaticProps } from "next";
import fs from "fs/promises";
import klaw from "klaw";
import matter from "gray-matter";
import { POSTSDIR } from "../../constants";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	useWindowDimensions,
	SafeAreaView,
	ScrollView,
	View,
} from "react-native";
import { A, Main } from "@expo/html-elements";
import NoSSR from "react-no-ssr";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { randInt } from "../../util/random";
import { COLOR_GREEN, COLOR_TEXT_BG, STYLE_REGULAR } from "../../theme";

const TagCloud: React.FC<{ tags: Record<string, number> }> = ({ tags }) => {
	const { width } = useWindowDimensions();
	const [small, setSmall] = useState(true);
	const [header, setHeader] = useState(true);

	useEffect(() => setSmall(width < 600), [width]);

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
				<Main
					style={{
						flex: 1,
						width: "100%",
						minHeight: "80%",
						alignItems: "center",
						justifyContent: "center",
						marginBottom: 50,
					}}>
					<View
						style={{
							backgroundColor: COLOR_TEXT_BG,
							flexDirection: "row",
							flexWrap: "wrap",
							alignItems: "center",
							justifyContent: "space-around",
							width: small ? "98%" : "80%",
							maxWidth: 600,
							paddingVertical: 25,
							paddingHorizontal: 50,
							borderRadius: 3,
						}}>
						<NoSSR>
							{Object.entries(tags)
								.sort(() => randInt(-1, 1))
								.map(([tag, count]) => (
									<Link
										key={tag}
										passHref
										href={{ pathname: `/tags/${tag}` }}>
										<A
											style={[
												STYLE_REGULAR,
												{
													color: COLOR_GREEN,
													fontSize: 13 * count,
													margin: 15,
												},
											]}>
											{tag}
										</A>
									</Link>
								))}
						</NoSSR>
					</View>
				</Main>
				<Footer />
			</ScrollView>
		</SafeAreaView>
	);
};

export default TagCloud;

export const getStaticProps: GetStaticProps = async () => {
	const tags: Record<string, number> = {};
	for await (let { path, stats } of klaw(POSTSDIR)) {
		if (stats.isFile() && path.endsWith(".md")) {
			const raw = await fs.readFile(path, "utf8");
			const matt = matter(raw);
			const found = matt.data.tags.split(" ");
			for (let tag of found) {
				if (tag in tags) {
					tags[tag]++;
				} else {
					tags[tag] = 1;
				}
			}
		}
	}
	return { props: { tags } };
};
