////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIME.JS 
// Provides timeline component
// Requires: Popup.js()
// Calls global functions: Draw(), ClearPopUps()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Timeline(div, pop)												// CONSTRUCTOR
{

/* 
  	@constructor
 	Init library and connect to div
  	@param {string} div div to draw timeline into
	@param {object} pop	Points to popup library in popup.js.
*/

	var sd={};
	this.div="#"+div;														// Current div selector
	this.pop=pop;															// Point at popup lib
	this.curTime=this.curStart=this.start;									// Set start
	this.curEnd=this.end;													// Set end
	this.lastViewLeft=0;													// Saves scroll of timelime
	this.timeViewScale=1;													// Scale of timeview
}


Timeline.prototype.InitTimeline=function(data)							// INIT TIMELINE
{
	
/* 
	Init library and set data
	@param {object} data	Points to mobs
*/

	this.margin=18;
	this.curSeg=-1;															// Assume all segs
	if (data)	this.sd=data;												// Point at setting and data

	this.timeFormat=this.sd.timeFormat;										// Set date format
	this.start=pop.DateToTime(this.sd.start);								// Start date
	this.end=pop.DateToTime(this.sd.end);									// End date
	this.timeColor=this.sd.timeColor ? this.sd.timeColor : "#009900"; 		// Time slider color
	this.hasTimeBar=this.sd.hasTimeBar ? this.sd.hasTimeBar : true; 		// Time bar?
	this.showStartEnd=this.sd.showStartEnd ? this.sd.showStartEnd : true; 	// Show start/end dates?
	this.sliderTime=this.sd.sliderTime ? this.sd.sliderTime : "Bottom"; 	// Slider time pos
	this.hasTicks=this.sd.hasTicks ? this.sd.hasTicks : true; 				// Has tick marks?
	this.hasTickLabels=this.sd.hasTickLabels ? this.sd.hasTickLabels : true; // Has tick labels?
	this.segmentPos=this.sd.segmentPos ? this.sd.segmentPos : "Top"; 		// Segment bar pos
	this.hasTimeView=this.sd.hasTimeView ? this.sd.hasTimeView : true; 		// Has timeview?
	this.timeGridDate=this.sd.timeGridDate ? this.sd.timeGridDate : true; 	// Has timeview grid?
	this.segmentTextColor=this.sd.segmentTextColor ? this.sd.segmentTextColor : "#000";	// Segment text color
	this.segmentColor=this.sd.segmentColor ? this.sd.segmentColor : "#ccc"; // Segment color
	this.playerSpeed=this.sd.playerSpeed ? this.sd.playerSpeed : 5000; 		// Time to cross timeline / 2
	this.timeGridColor=this.sd.timeGridColor ? this.sd.timeGridColor : "#ccc"; 	// Timeview grid color (undefined for none)
	this.timeViewTextSize=this.sd.timeViewTextSize ? this.sd.timeViewTextSize : "11"; // Timeview text size
	this.hasBackBut=this.sd.hasBackBut ? this.sd.hasBackBut : true; 		// Has forward/back buttons?
	this.muteSound=this.sd.muteSound ? this.sd.muteSound : false; 			// Sound  muted?
	this.timeViewTextColor=this.sd.timeViewTextColor ? this.sd.timeViewTextColor : "#666"; 	//Timeview text color

	$("#timeBar").remove();													// Remove old
	$("#segmentBar").remove();												// Remove old
	$("#timePlayer").remove();												// Remove old
	$("#timeViewBar").remove();												// Remove old

	if (this.hasTimeBar) 													// If a timebar
		this.AddTimeBar();													// Add it
	if (this.playerSpeed) 													// If it has player
		this.AddPlayer();													// Add it
	this.AddTimeSegments();													// Add time segments, if any
	if (this.hasTimeView) 													// If it has time view
		this.AddTimeView();													// Add it
	this.UpdateTimeline();													// Resize 
}	


Timeline.prototype.UpdateTimeline=function(start) 						// UPDATE TIMELINE PANES
{
	
/* 
	Resize timeline to fit container div
*/

	var s,e,x,y,dur,tmp;
	var i,w2,m=this.margin;
	var w=$(this.div).width()-m-m;											// Width of time area
	var t=$(this.div).height()-$("#timeBar").height()-20-m;					// Top position

	var dur=this.end-this.start;											// Timeline 
	this.timeFormat=this.sd.timeFormat;										// Set date format
	if (this.segmentPos == "Bottom")										// If putting segments below timebar
		t-=30;																// Shift it higher
	$("#timeBar").css({top:t+"px",left:m+"px", width:w+"px"});				// Position div
	$("#timeStart").html(this.pop.FormatTime(this.start,this.timeFormat)+"&nbsp;&nbsp;&nbsp;");	// Set start to set spacing
	$("#timeEnd").html("&nbsp;&nbsp;&nbsp;"+this.pop.FormatTime(this.end,this.timeFormat)); 	// Set end

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
		for (i=0;i<9;++i) {													// For each tick
			x+=tw;															// Move over
			$("#tick"+i).css( {top:"11px",left:x+"px"} );					// Position
			if ((i == 1) || (i == 3) || (i == 5)) {							// A shorter tick
				$("#tick"+i).height(14);									// Size
				if (this.hasTickLabels) 									// If showing labels
					$("#ticklab"+i).css( {top:"26px",left:x-50+"px"} );		// Position
				}
			}		
		}	

	var ts=this.timeSegments;												// Point at time segments
	if (ts) {																// If segments
		w=$($("#timeSlider")).width();										// Width of slider
		var w1=w-(ts.length-1)*2;											// Remove spaces between segs
		x=(this.hasTimeBar) ? $("#timeSlider").offset().left : m;			// Starting point
		for (i=0;i<ts.length;++i) { 										// For each seg
			w2=ts[i].pct*w1;												// Width
			if (ts[i].all)													// If the all button
				$("#timeseg"+i).css({ left:x+"px" });						// Position 
			else															// Regular segment button
				$("#timeseg"+i).css({ left:x+"px",width:w2+"px" });			// Position and size
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
	dur=e-s;																// Calc dur
	this.curStart=s;														// Save start
	this.curEnd=e;															// Save end
	this.curDur=dur;														// Save duration
	this.curTime=Math.min(Math.max(this.curTime,s),e);						// Cap at at bounds
	
	$("#timeStart").html(this.pop.FormatTime(s,this.timeFormat)+"&nbsp;&nbsp;&nbsp;");	// Set start
	$("#timeEnd").html("&nbsp;&nbsp;&nbsp;"+this.pop.FormatTime(e,this.timeFormat)); 	// Set end
	$("#ticklab1").html(this.pop.FormatTime(s+(e-s)/4,this.timeFormat));				// Add label div
	$("#ticklab3").html(this.pop.FormatTime(s+(e-s)/2,this.timeFormat));				// Add label div
	$("#ticklab5").html(this.pop.FormatTime(s+(e-s)/4*3,this.timeFormat));				// Add label div
	$("#timeSlider").slider("option",{min:s,max:e,value:s}); 							// Set slider

	if (this.hasTimeView) {													// If a timeview
		var scale=this.timeViewScale;										// Get scale
		if (start)															// If a start spec'd
			s=start;														// Use it
		e/=scale;	dur/=scale;												// Account for scale
		var h=$(this.div).height()-m-8;										// Total bottom height
		if (this.hasTimeBar) {												// If a timebar
			h-=$("#timeBar").height()+m+24;									// Account for it
			if (this.sliderTime == "Top")									// If a top date
				h-=12;														// Account for it
			}
		if (this.segmentPos == "Top")										// If top segment bar
			h+=6;															// Shift
		h-=$("#segmentBar").height()+m;										// Account for segments
		$("#timeViewBar").height(h+8);										// Set height
		$("#timeViewBar").css("top",8+"px");								// Set top
		var rowHgt=12;														// Set row height
		var rowPad=4;														// Space between rows
		var offx=(s*scale-this.start)/Math.max(1,(this.end-this.start))*-w;	// Offset from full timeline start (avoid / 0)
		$("#svgMarkers").attr("transform","translate("+offx+",0)");			// Move markers group
		
		for (i=0;i<this.sd.mobs.length;++i) {								// For each mob
			o=this.sd.mobs[i];												// Point at mob
			if (!o.marker || (o.type != "icon"))							// No marker set, or not a type shown on timeline
				continue;													// Skip
			x=(o.start-s)/dur;												// Percent in timeline
			x=(x*w)+ew+m-offx;												// Percent in div
			y=h-rowHgt;														// Default to 1st row
			if (o.pos)														// If a row spec'd
				y=h-(o.pos*rowHgt+(o.pos-1)*rowPad);						// Position it
			$("#svgMarker"+i).attr("transform","translate("+x+","+y+")");	// Move marker
			if (o.marker) tmp=o.marker.toLowerCase();						// Marker type as lc
				if (o.end && ((tmp == "line") || (tmp == "bar"))) {			// If a spanned event
				x=(o.end-o.start)/dur*w;									// Calc end
				$("#svgMarkerBar"+i).attr("width",x);						// Move bar
				$("#svgMarkerEnd"+i).attr("x1",x);							// Move end line
				$("#svgMarkerEnd"+i).attr("x2",x);							// Move end line
				$("#svgMarkerMid"+i).attr("x2",x);							// Move mid line
				$("#svgMarkerText"+i).attr("text-anchor","middle");			// Center text
				$("#svgMarkerText"+i).attr("x",x/2);						// Center origin 
				}
			}
		w=$("#timeSlider").width()/10;										// Spacing
		x=$("#timeSlider").offset().left;									// Starting point
		for (i=0;i<9;++i) {													// For each grid line
			x+=w;															// Advance
			$("#svgGrid"+i).attr("transform","translate("+x+", 0)");		// Move grid
			$("#svgGridDate"+i).text(this.pop.FormatTime(s+(e-s/scale)*((i+1)/10),this.timeFormat));	// Set date
			}	
		$("#tvScaleBox").css("top",$("#timeViewBar").height()/2-18+"px");	// Center scale buttons
		}
	this.Goto(this.curTime);												// Go there
	$("#tvScale").text(Math.floor(this.timeViewScale*100)+"%");				// Show scale value
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
		str+="<span id='timeStart' class='time-startend' title='Go to previous event'></span>";			// Add start date
	str+="<div id='timeSlider' class='time-timeslider'></div>";				// Add slider div
	if (this.showStartEnd && this.end) 										// If showing end date
		str+="<span id='timeEnd' class='time-startend' title='Go to next event'></span>";				// Add end date
	if (this.hasTicks) {													// If it has tick marks
		for (i=0;i<7;++i) 													// For each tick
			str+="<div class='time-ticks' id='tick"+i+"'></div>";			// Add tick div
		if (this.hasTickLabels) {											// If showing labels
			str+="<div class='time-ticklabel' id='ticklab1'></div>";	 	// Add label div
			str+="<div class='time-ticklabel' id='ticklab3'></div>";	 	// Add label div
			str+="<div class='time-ticklabel' id='ticklab5'></div>"; 	 	// Add label div
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
			$("#sliderTime").html(_this.pop.FormatTime(time,_this.timeFormat));	// Show value
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
		 	Draw(ui.value);													// Redraw project
			}
		});
 
	$("#timeEnd").click( function() {										// ON END DATE CLICK - ADVANCE
		var i,v=[];
		for (i=0;i<_this.sd.mobs.length;++i) {								// For each mob
			if (_this.sd.mobs[i].marker)									// No marker set
				v.push(_this.sd.mobs[i].start);								// Add to array
			}
		v.sort(function(a, b){return a-b});									// Descending sort															)
		for (i=0;i<v.length;++i) {											// For each sorted time
			if (v[i] > _this.curTime) 										// If past now
					break;													// Quit looking
			}
		if (i == v.length) 	i=0;											// If nothing found, wrap
		_this.pop.Sound("click",_this.muteSound);							// Click sound							
		_this.Goto(v[i]);													// Go to time
		});
			
 	$("#timeStart").click( function() {										// ON START DATE CLICK - GO BACK
 		var i,v=[];
		for (i=0;i<_this.sd.mobs.length;++i) {								// For each mob
			if (_this.sd.mobs[i].marker)									// No marker set
				v.push(_this.sd.mobs[i].start);								// Add to array
			}
		v.sort(function(a, b){return a-b});									// Ascending sort															)
		for (i=0;i<v.length;++i) {											// For each sorted time
			if (v[i] >= _this.curTime) 										// If past now
				break;														// Quit looking
				}
		if (!i) 	i=v.length;												// If nothing found, wrap
		_this.pop.Sound("click",_this.muteSound);							// Click sound							
		_this.Goto(v[i-1]);													// Go to time
		});

	$("#timeBar").on('click', function(e) {									// TIMEBAR CLICK
  		ClearPopUps();														// Clear any open popup
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
			_this.pop.Sound("click",_this.muteSound);						// Click sound							
			if ($(this).prop("src").match("play")) 							// If not playing
				_this.Play(_this.curTime);									// Play	
			else															// If in pause
				_this.Play();												// Pause	
			});

}


Timeline.prototype.AddTimeSegments=function() 							// ADD TIME SEGMENTS
{
	
/* 	
	Add time segments to div.
	Looks through sd.mobs for segments and adds them if there.
*/

	var i,o,oo,str;
	var _this=this;															// Save context for callback
	var dur=this.end-this.start;											// Calc duration
	var ts=this.timeSegments=[];											// Point at segments and reset
	
	for (i=0;i<this.sd.mobs.length;++i) {									// For each mob
		o=this.sd.mobs[i];													// Point at mob
		if (o.type != "segment")											// If not a segment
			continue;														// Skip it
		if (o.show == "open")												// If it's the open one
			this.curSeg=i;													// This is current seg
		oo={};																// New obj
		oo.start=o.start;			oo.end=o.end;							// Start, end
		oo.title=o.title;			oo.col=o.color;							// Title, color
		oo.click=o.click;			oo.size=o.size							// Click, size
		ts.push(oo);														// Add seg
		}
	if (!ts.length)															// No segmenta
		return;																// Quit
	str="<div id='segmentBar' style='position:absolute;height:16px;'>"		// Enclosing div
	var hasAll=false;														// Assume no all button
	for (i=0;i<ts.length;++i) { 												// For each tick
		if (!ts[i].start) {													// No start time
			ts[i].all=true													// Flag it as show all button
			hasAll=true;													// Set local flag
			break;															// Quit looking
			}													
		}
	for (i=0;i<ts.length;++i) { 											// For each tick
		ts[i].pct=(ts[i].end-ts[i].start)/dur;								// Calc percentage
		if (ts[0].size == "equal")											// If equal aize
			ts[i].pct=hasAll ? 1/(ts.length-1) : 1/ts.length;				// Divide them up equally
		str+="<div class='time-seg' id='timeseg"+i+"' ";					// Add div
		str+="style='color:"+this.segmentTextColor+";background-color:"+ts[i].col+"'>";
		str+=ts[i].title+"</div>";											// Add title
		}	
	$(this.div).append(str+"</div>");										// Add segment bar				
	$("#timeseg0").css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
	if (hasAll) {															// Has show all button
		$("#timeseg"+(ts.length-2)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
		$("#timeseg"+(ts.length-1)).css({"border-top-left-radius":"10px","border-bottom-left-radius":"10px"});
		$("#timeseg"+(ts.length-1)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
		$("#timeseg"+(ts.length-1)).css({"margin-left":"12px","padding-left":"10px","padding-right":"10px"});
		}
	else
		$("#timeseg"+(ts.length-1)).css({"border-top-right-radius":"10px","border-bottom-right-radius":"10px"});
	
	for (i=0;i<ts.length;++i) { 											// For each segment

		$("#timeseg"+i).hover(												// ON SEG HOVER
			function(){ $(this).css("color","#009900")},					// Highlight
			function(){ $(this).css("color",_this.segmentTextColor)} 		// Hide
			);
		
		$("#timeseg"+i).click( function(e) {								// ON SEG CLICK
			var i,v,j;
			_this.lastViewLeft=0;											// Reset view position
			var id=e.target.id.substr(7);									// Get ID
			_this.pop.Sound("click",_this.muteSound);						// Click sound
			for (i=0;i<ts.length;++i)  										// For each segment
				$("#timeseg"+i).css({"background-color":ts[i].col});		// Clear it
			$(this).css({"background-color":"#acc3db" });					// Highlight picked one
			var s=_this.start;												// Assume timeline start
			if (!ts[id].all) {												// If a regular seg
				_this.curSeg=id;											// Its current
				s=ts[id].start;												// Start at segment start
				}
			else															// All button
				_this.curSeg=-1;											// Flag all
			if (ts[id].click) {												// If a click defined
				v=ts[id].click.split("+");									// Divide into individual actions
				for (j=0;j<v.length;++j) {									// For each action
					a=v[j].split(":");										// Opcode, payload split
					if (a[0])												// At least a command
						_this.SendMessage(a[0].trim(),v[j].substr(a[0].length+1));	// Show item on map
					}
				}	
			_this.curTime=s;
			_this.UpdateTimeline();											// Redraw timeline
			});
		}

	$("#timeseg"+this.curSeg).trigger("click");								// Turn segment on
}

Timeline.prototype.AddTimeView=function() 								// ADD TIME VIEW
{
	
/* 	
	Add time segments to div
*/

	var i,j,o,str,w2,r,m;
	var _this=this;															// Save context for callback
	str="<div id='timeViewBar' class='time-timeview'>"						// Enclosing div
	str+="<div id='timeViewSVG' style='position:absolute'>";				// SVG div
	str+="<svg width='10000' height='2000'>";								// Add svg 

	if (this.timeGridColor) {												// If a grid
		for (i=0;i<9;++i) {													// For each grid line
			r=this.timeGridColor;											// Color 
			str+="<g id='svgGrid"+i+"'>";									// Group start
			str+="<line stroke='"+r+"' ";									// Grid line
			str+="x1=0 x2=0 y1=14 y2=1000/>";								// Points
			if (this.timeGridDate) {										// If showing datws
			 	str+="<text id='svg\GridDate"+i+"' y=8 fill='#999' "; 		// Add text
		 		str+="font-size=9 text-anchor='middle'></text>";
				}
			str+="</g>";													// End group
			}
		}

	var to=this.timeViewTextSize*.33;										// Text offset
	str+="<g id='svgMarkers'>";												// Markers group head
	for (i=0;i<this.sd.mobs.length;++i) {									// For each mob
		o=this.sd.mobs[i];													// Point at mob
		if (!o.marker || (o.type != "icon"))								// No marker set, or not an icon
			continue;														// Skip
		m=o.marker.toLowerCase();											// Force lowercase
		w2=o.size ? o.size/2 : 6;											// Set size
		str+="<g id='svgMarker"+i+"'style='cursor:pointer'>";				// Individual marker group head
		if (m == "dot") {													// A dot
			str+="<circle r="+w2+" fill='"+o.color+"' />";					// Add dot
			}
		else if (m == "square") {											// A square
			str+="<rect x="+(-w2)+" y="+(-w2)+" height="+(w2+w2)+" width="+(w2+w2)+" fill='"+o.color+"'/>"; 	// Add rect
			}
		else if (m == "star") {												// A star
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
		else if (m == "triup") {											// An up triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+="0,"+(-w2)+" "+w2+","+(w2)+" "+(-w2)+","+(w2)+"'/>";		// Points
			}
		else if (m == "tridown") {											// A down triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(w2)+" "+w2+","+(w2)+" "+(0)+","+(w2)+"'/>";		// Points
			}
		else if (m == "trileft") {											// A left triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(0)+" "+w2+","+(-w2)+" "+(w2)+","+(w2)+"'/>";	// Points
			}
		else if (m == "triright") {											// A right triangle
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(y-w2)+" "+w2+","+(y)+" "+(-w2)+","+(y+w2)+"'/>";// Points
			}
		else if (m == "diamond") {											// A diamond
			str+="<polygon fill='"+o.color+"' points='";					// Add polygon
			str+=(-w2)+","+(0)+" "+(0)+","+(-w2)+" "+(w2)+","+(0)+" "+(0)+","+(w2)+"'/>";	// Points
			}
		else if (m == "line") {												// A line
			str+="<line stroke='"+o.color+"' ";								// Line start
			str+="x1=0 y1="+(-w2-2)+" x2=0 y2=0/>";							// Points
			str+="<line id='svgMarkerMid"+i+"' stroke='"+o.color+"' ";		// Line end
			str+="x1=0 y1="+(-w2-2)+" x2=100 y2="+(-w2-2)+"/>";				// Points
			str+="<line id='svgMarkerEnd"+i+"' stroke='"+o.color+"' ";		// Line middle
			str+="x1=100 y1="+(-w2-2)+" x2=100 y2=0/>";						// Points
			}
		else if (m == "bar") {												// A bar
			str+="<rect id='svgMarkerBar"+i+"' y="+(-w2)+" height="+(w2+w2)+" fill='"+o.color+"'/>"; 	// Add bar
			}
		else
			str+="<circle r="+w2+" fill='"+o.color+"' />";					// Default to dot
		if (o.title) {														// If a title
		 	str+="<text id='svgMarkerText"+i+"' x="+(w2+6)+" y="+to+" fill='"+this.timeViewTextColor+"' "; // Add text
		 	str+="font-size="+this.timeViewTextSize+">"+o.title+"</text>";
		 	}
		str+="</g>";														// End group
		}
	str+="</g></svg></div>";												// End markers group, svg, & div
	str+="<div id='tvScaleBox' style='width:40px;position:absolute;left:6px;text-align:center;background-color:#fff'>";		// Container
	str+="<div id='tvPlus'  style='display:inline-block;text-align:center;margin-bottom:4px;background-color:#bbb;color:#fff;border-radius:10px;width:11px;height:11px;cursor:pointer'>+</div>";		// Up button
	str+="<div id='tvScale' style='color:#999'>100%</div>";					// Scale display
	str+="<div id='tvMinus' style='display:inline-block;text-align:center;margin-top:4px;background-color:#bbb;color:#fff;border-radius:10px;width:11px;height:11px;cursor:pointer'>-</div></div>";	// down button
	
	$(this.div).append(str+"</div>");										// Add timeview bar				

	$("#tvPlus").click( function() {										// Zoom in
		_this.timeViewScale=Math.min(_this.timeViewScale*2,8);				// Cap at 8x
		_this.pop.Sound("click",_this.muteSound);							// Click sound							
		_this.UpdateTimeline(); 											// Redraw timeline 
		});

	$("#tvMinus").click( function() {										// Zoom out
		_this.timeViewScale=Math.max(_this.timeViewScale/2,.125);			// Cap at 1/8
		_this.pop.Sound("click",_this.muteSound);							// Click sound							
		_this.UpdateTimeline(); 											// Redraw timeline 
		});

	$("#timeViewBar").draggable({											// Allow dragging
			axis:"x",														// X only
			stop: function(e,ui) {											// ON STOP
					var x=$("#timeViewBar").offset().left+_this.lastViewLeft;	// Pos scolled					
					var d=_this.curDur/_this.timeViewScale/$("#timeSlider").width();	// Time per pixel
					_this.lastViewLeft=x;									// Get new offset
					$("#timeViewBar").css("left","0px");					// Restore old drag point
					 _this.UpdateTimeline(_this.curStart-(x*d)) 			// Redraw timeline from there
					}
			});

	for (i=0;i<this.sd.mobs.length;++i) {									// For each mob
		o=this.sd.mobs[i];													// Point at mob
		if (!o.marker || (o.type != "icon"))								// No marker set, or not an icon
			continue;														// Skip
		o.markerWidth=$("#svgMarker"+i)[0].getBBox().width;					// Save marker width

		$("#svgMarker"+i).on('click', function(e) {							// ON MARKER CLICK
				var v,j,a;
				var id=e.currentTarget.id.substr(9);						// Get ID
				o=_this.sd.mobs[id];										// Point at mob
			    str=o.desc;
       			if (o.citation)	{											// If a cite
					str+="<div class='story-cite' style='cursor:pointer'><br><a onclick='$(\"#cite"+id+"\").fadeIn()'>";
					str+="<u>Citation</u><br><span style='display:none' id='cite"+id+"'><br>"+o.citation+"</span></div>";
					}
			    _this.pop.ShowPopup(_this.div,_this.timeFormat,e.pageX+8,e.pageY-70,o.title,str,o.pic,o.start,o.end);	// Show popup
				_this.SendMessage("time",o.start);							// Send new time
				if (o.click) {												// If a click defined
					v=o.click.split("+");									// Divide into individual actions
					for (j=0;j<v.length;++j) {								// For each action
						a=v[j].split(":");									// Opcode, payload split
						if (a[0])											// At least a command
							_this.SendMessage(a[0].trim(),v[j].substr(a[0].length+1));	// Show item on map
						}
					}	
				});
		}
	
	$("#timeViewSVG").on('click', function(e) {								// TIMESEG CLICK
		if (e.target.tagName == "svg")										// Not on a marker
   			ClearPopUps();													// Clear any open popup
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
	
	if (segment != undefined && this.timeSegments) {						// If setting a segment
		if (segment < 0)													// If all button
			segment=this.timeSegments.length+1;								// Set to last
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
		$("#sliderTime").html(this.pop.FormatTime(time,this.timeFormat));	// Show value
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
