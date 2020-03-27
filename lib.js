'use strict';

var debugMode = true;

var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
var thousand = 1000;
var million = thousand * 1000;
var billion = million * 1000;
var trillion = billion * 1000;

function printDayShort(date) {
	var result = months[date.getUTCMonth()] + " " + date.getUTCDate() + " " + (date.getUTCFullYear());
	// debug("printDayShort: " + date + " -> " + result, null);
	return result;
}

function el(elementId) {
	return document.getElementById(elementId);
}

function getQueryParameterFromURL(paramName) {
	var url = new URL(window.location);	
	var searchParams = new URLSearchParams(url.search);
	console.log("url", searchParams.keys());
	return searchParams.get(paramName);
}

function loadWebResource(docName, resultHandler) {
	debug("loadWebResource loading: " + docName);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			debug("loadWebResource loaded: " + docName);
			resultHandler(this.responseText);
		}
	};
	xhttp.open("GET", docName, true);
	xhttp.send();
}	

function printNumberShort(number) {	
	number = Math.floor(number);
	var numberToCheck = number < 0 ? (number * -1) : number;
	var result = 0;
	if (numberToCheck >= trillion) {
		number = (number / (trillion * 1.0)) 
		result = number.toFixed(2) + "t";
	} else if (numberToCheck >= billion) {
		number = (number / (billion * 1.0)) 
		result =  number.toFixed(2) + "b";
	} else if (numberToCheck >= million) {
		number = (number / (million * 1.0)) 
		result =  number.toFixed(2) + "m";
	} else if (numberToCheck < 10000) {
		result =  number.toLocaleString();
	} else if (numberToCheck >= thousand) {
		number = (number / (thousand * 1.0)) 
		result =  Math.floor(number) + "k";
	} else {
		result = number.toLocaleString();
	}
	// debug("printNumberShort " + number.toLocaleString() + " -> " + result);
	return result;
}

function debug(message, details) {
	if (debugMode) {
		if (details == null) {
			console.log(message);
		} else {
			console.log(message, details);
		}
	}
}

//from: https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-Int-or-integer
function isInteger(x) { 
	return typeof x === "number" && isFinite(x) && Math.floor(x) === x; 
}
//from: https://stackoverflow.com/questions/3885817/how-do-i-check-that-a-number-is-Int-or-integer
function isFloat(x) { 
	return !!(x % 1); 
}

/* numberInt = 100, percentFloat = 25.0 (ie 25%), answer = 25 */
function multiplyAndRound(numberInt, percentFloat) {
	if (!isInteger(numberInt)) {
		console.log("multiplyAndRound error, numberInt is not an integer: " + numberInt);
		console.trace();
		return null;
	}
	if (!isFloat(percentFloat) && !isInteger(percentFloat)) {
		console.log("multiplyAndRound error, percentFloat is not a float or integer: " + percentFloat);
		console.trace();
		return null;
	}
	var result = (numberInt * 1.0) * ((percentFloat * 1.0) / 100.0);
	var flooredResult = Math.floor(result);
	// debug("Result of multiply, numberInt: " + numberInt + ", percentFloat: " + percentFloat 
	// 	+ ", result: " + result + ", flooredResult: " + flooredResult);
	return flooredResult;
}

function getPercentage(currentValueInt, maxValueInt) {	
	return Math.round(getPercentageFloat(currentValueInt, maxValueInt) * 100.0);
}

function getPercentageFloat(currentValueInt, maxValueInt) {
	if (!isInteger(currentValueInt)) {
		console.log("getPercentage error, currentValueInt is not an integer: " + currentValueInt);
		console.trace();
		return null;
	}
	if (!isInteger(maxValueInt)) {
		console.log("getPercentage error, maxValueInt is not an integer: " + maxValueInt);
		console.trace();
		return null;
	}
	var result = (currentValueInt * 1.0) / (maxValueInt * 1.0);
	// debug("Result of percentage, currentValueInt: " + currentValueInt + ", maxValueInt: " + maxValueInt + ", result: " + result);
	return result;
}

function incrementDate(date, dayCountInt) {
	var d = new Date(date.getTime());
	d.setUTCDate(d.getUTCDate() + dayCountInt);
	// debug("Incremented date: " + date + " by " + dayCountInt + ": " + d);
	return d;
}

function getSliderValue(sliderId) {
	var slider = el(sliderId);

	if (slider.getAttribute("format") == "percentage") {
		return ((slider.valueAsNumber * 1.0) / 10.0);
	}

	var scaleControl = el(slider.getAttribute("scaleControl"));
	var multiplier = 1;
	if (scaleControl != null) {
		if (scaleControl.value == "Billion") {
			multiplier = billion;
		} else if (scaleControl.value == "Million") {
			multiplier = million;
		} else if (scaleControl.value == "Thousand") {
			multiplier = thousand;
		}
	}	
	return slider.valueAsNumber * multiplier;	
}

function updateSliderLabel(slider) {
	var sliderValue = getSliderValue(slider.id);
	var text = slider.previousElementSibling.innerText;
	if (text.indexOf(" [") != -1) {
		text = text.substr(0, text.indexOf(" ["));
	}
	
	if (slider.getAttribute("format") == "percentage") {
		text += " [" + sliderValue + "%]";
	} else {
		text += " [" + sliderValue.toLocaleString() + "]";
		if (sliderValue > (100 * thousand)) {
			text += " (" + printNumberShort(sliderValue) + ")";
		}
	}
	slider.previousElementSibling.innerText = text;
}

function populateTemplate(template, dayStats, totalStats, currentHospitalizedInt, coronaSimSettings) {
	var value = "";
	var percentage = "";

	var templateCopy = template;

	var rowDate = incrementDate(coronaSimSettings.initialDate, dayStats.dayNumberInt);
	value = "#" + dayStats.dayNumberInt + ": "  + printDayShort(rowDate);
	templateCopy = templateCopy.replace("${day}", value);

	value = "" + printNumberShort(dayStats.infectionsInt) + " new today.";
	templateCopy = templateCopy.replace("${infectionsToday}", value);

	value = "" + printNumberShort(dayStats.testedInt) + " new today, ";
	value += printNumberShort(dayStats.positiveTestsInt) + " tested positive.";
	templateCopy = templateCopy.replace("${testResultsToday}", value);

	value = "" + printNumberShort(dayStats.hospitalizationsInt) + " of today's infections need to be hospitalized, ";
	value += printNumberShort(dayStats.deathsInt) + " will die.";
	templateCopy = templateCopy.replace("${mortalityToday}", value);


	var bedsUsed = currentHospitalizedInt;
	var bedsFree = coronaSimSettings.hospitalBedsInt - bedsUsed;
	percentage = " (" + getPercentage(bedsUsed, coronaSimSettings.hospitalBedsInt) + "%)";		
	value = "" + printNumberShort(bedsUsed) + percentage + " used, ";
	percentage = " (" + getPercentage(bedsFree, coronaSimSettings.hospitalBedsInt) + "%)";
	value += printNumberShort(bedsFree) + percentage + " free.";
	if (bedsFree < 0) {
		value = "<span style='color:red;'>" + value + "</span>";
	}
	templateCopy = templateCopy.replace("${hospitalBedsToday}", value);

	value = "" + printNumberShort(totalStats.totalInfectionsInt) + " infected, ";
	value += printNumberShort(totalStats.totalTestedInt) + " tested, ";
	value += printNumberShort(totalStats.totalPositiveTestsInt) + " tested positive, ";	
	var survivors = totalStats.totalInfectionsInt - totalStats.totalDeathsInt;
	value += printNumberShort(survivors) + " survivors, ";
	value += printNumberShort(totalStats.totalDeathsInt) + " deaths.";
	templateCopy = templateCopy.replace("${totals}", value);

	return templateCopy;
}

function generateSimulationOutput(template, coronaSimSettings) {
	var simulator = new CoronaSimulator(coronaSimSettings);
	
	var tableDataArray = [];

	//add first day's stats
	tableDataArray.push({
		dayStats: simulator.currentDayStats,
		totalStats: simulator.totalStats.copy(),
		currentHospitalizedInt: simulator.hospitalizationsForDayInt(simulator.currentDayInt),
	});
	for (var i = 0; i < coronaSimSettings.simulatonDaysInt; i++) {
		simulator.moveForwardOneDay();				
		tableDataArray.push({
			dayStats: simulator.currentDayStats,
			totalStats: simulator.totalStats.copy(),
			currentHospitalizedInt: simulator.hospitalizationsForDayInt(simulator.currentDayInt),
		});
		var totalInfections = simulator.totalStats.totalInfectionsInt;
		if (totalInfections > coronaSimSettings.populationInt) {
			console.log("stopping simulation, hit population limit: " + totalInfections.toLocaleString());
			break;
		}
	}
	var html = "<div class='testResults'>\n";
	for (var tableEntry of tableDataArray) {
		html += populateTemplate(template, tableEntry.dayStats, tableEntry.totalStats, 
			tableEntry.currentHospitalizedInt, coronaSimSettings);
	}		
	html += "\n</div>";
	return html;
}