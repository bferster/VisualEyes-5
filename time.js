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
	this.timeColor="#009900";
	this.timeFormat="Year";
	this.hasTimebar=true; 
	this.showStartEnd=true; 
	this.sliderTime="Bottom";
	this.hasTicks=true;
	this.hasTickLabels=true
	
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
	var i,str;
	this.div="#"+div;														// Current div selector
  	var _this=this;															// Save context for callback
	if (this.hasTimebar) {													// If a timebar
		str="<div id='timeBar' class='time-timebar'>";						// Add timebar div
		str+="<div id='timecontrol'>"										// Block control unit
		if (this.showStartEnd && this.start) 								// If showing start date
			str+="<span id='timeStart' class='time-startend'>"+_this.FormatTime(this.start)+"&nbsp;&nbsp;&nbsp;</span>";	// Add start date
		str+="<div id='timeSlider' class='time-timeslider'></div>";			// Add slider div
		if (this.showStartEnd && this.end) 									// If showing end date
			str+="<span id='timeEnd' class='time-startend'>&nbsp;&nbsp;&nbsp;"+_this.FormatTime(this.end)+"</span>";		// Add end date
		if (this.hasTicks) {												// If it has tick marks
			for (i=0;i<7;++i) 												// For each tick
				str+="<div class='time-ticks' id='tick"+i+"'></div>";		// Add tick div
			if (_this.tickLabels)											// If showing labels
				for (i=0;i<3;++i) 											// For each tick label
					str+="<div class='time-ticklabel' id='ticklab+"+0+"'></div>";	// Add label div
			}
		if (this.sliderTime != "None") 										// If showing start date
			str+="<div id='sliderTime' style='color:"+this.timeColor+"' class='time-slidertime'></div>"									// Time display
		$(this.div).append(str+"</div>");									// Add timebar				
		
		function ShowTime(x, time)
		{
			if ((_this.sliderTime == "Top") || (_this.sliderTime == "Bottom")) { // If showing date
      			_this.now=time												// Set now
       			var y=(_this.sliderTime == "Top") ? -22 : 26;				// Top or bottom
     			$("#sliderTime").html(_this.FormatTime(time));				// Show value
     			$("#sliderTime").css({top:y+"px",left:x-59+"px"})			// Position text
     			}
		}
		
		$("#timeSlider").slider({											// Init slider
	 		min: _this.start-0, max: _this.end-0,							// Start/end
			step: 1,
			create: function(event,ui) {									// On create
				var x=$($('#timeSlider').children('.ui-slider-handle')).offset().left;        			
 		     	ShowTime($(this).offset().left+4,_this.start-0);			// Show start time			
     		},
			slide: function(event,ui) {										// On slide
  				var x=$($('#timeSlider').children('.ui-slider-handle')).offset().left;        			
 		     	ShowTime(x,ui.value);										// Show time			
     			},
 			stop: function(event,ui) {										// On slide stop
				var x=$($('#timeSlider').children('.ui-slider-handle')).offset().left;        			
 		     	ShowTime(x,ui.value);										// Show time			
     			}
    		});
    	}
	this.UpdateTimelineSize();
	this.Draw();

}	


Timeline.prototype.FormatTime=function(time, format) 						// UPDATE TIMELINE PANES
{
/* 	
	Format time int human readable format
 	@param {number} time number of ms += 1/1/1970
	@param {string} format type of format. If not set, this.timeFormat is used.
*/
	var str=time
 

	return str;

}

Timeline.prototype.UpdateTimelineSize=function() 						// UPDATE TIMELINE PANES
{

/* 
*/
	var i,m=12;
	var w=$(this.div).width()-m-m;
	var t=$(this.div).height()-$("#timebar").height()-30-m;
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"})
	var sw=$("#timeStart").width();
	var ew=$("#timeEnd").width();
	$("#timeSlider").width(w-sw-ew);
	
	if (this.hasTicks) {
		var x=$("#timeSlider").offset().left-m;
		var tw=$("#timeSlider").width()/8;									// Space between ticks
		for (i=0;i<=7;++i) {												// For each tick
			x+=tw;															// Move over
			$("#tick"+i).css( {top:"11px",left:x-2+"px"} );					// Position
			if ((i == 1) || (i == 3) || (i == 5))							// A longer tick
				$("#tick"+i).height(14);									// Size
			}		
	
	}	
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

