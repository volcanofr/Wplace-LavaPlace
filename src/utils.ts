/// Utils

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function inject(callback: () => void) {
	const script = document.createElement("script");
	script.id = "lava-place-injector";
	script.setAttribute("name", GM_info.script.name);
	script.textContent = `(${callback})();`;
	document.documentElement?.appendChild(script);
	script.remove();
}
