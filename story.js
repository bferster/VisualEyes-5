////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STORY.JS 
// Provides story component
// Requires: Popup.js()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Story(div, pop)												// CONSTRUCTOR
{

/* 
  	@constructor
 	@param {string} div div to draw timeline into
 	@param {object} pop	Points to popup library in popup.js.

*/

	this.div="#"+div;														// Current div selector
	this.pop=pop;															// Point at popup lib
}


Story.prototype.InitStory=function(data)								// INIT STORY
{

/* 
	Init library and set data
	@param {object} data	Points to mobs
*/
	var i,str="",ind=0;
	if (data)	this.sd=data;												// Point at data
	var _this=this;															// Save context for callback
	if (this.sd.title)	str+="<div class='story-title'>"+this.sd.title+"</div>";
	for (i=0;i<this.sd.mobs.length;++i) 									// For each mob
		if (this.sd.mobs[i].marker && (this.sd.mobs[i].marker.toLowerCase() == "story")) { 	// If  a story item
			if (!dtl.ShowElement(this.sd.mobs[i]))							// If not being shown
				continue;													// Skip it	
			if (this.sd.mobs[i].open == undefined) {						// If first time
				if (this.sd.mobs[i].show && this.sd.mobs[i].show.match(/open/i))			// If set to open
					this.sd.mobs[i].open=true;								// Set true
				else														// Otherwise, must be closed
					this.sd.mobs[i].open=false;								// Set false
				}
			if (this.sd.mobs[i].pos)	ind=this.sd.mobs[i].pos;			// If a pos set, use it
			str+="<div id='story"+i+"' style='margin-left:"+(ind*18+12)+"px'>"; // Container div
			str+=this.DrawStoryItem(i)+"</div>";							// Add it to html
			}
	$("#rightDiv").html(str);
}	

Story.prototype.UpdateStory=function(curTime, timeFormat) 				// UPDATE STORY PANE
{
	
/*
	Update the current time and set layer visibilities accordingly.
	@param {number} curTime 	Current project time in mumber of mins += 1/1/1970
	@param {string} timeFormat	Format to use when making time human readable	
*/

	this.timeFormat=timeFormat;												// Set format
	this.curTime=curTime-0;													// Set current timet
	this.InitStory();														// Re-build page
}


function onStoryClick(e,mode) 											// TOGGLE STORY ITEM
{
	var i,hide=99,pos;
	var id=e.substr(8);														// Get ID
	curJson.mobs[id].open=!curJson.mobs[id].open;							// Toggle closure state						
	pop.Sound("click",curJson.muteSound);									// Click sound
	if (curJson.mobs[id].where)												// If a where
		mps.Goto(curJson.mobs[id].where);									// Got there
	if (curJson.mobs[id].start)												// If a start
		tln.Goto(curJson.mobs[id].start);									// Go there
	
	for (i=id;i<curJson.mobs.length;++i) {									// For each mob
		if (curJson.mobs[i].marker && (curJson.mobs[i].marker.toLowerCase() != "story")) // If not a story item
			continue;														// Skip
		pos=curJson.mobs[i].pos ? curJson.mobs[i].pos : 0;					// Get pos
		if (pos > hide)														// If this is hidden
			curJson.mobs[i].open=false;										// Close it
		else if (!curJson.mobs[i].open) 									// If closed
			hide=pos;														// Set level
		else																// Open or unset
			curJson.mobs[i].open=true;										// Don't hide
		$("#story"+i).html(sto.DrawStoryItem(i)); 							// Redraw 
		}
}



Story.prototype.DrawStoryItem=function(num) 							// DRAW STORY ITEM
{

/*
	Create HTML for story mob
	@param {number} num 		Index of mob to draw
*/
	
	var desc,col="#555",v,vv,title;
	var mob=this.sd.mobs[num];												// Point at mob
	if (mob.color)	col=mob.color;											// If a color set, use it
	var _this=this;															// Save context for callback
	var str="<div id='storyBut"+num+"' onclick='onStoryClick(this.id)' ";	// Triangle head
	str+="style='width:0px;height:0px;display:inline-block;cursor:pointer;";	
	if (mob.open) 															// Draw a down triangle
		str+="border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid #aaa'></div>";
	else																	// Draw right triangle
		str+="border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:10px solid #aaa;margin-left:2px'></div>";
	if (mob.title)															// If a title
		str+="<div class='story-header' style='display:inline-block;color:"+col+"'>"+mob.title+"</div><br>";
	if (mob.open) {															// If open
		if (mob.pic) {														// If a pic
			var pic=ConvertFromGoogleDrive(mob.pic);						// Point at pic
			str+="<img class='story-pic' style='display:inline-block;' src='"+pic+"' ";
			str+="onclick='javascript:$(this).css(\"max-width\") == \"100px\" ? $(this).css(\"max-width\",500) : $(this).css(\"max-width\",100)'";
			str+="/>";
			}
		if (mob.desc) {														// If a desc
			desc=this.pop.ExpandMacros(mob.desc);							// Expand macros and make local copy
			str+="<div>"
			if (desc && desc.match(/pic\(/)) {								// If pic macro
				v=(desc+" ").match(/pic\(.*?\)/ig);							// Extract pic(s)
				for (i=0;i<v.length;++i) {									// For each url
					vv=v[i].match(/pic\(([^,\)]*),*(.*)\)/i);				// Get parts
					if (!vv[2])	vv[2]=60;									// Default size
					vv[1]=ConvertFromGoogleDrive(vv[1]);					// Convert pic
					title="<img class='story-pic' style='display:inline-block;max-width:"+vv[2]+"px' src='"+vv[1]+"' ";
					title+="onclick='javascript:$(this).css(\"max-width\") == \""+vv[2]+"px\" ? $(this).css(\"max-width\",500) : $(this).css(\"max-width\","+vv[2]+")'>";
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),title);	// Replace with image
					}	
				}
			str+="<div class='story-desc'>"+desc+"</div>";					// Add in
			str+="</div>"
			}
		if (mob.citation) {													// If a citation
			str+="<div class='story-cite' style='cursor:pointer'><br><a onclick='$(\"#cite"+num+"\").fadeIn()'>";
			str+="<u>Citation</u><br><span style='display:none' id='cite"+num+"'><br>"+mob.citation+"</span></div>";
			}
		}
	if (mob.open)															// If open
		str+="<div style='clear:both'></div><br>";							// Clear float
	return str;																// Return story item html
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function toggleLayers(id)												// TOGGLE LAYER(s)
{
	var i,j;
	var ids=id.split(",");													// Divide into parts
	ids.splice(0,3);														// Remove debris from match()
	for (i=0;i<ids.length;++i) 												// For each part
		if ((j=FindMobByID(ids[i])) != -1)									// Get mob index
			ids[i]=curJson.mobs[j].lid;										// Get layer index					
	mps.DrawMapLayers(ids,true);											// Show them
}

Story.prototype.SendMessage=function(cmd, msg) 							// SEND MESSAGE
{
	var str="Time="+cmd;													// Add src and window						
	if (msg)																// If more to it
		str+="|"+msg;														// Add it
//	if (window.parent)														// If has a parent
//		window.parent.postMessage(str,"*");									// Send message to parent wind
//	else																	// Local	
		window.postMessage(str,"*");										// Send message to wind
}
