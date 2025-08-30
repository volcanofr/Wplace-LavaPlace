async function updatePixelMenu(data: pixelData) {
	const bottomMenu = document.querySelector("div.absolute.bottom-0 > div.rounded-t-box > div");
	if (!bottomMenu) return false;
	if (!bottomMenu.id) bottomMenu.id = "pixel-menu";

	const header = bottomMenu.querySelector("div > div > h2")
	if (!header) return false;

	const content = bottomMenu.querySelector("div.text-sm")
	if (!content) return false;

	generateUserCopy(content, data);
	generateAllianceCopy(content, data);

	return true;
}

function generateUserCopy(element: Element, data: pixelData) {
	const userSpan = element.querySelector("span.font-medium");
	if (!userSpan || userSpan.childNodes.length < 2 || data.paintedBy.id <= 0) return;
	const userIdSpan = userSpan.lastElementChild;
	if (!userIdSpan || userIdSpan.tagName.toLowerCase() !== "span") return;

	const copy = `User name: ${data.paintedBy.name} (ID: #${data.paintedBy.id})`;

	(userIdSpan as HTMLSpanElement).style.cursor = "pointer";
	showTooltip(userIdSpan as HTMLSpanElement, "Copy User");

	(userIdSpan as HTMLSpanElement).onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(userIdSpan as HTMLSpanElement, "Copied User!", 1500);
	};
}

function generateAllianceCopy(element: Element, data: pixelData) {
	const allianceSpan = element.querySelector("span.badge.badge-sm");
	if (!allianceSpan || data.paintedBy.allianceId <= 0) return;

	const copy = `Alliance name: ${data.paintedBy.allianceName} (ID: &${data.paintedBy.allianceId})`;

	(allianceSpan as HTMLSpanElement).style.cursor = "pointer";
	showTooltip(allianceSpan as HTMLSpanElement, "Copy Alliance");

	(allianceSpan as HTMLSpanElement).onclick = () => {
		GM_setClipboard(copy, "text");
		showTooltip(allianceSpan as HTMLSpanElement, "Copied Alliance!", 1500);
	};
}
