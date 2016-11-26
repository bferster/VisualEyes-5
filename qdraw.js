////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW.JS 
// Drawing tool
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function QDraw(dockSide, dockPos, parent)									// CONSTRUCTOR
{
	var _this=this;																// Save context
	parent=parent ? parent : "body";											// If a parent div spec'd use it
	if (parent != "body")  parent="#"+parent;									// Add #
	this.parent=parent;		this.dockSide=dockSide;	this.dockPos=dockPos;		// Save settings
	this.curUndo=0;			this.curRedo=0;										// Undo/redo
	this.curCol="#e6550d";	this.curEwid=1;		this.curEcol="#000000";			// Default settings
	this.curEtip=0;			this.curShape=0;	this.curAlpha=100;
	this.curTsiz=24;		this.curTdrop=0;	this.curTsty=0;		this.curTfon=0;		
	
	var str="<div id='pamenu' class='pa-main unselectable'>";					// Main shell
	str+="<div id='pacoldot' class='pa-dot unselectable'>";						// Color dot
	$(parent).append(str);														// Add to DOM														

	var ops={id:"qdraw",x:330,y:334,wid:150,ang:45,slices:[]};
	ops.dial="img/piback.png";													// Dial background
	ops.hilite="img/philite.png";												// Slice highlight
	ops.slices[0]={ type:"but", ico:"img/gear-icon.png" };						// Center 
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol };	// Color slice 
	ops.slices[2]={ type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curEtip };	// Edge 
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:100 };			// Alpha slice 
	ops.slices[4]={ type:"men", ico:"img/redo-icon.png", options:["Redo"]};		// Redo slice 
	ops.slices[5]={ type:"men", ico:"img/undo-icon.png",options:["Undo"]};		// Undo slice 
	ops.slices[6]={ type:"men", ico:"img/save-icon.png", options:["Save","Load","Clear"]};	// Save slice 
	ops.slices[7]={ type:"but", ico:"img/gear-icon.png" };						// Center 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/curve-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;
	this.pie=new PieMenu(ops,this);												// Init pie menu
	this.DrawMenu();															// Draw it
	
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
			_this.pie.ops.sx=x;		_this.pie.ops.sy=y;							// Start point
			_this.pie.ShowPieMenu(!_this.pie.active);							// Toggle
			_this.DrawMenu();	
			});
	
	$(parent).on("mousedown",function(e) { 										// CLICK ON BACKGROUND
		if (e.target.id == "containerDiv")	{									// If on background
			_this.pie.ShowPieMenu(false);										// Hide it
			_this.DrawMenu();	
			}
		}); 
}

QDraw.prototype.DrawMenu=function()											// SHOW DRAWING TOOL MENU
{
	var col=this.curCol;														// Set color
	var icons=["point","line","curve","box","circle","text"];					// Names of icons
	var x=$(this.parent).position().left+$(this.parent).width()-50;				// Right side
	var y=$(this.parent).position().top+$(this.parent).height()-50;				// Bottom side
	if (!col || (col == "None"))												// If a null color
		col="transparent";														// Make transparent
	$("#pacoldot").css({"background":col+" url('img/"+icons[this.curShape]+"-icon.png') no-repeat center center" });
	$("#pacoldot").css({"background-size":"20px 20px","opacity":this.curAlpha/100});// Size it
	
	col=(this.curEcol == "None") ? this.curCol : this.curEcol					// Set edge
	$("#pacoldot").css({"border":"2px solid "+col} );							// Edge color
	
	if (this.pie.active) 														// If pie menu is visible
		$("#pamenu").css({"border-radius":"100px"});							// Make it round
	else{																		// Pie hidden
		if (this.dockSide == "left")
			$("#pamenu").css({"border-radius":"0px","left":"0px",
				"border-top-right-radius":"100px",
				"border-bottom-right-radius":"100px"
				});								
		else if (this.dockSide == "right")
			$("#pamenu").css({"border-radius":"0px","left":x+"px",
				"border-top-left-radius":"100px",
				"border-bottom-left-radius":"100px"
				});								
		else if (this.dockSide == "top")
			$("#pamenu").css({"border-radius":"0px","top":"0px",
				"border-bottom-left-radius":"100px",
				"border-bottom-right-radius":"100px"
				});								
		else if (this.dockSide == "bottom")
			$("#pamenu").css({"border-radius":"0px","top":y+"px",
				"border-top-left-radius":"100px",
				"border-top-right-radius":"100px"
				});								
		$("#pamenu").css({"top":this.dockPos+"%"});
		this.pie.sx=$("#pamenu").position().left;
		this.pie.sy=$("#pamenu").position().top;
	}
}

QDraw.prototype.HandleMessage=function(msg)									// REACT TO DRAW EVENT
{
	var vv,v=msg.split("|");													// Split into parts
	if ((v[1] == "qdraw") && (v[0] == "click")) {								// A click in main menu
		if (v[2] == 8) {														// Setting shape
			if (v[3] == 5)														// If text
				this.pie.SetSlice(2,{type:"edg", ico:"img/font-icon.png", def:this.curCol+","+this.curTsiz+","+this.curTsty+","+this.curTfon+","+this.curTdrop});// Text menu 
			else																// If shape
				this.pie.SetSlice(2,{type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curEtip});	// Edge menu
			}
		if (v[2])																// If not center
			this.pie.ops.slices[v[2]].def=v[3];									// Set new default
		if (v[3])
			vv=v[3].split(",");													// Split into sub parts
		switch(v[2]-0) {														// Route on slice
			case 1:																// Color
				this.curCol=vv[0];												// Set color
				break;
			case 2:																// Edge or text styling 
				if (this.curShape == 5) {										// If text
					this.curCol=vv[0];											// Set color
					this.curTsiz=vv[1];											// Set size
					this.curTsty=vv[2];											// Set style
					this.curTfon=vv[3];											// Set font
					this.curTdrop=vv[4];										// Set drop 
					}
				else{															// Edge													
					this.curEcol=vv[0];											// Set color
					this.curEwid=vv[1];											// Set width
					this.curEtip=vv[2];											// Set width
					}
				break;
			case 3:																// Alpha
				this.curAlpha=vv[0];											// Set alpha
				break;
			case 4:																// Redo
				this.ReDo();													// Do it
				break;
			case 5:																// Undo
				this.UnDo();													// Undo it
				break;
			case 8:																// Shape
				this.curShape=vv[0];											// Set shape
this.Do();
				break;
			}
		this.DrawMenu();														// Redraw menu
		}
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO / REDO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.Do=function()												// SAVE DRAWING IN SESSION STORAGE
{
	var o={};
var data={test:123};	
	o.date=new Date().toString().substr(0,21);									// Get date
	o.script=JSON.stringify(data);												// Stringify
	sessionStorage.setItem("do-"+sessionStorage.length,JSON.stringify(o));		// Add new do												
	this.curUndo++;																// Something to undo
	trace("do",data,this.curUndo);
}
	
QDraw.prototype.UnDo=function(msg)											// GET DRAWING FROM SESSION STORAGE
{
	if (!this.curUndo)															// Nothing to undo
		return;																	// Quit
	var key=sessionStorage.key(this.curUndo);									// Get key for undo
	var o=$.parseJSON(sessionStorage.getItem(key));								// Get undo from local storage
	var data=$.parseJSON(o.script);												// Get data
	Sound("delete");															// Delete
	this.curUndo--;																// One less to undo
	trace("do",data,this.curUndo);
}

QDraw.prototype.ReDo=function(msg)											// REDO DRAWING FROM UNDO
{
	if (!this.curRedo)															// Nothing to redo
		return;																	// Quit
	var key=sessionStorage.key(this.curRedo);									// Get key for undo
	var o=$.parseJSON(sessionStorage.getItem(key));								// Get undo from local storage
	var data=$.parseJSON(o.script);												// Get data
	Sound("click");																// Click
	trace("redo",data,this.curRedo);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DRAWING GUTS 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function SHIVA_Draw(container, hidePalette) 							// CONSTRUCTOR
{
	this.container=container;
	this.color="-1";
	this.clipboard=new Array();
	this.edgeColor="#0000ff";
	this.textColor="#000000";
	this.boxColor="-1";
	this.edgeWidth="30";
	this.arrow=false;
	this.alpha=100;
	this.curTool=0;
	this.imageURL="";
	this.imageWid=400;
	this.textAlign="Left";
	this.textStyle="";
	this.textSize=0;
	this.ideaShape="Round box";
	this.ideaGradient=true;
	this.ideaBold=false;
	this.ideaBackCol="#FFF2CC";
	this.ideaEdgeCol="#999999";
	this.ideaTextCol="#000000";
	this.selectedItems=new Array();
	this.selectedDot=-1;													
	this.segs=new Array();
	this.closeOnMouseUp=false;												// Flag to close seg after drag-drawing
	this.curSeg=-1;															// Currently active segment
	this.lastDotTime=0;														// Last time a dot was added
	this.snap=false;														// Grid snap off
	this.curve=false;														// Straight lines
	this.snapSpan=20;														// Grid spacing
	this.leftClick=false;													// Hold left button status
	this.lastX=0;		this.lastY=0;										// Last cursor mouse down
	drObj=shivaLib.dr=this;													// Set SHIVA_Show pointer
	$("#shivaDrawDiv").css("cursor","crosshair");							// Crosshair cursor
	$("#shivaDrawDiv").mouseup(this.onMouseUp);								// Mouseup listener
	$("#shivaDrawDiv").mousedown(this.onMouseDown);							// Mousedown listener
	$("#shivaDrawDiv").mousemove(this.onMouseMove);							// Mousemovelistener
	document.onkeyup=this.onKeyUp;											// Keyup listener
	document.onkeydown=this.onKeyDown;										// Keydown listener
}


SHIVA_Draw.prototype.Clear=function() 									//	CLEAR DRAWING
{
	shivaLib.overlay=[];													// Clear data from memory
	this.segs=[];															// Clear list
	$("#shivaDrawDiv").html("");											// Clear draw div
}

SHIVA_Draw.prototype.SetShivaText=function(text, num)					// TEXT CHANGE HANDLER
{
	this.segs[num].text=text;												// Set new val
}

SHIVA_Draw.prototype.SaveDrawData=function(json) 						// SAVE DRAWING AS ITEM LIST
{
	var i,o,key,str="",str1;
	for (i=0;i<this.segs.length;++i) {										// For each seg
		o=this.segs[i];														// Point at it
		if (json)															// If saving as JSON
			str+="\t\"draw-"+(i+1)+"\":\"";									// Header
		else																// As a query string
			str+="&draw-"+(i+1)+"=";										// Header
		for (key in o) {													// For each object
			str1=String(o[key]);											// Get val as string
			if (str1) 														// If a value
				str+=key+":"+str1.replace(/\n/g,"|").replace(/\r/g,"").replace(/\:/g,"`").replace(/#/g,"~")+";";	// Replace special chars and add
			}
		str=str.substring(0,str.length-1);									// Lop of space
		if (json)															// If saving as JSON
			str+="\",\n";													// Add ",LF
		}
	return str;																// Return added elements
}

SHIVA_Draw.prototype.SaveSVGData=function() 							// SAVE DRAWING AS SVG
{
	var i,j,o,x,y,e;
	var w=$("#shivaDrawDiv").width();										// Container wid
	var h=$("#shivaDrawDiv").height();										// Container hht
	var str="<svg width='100%' height='100%' viewBox='0 0 "+w+" "+h+"'>\n";	// Header
	for (i=0;i<drObj.segs.length;++i) {										// For each seg
		o=drObj.segs[i];													// Point at it
		e=Math.max((o.edgeWidth/10),.5);									// Edge is .5-10							 															
		if (o.type == 0) {													// Line
			if (o.arrow) {													// If an arrow tip												
				var aa=Math.atan2(o.y[n]-o.y[n-1],o.x[n]-o.x[n-1]);			// Angle of line
				var xx=[],yy=[];											// Arrow arrays
				var n=o.x.length-1;											// Last point
				var aa=Math.atan2(o.y[n]-o.y[n-1],o.x[n]-o.x[n-1]);			// Angle of line
				var hh=o.edgeWidth/2;										// Set size
				xx[0]=o.x[n]-hh*Math.cos(aa-Math.PI/6),
				yy[0]=o.y[n]-hh*Math.sin(aa-Math.PI/6);			
	 			xx[1]=o.x[n];	yy[1]=o.y[n];								// Tip point
				xx[2]=o.x[n]-hh*Math.cos(aa+Math.PI/6),
				yy[2]=o.y[n]-hh*Math.sin(aa+Math.PI/6);			
				o.x[n]=((xx[2]-xx[0])/2)+xx[0];								// Mid x
				o.y[n]=((yy[2]-yy[0])/2)+yy[0];								// Mid y
				}
			str+="<path style='fill:";										// Start
			if (o.color != -1)	str+=o.color+";";							// Fill color
			else				str+="none;"								// No fill
			if (o.edgeColor != -1)	 {										// If an edge
				str+="stroke:"+o.edgeColor;									// Edge color
				str+=";stroke-width:"+e+";";								// Edge width
				}
			str+="opacity:"+(o.alpha/100)+"' d='M";							// Alpha								
			str+=o.x[0]+",";												// Pos x
			str+=o.y[0]+" ";												// Pos y
			
			if (o.curve) {
				var open=true;
				if ((Math.abs(o.x[0]-o.x[o.x.length-1]) < 3) && (Math.abs(o.y[0]-o.y[o.y.length-1]) < 3)) {
					o.x[x.length-1]=o.x[0];
					o.y[y.length-1]=o.y[0];
					open=false;
					}
				x=o.x[0]-0+((o.x[1]-o.x[0])/2)-0;
				y=o.y[0]-0+((o.y[1]-o.y[0])/2)-0;
				if (open) {
					str+="L"+x+",";											// Pos x
					str+=y+" ";												// Pos y
			 		}			
				for (j=1;j<o.x.length-1;++j) {								// For each coord
					x=o.x[j]-0+((o.x[j+1]-o.x[j])/2)-0;						// Mid x										
					y=o.y[j]-0+((o.y[j+1]-o.y[j])/2)-0;						// Mid y										
					str+="Q";												// Line to
					str+=o.x[j]+",";										// Pos x
					str+=o.y[j]+" ";										// Pos y
					str+=x+",";												// Control x
					str+=y+" ";												// Control y
					}
				if (open) {
					str+="L"+o.x[j]+",";									// Pos x
					str+=o.y[j]+" ";										// Pos y
			 		}			
				}
			else{
				for (j=1;j<o.x.length;++j) {								// For each coord
					str+="L";												// Line to
					str+=o.x[j]+",";										// Pos x
					str+=o.y[j]+" ";										// Pos y
					}
				}
			if (o.color != -1)	str+="Z"									// If a filled polygon, close it
				str+="'/>\n";												// End rect
			if ((o.x) && (o.arrow)) {										// If line arrow
				o.x[n]=xx[1];	o.y[n]=yy[1];								// Restore last point
				str+="<path style='fill:"+o.edgeColor;						// Start
				str+=";opacity:"+(o.alpha/100)+"' d='M";					// Alpha								
				str+=xx[0];													// Start x				
				str+=","+yy[0]; 											// Start y
	 			str+=" L"+xx[1]+",";										// Tip x
	 			str+=yy[1];													// Tip y
				str+=" L"+xx[2]; 											// End x
				str+=","+yy[2];												// End y	
	 			str+=" Z'/>\n";												// End arrow
				}
			}
		else if (o.type == 1) {												// Box
			x=Math.abs(o.x[1]-o.x[0]);										// Calc wid
			str+="<circle r='"+x+"' ";										// Size
			x=o.x[0];														// Pos x
			y=o.y[0];														// Pos y
			str+="cx='"+x+"' cy='"+y+"' style='fill:";						// Pos
			if (o.color != -1)	str+=o.color+";";							// Fill color
			else				str+="none;"								// No fill
			if (o.edgeColor != -1)	 {										// If an edge
				str+="stroke:"+o.edgeColor;									// Edge color
				str+=";stroke-width:"+e+";";								// Edge width
				}
			str+="opacity:"+(o.alpha/100)+"'";								// Alpha								
			str+="/>\n";													// End rect
			}
		else if (o.type == 2) {												// Box
			x=Math.abs(o.x[1]-o.x[0]);										// Calc wid
			y=Math.abs(o.y[1]-o.y[0]);										// Hgt
			str+="<rect width='"+x+"' height='"+y+"' ";						// Size
			x=o.x[0];														// Pos x
			y=o.y[0];														// Pos y
			str+="x='"+x+"' y='"+y+"' style='fill:";						// Pos
			if (o.color != -1)	str+=o.color+";";							// Fill color
			else				str+="none;"								// No fill
			if (o.edgeColor != -1)	 {										// If an edge
				str+="stroke:"+o.edgeColor;									// Edge color
				str+=";stroke-width:"+e+";";								// Edge width
				}
			str+="opacity:"+(o.alpha/100)+"'";								// Alpha								
			if (o.curve)	str+=" rx='10' ry='10'";						// Round box
			str+="/>\n";													// End rect
			}
		else if (o.type == 3) {												// Text
			var th=(o.textSize/2)-0+10;										// Text size							 															
			if (o.boxColor != -1) {											// If a box
				x=Math.abs(o.x[1]-o.x[0]);									// Calc wid
				y=Math.abs(o.y[1]-o.y[0]);									// Hgt
				str+="<rect width='"+x+"' height='"+y+"' ";					// Size
				x=o.x[0];													// Pos x
				y=o.y[0];													// Pos y
				str+="x='"+x+"' y='"+y+"' style='fill:"+o.boxColor;			// Pos
				str+=";opacity:"+(o.alpha/100)+"'";							// Alpha								
				if (o.curve)	str+=" rx='10' ry='10'";					// Round box
				str+="/>\n";												// End rect
				}
			x=o.x[0]+10;													// Assume left
			e="start";
			if (o.textAlign == "Right")		x=o.x[1]-10,e="end";			// Right
			if (o.textAlign == "Center")	x=o.x[0]-0+Math.abs(o.x[1]-o.x[0])/2,e="middle";	// Center
			x=x;															// Pos x
			y=((o.y[0])+th+1);												// Pos y
			str+="<text x='"+x+"' y='"+y+"' ";								// Text pos
			str+="style='opacity:"+(o.alpha/100);							// Alpha
			str+=";text-anchor:"+e+";fill:"+o.textColor;					// Anchor / color
			str+=";font-family:sans-serif;font-size:"+th+"'>";				// Style							
			str+=o.text;													// String
			str+="</text>\n";												// End text
			}
		else if (o.type == 4) {												// Image
			x=Math.abs(o.x[1]-o.x[0]);										// Calc wid
			y=Math.abs(o.y[1]-o.y[0]);										// Hgt
			str+="<image width='"+x+"' height='"+y+"' ";					// Size
			x=o.x[0];														// Pos x
			y=o.y[0];														// Pos y
			str+="x='"+x+"' y='"+y+"' style='";								// Pos
			str+="opacity:"+(o.alpha/100)+"'";								// Alpha								
			str+=" xlink:href='"+o.imageURL+"'";							// Round box
			str+="/>\n";													// End image
			if (o.edgeColor != -1) {										// If a box
				x=Math.abs(o.x[1]-o.x[0]);									// Calc wid
				y=Math.abs(o.y[1]-o.y[0]);									// Hgt
				str+="<rect width='"+x+"' height='"+y+"' ";					// Size
				x=o.x[0];													// Pos x
				y=o.y[0];													// Pos y
				str+="x='"+x+"' y='"+y+"' style='";							// Pos
				str+="fill:none;stroke:"+o.edgeColor;						// Edge color
				str+=";stroke-width:"+e+";";								// Edge width
				str+=";opacity:"+(o.alpha/100)+"'";							// Alpha								
				str+="/>\n";												// End rect
				}
			}
		}
	str+="</g></svg>";														// Close svg
	return str;
}

SHIVA_Draw.prototype.DrawWireframes=function(clear) 					// DRAW OVERLAY
{
	var o,i,col,scol;
	if (clear)																// If clearing canvas
		this.ctx.clearRect(0,0,1000,1000);									// Erase
	for (i=0;i<this.segs.length;++i)	{									// For each seg
		col="#777";															// Black border
		for (j=0;j<this.selectedItems.length;++j)							// For each selected element
			if (this.selectedItems[j] == i) {								// A match
				col="#ff0000";												// Red border
				break;														// Quit
				}
		o=this.segs[i];														// Point at seg
		if ((o.type == 5) || (!o.x))										// If an idea map node or no x's
			continue;														// Skip it
		if (o.type == 3) 													// Text
			shivaLib.g.DrawBar(this.ctx,-1,1,o.x[0],o.y[0],o.x[1],o.y[1],col,1);// Draw bar
		for (j=0;j<o.x.length;++j)	{										// For each point
			scol="#fff";													// Hollow marker
			if ((this.selectedDot == j) && (col == "#ff0000"))				// If this is the selected dot
				scol=col;													// Make it solid		
			shivaLib.g.DrawCircle(this.ctx,scol,1,o.x[j],o.y[j],4,col,1);	// Draw marker
			}
		}
}

SHIVA_Draw.prototype.AddDot=function(x,y,up) 							// ADD DOT
{
	var o;
	if (this.curSeg == -1) {												// If not adding to an existing seg
		if (this.curTool && up)												// 2 point elements on mouseUp
			return;															// Start new segment only on up
		if (new Date().getTime()-this.lastDotTime < 100)					// If  too close to last click
			return;															// Quit
		o=new Object;														// Make a new one
		o.type=this.curTool;												// Set type
		o.x=new Array();													// Hold x coords
		o.y=new Array();													// y
		o.alpha=this.alpha;													// Alpha
		o.curve=this.curve;													// Curved path?
		if (o.type < 3) {													// Line/Box/Cir
			o.color=this.color;												// Set color from property menu
			o.edgeColor=this.edgeColor;										// Edge color
			o.edgeWidth=this.edgeWidth;										// Width
			o.arrow=this.arrow;												// Arrow?
			}
		if (o.type == 3) {													// Text
			o.boxColor=this.boxColor;										// Box color
			o.textColor=this.textColor;										// Text color
			o.textAlign=this.textAlign;										// Text align
			o.textSize=this.textSize;										// Text size
			o.text="Click to edit";											// Text
			}
		if (o.type == 4) {													// Image
			o.edgeColor=this.edgeColor;										// Edge color
			o.edgeWidth=this.edgeWidth;										// Edge width
			o.imageURL=this.imageURL;										// URL
			}
		o.x.push(x);	o.y.push(y);										// Add XY
		this.lastX=x;	this.lastY=y;										// Save last XY
		this.segs.push(o);													// Add seg to array
		this.curSeg=this.segs.length-1;										// Point last seg in array
		this.lastDotTime=new Date().getTime();								// Save time
		return;
		}
	if (this.curTool == 0) {
		this.segs[this.curSeg].x.push(x);									// Add Y
		this.segs[this.curSeg].y.push(y);									// Add Y
		this.lastX=x;	this.lastY=y;										// Save last XY
		this.lastDotTime=new Date().getTime();								// Save time
		}
	else{
		if ((Math.abs(this.lastX-x) < 2) && (Math.abs(this.lastX-x) < 2)) {	// No drag
			$("#shtx"+this.curSeg).remove();								// Delete text box, if any
			this.segs.pop(0);												// Remove seg
			this.curSeg=-1;													// Stop to this seg	
			}
		else{
			o=this.segs[this.curSeg];										// Point at seg
			if (this.curTool == 3) {										// If a text box
				x=Math.max(x,o.x[o.x.length-1]+100);						// Min 100 pix
				y=Math.max(y,o.y[o.y.length-1]+40);							// Min 40 pix	
				}			
			o.x.push(x);													// Add x
			o.y.push(y);													// Add y
			this.curSeg=-1;													// Stop to this seg	
			}
		}
	this.DrawOverlay();														// Redraw
}	
	
SHIVA_Draw.prototype.SetVal=function(prop, val) 						//	SET VALUE
{
	if ((""+prop).match(/olor/)) {											// If a color
		if ((""+val).match(/none/))											// If none
			val=-1;															// val = -1
		if ((val != -1) && (!(""+val).match(/#/)))							// No #
			val="#"+val;													// Add it
		}
	var num=this.curSeg;													// Get index
	this[prop]=val;															// Set property
	if ((this.curTool < 3) && (num != -1)) {								// If in polygon, cir, or bar
		this.segs[num].curve=this.curve;									// Set prop
		this.segs[num].arrow=this.arrow;									// Set prop
		this.segs[num].edgeColor=this.edgeColor;							// of each
		this.segs[num].edgeWidth=this.edgeWidth;							// from 
		this.segs[num].alpha=this.alpha;									// property
		this.segs[num].color=this.color;									
		this.DrawOverlay();													// Draw segments
		}
	if ((this.curTool == 3) && (num != -1)) {								// A text
		this.segs[num].curve=this.curve;									// Set prop
		this.segs[num].boxColor=this.boxColor;								// op
		this.segs[num].textSize=this.textSize;								// each
		this.segs[num].textColor=this.textColor;							// property
		this.segs[num].textAlign=this.textAlign;							// from
		this.segs[num].alpha=this.alpha;									// property
		}
	if ((this.curTool == 4) && (num != -1)) {								// Image
		this.segs[num].edgeColor=this.edgeColor;							// Set prop
		this.segs[num].edgeWidth=this.edgeWidth;							// from 
		this.segs[num].alpha=this.alpha;									// each
		this.segs[num].imageURL=this.imageURL;								// property
		}
	else if (this.curTool == 5) {											// If in edit
		for (var i=0;i<this.selectedItems.length;++i)  {					// For each selected seg
			num=this.selectedItems[i];										// Get index
			this.segs[num].alpha=this.alpha;								// property
			this.segs[num].curve=this.curve;								// property
			if (this.segs[num].type < 3) {									// Line, cir, box
				this.segs[num].color=this.color;							// Set prop
				this.segs[num].edgeColor=this.edgeColor;					// of each
				this.segs[num].edgeWidth=this.edgeWidth;					// from 
				this.segs[num].arrow=this.arrow;							// property
				}
			else if (this.segs[num].type == 3) {							// Text
				this.segs[num].boxColor=this.boxColor;							
				this.segs[num].textColor=this.textColor;							
				this.segs[num].textAlign=this.textAlign;							
				this.segs[num].textSize=this.textSize;							
				}
			else if (this.segs[num].type == 4) {							// Image
				this.segs[num].edgeColor=this.edgeColor;					// Set prop
				this.segs[num].edgeWidth=this.edgeWidth;					// from 
				this.segs[num].alpha=this.alpha;							// each
				this.segs[num].imageURL=this.imageURL;						// property
				}
			}
		this.DrawOverlay();													// Draw segments
		this.DrawWireframes(false);											// Draw wireframes
		}
	else if (this.curTool == 6) {											// If in idea map
		for (var i=0;i<this.selectedItems.length;++i)  {					// For each selected seg
			num=this.selectedItems[i];										// Get index
			this.segs[num].ideaBackCol=this.ideaBackCol;					// Set prop
			this.segs[num].ideaEdgeCol=this.ideaEdgeCol;					// Set prop
			this.segs[num].ideaTextCol=this.ideaTextCol;					// Set prop
			this.segs[num].ideaGradient=this.ideaGradient;					// Set prop
			this.segs[num].ideaBold=this.ideaBold;							// Set prop
			this.segs[num].ideaShape=this.ideaShape;						// Set prop
			}
		this.DrawOverlay();													// Draw idea map
		}
	}

SHIVA_Draw.prototype.onMouseUp=function(e)								// MOUSE UP HANDLER
{
	if ($("#shivaDrawPaletteDiv").length == 0) 								// If no palette
		return true;														// Quit
	if (drObj.curTool == 5) 												// In edit
		e.stopPropagation();												// Trap event
	drObj.leftClick=false;													// Left button up
	var x=e.pageX-this.offsetLeft;											// Offset X from page
	var y=e.pageY-this.offsetTop;											// Y
	if (e.shiftKey) {														// Shift key forces perpendicular lines
		if (Math.abs(x-drObj.lastX) > Math.abs(y-drObj.lastY))				// If mainly vertical
			y=drObj.lastY;													// Hold y
		else																// Mainly horizontal
			x=drObj.lastX;													// Hold x
		}
	if (drObj.closeOnMouseUp) {												// After a drag-draw
		drObj.closeOnMouseUp=false;											// Reset flag
		drObj.curSeg=-1;													// Close segment
		return true;														// Quit
		}
	if (drObj.curTool < 5 ) {												// Not in edit
		if (drObj.snap)														// If snapping
			x=x-(x%drObj.snapSpan),y=y-(y%drObj.snapSpan);					// Mod down coords
		if ((drObj.curTool) && (e.target.id.indexOf("shtx") == -1))			// Not in line or over text
			drObj.AddDot(x,y,true);											// Add coord
		}
	else if (drObj.curTool > 4) 											// If in edit/idea map
		drObj.AddSelect(x,y,e.shiftKey);									// Select seg/dot
	return (drObj.curTool == 6);											// Set propagation
}

SHIVA_Draw.prototype.onMouseDown=function(e)							// MOUSE DOWN HANDLER
{
	if ($("#shivaDrawPaletteDiv").length == 0) 								// If no palette
		return;																// Quit
	if (drObj.curTool == 6) 												// If in idea
		return true;														// Quit
	var x=e.pageX-this.offsetLeft;											// Offset X from page
	var y=e.pageY-this.offsetTop;											// Y
	drObj.leftClick=true;													// Left button down
	drObj.closeOnMouseUp=false;												// Reset flag
	if (drObj.snap)															// If snapping
		x=x-(x%drObj.snapSpan),y=y-(y%drObj.snapSpan);						// Mod down coords
	if (drObj.curTool == 5) {												// In edit mode
		drObj.lastX=x;														// Save last X
		drObj.lastY=y;														// Y
		e.stopPropagation();												// Trap event
		return false;														// Quit
		}
	if (e.target.id.indexOf("shtx") != -1)									// If over text box
		return;																// Quit
	if (drObj.snap)															// If snapping
		x=x-(x%drObj.snapSpan),y=y-(y%drObj.snapSpan);						// Mod down coords
	drObj.AddDot(x,y,false);												// Add coord
	return false;															// Stop propagation
}

SHIVA_Draw.prototype.onMouseMove=function(e)							// MOUSE MOVE HANDLER
{
	if ($("#shivaDrawPaletteDiv").length == 0) 								// If no palette
		return;																// Quit
	if ((drObj.curTool == 6) || (drObj.curTool == -1)) 						// If in idea or off
		return;																// Quit
	var x=e.pageX-this.offsetLeft;											// Offset X from page
	var y=e.pageY-this.offsetTop;											// Y
	if (drObj.snap)															// If snapping
		x=x-(x%drObj.snapSpan),y=y-(y%drObj.snapSpan);						// Mod down coords
	if ((drObj.leftClick) && (drObj.curTool == 5)) {						// If dragging seg in edit
		var dx=drObj.lastX-x;												// Delta x
		var dy=drObj.lastY-y;												// Y
		drObj.MoveSegs(dx,dy,0);											// Move selected segs	
		drObj.lastX=x;														// Save last X
		drObj.lastY=y;														// Y
		return;																// Quit
		}
	if (drObj.curSeg != -1) {												// If drawing
		if (drObj.curTool != 5) 											// If not in edit mode
			drObj.DrawOverlay();											// Draw overlay	
		if (e.shiftKey) {													// Shift key forces perpendicular lines
			if (Math.abs(x-drObj.lastX) > Math.abs(y-drObj.lastY))			// If mainly vertical
				y=drObj.lastY;												// Hold y
			else															// Mainly horizontal
				x=drObj.lastX;												// Hold x
			}
		if (drObj.curTool == 0)												// Polygon
			shivaLib.g.DrawLine(drObj.ctx,"#000",1,drObj.lastX,drObj.lastY,x,y,1); // Rubber line
		else if ((drObj.leftClick) && (drObj.curTool == 1))					// Circle
			shivaLib.g.DrawCircle(drObj.ctx,-1,1,drObj.lastX,drObj.lastY,Math.abs(x-drObj.lastX),"#999",1);	// Rubber circle
		else if ((drObj.leftClick) && (drObj.curTool < 5))					// Box, text, image
			shivaLib.g.DrawBar(drObj.ctx,-1,1,drObj.lastX,drObj.lastY,x,y,"#999",1); // Rubber box
		if ((drObj.leftClick) && (drObj.curTool == 0)){ 					// If dragging to draw
			if (new Date().getTime()-drObj.lastDotTime > 100)	{			// If not too close to last one
				drObj.AddDot(x,y);											// Add coord
				drObj.closeOnMouseUp=true;									// Close seg on mouse up
				}
			}
		}
}


SHIVA_Draw.prototype.onKeyDown=function(e)								// KEY DOWN HANDLER
{
	if ($("#shivaDrawPaletteDiv").length == 0) 								// If no palette
		return;																// Quit
	if ((e.keyCode == 8) &&													// Look for Del key
        (e.target.tagName != "TEXTAREA") && 								// In text area
        (e.target.tagName != "INPUT")) { 									// or input
		e.stopPropagation();												// Trap it
     	return false;
    }
}

SHIVA_Draw.prototype.onKeyUp=function(e)								// KEY UP HANDLER
{
	if ($("#shivaDrawPaletteDiv").length == 0) 								// If no palette
		return;																// Quit
	if ((e.which == 83) && (e.ctrlKey) && (e.altKey)) {						// CTRL+ALT+S
		shivaLib.SaveData("eStore");										// Open eStore dialog	
		return;																// Quit
		}
	var i;
	if ((e.target.tagName == "TEXTAREA") || (e.target.tagName == "INPUT"))	// If in text entry
		return;																// Quit
	if ((e.which == 67) && (e.ctrlKey))	{									// Copy
		if (drObj.selectedItems.length) {									// If something selected
			drObj.Sound("click");											// Play sound
			drObj.clipboard=[];												// Clear clipboard
			}	
		for (i=0;i<drObj.selectedItems.length;++i) 					
			drObj.clipboard.push(shivaLib.Clone(drObj.segs[drObj.selectedItems[i]]));
		}
	if ((e.which == 86) && (e.ctrlKey))	{									// Paste
		if (drObj.clipboard.length) {										// If something in clipboard
			drObj.selectedItems=[];											// Clear selects
			drObj.Sound("ding");											// Play sound
			for (i=0;i<drObj.clipboard.length;++i) {						// For each seg in clipboard				
				drObj.selectedItems.push(drObj.segs.length);				// Add to selects
				drObj.segs.push(shivaLib.Clone(drObj.clipboard[i])); 		// Add seg
				}
			}
		}	


	if (drObj.curTool == 6) {												// In idea mode
		num=drObj.selectedItems[0];											// Point at 1st select
		if (((e.which == 8) || (e.which == 46)) && (num != -1)) 			// If DEL and an active n
			drObj.DeleteIdea();												// Delete it
		}
	var num=drObj.curSeg;													// Point at currently drawn seg
	if (((e.which == 8) || (e.which == 46)) && (num != -1)) {				// If DEL and an active seg
		var o=drObj.segs[num];												// Point at seg
		o.x.pop();		o.y.pop();											// Delete last dot xy
		drObj.lastX=o.x[o.x.length-1];										// Set last x to end point
		drObj.lastY=o.y[o.y.length-1];										// Set last y to end point
		drObj.DrawOverlay();												// Redraw	
		drObj.Sound("delete");												// Play sound
		}
	if ((e.which == 27) && (num != -1))	{									// If ESC and an active seg
		drObj.curSeg=-1;													// End current seg, if open
		drObj.Sound("dclick");												// Play sound
		}
	else if (drObj.curTool == 5) {											// In edit mode
		if ((e.which == 8) || (e.which == 46)) {							// If DEL 
			if (drObj.selectedItems.length) {								// If DEL and some selected segs
				num=drObj.selectedItems[0];									// Point at 1st select
				if ((drObj.selectedDot != -1) && (drObj.segs[num].type == 0)) { // If a dot selected on a polygon
					drObj.segs[num].x.splice(drObj.selectedDot,1);			// Remove x dot
					drObj.segs[num].y.splice(drObj.selectedDot,1);			// Y
					}
				else if (e.target.id.indexOf("shtx") == -1)					// If not over text box remove whole segments(s)
					for (var i=0;i<drObj.selectedItems.length;++i) {		// For each selected element
						$("#shtx"+drObj.selectedItems[i]).remove();			// Delete text box, if any
						$("#shim"+drObj.selectedItems[i]).remove();			// Delete image box, if any
						drObj.segs.splice(drObj.selectedItems[i],1);		// Remove seg
						}


				drObj.DrawOverlay();										// Redraw	
				drObj.DrawWireframes(false);								// Draw wireframes
				drObj.Sound("delete");										// Play sound
				}
			}
	else if ((e.which == 40) && (e.shiftKey)) drObj.MoveSegs(0,0,-1);		// SH-Up to order up
	else if ((e.which == 38) && (e.shiftKey)) drObj.MoveSegs(0,0,1);		// SH-Dn to order down
	else if (e.which == 39)  drObj.MoveSegs(-1,0,0);						// Move L 
	else if (e.which == 37)  drObj.MoveSegs(1,0,0);							// Move R
	else if (e.which == 40)  drObj.MoveSegs(0,-1,0);						// Move U 
	else if (e.which == 38)  drObj.MoveSegs(0,1,0);							// Move D 
	}
}

SHIVA_Draw.prototype.AddSelect=function(x, y, shiftKey)					// SELECT SEGMENT/DOT FROM CLICK
{
	var i,j,o,seg=-1,asp;
	var oldDot=this.selectedDot;											// Save original dot
	this.selectedDot=-1;													// No selected dot
	var last=this.selectedItems[0];											// Save selected seg
	if (x != -1) {															// If not a forcing a selection
		if (!shiftKey) {													// If shift key unpressed
			this.selectedItems=[];											// Clear all previous selects
			$("#shivaDrawDiv").css("cursor","auto");						// Default cursor
			}
		if (this.curTool == 6)	{											// If idea map
			for (i=0;i<this.segs.length;++i) {								// For each seg
				o=this.segs[i];												// Point at seg
				if (o.type != 5)											// If an idea map node
					continue;												// Skip it
				var d=$("#shivaIdea"+i);									// Div id										
				if ((x > o.ideaLeft) && (x < Number(o.ideaLeft)+Number(d.width())+16) &&	// In h
				    (y > o.ideaTop ) && (y < Number(o.ideaTop)+Number(d.height())+16)) {	// In v
					this.selectedItems.push(i);								// Add to selects
					this.ideaShape=o.ideaShape;								// Shape
					this.ideaBackCol=o.ideaBackCol;							// Back col
					this.ideaGradient=o.ideaGradient;						// Gradient
					this.ideaEdgeCol=o.ideaEdgeCol;							// Edge col
					this.ideaTextCol=o.ideaTextCol;							// Text col
					this.ideaBold=o.ideaBold;								// Bold text
					this.SetMenuProperties();								// Set menu properties
					this.selectedItems[0]=i;								// Set select
					break;
					}
				}
				this.HighlightIdea();										// Set highlight
				return;
			}
		for (i=0;i<this.segs.length;++i) {									// For each seg
			o=this.segs[i];													// Point at seg
			if ((!o.x) || (o.type == 5))									// If an idea map node or no x
				continue;													// Skip it
			for (j=0;j<o.x.length;++j) 										// For each dot in seg
				if ((x > o.x[j]-6) && (x < o.x[j]+6) && (y > o.y[j]-6) && (y < o.y[j]+6)) { // If near
					if (last == i) 											// If clicking on already selected seg 
						this.selectedDot=j;									// This is the selected dot
					seg=i;													// Got one!
					break;													// Quit looking
					}
			}
		if (seg == -1) {													// If no seg/dot selected
			for (i=0;i<this.segs.length;++i) {								// For each seg
				var minx=99999,maxx=0,miny=99999,maxy=0;					// Set limits
				o=this.segs[i];												// Point at seg
				if (o.type == 5)											// If an idea map node
					continue;												// Skip it
				if (o.type == 1) {											// A circle
					j=Math.abs(o.x[1]-o.x[0]);								// Radius
					minx=o.x[0]-j;	maxx=o.x[1];							// X
					miny=o.y[0]-j;	maxy=Number(o.y[0])+j;					// Y
					}
				else
					for (j=0;j<o.x.length;++j) {							// For each dot in seg
						minx=Math.min(minx,o.x[j]);							// Minx
						miny=Math.min(miny,o.y[j]);							// Miny
						maxx=Math.max(maxx,o.x[j]);							// Maxx
						maxy=Math.max(maxy,o.y[j]);							// Maxy
						}
				if ((x > minx) && (x < maxx) && (y > miny) && (y < maxy)) {	// If within bounds
					seg=i;													// Got one!
					break;													// Quit looking
					}
				}
			}
		}
	else																	// Forcing a select
		seg=y;																// Get it from y

	if (seg != -1) {														// If a seg/dot selected
		o=this.segs[seg];													// Point at seg
		if (this.selectedDot != -1)	{										// If a specific dot selected
			$("#shivaDrawDiv").css("cursor","crosshair");					// Crosshair cursor
			if (oldDot != this.selectedDot)									// If a new selection
				drObj.Sound("dclick");										// Double-click
			}
		else{																// Whole seg
			$("#shivaDrawDiv").css("cursor","move");						// Move cursor
			drObj.Sound("click");											// Click
			}
		this.selectedItems.push(seg);										// Add seg to selects
		this.alpha=o.alpha;													// Everyone has alpha
		this.curve=o.curve;													// Everyone has curce
		if (o.type < 3)	{													// Line, cir, box	
			this.arrow=o.arrow;												
			this.curve=o.curve;												
			this.color=o.color;							
			this.edgeColor=o.edgeColor;
			this.edgeWidth=o.edgeWidth;	
			}
		else if (o.type == 3) {												// Text		
			this.curve=o.curve;												
			this.textColor=o.textColor;
			this.boxColor=o.boxColor;
			this.textSize=o.textSize;
			this.textAlign=o.textAlign;
			}
		else if (o.type == 4) {												// Image		
			o=this.segs[seg];												// Point at seg
			asp=$("#shimi"+seg).height()/$("#shimi"+seg).width();			// Get aspect
			if (!asp)	asp=1;												// If no asp, force to 1
			if (!isNaN(asp))												// If a valid #
				o.y[1]=o.y[0]+(Math.abs(o.x[1]-o.x[0])*asp);				// Conform y to asp
			this.edgeColor=o.edgeColor;										// Edge color
			this.edgeWidth=o.edgeWidth;										// Edge with
			this.DrawOverlay();												// Draw segments
			}
		this.DrawMenu(o.type);												// Set proper menu for type
		this.SetMenuProperties();											// Set menu properties
		}
	this.DrawWireframes(false);												// Draw wireframes
}

SHIVA_Draw.prototype.MoveSegs=function(dx, dy, dz)						// MOVE SELECTED SEGS
{
	var i,j,o,oo;
	for (i=0;i<this.selectedItems.length;++i) {								// For each selected element
		o=this.segs[this.selectedItems[i]];									// Point at seg
		if (o.type == 5)													// If an idea map node
			continue;														// Skip it
		if (dz) {															// If shifting order
			if ((this.selectedItems[i]+dz < 0) || (this.selectedItems[i]+dz >= this.segs.length)) {  // If out of range
				drObj.Sound("delete");										// Delete
				continue;													// Skip
				}
			oo=this.segs[this.selectedItems[i]+dz];							// Sve dest seg
			this.segs[this.selectedItems[i]+dz]=o;							// Move to dest
			this.segs[this.selectedItems[i]]=oo;							// Copy dest to src 
			this.selectedItems[i]+=dz;										// Dest is now selected one
			drObj.Sound("click");											// Click
			}
		if (this.selectedDot != -1)											// If single dot selected
			o.x[this.selectedDot]-=dx,o.y[this.selectedDot]-=dy;			// Shift it
		else																// Whole seg
			for (j=0;j<o.x.length;++j) 										// For each dot in seg
				o.x[j]-=dx,o.y[j]-=dy;										// Shift dot
		}
	this.DrawOverlay();														// Draw segments
	this.DrawWireframes(false);												// Draw wireframes
}

