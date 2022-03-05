import React, { useEffect, useState } from "react";
import {
	useWindowDimensions,
	Image,
	SafeAreaView,
	ScrollView,
	View,
} from "react-native";
import { A, H1, Main, P } from "@expo/html-elements";
import { randInt } from "../util/random";
import Header from "../components/header";
import Footer from "../components/footer";
import {
	COLOR_GREEN,
	COLOR_TEXT_BG,
	COLOR_TEXT_FG,
	STYLE_HEADING,
	STYLE_REGULAR,
} from "../theme";

const About: React.FC = () => {
	const { width } = useWindowDimensions();
	const [small, setSmall] = useState(true);
	const [header, setHeader] = useState(true);
	const [imageSource] = useState({ uri: `/profile/${randInt(1, 10)}.jpg` });

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
				<Header opaque={header} />
				<Main
					style={{
						flex: 1,
						backgroundColor: COLOR_TEXT_BG,
						width: small ? "98%" : "80%",
						maxWidth: 800,
						alignSelf: "center",
						padding: 50,
						borderRadius: 3,
						marginBottom: 50,
					}}>
					<Image
						source={imageSource}
						style={{
							width: 256,
							height: 256,
							alignSelf: "center",
							borderRadius: "50%" as any,
							borderColor: COLOR_GREEN,
							borderWidth: 10,
							marginBottom: 50,
						}}
					/>
					<H1
						style={[
							STYLE_HEADING,
							{
								fontSize: 28,
								color: COLOR_TEXT_FG,
								alignSelf: "center",
							},
						]}>
						{"Tomas Ravinskas' Technology Corner"}
					</H1>
					<P style={[STYLE_REGULAR]}>
						{
							"Hello, there! Welcome to my blog. I'm a freelance developer from Kaunas, Lithuania 🇱🇹, Northern Europe."
						}
					</P>
					<P style={[STYLE_REGULAR]}>
						{
							"This is where I share my thoughts, experience, and knowledge regarding technology."
						}
					</P>
					<P style={[STYLE_REGULAR]}>
						{
							"If you want to know more about me, you check out my resume and portfolio at "
						}
						<A
							href="https://tomasrav.me/"
							style={{ color: COLOR_GREEN }}>
							tomasrav.me
						</A>
					</P>
				</Main>
				<Footer />
			</ScrollView>
		</SafeAreaView>
	);
};

export default About;
