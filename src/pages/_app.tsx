import "setimmediate";
import "../fallback.css";
import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { SafeAreaView } from "react-native";
import SlowMatrixBackground from "../components/slow-matrix";

const App: React.FC<{ Component: React.FC<any>; pageProps: AppProps }> = ({
	Component,
	pageProps,
}) => {
	return (
		<>
			<Head>
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="icon" type="image/png" href="/favicon.png" />
				<script
					src="https://cdn.jsdelivr.net/gh/virae/we-stand-with-ukraine@v1.0.1/badge.js"
					async
				/>
			</Head>
			<SafeAreaView style={{ flex: 1 }}>
				<SlowMatrixBackground>
					<Component {...pageProps}></Component>
				</SlowMatrixBackground>
			</SafeAreaView>
		</>
	);
};

export default App;
