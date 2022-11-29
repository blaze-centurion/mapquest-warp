// scale: 0.1 - 1KM
const curr_loc_btn = document.getElementById("curr_loc_btn");

// let food_supply = [];

let map;
let start_nav_marker;
let end_marker;
let pos = [];
// let dis_bw_se = 0;
// let no_of_pos = 0;
let markers = [];
let alerts = [];
let alert_markers = [];
// let start_pos = { lat: -6.56, lng: 20.65 };
// let even_pos = start_pos;
let end_pos = { lat: -6.5, lng: 20.67 };
// let odd_pos = end_pos;
let path;
let start_pos = { lat: -6.56, lng: 20.65 };
// const bounds = {
// 	north: 42.820812,
// 	south: 13.223075,
// 	east: 110.69496,
// 	west: 59.806289,
// };
// const lngSpan = bounds.east - bounds.west;
// const latSpan = bounds.north - bounds.south;
// let food_point_pos_start;
// let food_point_pos_end;

var pusher = new Pusher("681ff9d610d48f576e51", {
	cluster: "ap2",
});
var channel = pusher.subscribe("alert_marker_channel");

function initMap() {
	// var directionsService = new google.maps.DirectionsService();
	// var directionsRenderer = new google.maps.DirectionsRenderer();
	// var chicago = new google.maps.LatLng(29.800102, 75.636558);

	map = new google.maps.Map(document.getElementById("map"), {
		center: start_pos,
		zoom: 6,
		mapId: "717f704680f1f10",
		disableDefaultUI: true,
		zoomControl: false,
	});

	map.addListener("click", (mapEvent) => {
		const img = document.querySelector("#marker_btn img");
		const add_marker_container = document.querySelector(
			".add_marker_container"
		);
		if (img.getAttribute("src") === "close.png") {
			// addMarker(e.latLng.lat(), e.latLng.lng())
			add_marker_container.classList.add("active");
			const select = document.querySelector("#marker_type_select");
			const desc = document.querySelector("#marker_desc");
			console.log(select.value, desc.value);
			document
				.querySelector(".marker_add_btn")
				.addEventListener("click", (e) =>
					addMarker(
						mapEvent.latLng.lat(),
						mapEvent.latLng.lng(),
						select.value,
						desc.value
					)
				);
		} else {
			add_marker_container.classList.remove("active");
			document
				.querySelector(".marker_add_btn")
				.removeEventListener("click", (e) =>
					addMarker(
						mapEvent.latLng.lat(),
						mapEvent.latLng.lng(),
						select.value,
						desc.value
					)
				);
		}
	});
	//
	// directionsRenderer.setMap(map);

	start_nav_marker = new google.maps.Marker({
		position: start_pos,
		map: map,
		title: "Start Position",
	});

	end_marker = new google.maps.Marker({
		position: end_pos, // kam - forward, zyada - backward
		map,
		title: `End Position`,
		draggable: true,
	});

	function showLocation(position) {
		start_pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude,
		};
		start_nav_marker.setPosition(start_pos);
	}

	function errorHandler(err) {
		if (err.code == 1) {
			alert("Error: Access is denied!");
		} else if (err.code == 2) {
			alert("Error: Position is unavailable!");
		}
	}

	function getLocationUpdate() {
		if (navigator.geolocation) {
			// timeout at 60000 milliseconds (60 seconds)
			var options = {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			};
			var geoLoc = navigator.geolocation;
			geoLoc.getCurrentPosition(
				(position) => {
					map.setCenter({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
					start_pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					end_pos = {
						lat: position.coords.latitude + 3,
						lng: position.coords.longitude - 3,
					};
					food_point_pos_start = start_pos;
					food_point_pos_end = end_pos;
					end_marker.setPosition(end_pos);
					pos = [start_pos, end_pos];
					path.setPath(pos);
					// configurePath();
				},
				() => {}
			);

			geoLoc.watchPosition(showLocation, errorHandler, options);
		}
	}

	configureMarkersAndAlert();
	getLocationUpdate();
	configureInfoWindow(markers);

	// function calcRoute() {
	// 	var start = start_pos;
	// 	var end = end_pos;
	// 	var request = {
	// 		origin: start,
	// 		destination: end,
	// 		travelMode: "WALKING",
	// 	};
	// 	directionsService.route(request, function (result, status) {
	// 		if (status == "OK") {
	// 			directionsRenderer.setDirections(result);
	// 		}
	// 	});
	// }
	// calcRoute();

	end_marker.addListener("drag", (e) => {
		end_pos = {
			lat: end_marker.getPosition().lat(),
			lng: end_marker.getPosition().lng(),
		};
		// odd_pos = end_pos;
		// even_pos = start_pos;
		// food_point_pos_start = start_pos;
		// food_point_pos_end = end_pos;

		// configurePath();
		pos = [start_pos, end_pos];
		path.setPath(pos);
	});

	path = new google.maps.Polyline({
		path: pos,
		geodesic: true,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 3,
	});
	// var pathWindow = new google.maps.InfoWindow();
	// google.maps.event.addListener(path, "mouseover", function (e) {
	// 	pathWindow.setPosition(e.latLng);
	// 	pathWindow.setContent("You are at " + e.latLng);
	// 	pathWindow.open(map);
	// });
	// google.maps.event.addListener(path, "mouseout", function () {
	// 	pathWindow.close();
	// });

	pos = [start_pos, end_pos];
	path.setMap(map);
	google.maps.event.addListener(path, "click", async function (h) {
		var latlng = h.latLng;
		var needle = {
			minDistance: 9999999999, //silly high
			index: -1,
			latlng: null,
		};
		path.getPath().forEach(function (routePoint, index) {
			var dist = google.maps.geometry.spherical.computeDistanceBetween(
				latlng,
				routePoint
			);
			if (dist < needle.minDistance) {
				needle.minDistance = dist;
				needle.index = index;
				needle.latlng = routePoint;
			}
		});
		// // The closest point in the polyline
		// alert("Closest index: " + needle.index);

		// // The clicked point on the polyline
		// console.log(latlng);
		// console.log(typeof latlng);
		// console.log(latlng.lat());
		await getWeatherInfo(latlng.lat(), latlng.lng());
		container.classList.add("active");
		// console.log(a);
	});

	curr_loc_btn.addEventListener("click", () => {
		map.setCenter(start_pos);
		map.setZoom(6);
	});

	async function configureMarkersAndAlert() {
		try {
			channel.bind("new_marker", function (item) {
				markers = [...markers, item];
				let x = {
					lat: parseInt(item.lat),
					lng: parseInt(item.lng),
				};
				const typeTitle = {
					both: "Food location and Warning",
					warning: "Warning Marker",
					food: "Food Marker",
				};
				const typeIcon = {
					both: "both.png",
					warning: "warning.png",
					food: "diet.png",
				};
				const marker = new google.maps.Marker({
					position: x,
					map,
					title: `Marker`,
					icon: typeIcon[item["type"]],
				});
				const infowindow = new google.maps.InfoWindow({
					content: `${typeTitle[item.type]}<br />${item.desc}`,
				});

				marker.addListener("click", () => {
					infowindow.open(marker.get("map"), marker);
				});
			});
			channel.bind("new_alert", function (item) {
				alerts = [...alerts, item];
				let x = {
					lat: parseInt(item.lat),
					lng: parseInt(item.lng),
				};
				const marker = new google.maps.Marker({
					position: x,
					map,
					title: `Emergengy Alert`,
					icon: "emergency.png",
				});
				marker.id = item._id;
				console.log(marker.id);
				const infowindow = new google.maps.InfoWindow({
					content: `Emergeny Alert<br/>Someone is in danger.`,
				});

				marker.addListener("click", () => {
					infowindow.open(marker.get("map"), marker);
				});
				alert_markers.push(marker);

				if (window.localStorage.getItem("alertId") !== item.alertId) {
					window.alert("New emergeny alert is issued!");
				}
			});

			channel.bind("remove_alert", function (item) {
				for (var i = 0; i < alert_markers.length; i++) {
					if (alert_markers[i].id === String(item._id)) {
						alert_markers[i].setMap(null);
						alert_markers.splice(i, 1);
						return;
					}
				}
			});

			const markerRes = await fetch(`${SERVER_NAME}/marker`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const alertRes = await fetch(`${SERVER_NAME}/alerts`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const markerData = await markerRes.json();
			const alertsData = await alertRes.json();
			markers = markerData.data;
			alerts = alertsData.data;
			markers.forEach((item, i) => {
				let x = {
					lat: parseInt(item.lat),
					lng: parseInt(item.lng),
				};
				const typeTitle = {
					both: "Food location and Warning",
					warning: "Warning Marker",
					food: "Food Marker",
				};
				const typeIcon = {
					both: "both.png",
					warning: "warning.png",
					food: "diet.png",
				};
				const marker = new google.maps.Marker({
					position: x,
					map,
					title: `Marker`,
					icon: typeIcon[item.type],
				});
				const infowindow = new google.maps.InfoWindow({
					content: `${typeTitle[item.type]}<br />${item.desc}`,
				});

				marker.addListener("click", () => {
					infowindow.open(marker.get("map"), marker);
				});
			});
			alerts.forEach((item, i) => {
				let x = {
					lat: parseInt(item.lat),
					lng: parseInt(item.lng),
				};
				const marker = new google.maps.Marker({
					position: x,
					map,
					title: `Emergengy Alert`,
					icon: "emergency.png",
				});
				const infowindow = new google.maps.InfoWindow({
					content: `Emergeny Alert<br/>Someone is in danger.`,
				});
				marker.id = item._id;
				marker.addListener("click", () => {
					infowindow.open(marker.get("map"), marker);
				});
				alert_markers.push(marker);
			});
		} catch (err) {
			console.log(err);
		}
	}

	// function configurePath() {
	// 	dis_bw_se = distance(
	// 		start_pos.lat,
	// 		start_pos.lng,
	// 		end_pos.lat,
	// 		end_pos.lng
	// 	);
	// 	// no_of_pos = Math.floor(parseInt(dis_bw_se) / 20);
	// 	pos = [start_pos];
	// 	const center = {
	// 		x: (start_pos.lng + end_pos.lng) / 2,
	// 		y: (start_pos.lat + end_pos.lat) / 2,
	// 	};
	// 	const radius = Math.sqrt(
	// 		(start_pos.lng - end_pos.lng) ** 2 +
	// 			(start_pos.lat - end_pos.lat) ** 2
	// 	);

	// 	if (parseInt(dis_bw_se) > 100) {
	// 		let a = food_supply.filter((item, i) => {
	// 			if (
	// 				(item.lng - center.x) ** 2 + (item.lat - center.y) ** 2 <
	// 				radius ** 2
	// 			) {
	// 				return item;
	// 			}
	// 		});

	// 		a = a.filter((item) => {
	// 			if (start_pos.lat > end_pos.lat) {
	// 				if (item.lat < start_pos.lat && item.lat > end_pos.lat) {
	// 					return item;
	// 				}
	// 			} else {
	// 				if (item.lat > start_pos.lat && item.lat <= end_pos.lat) {
	// 					return item;
	// 				}
	// 			}
	// 		});
	// 		a.forEach((item, i) => {
	// 			if (i % 2 === 0) {
	// 				// if (!food_point_pos_start) return;
	// 				food_point_pos_start = findClosest(
	// 					food_point_pos_start,
	// 					a,
	// 					start_pos.lat < end_pos.lat ? true : false,
	// 					i
	// 				);
	// 				pos = [...pos, food_point_pos_start];
	// 			} else {
	// 				// if (!food_point_pos_end) return;
	// 				food_point_pos_end = findClosest(
	// 					food_point_pos_end,
	// 					a,
	// 					start_pos.lat < end_pos.lat ? true : false,
	// 					i
	// 				);
	// 				pos = [...pos, food_point_pos_end];
	// 			}
	// 		});

	// 		// a.forEach((item, i) => {
	// 		// 	// if (i===0) food_point_pos=item;
	// 		// 	food_point_pos = findClosest(
	// 		// 		food_point_pos,
	// 		// 		a,
	// 		// 		start_pos.lat > end_pos.lat ? true : false
	// 		// 	);
	// 		// 	pos = [...pos, food_point_pos];
	// 		// });

	// 		// Array.apply(null, Array(no_of_pos)).forEach((item, i) => {
	// 		// 	if (i % 2 === 0) {
	// 		// 		if (!even_pos) return;
	// 		// 		even_pos = findClosest(
	// 		// 			even_pos.lat,
	// 		// 			even_pos.lng,
	// 		// 			food_supply,
	// 		// 			start_pos.lat < end_pos.lat ? true : false,
	// 		// 			end_pos,
	// 		// 			start_pos
	// 		// 		);
	// 		// 		pos = [...pos, even_pos];
	// 		// 	} else {
	// 		// 		if (!odd_pos) return;
	// 		// 		odd_pos = findClosest(
	// 		// 			odd_pos.lat,
	// 		// 			odd_pos.lng,
	// 		// 			food_supply,
	// 		// 			start_pos.lat < end_pos.lat ? false : true,
	// 		// 			end_pos,
	// 		// 			start_pos
	// 		// 		);
	// 		// 		pos = [...pos, odd_pos];
	// 		// 	}
	// 		// });
	// 		pos = [...pos, end_pos];
	// 	}

	// 	pos = pos.filter((item) => item);
	// }
}

// function isInside(circle_x, circle_y, rad, x, y) {
// 	if (
// 		(x - circle_x) * (x - circle_x) + (y - circle_y) * (y - circle_y) <=
// 		rad * rad
// 	)
// 		return true;
// 	else return false;
// }

// function findClosest(lat, lng, arr, checkForward, end_pos, start_pos) {
// 	let dis_arr = [];
// 	let itemArr = [];

// 	// let circle_center = {
// 	// 	x: (start_pos.lng + end_pos.lng) / 2,
// 	// 	y: (start_pos.lat + end_pos.lat) / 2,
// 	// };
// 	// const rad =
// 	// 	parseInt(
// 	// 		distance(start_pos.lat, start_pos.lng, end_pos.lat, end_pos.lng)
// 	// 	) / 2;
// 	// if (checkForward) {
// 	// 	arr.filter((item) => {
// 	// 		if (
// 	// 			item.lat > lat &&
// 	// 			item.lat <= end_pos.lat &&
// 	// 			item.lng < end_pos.lng + 10 &&
// 	// 			item.lng > end_pos.lng - 10
// 	// 		) {
// 	// 			return item;
// 	// 		}
// 	// 	}).forEach((filteredItem) => {
// 	// 		itemArr = itemArr.concat(filteredItem);
// 	// 		dis_arr = dis_arr.concat(
// 	// 			parseInt(distance(lat, lng, filteredItem.lat, filteredItem.lng))
// 	// 		);
// 	// 	});
// 	// } else {
// 	// 	arr.filter((item) => {
// 	// 		if (
// 	// 			item.lat < lat &&
// 	// 			item.lat >= start_pos.lat &&
// 	// 			item.lng < end_pos.lng + 10 &&
// 	// 			item.lng > end_pos.lng - 10
// 	// 		) {
// 	// 			return item;
// 	// 		}
// 	// 	}).forEach((filteredItem) => {
// 	// 		itemArr = itemArr.concat(filteredItem);
// 	// 		dis_arr = dis_arr.concat(
// 	// 			parseInt(distance(lat, lng, filteredItem.lat, filteredItem.lng))
// 	// 		);
// 	// 	});
// 	// }
// 	// dis_arr = dis_arr.concat(
// 	// 	parseInt(distance(lat, lng, end_pos.lat, end_pos.lng))
// 	// );
// 	// return itemArr[dis_arr.indexOf(Math.min(...dis_arr))];
// }

// function findClosest(item, arr, isEndFrontOfStart, i) {
// 	let dis_arr = [];
// 	if (isEndFrontOfStart) {
// 		arr.forEach((arr_item) => {
// 			// if (checkForward) {
// 			// const dis = distance(item.lat, item.lng, arr_item.lat, arr_item.lng);
// 			// dis_arr = dis_arr.concat(parseInt(dis));
// 			// } else {
// 			// }
// 			// console.log(arr_item);
// 			// if (!arr_item) return;
// 			// if (start_pos.lat < end_pos.lat) {
// 			// 	if (arr_item.lat > item.lat) {
// 			// 		const dis = distance(
// 			// 			item.lat,
// 			// 			item.lng,
// 			// 			arr_item.lat,
// 			// 			arr_item.lng
// 			// 		);
// 			// 		dis_arr = dis_arr.concat(parseInt(dis));
// 			// 	}
// 			// } else {
// 			// 	if (arr_item.lat < item.lat) {
// 			// 		const dis = distance(
// 			// 			item.lat,
// 			// 			item.lng,
// 			// 			arr_item.lat,
// 			// 			arr_item.lng
// 			// 		);
// 			// 		dis_arr = dis_arr.concat(parseInt(dis));
// 			// 	}
// 			// }

// 			if (i % 2 === 0) {
// 				// start
// 				if (arr_item.lat > item.lat) {
// 					const dis = distance(
// 						item.lat,
// 						item.lng,
// 						arr_item.lat,
// 						arr_item.lng
// 					);
// 					dis_arr = dis_arr.concat(parseInt(dis));
// 				}
// 			} else {
// 				// end
// 				if (arr_item.lat < item.lat) {
// 					const dis = distance(
// 						item.lat,
// 						item.lng,
// 						arr_item.lat,
// 						arr_item.lng
// 					);
// 					dis_arr = dis_arr.concat(parseInt(dis));
// 				}
// 			}
// 		});
// 	} else {
// 		arr.forEach((arr_item) => {
// 			if (i % 2 === 0) {
// 				// start
// 				if (arr_item.lat < item.lat) {
// 					const dis = distance(
// 						item.lat,
// 						item.lng,
// 						arr_item.lat,
// 						arr_item.lng
// 					);
// 					dis_arr = dis_arr.concat(parseInt(dis));
// 				}
// 			} else {
// 				// end
// 				if (arr_item.lat > item.lat) {
// 					const dis = distance(
// 						item.lat,
// 						item.lng,
// 						arr_item.lat,
// 						arr_item.lng
// 					);
// 					dis_arr = dis_arr.concat(parseInt(dis));
// 				}
// 			}
// 		});
// 	}
// 	return arr[dis_arr.indexOf(Math.min(...dis_arr))];
// }

function distance(lat1, lon1, lat2, lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = ((lat2 - lat1) * Math.PI) / 180;
	var dLon = ((lon2 - lon1) * Math.PI) / 180;
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	if (d > 1) return Math.round(d) + "km";
	else if (d <= 1) return Math.round(d * 1000) + "m";
	return d;
}

function configureInfoWindow(markers) {
	// Array.apply(null, Array(60)).forEach((_, i) => {
	// 	let x = {
	// 		lat: bounds.south + latSpan * Math.random(),
	// 		lng: bounds.west + lngSpan * Math.random(),
	// 	};
	// 	food_supply = [...food_supply, x];
	// 	const marker = new google.maps.Marker({
	// 		position: x,
	// 		map,
	// 		title: `Food Point #${i + 1}`,
	// 		icon: "diet.png",
	// 	});
	// 	const infowindow = new google.maps.InfoWindow({
	// 		content: `Food Supply Location #${i + 1}`,
	// 	});

	// 	marker.addListener("click", () => {
	// 		infowindow.open(marker.get("map"), marker);
	// 	});
	// });

	const startWindow = new google.maps.InfoWindow({
		content: `Start Position`,
	});
	startWindow.addListener("click", () => {
		startWindow.open(start_nav_marker.get("map"), start_nav_marker);
	});
	const endWindow = new google.maps.InfoWindow({
		content: `End Position`,
	});
	endWindow.addListener("click", () => {
		endWindow.open(end_marker.get("map"), end_marker);
	});
}

const addMarker = async (lat, lng, marker_type, desc) => {
	try {
		const res = await fetch(`${SERVER_NAME}/addMarker`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ type: marker_type, desc, lat, lng }),
		});
		const data = await res.json();
		console.log(data);
		window.alert("Added Successfully!");
	} catch (err) {
		console.log(err);
	}
};

window.initMap = initMap;
