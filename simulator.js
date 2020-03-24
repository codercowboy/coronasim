class CoronaSimulator {

	/*
		fields:

		simulator.currentDayStats
		simulator.currentDayInt
		simulator.currentDayDate
		simulator.coronaSimSettings
		simulator.dayStatsArray
		simulator.totalStats

	*/

	constructor(coronaSimSettings) {
		this._coronaSimSettings = coronaSimSettings;	
		this._currentDayStats = new DayStats(0, coronaSimSettings.initialInfectionsInt, coronaSimSettings);
		this._dayStatsArray = [];
		this._totalStats = new TotalStats();		
		this._dayStatsArray.push(this._currentDayStats);
		this._totalStats.addDayStats(this._currentDayStats);
		this._currentDayInt = 1;

		debug("CoronaSimulator created:", this);			
	}

	moveForwardOneDay() {
		debug("Simulator moving forward one day.", this);
		this._currentDayStats = new DayStats(this._currentDayInt, this._totalStats.totalInfectionsInt, this._coronaSimSettings);
		this._dayStatsArray.push(this._currentDayStats);
		this._totalStats.addDayStats(this._currentDayStats);
		this._currentDayInt += 1;
		if (debugMode) {
			var message = "Sim moved one day forward. Current day: " + this._currentDayInt + " (" + this.currentDayDate + ")\n";
			var totalStats = this._totalStats;
			message += "\tTotal totalDays: " + totalStats.totalDays.toLocaleString() + "\n";
			message += "\tTotal totalInfectionsInt: " + totalStats.totalInfectionsInt.toLocaleString() + "\n";
			message += "\tTotal totalTestedInt: " + totalStats.totalTestedInt.toLocaleString() + "\n";
			message += "\tTotal totalPositiveTestsInt: " + totalStats.totalPositiveTestsInt.toLocaleString() + "\n";
			message += "\tTotal totalHospitalizationsInt: " + totalStats.totalHospitalizationsInt.toLocaleString() + "\n";
			message += "\tTotal totalDeathsInt: " + totalStats.totalDeathsInt.toLocaleString() + "\n";			
			var dayStats = this._currentDayStats;
			message += "\tLatest Day dayNumberInt: " + dayStats.dayNumberInt.toLocaleString() + "\n";
			message += "\tLatest Day finalHospitalDayNumberInt: " + dayStats.finalHospitalDayNumberInt.toLocaleString() + "\n";
			message += "\tLatest Day infectionsInt: " + dayStats.infectionsInt.toLocaleString() + "\n";
			message += "\tLatest Day testedInt: " + dayStats.testedInt.toLocaleString() + "\n";
			message += "\tLatest Day positiveTestsInt: " + dayStats.positiveTestsInt.toLocaleString() + "\n";
			message += "\tLatest Day hospitalizationsInt: " + dayStats.hospitalizationsInt.toLocaleString() + "\n";
			message += "\tLatest Day deathsInt: " + dayStats.deathsInt.toLocaleString() + "\n";
			message += "\tCurrent hospital cases: " + this.hospitalizationsForDayInt(this._currentDayInt).toLocaleString() + "\n";
			debug(message, this);
		}
	}	

	get currentDayStats() { return this._currentDayStats; }
	get currentDayInt() { return this._currentDayInt; }
	get currentDayDate() { return incrementDate(this._coronaSimSettings.initialDate, (this._currentDayInt - 1)); }
	get coronaSimSettings() { return this._coronaSimSettings; }
	get dayStatsArray() { return this._dayStatsArray; }
	get totalStats() { return this._totalStats;	}	

	hospitalizationsForDayInt(dayNumberInt) {
		var hospitalizationsInt = 0;
		for (var dayStats of this._dayStatsArray) {
			if (dayStats.dayNumberInt <= dayNumberInt && dayStats.finalHospitalDayNumberInt >= dayNumberInt) {
				hospitalizationsInt += dayStats.hospitalizationsInt;
			}
		}
		return hospitalizationsInt;
	}
}