import { useEffect, useState } from "react";
import Header from "../components/Header";
import {
	Box,
	Button,
	Image,
	Text,
	Grid,
	Heading,
	Spinner,
	useToast,
} from "@chakra-ui/react";

const FoodDetection = () => {
	const [file, setFile] = useState(null);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const toast = useToast();

	const check = async () => {
		if (!file) return;
		setLoading(true);

		const img = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const res = event.target.result;
				resolve(res);
			};
			reader.readAsDataURL(file);
		});

		const data = {
			api_key: "aWWPMD8MzKOzOXCQvvU9XEWRGeqQ1xNo9HSQqyW4jiSsBqJ4oA",
			images: [img],
			modifiers: ["crops_fast", "similar_images"],
			plant_language: "en",
			plant_details: [
				"common_names",
				"url",
				"name_authority",
				"wiki_description",
				"taxonomy",
				"synonyms",
				"edible_parts",
			],
		};

		fetch("https://api.plant.id/v2/identify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.is_plant_probability < 0.2) {
					toast({
						title: "Somethin went wrong!",
						description:
							"Please upload the image of plant or plant of that fruit.",
						status: "error",
						duration: 5000,
						isClosable: true,
					});
				} else {
					console.log("Success:", data);
					setData(data);
				}
				setLoading(false);
			})
			.catch((error) => {
				console.error("Error:", error);
				setLoading(false);
			});
	};

	useEffect(() => {
		setLoading(false);
	}, []);

	if (loading) {
		return (
			<Box
				w="100vw"
				h="100vh"
				display="flex"
				alignItems="center"
				justifyContent="center"
			>
				<Spinner size="xl" />
			</Box>
		);
	}

	return (
		<>
			<Header />

			<Heading
				fontWeight="500"
				fontSize="25px"
				mt="1rem"
				textAlign="center"
			>
				Detect Food Edibility
			</Heading>
			<Text
				textAlign="center"
				fontSize="14px"
				color="whiteAlpha.600"
				mb="1rem"
			>
				Know which part of the plant is edible!
			</Text>

			<Box
				w="90%"
				bg="whiteAlpha.50"
				minH="300px"
				m="1rem auto"
				borderRadius="10px"
				p="1rem"
			>
				<Box
					pos="relative"
					width="100%"
					h="250px"
					border="2px dashed #ddd"
					borderRadius="10px"
					mb="2rem"
					display="flex"
					alignItems="center"
					justifyContent="center"
					flexDir="column"
				>
					<input
						type="file"
						onChange={(e) => {
							setFile(e.target.files[0]);
						}}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							opacity: "0",
						}}
					/>
					<Image src="/upload.png" w="100px" filter="invert(1)" />
					<Text mt="1rem">Upload your image</Text>
					<Text mt="5px" color="whiteAlpha.700" fontSize="14px">
						{file ? file.name : ""}
					</Text>
				</Box>
				<Button
					onClick={check}
					variant="outline"
					w="100%"
					h="auto"
					p="12px"
					color="rgb(52 152 219)"
					borderColor="rgb(52 152 219)"
					fontWeight="500"
				>
					Let&apos;s Go
				</Button>
			</Box>
			{data && (
				<>
					<Grid
						templateColumns="repeat(2,1fr)"
						gridGap="10px"
						p="1rem 1.5rem"
					>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Plant Name
							</Text>
							<Text fontSize="14px" fontWeight="500">
								{data.suggestions[0].plant_name}
							</Text>
						</Box>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Scientific Name
							</Text>
							<Text fontSize="14px" fontWeight="500">
								{
									data.suggestions[0].plant_details
										.scientific_name
								}
							</Text>
						</Box>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Common Name
							</Text>
							<Text fontSize="14px" fontWeight="500">
								{data.suggestions[0].plant_details.common_names.join(
									","
								)}
							</Text>
						</Box>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Structured Name
							</Text>
							<Text fontSize="14px" fontWeight="500">
								Genus:{" "}
								{
									data.suggestions[0].plant_details
										.structured_name.genus
								}
							</Text>
							<Text fontSize="14px" fontWeight="500">
								Species:{" "}
								{
									data.suggestions[0].plant_details
										.structured_name.species
								}
							</Text>
						</Box>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Synonyms
							</Text>
							<Text fontSize="14px" fontWeight="500">
								{data.suggestions[0].plant_details.synonyms
									.slice(0, 2)
									.join(",")}
							</Text>
						</Box>
						<Box>
							<Text color="whiteAlpha.600" fontSize="13px">
								Edible Parts
							</Text>
							<Text fontSize="14px" fontWeight="500">
								{data.suggestions[0].plant_details.edible_parts
									? data.suggestions[0].plant_details.edible_parts.join(
											","
									  )
									: "None"}
							</Text>
						</Box>
					</Grid>
					<Box
						w="90%"
						p="10px"
						borderRadius="10px"
						bg="whiteAlpha.50"
						m="2rem auto"
						mt="1rem"
					>
						<Image
							src={data.images[0].url}
							maxH="200px"
							w="100%"
							borderRadius="10px"
						/>
						<Text fontSize="17px" mt="10px">
							<a
								href={
									data.suggestions[0].plant_details
										.wiki_description.citation
								}
								target="_blank"
								rel="noreferrer"
							>
								{data.suggestions[0].plant_name}
							</a>
						</Text>
						<Text mt="5px" fontSize="13px" color="whiteAlpha.700">
							{data.suggestions[0].plant_details.wiki_description
								.value.length < 200
								? data.suggestions[0].plant_details
										.wiki_description.value
								: data.suggestions[0].plant_details.wiki_description.value.slice(
										0,
										200
								  ) + "..."}
						</Text>
					</Box>
				</>
			)}
		</>
	);
};

export default FoodDetection;
