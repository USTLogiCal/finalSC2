function CalendarEvent(eventTitle, eventDesc, eventLocations, eventStartDate, eventEndDate, eventStartTime, eventEndTime, eventIsAllDay, eventSender, eventRecipients) {

    this.title = eventTitle;
    /** @type {string} */
    this.description = eventDesc;
    
    this.locations = eventLocations;
    /** @type {string} */
    this.startDate = eventStartDate;
    /** @type {string} */
    this.endDate = eventEndDate; 
    /** @type {string} */
    this.startTime = eventStartTime;
    /** @type {string} */
    this.endTime = eventEndTime;
    /** @type {boolean} */
    this.isAllDay = eventIsAllDay;
    /** @type {string} */
    this.sender = eventSender;
    
    this.recipients = eventRecipients;
}

function Venue(inputWord, venueScore) {
	/** @type {string} */
    this.venue = inputWord;
    /** @type {string} */
    this.score = venueScore;
}

function Title(inputWord, titleScore) {
	/** @type {string} */
    this.title = inputWord;
    /** @type {string} */
    this.score = titleScore;
}


function eventStartEnd(eventIsAllDay, eventStartDate, eventStartTime, eventEndDate, eventEndTime){
	/** @type {boolean} */
	this.isAllDay = eventIsAllDay;
    /** @type {string} */
    this.startDate = eventStartDate;
    /** @type {string} */
    this.endDate = eventEndDate; 
    /** @type {string} */
    this.startTime = eventStartTime;
    /** @type {string} */
    this.endTime = eventEndTime;   
}
