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

	var sd={};
	this.margin=18;
	this.start=this.DateToTime("1/1860")
	this.end=this.DateToTime("12/1922")
	this.timeColor="#009900";
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
	this.hasTimeView=true;
	this.timeViewTextSize=11;
	
	this.curTime=this.curStart=this.start;									// Set start
	this.curEnd=this.end;													// Set end
	if (this.sound) {														// If clicking
		Sound("click","init");												// Init sound
		Sound("ding","init");												// Init sound
		Sound("delete","init");												// Init sound
		}
}


Timeline.prototype.InitTimeline=function(div, data)						// INIT TIMELINE
{
/* 
  	Init library and connect to div
  	@param {string} div div to draw timeline into
 */
	this.sd=data;															// Point at setting and data
	this.div="#"+div;														// Current div selector
	this.timeFormat=sd.timeFormat;											// Set date format
	if (this.hasTimeBar) 													// If a timebar
		this.AddTimeBar();													// Add it
	if (this.playerSpeed) 													// If it has player
		this.AddPlayer();													// Add it
	if (this.sd.timeSegments) 												// If it has time segments
		this.AddTimeSegments();												// Add them
	if (this.hasTimeView) 													// If it has time view
		this.AddTimeView();													// Add it
	this.UpdateTimeline();													// Resize 
}	


Timeline.prototype.UpdateTimeline=function() 							// UPDATE TIMELINE PANES
{
/* 
	Resize timeline to fit container div
*/
	var s,e,x,y;
	var i,w2,m=this.margin;
	var w=$(this.div).width()-m-m;											// Width of time area
	var t=$(this.div).height()-$("#timeBar").height()-20-m;					// Top position
	var dur=this.end-this.start;											// Timeline 
	this.timeFormat=sd.timeFormat;											// Set date format
	if (this.segmentPos == "Bottom")										// If putting segments below timebar
		t-=30;																// Shift it higher
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"});				// Position div
	var sw=$("#timeStart").width();											// Start date width
	var ew=$("#timeEnd").width();											// End date width
	var pw=$("#timePlayer").width();										// Player width
	w-=(sw+ew+pw);															// Surrounding divs
	var l=m+sw;																// Left side of time area
	$("#timeSlider").width(w);												// Set slider width
	$("#timePlayer").css({top:t-1+"px",left:w+ew+l+"px"});					// Position player
	
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

	var ts=this.sd.timeSegments;											// Point at time segments
	if (ts) {																// If segments
		var w1=w-(ts.length-1)*2;											// Remove spaces between segs
		x=(this.hasTimeBar) ? $("#timeSlider").offset().left : m;			// Starting point
		for (i=0;i<ts.length;++i) { 										// For each seg
			w2=ts[i].pct*w1;												// Width
			$("#timeseg"+i).css({ left:x+"px",width:w2+"px" });				// Position and size
			x+=w2+2;														// Advance
			}
		$("#timeseg"+i).css({ left:x+10+"px" });							// Position
		t=$(this.div).height()-$("#segmentBar").height()-m;					// Set pos
		if (this.hasTimeBar && (this.segmentPos == "Top")) {				// If on top of timebar
			t=$("#timeBar").offset().top-$(this.div).offset().top-30;		// Set pos
			if (this.sliderTime == "Top")	t-=12;							// If slider time on top, move it up
			}
		$("#segmentBar").css({top:t+"px"});									// Position
		}

	if (this.curSeg == -1)	{												// If showing all segs
		s=this.start-0;														// Get start
		e=this.end-0;														// Get end
		}
	else{																	// Showing  segment
		s=ts[this.curSeg].start-0;											// Get start
		e=ts[this.curSeg].end-0;											// Get end
		}
	$("#timeStart").html(pop.FormatTime(s)+"&nbsp;&nbsp;&nbsp;");			// Set start
	$("#timeEnd").html("&nbsp;&nbsp;&nbsp;"+pop.FormatTime(e)); 			// Set end
	$("#ticklab1").html(pop.FormatTime(s+(e-s)/4));							// Add label div
	$("#ticklab3").html(pop.FormatTime(s+(e-s)/2));							// Add label div
	$("#ticklab5").html(pop.FormatTime(s+(e-s)/4*3));						// Add label div
	$("#timeSlider").slider("option",{min:s,max:e,value:s}); 				// Set slider

	if (this.hasTimeView) {													// If a timeview
		var h=$(this.div).height();											// Total bottom height
		if (this.hasTimeBar) {												// If a timebar
			h-=$("#timeBar").height()+m+24;									// Account for it
			if (this.sliderTime == "Top")									// If a top date
				h-=12;														// Account for it
			}
		if (this.segmentPos == "Top")										// If top segment bar
			h+=6;															// Shift
		h-=$("#segmentBar").height()+m;										// Account for segments
		$("#timeViewBar").height(h);										// Set height
		var rowHgt=12;														// Set row height
		var rowPad=4;														// Space between rows
		for (i=0;i<this.sd.mobs.length;++i) {								// For each mob
			o=this.sd.mobs[i];												// Point at mob
			if (!o.marker)													// No marker set
				continue;													// Skip
			x=(o.start-this.start)/dur;										// Percent in timeline
			x=(x*w)+ew;														// Percent in div
			y=h-rowHgt;														// Default to 1st row
			if (o.row)														// If a row spec'd
				y=h-(o.row*rowHgt+(o.row-1)*rowPad);						// Position it
			$("#svgMarker"+i).attr("transform","translate("+x+","+y+")");	// Move marker
			if (o.end)														// If a spanned event
				$("#svgMarkerBar"+i).attr("width",(o.end-o.start)/dur*w);	// Move bar
			}
		}
	this.curStart=s;														// Save start
	this.curEnd=e;															// Save end
	this.curDur=e-s;														// Save duration
	this.curTime=Math.min(Math.max(this.curTime,s),e);						// Cap at at bounds
	this.Goto(this.curTime);												// Go there
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
		str+="<span id='timeStart' class='time-startend'>"+pop.FormatTime(this.start)+"&nbsp;&nbsp;&nbsp;</span>";	// Add start date
	str+="<div id='timeSlider' class='time-timeslider'></div>";				// Add slider div
	if (this.showStartEnd && this.end) 										// If showing end date
		str+="<span id='timeEnd' class='time-startend'>&nbsp;&nbsp;&nbsp;"+pop.FormatTime(this.end)+"</span>";		// Add end date
	if (this.hasTicks) {													// If it has tick marks
		for (i=0;i<7;++i) 													// For each tick
			str+="<div class='time-ticks' id='tick"+i+"'></div>";			// Add tick div
		if (this.hasTickLabels) {											// If showing labels
			str+="<div class='time-ticklabel' id='ticklab1'>"+pop.FormatTime(this.start-0+(this.end-this.start)/4)+"</div>";	 // Add label div
			str+="<div class='time-ticklabel' id='ticklab3'>"+pop.FormatTime(this.start-0+(this.end-this.start)/2)+"</div>";	 // Add label div
			str+="<div class='time-ticklabel' id='ticklab5'>"+pop.FormatTime(this.start-0+(this.end-this.start)/4*3)+"</div>"; // Add label div
			}
		}
	if (this.sliderTime != "None") 											// If showing start date
		str+="<div id='sliderTime' style='color:"+this.timeColor+"' class='time-slidertime'></div>";								// Time display
	$(this.div).append(str+"</div>");										// Add timebar				

	function ShowTime(x, time) {											// SHOW TIME AT HANDLE
		if ((_this.sliderTime == "Top") || (_this.sliderTime == "Bottom")){ // If showing date
  			_this.curTime=time												// Set now
  			_this.SendMessage("time",_this.curTime+"|scroll");				// Send new time
  			var y=(_this.sliderTime == "Top") ? -22 : 26;					// Top or bottom
			$("#sliderTime").html(pop.FormatTime(time));					// Show value
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
	var ts=this.sd.timeSegments;											// Point at segments
	str="<div id='segmentBar' style='position:absolute;height:16px;'>"		// Enclosing div
	for (i=0;i<ts.length;++i) { 											// For each tick
		ts[i].pct=(ts[i].end-ts[i].start)/dur;								// Calc percentage
		str+="<div class='time-seg' id='timeseg"+i+"' ";					// Add div
		str+="style='color:"+this.segmentTextColor+";background-color:"+this.segmentColor+"'>";
		str+=ts[i].title+"</div>";											// Add title
		}	
	str+="<div class='time-seg' id='timeseg"+i+"' ";						// Add div
	str+="style='color:"+this.segmentTextColor+";background-color:#acc3db'>";
	str+="&nbsp;&nbsp;&nbsp;Show all&nbsp;&nbsp;&nbsp;</div>";				// Add All
	$(this.div).append(str+"</div>");										// Add segment bar				
	$("#timeseg0").css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
	$("#timeseg"+(ts.length-1)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
	$("#timeseg"+(ts.length)).css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
	$("#timeseg"+(ts.length)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
	
	for (i=0;i<ts.length+1;++i) { 											// For each segment

		$("#timeseg"+i).hover(												// ON SEG HOVER
			function(){ $(this).css("color","#999")},						// Highlight
			function(){ $(this).css("color",_this.segmentTextColor)} 		// Hide
			);
		
		$("#timeseg"+i).click( function(e) {								// ON SEG CLICK
			var i;
			var id=e.target.id.substr(7);									// Get ID
			if (_this.sound)												// If clicking
				Sound("click");												// Click sound
			for (i=0;i<ts.length+1;++i)  									// For each segment
				$("#timeseg"+i).css({"background-color":"#ccc"});			// Clear it
			$(this).css({"background-color":"#acc3db" });					// Highlight picked one
			var s=_this.start;												// Assume timeline start
			if (id < ts.length)	{											// If a seg
				_this.curSeg=id;											// Its current
				s=ts[id].start;												// Start at segment start
				if (ts[id].click && ts[id].click.match(/geo:/))				// If a geo set
					_this.SendMessage("geo",ts[id].click.substr(4));		// Move map
				}
			else															// All button
				_this.curSeg=-1;											// Flag all
			_this.curTime=s;
			_this.UpdateTimeline();											// Redraw timeline
			});
		}
}

Timeline.prototype.AddTimeView=function() 								// ADD TIME VIEW
{
/* 	
	Add time segments to div
*/
	var i,j,o,str,w2,r;
	var _this=this;															// Save context for callback
	str="<div id='timeViewBar' class='time-timeview'>"						// Enclosing div
	str+="<div id='xtimeViewSVG' style='position:absolute'>";				// SVG div
	str+="<svg width='10000' height='2000'>";								// Add svg 
	var to=this.timeViewTextSize*.33;										// Text offset
	for (i=0;i<this.sd.mobs.length;++i) {									// For each mob
		o=this.sd.mobs[i];													// Point at mob
		if (!o.marker)														// No marker set
			continue;														// Skip
		w2=o.size ? o.size/2 : 6;											// Set size
			str+="<g id='svgMarker"+i+"'style='cursor:pointer'>";			// Group head
		if (o.marker == "dot") {											// A dot
			str+="<circle r="+w2+" fill='"+o.color+"' />";					// Add dot
			}
		else if (o.marker == "square") {									// A square
			str+="<rect x="+(-w2)+" y="+(-w2)+" height="+(w2+w2)+" width="+(w2+w2)+" fill='"+o.color+"'/>"; 	// Add rect
			}
		else if (o.marker == "Star") {										// A star
			var xx,yy,angle;
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
 			angle=Math.PI/5;												// 1/5th angle
    		w2++;
    		for (j=0;j<10;++j) {											// For each point											
     			r=(j&1) == 0 ? w2 : w2/2;   								// Use outer or inner radius depending on iteration
       			xx=Math.cos(j*angle-(angle/2))*r;							// Calc x
      			yy=Math.sin(j*angle-(angle/2))*r;							// Calc y
				str+=xx+","+yy+" ";											// Add coord
				}
			str+="'/>";														// End polygon
			--w2;
			}
		else if (o.marker == "TriUp") {										// An up triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+="0,"+(-w2)+" "+w2+","+(w2)+" "+(-w2)+","+(w2)+"'/>";		// Points
			}
		else if (o.marker == "TriDown") {									// A down triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(w2)+" "+w2+","+(w2)+" "+(0)+","+(w2)+"'/>";		// Points
			}
		else if (o.marker == "TriLeft") {									// A left triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(0)+" "+w2+","+(-w2)+" "+(w2)+","+(w2)+"'/>";	// Points
			}
		else if (o.marker == "TriRight") {									// A right triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(y-w2)+" "+w2+","+(y)+" "+(-w2)+","+(y+w2)+"'/>";	// Points
			}
		else if (o.marker == "Diamond") {									// A diamond
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(0)+" "+(0)+","+(-w2)+" "+(w2)+","+(0)+" "+(0)+","+(w2)+"'/>";	// Points
			}
		else if (o.marker == "Line") {										// A line
			str+="<rect 'svgMarkerBar"+i+" y="+(-this.timeViewTextSize/2-1)+" height="+(this.timeViewTextSize+2)+" width=100 fill='none' stroke='"+o.color+"'/>"; 	// Add bar
/*
			str+="<line stroke='"+o.color+"' ";								// Line start
			str+="x1=0 y1="+(-w2)+" x2=0 y2="+(w2)+"/>";					// Points
			str+="<line id='svgMarkerMid"+i+"' stroke='"+o.color+"' ";		// Line end
			str+="x1=0 y1=0 x2=1000 y2-0/>";								// Points
			str+="<line id='svgMarkerEnd"+i+"' stroke='"+o.color+"' ";		// Line middle
			str+="x1=1000 y1="+(-w2)+" x2=1000 y2="+(w2)+"/>";				// Points
*/			}
		else if (o.marker == "Bar") {										// A bar
			str+="<rect 'svgMarkerBar"+i+" y="+(-w2)+" height="+(w2+w2)+" width=100 fill='"+o.color+"'/>"; 	// Add bar
			}
		else
			str+="<circle r="+w2+" fill='"+o.color+"' />";					// Default to dot
		if (o.title) {														// If a title
		 	str+="<text id='svgMarkerText"+i+"' x="+(w2+6)+" y="+to+" fill='#666' "; // Add text
		 	str+="font-size="+this.timeViewTextSize+">"+o.title+"</text>";
		 	}
		str+="</g>";														// End group
		}
	str+="</svg></div>";													// End div
	$(this.div).append(str+"</div>");										// Add timeview bar				

	for (i=0;i<this.sd.mobs.length;++i) {									// For each mob
		
		$("#svgMarker"+i).on('click', function(e) {							// ON MARKER CLICK
				var id=e.currentTarget.id.substr(9);						// Get ID
				o=_this.sd.mobs[id];										// Point at mob
		    	var y=$(_this.div).offset().top+e.offsetY-32;				// Point below top of div
			    pop.ShowPopup(_this.div,_this.timeFormat,e.offsetX+8,y,o.title,o.desc,o.pic,o.start,o.end);	// Show popup
				_this.SendMessage("time",o.start);							// Send new time
				if (o.goto)													// If a goto defined
					_this.SendMessage("geo",o.goto);						// Move map
				});
		}
	
	$("#timeViewBar").on('click', function(e) {								// TIMESEG CLICK
		if ($(e.toElement).width() > 1000)									// Not on a marker
	   		pop.ShowPopup();												// Clear any open popup
		});
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
	if (segment != undefined && this.sd.timeSegments) {						// If setting a segment
		if (segment < 0)													// If all button
			segment=this.sd.timeSegments.length+1;							// Set to last
		$("#timeseg"+segment).trigger();									// Trigger click
		}
	if (!this.hasTimeBar)													// No time bar
		return;																// Quit
	$("#timeSlider").slider("option","value",time);							// Trigger slider
	var x=$($("#timeSlider").children('.ui-slider-handle')).offset().left;	// Get pos       			
	this.curTime=time														// Set now
	this.SendMessage("time",this.curTime+"|goto");							// Send new time
	if ((this.sliderTime == "Top") || (this.sliderTime == "Bottom")){ 		// If showing date
		var y=(this.sliderTime == "Top") ? -22 : 26;						// Top or bottom
		$("#sliderTime").html(pop.FormatTime(time));						// Show value
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


Timeline.prototype.DateToTime=function(dateString) 						// CONVERT DATE TO MINS +/- 1960
{
/* 	
	Format time int human readable format
 	@param {number} 
	@return {string} number of mins += 1/1/1970
*/
	if (!dateString)														// No date
		return 0;															// Quit
	var d=new Date();														// Make new date
	var v=(dateString+"").split("/");										// Split date into parts
	if (v.length == 3)														// Mon/Day/Year
		d.setFullYear(v[2],v[0]-1,v[1]);									// Set it to time
	else if (v.length == 2)													// Mon/Year
		d.setFullYear(v[1],v[0]-1);											// Set it to time
	else																	// Year
		d.setFullYear(v[0]);												// Set it to time
 	var time=d.getTime()/36000000;											// Conver ms to minutes
  	return time;															// Return minutes +/- 1970

}

Timeline.prototype.SendMessage=function(cmd, msg) 						// SEND MESSAGE
{
	var str="Time="+cmd;													// Add src and window						
	if (msg)																// If more to it
		str+="|"+msg;														// Add it
	if (window.parent)														// If has a parent
		window.parent.postMessage(str,"*");									// Send message to parent wind
	else																	// Local	
		window.postMessage(str,"*");										// Send message to wind
}
