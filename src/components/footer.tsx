import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { StyleSheet, Text, View } from "react-native";
import { A, Footer, P } from "@expo/html-elements";
import Icon from "@mdi/react";
import { mdiCopyright } from "@mdi/js";
import {
	COLOR_GREEN,
	COLOR_SITE_BG,
	COLOR_TEXT_BG,
	FONT_REGULAR,
	STYLE_STRONG,
} from "../theme";

const SiteFooter: React.FC<{ page?: number; total?: number }> = ({
	page,
	total,
}) => {
	const pager =
		typeof page === "number" && typeof total === "number" && total > 1;
	const { query } = useRouter();

	return (
		<View
			style={{
				width: "100%",
				justifyContent: "flex-end",
			}}>
			{pager && (
				<View
					style={{
						flex: 1,
						width: "100%",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						marginVertical: 50,
					}}>
					{!!page && (
						<Link
							passHref
							href={{
								pathname: `./${page === 1 ? "" : page}`,
								query,
							}}>
							<A
								style={[
									STYLE_STRONG,
									{
										color: COLOR_GREEN,
										fontSize: 32,
										textShadowRadius: 7,
										marginHorizontal: 15,
									},
								]}>
								{"‹"}
							</A>
						</Link>
					)}
					<Text
						style={[
							STYLE_STRONG,
							{
								color: COLOR_TEXT_BG,
								fontSize: 20,
								textShadowRadius: 7,
								paddingTop: 3,
							},
						]}>
						{(page || 0) + 1} /{" "}
						<Link
							passHref
							href={{
								pathname: `./${total}`,
								query,
							}}>
							<A style={{ color: COLOR_GREEN }}>{total}</A>
						</Link>
					</Text>
					{(page || 0) + 1 !== total && (
						<Link
							passHref
							href={{
								pathname: `./${(page || 0) + 2}`,
								query,
							}}>
							<A
								style={[
									STYLE_STRONG,
									{
										color: COLOR_GREEN,
										fontSize: 32,
										textShadowRadius: 7,
										marginHorizontal: 15,
									},
								]}>
								{"›"}
							</A>
						</Link>
					)}
				</View>
			)}
			<Footer
				style={{
					backgroundColor: COLOR_SITE_BG,
					alignItems: "center",
					justifyContent: "space-around",
					width: "100%",
					height: 275,
					paddingVertical: 50,
				}}>
				<P
					style={[
						styles.paragraph,
						{
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-around",
							width: 200,
						},
					]}>
					<Link passHref href={{ pathname: "/about" }}>
						<A>About</A>
					</Link>
					<Link passHref href={{ pathname: "/tags" }}>
						<A>Tags</A>
					</Link>
					<Link passHref href={{ pathname: "/posts" }}>
						<A>Archive</A>
					</Link>
				</P>
				<P style={[styles.paragraph]}>
					<A href="https://creativecommons.org/licenses/by/4.0/">
						Content available under CC-BY 4.0
					</A>
				</P>
				<P style={[styles.paragraph, { color: COLOR_TEXT_BG }]}>
					<Icon
						path={mdiCopyright}
						size="24px"
						color={COLOR_TEXT_BG}
						style={{
							verticalAlign: "middle",
							marginRight: "10px",
						}}
					/>
					2022 - Tomas Ravinskas
				</P>
				<P style={[styles.paragraph]}>
					<Link passHref href={{ pathname: "/credits" }}>
						<A>Third-party licenses, credits, and mentions.</A>
					</Link>
				</P>
			</Footer>
		</View>
	);
};

const styles = StyleSheet.create({
	paragraph: {
		color: COLOR_GREEN,
		fontFamily: FONT_REGULAR,
		fontSize: 14,
		opacity: 0.7,
	},
});

export default SiteFooter;
