/// Utils

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function inject(callback: () => void) {
	const script = document.createElement("script");
	script.id = "lavaplace-injector";
	script.setAttribute("name", GM_info.script.name);
	script.textContent = `(${callback})();`;
	document.documentElement?.appendChild(script);
	script.remove();
}

function showTooltip(element: HTMLElement, message: string, duration?: number) {
	let previousTooltip = element.getAttribute("data-tip");
	let previouslyOpen = element.classList.contains("tooltip-open");

	element.classList.add("tooltip");
	element.setAttribute("data-tip", message);

	if (!duration || duration <= 0 || !Number.isFinite(duration)) return;
	else element.classList.add("tooltip-open");

	setTimeout(() => {
		if (!previouslyOpen) element.classList.remove("tooltip-open");

		if (previousTooltip) return element.setAttribute("data-tip", previousTooltip);
		element.classList.remove("tooltip");
		element.removeAttribute("data-tip");
	}, duration);
}
