chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Trigger LogiCal";
  var id = chrome.contextMenus.create({	"title": title, "contexts":[context], "id": "context" + context});
});
 
chrome.contextMenus.onClicked.addListener(contextMenuClick);

function contextMenuClick(info, tab) {
	var selectedText = "";
	var emailSender = "";
	var emailTitle = "";
	var emailURL = "";
	var emailRecipients;
	
	// This is preferred over info.selectionText because info.selectionText does not include newlines, which is crucial for the location and venue extractions
    chrome.tabs.executeScript(
    	{
	    	code: "window.getSelection().toString();"
	    }, 
	    	function(selection) {
	        	selectedText = selection[0];
	        	if (selectedText === "") {selectedText = info.selectionText;}
	    	}
    );
   
    // This can be used to extract details of the tab opened (email title, sender, etc.)    
    chrome.tabs.executeScript(null, { file: "jsLibrary/jquery-1.8.3.js" }, function() {
        chrome.tabs.executeScript(null, { file: "jsLibrary/gmail.js" }, function() {
        	chrome.tabs.executeScript(null, {file: "extractPageDetails.js"})
        })
    });
    
    chrome.runtime.onMessage.addListener(function(msg) {
    		if (msg.url){
    			emailSender = msg.sender;
    			emailTitle = msg.title;
    			emailURL = msg.url;
    			if(msg.recipients){
    				emailRecipients = msg.recipients;
    			}
    		}
    });
 
    
    // The delay is so that the message passed following the completion of the above scripts
    setTimeout(function(){ 
    	var newEvent = createEvent(selectedText, emailTitle, emailSender, emailURL, emailRecipients);    
		
		chrome.tabs.create({
	        url: chrome.extension.getURL('popup2.html'),
	        active: false
	    }, function(tab) {
	        chrome.windows.create({
	            tabId: tab.id,
	            height: 650,
	            width: 525,
	            type: 'popup',
	            focused: true
	        }, function() {
	        	chrome.runtime.sendMessage({
	               calendarEvent: newEvent
	            }, function(response) {});
	        });
	    });
	 }, 500);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

chrome.browserAction.onClicked.addListener(function(tab) { 
	var selectedText = "";
	var emailSender = "";
	var emailTitle = "";
	var emailBody = "";
	var emailURL = "";
	var emailRecipients;
	
	// This is preferred over info.selectionText because info.selectionText does not include newlines, which is crucial for the location and venue extractions
    chrome.tabs.executeScript(
    	{
	    	code: "window.getSelection().toString();"
	    }, 
	    	function(selection) {
	        	selectedText = selection[0];
	    	}
    );
    // This can be used to extract details of the tab opened (email title, sender, etc.)
    /*
    chrome.tabs.executeScript(null, { file: "jsLibrary/jquery-1.8.3.js" }, function() {
        chrome.tabs.executeScript(null, { file: "extractPageDetails.js" });
    });
    */
    
    chrome.tabs.executeScript(null, { file: "jsLibrary/jquery-1.8.3.js" }, function() {
        chrome.tabs.executeScript(null, { file: "extractPageDetails.js" }, function() {
        })
    });
    chrome.runtime.onMessage.addListener(function(msg) {
    		if (msg.url){
    			emailSender = msg.sender;
    			emailTitle = msg.title;
    			emailURL = msg.url;
    			if(msg.body){
    				emailBody = msg.body;
    			}
    			if(msg.recipients){
    				emailRecipients = msg.recipients;
    			}
    		}
    });
 
    
    // The delay is so that the message passed following the completion of the above scripts
    setTimeout(function(){
    	if(selectedText == ""){
    		selectedText = emailBody;
    	}
    	var newEvent = createEvent(selectedText, emailTitle, emailSender, emailURL, emailRecipients);    
		
		chrome.tabs.create({
	        url: chrome.extension.getURL('popup2.html'),
	        active: false
	    }, function(tab) {
	        chrome.windows.create({
	            tabId: tab.id,
	            height: 650,
	            width: 525,
	            type: 'popup',
	            focused: true
	        }, function() {
	        	chrome.runtime.sendMessage({
	               calendarEvent: newEvent
	            }, function(response) {});
	        });
	    });
	 }, 650);
});
