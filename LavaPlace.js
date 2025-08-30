// ==UserScript==
// @name        LavaPlace for Wplace
// @namespace   https://github.com/volcanofr/Wplace-LavaPlace
// @copyright   Originally made by volcanofr 🌋
// @version     1.1
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
	console.log("user:", user);
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
				await updateUserMenu(data);
				break;
			case "pixel":
				await updatePixelMenu(data);
				break;
		}
	});
})();
