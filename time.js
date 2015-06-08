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
	this.dur=0;
	this.start="1862"
	this.end="1922"
	this.timeColor="#009900";
	this.timeFormat="Year";
	this.hasTimebar=true; 
	this.showStartEnd=true; 
	this.sliderTime="Bottom";
	this.hasTicks=true;
	this.hasTickLabels=true
	this.timeSegmentPos="Top";
	this.timeSegTextColor="#000";
	this.timeSegColor="#ccc";
	this.curSeg=-1;
	this.timeSegments=[ {start:"1862", end:"1886", title:"Winchester", col:"#ccc"},
						{start:"1886", end:"1889", title:"New York", col:"#ccc"},
						{start:"1889", end:"1892", title:"Charlottesville", col:"#ccc"},
						{start:"1892", end:"1898", title:"Pennsylvania", col:"#ccc"},
						{start:"1898", end:"1902", title:"Boston", col:"#ccc"},
						{start:"1902", end:"1906", title:"Connecticut", col:"#ccc"},
						{start:"1906", end:"1910", title:"Indiana", col:"#ccc"},
						{start:"1910", end:"1922", title:"Traveling", col:"#ccc"}];
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
	this.dur=this.end-this.start;											// Calc duration
	if (this.hasTimebar) {													// If a timebar
		str="<div id='timeBar' class='time-timebar'>";						// Add timebar div
		str+="<div id='timecontrol'>"										// Block timebar unit
		if (this.showStartEnd && this.start) 								// If showing start date
			str+="<span id='timeStart' class='time-startend'>"+_this.FormatTime(this.start)+"&nbsp;&nbsp;&nbsp;</span>";	// Add start date
		str+="<div id='timeSlider' class='time-timeslider'></div>";			// Add slider div
		if (this.showStartEnd && this.end) 									// If showing end date
			str+="<span id='timeEnd' class='time-startend'>&nbsp;&nbsp;&nbsp;"+_this.FormatTime(this.end)+"</span>";		// Add end date
		if (this.hasTicks) {												// If it has tick marks
			for (i=0;i<7;++i) 												// For each tick
				str+="<div class='time-ticks' id='tick"+i+"'></div>";		// Add tick div
			if (this.hasTickLabels) {										// If showing labels
				str+="<div class='time-ticklabel' id='ticklab1'>"+_this.FormatTime(this.start-0+(this.end-this.start)/4)+"</div>";	 // Add label div
				str+="<div class='time-ticklabel' id='ticklab3'>"+_this.FormatTime(this.start-0+(this.end-this.start)/2)+"</div>";	 // Add label div
				str+="<div class='time-ticklabel' id='ticklab5'>"+_this.FormatTime(this.start-0+(this.end-this.start)/4*3)+"</div>"; // Add label div
				}
			}
		if (this.sliderTime != "None") 										// If showing start date
			str+="<div id='sliderTime' style='color:"+this.timeColor+"' class='time-slidertime'></div>"								// Time display
		$(this.div).append(str+"</div>");									// Add timebar				

		if (this.timeSegments) {											// If it has time segments
			str="<div id='segmentBar' style='position:absolute'>"			// Block segments unit
			for (i=0;i<this.timeSegments.length;++i) { 						// For each tick
				this.timeSegments[i].pct=(this.timeSegments[i].end-this.timeSegments[i].start)/this.dur;// Calc percentage
				str+="<div class='time-seg' id='timeseg"+i+"' ";			// Add div
				str+="style='color:"+this.timeSegTextColor+";background-color:"+this.timeSegColor+"'>";
				str+=this.timeSegments[i].title+"</div>";					// Add title
				}	
			str+="<div class='time-seg' id='timeseg"+i+"' ";				// Add div
			str+="style='color:"+this.timeSegTextColor+";background-color:#acc3db'>";
			str+="&nbsp;&nbsp;&nbsp;Show all&nbsp;&nbsp;&nbsp;</div>";		// Add All
			$(this.div).append(str+"</div>");								// Add segment bar				
			$("#timeseg0").css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
			$("#timeseg"+(this.timeSegments.length-1)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
			$("#timeseg"+(this.timeSegments.length)).css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
			$("#timeseg"+(this.timeSegments.length)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
			
			for (i=0;i<this.timeSegments.length+1;++i) { 					// For each segment
				
				$("#timeseg"+i).hover(										// ON SEG HOVER
	//				function(){ $(this).css("background-color","#acc3db")},	// Highlight
	//				function(){ $(this).css("background-color","#ccc")}		// Hide
					);
				
				$("#timeseg"+i).click( function(e) {							// ON SEG CLICK
					var i;
					var id=e.target.id.substr(7);								// Get ID
					for (i=0;i<_this.timeSegments.length+1;++i)  				// For each segment
						$("#timeseg"+i).css({"background-color":"#ccc"});		// Clear it
					$(this).css({"background-color":"#acc3db" });				// Highlight picked one
					if (id < _this.timeSegments.length)							// If a seg
						_this.curSeg=id;										// Its current
					else														// All but
						_this.curSeg=-1;										// Flag all
				});
				}
				
		}
		
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
	var i,w2,m=18;
	var w=$(this.div).width()-m-m-m;
	var t=$(this.div).height()-$("#timebar").height()-30-m;
	if (this.timeSegmentPos == "Bottom")
		t-=30;
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"})
	var sw=$("#timeStart").width();
	var ew=$("#timeEnd").width();
	$("#timeSlider").width(w-sw-ew);
	
	w=$("#timeSlider").width();												// Width of slider bar
	if (this.hasTicks) {													// If ticks
		var x=$("#timeSlider").offset().left-m;								// Starting point
		var tw=w/8;															// Space between ticks
		for (i=0;i<=7;++i) {												// For each tick
			x+=tw;															// Move over
			$("#tick"+i).css( {top:"11px",left:x+"px"} );					// Position
			if ((i == 1) || (i == 3) || (i == 5)) {							// A shorter tick
				$("#tick"+i).height(14);									// Size
				if (this.hasTickLabels) 									// If showing labels
					$("#ticklab"+i).css( {top:"26px",left:x-50+"px"} );		// Position
				}
			}		
		}	

	if (this.timeSegments) {												// If segments
		w-=(this.timeSegments.length-1)*2;									// Remove spaces between segs
		x=$("#timeSlider").offset().left;									// Starting point
		for (i=0;i<this.timeSegments.length;++i) { 							// For each seg
			w2=this.timeSegments[i].pct*w;									// Width
			$("#timeseg"+i).css({ left:x+"px",width:w2+"px" });				// Position and size
			x+=w2+2;														// Advance
			}
		$("#timeseg"+i).css({ left:x+10+"px" });								// Position
		if (this.timeSegmentPos == "Top") {									// If on top of timebar
			t=$("#timeBar").offset().top-$(this.div).offset().top-30;		// Set pos
			if (this.sliderTime == "Top")	t-=12;							// If slider time on top, move it up
			}
		else																// Below timebar
			t=$(this.div).height()-$("#timebar").height()-16-m;				// Set pos
		$("#segmentBar").css({top:t+"px"});									// Position
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

