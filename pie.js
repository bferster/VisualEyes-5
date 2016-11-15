////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Pie(options)														// CONSTRUCTOR
{
	var _this=this;																// Save context
	this.ops=options;															// Save options
	this.curSlice=0;															// Current slice
	if (options.sx == undefined) 	options.sx=options.x;						// Use center y if no start offset
	if (options.sy == undefined) 	options.sy=options.y;						// Y
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
			if (_this.ops.slices[cs].type)										// If a valid slice
				alpha=1,cur="pointer"											// Show it
			}
		if ((cs != lastSlice) && (h < w)) {										// A slice change
			_this.curSlice=cs;													// Change it
			_this.HideSubMenus(true);											// Hide submenus										
			if (cs >= 0) {														// A valid slice
   				$("#pihigh").css({"transform":"rotate("+(cs-1)*_this.ops.ang+"deg)"}); // Rotate highlight
				var o=_this.ops.slices[cs];										// Point at slice
 				if (o.type == "col")	   _this.ShowColorBars(cs,false,o.def);	// Set color bars
				else if (o.type == "edg")  _this.ShowColorBars(cs,true,o.def);	// Set color and edge
				else if (o.type == "lin")  _this.ShowLineWidth(cs,o.def);		// Set color and edge
				else if (o.type == "txt")  _this.ShowTextPick(cs,o.def);		// Show text picker
				else if (o.type == "typ")  _this.ShowTextType(cs,o.def);		// Show text picker
				else if (o.type == "sli")  _this.ShowSlider(cs,o.def);			// Show slider
				else if (o.type == "ico")  _this.ShowIcons(cs,o.def);			// Show icons
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	
	$("#piback").on("click",function() { 										// ON CLICK
		if (_this.curSlice >= 0) {												// A valid pick
			if (_this.ops.slices[_this.curSlice].type == "but")					// If close option set
				_this.SendMessage("click",_this.curSlice);						// Send event
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
		$("#pimenu").css({"top":(o.sy)+"px","left":(o.sx)+"px"});	// Position
		$("#pimenu").animate({ width:o.wid, height:o.wid,top:o.y, left:o.x });	// Zoom on
		}
	else{
		this.HideSubMenus(true);												// Hide submenus										
		$("#pimenu").animate({ width:0, height:0,top:o.sy,left:o.sx},200);	// Zoom off
	}	
}

Pie.prototype.HideSubMenus=function(mode)									// HIDE SUBMENUS
{
	if (!mode)
		return;
	$("#pisubback").remove();														// Remove colorbars
}

Pie.prototype.ShowTextType=function(num, def)								// TYPE IN A VALUE
{
	var _this=this;																// Save context
	var ang=(num)*this.ops.ang-22.5;											// Start angle
	var w=this.ops.wid/2;														// Center
	var r=w+18;																	// Radius
	x=Math.floor(w+(Math.sin((ang)*0.0174533)*r))-7;							// Calc x
	y=Math.floor((w-Math.cos((ang)*0.0174533)*r))-7;							// Y
	if (ang > 180) x-=96;														// Shift if on left side

	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	str+="<input type='text' class='pi-type' id='pitype' "; 					// Input
	if (def)	str+="value='"+def+"'";											// Add default
	str+="style='left:"+x+"px;top:"+y+"px'>";									// Position
	$("#pimenu").append(str+"</div>");											// Add to menu														

	$("#pitype").on("change",function(){										// TYPING TEXT
		_this.SendMessage("click",_this.curSlice+"|"+$("#pitype").val());		// Send event
		});
}

Pie.prototype.ShowTextPick=function(num, def)								// SHOW TEXT PICK
{
	var x,y,i,t,str;
	var _this=this;																// Save context
	var o=this.ops.slices[num];													// Point at data
	var n=o.options.length;														// Number of options
	var ang=(num)*this.ops.ang-11.5-(n*11);										// Angle
	var w=this.ops.wid/2;														// Center
	var r=w+16;																	// Radius
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-textopt' id='pitext"+i+"'>"; 						// Add div
		str+=o.options[i]+"</div>";												// Add label
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	if (def != undefined)														// If a default
		$("#pitext"+def).css({"border":"1px solid #00a8ff","opacity":1});		// Highlight

	for (i=0;i<n;++i) {															// For each option
		if (((ang+360)%360 > 180) && $("#pitext"+i).text())						// Shift if on left side
			t=$("#pitext"+i).css("width").replace(/px/,"")-0;					// Accomodate text
		else																	// 0-180
			t=0;																// No shift
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-t-7));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-7);						// Y
		ang+=18;																// Next angle
		
		$("#pitext"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#pitext"+i).on("mouseover", function() {								// OVER ITEM
			$(this).css({"border":"1px solid #00a8ff","opacity":1});			// Highlight
			});
		$("#pitext"+i).on("mouseout", function() {								// OUT OF ITEM
			$(this).css({"border":"1px solid #dddddd","opacity":.75});			// Restore color
			});
		$("#pitext"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			});
		}
}

Pie.prototype.ShowColorBars=function(num, edge, def)						// SET COLOR / EDGE
{
	var x,y,i;
	var _this=this;																// Save context
	var wids=[1,2,3,4,5,6,7,8];													// Width choice
	var cols=[ "#3182bd","#6baed6","#9ecae1","#e6550d","#fd8d3c","#fdae6b",
			   "#31a354","#74c476","#a1d99b","None","#756bb1","#9e9ac8","#bcbddc",
				"#ffffff","#cccccc","#888888","#666666","#444444","#000000"
				];
	var str="<div id='pisubback' class='pi-subbar unselectable' >";				// Color shell
 	for (i=0;i<cols.length;++i)													// For each color
  		str+="<div id='pichip"+i+"' class='pi-colchip'></div>";					// Make color chip
 	if (edge) {																	// If setting edge
		str+="<div id='pilinback' class='pi-subbar unselectable' style='width:50px'>";	// Line shell
		for (i=0;i<wids.length;++i)												// For each width
  			str+="<div id='piline"+i+"' class='pi-linechip2'></div>";			// Make width chip
		str+="</div>";
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	$("#pichip9").text("X");													// None icon
	if (!def)	def=["#000000,0,0"];											// If no def defined, set default
	def=def.split(",");															// Split int params
	var ang=(num)*this.ops.ang-82.5;											// Start of colors angle
	var w=this.ops.wid/2;														// Center
	var r=w+32;																	// Radius
	var ang2=ang+62;															// Center angle																
	var ix=Math.floor(w+(Math.sin((ang2)*0.0174533)*r))-3;						// Calc x
	var iy=Math.floor((w-Math.cos((ang2)*0.0174533)*r))-3;						// Y
	if (ang2 > 180) ix-=58;														// Shift if on left side
	str="<input type='text' class='pi-coltext' id='picoltext' "; 
	str+="style='left:"+ix+"px;top:"+iy+"px'>";
	str+="<div id='pitextcol' class='pi-colchip unselectable'";	
	str+="style='left:"+(ix+49)+"px;top:"+(iy+3)+"px;height:9px;width:9px'></div>";

	$("#pisubback").append(str);												// Add to color bar														
	$("#pitextcol").css("background-color",def[0]);								// Def col
	$("#picoltext").val(def[0]);												// Def text
	
	$("#picoltext").on("change",function(){										// TYPING OF COLOR
		def[0]=$("#picoltext").val();											// Get text
		if (def[0].substr(0,1) != "#") def[0]="#"+def[0];						// Add # if not there
		updateColor("click",def[0]);											// Update menu
		});
	
	r=w+12;																		// Set color chip radius
	for (i=0;i<cols.length;++i) {												// For each color
		x=(w+(Math.sin(ang*0.0174533)*r)-6).toFixed(4);							// Calc x
		y=(w-Math.cos(ang*0.0174533)*r-6).toFixed(4);							// y
		$("#pichip"+i).css(
			{"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)",		// Rotate 
			"background-color":cols[i]											// Chip color
			}); 	
		ang+=7;																	// Next angle for chip
		
		$("#pichip"+i).on("click", function(e) {								// COLOR CHIP CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			def[0]=cols[id];													// Get color
			updateColor("click",def[0]);											// Update menu
			_this.HideSubMenus(true);											// Hide submenus										
			});

		$("#pichip"+i).on("mouseover", function(e) {							// COLOR CHIP HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			def[0]=cols[id];													// Get color
			updateColor("hover",def[0]);										// Update menu
			});
	}

	ix+=10;																		// Starting point
	for (i=0;i<wids.length;++i) {												// For each width
		$("#piline"+i).css({ "top":(10*i)+"px","height":wids[wids.length-i]+"px" }); // Set line width
		$("#piline"+i).on("mouseover", function(e) {							// LINE HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			
			updateColor("hover");												// Update menu
			$(this).css("background-color","#00a8ff");							// Make blue
			});
		$("#piline"+i).on("mouseout", function() {								// LINE OUT
			$(this).css("background-color","#e8e8e8");							// Restore color
			});
		}
	
	$("#pilinback").css({														// Set b/g for lines
			"left":ix+"px","top":iy-(10*wids.length)+"px",						// Position
			"height":10*wids.length												// Height
			});
		
	function updateColor(send) {												// SET COLOR INFO
		$("#picoltext").val(def[0]);											// Show value
		$("#pitextcol").css("background-color",def[0]);							// Color chip
		if (send) {
			if (edge)
				_this.SendMessage(send,_this.curSlice+"|"+def[0]+","+def[1]+","+def[2]);	// Send event
			else
				_this.SendMessage(send,_this.curSlice+"|"+def[0]);				// Send event
				}
		}
}

Pie.prototype.ShowLineWidth=function(num, def)								// SHOW LINE WIDTH
{
	var x,y,i;
	var _this=this;																// Save context
	var wids=[0,1,2,3,4,5,6,7,8 ];												// Width choice
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<wids.length;++i)													// For each width
  		str+="<div id='piline"+i+"' class='pi-linechip'></div>";				// Make width chip
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	$("#piline0").text("X");													// None icon
	$("#piline0").css({"border":"none","margin-top":"2px",						// Style none
			"background-color":"transparent","font-size":"14px",
			"color":!def ? "#00a8ff" : "#ff0000", 
			});					

	var ang=(num)*this.ops.ang-22.5-38;											// Start angle
	var w=this.ops.wid/2;														// Center
	var r=w+26;																	// Radius

 	for (i=0;i<wids.length;++i)	{												// For each width
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r));							// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r--));						// Y
		$("#piline"+i).css({ "width":wids[i]-1,									// Set width
			"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"			// Rotate 
			});
		ang+=10;																	// Next angle for chip
		
		if ((def == wids[i]) && i)												// If current width	
			$("#piline"+i).css({ "background-color":"#00a8ff",					// Highlight it
				"border":".5px solid #00a8ff"									// Border too
				});
		$("#piline"+i).on("click", function(e) {								// LINE CLICK
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+wids[id]);				// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			});
		$("#piline"+i).on("mouseover", function(e) {							// LINE HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("hover",_this.curSlice+"|"+wids[id]);				// Send event
			for (j=1;j<wids.length;++j)											// For each width
				$("#piline"+j).css({
					"background-color":(j == id) ? "#00a8ff" : "#e8e8e8",		// Make blue if current
					"border":".5px solid "+((j == id) ? "#00a8ff" : "#dddddd")	// Border too
					});
			$("#piline0").css({ "color":(!id) ? "#00a8ff" : "#ff0000" });		// None option
			});
		}
}

Pie.prototype.ShowSlider=function(num, def)									// SHOW COLOR BARS
{
	var x,y,i;
	var _this=this;																// Save context
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Shell
 	for (i=0;i<60;++i)															// For each arc part
  		str+="<div id='piarc"+i+"' class='pi-sliarc'></div>";					// Make arc chip
	str+="<div id='pislidot' class='pi-slidot'></div>";							// Make slider dot
	$("#pimenu").append(str+"</div>");											// Add to menu														
	var ang=(num)*this.ops.ang-22.5-30;											// Start of angle
	var w=this.ops.wid/2;														// Center
	var r=w+16;																	// Radius
	var ang2=ang+28;															// Center angle																
	x=Math.floor(w+(Math.sin((ang2)*0.0174533)*(r+18)))-7;						// Calc x
	y=Math.floor((w-Math.cos((ang2)*0.0174533)*(r+18)))-7;						// Y
	str="<input type='text' class='pi-coltext' id='pislitext' "; 				// Make angle input
	str+="style='left:"+x+"px;top:"+y+"px;width:16px;text-align:center'>";		// Style it
	$("#pisubback").append(str);												// Add to submenu														
	setDot(def);																// Put up dot

	$("#pislidot").draggable({
		drag:function(e,ui) {
		   	var w=_this.ops.wid/2;												// Size
			var x=e.clientX-(_this.ops.x+w);									// Dx from center
 			var y=e.clientY-(_this.ops.y+w);									// Dy from center
			var a=Math.floor((180-Math.atan2(x,y)*57.296));						// Get angle
			if ((a < 60) && (ang > 270)) a+=360;								// If it crosses 360 
			a=Math.max(0,Math.min(a-ang,60));									// Cap 0-60
			var rad=(a+ang)*0.0174533;											// Radians
			x=Math.floor((Math.sin(rad)*r)+w)-5;								// Calc x
			y=Math.floor((w-Math.cos(rad)*r))-5;								// Y
			ui.position.left=x;		ui.position.top=y;							// Position dot
			var val=Math.round(a/.6);											// Convert to 0-100
			$("#pislitext").val(val);											// Set text
			_this.SendMessage("hover",_this.curSlice+"|"+val);					// Send event
			},
		stop:function(event,ui) {
			var val=$("#pislitext").val();										// Get val
			setDot(val);														// Finalize dot
			_this.SendMessage("click",_this.curSlice+"|"+val);					// Send event
			}
		})

	$("#pislitext").on("change",function() {									// TYPING OF VALUE
		var val=$(this).val();													// Get val
		val=val ? val : 0;														// Fix if null
		val=Math.max(0,Math.min(val,100));										// Cap 0-100
		_this.SendMessage("hover",_this.curSlice+"|"+val);						// Send event
		setDot(val);
		});

	ang2=ang;
	for (i=0;i<60;++i) {														// For each color
		x=(w+(Math.sin(ang2*0.0174533)*r)).toFixed(4);							// Calc x
		y=(w-Math.cos(ang2*0.0174533)*r).toFixed(4);							// Y
		$("#piarc"+i).css({"transform":"translate("+x+"px,"+y+"px) rotate("+ang+"deg)"}); // Rotate 
		ang2+=1;																// Next angle for arc
		
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
		val=val ? val : 0;														// Fix if null
		val=Math.max(0,Math.min(val,100));										// Cap 0-100
		$("#pislitext").val(val);												// Set text
		var a=(num)*this.ops.ang-52.5;											// Start of angle
		a=(a+(val*.6))*0.0174533;												// Calc angle
		x=Math.floor((Math.sin(a)*r)+w)-5;										// Calc x
		y=Math.floor((w-Math.cos(a)*r))-5;										// Y
		$("#pislidot").css({"left":+x+"px","top":+y+"px"});						// Position
	}

}

Pie.prototype.ShowIcons=function(num, def)									// SHOW ICON RING
{
	var x,y,i,t,str;
	var _this=this;																// Save context
	var o=this.ops.slices[num];													// Point at data
	var n=o.options.length;														// Number of options
	var ang=(num)*this.ops.ang-11.5-(n*12);										// Angle
	var w=this.ops.wid/2;														// Center
	var r=w+18;																	// Radius
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-icon' id='piicon"+i+"'>"; 							// Add div
		str+="<img src='"+o.options[i]+"'align='middle'</img></div>";			// Add icon
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	if (def != undefined)														// If a default
		$("#piicon"+def).css({"border":"1px solid #00a8ff","opacity":1});		// Highlight

	for (i=0;i<n;++i) {															// For each option
		if (((ang+360)%360 > 180) && $("#piicon"+i).text())						// Shift if on left side
			t=$("#piicon"+i).css("width").replace(/px/,"")-0;					// Accomodate text
		else																	// 0-180
			t=0;																// No shift
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-t-12));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-12);						// Y
		ang+=20;																// Next angle
		$("#piicon"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#piicon"+i).on("mouseover", function(e) {							// OVER ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			for (var j=0;j<n;++j)												// For each width
				$("#piicon"+j).css({											// Set css
					"opacity":(j == id) ? 1: .75,								// Highlight if current
					"border":"1px solid "+((j == id) ? "#00a8ff" : "#666666")	// Border too
					});
			});
		$("#piicon"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			_this.HideSubMenus(true);											// Hide submenus										
			});
		}
}


Pie.prototype.SendMessage=function(cmd, msg, callback) 						// SEND HTML5 MESSAGE 
{
	var str=cmd+"|PiMenu";														// Add src and window						
	if (msg)																	// If more to it
		str+="|"+msg;															// Add it
	window.parent.postMessage(str,"*");											// Send message to parent wind		
}
