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
			if (state) console.log(`UserScript '${GM_info.script.name}' v${GM_info.script.version} loaded!`);
			else await sleep(1000);
		}

		if (!state) console.warn(`UserScript '${GM_info.script.name}' v${GM_info.script.version} failed to load.`);
	})();
}

async function start() {
	const update = await updateUserMenu();
	if (!update) return false;

	inject(() => {
		const name = document.currentScript?.getAttribute('bm-name') || 'LavaPlace';

		// Fetch Hook
		const originalFetch = window.fetch;
		window.fetch = async function (...args) {
			const response = await originalFetch(...args);
			const cloned = response.clone();

			const endpointName = ((args[0] instanceof Request) ? args[0]?.url : args[0]) || "ignore";
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
			}

			return response;
		}
	});

	return true;
}
