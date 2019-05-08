//Visual Studio 2012 Intellisense activation. Ignore if not using.
///<reference path="jquery-1.8.2.min.js"/>
///<reference path="acfactory.js"/>
///<reference path="acmodel.js"/>
///<reference path="acapp.js"/>
///<reference path="backbone-min.js"/>
///<reference path="highcharts.js"/>
///<reference path="jquery.columnSelect.js"/>
acapp.KPI_CONTROL_PANEL = "partial/kpiPanel.html";
acapp.KPI_CONTROLS_TPL = "partial/kpiControls.html";
acapp.FINANCE_CONTROL_PANEL = "partial/financePanel.html";
acapp.COMPARISON_TPL = "template/comparisonDetail.html";
acapp.FINANCE_DASHBOARD_TPL = "partial/financeDash.html";
acapp.OVERALL_DASHBOARD_TPL = "partial/overallDash.html";
acapp.OVERALL_CONTEXT_TPL = "template/kpiControlItem.html";
acapp.PRINT_CHART_TPL = "template/printChart.html";
acapp.PRINT_CONTROLS_TPL = "partial/printControls.html";
acapp.PRINT_CONTROL_ITEM_TPL = "template/presentationControlItem.html";
acapp.PRINT_MODE_TPL = "partial/presentationScreen.html";
acapp.PRINT_PREVIEW_ITEM_TPL = "template/printPreviewItem.html";
acapp.FINANCE_CONTEXT_TPL = "template/financialComparisonItem.html";
acapp.DATE_FILTER_TPL = "partial/dateFilter.html";
acapp.HIERARCHY_FILTER_TPL = "partial/hierarchyFilter.html";
acapp.NAV_TOGGLE_EVENT = "NavButtonToggle";

/* Responsible for building the overall dashboard */
acapp.OverallDashboardView = Backbone.View.extend({
    initialize: function (options ) {
        //TODO: On reorder the collection is re-rendered but events are lost
        //because we don't re-register dataROutes.
        this.collection.on("reorder", this.render);
        this.collection.on("toggle", this.render);
        this.theme = options.theme;
        this.view = this;
        $("#menuLink").on(xEvent, function (e) {
            $(this).addClass("#leftNav active");
        });
    },
    setCollection: function (collection) {
        this.collection = collection;
        this.collection.on("reorder", this.render);
        this.collection.on("toggle", this.render);
    },
    render: function () {
        var tpl = acapp.getTemplate(acapp.OVERALL_DASHBOARD_TPL);
        $(acapp.CONTAINER_EL).empty().append(tpl);
        /* Iterate and render each SummaryChart's view. The first 2 charts in 
        a section are always large. We really need the SummaryChartCollection
        to exist within a collection of dashboard sections. */
        var count = 0;
        this.view.collection.forEach(function (cmodel) {
            //Only draw KPIs that are on.
            //alert(cmodel.get("id")+" show="+cmodel.get("show"));
            if (cmodel.get("show")) {
                if (count < 2) {
                    cmodel.set("format", "large");
                }
                else {
                    cmodel.set("format", "small");
                }
                var chart = new acapp.KpiChartView({
                    model: cmodel,
                    el: "#cFinanceCharts"
                });
                chart.render();
                count++;
            }
        }); //end forEach
        /* Register content container last so all templating complete. */
        acapp.registerDataRoutes($(acapp.CONTAINER_EL));
    }
});

/* View for each individual chart tile. */
acapp.KpiChartView = Backbone.View.extend({
    initialize: function () {
        //Assuming the model is set we listen for changes. 
        //this -> acapp.KpisView
        //this.model.on("change:data", this.modelChange);
        //Assign reference of view to model so we can reference in modelChange
        //Alternately, do this in a closure here in initialize.
        this.view = this;
    },
    events: {
        "click .kpiButton": "goToDetail"
    },
    chartClick: function (e, dataChoice) {
        /* Convoluted callback courtesy of highcharts not propagating events to
        its parent container. */
        e.data = dataChoice;
        acapp.dataRoutes.chartTileClick(this.model.get("id"));
    },
    goToDetail: function (e) {
        acapp.dataRoutes.chartTileClick(this.model.get("id"));
    },
    render: function () {
        /* If a KPI tile is a generic thing that only has a small/large size 
        common property then each model should be emitting HTML fragments? 
        Alternately we have some introspection here on the model and depending
        on type we go for a separate HTML block/template. */
        //Inspect each model type and instantiate a View for that type
        var obj = this.model.toTemplateObject();
        var tpl;
        var format = this.model.get("format");
        if (format === "small") {
            tpl = acapp.getTemplate(this.model.get("smallView"));
        }
        else {
            tpl = acapp.getTemplate(this.model.get("largeView"));
        }
        this.$el.append(tpl.jqote(obj));
        //Generate a Highcharts configuration 
        var chartConfig = acapp.ChartFactory.createNavButtonChart(this.model, this.view)
        if (format === "large") {
            chartConfig = acapp.ChartFactory.bigify(this.model, chartConfig);
        }
        else {
            chartConfig = acapp.ChartFactory.weeify(this.model, chartConfig);
        }
        //Evaluate whether metric is in/out of target
        if (!this.model.get("inTarget")) {
            //Make metric text orange
            var chartDivId = "#nav_" + this.model.get("chartType");
            var currentMetricEl = $(chartDivId + " h3");
            if (format === "large") {
                currentMetricEl.removeClass("upMetric");
                currentMetricEl.addClass("downMetric");
            }
            else {
                currentMetricEl.removeClass("upMetricS");
                currentMetricEl.addClass("downMetricS");
            }
        }
        var chart = new Highcharts.Chart(chartConfig);
    } //end render
});

/* This overall dashboard context panel view.  */
acapp.KpiContextView = Backbone.View.extend({
    initialize: function () {
        //Assuming the model is set we listen for changes. 
        //this -> acapp.KpiContextView
        //this.collection.on("change:data", this.collectionChange);
        //Assign reference of view to model so we can reference in modelChange
        //Alternately, do this in a closure here in initialize.
        this.collection.view = this;
        /* Loading the template on init instead of render to get the bottom
        right icons rendered and attached to listeners. Better to move the 
        icons to a separate sub-view to keep consistent with the paradigm of
        a each view renders from its own template. */
        var tpl = acapp.getTemplate(acapp.KPI_CONTROL_PANEL);
        $(acapp.CONTEXT_EL).empty().append(tpl);
        acapp.registerDataRoutes($(acapp.CONTEXT_EL));
    },
    render: function () {
        var inst = this.collection.view;
        /* Since presentation mode just reuses the context area for overall
        dashboard view we are emptying the list instead of reloading a whole
        new template. Reloading is probably more consistent with the rest of
        this application. TODO thing? */
        var tpl = acapp.getTemplate(acapp.KPI_CONTROLS_TPL);
        $("#panelContents").empty().append(tpl);
        var fList = $("#draggableList");
        var listItem_tpl = acapp.getTemplate(acapp.OVERALL_CONTEXT_TPL);
        this.collection.forEach(function (model) {
            var obj = model.toTemplateObject();
            fList.append(listItem_tpl.jqote(obj));
        }); //end foreach
        var startIndex;
        //So KpiContextView is accessible within sortable scope
        var kcv = this;
        $(".kpiPanelList").sortable({
            placeHolder: "sortablePlaceHolder", //not working
            start: function (e, ui) {
                startIndex = $(ui.item).index();
            },
            stop: function (e, ui) {
                var endIndex = $(ui.item).index();
                kcv.collection.models.move(startIndex, endIndex);
                /* See OverallDashboardView for listeners. Both this view and
                OverallDashboardView reference the same collection. */
                kcv.collection.trigger(
                    "reorder",
                    { start: startIndex, end: endIndex });
            }
        });
        acapp.registerDataRoutes($(acapp.CONTEXT_EL));
        return this; //acapp.KpiContextView 
    } //end render    
});

acapp.PrintView = Backbone.View.extend({
    el: "#presentationContainer",
    pcc: "#printContentContainer",
    initialize: function () {
        this.view = this;
    },
    exitPrintMode: function () {
        var inst = this.view;
        inst.$el.hide();
        this.$el.empty(); //Clean up charts.
    },
    removeChart: function (modelId) {
        var model = this.collection.get(modelId);
        console.info("[PrintView.removeChart] " + model.get("title"));
        $("#pr_" + model.get("id")).empty();
        $("#ctrl_" + model.get("id")).empty();
        $("#chartFrame_" + model.get("id")).hide();
    },
    renderChart: function (modelId) {
        var model = this.collection.get(modelId);
        console.info("[PrintView.renderChart] " + model.get("title"));
        $("#chartFrame_" + model.get("id")).show();
        var orientation = (window.orientation === 0) ? "portrait" : "landscape";
        var renderEl = "pr_" + model.get("id");
        //Generic template for all charts being print previewed
        //var tpl = acapp.getTemplate(acapp.PRINT_CHART_TPL);
        //var obj = model.toTemplateObject();
        //this.pcc.append(tpl.jqote(obj));
        //Template for the chart specific controls bein print previewed
        var tpl = acapp.getTemplate(model.get("template"));
        var obj = model.toTemplateObject();
        $("#ctrl_" + model.get("id")).append(tpl.jqote(obj));
        new Highcharts.Chart(
            acapp.ChartFactory.printify(model,
                acapp.ChartFactory.createFullChart(
                    model.get("id"), orientation, renderEl)
        ));
        //pcc.append(acapp.DataFactory.createTable(model.get("id")));
        
    },
    render: function () {
        var inst = this.view;
        //TODO: Pass filter models into this View to populate print preview header filters.
        var tpl = acapp.getTemplate(acapp.PRINT_MODE_TPL);
        inst.$el.empty().append(tpl);
        //PrintContentContainer is in the template so jQuery-ify after.
        inst.pcc = $("#printContentContainer ul");
        tpl = acapp.getTemplate(acapp.PRINT_PREVIEW_ITEM_TPL);
        //Iterate the acapp.printChartCollection for chart titles
        this.collection.forEach(function (model) {
            var obj = model.toTemplateObject();
            inst.pcc.append(tpl.jqote(obj));
        }); //end foreach
        acapp.registerDataRoutes($(acapp.PRESENTATION_EL));
        inst.$el.show();
    }
});

/* This overall dashboard context panel view.  */
acapp.PrintCustomizerView = Backbone.View.extend({
    initialize: function () {
        //Assuming the model is set we listen for changes. 
        //this -> acapp.KpiContextView
        //this.collection.on("change:data", this.collectionChange);
        //Assign reference of view to model so we can reference in modelChange
        //Alternately, do this in a closure here in initialize.
        this.collection.view = this;
    },
    render: function () {
        var tpl = acapp.getTemplate(acapp.PRINT_CONTROLS_TPL);
        $("#panelContents").empty().append(tpl);
        var fList = $("#draggableList");
        fList.empty();
        var listItem_tpl = acapp.getTemplate(acapp.PRINT_CONTROL_ITEM_TPL);
        this.collection.forEach(function (model) {
            var obj = model.toTemplateObject();
            fList.append(listItem_tpl.jqote(obj));
        }); //end foreach
        var startIndex;
        //So KpiContextView is accessible within sortable scope
        var kcv = this;
        $(".kpiPanelList").sortable({
            placeHolder: "sortablePlaceHolder", //not working
            start: function (e, ui) {
                startIndex = $(ui.item).index();
            },
            stop: function (e, ui) {
                var endIndex = $(ui.item).index();
                kcv.collection.models.move(startIndex, endIndex);
                /* See OverallDashboardView for listeners. Both this view and
                OverallDashboardView reference the same collection. */
                kcv.collection.trigger(
                    "reorder",
                    { start: startIndex, end: endIndex });
            }
        });
        acapp.registerDataRoutes($(acapp.CONTEXT_EL));
        return this; //acapp.PresentationCustomizerView
    } //end render    
});

acapp.FinanceContextView = Backbone.View.extend({
    /* All context views' el can be #contextPanel since it is the top level
    section where the templates for a specific context panel are inserted.
    Backbone requires that the referenced el be in the page already when
    this class is instantiated. Since the template is loaded at render then
    this obviously can't be something that is in the template. */
    el: "#contextPanel",
    /* Events bound to elements in the el. */
    render: function () {
        var tpl = acapp.getTemplate(acapp.FINANCE_CONTROL_PANEL);
        $(acapp.CONTEXT_EL).empty().append(tpl);
        acapp.registerDataRoutes($(acapp.CONTEXT_EL));
        return this;
    }
});

acapp.FinancialDashboardView = Backbone.View.extend({
    el: acapp.CONTAINER_EL,
    initialize: function (options) {
        this.PRIMARY_CHART = "mainChart";
        this.SECONDARY_CHART = "secondChart";
        this.chartType = options.chartType;
        this.kpiButtonCol = null;
        this.kpiNavView = null;
        this.orientation = (window.orientation === 0) ? "portrait" : "landscape";
        this.selectedCharts = new Object();
        this.selectedCharts[this.PRIMARY_CHART] = this.chartType;
        this.selectedCharts[this.SECONDARY_CHART] = null;
        this.nextRenderEl_ptr = this.PRIMARY_CHART;
        this.numChartsInView = 0;
        this.theme = options.theme;
        this.view = this;
        //On initialization there can only be one chart as we are coming from
        //the dashboard where the user can only select one.
        var inst = this;
        $("body").on("orientationchange", function (e) {
            inst.orientation = (window.orientation === 0) ? "portrait" : "landscape";
            inst.updateDisplay();
        });
        this.on(acapp.NAV_TOGGLE_EVENT, this.kpiViewChange);
    },
    clearChartContainers: function () {
        var inst = this.view;
        var prime = $("#primary");
        prime.height("100%");
        var second = $("#secondary");
        second.hide();
        //TODO: Promoted secondaryChart wasn't showing without this. Find out why!
        $("#mainChart").show(); 
        $("#mainTable").hide();
        $("#mainTable").height("85%");
        $("#secondary .card").removeClass("flipped");
    },
    getNumViews: function () {
        var inst = this.view;
        var num = 0;
        if (inst.selectedCharts[inst.PRIMARY_CHART] !== null) num++;
        if (inst.selectedCharts[inst.SECONDARY_CHART] !== null) num++;
        return num;
    },
    getNextViewport: function () {
        var inst = this.view;
        if (inst.nextRenderEl_ptr === inst.PRIMARY_CHART) {
            return inst.SECONDARY_CHART;
        }
        else {
            return inst.PRIMARY_CHART;
        }
    },
    getCardSectionToggled: function (chartType) {
        var inst = this.view;
        if (inst.selectedCharts[inst.PRIMARY_CHART] === chartType) {
            return "primary";
        }
        else if (inst.selectedCharts[inst.SECONDARY_CHART] === chartType) {
            return "secondary";
        }
    },
    getSection: function (chartTargetEl) {
        ///<param name="chartTargetEl" type="string">Either this.PRIMARY_CHART
        ///or this.SECONDARY_CHART</param>
        return (chartTargetEl.indexOf("main") > -1) ? "main" : "second";
    },
    replaceChartInViewport: function (currentChart, newChart) {
        ///<param name="chartType" type="string">The chart to be replaced</param>
        ///<param name="subType" type="string">The chart replacing chartType</param>
        ///<return>Element id of the viewport containing the given chart type
        ///or null if the chart type cannot be found in one of the two
        ///viewports.</return>
        var inst = this.view;
        var targetViewport = null;
        if (inst.selectedCharts[inst.PRIMARY_CHART] === currentChart) {
            inst.selectedCharts[inst.PRIMARY_CHART] = newChart;
            targetViewport = inst.PRIMARY_CHART;
        }
        else if (inst.selectedCharts[inst.SECONDARY_CHART] === currentChart) {
            inst.selectedCharts[inst.SECONDARY_CHART] = newChart;
            targetViewport = inst.SECONDARY_CHART;
        }
        else {
            console.warn("[FinancialDashboardView.replaceChartInViewport] " +
                "Could not find chartType of " + currentChart + " in either " +
                "element id \"" + inst.PRIMARY_CHART + "\" or \"" +
                inst.SECONDARY_CHART + "\".");
            return; //Did not find specified type. Do nothing.
        }
        var section = inst.getSection(targetViewport);
        $("#" + section + "Table").hide();
        $("#" + section + "Chart").show();
        var model = inst.kpiButtonCol.get(currentChart);
        model.set("id", newChart);
        model.set("chartType", newChart);
        inst.kpiNavView.replaceDataChoice(currentChart, newChart);
        new Highcharts.Chart(
            acapp.ChartFactory.createFullChart(
                newChart,
                inst.orientation,
                targetViewport
        ));
        var tpl = acapp.getTemplate(model.get("template"));
        var obj = model.toTemplateObject();
        var controlEl = $("#" + targetViewport + "Controls");
        controlEl.empty().append(tpl.jqote(obj));
        acapp.registerDataRoutes(controlEl);
    },
    kpiViewChange: function (options) {
        ///<summary>Handler for change:selected on KpiModel</summary>
        ///<param name="options" type="object">Object with a model property
        ///of type KpiModel representing the toggled button.</param>
        var model = options.model;
        var toggledOff = !model.get("selected");
        if (toggledOff) {
            var modelChart = model.get("chartType");
            if (this.selectedCharts[this.PRIMARY_CHART] === modelChart) {
                //Promote what was in the bottom display to the top 
                this.chartType = this.selectedCharts[this.SECONDARY_CHART];
                this.selectedCharts[this.PRIMARY_CHART] = this.chartType;
                this.selectedCharts[this.SECONDARY_CHART] = null;
                this.clearChartContainers();
            }
            if (this.selectedCharts[this.SECONDARY_CHART] === modelChart) {
                this.selectedCharts[this.SECONDARY_CHART] = null;
            }
        }
        else {
            //Make sure any tables are hidden.
            $("#" + this.nextRenderEl_ptr).show();
            if (this.nextRenderEl_ptr === this.PRIMARY_CHART) {
                $("#mainTable").hide();
            }
            else {
                $("#secondTable").hide();
            }
            this.selectedCharts[this.nextRenderEl_ptr] = model.get("chartType");
        }
        this.numChartsInView = this.getNumViews();
        this.updateDisplay();
        this.nextRenderEl_ptr = this.getNextViewport();
    },
    render: function () {
        /* In this view render sets up the UI the first time it is shown. Call
        updateDisplay for subsequent refreshes so that the template and various
        navigators do not get reloaded. */
        var inst = this.view;
        var tpl = acapp.getTemplate(acapp.FINANCE_DASHBOARD_TPL);
        $(acapp.CONTAINER_EL).empty().append(tpl);
        this.kpiButtonCol = acapp.DataFactory.createKpiCollection(inst.theme);
        this.kpiNavView = new acapp.KpiNavigatorView({
            collection: this.kpiButtonCol,
            parentView: this,
            theme: inst.theme
        });
        this.kpiButtonCol.get(this.chartType).set("selected", true);
        /* Reset all theme navigator pill states */
        $("#themeNavigator ul li").removeClass("active");
        /* Make appropriate theme navigator pill active */
        var themePill = $("#bottom_" + inst.theme);
        themePill.parent().addClass("active");
        //Slightly hackish simulating button toggle manually
        this.kpiViewChange({ model: this.kpiButtonCol.get(this.chartType) });
    },
    setChartType: function (type) {
        var inst = this.view;
        inst.clearChartContainers();
        inst.numChartsInView = 0;
        inst.nextRenderEl_ptr = inst.PRIMARY_CHART;
        inst.selectedCharts[inst.SECONDARY_CHART] = null;
        inst.chartType = type;
        inst.selectedCharts[inst.PRIMARY_CHART] = type;
    },
    setTheme: function (theme) {
        var inst = this.view;
        inst.theme = theme;
    },
    updateDisplay: function (renderSubType) {
        //<summary>Update the view without reloading the template as in the
        ///render method.</summary>
        var inst = this.view;

        function renderChart(el) {
            new Highcharts.Chart(
                acapp.ChartFactory.createFullChart(
                inst.selectedCharts[el], //resolves to chartType
                inst.orientation, el) //resolves to renderEl
            );
        }

        if (inst.numChartsInView === 1) {
            var secEl = $("#secondary");
            secEl.hide();
            $("#secondTable").hide();
            $("#secondaryOptionsOverlay").hide();
            var jel = $("#primary");
            jel.height("100%");
            $("#mainTable").height("85%");
            renderChart(inst.PRIMARY_CHART);
            var model = this.kpiButtonCol.get(this.selectedCharts[inst.PRIMARY_CHART]);
            $("#" + inst.PRIMARY_CHART + "Title").text(acapp.KPI_LABEL_LOOKUP[model.get("id")]);
            //Set the renderEl on the model so it can be passed to the template
            //as the value for data-renderEl. Then acapp.dataRoutes.tableOn can
            //read back where to render.
            //Get template from model and register data routes for it
            model.set("section", inst.getSection(inst.PRIMARY_CHART));
            var tpl = acapp.getTemplate(model.get("template"));
            var obj = model.toTemplateObject();
            var priControls = $("#" + inst.PRIMARY_CHART + "Controls");
            priControls.empty().append(tpl.jqote(obj));

            //Set the right pill button active for denials volume/denials charges
            priControls.find("a[data-newchart=\"" + model.get("id") + "\"]").parent().addClass("active");
        }
        else if (inst.numChartsInView === 2) {
            var secEl = $("#secondary");
            secEl.show();
            var jel = $("#primary");
            var preheight = jel.height();
            jel.height("48%");
            var postheight = jel.height();
            $("#secondaryOptionsOverlay").show();
            renderChart(inst.nextRenderEl_ptr);
            //Post resize event on height change so highcharts redraws itself.
            if (preheight !== postheight) {
                //Trigger window resize or highcharts doesn't redraw itself.
                $(window).resize();
            }
            $("#mainTable").height("75%");
            var model = this.kpiButtonCol.get(this.selectedCharts[inst.nextRenderEl_ptr]);
            $("#" + inst.nextRenderEl_ptr + "Title").text(acapp.KPI_LABEL_LOOKUP[model.get("id")]);
            model.set("section", inst.getSection(inst.nextRenderEl_ptr));
            var tpl = acapp.getTemplate(model.get("template"));
            var obj = model.toTemplateObject();
            /* Set up chart specific controls */
            var secControls = $("#" + inst.nextRenderEl_ptr + "Controls");
            secControls.empty().append(tpl.jqote(obj));

            //Possible that this might work for a general case.
            secControls.find("a[data-newchart=\""+model.get("id")+"\"]").parent().addClass("active");
        }
        acapp.registerDataRoutes($(acapp.CONTAINER_EL));
    }
});

acapp.KpiNavigatorView = Backbone.View.extend({
    ///<summary>The container of Kpi toggle buttons.</summary>
    el: "#kpiNavigator",
    events: {
        "click .kpiButton": "buttonToggled"
    },
    initialize: function (options) {
        this.collection.on("change:selected", this.buttonLFToggle, this);
        this.parentView = options.parentView; //FinancialDashboardView
        this.theme = options.theme;
        this.view = this;
        this.render();
    },
    buttonLFToggle: function (model, options) {
        var el = $("#nav_" + model.get("chartType"));
        var elPrevious = el.prev();
        if (model.get("selected") === false) {
            el.removeClass("kpiButtonSelected");
            elPrevious.addClass("kpiBorderDashed");
        }
        else if (model.get("selected") === true) {
            el.addClass("kpiButtonSelected");
            elPrevious.removeClass("kpiBorderDashed");
        }
        //Hack this in to pre-emptively remove .flipped that may have been
        //attached to a table in the section being toggled off. 
        var cardsection = this.parentView.getCardSectionToggled(model.get("id"));
        if (cardsection === "primary") {
            $("#primary .card").removeClass("flipped");
        }
        else if (cardsection === "secondary") {
            $("#secondary .card").removeClass("flipped");
        }
    },
    chartClick: function (e, dataChoice) {
        /* Convoluted callback courtesy of highcharts not propagating events to
        its parent container. */
        e.data = dataChoice;
        this.buttonToggled(e);
    },
    buttonToggled: function (e) {
        //this==view via backbone magic when defined in events hash
        var choice;
        if (e.data !== undefined) {
            choice = e.data;
        }
        else {
            choice = e.currentTarget.getAttribute("data-choice");
        }
        var buttonModel = this.collection.get(choice);
        //Remember: Backbone will send a change:selected event automatically 
        //when the selected propety is set.
        if (buttonModel.get("selected") === false) {
            var replacing = this.parentView.selectedCharts[this.parentView.nextRenderEl_ptr];
            if (replacing !== null) {
                var replacingModel = this.collection.get(replacing);
                replacingModel.set("selected", false);
            }
            buttonModel.set("selected", true);
            this.parentView.trigger(acapp.NAV_TOGGLE_EVENT, { model: buttonModel });
        }
        else {
            buttonModel.set("selected", false);
            if (this.parentView.numChartsInView > 1) {
                this.parentView.trigger(acapp.NAV_TOGGLE_EVENT, { model: buttonModel });
            }
                //Return to overall KPI home screen if toggled off last chart.
            else {
                acapp.MainRouter.prototype.navigate("#", { trigger: true });
            }
        }
    },
    render: function () {
        var inst = this.view;
        inst.$el.empty();
        //inst.collection.forEach(function (cmodel) {
        var cmodel;
        var numButtons = inst.collection.length;
        for (var i = 0; i < numButtons; i++) {
            cmodel = inst.collection.at(i);
            var obj = cmodel.toTemplateObject();
            var tpl = acapp.getTemplate(cmodel.get("navButtonView"));
            inst.$el.append(tpl.jqote(obj));
            //Evaluate whether metric is in/out of target
            if (!cmodel.get("inTarget")) {
                //Make metric text orange
                var chartDivId = "#metric_" + cmodel.get("id");
                var currentMetricEl = $(chartDivId);
                currentMetricEl.removeClass("inTarget");
                currentMetricEl.addClass("outTarget");
            }
            //Small chart for the NavButtons; should draw from a common series
            //The renderEl name is standard for a NavButtonChart to simplify.
            new Highcharts.Chart(acapp.ChartFactory.createNavButtonChart(cmodel, inst));
        }
        //Remove vertical dashed line from last kpiButton
        cmodel = inst.collection.at(inst.collection.length - 1);
        $("#nav_" + cmodel.get("id")).removeClass("kpiBorderDashed");

        var wrapperWidth = 0;
        inst.$el.find(".kpiButton").each(function (index, element) {
            wrapperWidth += $(this).width();
            wrapperWidth += 36; //Account for padding/margin not part of width
        });
        inst.$el.width(wrapperWidth);

        if (inst.theme === acapp.THEME_FINANCE) {
            $("#bottomFinancialPerf p").addClass("themeNavigatorSelected");
        }
        else if (inst.theme === acapp.THEME_PRODUCTIVITY) {
            $("#bottomProductivityPerf p").addClass("themeNavigatorSelected");
        }
        else if (inst.theme === acapp.THEME_STANDARD) {
            $("#bottomStandard p").addClass("themeNavigatorSelected");
        }
    },
    replaceDataChoice: function (chartType, subType) {
        var inst = this.view;
        var navButton = inst.$el.find(".kpiButton[data-choice=\"" + chartType + "\"]");
        navButton.attr("data-choice", subType);
        navButton.attr("id", "nav_" + subType);
    }
});

/* View for the Hierarchy Filter which contains a hierarchy selector link list
and the AdvancedHierarchyView. In the future this would also manage any kind of
filter bin/cart. */
acapp.HierarchyFilterView = Backbone.View.extend({
    el: "#hierarchyFilter",
    tree: null,
    events: {
        "click #totalLink": "treeSelected",
        "click #providerLink": "treeSelected"
    },
    initialize: function (options) {
        this.model = options.model;
        this.crumbs = options.crumbs;
        this.hierarchy = options.hierarchy;
        var tpl = acapp.getTemplate(acapp.HIERARCHY_FILTER_TPL);
        this.$el.empty().append(tpl);
        //Instantiate AdvancedHierarcyView here otherwise 
        //#divisionFilterColumns not available.
        this.tree = new acapp.AdvancedHierarchyView({
            crumbs: this.crumbs,
            hierarchy: this.hierarchy,
            model: this.model
        });
        this.notYetShownOnce = true;
    },
    render: function () {
        if (this.notYetShownOnce) {
            this.notYetShownOnce = false;
            var root = new Array();
            root.push(acapp.PRACTICE_HIERARCHY.root.node[0].name);
            this.model.set("nodes", root);
            this.crumbs.trigger("change:nodes");
        }
        this.$el.show();
        this.tree.render();
    },
    treeSelected: function (e) {
        $("#hierarchySelector li").removeClass("active");
        $("#" + e.target.id).parent().addClass("active");
        var selectedHierarchy = e.target.attributes["data-hierarchy"].value;
        if (selectedHierarchy === "totalTree") {
            this.tree.switchHierarchy(
                acapp.PRACTICE_HIERARCHY,
                acapp.PRACTICE_HIERARCHY.root.node[0]);
        }
        else if (selectedHierarchy === "providerTree") {
            this.tree.switchHierarchy(
                acapp.PROVIDER_HIERARCHY,
                acapp.PROVIDER_HIERARCHY.root.node[0]);
        }
    },
});

/* "Advanced" because it allows text searching of each level of the tree. 
This component also provides some visual enhancements over the
HierarchyView. Eventually this should be a customizable component to also
meet the simpler needs of HierarchyView. */
acapp.AdvancedHierarchyView = Backbone.View.extend({
    el: "#divisionFilterColumns",
    searchLists: null,
    termLists:null,
    selectedItem: null,
    selectedParentId: null,
    //Methods
    bindEvents: function (elId) {
        if (elId === undefined) {
            this.$el.find(".filterColumn a").on("click", this, this.treeItemClicked);
            this.$el.find(".filterColumn input").on("keyup", this, this.searchFieldChange);
        }
    },
    findNode: function (nodeId) {
        function searchNode(nodeArr) {
            if (nodeArr === null) return null;
            for (var i = 0; i < nodeArr.length; i++) {
                if (nodeArr[i].id === nodeId) {
                    return nodeArr[i].node;
                }
                else {
                    var result = searchNode(nodeArr[i].node);
                    if (result !== null) return result;
                }
            }
            return null;
        }
        if (this.hierarchy.root.id === nodeId) {
            return this.hierarchy.root.node;
        }
        else {
            return searchNode(this.hierarchy.root.node);
        }
    },
    initialize: function (options) {
        this.hierarchy = options.hierarchy;
        this.selectedItem = new Array();
        this.searchLists = new Array();
        this.termLists = new Array();
        this.selectedParentId = options.hierarchy.root.node[0].id;
        this.crumbs = options.crumbs;
        //Skip the root node of the Total tree to avoid redundancy.
        this.$el.append(
            this.renderDepthAsList(this.hierarchy.root.node[0].node,
                                  this.hierarchy.root.node[0].depth)
        );
        this.bindEvents();
    },
    render: function () {
        this.$el.show();
    },
    renderDepthAsList: function (nodeArr, depth) {
        ///<summary>Create a list of items in the tree corresponding to a 
        ///specified depth.</summary>
        var listStr = "<div id=\"fcol" + depth + "\" class=\"filterColumn\">";
        listStr += "<input id=\"fcol" + depth + "_tf\" data-parent=\"" +
                    this.selectedParentId + "\" data-depth=\"" + depth +
                    "\" class=\"textField\" type=\"search\" placeholder=\"Find...\"></input>";
        listStr += "<div class=\"termContainer\">";
        listStr += "<ul id=\"fcol" + depth + "_ul\">" + this.renderListItems(nodeArr, depth) + "</ul></div>";
        listStr += "</div>";
        return listStr;
    },
    renderListItems: function (nodeArr, depth) {
        var listStr = "";
        var hasChildren;
        for (var i = 0; i < nodeArr.length; i++) {
            hasChildren = (nodeArr[i].node == null) ? false : true;
            listStr += "<li><div class=\"treeItemWrapper treeItem ";
            if (hasChildren) {
                listStr += "treeItemArrowNormal";
            }
            listStr += "\"><a id=\"" + nodeArr[i].id + "\" data-depth=\"" + depth + "\" data-children=\""+hasChildren+"\">";
            listStr += nodeArr[i].name + "</a></div></li>";
        }
        return listStr;
    },
    switchHierarchy: function (newHierarchy,startNode) {
        ///<summary>Switch hierarchies (either total or providers).</summary>
        ///<param name="hierarchyTree" type="Object">A JSON/JavaScript tree in
        ///a format similar to acapp.PRACTICE_HIERARCHY</param>
        this.hierarchy = newHierarchy;
        this.selectedItem = new Array();
        this.searchLists = new Array();
        this.termLists = new Array();
        this.selectedParentId = startNode.id;
        this.$el.empty();
        this.$el.append(this.renderDepthAsList(startNode.node,startNode.depth));
        this.bindEvents();
        var crumbRoot = new Array();
        crumbRoot.push(startNode.name);
        this.model.set("nodes", crumbRoot);
        this.crumbs.trigger("change:nodes");
    },
    searchFieldChange: function (e) {
        //Private functions
        function updateList(itemList, depth, listStr) {
            if (listStr == undefined) {
                listStr = "";
            }
            /* In addition to the currently selected item in the column, add those 
            items that match the string in the search text field for the column. */
            listStr += inst.renderListItems(itemList, depth);
            var ulist = $("#fcol" + depth + "_ul");
            ulist.empty().append(listStr);
            ulist.off("click", inst.treeItemClicked);
            ulist.on("click", inst, inst.treeItemClicked);
        }
        function startsWithFilter(items, term) {
            ///<param name="items" type="Array">The array in which to search for 
            ///the term.</param>
            ///<param name="term" type="string">The string that an element in items
            ///must start with to be considered a match.</param>
            ///<return>An array containing any matches.</return>
            var matchList = new Array();            
            for (var i = 0; i < items.length; i++) {
                
                if (items[i].name.slice(0, term.length).toLowerCase() === term.toLowerCase()) {
                    //console.info("[startsWithFilter] test=" + items[i].name.slice(0, term.length).toLowerCase() + " term=" + term.toLowerCase());
                    matchList.push(items[i]);
                }
            }
            return matchList;
        }
        var inst = e.data;
        var depth = e.target.attributes["data-depth"].value;
        var parent = e.target.attributes["data-parent"].value;
        var searchText = e.target.value;
        //console.info("[AdvancedHierarchyView.searchFieldChange] term="
        //            + searchText + " keyCode=" + e.keyCode + " depth=" + depth + " parent=" + parent);
        if (searchText.length == 0) {
            //Return the column to the full list of it's items
            inst.searchLists[depth] = inst.findNode(parent);
            updateList(inst.searchLists[depth], depth);
            inst.termLists[depth] = undefined;
            /* When search field cleared and no new item has been selected
            from search results we re-select the past selection in the updated 
            list. */
            if (inst.selectedItem[depth] !== undefined) {
                var prevSelectedItem = $("#" + inst.selectedItem[depth].id);
                $(prevSelectedItem).addClass("treeItemSelected");
            }
            return;
        }
        if (e.keyCode==8 || e.keyCode==46) {  //Backspace or Delete key) {
            /* Since we are deleting characters we must not use a list that was
            reduced by previous character entries. */
            inst.termLists[depth] = undefined;
        }
        /* The number of characters before client-side searching begins */
        //if (searchText.length < 2) {
        //    return;
        //}
        /* Do a search for the letters in the search term textfield. */
        
        var listStr = "";
        //Preserves the selected item at this depth so that it is not 
        //replaced by the changing list in reaction to search field entries.
        if (inst.selectedItem[depth] !== undefined) {
            if (inst.selectedItem[depth].hasChildren) {
                listStr += "<li><div class=\"treeItemWrapper treeItemArrowSelected\">";
            }
            else {
                listStr += "<li><div class=\"treeItemWrapper treeItemPastSelected\">";
            }
            listStr += "<a id=\"" + inst.selectedItem[depth].id + "\" data-depth=\"";
            listStr += depth + "\" data-children=\"" + inst.selectedItem[depth].hasChildren + "\">";
            listStr += inst.selectedItem[depth].text + "</a></div></li>";
        }
        //console.info("[AdvancedHierarchyView.searchFieldChange] " +
        //    "selectedItem=" + inst.selectedItem[depth] + " parent=" + parent);
        /* searchLists elements contain the population of items that the search 
        textfield can act upon for its column. Cache so we do not have to 
        search the tree each time a letter is typed for the search space. */
        if (inst.searchLists[depth] === undefined) {
            //console.info("preparing searchList for depth " + depth);
            inst.searchLists[depth] = inst.findNode(parent);
        }
        if (inst.termLists[depth] === undefined) {
            inst.termLists[depth] = inst.searchLists[depth];
        }
        //Save the filtered terms so if we keep typing we don't search
        //starting with the whole list again.
        inst.termLists[depth] = startsWithFilter(inst.termLists[depth], searchText);
        updateList(inst.termLists[depth], depth, listStr);
    },
    treeItemClicked: function (e) {
        var inst = e.data;
        var nodeId = e.target.id;
        var depth = parseInt(e.target.attributes["data-depth"].value);
        var hasChildren = e.target.attributes["data-children"].value;
        hasChildren = (hasChildren == "true") ? true : false;
        var aref = e.data.$el.find("#" + nodeId).parent();
        inst.model.get("nodes")[depth] = e.target.text;
        //Deal with previously selected item assuming no multi-selection on
        //the branch.
        if (inst.selectedItem[depth] !== undefined) {
            var prevSelectedItem = $("#" + inst.selectedItem[depth].id);
            //Reset look and feel with chevrons for nodes with children 
            if (inst.selectedItem[depth].hasChildren) {
                $(prevSelectedItem).parent().removeClass("treeItemPrevBranch");
                $(prevSelectedItem).parent().removeClass("treeItemArrowSelected");
                $(prevSelectedItem).parent().addClass("treeItemArrowNormal");
            }
            else {
                $(prevSelectedItem).parent().removeClass("treeItemSelected");
            }
        }
        if (hasChildren) {
            aref.addClass("treeItemArrowSelected");
        }
        else {
            aref.addClass("treeItemSelected");
        }

        for (var i = 0; i < depth; i++) {
            if (inst.selectedItem[i] !== undefined) {
                var branch = $("#" + inst.selectedItem[i].id);
                $(branch).parent().removeClass("treeItemArrowSelected");
                $(branch).parent().addClass("treeItemPrevBranch");
            }
        }
        //Store the selected item for this tree depth.
        inst.selectedItem[depth] = new acapp.FilterItem(nodeId,
                                                        aref.text(),
                                                        hasChildren);
        inst.selectedParentId = nodeId;
        /* Cheat to remove the 2 columns right of the 1st column when the
        selected node is on tdhe first column. Really we should compute the
        depth of the tree somewhere and prune from depth+1 to maxDepth. */
        $("#fcol" + (depth + 1)).remove();
        $("#fcol" + (depth + 2)).remove();
        inst.searchLists[depth + 1] = undefined;
        inst.searchLists[depth + 2] = undefined;
        inst.termLists[depth + 1] = undefined;
        inst.termLists[depth + 2] = undefined;
        inst.model.get("nodes").remove(depth + 1);
        inst.model.get("nodes").remove(depth + 2);
        inst.model.get("nodes").remove(depth + 3);
        var nodeArr = inst.findNode(nodeId);
        //Selected node is a branch
        if (nodeArr !== null) {
            var html = inst.renderDepthAsList(nodeArr, (depth + 1));
            inst.$el.append(html);
            inst.$el.find("#fcol" + (depth + 1) + "_tf").on("keyup", inst, inst.searchFieldChange);
            //var cols = inst.$el.find(".filterColumn a");
            var cols = inst.$el.find("#fcol"+(depth+1)+" a");
            //Super lazy remove all add all but that's demo
            cols.off("click", inst.treeItemClicked);
            cols.on("click", inst, inst.treeItemClicked);
        }
        else { //At leaf node
            //var cols = inst.$el.find(".filterColumn a");
            var cols = inst.$el.find("#fcol" + (depth + 1));
            cols.off("click", inst.treeItemClicked);
            cols.on("click", inst, inst.treeItemClicked);
        }
        //Update the related HierarchyBreadCrumbView.
        inst.crumbs.trigger("change:nodes");
    }
});

/* This is maintainced here for the date and OPC/Location filter hierarchies but
should probably be replaced by the AdvancedHierarchyView */
acapp.HierarchyView = Backbone.View.extend({
    events: {
        "click #applyButton": "applyClicked"
    },
    initialize: function (options) {
        this.hierarchy = options.hierarchy;
        this.crumbs = options.crumbs;
        //Always need the root node array
        this.$el.append(this.renderDepthAsList(this.hierarchy.root.node, this.hierarchy.root.depth));
        this.$el.find(".filterColumn a").on("click", this, this.treeItemClicked);
    },
    applyClicked: function (e) {
        console.info("[HierarchyView] " + this.el + " applyClicked");
    },
    findNode: function (nodeId, depth) {
        function searchNode(nodeArr) {
            if (nodeArr === null) return null;
            for (var i = 0; i < nodeArr.length; i++) {
                if (nodeArr[i].id === nodeId) {
                    return nodeArr[i].node;
                }
                else {
                    var result = searchNode(nodeArr[i].node);
                    if (result !== null) return result;
                }
            }
            return null;
        }
        return searchNode(this.hierarchy.root.node);
    },
    renderDepthAsList: function (nodeArr, depth) {
        ///<summary>Create a list of </summary>
        var listStr = "<div id=\"fcol" + depth + "\" class=\"filterColumn\">";
        listStr += "<ul>";
        for (var i = 0; i < nodeArr.length; i++) {
            listStr += "<li><a id=\"" + nodeArr[i].id + "\" class=\"treeItem\" data-depth=\"" + depth + "\">";
            listStr += nodeArr[i].name + "</a></li>";
        }
        listStr += "</ul>";
        listStr += "</div>";
        return listStr;
    },
    render: function () {
        this.$el.show();
    },
    treeItemClicked: function (e) {
        var inst = e.data;
        var nodeId = e.target.id;
        var depth = parseInt(e.target.attributes["data-depth"].value);
        var aref = e.data.$el.find("#" + nodeId);
        inst.model.get("nodes")[depth] = e.target.text;
        inst.$el.find("#fcol" + depth + " a").removeClass("treeItemSelected");
        aref.addClass("treeItemSelected");
        /* Cheat to remove the 2 columns right of the 1st column when the
        selected node is on the first column. Really we should compute the
        depth of the tree somewhere and prune from depth+1 to maxDepth. */
        inst.$el.find("#fcol" + (depth + 1)).remove();
        inst.$el.find("#fcol" + (depth + 2)).remove();
        inst.model.get("nodes").remove(depth + 1);
        inst.model.get("nodes").remove(depth + 2);
        inst.model.get("nodes").remove(depth + 3);
        var nodeArr = inst.findNode(nodeId);
        //Selected node is a branch
        if (nodeArr !== null) {
            var html = inst.renderDepthAsList(nodeArr, (depth + 1));
            inst.$el.append(html);
            var cols = inst.$el.find(".filterColumn a");
            //Super lazy remove all add all but that's demo
            cols.off("click", inst.treeItemClicked);
            cols.on("click", inst, inst.treeItemClicked);
        }
        else { //At leaf node
            var cols = inst.$el.find(".filterColumn a");
            cols.off("click", inst.treeItemClicked);
            cols.on("click", inst, inst.treeItemClicked);
        }
        //Update the related HierarchyBreadCrumbView.
        inst.crumbs.trigger("change:nodes");
    }
});

acapp.HierarchyBreadCrumbView = Backbone.View.extend({
    initialize: function () {
        this.on("change:nodes", this.render);
    },
    render: function () {
        var crumbs = this.model.get("nodes");
        var html = "";
        for (var i = 0; i < crumbs.length; i++) {
            if (crumbs[i] === undefined) continue;
            html += crumbs[i];
            html += " > "
        }
        this.$el.text(html.substr(0, html.length - 3));
        return this.$el;
    }
});

acapp.DateFilterView = Backbone.View.extend({
    el: "#dateFilterColumns",
    events: {
        "click a": "dateClicked"
    },
    initialize: function () {
        var tpl = acapp.getTemplate(acapp.DATE_FILTER_TPL);
        this.$el.empty().append(tpl);
    },
    dateClicked: function (e) {
        this.$el.find(".filterColumn a").removeClass("treeItemSelected");
        var nodeId = e.target.id;
        var aref = this.$el.find("#" + nodeId);
        aref.addClass("treeItemSelected");
        this.$el.find(".calendarArea").hide();
        this.$el.find("#dateFilter_" + nodeId).show();
        var breadCrumbStr = "";
        //Cases are the id attributes of links in dateFilter.html
        switch (nodeId) {
            case "mon3":
                breadCrumbStr = "Prior 3 Months";
                break;
            case "mon6":
                breadCrumbStr = "Prior 6 Months";
                break;
            case "mon12":
                breadCrumbStr = "Prior 12 Months";
                break;
            case "mon24":
                breadCrumbStr = "Prior 24 Months";
                break;
            case "currentYear":
                breadCrumbStr = "Current Year to Date";
                break;
        }
        $("#dateLink").text(breadCrumbStr);
    },
    render: function () {
        this.$el.show();
    }
});