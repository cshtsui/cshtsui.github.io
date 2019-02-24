var sc = {};

$(document).ready(function () {
	var appRouter = new sc.App();
	Backbone.history.start();
});

//View references
sc.apptConfirm = null;
sc.apptHomeView = null;
sc.apptResultView = null;
sc.apptReviewView = null;
sc.parSelectModel = null;
sc.upcomingAppts = null;
sc.recommendedAppts = null;

sc.App = Backbone.Router.extend({
	routes: {
		"": "homeRoute",
		"home":"homeRoute",
		"home/:mode": "homeRoute",
		"apptConfirm": "appointmentConfirmed",
		"apptList": "appointmentResults",
		"apptReview": "reviewAppointment",
		"apptRequest": "requestAppointment",
		"apptRequestConfirm": "requestConfirmed",
		"*catchall": "defaultRoute"
	},
	initialize: function (opts) {
		sc.parSelectModel = new sc.ParSelectionModel();
		sc.upcomingAppts = new sc.UpcomingCol();
		sc.upcomingAppts.add(new sc.UpcomingAppts({
			apptId: 300,
			par: "Follow Up",
			providerName: "Luiza A. Rocha",
			dayOfWeek: "Thursday",
			selectedDate: "7/24/2015",
			apptTime: "1:00 PM",
			providerId: 1
		}));
		sc.upcomingAppts.add(new sc.UpcomingAppts({
			apptId: 301,
			par: "Breast Cancer Screening (Mammogram)",
			providerName: "Sarah Abt, MD",
			dayOfWeek: "Wednesday",
			selectedDate: "12/28/2025",
			apptTime: "12:00 PM",
			providerId: 53
		}));
		sc.upcomingAppts.comparator = "selectedDate";
		sc.recommendedAppts = new sc.UpcomingCol();
		sc.recommendedAppts.add(new sc.UpcomingAppts({
			apptId: 201,
			par: "Annual Physical",
			providerName: "Gary M. Salters, MD",
			selectedDate: "8/3/2015",
			dayOfWeek: sc.Calendar.getFullDayLabel("8/3/2015"),
			apptTime: "",
			hasInstructions: false,
			providerId: 76
		}));
		sc.recommendedAppts.add(new sc.UpcomingAppts({
			apptId: 202,
			par: "High Blood Pressure and Heart Disease Visit",
			providerName: "Luiza A. Rocha, MD",
			selectedDate: "8/5/2015",
			dayOfWeek: sc.Calendar.getFullDayLabel("8/5/2015"),
			apptTime: "",
			providerId: 1
		}));

		new sc.TopNavigation();
	},
	appointmentConfirmed: function () {
		sc.apptConfirm = new sc.AppointmentConfirmView({
			model: sc.parSelectModel
		});
		sc.apptConfirm.render();
	},
	appointmentResults: function () {
		sc.apptResultView = new sc.AppointmentResultView({
			model: sc.parSelectModel
		});
		sc.apptResultView.render();
		sc.apptHomeView.undelegateEvents();
	},
	homeRoute: function (mode) {
		if (sc.parSelectModel != null) {
			sc.parSelectModel.reset();
		}
		//Because basically I finally learned that events are bound to the el of
		//a view and since I'm using div.sch for everything I need to do manual
		//cleanup since div.sch never gets removed from the DOM (and therefore
		//automatically having it's event handlers scrubbed (?). If you don't do
		//the below then you double bind eventhandlers in the events hash which
		//can lead to weirdness depending on the contents of those functions.
		if (sc.apptResultView != null) {
			sc.apptResultView.undelegateEvents();
		}
		if (sc.apptConfirm != null) {
			sc.apptConfirm.undelegateEvents();
		}
		if (sc.apptReviewView != null) {
			sc.apptReviewView.undelegateEvents();
		}
		if (mode == "unavailable") {
			sc.parSelectModel.set("schedulingoffline", true);
		}
		else if (mode == "norecwebsch") {
			sc.parSelectModel.set("noRecommendedWebSchedule", true);
		}
		else if (mode =="nocancel") {
			sc.parSelectModel.set("noCancel", true);
		}
		else if (mode == "noreschedule") {
			sc.parSelectModel.set("noReschedule", true);
		}
		sc.apptHomeView = new sc.AppointmentHomeView({
			model: sc.parSelectModel,
			collection: sc.upcomingAppts,
			recommended: sc.recommendedAppts
		});
		sc.apptHomeView.render();
	},
	reviewAppointment: function () {
		sc.apptReviewView = new sc.AppointmentReviewView({
			model: sc.parSelectModel,
			collection: sc.upcomingAppts,
			recommended: sc.recommendedAppts
		});
		sc.apptReviewView.render();
		sc.apptResultView.undelegateEvents();
	},
	defaultRoute: function (catchall) {
		///<summary>Do not use. Unaccounted for routes go here.</summary>
		console.log("[App.defaultRoute] Routed to: " + catchall);
	},
	link: function (route, paramObj) {
		window.scrollTo(0, 0);
		sc.App.prototype.navigate(route, paramObj);
	}
});
