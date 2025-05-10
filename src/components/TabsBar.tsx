import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";

interface TabsBarProps {
	activeTab: "map" | "documentation";
	setActiveTab: (tab: "map" | "documentation") => void;
}

export default function TabsBar({ activeTab, setActiveTab }: TabsBarProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-4">
			<div className="text-white text-[2.5rem] font-black tracking-widest drop-shadow-[0_3px_12px_rgba(0,0,0,1)]">
				NaviLink
			</div>

			<div className="flex bg-[rgba(10,10,10,0.7)] p-1.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
				{["map", "documentation"].map((tab) => (
					<button
						key={tab}
						type="button"
						onClick={() => setActiveTab(tab as "map" | "documentation")}
						className={clsx(
							"px-5 py-2 rounded-full font-semibold transition-all duration-500",
							{
								"bg-[rgba(11,175,246,0.7)] text-black": activeTab === tab,
								"text-white": activeTab !== tab,
							},
						)}
					>
						{tab === "map" ? "Map View" : "Documentation"}
					</button>
				))}
			</div>
		</div>,
		document.body,
	);
}
