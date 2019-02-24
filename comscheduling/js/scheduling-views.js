sc.TopNavigation = Backbone.View.extend({
	el: "div.header-bar-content",
	events: {
		"click .p-home": "homeClick",
		"click #patient-picker": "switcherClick"
	},
	homeClick: function () {
		sc.apptHomeView.undelegateEvents();
		sc.App.prototype.link("home", { trigger: true });
	},
	switcherClick: function (e) {
		this.$("#patient-picker-menu").toggle();
	}
});

//Appointment home page view (page 1)
sc.AppointmentHomeView = Backbone.View.extend({
	el: "div.sch",
	events: {
		"click .p-recommended": "recommendedApptClick",
		"click .p-reschedule": "rescheduleClick",
		"click .p-cancelappt": "cancelClick",
		"click .p-showmoreless": "toggleInstructionsClick",
		"click .p-showmorelessheading": "toggleInstructionsHeadingClick"
	},
	largepar: null,

	initialize: function (opts) {
		this.recommendedCol = opts.recommended;
		this.model.on("change:showAllPars", this.showAllPars, this);
	},
	template: ux.loadTemplate("template/appointmentHomeTmpl.html"),
	toggleInstructionsHeadingClick: function (e) {
		var heading = $(e.currentTarget).parent();
		//Convert link to dom node for passing to toggleInstructionsClick
		e.currentTarget = heading.find("a.p-showmoreless")[0];
		this.toggleInstructionsClick(e);
	},
	toggleInstructionsClick: function (e) {
		/* 
		Reference upcomingHomeTmpl.html for HTML. This collapse/expand behaviour 
		is not straight forward because:

		1. The need to position an occluding white-to-transparent gradient over
		   the contents of the instructions and medical forms element needs 
			position:absolute.

		2. This then needs to change to position:relative when SHOW MORE is
			clicked so that the link and the rule and the chevron all end up below
			the instructions. div.apptinstrandforms height needs to be "auto" (from
			a fixed height) to return the contents of the element into the flow so
			that the morelessline is positioned correctly and adequate bottom 
			margin exists between the opened row and the following.

		3. The above needs to be reversed when SHOW LESS is clicked. 
		*/
		var link = $(e.currentTarget);
		var id = "#instfor-" + e.currentTarget.attributes["data-inst-for"].value;
		var isHidden = this.$(id).css("overflow") == "hidden";
		if (isHidden) {
			this.$(id).css("overflow", "visible");
			link.text("Show less");
			link.next().removeClass("more").addClass("less");
			//Get to footer.morelessline
			link.parent().parent().css("position", "relative");
			//Get to div.apptinstrandforms
			link.parent().parent().parent().css("height", "auto");
		}
		else {
			this.$(id).css("overflow", "hidden");
			link.text("Show more");
			link.next().removeClass("less").addClass("more");
			link.parent().parent().css("position", "absolute");
			link.parent().parent().parent().css("height", "100px");
		}
	},
	recommendedApptClick: function (e) {
		var recProvId = e.currentTarget.attributes["data-provider-id"].value;
		var recPar = e.currentTarget.attributes["data-par"].value;
		var recDate = e.currentTarget.attributes["data-selected-date"].value;
		var recApptId = parseInt(e.currentTarget.attributes["data-appt-id"].value);
		this.model.set("parLabel", recPar);
		this.model.set("selectedDate", recDate);
		this.model.set("selectedProvider", recProvId);
		this.model.set("scheduleType", "recommended");
		this.model.set("recommendedApptId", recApptId);
		if (this.model.get("noRecommendedWebSchedule")) {
			//Request dialog
			var reqdialog = new sc.RequestAppointmentDialog({
				model: new ux.DialogModel({
					contentTemplate: "template/dialogs/requestApptBody1Tmpl.html",
					contentTemplateModel: { introCopy: "This appointment is not available for online scheduling, but you can send an appointment request here." },
					secondContentTemplate: "template/dialogs/requestApptBody2Tmpl.html",
					footerTemplate: "template/dialogs/requestApptFooter1Tmpl.html",
					secondFooterTemplate: "template/dialogs/requestApptFooter2Tmpl.html",
					dialogTitle: "Send a Request",
					dialogSize: "sizemedium",
					onCloseFunction: function () {
						sc.App.prototype.link("home", { trigger: true });
					},
					onCancelFunction: function () { },
				})
			});
			reqdialog.render();
		}
		else {
			sc.App.prototype.link("apptList", { trigger: true })
		}
		
	},
	rescheduleClick: function (e) {
		var resProvId = parseInt(e.currentTarget.attributes["data-provider-id"].value);
		var resPar = e.currentTarget.attributes["data-par"].value;
		var resDate = e.currentTarget.attributes["data-selected-date"].value;
		var resTime = e.currentTarget.attributes["data-selected-time"].value;
		var resApptId = parseInt(e.currentTarget.attributes["data-appt-id"].value);
		this.model.set("parLabel", resPar);
		this.model.set("selectedDate", resDate);
		this.model.set("selectedProvider", resProvId);
		var name = _.findWhere(sc.apptDb, { providerid: resProvId }).billedname;
		this.model.set("providerName", name);
		this.model.set("scheduledTime", resTime);
		this.model.set("scheduleType", "reschedule");
		this.model.set("rescheduleApptId", resApptId);
		if (this.model.get("noReschedule")) {
			new ux.DialogView({
				model: new ux.DialogModel({
					contentTemplate: "template/dialogs/cannotRescheduleTmpl.html",
					footerTemplate: "template/dialogs/closeOnlyFooterTmpl.html",
					dialogTitle: "Reschedule Appointment",
					dialogSize: "sizesmall",
					dialogType: "warn",
					top: $(window).scrollTop(),
					onCloseFunction: function () {
						sc.App.prototype.link("home", { trigger: true });
					}
				})
			}).render();
		}
		else {
			sc.App.prototype.link("apptList", { trigger: true })
		}
	},
	cancelClick: function (e) {
		var cancelProvId = e.currentTarget.attributes["data-provider-id"].value;
		var cancelPar = e.currentTarget.attributes["data-par"].value;
		var cancelDate = e.currentTarget.attributes["data-selected-date"].value;
		var cancelApptId = parseInt(e.currentTarget.attributes["data-appt-id"].value);
		var cancelTime = e.currentTarget.attributes["data-selected-time"].value;
		this.model.set("parLabel", cancelPar);
		this.model.set("selectedDate", cancelDate);
		this.model.set("selectedProvider", cancelProvId);
		this.model.set("scheduleType", "cancel");
		this.model.set("scheduledTime", cancelTime);
		this.model.set("cancelApptId", cancelApptId);
		if (this.model.get("noCancel")) {
			new sc.CancelAppointmentDialog({
				model: new ux.DialogModel({
					contentTemplate: "template/dialogs/cannotCancelTmpl.html",
					footerTemplate: "template/dialogs/closeOnlyFooterTmpl.html",
					dialogTitle: "Cancel Appointment",
					dialogSize: "sizesmall",
					dialogType: "warn",
					top: $(window).scrollTop(),
					onCloseFunction: this.cancelClose.bind(this, cancelApptId)
				})
			}).render();
		}
		else {
			//this.model.set("location", "Somerset Main Office"); //Hack for cancel dialog
			new sc.CancelAppointmentDialog({
				model: new ux.DialogModel({
					contentTemplate: "template/dialogs/cancelApptBody1Tmpl.html",
					contentTemplateModel: this.model.attributes,
					secondContentTemplate: "template/dialogs/cancelApptBody2Tmpl.html",
					footerTemplate: "template/dialogs/cancelApptFooter1Tmpl.html",
					secondFooterTemplate: "template/dialogs/cancelApptFooter2Tmpl.html",
					dialogTitle: "Cancel Appointment",
					dialogSize: "sizesmall",
					dialogType: "warn",
					top: $(window).scrollTop(),
					onCloseFunction: this.cancelClose.bind(this, cancelApptId)
				})
			}).render();
		}
	},
	cancelClose: function (cancelApptId) {
		sc.upcomingAppts.remove(sc.upcomingAppts.findWhere({ apptId: cancelApptId }));
		sc.App.prototype.link("home", { trigger: true });
		this.render();
	},
	render: function () {
		this.$el.html(this.template(
			{
				numRecommendedAppts: this.recommendedCol.length,
				numUpcomingAppts: this.collection.length,
				offline: this.model.get("schedulingoffline")
			}
		));
		var parMenu = new sc.ParMenuView({
			model: this.model,
			recommended: this.recommendedCol
		});
		this.$(".parmenu").append(parMenu.render().el);
		var upcomings = new sc.UpcomingApptsView({
			collection: this.collection
		})
		this.$(".upcoming-appts").append(upcomings.render().el);
		var recommendeds = new sc.RecommendedApptsView({
			collection: this.recommendedCol
		});
		this.$(".recommended-appts").append(recommendeds.render().el);
		new sc.TabView();
		//this.delegateEvents();
		return this;
	},
	showAllPars: function (e) {
		//This is set by choosing the View All Reasons option from the PAR menu
		//Unset this when the large PAR selector is closed
		if (this.model.get("showAllPars")) {
			if (this.largepar == null) {
				this.largepar = new sc.LargeParView({ model: this.model }).render();
			}
			this.$(".shortparslist").hide();
			this.$(".otherappointments").css("z-index", 2);
			//Lot of exta work here because the parbackgroundbox and the largeparselector
			//need to be sibling elements to prevent inheritance of opacity amongst the
			//children of a container. 
			var lps = this.$(".largeparselector");
			//Animation classes from https://github.com/daneden/animate.css
			lps.show().addClass("fadeIn");
			//Remove fadeIn class after animation has played in order to have the
			//opacity setting of 0.95 work. The animation keyframes of fadeIn 
			//set the opacity to 1.0 after playing.
			lps.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
				this, function (e) {
					lps.removeClass("fadeIn");
					//Yes, even with .one() because http://stackoverflow.com/questions/28322394/jquery-one-doesnot-working-correctly-in-chrome
					lps.off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
				});
			var pbb = this.$(".parbackgroundbox");
			pbb.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
				this, function (e) {
					pbb.removeClass("fadeIn");
					pbb.off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
				});
			pbb.show().addClass("fadeIn");			
		}
			//The large PAR selector has been dismissed.
		else {
			var pbb = this.$(".parbackgroundbox");
			pbb.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
				this, function (e) {
					pbb.hide();
					pbb.removeClass("fadeOut");
					e.data.$(".otherappointments").css("z-index", 1);
					//Yes, even with .one() because http://stackoverflow.com/questions/28322394/jquery-one-doesnot-working-correctly-in-chrome
					pbb.off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
				});
			pbb.addClass("fadeOut");
			var lps = pbb.next(".largeparselector");
			//Do these cleanups when animation stops playing.
			lps.one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
				this, function (e) {
					lps.hide();
					lps.removeClass("fadeOut");
					e.data.$(".otherappointments").css("z-index", 1);
					//Yes, even with .one() because http://stackoverflow.com/questions/28322394/jquery-one-doesnot-working-correctly-in-chrome
					lps.off("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
				});
			lps.addClass("fadeOut");
			this.$(".shortparslist").show();
		}
	}
});

//Child view of sc.AppointmentHomeView
sc.LargeParView = Backbone.View.extend({
	el: "div.largeparselector",
	events: {
		"click .p-backtoparmenu": "dismissLargeParClick",
		"click .p-parpagebutton": "pageButtonClick",
		"click .p-findappointment": "findAppointmentClick",
		"click .mouseradio input": "parSelectedClick",
		"click .mouseradio label": "parSelectedClick"
	},
	columntemplate: ux.loadTemplate("template/parColumnTmpl.html"),
	//parpagertemplate: ux.loadTemplate("template/parPagerTmpl.html"),
	template: ux.loadTemplate("template/largeParSelectorTmpl.html"),
	columnsPerPage: 3,
	recordsPerColumn: 4,
	curPageNum: 0,
	parSelected: false,
	initialize: function (opts) {
		this.collection = [
			"Acupuncture", "Adolescent Physical", "Adult Annual Wellness Visit", "Annual Physical", "Breast Cancer Screening (Mammogram)",
			"Cervical Cancer Screening (Pap Test)", "Child Flu Shot Visit", "Colorectal Cancer Screening", "Consult / Referral", "Diabetes Lab Work Visit",
			"Diabetes Visit", "Exam", "First HPV Vaccination Visit", "Flu Shot Visit", "Follow Up",
			"Healthy Weight Visit", "High Blood Pressure Visit", "Heart Disease Visit", "Imaging", "Injection / Vaccination",
			"Injury", "Lab Work", "Medicare Annual Wellness Visit", "Medicare Screening Pelvic Examination", "Medication Check",
			"New Patient", "Newborn", "Occupational Therapy", "Physical Therapy", "Post-Op",
			"Pre-Op", "Prenatal", "Problem", "Routine Child Vaccinations Visit", "Secure Online Video Appointment",
			"Sick Visit", "Specialized Exam", "Sports Physical", "Subsequent HPV Vaccination Visit", "Testing",
			"Well Baby / Child Visit", "Well Visit (Age 3-11)", "Well Visit (Age 12-21)", "Wellness Visit", "Worker's Compensation"
		];
	},
	dismissLargeParClick: function (e) {
		this.model.set("showAllPars", false);
		this.$(".p-parerror").hide();
	},
	findAppointmentClick: function (e) {
		if (!this.parSelected) {
			this.$(".p-parerror").show();
		}
	},
	pageButtonClick: function (e) {
		var dir = e.currentTarget.attributes["data-direction"].value;
		var numPages = Math.round(this.collection.length / (this.recordsPerColumn * this.columnsPerPage));
		if (dir == "forwards") {
			this.curPageNum++;
			if (this.curPageNum > numPages-1) {
				this.curPageNum = numPages-1;
			}
		}
		else if (dir == "backwards") {
			this.curPageNum--;
			if (this.curPageNum < 0) {
				this.curPageNum = 0;
			}
		}
		//this.curPageNum = pageOffset + 1; //pageOffset zero based
		var columns = this.$(".p-parcolumns");
		//More/less width of parpage +/- margins.
		columns.css("left", this.curPageNum * -(this.$(".parpage").width()+18));
	},
	parSelectedClick: function (e) {
		//A click on any PAR means at least one is selected since radio buttons
		//cannot be totally unselected once one is chosen.
		this.parSelected = true;
	},
	render: function () {
		this.$el.html(this.template({}));
		var parpage = this.$(".p-parcolumns");
		var parsArray = new Array();
		var counter = 1;
		for (var i = 0; i < this.collection.length; i++) {
			parsArray.push(this.collection[i]);
			counter++;
			if (counter > this.recordsPerColumn) {
				counter = 1;
				parpage.append(this.columntemplate({ collection: parsArray }));
				parsArray.splice(0, parsArray.length);
			}
		}
		//
		//this.$(".parpager").append(this.parpagertemplate({
		//	numPages: numPages,
		//	currentPage: this.curPageNum
		//}));
		return this;
	}
});

sc.UpcomingApptsView = Backbone.View.extend({
	el: ".upcomingrows",
	template: ux.loadTemplate("template/upcomingHomeTmpl.html"),
	render: function () {
		for (var i = 0; i < this.collection.length; i++) {
			this.$el.append(this.template(this.collection.at(i).attributes));
		}
		return this;
	}
});

sc.RecommendedApptsView = Backbone.View.extend({
	el: ".recommendedrows",
	template: ux.loadTemplate("template/recommendedHomeTmpl.html"),
	initialize: function (opts) {
		if (opts.template != undefined) {
			this.template = opts.template;
		}
	},
	render: function () {
		for (var i = 0; i < this.collection.length; i++) {
			this.$el.append(this.template(this.collection.at(i).attributes));
		}
		//Hack the appointments badge in the header to sync with recommended
		if (this.collection.length == 0) {
			$(".p-header-rec-circle").hide();
		}
		else {
			$(".p-header-rec-appts").text(this.collection.length);
		}
		return this;
	}
});

//The overall composition view for find appointments (page 2)
sc.AppointmentResultView = Backbone.View.extend({
	el: "div.sch",
	events: {
		"click .p-change-par": "changeParClick",
		"click .p-gohome": "changeParClick",
		"change #personchoice": "providerChange",
		"change #groupby": "groupbyChange",
		"click .p-timecheck": "timeChange",
		"change #locationchoice": "locationChange",
		"click .p-requestlink": "createRequestDialog",
        "click .p-learn-more": "learnMoreClick"
	},
	resultsList: null,
	template: ux.loadTemplate("template/appointmentResultTmpl.html"),
	schedulingDisabledTemplate: ux.loadTemplate("template/schedulingDisabledTmpl.html"),
	initialize: function (opts) {
		this.model.on("change:calendarScroll", this.calendarScrolled, this);
	},
	calendarScrolled: function () {
		///<summary>Deprecated. This function part of the old week calendar.</summary>
		//console.info("[AppointmentResultView.calendarScrolled] direction="+
		//	this.model.get("calendarScroll"));
		//Temporarily suppress change events while we set the flag to null
		this.model.off("change:calendarScroll", this.calendarScrolled, this);
		this.model.set("calendarScroll", null);
		this.model.on("change:calendarScroll", this.calendarScrolled, this);
		this.resultsList.collection = this.getResults();
		this.resultsList.currentPage = 1;
		this.$(".foundappts").empty().append(this.resultsList.render().el);
		this.calendar.render();
	},
	changeParClick: function (e) {
		sc.App.prototype.link("home", { trigger: true });
	},
	createRequestDialog: function () {
		this.model.set("selectedProvider", null);
		var reqdialog = new sc.RequestAppointmentDialog({
			model: new ux.DialogModel({
				contentTemplate: "template/dialogs/requestApptBody1Tmpl.html",
				contentTemplateModel: { introCopy: "Rick C. Gonzalez, MD is not available for online scheduling, but you can send an appointment request."},
				secondContentTemplate: "template/dialogs/requestApptBody2Tmpl.html",
				footerTemplate: "template/dialogs/requestApptFooter1Tmpl.html",
				secondFooterTemplate: "template/dialogs/requestApptFooter2Tmpl.html",
				dialogTitle: "Send a Request",
				dialogSize: "sizemedium",
				onCloseFunction: function () {
					sc.App.prototype.link("home", { trigger: true });
				},
				onCancelFunction: this.requestCancel.bind(this),
				onOpenFunction: function (dialogView) {
					//Pre-select the provider in the request appoinment dialog
					//to be the provider chosen to the filters. Hardcodede for testing.
					var providerChoice = dialogView.$el.find("#providerchoice");
					providerChoice.find("option[value=\"-2\"]").attr("selected", true);
					providerChoice.attr("disabled", "disabled");
				}
			})
		});
		reqdialog.render();
		//el needed to be body for the initial dialog render
		//narrow to .requestform for event handling
		reqdialog.el = ".requestform";
		reqdialog.delegateEvents();
	},
	createRequestDisabledDialog: function () {
		this.model.set("selectedProvider", null);
		var reqDialog = new ux.DialogView({
			model: new ux.DialogModel({
				contentTemplate: "template/dialogs/requestExceptionTmpl.html",
				footerTemplate: "template/dialogs/requestExceptionFooterTmpl.html",
				dialogTitle: "Call to Schedule",
				dialogSize: "sizesmall",
				dialogType: "warn",
				onCloseFunction: this.requestCancel.bind(this)
			})
		});
		reqDialog.render();
	},
	getFirstAvailable: function () {
		//Get the first available appointment slot for a PAR with preference given
		//to the care team. if no results, search the general population for PAR
		//matches. Returns null if nothing found.
		//var teamApptArr = this.getCareTeamResults();
		//if (teamApptArr.length > 0) {
		//	//teamApptArr = _.sortBy(teamApptArr, "apptdate");
		//	return teamApptArr[0];
		//}
		var firstSlot = _.findWhere(sc.apptDb, { par: this.model.get("parLabel") });
		return (firstSlot == undefined) ? null : firstSlot;
	},
	getCareTeamResults: function () {
		var careTeamArr = this.model.get("careTeam");
		//Iterate careTeam and see if any careTeam member has an open appointment
		//for the PAR. Take the earliest selected date. If nothing then take the
		//earliest date for any provider that offers an appointment for the PAR.
		var teamApptArr = new Array();
		for (var j = 0; j < careTeamArr.length; j++) {
			var appt = _.findWhere(sc.apptDb,
				{ par: this.model.get("parLabel"), providerid: careTeamArr[j] });
			if (appt != undefined) {
				teamApptArr.push(appt);
			}
		}
		if (teamApptArr.length > 0) {
			teamApptArr = _.sortBy(teamApptArr, "apptdate");
		}
		return teamApptArr;
	},
	getResults: function () {
		var careTeamArr = this.model.get("careTeam");
		//Only run care team privileged search if date not explicitly set.
		if (this.model.get("selectedDate") == null) {
			var teamApptArr = this.getCareTeamResults();
			if (teamApptArr.length == 0) {
				//var obj = _.findWhere(sc.apptDb, { par: this.model.get("parLabel") });
				//if (obj != undefined) {
				//	this.model.set("selectedDate", obj.apptdate);
				//}
				//else {
				//	this.model.set("selectedDate", null); //Not necessary?
				//}
				var firstSlot = this.getFirstAvailable();
				if (firstSlot != null) {
					this.model.set("selectedDate", firstSlot.apptdate);
				} //else still selectedDate still null
			}
			else {
				teamApptArr = _.sortBy(teamApptArr, "apptdate");
				this.model.set("selectedDate", teamApptArr[0].apptdate);
			}
		}
		var filtered = _.filter(sc.apptDb, function (o) {
			function withinTimeChoices(slotTime, selectedTimes) {
				///<param name="slotTime" type="string">An appointment time in the
				///collection of appointment slots.</param>
				///<param name="selectedTime" type="string">The selected time filter
				///(e.g. before 9am) with the value of a time (e.g. 9AM)</param>
				var day = "01/01/1970 "; //arbitrary to produce legit datetime stamp
				var slot = Date.parse(day + slotTime);
				var MORNING = "11:59 AM";
				var AFTERNOON = "12:00 PM";
				var EVENING = "5:00 PM";
				var truth = false;

				if (selectedTimes.indexOf(MORNING) > -1) {
					truth = (slot <= Date.parse(day + MORNING));
				}
				if (!truth && selectedTimes.indexOf(AFTERNOON) > -1) {
					truth = (slot >= Date.parse(day + AFTERNOON) && slot < Date.parse(day + EVENING));
				}
				if (!truth && selectedTimes.indexOf(EVENING) > -1) {
					truth = (slot >= Date.parse(day + EVENING));
				}
				return truth;
			}

			var truth = o.par == this.model.get("parLabel");
			if (this.model.has("selectedDate")) {
				truth = (truth && o.apptdate == this.model.get("selectedDate"));
			}
			if (this.model.has("selectedProvider")) {
				truth = (truth && (o.providerid == this.model.get("selectedProvider")));
			}
			if (this.model.has("selectedLocation")) {
				truth = (truth && (o.department == this.model.get("selectedLocation")));
			}
			if (this.model.has("selectedTime")) {
				truth = (truth && withinTimeChoices(o.appttime, this.model.get("selectedTime")));
			}
			return truth;
		}, this);
		//This ranks providers by their careTeam-ness to move them up the list
		_.each(filtered, function (el, i, list) {
			el.careTeam = 2;
			for (var j = 0; j < careTeamArr.length; j++) {
				if (el.providerid == careTeamArr[j]) {
					el.careTeam = 1;
				}
			}
		}, this);
		var sorted = _.sortBy(filtered, "careTeam");
		var results = _.groupBy(sorted, this.model.get("primaryGroupBy"));
		//When primaryGroupBy is provider this is location.
		//When primaryGroupBy is location this is provider.
		_.each(results, function (el, i, list) {
			list[i] = _.groupBy(el, this.model.get("secondaryGroupBy"));
		}, this);
		return results;
	},
	groupbyChange: function (e) {
		///<summary>Deprecated in round 3 designs</summary>
		var selectedGroupBy = e.currentTarget.value;
		this.model.set("primaryGroupBy", selectedGroupBy);
		switch (selectedGroupBy) {
			case "billedname":
				this.model.set("secondaryGroupBy", "department");
				break;
			case "department":
				this.model.set("secondaryGroupBy", "billedname");
				break;
			case "appttime":
				this.model.set("secondaryGroupBy", "department");
				break;
		}
		this.resultsList.collection = this.getResults();
		this.$(".foundappts").empty().append(this.resultsList.render().el);
	},
	learnMoreClick: function (e) {
	    var reqDialog = new ux.DialogView({
	        model: new ux.DialogModel({
	            contentTemplate: "template/dialogs/learnMoreTmpl.html",
	            footerTemplate: "template/dialogs/requestExceptionFooterTmpl.html",
	            dialogTitle: "About This Appointment",
	            dialogSize: "sizesmall",
	            dialogType: "default",
	            onCloseFunction: this.requestCancel.bind(this)
	        })
	    });
	    reqDialog.render();
	},
	locationChange: function (e) {
		var selectedLocation = e.currentTarget.value;
		if (selectedLocation == "-1") {
			this.model.set("selectedLocation", null);
		}
		else {
			this.model.set("selectedLocation", selectedLocation);
		}
		this.resultsList.collection = this.getResults();
		this.$(".foundappts").empty().append(this.resultsList.render().el);
		this.calendar.render();
	},
	providerChange: function (e) {
		var selectedProviderId = parseInt(e.currentTarget.value);
		this.model.set("requestAppt", false);
		if (selectedProviderId == -2) {
			this.createRequestDialog();
		}
		else if (selectedProviderId == -3) {
			this.createRequestDisabledDialog();
		}
		else {
			if (selectedProviderId == -1) {
				this.model.set("selectedProvider", null);
			}
			else {
				this.model.set("selectedProvider", selectedProviderId);
			}
			//Filter with provider chosen
			this.resultsList.collection = this.getResults();
			this.$(".foundappts").empty().append(this.resultsList.render().el);
			this.calendar.render();
		}
	},
	requestCancel: function () {
		this.$("#personchoice option")[0].selected = true;
		this.model.set("selectedProvider", null);
		//Re-query with provider set to no preference to give users a chance to
		//select a different provider.
		this.resultsList.collection = this.getResults();
		this.$(".foundappts").empty().append(this.resultsList.render().el);
		this.calendar.render();
	},
	render: function () {
		this.collection = this.getResults();
		this.$el.empty().html(this.template(this.model.attributes));
		this.resultsList = new sc.ResultsListView({
			el: ".foundappts",
			model: this.model,
			collection: this.collection,
			parentView: this
		});
		this.$(".foundappts").append(this.resultsList.render().el);
		this.calendar = new sc.CalendarView({
			model: this.model
		}).render();
		setTimeout(function () {
			this.$(".foundappts").addClass("fadeInLeft animated");
			setTimeout(function () {
				this.$(".filtermenus").addClass("fadeInLeft animated");
			}, 750);
		}, 250);
		return this;
	},
	timeChange: function (e) {
		var timeschecked = "";
		this.$el.find(".p-timecheck:checked").each(function (index) {
			timeschecked += $(this).val();
			timeschecked += ",";
		});

		if (timeschecked == "") {
			//Nothing selected equals everything selected; trailing , removed below
			timeschecked = "11:59 AM,12:00 PM,5:00 PM,";
		}
		this.model.set("selectedTime", timeschecked.substr(0, timeschecked.length - 1));
		//console.info("[AppointmentResultView.timeChange] selectedTime="+this.model.get("selectedTime"));
		this.resultsList.collection = this.getResults();
		this.$(".foundappts").empty().append(this.resultsList.render().el);
		this.calendar.render();
	}
});
//Calendar widget functionality
sc.CalendarView = Backbone.View.extend({
	el: ".schcalendar",
	events: {
		"click .p-nextMonth": "nextMonthClick",
		"click .p-prevMonth": "prevMonthClick",
		"click .p-day": "dayClick"
	},
	dayClick: function (e) {
		var d = e.currentTarget.attributes["data-date"].value;
		this.model.set("selectedDate", d);
		//Use the calendarScroll property arbitrarily to trigger a render
		//on AppointmentResultView
		this.model.set("calendarScroll", "right");
	},
	hasAvailableAppointment: function (selectedDate) {
		///<summary>Given a Date figure out if there are appointment slots.</summary>
		///<param name="selectedDate" type="string">In the format 5/1/2015</param>
		appt = _.filter(sc.apptDb, function (o) {
			function withinTimeChoices(slotTime, selectedTimes) {
				var day = "01/01/1970 "; //arbitrary to produce legit datetime stamp
				var slot = Date.parse(day + slotTime);
				var MORNING = "11:59 AM";
				var AFTERNOON = "12:00 PM";
				var EVENING = "5:00 PM";
				var truth = false;

				if (selectedTimes.indexOf(MORNING) > -1) {
					truth = (slot <= Date.parse(day + MORNING));
				}
				if (!truth && selectedTimes.indexOf(AFTERNOON) > -1) {
					truth = (slot >= Date.parse(day + AFTERNOON) && slot < Date.parse(day + EVENING));
				}
				if (!truth && selectedTimes.indexOf(EVENING) > -1) {
					truth = (slot >= Date.parse(day + EVENING));
				}
				return truth;
			}
			function withinTimeRange(slotTime, selectedTime) {
				var day = "01/01/1970 "; //arbitrary to produce legit datetime stamp
				var slot = Date.parse(day + slotTime);
				var selected = Date.parse(day + selectedTime);
				var NINE_AM = Date.parse(day + "9:00 AM");
				var NOON = Date.parse(day + "12:00 PM");
				var ONE_PM = Date.parse(day + "1:00 PM");
				var FIVE_PM = Date.parse(day + "5:00 PM");

				if (selected <= NINE_AM) {
					return (slot <= NINE_AM);
				}
				else if (selected < NOON) {
					return (slot < NOON);
				}
				else if (selected >= FIVE_PM) {
					return (slot >= FIVE_PM);
				}
				else if (selected >= ONE_PM) {
					return (slot >= ONE_PM);
				}
				else {
					return (slot == NOON);
				}
			}
			//this.model instanceof ParSelectionModel
			var truth = o.par == this.model.get("parLabel");
			if (this.model.has("selectedDate")) {
				truth = (truth && o.apptdate == sc.Calendar.toDateString(selectedDate));
			}
			if (this.model.has("selectedProvider")) {
				truth = (truth && (o.providerid == this.model.get("selectedProvider")));
			}
			if (this.model.has("selectedLocation")) {
				truth = (truth && (o.department == this.model.get("selectedLocation")));
			}
			if (this.model.has("selectedTime")) {
				truth = (truth && withinTimeChoices(o.appttime, this.model.get("selectedTime")));
			}
			return truth;
		}, this);
		return (appt.length > 0);
	},
	getLastDayOfMonth: function (d) {
		///<summary>Find the last date of the month</summary>
		///<param name="d" type="string">A date string in the format mm/dd/yyyy</param>
		///<return>An integer representing the last date of the month.</return>
		d = new Date(d);
		return (new Date(d.getYear(), d.getMonth() + 1, 0)).getDate();
	},
	getSundayOfWeek: function (d) {
		///<summary>Get the date of the Sunday beginning the week</summary>
		///<param name="d" type="string">A date string in the format mm/dd/yyyy</param>
		///<return>A Date object representing the date of the sunday of the current week </return>
		d = new Date(d);
		var day = d.getDay();
		var diff = d.getDate() - day;
		return new Date(d.setDate(diff));
	},
	nextMonthClick: function () {
		var d = new Date(this.model.get("selectedDate"));
		var d1 = new Date(d.getFullYear(), d.getMonth() + 1, 1);
		this.model.set("selectedDate", sc.Calendar.toDateString(d1));
		this.model.set("calendarScroll", "right");
	},
	prevMonthClick: function () {
		var d = new Date(this.model.get("selectedDate"));
		var d1 = new Date(d.getFullYear(), d.getMonth() - 1, 1);
		this.model.set("selectedDate", sc.Calendar.toDateString(d1));
		this.model.set("calendarScroll", "right");
	},
	render: function () {
		function pad(day) {
			///<summary>Adds non-breaking space before and after a date if it is 
			///single digit. Do this to pad out the length of the date string so
			///that it looks circular when CSS applied.</summary>
			///<param name="day" type="number">The day of the month.</param>
			if (day < 10) return "&nbsp;" + day + "&nbsp;";
			return day.toString();
		}
		var today = new Date(this.model.get("todayDate"));
		var selected = new Date(this.model.get("selectedDate"));
		var month = sc.Calendar.FULL_MONTH_LABELS[selected.getMonth()];
		var html = "<div class=\"calendarheading\">";
		html += "<a class=\"prevmonthbtn p-prevMonth\">&#9664;</a><span class=\"monthyeartitle\">";
		html += month + " " + selected.getFullYear() + "</span><a class=\"nextmonthbtn p-nextMonth\">&#9654;</a></div>";
		html += "<table class=\"scalendar\"><tr>";
		html += "<th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th>";
		html += "</tr><tr>";
		var offset = (new Date(selected.getFullYear(), selected.getMonth(), 1)).getDay();
		var lastDayOfMonth = this.getLastDayOfMonth(sc.Calendar.toDateString(selected));
		var dayOfWeekPosition = offset;
		//Pad calendar with empty cells until first day of month.
		for (var i = 0; i < offset; i++) {
			html += "<td>&nbsp;</td>";
		}
		var day;
		var selectedDate = new Date(this.model.get("selectedDate"));
		for (var i = 1; i <= lastDayOfMonth; i++) {
			day = new Date(selected.getFullYear(), selected.getMonth(), i);
			if (day < today) {
				html += "<td class=\"pastday\">" + pad(i) + "</td>";
			}
			else if (day.valueOf() == today.valueOf()) {
				//If today IS the selected day then we want 2 classes.
				if (day.valueOf() == selectedDate.valueOf()) {
					html += "<td><a class=\"p-day today selectedday\" data-date=\"" + sc.Calendar.toDateString(day) + "\">" + pad(i) + "</a></td>";
				}
					//Otherwise just the today class added.
				else {
					html += "<td><a class=\"p-day today\" data-date=\"" + sc.Calendar.toDateString(day) + "\">" + pad(i) + "</a></td>";
				}
			}
			else if (day.valueOf() == selectedDate.valueOf()) {
				html += "<td><a class=\"p-day selectedday\" data-date=\"" + sc.Calendar.toDateString(day) + "\">" + pad(i) + "</a></td>";
			}
			else if (this.hasAvailableAppointment(day)) {
				html += "<td><a class=\"p-day availappointment\" data-date=\"" + sc.Calendar.toDateString(day) + "\">" + pad(i) + "</a></td>";
			}
			else {
				html += "<td><a class=\"p-day\" data-date=\"" + sc.Calendar.toDateString(day) + "\">" + pad(i) + "</a></td>";
			}
			dayOfWeekPosition++;
			if (dayOfWeekPosition == 7) {
				html += "</tr>"
				dayOfWeekPosition = 0;
			}
			if (dayOfWeekPosition == 0) {
				html += "<tr>";
			}
		}
		html += "</tr></table>";
		this.$el.empty().append(html);
		return this;
	}
});

//Manages rendering of an ApptSlotCol
//Collection for this view is an object resulting from _.groupBy 
//and not a backbone collection
sc.ResultsListView = Backbone.View.extend({
	events: {
		"click .p-page": "pageClick",
		"click .p-prevDay": "prevDayClick",
		"click .p-nextDay": "nextDayClick",
		"click .p-request-link": "requestClick",
	},
	currentPage: 1,
	startRecord: 0,
	parentView: null,
	template: ux.loadTemplate("template/resultsListTmpl.html"),
	noResultsTemplate: ux.loadTemplate("template/noResultsTmpl.html"),
	initialize:function(opts) {
		this.parentView = opts.parentView;
	},
	nextDayClick: function (e) {
		var d = new Date(this.model.get("selectedDate"));
		var d1 = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
		this.model.set("selectedDate", sc.Calendar.toDateString(d1));
		this.model.set("calendarScroll", "right");
	},
	pageClick: function (e) {
		this.currentPage = e.currentTarget.attributes["value"].value;
		this.startRecord = (this.currentPage - 1) * sc.ResultsListView.PAGE_SIZE;
		this.render();
	},
	prevDayClick: function (e) {
		var d = new Date(this.model.get("selectedDate"));
		var d1 = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
		this.model.set("selectedDate", sc.Calendar.toDateString(d1));
		this.model.set("calendarScroll", "right");
	},
	render: function () {
		var groupItems = _.keys(this.collection);
		this.model.set("numPages", Math.ceil(
							groupItems.length / sc.ResultsListView.PAGE_SIZE));
		this.model.set("currentPage", this.currentPage);
		this.$el.html(this.template(this.model.attributes));

		//Show no results for day message
		if (_.keys(this.collection).length == 0) {
			if (!this.model.get("requestAppt")) {
				this.$(".resultlistcontainer").append(this.noResultsTemplate(this.model.attributes));
			}
			//Hide "Providers Available..." heading from requestApptTmpl if this 
			//list is empty			
			this.$(".providersavailable").hide();
		}
			//Show grouped results for day
		else {
			var node = document.createElement("ul");
			var limit;
			if (groupItems.length <= sc.ResultsListView.PAGE_SIZE) {
				limit = groupItems.length;
			}
			else {
				if (this.startRecord + sc.ResultsListView.PAGE_SIZE > groupItems.length) {
					limit = (groupItems.length - sc.ResultsListView.PAGE_SIZE) + this.startRecord;
				}
				else {
					limit = this.startRecord + sc.ResultsListView.PAGE_SIZE;
				}
			}
			var groupedResult;
			for (var i = this.startRecord; i < limit; i++) {
				var isCareTeam = this.classify(this.collection[groupItems[i]]);
				groupedResult = new sc.GroupedResult();
				//Provider or location
				groupedResult.set("heading", groupItems[i]);
				if (isCareTeam) {
					groupedResult.set("classification", "CARE TEAM");
					groupedResult.set("classlabel", "careteam");
				}
				else {
					groupedResult.set("classification", ""); //This used to be PROVIDER
					groupedResult.set("classlabel", "provider");
				}

				groupedResult.set("groupedSlots", this.collection[groupItems[i]]);
				node.appendChild(new sc.ApptGroupView(
					{ model: groupedResult, viewmodel: this.model }
				).render().el);
			}
			this.$(".resultlistcontainer").append(node);
		}
		return this;
	},
	requestClick: function (e) {
		//Request dialog for when no results are found and link is clicked.
		var reqdialog = new sc.RequestAppointmentDialog({
			model: new ux.DialogModel({
				contentTemplate: "template/dialogs/requestApptBody1Tmpl.html",
				contentTemplateModel: { introCopy: "" },
				secondContentTemplate: "template/dialogs/requestApptBody2Tmpl.html",
				footerTemplate: "template/dialogs/requestApptFooter1Tmpl.html",
				secondFooterTemplate: "template/dialogs/requestApptFooter2Tmpl.html",
				dialogTitle: "Send a Request",
				dialogSize: "sizemedium",
				onCloseFunction: function () {
					sc.App.prototype.link("home", { trigger: true });
				},
				onCancelFunction: function () { },
				onOpenFunction: function (dialogView) {
					///<param name="dialogView" type="ux.DialogView">Instance of the DialogView.</param>
					//Pre-select the provider in the request appoinment dialog
					//to be the provider chosen to the filters.
					dialogView.$el.find("#providerchoice").val(dialogView.parentView.$el.find("#personchoice").val());
					dialogView.$("#officechoice").val(dialogView.parentView.$("#locationchoice").val());
					var morningchoice = dialogView.parentView.$("#morningchoice").is(":checked");
					var afternoonchoice = dialogView.parentView.$("#afternoonchoice").is(":checked");
					var eveningchoice = dialogView.parentView.$("#eveningchoice").is(":checked");
					dialogView.$("#morningTime").prop("checked", morningchoice);
					dialogView.$("#afternoonTime").prop("checked", afternoonchoice);
					dialogView.$("#eveningTime").prop("checked", eveningchoice);
					dialogView.$("#nopreftime").prop("checked",
						!((morningchoice | afternoonchoice | eveningchoice) == true));
				}
			}),
			parentView:this.parentView
		});
		reqdialog.render();
		//el needed to be body for the initial dialog render
		//narrow to .requestform for event handling
		reqdialog.el = ".requestform";
		reqdialog.delegateEvents();
	},
	classify: function (obj) {
		//Because obj has keys based on secondaryGroupBy we take the first group's 
		//array and take the first item from that since all the groups map back to
		//the same provider. 
		var o = obj[_.keys(obj)[0]][0];
		var a = [o.providerid];
		var b = _.intersection(a, this.model.get("careTeam"));
		return (b.length > 0);
	}
},
{ //class properties
	PAGE_SIZE: 5
});

//model for this view is GroupedResult and not ParSelectionModel
sc.ApptGroupView = Backbone.View.extend({
	tagName: "li",
	className: "primary-group",
	template: ux.loadTemplate("template/resultGroupTmpl.html"),
	initialize: function (opts) {
		this.viewmodel = opts.viewmodel;
	},
	render: function () {
		//This is the group heading template. 
		this.$el.html(this.template(
			_.extend(this.model.attributes, this.viewmodel.attributes)
		));
		var groupedSlots = this.model.get("groupedSlots");
		for (var key in groupedSlots) {
			var scroller = new sc.ApptSlotScrollView({
				collection: groupedSlots[key],
				objKey: key,
				classification: this.model.get("classification"),
				viewmodel: this.viewmodel
			});
			this.$el.append(scroller.render().el);
		}
		return this;
	}
});

//Appointment time slots in the find appointment page
//How is this different than sc.ButtonScroller?
sc.ApptSlotScrollView = Backbone.View.extend({
	tagName: "div",
	className: "secondary-grouping",
	events: {
		"click .p-scroll-left": "scrollLeftClick",
		"click .p-scroll-right": "scrollRightClick",
		"click .p-timeslot": "slotClick"
	},
	template: ux.loadTemplate("template/horizontalScrollerTmpl.html"),
	initialize: function (opts) {
		this.objKey = opts.objKey;
		this.classification = opts.classification;
		this.viewmodel = opts.viewmodel;
	},
	scrollLeftClick: function (e) {
		if (this.index > 0) {
			this.index--;
			var travelDistance = $(this.$items[0]).width() * this.viewmodel.get("visibleSlots");
			travelDistance += 26; //Fudge factor to account for padding between buttons.
			this.$items.animate({ "left": "+=" + travelDistance });
		}
	},
	scrollRightClick: function (e) {
		if (this.index < this.endIndex) {
			this.index++;
			var travelDistance = $(this.$items[0]).width() * this.viewmodel.get("visibleSlots");
			travelDistance += 26;
			this.$items.animate({ "left": "-=" + travelDistance });
		}
	},
	slotClick: function (e) {
		var apptId = parseInt(e.currentTarget.attributes["data-slot"].value);
		console.info("[ApptItemView.slotClick] selected appt id=" + apptId);
		//Assume always return one unique appointment slot.
		var slot = _.where(sc.apptDb, { cid: apptId })[0];
		this.viewmodel.set("providerName", slot.billedname);
		this.viewmodel.set("location", slot.department);
		this.viewmodel.set("apptDay", slot.apptdate);
		this.viewmodel.set("apptTime", slot.appttime);
		this.viewmodel.set("par", slot.par);
		this.viewmodel.set("selectedProvider", slot.providerid);
		//Make the buttons styled links and we can use routing instead!
		$(".appointmentresults").addClass("fadeOutLeft animated");
		setTimeout(function () {
			sc.App.prototype.link("apptReview", { trigger: true });
		}, 1000);

	},
	render: function () {
		var isCareTeam = this.classify(this.collection[0]);
		var classification, classlabel;
		if (isCareTeam) {
			classification = "CARE TEAM";
			classlabel = "careteam";
		}
		else {
			classification = ""; //This used to be PROVIDER
			classlabel = "provider";
		}
		this.$el.html(this.template(
			{
				classification: classification,
				classlabel: classlabel,
				key: this.objKey,
				groupedSlots: this.collection,
				primaryGroupBy: this.viewmodel.get("primaryGroupBy"),
			}
		));
		this.$items = this.$(".scrollable-item");
		this.index = 0;
		this.endIndex = this.$items.length / this.viewmodel.get("visibleSlots");
		return this;
	},
	classify: function (obj) {
		//Because obj has keys based on secondaryGroupBy we take the first group's 
		//array and take the first item from that since all the groups map back to
		//the same provider. 
		var a = [obj.providerid];
		var b = _.intersection(a, this.viewmodel.get("careTeam"));
		return (b.length > 0);
	}
});

//The page where you review the appointment you've selected (page 3)
sc.AppointmentReviewView = Backbone.View.extend({
	el: "div.sch",
	events: {
		"click #confirmBtn": "confirmClick",
		"click #backBtn": "backClick",
		"focus .p-note-textarea": "noteTextAreaFocus"
	},
	apptSeq: 205,
	initialize: function (opts) {
		this.recommendedCol = opts.recommended;
	},
	template: ux.loadTemplate("template/appointmentReviewTmpl.html"),
	backClick: function (e) {
		sc.App.prototype.link("apptList", { trigger: true });
	},
	confirmClick: function (e) {
		if (this.model.get("scheduleType") == "new") {
			var newappt = new sc.UpcomingAppts({
				selectedDate: this.model.get("apptDay"),
				dayOfWeek: sc.Calendar.getFullDayLabel(this.model.get("selectedDate")),
				apptTime: this.model.get("apptTime"),
				providerName: this.model.get("providerName"),
				providerId: this.model.get("selectedProvider"),
				par: this.model.get("parLabel"),
				apptId: this.apptSeq++
			});
			sc.upcomingAppts.add(newappt);
		}
		if (this.model.get("scheduleType") == "reschedule") {
			var appt = sc.upcomingAppts.findWhere(
				{ apptId: this.model.get("rescheduleApptId") }
			);
			appt.set("apptTime", this.model.get("apptTime"));
			appt.set("selectedDate", this.model.get("apptDay"));
		}
		if (this.model.get("scheduleType") == "recommended") {
			var newappt = new sc.UpcomingAppts({
				selectedDate: this.model.get("apptDay"),
				apptTime: this.model.get("apptTime"),
				providerName: this.model.get("providerName"),
				providerId: this.model.get("selectedProvider"),
				par: this.model.get("parLabel")
			});
			sc.upcomingAppts.add(newappt);
			var remove = sc.recommendedAppts.findWhere(
				{ apptId: this.model.get("recommendedApptId") });
			sc.recommendedAppts.remove(remove);
		}
		this.undelegateEvents();
		sc.App.prototype.link("apptConfirm", { trigger: true });
	},
	noteTextAreaFocus: function(e) {
		this.$(".p-visit-time").addClass("flash-attention");
	},
	render: function () {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

//The page where you review the requested appointment (page 3a)
sc.AppointmentRequestView = sc.AppointmentReviewView.extend({
	template: ux.loadTemplate("template/requestApptReviewTmpl.html"),
	confirmClick: function (e) {
		sc.App.prototype.link("apptRequestConfirm", { trigger: true });
	}
});

//Confirmation after the appointment has been selected (page 4)
sc.AppointmentConfirmView = Backbone.View.extend({
	el: "div.sch",
	events: {
		"click .p-backToAppts": "backToApptClick"
	},
	template: ux.loadTemplate("template/appointmentConfirmTmpl.html"),
	backToApptClick: function (e) {
		sc.App.prototype.link("home", { trigger: true });
	},
	render: function () {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

//Confirmation after requesting the appointment (page 4a)
sc.RequestConfirmationView = sc.AppointmentConfirmView.extend({
	template: ux.loadTemplate("template/requestConfirmTmpl.html"),
});

//SuperMenu "abstract" class that handles the basic functionality of displaying
//a custom menu based on clicking on an element classed p-selectcontrol and 
//closing itself based on clicking out of the control and menu area defined as
//p-clicktrap. The p-clicktrap is an invisible fullscreen element above all
//other page content but below the super menu.
sc.SuperMenuView = Backbone.View.extend({
	events: {
		"click .p-selectcontrol": "toggleMenu",
		"click .p-clicktrap": "closeMenu",
	},
	toggleMenu: function () {
		this.$(".p-supermenu").toggle();
		this.$(".p-clicktrap").toggle();
	},
	closeMenu: function (e) {
		this.$(".p-supermenu").hide();
		this.$(".p-clicktrap").hide();
	},
	render: function () {
		this.$el.prepend("<div class=\"p-clicktrap clicktrap\"></div>");
		return this;
	}
});

sc.ParMenuView = sc.SuperMenuView.extend({
	el: "div.parmenu",

	//Make sure to include the events object from SuperMenuView
	events: _.extend({
		"click menu.parchoices li": "clickMenuItem",
		"mouseenter menu.parchoices li": "hoverMenuItem",
		"click #parSelect": "scheduleButtonClick",
	}, sc.SuperMenuView.prototype.events),
	template: ux.loadTemplate("template/parMenuTmpl.html"),
	validSelection: false,

	initialize: function (opts) {
		this.recommendedCol = opts.recommended;
	},
	clickMenuItem: function (e) {
		var parLabel = $(e.currentTarget).text();
		var dataPar = e.currentTarget.attributes["data-par"].value;
		//Bring up full PAR selection screen
		if (dataPar == "All Reasons") {
			//.otherappointments z-index increment to 2 to cover the large PAR
			//menu sliding in from the right. Reverse on backing out so that
			//the small PAR menu can open over the upcoming and recommended 
			//sections.
			this.model.set("showAllPars", true);
		}
		else {
			this.$(".p-selecttext").html(parLabel);
			this.model.set("parLabel", parLabel);
			this.validSelection = true;
		}
		this.toggleMenu();
		e.stopPropagation();
	},
	hoverMenuItem: function (e) {
		var id = "#" + e.currentTarget.attributes["data-desc"].value;
		this.$("aside").hide();
		this.$(id).show();
	},
	scheduleButtonClick: function (e) {
		if (this.validSelection) {
			this.$(".p-parerror").hide();
			this.model.set("scheduleType", "new");
			sc.App.prototype.link("apptList", { trigger: true });
		}
		else {
			this.$(".p-parerror").show();
		}
	},
	render: function () {
		this.validSelection = false;
		this.$el.html(this.template({
			numRecommendedAppts: this.recommendedCol.length
		}));
		//Prepend click trap and activate common menu control functions
		sc.SuperMenuView.prototype.render.call(this);
		return this;
	}
});

//Original idea was to bring up one dialog that could show multiple screens
//of information. This doesn't work well when the different screens are of
//differing sizes. In this case, using two separate dialogs works as well.
sc.TwoStateDialog = ux.DialogView.extend({
	events: _.extend({
		"click .p-state1complete": "state1CompleteClick"
	}, ux.DialogView.prototype.events),
	state1CompleteClick: function (e) {
		//show second state
		var dialog = $(".dialog");
		dialog.addClass("state2");
		$(".dialogpositioner .dialogbody").empty().append(
			ux.loadTemplate(this.model.get("secondContentTemplate")));
		$(".dialogpositioner footer").empty().append(
			ux.loadTemplate(this.model.get("secondFooterTemplate")));
	}
});

sc.RequestAppointmentDialog = sc.TwoStateDialog.extend({
	events: _.extend({
		"focus textarea": "focusMessageArea",
		"change #officechoice": "changeOfficeChoice"
	}, sc.TwoStateDialog.prototype.events),
	parentView: null,
	initialize:function(opts) {
		ux.DialogView.prototype.initialize.call(this);
		this.parentView = opts.parentView;
	},
	changeOfficeChoice: function(e) {
		var selectedIndex = this.$el.find("#officechoice option:selected").index();
		if (selectedIndex > 0) {
			this.$el.find("#officechoice").removeClass("requirederror");
			this.$el.find(".p-office-validation-note").hide();
		}
	},
	focusMessageArea: function (e) {
		this.$el.find("textarea").removeClass("requirederror");
		this.$el.find(".p-msg-validation-note").hide();
	},
	state1CompleteClick: function (e) {
		var validate = this.$el.find("#reqmessage").val();
		var validateLocation = this.$el.find("#officechoice option:selected").index();
		if (validate == "") {
			this.$el.find(".p-msg-validation-note").show();
			this.$el.find(".requestform textarea").addClass("requirederror");
		}
		else {
			this.$el.find(".p-msg-validation-note").hide();
			this.$el.find(".requestform textarea").removeClass("requirederror");
		}
		if (validateLocation == 0) {
			this.$el.find(".p-office-validation-note").show();
			this.$el.find(".reqlocation select").addClass("requirederror");
		}
		else {
			this.$el.find(".p-office-validation-note").hide();
			this.$el.find(".reqlocation select").removeClass("requirederror");
		}
		if (validate != "" && validateLocation !=0) {
			sc.TwoStateDialog.prototype.state1CompleteClick.call(this);
		}
	}
});

sc.CancelAppointmentDialog = sc.TwoStateDialog.extend({
	events: _.extend({
		"focus textarea": "focusMessageArea"
	}, sc.TwoStateDialog.prototype.events),
	focusMessageArea: function (e) {
		this.$el.find("textarea").removeClass("requirederror");
	},
	state1CompleteClick: function (e) {
		var validate = this.$el.find("#cancelarea").val();
		if (validate == "") {
			this.$el.find(".formerrormsg").show();
			this.$el.find(".cancelapptmsg textarea").addClass("requirederror");
		}
		else {
			sc.TwoStateDialog.prototype.state1CompleteClick.call(this);
		}
	}
});

//Tab component used for Upcoming and Recommended appointments sections
sc.TabView = Backbone.View.extend({
	el: "div.p-tabs",
	events: {
		"click span.tab": "tabClick"
	},
	tabClick: function (e) {
		var tab = $(e.currentTarget);
		var tabId = "#" + e.currentTarget.attributes["data-tab"].value;
		this.$("span.tab").removeClass("active");
		this.$("label").removeClass("active");
		this.$("section.tab-panel").removeClass("active");
		tab.find("> label").addClass("active");
		tab.addClass("active");
		this.$(tabId).addClass("active");
	}
});