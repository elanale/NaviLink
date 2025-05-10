import {
	Marker,
	useMap,
	MapContainer,
	TileLayer,
	Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import styles from "./UserPulse.module.css";

//chart plot icon pin
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function DistanceLabels({ segmentDistances }) {
	const map = useMap();

	useEffect(() => {
		segmentDistances.forEach(({ from, to, distance }) => {
			const midLat = (from[0] + to[0]) / 2;
			const midLng = (from[1] + to[1]) / 2;

			L.marker([midLat, midLng], {
				icon: L.divIcon({
					className: "distance-label",
					html: `${distance.toFixed(1)} m`,
					iconSize: [60, 20],
					iconAnchor: [30, 10],
				}),
				interactive: false,
			}).addTo(map);
		});

		return () => {
			map.eachLayer((layer) => {
				if (
					layer instanceof L.Marker &&
					layer.options.icon?.options?.className === "distance-label"
				) {
					map.removeLayer(layer);
				}
			});
		};
	}, [segmentDistances, map]);

	return null;
}

//---realtime gps tracking--
function UserLocationTracker() {
	const [position, setPosition] = useState(null);
	const [followUser, setFollowUser] = useState(false);
	const hasCentered = useRef(false);
	const map = useMap();

	useEffect(() => {
		if (!navigator.geolocation) return;

		const watchId = navigator.geolocation.watchPosition(
			(pos) => {
				const newPos = [pos.coords.latitude, pos.coords.longitude];
				setPosition(newPos);

				if (map && !hasCentered.current) {
					map.setView(newPos, map.getZoom());
					hasCentered.current = true;
				}

				if (map && followUser) {
					map.setView(newPos, map.getZoom());
				}
			},
			(err) => console.error("Geolocation error:", err.message),
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			},
		);

		return () => navigator.geolocation.clearWatch(watchId);
	}, [map, followUser]);

	return position ? (
		<Marker
			position={position}
			icon={L.divIcon({
				className: `${styles.pulseMarker} ${followUser ? styles.following : ""}`,
				html: "You",
				iconSize: [35, 35],
			})}
			eventHandlers={{
				click: () => setFollowUser((prev) => !prev),
			}}
		/>
	) : null;
}

//path renderer
export default function Map({ path, segmentDistances }) {
	const start = path[0];
	const end = path[path.length - 1];

	return (
		<MapContainer
			center={start || [29.6516, -82.3248]} //gvill coordinates
			zoom={13}
			style={{ height: "100vh", width: "100vw" }}
		>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

			{path.length > 1 && (
				<Polyline
					positions={path}
					color="blue"
					weight={5} //line thikness
					opacity={0.6} //make line transparent or not
					lineCap="round" //round edges
					smoothFactor={10} //curve smoothness
				/>
			)}

			{start && <Marker position={start} />}
			{end && path.length > 1 && <Marker position={end} />}
			{segmentDistances && (
				<DistanceLabels segmentDistances={segmentDistances} />
			)}
			<UserLocationTracker />
		</MapContainer>
	);
}
