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
	str+="<img id='pihigh' class='pi-slice' style='pointer-events: none' src='philite.png'/>";	// Slice highlight				
	$("#pimenu").append(str);													// Add to DOM														


	$("#piback").on("mousemove",function(e) { 									// ON HOVER ON
 		var alpha=0,cur="auto";													// Assume off
 		var w=_this.ops.wid;													// Size
 		var x=e.clientX-(_this.ops.x+_this.ops.wid/2);							// Dx from center
 		var y=e.clientY-(_this.ops.y+_this.ops.wid/2);							// Dy from center
 		var h=Math.sqrt(x*x+y*y); 												// Euclidian distance from center
		_this.curSlice=Math.floor((180-Math.atan2(x,y)*(180/Math.PI))/45);		// Get cuerrnt slice
		if (h < w/10) {															// In settings
			alpha=0;   cur="pointer"											// Show it
			}
		else if ((h > w/4) && _this.ops.active[_this.curSlice]) {				// In first orbit and an active slice
			alpha=1;   cur="pointer"											// Show it
 			$("#pihigh").css({"transform":"rotate("+_this.curSlice*45+"deg)"}); // Rotate highlight
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

}

Pie.prototype.ShowPieMenu=function()										// SHOW PIE MENU
{
	var o=this.ops;																// Point at ops
	$("#pimenu").css({"width":"0px","height":"0px"});							// Hide
	$("#pimenu").css({"top":(o.y+o.wid/2)+"px","left":(o.x+o.wid/2)+"px"});		// Position
	$("#pimenu").animate({ width:o.wid, height:o.wid,top:o.y, left:o.x });		// Zoom on
}



/*
		$("#"+id).on("click",function() {										// ON SLICE CLICK
			$("#pimenu").remove();												// Remove menu
			});	

*/

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

