// ==UserScript==
// @name        LavaPlace for Wplace
// @namespace   https://github.com/volcanofr/Wplace-LavaPlace
// @copyright   Originally made by volcanofr 🌋
// @version     1.0
// @description Shows more informations about yourself, the selected pixels, and much more!
// @icon        https://raw.githubusercontent.com/volcanofr/Wplace-LavaPlace/main/src/icon.png
// @icon64      https://raw.githubusercontent.com/volcanofr/Wplace-LavaPlace/main/src/icon64.png
// @grant       GM_addElement
// @grant       GM_info
// @grant       GM_setClipboard
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// @author      volcanofr
// @antifeature ads            Adding credits to the contributors within a button
// @match       *://wplace.live/*
// @run-at      document-idle
// @tag         Wplace
// @tag         volcanofr
// @tag         games
// @updateURL   https://raw.githubusercontent.com/volcanofr/Wplace-LavaPlace/main/LavaPlace.js
// @downloadURL https://raw.githubusercontent.com/volcanofr/Wplace-LavaPlace/main/LavaPlace.js
// @license     https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode#legal-code-title
// @supportURL  https://discord.com/invite/wjpkx8RudE
// ==/UserScript==
/*

    Wplace  --> https://wplace.live/
    License --> https://creativecommons.org/licenses/by-nc-sa/4.0/

    === Development notice ===
    Hey! You that reads this, feel free to contribute to the project by submitting issues or pull requests on GitHub.
    Your feedback is always welcome!

 */

/// Utils
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function inject(callback) {
	var _a;
	const script = document.createElement("script");
	script.id = "lava-place-injector";
	script.setAttribute("name", GM_info.script.name);
	script.textContent = `(${callback})();`;
	(_a = document.documentElement) === null || _a === void 0
		? void 0
		: _a.appendChild(script);
	script.remove();
}

/// Profile
(() => {
	window.addEventListener("message", async (event) => {
		const { source, endpoint, data } = event.data;
		if (source !== "lavaplace" || !endpoint) return;
		const endpointText = endpoint
			.split("?")[0]
			.split("/")
			.filter((s) => s && isNaN(Number(s)))
			.filter((s) => s && !s.includes("."))
			.pop();
		switch (endpointText) {
			case "me":
				await updateUserMenu();
				break;
		}
	});
})();
async function updateUserMenu() {
	let userButton = document.querySelector(
		'.dropdown .btn[title="Show profile"]',
	); // English
	if (!userButton)
		userButton = document.querySelector(
			'.dropdown .btn[title="Exibir perfil"]',
		); // Português
	if (!userButton || !userButton.parentElement) return false;
	const menu = userButton.parentElement.querySelector(".dropdown-content");
	if (!menu) return false;
	if (!menu.id) menu.id = "user-menu";
	generateLevelInfo(menu);
	return true;
}
function getNextLevelPixels(menu) {
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return -1;
	let level;
	const levelMatch = topSection[1].textContent.match(/Level\D+([\d|,]+)/i);
	if (levelMatch) level = parseInt(levelMatch[1].replace(/,/g, ""), 10);
	else level = 0;
	let painted;
	const paintedMatch = topSection[1].textContent.match(
		/Pixels painted:\D+([\d|,]+)/i,
	);
	if (paintedMatch) painted = parseInt(paintedMatch[1].replace(/,/g, ""), 10);
	else painted = 0;
	return Math.ceil(
		Math.pow(Math.floor(level * Math.pow(30, 0.65)), 1 / 0.65) - painted,
	);
}
function generateLevelInfo(menu) {
	var _a;
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return;
	const div = document.createElement("div");
	div.className = "flex items-center gap-1";
	div.id = "lava-place-level-info";
	const iconPath = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"path",
	);
	iconPath.setAttribute(
		"d",
		"m 160,-520 h 487 l -224,-224 57,-56 320,320 -320,320 -57,-56 224,-224 H 160 Z",
	);
	const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	icon.setAttribute("class", "inline size-4");
	icon.setAttribute("viewBox", "0 -960 960 960");
	icon.setAttribute("fill", "currentColor");
	icon.appendChild(iconPath);
	const textLevel = document.createElement("span");
	textLevel.className = "font-semibold";
	textLevel.innerText = getNextLevelPixels(menu).toString();
	const text = document.createElement("span");
	text.className = "text-secondary";
	text.appendChild(document.createTextNode("Next level in "));
	text.appendChild(textLevel);
	text.appendChild(document.createTextNode(" pixels"));
	div.appendChild(icon);
	div.appendChild(text);
	if (topSection[1].querySelector("#lava-place-level-info"))
		(_a = topSection[1].querySelector("#lava-place-level-info")) === null ||
		_a === void 0
			? void 0
			: _a.replaceWith(div);
	else topSection[1].appendChild(div);
}

/// Main
if (typeof GM_info === "undefined" || !GM_info.script.name) {
	console.error(
		"Are you running this UserScript using Tampermonkey or any compatible script manager?",
		"\n\t- LavaPlace",
	);
} else {
	let numberOfTries = 0;
	let state = false;
	(async () => {
		while (numberOfTries < 5 && !state) {
			numberOfTries++;
			state = await start();
			if (state)
				console.log(
					`UserScript '${GM_info.script.name}' v${GM_info.script.version} loaded!`,
				);
			else await sleep(1000);
		}
		if (!state)
			console.warn(
				`UserScript '${GM_info.script.name}' v${GM_info.script.version} failed to load.`,
			);
	})();
}
async function start() {
	const update = await updateUserMenu();
	if (!update) return false;
	inject(() => {
		var _a;
		const name =
			((_a = document.currentScript) === null || _a === void 0
				? void 0
				: _a.getAttribute("bm-name")) || "LavaPlace";
		// Fetch Hook
		const originalFetch = window.fetch;
		window.fetch = async function (...args) {
			var _a;
			const response = await originalFetch(...args);
			const cloned = response.clone();
			const endpointName =
				(args[0] instanceof Request
					? (_a = args[0]) === null || _a === void 0
						? void 0
						: _a.url
					: args[0]) || "ignore";
			const contentType = cloned.headers.get("content-type") || "";
			if (contentType.includes("application/json")) {
				cloned
					.json()
					.then((data) =>
						window.postMessage(
							{
								source: "lavaplace",
								endpoint: endpointName,
								data: data,
							},
							"*",
						),
					)
					.catch((error) =>
						console.error(
							name,
							"has failed to parse JSON from",
							endpointName,
							"\n\tWith error:",
							error,
						),
					);
			}
			return response;
		};
	});
	return true;
}
