////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW.JS 
// Drawing tool
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function QDraw(horz, vert, parent)											// CONSTRUCTOR
{
	var _this=this;																// Save context
	parent=parent ? parent : "body";											// If a parent div spec'd use it
	if (parent != "body")  parent="#"+parent;									// Add #
	this.parent=parent;		this.horz=horz;		this.vert=vert;					// Save settings
	this.curCol="#e6550d";	this.curEwid=1;		this.curEcol="#000000";			// Default settings
	this.curEtip=0;			this.curShape=0;	this.curAlpha=100;
	this.curTsiz=12;		this.curTsty="B";	this.curTfon="Sans-Serif"
	var str="<div id='pamenu' class='pa-main unselectable'>";					// Main shell
	str+="<div id='pacoldot' class='pa-dot unselectable'>";						// Color dot
	$(parent).append(str);														// Add to DOM														
	this.Draw();																// Draw it

	var ops={id:"qdraw",x:330,y:334,wid:150,ang:45,slices:[]};
	ops.dial="img/piback.png";													// Dial background
	ops.hilite="img/philite.png";												// Slice highlight
	ops.slices[0]={ type:"but", ico:"img/gear-icon.png" };						// Center 
	ops.slices[1]={ type:"col", ico:"img/color-icon.png", def:this.curCol };	// Color slice 
	ops.slices[2]={ type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curEtip };	// Edge 
	ops.slices[3]={ type:"sli", ico:"img/alpha-icon.png", def:100 };			// Alpha slice 
	ops.slices[4]={ type:"but", ico:"img/redo-icon.png", close:0 };				// Redo slice 
	ops.slices[5]={ type:"but", ico:"img/undo-icon.png", close:1 };				// Undo slice 
	ops.slices[8]={ type:"ico", ico:"img/draw-icon.png", def:this.curShape };	// Blank slice 
	ops.slices[8].options=["img/point-icon.png","img/line-icon.png","img/box-icon.png","img/circle-icon.png","img/text-icon.png"] ;
	this.pie=new PieMenu(ops,this);												// Init pie menu
	
	$("#pamenu").draggable({													// Make it draggable
		 containment: "parent",
		 start:function(e,ui) {													// On start
			$(this).css({"border-radius":"100px"});								// Make into dot
			_this.pie.ShowPieMenu(false);										// Hide menu
			},
		stop:function(e,ui) {													// On stop
			var cx=$(_this.parent).width()/2;									// Center x
			_this.horz=(e.clientX < cx) ? "left" : "right";						// Snap to left or right side
			_this.vert=null;													// Set y
			_this.Draw();														// Redraw it
			Sound("click");														// Click
			}
		});

		$("#pamenu").on("click", function(e) {									// CLICK ITEM
			var x=$("#pamenu").position().left;									// Get left
			var y=$("#pamenu").position().top;									// Get top
			_this.pie.ops.x=(_this.horz == "left") ? x+60 : x-225;				// Position based on side
			_this.pie.ops.y=y-50;												// Vertical
			_this.pie.ops.sx=x;		_this.pie.ops.sy=y;							// Start point
			_this.pie.ShowPieMenu(!_this.pie.active);							// Toggle
			});
	
	$(parent).on("click",function(e) { 											// CLICK ON PALETTE
		if ((e.target.id == "padot") || (e.target.id == "pamenu"))				// If on palette itself
			_this.pie.ShowPieMenu(!$("#pimenu").width()); 						// Toggle state
		else																	// In drawing
			if ($("#pimenu").width())											// If active
				_this.pie.ShowPieMenu(false);									// Hide it
		}); 
}

QDraw.prototype.Draw=function(mode)											// SHOW DRAWING TOOL
{
	var col=this.curCol;														// Set color
	var icons=["point","line","box","circle","text"];							// Names of icons
	var x=$(this.parent).position().left+$(this.parent).width()-50;
	if (!col || (col == "None"))												// If a null color
		col="transparent";														// Make transparent
	$("#pacoldot").css({"background":col+" url('img/"+icons[this.curShape]+"-icon.png') no-repeat center center" });
	$("#pacoldot").css({"background-size":"20px 20px","opacity":this.curAlpha/100});// Size it
	
	col=(this.curEcol == "None") ? this.curCol : this.curEcol					// Set edge
	$("#pacoldot").css({"border":"2px solid "+col} );							// Edge color
	
	if (this.horz == "left")
		$("#pamenu").css({"border-radius":"0px","left":"0px",
			"border-top-right-radius":"100px",
			"border-bottom-right-radius":"100px"
			});								
	else
		$("#pamenu").css({"border-radius":"0px","left":x+"px",
			"border-top-left-radius":"100px",
			"border-bottom-left-radius":"100px"
			});								
	$("#pamenu").css({"top":this.vert+"%"});
}

QDraw.prototype.HandleMessage=function(msg)									// REACT TO DRAW EVENT
{
	var v=msg.split("|");														// Split into parts
	if ((v[1] == "qdraw") && (v[0] == "click")) {								// A click in main menu
		if ((v[2] == 8) && (v[3] == 4))											// If text
			this.pie.ops.slices[2]={ type:"txt", ico:"img/font-icon.png", def:this.curCol+","+this.curTsiz+","+this.curTsty+","+this.curTfon};// Text menu 
		else																	// If shape
			this.pie.ops.slices[2]={ type:"edg", ico:"img/edge-icon.png", def:this.curEcol+","+this.curEwid+","+this.curEtip };	// Edge menu
		if (v[2])																// If not center
			this.pie.ops.slices[v[2]].def=v[3];									// Set new default
		switch(v[2]-0) {														// Route on slice
			case 1:																// Color
				this.curCol=v[3];												// Set color
				break;
			case 2:																// Edge or text styling 
				var v=v[3].split(",");											// Get parts of setting
				if (this.curShape == 4) {										// If text
					this.curCol=v[0];											// Set color
					this.curTsiz=v[1];											// Set size
					this.curTsty=v[2];											// Set style
					this.curTfont=v[3];											// Set font
					}
				else{															// Edge													
					this.curEcol=v[0];											// Set color
					this.curEwid=v[1];											// Set width
					this.curEtip=v[2];											// Set width
					}
				break;
			case 3:																// Alpha
				this.curAlpha=v[3];												// Set alpha
				break;
			case 8:																// Shape
				this.curShape=v[3];												// Set shape
				break;
			}
		this.Draw();															// Redraw
		}
}


