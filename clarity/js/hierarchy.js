///<reference path="jquery-1.10.1.min.js"/>
///<reference path="backbone-min.js"/>
///<reference path="datastore.js"/>
///<reference path="models.js"/>
///<reference path="entities.js"/>
ac.SummaryView = Backbone.View.extend({
    treeView: null,
    initialize: function (options) {
        //this.collection<SummaryItem>
        this.collection.on("change:path", this.itemChangePath, this);
        this.collection.on("remove", this.itemRemove, this);
        this.collection.on("add", this.itemAdd, this);
        this.treeView = options.treeFilterView;
        this.view = this;
    },
    addAnother: function (el, e) {
        var inst = this.view;
        console.info("[SummaryView.addAnother] " + inst.treeView.currentSummaryItem.get("isEmpty"));
        //Don't allow addition of new items until the current one has
        //been "used" by adding any kind of selection.
        if (inst.treeView.currentSummaryItem.get("isEmpty")) {
            return;
        }
        this.treeView.clearSelection();
        this.treeView.addNewSummaryItem();
    },
    applySelected: function (el, e) {
        //this.cancel(el, e);
        //$("#filterButton_101").html("Summary copy TBD<span class=\"filterBarItemCloseX\"><a id=\"barItemClose_101\" data-action=\"removeFilterBarButton\">x</a></span>");
    },
    cancel: function (el, e) {
        e.data = this.treeView;
        this.treeView.closeDialog(e);
    },
    clearSummaryItem: function (el, e) {
        console.info("[clearSummaryItem]");
        var item = this.collection.get(el.attributes["data-cid"].value);
        /* TODO: A bit dangerous since the event posting could be async to 
        this.treeView.clearSelection. Should find out if true, but works
        for the moment. */
        this.collection.remove(item);
        if (this.collection.length == 0) {
            this.treeView.clearSelection();
            this.treeView.addNewSummaryItem();
        }
        else if (item === this.treeView.currentSummaryItem) {
            this.treeView.clearSelection();
            this.treeView.addNewSummaryItem();
        }
    },
    itemAdd: function (item) {
        ///<summary>Responds to "Add another Selection" in summary panel</summary>
        var inst = this.view;
        console.info("[SummaryView.itemAdd]");
        inst.render();
    },
    itemChangePath: function (item) {
        ///<param name="item" type="SummaryItem">The item in which the 
        ///change to path occurred</param>
        var inst = this.view;
        if (item.get("path").length > 0) {
            item.set("isEmpty", false);
            var tpl = ac.getTemplate(ac.SUMMARY_ITEM_TPL);
            newLabel = tpl.jqote({
                maxLabelsPerCategory: 3,
                path: item.get("path")
            });
            item.set("label", newLabel);
        }
        else {
            item.set("isEmpty", true);
            item.set("label", "(empty)");
        }
        inst.render();
    },
    itemRemove: function (e) {
        var inst = this.view;
        console.info("[SummaryView.itemRemove]");
        inst.render();
    },
    render: function () {
        var inst = this.view;
        var tpl = ac.getTemplate(ac.SUMMARY_PANEL_TPL).jqote({
            models: inst.collection.models
        });
        inst.$el.empty().append(tpl);
        ac.addEventHandlers(inst.$el, inst);
    }
});

/* Code related to hierarchy dialog */
ac.TreeFilterView = Backbone.View.extend({
    categoryDict: null,     //Array of ac.TreeColumnView; 1 element per hierarchy level
    columnOrder: null,      //Array of ac.TreeItemCol; 1 element per hierarchy level
    currentSummaryItem: null,//Tree selections stored here until "Apply Selected"
    dialog: null,           //Reference to jQuery("#hierarchyPanel")
    el: "#menuArea",
    initialCategory: null,  //String of category name
    initialDepth: -1,       //Used to help TreeColumnView determine left/right-ness
    naturalOrder: null,
    summaryCollection: null,//ac.SummaryItemCol for the summary panel
    summaryView: null,
    initialize: function (options) {
        //activate the template's event handlers        
        var tpl = ac.getTemplate(ac.FILTER_PANEL_TPL).jqote({});
        this.$el.append(tpl);
        this.dialog = this.$el.find("#hierarchyPanel");
        //Arbitrary 8px offset from the bottom of header for aesthetics.
        this.dialog.css("top", 8);
        this.dialog.find("#closeX").on("click", this, this.closeDialog);
        this.categoryDict = new Array();
        this.columnOrder = options.columnOrder;
        this.summaryCollection = new ac.SummaryItemCol();
        this.summaryCollection.push(new ac.SummaryItem());
        this.currentSummaryItem = this.summaryCollection.at(0);
        this.view = this;
    },
    addNewSummaryItem: function () {
        var inst = this.view;
        /* Create a new summary item ready for modification immediately following
        a removal so that interactions with the tree can go somewhere. */
        var freshSummaryItem = new ac.SummaryItem();
        freshSummaryItem.set("label", "(empty)");
        freshSummaryItem.set("isEmpty", true);
        inst.summaryCollection.push(freshSummaryItem);
        inst.currentSummaryItem = inst.summaryCollection.get(freshSummaryItem);
    },
    clearSelection: function () {
        ///<summary>For each column clear the selected items and reset the visual
        ///state to everything unselected. </summary>
        var inst = this.view;
        inst.initialCategory = null;
        inst.initialDepth = -1;
        /* No items in summary panel means we should reset the view to allow a 
        fresh selection. */
        for (var i = 0; i < inst.categoryDict.length; i++) {
            var currentColumn = inst.categoryDict[i];
            currentColumn.selectedItems.forEach(function (m) {
                m.set("visualState", ac.TreeItem.const.UNSELECTED);
            });
            currentColumn.selectedItems.reset();
            currentColumn.collection.reset(inst.columnOrder[i].models);
            currentColumn.$el.find("#" +
                currentColumn.collection.category + "_label")
                .removeClass("selectedColumnLabel");
            $("#" + inst.categoryDict[i].category + "_searchBox input").val("");
            currentColumn.render();
        }
    },
    closeDialog: function (e) {
        var inst = e.data;
        inst.dialog.remove();
        //ac.toggleModalScreen();
    },
    getDepth: function (category) {
        ///<summary>Given a category name determine it's depth in the 
        ///hierarchy.</summary>
        ///<param name="category" type="string">Name of category</param>
        var inst = this.view;
        for (var i = 0; i < inst.columnOrder.length; i++) {
            if (category === inst.columnOrder[i].category) {
                return i;
            }
        }
        return -1;
    },
    render: function () {
        ///<summary>Renders all columns for initial display.</summary>
        /* For each filterColumnView.render and key the category name of
        the column into categoryDict. Each TreeColumnView renders on 
        instantiation. */
        var inst = this.view;
        for (var i = 0; i < inst.columnOrder.length; i++) {
            inst.categoryDict[i] =
                new ac.TreeColumnView({
                    collection: inst.columnOrder[i],
                    depth: i,
                    treeFilterView: this
                });
        }
        inst.summaryView = new ac.SummaryView({
            el: "#summaryPanel",
            collection: inst.summaryCollection,
            treeFilterView: inst
        });
        inst.summaryView.render();
    },
    reset: function () {
        var inst = this.view;
        inst.initialCategory = null;
        inst.initialDepth = -1;
        /* No items in summary panel means we should reset the view to allow a 
        fresh selection. */
        for (var i = 0; i < inst.categoryDict.length; i++) {
            inst.categoryDict[i].selectedItems.reset();
            inst.categoryDict[i].collection.reset(inst.columnOrder[i].models);
            inst.categoryDict[i].$el.find("#" +
                inst.categoryDict[i].collection.category + "_label")
                .removeClass("selectedColumnLabel");
            $("#" + inst.categoryDict[i].category + "_searchBox input").val("");
            inst.categoryDict[i].render();
        }
        inst.currentSummaryItem.clear();
    },
    selectParent: function (depth, nodes) {
        var inst = this.view;
        var parentIds = ac.ProviderRegistry[depth].getParentIds(nodes);
        var parents = ac.ProviderRegistry[depth - 1].getRecords(parentIds);
        var parentTreeColumn = inst.categoryDict[depth - 1];
        parentTreeColumn.selectedItems.forEach(function (model) {
            model.set("visualState", ac.TreeItem.const.PARENT);
        });

    },
    setInitialCategory: function (depth) {
        ///<param name="category" type="string">Category name</param>
        var inst = this.view;
        inst.initialDepth = depth;
        inst.initialCategory = inst.categoryDict[depth].category;
        inst.currentSummaryItem.set("startCategory", inst.initialCategory);
        /* Disable things left of the initial category by design. */
        for (var i = depth-1; i >= 0; i--) {
            var parentEl = "#" + inst.columnOrder[i].category + "_scroller";
            $(parentEl).off("click");
            var li = $(parentEl).find("li");
            //Get rid of rollover effects on disabled parents
            li.addClass("treeColumnLiDisabled");
            li.removeClass("treeColumnLiUnselected");
        }
    },
    updateChild: function (depth, nodes) {
        ///<summary>Recursively update children starting from one depth level
        ///greater than the parent depth specified in depth param.</summary>
        ///<param name="depth" type="int">The depth of the parent where zero is
        ///the root of the hierarchy.</param>
        ///<param name="nodes" type="Array">Array of TreeItem Ids indicating
        ///selected items for which to get children.</param>
        var inst = this.view;
        /* Exit after processing the deepest level of the hierarchy. */
        if (depth == this.columnOrder.length - 1) return;
        var newChildItems;
        /* Get children items in one asc sorted list if nothing selected */
        if (inst.categoryDict[depth].selectedItems.length < 1) {
            var childIds = ac.ProviderRegistry[depth].getChildIds(nodes);
            newChildItems = ac.ProviderRegistry[depth + 1].getRecords(childIds);
        }
            /* Get children items grouped by parent and sorted asc */
        else {
            newChildItems = new ac.TreeItemCol();
            newChildItems.category = inst.categoryDict[depth + 1].category;
            for (var i = 0; i < nodes.length; i++) {
                var childIds = ac.ProviderRegistry[depth].getChildIds([nodes[i]]);
                var childRecs = ac.ProviderRegistry[depth + 1].getRecords(childIds,
                    inst.categoryDict[depth].collection.findWhere({ mid: nodes[i] }));
                newChildItems.add(childRecs.models);
            }
        }
        /* Copy old selection states from childView.collection if needed. */
        var childView = inst.categoryDict[depth + 1];
        var chNodes = new Array();
        if (childView.selectedItems.length > 0) {
            /* Clear old selectedItems collection. We add back those items that
            are SELECTED or PARENT in the forEach loop. */
            childView.selectedItems.reset();
            var oldModel;
            /* Iterate all newChildItems to set their visual state to what they 
            were before the refresh to preserve user selections. The rule is if
            the child had anything selected we preserve that selection and add
            all the new items as selected by default. */
            newChildItems.forEach(function (m) {
                oldModel = childView.collection.findWhere({ mid: m.get("mid") });
                //We decided not to auto select children on additional parent selection.
                //old collection without new item; make new item selected.
                //if (oldModel == null) {
                //    m.set("visualState", ac.TreeItem.const.SELECTED);
                //    childView.selectedItems.push(m);
                //}
                //Copy the previous state which may be something else.
                if (oldModel != null) {
                    var visualState = oldModel.get("visualState");
                    m.set("visualState", visualState);
                    if (visualState == ac.TreeItem.const.SELECTED ||
                        visualState == ac.TreeItem.const.PARENT) {
                        childView.selectedItems.push(m);
                    }
                }
                /* Since we're iterating everything anyway... */
                chNodes.push(m.get("mid"));
            });
        }
            /* No selected items but we still need to push all the child ids into 
            an array for recursion. */
        else {
            newChildItems.forEach(function (model) {
                chNodes.push(model.get("mid"));
            });
        }
        childView.collection = newChildItems;
        /* Event binding is destroyed with above assignment so redo */
        childView.collection.on("change:visualState",
                                childView.updateSelection, childView);
        childView.render();
        childView.updateSelectionSet(childView.selectedItems);
        childView.updateLayout();
        this.updateChild(++depth, chNodes);
    },
    updateCurrentSummaryItem: function () {
        ///<param name="selectedItems" type="TreeItemCol">Contains only the
        ///selected items for the given category.</param>
        function getParents(treeItemSet, depth) {
            ///<summary>Find the parents of all items in a set of TreeItem objects.</param>
            ///<param name="treeItemSet" type="TreeItemCol">The set of TreeItem
            ///objects whose parents will be found.</param>
            ///<param name="depth" type="int">The depth of the column containing the 
            ///items in treeItemSet.</param>
            ///<return>A TreeItemCol to be added to the SummaryItem path array.</return>
            var setIds = new Array();
            treeItemSet.forEach(function (m) {
                setIds.push(m.get("mid"));
            });
            var parentIds = ac.ProviderRegistry[depth].getParentIds(setIds);
            return ac.ProviderRegistry[depth - 1].getRecords(parentIds);
        }
        var inst = this.view;
        var maxDepth = inst.categoryDict.length - 1;
        var path = new Array();
        var parentItems;
        var parentItemCollection;
        var selectedTreeItems;
        var i = maxDepth;
        do {
            if (path.length == 0) {
                selectedTreeItems = inst.categoryDict[i].selectedItems;
                //if (selectedTreeItems.length == 0) {
                //    var placeHolder = new ac.TreeItemCol();
                //    var allItem = new ac.TreeItem({
                //        name: "All",
                //        category: inst.categoryDict[i].category
                //    });
                //    placeHolder.push(allItem);
                //    path.push(placeHolder);
                //}
            }
            else {
                selectedTreeItems = parentItemCollection;
            }
            if (selectedTreeItems.length > 0) {
                //1st path element is the right-most column with a selected item
                if (path.length == 0) {
                    path.push(selectedTreeItems);
                }
                //Omit hierarchy left of initial category to reduce clutter
                if (i == inst.initialDepth) {
                    break;
                }
                if (i > 0) {
                    parentItemCollection = getParents(selectedTreeItems, i);
                    path.push(parentItemCollection);
                }
            }
            i--;
        }
        while (i >= inst.initialDepth);

        /* Silent:true to suppress change:path event so as to not duplicate 
        event propagation on initial add */
        inst.currentSummaryItem.set({ "path": path, silent: true });
        /* Manual trigger because assignment to currentSummaryItem path without
        using the set method does not trigger an event. */
        inst.summaryCollection.trigger("change:path", inst.currentSummaryItem);
    },
    updateParent: function (depth, nodes) {
        ///<param name="depth" type="number">The category in which an
        ///event causing its parent(s) to update.
        ///<param name="nodes" type="Array">An array of id numbers of the 
        ///currently selected tree items.</param>
        var inst = this.view;
        //The end is the root of the hiearchy since we are walking up.
        if (depth == 0) return;
        //Don't need to get parents for left-most column
        //Get the dataprovider and retrieve an updated collection
        var parentIds = ac.ProviderRegistry[depth].getParentIds(nodes);
        var parents = ac.ProviderRegistry[depth - 1].getRecords(parentIds);
        //Minus 1 because the depth starts at the column of the event 
        inst.categoryDict[depth - 1].collection = parents;
        var pNodes = new Array();
        //Prepare all the parent's ids for recursive call at end.
        inst.categoryDict[depth - 1].collection.forEach(function (model) {
            pNodes.push(model.get("mid"));
        });
        //TODO: Should re-render based on collection change
        inst.categoryDict[depth - 1].render();
        //inst.categoryDict[depth - 1].updateLayout();
        //Recurse to get parent's parent etc.
        this.updateParent(--depth, pNodes);
    }
});

ac.TreeColumnView = Backbone.View.extend({
    category: null,
    depth: -1,
    el: "#treeContainer",
    SHOW_SEARCHBOX_COUNT: 20, //At 21 we show the search box
    selectedItems: null,
    treeView: null,
    initialize: function (options) {
        this.view = this;
        this.category = this.collection.category;
        this.treeView = options.treeFilterView;
        this.depth = options.depth;
        this.selectedItems = new ac.TreeItemCol();
        this.selectedItems.category = this.category;
        this.collection.on("change:visualState", this.updateSelection, this);
        var recs = (this.collection.tooManyRecords) ?
                    this.collection.exceededRecordCount :
                    this.collection.length;
        var tpl = ac.getTemplate(ac.TREE_COLUMN_TPL).jqote({
            columnTitle: this.collection.title,
            columnCategory: this.collection.category,
            models: this.collection.models,
            numRecords: recs
        });
        this.$el.append(tpl);
        $("#" + this.category + "_searchBox input").on(
            "keyup", this, this.findItem);
        this.render();
    },
    allLinkClicked: function (e) {
        ///<summary>Group select ALL link clicked.</summary>
        var inst = e.data;
        var gid = parseInt(e.target.attributes["data-gid"].value);
        var select = inst.collection.where({ groupId: gid });
        select.forEach(function (m) {
            m.set("visualState", inst.getSelectionStyle());
            inst.selectedItems.push(m);
        });
        inst.updateDependencies();
    },
    noneLinkClicked: function (e) {
        var inst = e.data;
        var gid = parseInt(e.target.attributes["data-gid"].value);
        var select = inst.collection.where({ groupId: gid });
        select.forEach(function (m) {
            m.set("visualState", ac.TreeItem.const.UNSELECTED);
            inst.selectedItems.remove(m);
        });
        /* deselected the initial category so reset it so that any column
        can again become the initial category. */
        if (inst.selectedItems.length == 0 &&
            inst.treeView.initialCategory != null &&
            inst.treeView.initialCategory == inst.category) {
            inst.treeView.reset();
            return;
        }
        inst.updateDependencies();
    },
    changeCollection: function (otherCollection) {
        this.collection.off("change:visualState", this.updateSelection);
        this.collection = otherCollection;
        this.collection.on("change:visualState", this.updateSelection, this);
    },
    findItem: function (e) {
        var inst = e.data;
        var liEl = $("#" + inst.category + "_scroller ul li");
        var term = e.target.value;
        if (term.length == 0) {
            liEl.show();
            //Or group headers and all children (e.g. select all|none) remain hiidden
            liEl.find("*").show(); 
            liEl.removeClass("keepers");
        }
        if (term.length > 0) {
            liEl.removeClass("keepers");
            var filtered = _.filter(inst.collection.models, function (m) {
                var name = m.get("name");
                if (name.toLowerCase().indexOf(term.toLowerCase())>-1) {
                    $("#" + inst.category + "_" + m.get("mid")).addClass("keepers");
                }
            });
            var ulEl = $("#" + inst.category + "_scroller ul");
            ulEl.find(".keepers").show();
            ulEl.find(":not(.keepers)").hide();
        }
        //console.info("[TreeColumnView.findItem] " + inst.category + " value=" + e.target.value);
    },
    getSelectionStyle: function () {
        var inst = this.view;
        var selectionStyle = ac.TreeItem.const.SELECTED;
        if (inst.treeView.currentSummaryItem.get("path") !== undefined &&
            inst.treeView.currentSummaryItem.get("path").length > 0) {
            /* Logic to determine what color a selection should be based on
            whether there are selections to the right of this column. */
            var rightCat = inst.treeView.currentSummaryItem.get("path")[0].category;
            if (rightCat === inst.category) {
                selectionStyle = ac.TreeItem.const.SELECTED;
            }
            else {
                var rightCatDepth = inst.treeView.getDepth(rightCat);
                if (inst.depth > rightCatDepth) {
                    selectionStyle = ac.TreeItem.const.SELECTED;
                }
                else {
                    selectionStyle = ac.TreeItem.const.PARENT;
                }
            }
        }
        else {
            inst.selectionStyle = ac.TreeItem.const.SELECTED;
        }
        return selectionStyle;
    },
    /* Currently deprecated because we are using all | none links instead of
    checkboxes or a toggle button. Leaving in because who knows what people
    will want after usability trial.*/
    groupCheck: function (e) {
        var inst = e.data;
        var gid = parseInt(e.target.attributes["data-gid"].value);
        console.info("[TreeColumnView.groupCheck] " + gid + ": " + e.target.text);
        if (e.target.text==="Select all") {
            var select = inst.collection.where({ groupId: gid });
            select.forEach(function (m) {
                m.set("visualState", inst.getSelectionStyle());
                inst.selectedItems.push(m);
            });
            e.target.text = "Select none"; //Dear god the hackiness!
        }
        else {
            e.target.text = "Select all";
            var select = inst.collection.where({ groupId: gid });
            select.forEach(function (m) {
                m.set("visualState", ac.TreeItem.const.UNSELECTED);
                inst.selectedItems.remove(m);
                //inst.updateSelection(m);
            });
            /* Deselected the initial category so reset it so that any column
            can again become the initial category. */
            if (inst.selectedItems.length == 0 &&
                inst.treeView.initialCategory != null &&
                inst.treeView.initialCategory == inst.category) {
                inst.treeView.reset();
                return;
            }
        }
        inst.updateDependencies();
    },
    /* Currently deprecated because we are using all | none links instead of
    checkboxes or a toggle button. Leaving in because who knows what people
    will want after usability trial. */
    isGroupCompletelySelected: function (gid) {
        var inst = this.view;
        var gcount = inst.collection.where({ groupId: gid }).length;
        var selGcount = inst.collection.where({
            groupId: gid,
            visualState: ac.TreeItem.const.SELECTED
        }).length;
        console.info("[isGroupCompletelySelected] gid="+gid+", gcount=" + gcount + ", selGcount=" + selGcount);
        return (gcount == selGcount);
    },
    itemClicked: function (e) {
        var inst = e.data;
        var treeItemId = e.target.id.substr(inst.collection.category.length + 1);
        var nodeId = parseInt(treeItemId);
        //var treeItemModel = inst.collection.get(nodeId);
        var treeItemModel = inst.collection.findWhere({ mid: nodeId });
        if (treeItemModel == null) {
            return; //Most likely clicked on a non-list item. 
        }
        var visualState = treeItemModel.get("visualState");

        if (visualState == ac.TreeItem.const.UNSELECTED) {
            treeItemModel.set("visualState", inst.getSelectionStyle());
            inst.selectedItems.push(treeItemModel);
            //var gid = treeItemModel.get("groupId");
            //if (inst.isGroupCompletelySelected(gid)) {
            //    var check = "#" + inst.category + "_" + gid + "_checkbox";
            //    $(check).prop("checked", true);
            //    treeItemModel.set("groupSelected", true);
            //}
        }
        else if (visualState == ac.TreeItem.const.SELECTED ||
                visualState == ac.TreeItem.const.PARENT) {

            treeItemModel.set("visualState", ac.TreeItem.const.UNSELECTED);
            inst.selectedItems.remove(treeItemModel);
            //var gid = treeItemModel.get("groupId");
            //if (!inst.isGroupCompletelySelected(gid)) {
            //    var check = "#" + inst.category + "_" + gid + "_checkbox";
            //    $(check).prop("checked", false);
            //    treeItemModel.set("groupSelected", false);
            //}
            /* Deselected the initial category so reset it so that any column
            can again become the initial category. */
            if (inst.selectedItems.length == 0 &&
                inst.treeView.initialCategory != null &&
                inst.treeView.initialCategory == inst.category) {

                inst.treeView.reset();
                return;
            }
        }
        inst.updateDependencies();
    },
    render: function () {
        var inst = this.view;
        var scrollerUl = $("#" + this.category + "_scroller");
        var numParentSelections = 0;
        if (inst.depth > 0) {
            var parentSelections = inst.treeView.categoryDict[inst.depth - 1].selectedItems;
            if (parentSelections !== undefined) {
                numParentSelections = parentSelections.length;
            }
        }
        var tpl;
        if (numParentSelections > 0) {
            tpl = ac.getTemplate(ac.TREE_COLUMN_GROUPED_ITEM_LINKS_TPL);
        }
        else {
            tpl = ac.getTemplate(ac.TREE_COLUMN_NATURAL_ITEM_TPL);
        }
        //tpl = ac.getTemplate(ac.TREE_COLUMN_GROUPED_ITEM_TPL);
        var liHtml = tpl.jqote({ models: inst.collection.models });
        scrollerUl.empty().append(liHtml);

        if (inst.depth >= inst.treeView.initialDepth) {
            var scroller = $("#" + inst.category + "_scroller");
            scroller.off("click", inst.itemClicked);
            scroller.on("click", inst, inst.itemClicked);
        }
        //var groupChecks = $("#" + this.category + "_groupChecks input");
        //groupChecks.off("click", inst.groupCheck);
        //groupChecks.on("click", inst, inst.groupCheck);
        var allLinks = $("#" + inst.category + "_scroller .treeColumnLiGroup .allLink");
        allLinks.off("click", inst.groupCheck);
        allLinks.on("click", inst, inst.groupCheck);
        //var noneLinks = $("#" + inst.category + "_scroller .treeColumnLiGroup .noneLink");
        //noneLinks.off("click", inst.noneLinkClicked);
        //noneLinks.on("click", inst, inst.noneLinkClicked);

        if (inst.depth < inst.treeView.initialDepth) {
            var scrollerEl = "#" + inst.category + "_scroller";
            $(scrollerEl).off("click");
            var li = $(scrollerEl).find("li");
            //Get rid of rollover effects on disabled parents
            li.addClass("treeColumnLiDisabled");
            li.removeClass("treeColumnLiUnselected");
        }
        inst.updateLayout();
    },
    updateDependencies: function () {
        var inst = this.view;
        //COPY FROM itemClicked method. Consolidate to one function!
        /* Update if not the root of hierarchy (furthest left) */
        if (inst.depth !== 0) {
            var nodes = new Array();
            inst.collection.forEach(function (model) {
                var vstate = model.get("visualState");
                if (vstate === ac.TreeItem.const.SELECTED ||
                    vstate === ac.TreeItem.const.PARENT) {
                    nodes.push(model.get("mid"));
                }
            });
            /* Update parents' columns only if initial click or not at the 
            column to the furthest left (root; no parent). */
            if (inst.treeView.initialCategory == null ||
                inst.depth == inst.treeView.initialDepth) {
                inst.treeView.updateParent(inst.depth, nodes);
            }
            else {
                //Otherwise we are locking columns to the left of the 
                //initially chosen one. 
                //Child of initialCategory chosen.
                if (inst.depth > inst.treeView.initialDepth) {
                    inst.treeView.selectParent(inst.depth, nodes);
                }
            }
        }
        ///* Update children of selected depth if not furthest right level of hierarchy */
        if (inst.depth !== inst.treeView.columnOrder.length - 1) {
            var nodes = new Array();
            //If nothing is selected everything is selected */
            if (inst.selectedItems.length == 0) {
                inst.collection.forEach(function (model) {
                    nodes.push(model.get("mid"));
                });
            }
                /* Otherwise use what is truly seleccted */
            else {
                inst.collection.forEach(function (model) {
                    var vstate = model.get("visualState");
                    if (vstate === ac.TreeItem.const.SELECTED ||
                        vstate === ac.TreeItem.const.PARENT) {
                        nodes.push(model.get("mid"));
                    }
                });
            }
            inst.treeView.updateChild(inst.depth, nodes);
        }
        if (inst.treeView.initialCategory == null) {
            inst.treeView.setInitialCategory(inst.depth);
            //inst.treeView.initialDepth = inst.depth;
            inst.$el.find("#" + inst.collection.category + "_label").addClass("selectedColumnLabel");
        }
        inst.treeView.updateCurrentSummaryItem();
    },
    updateLayout: function (treeItem) {
        var inst = this.view;
        var searchBoxEl = "#" + inst.category + "_searchBox";
        var scrollerEl = "#" + inst.category + "_scroller";
        if (inst.collection.length > inst.SHOW_SEARCHBOX_COUNT) {
            $(searchBoxEl).show();
            $(scrollerEl).css("top", "65px");
        }
        else {
            $(searchBoxEl).hide();
            $(scrollerEl).css("top", "35px");
        }
        /* Group checkbox or toggle button style implementation needs to check
        whether it should be rendered on or off based on its children state. */
        var selector = "#"+inst.category + "_scroller a[data-gid]";
        console.info("[updateLayout] " + selector);
        $(selector).each(function (index) {            
            var gid = parseInt($(this).attr("data-gid"));
            console.info("[updateLayout] " + gid);
            if (inst.isGroupCompletelySelected(gid)) {
                var check = "#" + inst.category + "_" + gid + "_allLink";
                //$(check).prop("checked", true);
                $(check).text("Select none");
            }
        });
    },
    updateSelection: function (treeItem) {
        ///<summary>Triggered by updates to this TreeColumnView's collection
        ///of TreeItems' visualState attribute.</summary>
        ///<param name="treeItem" type="TreeItem">The TreeItem in which 
        ///visualState was changed.</param>
        var inst = this.view;
        var elId = "#" + inst.category + "_" + treeItem.get("mid");
        var scrollerUl = $("#" + inst.category + "_scroller ul");
        var li = scrollerUl.find(elId);
        switch (treeItem.get("visualState")) {
            case ac.TreeItem.const.SELECTED:
                li.removeClass("selectedParentTreeItem");
                li.addClass("selectedTreeItem");
                break;
            case ac.TreeItem.const.PARENT:
                li.removeClass("selectedTreeItem");
                li.addClass("selectedParentTreeItem");
                break;
            case ac.TreeItem.const.UNSELECTED:
                li.removeClass("selectedTreeItem");
                li.removeClass("selectedParentTreeItem");
                break;
        }
    },
    updateSelectionSet: function (selections) {
        ///<param name="selections" type="TreeItemCol"></param>
        var inst = this.view;
        var scrollerUl = $("#" + inst.category + "_scroller ul");
        var scrollerLi = $("#" + inst.category + "_scroller ul li");
        scrollerLi.removeClass("selectedTreeItem");
        scrollerLi.removeClass("selectedParentTreeItem");
        selections.forEach(function (m) {
            switch (m.get("visualState")) {
                case ac.TreeItem.const.SELECTED:
                    var el = "#" + inst.category + "_" + m.get("mid");
                    scrollerUl.find(el).addClass("selectedTreeItem");
                    break;
                case ac.TreeItem.const.PARENT:
                    var el = "#" + inst.category + "_" + m.get("mid");
                    scrollerUl.find(el).addClass("selectedParentTreeItem");
                    break;
            }
        });
    }
});
