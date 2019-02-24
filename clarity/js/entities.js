ac.RECORD_CUTOFF = 300000;

ac.DataProvider = function (dbTable, category) {
    this.db = dbTable;
    this.category = category;
}
ac.DataProvider.prototype.constructor = ac.DataProvider;

ac.DataProvider.prototype.getAll = function () {
    var results = new ac.TreeItemCol();
    results.category = this.category;
    //Store in lookup table if not changing much?
    var recordYield = this.db().count();
    if (recordYield > ac.RECORD_CUTOFF) {
        results.exceededRecordCount = recordYield;
        results.tooManyRecords = true;
    }
    else {
        var r = this.db().order("name").get();
        for (var i = 0; i < r.length; i++) {
            results.push(new ac.TreeItem({
                mid: r[i].id,
                name: r[i].name,
                category: this.category
            }));
        }
    }
    return results;
}
ac.DataProvider.prototype.getIds = function () {
    console.info("[ac.DataProvider.prototype.getIds]");
    return this.db().order("name").select("id");
}
ac.DataProvider.prototype.getRecords = function (idArr, group) {
    ///<return>A TreeItemCol</return>
    var r = this.db({ id: idArr }).order("name").get();
    var results = this.createTreeItemCollection(r,group);
    results.category = this.category;
    return results;
}
ac.DataProvider.prototype.createTreeItemCollection = function (records,treeItem) {
    var results = new ac.TreeItemCol();
    for (var i = 0; i < records.length; i++) {
        var record = new ac.TreeItem({
            mid: records[i].id,
            name: records[i].name,
            category: this.category
        });
        if (treeItem !== undefined) {
            record.set("group", treeItem.get("name"));
            record.set("groupId", treeItem.get("mid"));
        }
        results.push(record);
    }
    return results;
}

/* Since the children and parents look up involves specific join
tables we need to implement these in the dataprovider subclasses. */
ac.DataProvider.prototype.getChildren = function (nodeId) { };
ac.DataProvider.prototype.getParents = function (nodeId) { };
/* Since all tables have a name and id column these find functions
can serve all subclasses of DataProvider */
ac.DataProvider.prototype.findByName = function (searchTerm) { };
ac.DataProvider.prototype.findById = function (nodeId) { };

/* DataProvider subclasses using combination inheritance pattern */
ac.TypesDp = function (dbTable) {
    //Calls superclass constructor
    ac.DataProvider.call(this, dbTable,this.CATEGORY);
    this.title = this.CATEGORY;
    this.childJoin = ac.Datastore.createDeptTypeTable();
}
ac.TypesDp.prototype = new ac.DataProvider();
ac.TypesDp.prototype.CATEGORY = "Departments";
ac.TypesDp.prototype.getAll = function () {
    //Call superclass function of the same name
    var all = ac.DataProvider.prototype.getAll.call(this);
    console.info("[ac.Types.getAll] " + all.length);
    /* title will vary by the class */
    all.title = this.title;
    return all;
}
ac.TypesDp.prototype.getRecords = function (idArr, group) {
    //if (group == undefined) {
    //    group = "";
    //}
    var r = ac.DataProvider.prototype.getRecords.call(this, idArr,group);
    return r;
}
ac.TypesDp.prototype.getChildIds = function (nodes) {
    var joinArr = this.childJoin({typeId:nodes}).select("deptId");
    return joinArr;
}

ac.DepartmentsDp = function (dbTable) {
    ac.DataProvider.call(this, dbTable, this.CATEGORY);
    this.title = this.CATEGORY;
    this.parentJoin = ac.Datastore.createDeptTypeTable();
    this.childJoin = ac.Datastore.createProvDeptTable();
}
ac.DepartmentsDp.prototype = new ac.DataProvider();
ac.DepartmentsDp.prototype.CATEGORY = "Divisions";
ac.DepartmentsDp.prototype.getAll = function () {
    //Call superclass function of the same name
    var all = ac.DataProvider.prototype.getAll.call(this);
    console.info("[ac.Departments.getAll] " + all.length);
    /* title will vary by the class */
    all.title = this.title;
    return all;
}
ac.DepartmentsDp.prototype.getParentIds = function (nodes) {
    ///<param name="nodes" type="Array">Array of node ids</param>
    var joinArr = this.parentJoin({ deptId: nodes }).select("typeId");
    return joinArr;
}
ac.DepartmentsDp.prototype.getChildIds = function (nodes) {
    var joinArr = this.childJoin({deptId:nodes}).select("providerId");
    return joinArr;
}
ac.DepartmentsDp.prototype.getRecords = function (idArr,group) {
    var r = ac.DataProvider.prototype.getRecords.call(this, idArr,group);
    return r;
}

ac.ProvidersDp = function (dbTable) {
    ac.DataProvider.call(this, dbTable, this.CATEGORY);
    this.title = this.CATEGORY;
    this.parentJoin = ac.Datastore.createProvDeptTable();
}
ac.ProvidersDp.prototype = new ac.DataProvider();
ac.ProvidersDp.prototype.CATEGORY = "Providers";
ac.ProvidersDp.prototype.getAll = function () {
    //Call superclass function of the same name
    var all = ac.DataProvider.prototype.getAll.call(this);
    console.info("[ac.Providers.getAll] " + all.length);
    /* title will vary by the class */
    all.title = this.title;
    return all;
}
ac.ProvidersDp.prototype.getParentIds = function (nodes) {
    ///<param name="nodes" type="Array">Array of provider ids</param>
    var joinArr = this.parentJoin({ providerId: nodes }).select("deptId");
    return joinArr;
}
ac.ProvidersDp.prototype.getRecords = function (idArr, group) {
    var r = ac.DataProvider.prototype.getRecords.call(this, idArr, group);
    return r;
}