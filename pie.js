////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Pie(options)														// CONSTRUCTOR
{
	var _this=this;																// Save context
	this.ops=options;															// Save options
	this.curSlice=0;															// Current slice
	options.x-=options.wid/2;													// Center x
	options.y-=options.wid/2;													// Center y
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
				alpha=1,cur="pointer"											// Show it
			}
		if ((cs != lastSlice) && (h < w)) {										// A slice change
			_this.curSlice=cs;													// Change it
			_this.HideSubMenus(true);											// Hide submenus										
			if (cs > 0) {														// A valid slice
  				$("#pihigh").css({"transform":"rotate("+(cs-1)*_this.ops.ang+"deg)"}); // Rotate highlight
				var o=_this.ops.slices[cs];										// Point at slice
				if (o.type == "col")		_this.ShowColorBars(cs,o.def);		// Show color bars
				else if (o.type == "txt")	_this.ShowTextPick(cs);				// Show text picker
				else if (o.type == "typ")	_this.ShowTextType(cs,o.def);		// Show text picker
				else if (o.type == "lin")	_this.ShowLineWidth(cs,o.def);		// Show width picker
				else if (o.type == "sli")	_this.ShowSlider(cs,o.def);			// Show slider
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	
	$("#piback").on("click",function() { 										// ON CLICK
		if (_this.curSlice >= 0) {												// A valid pick
			if (_this.ops.slices[_this.curSlice].type == "but")							// If close option set
				_this.SendMessage("click",_this.curSlice);							// Send event
			if (_this.ops.slices[_this.curSlice].close)							// If close option set
				_this.ShowPieMenu(false);										// Close menu
			_this.curSlice=-1;													// Reset slice
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
		this.HideSubMenus(true);												// Hide submenus										
		$("#pimenu").animate({ width:0, height:0,top:o.y+o.wid/2,left:o.x+o.wid/2},200);	// Zoom off
	}	
}

Pie.prototype.HideSubMenus=function(mode)										// HIDE SUBMENUS
{
	if (!mode)
		return;
	$("#pisubback").remove();														// Remove colorbars
}


Pie.prototype.ShowTextType=function(num, def)								// SHOW COLOR BARS
{
	var _this=this;																// Save context
	var ang=(num)*this.ops.ang-22.5;											// Start angle
	var w=this.ops.wid/2+12;													// Radius of menu
	var x=Math.floor((Math.sin((ang)*0.0174533)*w)+w-18);						// Calc x
	var y=Math.floor((w-Math.cos((ang)*0.0174533)*w-18));						// Y
	if (ang > 180) x-=100;														// Shift if on left side

	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	str+="<input type='text' class='pi-type' id='pitype' "; 					// Input
	if (def)	str+="value='"+def+"'";											// Add default
	str+="style='left:"+x+"px;top:"+y+"px'>";									// Position
	$("#pimenu").append(str+"</div>");											// Add to menu														

	$("#pitype").on("change",function(){										// TYPING TEXT
		_this.SendMessage("click",_this.curSlice+"|"+$("#pitype").val());		// Send event
		});
}

Pie.prototype.ShowTextPick=function(num)									// SHOW TEXT PICK
{
	var x,y,i,str="";
	var _this=this;																// Save context
	var o=this.ops.slices[num];
	var n=o.options.length;
	var ang=(num)*this.ops.ang-11.5-(n*11);										// Start angle
	var w=this.ops.wid/2+12;													// Radius of menu
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-textopt' id='pitext"+i+"'>"; 						// Add div
		str+=o.options[i]+"</div>";												// Add label
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	for (i=0;i<n;++i) {															// For each option
		x=Math.floor((Math.sin((ang)*0.0174533)*w)+w-18);						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*w-18));						// Y
		if (ang > 180) x-=$("#pitext"+i).width(),y-=6;							// Shift if on left side
		ang+=22;																// Next angle
		$("#pitext"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#pitext"+i).on("mouseover", function() {								// OVER ITEM
			$(this).css("opacity",1);											// Highlight
			});
		$("#pitext"+i).on("mouseout", function() {								// OUT OF ITEM
			$(this).css("opacity",.75);											// Highlight
			});
		$("#pitext"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			_this.curSlice=-1;													// Reset slice
			});
		}
}

Pie.prototype.ShowColorBars=function(num, def)								// SHOW COLOR BARS
{
	var x,y,i;
	var _this=this;																// Save context
	var cols=[ "#3182bd","#6baed6","#9ecae1","#e6550d","#fd8d3c","#fdae6b",
			   "#31a354","#74c476","#a1d99b","None","#756bb1","#9e9ac8","#bcbddc",
				"#ffffff","#cccccc","#888888","#666666","#444444","#000000"
				];
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<cols.length;++i)													// For each color
  		str+="<div id='pichip"+i+"' class='pi-colchip'></div>";					// Make color chip
	$("#pimenu").append(str+"</div>");											// Add to menu														
	$("#pichip9").text("X");													// None icon
	
	var ang=(num)*this.ops.ang-82.5;											// Start of colors angle
	var w=this.ops.wid/2+12;													// Radius of colors
	
	var w2=w+13;																// Outer circle
	var ang2=ang+54;															// Center angle																
	x=(Math.sin((ang2)*0.0174533)*w2)+w2-18;									// Calc x
	y=(w2-Math.cos((ang2)*0.0174533)*w2-18);									// y
	if (ang2 > 180) x-=66,y-=30;												// Shift if on left side
	str="<input type='text' class='pi-coltext' id='picoltext' "; 
	str+="style='left:"+x+"px;top:"+y+"px'>";
	str+="<div id='pitextcol' class='pi-colchip unselectable'";	
	str+="style='left:"+(x+49)+"px;top:"+(y+3)+"px;height:9px;width:9px'></div>";
	$("#pisubback").append(str);												// Add to color bar														
	$("#pitextcol").css("background-color",def);								// Def col
	$("#picoltext").val(def);													// Def text
	
	$("#picoltext").on("change",function(){										// TYPING OF COLOR
		var col=$("#picoltext").val();											// Get text
		if (col.substr(0,1) != "#") col="#"+col;								// Add #
		_this.SendMessage("hover",_this.curSlice+"|"+col);						// Send event
		$("#pitextcol").css("background-color",col);							// Color chip
		$("#picoltext").val(col);												// Set text
		});
	
	for (i=0;i<cols.length;++i) {												// For each color
		x=(Math.sin(ang*0.0174533)*w)+w-18;
		y=(w-Math.cos(ang*0.0174533)*w-18);
		$("#pichip"+i).css(
			{"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)",		// Rotate 
			"background-color":cols[i]											// Chip color
			}); 	
		ang+=7;																	// Next angle for chip
		
		$("#pichip"+i).on("click", function(e) {								// COLOR CHIP CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+cols[id]);				// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			_this.curSlice=-1;													// Reset slice
			$("#picoltext").val(cols[id]);										// Show value
			$("#pitextcol").css("background-color",cols[id]);					// Color chip
			});

		$("#pichip"+i).on("mouseover", function(e) {							// COLOR CHIP HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("hover",_this.curSlice+"|"+cols[id]);				// Send event
			$("#picoltext").val(cols[id]);										// Show value
			$("#pitextcol").css("background-color",cols[id]);					// Color chip
			});
	}
}

Pie.prototype.ShowLineWidth=function(num, def)								// SHOW LINE WIDTH
{
	var x,y,i;
	var _this=this;																// Save context
	var wids=[0,1,2,3,4,5,6,7,8 ];
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<wids.length;++i)													// For each width
  		str+="<div id='piline"+i+"' class='pi-linechip'></div>";				// Make width chip
	$("#pimenu").append(str+"</div>");											// Add to menu														
	$("#piline0").text("X");													// None icon
	
	var ang=(num)*this.ops.ang-22.5-36;											// Start angle
	var w=this.ops.wid/2+12;													// Radius
 	for (i=0;i<wids.length;++i)	{												// For each width
		x=(Math.sin(ang*0.0174533)*w)+w-18;
		y=(w-Math.cos(ang*0.0174533)*w-18);
		$("#piline"+i).css({ "width":wids[i],									// Set width
			"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"			// Rotate 
			});
		ang+=9;																	// Next angle for chip
		
		$("#piline"+i).on("click", function(e) {								// LINE CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+wids[id]);				// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			_this.curSlice=-1;													// Reset slice
			});

		$("#piline"+i).on("mouseover", function(e) {							// LINE HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("hover",_this.curSlice+"|"+wids[id]);				// Send event
			$(this).css("background-color","#999");
			});
		$("#piline"+i).on("mouseout", function(e) {								// LINE OUT
			$(this).css("background-color","#e8e8e8");
			});
		}
	$("#piline0").css({ "background-color":"transparent" });
}

Pie.prototype.ShowSlider=function(num, def)								// SHOW COLOR BARS
{
	var x,y,i;
	var _this=this;																// Save context
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<61;++i)															// For each arc part
  		str+="<div id='piarc"+i+"' class='pi-sliarc'></div>";					// Make arc chip
	str+="<div id='pislidot' class='pi-slidot'></div>";							// Make slider dot
	$("#pimenu").append(str+"</div>");											// Add to menu														
	var ang=(num)*this.ops.ang-52.5;											// Start of angle
	var w=this.ops.wid/2+18;													// Radius
	
	var ang2=ang+24;															// Center angle																
	x=Math.floor((Math.sin((ang2)*0.0174533)*w)+w-12);							// Calc x
	y=Math.floor((w-Math.cos((ang2)*0.0174533)*w-12));							// Y
	if (ang2 > 180) x-=20,y-=36;												// Shift if on left side
	str="<input type='text' class='pi-coltext' id='pislitext' "; 
	str+="style='left:"+x+"px;top:"+y+"px;width:30px;text-align:center'>";
	$("#pisubback").append(str);												// Add to color bar														
	setDot(def);

	$("#pislitext").on("change",function() {									// TYPING OF VALUE
		var val=$(this).val();
		_this.SendMessage("hover",_this.curSlice+"|"+val);						// Send event
		setDot(val);
		});
	$("#piarc60").html("&nbsp;&nbsp;100")
	$("#piarc60").css({"margin-top":"-6px","opacity":1,"background-color":"transparent"})
	for (i=0;i<61;++i) {														// For each color
		x=(Math.sin(ang*0.0174533)*w)+w-18;
		y=(w-Math.cos(ang*0.0174533)*w-18);
		$("#piarc"+i).css({"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"}); // Rotate 
		ang+=1;																	// Next angle for chip
		
		$("#pichip"+i).on("click", function(e) {								// COLOR CHIP CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+cols[id]);				// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			_this.curSlice=-1;													// Reset slice
			$("#picoltext").val(cols[id]);										// Show value
			$("#pitextcol").css("background-color",cols[id]);					// Color chip
			});

		}

	function setDot(val) {
		var ang2=ang;
		$("#pislitext").val(val);												// Set text
		x=Math.floor((Math.sin(ang2*0.0174533)*w)+w-18-6);						// Calc x
		y=Math.floor((w-Math.cos(ang2*0.0174533)*w-18)-6);						// Y
		$(pislidot).css({"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"}); // Rotate 
	
	}

}

Pie.prototype.SendMessage=function(cmd, msg, callback) 						// SEND HTML5 MESSAGE 
{
	var str=cmd+"|PiMenu";														// Add src and window						
	if (msg)																	// If more to it
		str+="|"+msg;															// Add it
	window.parent.postMessage(str,"*");											// Send message to parent wind		
}
