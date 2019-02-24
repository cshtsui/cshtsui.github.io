sc.ParSelectionModel = Backbone.Model.extend({
	defaults: {
		parId: -99,
		parLabel: "Sick Visit",
		careTeam: [76,1,53], //Gary, Luiza (PCP), Sarah
		selectedDate: null,
		todayDate: "7/19/2015",
		selectedProvider: null,
		selectedTime: null,
		selectedLocation: null,
		scheduledTime: null,
		rescheduleApptId: -2,
		recommendedApptId: -1,
		cancelApptId: -3,
		primaryGroupBy: "billedname",
		secondaryGroupBy: "department",
		providerName: "Rick C. Gonzalez",
		bestTime: "No Preference",
		bestLocation: "No Preference",
		location: null,
		dayLabel: null,
		apptDay: null,
		apptTime: null,
		fullDateLabel: null,
		numPages: 1,
		currentPage:1,
		visibleSlots: 4,
		scheduleType:"new",	//new, reschedule, recommended
		calendarScroll: null, //either "left" or "right"
		showAllPars: false,	//if true then show large PAR menu
		schedulingoffline: false,
		noRecommendedWebSchedule: false,
		noCancel: false,
		noReschedule:false
	},
	initialize: function (opts) {
		this.on("change:apptDay", this.createDayLabel);
		this.on("change:selectedDate", this.createFullDateLabel);
	},
	createDayLabel: function () {
		this.set("dayLabel", sc.Calendar.getFullDayLabel(this.get("apptDay")));
	},
	createFullDateLabel:function() {
		this.set("fullDateLabel",
			sc.Calendar.getFullDateLabel(this.get("selectedDate"))
		);
	},
	reset: function () {
		this.set("selectedDate", null);
		this.set("selectedProvider", null);
		this.set("selectedTime", null);
		this.set("selectedLocation", null);
		this.set("par", null);
		this.set("apptDay", null);
		this.set("apptTime", null);
		this.set("dayLabel", null);
		this.set("fullDateLabel", null);
		this.set("location", null);
		this.set("primaryGroupBy", "billedname");
		this.set("secondaryGroupBy", "department");
		this.set("bestTime", "No Preference");
		this.set("bestLocation", "No Preference");
		this.set("providerName", "Rick C. Gonzalez");
		this.set("scheduleType", "new");
		this.set("rescheduleTime", null);
		this.set("numPages", 1);
		this.set("currentPage", 1);
		this.set("recommendedApptId", -1);
		this.set("rescheduleApptId", -2);
	}
});

//Model for upcoming appointments on appointment home
sc.UpcomingAppts = Backbone.Model.extend({
	defaults: {
		apptId: -1,
		selectedDate: null,
		dayOfWeek:null,
		apptTime: null,
		providerName: null,
		providerId: -1,
		par: null,
		//For upcoming appointments this is forms or practice instructions present.
		//For recommended appointments this is just practice instructions. 
		hasInstructions: true,	
		dayOfWeek: null //Optional
	}
});

sc.UpcomingCol = Backbone.Collection.extend({
	model: sc.UpcomingAppts
});

sc.ApptSlot = Backbone.Model.extend({
	defaults: {
		providerid: -1,
		billedname: "Stephen Strange, MD",
		appointmenttype: "ANY99",
		par: "Sick",
		department: "311 Arsenal Street, Watertown, MA",
		apptdate: "4/24/2015",
		appttime: "6:47 AM"
	}
});

sc.GroupedResult = Backbone.Model.extend({
	defaults: {
		heading: "nothing",
		classification: "",
		groupedSlots: null //Object: ApptSlot grouped by secondaryGroupBy
	}
});

sc.ApptSlotCol = Backbone.Collection.extend({
	model:sc.ApptSlot
});

//Generates a richer representation of a day given a JavaScript Date
sc.Calendar = Backbone.Model.extend({
	defaults: {
		showMonth: false,
		hasAppointment: false,
		isToday: false
	},
	initialize: function (opts) {
		this.set("daylabel", sc.Calendar.DAY_LABELS[opts.date.getDay()]);
		this.set("month", sc.Calendar.MONTH_LABELS[opts.date.getMonth()]);
		this.set("daynumber", opts.date.getDate());
		this.set("datestamp", sc.Calendar.dateToString(opts.date));
		this.set("selected", opts.selected);
		var sd = new Date(opts.selected);
		if (this.get("daynumber") == sd.getDate()) {
			this.set("active", "dateshown");
		}
		else {
			this.set("active", "");
		}
	}
},
{
	MONTH_LABELS: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	FULL_MONTH_LABELS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	DAY_LABELS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	FULL_DAY_LABELS: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	getDayLabel: function (adate) {
		var d = new Date(adate);
		return sc.Calendar.DAY_LABELS[d.getDay()];
	},
	getFullDayLabel: function (adate) {
		var d = new Date(adate);
		return sc.Calendar.FULL_DAY_LABELS[d.getDay()];
	},
	getFullDateLabel: function(adate) {
		var d = new Date(adate);
		return	sc.Calendar.FULL_DAY_LABELS[d.getDay()] + ", "+
					sc.Calendar.FULL_MONTH_LABELS[d.getMonth()] +
					" "+d.getDate() +", "+d.getFullYear();
	},
	toDateString: function (d) {
		return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
	}
});

sc.DaysCol = Backbone.Collection.extend({
	model:sc.Calendar
});