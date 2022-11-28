import { Box, Button, Image, Text, Heading } from "@chakra-ui/react";
import Link from "next/link";
import Header from "../components/Header";
import InfoList from "../components/InfoList";

const index = () => {
	return (
		<>
			<Header />
			<Box
				display="flex"
				flexDir="column"
				justifyContent="center"
				alignItems="center"
			>
				<Heading
					m="2rem 1rem 0 1rem"
					fontSize="44px"
					fontWeight="600"
					textTransform="uppercase"
					textAlign="center"
				>
					Safe <span style={{ color: "#e74c3c" }}>Travel</span> <br />
					Safe <span style={{ color: "#3498db" }}>Eating</span>
				</Heading>
				<Button
					variant="outline"
					mt="10px"
					borderRadius="5px"
					color="white"
					fontWeight="500"
					fontSize="15px"
				>
					<Link href="/map.html">Get Started</Link>
				</Button>
				<Image src="/banner.png" width="90%" m="2rem auto" />
			</Box>

			<Box my="1rem">
				<Heading textAlign="center" fontWeight="500">
					What MapQuest Do?
				</Heading>
				<InfoList info="Give the safest path to your destination (i.e. a path having suffiecient number of food sources.)." />
				<InfoList info="Give the information and survival tips of your path." />
				<InfoList info="Tell which part of the plant/vegetable is edible." />
			</Box>
		</>
	);
};

export default index;
