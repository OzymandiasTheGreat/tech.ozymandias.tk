import React, { useEffect, useState } from "react";
import { useWindowDimensions, ImageBackground, View } from "react-native";
import Link from "next/link";
import { A, H2, P } from "@expo/html-elements";
import { Markdown } from "@ozymandiasthegreat/react-native-markdown/src";
import {
	setOpacity,
	COLOR_GREEN,
	COLOR_TEXT_BG,
	FONT_CODE,
	FONT_REGULAR,
	STYLE_HEADING,
	STYLE_REGULAR,
} from "../theme";
import type { Post } from "../types/post";

const Card: React.FC<{ post: Post }> = ({ post }) => {
	const { width } = useWindowDimensions();
	const [vertical, setVertical] = useState(true);

	useEffect(() => setVertical(width < 800), [width]);

	return (
		<Link passHref href={{ pathname: `/${post.slug}` }}>
			<A
				style={{
					alignSelf: "center",
					width: vertical ? "98%" : "80%",
					maxWidth: 1000,
					height: vertical ? "80vh" : "65vw",
					borderRadius: 3,
					marginVertical: "5vw",
				}}>
				<ImageBackground
					source={{ uri: post.image.link }}
					style={{
						flexDirection: vertical ? "row" : "column",
						width: "100%",
						height: "100%",
						alignItems: "flex-end",
						borderRadius: 3,
					}}
					imageStyle={{ borderRadius: 3 }}
					resizeMode="cover">
					<View
						style={{
							width: vertical ? "100%" : "50%",
							minHeight: vertical ? "50%" : "100%",
							maxHeight: vertical ? "80%" : "100%",
							backgroundColor: setOpacity(COLOR_TEXT_BG, 0.75),
							padding: 30,
							borderTopRightRadius: 3,
							borderBottomRightRadius: 3,
						}}>
						<H2
							style={[
								STYLE_HEADING,
								{ fontSize: 22, margin: 0 },
							]}>
							{post.title}
						</H2>
						<P
							style={[
								STYLE_REGULAR,
								{
									alignSelf: "flex-end",
									fontSize: 14,
									opacity: 0.6,
									margin: 0,
								},
							]}>
							Posted on{" "}
							{new Date(post.date).toLocaleDateString("lt")}
						</P>
						<Markdown
							source={{ ast: post.excerpt }}
							style={{
								flex: 1,
								width: "100%",
								height: "100%",
								padding: 0,
								margin: 0,
							}}
							pStyle={STYLE_REGULAR}
							aStyle={{ color: COLOR_GREEN }}
							hStyle={STYLE_HEADING}
							fontMap={{
								normal: FONT_REGULAR,
								italic: FONT_REGULAR,
								bold: FONT_REGULAR,
								monospace: FONT_CODE,
							}}
						/>
					</View>
				</ImageBackground>
			</A>
		</Link>
	);
};

export default Card;
