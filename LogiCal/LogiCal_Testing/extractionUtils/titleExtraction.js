var eventTypes = [["luncheon", "presentation"],["speakers","series"],["application", "deadline"],["speaker", "series"], ["info", "session"], ["information", "session"], ["training", "workshop"], ["tea"], ["contest"], ["reservation"], ["speaker"], ["speakers"],["booking"], ["meeting"], ["presentation"], ["seminar"], ["dinner"], ["lunch"], ["breakfast"], ["interview"], ["lecture"], ["tutorial"], ["class"], ["wedding"], ["party"], ["appointment"], ["concert"], ["debate"], ["reunion"], ["festival"], ["ball"], ["reception"], ["dance"], ["holiday"], ["call"], ["conference"], ["workshop"], ["convention"], ["exhibition"], ["fundraiser"], ["banquet"], ["show"], ["expo"], ["exposition"], ["gala"], ["networking"], ["reception"], ["performance"], ["discussion"], ["forum"], ["summit"], ["celebration"], ["tour"], ["trip"], ["journey"], ["exercise"], ["session"], ["meal"], ["excursion"], ["speech"], ["talk"], ["lesson"]];

var titleIndicators = ["topic", "event", "title", "speaker"];

var regexBracketOpen = new RegExp("^[\(](.*)$");


function extractTitles(input, emailTitle){
	var inputText = input.replace(/\n/g, " NewLineForExtraction ").replace(/\s+/g, ' ');
    var wordTokens = new POSTagger().tag(new Lexer().lex(inputText));
    var extractedTitles = [];
    
    if (!/^\s+$/.test(emailTitle)){
    	extractedTitles.push(new Title(emailTitle, 15));
    }
    	
    extractTypeAndGuest(input.replace(/\n/g, " null "), extractedTitles);
    parseTitleIndicators(wordTokens, extractedTitles);
    /*
    for(var x= 0; x< extractedTitles.length; x++){
    	alert(extractedTitles[x].title);
    }
    */
    sortByScore(extractedTitles);
    return extractedTitles;
    
}

function extractTypeAndGuest(input, titleArray){
	/*
	var inputText = input.replace(/(\n)/, ". ");
	inputText = inputText.replace(/[()!:]/g, '');
	inputText = inputText.replace(/[,]/, " . ");
	inputText = inputText.replace(/(\.)(\.)(\n)/, " . ");
	inputText = inputText.replace("and", ",");
	*/
	var inputText = input.replace(" and", " with");
	inputText = inputText.replace(", ", " , ");
	//inputText = inputText.replace();
	
    var wordTokens = new POSTagger().tag(new Lexer().lex(inputText));
    
    var eventType = parseType(wordTokens);
    var eventGuests = parseGuest(inputText);
    
    if (eventType != null && eventGuests.length > 0){
    	if (eventType.length == 1 && (eventType[0] == "speaker" || eventType[0] == "speakers")){
    		eventType.push("talk");
    		//alert(eventType);
    	}
    	
    	var titleString = "";
    	titleString += capitalizeFirstLetter(eventType[0]) + " ";
    	
    	for(var v = 1; v < eventType.length; v++){
    		titleString += eventType[v] + " ";
    	}
    	

    	titleString += "with ";
    	titleString += capitalizeFirstLetter(eventGuests[0].text.replace(/[^A-Za-z\- ]/g, ''));
    	
    	for(var v = 1; v < eventGuests.length; v++){
    		var name = capitalizeFirstLetter(eventGuests[v].text.replace(/[^A-Za-z\- ]/g, ''));
    		if(titleString.indexOf(name) <= -1){
    			titleString += ", " + name;
    		}
    	}
    	
    	titleArray.push(new Title(titleString, 10));
    	
    }
};

function parseType(wordTokens){
    for (var i = 0; i < wordTokens.length; i++) {
        for (var x = 0; x < eventTypes.length; x++) {
            if (wordTokens[i][0].toLowerCase() === eventTypes[x][0]) {
           	 	isMatch = true;
                if (eventTypes[x].length > 0) {
                	var y = 1;
                    while (y < eventTypes[x].length && i + y < wordTokens.length) {
                        if (wordTokens[i + y][0] !== eventTypes[x][y]) {
                            isMatch = false;
                        }
                        y++;
                    }
                    if (isMatch){
                    	return eventTypes[x];
                    }
                }
                else{
                	return eventTypes[x];
                }
            }
        }
    }
    return null;
    
};

function parseGuest(wordTokens){
	return nlp.pos(wordTokens).people();
	//return nlp_compromise.text(wordTokens).people();
};

function parseTitleIndicators(wordTokens, titleArray){
    for (var i = 0; i < wordTokens.length; i++) {
    	var word = [];
        var isMatch = false;
        
        for (var ee = 0; ee < titleIndicators.length; ee++) {
            if ((wordTokens[i][0].toLowerCase() === titleIndicators[ee]) && (wordTokens[i + 1][0] == ":" || wordTokens[i + 1][0] == "NewLineForExtraction") ) {
            	isMatch = true;
            	if (titleIndicators[ee] == "speaker"){
            		word.push("Speaker talk: ");
            	}
            	else if (titleIndicators[ee] == "topic"){
            		word.push("Talk on: ");
            	}
            }
        }
        
        if (isMatch) {
            
            var j = 2;
            var insideBracket = false;
            if (wordTokens[i + j][0] == "NewLineForExtraction"){
            	j++;
            }
            while (i + j < wordTokens.length && !regexBracketOpen.test(wordTokens[i + j][0]) && wordTokens[i + j][0] !== "NewLineForExtraction") {
                	word.push(wordTokens[i + j][0]);
                    j++;
            }
            
            var newTitle = word.join(" ");
            newTitle = newTitle.trim();
            var lastLetter = newTitle.charAt(newTitle.length - 1);
            
            if (word.length > 0 && lastLetter != ":"){
            		titleArray.push(new Title(word.join(" "), 20));
            }
            i += j - 1;
        }
        
    }
};

function capitalizeFirstLetter(string) {
	return string.replace(/\b./g, function(m){ return m.toUpperCase(); });
    //return string.charAt(0).toUpperCase() + string.slice(1);
};


function sortByScore(titleArray) {
    for (var i = 1; i < titleArray.length; i++) {
        var compare = titleArray[i];
        var j = i - 1;
        while (j >= 0 && titleArray[j].score <= compare.score) {
            titleArray[j + 1] = titleArray[j];
            j--;
        }
        titleArray[j + 1] = compare;
    }
}
