////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPACE.JS 
//
// Provides mapping component
// Requires: popup.js
// Calls global functions: Draw(), ClearPopUps()
// Depends on global curJson for access to mob data
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Space(div, pop)														// CONSTRUCTOR
{

/* 
 	@param {string} div	Div ro attach map to.
 	@param {object} pop	Points to popup library in popup.js.
 	@constructor
*/

	this.div="#"+div;														// Current div selector
  	this.pop=pop;															// Point at popup lib
  	this.controlKey=this.shiftKey=false;									// Shift/control key flags
	this.showBoxes=false;													// Show boxes
	this.showRoads=false;													// Hide Roads/borders
	this.showScale=true;													// Show scale
	this.timeFormat="Mon Day, Year";										// Default time format
	this.panTime=.5;														// Time to pan to position
	this.overlays=[];														// Holds overlay layers
}


Space.prototype.UpdateMap=function(curTime, timeFormat, panTime)		// UPDATE MAP
{

/*
	Update the current time and set layer visibilities accordingly.
	@param {number} curTime 	Current project time in mumber of mins += 1/1/1970
	@param {string} timeFormat	Format to use when making time human readable	
*/

	this.timeFormat=timeFormat;												// Set format
	this.curTime=curTime-0;													// Set current timet
	this.DrawMapLayers();													// Redraw map
	this.panTime=panTime;													// Time to pan to position
}


Space.prototype.DrawMapLayers=function(indices, mode)					// DRAW OVERLAY LAYERS							
{

/* 
 	Draws or shows overlay elements based on the current time.
  	if .start != 0 marker is turned on at the .start time
	if .start != 0 marker is turned off at the .end time
 	If indices is set, the layers spec'd are turned on/off regardless of time
 	@param {array} 		indices An array of indices specifying the marker(s) how.
	@param {boolean} 	Whether.
*/

	var i,j,o,a,vis,sty;
	if (this.canvasContext) {  												// If a canvas up      
		this.canvasContext.clearRect(0,0,this.canvasWidth,this.canvasHeight); // Clear canvas
   		for (i=0;i<this.overlays.length;i++) {								// For each overlay layer
            o=this.overlays[i];												// Get ptr  to layer
    		
    		if (!o.start && !o.end)	vis=true;								// Both start/end 0, make it visible
    		else if (o.start) 		vis=false;								// If only a start set, hide until it comes up
    		else if (o.end) 		vis=true;								// If only an end set, show until until it comes down
    		else 					vis=false;								// Both set, hide until it comes up
 
	      	if (o.start && (this.curTime >= o.start))	vis=true;			// If past start and start defined, show it
	      	if (o.end && (this.curTime > o.end))		vis=false;			// If past end and end defined, hide it
	        a=(o.opacity != undefined) ? o.opacity : 1						// Use defined opacity or 1
             if (indices) {													// If indices spec'd
            	if (mode == undefined)	mode=true;							// Default to showing marker
              	for (j=0;j<indices.length;++j) 								// For each index					
            		if (i == indices[j])									// This is one to set
            			vis=mode;											// Hide or show it
           		}
            if (vis && (o.type == "image"))									// If a visible image 
           		o.src.drawMapImage(vis,this);   							// Draw it   
        	else if (o.type == "kml") {										// If a kml 
       			o.src.set('visible',vis);									// Show/hide it
            	o.src.set("opacity",a);										// Set opacity								
             	}
        	else if (o.type == "icon") {									// If an icon 
				sty=o.src.getStyle();  										// Point at style
				sty.getImage().setOpacity(vis ? 1: 0);						// Set icon opacity
				sty.getText().setScale(vis ? 1 : 0);						// Set text opacity
              	}
	       	else if (o.type == "path") 										// If a path
         		this.DrawPath(i,this.curTime)								// Show it
	       	else if (o.type == "choro") 									// If a shoro
         		this.DrawChoropleth(i,this.curTime)							// Show it
			}
		}
	if (this.geoRef)														// If georeferencing
		this.geoRef.img.drawMapImage(this.geoRef.a,this);					// Show pic we're referencing
}


Space.prototype.InitMap=function()										// INIT OPENLAYERS MAP
{
/* 
  	Init map library.
 
*/
	this.controlKey=this.shiftKey=false;									// Shift/control key flags
	this.showBoxes=false;													// Show boxes
	this.showRoads=false;													// Hide Roads/borders
	this.showScale=true;													// Hide or show scale
	this.curProjection="EPSG:3857";											// Current projection
	
	this.layers=[															// Hold layers
		new ol.layer.Tile({													// Sat 
				visible: false,												// Invisible
				source: new ol.source.MapQuest({layer: 'sat'}),				// MapQuest sat
				projection: this.curProjection,								// Default projection
				title: "Satellite"											// Set name
				}),
		new ol.layer.Tile({													// Terrain
				visible: false,												// Invisible
				source: new ol.source.TileWMS({								// WMS
 						url: 'http://demo.opengeo.org/geoserver/wms',		// Url
 						params: { 'LAYERS': 'ne:NE1_HR_LC_SR_W_DR' }		// Params
						}),
				projection: this.curProjection,								// Default projection
				title: "Terrain"											// Set name
				}),
		new ol.layer.Tile({													// Watercolor
				visible: false,												// Invisible
				source: new ol.source.Stamen({layer: 'watercolor'}),		// Stamen watercolor
				projection: this.curProjection,								// Default projection
				title: "Watercolor"											// Set name
				}),
		new ol.layer.Tile({													// Toner
				visible: false,												// Invisible
				source: new ol.source.Stamen({layer: 'toner-lite'}),		// Stamen toner
				projection: this.curProjection,								// Default projection
				title: "B&W"												// Set name
				}),
		new ol.layer.Tile({													// Earth
				visible: false,												// Invisible
				source: new ol.source.TileJSON({
    				url: 'http://api.tiles.mapbox.com/v3/' +
        			'mapbox.natural-earth-hypso-bathy.jsonp',
    				crossOrigin: 'anonymous'
					}),
				projection: this.curProjection,								// Default projection
				title: "Earth"												// Set name
				}),
		
		new ol.layer.Tile({													// Roadmap
				visible:false,												// Hide it
				source: new ol.source.MapQuest({layer: 'osm'}),				// MapQuest roads
				projection: this.curProjection,								// Default projection
				title: "Roadmap"											// Set name
				}),
		];

	this.featureSelect=new ol.interaction.Select();							// Create select interaction
	this.featureSelect.setActive(false);									// Turn select off

    this.map=new ol.Map( { target: this.div.substr(1),						// Alloc OL
    	layers:this.layers,													// Layers array									
		interactions: ol.interaction.defaults().extend([this.featureSelect]),	// Add feature select interaction
       	controls: ol.control.defaults({										// Controls
				}).extend([ new ol.control.ScaleLine() ]),					// Add scale
        view: new ol.View({													// Views
          		center: ol.proj.transform( [-77,34],'EPSG:4326',this.curProjection),
          		minZoom: 2, maxZoom: 16, zoom: 3 })
		});

	this.SetBaseMap("Roadmap");												// Set basemap
  	this.CreateOverlayLayer();												// Canvas and vector layer for map overlays
  	this.InitPopups();														// Init popup layer
  	var _this=this;															// Save context for callback
   	
	this.map.on('click', function(e) {										// ON CLICK
		var c=ol.proj.transform(e.coordinate,_this.curProjection,'EPSG:4326');	// Get center
		$("#setpoint").val(Math.floor(c[0]*10000)/10000+","+Math.floor(c[1]*10000)/10000);
		if (e.browserEvent.shiftKey) {										// If shift key presssed
  			var lay;
  			var feature=_this.map.forEachFeatureAtPixel(e.pixel,			// Look through features
      			function(feature, layer) {									// On match to location
         			lay=layer;												// Save layer
         			return feature;											// Return feature
      				});
			if (feature) {													// If one found
  				var j;
  				var id=feature.getId();										// Get feature id
    			if (lay && (lay.get("kmlId"))) 	{							// If a KML id
 					var fa=lay.getSource().getFeatures();					// Point at all features
 					for (j=0;j<fa.length;++j)								// For each one
 						if (fa[j].getId() == id)							// A match for id
	 	 					$("#setpoint").val(lay.get('kmlId')+":"+j);		// Show id index
						}
				}
			}
		});

	this.map.on('moveend', function(e) {									// On end of move
      	_this.DrawMapLayers();												// Redraw maps in new extent, if moved
		var o=_this.map.getView();											// Point at view
		var c=ol.proj.transform(o.getCenter(),_this.curProjection,'EPSG:4326');	// Get center
		var pos=Math.floor(c[1]*10000)/10000+"|"+Math.floor(c[0]*10000)/10000+"|"+o.getResolution()+"|";	
		pos+=Math.floor((o.getRotation()*180/Math.PI)*1000)/-1000;			// Rotation
		$("#setwhere").val(Math.floor(c[0]*10000)/10000+","+Math.floor(c[1]*10000)/10000+","+Math.round(o.getResolution()));
		_this.SendMessage("move",pos+"|scroll");							// Send that view has changed
		});
	}	


Space.prototype.UpdateMapSize=function() 								// UPDATE MAP SIZE
{

/* 
  	Update Openlayers map to match container div's size.
  
*/
	if (this.map)															// If OL initted
		this.map.updateSize();												// Update map
}


Space.prototype.SetBaseMap=function(newMap) 							// SET BASE MAP
{

/* 
  	Set base map
  	@param {string} 	newMap	Name of map layer to show
  
*/

	if (this.map)															// If OL initted
   		for (i=0;i<this.layers.length;++i) 									// For each layer
	    	this.layers[i].set('visible',this.layers[i].get("title") == newMap); // Set visibility
}


Space.prototype.Goto=function(pos)										// SET VIEWPOINT
{

/* 
  	Set map center, resolution, and time
  	@param {string} pos	Position to got to in this format:
  						longitude,latitude[,resolution,time]
  
*/
	
	if ((!pos) || (pos.length < 5))											// No where to go
		return;																// Quit
	var duration;
	pos=pos.replace(/"/g,"");												// Remove quotes
	var v=pos.split(",");													// Split up
	var o=this.map.getView();												// Point at view
	var c=ol.proj.transform([v[0]-0,""+v[1].replace(/\*/,"")-0],'EPSG:4326',this.curProjection);	// Get center
	var fc=o.getCenter();													// Get from center
	var fs=o.getResolution();												// Get from resolution
	if ((Math.abs(fc[0]-c[0]) < 2) && (Math.abs(fc[1]-c[1]) < 2) &&			// Center match
		(Math.abs(fs-v[2]) < 2) && (Math.abs(fs-v[2]) < 2))					// Resolution  match
		return;																// Quit
	
	if (v[3])  	duration=v[3]*1000;											// Set duration from pos
	else		duration=this.panTime*1000;									// Use global duration

	var pan=ol.animation.pan({												// Pan
	    duration: duration,													// Duration
	    source: fc,															// Start value
	    start: +new Date()													// Starting time
	  	});

  	this.map.beforeRender(pan);												// Pan
	o.setResolution(v[2]);													// Set resolution								
	o.setCenter(c);															// Set center
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMAGE OVERLAY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Space.prototype.CreateOverlayLayer=function()							// CREATE CANVAS/VECTOR OVERLAY LAYERS				
{        
   
 /* 
  	Creates the canvas layer needed to show images and the
  	vector layer to show markers
 */
   	var _this=this;															// Save context for callback
 
    this.canvasLayer=new ol.layer.Image( {									// Make new image layer
        source: new ol.source.ImageCanvas( {								// Add canvas sourcw
            canvasFunction: function(extent, res, pixelRatio, size, proj) { // Render function
				if (!_this.canvasCanvas) 									// If no canvas yet
			        _this.canvasCanvas=document.createElement('canvas');	// Alloc canvas
		       	_this.canvasWidth=size[0];									// Get width
			    _this.canvasHeight=size[1];									// Hgt
		    	_this.canvasCanvas.setAttribute('width',size[0]);			// Set canvas width
			    _this.canvasCanvas.setAttribute('height',size[1]);			// Hgt
	    		_this.canvasContext=_this.canvasCanvas.getContext('2d');	// Get context
           		_this.canvasExtent=extent;									// Set extent
		        _this.canvasRes=res;										// Set res
				_this.DrawMapLayers();										// Make images
	        	return _this.canvasCanvas 									// Return canvas reference
	            }, 
	        projection: this.curProjection									// Projection
	        })
	    }); 
   	this.map.addLayer(this.canvasLayer);									// Add image layer to map
    this.markerLayer=new ol.layer.Vector( {									// Make new vector layer
        source: new ol.source.Vector({}),									// Add source
	    projection: this.curProjection										// Projection
	   })
    this.map.addLayer(this.markerLayer);									// Add layer to map
}


Space.prototype.MarkerLayerToTop=function()								// MOVE MARKER LAYER ON TOP OF OTHER LAYERS
{
	
 /* 
  	Moves the marker layer on top of all other layer
 */

	var layer=this.map.getLayers().remove(this.markerLayer);				// Remove marker layer
	var n=this.map.getLayers().getArray().length;							// Last index
	this.map.getLayers().insertAt(n,layer);									// Place on top
}


Space.prototype.AddChoroplethLayer=function(col, ecol, ewid,opacity, base, where, start, end)	// ADD CHORPLETH LAYER
{
		
/* 	
 	Add choropleth  layer.
 	@param {string} 	col 	Color 
	@param {string} 	ecol 	Edge color 
	@param {number} 	ewid 	Edge width 
 	@param {number} 	opacity Opacity  0-1
 	@param {number} 	base 	Index of base vector layer to style
 	@param {string} 	where 	Conditions (id:featureId[,featureId,...]
 	@param {number} 	start 	Starting time of marker in number of mins += 1/1/1970
	@param {number} 	end 	Ending time of marker in number of mins += 1/1/1970
	@return {number} 	index	Index of layer added
*/

	var o={};
	if (!opacity)	opacity=1;												// Default opacity
	o.type="choro";															// Path
  	o.start=start;	o.end=end;		o.col=col; 	  	o.opacity=opacity;		// Save parameters
  	o.ecol=ecol;	o.ewid=ewid;	o.where=where; 	o.base=base;			// Save parameters
	o.styles=[];															// Alloc orginal style array
	var index=this.overlays.length;											// Get index
	this.overlays.push(o);													// Add to overlay
	return index;															// Return layer index
}

Space.prototype.DrawChoropleth=function(num, time) 						// DRAW CHOROPLETH						
{

/* 	
 	Draw choropleth layer.
 	@param {number} num 	Layer to draw 
	@param {number} time 	Current time in number of mins += 1/1/1970
*/

	var i,v,os,sty;
	var fr,fb,fg,fa,er,eg,eb,ea,ew;
	var o=this.overlays[num];												// Point at overlay
	var features=this.overlays[o.base].src.getSource().getFeatures();		// Get KML feature array
	if (!o.styles.length) {													// No original styles yet
		for (i=0;i<features.length;++i) {									// For each feature in KML
			o.styles[i]={ fr:0,fb:0,fg:255,fa:0,							// Alloc style storage object
				er:0,eg:0,eb:0,ea:0,ew:2 };									// Defaults
			if (features[i].get("Style")) {									// If an embedded style
				os=features[i].get("Style")[0];								// Get embedded style 
				if (os.getFill()) {											// If a fill
					c=os.getFill().getColor();								// Get color
					o.styles[i].fr=c[0];	o.styles[i].fg=c[1];			// Set colors
					o.styles[i].fb=c[2];	o.styles[i].fa=c[3];
					}
				if (os.getStroke())	{										// If a stroke
					c=os.getStroke().getColor();							// Get edge color
					o.styles[i].er=c[0];	o.styles[i].eg=c[1];			// Set colors
					o.styles[i].eb=c[2];	o.styles[i].ea=c[3];
					o.styles[i].ew=os.getStroke().getWidth();				// Get edge width		
					}
				}
			sty=new ol.style.Style( {										// Alloc style								
				fill: 	new ol.style.Fill(	 { color:[o.styles[i].fr,o.styles[i].fg,o.styles[i].fb,o.styles[i].fa] } ),							// Fill
				stroke: new ol.style.Stroke( { color:[o.styles[i].er,o.styles[i].eg,o.styles[i].eb,o.styles[i].ea], width: o.styles[i].ew-0 })	// Edge
				});
 			features[i].setStyle(sty);										// Style it
			}
		}
	var v=o.where.split(":")[1].split(",");									// Get features
	if (o.where.match(/from/i)) {											// Must be a query
		var dst=[];
		v=o.where.match(/(.+) *from *(\S+) *(.+)/i);						// Split into base, data, and query parts
		if ((i=FindMobByID(v[2])) < 0)										// Get index of data element
			return;															// Quit of not found
		if (!(i=curJson.mobs[i].src))										// No data yet
			return;															// Quit of not found
		dtl.Query(i,dst,v[3],"feature");									// Run query on data
		v=[];																// A blank slate
		for (i=1;i<dst.length;++i)											// For each one found (skip header)
			v.push(dst[i][0]);												// Add id to list to select
		}
   	if (o.col && (o.col.length == 4)) 	o.col+=o.col.substr(1,3);			// Turn #555 into #55555
  	if (o.ecol && (o.ecol.length == 4)) o.ecol+=o.ecol.substr(1,3);			// Turn #555 into #55555

	for (i=0;i<features.length;++i) {										// For each feature
		s=o.styles[i];														// Point at style
		fr=s.fr;	fg=s.fg;	fb=s.fb;	fa=s.fa;						// Get original values
		er=s.er;	eg=s.eg;	eb=s.eb;	ea=s.ea; 	ew=s.ew;			// Get original values
		if (!o.start || (time >= o.start) && (time < o.end)) {				// If showing
			for (j=0;j<v.length;++j) {										// For each potential match
				if (v[j] == i) {											// A match
					if (o.col) {											// If a fill
					  	fr=parseInt("0x"+o.col.substr(1,2),16);				// R
						fg=parseInt("0x"+o.col.substr(3,2),16);				// G
						fb=parseInt("0x"+o.col.substr(5,2),16);				// B
						fa=o.opacity;										// A
						}
					if (o.ecol) {											// If an edge					
					  	er=parseInt("0x"+o.ecol.substr(1,2),16);			// R
						eg=parseInt("0x"+o.ecol.substr(3,2),16);			// G
						eb=parseInt("0x"+o.ecol.substr(5,2),16);			// B
						ea=o.opacity;										// A
						}
					if (o.ewid) 											// If an edge width					
						ew=o.ewid;											// W
					}
				}
			}
		sty=new ol.style.Style( {											// Alloc style								
			fill: 	new ol.style.Fill(	 { color:[fr,fg,fb,fa] } ),			// Fill
			stroke: new ol.style.Stroke( { color:[er,eg,eb,ea], width:o.ewid-0 })	// Edge
			});
		features[i].setStyle(sty);											// Style it
		}
}


Space.prototype.AddPathLayer=function(dots, col, wid, opacity, start, end, show, header) 	// ADD PATH LAYER TO MAP						
{

/* 	Add path to marker layer.
 	@param {array} 		dots 	Array of lat/long,time triplets separated by commas ie. [[-77,40,-4526267], ...]
 	@param {string} 	col 	Color of path
 	@param {number} 	wid 	Width of path in pixels
 	@param {number} 	opacity Opacity of path 0-1
 	@param {number} 	start 	Starting time of marker in number of mins += 1/1/1970
	@param {number} 	end 	Ending time of marker in number of mins += 1/1/1970
	@return {number} 	index	Index of layer added
*/

	var i,v,o={};
	var index=this.overlays.length;											// Get index
	o.type="path";															// Path
  	o.start=start;	o.end=end;	o.show=show; o.header=header				// Save start, end, show, and header
	this.overlays.push(o);													// Add to overlay
  	o.src=new ol.Feature({ geometry: new ol.geom.LineString(dots)});		// Create line
  	o.id="Path-"+this.markerLayer.getSource().getFeatures().length;			// Make path id
   	o.src.setId(o.id);														// Set id of path
  	o.dots=dots;															// Save dots
   	if (!col)				col="#990000";									// Default color
   	if (!wid)				wid=2;											// Default wid
  	if (!opacity)			opacity=1;										// Default opacity
  	if (col.length == 4) 	col+col.substr(1,3);							// Turn #555 into #55555
  	var r=parseInt("0x"+col.substr(1,2),16);								// R
	var g=parseInt("0x"+col.substr(3,2),16);								// G
	var b=parseInt("0x"+col.substr(5,2),16);								// B
   	var sty=new ol.style.Style({											// Make style
   			stroke: new ol.style.Stroke({ color: [r,g,b,opacity], width: wid-0
			})
		});
	o.src.setStyle(sty);													// Set style
	this.markerLayer.getSource().addFeature(o.src);							// Add it
	return index;															// Return feature
}

Space.prototype.DrawPath=function(num, time) 						// DRAW PATH						
{

/* 	Add path to marker layer.
 	@param {number} num 	Layer to draw 
	@param {number} time 	Current time in number of mins += 1/1/1970
*/
	
	var s,e,pct,v=[],i=0,animate=false;
	var o=this.overlays[num];											// Point at overlay
	if (o.show && o.show.match(/a/i))	animate=true;					// Set animation mode
	v.push([o.dots[0][0],o.dots[0][1]]);								// Add moveto dot
	if (o.header) {														// If a header defined
		var head=this.overlays[o.header].src;							// Point at header feature
		var sty=head.getStyle();										// Get header style
		sty.getImage().setOpacity(0);									// Hide
		}			
	for (e=1;e<o.dots.length;++e) {										// For each lineto dot
		s=e-1;															// Point at start of line
		if ((time >= o.dots[s][2]) && (time < o.end)) {					// This one's active
			v.push([o.dots[e][0],o.dots[e][1]]);						// Add end dot
			if ((time < o.dots[e][2]) && animate){						// If before end of end dot and animating
				pct=(time-o.dots[s][2])/(o.dots[e][2]-o.dots[s][2]);	// Get pct
				v[e][0]=o.dots[s][0]+((o.dots[e][0]-o.dots[s][0])*pct);	// Interpolate x
				v[e][1]=o.dots[s][1]+((o.dots[e][1]-o.dots[s][1])*pct);	// Interpolate y
				if (o.header && (pct < 1))	{							// If a header defined
					head.setGeometry(new ol.geom.Point(v[e]));			// Move it
					sty.getImage().setOpacity(1);						// Show it
					}
				}
			}
		}
	o.src.setGeometry(new ol.geom.LineString(v));						// Set new dots
}


Space.prototype.AddMarkerLayer=function(pos, style, id, start, end) 	// ADD MARKER LAYER TO MAP						
{

/* 	
 	Add marker to marker layer.
 	@param {string} pos 	Contains bounds for the image "latitude,longitude".
  					    	Rotation is optional and defaults to 0 degrees.				
	@param {object} style 	Consists of a style object :
						a: {number} opacity (0-1)
						f: {string} fill color "#rrggbb"
						s: {string} stroke color "#rrggbb"
						r: {number} rotation
						w: {number} width
						d: {string} description for popup
						m: {string} type
						t: {string} label
						tc: {string} text color
						ts: {string} text format
	@param {number} start 	Starting time of marker in number of mins += 1/1/1970
	@param {number} end 	Ending time of marker in number of mins += 1/1/1970
	@return {object} 	obj	Pointer to feature added to markerLayer

*/

	var o={};
	o.type="icon";															// Icon
  	o.start=start;	o.end=end;												// Save start, end
	var index=this.overlays.length;											// Get index
	this.overlays.push(o);													// Add to overlay
  	var v=pos.split(",");													// Split into parts
	var c=ol.proj.transform([v[0]-0,""+v[1]-0],'EPSG:4326',this.curProjection);	// Transform
	o.src=new ol.Feature({ geometry: new ol.geom.Point(c) });				// Create feature at coord
 	var i=this.markerLayer.getSource().getFeatures().length;			// Index of feature
 	o.src.setId("Mob-"+id);													// Set id of mob
 	this.markerLayer.getSource().addFeature(o.src);							// Add it
 	this.StyleMarker([i],style);											// Style marker
	return index;															// Return feature
}


Space.prototype.StyleMarker=function(indices, sty)						// STYLE MARKERS(s)			
{
	
/* 
 	@param {array} 	indices An array of indices specifying the marker(s) to hide or show.
	@param {object} style 	Consists of a style object :
						a: {number} opacity (0-1)
						f: {string} fill color "#rrggbb"
						s: {string} stroke color "#rrggbb"
						r: {number} rotation
						w: {number} width
						d: {string} description for popup
						m: {string} type
						t: {string} label
						tc: {string} text color
						tf: {string} text format
 */

	var i,image;
	var w2=sty.w ? sty.w*.6667 : 8;											// Set size
	if (sty.f) {															// If fill spec'd
	  	if (sty.f.length == 4) sty.f+=sty.f.substr(1,3);					// Turn #555 into #55555
	  	r=parseInt("0x"+sty.f.substr(1,2),16);								// R
		g=parseInt("0x"+sty.f.substr(3,2),16);								// G
		b=parseInt("0x"+sty.f.substr(5,2),16);								// B
  		var fill=new ol.style.Fill({ color: [r,g,b,sty.a ? sty.a : 1]});	// Create fill with alpha
  		}
  	if (sty.s) {															// If stroke spec'd	
	  	if (sty.s.length == 4) sty.s+=sty.s.substr(1,3);					// Turn #555 into #55555
	  	r=parseInt("0x"+sty.s.substr(1,2),16);								// R
		g=parseInt("0x"+sty.s.substr(3,2),16);								// G
		b=parseInt("0x"+sty.s.substr(5,2),16);								// B
  		var stroke=new ol.style.Stroke({ color: [r,g,b,sty.a ? sty.a : 1], width:1 });	// Create stroke with alpha & width
		}	

 	if (sty.w)	w2=sty.w/2;													// If spec'd use it																

	switch(sty.m.toLowerCase()) {											// Route on marker style
		case "square":
			image=new ol.style.RegularShape({								
		    	radius: w2, fill: fill, stroke:stroke, points: 4, angle: Math.PI/4
	  			});
	  		break;
		case "star":
			image=new ol.style.RegularShape({								
  	  			radius: w2, fill: fill, stroke:stroke, points: 5, radius2: w2/2
  				});
 	  		break;
		case "diamond":
			image=new ol.style.RegularShape({								
	    		radius: w2, fill: fill, stroke:stroke, points: 4
	  			});
	  		break;
		case "triup":
			image=new ol.style.RegularShape({								
	    		radius: w2, fill: fill, stroke:stroke, points: 3
	   			});
	  		break;
		case "tridown":
			image=new ol.style.RegularShape({								
	    		radius: w2, fill: fill, stroke:stroke, points: 3,angle: Math.PI
	 			});
	  		break;
		case "triright":
			image=new ol.style.RegularShape({								
	    		radius: w2, fill: fill, stroke:stroke, points: 3,angle: Math.PI/2
	 			});
	  		break;
		case "trileft":
			image=new ol.style.RegularShape({								
	    		radius: w2, fill: fill, stroke:stroke, points: 3,angle: -Math.PI/2
	 			});
	  		break;
 		default:
			if (sty.m && sty.m.match(/\/\//)) 	 							// Must be an image file
				image=new ol.style.Icon({ src: sty.m });					// Add icon
			else{															// Default to dot
				image=new ol.style.Circle({									// Add circle							
		    		radius: w2*3/4, fill: fill, stroke:stroke
		  			});
			  	}
	  	break;
	}
	var text=new ol.style.Text( {											// Text style
		textAlign: "center", textBaseline: "top",							// Set alignment
		font: sty.tf,														// Set font
		text: sty.t,														// Get label
		fill: new ol.style.Fill({color: sty.tc }),							// Set color
		stroke: new ol.style.Stroke({color: "#666", width:1 }),				// Outline
		offsetY: w2,														// Set offset
		});  
   	var s=new ol.style.Style({												// Create new style
		image: image, text: text											// Add icon, text
		});
	for (i=0;i<indices.length;++i)											// For each layer
		this.markerLayer.getSource().getFeatures()[indices[i]].setStyle(s);	// Set style
}

Space.prototype.AddKMLLayer=function(url, opacity, id, start, end) 		// ADD KML LAYER TO MAP						
{

/* 	
 	Add kml file to map as a new layer
   	@param {string} url 	URL of kml file
   	@param {number} opacity	Initial opacity of layer
  	@param {string} id 		ID if layer
 	@param {number} start 	Starting time of marker in number of mins += 1/1/1970
	@param {number} end 	Ending time of marker in number of mins += 1/1/1970
 	@return {number}		index of new layer added to overlays array.
*/

	var o={};
   	var _this=this;															// Save context for callback
	if (url && url.match(/\/\//)) 											// If cross-domain
		url="proxy.php?url="+url;											// Add proxy

	var index=this.overlays.length;											// Get index
 	o.type="kml";															// KML
  	o.start=start;	o.end=end;												// Save start, end
	o.opacity=opacity;														// Initial opacity
	
	o.src=new ol.layer.Vector({  source: new ol.source.Vector({				// New layer
							title: "LAYER-"+this.overlays.length,			// Set name
				   			projection: ol.proj.get(this.curProjection),	// Set KML projection
				    		format: new ol.format.KML({ extractStyles:true}),					// KML format
				    		url: url										// URL
				  			})
						});
	
	o.src.set('kmlId',id)													// Set id
	o.src.set('visible',false)												// Hide it
	this.overlays.push(o);													// Add to overlay
	this.loadCounter++;														// Add to count
	this.map.addLayer(o.src);												// Add to map	
 	return index;															// Return layer ID
 
	this.overlays[index].getSource().once("change",function(){				// WHEN KML IS LOADED						
 		this.ShowProgress();												// Update loading progress
 		this.forEachFeature(function(f) {									// For each feature in KML
			if ((f.getGeometry().getType() == "Point") && f.get("name")){	// If a marker with a label
				var sty=new ol.style.Style({								// Add style
			      image: new ol.style.Icon( { src: "img/marker.png"	}),		// Add icon
			      text:	new ol.style.Text( {								// Text style
				    	textAlign: "left", textBaseline: "middle",			// Set alignment
				    	font: "bold 14px Arial",							// Set font
				    	text: f.get("name"),								// Get label
				   	 	fill: new ol.style.Fill({color: "#fff" }),			// Set color
						stroke: new ol.style.Stroke( { color: "#000",width: 1 }),	// Set edge		   
				    	offsetX: 16											// Set offset
				 		})
					});
					f.setStyle(sty);										// Set style to show label	
					}
				});
		});

}


Space.prototype.StyleKMLFeatures=function(num, styles)					// STYLE KML FEATURE(s)		  
{ 
	
/* 
 	@param {number} num The index of the KML overlay to color.
	@param {array} 	styles An array of objects specifying the style to set any given feature to set
 					Each element in the array consists of a style object to set a particular feature index:
						n: {string} spec's feature index,or "*" for all
						a: {number} opacity (0-1)
						f: {string} fill color "#rrggbb"
						s: {string} stroke color "#rrggbb"
						w: {number} stroke width
*/
	
	var i,r,g,b,a;
	if ((num < 0) || (num >= this.overlays.length) || (this.overlays[num].type != "kml"))	// If not a valid KML
		return;																// Quit
	var features=this.overlays[num].src.getSource().getFeatures();			// Get KML feature array
	var n=styles.length;													// Number of features to style
	var last=n-1;															// Last style possible
	if (styles[0].n == "*")
		n=features.length;
	for (i=0;i<n;++i) {														// For each feature to style
		var s=styles[Math.min(i,last)];										// Point at style
	  	if (s.f) {															// If fill spec'd
		  	if (s.f.length == 4) s.f+=s.f.substr(1,3);						// Turn #555 into #55555
		  	r=parseInt("0x"+s.f.substr(1,2),16);							// R
			g=parseInt("0x"+s.f.substr(3,2),16);							// G
			b=parseInt("0x"+s.f.substr(5,2),16);							// B
	  		var fill=new ol.style.Fill({ color: [r,g,b,s.a ? s.a : 1]});	// Create fill with alpha
	  		}
	  	if (s.s) {															// If stroke spec'd	
		  	if (s.s.length == 4) s.s+=s.s.substr(1,3);						// Turn #555 into #55555
		  	r=parseInt("0x"+s.s.substr(1,2),16);							// R
			g=parseInt("0x"+s.s.substr(3,2),16);							// G
			b=parseInt("0x"+s.s.substr(5,2),16);							// B
	  		var stroke=new ol.style.Stroke({ color: [r,g,b,s.a ? s.a : 1], width:s.w });	// Create stroke with alpha & width
			}
		sty=new ol.style.Style({ fill:fill,stroke:stroke });				// Create style
		if (s.n == "*")														// If styling them all
			features[i].setStyle(sty);										// Set next feature's style
		else																// Justb styling on spec's bu s.n
			features[s.n].setStyle(sty);									// Set particular feature's style
		}
}


Space.prototype.AddImageLayer=function(url, geoRef, alpha, start, end) 	// ADD MAP IMAGE TO PROJECT
{    

/* 
  	@param {string} url 	URL of image file (jpeg, png or gif)
 	@param {string} geoRef 	Contains bounds for the image "north,south,east,west,rotation".
  							Rotation is optional and defaults to 0 degrees.				
 	@param {number} start 	Starting time of marker in number of mins += 1/1/1970
	@param {number} end 	Ending time of marker in number of mins += 1/1/1970
 	@return {number}		index of new layer added to overlays array.
*/

	var o={};
	var index=this.overlays.length;											// Get index
 	o.type="image";															// Image
 	o.start=start;	o.end=end;												// Save start, end
    o.src=new MapImage(url,geoRef,this);									// Alloc mapimage obj
	o.alpha=alpha;															// Save alpha
	this.overlays.push(o);													// Add layer
	this.loadCounter++;														// Add to count
	return index;															// Return layer ID
}
	
function MapImage(url, geoRef, _this) 									// MAPIMAGE CONSTRUCTOR
{    

/* 
 	@constructor
 	@param {string} url URL of image file (jpeg, png or gif)
 	@param {string} geoReg Contains bounds for the image "north,south,east,west,rotation".
 					rotation is optional and defaults to 0 degrees.				
 	@param {object} 	_this Context of the Space object
*/

    this.img=new Image();												// Alloc image
    this.img.onload=_this.ShowProgress;									// Add handler to remove from count after loaded
    this.img.onerror=_this.ShowProgress;								// Add handler to remove from count if error
    this.imgWidth;	 this.imgHeight;									// Set size, if any
    var v=geoRef.split(",");											// Split into parts
    this.n=v[0]-0;														// Set bounds
    this.s=v[1]-0;
    this.e=v[2]-0;
    this.w=v[3]-0;
    var ne = ol.proj.transform([this.e, this.n], 'EPSG:4326', _this.curProjection);	// Project
    var sw = ol.proj.transform([this.w, this.s], 'EPSG:4326', _this.curProjection);
    this.north = ne[1];
    this.south = sw[1];
    this.east = ne[0];
    this.west = sw[0];
    this.centerXCoord = this.w + (Math.abs(this.e - this.w) / 2);
    this.centerYCoord = this.s + (Math.abs(this.n - this.s) / 2);
    this.center=ol.proj.transform([this.centerXCoord, this.centerYCoord], 'EPSG:4326', _this.curProjection);	// Get center
    this.rotation=v[4]*-1;												// Reverse direction
	this.img.src=url;													// Set url
}

MapImage.prototype.drawMapImage=function(opacity, _this)           	// DRAW IMAGE
	{ 
		if (!this.imgWidth) {
			this.imgWidth=this.img.width;
			this.imgHeight=this.img.height;
			this.imgWidthMeters=Math.abs(this.east - this.west);            
			this.imgHeightMeters=Math.abs(this.north - this.south);
			}
		var canvasExtentWidth = _this.canvasExtent[2] - _this.canvasExtent[0];
		var canvasExtentHeight = _this.canvasExtent[3] - _this.canvasExtent[1];
		var xCenterOffset = _this.canvasWidth * (this.center[0]-_this.canvasExtent[0]) / canvasExtentWidth;
		var yCenterOffset = _this.canvasHeight * (_this.canvasExtent[3]-this.center[1]) / canvasExtentHeight;
		var drawWidth = _this.canvasWidth * (this.imgWidthMeters / canvasExtentWidth);
		var drawHeight = _this.canvasHeight * (this.imgHeightMeters / canvasExtentHeight);
		var ctx=_this.canvasContext;
		if (ctx) {
			ctx.globalAlpha = opacity;
			ctx.translate(xCenterOffset,yCenterOffset);
			ctx.rotate(this.rotation * (Math.PI/180));
			ctx.translate(-(drawWidth / 2), -(drawHeight / 2));
			ctx.drawImage(this.img, 0, 0, drawWidth, drawHeight);
			ctx.translate((drawWidth / 2), (drawHeight / 2));
			ctx.rotate(-(this.rotation * (Math.PI / 180)));
			ctx.translate(-xCenterOffset,-yCenterOffset);
			ctx.globalAlpha=1;
			}                  
}


Space.prototype.InitPopups=function()									// HANDLE POPUPS ON FEATURES						
{

/* 
 	Init the handing of marker and kml feature popups.
 	Controls cursor on hover over feature/marker.
*/

  	var _this=this;															// Save context for callbacks

 	this.map.on('click', function(evt) {									// ON MAP CLICK
  			var lay;
  			var feature=_this.map.forEachFeatureAtPixel(evt.pixel,			// Look through features
      			function(feature, layer) {									// On match to location
         			lay=layer;												// Save layer
          			return feature;											// Return feature
      			});
			if (feature) {													// If one found
  				var j;
  				var id=feature.getId();
    			if (lay && (lay.get("kmlId"))) {							// If a KML id
 	 				var fa=lay.getSource().getFeatures();					// Point at all features
 					for (j=0;j<fa.length;++j)								// For each one
 						if (fa[j].getId() == id)							// A match for id
 							break;											// Quit looking
					var rx=new RegExp(lay.get('kmlId')+":"+j);				// Make patt
        			for (j=0;j<curJson.mobs.length;++j) {					// For each mob				
     					o=curJson.mobs[j];									// Point at mob data
 	 					if (o.marker && o.marker.match(rx)) {				// If a feature kml:feature match
 	 						id="Mob-"+j;									// Point at mov with info
 	 						break;
 	 						}
 	 					}
 	 				}
     			if (id.match(/Mob-/)) {										// If a mob
  					o=curJson.mobs[id.substr(4)];							// Point at mob data
 					if (o.title) 		var title=o.title;					// Lead with title
  					if (o.spaceTitle) 	var title=o.spaceTitle;				// Space over-rides
 					if (o.desc) 		var desc=o.desc;					// Lead with desc
  					if (o.spaceDesc) 	var desc=o.spaceDesc;				// Space over-rides
  					if (o.pic) 			var pic=o.pic;						// Lead with pic
  					if (o.spacePic) 	var title=o.spacePic;				// Space over-rides
       				if (o.citation)											// If a cite
			    	desc+="<br><br><div id='popcite' class='popup-cite'>__________________<br><br>"+o.citation+"</div>"; // Add cite
     				_this.pop.ShowPopup(_this.div,_this.timeFormat,evt.pixel[0],evt.pixel[1],title,desc,pic,o.start,o.end);
					if (o.start)											// If a time defined
						_this.SendMessage("time",o.start);					// Send new time
					if (o.click) {											// If a click defined
						v=o.click.split("|");								// Divide into individual actions
						for (j=0;j<v.length;++j) {							// For each action
							a=v[j].split(":");								// Opcode, payload split
							if (a[0])										// At least a command
							_this.SendMessage(a[0].trim(),v[j].substr(a[0].length+1));	// Show item on map
							}
						}	
					}
			  	} 
			else 															// No feature found
				ClearPopUps();												// Clear any existing pop
			});

	this.map.on('pointermove', function(e) {								// ON MOUSE MOVE
		if (e.dragging) {													// If dragging
			ClearPopUps();													// Clear any existing pop
	    	return;															// Quit
	  		}
	  	var pixel=_this.map.getEventPixel(e.originalEvent);					// Get pos
	  	var hit=_this.map.hasFeatureAtPixel(pixel);							// Anything there?
	  	$(_this.div).css("cursor",hit ? "pointer" : "");					// Change cursor
		});
}

Space.prototype.ClearLayers=function( ) 							// CLEAR MAP LAYERS					
{

/*
 	Clears all layers/features added to map.
*/
	var i,o;
	for (i=0;i<this.overlays.length;++i) {								// For each overlay
		o=this.overlays[i];												// Point at it
		if (o.type == "kml") 											// KML 
			this.map.getLayers().remove(o.src);							// Remove layer
		} 
	this.markerLayer.getSource().clear(true);							// Clear all markers
	this.overlays=[];													// All gone
}


Space.prototype.ShowProgress=function()									// SHOW RESORCE LOAD PROGRESS
{

/* 
 	Shows progress of resource loading.
 	Set the contents of a div with id "#SloadProgress" 
*/

 	var str="";
 	this.loadCounter--; 													// Dec
	if (this.loadCounter)													// If stuff to load
		str=this.loadCounter+" resources to load";							// Set progress
	$("#SloadProgress").text(str);											// Show status
 }	
 
				
Space.prototype.SendMessage=function(cmd, msg) 							// SEND MESSAGE
{
	
/* 
 	Semd HTML5 message to parent.
*/
	
	var str="Space="+cmd;													// Add src and window						
	if (msg)																// If more to it
		str+="|"+msg;														// Add it
	if (window.parent)														// If has a parent
		window.parent.postMessage(str,"*");									// Send message to parent wind
	else																	// Local	
		window.postMessage(str,"*");										// Send message to wind
}


//////////////////////////////////////////////////////////////////////////////////////////////////
// GEO-REFERENCE
/////////////////////////////////////////////////////////////////////////////////////////////////


Space.prototype.GeoReference=function(url, where)						// GEO REFERENCE IMAGE
{
	var n,s,e,w,r,asp;
	var _this=this;															// Context for callbacks
	var mapWid=$(this.div).width();											// Map width
	var mapHgt=$(this.div).height();										// Map height
	$("#dialogDiv").remove();												// Close dialog
	pop.Sound("click",curJson.muteSound);									// Click sound							
	var str="<table>";
	str+="<tr><td>Image&nbsp;URL&nbsp;</td><td><input id='grurl' class='ve-is' style='width:220px' type='input'></td></tr>";
	str+="<tr><td>North</td><td><input id='grn' class='ve-is' style='width:80px' type='input'></td></tr>";
	str+="<tr><td>South</td><td><input id='grs' class='ve-is' style='width:80px' type='input'></td></tr>";
	str+="<tr><td>East</td><td><input id='gre' class='ve-is' style='width:80px' type='input'></td></tr>";
	str+="<tr><td>West</td><td><input id='grw' class='ve-is' style='width:80px' type='input'></td></tr>";
	str+="<tr><td>Rotation</td><td><input id='grr' class='ve-is' style='width:80px' type='input'></td></tr>";
	str+="<tr><td>Combined</td><td><input id='grc' class='ve-is' style='width:220px' type='input'></td></tr>";
	str+="<tr><td>Opacity</td><td><div id='gra'></div></td></tr>";
	str+="<tr><td colspan=2><br></td><tr>";
	str+="<tr><td></td><td><button id='grstart' class='ve-bs'>Geo-reference</button><td></td><tr>";
	str+="</table>";
	this.pop.Dialog("Geo-reference image",str, function() {					// On OK
				CloseGeoRef();												// Close out
				}, 
				function() {												// On cancel
				CloseGeoRef();												// Close out
				});
	$("#dialogDiv").dialog("option","position", { at: "center center", of: "#rightDiv" })

	if (where) {															// If a where defined
		v=where.split(",");													// Get parts
		n=v[0];	s=v[1];	e=v[2];	w=v[3];	r=v[4];								// Set
		}
	$("#grn").val(n);	$("#grs").val(s); 	$("#grr").val(r);				// Init n/s/r
	$("#gre").val(e);	$("#grw").val(w);	$("#grurl").val(url);			// e/w/url
	$("#gra").slider({ value:100, slide: function(e,ui) { 					// Init alpha slider
		if (_this.geoRef)	_this.geoRef.a=ui.value/100; 					// If georef up. set val
			_this.DrawMapLayers();											// Redraw map
		 }});									
	if (n)																	// If north set
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined

	$("#grn").on("change",function() {										// NORTH CHANGED
		n=$(this).val();													// Get value
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined
		});		
	
	$("#grs").on("change",function() {										// SOUTH CHANGED
		s=$(this).val();													// Get value
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined
		});		
	$
	("#gre").on("change",function() {										// EAST CHANGED
		e=$(this).val();													// Get value
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined
		});		
	
	$("#grw").on("change",function() {										// WEST CHANGED
		w=$(this).val();													// Get value
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined
		});		
	
	$("#grr").on("change",function() {										// ROTATION CHANGED
		r=$(this).val();													// Get value
		$("#grc").val(n+","+s+","+e+","+w+","+r);							// Combined
		});		

	$("#grstart").click( function() {										// START CLICK
		_this.geoRef={ a:1 };												// Create georef obj
		_this.geoRef.img=new Image();										// Make new img
		_this.geoRef.img.src=url;											// Set  url
		_this.geoRef.img.onload=function() {								// Whwn loaded
			if (!$("#grn").val()) {											// If no north. start from fresh
				asp=_this.geoRef.img.height/_this.geoRef.img.width;			// Get aspect ratio													
				var bot=(mapHgt*.25)+(mapWid*.5*asp);						// Calc bottom
				var nw=_this.map.getCoordinateFromPixel([mapWid*.25,mapHgt*.25]);// NW corner
				var se=_this.map.getCoordinateFromPixel([mapWid*.75,bot]);	// SE corner
				nw=ol.proj.transform(nw,_this.curProjection,"EPSG:4326"); 	// Project coord
				se=ol.proj.transform(se,_this.curProjection,"EPSG:4326"); 	// Project 
				n=nw[1];	s=se[1];	e=se[0];	w=nw[0];	r=0;		// New points
				$("#grc").val(n+","+s+","+e+","+w+","+r);					// Combined
				$("#grn").val(n);	$("#grs").val(s); 	$("#grr").val(r);	// Init n/s/r
				$("#gre").val(e);	$("#grw").val(w);						// e/w
				}
			_this.geoRef.img=new MapImage(url,$("#grc").val(),_this);		// Replace image with new MapImage obj
			_this.DrawMapLayers();											// Redraw map

	if (!_this.drawLayer) {													// If not already there
		_this.drawLayer=new ol.FeatureOverlay({ source: new ol.source.Vector() } );	// Feature overlay for georef
		_this.drawLayer.setMap(_this.map);									// Add to map
		}
	asp=(n-s)/(e-w);														// Calc image asp
	SetControlDots(true);													// Starter dots

	_this.geoRef.pUp=_this.map.on('pointerup',function(e) {					// ON MOUSE UP
		if (_this.geoRef) 													// If geo referencing
			ReDrawImage();													// Redraw image
			});															 

	_this.geoRef.pDrag=_this.map.on('pointerdrag',function(evt) {			// ON MOUSE DRAG
		if (_this.geoRef) {													// If geo referencing
			var id;
			var shift=ol.events.condition.shiftKeyOnly(evt);				// Shift key status
			var p=ol.proj.transform(evt.coordinate,_this.curProjection,"EPSG:4326"); // Project cur coord
			_this.map.forEachFeatureAtPixel(evt.pixel,function(f) {			// Look at features
				id=f.getId();												// Get id of feature
				if (id == "georef0") {										// Move all dots
					var w2=Math.abs(e-w)/2;									// Get width
					var h2=Math.abs(n-s)/2;									// Get height
					w=p[0]-w2;												// Set W
					e=p[0]+w2;												// Set E
					n=p[1]+h2;												// Set N
					s=p[1]-h2;												// Set S
					}
				else if (id == "georef1") {									// NW
					w=p[0];													// Set W
					n=((e-w)*asp)+(s-0);									// Set N
					if (shift)												// If shift key											
						n=p[1];												// Distort aspect
					}
				else if (id == "georef2") {									// NE
					e=p[0];													// Set E
					n=((e-w)*asp)+(s-0);									// Set N
					if (shift)												// If shift key											
						n=p[1];												// Distort aspect
					}
				else if (id == "georef3") {									// SE
					e=p[0];													// Set E
					s=n-((e-w)*asp);										// Set S
					if (shift)												// If shift key											
						s=p[1];												// Distort aspect
					}
				else if (id == "georef4") {									// SW
					w=p[0];													// Set W
					s=n-((e-w)*asp);										// Set S
					if (shift)												// If shift key											
						s=p[1];												// Distort aspect
					}
				ReDrawImage(true);											// Redraw image only, not the dots
				});															// Each feature
			}
		});															 
		
	};
});

	function CloseGeoRef()												// CLOSE UP GEOREFERENCING
	{	
		if (_this.drawLayer) {												// If drawlayer set
			_this.drawLayer.getFeatures().clear();							// Clear existing points
			_this.map.unByKey(_this.geoRef.pDrag)							// Remove drag handler
			_this.map.unByKey(_this.geoRef.pUp)								// Remove mouse up handler
			}
		if (_this.geoRef && _this.geoRef.modify)							// If modify set
			_this.map.removeInteraction(_this.geoRef.modify);				// Remove int
		if (_this.geoRef)													// If set
			delete _this.geoRef.img;										// Remove added pic
		_this.geoRef=null;													// Kill georef
		_this.DrawMapLayers();												// Redraw map
	}
	
	function ReDrawImage(noDots)										// REDRAW MAP
	{
		var pos=n+","+s+","+e+","+w+","+r;									// Make where
		_this.geoRef.img=new MapImage(url,pos,_this);						// Reset map image
		_this.DrawMapLayers();												// Redraw map
		$("#grn").val(n);		$("#grs").val(s);	$("#grc").val(pos);		// N/S/C
		$("#gre").val(e);		$("#grw").val(w); 	$("#grr").val(r);		// E/W/R
		if (!noDots)														// If moving dots too
			SetControlDots();												// Reset control dots
		}
	
	function SetControlDots(init)										// SET GEO REFERENCE CONTROL DOTS
	{
		var i,p=[];
		var o=_this.geoRef;													// Point at georef data
		if (o.modify)														// If interaction initted													
			_this.map.removeInteraction(o.modify);							// Remove it
			_this.map.addInteraction( o.modify=new ol.interaction.Modify({	// Add modify interaction
				features: _this.drawLayer.getFeatures()						// Point at features
				})
			);

		if (init) {															// If initting
			o.pts=[{},{},{},{},{}];											// Holds dots
			_this.drawLayer.getFeatures().clear();							// Clear existing points
			var sty=new ol.style.Style({									// Create  dot style
		     	image: new ol.style.Circle({								// Circle
		     		radius:8,												// Size
					fill: new ol.style.Fill({								// Fill						
						color: "rgba(230,120,30,0.7)"	     				// Orange
		   				})
			   		})
				})
			}
	
		o.pts[0].x=w+Math.abs(e-w)/2;										// CX
		o.pts[0].y=s+Math.abs(n-s)/2;										// CY
		o.pts[1].x=w-0;	o.pts[1].y=n-0;										// NW
		o.pts[2].x=e-0;	o.pts[2].y=n-0;										// NE
		o.pts[3].x=e-0;	o.pts[3].y=s-0;										// SE
		o.pts[4].x=w-0;	o.pts[4].y=s-0;										// SW
				
		var ar=r*Math.PI/180.0;												// Angle to radians
		var sin=Math.sin(ar);												// Get sine
		var cos=Math.cos(ar);												// Get cosine
		var cx=o.pts[0].x;													// Center x
		var cy=o.pts[0].y;													// Center x

		for (i=0;i<5;++i) {													// For each dot
 			p[0]=cx+(o.pts[i].x-cx)*cos-(cy-o.pts[i].y)*sin;				// Rotate x
			p[1]=cy+(o.pts[i].x-cx)*sin+(cy-o.pts[i].y)*cos;				// Rotate y
		   	p=ol.proj.transform(p,"EPSG:4326",_this.curProjection);			// Project
  			if (init) {														// If initting dots
				o.pts[i].f=new ol.Feature(new ol.geom.Point(p));			// Add feature
				o.pts[i].f.setId("georef"+i);								// Add id
				o.pts[i].f.setStyle(sty);									// Set feature
				_this.drawLayer.addFeature(o.pts[i].f);						// Add feature to layer
				}
			else															// Just moving them
				o.pts[i].f.getGeometry().setCoordinates(p);					// Set geometry
			}
		}
}																			// End georef

//////////////////////////////////////////////////////////////////////////////////////////////////
// DRAWING
/////////////////////////////////////////////////////////////////////////////////////////////////


Space.prototype.DrawingTool=function()									// DRAWING TOOL
{
	var _this=this;															// Context for callbacks
	$("#dialogDiv").remove();												// Close dialog
	if (!this.drawData) 													// If 1st time
		this.drawData={ col:"#ff9900",ecol:"",a:1.0,						// Init it
						ewid:2,id:"",lab:"",type:"Choose" 
						};	
	var str="<table><tr><td>Type</td><td>"+MakeSelect("drtype",false,["Choose", "Shape","Line"],"Choose");
	str+="<tr><td>Color</td><td><input id='drcol' class='ve-is' style='width:60px' type='input'></td></tr>";
	str+="<tr><td>Edge&nbsp;color&nbsp;</td><td><input id='drecol' class='ve-is' style='width:60px' type='input'>";
	str+="&nbsp;&nbsp;&nbsp;Width&nbsp;&nbsp;<input id='drewid' class='ve-is' style='width:30px' type='input'></td></tr>";
	str+="<tr><td>ID</td><td><input id='drid' class='ve-is' style='width:60px' type='input'></td></tr>";
	str+="<tr><td>Label</td><td><input id='drlab' class='ve-is' style='width:220px' type='input'></td></tr>";
	str+="<tr><td>Opacity</td><td><div id='dralpha'></div></td></tr>";
	str+="<tr><td colspan=2><br></td><tr>";
	str+="<tr><td>Options</td><td><button id='drsave' class='ve-bs'>Save</button>";
	str+="<button id='drload' style='margin-left:12px;margin-right:12px' class='ve-bs'>Load</button>";
	str+="<button id='drclear' class='ve-bs'>Clear all</button>";
	str+="<button id='drupdate' style='display:none' class='ve-bs'>Update seg</button>";
	str+="<button id='drdelete' style='display:none;margin-left:12px' class='ve-bs'>Clear seg</button></td><tr>";
	str+="</tr></table>";
	this.pop.Dialog("VisualEyes drawing tool",str, function() {				// On OK
				CloseDrawing();												// Close out
				}, 
				function() {												// On cancel
				CloseDrawing();												// Close out
				});
	$("#dialogDiv").dialog("option","position", { at: "center center", of: "#rightDiv" })

	$("#drcol").val(this.drawData.col);										// Init 
	$("#drecol").val(this.drawData.ecol);										
	$("#drewid").val(this.drawData.ewid);										
	$("#drid").val(this.drawData.id);										
	$("#drlab").val(this.drawData.lab);										
	$("#drtype").val(this.drawData.type);										
	this.pop.ColorPicker("drcol","",true);									// Init color
	this.pop.ColorPicker("drecol","",true);									// Init edge color
	$("#dralpha").slider({ value:_this.drawData.a*100,						// Init alpha slider
								slide: function(e,ui) { 				
									_this.drawData.a=ui.value/100;
									}
							});

	if (this.drawData.modifyInter)											// If defined
		 this.map.removeInteraction(this.drawData.modifyInter); 			// Remove it
	if (this.drawData.drawInter)											// If defined
		this.map.removeInteraction(this.drawData.drawInter); 				// Remove it
	if (this.drawingLayer)
		this.map.getLayers().remove(this.drawingLayer);						// Remove layer
	this.drawingLayer=new ol.layer.Vector({source: new ol.source.Vector()}); // Create box layer
	this.map.addLayer(this.drawingLayer);									// Add to map	
	this.featureSelect.setActive(true);										// Turn select on
	DrawEditFeature();														// Assume we're drawing

	function DrawEditFeature()
	{
		_this.drawData.curFeature=null;										// No current feature
		if (_this.drawData.modifyInter)										// If modify defined
			_this.map.removeInteraction(_this.drawData.modifyInter); 		// Remove it
		if (_this.drawData.drawInter) 										// If draw defined
			_this.map.removeInteraction(_this.drawData.drawInter); 			// Remove old one
		
		if (_this.drawData.type == "Choose") {								// If editing
			_this.map.addInteraction(_this.drawData.modifyInter=new ol.interaction.Modify({		// Add modify
			 		features: _this.featureSelect.getFeatures(),			// Point at features
				  	deleteCondition: function(e) {							// On delete
						var id;
						if (ol.events.condition.altKeyOnly(e) && ol.events.condition.singleClick(e)) {	// If alt-click
							map.forEachFeatureAtPixel(e.pixel,function(f) {	// Look at features
								id=f.getId();								// Get id
								if (id && id.match(/SEG-/)) {				// If a drawn seg
									_this.pop.Sound("delete");				// Delete sound
									_this.drawingLayer.getSource().removeFeature(f);// Remove it
									}
								});
							}
						var state=(ol.events.condition.shiftKeyOnly(e) && ol.events.condition.singleClick(e));	// Shift-click
						if (state)											// Deleting
							_this.pop.Sound("delete");						// Delete sound
		  	    		return state;										// Return state
			  			}	
					})
				);
	      	return;
			}
						
		var col,ecol,vis,evis,type;
		if (_this.drawData.type == "Line")			type="LineString";		// Line
		else if (_this.drawData.type == "Marker")	type="Point";			// Marker
		else if (_this.drawData.type == "Shape")	type="Polygon";			// Shape
		_this.map.addInteraction(_this.drawData.drawInter=new ol.interaction.Draw({	// Add draw tool
					source: _this.drawingLayer.getSource(),					// Set source
					type: type })											// Set type of drawing
					);
		_this.drawData.drawInter.on('drawstart', function(e) {				// ON START
	  			if (type != "Point")										// Not on points
	  				_this.drawData.inOpenDraw=e;							// Set flag
	  			});
		_this.drawData.drawInter.on('drawend', function(e) {				// ON END								
		 		col=$("#drcol").val();										// Get col
		 		ecol=$("#drecol").val();									// Get ecol
		 		vis=evis=_this.drawData.a;									// Get a
		 		e.feature.setId("SEG-"+Math.floor(Math.random()*999999));	// Set unique id
				if (col == "") 		vis=0,col=0;							// Hide fill
				if (ecol == "") 	evis=0,ecol=0;							// Hide edge
				if ((type == "LineString") && !evis) {						// Make sure linestring has color
			 		evis=_this.drawData.a;									// Get a
					ecol=col;												// Use main color
					}
				if (type == "Point") sty=new ol.style.Style({				// Alloc text style
					   image: new ol.style.Circle( {						// Draw circle
					      		radius: $("#drewid").val(),					// Ewid controls size
					      		fill: new ol.style.Fill({
					      			color: Hex2RGBAString(col,_this.drawData.a)
					      			})
					      		}),
				      text:	new ol.style.Text( {						// Text style
						    	textAlign: "left", textBaseline: "middle",	// Set alignment
						    	font: "bold 14px Arial",					// Set font
						    	text: $("#drlab").val(),					// Set label
					   	 		fill: new ol.style.Fill({color: $("#drecol").val() ? $("#drecol").val() : "#fff" }),	// Set text color
						    	stroke: new ol.style.Stroke( { color: "#666", width: 1 }),	// Set edge		   
								offsetX: $("#drewid").val()-0+8				// Set offset
						 		})
							});
				else sty=new ol.style.Style( {								// Alloc style								
						fill: 	new ol.style.Fill(	 { color: Hex2RGBAString(col,vis) } ),									// Fill
						stroke: new ol.style.Stroke( { color: Hex2RGBAString(ecol,evis), width:_this.drawData.ewid-0 } )	// Edge
						});
	 			e.feature.setStyle(sty);									// Add style to last one added
	 			_this.drawData.inOpenDraw=null;								// Kill flag
	 			_this.drawData.type="Choose";								// Choose mode
		 		$("#drtype").val(_this.drawData.type);						// Reset selector
				DrawEditFeature();										// Reset interaction
	 		});	
 	 	}

	$("#dialogDiv").click(function(e) {										// CLICK ON DIALOG TO END DRAWING
		if (_this.drawData.inOpenDraw) 										// If sketching
 			_this.drawData.drawInter.finishDrawing();						// Close drawing
		});

	function CloseDrawing() {												// CLOSE DRAWING DIALOG
		_this.drawData.col=$("#drcol").val();								// Set draw data
		_this.drawData.ecol=$("#drecol").val();								// Set draw data
		if (_this.drawData.modifyInter)										// If defined
			 _this.map.removeInteraction(_this.drawData.modifyInter); 		// Remove it
		if (_this.drawData.drawInter)										// If defined
			 _this.map.removeInteraction(_this.drawData.drawInter); 		// Remove it
		if (_this.drawingLayer)												// If defined
			_this.map.getLayers().remove(_this.drawingLayer);				// Remove layer
		_this.featureSelect.setActive(false);								// Turn select off
		_this.DrawMapLayers();												// Redraw map to clear
		}
	
	this.featureSelect.getFeatures().on("change:length", function(e) {		// ON FEATURE SELECT
		var col,ecol,ewid,lab="",a=1,v,s;
		var f=e.target.item(0);
		if (f)	s=f.getStyle();
		else{
			_this.drawData.curFeature=null;									// No active feature
			$("#drtype").val("Choose");										// Set type to choose
			$("#drsave").show();											// Show button
			$("#drload").show();											// Show button
			$("#drclear").show();											// Show button
			$("#drdelete").hide();											// Hide delete button
			$("#drupdate").hide();											// Hide update button
			}
		if (s) {
			if (!_this.drawData.inOpenDraw)									// If not drawing
				_this.pop.Sound("click");									// Click sound
			_this.drawData.curFeature=f;									// Set current feature
			$("#drsave").hide();											// Hide button
			$("#drload").hide();											// Hide button
			$("#drclear").hide();											// Hide button
			$("#drdelete").show();											// Show delete button
			$("#drupdate").show();											// Show update button
	
			if (s.getFill()) {												// Has fill
				col=rgb2hex(s.getFill().getColor());						// Get color
				a1=s.getFill().getColor().split(",")[3];					// Get alpha
				a1=("")+a1.substr(0,a1.length-1)-0;							// Strip paren
				}
			if (s.getStroke()) {											// Has stroke
				ecol=rgb2hex(s.getStroke().getColor())
				a2=s.getStroke().getColor().split(",")[3];
				a2=("")+a2.substr(0,a2.length-1)-0;							// Strip paren
				ewid=s.getStroke().getWidth();								// Set width
				}
			if (s.getText()) {												// If has text
				lab=s.getText().getText();									// Get marker
				col=rgb2hex(s.getImage().getFill().getColor());				// Get circle color
				a3=s.getImage().getFill().getColor().split(",")[3];			// Get alpha
				a3=("")+a3.substr(0,a3.length-1)-0;							// Strip paren
				ewid=s.getImage().getRadius();								// Get marker width
				}
			if (f.getGeometry().getType() == "LineString") {				// Line
				$("#drtype").val("Line");									// Set type
				$("#drecol").val(_this.drawData.ecol=ecol);					// Ecol
				_this.pop.ColorPicker("drecol","",true);					// Init edge color
				$("#drewid").val(_this.drawData.ewid=ewid);					// Set wid
				a=a2;														// Use alpha from stroke
				}
			else if (f.getGeometry().getType() == "Polygon") {
				$("#drtype").val("Shape");									// Set type
				$("#drcol").val(_this.drawData.col=col);					// Col
				_this.pop.ColorPicker("drcol","",true);						// Init color
				if (a2) 													// If a visible edge
					$("#drecol").val(_this.drawData.ecol=ecol);				// Use ecol
				else														// No edge
					$("#drecol").val(_this.drawData.ecol="");				// Use null
				_this.pop.ColorPicker("drecol","",true);					// Init edge color
				$("#drewid").val(_this.drawData.ewid=ewid);					// Set wid
				a=a1;														// Use alpha from fill
				}
			else if (f.getGeometry().getType() == "Point") {				// A marker
				$("#drtype").val("Marker");									// Set type
				$("#drcol").val(_this.drawData.col=col);					// Col
				_this.pop.ColorPicker("drcol","",true);						// Init color
				$("#drlab").val(_this.drawData.lab=lab);					// Set label
				$("#drewid").val(_this.drawData.ewid=ewid);					// Set wid
				a=a3;														// Alpha from circle
				}
			_this.drawData.a=a;											// Set alpha
			$("#dralpha").slider("option","value",a*100);					// Set slider
			}
		});

	function Hex2RGBAString(col, alpha)	{									// 0XRRGGBB -> rgb() STRING	
		var r=0,g=0,b=0;
		if (col) {															// If a col
			if (col.length == 4) col+=col.substr(1,3);						// Turn #555 into #55555
			r=parseInt(col.substr(1,2),16);
			g=parseInt(col.substr(3,2),16);
			b=parseInt(col.substr(5,2),16);
			}
		return("rgba("+r+","+g+","+b+","+alpha+")");						// Make rgb()
	}

	function rgb2hex(rgb){
	 	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	 	return (rgb && rgb.length === 4) ? "#" +
	 	 ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		 ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	 	 ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	}

	$("#drcol").on("click", function() {									// COLOR HANDLER
		pop.ColorPicker("drcol");											// Set color
		}); 
	
	$("#drecol").on("click", function() {									// EDGE COLOR HANDLER
		pop.ColorPicker("drecol");											// Set edge color
		}); 
	
	$("#drewid").on("change", function() {									// EDGE WIDTH HANDLER
		_this.drawData.ewid=$(this).val();									// Set draw data
		}); 
	
	$("#drid").on("change", function() {									// ID HANDLER
		_this.drawData.id=$(this).val();									// Set draw data
		}); 
	
	$("#drlab").on("change", function() {									// LAB HANDLER
		_this.drawData.lab=$(this).val();									// Set draw data
		}); 
	
	$("#drtype").on("change", function() {									// TYPE HANDLER
		_this.drawData.type=$(this).val();									// Set draw data
		DrawEditFeature();													// Reset interaction
		}); 
 
 	$("#drsave").on("click", function() {									// SAVE HANDLER
		var i,f,features=[];													
		var a=_this.drawingLayer.getSource().getFeatures();					// Get features drawn
	    for (i=0;i<a.length;++i) {											// For each feature
	        f=a[i].clone();													// Clone feature
	        f.setId("KF-"+i);  												// Set id
	      	f.getGeometry().transform("EPSG:3857","EPSG:4326");				// Project
	        features.push(f);												// Add to list
	    	}
		var node=new ol.format.KML().writeFeaturesNode(features);			// Format as KML/XML
    	var kml=new XMLSerializer().serializeToString((node));				// Serialize as string
		SaveUserData(kml,"KML");											// Login and save
		}); 

	$("#drload").on("click", function() {									// LOAD HANDLER
		GetUserData("KML");													// Login and load into  LoadUserData()
		}); 

 	$("#drdelete").on("click", function() {									// DELETE HANDLER
		if (_this.drawData.curFeature) {									// If a feature
			 _this.drawingLayer.getSource().removeFeature(_this.drawData.curFeature);	// Delete it
			_this.pop.Sound("delete");										// Delete sound
			_this.DrawMapLayers();											// Redraw map
			_this.drawData.curFeature=null;									// Not there anymore
			}
		}); 
		
	$("#drupdate").on("click", function() {									// UPDATE HANDLER
		if (!_this.drawData.curFeature) 									// If not a feature
			return;															// Quit
		var s=_this.drawData.curFeature.getStyle();							// Get style
		if (s && s.getFill())												// If a fill set
			s.getFill().setColor(Hex2RGBAString($("#drcol").val(),_this.drawData.a));	// Set fill color
		if (s && s.getStroke())	{											// If a stroke set
			if ($("#drecol").val())
				s.getStroke().setColor(Hex2RGBAString($("#drecol").val(),_this.drawData.a));	// Set stroke color
			else
				s.getStroke().setColor(Hex2RGBAString("#000000",0));		// Set stroke invisible
			s.getStroke().setWidth($("#drewid").val()-0);					// Set stroke width
			}
		if (s && s.getText()) {												// If a text set
				s=new ol.style.Style({										// Alloc text style
		      		image: new ol.style.Circle( {							// Draw circle
		      		radius: $("#drewid").val(),								// Ewid controls size
		      		fill: new ol.style.Fill({
		      				color: Hex2RGBAString($("#drcol").val(),_this.drawData.a)
		      				})
		      			}),
		     	 	text:	new ol.style.Text( {							// Text style
			    	textAlign: "left", textBaseline: "middle",				// Set alignment
			    	font: "bold 12px Arial",								// Set font
			    	text: $("#drlab").val(),								// Set label
			   	 	fill: new ol.style.Fill({color: $("#drecol").val() ? $("#drecol").val() : "#fff" }),	// Set text color
			    	stroke: new ol.style.Stroke( { color: "#666", width: 1 }),	// Set edge		   
					offsetX: $("#drewid").val()-0+8							// Set offset
			 		})
				});
			}
		_this.drawData.curFeature.setStyle(s);								// Reset style
		_this.pop.Sound("click");											// Click sound
		}); 

  	$("#drclear").on("click", function() {									// CLEAR HANDLER
		pop.ConfirmBox("This will remove all the drawing on the screen.",	// Are you sure?
			function() {													// Clear
				_this.drawingLayer.getSource().clear(); 					// Clear all features
				_this.DrawMapLayers();										// Redraw map
				 });		
		}); 

}

