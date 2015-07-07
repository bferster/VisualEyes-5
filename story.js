////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STORY.JS 
// Provides story component
// Requires: Popup.js()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Story(div, pop)											// CONSTRUCTOR
{

/* 
  	@constructor
 	@param {string} div div to draw timeline into
 	@param {object} pop	Points to popup library in popup.js.

*/

	this.div="#"+div;													// Current div selector
	this.pop=pop;														// Point at popup lib
}


Story.prototype.InitStory=function(data)							// INIT STORY
{

/* 
	Init library and set data
	@param {object} data	Points to mobs
*/

	if (data)	this.sd=data;											// Point at data
	this.UpdateStory();													// Resize 
}	


Story.prototype.UpdateStory=function(curTime, timeFormat) 			// UPDATE STORY PANE
{
	

/*
	Update the current time and set layer visibilities accordingly.
	@param {number} curTime 	Current project time in mumber of mins += 1/1/1970
	@param {string} timeFormat	Format to use when making time human readable	
*/

	var i,o,str="",indent=0,open=true;
	if (this.sd.title)	str+="<div class='story-title'>"+this.sd.title+"</div>";
	this.timeFormat=timeFormat;												// Set format
	this.curTime=curTime-0;													// Set current timet
	for (i=0;i<this.sd.mobs.length;++i) 
		if (this.sd.mobs[i].marker && (this.sd.mobs[i].marker.toLowerCase() == "story"))	// If a story item
			str+=this.DrawStoryItem(this.sd.mobs[i],indent,open);			// Add it to html
//str="<img src='http://www.viseyes.org/efolio/declaration.JPG' width='100%'> &nbsp; ";
	$("#rightDiv").html(str);
}


Story.prototype.DrawStoryItem=function(mob, indent, open) 			// DRAW STORY ITEM
{

/*
	Create HTML for story item
	@param {number} curTime 	Current project time in mumber of mins += 1/1/1970
	@param {string} timeFormat	Format to use when making time human readable	
*/

	var str="";
	trace(mob)
	return str;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Story.prototype.SendMessage=function(cmd, msg) 							// SEND MESSAGE
{
	var str="Time="+cmd;													// Add src and window						
	if (msg)																// If more to it
		str+="|"+msg;														// Add it
	if (window.parent)														// If has a parent
		window.parent.postMessage(str,"*");									// Send message to parent wind
	else																	// Local	
		window.postMessage(str,"*");										// Send message to wind
}
