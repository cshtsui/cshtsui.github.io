ac.FILTER_TYPE = "Type";
ac.FILTER_DEPARTMENT = "Department";
ac.FILTER_PROVIDER = "Provider";
ac.ADD_FILTER_TAB_TPL = "partial/addFilterTabTpl.html";
ac.ADD_FILTER_PANEL_TPL = "partial/addFilterPanelTpl.html";
ac.APPLIED_FILTERS_PANEL_TPL = "partial/appliedFiltersPanelTpl.html";
ac.FILTER_BAR_ITEM_TPL = "partial/filterBarItemTpl.html";
ac.FILTER_COLUMN_TPL = "partial/filterColumnTpl.html";
ac.FILTER_TAB_TPL = "partial/filterTabTpl.html";
ac.FILTER_PANEL_TPL = "partial/filterPanelTpl.html";
ac.SUMMARY_ITEM_TPL = "partial/summaryItemTpl.html";
ac.SUMMARY_PANEL_TPL = "partial/summaryPanelTpl.html";
ac.TREE_COLUMN_TPL = "partial/treeColumnTpl.html";
ac.TREE_COLUMN_GROUPED_ITEM_TPL = "partial/treeColumnGroupedItemTpl.html";
ac.TREE_COLUMN_NATURAL_ITEM_TPL = "partial/treeColumnNaturalItemTpl.html";
ac.TREE_COLUMN_GROUPED_ITEM_LINKS_TPL = "partial/treeColumnGroupedItemLinksTpl.html";

ac.FilterBarItem = Backbone.Model.extend({
    defaults: {
        id: -1,
        action: "noaction",
        dialogView: null,
        filterCriteria: "",
        label: "ac.FilterBarItem.label",
        value: ""
    },
    toJqoteObj: function () {
        return {
            id: this.get("id"),
            action: this.get("action"),
            filterCriteria: this.get("filterCriteria"),
            label: this.get("label"),
            value: this.get("value")
        };
    }
});

ac.FilterBarCol = Backbone.Collection.extend({
    model: ac.FilterBarItem
});

ac.TreeItem = Backbone.Model.extend({
    defaults: {
        mid: -1,
        category: "no category",
        group: "ungrouped",
        groupId: -1,
        /* Hacky way of notifying the treeColumnGroupedItemTpl that the
        checkbox for a group should be checked because all its children
        are selected. Done due to lack of time to retroactively hack in a
        proper group container collection for TreeItem. */
        groupSelected:false,
        name: "unlabeled",
        /* Could have more than one, but only need one for presentation since 
        children with multiple parents will appear with each parent. */
        parentId:null,          
        value: null,    //data corresponding to label
        visualState: 1  //UNSELECTED (not defined yet at this point)
    }
});
ac.TreeItem.const = {};
ac.TreeItem.const.UNSELECTED = 1;
ac.TreeItem.const.SELECTED = 2;
ac.TreeItem.const.PARENT = 3;
ac.TreeItem.const.FILTERED = 4;

ac.TreeItemCol = Backbone.Collection.extend({
    category: "no category",
    model: ac.TreeItem,
    exceededRecordCount: -1,
    title: "no title",
    tooManyRecords: false
});

ac.SummaryItem = Backbone.Model.extend({
    defaults: {
        isEmpty: true,
        /* Each element in path is of type ac.TreeItemCol.
        The number of elements corresponds to the number of hierarchy levels.
        Each ac.TreeItemCol in path contains the selected ac.TreeItem models
        for that level. The order of the elements in path should be the order
        in which the label needs to be generated (e.g. leaf to root node of 
        the hierarchy). */
        path: [],
        label: "(empty)",   //Text to show in the summary panel.
        selected: false
    },
    clear: function () {
        startCategory = null;
        selected = false;
        label = "";
        this.set("path", []);
    }
});

ac.SummaryItemCol = Backbone.Collection.extend({
    model:ac.SummaryItem
});