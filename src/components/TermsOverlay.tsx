"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

export default function TermsOverlay() {
	const [agreed, setAgreed] = useState(false);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		document.body.classList.add("lock-scroll");
		return () => {
			document.body.classList.remove("lock-scroll");
		};
	}, []);

	if (!visible) return null;

	return (
		<div
			id="introOverlay"
			className="fixed inset-0 z-[999999] text-white overflow-y-auto flex flex-col items-center justify-center text-center backdrop-blur-sm bg-[#0f2027bf] transition-opacity duration-900"
		>
			<style>{`body.lock-scroll { overflow: hidden !important; }`}</style>

			<h1 className="text-6xl my-8">NaviLink</h1>

			<div className="max-h-[60vh] overflow-y-auto pr-4 mb-6">
				<p className="text-lg leading-relaxed w-[99%] ml-4 mb-6 text-left max-w-[600px]">
					<div className="text-center font-bold mb-4">Terms and Conditions</div>
					<strong>1. Acceptance of Terms:</strong> By using NaviLink, you agree
					to these Terms and Conditions. If you do not agree, do not use the
					app.
					<br />
					<br />
					<strong>2. Description of Service:</strong> NaviLink is a web-based
					application that visualizes the shortest path between two points on a
					map using Dijkstra’s Algorithm. NaviLink also uses the user's real
					time GPS. It is provided for educational and informational purposes
					only.
					<br />
					<br />
					<strong>3. User Responsibilities:</strong> Use NaviLink only for
					lawful purposes. Do not interfere with other users, input false or
					harmful data, or attempt to reverse-engineer the app.
					<br />
					<br />
					<strong>4. Accuracy of Information:</strong> NaviLink does not reflect
					real-time road conditions or traffic. Route data may not represent
					actual travel paths. Use at your own discretion.
					<br />
					<br />
					<strong>5. Intellectual Property:</strong> All content and code belong
					to David Wygodski. Unauthorized use is prohibited.
					<br />
					<br />
					<strong>6. Limitation of Liability:</strong> NaviLink is provided "as
					is" without warranties. The developer is not liable for any loss or
					damage from using the app.
					<br />
					<br />
					<strong>7. Modifications:</strong> Terms may be updated at any time.
					Continued use implies agreement with the latest version.
					<br />
					<br />
					<strong>8. Contact:</strong> For questions, contact David Wygodski at{" "}
					<em>wygodskid@ufl.edu</em>.
				</p>
			</div>

			<div className="flex items-center justify-center mb-6">
				<input
					type="checkbox"
					id="agreeCheckbox"
					checked={agreed}
					onChange={(e) => setAgreed(e.target.checked)}
					className="scale-125 mr-3"
				/>
				<label
					htmlFor="agreeCheckbox"
					className="text-base font-bold text-white"
				>
					I agree to NaviLink Terms & Conditions
				</label>
			</div>

			<button
				type="button"
				disabled={!agreed}
				onClick={() => setVisible(false)}
				className={clsx(
					"px-14 py-3 text-xl rounded-full font-medium transition-opacity duration-500 mb-6",
					{
						"opacity-100 bg-cyan-400 text-black cursor-pointer": agreed,
						"opacity-0 cursor-not-allowed": !agreed,
					},
				)}
			>
				Continue
			</button>
		</div>
	);
}
