//Visual Studio 2012 Intellisense activation. Ignore if not using.
///<reference path="jquery-1.8.2.min.js"/>
///<reference path="acmodel.js"/>
///<reference path="acfactory.js"/>
///<reference path="acviews.js"/>
///<reference path="backbone-min.js"/>
///<reference path="highcharts.js"/>
///<reference path="jquery.columnSelect.js"/>
/* Load acmodel.js before this. */
var xEvent;
var TOUCH_START = "touchstart";
var TOUCH_MOVE = "touchmove";
var TOUCH_END = "touchend";
var CLICK = "click";

$(document).ready(function () {
    //xEvent = navigator.userAgent.match(/iPad/i) ? TOUCH_END : CLICK;
    //Switching to touch_end caused checkboxes to fire an event before
    //the state of the checkbox actually switches. So things look true, but
    //fired false. Beware!
    xEvent = CLICK;
    $("#startLink").on(xEvent, function (e) {
        $("#startScreen").addClass("#startScreen slideUp");
        e.stopPropagation();
    });
    $("body").on(xEvent, acapp.closePopUps);
    acapp.registerDataRoutes($("#topNav"));
    acapp.registerDataRoutes($("#leftNav"));
    acapp.registerDataRoutes($("#perfMenu"));
    var appRouter = new acapp.MainRouter();
});

acapp.THEME_FINANCE = "finance";
acapp.THEME_PRODUCTIVITY = "productivity";
acapp.THEME_STANDARD = "standard";
acapp.THEME_ALERT = "alerts";
acapp.APPWRAPPER_EL = "#wrapper";
acapp.CONTAINER_EL = "#contentContainer";
acapp.CONTEXT_EL = "#contextPanel";
acapp.PRESENTATION_EL = "#presentationContainer";
acapp.comparisonChart = null; //TODO: Make this part of the view instead of global
acapp.compareOptions = new Array();
acapp.compareView = null;
acapp.contextView = null;
acapp.currentTheme = acapp.THEME_STANDARD;
acapp.dateFilterView = null;
acapp.hierarchyBreadCrumbs = null;
acapp.hierarchyNode = null;
acapp.hierarchyView = null;
acapp.payerBreadCrumbs = null;
acapp.payerFilterView = null;
acapp.payerNode = null;
acapp.financialChartCollection = null;  //Use in overall dashboard
acapp.financialContext = null;
acapp.financialDashCollection = null; //For use in financial dashboard
acapp.financialView = null;
acapp.printView = null;
acapp.printChartCollection = null; //Order for presentation mode
acapp.printCustomizerView = null;
acapp.productivityCollection = null;
acapp.productivityView = null;
acapp.overallDashboardView = null;
acapp.templateCache = null;

acapp.closePopUps = function (e) {
    $("#perfMenu").hide();
    $("#menuLink").removeClass("#leftNav active");
}

acapp.getTemplate = function (templateFile) {
    ///<summary>Load and cache jqote2 templates or html fragments used by 
    ///this app as partial pages.</summary>
    ///<param name="templateFile">The full path to the template to load.</param>
    ///<return>A jquery object representing the script element containing
    ///the template.</return>
    if (this.templateCache == null) {
        this.templateCache = {};
    }

    if (!this.templateCache[templateFile]) {
        var templateContent = "";
        $.ajax({
            url: templateFile,
            method: "GET",
            async: false, //Warning: Blocking call!
            contentType: "html",
            success: function (data) {
                templateContent = data;
            }
        });
        this.templateCache[templateFile] = templateContent;
    }
    return $(this.templateCache[templateFile]); //jQuery-ize
}

acapp.createTransitionEndHandler = function (transitionE, transitionEndFunc) {
    ///<summary>Cross browser CSS3 transition end event handler</summary>
    ///<param name="element">The element on which the transitioning is happening</param>
    ///<param name="transitionEndFunc">The function to execute when the 
    ///transition has finished.</param>
    transitionE.on("msTransitionEnd", transitionEndFunc);
    transitionE.on("transitionend", transitionEndFunc);
    transitionE.on("webkitTransitionEnd", transitionEndFunc);
};

/* The handler functions to events added at registerDataRoutes function. */
acapp.dataRoutes = {
    applyHierarchyFilter: function (anchorEl) {
        this.resetTabs();
        $("#filterPanel").removeClass("#filterPanel slideDown");
    },
    contractSidebar: function (anchorEl) {
        $("#mainDisplay").removeClass("#mainDisplay slideOutLeft");
        $(".hideLink").hide();
    },
    chartOn: function (anchorEl) {
        var section = anchorEl.attributes["data-section"].value;
        var chartType = anchorEl.attributes["data-kpitype"].value;
        var chart = $("#" + section + "Chart");
        var table = $("#" + section + "Table");
        if (section === "main") {
            $("#primary .card").removeClass("flipped");
        }
        else {
            $("#secondary .card").removeClass("flipped");
        }
        table.hide();
        chart.show();
        var chartControls = $("#" + section + "ChartControls");
        //Find the link that called this function
        chartControls.find(".chartTableToggle a[data-route=\"chartOn\"]").parent().toggleClass("active");
        chartControls.find(".chartTableToggle a[data-route=\"tableOn\"]").parent().toggleClass("active");
        //kludge to get highcharts to redraw and find new size.
        $(window).resize();
    },
    /* Clicking on anything else besides the actual highcharts graph in a
    ChartTile calls this function. */
    chartDivClick: function (chartDiv) {
        acapp.dataRoutes.chartTileClick(chartDiv.attributes["data-choice"].value);
    },
    /* Handle a click on the highcharts graph in the ChartTile. This needs to
    be a separate event handler from chartDivClick because highcharts does not
    pass click events to its parent container. */
    chartTileClick: function (chartId) {
        var theme = acapp.currentTheme;
        acapp.MainRouter.prototype.navigate("section/" + theme + "/" + chartId, { trigger: true });
        acapp.closePopUps();
    },
    dateFilter: function (anchorEl) {
        this.resetTabs();
        $("#topNav").addClass("#topNav filterOpen");
        $("#dateTab").addClass("#functionBar selectedTab");
        $("#payerTab").addClass("#functionBar dashBottom");
        $("#divisionTab").addClass("#functionBar dashBottom");
        var filterPanel = $("#filterPanel");
        filterPanel.addClass("#filterPanel slideDown");
        $("#filterPanel .filterContainer").hide();
        acapp.dateFilterView.render();

    },
    denialSwitch: function (anchorEl) {
        var section = anchorEl.attributes["data-section"].value;
        var currentChart = anchorEl.attributes["data-currentChart"].value;
        var newChart = anchorEl.attributes["data-newChart"].value;
        acapp.financialView.replaceChartInViewport(currentChart, newChart);
        //Horribly hacky way of switching states on nav pills. Should redo
        //to something generic.
        var chartControls = $("#" + section + "ChartControls");
        chartControls.find(".specificControls li").removeClass("active");
        chartControls.find(".specificControls a[data-newchart=\"" + newChart + "\"]").parent().addClass("active");
    },
    exitPrintPreview: function (anchorEl) {
        //Re-enable the app interface.
        /* There are occasions (~ 1 in 10) when the charts in the overall
        dashboard are sized improperly when this is re-shown. One solution 
        would be to regenerate the contentContainer contents. */
        $(acapp.APPWRAPPER_EL).show();
        acapp.overallDashboardView.render();
        acapp.printView.exitPrintMode();
        $(acapp.PRESENTATION_EL).hide();
    },
    financialKpiChange: function (inputEl) {
        ///<summary>All checkboxes in Kpi financial sub-panel lead to here.</summary>
        ///<param name="inputEl" type="HTMLInputElement">The input element 
        ///(un)checked.</param>
        //Iterate SummaryCharts and look for SummaryChart.id = inputEl.value
        var m = acapp.financialChartCollection.get(inputEl.value);
        //OverallDashboardView gets a chance to re-render.
        m.show(inputEl.checked);
        acapp.financialChartCollection.trigger("toggle");
        console.log("[financialKpiChange] m.id=" + m.get("id") +
                    " m.show=" + m.get("show"));
    },
    hierarchyFilter: function (anchorEl) {
        this.resetTabs();
        $("#topNav").addClass("#topNav filterOpen");
        $("#divisionTab").addClass("#functionBar selectedTab");
        $("#filterPanel").addClass("#filterPanel slideDown");
        $("#filterPanel .filterContainer").hide();
        acapp.hierarchyView.render();
    },
    openPerformanceMenu: function (anchorEl, e) {
        $("#perfMenu").toggle();
        e.stopPropagation();
    },
    openPrintDialog: function (anchorEl) {
        window.print();
    },
    payerFilter: function (anchorEl) {
        this.resetTabs();
        $("#topNav").addClass("#topNav filterOpen");
        $("#dateTab").addClass("#functionBar dashBottom");
        $("#payerTab").addClass("#functionBar selectedTab");
        $("#divisionTab").addClass("#functionBar dashBottom");
        $("#filterPanel").addClass("#filterPanel slideDown");
        $("#filterPanel .filterContainer").hide();
        acapp.payerFilterView.render();
    },
    perfMenuSelect: function (anchorEl, e) {
        e.stopPropagation();
    },
    presentationControlItemChange: function (inputEl) {
        var m = acapp.printChartCollection.get(inputEl.value);
        //OverallDashboardView gets a chance to re-render.
        m.show(inputEl.checked);
        //Throw printChartCollection into a PresentationView and render it
    },
    printPreviewTitleClick: function (anchorEl) {
        var modelId = anchorEl.attributes["data-modelId"].value;
        var checkboxId = "#checkbox_" + modelId;
        var checkboxEl = $(checkboxId);
        if (checkboxEl.is(":checked")) {
            $(checkboxId).prop("checked", false);
            acapp.printView.removeChart(modelId);
        }
        else {
            $(checkboxId).prop("checked", true);
            acapp.printView.renderChart(modelId);
        }
    },
    resetTabs: function () {
        ///<summary>Look and feel adjustments to the tabs</summary>
        $("#functionBar .filterTab").removeClass("#functionBar dashBottom");
        $("#functionBar .selectedTab").removeClass("#functionBar selectedTab");
        $("#topNav").removeClass("#topNav filterOpen");
    },
    startPrintPreview: function (anchorEl) {
        acapp.printView = new acapp.PrintView({
            collection:acapp.printChartCollection
        });
        acapp.printView.render();
        $(acapp.PRESENTATION_EL).show();
        //Hide app interface to prevent it from printing.
        $(acapp.APPWRAPPER_EL).hide();
    },
    tableOn: function (anchorEl) {
        var section = anchorEl.attributes["data-section"].value;
        var chartType = anchorEl.attributes["data-kpitype"].value;
        var chart = $("#" + section + "Chart");
        var table = $("#" + section + "Table");
        chart.hide();
        //Get the chart type from the anchorEl data-kpiType attribute.
        table.empty().append(acapp.DataFactory.createTable(chartType));
        table.show();
        if (section === "main") {
            $("#primary .card").addClass("flipped");
        }
        else {
            $("#secondary .card").addClass("flipped");
        }
        var chartControls = $("#" + section + "ChartControls");
        chartControls.find(".chartTableToggle a[data-route=\"chartOn\"]").parent().toggleClass("active");
        chartControls.find(".chartTableToggle a[data-route=\"tableOn\"]").parent().toggleClass("active");

    },
    toggleKpiOrder: function (anchorEl) {
        acapp.contextView.render();
        this.toggleSidebar(anchorEl);
    },
    togglePreview: function (inputEl) {
        console.info("[acapp.togglePreview] " + inputEl.value+" checked="+inputEl.checked);
        if (inputEl.checked) {
            acapp.printView.renderChart(inputEl.value);
        }
        else {
            acapp.printView.removeChart(inputEl.value);
        }
    },
    toggleSidebar: function (anchorEl) {
        var mainDisplay = $("#mainDisplay");
        var opened = mainDisplay.hasClass("#mainDisplay slideOutRight");
        if (opened) {
            mainDisplay.removeClass("#mainDisplay slideOutRight");
            $(".hideLink").hide();
        }
        else {
            mainDisplay.addClass("#mainDisplay slideOutRight");
            $(".hideLink").show();
        }
    }
};

acapp.registerDataRoutes = function (containerEl) {
    ///<summary>Set up calls to functions in the link route registry. Run this
    ///when a partial view is loaded with clickable actions.</summary>
    ///<param name="containerEl" type="jquery node">The element to traverse to 
    ///look for data-route attributes.</param>
    //Look at every element in containerEl and add a click function. 
    containerEl.find("[data-route]").each(function (index) {
        $(this).off(xEvent).on(xEvent, function (e) {
            var attr = this.attributes["data-route"];
            var dataRoute = null;
            if (attr) {
                dataRoute = attr.value;
            }
            //If data-route function is in acapp.dataRoutes object then invoke it.
            if (dataRoute && acapp.dataRoutes[dataRoute]) {
                acapp.dataRoutes[dataRoute](this, e); //this=anchor element
            }
        });
    });
}

/* Backbone Section */

/* Important: router functions only called when navigating to different 
url from the current page. Do not rely on router functions to behave as a 
click event handler expecting a routing function call every click. */
acapp.MainRouter = Backbone.Router.extend({
    //Be sure to prefix a hash to the href in the html since no server support.
    routes: {
        /* localhost/ */
        "": "home",
        "kpis/:theme": "home",
        "section/:theme/:chart": "section",
        /* localhost/#screen/KPIs */
        "*catchall": "defaultRoute"
    },
    initialize: function (options) {
        if (options && options.model) {
            this.model = options.model;
        }
        Backbone.history.start();
        acapp.printChartCollection =
            acapp.DataFactory.createKpiCollection(acapp.THEME_PRINT);
    },
    defaultRoute: function (catchall) {
        ///<summary>Do not use. Unaccounted for routes go here.</summary>
        console.log("[MainRouter.defaultRoute] Routed to: " + catchall);
    },
    home: function (theme) {
        //Set is undefined by going straight to this page. 
        if (theme === undefined) {
            theme = acapp.THEME_STANDARD;
        }
        acapp.closePopUps();
        acapp.currentTheme = theme;
        console.log("[MainRouter.home] theme=" + acapp.currentTheme);
        /* Things get weird with the binding to the financialChartCollection if we
        just make an new one and set it in the already instantiated 
        overallDashboardview. The scope of "this" in the OverallDashboardView 
        gets changed. No time to figure it out so just re-instantiate for now. */
        acapp.financialChartCollection = acapp.DataFactory.createKpiCollection(theme);

        acapp.overallDashboardView = new acapp.OverallDashboardView({
            collection: acapp.financialChartCollection,
            theme: acapp.currentTheme
        });

        acapp.overallDashboardView.render();

        acapp.contextView = new acapp.KpiContextView({
            collection: acapp.financialChartCollection
        });

        //Add in the kpi context panel.
        //acapp.contextView.render();
        /* Setup the practice hierarchy filter views  */
        if (acapp.hierarchyBreadCrumbs === null) {
            acapp.hierarchyNode = new acapp.HierarchyNode({
                nodes: [acapp.PRACTICE_HIERARCHY.root.name]
            });
            acapp.hierarchyBreadCrumbs = new acapp.HierarchyBreadCrumbView({
                el: "#hierarchyLink",
                model: acapp.hierarchyNode
            });
            acapp.hierarchyBreadCrumbs.render();
        }

        if (acapp.hierarchyView === null) {
            acapp.hierarchyView = new acapp.HierarchyFilterView({
                crumbs: acapp.hierarchyBreadCrumbs,
                hierarchy: acapp.PRACTICE_HIERARCHY,
                model: acapp.hierarchyNode
            });
        }
        /* Setup the payer hierarchy filter views  */
        if (acapp.payerBreadCrumbs === null) {
            acapp.payerNode = new acapp.HierarchyNode({
                nodes: [acapp.PAYER_HIERARCHY.root.name]
            });
            acapp.payerBreadCrumbs = new acapp.HierarchyBreadCrumbView({
                el: "#payerLink",
                model: acapp.payerNode
            });
            acapp.payerBreadCrumbs.render();
        }

        if (acapp.payerFilterView === null) {
            acapp.payerFilterView = new acapp.HierarchyView({
                crumbs: acapp.payerBreadCrumbs,
                el: "#payerFilterColumns",
                hierarchy: acapp.PAYER_HIERARCHY,
                model: acapp.payerNode
            });
        }

        /* Set up date filter view */
        if (acapp.dateFilterView === null) {
            acapp.dateFilterView = new acapp.DateFilterView();
            $("#dateLink").text("Prior 24 Months");
        }
        acapp.registerDataRoutes($("#filterPanel"));
    },
    section: function (theme, chart) {
        console.info("[MainRouter.sectionChange] " + theme + ", " + chart);
        acapp.closePopUps();
        /* Empty out context panel and main content area */
        $(acapp.CONTAINER_EL).empty();
        acapp.dataRoutes.contractSidebar();
        if (acapp.financialView === null) {
            acapp.financialView = new acapp.FinancialDashboardView({
                chartType: chart,
                theme: theme
            });
        }
        else {
            acapp.financialView.setChartType(chart);
            acapp.financialView.setTheme(theme);
        }
        if (acapp.financialContext === null) {
            acapp.financialContext = new acapp.FinanceContextView();
        }
        acapp.financialContext.render();
        acapp.financialView.render();
        acapp.registerDataRoutes($(acapp.CONTAINER_EL));
    }
});