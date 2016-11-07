////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu and some utilities
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Pie(options)														// CONSTRUCTOR
{
	var _this=this;																// Save context
	this.ops=options;															// Save options
	this.curSlice=0;															// Current slice
	this.ops.parent=options.parent ? options.parent : "body";					// If a parent div spec'd use it
	var str="<div id='pimenu' class='pi-main unselectable'></div>";				// Main shell
	$(this.ops.parent).append(str);												// Add to DOM														
	str="<img id='piback' class='pi-slice' src='"+ops.dial+"'/>";				// Menu back			
	str+="<img id='pihigh' class='pi-slice' style='pointer-events: none' src='"+ops.slice+"'/>";	// Slice highlight				
	$("#pimenu").append(str);													// Add to DOM														

	$("#piback").on("mousemove",function(e) { 									// ON HOVER ON
 		var alpha=0,cur="auto";													// Assume off
 		_this.curSlice=-1;														// Assume nothing pickec
 		var w=_this.ops.wid;													// Size
 		var x=e.clientX-(_this.ops.x+_this.ops.wid/2);							// Dx from center
 		var y=e.clientY-(_this.ops.y+_this.ops.wid/2);							// Dy from center
 		var h=Math.sqrt(x*x+y*y); 												// Euclidian distance from center
		if (h < w/10) {															// In settings
			alpha=0;   cur="pointer"; 											// Show it
			_this.curSlice=0;													// Center slice
			}
		else if (h > w/4) {														// In first orbit and an active slice
			_this.curSlice=Math.floor((180-Math.atan2(x,y)*(180/Math.PI))/_this.ops.ang)+1;	// Get current slice
			if ((_this.curSlice > 0) && _this.ops.active[_this.curSlice]) {		// A valid slice
				alpha=1;   cur="pointer"										// Show it
 				$("#pihigh").css({"transform":"rotate("+(_this.curSlice-1)*_this.ops.ang+"deg)"}); // Rotate highlight
	//open next level if there
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	
	$("#piback").on("mouseover",function(e) { 									// ON HOVER ON
 		$("#pihigh").css({"opacity":1});										// Show highlight
		$("#pimenu").css({"cursor":"pointer"});									// Pointer cursor
		});	
	$("#piback").on("mouseout",function() { 									// ON HOVER ON
		$("#pihigh").css({"opacity":0});										// No highlight
		$("#pimenu").css({"cursor":"auto"});									// Normal cursor
		});	
	$("#piback").on("click",function() { 										// ON CLICK
		if (_this.curSlice >= 0) {												// A valid pick
			SendMessage("click",_this.curSlice);								// Send event
			if (_this.ops.close[_this.curSlice])								// If close option set
				_this.ShowPieMenu(false);										// Close menu
			}
		});	
}

Pie.prototype.ShowPieMenu=function(mode)									// SHOW PIE MENU
{
	var o=this.ops;																// Point at ops
	if (mode) {	
		$("#pimenu").css({"width":"0px","height":"0px"});						// Hide
		$("#pimenu").css({"top":(o.y+o.wid/2)+"px","left":(o.x+o.wid/2)+"px"});	// Position
		$("#pimenu").animate({ width:o.wid, height:o.wid,top:o.y, left:o.x });	// Zoom on
		}
	else
		$("#pimenu").animate({ width:0, height:0,top:o.y+o.wid/2,left:o.x+o.wid/2},200);	// Zoom off
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function trace(msg, p1, p2, p3, p4)										// CONSOLE 
	{
		if (p4 != undefined)
			console.log(msg,p1,p2,p3,p4);
		else if (p3 != undefined)
			console.log(msg,p1,p2,p3);
		else if (p2 != undefined)
			console.log(msg,p1,p2);
		else if (p1 != undefined)
			console.log(msg,p1);
		else
			console.log(msg);
	}

	function Sound(sound, mute)												// PLAY SOUND
	{
		var snd=new Audio();													// Init audio object
		if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
			snd=new Audio("img/"+sound+".ogg");									// Use ogg
		else	
			snd=new Audio("img/"+sound+".mp3");									// Use mp3
		if (!mute)																// If not initing or muting	
			snd.play();															// Play sound
		}
		
	function ShadeColor(color, percent) {   
		if (!color)
			return;
		var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
		}

	function SendMessage(cmd, msg, callback) 								// SEND HTML5 MESSAGE 
	{
		var str=cmd+"|PiMenu";													// Add src and window						
		if (msg)																// If more to it
			str+="|"+msg;														// Add it
		window.parent.postMessage(str,"*");										// Send message to parent wind		
	}
