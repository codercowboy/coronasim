class CovidDataManager {

	_unitedStatesDailyDataArray = null;

	constructor(dataLoadedHandler) {
		var self = this;
		loadWebResource("https://covidtracking.com/api/us/daily", function(results) {
			self.parseData(JSON.parse(results), "usData");
			dataLoadedHandler();
		});
	}

	parseData(results, dataDesc) {
		var recordArray = [];
		var idCounter = 0;

		for (var record of results) {
			// original record from api: {"date":20200323,"states":56,"positive":42164,"negative":237321,"posNeg":279485,"pending":14571,"hospitalized":3325,"death":471,"total":294056}

			var d = "" + record.date;
			var year = parseInt(d.substr(0,4));
			var month = parseInt(d.substr(4,2));
			var day = parseInt(d.substr(6,2));			
			var date = new Date(year, month - 1, day, 0, 0, 0, 0);

			// debug("Parsed from api date '" + record.date + " y:" + year + ", m: " + month + ", d: " + day + ", date:" + date);
			
			var recordCopy = new Object();
			recordCopy.original = record;
			recordCopy.date = date;
			recordCopy.id = dataDesc + "-" + idCounter;
			recordCopy.index = idCounter;
			recordCopy.apiDate = record.date;
			recordCopy.testResultsPositiveInt = record.positive;
			recordCopy.testResultsNegativeInt = record.negative;
			recordCopy.testResultsTotalInt = record.positive + record.negative;
			recordCopy.hospitalizedInt = this.denull(record.hospitalized);
			recordCopy.deathsInt = this.denull(record.death);
			recordCopy.testResultsPositivePercentFloat = getPercentageFloat(recordCopy.testResultsPositiveInt, recordCopy.testResultsTotalInt);
			recordCopy.testResultsNegativePercentFloat = getPercentageFloat(recordCopy.testResultsNegativeInt, recordCopy.testResultsTotalInt);
			recordCopy.hospitalizedOfTotalPercentFloat = getPercentageFloat(recordCopy.hospitalizedInt, recordCopy.testResultsTotalInt);
			recordCopy.hospitalizedOfPositivePercentFloat = getPercentageFloat(recordCopy.hospitalizedInt, recordCopy.testResultsPositiveInt);
			recordCopy.deathsOfTotalPercentFloat = getPercentageFloat(recordCopy.deathsInt, recordCopy.testResultsTotalInt);
			recordCopy.deathsOfPositivePercentFloat = getPercentageFloat(recordCopy.deathsInt, recordCopy.testResultsPositiveInt);
			recordArray.push(recordCopy);

			idCounter += 1;
		}
		this.unitedStatesDailyDataArray = recordArray;
		console.log("data converted from api.", this.unitedStatesDailyDataArray);
	}

	denull(x) {
		return x == null ? 0 : x;
	}

	getUnitedStatesDataForIndex(index) {
		for (var item of this.unitedStatesDailyDataArray) {
			if (item.index == index) {
				return item;
			}
		}
		return null;
	}

	getUnitedStatesDataForId(id) {
		for (var item of this.unitedStatesDailyDataArray) {
			if (item.id == id) {
				return item;
			}
		}
		return null;
	}

	get unitedStatesDailyDataArray() { return this._unitedStatesDailyDataArray; }
	set unitedStatesDailyDataArray(x) { this._unitedStatesDailyDataArray = x; }
}
