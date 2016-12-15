////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PieMenu(options, parObj)											// CONSTRUCTOR
{
	var x,y,i,ang;
	var _this=this;																// Save context
	this.ops=options;															// Save options
	this.parObj=parObj;															// Save calling context
	this.active=false;															// Inactive
	this.ops.segMode=false;														// Assume full menu
	var w=this.ops.wid/2;														// Center
	var iw=(this.ops.wid/200*24).toFixed(4);									// Calc scale
	var r=w-(w/4);																// Radius
	this.curSlice=0;															// Current slice
	if (options.sx == undefined) 	options.sx=options.x;						// Use center y if no start offset
	if (options.sy == undefined) 	options.sy=options.y;						// Y
	options.x-=w;																// Center x
	options.y-=w;																// Center y
	this.ops.parent=options.parent ? options.parent : "body";					// If a parent div spec'd use it

	var str="<div id='pimenu' class='pi-main unselectable'></div>";				// Main shell
	$(this.ops.parent).append(str);												// Add to DOM														
	str="<img id='piback' class='pi-slice' src='"+this.ops.dial+"'/>";			// Menu back			
	str+="<img id='pihigh' class='pi-slice' style='pointer-events: none' src='"+this.ops.hilite+"'/>";	// Slice highlight				
	str+="<div>"
	if (this.ops.slices[0]) {													// If a center slice defined
		str+="<img id='sliceicon0' src='"+this.ops.slices[0].ico+"' style='position:absolute;";	// Center Icon
		str+="left:"+(w-iw/2)+"px;top:"+(w-iw/2)+"px;width:"+iw+"px'/>";			// Position
		}
	for (i=1;i<9;++i) {															// For each option
		if (!this.ops.slices[i])	this.ops.slices[i]={ type:"" };				// Make blank object
		if (!this.ops.slices[i].ico)											// No icon
			continue;															// Skip
		ang=(45*i)-22.5;														// Next angle
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-iw/2));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-iw/2);						// Y
		str+="<img id='sliceicon"+i+"' src='"+this.ops.slices[i].ico+"' style='position:absolute;";	// Icon
		str+="left:"+x+"px;top:"+y+"px;width:"+iw+"px'/>";						// Position
		}
	str+="</div>"
	$("#pimenu").append(str);													// Add to DOM														
	this.ShowPieMenu(false);													// Hide it
	
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
 				if (o.type == "col")	   _this.ShowColorBars(cs,"color",o.def); 	// Set color bars
				else if (o.type == "edg")  _this.ShowColorBars(cs,"edge",o.def);  	// Set color and edge
				else if (o.type == "txt")  _this.ShowColorBars(cs,"text",o.def);  	// Show text picker
				else if (o.type == "men")  _this.ShowMenuPick(cs,o.def);		// Show menu picker
				else if (o.type == "typ")  _this.ShowTextType(cs,o.def);		// Show text picker
				else if (o.type == "sli")  _this.ShowSlider(cs,o.def);			// Show slider
				else if (o.type == "ico")  _this.ShowIcons(cs,o.def);			// Show icons
				}
			}
		$("#pihigh").css({"opacity":alpha});									// Set highlight
		$("#pimenu").css({"cursor":cur});										// Set cursor
		});	

	for (i=1;i<9;++i) 															// For each slice
 		if (this.ops.slices[i].type == "but")									// If a button
			$("#sliceicon"+i).on("click",function(e) { 							// Add click handler
				var id=e.currentTarget.id.substr(9)-0;							// Extract id
				_this.SendMessage("click",id);									// Send event
				});
 }

PieMenu.prototype.ShowPieMenu=function(mode)								// SHOW PIE MENU
{
	var o=this.ops;																// Point at ops
	this.active=mode;															// Set active status
	var w=o.wid/2-25;
	if (mode) {																	// If showing
		$("#pimenu").css({"width":"0px","height":"0px"});						// Hide
		$("#pimenu").css({"top":o.sy+"px","left":o.sx+"px"});					// Position
		$("#pimenu").animate({ width:o.wid, height:o.wid,top:o.y, left:o.x,opacity:1});	// Zoom on
		$("#pamenu").animate({ top:o.y+w, left:o.x+w });						// Zoom on
		}
	else{																		// If hiding
		this.ops.segMode=false;													// Full drawing mode
		this.parObj.curShape=0;													// Pointer shape					
		this.HideSubMenus(true);												// Hide submenus										
		$("#pimenu").animate({ width:0, height:0,top:o.sy,left:o.sx, opacity:0},0);	// Zoom off
		$("#pamenu").animate({ top:o.sy-25, left:o.sx-25 },0);						// Zoom off
		}	
}

PieMenu.prototype.HideSubMenus=function(mode)									// HIDE SUBMENUS
{
	if (!mode)
		return;
	$("#pisubback").remove();													// Remove colorbars
}

PieMenu.prototype.SetSlice=function(num, obj)								// SET SLICE INFO
{
	$("#sliceicon"+num).prop("src",obj.ico);									// Change icon
	this.ops.slices[num]=obj;													// Set data
}

PieMenu.prototype.ShowTextType=function(num, def)							// TYPE IN A VALUE
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

PieMenu.prototype.ShowMenuPick=function(num, def)							// SHOW TEXT PICK
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
		$("#pitext"+def).css({"opacity":1});									// Highlight

	for (i=0;i<n;++i) {															// For each option
		if (((ang+360)%360 > 180) && $("#pitext"+i).text())						// Shift if on left side
			t=$("#pitext"+i).css("width").replace(/px/,"")-0;					// Accomodate text
		else																	// 0-180
			t=0;																// No shift
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-t-7));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-7);						// Y
		ang+=20;																// Next angle
		
		$("#pitext"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#pitext"+i).on("mouseover", function() {								// OVER ITEM
			$(this).css({"opacity":1});											// Highlight
			});
		$("#pitext"+i).on("mouseout", function() {								// OUT OF ITEM
			$(this).css({"opacity":.75});										// Restore 
			});
		$("#pitext"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			Sound("click");														// Click
			});
		}
}

PieMenu.prototype.ShowColorBars=function(num, mode, def)					// SET COLOR / EDGE / TYPE
{
	var x,y,i,n=4;
	var _this=this;																// Save context
	var wids=[8,6,4,3,2,1];														// Width choice
	var cols=[ "#0000aa","#3182bd","#6baed6","#9ecae1","#aa0000","#e6550d","#fd8d3c","#fdae6b",
			   "#ffcc00","None","#00cc00","#31a354","#74c476","#a1d99b","#756bb1","#9e9ac8",
			   "#bcbddc","#ffffff","#cccccc","#888888","#666666","#444444","#000000"
				];	
	var str="<div id='pisubback' class='pi-subbar unselectable' >";				// Color shell
 	for (i=0;i<cols.length;++i)													// For each color
  		str+="<div id='pichip"+i+"' class='pi-colchip'></div>";					// Make color chip
 	if (mode == "edge") {														// If setting edge
		str+="<div id='pilinback' class='pi-subbar unselectable' style='width:50px;height:72px'>";			// Line shell
		if (this.parObj.curShape < 5)											// Not text
			for (i=0;i<wids.length;++i)											// For each width
  				str+="<div id='piline"+i+"' class='pi-linechip'></div>";		// Make width chip
		str+="</div><div id='piarrback' class='pi-subbar unselectable' style='width:50px;height:72px'>";	// Arrow shell
		if (this.parObj.curShape == 3) { 										// If drawing boxes
			str+="<div id='piarr0' class='pi-arrow'></div>";					// Make arrow chip
			str+="<div id='piarr1' class='pi-arrow'></div>";					// Make arrow chip
			}
		else if (this.parObj.curShape < 4)										// Not in circles or text
			for (i=0;i<4;++i)													// For each width
  				str+="<div id='piarr"+i+"' class='pi-arrow'></div>";			// Make arrow chip
		
		if (this.parObj.curShape < 5)											// Not text
			str+="<div id='pidrop' class='pi-fdrop unselectable'>Drop</div>";	// Add drop
		str+="</div>";
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	$("#pichip9").text("X");													// None icon
	if (!def)	def=["#000000,0,0,0,0"];										// If no def defined, set default
	def=def.split(",");															// Split int params
	if (!def[1]) def[1]=0;														// Force to none
	if (!def[2]) def[2]=0;														// Force to none
	if (!def[3]) def[3]=0;														// Force to none
	if (!def[4]) def[4]=0;														// Force to none

	var ang=(num)*this.ops.ang-82.5;											// Start of colors angle
	var w=this.ops.wid/2;														// Center
	var r=w+32;																	// Radius
	var ang2=ang+62;															// Center angle																
	var ix=Math.floor(w+(Math.sin((ang2)*0.0174533)*r))-3;						// Calc x
	var iy=Math.floor((w-Math.cos((ang2)*0.0174533)*r))-3;						// Y
	if (ang2 > 180) ix-=58;														// Shift if on left side
	str="<input type='text' class='pi-coltext' id='picoltext' "; 
	str+="style='left:"+ix+"px;top:"+iy+"px'>";
	str+="<div id='pitextcol' class='pi-colchip unselectable' style='";	
	str+="border:.5px solid #999;left:"+(ix+49)+"px;top:"+(iy+3)+"px;height:7px;width:8px'></div>";
	if ((this.parObj.curShape == 5) && mode == "edge") {						// Text
		str+="<select class='pi-select' id='pifont'";							// Add font selection
		str+="style='position:absolute;width:64px;left:"+ix+"px;top:"+(iy-18)+"px'>";	
		str+="<option value='0'>Arial</option>";
		str+="<option value='1'>Times</option>";
		str+="<option value='2'>Courier</option></select>";
		str+="<div id='pibold' class='pi-fstyle unselectable' " ;				// Bold
		str+="style='left:"+(ix+70)+"px;top:"+(iy-18)+"px'>B</div>";	
		str+="<div id='piital' class='pi-fstyle unselectable' ";				// Ital
		str+="style='left:"+(ix+89)+"px;top:"+(iy-18)+"px'><i>I</i></div>";	
		str+="<div id='pidrop' class='pi-fdrop unselectable' " ;				// Drop
		str+="style='left:"+(ix+70)+"px;top:"+(iy)+"px'>Drop</div>";	
		str+="<div id='pifsize' class='pi-fstyle unselectable' ";				// Size
		str+="style='width:50px;height:0px;left:"+(ix+5)+"px;top:"+(iy-32)+"px'></div>";	
		str+="<input type='text' class='pi-coltext' id='pisiztxt' "; 
		str+="style='text-align:center;width:19px;height:9px;left:"+(ix+70)+"px;top:"+(iy-36)+"px'>";	
		str+="<div id='pifdemo' class='pi-fdemo unselectable' " ;				// Demo letter
		str+="style='left:"+ix+"px;top:"+(iy+18)+"px'>A</div>";	
		}
	$("#pisubback").append(str);												// Add to color bar														
	$("#pitextcol").css("background-color",def[0]);								// Def col
	$("#picoltext").val(def[0]);												// Def text
	$("#pifont").val(def[3]-0);													// Def font
	$("#pifontsty").val(def[4]-0);												// Def font style
	$("#pisiztxt").val(def[1]);													// Def text size
	$("#pifsize").slider({														// Init size slider
		min:10,max:99,step:2,value:def[1],										// Params
		slide: function(e,ui) { $("#pisiztxt").val(ui.value)},					// On slide
		stop: function(e,ui) { 													// On stop
			def[1]=ui.value;													// Get size
			updateColor("click");												// Update menu
			Sound("click");														// Click
			}
		});	
	
	$("#picoltext").on("change",function(){										// TYPING OF COLOR
		def[0]=$("#picoltext").val();											// Get text
		if (def[0].substr(0,1) != "#") def[0]="#"+def[0];						// Add # if not there
		updateColor("click");													// Update menu
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
			updateColor("click");												// Update menu
			Sound("click");														// Click
			});

		$("#pichip"+i).on("mouseover", function(e) {							// COLOR CHIP HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			$(this).css("opacity",.5);											// Darken
			if (mode == "color") {												// If just setting color
				def[0]=cols[id];												// Get color
				updateColor("hover");											// Update menu
				}
			});
	
		$("#pichip"+i).on("mouseout", function() {								// COLOR OUT
			$(this).css("opacity",1);											// Restore
			});
	}

	ix+=12;																		// Starting point
	for (i=0;i<wids.length;++i) {												// For each width
		$("#piline"+i).css({ "top":(13*i)+"px","height":wids[i]+1+"px" }); 		// Set line width
		
		$("#piline"+i).on("mouseover", function() {								// LINE HOVER
			$(this).css("opacity",.5);											// Darken
			});
		
		$("#piline"+i).on("mouseout", function() {								// LINE OUT
			$(this).css("opacity",1);											// Restore
			});
		
		$("#piline"+i).on("click", function(e) {								// LINE HOVER
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			def[1]=wids[id];													// Get width
			Sound("click");														// Click
			updateColor("click");												// Update menu
			});
		}
	
	for (i=0;i<4;++i) {															// For each arrow
		$("#piarr"+i).css({ "top":(19*i)+10+"px" }); 							// Set position
		
		$("#piarr"+i).on("mouseover", function(e) {								// ARROW HOVER
			$(this).css("opacity",.5);											// Darjen
			});
		
		$("#piarr"+i).on("mouseout", function(e) {								// ARROW OUT
			$(this).css("opacity",1);											// Restore
			});
		
		$("#piarr"+i).on("click", function(e) {									// LINE HOVER
			var id=e.currentTarget.id.substr(5)-0;								// Extract id
			def[3]=id;															// Get arrow
			Sound("click");														// Click
			updateColor("click");												// Update menu
			});
		}
	
	if (this.parObj.curShape == 3) { 											// If drawing boxes
		$("#piarr0").css({ "height":"10px","left":"0px","top":"10px" })
		$("#piarr1").css({ "height":"10px","left":"0px","top":"28px","border-radius":"4px" })
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"46px" })
		}
	else if (this.parObj.curShape == 4) { 										// If drawing circles
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"8px" })
		}
	else if (this.parObj.curShape < 3) {										// Drawing arrows
		$("#piarr1").append("<div id='parr1' class='pi-rarr' style='left:16px;top:-5px'</div>")
		$("#piarr2").append("<div id='parr2' class='pi-larr' style='left:-2px;top:-5px'</div>");
		$("#piarr3").append("<div id='parr3' class='pi-larr' style='left:-2px;top:-5px'</div>");
		$("#piarr3").append("<div id='parr4' class='pi-rarr' style='left:16px;top:-5px'</div>")
		$("#pidrop").css({ "height":"12px","left":"-5px","top":"84px" })
		}
	$("#pilinback").css({														// Set b/g for lines
		"left":ix+"px","top":iy-4-(12*wids.length)+"px",						// Position
		"height":12*wids.length+"px"											// Height
		});
	$("#piarrback").css({ "left":ix+10+"px","top":iy+15+"px" });				// Set b/g for arrows
	updateColor();																// Update menu

	$("#pifont").on("change", function() {										// ON FONT CHANGE
		def[3]=$(this).val();													// Get font
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pibold").on("click", function() {										// ON FONT BOLD CLICK
		if (def[4]&1)															// If bold 
			def[4]&=2;															// Retain italic status and unbold
		else																	// Not bold
			def[4]|=1;															// Bold it														
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#piital").on("click", function() {										// ON FONT ITAL CLICK
		if (def[4]&2)															// If ital 
			def[4]&=1;															// Retain bold status and unital
		else																	// Not ital
			def[4]|=2;															// Ital it														
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pidrop").on("click", function() {										// ON FONT DROP CLICK
		def[2]=(def[2]-0+1)%3;													// Force number and step 0-2
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	$("#pisiztxt").on("change", function(e) {									// ON FONT SIZECHANGE
		def[1]=$(this).val();													// Get font
		updateColor("click");													// Update menu
		Sound("click");															// Click
		});

	function updateColor(send) {												// SET COLOR INFO
		$("#picoltext").val(def[0]);											// Show value
		$("#pitextcol").css("background-color",def[0]);							// Color chip
		$("#pidrop").css("background-color",(def[2]>0) ? "#00a8ff" : "#999");	// Color drop
		$("#pidrop").css("color",(def[2]>1) ? "#000" : "#fff");					// Color drop text
		$("#pibold").css("background-color",(def[4]&1) ? "#00a8ff" : "#999");	// Color bold
		$("#piital").css("background-color",(def[4]&2) ? "#00a8ff" : "#999");	// Color ital
		var font="Sans-serif";													// Assume sans
		if (def[3] == 1)		font="Serif";									// Serif
		else if (def[3] == 2)	font="Courier";									// Fixed
		var drop="transparent";													// Assume no drop
		if (def[2] == 1)		drop="#ffffff";									// White drop
		else if (def[2] == 2)	drop="#000000";									// Black drop
		$("#pifdemo").css({"color":def[0],"font-size":def[1]+"px",				// Font size and color
			"font-weight":def[4]&1 ? "bold" : "normal",							// Bold
			"font-style":def[4]&2 ? "italic" : "normal",						// Italic
			"font-family":font,"text-shadow":"4px 4px 16px "+drop				// Drop													// Font
			});
		
		for (j=0;j<wids.length;++j) 											// For each width
			$("#piline"+j).css("background-color",(wids[j] == def[1]) ? "#00a8ff" : "#e8e8e8");	// Make blue
		for (j=0;j<4;++j) {														// For each arrow
			$("#piarr"+j).css("background-color",(j == def[3]) ? "#00a8ff" : "#e8e8e8");	// Make blue
			if (j == 1)
				$("#parr1").css("border-left","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
			if (j == 2)
				$("#parr2").css("border-right","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
			if (j == 3) {
				$("#parr3").css("border-right","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
				$("#parr4").css("border-left","6px solid "+((j == def[3]) ? "#00a8ff" : "#e8e8e8"));	// Make blue
				}
			}
		if (send)																// If sending s message
			_this.SendMessage(send,_this.curSlice+"|"+def.toString());			// Send event
		}
}

PieMenu.prototype.ShowSlider=function(num, def)								// SHOW SLIDER
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
			Sound("click");														// Click
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
		}

	function setDot(val) {
		val=val ? val : 0;														// Fix if null
		val=Math.max(0,Math.min(val,100));										// Cap 0-100
		$("#pislitext").val(val);												// Set text
		var a=(num)*_this.ops.ang-52.5;											// Start of angle
		a=(a+(val*.6))*0.0174533;												// Calc angle
		x=Math.floor((Math.sin(a)*r)+w)-5;										// Calc x
		y=Math.floor((w-Math.cos(a)*r))-5;										// Y
		$("#pislidot").css({"left":+x+"px","top":+y+"px"});						// Position
	}
}

PieMenu.prototype.ShowIcons=function(num, def)								// SHOW ICON RING
{
	var x,y,i,str;
	var _this=this;																// Save context
	var o=this.ops.slices[num];													// Point at data
	var n=o.options.length;														// Number of options
	var ang=(num)*this.ops.ang-11.5-(n*11);										// Angle
	var w=this.ops.wid/2;														// Center
	var r=w+10;																	// Radius
	var str="<div id='pisubback' class='pi-subbar unselectable'>";				// Main shell
	for (i=0;i<n;++i) {															// For each option
		str+="<div class='pi-icon' id='piicon"+i+"'>"; 							// Add div
		str+="<img src='"+o.options[i]+"' width='18'></img></div>";				// Add icon
		}
	$("#pimenu").append(str+"</div>");											// Add to menu														
	
	if (def != undefined)														// If a default
		$("#piicon"+def).css({"opacity":1});									// Highlight

	for (i=0;i<n;++i) {															// For each option
		x=Math.floor(w+(Math.sin((ang)*0.0174533)*r-14));						// Calc x
		y=Math.floor((w-Math.cos((ang)*0.0174533)*r)-14);						// Y
		ang+=19;																// Next angle
		$("#piicon"+i).css({"left":x+"px","top":y+"px"});						// Position
		
		$("#piicon"+i).on("mouseover", function(e) {							// OVER ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			for (var j=0;j<n;++j)												// For each width
				$("#piicon"+j).css({"opacity":(j == id) ? 1: .75 });			// Highlight if current
			});
		$("#piicon"+i).on("click", function(e) {								// CLICK ITEM
			var id=e.currentTarget.id.substr(6)-0;								// Extract id
			_this.SendMessage("click",_this.curSlice+"|"+id);					// Send event
			Sound("click");														// Click
			});


		}
}

PieMenu.prototype.SendMessage=function(cmd, msg) 							// SEND HTML5 MESSAGE 
{
	var str=cmd+"|"+this.ops.id;												// Add src and id						
	if (msg)																	// If more to it
		str+="|"+msg;															// Add it
	window.parent.postMessage(str,"*");											// Send message to parent wind		
}


