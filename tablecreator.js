var COLUMN_FORMAT_STRING = "COLUMN_FORMAT_STRING";
var COLUMN_FORMAT_NUMBER = "COLUMN_FORMAT_NUMBER";
var COLUMN_FORMAT_PERCENT = "COLUMN_FORMAT_PERCENT";
var COLUMN_FORMAT_PERCENT_FLOAT = "COLUMN_FORMAT_PERCENT_FLOAT";

class TableHeader {
	constructor() {		
		this.columnName = null;
		this.propertyName = null;
		this.columnFormat = COLUMN_FORMAT_STRING;
		this.comparePropertyName = null;
		this.sortAscending = false;
	}
}

class TableCreator {		
	constructor(tableCreatorID, tableParentElement) {
		this.tableCreatorID = tableCreatorID;
		this.tableParentElement = tableParentElement;		
		this.reset();
		if (TableCreator.all == null) {
			TableCreator.all = [];
		}
		TableCreator.all.push(this);
	}

	reset() {
		this.headerHTML = "";
		this.dataHTML = "";
		this.tableHeaders = [];
		this.cssClass = "";
		this.topUnsortableRows = [];
		this.data = [];
	}

	static sortAndRecreateTable(tableCreatorID, comparePropertyName) {
		var tableCreator = null;
		for (var tc of TableCreator.all) {
			if (tc.tableCreatorID = tableCreatorID) {
				tableCreator = tc;
				break;
			}
		}
		if (tableCreator == null) {
			console.log("ERROR: cannot sort for table creator w/ id '" + tableCreatorID + "', table creator doesn't exist.", TableCreator.all);
			return;
		}
		tableCreator.sortData(comparePropertyName);
		
		debug("Finished sorting table creator w/ id '" + tableCreatorID + " by property '" + comparePropertyName + "'. Re-creating table.");
		tableCreator.createTable();
	}

	sortData(comparePropertyName) {
		debug("Sorting table creator w/ id '" + this.tableCreatorID + " by property '" + comparePropertyName + "'.");		
		for (var header of this.tableHeaders) {
			if (header.comparePropertyName == comparePropertyName) {
				sortItems(this.data, comparePropertyName, header.sortAscending);		
			}
		}		
	}

	createTable() {
		var html = "";
		html += "<table id='theTable' class='" + this.cssClass + "'><thead>\n";
		html += this.headerHTML;
		html += "</thead><tbody>\n";
		html += this.renderData();
		html += "</tbody></table>\n"
		this.tableParentElement.innerHTML = html;
	}

	addTableHeader(columnName, propertyName, columnFormat, comparePropertyName) {
		columnFormat = columnFormat == null ? COLUMN_FORMAT_STRING : columnFormat;
		var header = new TableHeader();
		header.columnName = columnName;
		header.propertyName = propertyName;
		if (columnFormat != null) {
			header.columnFormat = columnFormat;
		}
		header.comparePropertyName = comparePropertyName;
		this.tableHeaders.push(header);
		this.headerHTML += "<th";
		console.log("a", { blah:this.headerHTML, comparePropertyName:comparePropertyName });
		if (comparePropertyName != null) {
			this.headerHTML += " onclick=\"TableCreator.sortAndRecreateTable('" 
				+ this.tableCreatorID + "', '" + comparePropertyName + "')\"";
		}
		this.headerHTML += ">" + columnName + "</th>\n";
		return header;
	}

	renderData() {
		if (this.data == null && this.topUnsortableRows == null) {
			return "";
		}
		var html = "";
		var rows = this.topUnsortableRows.concat(this.data);
		for (var record of rows) {
			html += "<tr>";
			for (var header of this.tableHeaders) {
				var value = record[header.propertyName];
				if (value == null) {
					value = "";
				} else if (COLUMN_FORMAT_NUMBER == header.columnFormat) {
					value = value.toLocaleString();
				} else if (COLUMN_FORMAT_PERCENT == header.columnFormat) {
					value = "" + value + "%";
				} else if (COLUMN_FORMAT_PERCENT_FLOAT == header.columnFormat) {
					value = "" + (value * 100.0).toFixed(2) + "%";
				} 
				html += "<td>" + value + "</td>";
			}
			html += "</tr>\n";
		}
		return html
	}
}