(function () {
	var counterElement = document.getElementById("access-counter-value");
	if (!counterElement) {
		return;
	}

	var namespace = "capricalm-rionpokota-github-io";
	var key = "site-access-total";
	var storageCountKey = "capricalm-access-count-cache";
	var storageDateKey = "capricalm-access-count-date";
	var today = new Date();
	var todayKey = [
		today.getFullYear(),
		String(today.getMonth() + 1).padStart(2, "0"),
		String(today.getDate()).padStart(2, "0")
	].join("-");

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

	function writeCache(value, countedToday) {
		try {
			localStorage.setItem(storageCountKey, String(value));
			if (countedToday) {
				localStorage.setItem(storageDateKey, todayKey);
			}
		} catch (error) {
			return;
		}
	}

	function requestCounter(url, countedToday) {
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
				writeCache(count, countedToday);
				updateDisplay(count);
			});
	}

	var cachedCount = readCachedCount();
	updateDisplay(cachedCount);

	var countedToday = false;
	try {
		countedToday = localStorage.getItem(storageDateKey) === todayKey;
	} catch (error) {
		countedToday = false;
	}

	var endpoint = countedToday
		? "https://api.countapi.xyz/get/" + namespace + "/" + key
		: "https://api.countapi.xyz/hit/" + namespace + "/" + key;

	requestCounter(endpoint, !countedToday).catch(function () {
		updateDisplay(cachedCount);
	});
})();