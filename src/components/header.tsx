import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
	useWindowDimensions,
	Animated,
	Image,
	Text,
	View,
} from "react-native";
import { A, Header, P } from "@expo/html-elements";
import { randInt } from "../util/random";
import {
	COLOR_SITE_BG,
	COLOR_TEXT_BG,
	COLOR_TEXT_FG,
	FONT_HEADING,
	setOpacity,
	STYLE_HEADING,
} from "../theme";

const AnimatedHeader = Animated.createAnimatedComponent(Header);

const Profile: React.FC<{ visible: boolean }> = ({ visible }) => {
	const [index] = useState(randInt(1, 10));

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				maxWidth: "40%",
			}}>
			<Image
				source={{ uri: `/profile/${index}.jpg` }}
				style={{
					display: visible ? "flex" : "none",
					width: 70,
					height: 70,
					borderColor: COLOR_TEXT_BG,
					borderRadius: "50%" as any,
					borderWidth: 5,
					marginRight: 15,
				}}
			/>
			<P
				style={[
					STYLE_HEADING,
					{
						display: visible ? "flex" : "none",
						color: COLOR_TEXT_BG,
						fontSize: 18,
						textAlignVertical: "center",
					},
				]}>
				{
					"Ramblings about technology, coding, and everything in between."
				}
			</P>
		</View>
	);
};

const SiteHeader: React.FC<{ opaque: boolean }> = ({ opaque }) => {
	const { width } = useWindowDimensions();
	const [visible, setVisible] = useState(true);
	const backgroundAnimation = useRef(new Animated.Value(0)).current;
	const backgroundColor = backgroundAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: [setOpacity(COLOR_SITE_BG, 0.3), COLOR_SITE_BG],
	});
	const heightAnimation = useRef(new Animated.Value(0)).current;
	const height = heightAnimation.interpolate({
		inputRange: [0, 1],
		outputRange: [40, 80],
	});

	useEffect(() => setVisible(opaque && width > 800), [opaque, width]);
	useEffect(() => {
		Animated.timing(backgroundAnimation, {
			toValue: +opaque,
			duration: 300,
			useNativeDriver: false,
		}).start();
		Animated.timing(heightAnimation, {
			toValue: +opaque,
			duration: 300,
			useNativeDriver: false,
		}).start();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opaque]);

	return (
		<AnimatedHeader
			style={{
				backgroundColor,
				height,
				width,
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				paddingVertical: 3,
				paddingHorizontal: 20,
				marginBottom: 20,
			}}>
			<Profile visible={visible} />
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					width: 300,
				}}>
				<Link passHref href={{ pathname: "/" }}>
					<A>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
							}}>
							<Image
								source={{ uri: "/logo.svg" }}
								style={{
									width: 48,
									height: 48,
									resizeMode: "contain",
									marginRight: 5,
								}}
							/>
							<Text
								style={{
									color: COLOR_TEXT_BG,
									fontFamily: FONT_HEADING,
									fontSize: opaque ? 18 : 14,
									maxWidth: 180,
								}}>
								Technology Corner
							</Text>
						</View>
					</A>
				</Link>
				<A href="https://tomasrav.me/">
					<View
						style={{ flexDirection: "row", alignItems: "center" }}>
						<Image
							source={{ uri: "/main_logo.svg" }}
							style={{
								width: 48,
								height: 48,
								resizeMode: "contain",
								marginRight: 5,
							}}
						/>
						<Text
							style={{
								color: COLOR_TEXT_BG,
								fontFamily: FONT_HEADING,
								fontSize: opaque ? 18 : 14,
								maxWidth: 180,
							}}>
							Main Website
						</Text>
					</View>
				</A>
			</View>
		</AnimatedHeader>
	);
};

export default SiteHeader;
