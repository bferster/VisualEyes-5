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
	str+="<img id='pihigh' class='pi-slice' style='pointer-events: none' src='"+ops.hilite+"'/>";	// Slice highlight				
	$("#pimenu").append(str);													// Add to DOM														

	$("#piback").on("mousemove",function(e) { 									// ON HOVER ON
 		var lastSlice=_this.curSlice;											// Save existing slice state
		var alpha=0,cur="auto",cs=-1;											// Assume off
  		var w=_this.ops.wid/2;													// Size
 		var x=e.clientX-(_this.ops.x+w);										// Dx from center
 		var y=e.clientY-(_this.ops.y+w);										// Dy from center
 		var h=Math.sqrt(x*x+y*y); 												// Euclidian distance from center
		if (h < w/5) {															// In settings
			alpha=0;   cur="pointer"; 											// Show it
			cs=0;																// Center slice
			}
		else if (h > w/2) {														// In first orbit ring
			cs=Math.floor((180-Math.atan2(x,y)*(180/Math.PI))/_this.ops.ang)+1;	// Get current slice
				if (_this.ops.slices[cs].type)									// If a valid slice
					alpha=1,cur="pointer"										// Show it
			}
		if (cs != lastSlice) {													// A slice change
			_this.curSlice=cs;													// Change it
			_this.HideSubMenus();												// Hide submenus										
			if (cs > 0) {														// A valid slice
  				$("#pihigh").css({"transform":"rotate("+(cs-1)*_this.ops.ang+"deg)"}); // Rotate highlight
				var o=_this.ops.slices[cs];										// Point at slice
				if (o.type == "col")	_this.ShowColorBars(cs,o.def);			// Show color bars
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	
	$("#pimenu").on("mouseover",function(e) { 									// ON HOVER ON
 		$("#pihigh").css({"opacity":1});										// Show highlight
		$("#pimenu").css({"cursor":"pointer"});									// Pointer cursor
		});	
	$("#pimenu").on("mouseout",function() { 									// ON HOVER ON
		trace(33)
		$("#pihigh").css({"opacity":0});										// No highlight
		$("#pimenu").css({"cursor":"auto"});									// Normal cursor
		_this.HideSubMenus();													// Hide submenus										
		});	
	$("#pimenu").on("click",function() { 										// ON CLICK
		if (_this.curSlice >= 0) {												// A valid pick
			_this.SendMessage("click",_this.curSlice);							// Send event
			if (_this.ops.slices[_this.curSlice].close)							// If close option set
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
	else{
		this.HideSubMenus();													// Hide submenus										
		$("#pimenu").animate({ width:0, height:0,top:o.y+o.wid/2,left:o.x+o.wid/2},200);	// Zoom off
	}	
}

Pie.prototype.HideSubMenus=function()										// HIDE SUBMENUS
{
	$("#picol").remove();														// Remove colorbars
}

Pie.prototype.ShowColorBars=function(num, def)								// SHOW COLOR BARS
{
	var x,y;
	var str="<div id='picol' class='pi-colbar unselectable'>";					// Main shell
 	for (i=0;i<8;++i)
  		str+="<div id='pichip"+i+"' style='background-color:rgb("+i*16+",75,75)' class='pi-colchip'></div>";					// Make color chip
	$("#pimenu").append(str+"</div>");											// Add to menu														
	var ang=(num)*this.ops.ang-60;
	var w=(this.ops.wid/2)+16;
	off=26
	for (i=0;i<8;++i) {
		x=(Math.sin(ang*0.0174533)*w)+w+-off;
		y=w-off-Math.cos(ang*0.0174533)*w;
		$("#pichip"+i).css({"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg) "}); 	// Rotate chip
		ang+=11
		}
}

Pie.prototype.SendMessage=function(cmd, msg, callback) 						// SEND HTML5 MESSAGE 
{
	var str=cmd+"|PiMenu";														// Add src and window						
	if (msg)																	// If more to it
		str+="|"+msg;															// Add it
	window.parent.postMessage(str,"*");											// Send message to parent wind		
}
