////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// QDRAW2.JS 
// Drawing guts
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.GraphicsInit=function()									// INIT GRAPHICS
{
	var i;
	var _this=this;															// Context
	this.segs=[];															// Init segment list
	this.drawMode="";														// Current drawing mode
	this.NS="http://www.w3.org/2000/svg";									// Name space
	this.svg=document.createElementNS(this.NS,"svg");						// Create SVG object
  	this.svg.setAttribute("id","Q-SVG");									// ID
   	this.svg.setAttribute("width","100%");									// Width
   	this.svg.setAttribute("height","100%");									// Height
 	
 	this.svg.addEventListener("click", function(e) { 						// ON CLICK
      			if ((_this.curShape == 0) && (e.target.id == "Q-SVG"))		// If in container
				_this.DeselectSegs(),Sound("click");						// Deselect all segs
  				else if (e.target.id.substr(0,5) != "QSeg-")				// If not on seg
					_this.curShape=0;										// Pointer
			});
 
 	this.svg.addEventListener("mousemove", function(e) { 					// ON MOVE
 			var i,j,s,n,dx,dy;
 			var v=_this.drawMode.split("-");								// Get parts
  			_this.mx=e.clientX;		_this.my=e.clientY;						// Current pos
  			_this.ShowInfoBox();											// Show xy pos
  			if ((v[0] == "ds") && (v[2] == 0)) {							// If full seg drag start
				_this.Do(true);												// Save temp seg as undo
				s=_this.segs[v[1]];											// Point at seg
				dy=e.clientY-s.y[0]-_this.mouseDY;							// Delta y to move
				dx=e.clientX-s.x[0]-_this.mouseDX;							// Delta x
				for (j=0;j<_this.segs.length;++j) {							// for each selected seg
					if (!_this.segs[j].select)								// Not selected
						continue;											// Skip it
					s=_this.segs[j];										// Point at seg
					n=s.x.length;											// Length of coords
					for (i=0;i<n;++i) {										// For each coord
						s.x[i]+=dx;											// Set x pos
						s.y[i]+=dy;											// Set Y pos
						if (_this.gridSnap) {								// If snapping
							s.x[i]-=s.x[i]%_this.gridSnap;					// Snap x								
							s.y[i]-=s.y[i]%_this.gridSnap;					// Snap y								
							}			
					_this.StyleSeg(j);										// Move it
					_this.AddWireframe(j);									// Redraw select
					}
				}
			}
			else if ((v[0] == "ds") && (v[2])) {							// If point seg drag start
				_this.Do(true);												// Save tempseg as undo
				var s=_this.segs[v[1]];										// Point at seg
				var x=e.clientX, y=e.clientY;								// Get current pos
				if (_this.gridSnap) {										// If snapping
					x-=x%_this.gridSnap;									// Snap x								
					y-=y%_this.gridSnap;									// Snap y								
					}			
				if (s.type < 3) {											// Box or circle
					s.x[v[2]-1]=x;			s.y[v[2]-1]=y;					// Set pos
					}
				if ((s.type == 3) || (s.type == 4)) {						// Box or circle
					s.x[v[2]-1]=x;			s.y[v[2]-1]=y;					// Set pos
					if (e.shiftKey)	{										// If shift key is down
						var w=Math.abs(s.x[1]-s.x[0]);						// Original wid
						var h=Math.abs(s.y[2]-s.y[1]);						// Original hgt
						if (v[2] == 1)		s.y[1]=s.y[0]=s.y[2]-w,s.x[3]=s.x[0];	// TL
						else if (v[2] == 2)	s.y[0]=s.y[1]=s.y[2]-w,s.x[2]=s.x[1];	// TR
						else if (v[2] == 3)	s.y[3]=s.y[2]=s.y[1]+w,s.x[1]=s.x[2];	// BR
						else if (v[2] == 4)	s.y[2]=s.y[3]=s.y[1]+w,s.x[0]=s.x[3];	// BL
						}
					else{
						if (v[2] == 1)		s.y[1]=s.y[0],s.x[3]=s.x[0];	// TL
						else if (v[2] == 2)	s.y[0]=s.y[1],s.x[2]=s.x[1];	// TR
						else if (v[2] == 3)	s.y[3]=s.y[2],s.x[1]=s.x[2];	// BR
						else if (v[2] == 4)	s.y[2]=s.y[3],s.x[0]=s.x[3];	// BL
						}
					}
				_this.StyleSeg(v[1]);										// Move it
				_this.AddWireframe(v[1]);									// Redraw select
	 			}
 	
 			});
 	 
 		this.svg.addEventListener("mouseup", function(e) {					// ON MOUSE UP
	 		var v=_this.drawMode.split("-");								// Get parts
			_this.drawMode="de-"+v[1]+"-"+v[2];								// Set mode
			});

  	document.getElementById("containerDiv").appendChild(this.svg);			// Add to DOM
	$(this.svg).on("contextmenu", function() { return false; });			// Inhibit default right-click menu
	this.RefreshSVG();														// Refresh SVG space
	
	var c;	
 	for (i=0;i<9;i++) {
		c=i*30;
		this.segs[i]={ type:3,col:"#cccccc",ewid:1,ecol:"#990000",alpha:100,drop:0,select:false,
		x:[20+c,120+c,120+c,20+c],y:[50+c,50+c,250+c,250+c]}
		this.AddSeg(i);this.StyleSeg(i)
		}
	c+=30;
	this.segs[i]={ type:4,col:"#cccccc",ewid:1,ecol:"#000099",alpha:100,drop:0,select:false,
	x:[20+c,120+c,120+c,20+c],y:[50+c,50+c,150+c,150+c]}
	this.AddSeg(i);this.StyleSeg(i++);
	c+=30;
	this.segs[i]={ type:2,col:"#cccccc",ewid:1,ecol:"#990000",alpha:100,drop:0,select:false,
	x:[20+c,120+c,120+c],y:[50+c,50+c,250+c]}
	this.AddSeg(i);this.StyleSeg(i++)
	c+=30;
	this.segs[i]={ type:1,col:"#cccccc",ewid:1,ecol:"#990000",alpha:100,drop:0,select:false,
	x:[20+c,120+c,120+c],y:[50+c,50+c,250+c]}
	this.AddSeg(i);this.StyleSeg(i++)
}

QDraw.prototype.RefreshSVG=function()									// REFRESH SVG 
{
	var i,n=this.segs.length;
 	this.tempSeg=null;														// Clear temp 
	$("#Q-SVG").empty();													// Remove all segs
	this.AddDropFilter("QdropFilterB","#000000",4);							// Add black SVG filter for drop shadows
	this.AddDropFilter("QdropFilterW","#ffffff",4);							// Add white 
	for (i=0;i<n;++i) {														// For each seg
		this.segs[i].svg=null;												// Clear so a new geg will be added
		this.AddSeg(i);														// Add it
		this.StyleSeg(i);													// Style it
		}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SEGS 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.StyleSeg=function(segNum)								// STYLE SEGMENT 
{
	var s=this.segs[segNum];												// Point at seg data
	var o=s.svg;															// Point at SVG element
	if (s.type < 3) {														// A line or curve
		var str="M"+s.x[0]+" "+s.y[0];										// Start
		if (s.curve) {														// If curved
			var open=true;													// Assume open
			if ((Math.abs(s.x[0]-s.x[s.x.length-1]) < 3) && (Math.abs(s.y[0]-s.y[s.y.length-1]) < 3)) {
					s.x[x.length-1]=s.x[0];
					s.y[y.length-1]=s.y[0];
					open=false;
					}
				x=s.x[0]-0+((s.x[1]-s.x[0])/2)-0;
				y=s.y[0]-0+((s.y[1]-s.y[0])/2)-0;
				if (open) {
					str+="L"+x+",";											// Pos x
					str+=y+" ";												// Pos y
			 		}			
				for (j=1;j<s.x.length-1;++j) {								// For each coord
					x=s.x[j]-0+((s.x[j+1]-s.x[j])/2)-0;						// Mid x										
					y=s.y[j]-0+((s.y[j+1]-s.y[j])/2)-0;						// Mid y										
					str+="Q";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					str+=x+",";												// Control x
					str+=y+" ";												// Control y
					}
				if (open) {
					str+="L"+s.x[j]+",";									// Pos x
					str+=s.y[j]+" ";										// Pos y
			 		}			
				}
			else{
				for (j=1;j<s.x.length;++j) {								// For each coord
					str+="L";												// Line to
					str+=s.x[j]+",";										// Pos x
					str+=s.y[j]+" ";										// Pos y
					}
				}
		if (s.type == 2)	str+=" Z";										// Close it if filled
		else				s.col="";
		o.setAttribute("d",str);											// Add coords
		}
	else if (s.type == "3") {												// A rect
		var tip=0;
		o.setAttribute("height",Math.abs(s.y[2]-s.y[0]));					// Height
		o.setAttribute("width",Math.abs(s.x[2]-s.x[0]));					// Width
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y",s.y[0]);											// Y
		if (s.etip == 1)													// If rounded
			tip=Math.abs(s.x[2]-s.x[0])/10;									// Set value based on size
		o.setAttribute("rx",tip);											// Set X radius
		o.setAttribute("ry",tip);											// Y
		}
	else if (s.type == "4") {												// An ellipse
		var w=Math.abs(s.x[2]-s.x[0])/2;	o.setAttribute("rx",w);			// Width
		var h=Math.abs(s.y[2]-s.y[0])/2;	o.setAttribute("ry",h);			// Height
		o.setAttribute("cx",s.x[0]+w);										// X
		o.setAttribute("cy",s.y[0]+h);										// Y
		}
	o.setAttribute("stroke-width",((s.type < 3)? s.ewid*2 : s.ewid)+"px");	// Stroke width (double for lines)
	o.setAttribute("opacity",s.alpha/100);									// Opacity
	if (s.col)		o.style.fill=s.col;										// Fill color
	else			o.style.fill="none";									// No fill	
	if (s.ecol)		o.style.stroke=s.ecol;  								// Stroke color
	else			o.style.stroke="none";									// No stroke	
	if (s.drop == 1)														// White drop
		o.setAttribute("filter","url(#QdropFilterW)");						// Set white filter
	else if (s.drop == 2)													// Black drop
		o.setAttribute("filter","url(#QdropFilterB)");						// Set black filter
	else																	// No drop
		o.setAttribute("filter","");										// Remove filter
}

QDraw.prototype.SelectSeg=function(segNum, mode)						// SELECT A SEG
{
	var i,sel=0
	var s=this.segs[segNum];												// Point at seg data
	var n=this.segs.length;													// Number of segs
	s.select=0;																// Start with none
	if (mode) {																// If selecting
		for (i=0;i<n;++i) 													// For each other seg
			if (this.segs[i].select)	sel++;								// Add to count if selected
		s.select=sel+1;														// Add this one too
		}
	if (mode) {																// If selected
		this.curCol=s.col;		this.curDrop=s.drop;						// Set parameters
		this.curAlpha=s.alpha;	this.curEwid=s.ewid;
		this.curEcol=s.ecol;	this.curEtip=s.etip;
		this.curTsiz=s.tsiz;	this.curTsty=s.tsty;
		this.curTfon=s.tfon;	this.curCurve=s.curve;	
		}
	this.AddWireframe(segNum);												// Draw selected wireframe	
}

QDraw.prototype.DeselectSegs=function()									// DESELECT ALL SEGS
{
	var i;
	var n=this.segs.length;													// Number of segs
	for (i=0;i<n;++i) {														// For each seg
		this.segs[i].select=0;												// Unselect them
		$("#QWire-"+i).remove();											// Remove old one
		}
}

QDraw.prototype.DeselectSegs=function()									// DESELECT ALL SEGS
{
	var i;
	var n=this.segs.length;													// Number of segs
	for (i=0;i<n;++i) {														// For each seg
		this.segs[i].select=0;												// Unselect them
		$("#QWire-"+i).remove();											// Remove old one
		}
}

QDraw.prototype.ArrangeSegs=function(how)								// ARRANGE SEGS
{
	var i,first=-1;
	var tsegs=[];
	this.Do();																// Set up for undo
	for (i=0;i<this.segs.length;++i)										// For each seg
		if (this.segs[i].select) {											// If selected
			if (first < 0)	first=i;										// Set first selected seg index
			tsegs.push(JSON.parse(JSON.stringify(this.segs[i])));			// Unlink and copy seg to array
			this.segs.splice(i,1);											// Remove from seg list
			--i;															// Don't skip next one
			}
	
	tsegs.sort(function(a,b) { return a.select < b.select ? -1 : 1 } );		// Sort by select order
	switch(how) {
		case 1:																// To back
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.unshift(tsegs[i]);								// Add it back from the start
				break;
		case 2:																// Backward
			first--;														// Before
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.splice(first,0,tsegs[i]);							// Add it back from the start
				break;
		case 3:																// Forward
			first++;														// After
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.splice(first,0,tsegs[i]);							// Add it back from the start
				break;
		case 4:																// To front
			for (i=0;i<tsegs.length;++i)									// For each selected seg
				this.segs.push(tsegs[i]);									// Add it back from the end
				break;
		}
	this.RefreshSVG();														// Rebuild SVG
	for (i=0;i<this.segs.length;++i)										// For each seg
		if (this.segs[i].select) 											// If selected
			this.AddWireframe(i);											// Draw selected wireframe	
	Sound("ding");															// Ding
}

QDraw.prototype.AlignSegs=function(how)									// ALIGN SEGS
{
}

QDraw.prototype.DistribueSegs=function(how)								// DISTRIBUTE SEGS
{
}

QDraw.prototype.RefreshIds=function()									// UPDATE ALL SVG IDS TO MATCH SEG ORGER
{
	var i;
	var n=this.segs.length;													// Number of segs
	for (i=0;i<n;++i) 														// For each seg
		this.segs[i].svg.setAttribute("id","QSeg-"+i);						// Set id
}

QDraw.prototype.StyleSelectedSegs=function()							// STYLE SELECTED SEGS
{
	var i,s;
	var n=this.segs.length;													// Number of segs
	for (i=0;i<n;++i) 														// For each seg
		if (this.segs[i].select) {											// If selected
			s=this.segs[i];													// Point at seg
			s.col=this.curCol;		s.drop=this.curDrop;					// Set parameters
			s.alpha=this.curAlpha;	s.ewid=this.curEwid;
			s.ecol=this.curEcol;	s.etip=this.curEtip;
			s.tsiz=this.curTsiz;	s.tsty=this.curTsty;
			s.tfon=this.curTfon;	s.curve=this.curCurve;
			this.StyleSeg(i);												// Style it
			this.changed=true;												// Set changed flag
			}
	if (this.changed)														// If changing something
		this.Do();															// Save an undo
}

QDraw.prototype.AddWireframe=function(segNum, col)						// ADD WIREFRAME TO DRAWING
{
	var _this=this;															// Context
	$("#QWire-"+segNum).remove();											// Remove old one
	if (this.segs[segNum].select)	col="#3399ff";							// It's already selected, put blue wire up
	else if (!col)					return;									// Don't add any wireframe if no col spec'd
	var s=this.segs[segNum];												// Point at seg data
	var group=document.createElementNS(this.NS,"g");						// Create element
	this.svg.appendChild(group);											// Add element to DOM
	group.setAttribute("id","QWire-"+segNum);								// Id
	
	if (s.type < 3) {														// A l1ne or curve
		var o=document.createElementNS(this.NS,"path");						// Create element
		group.appendChild(o);												// Add element to DOM
		var str="M"+s.x[0]+" "+s.y[0];										// Start
		for (i=1;i<s.x.length;++i)											// For each point
			str+="L"+s.x[i]+" "+s.y[i];										// Start
		if (s.col && (s.col != "None"))	str+=" Z";							// Close it if filled
		o.setAttribute("d",str);											// Add coords
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		for (i=0;i<s.x.length;++i)											// For each coord
			AddDot(s.x[i],s.y[i],o,i+1);									// Add dot
		}
	else if (s.type == "3") {												// A rect
		var o=document.createElementNS(this.NS,"rect");						// Create element
		group.appendChild(o);												// Add element to DOM
		o.setAttribute("height",Math.abs(s.y[2]-s.y[0]));					// Height
		o.setAttribute("width",Math.abs(s.x[2]-s.x[0]));					// Width
		o.setAttribute("x",s.x[0]);											// X
		o.setAttribute("y", s.y[0]);										// Y
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		AddDot(s.x[0],s.y[0],o,1);											// Add dot
		AddDot(s.x[1],s.y[1],o,2);											// Add dot
		AddDot(s.x[2],s.y[2],o,3);											// Add dot
		AddDot(s.x[3],s.y[3],o,4);											// Add dot
		}
	else if (s.type == "4") {												// An ellipse
		var o=document.createElementNS(this.NS,"ellipse");					// Create element
		group.appendChild(o);												// Add element to DOM
		var w=Math.abs(s.x[2]-s.x[0])/2;	o.setAttribute("rx",w);			// Width
		var h=Math.abs(s.y[2]-s.y[0])/2;	o.setAttribute("ry",h);			// Height
		o.setAttribute("cx",s.x[0]+w);										// X
		o.setAttribute("cy",s.y[0]+h);										// Y
		o.style.fill="none";												// No fill	
		o.style.stroke=col;  												// No color 
		o.setAttribute("stroke-width","1px");								// Stroke width
		AddDot(s.x[0],s.y[0],o,1);											// Add dot
		AddDot(s.x[1],s.y[1],o,2);											// Add dot
		AddDot(s.x[2],s.y[2],o,3);											// Add dot
		AddDot(s.x[3],s.y[3],o,4);											// Add dot
		}
	function AddDot(x, y, par, num) {
		var d=document.createElementNS(_this.NS,"rect");					// Create element
		group.appendChild(d);												// Add dot to group
		d.setAttribute("height",6);		d.setAttribute("width",6);			// Size
		d.setAttribute("x",x-3);		d.setAttribute("y",y-3);			// Pos		
		d.style.fill=col;													// Fill	
		d.setAttribute("id","QWireDot-"+segNum+"-"+num);					// Id
		d.setAttribute("cursor","alias");									// Set cursor
	
		d.addEventListener("mousedown", function(e) {						// ON MOUSE DOWN
			var segNum=e.target.id.substr(9);								// Get seg
			_this.drawMode="ds-"+segNum+"-"+num;							// Set mode
			_this.mouseX=e.clientX; _this.mouseX=e.clientY;					// Save clicked spot
			});
		}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DRAWING
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

QDraw.prototype.RubberBox=function(x1, y1, x2, y2, width, mode)			// DRAW RUBBER LINE/BOX
{
}

QDraw.prototype.AddDropFilter=function(id, col, spread)					// ADD DROPSHADOW SVG FILTER
{
   	var filter=document.createElementNS(this.NS,"filter");					// Create filter
   	filter.setAttribute("id",id);								
   	filter.setAttribute("width","200%");									
   	filter.setAttribute("height","200%");									
    var off=document.createElementNS(this.NS,"feOffset");					// Create feOffset
   	off.setAttribute("result","offOut");									
 	off.setAttribute("in","SourceGraphic");									
 	off.setAttribute("dx","1");			
 	off.setAttribute("dy","1");						
   	var blur=document.createElementNS(this.NS,"feGaussianBlur");			// Create feGaussianBlur
   	blur.setAttribute("result","blurOut");									
 	blur.setAttribute("in","matrixOut");									
 	blur.setAttribute("stdDeviation",spread);									
   	var blend=document.createElementNS(this.NS,"feBlend");					// Create feBlend
   	blend.setAttribute("in","SourceGraphic");									
 	blend.setAttribute("in2","blurOut");									
	blend.setAttribute("mode","normal");									
 	var mat=document.createElementNS(this.NS,"feColorMatrix");				// Create feColorMatrix
 	mat.setAttribute("in","offOut");									
 	mat.setAttribute("result","matrixOut");									
 	mat.setAttribute("type","matrix");									
 	if (col ==  "#ffffff")
 		mat.setAttribute("values","-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
 	else									
  		mat.setAttribute("values","0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0");
	filter=this.svg.appendChild(filter)										// Add filter to DOM
 	filter.appendChild(off);												// Add feoffset to filter
 	filter.appendChild(mat);												// Add feColorMatrix to filter
	filter.appendChild(blur);												// Add feGaussianBlur to filter
	filter.appendChild(blend);												// Add feBlend to filter
}

QDraw.prototype.AddSeg=function(segNum)									// ADD NEW SEGMENT TO DRAWING
{
	var i;
	var _this=this;															// Context
	var s=this.segs[segNum];												// Point at seg data
	if (!s.svg) {															// A new SVG object
		if (s.type == 1) 		type="path";								// A path
		else if (s.type == 2) 	type="path";								// An path
		else if (s.type == 3) 	type="rect";								// An rect
		else if (s.type == 4) 	type="ellipse";								// An ellipse
		else if (s.type == 5) 	type="text";								// An text
		s.svg=document.createElementNS(this.NS,type);						// Create element
		this.svg.appendChild(s.svg);										// Add element to DOM
		s.svg.setAttribute("id","QSeg-"+segNum);							// Id
		s.svg.setAttribute("cursor","pointer");								// Hand cursor

		s.svg.addEventListener("mouseout", function(e)  { 					// Mouse out
				var s=e.target.id.substr(5);								// Get seg
				_this.AddWireframe(s); 
				});			

		s.svg.addEventListener("mouseover", function(e) { 					// ON MOUSE OVER
				var s=e.target.id.substr(5);								// Get seg
				if (_this.drawMode.substr(0,2) != "ds") 					// Not while dragging
					_this.AddWireframe(s,"#ff0000");						// Highlight it
				});	

		s.svg.addEventListener("contextmenu", function(e) { 				// ON RIGHT CLICK
				var i,w=_this.pie.ops.wid/2;								// Get width/2
				_this.pie.ops.segMode=true;									// Show seg menu
				_this.pie.ops.x=e.clientX-w;								// Position
				_this.pie.ops.y=e.clientY-w;								// Position
				for (i=0;i<_this.segs.length;++i)							// For each seg
					if (_this.segs[i].select) {								// If selected
						_this.curShape=_this.segs[i].type;					// Set type
						break;												// Quit looking
						}
				_this.pie.ShowPieMenu(!_this.pie.active);					// Toggle
				_this.DrawMenu();											// Draw dot
				});	
		
		s.svg.addEventListener("mousedown", function(e) { 					// ON MOUSE DOWN
				var segNum=e.target.id.substr(5);							// Get seg
				var s=_this.segs[segNum];									// Point at seg data
				if (e.shiftKey)												// If shift key is down
					_this.SelectSeg(segNum,true);							// Toggle selection state
				else{														// Multiple selection
					_this.DeselectSegs();									// Deselect segs
					_this.SelectSeg(segNum,true);							// Toggle selection state
					}
				_this.tempSeg=JSON.parse(JSON.stringify(_this.segs));		// Unlink and copy segs
				Sound("click");												// Click
				_this.AddWireframe(segNum);									// Draw selected wireframe	
				_this.drawMode="ds-"+segNum+"-0";							// Set mode to drag all
				_this.mouseX=e.clientX; _this.mouseY=e.clientY;				// Save clicked spot
				_this.mouseDX=e.clientX-s.x[0];								// Delta X from first point
				_this.mouseDY=e.clientY-s.y[0];								// DY
			});
		}
}





























