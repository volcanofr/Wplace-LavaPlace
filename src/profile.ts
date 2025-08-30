/// Profile

async function updateUserMenu(data?: meData) {
	let userButton = document.querySelector(".dropdown .btn[title=\"Show profile\"]"); // English
	if (!userButton) userButton = document.querySelector(".dropdown .btn[title=\"Exibir perfil\"]"); // Português

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

function fixUserMenu(menu: Element) {
	const avatar = menu.querySelector("section .avatar");
	if (avatar) {
		const editProfileButton = avatar.parentElement?.querySelector("button");
		if (editProfileButton) {
			(editProfileButton as HTMLButtonElement).classList.remove("-bottom-1");
			(editProfileButton as HTMLButtonElement).style.top = `${avatar.getBoundingClientRect().height - editProfileButton.getBoundingClientRect().height}px`;
		}
	}
}

function getNextLevelPixels(menu: Element) {
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return -1;

	let level;
	const levelMatch = topSection[1].textContent.match(/Level\D+([\d|,]+)/i);
	if (levelMatch) level = parseInt(levelMatch[1].replace(/,/g, ""), 10);
	else level = 0;

	let painted;
	const paintedMatch = topSection[1].textContent.match(/Pixels painted:\D+([\d|,]+)/i);
	if (paintedMatch) painted = parseInt(paintedMatch[1].replace(/,/g, ""), 10);
	else painted = 0;

	return Math.ceil(Math.pow(
		Math.floor(level * Math.pow(30, 0.65)), (1/0.65)
	) - painted)
}

function generateLevelInfo(menu: Element) {
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return;

	const div = document.createElement("div");
	div.className = "flex items-center gap-1";
	div.id = "lavaplace-level-info";

	const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
	iconPath.setAttribute("d", "m 160,-520 h 487 l -224,-224 57,-56 320,320 -320,320 -57,-56 224,-224 H 160 Z");
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

	if (topSection[1].querySelector("#lavaplace-level-info")) topSection[1].querySelector("#lavaplace-level-info")?.replaceWith(div);
	else topSection[1].appendChild(div);
}

function removeAllianceInfo(menu: Element) {
	const allianceInfo = menu.querySelector("#lavaplace-alliance-info");
	if (allianceInfo) allianceInfo.remove();
}

function generateSelfUserCopy(menu: Element, data?: meData) {
	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return;

	const userIdSpan = topSection[1].querySelector("div.items-center.font-medium > span");
	if (!userIdSpan) return;

	let user = {
		name: data?.name,
		id: data?.id,
	}

	if (!user.name || !user.id) {
		user.id = Number(userIdSpan.textContent.match(/#(\d+)/)?.[1]);
		user.name = topSection[1].querySelector("h3")?.textContent;
	}

	console.log('user:', user);

	if (!user.name || !user.id) return;

	const copy = `My user name: ${user.name} (ID: #${user.id})`;

	(userIdSpan as HTMLSpanElement).style.cursor = "pointer";
	showTooltip(userIdSpan as HTMLSpanElement, "Copy User");

	(userIdSpan as HTMLSpanElement).onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(userIdSpan as HTMLSpanElement, "Copied User!", 1500);
	};
}

function generateSelfAllianceCopy(element: Element, alliance: allianceData) {
	const copy = `My alliance name: ${alliance.name} (ID: &${alliance.id})`;
	
	(element as HTMLSpanElement).style.cursor = "pointer";
	showTooltip(element as HTMLSpanElement, "Copy Alliance");

	(element as HTMLSpanElement).onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(element as HTMLSpanElement, "Copied Alliance!", 1500);
	};
}

async function generateAllianceInfo(menu: Element, data?: meData) {
	if (document.querySelector("#lavaplace-alliance-info")) return;
	if (data && data.allianceId <= 0) return removeAllianceInfo(menu);

	const topSection = menu.querySelectorAll("section > div");
	if (!topSection || topSection.length < 2) return removeAllianceInfo(menu);

	const userElement = topSection[1].querySelector("div.items-center");
	if (!userElement) return removeAllianceInfo(menu);

	let alliance: allianceData | undefined;

	try {
		const res = await fetch("https://backend.wplace.live/alliance", { credentials: "include" });
		if (res.ok) alliance = await res.json();
	} catch (error) {
		console.debug(error);
	}

	if (!alliance || !alliance.id || alliance.id <= 0) return removeAllianceInfo(menu);

	const span = document.createElement("span");
	span.id = "lavaplace-alliance-info";
	span.innerText = alliance.name;
	span.className = "badge badge-sm ml-0.5 border-0";
	span.style.backgroundColor = "color-mix(in oklab, var(--color-primary) 10%, transparent)";
	span.style.color = "var(--color-primary)";
	span.style.marginBottom = "5px";

	topSection[1].insertBefore(span, topSection[1].children[1]);
	generateSelfAllianceCopy(span, alliance);
}
