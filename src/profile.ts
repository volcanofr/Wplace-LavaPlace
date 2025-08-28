/// Profile

(() => {
	window.addEventListener("message", async (event) => {
		const { source, endpoint, data } = event.data;
		if (source !== "lavaplace" || !endpoint) return;
		
		const endpointText = endpoint.split('?')[0].split('/').filter((s: string) => s && isNaN(Number(s))).filter((s: string) => s && !s.includes('.')).pop();

		switch (endpointText) {
			case "me":
				await updateUserMenu();
				break;
		}
	});
})();

async function updateUserMenu() {
	let userButton = document.querySelector(".dropdown .btn[title=\"Show profile\"]"); // English
	if (!userButton) userButton = document.querySelector(".dropdown .btn[title=\"Exibir perfil\"]"); // Português

	if (!userButton || !userButton.parentElement) return false;

	const menu = userButton.parentElement.querySelector(".dropdown-content");
	if (!menu) return false;
	if (!menu.id) menu.id = "user-menu";

	generateLevelInfo(menu);
	return true;
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
	div.id = "lava-place-level-info";

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

	if (topSection[1].querySelector("#lava-place-level-info")) topSection[1].querySelector("#lava-place-level-info")?.replaceWith(div);
	else topSection[1].appendChild(div);
}
