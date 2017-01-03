////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW.JS 
// Drawing tool
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function QDraw(dockSide, dockPos, parent)									// CONSTRUCTOR
{
	var _this=this;																// Save context
	parent=parent ? parent : "body";											// If a parent div spec'd use it
	if (parent != "body")  	parent="#"+parent;									// Add #
	this.parent=parent;		this.dockSide=dockSide;	this.dockPos=dockPos;		// Save settings

	this.cVolume=33;		this.gridSnap=0;	this.simplify=0;				// General settings
	this.showSnap=true;		this.showInfo=false;
	this.curUndo=0;			this.curRedo=0;		this.changed=false;				// Undo/redo
	this.clipboard=[];															// Holds cut and paste segs
	this.numSelect=0;

	this.curCurve=0;	this.curCol="#e6550d";	this.curText="Text";				// Default drawing settings
	this.curDrop=0;		this.curShape=0;		this.curAlpha=100;				// Common options
	this.curEwid=1;		this.curEcol="#000000";	this.curEtip=0;					// Edge options
	this.curTsiz=24;	this.curTsty=0;			this.curTfon=0;					// Text options
	
	this.segs=[];																// Drawing data
	var str="<div id='pamenu' class='pa-main unselectable'>";					// Main shell
	str+="<div id='pacoldot' class='pa-dot unselectable'>";						// Color dot
	$(parent).append(str);														// Add to DOM														

	var ops={id:"qdraw",x:330,y:334,wid:150,ang:45,slices:[]};
	ops.dial="img/piback.png";													// Dial background
	ops.hilite="img/philite.png";												// Slice highlight
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol+",0,"+this.curDrop };	// Color slice 
	ops.slices[2]={ type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curDrop+","+this.curEtip+","+this.curCurve };	// Edge 
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:100 };			// Alpha slice 
	ops.slices[4]={ type:"but", ico:"img/redo-icon.png", options:["Redo"]};		// Redo slice 
	ops.slices[5]={ type:"but", ico:"img/undo-icon.png",options:["Undo"]};		// Undo slice 
	ops.slices[6]={ type:"men", ico:"img/align-icon.png", options:["Align:Top:Middle:Bottom:Left:Center:Right","Distribute:Horiz:Vert","Arrange:To back:Backward:Forward:To front"]};	// Align  
	ops.slices[7]={ type:"but", ico:"img/gear-icon.png" };						// Center 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/poly-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;

	this.gd=new Gdrive();														// Google drive access
	Sound("click",true);														// Init sound
	Sound("ding",true);															// Init sound
	Sound("delete",true);														// Init sound

	this.pie=new PieMenu(ops,this);												// Init pie menu
	this.GraphicsInit();														// Init graphics
	this.DrawMenu();															// Draw it
	sessionStorage.clear();														// Clear session storage
	document.onkeyup=$.proxy(this.onKeyUp,this);								// Keyup listener
	document.onkeydown==$.proxy(this.onKeyDown,this);							// Keydown listener
	
	$("#pamenu").draggable({													// Make it draggable
		 containment: "parent",
		 start:function(e,ui) {													// On start
			$(this).css({"border-radius":"100px"});								// Make into dot
			_this.pie.ShowPieMenu(false);										// Hide menu
			},
		stop:function(e,ui) {													// On stop
			var l=$(_this.parent).width()*.1;									// L
			var r=$(_this.parent).width()*.8;									// R
			var t=$(_this.parent).height()*.1;									// T
			var b=$(_this.parent).height()*.9;									// B
			if (e.clientX < l)			_this.dockSide="left";					// Left
			else if (e.clientX > r)		_this.dockSide="right";					// Right
			else if (e.clientY < t)		_this.dockSide="top";					// Top
			else if (e.clientY > b)		_this.dockSide="bottom";				// Bottom
			else						_this.dockSide="float";					// Float
			_this.pie.ops.sx=e.clientX;	_this.pie.ops.sy=e.clientY;				// Start point
			_this.dockPos=null;													// Set y
			_this.DrawMenu();													// Redraw it
			Sound("click");														// Click
	
			}
		});

		$("#pamenu").on("click", function(e) {									// CLICK ITEM
			var x=$("#pamenu").position().left+25;								// Get cx
			var y=$("#pamenu").position().top+25;								// Get cy
			var w=_this.pie.ops.wid/2;											// Get width/2
			if (_this.dockSide == "left") {										// Dock left
				_this.pie.ops.x=x+40;											// Place to the right
				_this.pie.ops.y=y-w;											// Center
				}
			else if (_this.dockSide == "right") {								// Dock right
				_this.pie.ops.x=x-w-w-108;										// Place to the left
				_this.pie.ops.y=y-w;											// Center
				}
			else if (_this.dockSide == "top") {									// Dock top
				_this.pie.ops.y=y+60;											// Place down
				_this.pie.ops.x=x-w;											// Center
				}
			else if (_this.dockSide == "bottom") {								// Dock bottom
				_this.pie.ops.y=y-w-w-40;										// Place up
				_this.pie.ops.x=x-w;											// Center
				}
			else if (_this.dockSide == "float") {								// Floating
				_this.pie.ops.y=y-w;											// Center
				_this.pie.ops.x=x-w;											// Center
				}
			_this.pie.ShowPieMenu(!_this.pie.active);							// Toggle
			_this.DrawMenu();	
			});
	
	$(parent).on("mouseup",function(e) { 										// CLICK ON BACKGROUND
		if (e.target.id == "Q-SVG")	{											// If on background
			_this.pie.ShowPieMenu(false);										// Hide it
			_this.DrawMenu();													// Redraw dot
			}
		}); 
}

QDraw.prototype.DrawMenu=function()											// SHOW DRAWING TOOL MENU
{
	var col=this.curCol;														// Set color
	var icons=["point","line","poly","box","circle","text"];					// Names of icons
	var x=$(this.parent).position().left+$(this.parent).width()-50;				// Right side
	var y=$(this.parent).position().top+$(this.parent).height()-50;				// Bottom side
	if (!col || (col == "None"))												// If a null color
		col="transparent";														// Make transparent
	$("#pacoldot").css({"background":col+" url('img/"+icons[this.curShape]+"-icon.png') no-repeat center center" });
	$("#pacoldot").css({"background-size":"20px 20px","opacity":this.curAlpha/100});// Size it
	var ops=this.pie.ops;
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol+",0,"+this.curDrop };	// Color slice 
	if (this.curShape == 5)														// If text
		this.pie.SetSlice(2,{type:"edg", ico:"img/font-icon.png", def:this.curCol+","+this.curTsiz+","+this.curDrop+","+this.curTfon+","+this.curTSty+","+this.curText});// Text menu 
	else																		// If shape
		this.pie.SetSlice(2,{type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curDrop+","+this.curEtip+","+this.curCurve});	// Edge menu
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:this.curAlpha };	// Alpha slice 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/poly-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;
	
	col=(this.curEcol == "None") ? this.curCol : this.curEcol					// Set edge
	$("#pacoldot").css({"border":"2px solid "+col} );							// Edge color
	
	if (this.pie.active) 														// If pie menu is visible
		$("#pamenu").css({"border-radius":"100px"});							// Make it round
	else{																		// Pie hidden
		if (this.dockSide == "left")
			$("#pamenu").css({"border-radius":"0px","left":"0px",
				"border-top-right-radius":"100px",
				"border-bottom-right-radius":"100px",
				"top":this.dockPos+"%"
				});								
		else if (this.dockSide == "right")
			$("#pamenu").css({"border-radius":"0px","left":x+"px",
				"border-top-left-radius":"100px",
				"border-bottom-left-radius":"100px",
				"top":this.dockPos+"%"
				});								
		else if (this.dockSide == "top")
			$("#pamenu").css({"border-radius":"0px","top":"0px",
				"border-bottom-left-radius":"100px",
				"border-bottom-right-radius":"100px",
				"left":this.dockPos+"%"
				});								
		else if (this.dockSide == "bottom")
			$("#pamenu").css({"border-radius":"0px","top":y+"px",
				"border-top-left-radius":"100px",
				"border-top-right-radius":"100px",
				"left":this.dockPos+"%"
				});								
		else if (this.dockSide == "float")
			$("#pamenu").css({"top":this.sx+"px","left":this.sy+"px" });								
	}
}

QDraw.prototype.HandleMessage=function(msg)									// REACT TO DRAW EVENT
{
	var _this=this;																// Save context
	var vv,v=msg.split("|");													// Split into parts
	
	if ((v[1] == "qdraw") && (v[0] == "click")) {								// A click in main menu
		if (v[2])																// If not center
			this.pie.ops.slices[v[2]].def=v[3];									// Set new default
		if (v[3])																// If def set
			vv=v[3].split(",");													// Split into sub parts
		switch(v[2]-0) {														// Route on slice
			case 1:																// Color
				this.curCol=vv[0];												// Set color
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 2:																// Edge or text styling 
				if (this.curShape == 5) {										// If text
					this.curCol=vv[0];											// Set color
					this.curTsiz=vv[1];											// Set size
					this.curDrop=vv[2];											// Set drop 
					this.curTfon=vv[3];											// Set font
					this.curTsty=vv[4];											// Set style
					this.curText=vv[5];											// Set text
					}
				else{															// Edge													
					this.curEcol=vv[0];											// Set color
					this.curEwid=vv[1];											// Set width
					this.curDrop=vv[2];											// Set drop 
					this.curEtip=vv[3];											// Set tip
					this.curCurve=vv[4];										// Set curve
					}
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 3:																// Alpha
				this.curAlpha=vv[0];											// Set alpha
				this.StyleSelectedSegs(this.changed=true);						// Style all selected segs
				break;
			case 4:																// Red
				this.ReDo();													// Do it
				break;
			case 5:																// Undo
				this.UnDo();													// Undo it
				break;
			case 6:
				if (vv[0] < 11)													// Align
					this.AlignSegs(vv[0]%10);									// Align segs
				else if (vv[0] < 21)											// Distribute
					this.AlignSegs(vv[0]%10+10);								// Distribute widths
				else if (vv[0] < 31)											// Arrange
					this.ArrangeSegs(vv[0]%10);									// Arrange Z-order
				break;
			case 7:																// Settings
				this.Settings();
				break;
			case 8:																// Shape
				this.curShape=vv[0];											// Set shape
				break;
			}
		this.DrawMenu();														// Redraw menu
		}
}

QDraw.prototype.Settings=function()											// SETTINGS MENU
{
	var _this=this;																// Save context
	var str="<table style='font-size:10px;color:#666'>";
	str+="<tr style='height:18px'><td><b>Click volume&nbsp;&nbsp;&nbsp;&nbsp;</b></td>";
	str+="<td><div id='cvol' class='unselectable' style='width:80px;display:inline-block'></div>&nbsp;&nbsp;&nbsp;&nbsp;"
	str+="<div id='cvolt' class='unselectable' style='display:inline-block'>"+this.cVolume+"</div></td></tr>";
	str+="<tr style='height:18px'><td><b>Grid snap</b></td>";
	str+="<td><div id='csnap' class='unselectable' style='width:80px;display:inline-block'></div>&nbsp;&nbsp;&nbsp;"
	str+="<div id='csnapt' class='unselectable' style='display:inline-block'>"+(this.gridSnap ? this.gridSnap : "Off")+"</div></td></tr>";
	str+="<tr style='height:18px'><td><b>Line simplify</b></td>";
	str+="<td><div id='csimp' class='unselectable' style='width:80px;display:inline-block'></div>&nbsp;&nbsp;&nbsp;"
	str+="<div id='csimpt' class='unselectable' style='display:inline-block'>"+(this.simplify ? this.simplify : "Off")+"</div></td></tr>";
	str+="<tr style='height:18px'><td><b>See snap lines</b></td>";
	str+="<td><input type=checkbox id='lsnap' class='unselectable'"+(this.showSnap ? " checked" :"")+"></td></tr>";
	str+="<tr style='height:18px'><td><b>See x/y info</b></td>";
	str+="<td><input type=checkbox id='sinfo' class='unselectable'"+(this.showInfo ? " checked" :"")+"></td></tr>";
	str+="<tr style='height:18px'><td><b>Save/load</b></td>";
	str+="<td><select class='pi-select' style='padding-top:0px;' id='csave'><option></option>";
	str+="<option>Load</option><option>Save</option>";
	str+="<option>Save As...</option><option>Clear</option></select></td></tr>";
	str+="<tr><td><b>This drawing</b></td><td id='sfname'>"+(this.gd.lastName ? this.gd.lastName : "None")+"</td></tr>";
	str+="<tr><td><br></td></tr>";
	str+="<tr><td><b>Help</b></td><td><a href='https://docs.google.com/document/d/1oTbVfuBwFQvgo8EZogyuoXBu7ErCK0oAH3Ny8N_E_Mg/edit?usp=sharing' target='_blank'>";
	str+="<img src='img/helpicon.gif' style='vertical-align:bottom' title='Show help'></a></td></tr>";
	str+="</table>";

	this.Dialog("Settings",str,270, function() {
		_this.cVolume=$("#cvolt").text();
		_this.gridSnap=$("#csnap").slider("value");
		_this.simplify=$("#csimp").slider("value");
		});
		
	$("#lsnap").on("click", function() {										// Line snap
		_this.showSnap=!_this.showSnap;											// Toggle state
		});
	$("#sinfo").on("click", function() {										// See info
		_this.showInfo=!_this.showInfo;											// Toggle state
		_this.ShowInfoBox(true);												// Hide or show it
		});
	$("#cvol").slider({															// Init volume slider
		min:0, max:100, value: _this.cVolume,									// Params
		slide: function(e,ui) { $("#cvolt").text(ui.value)},					// On slide
		});	
	$("#csnap").slider({														// Init snap slider
		min:0, max:100, step:5, value: _this.gridSnap,							// Params
		slide: function(e,ui) {													// On slide
			$("#csnapt").text(ui.value ? ui.value : "Off" );					// Set label 
			}, 
		});	
	$("#csimp").slider({														// Init simplify slider
		min:0, max:100, step:10, value: _this.simplify,							// Params
		slide: function(e,ui) {													// On slide
			$("#csimpt").text(ui.value ? ui.value : "Off" );					// Set label 
			}, 
		});	
	$("#csave").on("change", function() {										// On save menu change
		var i;
		var op=$(this).val();													// Get option chosen
		$(this).val("");														// Reset option
		x=new XMLSerializer();													// Create XML serializer
		var data="<!-- "+JSON.stringify(_this.segs)+" -->\n";					// Add raw data
		var w=$(_this.parent).width();											// Container wid
		var h=$(_this.parent).height();											// Container hgt
		data+='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg">\n';// SVG header
		for (i=0;i<_this.segs.length;++i)										// For each seg
			data+=x.serializeToString(_this.segs[i].svg)+"\n";					// Add seg's SVG
		data+='</svg>';															// Close SVG
		if ((op == "Save As...") || ((op == "Save") && !_this.gd.lastId)) {		// Save to new file
			if (_this.GetTextBox("Type name of new drawing","","",function(name) {	// Type name
					_this.gd.AccessAPI(function() {
					 	_this.gd.CreateFolder(_this.gd.folderName,function(res) {	// Make sure there's a folder
							_this.gd.Upload(name,data, null,function(res) {
								 $("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
								// trace(res); 
								 }); 
							});
						});
				}));
			}
		else if (op == "Save") {												// Save to existing file
			_this.gd.AccessAPI(function() {
			 	_this.gd.CreateFolder(_this.gd.folderName,function(res) { 		// Make sure there's a folder
					_this.gd.Upload($("#myName").val(),data,_this.gd.lastId ? _this.gd.lastId : "",function(res) {
						$("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
					 	Sound("ding");											// Ding
					 	 //trace(res); 
					 	 }); 
				 	 }); 
				 });
			}
		else if (op == "Load") {												// Load
		 	 _this.gd.AccessAPI(function() {
				 _this.gd.CreateFolder(_this.gd.folderName,function(res) {
					 _this.gd.Picker(true,function(res) {
							 	 _this.gd.AccessAPI(function() {
							 	 	 _this.gd.Download(_this.gd.lastId,function(res) {
										$("#sfname").text(_this.gd.lastName ? _this.gd.lastName : "None");
								 	 	var data=res.match(/<!-- (.+) -->/)[1];	// Extract raw seg data
						 	 	 		_this.Do();								// Save undo		
							 	 	 	_this.segs=$.parseJSON(data);			// Set it
							 	 	 	_this.RefreshSVG();						// Remake SVG
									 	Sound("ding");							// Ding
							 	 	 	//trace(res); 
							 	 	 	 }); 
							 	 	 }); 
							 	 }); 
				 	 	 	 }); 
				 	 	 }); 
				}
		else if (op == "Clear")	{												// Clear
			if (_this.ConfirmBox("Are you sure?", function() {					// Are you sure?
					_this.gd.lastId=null;										// Clear last id
					_this.gd.lastName="";										// Clear last name
					_this.Do();													// Save undo
					_this.segs=[];												// Erase all segs
					_this.RefreshSVG();											// Reset SVG
					Sound("delete");											// Delete sound
					}));
			}

		});
}

QDraw.prototype.ShowInfoBox=function(setting)								// SHOW/HIDE INFO BOX
{
	var str;
	if (setting) {																	// If hiding or adding
		$("#infoboxDiv").remove();													// Remove old one
		if (this.showInfo) {														// If adding
			str="<div class='pi-infobox' id='infoboxDiv'></div>";					// Add div
			$(this.parent).append(str);												// Add to parent
			$("#infoboxDiv").draggable({ containment: "parent" });					// Make it draggable
			}
		}
	str="&nbsp;"+this.mx+","+this.my+"&nbsp;";										// Update position into
	$("#infoboxDiv").html(str);														// Set position
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO / REDO / CUT /PASTE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


QDraw.prototype.Do=function(useTempData)									// SAVE DRAWING IN SESSION STORAGE
{
	var o={};
	o.date=new Date().toString().substr(0,21);									// Get date
	o.script=this.segs;															// Get drawing data
	if (useTempData)															// If saving temp data
		o.script=this.tempSeg;													// Use it
	if (!o.script)																// No data there
		return false;															// Quit
	sessionStorage.setItem("do-"+this.curUndo,JSON.stringify(o));				// Add new do												
	this.curRedo=0;																// Stop any redos
	this.changed=false;															// Reset changed flag
	this.curUndo++;																// Inc undo count
	this.SetUndoStatus();														// Set undo/redo icons
	this.tempSeg=null;															// Kill temp data
}
	
QDraw.prototype.UnDo=function()												// GET DRAWING FROM SESSION STORAGE
{
	var o={};
	if (this.curUndo < 1)														// Nothing to undo
		return;																	// Quit
	o.date=new Date().toString().substr(0,21);									// Get date
	o.script=this.segs;															// Get drawing data
	sessionStorage.setItem("do-"+this.curUndo,JSON.stringify(o));				// Add new do												
	var key=sessionStorage.key(this.curUndo-1);									// Get key for undo
	var o=$.parseJSON(sessionStorage.getItem(key));								// Get undo from local storage
	this.segs=o.script;															// Get data
	this.RefreshSVG();															// Restore SVG
	Sound("delete");															// Delete
	this.curRedo++;																// Inc redo count
	this.curUndo--;																// Dec undo count
	this.SetUndoStatus();														// Set undo/reco icons
}

QDraw.prototype.ReDo=function()												// REDO DRAWING FROM UNDO
{
	if (!this.curRedo)															// Nothing to redo
		return;																	// Quit
	var key=sessionStorage.key(this.curUndo+1);									// Get key for redo
	var o=$.parseJSON(sessionStorage.getItem(key));								// Get undo from local storage
	this.segs=o.script;															// Get data
	this.RefreshSVG();															// Restore SVG
	Sound("ding");																// Click
	this.curUndo++;																// Inc undo count
	this.curRedo--;																// Dec redo count
	this.SetUndoStatus();														// Set undo/reco icons
}

QDraw.prototype.SetUndoStatus=function()									// SET UNDO/REDO ICONS
{
	$("#sliceicon5").css("opacity",(this.curUndo > 1) ? 1 : .33);
	$("#sliceicon4").css("opacity",(this.curRedo > 0) ? 1 : .33);
}

QDraw.prototype.ClipboardCut=function()										// CLIPBOARD CUT
{
	this.Do();																	// Save undo
	this.ClipboardCopy();														// Copy selected segs
	for (i=this.segs.length-1;i>=0;--i) 										// For each seg, backwards
		if (this.segs[i].select) {												// If selected
			$("#QWire-"+i).remove();											// Remove wireframe
			$("#QSeg-"+i).remove();												// Remove SVG
			this.segs.splice(i,1);												// Remove from seg list
			}																	// Add to clipboard
	this.RefreshIds();															// Refresh SVG ids to match seg order
	Sound("delete");															// Delete
}

QDraw.prototype.ClipboardCopy=function()									// CLIPBOARD COPY
{
	var i;
	this.clipboard=[];															// Clear clipboard
	for (i=0;i<this.segs.length;++i) 											// For each seg
		if (this.segs[i].select) 												// If selected
			this.clipboard.push(JSON.parse(JSON.stringify(this.segs[i])));		// Unlink and copy seg to clipboard
	if (this.clipboard.length)													// If something copied
		Sound("click");															// Click
}

QDraw.prototype.ClipboardPaste=function()									// CLIPBOARD PASTE
{
	var i;
	this.Do();																	// Save undo
	this.DeselectSegs();														// Deselect all oder sects
	for (i=0;i<this.clipboard.length;++i) {										// For each seg
		this.clipboard[i].svg=null;												// Clear old svg
		this.segs.push(this.clipboard[i]);										// Add seg in
		this.AddSeg(this.segs.length-1);										// Add it in
		this.StyleSeg(this.segs.length-1);										// Add it in
		}
	if (this.clipboard.length)													// If pasted something
		Sound("ding");															// Ding
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// KEY EVENTS
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.onKeyUp=function(e)											// KEY UP HANDLER
{
	if ((e.key == "z") && e.ctrlKey)											// Control z
		this.UnDo();															// Undo
	else if ((e.key == "Z") && e.ctrlKey)										// Control-shift Z
		this.ReDo();															// Undo
	else if ((e.key == "y") && e.ctrlKey)										// Control y
		this.ReDo();															// Redo
	else if ((e.key == "c") && e.ctrlKey)										// Control c
		this.ClipboardCopy();													// Copy
	else if ((e.key == "v") && e.ctrlKey)										// Control v
		this.ClipboardPaste();													// Paste
	else if ((e.key == "x") && e.ctrlKey)										// Control x
		this.ClipboardCut();													// Cut
}

QDraw.prototype.onKeyDown=function(e)										// KEY DOWN HANDLER
{
	if ((e.keyCode == 8) &&														// Look for deletes key
        (e.target.tagName != "TEXTAREA") && 									// In text area
        (e.target.tagName != "INPUT")) { 										// or input
		e.stopPropagation();													// Trap it
     	return false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GOOGLE DRIVE ACCESS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Gdrive()															// CONSTRUCTOR
{
	this.clientId="81792849751-1c76v0vunqu0ev9fgqsfgg9t2sehcvn2.apps.googleusercontent.com";	// Google client id
	this.scope="https://www.googleapis.com/auth/drive";							// Scope of access
	this.key="AIzaSyAVjuoRt0060MnK_5_C-xenBkgUaxVBEug";							// Google API key
	this.contentType="image/svg+xml";											// SVG mime type
	this.folderName="QDrawings";												// Name of drawings folder
	this.folderId="";															// Id of drawings folder
	this.lastId="";																// Id of last drawing saved/loaded
	this.lastName="";															// Name of last file
}

Gdrive.prototype.AccessAPI=function(apiCall, callback)						// CHECK FOR AUTHORIZATION and ACCESS API
{
	gapi.auth.authorize(														// Get logged-in status
		{"client_id": this.clientId, "scope": this.scope, 						// Client info
		"immediate": true},handleAuthResult										// Immediate
		);
		
	function handleAuthResult(authResult) {										// ON GDRIVE RESPONSE
        if (authResult && !authResult.error)  									// If logged in
	 		gapi.client.load('drive', 'v2', function() {						// Load API
 	 			apiCall(callback);												// Run API callback
	 		});
	 	else																	// Not logged in
			gapi.auth.authorize(												// Ask for auth
				{"client_id": this.clientId, "scope": this.scope, 				// Client info
				"immediate": false},handleAuthResult							// Force looking for auth
				);
		}
 }

Gdrive.prototype.Download=function(id, callback)							// DOWNLOAD DATA FROM G-DRIVE
{
	var request = gapi.client.drive.files.get({ 'fileId': id });				// Request file
	request.execute(function(resp) {											// Get data
		if (resp.downloadUrl) {													// If a link
		    var accessToken=gapi.auth.getToken().access_token;					// Get access token
		    var xhr=new XMLHttpRequest();										// Ajax
		    xhr.open("GET",resp.downloadUrl);									// Set open url
		    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);		// Set header
		    xhr.onload = function()  {  callback(xhr.responseText);   };		// On load
		    xhr.send();															// Do it
		  	}
		});
}

Gdrive.prototype.CreateFolder=function(folderName, callback)				// CREATE NEW FOLDER ON G-DRIVE
{
	var _this=this;																// Save context
	var token=gapi.auth.getToken().access_token;								// Get access token

	var request=gapi.client.drive.files.list({									// Make request object
	  	q:"title='"+folderName+"' and mimeType='application/vnd.google-apps.folder' and trashed = false" // Look for name and folder mimetype
	 	});
	request.execute(function(resp) {											// Get data
  		if (resp.items.length) {												// If folder exists
  			_this.folderId=resp.items[0].id;									// Get folder's id									
 			callback(_this.folderId);											// Run callback with id
 			}
		else{																	// Need to create it
		 	var request2=gapi.client.request({									// Make request object
				path: "/drive/v2/files/",
				method: "POST",
		       	headers: {
		           	"Content-Type": "application/json",
		           	"Authorization": "Bearer "+token,             
		      		},
		       body:{
		           	title: folderName,
		          	mimeType: "application/vnd.google-apps.folder",
		  	     	}
		  	 	});
			request2.execute(function(resp) {									// Get data
		      	_this.folderId=resp.id;											// Save last id set
	 			callback(_this.folderId);										// Run callback with id
				});	
			}	
  		});

}

Gdrive.prototype.Upload=function(name, data, id, callback)					// UPLOAD DATA TO G-DRIVE
{
	const boundary = '-------314159265358979323846264';							// Bounds	
    const delimiter = "\r\n--" + boundary + "\r\n";								// Opener
    const close_delim = "\r\n--" + boundary + "--";								// Closer
	var metadata={ 																// Set metadata
		'title': name, 'mimeType': this.contentType, 							// Name and mimetype							
		parents:[{ id: this.folderId}]											// Folder to place it in
		};
	var base64Data=btoa(data); 													// Encode to base-64 Stringify if JSON
	var _this=this;																// Save context
	id=id ? "/"+id : "";														// Add id if set
    var multipartRequestBody =													// Multipart request
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + this.contentType + '\r\n' +							// Set content type
        'Content-Transfer-Encoding: base64\r\n' +								// Base 64
        '\r\n' +
        base64Data +															// Add metadate
        close_delim;															// Closer
    var request = gapi.client.request({											// Create request
        'path': '/upload/drive/v2/files'+id,									// Service
        'method': id ? 'PUT' : 'POST',											// Method based on update or create mode
   		'params': id ? {'uploadType': 'multipart', 'alt': 'json'} : {'uploadType': 'multipart'},
        'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
        'body': multipartRequestBody});
  
   request.execute(function(arg) {												// Run request
       	_this.lastId=arg.id;													// Save last id set
      	_this.lastName=arg.title;												// Save last name set
      	callback(arg);															// Run callback
    	});
}

Gdrive.prototype.Picker=function(allFiles, callback)						// RUN G-DRIVE PICKER
{
	var _this=this;																// Save context
	LoadPicker(allFiles, function(s) {											// Load picker
		callback(s.url);
		});
	
 	function LoadPicker(allFiles, callback)									// LOAD G-DRIVE PICKER
	{
	  	var pickerApiLoaded=false;
		var oauthToken;
		gapi.load('auth', { 'callback': function() {
				window.gapi.auth.authorize( {
	              	'client_id': _this.clientId,
	             	'scope': [ _this.scope,],
	              	'immediate': false }, function(authResult) {
							if (authResult && !authResult.error) {
	          					oauthToken=authResult.access_token;
	          					createPicker();
	          					}
	          				});
				}
			});
		
		gapi.load('picker', {'callback': function() {
				pickerApiLoaded=true;
		        createPicker();
	    	   	}
			});
	
		function createPicker() {
	        if (pickerApiLoaded && oauthToken) {
	           	var view=new google.picker.DocsView().
	           		setOwnedByMe(allFiles).
	           		setParent(_this.folderId).
					setIncludeFolders(true);
	          	var picker=new google.picker.PickerBuilder().
	          		addView(view).
					setOAuthToken(oauthToken).
					setDeveloperKey(_this.key).
					setCallback(pickerCallback).
					setSelectableMimeTypes(_this.contentType).
					build();
				picker.setVisible(true);
	       		}
	    	}
	
		function pickerCallback(data) {
	        if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
         		var doc=data[google.picker.Response.DOCUMENTS][0];
	      		_this.lastId=doc.id;
		     	_this.lastName=doc.name;
	      		callback(doc)
	       		}
			}
	   
	}	// End closure
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.GetTextBox=function (title, content, def, callback)		// GET TEXT LINE BOX
{
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content;
	str+="<p><input class='is' type='text' id='gtBoxTt' value='"+def+"'></p></div>";
	$("#alertBoxDiv").append(str);	
	$("#alertBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { Sound("click");  callback($("#gtBoxTt").val()); $(this).remove(); },
				            	"Cancel":  	function() { Sound("delete"); $(this).remove(); }
								}});	
		
	$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
	
	$("#gtBoxTt").on("change", function() {									// Handle change in text field (return)
		callback($(this).val()); 											// Run callback
		$("#alertBoxDiv").remove(); 										// Kill dialog
		});
}

QDraw.prototype.Dialog=function (title, content, width, callback, callback2) // DIALOG BOX
{
	$("#dialogDiv").remove();											// Remove any old ones
	$("body").append("<div class='unselectable' id='dialogDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#dialogDiv").append(str);	
	$("#dialogDiv").dialog({ width:width, buttons: {
				            	"OK": 		function() { Sound("click"); if (callback)
				            								callback(); 
				            								$(this).remove();  
				            								},
				            	"Cancel":  	function() { Sound("delete"); if (callback2)	            		
				            								callback2();
				            								$(this).remove(); }
								}});	
	$("#dialogDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
}

QDraw.prototype.ConfirmBox=function(content, callback)					// CONFIRMATION BOX
{
	$("body").append("<div class='unselectable' id='confirmBoxDiv'></div>");														
	var str="<p><img src='images/qlogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>Are you sure?</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#confirmBoxDiv").append(str);	
	$("#confirmBoxDiv").dialog({ width:400, buttons: {
				            	"Yes": function() { Sound("click"); $(this).remove(); callback() },
				            	"No":  function() { Sound("delete"); $(this).remove(); }
								}});	
	Sound("ding");															
	$("#confirmBoxDiv").dialog("option","position",{ my:"center", at:"center", of:this.parent });
}