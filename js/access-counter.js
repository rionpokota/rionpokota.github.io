(function () {
	var counterElement = document.getElementById("access-counter-value");
	if (!counterElement) {
		return;
	}

	var countKey = "capricalm-access-count";
	var dateKey = "capricalm-access-count-date";
	var today = new Date();
	var todayKey = [
		today.getFullYear(),
		String(today.getMonth() + 1).padStart(2, "0"),
		String(today.getDate()).padStart(2, "0")
	].join("-");

	try {
		var savedCount = parseInt(localStorage.getItem(countKey) || "0", 10);
		var count = Number.isNaN(savedCount) || savedCount < 0 ? 0 : savedCount;
		var lastCountDate = localStorage.getItem(dateKey);

		if (lastCountDate !== todayKey) {
			count += 1;
			localStorage.setItem(countKey, String(count));
			localStorage.setItem(dateKey, todayKey);
		}

		counterElement.textContent = String(count).padStart(5, "0");
	} catch (error) {
		counterElement.textContent = "00001";
	}
})();