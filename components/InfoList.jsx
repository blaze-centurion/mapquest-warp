import { Box, Image, Text } from "@chakra-ui/react";

const InfoList = ({ info }) => {
	return (
		<>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				p="20px 15px"
				bg="whiteAlpha.100"
				borderRadius="5px"
				m="auto"
				mt="15px"
				w="90%"
			>
				<Image src="/checked.png" width="20px" />
				<Text ml="10px">{info}</Text>
			</Box>
		</>
	);
};

export default InfoList;
