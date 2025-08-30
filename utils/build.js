const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const prettier = require("prettier");

const parts = [
	readFileSync(path.join(__dirname, "..", "dist", "meta.js"), "utf-8").trim(),
	readFileSync(path.join(__dirname, "..", "dist", "utils.js"), "utf-8").trim(),
	readFileSync(path.join(__dirname, "..", "dist", "profile.js"), "utf-8").trim(),
	readFileSync(path.join(__dirname, "..", "dist", "pixel.js"), "utf-8").trim(),
	readFileSync(path.join(__dirname, "..", "dist", "main.js"), "utf-8").trimStart(),
];

writeFileSync(
	path.join(__dirname, "..", "LavaPlace.js"),
	parts.join("\n\n"),
	"utf-8"
);

console.warn('\n', "Don't forget to change the version in src/meta.js!", '\n');
