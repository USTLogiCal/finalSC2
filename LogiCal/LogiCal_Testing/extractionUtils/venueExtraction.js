var regexProperNoun = new RegExp("^[A-Z0-9](.*)$");
var regexBracketOpenClose = new RegExp("^[\(](.*)[\)]$");
var regexBracketOpen = new RegExp("^[\(](.*)$");
var regexBracketClose = new RegExp("^(.*)[\)]$");

var venueIndicators = ["venue", "where", "location", "place", "site", "address"];
var venueTriggers 	= [['at'], ['near'], ['close', 'to'], ['above'], ['below'], ['to'], ['leaving'], ['arriving'], ['in']];
                  	                                                                                                                                     
var venueExceptions = ["st", "nd", "rd", "th", "#", "-", ",", "&", "/"];      
var venueDeceptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'His', 'He', 'Her', 'Hers', 'Who', 'Whom', 'Whose', 'PM', 'AM', 'The'];

var forerunnerDB;
var venueDatabase;
var venueCollection;

function setUpForerunnerDB(){
	forerunnerDB = new ForerunnerDB();
	venueDatabase = forerunnerDB.db("logiCalVenues");
	venueCollection = venueDatabase.collection("venueCollection");
	venueCollection.load(function (err) {
	    if (!err) {
	    }
	});
}

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	if (msg.cHistory){
		venueCollection.remove({});
	}
});

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	if (msg.newVenue){
		var recordMatch = venueCollection.find({sender:{"$eq": msg.newVenue.venueSender}, venue:{"$eq": msg.newVenue.venueName}});
		if (recordMatch.length == 0){
			venueCollection.insert([{
				sender: msg.newVenue.venueSender,
				venue: msg.newVenue.venueName,
				score: msg.newVenue.venueScore
			}]);
		}
		else if (recordMatch.length > 0){
			venueCollection.update({
				sender:{"$eq": msg.newVenue.venueSender},
				venue:{"$eq": msg.newVenue.venueName}
			},
			
			{score: recordMatch[0].score + 6}	
			);
		}
		venueCollection.save(function (err) {
		    if (!err) {
		    }
		});
	}
});

function extractVenues(input, emailSender){
	if (venueCollection == null){
		setUpForerunnerDB();
	}
	var inputText = input.replace(/\n\n+/g, '\n').replace(/\n{1,}/g,"\n").replace(/\n/g, " NewLineForExtraction ").replace(/\s+/g, ' ');
	var wordTokens = new POSTagger().tag(new Lexer().lex(inputText));
    var extractedVenues = [];
    parseVenueIndicators(wordTokens, extractedVenues, emailSender);
    parseVenueTriggers(wordTokens, extractedVenues, emailSender);
    parseHistory(emailSender, extractedVenues);
    sortByScore(extractedVenues);
    return extractedVenues;
};

function parseHistory(emailSender, extractedVenues){
	var recordMatch = venueCollection.find({sender:{"$eq": emailSender}});
	for(var x=0; x < recordMatch.length; x++){
		if(!alreadyExistsCheck(recordMatch[x].venue, extractedVenues)){
			extractedVenues.push(new Venue(recordMatch[x].venue, recordMatch[x].score));
		}
	}
}

function parseVenueIndicators(wordTokens, extractedVenues, emailSender){
    for (var i = 0; i < wordTokens.length; i++) {
        var isMatch = false;
        
        for (var ee = 0; ee < venueIndicators.length; ee++) {
            if ((wordTokens[i][0].toLowerCase() === venueIndicators[ee]) && (wordTokens[i + 1][0] == ":" || wordTokens[i + 1][0] == "NewLineForExtraction" )) {
            	isMatch = true;
            }
        }
        
        if (isMatch) {
            var word = [];
            var j = 2;
            var insideBracket = false;
            if (wordTokens[i + j][0] == "NewLineForExtraction"){
            	j++;
            }
           // while (i + j < wordTokens.length && wordTokens[i + j][0] !== 'at'  && wordTokens[i + j][0] !== "NewLineForExtraction") {
            while (i + j < wordTokens.length && wordTokens[i + j][0] !== "NewLineForExtraction") {
            	word.push(wordTokens[i + j][0]);
                j++;
            	/*
            	if (regexBracketOpenClose.test(wordTokens[i + j][0])){
            		word.push(wordTokens[i + j][0]);
                    j++;
                    continue;
            	}
            	else if (regexBracketOpen.test(wordTokens[i + j][0])){
                	insideBracket = true;
                }
            	else if (regexBracketClose.test(wordTokens[i + j][0]) || (insideBracket && wordTokens[i + j][0] == ")")){
            		insideBracket = false;
                	word.push(wordTokens[i + j][0]);
                    j++;
                    continue;
                }
                if (insideBracket){
                	word.push(wordTokens[i + j][0]);
                    j++;
                }
                else{
                //else if(regexProperNoun.test(wordTokens[i + j][0]) || wordTokens[i + j][1] == "CD" || wordTokens[i + j][1] == "NNPS" || wordTokens[i + j][1] == "NNP"|| venueExceptions.indexOf(wordTokens[i + j][0]) > -1) {
                	word.push(wordTokens[i + j][0]);
                    j++;
                }
                /*
                else{
                	break;
                }
                */
            }
            var newVenue = word.join(" ");
            //.replace(/^[^a-z\d]*|[^a-z\d]*$/gi, '');
            if (word.length > 0 && !/^\d+$/.test(newVenue)){
            	var venueHistoryCheck = getVenueHistory(emailSender, newVenue);
            	if (venueHistoryCheck.length <= 0){
            		
            		extractedVenues.push(new Venue(newVenue, 25));
            	}
            	else{
            		extractedVenues.push(new Venue(newVenue, venueHistoryCheck[0].score + 25));
            	}
            }
            i += j - 1;
        }
        
    }
    return extractedVenues;
};

function parseVenueTriggers(wordTokens, extractedVenues, emailSender){
	var insideBracket = false; 
	for (var i = 0; i < wordTokens.length; i++) {
	     //wordTokens[i][0] = wordTokens[i][0].replace(/[()!,:.]/g, ''); //clean up
		var isMatch = false;
         for (var x = 0; x < venueTriggers.length; x++) {
        	 if (regexBracketOpen.test(wordTokens[i][0])){
        		 insideBracket = true;
        	 }
        	 if (regexBracketClose.test(wordTokens[i][0])){
        		 insideBracket = false;
        	 }
             if (wordTokens[i][0].toLowerCase() === venueTriggers[x][0] && !insideBracket) {
            	 isMatch = true;
                 if (venueTriggers[x].length > 0) {
                     for (var y = 1; y < venueTriggers[x].length; y++) {
                         if (wordTokens[i + y][0] !== venueTriggers[x][y]) {
                             isMatch = false;
                         }
                     }
                 } 
             }
         }
         if (isMatch) {
             var word = [];
             var j = 1;
             var insideBracket = false;
             if (wordTokens[i + j][0] == "the"){
             	j++;
             }
             while (i + j < wordTokens.length && wordTokens[i + j][0] !== 'at'  && wordTokens[i + j][0] !== "NewLineForExtraction") {
             	if (regexBracketOpenClose.test(wordTokens[i + j][0])){
            		word.push(wordTokens[i + j][0]);
                    j++;
                    continue;
            	}
            	else if (regexBracketOpen.test(wordTokens[i + j][0])){
                	insideBracket = true;
                }
            	else if (regexBracketClose.test(wordTokens[i + j][0]) || (insideBracket && wordTokens[i + j][0] == ")")){
                	insideBracket = false;
                	word.push(wordTokens[i + j][0]);
                    j++;
                    continue;
                }
                if (insideBracket){
                	word.push(wordTokens[i + j][0]);
                    j++;
                }
                else if(regexProperNoun.test(wordTokens[i + j][0]) || wordTokens[i + j][1] == "CD" || wordTokens[i + j][1] == "NNPS" || wordTokens[i + j][1] == "NNP"|| venueExceptions.indexOf(wordTokens[i + j][0]) > -1) {
                	word.push(wordTokens[i + j][0]);
                    j++;
                }
                else{
                	break;
                }
             }
             
             var isFalsePlace = false;
 
             for (var y = 0; y < word.length; y++) {
                 for (var x = 0; x < venueDeceptions.length; x++) {
                     if (word[y] === venueDeceptions[x]) {
                         isFalsePlace = true;
                     } 
                 }
             }
             
             var newVenue = word.join(" ").replace(/^[^a-z\d]*|[^a-z\d]*$/gi, '');
             if (!isFalsePlace && word.length > 0 && !/^\d+$/.test(newVenue)){
             	var venueHistoryCheck = getVenueHistory(emailSender, newVenue);
            	if (venueHistoryCheck.length <= 0){
            		extractedVenues.push(new Venue(newVenue, 15));
            	}
            	else{
            		extractedVenues.push(new Venue(newVenue, venueHistoryCheck[0].score + 15));
            	}
            	 i += j - 1;
             }
         }
     }
     return extractedVenues;
};

function getVenueHistory(sender, venue){
	return venueCollection.find({sender:{"$eq": sender}, venue:{"$eq": venue}});
}

function alreadyExistsCheck(venue, venueArray){
	var exists = false;
	for (var x=0; x<venueArray.length; x++){
		if(venueArray[x].venue == venue){
			exists = true;
		}
	}
	return exists;
}

function sortByScore(venueArray) {
    for (var i = 1; i < venueArray.length; i++) {
        var compare = venueArray[i];
        var j = i - 1;
        while (j >= 0 && venueArray[j].score <= compare.score) {
            venueArray[j + 1] = venueArray[j];
            j--;
        }
        venueArray[j + 1] = compare;
    }
}

/*
function printVenues(){
	for (var y = 0; y < venueResults.length; y++) {
        alert(y + " " + venueResults[y].venue);
    }
}
*/