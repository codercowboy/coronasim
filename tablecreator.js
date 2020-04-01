/* source for sortTable(): https://www.w3schools.com/howto/howto_js_sort_table.asp */
function sortTable(n, tableid, columnFormat) {
	console.log("not sorting");
	return;
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(tableid);
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc"; 
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/    
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;      
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}


var COLUMN_FORMAT_STRING = "COLUMN_FORMAT_STRING";
var COLUMN_FORMAT_NUMBER = "COLUMN_FORMAT_NUMBER";
var COLUMN_FORMAT_PERCENT = "COLUMN_FORMAT_PERCENT";
var COLUMN_FORMAT_PERCENT_FLOAT = "COLUMN_FORMAT_PERCENT_FLOAT";

class TableHeader {
	get columnName() { return this._columnName; }
	set columnName(x) { return this._columnName = x; }
	get propertyName() { return this._propertyName; }
	set propertyName(x) { return this._propertyName = x; }
	get columnFormat() { return this._columnFormat; }
	set columnFormat(x) { return this._columnFormat = x; }
}

class TableCreator {	
	
	constructor() {
		this.headerHTML = "";
		this.dataHTML = "";
		this.tableHeaders = [];
		this.cssClass = "";
		this.data = [];
	}

	createTable() {
		var html = "";
		html += "<table id='theTable' class='" + this.cssClass + "'><thead>\n";
		//add headers
		html += this.headerHTML;
		html += "</thead><tbody>\n";
		html += this.renderData();
		html += "</tbody></table>\n"
		return html;
	}

	addTableHeader(columnName, propertyName) {
		this.addTableHeader(columnName, propertyName, null, propertyName);
	}

	addTableHeader(columnName, propertyName, columnFormat, comparePropertyName) {
		columnFormat = columnFormat == null ? COLUMN_FORMAT_STRING : columnFormat;
		var header = new TableHeader();
		header.columnName = columnName;
		header.propertyName = propertyName;
		header.columnFormat = columnFormat;
		this.tableHeaders.push(header);
		this.headerHTML += "<th onclick=\"sortTable(" + this.tableHeaders.length + ", 'theTable')\">" + columnName + "</th>\n";
		return header;
	}

	renderData() {
		if (this.data == null) {
			return "";
		}
		var html = "";
		for (var record of this.data) {
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