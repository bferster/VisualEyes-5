////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STORY.JS 
// Provides story component
// Requires: Popup.js()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Story(div, pop)												// CONSTRUCTOR
{
	var _this=this;															// Save context
	this.div="#"+div;														// Current div selector
	this.pop=pop;															// Point at popup lib
	this.storyMode="Scrolled";												// Story mode
	this.curPage=0;															// Current page
	this.pages=[];															// Holds page indices

	$("body").keydown(function(e) {											// KEY DOWN HANDLER
		if ((e.keyCode == 40) ||(e.keyCode == 34)) 							// Down arrow, pg-dn
			$("#nextPage").trigger("click");								// Click next button
		else if ((e.keyCode == 38) || (e.keyCode == 33)) {					// Up arrow, pg-up
			if (_this.curPage == 0) {										// At end
				pop.Sound("delete",curJson.muteSound);						// Delete sound
				return;														// Quit
				}
			_this.curPage=Math.max(_this.curPage-1,0);						// Dec
			$("#storyDiv").html(_this.DrawStoryItem(_this.pages[_this.curPage]));	// Set new page
			$("#pageSel").prop("selectedIndex",_this.curPage);				// Change select
			pop.Sound("click",curJson.muteSound);							// Click sound
			}
	});
}

Story.prototype.InitStory=function(data)								// INIT STORY
{
	var i,k=1,str="",ind=0;
	if (data)	this.sd=data;												// Point at data
	var _this=this;	
	this.pages=[];															// Save context for callback
	this.storyMode=this.sd.storyMode;										// Set mode
	if (this.sd.storyMode == "Stepped") 									// If stepped
		str+="<div style='text-align:center'>";								// Center div
	if (this.sd.title)	str+="<div class='story-title'>"+this.sd.title+"</div>";
	if (this.sd.storyMode == "Stepped") {									// If stepped
		str+="<select id='pageSel' class='ve-bs' style='vertical-align:5px;text-align:center'>"; // Selector
		for (i=0;i<this.sd.mobs.length;++i) 								// For each mob
			if (this.sd.mobs[i].marker && (this.sd.mobs[i].marker.toLowerCase() == "story")) { 	// If  a story item
				str+="<option value='"+i+"'>"+(k++)+". "+ShortenString(this.sd.mobs[i].title,70)+"</option>";		// Add option
				this.pages.push(i);											// Save index to move
				}
		str+="</select>&nbsp;&nbsp;<img src='img/playbut.png' id='nextPage' style='cursor:pointer'>";	// Forward button
		str+="</div>";														// End center div
		str+="<div id='storyDiv' style='padding:16px'>";					// Enclosing div										
		str+=this.DrawStoryItem(this.pages[this.curPage])+"</div>";			// Add story to page
		$("#rightDiv").html(str);											// Set text
		$("#pageSel").prop("selectedIndex",this.curPage);					// Set select
		
		$("#pageSel").on("change", function() {								// CHANGE PAGE
			$("#storyDiv").html(_this.DrawStoryItem($("#pageSel").val()));	// Set new page
			pop.Sound("click",curJson.muteSound);							// Click sound
			_this.curPage=$("#pageSel").prop("selectedIndex");				// Get index
			});

		$("#nextPage").on("click", function() {								// NEXT PAGE
			if (_this.curPage == _this.pages.length-1) {					// At end
				pop.Sound("delete",curJson.muteSound);						// Delete sound
				return;														// Quit
				}
			pop.Sound("click",curJson.muteSound);							// Click sound
			_this.curPage=Math.min(_this.curPage+1,_this.pages.length-1);	// Inc	
			$("#storyDiv").html(_this.DrawStoryItem(_this.pages[_this.curPage]));	// Set new page
			$("#pageSel").prop("selectedIndex",_this.curPage);				// Change select
			});
		}
	else{																	// Scrolled
		for (i=0;i<this.sd.mobs.length;++i) 								// For each mob
			if (this.sd.mobs[i].marker && (this.sd.mobs[i].marker.toLowerCase() == "story")) { 	// If  a story item
				if (this.sd.mobs[i].open == undefined) {					// If first time
					if (this.sd.mobs[i].show && this.sd.mobs[i].show.match(/open/i))			// If set to open
						this.sd.mobs[i].open=true;							// Set true
					else													// Otherwise, must be closed
						this.sd.mobs[i].open=false;							// Set false
					}
				if (this.sd.mobs[i].pos)	ind=this.sd.mobs[i].pos;		// If a pos set, use it
				str+="<div id='story"+i+"' style='margin-left:"+(ind*18+12)+"px'>"; // Container div
				str+=this.DrawStoryItem(i)+"</div>";						// Add it to html
				}
		$("#rightDiv").html(str);											// Set text
		}
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
	var str="";
	var	fs=11,maxPix=100;													// Desc font size, pic size
	var desc,col="#555",v,vv,title;
	var mob=this.sd.mobs[num];												// Point at mob
	if (mob.color)	col=mob.color;											// If a color set, use it
	var _this=this;															// Save context for callback
	if (this.storyMode != "Stepped") {										// Scroll mode
		str+="<div id='storyBut"+num+"' onclick='onStoryClick(this.id)' ";	// Triangle head
		str+="style='width:0px;height:0px;display:inline-block;cursor:pointer;";	
		if (mob.open) 														// Draw a down triangle
			str+="border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid #aaa'></div>";
		else																// Draw right triangle
			str+="border-top:6px solid transparent;border-bottom:6px solid transparent;border-left:10px solid #aaa;margin-left:2px'></div>";
		}
	else{																	// Stepped mode
		fs=13;																// Larger font
		maxPix=175;															// Larger pic	
		if (mob.where)	mps.Goto(mob.where);								// Go there
//		if (mob.start)	tln.Goto(mob.start);								// Go then
		}
	if (mob.title)															// If a title
		str+="<div class='story-header' style='display:inline-block;color:"+col+"'>"+mob.title+"</div><br>";
	if (mob.open || (this.storyMode == "Stepped")) {						// If open or stepped
		if (mob.pic) {														// If a pic
			var pic=ConvertFromGoogleDrive(mob.pic);						// Point at pic
			str+="<img class='story-pic' style='display:inline-block;max-width:"+maxPix+"px' src='"+pic+"' ";
			str+="onclick='javascript:$(this).css(\"max-width\") == \""+maxPix+"px\" ? $(this).css(\"max-width\",500) : $(this).css(\"max-width\","+maxPix+")'";
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
			if (desc && desc.match(/show\(/)) {								// If show macro
				v=(desc+" ").match(/show\(.*?\)/ig);						// Extract show(s)
				for (i=0;i<v.length;++i) {									// For each one
					vv=v[i].match(/show\(([^,\)]*),*(.*)\)/i);				// Get parts
					toggleLayer(vv[1]);												
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"");	
					}
				}
			str+="<div class='story-desc' style='font-size:"+fs+"px'>"+desc+"</div>";	// Add in
			str+="</div>"
			}
		if (mob.citation) {													// If a citation
			str+="<div class='story-cite' style='cursor:pointer'><br><a onclick='$(\"#cite"+num+"\").fadeIn()'>";
			str+="<u>Citation</u><br><span style='display:none' id='cite"+num+"'><br>"+mob.citation+"</span></div>";
			}
		}
	if (mob.open || (this.storyMode == "Stepped")) 							// If open or stepped
		str+="<div style='clear:both'></div><br>";							// Clear float
	return str;																// Return story item html
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function toggleLayer(id)												// TOGGLE LAYER
{
	var j;
	if ((j=FindMobByID(id)) != -1)											// Get mob index
		mps.DrawMapLayers([curJson.mobs[j].lid],true);						// Show them
}

Story.prototype.SendMessage=function(cmd, msg) 							// SEND MESSAGE
{
	var str="Time="+cmd;													// Add src and window						
	if (msg)																// If more to it
		str+="|"+msg;														// Add it
	window.postMessage(str,"*");											// Send message to wind
}




