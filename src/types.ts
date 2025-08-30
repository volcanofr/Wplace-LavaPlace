/** Unknown data if not set */
interface allianceData {
	readonly description: string,
	readonly hq: {
		readonly latitude: number,
		readonly longitude: number,
	},
	readonly id: number,
	readonly members: number,
	readonly name: string,
	readonly pixelsPainted: number,
	readonly role: "member" | "admin",
}

interface meData {
	/** `0` if never painted */
	readonly allianceId: number,
	readonly allianceRole: "member" | "admin",
	readonly charges: {
		readonly cooldownMs: 30000 | number,
		readonly count: number,
		/** Unknown default value (on a new account) */
		readonly max: number
	},
	readonly country: CountriesCodes,
	/** Unknown data if not set */
	readonly discord?: string,
	readonly droplets: number,
	readonly equippedFlag: Countries,
	/** Unknown data */
	readonly extraColorsBitmap?: -1 | number | string,
	readonly favoriteLocations: Array<{
		readonly id: number,
		/** `""` (empty string) if not set */
		readonly name: string,
		readonly latitude: number,
		readonly longitude: number,
	}>,
	/** Unknown data */
	readonly flagsBitmap: string | number,
	readonly id: number,
	readonly isCustomer: boolean,
	readonly level: number,
	readonly maxFavoriteLocations: 15 | number,
	readonly name: string,
	readonly needsPhoneVerification: boolean,
	/** Unknown data if not set */
	readonly picture?: "data:image/png;base64" | string,
	readonly pixelsPainted: number,
	readonly showLastPixel: boolean,
}

interface pixelData {
	readonly paintedBy: {
		/** `0` if never painted */
		readonly id: number,
		/** `""` (empty string) if never painted */
		readonly name: string,
		/** `0` if not in an alliance */
		readonly allianceId: number,
		/** `""` (empty string) if not in an alliance */
		readonly allianceName: string,
		/** `0` if none are equipped */
		readonly equippedFlag: Countries,
	},
	readonly region: {
		readonly id: number,
		readonly cityId: number,
		readonly name: string,
		readonly number: number,
		readonly countryId: Countries,
	}
}
