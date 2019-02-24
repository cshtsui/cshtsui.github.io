//This file has dependencies on jQuery and Backbone.
var ux = {};
ux.loadTemplate = function (templateFile) {
	///<summary>Load templates or html partial pages.</summary>
	///<param name="templateFile">The full path to the template to load.</param>
	///<return>Compiled template</return>
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
	return _.template(this.templateCache[templateFile]);
}

ux.DialogModel = Backbone.Model.extend({
	defaults: {
		closeOnOutsideClick:false,			//Set true if clicking on lightbox should dismiss dialog
		dialogTitle: "Empty",
		dialogContent: null,					//string short content; overriden by dialogContentTemplate
		contentTemplate: null,				//path to a template to be loaded into dialog body
		contentTemplateModel: {},			//object to be processed by template
		dialogPrimaryButtonLabel: "OK",	//e.g. Apply
		dialogSecondaryButtonLabel: "",	//e.g. Cancel
		onOpenFunction:null,					//optional clalback after the dialog displayed and content and footer loaded
		onCloseFunction: null,				//optional callback function when dialog dismissed
		dialogScrollable: "",				//set to "scrollable" if scrolling desired
		dialogShowTitle: true,
		dialogSize: "sizemedium",			//See structures/dialogs.less for sizes
		dialogType: "default",				//One of: default, warn, confirm
		footerTemplate:null,
		screen: null,
		top: 0									//Distance from the top of the document to position dialog. Often $(document).scrollTop().
	}
});

ux.DialogView = Backbone.View.extend({
	el: "body",
	//el should be passed in from constructor
	//model is instance of ux.DialogModel
	events: {
		"click .modaldialoglightbox": "clickOutsideClose",
		"click #closeAction": "closeDialog",
		"click .p-cancel": "cancelDialog"
	},
	template: ux.loadTemplate("template/dialogTmpl.html"),
	footerTemplate: null,
	initialize:function(opts) {
		this.footerTemplate = this.model.get("footerTemplate");
	},
	clickOutsideClose:function(e) {
		if (this.model.get("closeOnOutsideClick")) {
			this.closeDialog(e);
		}
		else {
			e.stopPropagation();
		}
		return;
	},
	cancelDialog: function (e) {
		this.$(".modaldialoglightbox").remove();
		this.$(".dialogpositioner").remove();
		//Make dialog non-scrollable by default
		this.model.set("dialogScrollable", "");
		if (this.model.get("onCancelFunction") != null) {
			this.model.get("onCancelFunction")();
		}
		//Clean up this handler from events hash.
		this.undelegateEvents();
	},
	closeDialog: function (e) {
		$(".modaldialoglightbox").remove();
		this.$(".dialogpositioner").remove();
		//Make dialog non-scrollable by default
		this.model.set("dialogScrollable", "");
		if (this.model.get("onCloseFunction") != null) {
			this.model.get("onCloseFunction")();
		}
		this.undelegateEvents();
	},
	render: function () {
		$("body").append("<div class=\"modaldialoglightbox\"></div>")
		this.$el.append(this.template(this.model.attributes));
		//Content below the dialog title bar but above the footer containing buttons.
		if (this.model.get("contentTemplate") != null) {
			var template = ux.loadTemplate(this.model.get("contentTemplate"));
			this.$el.find(".dialogpositioner .dialogbody").empty().append(
				template(this.model.get("contentTemplateModel"))
			);
		}
		//This contains at least one button to dismiss the dialog.
		if (this.footerTemplate != null) {
			this.$el.find(".dialogpositioner footer").empty().append(
				ux.loadTemplate(this.footerTemplate));
		}
		//The dialog is position:absolute so make sure it's seen on a long page.
		this.$el.find(".dialogpositioner").offset({
			top: this.model.get("top"),
			left: 0
		});
		//Notify any interested function that the dialog has opened.
		if (this.model.get("onOpenFunction") != null) {
			this.model.get("onOpenFunction")(this);
		}
		return this;
	}
});
