(function () {
	var counterElement = document.getElementById("access-counter-value");
	if (!counterElement) {
		return;
	}

	var workspace = "capricalm-rionpokota-github-io";
	var counterName = "site-access-total";
	var apiBaseUrl = "https://api.counterapi.dev/v2/" + workspace + "/" + counterName;
	var storageCountKey = "capricalm-access-count-cache";
	var storageVisitKey = "capricalm-access-last-visit-at";
	var revisitWindowMs = 15 * 60 * 1000;

	function formatCount(value) {
		return String(Math.max(0, value)).padStart(5, "0");
	}

	function updateDisplay(value) {
		counterElement.textContent = formatCount(value);
	}

	function extractCount(data) {
		if (!data || typeof data !== "object") {
			return 0;
		}

		if (typeof data.up_count === "number") {
			return data.up_count;
		}

		if (typeof data.value === "number") {
			return data.value;
		}

		return 0;
	}

	function readCachedCount() {
		try {
			var savedCount = parseInt(localStorage.getItem(storageCountKey) || "0", 10);
			return Number.isNaN(savedCount) || savedCount < 0 ? 0 : savedCount;
		} catch (error) {
			return 0;
		}
	}

	function writeCache(value, countedVisit) {
		try {
			localStorage.setItem(storageCountKey, String(value));
			if (countedVisit) {
				localStorage.setItem(storageVisitKey, String(Date.now()));
			}
		} catch (error) {
			return;
		}
	}

	function requestCounter(shouldIncrement) {
		var endpoint = shouldIncrement ? apiBaseUrl + "/up" : apiBaseUrl;
		return fetch(endpoint, {
			method: "GET",
			cache: "no-store"
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error("Counter request failed");
				}
				return response.json();
			})
			.then(function (data) {
				var count = extractCount(data);
				writeCache(count, shouldIncrement);
				updateDisplay(count);
			});
	}

	var cachedCount = readCachedCount();
	updateDisplay(cachedCount);

	var countedVisit = false;
	try {
		var lastVisitAt = parseInt(localStorage.getItem(storageVisitKey) || "0", 10);
		countedVisit = !Number.isNaN(lastVisitAt) && lastVisitAt > 0 && Date.now() - lastVisitAt < revisitWindowMs;
	} catch (error) {
		countedVisit = false;
	}

	requestCounter(!countedVisit).catch(function () {
		updateDisplay(cachedCount);
	});
})();