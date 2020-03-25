var stateNames = [{"name":"Alaska","state":"AK"},{"name":"Alabama","state":"AL"},{"name":"Arkansas","state":"AR"}, {"name":"American Samoa","state":"AS"},{"name":"Arizona","state":"AZ"},{"name":"California","state":"CA"}, {"name":"Colorado","state":"CO"},{"name":"Connecticut","state":"CT"},{"name":"District Of Columbia","state":"DC"}, {"name":"Delaware","state":"DE"},{"name":"Florida","state":"FL"},{"name":"Georgia","state":"GA"},{"name":"Guam","state":"GU"}, {"name":"Hawaii","state":"HI"},{"name":"Iowa","state":"IA"},{"name":"Idaho","state":"ID"},{"name":"Illinois","state":"IL"}, {"name":"Indiana","state":"IN"},{"name":"Kansas","state":"KS"},{"name":"Kentucky","state":"KY"},{"name":"Louisiana","state":"LA"}, {"name":"Massachusetts","state":"MA"},{"name":"Maryland","state":"MD"},{"name":"Maine","state":"ME"},{"name":"Michigan","state":"MI"}, {"name":"Minnesota","state":"MN"},{"name":"Missouri","state":"MO"},{"name":"Northern Mariana Islands","state":"MP"}, {"name":"Mississippi","state":"MS"},{"name":"Montana","state":"MT"},{"name":"North Carolina","state":"NC"},{"name":"North Dakota","state":"ND"}, {"name":"Nebraska","state":"NE"},{"name":"New Hampshire","state":"NH"},{"name":"New Jersey","state":"NJ"},{"name":"New Mexico","state":"NM"}, {"name":"Nevada","state":"NV"},{"name":"New York","state":"NY"},{"name":"Ohio","state":"OH"},{"name":"Oklahoma","state":"OK"}, {"name":"Oregon","state":"OR"},{"name":"Pennsylvania","state":"PA"},{"name":"Puerto Rico","state":"PR"},{"name":"Rhode Island","state":"RI"}, {"name":"South Carolina","state":"SC"},{"name":"South Dakota","state":"SD"},{"name":"Tennessee","state":"TN"},{"name":"Texas","state":"TX"}, {"name":"Utah","state":"UT"},{"name":"Virginia","state":"VA"},{"name":"Virgin Islands","state":"VI"},{"name":"Vermont","state":"VT"}, {"name":"Washington","state":"WA"},{"name":"Wisconsin","state":"WI"},{"name":"West Virginia","state":"WV"},{"name":"Wyoming","state":"WY"}];

class CovidRecordStats {
	constructor() {
		//counts
		this.testResultsPositiveInt = 0;
		this.testResultsNegativeInt = 0;
		this.testResultsTotalInt = 0;
		this.hospitalizedInt = 0;
		this.deathsInt = 0;
		
		//percents		
		this.testResultsPositivePercentFloat = 0;
		this.testResultsNegativePercentFloat = 0;
		this.hospitalizedOfTotalPercentFloat = 0;
		this.hospitalizedOfPositivePercentFloat = 0;
		this.deathsOfTotalPercentFloat = 0;
		this.deathsOfPositivePercentFloat = 0;
	}

	initializePercentages() {
		//percentages on original api data
		this.testResultsPositivePercentFloat = getPercentageFloat(this.testResultsPositiveInt, this.testResultsTotalInt);
		this.testResultsNegativePercentFloat = getPercentageFloat(this.testResultsNegativeInt, this.testResultsTotalInt);
		this.hospitalizedOfTotalPercentFloat = getPercentageFloat(this.hospitalizedInt, this.testResultsTotalInt);
		this.hospitalizedOfPositivePercentFloat = getPercentageFloat(this.hospitalizedInt, this.testResultsPositiveInt);
		this.deathsOfTotalPercentFloat = getPercentageFloat(this.deathsInt, this.testResultsTotalInt);
		this.deathsOfPositivePercentFloat = getPercentageFloat(this.deathsInt, this.testResultsPositiveInt);
	}
}

class CovidRecordNewStats extends CovidRecordStats { //new stats compared to previous day
	//latestStats is CovidRecordStats from current record
	//previousStats is CovidRecordStats from last record
	constructor(latestStats, previousStats) {
		super();
		
		this.testResultsPositiveGrowthPercentFloat = 0;
		this.testResultsNegativeGrowthPercentFloat = 0;
		this.testResultsTotalGrowthPercentFloat = 0;
		this.hospitalizedGrowthPercentFloat = 0;
		this.deathGrowthPercentFloat = 0;
		
		if (latestStats != null && previousStats != null) {
			this.testResultsPositiveInt = latestStats.testResultsPositiveInt - previousStats.testResultsPositiveInt;
			this.testResultsNegativeInt = latestStats.testResultsNegativeInt - previousStats.testResultsNegativeInt;
			this.testResultsTotalInt = latestStats.testResultsTotalInt - previousStats.testResultsTotalInt; 
			this.hospitalizedInt = latestStats.hospitalizedInt - previousStats.hospitalizedInt; 
			this.deathsInt = latestStats.deathsInt - previousStats.deathsInt; 
		}
	}

	initializePercentages(previousStats) {
		super.initializePercentages();

		if (previousStats != null) {
			this.testResultsPositiveGrowthPercentFloat = getPercentageFloat(this.testResultsPositiveInt, previousStats.testResultsPositiveInt);
			this.testResultsNegativeGrowthPercentFloat = getPercentageFloat(this.testResultsNegativeInt, previousStats.testResultsNegativeInt);
			this.testResultsTotalGrowthPercentFloat = getPercentageFloat(this.testResultsTotalInt, previousStats.testResultsTotalInt);
			this.hospitalizedGrowthPercentFloat = getPercentageFloat(this.hospitalizedInt, previousStats.hospitalizedInt);
			this.deathGrowthPercentFloat = getPercentageFloat(this.deathsInt, previousStats.deathsInt);
		}
	}
}

class CovidRecord {
	constructor(id, index, date, datePretty, originalRecord) {
		this.id = id;
		this.index = index;
		this.date = date;
		this.datePretty = datePretty;
		this.originalRecord = originalRecord;
		this.stats = new CovidRecordStats();
		this.newStats = new CovidRecordNewStats(null, null); //new stats compared to previous day
	}
}

class CovidDataManager {
	constructor(dataLoadedHandler) {		
		var self = this;
		var url = "https://covidtracking.com/api/us/daily";
		debug("Loading U.S. data from: " + url);
		loadWebResource(url, function(results) {
			debug("Parsing U.S. data.");
			self.unitedStatesDailyDataArray = self.parseData(JSON.parse(results), "usData");
			debug("Finished parsing U.S. data.");
			dataLoadedHandler(self);
		});
		loadWebResource("https://covidtracking.com/api/states/daily", function(results) {
			debug("Parsing State data.");
			self.statesDailyDataMap = self.parseStateData(JSON.parse(results));
			debug("Finished parsing State data.");
		});
	}

	parseStateData(results) {
		var recordsByStateMap = [];
		for (var record of results) {
			var state = record.state;
			if (recordsByStateMap[state] == null) {
				recordsByStateMap[state] = [];
			}
			recordsByStateMap[state].push(record);
		}
		var result = [];
		for (var stateName of stateNames ) {
			var state = stateName.state;
			var records = recordsByStateMap[state];
			result[state] = this.parseData(records, state + "Data");
		}
		return result;
	}

	parseData(results, dataDesc) {
		var idCounter = 0;
		var lastCovidRecord = null;
		var covidRecordArray = []; //array of CovidRecord
		for (var i = results.length - 1; i >= 0; i--) {

			// original record from api: {"date":20200323,"states":56,"positive":42164,"negative":237321,"posNeg":279485,"pending":14571,"hospitalized":3325,"death":471,"total":294056}
			var apiRecord = results[i];

			//console.log("converting record for " + dataDesc, apiRecord);

			var d = "" + apiRecord.date;
			var year = parseInt(d.substr(0,4));
			var month = parseInt(d.substr(4,2));
			var day = parseInt(d.substr(6,2));			
			var date = new Date(year, month - 1, day, 0, 0, 0, 0);

			// debug("Parsed from api date '" + apiRecord.date + " y:" + year + ", m: " + month + ", d: " + day + ", date:" + date);
			
			var covidRecord = new CovidRecord(dataDesc + "-" + idCounter, idCounter, date, printDayShort(date), apiRecord);
			var stats = covidRecord.stats;
			stats.testResultsPositiveInt = this.denull(apiRecord.positive);
			stats.testResultsNegativeInt = this.denull(apiRecord.negative);
			stats.testResultsTotalInt = this.denull(apiRecord.positive) + this.denull(apiRecord.negative);
			stats.hospitalizedInt = this.denull(apiRecord.hospitalized);
			stats.deathsInt = this.denull(apiRecord.death);			
			stats.initializePercentages();

			var lastRecordStats = lastCovidRecord == null ? null : lastCovidRecord.stats;
			covidRecord.newStats = new CovidRecordNewStats(stats, lastRecordStats);
			covidRecord.newStats.initializePercentages(lastRecordStats);

			covidRecordArray.push(covidRecord);

			idCounter += 1;
			lastCovidRecord = covidRecord;
		}
		return covidRecordArray;		
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

	stateDailyDataArray(stateName) {
		for (var stateData of stateNames ) {
			console.log("" + stateName, stateData);
			if (stateData.name == stateName) {
				return this.statesDailyDataMap[stateData.state];
			}
		}
		return null;
	}

	get stateNames() {
		var result = [];
		for (var stateName of stateNames ) {
			result.push(stateName.name);
		}
		result.sort();
		return result;
	}

	get unitedStatesDailyDataArray() { return this._unitedStatesDailyDataArray; }
	set unitedStatesDailyDataArray(x) { this._unitedStatesDailyDataArray = x; }
	get statesDailyDataMap() { return this._statesDailyDataMap; }
	set statesDailyDataMap(x) { this._statesDailyDataMap = x; }
}
