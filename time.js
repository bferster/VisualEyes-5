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

	this.start=this.DateToTime("1862")
	this.end=this.DateToTime("1922")
	this.timeColor="#009900";
	this.timeFormat="Mon Year";
	this.hasTimeBar=true; 
	this.showStartEnd=true; 
	this.sliderTime="Bottom";
	this.hasTicks=true;
	this.hasTickLabels=true
	this.segmentPos="Top";
	this.segmentTextColor="#000";
	this.segmentColor="#ccc";
	this.playerSpeed=5000;
	this.curSeg=-1;
	this.timeSegments=[ {start:this.DateToTime("1862"), end:this.DateToTime("1886"), title:"Winchester", col:"#ccc"},
						{start:this.DateToTime("1886"), end:this.DateToTime("1889"), title:"New York", col:"#ccc"},
						{start:this.DateToTime("1889"), end:this.DateToTime("1892"), title:"Charlottesville", col:"#ccc"},
						{start:this.DateToTime("1892"), end:this.DateToTime("1898"), title:"Pennsylvania", col:"#ccc"},
						{start:this.DateToTime("1898"), end:this.DateToTime("1902"), title:"Boston", col:"#ccc"},
						{start:this.DateToTime("1902"), end:this.DateToTime("1906"), title:"Connecticut", col:"#ccc"},
						{start:this.DateToTime("1906"), end:this.DateToTime("1910"), title:"Indiana", col:"#ccc"},
						{start:this.DateToTime("1910"), end:this.DateToTime("1922"), title:"Traveling", col:"#ccc"}];

	this.curTime=this.curStart=this.start;									// Set start
	this.curEnd=this.end;													// Set end
	if (this.sound) {														// If clicking
		Sound("click","init");												// Init sound
		Sound("ding","init");												// Init sound
		Sound("delete","init");												// Init sound
		}
}

Timeline.prototype.InitTimeline=function(div)							// INIT TIMELINE
{
/* 
  	Init library and connect to div
  	@param {string} div div to draw timeline into
 */
	this.div="#"+div;														// Current div selector
	if (this.hasTimeBar) 													// If a timebar
		this.AddTimeBar();													// Add it
	if (this.playerSpeed) 													// If it has player
		this.AddPlayer();													// Add them
	if (this.timeSegments) 													// If it has time segments
		this.AddTimeSegments();												// Add them
	this.UpdateTimeline();												// Resize 
}	


Timeline.prototype.UpdateTimeline=function() 							// UPDATE TIMELINE PANES
{
/* 
	Resize timeline to fit container div
*/
	var s,e,x;
	var i,w2,m=18;
	var w=$(this.div).width()-m-m-m;										// Width of bar
	var t=$(this.div).height()-$("#timeBar").height()-30-m;					// Top position
	if (this.segmentPos == "Bottom")										// If putting segments below timebar
		t-=30;																// Shift it higher
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"})
	var sw=$("#timeStart").width();											// Start date width
	var ew=$("#timeEnd").width();											// End date width
	var pw=$("#timePlayer").width();										// Player width
	w-=(sw+ew+pw);															// Surrounding divs
	$("#timeSlider").width(w);												// Set slider width
	$("#timePlayer").css({top:t-1+"px",left:w+sw+ew+m+"px"});				// Position player
	
	if (this.hasTimeBar)													// If a timebar
		w=$("#timeSlider").width();											// Width of slider bar
	else 																	// No timebar
		w-=3*m;																// Account for margins
	if (this.hasTicks && this.hasTimeBar) {									// If ticks
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
		x=(this.hasTimeBar) ? $("#timeSlider").offset().left : m;			// Starting point
		for (i=0;i<this.timeSegments.length;++i) { 							// For each seg
			w2=this.timeSegments[i].pct*w;									// Width
			$("#timeseg"+i).css({ left:x+"px",width:w2+"px" });				// Position and size
			x+=w2+2;														// Advance
			}
		$("#timeseg"+i).css({ left:x+10+"px" });							// Position
		if (this.hasTimeBar) {												// If a timebar
			if (this.segmentPos == "Top") {									// If on top of timebar
				t=$("#timeBar").offset().top-$(this.div).offset().top-30;	// Set pos
				if (this.sliderTime == "Top")	t-=12;						// If slider time on top, move it up
				}
			else															// Below timebar
				t=$(this.div).height()-$("#timeBar").height()-16-m;			// Set pos
			}
		$("#segmentBar").css({top:t+"px"});									// Position
		}

	if (this.curSeg == -1)	{												// If showing all segs
		s=this.start-0;														// Get start
		e=this.end-0;														// Get end
		}
	else{																	// Showing  segment
		s=this.timeSegments[this.curSeg].start-0;							// Get start
		e=this.timeSegments[this.curSeg].end-0;								// Get end
		}
	$("#timeStart").html(this.FormatTime(s)+"&nbsp;&nbsp;&nbsp;");			// Set start
	$("#timeEnd").html("&nbsp;&nbsp;&nbsp;"+this.FormatTime(e)); 			// Set end
	$("#ticklab1").html(this.FormatTime(s+(e-s)/4));						// Add label div
	$("#ticklab3").html(this.FormatTime(s+(e-s)/2));						// Add label div
	$("#ticklab5").html(this.FormatTime(s+(e-s)/4*3));						// Add label div
	$("#timeSlider").slider("option",{min:s,max:e,value:s}); 				// Set slider
 	if (this.hasTimeBar)													// If a timebar
 		x=$($('#timeSlider').children('.ui-slider-handle')).offset().left-67;  // Current slider position    			
 	$("#sliderTime").css({left:x+"px"})										// Position time slider text

	this.curStart=s;														// Save start
	this.curEnd=e;															// Save end
	this.curDur=e-s;														// Save duration
}


Timeline.prototype.Draw=function() 										// DRAW TIMELINE
{

/* 
*/
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CREATION 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Timeline.prototype.AddTimeBar=function() 								// ADD TIME BAR
{
/* 	
	Add timebar to div
*/
	var i,str;
	var _this=this;															// Save context for callback
	str="<div id='timeBar' class='time-timebar'>";							// Add timebar div
	str+="<div id='timecontrol'>"											// Block timebar unit
	if (this.showStartEnd && this.start) 									// If showing start date
		str+="<span id='timeStart' class='time-startend'>"+_this.FormatTime(this.start)+"&nbsp;&nbsp;&nbsp;</span>";	// Add start date
	str+="<div id='timeSlider' class='time-timeslider'></div>";				// Add slider div
	if (this.showStartEnd && this.end) 										// If showing end date
		str+="<span id='timeEnd' class='time-startend'>&nbsp;&nbsp;&nbsp;"+_this.FormatTime(this.end)+"</span>";		// Add end date
	if (this.hasTicks) {													// If it has tick marks
		for (i=0;i<7;++i) 													// For each tick
			str+="<div class='time-ticks' id='tick"+i+"'></div>";			// Add tick div
		if (this.hasTickLabels) {											// If showing labels
			str+="<div class='time-ticklabel' id='ticklab1'>"+_this.FormatTime(this.start-0+(this.end-this.start)/4)+"</div>";	 // Add label div
			str+="<div class='time-ticklabel' id='ticklab3'>"+_this.FormatTime(this.start-0+(this.end-this.start)/2)+"</div>";	 // Add label div
			str+="<div class='time-ticklabel' id='ticklab5'>"+_this.FormatTime(this.start-0+(this.end-this.start)/4*3)+"</div>"; // Add label div
			}
		}
	if (this.sliderTime != "None") 											// If showing start date
		str+="<div id='sliderTime' style='color:"+this.timeColor+"' class='time-slidertime'></div>";								// Time display
	$(this.div).append(str+"</div>");										// Add timebar				

	function ShowTime(x, time) {											// SHOW TIME AT HANDLE
		if ((_this.sliderTime == "Top") || (_this.sliderTime == "Bottom")){ // If showing date
  			_this.curTime=time												// Set now
   			var y=(_this.sliderTime == "Top") ? -22 : 26;					// Top or bottom
 			$("#sliderTime").html(_this.FormatTime(time));					// Show value
 			$("#sliderTime").css({top:y+"px",left:x-66+"px"})				// Position text
 			}
		}
	
	$("#timeSlider").slider({												// INIT SLIDER
 		min: _this.start-0, max: _this.end-0,								// Start/end
		create: function(event,ui) {										// On create
	     	var x=$(this).offset().left+2;									// Start
	     	ShowTime(x,_this.start-0);										// Show start time			
 			},
		slide: function(event,ui) {											// On slide
			var x=$($(this).children('.ui-slider-handle')).offset().left;	// Get pos       			
	     	ShowTime(x,ui.value);											// Show time			
 		 	Draw(ui.value);													// Redraw project
			},
		stop: function(event,ui) {											// On slide stop
			var x=$($(this).children('.ui-slider-handle')).offset().left;	// Get pos       			
	     	ShowTime(x,ui.value);											// Show time			
		 	Draw(ui.value);														// Redraw project
			}
		});
 
 	$("#timeStart").click( function() {										// ON START DATE CLICK
		if (_this.sound)													// If clicking
			Sound("click");													// Click sound
		_this.Goto(_this.curStart);											// Go to beginning
		});
			
 	$("#timeEnd").click( function() {										// ON END DATE CLICK
		if (_this.sound)													// If clicking
			Sound("click");													// Click sound
		_this.Goto(_this.curEnd);											// Go to end
		});

 }

Timeline.prototype.AddPlayer=function() 								// ADD TIME PLAYER
{
/* 	
	Add player to div
*/
	var i,str;
	var _this=this;															// Save context for callback
	str="<div id='timePlayer' class='time-timeplayer'>";					// Add timeplayer div
	str+="<img id='playerButton' src='img/playbut.png' style='width:18;cursor:pointer;vertical-align:middle'>";		// Player button
	str+="<div id='playerSlider' class='time-playerslider'></div>";			// Add slider div
	str+="<div id='playerSpeed' class='time-playerspeed'></div>";			// Speed display
	$(this.div).append(str+"</div>");										// Add timebar				

	function ShowSpeed(x, speed) {											// SHOW TIME AT HANDLE
 		$("#playerSpeed").html(speed);										// Show value
 		$("#playerSpeed").css({top:"-5px",left:x+9+"px"})					// Position text
 		}

	$("#playerSlider").slider({												// Init slider
		value:50,
		create: function(event,ui) {										// On create
     		var x=$(this).offset().left+10;									// Start
	     	ShowSpeed(x,50);												// Show time			
 			},
		slide: function(event,ui) {											// On slide
			var x=$($(this).children('.ui-slider-handle')).offset().left-$(this).offset().left;	// Get pos       			
	     	ShowSpeed(x,ui.value);											// Show time			
 			},
		stop: function(event,ui) {											// On slide stop
			var x=$($(this).children('.ui-slider-handle')).offset().left-$(this).offset().left;	// Get pos       			
	     	ShowSpeed(x,ui.value);											// Show time			
 			}
		});
	
	$("#playerButton").click( function() {									// ON PLAY CLICK
			if (_this.sound)												// If clicking
				Sound("click");												// Click sound
			if ($(this).prop("src").match("play")) 							// If not playing
				_this.Play(_this.curTime);									// Play	
			else															// If in pause
				_this.Play();												// Pause	
			});

}


Timeline.prototype.AddTimeSegments=function() 							// ADD TIME SEGMENTS
{
/* 	
	Add time segments to div
*/
	var i,str;
	var _this=this;															// Save context for callback
	var dur=this.end-this.start;
	str="<div id='segmentBar' style='position:absolute'>"					// Enclosing div
	for (i=0;i<this.timeSegments.length;++i) { 								// For each tick
		this.timeSegments[i].pct=(this.timeSegments[i].end-this.timeSegments[i].start)/dur;	// Calc percentage
		str+="<div class='time-seg' id='timeseg"+i+"' ";					// Add div
		str+="style='color:"+this.segmentTextColor+";background-color:"+this.segmentColor+"'>";
		str+=this.timeSegments[i].title+"</div>";							// Add title
		}	
	str+="<div class='time-seg' id='timeseg"+i+"' ";						// Add div
	str+="style='color:"+this.segmentTextColor+";background-color:#acc3db'>";
	str+="&nbsp;&nbsp;&nbsp;Show all&nbsp;&nbsp;&nbsp;</div>";				// Add All
	$(this.div).append(str+"</div>");										// Add segment bar				
	$("#timeseg0").css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
	$("#timeseg"+(this.timeSegments.length-1)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
	$("#timeseg"+(this.timeSegments.length)).css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
	$("#timeseg"+(this.timeSegments.length)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
	
	for (i=0;i<this.timeSegments.length+1;++i) { 							// For each segment

		$("#timeseg"+i).hover(												// ON SEG HOVER
			function(){ $(this).css("color","#999")},						// Highlight
			function(){ $(this).css("color",_this.segmentTextColor)} 		// Hide
			);
		
		$("#timeseg"+i).click( function(e) {								// ON SEG CLICK
			var i,s,e;
			var id=e.target.id.substr(7);									// Get ID
			if (_this.sound)												// If clicking
				Sound("click");												// Click sound
			for (i=0;i<_this.timeSegments.length+1;++i)  					// For each segment
				$("#timeseg"+i).css({"background-color":"#ccc"});			// Clear it
			$(this).css({"background-color":"#acc3db" });					// Highlight picked one
			if (id < _this.timeSegments.length)								// If a seg
				_this.curSeg=id;											// Its current
			else															// All button
				_this.curSeg=-1;											// Flag all
			_this.UpdateTimeline();											// Redraw timeline
			});
		}
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENTS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Timeline.prototype.Goto=function(time, segment)							// SET TIME AND [SEGMENT]
{
/* 	
	Got to time and maybe change segment
 	@param {number} time time to goto mumber of mins += 1/1/1970
*/
	if (segment != undefined && this.timeSegments) {						// If setting a segment
		if (segment < 0)													// If all button
			segment=this.timeSegments.length+1;								// Set to last
		$("#timeseg"+segment).trigger();									// Trigger click
		}
	$("#timeSlider").slider("option","value",time);							// Trigger slider
	var x=$($("#timeSlider").children('.ui-slider-handle')).offset().left;	// Get pos       			
	this.curTime=time														// Set now
	Draw(time);																// Redraw project
	if ((this.sliderTime == "Top") || (this.sliderTime == "Bottom")){ 		// If showing date
		var y=(this.sliderTime == "Top") ? -22 : 26;						// Top or bottom
		$("#sliderTime").html(this.FormatTime(time));						// Show value
		$("#sliderTime").css({top:y+"px",left:x-66+"px"})					// Position text
		}
}


Timeline.prototype.Play=function(start) 								// PLAY TIMELINE
{
	var _this=this;															// Save context for callback
	clearInterval(this.interval);											// Clear timer
	$("#playerButton").prop("src","img/playbut.png");						// Show play button
	if (start != undefined) {												// If playing
		$("#playerButton").prop("src","img/pausebut.png");					// Show pause button
		this.startPlay=new Date().getTime();								// Set start
		var off=(this.curTime-this.curStart)/this.curDur;			 		// Get offset from start
		this.interval=setInterval(function() {								// Start timer
			var speed=_this.playerSpeed*100/Math.max($("#playerSlider").slider("option","value"),5);
			var pct=(new Date().getTime()-_this.startPlay)/speed; 			// Get percentage
			pct+=off;														// Add starting offset
			if (pct > 1)													// If done
				_this.Play();												// Stop playing
			_this.Goto((pct*_this.curDur)+_this.curStart);					// Go there
			}
		,42);																// ~24fps
		}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


Timeline.prototype.FormatTime=function(time, format) 					// UPDATE TIMELINE PANES
{
/* 	
	Format time int human readable format
 	@param {number} time number of ms += 1/1/1970
	@param {string} format type of format. If not set, this.timeFormat is used.
	@return {string} time formatted at date.
*/
	var str;
	var mos=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	d=new Date(time*36000000);												// Convert minutes to ms
	if (!format)															// If no format spec'd
		format=this.timeFormat;												// Use global format
	if (format == "Mo/Year") 												// 1/1900
		str=(d.getMonth()+1)+"/"+d.getFullYear();							// Set it
	else if (format == "Mo/Day/Year") 										// 1/1/1900
		str=(d.getMonth()+1)+"/"+(d.getDay()+1)+"/"+d.getFullYear();		// Set it
	else if (format == "Mon Year") 											// Jan 1900
		str=mos[d.getMonth()]+" "+d.getFullYear();							// Set it
	else if (format == "Mon Day, Year") 									// Jan 1, 1900
		str=mos[d.getMonth()]+" "+(d.getDay()+1)+", "+d.getFullYear();		// Set it
	else																	// Default to only year
		str=d.getFullYear();												// Set it
 	return str;																// Return formatted date

}

Timeline.prototype.DateToTime=function(date) 							// CONVERT DATE TO MINS +/- 1960
{
/* 	
	Format time int human readable format
 	@param {number} 
	@return {string} number of mins += 1/1/1970
*/
	var d=new Date();														// Make new date
	d.setFullYear(date);													// Set it to time
 	var time=d.getTime()/36000000;											// Conver ms to minutes
  	return time;															// Return minutes +/- 1970

}

