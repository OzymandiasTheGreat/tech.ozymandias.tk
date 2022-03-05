import React, { useEffect, useState } from "react";
import { useWindowDimensions, SafeAreaView, ScrollView } from "react-native";
import { A, H1, Main, P } from "@expo/html-elements";
import Icon from "@mdi/react";
import { mdiCopyright } from "@mdi/js";
import Header from "../components/header";
import Footer from "../components/footer";
import {
	COLOR_GREEN,
	COLOR_TEXT_BG,
	COLOR_TEXT_FG,
	setOpacity,
	STYLE_REGULAR,
} from "../theme";

const Credits: React.FC = () => {
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
				<Header opaque={header} />
				<Main
					style={{
						flex: 1,
						alignSelf: "center",
						backgroundColor: COLOR_TEXT_BG,
						width: small ? "98%" : "80%",
						maxWidth: 800,
						paddingVertical: 25,
						paddingHorizontal: small ? 15 : 50,
						borderRadius: 3,
						marginVertical: 50,
					}}>
					<P
						style={[
							STYLE_REGULAR,
							{
								color: COLOR_TEXT_FG,
							},
						]}>
						<Icon
							path={mdiCopyright}
							size="24px"
							color={setOpacity(COLOR_TEXT_FG, 0.75)}
							style={{ verticalAlign: "middle" }}
						/>
						2022 - Tomas Ravinskas
					</P>
					<P style={[STYLE_REGULAR, { color: COLOR_TEXT_FG }]}>
						All content licensed under{" "}
						<A
							href="https://creativecommons.org/licenses/by/4.0/"
							style={{ color: COLOR_GREEN }}>
							CC-BY 4.0
						</A>
					</P>
					<P style={[STYLE_REGULAR, { color: COLOR_TEXT_FG }]}>
						All articles include attribution and links to licenses
						for third-party content used within.
					</P>
					<P style={[STYLE_REGULAR, { color: COLOR_TEXT_FG }]}>
						Icons from{" "}
						<A
							href="https://materialdesignicons.com/"
							style={{ color: COLOR_GREEN }}>
							Material Design Icons Project
						</A>{" "}
						used here under Pictogrammers Free License.
					</P>
				</Main>
				<Footer />
			</ScrollView>
		</SafeAreaView>
	);
};

export default Credits;
