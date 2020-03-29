var stateInfos = [{"name":"Alaska","abbreviation":"AK"},{"name":"Alabama","abbreviation":"AL"},{"name":"Arkansas","abbreviation":"AR"}, {"name":"American Samoa","abbreviation":"AS"},{"name":"Arizona","abbreviation":"AZ"},{"name":"California","abbreviation":"CA"}, {"name":"Colorado","abbreviation":"CO"},{"name":"Connecticut","abbreviation":"CT"},{"name":"District Of Columbia","abbreviation":"DC"}, {"name":"Delaware","abbreviation":"DE"},{"name":"Florida","abbreviation":"FL"},{"name":"Georgia","abbreviation":"GA"},{"name":"Guam","abbreviation":"GU"}, {"name":"Hawaii","abbreviation":"HI"},{"name":"Iowa","abbreviation":"IA"},{"name":"Idaho","abbreviation":"ID"},{"name":"Illinois","abbreviation":"IL"}, {"name":"Indiana","abbreviation":"IN"},{"name":"Kansas","abbreviation":"KS"},{"name":"Kentucky","abbreviation":"KY"},{"name":"Louisiana","abbreviation":"LA"}, {"name":"Massachusetts","abbreviation":"MA"},{"name":"Maryland","abbreviation":"MD"},{"name":"Maine","abbreviation":"ME"},{"name":"Michigan","abbreviation":"MI"}, {"name":"Minnesota","abbreviation":"MN"},{"name":"Missouri","abbreviation":"MO"},{"name":"Northern Mariana Islands","abbreviation":"MP"}, {"name":"Mississippi","abbreviation":"MS"},{"name":"Montana","abbreviation":"MT"},{"name":"North Carolina","abbreviation":"NC"},{"name":"North Dakota","abbreviation":"ND"}, {"name":"Nebraska","abbreviation":"NE"},{"name":"New Hampshire","abbreviation":"NH"},{"name":"New Jersey","abbreviation":"NJ"},{"name":"New Mexico","abbreviation":"NM"}, {"name":"Nevada","abbreviation":"NV"},{"name":"New York","abbreviation":"NY"},{"name":"Ohio","abbreviation":"OH"},{"name":"Oklahoma","abbreviation":"OK"}, {"name":"Oregon","abbreviation":"OR"},{"name":"Pennsylvania","abbreviation":"PA"},{"name":"Puerto Rico","abbreviation":"PR"},{"name":"Rhode Island","abbreviation":"RI"}, {"name":"South Carolina","abbreviation":"SC"},{"name":"South Dakota","abbreviation":"SD"},{"name":"Tennessee","abbreviation":"TN"},{"name":"Texas","abbreviation":"TX"}, {"name":"Utah","abbreviation":"UT"},{"name":"Virginia","abbreviation":"VA"},{"name":"Virgin Islands","abbreviation":"VI"},{"name":"Vermont","abbreviation":"VT"}, {"name":"Washington","abbreviation":"WA"},{"name":"Wisconsin","abbreviation":"WI"},{"name":"West Virginia","abbreviation":"WV"},{"name":"Wyoming","abbreviation":"WY"}];

class CovidRecordStats {
	constructor() {
		//location
		this.stateInfo = null;
		this.county = null;

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
		this.calculatPercentage("testResultsPositivePercentFloat", "testResultsPositiveInt", "testResultsTotalInt");
		this.calculatPercentage("testResultsNegativePercentFloat", "testResultsNegativeInt", "testResultsTotalInt");
		this.calculatPercentage("hospitalizedOfTotalPercentFloat", "hospitalizedInt", "testResultsTotalInt");
		this.calculatPercentage("hospitalizedOfPositivePercentFloat", "hospitalizedInt", "testResultsPositiveInt");
		this.calculatPercentage("deathsOfTotalPercentFloat", "deathsInt", "testResultsTotalInt");
		this.calculatPercentage("deathsOfPositivePercentFloat", "deathsInt", "testResultsPositiveInt");
	}

	calculatPercentage(targetPropertyName, countPropertyName, maxPropertyName) {
		var count = this[countPropertyName];
		var max = this[maxPropertyName];
		if (count != null && max != null) {
			this[targetPropertyName] = getPercentageFloat(count, max);
		}
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
			this.calculateNewStat(latestStats, previousStats, "testResultsPositiveInt");
			this.calculateNewStat(latestStats, previousStats, "testResultsNegativeInt");
			this.calculateNewStat(latestStats, previousStats, "testResultsTotalInt");
			this.calculateNewStat(latestStats, previousStats, "hospitalizedInt");
			this.calculateNewStat(latestStats, previousStats, "deathsInt");
		}
	}

	calculateNewStat(latestStats, previousStats, propertyName) {
		var latestCount = latestStats[propertyName];
		var previousCount = previousStats[propertyName];
		if (latestCount != null && previousCount != null) {
			this[propertyName] = latestCount - previousCount;
		}
	}

	initializePercentages(previousStats) {
		super.initializePercentages();

		if (previousStats != null) {
			this.calculateGrowth(previousStats, "testResultsPositiveInt", "testResultsPositiveGrowthPercentFloat");
			this.calculateGrowth(previousStats, "testResultsNegativeInt", "testResultsNegativeGrowthPercentFloat");
			this.calculateGrowth(previousStats, "testResultsTotalInt", "testResultsTotalGrowthPercentFloat");
			this.calculateGrowth(previousStats, "hospitalizedInt", "hospitalizedGrowthPercentFloat");
			this.calculateGrowth(previousStats, "deathsInt", "deathGrowthPercentFloat");
		}
	}

	calculateGrowth(previousStats, propertyName, targetPropertyName) {
		var latestCount = this[propertyName];
		var previousCount = previousStats[propertyName];
		if (latestCount != null && previousCount != null) {
			this[targetPropertyName] = getPercentageFloat(latestCount, previousCount);
		}
	}
}

class CovidRecord {
	constructor(id, index, date, datePretty, originalRecord) {
		this.id = id;
		this.index = index;
		this.date = date;
		this.datePretty = datePretty;
		this.dateSortable = "" + date.getUTCFullYear() + "" + date.getUTCMonth() + "" + date.getUTCDate();
		this.originalRecord = originalRecord;
		this.stats = new CovidRecordStats();
		this.newStats = new CovidRecordNewStats(null, null); //new stats compared to previous day
	}
}

class CovidDataManager {
	constructor(dataLoadedHandler) {	
		this.loadStartTime = new Date().getTime();
		this.unitedStatesDailyDataArray	= null;
		this.statesDailyDataMapByStateName = null;
		this.countyDailyDataMapByStateName = null;
		this.statesWithHospitalizationInfo = [];

		var self = this;

		var url = "https://covidtracking.com/api/us/daily";
		this.fetchData(url, "CTP U.S.", dataLoadedHandler, function(results) {
			self.unitedStatesDailyDataArray = self.parseCTPData(JSON.parse(results), "usData");
		});

		url = "https://covidtracking.com/api/states/daily";
		this.fetchData(url, "CTP States", dataLoadedHandler, function(results) {
			self.statesDailyDataMapByStateName = self.parseCTPStateData(JSON.parse(results));
		});

		url = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
		this.fetchData(url, "NYT County", dataLoadedHandler, function(results) {
			self.countyDailyDataMapByStateName = self.parseNYTCountyData(results);
		});		
	}

	fetchData(url, description, dataLoadedHandler, parseFunction) { 
		var self = this;
		debug("Loading " + description + " data from: " + url);
		loadWebResource(url, function(results) {
			debug("Parsing " + description + " data.");
			parseFunction(results);
			var timeElapsed = new Date().getTime() - self.loadStartTime;
			debug("Finished parsing " + description + " data. Time since load: " + timeElapsed + "ms.");
			if (self.unitedStatesDailyDataArray != null 
					&& self.statesDailyDataMapByStateName != null
					&& self.countyDailyDataMapByStateName != null) {
				debug("All api data has been loaded, calling data loaded handler.")
				dataLoadedHandler(self);
			}
		});

	}

	parseNYTCountyData(results) {
		/*
			results is string of csv data

			headers: date,county,state,fips,cases,deaths

			example row: 2020-01-21,Snohomish,Washington,53061,1,0
		*/
		if (results == null) {
			console.log("ERROR: NYT data was empty.");
			return [];
		}

		var idCounter = 0;		
		var covidRecordMapByStateName = [];
		for (var line of results.split("\n")) {
			var parts = line.split(",");

			//date format in record: 2020-01-21
			var d = "" + parts[0];
			var year = parseInt(d.substr(0,4));
			var month = parseInt(d.substr(5,2));
			var day = parseInt(d.substr(8,2));			
			var date = new Date(year, month - 1, day, 0, 0, 0, 0);

			//debug("Parsed from NYT api date '" + parts[0] + " y:" + year + ", m: " + month + ", d: " + day + ", date:" + date);

			var covidRecord = new CovidRecord("nytData" + "-" + idCounter, idCounter, date, printDayShort(date), line);
			covidRecord.county = parts[1];
			covidRecord.stateInfo = this.getStateInfoByStateName(parts[2]);
			if (covidRecord.stateInfo == null) {
				console.log("WARNING Couldn't find state for name: " + parts[2] + ", record will be dropped.", { line:line });
				continue;
			}

			//counts
			covidRecord.stats.testResultsPositiveInt = parseInt(parts[4]);
			covidRecord.stats.testResultsNegativeInt = null;
			covidRecord.stats.testResultsTotalInt = null;
			covidRecord.stats.hospitalizedInt = null;
			covidRecord.stats.deathsInt = parseInt(parts[5]);

			//console.log("Processed NYT CSV Line.", { line:line, parts:parts, record:covidRecord });
			var key = covidRecord.stateInfo.name;
			if (covidRecordMapByStateName[key] == null) {
				covidRecordMapByStateName[key] = [];
			}
			covidRecordMapByStateName[key].push(covidRecord);
			idCounter += 1;
		}

		//populate county new stats from day to day
		for (var stateInfo of stateInfos) {
			var stateRecords = covidRecordMapByStateName[stateInfo.name];
			// console.log("Populating NYT new stats for state: " + stateInfo.name, stateRecords);
			if (stateRecords == null) {
				console.log("WARNING: no county information found for state: " + stateInfo.name);
				continue;
			}
			var countyNames = [];
			var stateRecordsMapByCounty = [];
			for (var covidRecord of stateRecords) {
				var countyName = covidRecord.county;
				if (!countyNames.includes(countyName)) {
					countyNames.push(countyName);
				}
				if (stateRecordsMapByCounty[countyName] == null) {
					stateRecordsMapByCounty[countyName] = [];
				}
				stateRecordsMapByCounty[countyName].push(covidRecord);
			}
			countyNames.sort();
			// console.log("Finished sorting state data by county: " + stateInfo.name, { map:stateRecordsMapByCounty, counties:countyNames });
			var newStateRecords = [];
			for (var countyName of countyNames) {
				var recordsForCounty = stateRecordsMapByCounty[countyName];
				this.sortCovidRecordsByDate(recordsForCounty);
				this.populateNewStats(recordsForCounty)		
				for (var covidRecord of recordsForCounty) {
					newStateRecords.push(covidRecord);
				}
			}			
			covidRecordMapByStateName[stateInfo.name] = newStateRecords;
			// console.log("Finished populating new stats for state data by county: " + stateInfo.name, newStateRecords);
		}

		// console.log("Finished parsing NYT data.", covidRecordMapByStateName);

		return covidRecordMapByStateName;
	}

	// parse state data from Covid Tracking Project
	parseCTPStateData(results) {
		/*
			Example state record:

			{
				"date":20200328,
				"state":"AK",
				"positive":85,
				"negative":2836,
				"pending":null,
				"hospitalized":5,
				"death":2,
				"total":2921,
				"hash":"edb7e6bcde715f8bbea31547e99aa8b4712ea5fb",
				"dateChecked":"2020-03-28T20:00:00Z",
				"totalTestResults":2921,
				"fips":"02",
				"deathIncrease":1,
				"hospitalizedIncrease":2,
				"negativeIncrease":517,
				"positiveIncrease":16,
				"totalTestResultsIncrease":533
			}
		*/

		var recordsByStateMap = [];
		for (var record of results) {
			var stateAbbreviation = record.state;
			var stateInfo = this.getStateInfoByStateAbbreviation(stateAbbreviation);
			if (stateInfo == null) {
				console.log("Cannot find state for this abbreviation: " + stateAbbreviation + ". Record will be dropped.", record);
			}
			if (recordsByStateMap[stateInfo.name] == null) {
				recordsByStateMap[stateInfo.name] = [];
			}
			recordsByStateMap[stateInfo.name].push(record);
		}
		var result = [];
		for (var stateInfo of stateInfos) {
			var stateAbbreviation = stateInfo.name;
			var records = recordsByStateMap[stateInfo.name];
			for (var record of records) {
				record.stateInfo = stateInfo;
			}
			result[stateInfo.name] = this.parseCTPData(records, stateInfo.name + "Data");
			for (var record of result[stateInfo.name]) {
				if (record.stats.hospitalizedInt > 0) {
					console.log("State has hospitalization info: " + stateInfo.name, record);
					this.statesWithHospitalizationInfo.push(stateInfo.name);
					break;
				}
			}
		}
		this.statesWithHospitalizationInfo.sort();
		return result;
	}

	// parse data from Covid Tracking Project
	parseCTPData(results, dataDesc) {
		var idCounter = 0;
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
			
			covidRecordArray.push(covidRecord);
			idCounter += 1;			
		}
		this.sortCovidRecordsByDate(covidRecordArray);
		this.populateNewStats(covidRecordArray)		
		return covidRecordArray;		
	}

	populateNewStats(recordArray) {
		var arrayCopy = recordArray.slice();
		this.sortCovidRecordsByDate(arrayCopy);
		var lastCovidRecord = null;
		for (var covidRecord of arrayCopy) {
			var lastRecordStats = lastCovidRecord == null ? null : lastCovidRecord.stats;
			covidRecord.newStats = new CovidRecordNewStats(covidRecord.stats, lastRecordStats);
			covidRecord.newStats.initializePercentages(lastRecordStats);
			lastCovidRecord = covidRecord;
		}
	} 


	sortCovidRecordsByDate(recordArray) {
		recordArray.sort((a, b) => (a.dateSortable.localeCompare(b.dateSortable)) ? 1 : -1);
	}

	denull(x) {
		return x == null ? 0 : x;
	}

	getUnitedStatesDataForIndex(index) {
		if (this.unitedStatesDailyDataArray == null) {
			return null;
		}
		for (var item of this.unitedStatesDailyDataArray) {
			if (item.index == index) {
				return item;
			}
		}
		return null;
	}

	getUnitedStatesDataForId(id) {
		if (this.unitedStatesDailyDataArray == null) {
			return null;
		}
		for (var item of this.unitedStatesDailyDataArray) {
			if (item.id == id) {
				return item;
			}
		}
		return null;
	}

	getDailyStateDataForStateName(stateName) {
		if (this.statesDailyDataMapByStateName == null) {
			return [];
		}
		var results = this.statesDailyDataMapByStateName[stateName];
		return results == null ? [] : results;
	}

	getStateInfoByStateName(stateName) {
		for (var stateInfo of stateInfos) {
			if (stateInfo.name == stateName) {
				return stateInfo;
			}
		}
		return null;
	}

	getStateInfoByStateAbbreviation(stateAbbreviation) {
		for (var stateInfo of stateInfos) {
			if (stateInfo.abbreviation == stateAbbreviation) {
				return stateInfo;
			}
		}
		return null;
	}

	getNYTCountyDataForStateName(stateName) {
		if (this.countyDailyDataMapByStateName == null) {
			return [];
		}
		var result = this.countyDailyDataMapByStateName[stateName];
		return result == null ? [] : result;
	}

	getNYTCountyDataForStateCounty(stateName, countyName) {
		var result = [];
		for (var record of this.getNYTCountyDataForStateName(stateName)) {
			if (record.county == countyName) {
				result.push(record);
			}
		}
		return result;
	}

	getCountiesForStateName(stateName) {
		var countyNamesArray = [];
		for (var covidRecord of this.getNYTCountyDataForStateName(stateName)) {
			var county = covidRecord.county;
			if (county != null && !countyNamesArray.includes(county)) {
				countyNamesArray.push(county);
			}
		}
		countyNamesArray.sort();
		return countyNamesArray;
	}

	get stateNamesArray() {
		var result = [];
		for (var stateInfo of stateInfos ) {
			result.push(stateInfo.name);
		}
		result.sort();
		return result;
	}

	get unitedStatesDailyDataArray() { return this._unitedStatesDailyDataArray; }
	set unitedStatesDailyDataArray(x) { this._unitedStatesDailyDataArray = x; }
	get statesDailyDataMap() { return this._statesDailyDataMap; }
	set statesDailyDataMap(x) { this._statesDailyDataMap = x; }
}
