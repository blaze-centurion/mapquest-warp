import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/poppins";

// const config = {
// 	initialColorMode: "dark",
// 	useSystemColorMode: false,
// };

const theme = extendTheme({
	fonts: {
		heading: `"Poppins", sans-serif;`,
		body: `"Poppins", sans-serif;`,
	},
	styles: {
		global: {
			body: {
				bg: "#161b22",
			},
			"*": {
				color: "white",
			},
		},
	},
});

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider theme={theme}>
			<Component {...pageProps} />
		</ChakraProvider>
	);
}

export default MyApp;
