// ==UserScript==
// @name        LavaPlace for Wplace
// @namespace   https://github.com/volcanofr/Wplace-LavaPlace
// @copyright   Originally made by volcanofr 🌋
// @version     1.2
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
	script.id = "lavaplace-injector";
	script.setAttribute("name", GM_info.script.name);
	script.textContent = `(${callback})();`;
	(_a = document.documentElement) === null || _a === void 0
		? void 0
		: _a.appendChild(script);
	script.remove();
}
function showTooltip(element, message, duration) {
	let previousTooltip = element.getAttribute("data-tip");
	let previouslyOpen = element.classList.contains("tooltip-open");
	element.classList.add("tooltip");
	element.setAttribute("data-tip", message);
	if (!duration || duration <= 0 || !Number.isFinite(duration)) return;
	else element.classList.add("tooltip-open");
	setTimeout(() => {
		if (!previouslyOpen) element.classList.remove("tooltip-open");
		if (previousTooltip)
			return element.setAttribute("data-tip", previousTooltip);
		element.classList.remove("tooltip");
		element.removeAttribute("data-tip");
	}, duration);
}

/// Profile
async function updateUserMenu(data) {
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
	fixUserMenu(menu);
	generateLevelInfo(menu);
	generateSelfUserCopy(menu, data);
	await generateAllianceInfo(menu, data);
	return true;
}
function fixUserMenu(menu) {
	var _a;
	const avatar = menu.querySelector("section .avatar");
	if (avatar) {
		const editProfileButton =
			(_a = avatar.parentElement) === null || _a === void 0
				? void 0
				: _a.querySelector("button");
		if (editProfileButton) {
			editProfileButton.classList.remove("-bottom-1");
			editProfileButton.style.top = `${avatar.getBoundingClientRect().height - editProfileButton.getBoundingClientRect().height}px`;
		}
	}
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
	div.id = "lavaplace-level-info";
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
	if (topSection[1].querySelector("#lavaplace-level-info"))
		(_a = topSection[1].querySelector("#lavaplace-level-info")) === null ||
		_a === void 0
			? void 0
			: _a.replaceWith(div);
	else topSection[1].appendChild(div);
}
function removeAllianceInfo(menu) {
	const allianceInfo = menu.querySelector("#lavaplace-alliance-info");
	if (allianceInfo) allianceInfo.remove();
}
function generateSelfUserCopy(menu, data) {
	var _a, _b;
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return;
	const userIdSpan = topSection[1].querySelector(
		"div.items-center.font-medium > span",
	);
	if (!userIdSpan) return;
	let user = {
		name: data === null || data === void 0 ? void 0 : data.name,
		id: data === null || data === void 0 ? void 0 : data.id,
	};
	if (!user.name || !user.id) {
		user.id = Number(
			(_a = userIdSpan.textContent.match(/#(\d+)/)) === null ||
				_a === void 0
				? void 0
				: _a[1],
		);
		user.name =
			(_b = topSection[1].querySelector("h3")) === null || _b === void 0
				? void 0
				: _b.textContent;
	}
	if (!user.name || !user.id) return;
	const copy = `My user name: ${user.name} (ID: #${user.id})`;
	userIdSpan.style.cursor = "pointer";
	showTooltip(userIdSpan, "Copy User");
	userIdSpan.onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(userIdSpan, "Copied User!", 1500);
	};
}
function generateSelfAllianceCopy(element, alliance) {
	const copy = `My alliance name: ${alliance.name} (ID: &${alliance.id})`;
	element.style.cursor = "pointer";
	showTooltip(element, "Copy Alliance");
	element.onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(element, "Copied Alliance!", 1500);
	};
}
async function generateAllianceInfo(menu, data) {
	if (document.querySelector("#lavaplace-alliance-info")) return;
	if (data && data.allianceId <= 0) return removeAllianceInfo(menu);
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return removeAllianceInfo(menu);
	const userElement = topSection[1].querySelector("div.items-center");
	if (!userElement) return removeAllianceInfo(menu);
	let alliance;
	try {
		const res = await fetch("https://backend.wplace.live/alliance", {
			credentials: "include",
		});
		if (res.ok) alliance = await res.json();
	} catch (error) {
		console.debug(error);
	}
	if (!alliance || !alliance.id || alliance.id <= 0)
		return removeAllianceInfo(menu);
	const span = document.createElement("span");
	span.id = "lavaplace-alliance-info";
	span.innerText = alliance.name;
	span.className = "badge badge-sm ml-0.5 border-0";
	span.style.backgroundColor =
		"color-mix(in oklab, var(--color-primary) 10%, transparent)";
	span.style.color = "var(--color-primary)";
	span.style.marginBottom = "5px";
	topSection[1].insertBefore(span, topSection[1].children[1]);
	generateSelfAllianceCopy(span, alliance);
}

async function updatePixelMenu(data) {
	const bottomMenu = document.querySelector(
		"div.absolute.bottom-0 > div.rounded-t-box > div",
	);
	if (!bottomMenu) return false;
	if (!bottomMenu.id) bottomMenu.id = "pixel-menu";
	const header = bottomMenu.querySelector("div > div > h2");
	if (!header) return false;
	const content = bottomMenu.querySelector("div.text-sm");
	if (!content) return false;
	generateUserCopy(content, data);
	generateAllianceCopy(content, data);
	return true;
}
function generateUserCopy(element, data) {
	const userSpan = element.querySelector("span.font-medium");
	if (!userSpan || userSpan.childNodes.length < 2 || data.paintedBy.id <= 0)
		return;
	const userIdSpan = userSpan.lastElementChild;
	if (!userIdSpan || userIdSpan.tagName.toLowerCase() !== "span") return;
	const copy = `User name: ${data.paintedBy.name} (ID: #${data.paintedBy.id})`;
	userIdSpan.style.cursor = "pointer";
	showTooltip(userIdSpan, "Copy User");
	userIdSpan.onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(userIdSpan, "Copied User!", 1500);
	};
}
function generateAllianceCopy(element, data) {
	const allianceSpan = element.querySelector("span.badge.badge-sm");
	if (!allianceSpan || data.paintedBy.allianceId <= 0) return;
	const copy = `Alliance name: ${data.paintedBy.allianceName} (ID: &${data.paintedBy.allianceId})`;
	allianceSpan.style.cursor = "pointer";
	showTooltip(allianceSpan, "Copy Alliance");
	allianceSpan.onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(allianceSpan, "Copied Alliance!", 1500);
	};
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
					`UserScript '${GM_info.script.name}' v${GM_info.script.version} (UUID: ${GM_info.script.uuid}) loaded!`,
				);
			else await sleep(1000);
		}
		if (!state)
			console.warn(
				`UserScript '${GM_info.script.name}' v${GM_info.script.version} (UUID: ${GM_info.script.uuid}) failed to load.`,
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
		/* Issue: images */ const lastImages = new Map();
		/* Issue: images */ const currentlyUsingFallback = new Set();
		/* Issue: images */ const informFallbackImage = () => {
			const topElement = document.querySelector(
				"body > div > div > div.absolute.left-1\\/2.-translate-x-1\\/2.items-center.justify-center",
			);
			if (!topElement)
				return console.warn(
					name,
					"could not find the top center element to inform about fallback images.",
				);
			let alreadyHas = false;
			topElement.childNodes.forEach((node) => {
				if (
					node.nodeType === Node.ELEMENT_NODE &&
					node.id === "lavaplace-issue-images-warning"
				)
					alreadyHas = true;
			});
			if (currentlyUsingFallback.size > 0 && !alreadyHas) {
				const node = document.createElement("div");
				node.id = "lavaplace-issue-images-warning";
				node.className =
					"btn btn-sm btn-warning w-max cursor-auto text-nowrap text-xs sm:text-base";
				node.innerHTML +=
					'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="size-5"><path d="M790-56 414-434q-47 11-87.5 33T254-346l-84-86q32-32 69-56t79-42l-90-90q-41 21-76.5 46.5T84-516L0-602q32-32 66.5-57.5T140-708l-84-84 56-56 736 736-58 56Zm-310-64q-42 0-71-29.5T380-220q0-42 29-71t71-29q42 0 71 29t29 71q0 41-29 70.5T480-120Zm236-238-29-29-29-29-144-144q81 8 151.5 41T790-432l-74 74Zm160-158q-77-77-178.5-120.5T480-680q-21 0-40.5 1.5T400-674L298-776q44-12 89.5-18t92.5-6q142 0 265 53t215 145l-84 86Z"></path></svg>';
				node.innerHTML += "Images on fallback";
				topElement.appendChild(node);
			} else if (currentlyUsingFallback.size === 0 && alreadyHas) {
				const node = document.getElementById(
					"lavaplace-issue-images-warning",
				);
				if (node) node.remove();
			}
		};
		// Fetch Hook
		const originalFetch = window.fetch;
		window.fetch = async function (...args) {
			var _a;
			const endpointName =
				args[0] instanceof Request ? args[0].url : args[0] || "ignore";
			const endpointKey =
				typeof endpointName === "string"
					? endpointName
					: endpointName.href;
			try {
				const response = await originalFetch(...args);
				const cloned = response.clone();
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
				} else if (contentType.includes("image/png")) {
					cloned
						.blob()
						.then((data) => {
							window.postMessage(
								{
									source: "lavaplace",
									endpoint: endpointName,
									data: {
										type: "image",
										url: URL.createObjectURL(data),
									},
								},
								"*",
							);
							/* Issue: images */ lastImages.set(
								endpointKey,
								data,
							);
							/* Issue: images */ setTimeout(
								() => {
									if (lastImages.get(endpointKey) === data) {
										lastImages.delete(endpointKey);
										currentlyUsingFallback.delete(
											endpointKey,
										);
										informFallbackImage();
									}
								},
								2.5 * 60 * 1000,
							);
							/* Issue: images */ currentlyUsingFallback.delete(
								endpointKey,
							);
							/* Issue: images */ informFallbackImage();
						})
						.catch((error) =>
							console.error(
								name,
								"has failed to parse image from",
								endpointName,
								"\n\tWith error:",
								error,
							),
						);
				} else if (
					contentType.includes("text/plain") ||
					contentType.includes("text/html")
				) {
					cloned
						.text()
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
								"has failed to parse text from",
								endpointName,
								"\n\tWith error:",
								error,
							),
						);
				} else {
					window.postMessage(
						{
							source: "lavaplace",
							endpoint: endpointName,
							data: undefined,
						},
						"*",
					);
				}
				return response;
			} catch (error) {
				console.error(
					name,
					"has failed to process request",
					"\n\tWith error:",
					error,
				);
				/* Issue: images */
				if (
					endpointKey.includes("/tiles/") &&
					lastImages.has(endpointKey)
				) {
					currentlyUsingFallback.add(endpointKey);
					informFallbackImage();
					window.postMessage({
						source: "lavaplace",
						endpoint: endpointName,
						data: {
							type: "image",
							url: URL.createObjectURL(
								lastImages.get(endpointKey),
							),
							isIssueFallback: true,
						},
					});
					console.warn(
						name,
						"is using a stored fallback image for the failed tile request:",
						endpointKey,
					);
					return new Response(lastImages.get(endpointKey), {
						status: 200,
						statusText: `OK (${name}'s stored fallback)`,
						headers: { "Content-Type": "image/png" },
					});
				}
				window.postMessage(
					{
						source: "lavaplace",
						endpoint:
							args[0] instanceof Request
								? (_a = args[0]) === null || _a === void 0
									? void 0
									: _a.url
								: args[0] || "ignore",
						data: undefined,
					},
					"*",
				);
				return originalFetch(...args);
			}
		};
	});
	return true;
}
(() => {
	window.addEventListener("message", async (event) => {
		var _a;
		if (typeof event.data !== "object" || event.data === null) return;
		const { source, endpoint, data } = event.data;
		if (source !== "lavaplace" || !endpoint) return;
		const endpointText =
			(_a = endpoint
				.split("?")[0]
				.split("/")
				.filter((s) => s && isNaN(Number(s)))
				.filter((s) => s && !s.includes(".") && !s.includes("%"))
				.pop()) !== null && _a !== void 0
				? _a
				: `unknown_${GM_info.script.uuid}`;
		switch (endpointText) {
			case "fonts":
				break;
			case "health":
				break;
			case "me":
				await updateUserMenu(data);
				break;
			case "pixel":
				await updatePixelMenu(data);
				break;
			case "tiles":
				break;
			// Debugging endpoints
			case "ignore":
				console.debug(
					GM_info.script.name,
					`received data from ignored endpoint:`,
					data,
					"\n\tNote that we are not taking any telemetry data, this is only for debugging purposes.",
				);
				break;
			default:
				console.debug(
					GM_info.script.name,
					`received data from unknown endpoint (${endpointText}):`,
					data,
					"\n\tNote that we are not taking any telemetry data, this is only for debugging purposes.",
				);
		}
	});
})();
