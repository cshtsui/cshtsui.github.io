//Visual Studio 2012 Intellisense activation. Ignore if not using.
///<reference path="jquery-1.8.2.min.js"/>
///<reference path="acmodel.js"/>
///<reference path="acviews.js"/>
///<reference path="acapp.js"/>
///<reference path="backbone-min.js"/>
///<reference path="highcharts.js"/>
//We almost gave up
acapp.KPI_LABEL_LOOKUP = new Array();
acapp.KPI_LABEL_LOOKUP[acapp.KPI_DEFAULT] = "Default";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_RVUS] = "Work RVUs";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_VOLUME] = "Volume";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_CHARGES] = "Charges";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_PAYMENTS] = "Payments";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_TRANSACTIONAL_GCR] = "Transactional GCR";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_ACCOUNTS_RECEIVABLE] = "Accounts Receivable";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_AR90PLUS] = "Accounts Receivable 90+ Days";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_DAYS_IN_AR] = "Days in AR";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_CHARGE_LAG] = "Charge Lag";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_DENIAL_CHARGES] = "Denials";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_DENIAL_VOLUME] = "Denials";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_AR_AGING] = "Accounts Receivable Aging";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_DENIAL_OPC] = "Denials by Original Payer Class";
acapp.KPI_LABEL_LOOKUP[acapp.KPI_MATCHED_COLLECTION_PERF] = "Matched Collection Performance (Open AR)";
acapp.BUTTON_TPL_VS_PRIOR_YEAR = "template/vsPriorYearButton.html";
acapp.BUTTON_TPL_VS_PRIOR_YEAR_LARGE = "template/vsPriorYearButtonLarge.html";
acapp.BUTTON_TPL_VS_PRIOR_YEAR_SMALL = "template/vsPriorYearButtonSmall.html";
acapp.BUTTON_TPL_VS_PRIOR_YEAR_DOWN = "template/vsPriorYearDownButton.html";
acapp.BUTTON_TPL_VS_PRIOR_YEAR_DOWN_LARGE = "template/vsPriorYearDownButtonLarge.html";
acapp.BUTTON_TPL_VS_PRIOR_YEAR_DOWN_SMALL = "template/vsPriorYearDownButtonSmall.html";
acapp.BUTTON_TPL_AR_AGING = "template/arAgingButton.html";
acapp.BUTTON_TPL_AR_AGING_LARGE = "template/arAgingButtonLarge.html";
acapp.BUTTON_TPL_AR_AGING_SMALL = "template/arAgingButtonSmall.html";
acapp.BUTTON_TPL_TARGET_NAV = "template/targetNavButton.html";
acapp.BUTTON_TPL_TARGET_SMALL = "template/targetButtonSmall.html";
acapp.BUTTON_TPL_TARGET_LARGE = "template/targetButtonLarge.html";
acapp.BUTTON_TPL_DENIAL_OPC = "template/denialOPCButton.html";
acapp.BUTTON_TPL_DENIAL_OPC_LARGE = "template/denialOPCButtonLarge.html";
acapp.BUTTON_TPL_DENIAL_OPC_SMALL = "template/denialOPCButtonSmall.html";
acapp.CONTROL_TPL_RVUS = "template/rvusCtrl.html";
acapp.CONTROL_TPL_CHARGES = "template/chargesCtrl.html";
acapp.CONTROL_TPL_DAYS_IN_AR = "template/darCtrl.html";
acapp.CONTROL_TPL_DENIAL_TREND = "template/denialCtrl.html";
acapp.CONTROL_TPL_AR_AGING = "template/arAgingCtrl.html";
acapp.CONTROL_TPL_DENIAL_OPC = "template/denialOPCCtrl.html";
acapp.CONTROL_TPL_DEFAULT = "template/defaultCtrl.html";

acapp.ChartFactory = {
    bigify: function (model, config) {
        ///<summary>Make a bigger version of the KPI tile for the top two KPIs 
        ///in the overall dashboard. Called from KpiChartView render method.
        ///after a base Highcharts config object is created in ChartFactory's
        ///createNavButtonChart</summary>
        ///<param name="model" type="KpiModel">KpiModel instance identifying
        ///the chart to make a large view.</param>
        ///<param name="config" type="object">An object containing properties
        ///that Highcharts can use to configure a chart.</param>
        ///<return>A Highcharts configuration object.</return>
        var chartType = model.get("chartType");
        var xAxisConfig = {
            categories: acapp.DEMO_DATE_RANGE,
            gridLineDashStyle: "dash",
            gridLineWidth: 1,
            labels: {
                enabled: true,
                style: {
                    color: "#999",
                    fontSize: "10px"
                }
            },
            lineWidth: 0,
            tickInterval: 3,
            tickmarkPlacement: "on",
            title: { text: null }
        };
        var yAxisConfig = {
            gridLineWidth: 0,
            labels: {
                enabled: true,
                style: {
                    color: "#999",
                    fontSize: "10px"
                }
            },
            title: { text: null }
        };
        var plotConfig = {
            line: {
                shadow: {
                    offsetX: 1,
                    offsetY: 2,
                    opacity: 0.1,
                    width: 3
                }
            },
            area: {
                lineWidth: 0,
                marker: {
                    enabled: false
                },
                shadow: false
            },
            bar: {
                borderWidth: 0,
                dataLabels: { enabled: false },
                pointWidth: 10
            },
            series: {
                animation: false,
                enableMouseTracking: false
            }
        };
        switch (chartType) {
            case acapp.KPI_CHARGES:
                plotConfig.area.threshold = 30000;
                yAxisConfig.max = 30000;
                yAxisConfig.tickInterval = 5000;
                break;
            case acapp.KPI_VOLUME:
                plotConfig.area.threshold = 1500;
                yAxisConfig.max = 1500;
                yAxisConfig.tickInterval = 500;
                break;
            case acapp.KPI_RVUS:
                plotConfig.area.threshold = 200;
                yAxisConfig.max = 200;
                yAxisConfig.tickInterval = 50;
                break;
            case acapp.KPI_TRANSACTIONAL_GCR:
                config.plotOptions.area.threshold = 50;
                yAxisConfig.tickInterval = 10;
                break;
            case acapp.KPI_DENIAL_OPC:
                config.chart.plotBorderWidth = 0;
                config.chart.spacingRight = 10;
                config.series = acapp.DataFactory.createChartSeries(chartType);
                config.series[0].data = config.series[0].data.splice(0, 3);
                xAxisConfig = { categories: ["Medicare", "Commercial", "Medi-Cal"] };
                break;
            case acapp.KPI_AR_AGING:
                config.chart.margin = [0, 8, 15, 35];
                xAxisConfig = {}; //Why?
                xAxisConfig.categories = ["0-30", "31-60", "61+"];
                xAxisConfig.labels = {
                    align: "right",
                    enabled: true,
                    style: {
                        fontSize: "9px"
                    },
                    y: 3
                };
                yAxisConfig.gridLineWidth = 1;
                yAxisConfig.gridLineDashStyle = "ShortDash";
                yAxisConfig.labels = {
                    enabled: true,
                    style: {
                        color: "grey",
                        fontSize: "9px"
                    },
                    y: 10
                };
                break;
        }
        config.chart.backgroundColor = "#f2f2f2";
        config.chart.spacingTop = 10;
        config.plotOptions = plotConfig;
        config.xAxis = xAxisConfig;
        config.yAxis = yAxisConfig;
        return config;
    },
    weeify: function (model, config) {
        ///<summary>Make the standard small version of the KPI tile in the
        ///overall dashboard. Called from KpiChartView render method.
        ///after a base Highcharts config object is created in ChartFactory's
        ///createNavButtonChart</summary>
        ///<param name="model" type="KpiModel">KpiModel instance identifying
        ///the chart to make a small view.</param>
        ///<param name="config" type="object">An object containing properties
        ///that Highcharts can use to configure a chart.</param>
        ///<return>A Highcharts configuration object.</return>
        var chartType = model.get("chartType");
        var xAxisConfig = {
            categories: acapp.DEMO_DATE_RANGE,
            labels: { enabled: false },
            lineWidth: 0,
            tickInterval: 3,
            tickmarkPlacement: "on",
            title: { text: null }
        };
        var yAxisConfig = {
            gridLineWidth: 0,
            labels: { enabled: false },
            title: { text: null }
        };
        switch (chartType) {
            case acapp.KPI_CHARGES:
                config.plotOptions.area.threshold = 30000;
                yAxisConfig.max = 30000;
                yAxisConfig.tickInterval = 5000;
                break;
            case acapp.KPI_RVUS:
                config.plotOptions.area.threshold = 200;
                config.plotOptions.line = {
                    shadow: {
                        offsetX: 1,
                        offsetY: 2,
                        opacity: 0.1,
                        width: 3
                    }
                };
                yAxisConfig.max = 200;
                yAxisConfig.tickInterval = 50;
                break;
            case acapp.KPI_VOLUME:
                config.plotOptions.area.threshold = 1500;
                yAxisConfig.max = 1500;
                yAxisConfig.tickInterval = 500;
                break;
            case acapp.KPI_TRANSACTIONAL_GCR:
                config.plotOptions.area.threshold = 50;
                yAxisConfig.tickInterval = 1;
                break;
            case acapp.KPI_AR_AGING:
                config.chart.margin = [0, 8, 15, 35];
                xAxisConfig = {}; //Why?
                xAxisConfig.categories = ["0-30", "31-60", "61+"];
                xAxisConfig.labels = {
                    align: "right",
                    enabled: true,
                    style: {
                        fontSize: "9px"
                    },
                    y: 3
                };
                yAxisConfig.gridLineWidth = 1;
                yAxisConfig.gridLineDashStyle = "ShortDash";
                yAxisConfig.labels = {
                    enabled: true,
                    style: {
                        color: "grey",
                        fontSize: "9px"
                    },
                    y: 10
                };
                //Min (start) and max (end) ticks only
                yAxisConfig.tickPositions = [0, 20000];
                break;
            case acapp.KPI_DENIAL_OPC:
                config.chart.plotBorderWidth = 1;
                yAxisConfig.max = 4000;
                break;
        }
        config.chart.borderWidth = 0;
        config.chart.backgroundColor = "#f2f2f2";
        config.xAxis = xAxisConfig;
        config.yAxis = yAxisConfig;

        return config;
    },
    createNavButtonChart: function (model, view) {
        ///<summary>Originally focused on drawing small versions of KPI charts
        ///for the scrolling Kpi Navigator at the bottom of the charts display.
        ///This method became a useful way of generating basic configurations
        ///for the overall dashboard page's KPIs as well.</summary>
        ///<param name="model" type="KpiModel">Provides metadata for kpi chart</param>
        ///<param name="view" type="KpiNavigatorView">Instance reference to the 
        ///view hosting a callback function so that highcharts can pass events
        ///to the view for processing. Needed because highcharts seems to not
        ///pass through events to its container.</param>
        ///<return>A Highcharts configuration object</return>
        var theChart;
        var chartType = model.get("chartType");
        var chartSeries = acapp.DataFactory.createChartSeries(chartType);
        var chartConfig = {
            animation: false,
            backgroundColor: "#f2f2f2",
            borderRadius: 0,
            events: {
                click: function (e) {
                    e.data = view;
                    view.chartClick(e, model.get("id"));
                    /* Use instance of view to invoke callback so that
                    this is scoped to the view within that function. */
                }
            },
            renderTo: "chartContainer-" + model.get("id"),
            spacingBottom: 0,
            spacingLeft: 0,
            spacingRight: 8, //Y-axis labels get truncated if less
            spacingTop: 0
        };
        var xAxisConfig = {
            labels: { enabled: false },
            lineWidth: 0,
            tickLength: 0,
            title: { text: null }
        };
        var yAxisConfig = {
            gridLineWidth: 0,
            labels: { enabled: false },
            title: { text: null }
        }
        var plotConfig = {
            bar: {
                borderWidth: 0,
                shadow: true
            },
            area: {
                lineWidth: 0,
                marker: {
                    enabled: false
                },
            },
            scatter: {
                marker: {
                    lineWidth: 2,
                    radius: 4,
                }
            },
            series: {
                animation: false,
                enableMouseTracking: false,
                shadow: false
            }
        };
        switch (chartType) {
            case acapp.KPI_RVUS:
                plotConfig.area.threshold = 200;
                yAxisConfig.max = 200;
                yAxisConfig.tickInterval = 50;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 4),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_TRANSACTIONAL_GCR:
                plotConfig.area.threshold = 50;
                yAxisConfig.tickInterval = 5;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_MATCHED_COLLECTION_PERF:
                plotConfig.area.threshold = 25000;
                yAxisConfig.tickInterval = 5000;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_CHARGES:
                plotConfig.area.threshold = 30000;
                yAxisConfig.tickInterval = 5000;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_VOLUME:
                plotConfig.area.threshold = 1500;
                yAxisConfig.tickInterval = 250;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_DENIAL_CHARGES:
                plotConfig.area.threshold = 0;
                yAxisConfig.tickInterval = 5000;
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_DAYS_IN_AR:
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries.splice(0, 3),
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig,
                };
                break;
            case acapp.KPI_AR_AGING:
                chartConfig.type = "bar";
                //chartConfig.margin = [0, 8, 15, 30];
                xAxisConfig.categories = ["0-30", "31-60", "61+"];
                xAxisConfig.labels = {
                    align: "right",
                    enabled: true,
                    style: {
                        fontSize: "8px"
                    },
                    y: 3
                };
                yAxisConfig.gridLineWidth = 1;
                yAxisConfig.gridLineDashStyle = "ShortDash";
                yAxisConfig.labels = {
                    enabled: true,
                    style: {
                        color: "grey",
                        fontSize: "9px"
                    },
                    y: 10
                };
                //Min (start) and max (end) ticks only
                yAxisConfig.tickPositions = [0, 20000];
                /* Condense the number of bars for a KpiNavigator button */
                chartSeries = [
                    {
                        name: "AR Aging",
                        color: "#006b72",
                        data: [17250, 4481, 11121],
                        marker: { enabled: false },
                        type: "bar"
                    }
                ];
                plotConfig.bar.pointWidth = 5; //Thinner bars
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: { enabled: false },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig
                };
                break;

            case acapp.KPI_DENIAL_OPC:
                chartConfig.type = "bar";
                chartConfig.plotBorderWidth = 1;
                yAxisConfig.max = 4000;
                chartSeries = [
                    {
                        data: [1030, 1030, 1030]
                    },
                    {
                        data: [1211, 1211, 1211]
                    },
                    {
                        data: [1794, 1794, 1794]
                    }
                ];
                theChart = {
                    chart: chartConfig,
                    colors: ["#e7e7e7", "#e7e7e7", "#ce9725", "#e7e7e7", "#7b2686", "#e7e7e7", "#0c555d", "#e7e7e7", "#e7e7e7"],
                    credits: { enabled: false },
                    legend: { enabled: false },
                    plotOptions: {
                        bar: {
                            borderWidth: 0,
                            enableMouseTracking: false,
                            pointRange: 1,
                            pointWidth: 20
                        },
                        series: {
                            animation: false,
                            colorByPoint: true,
                            stacking: "normal",
                            shadow: false
                        }
                    },
                    series: chartSeries,
                    title: { text: null },
                    xAxis: xAxisConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
        }
        return theChart;
    },
    createFullChart: function (chartType, orientation, renderEl) {
        ///<summary>Create a large chart for main chart display. Typically the
        ///Highcharts config object created in this method creates a chart with
        ///greater detail for a larger viewport. </summary>
        ///<param name="chartType" type="string">One of the KPI chart tile id
        ///constants.</param>
        ///<param name="orientation" type="string">Either &quot;portrait&quot; 
        ///or &quot;landscape&quot;.</param>
        ///<return>A highcharts configuration object.</return>
        var theChart;
        var xAxisDateConfig = {
            categories: acapp.DEMO_DATE_RANGE,
            gridLineDashStyle: "Dot",
            gridLineWidth: 1,
            labels: {
                enabled: true,
                style: {
                    color: "#999",
                    fontSize: "10px"
                }
            },
            lineWidth: 1,
            tickmarkPlacement: "on",
            title: { text: null }
        };
        var chartSeries = acapp.DataFactory.createChartSeries(chartType);
        var markerConfig = {
            lineColor: "#ffffff",
            lineWidth: 2,
            radius: 5,
            symbol: "circle"
        };
        var legendConfig = {
            align: "right",
            borderWidth: 0,
            enabled: true,
            itemMarginTop:5,
            itemMarginBottom:5,
            layout: "vertical",
            margin: 10,
            width: 120,
            x: -20,
            y: -35
        };
        var chartConfig = {
            animation: false,
            backgroundColor: "#f2f2f2",
            events: {
                click: function (e) { $("body").trigger(xEvent); }
            },
            marginTop: 50,
            renderTo: renderEl
        };
        var plotConfig = {
            area: {
                lineWidth: 0,
                marker: {
                    enabled: false
                },
                threshold: 200
            },
            line: {
                size: "100%",
                lineWidth: 4,
                marker: markerConfig
            },
            scatter: {
                marker: {
                    lineWidth: 2,
                    radius: 6,
                }
            }
        };
        var yAxisConfig = {
            gridLineDashStyle: "Dot",
            gridLineWidth: 1,
            labels: {
                enabled: true,
                style: {
                    color: "#999",
                    fontSize: "10px"
                }
            },
            lineWidth: 1
        };
        /* Table shows more but we only graph the first 2 columns */
        chartSeries = chartSeries.splice(0, 4);
        //portrait mode so truncate the data in the column graph to fit.
        //Should use viewport width detection instead of orientation detection.
        //Event bound at FinancialDashboardView initialize
        if (orientation === "portrait") {
            xAxisDateConfig.tickInterval = 2;
            legendConfig = { borderWidth:0 };
        }
        var headerHtml = "<p style=\"padding-bottom:10px\">{point.key}:</p>";
        var pointHtml = "<p style=\"font-size:10px\">{series.name}</p><p style=\"font-size:20px\">{point.y}</p>";
        var tooltipCss = {
            color: "#ffffff",
            fontFamily: "FacitWeb",
            fontSize: "12px",
            padding: "10px"
        };
        var tooltipFormat = {
            backgroundColor: "rgba(82,76,122,0.75)",
            borderColor: "#ffffff",
            borderWidth: 2,
            headerFormat: headerHtml,
            pointFormat: pointHtml,
            style: tooltipCss,
            shared: true,
            useHTML: true
        };
        var chart;
        switch (chartType) {
            case acapp.KPI_RVUS:
                yAxisConfig.max = 200;
                yAxisConfig.tickInterval = 50;
                yAxisConfig.title = { text: null };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_TRANSACTIONAL_GCR:
                plotConfig.area.threshold = 1200;
                yAxisConfig.max = 50;
                yAxisConfig.tickInterval = 10;
                yAxisConfig.title = { text: "Percent" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_MATCHED_COLLECTION_PERF:
                yAxisConfig.max = 25000;
                yAxisConfig.tickInterval = 5000;
                yAxisConfig.title = { text: "Dollars" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions:plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_DENIAL_CHARGES:
                plotConfig.area.threshold = 0;
                yAxisConfig.max = 15000;
                yAxisConfig.tickInterval = 5000;
                yAxisConfig.title = { text: "Dollars" };
                //Truncate the volume sub-series.
                chartSeries = chartSeries.splice(0, 3);
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_DENIAL_VOLUME:
                plotConfig.area.threshold = 0;
                yAxisConfig.max = 600;
                yAxisConfig.tickInterval = 100;
                yAxisConfig.title = { text: "Units" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_DAYS_IN_AR:
                plotConfig.area.threshold = 0;
                markerConfig.fillColor = "#006b72";
                yAxisConfig.max = 170;
                yAxisConfig.tickInterval = 30;
                yAxisConfig.title = { text: "Days" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_VOLUME:
                plotConfig.area.threshold = 1500;
                yAxisConfig.max = 1500;
                yAxisConfig.tickInterval = 500;
                yAxisConfig.title = { text: "Units" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_CHARGES:
                plotConfig.area.threshold = 30000;
                yAxisConfig.max = 30000;
                yAxisConfig.tickInterval = 5000;
                yAxisConfig.title = { text: "Dollars" };
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    plotOptions: plotConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: xAxisDateConfig,
                    yAxis: yAxisConfig
                }; //end Chart
                break;
            case acapp.KPI_AR_AGING:
                //Original style anodyne bar chart
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    series: chartSeries,
                    plotOptions: plotConfig,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: {
                        categories: ["0-30", "31-60", "61-90", "91-120", "121-360", "361+"],
                        labels: {
                            enabled: true,
                            style: {
                                color: "#999",
                                fontSize: "10px"
                            }
                        },
                        title: { text: "Days" }
                    },
                    yAxis: {
                        labels: {
                            enabled: true,
                            style: {
                                color: "#999",
                                fontSize: "10px"
                            }
                        },
                        title: { text: "Dollars" }
                    }
                }; //end Chart
                break;
            /* DEPRECATED until convert KpiNavigator buttons from using 
            stacked bar chart */
            case acapp.KPI_DENIAL_OPC:
                theChart = {
                    chart: chartConfig,
                    credits: { enabled: false },
                    legend: legendConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat,
                    xAxis: {
                        categories: acapp.DENIALS_OPC_CATEGORIES
                    },
                    yAxis: { title: { text: null } }
                }; //end Chart
                break;
            default:
                //If you've reached this branch you're displaying bogus data
                theChart = {
                    chart: chartConfig,
                    legend: legendConfig,
                    series: chartSeries,
                    title: { text: null },
                    tooltip: tooltipFormat
                };
                break;
        }
        return theChart;
    },
    printify: function (model, config) {
        ///<summary>Given the configuration object for a full chart, modify it
        ///to be suitable for printing.</summary>
        ///<param name="model" type="KpiModel">KpiModel instance identifying
        ///the chart to modify for printing.</param>
        ///<param name="config" type="object">An object containing properties
        ///that Highcharts can use to configure a chart.</param>
        ///<return>A Highcharts configuration object.</return>
        config.tooltip = { enabled: false };
        config.chart.backgroundColor = "#ffffff";
        config.plotOptions.area.enableMouseTracking = false;
        config.plotOptions.line.enableMouseTracking = false;
        config.plotOptions.scatter.enableMouseTracking = false;
        config.chart.marginTop = 5;
        return config;
    }
};

acapp.DataFactory = {
    createChartSeries: function (chartType) {
        ///<summary>Create arrays suitable for use in highcharts containing
        ///data to render a particular chart type.</summary>
        ///<param name="chartType" type="string">One of the KPI chart tile id
        ///constants.</param>
        ///<return>Array data structures suitable for the requested chart to be
        ///used in the series attribute of a highcharts chart.</return>

        //Provider data is stephen mauk
        var data = null;
        switch (chartType) {
            case acapp.KPI_RVUS:
                /* Sorted ascending by date in anodyne demo */
                /* Use z-index to control stacking of line graphics because the
                tool tips seem to rely on the order of the elements in the data
                to determine what series point value gets shown first. */
                data = [
                    {
                        name: "RVUs",
                        color: "#006b72",
                        //data: [422.9, 765.3, 277.4, 737.9, 614.7, 573.4, 493.7, 697.2, 620.2, 372.2, 395.6, 518.8, 519.9, 568.8, 532.1, 689.6, 819.8, 1105, 1067.1, 650.6, 759.8, 718.8, 671.9, 958.9],
                        data: [66.6, 108.1, 55.4, 75.58, 93.2, 86.7, 85.9, 145.1, 60.1, 73.6, 81.1, 118.8, 105.7, 120.4, 54.4, 144.2, 54.5, 83.3, 65.1, 156.1, 112.2, 128.2, 71.6, 130.0],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex: 2
                    },
                    {
                        name: "Same month PY",
                        color: "#aaaaaa",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, 594.6, 422.9, 765.3, 277.4, 737.9, 614.7, 573.4, 493.7, 697.2, 620.2, 372.2, 395.6, 518.8],
                        data: [null, null, null, null, null, null, null, null, null, null, null, 172.9, 66.6, 108.1, 55.4, 75.5, 93.2, 83.3, 85.9, 145.1, 60.1, 73.6, 81.1, 118.8],
                        //data: [90, 90, 90, 90, 90, 90, 90, 90, 90, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 110, 110, 110],
                        dataLabels: { enabled: false },
                        lineWidth: 3,
                        marker: { enabled: false },
                        shadow: false,
                        type: "line",
                        zIndex: 1
                    },
                    {
                        name: "Target",
                        color: "#bbd57b",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, 30619, 66176, 45961, 58210, 20573, 55970, 59657, 17944, 53361, 35315, 43705, 29286, 23430],
                        data: [90, 90, 90, 90, 90, 90, 90, 90, 90, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 110, 110, 110],
                        type: "area",
                        zIndex: 0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 130.0],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        shadow: true,
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 3
                    },
                    {
                        name: "3-Month Avg",
                        color: "#cf992a",
                        data: [null, 594.2, 488.5, 593.5, 543.4, 642.0, 560.6, 588.1, 603.7, 563.2, 462.6, 428.9, 478.1, 535.8, 540.3, 596.9, 680.5, 871.5, 997.3, 940.9, 825.8, 709.7, 716.8, 783.2],
                        marker: {
                            enabled: false
                        },
                        type: "spline",
                        showInLegend: false,
                        visible: false,
                        zIndex: 4
                    },
                    {
                        name: "RVUs/Bus Day",
                        data: [20.1, 34.8, 12.6, 41.0, 27.9, 27.3, 26.0, 31.7, 28.2, 18.6, 18.0, 23.6, 24.8, 27.1, 25.3, 36.3, 37.3, 55.2, 56.2, 28.3, 34.5, 35.9, 30.5, 45.7]
                    },
                    {
                        name: "RVUs/Cal Day",
                        data: [13.6, 25.5, 8.9, 24.6, 19.8, 18.5, 17.6, 22.5, 20.7, 12.0, 13.2, 16.7, 16.8, 19.0, 17.2, 23.0, 26.4, 35.6, 38.1, 21.0, 25.3, 23.2, 22.4, 30.9]
                    },
                ];
                break;
            case acapp.KPI_CHARGES:
                data = [
                    {
                        name: "Charges",
                        color: "#006b72",
                        //data: [119745, 184161, 75462, 159343, 153547, 128078, 9940, 166802, 150631, 81689, 76851, 103197, 109595, 138702, 117617, 149618, 167765, 203646, 236239, 205352, 258580, 199718, 160532, 272761],
                        data: [11429, 18819, 9747, 14498, 15873, 15299, 14877, 25114, 10620, 12995, 14364, 20834, 19286, 21316, 11061, 25917, 9734, 14391, 11394, 27108, 20105, 21868, 12170, 11350],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex:1
                    },
                    {
                        name: "Target",
                        color: "#bbd57b",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, 159611, 119745, 184161, 75462, 159343, 153547, 128078, 99940, 166802, 150631, 81689, 76851, 103197],
                        data: [null, null, null, null, null, null, null, null, null, null, null, 31253, 11429, 18819, 9747, 14498, 15873, 15299, 14877, 25114, 10620, 12995, 14364, 20834],
                        dataLabels: { enabled: false },
                        marker: { enabled: false },
                        shadow: false,
                        type: "area",
                        zIndex:0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 11350],
                        marker: {
                            enabled: true,
                            fillColor: "#e95625",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex:2
                    },
                    {
                        name: "3-Month Avg",
                        color: "#cf992a",
                        data: [null, 154506, 126456, 139655, 129451, 146989, 127188, 131607, 139124, 133041, 103057, 87246, 96548, 117165, 121971, 135312, 145000, 173676, 202550, 215079, 233390, 221217, 206277, 211004],
                        marker: {
                            enabled: false
                        },
                        type: "spline",
                        showInLegend: false,
                        visible: false,
                        zIndex:3
                    }
                ];
                break;
            case acapp.KPI_DENIAL_CHARGES: //Denials by Charges
                data = [
                    {
                        name: "Charges",
                        color: "#006b72",
                        //data: [66176, 45961, 58210, 20573, 55970, 59657, 17944, 53361, 35315, 43705, 29286, 23430, 31269, 57080, 24875, 47738, 33757, 71325, 46458, 84576, 70717, 85246, 58262, 84233],
                        data: [14711, 2953, 2331, 1802, 10130, 2336, 1673, 4533, 3680, 2083, 2857, 3509, 3626, 4294, 4598, 4902, 5348, 2688, 2781, 3969, 4887, 3807, 3355, 2350],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex: 1
                    },
                    {
                        name: "Target",
                        color: "#bbd57b",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, 30619, 66176, 45961, 58210, 20573, 55970, 59657, 17944, 53361, 35315, 43705, 29286, 23430],
                        data: [null, null, null, null, null, null, null, null, null, null, null, 2436, 14711, 2953, 2331, 1802, 10130, 2336, 1673, 4533, 3680, 2083, 2957, 3609],
                        type: "area",
                        zIndex: 0
                    },
                    {
                        name: "Current Charges",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 2350],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 2
                    },
                    {
                        name: "Volume",
                        data: [520, 113, 98, 78, 164, 105, 92, 190, 116, 85, 131, 151, 154, 196, 172, 222, 197, 128, 134, 214, 244, 194, 151, 185],
                        marker: { enabled: false },
                        type: "line",
                        zIndex: 3
                    },
                    {
                        name: "3-Month Avg",
                        color: "#cf992a",
                        data: [null, 47585, 56782, 41581, 44918, 45400, 44524, 43654, 35540, 44127, 36102, 32140, 27995, 37260, 37741, 43231, 35457, 50940, 50513, 67453, 67250, 80180, 71408, 75914],
                        marker: {
                            enabled: false
                        },
                        showInLegend: false,
                        type: "spline",
                        visible: false,
                        zIndex: 4
                    }
                ];
                break;
            case acapp.KPI_DENIAL_VOLUME:
                data = [
                    {
                        name: "Volume",
                        color: "#006b72",
                        data: [520, 113, 98, 78, 164, 105, 92, 190, 116, 85, 131, 151, 154, 196, 172, 222, 197, 128, 134, 214, 244, 194, 151, 185],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex: 1
                    },
                    {
                        name: "Same month PY:",
                        color: "#cccccc",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, 30619, 66176, 45961, 58210, 20573, 55970, 59657, 17944, 53361, 35315, 43705, 29286, 23430],
                        data: [null, null, null, null, null, null, null, null, null, null, null, 103, 520, 113, 98, 78, 164, 105, 92, 190, 116, 85, 131, 151],
                        marker: { enabled: false },
                        shadow: false,
                        type: "line",
                        zIndex: 0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 185],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 2
                    }
                ];
                break;
            case acapp.KPI_DAYS_IN_AR:
                data = [
                    {
                        name: "DAR",
                        color: "#006b72",
                        //data: [118.14, 122.99, 133.12, 134.49, 122.52, 94.59, 109.71, 115.72, 113.41, 112.52, 130.67, 147.67, 133.53, 101.25, 97.28, 88.17, 90.51, 71.98, 75.72, 69.45, 62.32, 68.99, 70.23, 73.68],
                        data: [93.15, 114.64, 158.29, 160.14, 139.0, 104.57, 109.16, 117.26, 104.27, 111.95, 140.12, 107.37, 88.79, 72.91, 72.90, 73.38, 63.79, 58.35, 66.80, 62.36, 46.78, 42.07, 45.06, 50.05],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex:1
                    },
                    {
                        name: "Target",
                        color: "#bbd57b",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, null, 118,123,133,134,123,95,110,116,113,113,131,148],
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, 93, 115, 158, 160, 139, 105, 109, 117, 104, 112, 140, 107],
                        type: "area",
                        zIndex:0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 50.05],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 2
                    },
                    {
                        name: "3-Month Avg",
                        color: "#cf992a",
                        data: [null, null, 127.75, 130.20, 130.04, 117.20, 108.94, 106.67, 112.94, 113.88, 118.87, 130.29, 137.29, 127.49, 110.69, 95.57, 91.98, 83.55, 79.41, 72.38, 69.16, 66.92, 67.18, 70.97],
                        marker: {
                            enabled: false
                        },
                        showInLegend: false,
                        type: "spline",
                        visible: false,
                        zIndex: 3
                    },
                ];
                break;
            case acapp.KPI_AR_AGING:
                data = [
                    {
                        name: "AR Aging",
                        color: "#006b72",
                        data: [17250, 4481, 2811, 2930, 3751, 1629],
                        marker: { enabled: false },
                        type: "bar"
                    }
                ];
                break;
            case acapp.KPI_DENIAL_OPC:
                data = [
                    {
                        name: "Denial OPC",
                        color: "#006b72",
                        data: [43935, 26961, 25222, 3111, 1215, 191, 0, 0, 0, 0, 0],
                        marker: { enabled: false },
                        type: "bar"
                    }
                ];
                break;
            case acapp.KPI_TRANSACTIONAL_GCR:
                data = [
                    {
                        name: "Transact. GCR",
                        color: "#006b72",
                        //data: [null, null, null, null, null, null,33.20,38.98,40.27,38.84,32.21,32.12,35.54,39.31,36.91,40.95,45.85,37.62,37.53,36.48,42.24,40.08,34.57,38.19],
                        data: [null, null, null, null, null, null, 33.98, 38.82, 38.64, 38.57, 31.32, 32.18, 36.0, 39.14, 38.39, 40.61, 46.35, 37.98, 37.21, 36.81, 41.75, 40.55, 35.27, 39.48],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex:1
                    },
                    {
                        name: "Same Month PY",
                        color: "#cccccc",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 33.2,38.98,40.27,38.84,32.21,32.12],
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 33.98, 38.82, 38.64, 38.57, 31.32, 32.18],
                        dataLabels: { enabled: false },
                        lineWidth: 3,
                        marker: { enabled: false },
                        shadow: false,
                        type: "line",
                        zIndex: 0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 39.48],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex:2
                    }
                ]
                break;
            case acapp.KPI_MATCHED_COLLECTION_PERF:
                data = [
                    {
                        name: "Open AR",
                        color: "#006b72",
                        //data: [-396,-363,583,202,1397,112,174,1846,3288,1729,-65,4204,5203,9005,7656,11639,13792,14156,25390,36469,41322,58968,65583,217190],
                        data: [23, 80, 59, 3, 140, 192, 25, 49, 61, 155, 126, 121, 156, 506, 187, 915, 25, 729, 880, 1958, 3456, 3733, 5958, 21777],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex: 1
                    },
                    {
                        name: "Same Month PY",
                        color: "#bbd57b",
                        //data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
                        showInLegend: false,
                        type: "area",
                        zIndex: 0
                    },
                    {
                        name: "Dot",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 21777],
                        marker: {
                            enabled: true,
                            fillColor: "#006b72",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 2
                    }
                ]
                break;
            case acapp.KPI_VOLUME:
                data = [
                    {
                        name: "Units",
                        color: "#006b72",
                        //color: "#e95625",
                        //data: [-396,-363,583,202,1397,112,174,1846,3288,1729,-65,4204,5203,9005,7656,11639,13792,14156,25390,36469,41322,58968,65583,217190],
                        data: [476, 831, 448, 621, 715, 711, 740, 1096, 525, 568, 592, 993, 908, 952, 771, 1138, 440, 664, 534, 1263, 944, 1014, 611, 620],
                        marker: { enabled: false },
                        shadow: true,
                        type: "line",
                        zIndex:1
                    },
                    {
                        name: "Target",
                        color: "#bbd57b",
                        data: [null, null, null, null, null, null, null, null, null, null, null, 1089, 476, 831, 448, 621, 715, 711, 740, 1096, 525, 568, 592, 993],
                        marker: { enabled: false },
                        shadow: false,
                        type: "area",
                        zIndex: 0
                    },
                    {
                        name: "Current",
                        data: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 620],
                        marker: {
                            enabled: true,
                            fillColor: "#e95625",
                            lineColor: "#ffffff",
                            symbol: "circle"
                        },
                        showInLegend: false,
                        type: "scatter",
                        zIndex: 2
                    }
                ]
                break;
            default:
                data = [
                    {
                        name: "Default data",
                        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                        type: "column"
                    }
                ];
        }
        return data;
    },
    createTable: function (chartType) {
        ///<summary>Create a table showing the data for a chart type. The first
        ///column is always a month. Each series in the chart type is then 
        ///added as a separate column. This creates a very basic datagrid based
        ///on hacking two tables together and should be replaced by a real 
        ///datagrid.</summary>
        ///<param name="chartType" type="string">One of the KPI chart tile id
        ///constants.</param>
        ///<return>A HTML table string with the data</return>

        /* Hack to discard the 3rd data series which is being used to display a
        line graph with just a dot at the final month. */
        var DOT_COLUMN_IDX = 2;
        /* Pass tdata into the function if we need more flexibility. */
        var tdata = acapp.DataFactory.createChartSeries(chartType);
        var numCols = tdata.length;
        var numRows = tdata[0].data.length; //Assumes all series same length
        var firstColumn;
        var tableStr = "<table class=\"tableView\">";
        tableStr += "<tr>";
        //First Column here
        switch (chartType) {
            case acapp.KPI_AR_AGING:
                tableStr += "<th>Categories</th>";
                firstColumn = acapp.AR_AGING_CATEGORIES;
                break;
            case acapp.KPI_DENIAL_OPC:
                tableStr += "<th>Categories</th>";
                firstColumn = acapp.DENIALS_OPC_CATEGORIES;
                break;
            default:
                tableStr += "<th>Month</th>";
                firstColumn = acapp.DEMO_DATE_RANGE;
        }
        for (var i = 0; i < numCols; i++) {
            if (i == DOT_COLUMN_IDX) continue;
            tableStr += "<th>";
            tableStr += tdata[i].name;
            tableStr += "</th>";
        }
        tableStr += "</tr>";
        tableStr += "</table>";
        tableStr += "<div class=\"tableBody\">";
        tableStr += "<table class=\"tableView\">";
        for (var j = numRows - 1; j >= 0; j--) {
            tableStr += "<tr>";
            tableStr += "<td>" + firstColumn[j] + "</td>";
            for (var k = 0; k < numCols; k++) {
                if (k == DOT_COLUMN_IDX) continue;
                tableStr += "<td>";
                tableStr += (tdata[k].data[j] === null) ? "" : tdata[k].data[j];
                tableStr += "</td>";
            }
            tableStr += "</tr>";
        }
        tableStr += "</table>";
        tableStr += "</div>";
        return tableStr;
    },
    createKpiCollection: function (theme) {
        ///<summary>Create models of KPIs depending on theme.</summary>
        ///<param name="theme" type="string">Either THEME_PRODUCTIVITY or
        ///THEME_FINANCE.</param>
        ///<return>KpiCollection containing differing by theme.</return>
        var kpiThemeCol = new acapp.KpiCollection();
        switch (theme) {
            case acapp.THEME_STANDARD:
                var kpis = [acapp.KPI_DAYS_IN_AR, acapp.KPI_RVUS, acapp.KPI_AR_AGING,
                    acapp.KPI_CHARGES, acapp.KPI_DENIAL_CHARGES,
                    acapp.KPI_MATCHED_COLLECTION_PERF, acapp.KPI_VOLUME,
                    acapp.KPI_TRANSACTIONAL_GCR
                ];
                return acapp.DataFactory.createKpiTheme(kpis);

            case acapp.THEME_FINANCE:
                var kpis = [acapp.KPI_RVUS, acapp.KPI_DENIAL_CHARGES, acapp.KPI_CHARGES,
                    acapp.KPI_AR_AGING, acapp.KPI_DAYS_IN_AR,
                    acapp.KPI_DAYS_IN_AR, acapp.KPI_MATCHED_COLLECTION_PERF,
                    acapp.KPI_TRANSACTIONAL_GCR
                ];
                return acapp.DataFactory.createKpiTheme(kpis);

            case acapp.THEME_PRODUCTIVITY:
                var kpis = [acapp.KPI_VOLUME, acapp.KPI_RVUS];
                return acapp.DataFactory.createKpiTheme(kpis);

            case acapp.THEME_ALERT:
                var kpis = [acapp.KPI_CHARGES, acapp.KPI_VOLUME];
                return acapp.DataFactory.createKpiTheme(kpis);

            case acapp.THEME_PRINT:
                var kpis = [acapp.KPI_DAYS_IN_AR, acapp.KPI_RVUS, acapp.KPI_AR_AGING,
                    acapp.KPI_CHARGES, acapp.KPI_DENIAL_CHARGES,
                    acapp.KPI_MATCHED_COLLECTION_PERF, acapp.KPI_VOLUME,
                    acapp.KPI_TRANSACTIONAL_GCR
                ];
                var kpiThemeCol = acapp.DataFactory.createKpiTheme(kpis);
                //All off by default.
                for (var i = 0; i < kpis.length-2; i++) {
                    kpiThemeCol.at(i).set("show", false);
                }
                return kpiThemeCol;
        }
    },
    createKpiTheme: function (kpis) {
        ///<summary>Helper function to createKpiCollection</summary>
        ///<param name="kpis" type="array">Array of strings with KPI id constants</param>
        ///<return>A KpiCollection containing a KpiModel for each item in the
        ///kpis array.</return>
        function getKpi(kpi) {
            switch (kpi) {
                case acapp.KPI_RVUS:
                    return new acapp.KpiModel({
                        id: acapp.KPI_RVUS,
                        benchmarkDesc: "Target:",
                        currentMetric: 130.0,
                        inTarget: true,
                        largeView: acapp.BUTTON_TPL_TARGET_LARGE,
                        priorPeriod: 110.0,
                        navButtonView: acapp.BUTTON_TPL_VS_PRIOR_YEAR,
                        smallView: acapp.BUTTON_TPL_TARGET_SMALL,
                        show: true,
                        template: acapp.CONTROL_TPL_RVUS,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_RVUS]
                    });
                case acapp.KPI_DENIAL_CHARGES:
                    return new acapp.KpiModel({
                        id: acapp.KPI_DENIAL_CHARGES,
                        benchmarkDesc: "Target:",
                        currentMetric: "$2,350",
                        inTarget: true,
                        largeView: acapp.BUTTON_TPL_TARGET_LARGE,
                        navButtonView: acapp.BUTTON_TPL_TARGET_NAV,
                        priorPeriod: "$3,509",
                        show: true,
                        smallView: acapp.BUTTON_TPL_TARGET_SMALL,
                        template: acapp.CONTROL_TPL_DENIAL_TREND,
                        title: "Denials"
                    });
                case acapp.KPI_CHARGES:
                    return new acapp.KpiModel({
                        id: acapp.KPI_CHARGES,
                        benchmarkDesc: "Target:",
                        currentMetric: "$11.4K",
                        inTarget: false,
                        priorPeriod: "$20.8K",
                        largeView: acapp.BUTTON_TPL_TARGET_LARGE,
                        navButtonView: acapp.BUTTON_TPL_TARGET_NAV,
                        smallView: acapp.BUTTON_TPL_TARGET_SMALL,
                        show: true,
                        template: acapp.CONTROL_TPL_CHARGES,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_CHARGES]
                    });
                case acapp.KPI_VOLUME:
                    return new acapp.KpiModel({
                        id: acapp.KPI_VOLUME,
                        benchmarkDesc: "Target:",
                        currentMetric: "620",
                        inTarget: false,
                        priorPeriod: "933",
                        largeView: acapp.BUTTON_TPL_TARGET_LARGE,
                        navButtonView: acapp.BUTTON_TPL_TARGET_NAV,
                        smallView: acapp.BUTTON_TPL_TARGET_SMALL,
                        show: false,
                        template: acapp.CONTROL_TPL_CHARGES,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_VOLUME]
                    });
                case acapp.KPI_AR_AGING:
                    return new acapp.KpiModel({
                        id: acapp.KPI_AR_AGING,
                        cat1Val: "$17.3K", //17250
                        cat2Val: "$4,481", //4481
                        cat3Val: "$11.1K", //2811+2930+3751+1629 =11121
                        largeView: acapp.BUTTON_TPL_AR_AGING_LARGE,
                        navButtonView: acapp.BUTTON_TPL_AR_AGING,
                        show: true,
                        smallView: acapp.BUTTON_TPL_AR_AGING_SMALL,
                        template: acapp.CONTROL_TPL_AR_AGING,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_AR_AGING]
                    });
                case acapp.KPI_DENIAL_OPC:
                    return new acapp.KpiModel({
                        id: acapp.KPI_DENIAL_OPC,
                        cat1Val: "1,794",
                        cat2Val: "1,211",
                        cat3Val: "1,030",
                        contextTitle: "Denials by Original Payer Class",
                        largeView: acapp.BUTTON_TPL_DENIAL_OPC_LARGE,
                        navButtonView: acapp.BUTTON_TPL_DENIAL_OPC,
                        show: true,
                        smallView: acapp.BUTTON_TPL_DENIAL_OPC_SMALL,
                        template: acapp.CONTROL_TPL_DENIAL_OPC,
                        title: "Denials by O.P.C. (Top 3)"
                    });

                case acapp.KPI_DAYS_IN_AR:
                    return new acapp.KpiModel({
                        id: acapp.KPI_DAYS_IN_AR,
                        benchmarkDesc: "Target:",
                        currentMetric: 50.05,
                        
                        largeView: acapp.BUTTON_TPL_TARGET_LARGE,
                        priorPeriod: 107.37,
                        navButtonView: acapp.BUTTON_TPL_TARGET_NAV,
                        smallView: acapp.BUTTON_TPL_TARGET_SMALL,
                        show: true,
                        template: acapp.CONTROL_TPL_DAYS_IN_AR,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_DAYS_IN_AR]
                    });
                case acapp.KPI_TRANSACTIONAL_GCR:
                    return new acapp.KpiModel({
                        id: acapp.KPI_TRANSACTIONAL_GCR,
                        currentMetric: "39.5%",
                        largeView: acapp.BUTTON_TPL_VS_PRIOR_YEAR_LARGE,
                        priorPeriod: "32.2%",
                        navButtonView: acapp.BUTTON_TPL_VS_PRIOR_YEAR,
                        smallView: acapp.BUTTON_TPL_VS_PRIOR_YEAR_SMALL,
                        show: false,
                        template: acapp.CONTROL_TPL_DEFAULT,
                        title: acapp.KPI_LABEL_LOOKUP[acapp.KPI_TRANSACTIONAL_GCR]
                    });
                case acapp.KPI_MATCHED_COLLECTION_PERF:
                    return new acapp.KpiModel({
                        id: acapp.KPI_MATCHED_COLLECTION_PERF,
                        benchmarkDesc: "typical month:",
                        currentMetric: "$21.2K",
                        priorPeriod: "$954",
                        largeView: acapp.BUTTON_TPL_VS_PRIOR_YEAR_LARGE,
                        navButtonView: acapp.BUTTON_TPL_VS_PRIOR_YEAR,
                        settingsTitle: "Matched Collection Performance (Open AR)",
                        smallView: acapp.BUTTON_TPL_VS_PRIOR_YEAR_SMALL,
                        show: true,
                        template: acapp.CONTROL_TPL_RVUS,
                        title: "Matched Col. Perf (Open AR)"
                    });
            } //end switch
        }
        var kpiThemeCol = new acapp.KpiCollection();
        for (var i = 0; i < kpis.length; i++) {
            kpiThemeCol.add(getKpi(kpis[i]));
        }
        return kpiThemeCol;
    }
};