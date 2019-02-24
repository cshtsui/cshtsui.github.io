///<reference path="jquery-1.10.1.min.js"/>
///<reference path="backbone-min.js"/>
///<reference path="datastore.js"/>
///<reference path="models.js"/>
///<reference path="entities.js"/>
$(document).ready(function () {
    if (!Array.hasOwnProperty("isArray")) {
        Array.isArray = function (value) {
            return Object.prototype.toString.call(value) === "[object Array]";
        };
    }
    var appRouter = new ac.MainRouter();
});

ac.addFiltersMenu = null;
ac.TypesDP = null;
ac.DepartmentsDP = null;
ac.ProvidersDP = null;
ac.ProviderRegistry = new Array();
ac.filterBar = null;
ac.filterList = new Array();

ac.actions = {
    addFilter: function (el, e) {
        ///<summary>Show the add filter menu.</summary>
        console.info("[addFilter]");
        var tpl = ac.getTemplate(ac.ADD_FILTER_TAB_TPL).jqote({});
        $(el).append(tpl);
        ac.addEventHandlers($(el));
        if (ac.addFiltersMenu == null) {
            var filters = new ac.FilterBarCol();
            filters.reset(ac.filterList);
            ac.addFiltersMenu = new ac.AddFiltersMenuView({
                collection: filters,
                tabEl: $(el)
            });
            ac.addFiltersMenu.render();
        }
        else {
            ac.addFiltersMenu.dialog.show();
        }
    },
    addFilterToBar: function (el, e) {
        ///<summary>Add filter bar buttons to filter bar.</summary>
        var selectedIndex = parseInt(el.attributes["data-index"].value);
        $("#addNewFilterLabel").hide();
        $("#addFilterButton .addFilterPopupTab").remove();
        //Add FilterBarItem
        ac.filterBar.addButton(ac.filterList[selectedIndex]);
        ac.addFiltersMenu.dialog.hide();
    },
    appliedFiltersMenuClick: function (el, e) {
        //TODO: Figure out why lesscss stops this from working
        //$("#appliedFiltersMenu").addClass("#appliedFiltersMenu slideDown");
        $("#appliedFiltersMenu").css("top", "40px");
        var allFilters = new ac.AppliedFiltersView({
            collection:ac.filterBar.collection
        });
        allFilters.render();
    },
    cancelAppliedFilters: function (el, e) {
        $("#appliedFiltersMenu").css("top", "-75%");
    },
    hideFilterPanel: function (el, e) {
        ///<summary>Hide the add filter menu</summary>
        console.info("[hideFilterPanel]");
        e.stopPropagation();
        ac.addFiltersMenu.dialog.hide();
        $(".addFilterPopupTab").remove();
    },
    popUpFilterDialog: function (model) {
        ///<param name="model" type="FilterBarItem"></param>
        switch (model.get("value")) {
            case "organizationFilter":
                var groupedOrder = new Array();
                var allTypes = ac.TypesDP.getAll();
                var allDepts = ac.DepartmentsDP.getAll();
                var allProviders = ac.ProvidersDP.getAll();
                var naturalOrder = new Array();
                naturalOrder.push(allTypes);
                naturalOrder.push(allDepts);
                naturalOrder.push(allProviders);
                //Dismiss any previously open hierarchy panel.
                $("#hierarchyPanel").remove();
                var hierarchy = new ac.TreeFilterView({
                    columnOrder: naturalOrder
                });
                hierarchy.render();
                model.set("dialogView", hierarchy);
                //ac.toggleModalScreen();
                break;
        }
    },
    removeFilterBarButton: function (el, e) {
        ac.filterBar.removeButton(el.id);
        if (ac.filterBar.collection.length == 0) {
            $("#addNewFilterLabel").show();
        }
    }
};

ac.getTemplate = function (templateFile) {
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
ac.addEventHandlers = function (containerEl, actionObj) {
    ///<summary>Set up calls to functions in the actions registry. Run this
    ///when a view is loaded with clickable actions.</summary>
    ///<param name="containerEl" type="jquery node">The element to traverse to 
    ///look for data-action attributes.</param>
    ///<param name="actionObj" type="Object">Optional. The object in which 
    ///to invoke the function specified in the data-action. If unspecified
    ///the default is ac.actions.</param>
    if (actionObj == null || actionObj == undefined) {
        actionObj = ac.actions;
    }
    containerEl.find("[data-action]").each(function (index) {
        $(this).off("click").on("click", function (e) {
            var attr = this.attributes["data-action"];
            var dataAction = null;
            if (attr) {
                dataAction = attr.value;
            }
            //If data-route function is in acapp.actions object then invoke it.

            if (dataAction && actionObj[dataAction]) {
                actionObj[dataAction](this, e); //this=anchor element
            }
        });
    });
    containerEl.find("[data-change]").each(function (index) {
        $(this).off("change").on("change", function (e) {
            var attr = this.attributes["data-change"];
            var dataAction = null;
            if (attr) {
                dataAction = attr.value;
            }
            if (dataAction && actionObj[dataAction]) {
                actionObj[dataAction](this, e); //this=anchor element
            }
        });
    });
};
ac.removeEventHandlers = function (containerEl) {
    containerEl.find("[data-action]").each(function (index) {
        $(this).off("click");
    });
    containerEl.find("[data-change]").each(function (index) {
        $(this).off("change");
    });
}
ac.toggleModalScreen = function () {
    $("#modalScreen").toggle();
};

ac.MainRouter = Backbone.Router.extend({
    routes: {
        "": "start",
        "*catchall": "defaultRoute"
    },
    initialize: function (options) {
        ac.filterList.push(new ac.FilterBarItem({
            id: 101,
            label: "Organization",
            value: "organizationFilter"
        }));
        ac.filterList.push(new ac.FilterBarItem({
            id:102,
            label: "Begin Date",
            value: "beginDateFilter"
        }));
        ac.filterList.push(new ac.FilterBarItem({ id:103, label: "End Date" }));
        ac.filterList.push(new ac.FilterBarItem({ id:104, label: "Date Range" }));
        ac.filterList.push(new ac.FilterBarItem({ id:105, label: "Diagnosis" }));
        ac.filterList.push(new ac.FilterBarItem({ id:106, label: "Payer" }));
        ac.filterList.push(new ac.FilterBarItem({ id:107, label: "Reporting Category" }));
        ac.filterList.push(new ac.FilterBarItem({ id:108, label: "At Risk" }));
        ac.filterBar = new ac.FilterBarView();

        ac.TypesDP = new ac.TypesDp(ac.Datastore.createTypesTable());
        ac.DepartmentsDP = new ac.DepartmentsDp(ac.Datastore.createDepartmentsTable());
        ac.ProvidersDP = new ac.ProvidersDp(ac.Datastore.createProvidersTable());
        //Key each dataprovider to it's order in the hierarchy we can reference
        //them generically in the TreeFilterView
        ac.ProviderRegistry[0] = ac.TypesDP;
        ac.ProviderRegistry[1] = ac.DepartmentsDP;
        ac.ProviderRegistry[2] = ac.ProvidersDP;
        Backbone.history.start();
    },
    start: function () {
        ac.addEventHandlers($("body"));
    },
    defaultRoute: function (catchall) {
        ///<summary>Do not use. Unaccounted for routes go here.</summary>
        console.log("[MainRouter.defaultRoute] Routed to: " + catchall);
    }
});

ac.AddFiltersMenuView = Backbone.View.extend({
    el: "#menuArea",
    dialog: null,
    $tabEl: null,    //The tab in the filter bar associated with this menu.
    initialize: function (options) {
        this.view = this;
        this.$tabEl = options.tabEl;
    },
    positionMenu: function (panel) {
        ///<param name="panel" type="jquery object">The panel to be positioned</param>
        var RIGHT_MARGIN = 10;
        var left = this.$tabEl.position().left;
        var panelWidth = panel.width();
        var windowWidth = $(window).width();
        /* Make sure the menu is always placed on screen */
        if (left + panelWidth > windowWidth) {
            left = windowWidth - panelWidth - RIGHT_MARGIN;
        }
        panel.css("left", left);
    },
    render: function () {
        var inst = this.view;
        var tpl = ac.getTemplate(ac.ADD_FILTER_PANEL_TPL).jqote({
            models: inst.collection.models
        });
        inst.$el.append(tpl);
        inst.dialog = $("#addFilterListPanel");
        inst.positionMenu(inst.dialog);
        ac.addEventHandlers(inst.dialog);
    }
});

ac.FilterBarView = Backbone.View.extend({
    el: "#filterScroller",
    offScreenTally:null,
    addButton: function (model) {
        ///<param name="model" type="FilterBarItem"></param>
        var inst = this.view;
        /* A filter can only be added once to the filter bar */
        if (inst.collection.get(model) !== undefined) {
            return;
        }
        inst.collection.push(model);
        var obj = model.toJqoteObj();
        tpl = ac.getTemplate(ac.FILTER_BAR_ITEM_TPL).jqote(obj);
        inst.$el.prepend(tpl);
        ac.addEventHandlers(inst.$el);
        inst.calcOffScreenButtons();
        /* Immediately popup filter dialog when added to filterbar. */
        ac.actions.popUpFilterDialog(model);
        $("#filterButton_" + model.id).on("click", function (e) {
            var dialogView = model.get("dialogView");
            if (dialogView == null) {
                return; //Dialog not implemented; wouldn't happen in production
            }
            var openDialog = dialogView.dialog;
            if (!openDialog.is(":visible")) {
                ac.actions.popUpFilterDialog(model);
            }
        });
    },
    calcOffScreenButtons: function () {
        function pxToInt(pxStr) {
            var len = pxStr.length - 2;
            return parseInt(pxStr.substr(0, len));
        }
        /* Compute how many filter bar items are [partially] off screen */
        /* parent of #filterScroller is #filterBucket. Cannot use 
        #filterScroller since it is purposefully REALLY wide. */
        var inst = this.view;
        var scrollerWidth = inst.$el.parent().width();
        /* Include as "offscreen" 1/2 the image gradient overlay width since 1/2
        is mostly visible and does not appear "offscreen". */
        var allButtonsWidth = 10; 
        var overflowedButtons = 0;
        inst.$el.find(".filterBarButton").each(function (index) {
            var button = $(this);
            allButtonsWidth += button.width();
            allButtonsWidth += pxToInt(button.css("padding-left"));
            allButtonsWidth += pxToInt(button.css("padding-right"));
            allButtonsWidth += pxToInt(button.css("margin-left"));
            allButtonsWidth += pxToInt(button.css("margin-right"));
            if (allButtonsWidth > scrollerWidth) {
                overflowedButtons++;
            }
        });
        //console.info("[getNumOffScreenButtons] scrollwidth=" + scrollerWidth +
        //             ", allButtonsWidth=" + allButtonsWidth +
        //             ", overflowedButtons=" + overflowedButtons);
        inst.offScreenTally.trigger("change:count",overflowedButtons);
    },
    initialize: function (options) {
        this.collection = new ac.FilterBarCol();
        this.view = this;
        this.offScreenTally = new Object();
        this.offScreenTally.count = 0;
        _.extend(this.offScreenTally, Backbone.Events);
        this.offScreenTally.on("change:count", function (newCount) {
            this.count = newCount;
            var badge = $("#offscreenBadge");
            if (this.count > 0) {
                badge.text(this.count);
                badge.show();
            }
            else {
                badge.hide();
            }
        });
        $(window).on("resize", this, function (e) {
            e.data.calcOffScreenButtons();
        });
    },
    removeButton: function (elementId) {
        var inst = this.view;
        var prefixEndIdx = "barItemClose_".length;
        var id = parseInt(elementId.substring(prefixEndIdx));
        var m = inst.collection.get(id);
        if (m.get("dialogView") !== null) {
            m.get("dialogView").dialog.remove();
        }
        inst.collection.remove(m);
        inst.$el.find("#" + elementId)
                .parents("div[data-parent=\"filterBarItemContainer\"]")
                .remove();
        inst.calcOffScreenButtons();
    }
});

ac.AppliedFiltersView = Backbone.View.extend({
    el: "#appliedFiltersMenu",
    initialize: function (options) {
        this.view = this;
    },
    render: function () {
        var inst = this.view
        var unappliedCol = new Array();
        for (var i = 0; i < ac.filterList.length; i++) {
            var m = inst.collection.get(ac.filterList[i]);
            if (m == null) {
                unappliedCol.push(ac.filterList[i]);
            }
        }
        var tpl = ac.getTemplate(ac.APPLIED_FILTERS_PANEL_TPL).jqote({
            collection: inst.collection.models,
            unappliedCol: unappliedCol
        });
        inst.$el.empty().append(tpl);
        ac.addEventHandlers(inst.$el);
    }
});