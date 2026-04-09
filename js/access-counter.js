(function () {
	var counterElement = document.getElementById("access-counter-value");
	if (!counterElement) {
		return;
	}

	var namespace = "capricalm-rionpokota-github-io";
	var key = "site-access-total";
	var storageCountKey = "capricalm-access-count-cache";
	var storageVisitKey = "capricalm-access-last-visit-at";
	var revisitWindowMs = 15 * 60 * 1000;

	function formatCount(value) {
		return String(Math.max(0, value)).padStart(5, "0");
	}

	function updateDisplay(value) {
		counterElement.textContent = formatCount(value);
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

	function requestCounter(url, countedVisit) {
		return fetch(url, {
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
				var count = typeof data.value === "number" ? data.value : 0;
				writeCache(count, countedVisit);
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

	var endpoint = countedVisit
		? "https://api.countapi.xyz/get/" + namespace + "/" + key
		: "https://api.countapi.xyz/hit/" + namespace + "/" + key;

	requestCounter(endpoint, !countedVisit).catch(function () {
		updateDisplay(cachedCount);
	});
})();