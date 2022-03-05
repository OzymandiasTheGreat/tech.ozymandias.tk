import type { GetStaticProps } from "next";
import { relative, sep } from "path";
import klaw from "klaw";
import { POSTSDIR } from "../../constants";

import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { H2, Main } from "@expo/html-elements";
import Calendar from "react-native-calendar-picker";
import moment from "moment-timezone";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
	COLOR_SITE_BG,
	COLOR_TEXT_BG,
	COLOR_TEXT_FG,
	setOpacity,
	STYLE_HEADING,
	STYLE_REGULAR,
} from "../../theme";

const Archive: React.FC<{ dates: Record<string, string[]> }> = ({ dates }) => {
	const [header, setHeader] = useState(true);

	const headerCallback = (offset: number) => {
		if (offset <= 100 !== header) {
			setHeader(!header);
		}
	};
	const dateSelector = (
		date: moment.Moment,
		month: string,
		days: string[],
	): boolean =>
		!(
			month ===
				`${date.year()}-${(date.month() + 1)
					.toString()
					.padStart(2, "0")}` &&
			days.includes(date.date().toString().padStart(2, "0"))
		);
	const dateNavigator = (date: moment.Moment) =>
		window.open(
			`/posts/${date.year()}/${(date.month() + 1)
				.toString()
				.padStart(2, "0")}/${date.date().toString().padStart(2, "0")}`,
			"_self",
		);

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
						backgroundColor: COLOR_TEXT_BG,
						flex: 1,
						alignSelf: "center",
						flexDirection: "row",
						flexWrap: "wrap",
						alignItems: "baseline",
						justifyContent: "space-around",
						width: "90%",
						maxWidth: 800,
						minHeight: 300,
						padding: 50,
						borderRadius: 3,
						marginBottom: 50,
					}}>
					{Object.entries(dates)
						.sort(([a, _], [b, $]) => a.localeCompare(b))
						.map(([month, day]) => {
							const initial = moment.tz(month, "Europe/Vilnius");
							return (
								<View key={month}>
									<H2
										style={[
											STYLE_HEADING,
											{
												color: COLOR_TEXT_FG,
												fontSize: 18,
												alignSelf: "center",
											},
										]}>
										{month}
									</H2>
									<Calendar
										width={300}
										height={260}
										initialDate={initial as any}
										disabledDates={(date) =>
											dateSelector(date, month, day)
										}
										onDateChange={dateNavigator}
										monthYearHeaderWrapperStyle={{
											display: "none",
										}}
										textStyle={[
											STYLE_REGULAR,
											{
												color: COLOR_TEXT_FG,
												fontSize: 15,
											},
										]}
										disabledDatesTextStyle={[
											STYLE_REGULAR,
											{
												color: COLOR_TEXT_FG,
												fontSize: 13,
												opacity: 0.3,
											},
										]}
										selectedDayTextColor={COLOR_TEXT_FG}
										selectedDayStyle={{
											backgroundColor: "transparent",
										}}
										startFromMonday={true}
										previousComponent={<></>}
										nextComponent={<></>}
									/>
								</View>
							);
						})}
				</Main>
				<Footer />
			</ScrollView>
		</SafeAreaView>
	);
};

export default Archive;

export const getStaticProps: GetStaticProps = async () => {
	const dates: Record<string, string[]> = {};
	for await (let { path, stats } of klaw(POSTSDIR, { depthLimit: 3 })) {
		const parts = relative(POSTSDIR, path).split(sep);
		if (parts.length === 2) {
			dates[parts.join("-")] = [];
		} else if (parts.length === 3) {
			dates[parts.slice(0, 2).join("-")].push(parts[2]);
		}
	}
	return { props: { dates } };
};
