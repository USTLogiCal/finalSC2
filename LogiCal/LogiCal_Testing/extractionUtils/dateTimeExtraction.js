function extractDateTime(input){
	input = input.replace(/christmas/gi, "December 25th");
	input = input.replace(/xmas/gi, "December 25th");
	input = input.replace(/x-mas/gi, "December 25th");
	input = input.replace(/new year/gi, "January 1st");
	input = input.replace(/valentines/gi, "February 14th");
	input = input.replace(/valentine's/gi, "February 14th");
	
	var foundEvent = Sherlock.parse(input.replace(/\s+/g, ' '));
	
	// If date & time found, then recorded
	// Otherwise, current time returned
	if (foundEvent.startDate != null){
		startDate = foundEvent.startDate;
	}
	else{
		startDate = new Date();
	}

	// If date & time found, then recorded
	// Otherwise, current time returned
	if (foundEvent.endDate != null){
		endDate = foundEvent.endDate;
	}
	else{
		endDate = new Date(startDate.getTime() +(60*60*1000));
	}
	
	
	var eventDateTimeDetails = new eventStartEnd(
			foundEvent.isAllDay,
			moment(startDate).format('DD/MM/YYYY'),
			moment(startDate).format('hh:mm a'),
			moment(endDate).format('DD/MM/YYYY'),
			moment(endDate).format('hh:mm a')
	);
	
	return eventDateTimeDetails;
}