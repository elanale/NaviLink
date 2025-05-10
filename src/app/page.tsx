"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { dijkstra } from "../utils/dijkstraFromCSV";
import TermsOverlay from "@/components/TermsOverlay";
import TabsBar from "@/components/TabsBar";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
	const [activeTab, setActiveTab] = useState("map");
	const [from, setFrom] = useState("Southwest Recreation Center");
	const [to, setTo] = useState("Marston Science Library");
	const [step, setStep] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [path, setPath] = useState([]);
	const [segmentDistances, setSegmentDistances] = useState([]);
	const [totalDistance, setTotalDistance] = useState(0);
	const termsShown = useRef(false);

	//terms page shown when reloading or first loggin in
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!localStorage.getItem("termsAccepted") && !termsShown.current) {
			termsShown.current = true;
		}
	}, []);

	//whne two paths are initialized the auto play works
	useEffect(() => {
		if (path.length > 1 && step === 0 && !playing) {
			handlePlay();
		}
	}, [path]);

	//scroll-locking
	useEffect(() => {
		const style = document.createElement("style");
		style.id = "lockScrollStyle";
		style.textContent = "body.lock-scroll { overflow: hidden !important; }";
		document.head.append(style);
		return () => document.getElementById("lockScrollStyle")?.remove();
	}, []);

	//documentation overlay toggling feature
	useEffect(() => {
		if (activeTab === "documentation") {
			showDocOverlay();
		} else {
			removeOverlay("docOverlay");
			document.body.classList.remove("lock-scroll");
		}
	}, [activeTab]);

	//overlay constructors
	function showDocOverlay() {
		//overlay removal
		removeOverlay("docOverlay");
		//lock scrolling
		document.body.classList.add("lock-scroll");
		// Build and insert the overlay
		const overlay = buildOverlay({
			id: "docOverlay",
			bg: "rgba(15,32,39,0.9)",
			title: "Documentation",
			content: (() => {
				const wrapper = document.createElement("div");
				wrapper.innerHTML = `
        <div style="max-width: 700px; max-height: 70vh; overflow-y: auto; padding-right: 1rem; text-align: left; color: #f1f1f1; font-size: 1rem; line-height: 1.6;">
          <!-- YouTube Video Embed at Top -->
          <div style="margin-bottom: 20px;">
            <h2 style="text-align: center;">Demo Video</h2>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px;">
              <iframe
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                src="https://www.youtube.com/embed/BVJ-RZ95AnM"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          </div>
          <h2 style="text-align: center;">How to Use the Map Visualizer</h2>
          <p>This tool helps you visualize the shortest path between two addresses using Dijkstra's algorithm. Follow the steps below to get started.</p>
          <h3>1. Enter Start and Destination Addresses</h3>
          <ul>
            <li><strong>From:</strong> Enter your starting address (e.g., <em>3150 Hull Rd, Gainesville, FL</em>).</li>
            <li><strong>To:</strong> Enter your destination (e.g., <em>Marston Science Library</em>).</li>
            <li>Click the <strong>"Find Path"</strong> button to generate the route.</li>
          </ul>
          <h3>2. How It Works</h3>
          <p>
            The app converts the addresses into geographic coordinates using OpenStreetMap's geocoding service.
            It then finds the nearest nodes in the graph and calculates the shortest path between them using Dijkstra's algorithm.
            This path is drawn on the map using real coordinates and distances.
          </p>
          <h3>3. Interactive Map Features</h3>
          <ul>
            <li>The path is shown as a series of connected lines on the map.</li>
            <li>Each segment is revealed step-by-step to show the routing progress.</li>
            <li>Total distance is calculated and displayed in miles.</li>
          </ul>
          <h3>4. Playback Controls</h3>
          <ul>
            <li><strong>Back:</strong> Move to the previous step in the path.</li>
            <li><strong>Play:</strong> Animate through the entire path automatically.</li>
            <li><strong>Next:</strong> Move forward one segment at a time.</li>
          </ul>
          <h3>5. Technical Details</h3>
          <ul>
            <li><strong>Frontend:</strong> Next.js and React</li>
            <li><strong>Map Rendering:</strong> Leaflet with custom React components</li>
            <li><strong>Algorithm:</strong> Dijkstra's Algorithm for pathfinding</li>
            <li><strong>Data Sources:</strong> CSV (graph edges), JSON (node coordinates)</li>
            <li><strong>Geocoding:</strong> OpenStreetMap Nominatim API</li>
          </ul>
        </div>
      `;
				return wrapper;
			})(),
			noCheckbox: true,
			onAccept: () => {
				//remove and fade overlay on exit
				fadeRemove("docOverlay");
				//switch back to 'Map View'
				setActiveTab("map");
			},
		});
		document.body.append(overlay);
	}

	function removeOverlay(id) {
		const existing = document.getElementById(id);
		if (existing) existing.remove();
	}

	function fadeRemove(id) {
		const el = document.getElementById(id);
		if (!el) return;
		el.style.opacity = "0";
		setTimeout(() => removeOverlay(id), 600);
		document.body.classList.remove("lock-scroll");
	}

	function buildOverlay({
		id,
		bg,
		title,
		content,
		checkboxLabel,
		onAccept,
		noCheckbox = false,
	}) {
		const ov = document.createElement("div");
		ov.id = id;

		Object.assign(ov.style, {
			position: "fixed",
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			zIndex: "2000",
			backgroundColor: bg,
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "flex-start",
			textAlign: "center",
			overflowY: "auto",
			padding: "8rem 1rem 3rem",
			boxSizing: "border-box",
			textShadow: "0 3px 12px rgba(0, 0, 0, 1)",
		});

		const h1 = document.createElement("h1");
		h1.innerText = title;

		Object.assign(h1.style, styles.overlayTitle);

		const p = document.createElement("p");

		if (typeof content === "string") p.innerText = content;
		else p.append(content);

		Object.assign(p.style, styles.overlayMsg);

		let acceptBtn;

		if (!noCheckbox) {
			const chk = document.createElement("input");
			chk.type = "checkbox";
			chk.id = id + "Chk";
			Object.assign(chk.style, {
				marginRight: "0.5rem",
				transform: "scale(1.2)",
			});

			const lbl = document.createElement("label");
			lbl.htmlFor = chk.id;
			lbl.innerText = checkboxLabel;
			Object.assign(lbl.style, { color: "#f1f1f1", fontSize: "1rem" });

			const boxC = document.createElement("div");
			Object.assign(boxC.style, {
				display: "flex",
				alignItems: "center",
				marginBottom: "1rem",
			});

			boxC.append(chk, lbl);

			acceptBtn = document.createElement("button");
			acceptBtn.innerText = "I Understand";

			Object.assign(acceptBtn.style, styles.acceptBtn, {
				opacity: "0.6",
				cursor: "not-allowed",
			});
			acceptBtn.disabled = true;

			chk.addEventListener("change", () => {
				acceptBtn.disabled = !chk.checked;
				acceptBtn.style.opacity = chk.checked ? "1" : "0.6";
				acceptBtn.style.cursor = chk.checked ? "pointer" : "not-allowed";
			});
			acceptBtn.addEventListener("click", onAccept);

			ov.append(h1, p, boxC, acceptBtn);
		} else {
			acceptBtn = document.createElement("button");
			acceptBtn.innerText = "Close";
			styles.acceptBtn.fontWeight = "bold";

			Object.assign(acceptBtn.style, styles.acceptBtn);
			acceptBtn.addEventListener("click", onAccept);
			ov.append(h1, p, acceptBtn);
		}

		return ov;
	}

	//UI Control
	const handlePlay = () => {
		if (playing || path.length === 0) return;
		setPlaying(true);
		let i = step;

		const iv = setInterval(() => {
			if (i >= path.length - 1) {
				clearInterval(iv);
				setPlaying(false);
				return;
			}
			i++;
			setStep(i);
		}, 500);
	};

	const handleBack = () => step > 0 && setStep(step - 1);
	const handleNext = () => step < path.length - 1 && setStep(step + 1);

	const geocode = async (q) => {
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
		const res = await axios.get(url, { headers: { "Accept-Language": "en" } });

		if (!res.data || res.data.length === 0)
			throw new Error("Could Not Find Address");
		return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
	};

	const handleFindPath = async () => {
		try {
			const fromC = await geocode(from);
			const toC = await geocode(to);

			const [graphCsv, coordsJson] = await Promise.all([
				fetch("/graph.csv").then((r) => r.text()),
				fetch("/node_coords.json").then((r) => r.json()),
			]);

			const graph = {};
			graphCsv
				.trim()
				.split("\n")
				.slice(1)
				.forEach((line) => {
					const [u, v, d] = line.split(",").map((s) => s.trim());
					const dist = parseFloat(d);

					if (isNaN(dist)) return;

					graph[u] = graph[u] || [];
					graph[v] = graph[v] || [];
					graph[u].push([v, dist]);
					graph[v].push([u, dist]);
				});

			const findNearest = (lat, lon) => {
				let best = null,
					bestD = Infinity;

				for (const [id, [nodeLon, nodeLat]] of Object.entries(coordsJson)) {
					if (!graph[id]) continue;

					const dx = lat - nodeLat,
						dy = lon - nodeLon;
					const d2 = dx * dx + dy * dy;

					if (d2 < bestD) {
						bestD = d2;
						best = id;
					}
				}
				return best;
			};

			const start = findNearest(fromC[0], fromC[1]);
			const end = findNearest(toC[0], toC[1]);

			if (!start || !end) throw new Error("Address to graph missmatch");

			const {
				path: nodePath,
				segmentDistances: segs,
				totalDistance: tot,
			} = dijkstra(graph, start, end);

			const realCoords = nodePath
				.map((id) => coordsJson[id] || [])
				.filter((c) => c.length === 2)
				.map(([lon, lat]) => [lat, lon]);

			const mappedSegs = segs.map(({ from, to, distance }) => ({
				from: [coordsJson[from][1], coordsJson[from][0]],
				to: [coordsJson[to][1], coordsJson[to][0]],
				distance,
			}));

			setPath(realCoords);
			setSegmentDistances(mappedSegs);
			setTotalDistance(tot);
			setStep(0);
		} catch (err) {
			alert("Error: " + err.message);
			console.error(err);
		}
	};

	return (
		<>
			<TabsBar activeTab={activeTab} setActiveTab={setActiveTab} />
			<TermsOverlay />
			<main className="h-screen w-screen relative overflow-hidden">
				<Map
					path={path.slice(0, step + 1)}
					segmentDistances={segmentDistances.slice(0, step)}
				/>

				{activeTab === "map" && (
					<div className="controls absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white p-4 rounded-xl flex flex-col gap-3 w-[90%] max-w-xl">
						<div className="flex gap-2">
							<input
								type="text"
								value={from}
								onChange={(e) => setFrom(e.target.value)}
								placeholder="From address"
								className="flex-1 p-2 rounded bg-black border border-gray-700"
							/>
							<input
								type="text"
								value={to}
								onChange={(e) => setTo(e.target.value)}
								placeholder="To address"
								className="flex-1 p-2 rounded bg-black border border-gray-700"
							/>
							<button
								className="px-4 py-2 border rounded"
								onClick={handleFindPath}
								type="button"
							>
								Find Path
							</button>
						</div>

						<div className="text-center text-sm text-gray-300">
							Total Distance: {(totalDistance * 0.000621371).toFixed(1)} Miles
						</div>

						<div className="footer-row">
							<div className="button-group">
								<button
									className="px-3 py-1 rounded border"
									onClick={handleBack}
									disabled={step === 0 || !path.length}
									type="button"
								>
									Back
								</button>
								<button
									className="px-3 py-1 rounded border"
									onClick={handlePlay}
									disabled={playing || !path.length}
									type="button"
								>
									Play
								</button>
								<button
									className="px-3 py-1 rounded border"
									onClick={handleNext}
									disabled={step >= path.length - 1 || !path.length}
									type="button"
								>
									Next
								</button>
							</div>
							<div className="copyright-left">© By Elan Wygodski | v1.0</div>
						</div>
					</div>
				)}
			</main>
		</>
	);
}

const styles = {
	tabContainer: {
		position: "fixed",
		top: 16,
		left: "50%",
		transform: "translateX(-50%)",
		zIndex: 10000,
		display: "flex",
		background: "rgba(0,0,0,0.7)",
		padding: "4px",
		borderRadius: 8,
		boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
	},

	tab: {
		padding: "8px 16px",
		background: "transparent",
		color: "white",
		border: "none",
		cursor: "pointer",
	},

	tabActive: {
		padding: "8px 16px",
		background: "white",
		color: "black",
		border: "none",
		cursor: "pointer",
		borderRadius: 6,
	},

	overlay: {
		position: "fixed",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		zIndex: "9999",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		transition: "opacity 0.6s ease",
	},

	overlayTitle: { fontSize: "2.5rem", marginBottom: "1rem", color: "#f1f1f1" },

	overlayMsg: {
		fontSize: "1.2rem",
		maxWidth: "600px",
		marginBottom: "1rem",
		color: "#f1f1f1",
	},

	acceptBtn: {
		padding: "12px 54px",
		fontSize: "1rem",
		background: "#00c6ff",
		border: "none",
		borderRadius: "20px",
		color: "black",
		cursor: "pointer",
		marginTop: "1.0rem",
	},
};
