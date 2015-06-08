////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIME.JS 
// Provides timeline component
// Requires: Sound()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Timeline()														// CONSTRUCTOR
{

/* 
  	@constructor

*/
	this.start="1862"
	this.end="1922"
	this.hasTimebar=true; 
	this.showStartEnd=true; 
	this.sliderTime="Top";
	Sound("click","init");													// Init sound
	Sound("ding","init");													// Init sound
	Sound("delete","init");													// Init sound
}

Timeline.prototype.InitTimeline=function(div)							// INIT TIMELINE
{
/* 
  	Init library and connect to div
  	@param {string} div div to draw timeline into
 */
	var str;
	this.div="#"+div;														// Current div selector
  	var _this=this;															// Save context for callback
	if (this.hasTimebar) {													// If a timebar
		str="<div id='timeBar' class='time-timebar'>";						// Add timebar div
		str+="<div id='timecontrol'>"										// Block control unit
		if (this.showStartEnd && this.start) 								// If showing start date
			str+="<span id='timeStart' class='time-startend'>"+this.start+"&nbsp;&nbsp;&nbsp;</span>";	// Add start date
		str+="<div id='timeSlider' class='time-timeslider'></div>";			// Add slider div
		if (this.showStartEnd && this.start) 								// If showing start date
			str+="<span id='timeEnd' class='time-startend'>&nbsp;&nbsp;&nbsp;"+this.end+"</span>";		// Add end date
		if (this.sliderTime != "None") 										// If showing start date
			str+="<div id='sliderTime' class='time-slidertime'></div>"		// Time display
		$(this.div).append(str+"</div>");									// Add timebar				
		$("#timeSlider").slider({											// Init slider
	 		min: _this.start-0, max: _this.end-0,							// Start/end
			slide: function(event,ui) {
				if (_this.sliderTime == "Top") {
	    			off=$(".time-timeslider.ui-slider .ui-slider-handle").offset()
	     			$("#sliderTime").offset(off)
	     			}
	     			
     		}
    		});
    	}
	this.UpdateTimelineSize();
	this.Draw();
}	


Timeline.prototype.UpdateTimelineSize=function() 						// UPDATE TIMELINE PANES
{

/* 
*/
	var m=12;
	var w=$(this.div).width()-m-m;
	var t=$(this.div).height()-$("#timebar").height()-30;
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"})
	var sw=$("#timeStart").width();
	var ew=$("#timeEnd").width();
	$("#timeSlider").width(w-sw-ew)
}


Timeline.prototype.Draw=function() 										// DRAW TIMELINE
{

/* 
*/


}


Timeline.prototype.Goto=function(time)									// SET TIME
{
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

