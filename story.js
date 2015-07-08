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
	this.sd=data;															// Point at data
	var _this=this;															// Save context for callback
	if (this.sd.title)	str+="<div class='story-title'>"+this.sd.title+"</div>";
	for (i=0;i<this.sd.mobs.length;++i) 									// For each mob
		if (this.sd.mobs[i].marker && (this.sd.mobs[i].marker.toLowerCase() == "story")) {	// If a story item
			if (this.sd.mobs[i].open == undefined)							// If fist time
				this.sd.mobs[i].open=this.sd.mobs[i].show.toLowerCase() == "open" ? true : false;
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
	this.InitStory(this.sd);												// Reshow
}


function onStoryClick(e,mode) 											// TOGGLE STORY ITEM
{
	var id=e.substr(8);														// Get ID
	sto.sd.mobs[id].open=!sto.sd.mobs[id].open;								// Toggle closure state						
	sto.pop.Sound("click",curJson.muteSound);								// Click sound
	$("#story"+id).html(sto.DrawStoryItem(id)); 							// Redraw this one
}


Story.prototype.DrawStoryItem=function(num, update) 					// DRAW STORY ITEM
{

/*
	Create HTML for story item
	@param {number} curTime 	Current project time in mumber of mins += 1/1/1970
	@param {string} timeFormat	Format to use when making time human readable	
*/
	
	var desc,col="#555",v,vv,title;
	var mob=this.sd.mobs[num];												// Point at mob
	if (mob.color)	col=mob.color;											// If a color set, use it
	var _this=this;															// Save context for callback
	var str="<div id='storyBut"+num+"' onclick='onStoryClick(this.id)' ";	// Triangle head
	str+="style='width:0px;height:0px;display:inline-block;cursor:pointer;";	
	if (mob.open) 															// Draw a down triangle
		str+="border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid "+col+"'></div>";
	else																	// Draw right triangle
		str+="border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:12px solid "+col+"'></div>";
	if (mob.title)															// If a title
		str+="<div class='story-header' style='display:inline-block;color:"+col+"'>"+mob.title+"</div><br>";
	if (mob.open) {															// If open
		if (mob.pic)														// If a pic
			str+="<img class='story-pic' style='display:inline-block;' src='"+mob.pic+"'/>";
		if (mob.desc) {														// If a desc
			desc=mob.desc;													// Make local copy
			if (desc.match(/where\(/)) {									// If where macro
				v=(desc+" ").match(/where\(.*?\)/ig);						// Extract where(s)
				for (i=0;i<v.length;++i) {									// For each macro
					vv=v[i].match(/where\(([^,]+),(.+)\)/i);				// Get parts
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a href='javascript:mps.Goto(\""+vv[2].replace(/<.*?>/g,"")+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
					}	
				}
			if (desc.match(/link\(/)) {										// If link macro
				v=(desc+" ").match(/link\(.*?\)/ig);						// Extract links(s)
				for (i=0;i<v.length;++i) {									// For each macro
					vv=v[i].match(/link\(([^,]+),(.+)\)/i);					// Get parts
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a href='javascript:addIframe(\""+vv[2]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
					}	
				}
			if (desc.match(/show\(/)) {										// If show macro
				v=(desc+" ").match(/show\(.*?\)/ig);						// Extract show(s)
				for (i=0;i<v.length;++i) {									// For each macro
					vv=v[i].match(/show\(([^,]+),(.+)\)/i);					// Get parts
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a href='javascript:showLayer(\""+vv[2]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
					}	
				}
			if (desc && desc.match(/foot\(/)) {								// If foot macro
				v=(desc+" ").match(/foot\(.*?\)/ig);						// Extract footnotes(s)
				for (i=0;i<v.length;++i) {									// For each url
					title=v[i].substr(5,v[i].length-6);						// Extract actual note
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"))," <a href='#' title='"+title+"'><b><sup>"+(i+1)+"</b></sup></a> ");	// Replace with anchor tag
					}	
				}
			if (desc.match(/pic\(/)) {										// If pic macro
				v=(desc+" ").match(/pic\(.*?\)/ig);							// Extract pics(s)
				for (i=0;i<v.length;++i) {									// For each macro
					vv=v[i].match(/pic\(([^,]+),(.+)\)/i);					// Get parts
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"");	// Replace with anchor tag
					}	
				}
			str+="<div class='story-desc'>"+desc+"</div>";					// Add in
			}
		if (mob.citation) 													// If a citation
			str+="<div class='story-cite'>___________________<br><br>"+mob.citation+"</div>";
		}
	return str;																// Return story item html
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addIframe(url)
{
	$("#rightDiv").html("<iframe id='popupIF' frameborder='0' height='"+($(window).height()-2)+"' width='100%' style='opacity:0,border:1px solid #666' src='"+url+"'/>");
}	

function showLayer(id)
{
}

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
