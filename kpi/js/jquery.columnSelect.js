//Visual Studio 2012 Intellisense activation. Ignore if not using.
///<reference path="jquery-1.8.2.min.js"/>
///<reference path="jquery.columnSelect.js"/>
/* 
jQuery plug-in to allow clicking on individual table cells (excepting the 
header and first column) and retrieving the column header and row identifier
(defined as the first cell in the row). Once a cell is selected, subsequent
selections must be from the same column to a pre-defined maximum number of 
selections. Each cell's background is highlighted according to a pre-defined
palette of background colors that cycle on a per selection click basis.

Usage: 
$("#someTable").columnSelect("init",options object);
$("#someTable").columnSelect("clear");

TODO: Make the color palette a hash map so that colors used cannot be reused
until it is removed as a selection background color.

TODO: Re-work getMetric so that having thead elements is allowed.
*/
(function ($) {
    var selectedColumn = -1;
    var numSelections = 0;
    var nextColor = 0;
    var settings;

    var methods = {
        init: function (options) {
            /* This is a function private to init method */
            function cellClick(e) {
                var d, m;
                /* Private functions to cellClick */
                function getMetric(td) {
                    ///<summary>Get the table header label for the cell</summary>
                    ///<param name="td" type="HTMLTableDataCellElement">
                    ///Selected table cell</param>
                    ///<return>The th element corresondingk to the td.</return>
                    var table = td.parentElement.parentElement;
                    var selectedColumn = td.cellIndex;
                    return table.children[0].children[selectedColumn];
                }

                function getDivision(td) {
                    ///<summary>Get the 1st column text for the cell</summary>
                    ///<param name="td" type="HTMLTableDataCellElement">
                    ///Selected table cell</param>
                    ///<return>The 1st td element in the row containing the td.
                    ///</return>
                    var tr = td.parentElement;
                    return tr.children[0];
                }

                /* Begin cellClicklogic */
                //this.nodeName == "td", e.target = "div"
                if (e.target.nodeName.toUpperCase() !== "DIV") {
                    return;
                }
                if (selectedColumn === -1) {
                    selectedColumn = this.cellIndex;
                }
                //Enforce multiple selections only in a single column.
                if (this.cellIndex !== selectedColumn) {
                    return;
                }
                if (e.target.className === "cs-select") {
                    e.target.className = "";
                    e.target.setAttribute("style", "");
                    numSelections--;
                    if (settings.removeCellClick !== undefined) {
                        //division = 1st column cell; metric = header row cell
                        d = getDivision(this);
                        m = getMetric(this);
                        settings.removeCellClick(new $.fn.columnSelect.CellSelection(
                            new $.fn.columnSelect.Division(
                                this.parentElement.rowIndex,
                                d.innerText,
                                d.getAttribute("data-division")),
                            new $.fn.columnSelect.Metric(
                                this.cellIndex,
                                m.innerText,
                                m.getAttribute("data-metric")),
                            numSelections,
                            null));  //Don't care about color on removal?
                    }
                }
                else if (numSelections < settings.maxSelections) {
                    e.target.className = "cs-select";
                    if (nextColor >= settings.palette.length) {
                        nextColor = 0;
                    }
                    var currentColor = settings.palette[nextColor];
                    nextColor++;
                    e.target.setAttribute("style", "background:" + currentColor);
                    numSelections++;
                    if (settings.addCellClick !== undefined) {
                        d = getDivision(this);
                        m = getMetric(this);
                        settings.addCellClick(new $.fn.columnSelect.CellSelection(
                            new $.fn.columnSelect.Division(
                                this.parentElement.rowIndex,
                                d.innerText,
                                d.getAttribute("data-division")),
                            new $.fn.columnSelect.Metric(
                                this.cellIndex,
                                m.innerText,
                                m.getAttribute("data-metric")),
                            numSelections,
                            currentColor));
                    }
                }
                //Unlock column restrictions when selections are zero.
                if (numSelections === 0) {
                    selectedColumn = -1;
                }
            } //end cellClick

            /* Begin init functionality */
            //this = TABLE element
            settings = $.extend({}, $.fn.columnSelect.defaults, options);

            /* Ignore first column because those are not selectable. */
            var clickableCells = this.find("tr td:not(:first-child)");
            clickableCells.wrapInner("<div>");
            clickableCells.on("click", cellClick);
            return this;
        },
        clear: function () {
            numSelections = 0;
            nextColor = 0;
            selectedColumn = -1;
            var decorated = this.find("tr td:not(:first-child) div");
            decorated.removeClass("cs-select");
            decorated.css("background", "");
        }
    };

    $.fn.columnSelect = function (method) {
        //"this" is supposed to be a table element so stop processing if not
        var tag = this.prop("nodeName");
        if (tag !== "TABLE") {
            console.warn("Warning: The selected element type was " + tag +
                ". jquery.columnSelect only works with TABLE. No action " +
                "performed.");
            return this;
        }
        /* Check for plug-in public method invocation. */
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        }
        $.error("Method " + method + " does not exist in columnSelect");
        return this;
    };

    $.fn.columnSelect.CellSelection = function (division, metric,
                                                selectionCount, selectionColor) {
        this.division = division;
        this.metric = metric;
        this.numSelections = selectionCount;
        this.selectionColor = selectionColor;
    };

    $.fn.columnSelect.CellSelection.prototype = {
        constructor: $.fn.columnSelect.CellSelection,
        getDivision: function () { return this.division; },
        getMetric: function () { return this.metric; },
        getNumSelections: function () { return this.numSelections; },
        //Use to transfer color to graph. 
        getSelectionColor: function () { return this.selectionColor; },
        toString: function () {
            return this.division.toString() + ", " + this.metric.toString() +
                    ", numSelections=" + this.numSelections;
        }
    };

    $.fn.columnSelect.Metric = function (index, text, data) {
        this.text = text;
        this.data = data;
        this.index = index;
    };

    $.fn.columnSelect.Metric.prototype = {
        constructor: $.fn.columnSelect.Metric,
        toString: function () {
            return "[Metric text=" + this.text + ", data=" + this.data + ", index=" + this.index + "]";
        }
    };

    $.fn.columnSelect.Division = function (index, text, data) {
        this.text = text;
        this.data = data;
        this.index = index;
    };

    $.fn.columnSelect.Division.prototype = {
        constructor: $.fn.columnSelect.Division,
        toString: function () {
            return "[Division text=" + this.text + ", data=" + this.data + ", index=" + this.index + "]";
        }
    };

    $.fn.columnSelect.defaults = {
        "palette": ["#008000", "#b6ff00", "#00ff21"],
        "maxSelections": 3,
        "addCellClick": undefined,
        "removeCellClick": undefined
    };
})(jQuery);
