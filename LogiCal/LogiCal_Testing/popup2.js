window.addEventListener('load', function() {
	setUpDateClockPickers();
	document.getElementById("IsAllDay").addEventListener("click", isAllDayValueChanged);
    document.getElementById('addGoogleCal').addEventListener("click", addEvent);
    document.getElementById('downloadICS').addEventListener("click", downloadICS);
    document.getElementById('clearHistory').addEventListener("click", clearHistory);
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if (msg.calendarEvent){
		document.getElementById('StartDate')
           .value = msg.calendarEvent.startDate;
		document.getElementById('EndDate')
           .value = msg.calendarEvent.endDate;
		document.getElementById('StartTime')
        .value = msg.calendarEvent.startTime;
		document.getElementById('EndTime')
        .value = msg.calendarEvent.endTime;
		document.getElementById('Description')
           .value = msg.calendarEvent.description;
		document.getElementById('Sender')
        	.value = msg.calendarEvent.sender;
		if	(msg.calendarEvent.isAllDay){
			document.getElementById('IsAllDay').checked=true;
			isAllDayValueChanged();
		}
		
		// Add all potential candidates for venue in selectbox
		if (msg.calendarEvent.locations.length > 0){
			for (var x = 0; x < msg.calendarEvent.locations.length; x++){
				var option = $('<option value="'+msg.calendarEvent.locations[x].venue+'"></option>');
		        $('#Locations').append(option);
			}
			document.getElementById('Location')
				.value = document.getElementById("Locations").options.item(0).value;
		}
		// Add all potential candidates for title
		if (msg.calendarEvent.title.length > 0){
			for (var x = 0; x < msg.calendarEvent.title.length; x++){
				var option = $('<option value="'+msg.calendarEvent.title[x].title.replace(/'/g, "&apos;").replace(/"/g, "&quot;")+'"></option>');
		        $('#Titles').append(option);
			}
			document.getElementById('Title')
				.value = document.getElementById("Titles").options.item(0).value;
		}
		
		for (var x = 0; x < msg.calendarEvent.recipients.length; x++){
			$("#Recipients").tagsManager('pushTag', msg.calendarEvent.recipients[x]);
		}
	}
});

function isAllDayValueChanged()
{
    if($('#IsAllDay').is(":checked"))  {
    	$("#StartTime").hide();
    	$("#EndTime").hide();
    	$("#StartDate").removeClass("field-style field-split align-left").addClass("field-style field-full align-none");
    	$("#EndDate").removeClass("field-style field-split align-left").addClass("field-style field-full align-none");
    }
    else{
        $("#StartDate").removeClass("field-style field-full align-none").addClass("field-style field-split align-left");
        $("#EndDate").removeClass("field-style field-full align-none").addClass("field-style field-split align-left");
        setTimeout(function(){
        	$("#StartTime").show();
            $("#EndTime").show();
        }, 350);
        
    }
}

// Set input masks on date and time boxes
function setUpDateClockPickers(){
	var startTime = $('#StartTime');
	startTime.clockpicker({
	    twelvehour: true,
	    donetext: "Set time",
	    placement: "left",
	    autoclose: "true"
	}).inputmask("hh:mm t");
	
	var endTime = $('#EndTime');
	endTime.clockpicker({
	    twelvehour: true,
	    donetext: "Set time",
	    placement: "left",
	    autoclose: "true"
	}).inputmask("hh:mm t");
	
	var startDate = $("#StartDate");
	startDate.datepicker({
		dateFormat: 'dd/mm/yy' 
	}).inputmask('dd/mm/yyyy');
	
	var endDate = $("#EndDate");
	endDate.datepicker({
		dateFormat: 'dd/mm/yy' 
	}).inputmask('dd/mm/yyyy');

	var recipients = $("#Recipients");
	recipients.tagsManager({	
		/*
		validator: function(){
			var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return emailRegex.test($("#Recipients").val());
		}
		*/
	});
	
}

function addEvent(){
	var newSavedLocation = {
    		venueSender:  $("#Sender").val(),
		    venueName: $("#Location").val(),
		    venueScore: 6
	};
	
	chrome.runtime.sendMessage({newVenue: newSavedLocation}, function(response) {
		  
	});
	
	var link = getGoogleCalURL();
	var googleCal = window.open(link);
	window.setTimeout(function() {
	    googleCal.addEventListener("load", function() {
	        alert("received load event");
	    }, false);
	}, 0);
	
    window.close();
}

function clearHistory(){
	var cHis = "Clear history";
	chrome.runtime.sendMessage({cHistory: cHis}, function(response) {
		  
	});
}

function downloadICS(){
	var dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
	var timeRegex = /^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/;
	if (!dateRegex.test($("#StartDate").val()) || !dateRegex.test($("#EndDate").val()) || !timeRegex.test($("#StartTime").val()) || !timeRegex.test($("#EndTime").val())){
		var errorMsg = "Please input proper date and time";
		alert(errorMsg);
		return;
	}
	
	var icsEventStart = $("#StartDate").val();
	var toMMDDYYYYstart = icsEventStart.split('/');
	icsEventStart = toMMDDYYYYstart[1] + '/' + toMMDDYYYYstart[0] + '/' + toMMDDYYYYstart[2];
	
	var icsEventEnd = $("#EndDate").val();
	var toMMDDYYYYend = icsEventEnd.split('/');
	icsEventEnd = toMMDDYYYYend[1] + '/' + toMMDDYYYYend[0] + '/' + toMMDDYYYYend[2];
	
	if (!$('#IsAllDay').is(":checked")) {
		icsEventStart += " " + $("#StartTime").val();
		icsEventEnd += " " + $("#EndTime").val();
	}
	
	var icsEventTitle = "Untitled event";
	if (!($("#Title").val().replace(/^\s+|\s+$/g, '').length == 0)){
		icsEventTitle = $("#Title").val();
	}
	
	var icsEventLocation = " ";
	if (!($("#Location").val().replace(/^\s+|\s+$/g, '').length == 0)){
		icsEventLocation = $("#Location").val();
	}
	
	var icsEventDescription = " ";
	if (!($("#Description").val().replace(/^\s+|\s+$/g, '').length == 0)){
		icsEventDescription = $("#Description").val();
	}
	
	var cal = ics();
	cal.addEvent(icsEventTitle, icsEventDescription, icsEventLocation, icsEventStart, icsEventEnd);
	cal.download(icsEventTitle);
}
function getGoogleCalURL(){
	 var link = 'https://calendar.google.com/calendar/event?action=TEMPLATE&trp=false&ctext=' + encodeURIComponent($("#Title").val());
	
	// Regex to ensure correct time and date input
	var regex12HourTime = /^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/;
	var regexDDMMYYYY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
	 
	// Test start and end time and date regex matching
	var startMatchesRegex = regexDDMMYYYY.test($("#StartDate").val()) && regex12HourTime.test($("#StartTime").val());
	var endMatchesRegex   = regexDDMMYYYY.test($("#EndDate").val()) && regex12HourTime.test($("#EndTime").val());
	
	regex12HourTime.test($("#StartTime").val());
	if (startMatchesRegex){
		if ($("#IsAllDay").is(":checked")){
			link += '&dates=' + moment($("#StartDate").val()+$("#StartTime").val(), "DD/MM/YYYYhh:mm a").format('YYYYMMDD');
		}
		else{
			link += '&dates=' + moment($("#StartDate").val()+$("#StartTime").val(), "DD/MM/YYYYhh:mm a").format('YYYYMMDDTHHmmss');
		}
		
        if (endMatchesRegex) {
    		if ($("#IsAllDay").is(":checked")){
    			link += '/' + moment($("#EndDate").val()+$("#EndTime").val(), "DD/MM/YYYYhh:mm a").format('YYYYMMDD');
    		}
    		else{
    			link += '/' + moment($("#EndDate").val()+$("#EndTime").val(), "DD/MM/YYYYhh:mm a").format('YYYYMMDDTHHmmss');
    		}
        } 
	}
	
	if (!(/^\s*$/.test($("#Location").val()))) {
        link += '&location=' + encodeURIComponent($("#Location").val());
    }
	
	if (!(/^\s*$/.test($("#Description").val()))) {
		link += '&details=';
		var description = $("#Description").val();
		var recipients = $("#Recipients").tagsManager('tags');
		if (recipients.length > 0){
			description += "\n\nPotential guests:";
			for (var x=0; x < recipients.length; x++){
				description = description + "\n" + recipients[x];
			}
		}
        link += encodeURIComponent(description);
    }
	
	return link;
}