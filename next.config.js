// @generated: @expo/next-adapter@3.1.19
// Learn more: https://github.com/expo/expo/blob/master/docs/pages/versions/unversioned/guides/using-nextjs.md#withexpo

const { withExpo } = require("@expo/next-adapter");
const withPlugins = require("next-compose-plugins");
const withPreact = require("next-plugin-preact");
const withTM = require("next-transpile-modules");

module.exports = withPlugins([
	[
		withPreact,
		{
			webpack: (config) => {
				config.resolve.alias = {
					...config.resolve.alias,
					"react-dom/unstable-native-dependencies$":
						"preact-responder-event-plugin",
				};
				return config;
			},
		},
	],
	withTM([
		"@ozymandiasthegreat/react-native-markdown",
		"@jsamr/react-native-li",
		"react-native-web",
	]),
	[
		withExpo,
		{
			projectRoot: __dirname,
			webpack5: true,
		},
	],
]);
