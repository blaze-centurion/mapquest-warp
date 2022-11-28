import { Box, Button, Image, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
	const [menuActive, setMenuActive] = useState(false);

	return (
		<>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				p="10px 15px"
				pos="relative"
				borderBottom="1px solid #555"
			>
				<Link href="/">
					<Image src="/logo.png" width="120px" />
				</Link>
				<Button
					variant="unstyled"
					borderRadius="50%"
					p="10px"
					onClick={() => setMenuActive((prev) => !prev)}
				>
					<Image
						filter="invert(1)"
						src="/menu.png"
						w="23px"
						h="23px"
					/>
				</Button>
				<Box
					pos="absolute"
					top="2.7rem"
					right="2rem"
					bg="#292A2D"
					zIndex="1000"
					w="210px"
					borderRadius="5px"
					transform={`scale(${menuActive ? 1 : 0})`}
					transformOrigin="top right"
					transition="0.3s"
					p="0.7rem 0"
				>
					<Box p="12px 20px">
						<Link
							href="/"
							style={{ width: "100%", display: "block" }}
						>
							Home
						</Link>
					</Box>
					<Box p="12px 20px">
						<Link
							href="/food-detection"
							style={{ width: "100%", display: "block" }}
						>
							Food Detection
						</Link>
					</Box>
					<Box p="12px 20px">
						<Link
							href="/map.html"
							style={{ width: "100%", display: "block" }}
						>
							Map
						</Link>
					</Box>
					<Box p="12px 20px">
						<Link
							href="/"
							style={{ width: "100%", display: "block" }}
						>
							Community
						</Link>
					</Box>
				</Box>
			</Box>
		</>
	);
};

export default Header;
