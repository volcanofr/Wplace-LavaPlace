/// Main

if (typeof GM_info === "undefined" || !GM_info.script.name) {
	console.error(
		"Are you running this UserScript using Tampermonkey or any compatible script manager?",
		"\n\t- LavaPlace"
	);
} else {
	let numberOfTries = 0;
	let state = false;
	
	(async () => {
		while (numberOfTries < 5 && !state) {
			numberOfTries++;
			state = await start();
			if (state) console.log(`UserScript '${GM_info.script.name}' v${GM_info.script.version} (UUID: ${GM_info.script.uuid}) loaded!`);
			else await sleep(1000);
		}

		if (!state) console.warn(`UserScript '${GM_info.script.name}' v${GM_info.script.version} (UUID: ${GM_info.script.uuid}) failed to load.`);
	})();
}

async function start() {
	const update = await updateUserMenu();
	if (!update) return false;

	inject(() => { // Issue fixing are prefixed by /* Issue: x */
		const name = document.currentScript?.getAttribute('bm-name') || 'LavaPlace';

		/* Issue: images */ const lastImages = new Map<string, Blob>();
		/* Issue: images */ const currentlyUsingFallback = new Set<string>();
		/* Issue: images */ const informFallbackImage = () => {
			const topElement: HTMLDivElement | null = document.querySelector("body > div > div > div.absolute.left-1\\/2.-translate-x-1\\/2.items-center.justify-center");
			if (!topElement) return console.warn(name, "could not find the top center element to inform about fallback images.");

			let alreadyHas = false;
			topElement.childNodes.forEach(node => {
				if (
					node.nodeType === Node.ELEMENT_NODE &&
					(node as HTMLDivElement).id === "lavaplace-issue-images-warning"
				) alreadyHas = true;
			});

			if (
				currentlyUsingFallback.size > 0 &&
				!alreadyHas
			) {
				const node = document.createElement("div")
				node.id = "lavaplace-issue-images-warning";
				node.className = "btn btn-sm btn-warning w-max cursor-auto text-nowrap text-xs sm:text-base";
				node.innerHTML += "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 -960 960 960\" fill=\"currentColor\" class=\"size-5\"><path d=\"M790-56 414-434q-47 11-87.5 33T254-346l-84-86q32-32 69-56t79-42l-90-90q-41 21-76.5 46.5T84-516L0-602q32-32 66.5-57.5T140-708l-84-84 56-56 736 736-58 56Zm-310-64q-42 0-71-29.5T380-220q0-42 29-71t71-29q42 0 71 29t29 71q0 41-29 70.5T480-120Zm236-238-29-29-29-29-144-144q81 8 151.5 41T790-432l-74 74Zm160-158q-77-77-178.5-120.5T480-680q-21 0-40.5 1.5T400-674L298-776q44-12 89.5-18t92.5-6q142 0 265 53t215 145l-84 86Z\"></path></svg>";
				node.innerHTML += "Images on fallback";

				topElement.appendChild(node);
			} else if (
				currentlyUsingFallback.size === 0 &&
				alreadyHas
			) {
				const node = document.getElementById("lavaplace-issue-images-warning");
				if (node) node.remove();
			}
		}

		// Fetch Hook
		const originalFetch = window.fetch;
		window.fetch = async function (...args) {
			const endpointName = (args[0] instanceof Request) ? args[0].url : args[0] || "ignore";
			const endpointKey = typeof endpointName === "string"
				? endpointName
				: endpointName.href;

			try {
				const response = await originalFetch(...args);
				const cloned = response.clone();

				const contentType = cloned.headers.get("content-type") || '';

				if (contentType.includes("application/json")) {
					cloned
						.json()
						.then(data => window.postMessage({
							source: "lavaplace",
							endpoint: endpointName,
							data: data,
						}, '*'))
						.catch((error) => console.error(name, "has failed to parse JSON from", endpointName, "\n\tWith error:", error));
				} else if (contentType.includes("image/png")) {
					cloned
						.blob()
						.then(data => {
							window.postMessage({
								source: "lavaplace",
								endpoint: endpointName,
								data: { type: "image", url: URL.createObjectURL(data) },
							}, '*');

							/* Issue: images */ lastImages.set(endpointKey, data);
							/* Issue: images */ setTimeout(() => {
								if (lastImages.get(endpointKey) === data) {
									lastImages.delete(endpointKey);
									currentlyUsingFallback.delete(endpointKey);
									informFallbackImage();
								}
							}, 2.5 * 60 * 1000);
							/* Issue: images */ currentlyUsingFallback.delete(endpointKey);
							/* Issue: images */ informFallbackImage();
						})
						.catch((error) => console.error(name, "has failed to parse image from", endpointName, "\n\tWith error:", error));
				} else if (contentType.includes("text/plain") || contentType.includes("text/html")) {
					cloned
						.text()
						.then(data => window.postMessage({
							source: "lavaplace",
							endpoint: endpointName,
							data: data,
						}, '*'))
						.catch((error) => console.error(name, "has failed to parse text from", endpointName, "\n\tWith error:", error));
				} else {
					window.postMessage({
						source: "lavaplace",
						endpoint: endpointName,
						data: undefined,
					}, '*')
				}

				return response;
			} catch(error) {
				console.error(name, "has failed to process request", "\n\tWith error:", error);

				/* Issue: images */
				if (endpointKey.includes("/tiles/") && lastImages.has(endpointKey)) {
					currentlyUsingFallback.add(endpointKey);
					informFallbackImage();

					window.postMessage({
						source: "lavaplace",
						endpoint: endpointName,
						data: {
							type: "image",
							url: URL.createObjectURL(lastImages.get(endpointKey)!),
							isIssueFallback: true
						}
					});

					console.warn(name, "is using a stored fallback image for the failed tile request:", endpointKey);

					return new Response(lastImages.get(endpointKey)!, {
						status: 200,
						statusText: `OK (${name}'s stored fallback)`,
						headers: { "Content-Type": "image/png" }
					});
				}

				window.postMessage({
					source: "lavaplace",
					endpoint: (args[0] instanceof Request) ? args[0]?.url : args[0] || "ignore",
					data: undefined,
				}, '*');

				return originalFetch(...args);
			}
		}
	});

	return true;
}

(() => {
	window.addEventListener("message", async (event) => {
		if (typeof event.data !== "object" || event.data === null) return;
		const { source, endpoint, data }: { source?: string, endpoint?: string, data?: any } = event.data;
		if (source !== "lavaplace" || !endpoint) return;

		const endpointText = endpoint
			.split('?')[0]
			.split('/')
			.filter((s: string) => s && isNaN(Number(s)))
			.filter((s: string) => s && (!s.includes('.') && !s.includes("%")))
			.pop() ?? `unknown_${GM_info.script.uuid}`;

		switch (endpointText) {
			case "fonts": break;
			case "health": break;
			case "me":
				await updateUserMenu(data);
				break;
			case "pixel":
				await updatePixelMenu(data);
				break;
			case "tiles": break;

			// Debugging endpoints
			case "ignore":
				console.debug(
					GM_info.script.name, `received data from ignored endpoint:`,
					data,
					"\n\tNote that we are not taking any telemetry data, this is only for debugging purposes."
				);
				break;
			default:
				console.debug(
					GM_info.script.name, `received data from unknown endpoint (${endpointText}):`,
					data,
					"\n\tNote that we are not taking any telemetry data, this is only for debugging purposes."	
				);
		}
	});
})();
