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
  	Init library and connect to div
 */

	if (data)	this.sd=data;											// Point at setting and data
	this.UpdateStory();													// Resize 
}	


Story.prototype.UpdateStory=function() 									// UPDATE STORY PANE
{
	
/* 
	Resize timeline to fit container div
*/

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
