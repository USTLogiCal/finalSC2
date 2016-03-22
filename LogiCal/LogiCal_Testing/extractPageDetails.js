

function getPageDetails(){
	 if (document.URL.indexOf("mail.google.com") > -1) {
		 var emails;
		 for (var x = 0; x < document.getElementsByClassName('g2').length; x++){
			emails += document.getElementsByClassName('g2')[x].getAttribute("email") + " ";
		 }
		 emails = emails.replace("undefined", "");
		 var emailRegex =/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
		 var emailsFound = emails.match(emailRegex);
		 
		 var emailBody = document.querySelectorAll('div.a3s')[0].textContent.trim();
		 var emailTitle = document.title;

		 var loggedInGmail = emailTitle.match(emailRegex)[0];
		 
		 var index = $.inArray(loggedInGmail, emailsFound);
		 if (index>=0) {emailsFound.splice(index, 1);}
		 
		 var emailSender = document.getElementsByClassName('gD')[0].getAttribute("email");
		 var pageDetails = {
		    		sender: emailSender,
				    title: emailTitle,
				    body: emailBody,
				    recipients: emailsFound,
				    url: location.href
		 };
		 return pageDetails;
		 
    } else if (document.URL.indexOf("outlook.office.com") > -1) {
    	var emailTo = document.getElementById("ItemHeader.ToContainer").innerHTML.replace(/<[^>]*>/g, "");
    	
    	var emailCc = document.getElementById("ItemHeader.CcContainer").innerHTML.replace(/<[^>]*>/g, "");
    	var emailBody = document.getElementById("Item.MessageUniqueBody").innerHTML.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, '').trim();
    	var emailTitle = document.querySelectorAll('span.rpHighlightAllClass.rpHighlightSubjectClass')[0].textContent;
    	var emailSenderTemp = document.querySelectorAll('span.bidi.allowTextSelection');
    	var emailSender;

    	var emails = emailTo + emailCc;
    	var emailRegex =/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    	var emailsFound = emails.match(emailRegex);
    	
    	emailSender = emailSenderTemp[0].textContent;
    	
    	if (checkIfEmailInString(emailSenderTemp[0].textContent)){
    		if (emailSenderTemp[0].textContent.indexOf("<") > -1){
        		emailSender = emailSenderTemp[0].textContent.replace( /(^.*\<|\>.*$)/g, '' );
        	}
    	}
    	else if (emailSenderTemp.length > 2 && checkIfEmailInString(emailSenderTemp[2].textContent)){
        	if (emailSenderTemp[2].textContent.indexOf("(") > -1){
        		emailSender = (emailSenderTemp[2].textContent.match(/\((.*)\)/))[1];
        	}
        	else{
        		emailSender = emailSenderTemp[2].textContent;
        	}
    	}

    	var pageDetails = {
        		sender: emailSender,
    		    title: emailTitle,
    		    body: emailBody,
    		    recipients: emailsFound,
    		    url: location.href
        };
    	return pageDetails;
    }
    else if (document.URL.indexOf("mail.yahoo.com") > -1) {
    	var emailTitle = document.getElementsByClassName('thread-subject')[document.getElementsByClassName('thread-subject').length - 1].textContent;
    	var emailSender = document.getElementsByClassName('from lozengfy hcard')[0].title;
    	var pageDetails = {
        		sender: emailSender,
    		    title: emailTitle,
    		    url: location.href
        };
        return pageDetails;
    }
    else{
		var pageDetails = {
			sender: '',
		    title: '',
		    url: document.URL
		};
	    return pageDetails;
    }
    
}

function checkIfEmailInString(text) { 
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

chrome.runtime.sendMessage(getPageDetails());