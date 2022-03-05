// @generated: @expo/next-adapter@3.1.19
import Document from "@expo/next-adapter/document";
import { Head, Html, Main, NextScript } from "next/document";
import React from "react";

class CustomDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
					<link
						rel="preconnect"
						href="https://fonts.googleapis.com"
					/>
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin="anonymous"
					/>
					<link
						href="https://fonts.googleapis.com/css2?family=Fira+Code&family=Fira+Sans:ital,wght@0,400;0,700;1,400&family=Merriweather:wght@900&display=swap"
						rel="stylesheet"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default CustomDocument;
