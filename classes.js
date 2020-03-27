
/* js class reference: https://www.w3schools.com/js/js_classes.asp */
class CoronaSimSettings {

	constructor() {
		this.initialDate = null;
		this.simulatonDaysInt = 0;
		this.initialInfectionsInt = 0;
		this.infectionDailyIncreasePercentFloat = 0;
		this.testPercentFloat = 0;
		this.positiveTestResultPercentFloat = 0;
		this.positiveCaseDeathPercentFloat = 0;
		this.positiveCaseHospitalizedPercentFloat = 0;
		this.daysHospitalizedInt = 0;
		this.hospitalBedsInt = 0;
		this.populationInt = 0;
	}
}

class DayStats {

	/*
		fields: 

		dayStats.dayNumberInt
		dayStats.finalHospitalDayNumberInt
		dayStats.infectionsInt
		dayStats.testedInt
		dayStats.positiveTestsInt
		dayStats.hospitalizationsInt
		dayStats.deathsInt		
	*/

	constructor(dayNumberInt, totalInfectionCountSoFarInt, coronaSimSettings) {
		debug("Creating daystats.", { dayNumberInt:dayNumberInt, totalInfectionCountSoFarInt:totalInfectionCountSoFarInt,
			coronaSimSettings:coronaSimSettings });

		this._dayNumberInt = dayNumberInt;
		this._finalHospitalDayNumberInt = this._dayNumberInt + coronaSimSettings.daysHospitalizedInt;
		if (dayNumberInt == 0) {
			this._infectionsInt = totalInfectionCountSoFarInt;
		} else {
			this._infectionsInt = multiplyAndRound(totalInfectionCountSoFarInt, coronaSimSettings.infectionDailyIncreasePercentFloat);
		}
		this._testedInt = multiplyAndRound(this._infectionsInt, coronaSimSettings.testPercentFloat);
		this._positiveTestsInt = multiplyAndRound(this._testedInt, coronaSimSettings.positiveTestResultPercentFloat);
		this._hospitalizationsInt = multiplyAndRound(this._positiveTestsInt, coronaSimSettings.positiveCaseHospitalizedPercentFloat);
		this._deathsInt = multiplyAndRound(this._positiveTestsInt, coronaSimSettings.positiveCaseDeathPercentFloat);
		debug("DayStats created.", { this:this, dayNumberInt:dayNumberInt, totalInfectionCountSoFarInt:totalInfectionCountSoFarInt,
			coronaSimSettings:coronaSimSettings });
	}

	get dayNumberInt() { return this._dayNumberInt; }
	get finalHospitalDayNumberInt() { return this._finalHospitalDayNumberInt; }
	get infectionsInt() { return this._infectionsInt; }
	get testedInt() { return this._testedInt; }
	get positiveTestsInt() { return this._positiveTestsInt; }
	get hospitalizationsInt() { return this._hospitalizationsInt; }
	get deathsInt() { return this._deathsInt; }
}

class TotalStats {
	constructor() {
		this._totalDays = 0;
		this._totalInfectionsInt = 0;
		this._totalTestedInt = 0;
		this._totalPositiveTestsInt = 0;
		this._totalHospitalizationsInt = 0;
		this._totalDeathsInt = 0;
	}

	addDayStats(dayStats) {
		debug("Total stats adding daystats.", { this:this.copy(), dayStats:dayStats });
		this._totalDays += 1;
		this._totalInfectionsInt += dayStats.infectionsInt;
		this._totalTestedInt += dayStats.testedInt;
		this._totalPositiveTestsInt += dayStats.positiveTestsInt;
		this._totalHospitalizationsInt += dayStats.hospitalizationsInt;
		this._totalDeathsInt += dayStats.deathsInt;
		debug("Total stats state after adding.", { this:this.copy(), dayStats:dayStats });
	}

	copy() {
		var that = new TotalStats();
		that._totalDays = this._totalDays;
		that._totalInfectionsInt = this._totalInfectionsInt;
		that._totalTestedInt = this._totalTestedInt;
		that._totalPositiveTestsInt = this._totalPositiveTestsInt;
		that._totalHospitalizationsInt = this._totalHospitalizationsInt;
		that._totalDeathsInt = this._totalDeathsInt;
		return that;
	}

	get totalDays() { return this._totalDays; }
	get totalInfectionsInt() { return this._totalInfectionsInt; }
	get totalTestedInt() { return this._totalTestedInt; }
	get totalPositiveTestsInt() { return this._totalPositiveTestsInt; }
	get totalHospitalizationsInt() { return this._totalHospitalizationsInt; }
	get totalDeathsInt() { return this._totalDeathsInt; }
}