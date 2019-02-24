// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
; (function ($, window, document, undefined) {
	"use strict";
	// Create the defaults once
	var pluginName = "Acomplete",
			defaults = {
				propertyName: "value"
			};

	// The actual plugin constructor
	function Acomplete(element, options) {
		this.element = element;
		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend({}, defaults, options);
		//Invoke this function after a value has been entered or selected
		//for this autocomplete.
		this.selectCallback = this.settings.selectFunc;
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Acomplete.prototype, {
		errored: false,
		lis: null,
		liPtr: -1,
		inputEl$: null,
		menuOpened: false, //Otherwise user can't interact with the scrollbar
		init: function () {
			this.inputEl$ = $(this.element);
			this.inputEl$.wrap("<span class=\"optmenu-positioner\"></span>");
			this.inputEl$.val("");
			this.inputEl$.after(this.createMenuContainer());
			this.inputEl$.on("blur", this.settings, this.textInputBlur.bind(this));
			this.inputEl$.on("click", this.settings, this.textInputClick.bind(this));
			this.inputEl$.on("focus", this.settings, this.textInputClick.bind(this));
			this.inputEl$.on("keydown", this.settings, this.textInputKeydown.bind(this));
			this.inputEl$.on("keyup", this.settings, this.textInputKeyup.bind(this));
		},
		isValid: function (text) {			
			if (text == undefined || text.trim() == "") return true;
			var result = _.filter(this.settings.menuitems, function (item) {
				return item.indexOf(text) === 0;
			});
			return result.length > 0;
		},
		menuItemClick: function (e) {
			//Suppress blur from firing so user can keep typing.
			e.preventDefault();
			this.menuOpened = false;
			this.inputEl$.val($(e.currentTarget).text());
			this.liPtr = -1;
			this.inputEl$.next("div.optmenu-container").hide();
		},
		textInputBlur: function (e) {
			//TODO: Will need to do validation here instead of relying 
			//only on this.errored. Case: immediately type in bad data without
			//having invoked type-ahead functionality.
			//console.info("[textInputBlur]");
			var valid = this.isValid($(e.currentTarget).val());
			if (!valid) {
				this.inputEl$.addClass("input-invalid");
			}
			else {
				this.inputEl$.removeClass("input-invalid");
			}
			if (this.menuOpened) return;
			this.inputEl$.next("div.optmenu-container").hide();
		},
		textInputClick: function (e) {
			//Find optmenu-container relative to inputEl$ or multiple Optmenus on
			//the page will have their menus all open.
			this.menuOpened = true;
			e.stopPropagation();
			//Hide ALL optmenus on the page since this.menuOpened will still be
			//true if the user clicks off the textinput without selecting a menu item.
			$("div.optmenu-container").hide();
			//Then immediately show this menu.
			
			var settings = e.data;
			var text = $(e.currentTarget).val().trim();
			var result;
			if (text == "") {
				result = settings.menuitems;
			}
			else {
				result = _.filter(settings.menuitems, function (item) {
					return item.indexOf(text) === 0;
				});
			}
			if (result.length > 0) {
				this.inputEl$.next("div.optmenu-container").show();
			}
			this.createMenuItems(result);
		},
		textInputKeyup: function (e) {
			if (e.keyCode == 38 || e.keyCode == 40) return;
			var settings = e.data;
			var text = $(e.currentTarget).val();
			//console.info("[textInputKeyup] text=" + text + " keyCode=" + e.keyCode+" lisPtr="+this.liPtr+", id="+$(e.currentTarget).attr("id"));
			var result;
			if ((e.keyCode >= 48 && e.keyCode <= 57) ||							//number keys
				(e.keyCode >= 96 && e.keyCode <= 105) ||							//keypad number keys
				//(e.keyCode == 9) ||														//tab
				(e.keyCode == 8 || e.keyCode == 110 || e.keyCode == 46)) {	//delete or backspace

				if (text.trim() == "") {
					result = this.settings.menuitems;
				}
				else {
					result = _.filter(this.settings.menuitems, function (item) {
						return item.indexOf(text) === 0;
					});
				}
				this.createMenuItems(result);
				this.inputEl$.next("div.optmenu-container").show();				
			}
			else if (e.keyCode == 13) {
				if (this.liPtr > -1) {
					text = $(this.lis[this.liPtr]).text();
				}
				this.inputEl$.val(text);
				this.inputEl$.next("div.optmenu-container").hide();
				this.textInputBlur(e);
			}
			var valid = this.isValid(text.trim());
			if (!valid) {
				$("ul.optmenu-list").empty();
				//this.createMenuItems(this.settings.menuitems);
				this.inputEl$.next("div.optmenu-container").find(".no-results").show();
			}
			else {
				this.inputEl$.next("div.optmenu-container").find(".no-results").hide();
			}
		},
		textInputKeydown: function (e) {
			//Show/hide different menus based on 
			//0 = 48, 9=57, {space}=32, {enter}=13, -=189 or 109 (keypad), +=187 or 107 (keypad)
			//{backspace}=8, {delete}=46 or 110 (keypad), {up arrow}=38, {down arrow}=40
			console.info("[textInputKeydown] " + e.keyCode);
			var settings = e.data;
			if (e.keyCode == 40) { //down
				if (this.liPtr >= this.lis.length - 1) {
					this.liPtr = this.lis.length - 1;
				}
				else {
					$(this.lis[this.liPtr]).removeClass("active");
					$(this.lis[++this.liPtr]).addClass("active");
				}
			}
			else if (e.keyCode == 38) { //up
				if (this.liPtr <= 0) {
					this.liPtr = 0;
				}
				else {
					$(this.lis[this.liPtr]).removeClass("active");
					$(this.lis[--this.liPtr]).addClass("active");
				}
			}
			else if (e.keyCode == 9 || e.keyCode==13) {
				var text = $(e.currentTarget).val();
				var result;
				if (text == "") {
					result = settings.menuitems;
				}
				else {
					result = _.filter(settings.menuitems, function (item) {
						return item.indexOf(text) === 0;
					});
				}
				this.errored = (result.length == 0);
			}
			//Quick/dirty scrolling
			var PAGESIZE = 6; //This should vary based on the height 
			if (this.liPtr % PAGESIZE == 0 && e.keyCode == 40) {
				this.inputEl$.next("div.optmenu-container").scrollTop(this.liPtr * 30);
			}
			else if (this.liPtr % (PAGESIZE) == 0 && e.keyCode == 38) {
				this.inputEl$.next("div.optmenu-container").scrollTop((this.liPtr - PAGESIZE) * 30);
			}
		},
		createMenuContainer: function (example) {
			//Create the container for the list of menu options. The actual menu
			//items are dependent on the type ahead and generated on show.
			var tag = "<div class=\"optmenu-container\">";
			tag += "<p class=\"no-results\">No results found.</p>";
			tag += "<ul class=\"optmenu-list\">";
			tag += "</ul></div>";
			return tag;
		},
		createMenuItems: function (result) {
			$("ul.optmenu-list").empty().append(Acomplete.prototype.renderMenuItems(result));
			this.lis = this.inputEl$.next("div.optmenu-container").find("ul.optmenu-list li");
			this.liPtr = -1;
			//mousedown instead of click to beat blur event
			this.lis.on("mousedown", this.menuItemClick.bind(this));
		},
		renderMenuItems: function (menuitems) {
			//Generate list items to be added to ul.optmenu-list
			var tag = "";
			for (var i = 0; i < menuitems.length; i++) {
				tag += "<li>" + menuitems[i] + "</li>";
			}
			return tag;
		}
	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Acomplete(this, options));
			}
			//this = HTMLInputElement
		});
	};

})(jQuery, window, document);
