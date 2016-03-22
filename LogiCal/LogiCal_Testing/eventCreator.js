function createEvent(input, emailTitle, emailSender, emailURL, emailRecipients){	
	// Get event start and end dates and times
	var dateTime = extractDateTime(input);
	var startDate = dateTime.startDate;
	var startTime = dateTime.startTime;
	var endDate   = dateTime.endDate;
	var endTime   = dateTime.endTime;
	var isAllDay  = dateTime.isAllDay;
	
	// Get array of locations
	var locations = extractVenues(input, emailSender);
	
	// Get description for event
	var description = input;
	if (/\S/.test(input)){
		description = input + "\n\n";
	}
	description += "Generated with LogiCal from:\n" + emailURL;
	
	// Get title for event
	var title = extractTitles(input, emailTitle);
	
	// Get email recipients
	var recipients = emailRecipients;
	
	var calendarEvent = new CalendarEvent(title,  description, locations, startDate, endDate, startTime, endTime, isAllDay, emailSender, recipients);
	return calendarEvent;
}
