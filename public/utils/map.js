// scale: 0.1 - 1KM
const curr_loc_btn = document.getElementById("curr_loc_btn");

let food_supp = [];

let map;
let start;
let end;
let pos = [];
let dis_bw_se = 0;
let no_of_pos = 0;
let start_pos = { lat: -6.56, lng: 20.65 };
let even_pos = start_pos;
let end_pos = { lat: -6.5, lng: 20.67 };
let odd_pos = end_pos;
let path;

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: start_pos,
		zoom: 12,
		mapId: "2014b004c4125a55",
		disableDefaultUI: true,
		zoomControl: false,
	});

	const bounds = {
		north: 76.021221,
		south: -66.954481,
		east: 148.166497,
		west: -123.125951,
	};

	const lngSpan = bounds.east - bounds.west;
	const latSpan = bounds.north - bounds.south;

	Array.apply(null, Array(60)).forEach((item, i) => {
		let x = {
			lat: bounds.south + latSpan * Math.random(),
			lng: bounds.west + lngSpan * Math.random(),
		};
		food_supp = [...food_supp, x];
		const marker = new google.maps.Marker({
			position: x,
			map,
			title: `Food Point #${i + 1}`,
			icon: "food-stall1.png",
		});
		const infowindow = new google.maps.InfoWindow({
			content: `Food Supply Location #${i + 1}`,
		});

		marker.addListener("click", () => {
			infowindow.open(marker.get("map"), marker);
		});
	});
	start = new google.maps.Marker({
		position: start_pos,
		map,
		title: `Start`,
	});
	const startWindow = new google.maps.InfoWindow({
		content: `Start Position`,
	});
	startWindow.addListener("click", () => {
		startWindow.open(start.get("map"), start);
	});

	end = new google.maps.Marker({
		position: end_pos, // kam - forward, zyada - backward
		map,
		title: `End`,
		draggable: true,
	});
	const endWindow = new google.maps.InfoWindow({
		content: `End Position`,
	});
	endWindow.addListener("click", () => {
		endWindow.open(end.get("map"), end);
	});
	end.addListener("drag", (e) => {
		end_pos = {
			lat: end.getPosition().lat(),
			lng: end.getPosition().lng(),
		};
		odd_pos = end_pos;
		even_pos = start_pos;
		configurePath();
		path.setPath(pos);
	});

	configurePath();
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
		map.setZoom(12);
	});

	function configurePath() {
		dis_bw_se = distance(
			start_pos.lat,
			start_pos.lng,
			end_pos.lat,
			end_pos.lng
		);
		no_of_pos = Math.floor(parseInt(dis_bw_se) / 20);
		pos = [start_pos];
		Array.apply(null, Array(no_of_pos)).forEach((item, i) => {
			if (i % 2 === 0) {
				if (!even_pos) return;
				even_pos = findClosest(
					even_pos.lat,
					even_pos.lng,
					food_supp,
					start_pos.lat < end_pos.lat ? true : false,
					end_pos,
					start_pos
				);
				pos = [...pos, even_pos];
			} else {
				if (!odd_pos) return;
				odd_pos = findClosest(
					odd_pos.lat,
					odd_pos.lng,
					food_supp,
					start_pos.lat < end_pos.lat ? false : true,
					end_pos,
					start_pos
				);
				pos = [...pos, odd_pos];
			}
		});
		pos = [...pos, end_pos];
		pos = pos.filter((item) => item);
	}
}

function isInside(circle_x, circle_y, rad, x, y) {
	if (
		(x - circle_x) * (x - circle_x) + (y - circle_y) * (y - circle_y) <=
		rad * rad
	)
		return true;
	else return false;
}

function findClosest(lat, lng, arr, checkForward, end_pos, start_pos) {
	let dis_arr = [];
	let itemArr = [];

	// let circle_center = {
	// 	x: (start_pos.lng + end_pos.lng) / 2,
	// 	y: (start_pos.lat + end_pos.lat) / 2,
	// };
	// const rad =
	// 	parseInt(
	// 		distance(start_pos.lat, start_pos.lng, end_pos.lat, end_pos.lng)
	// 	) / 2;
	if (checkForward) {
		arr.filter((item) => {
			if (
				item.lat > lat &&
				item.lat <= end_pos.lat &&
				item.lng < end_pos.lng + 10 &&
				item.lng > end_pos.lng - 10
			) {
				return item;
			}
		}).forEach((filteredItem) => {
			itemArr = itemArr.concat(filteredItem);
			dis_arr = dis_arr.concat(
				parseInt(distance(lat, lng, filteredItem.lat, filteredItem.lng))
			);
		});
	} else {
		arr.filter((item) => {
			if (
				item.lat < lat &&
				item.lat >= start_pos.lat &&
				item.lng < end_pos.lng + 10 &&
				item.lng > end_pos.lng - 10
			) {
				return item;
			}
		}).forEach((filteredItem) => {
			itemArr = itemArr.concat(filteredItem);
			dis_arr = dis_arr.concat(
				parseInt(distance(lat, lng, filteredItem.lat, filteredItem.lng))
			);
		});
	}
	dis_arr = dis_arr.concat(
		parseInt(distance(lat, lng, end_pos.lat, end_pos.lng))
	);
	return itemArr[dis_arr.indexOf(Math.min(...dis_arr))];
}

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

window.initMap = initMap;
