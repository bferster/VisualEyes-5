////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPACE.JS 
// Provides mapping componant
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Space()														// CONSTRUCTOR
{
	this.controlKey=this.shiftKey=false;									// Shift/control key flags
	this.showBoxes=false;													// Show boxes
	this.showRoads=false;													// Hide Roads/borders
	this.showScale=true;													// Show scale
	Sound("click","init");													// Init sound
	Sound("ding","init");													// Init sound
	Sound("delete","init");													// Init sound
	this.overlays=[];														// Holds overlay layers
}

Space.prototype.InitMap=function(div)									// INIT OPENLAYERS MAP
{
	this.controlKey=this.shiftKey=false;									// Shift/control key flags
	this.showBoxes=false;													// Show boxes
	this.showRoads=false;													// Hide Roads/borders
	this.showScale=true;													// Hide or show scale
	this.baseLayer="Roadmap";												// Default layer
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

    this.map=new ol.Map( { target: div,										// Alloc OL
        layers:this.layers,													// Layers array									
        controls: ol.control.defaults({										// Controls
				}).extend([ new ol.control.ScaleLine() ]),					// Add scale
        view: new ol.View({													// Views
          		center: ol.proj.transform( [-77,34],'EPSG:4326',this.curProjection),
          		minZoom: 2, maxZoom: 16, zoom: 3 })
		});

   	for (i=0;i<this.layers.length;++i) 										// For each layer
	    this.layers[i].set('visible',this.layers[i].get("title") == this.baseLayer); // Set visibility
  	this.CreateOverlayLayer();												// Canvas and vector layer for map overlays
  	var _this=this;															// Save context for callback
   	
	this.map.on('moveend', function(e) {									// On end of move
      	_this.DrawMapLayers();												// Redraw maps in new extent, if moved
		var o=_this.map.getView();											// Point at view
		var c=ol.proj.transform(o.getCenter(),_this.curProjection,'EPSG:4326');	// Get center
		var pos=Math.floor(c[1]*10000)/10000+"|"+Math.floor(c[0]*10000)/10000+"|"+o.getZoom()+"|";	
		pos+=Math.floor((o.getRotation()*180/Math.PI)*1000)/-1000;			// Rotation
		if (SendShivaMessage)												// If function spec'sd
			SendShivaMessage("Space=move",pos);								// Send that view has changed
		});
	}	


Space.prototype.UpdateMapSize=function() 								// UPAFE MAP SIZE
{
	if (this.map)															// If OL initted
		mps.map.updateSize();												// Update map
}


Space.prototype.Goto=function(pos)										// SET VIEWPOINT
{
	var speed=1;															// Default speed
	if ((!pos) || (pos.length < 5))											// No where to go
		return;																// Quit
	pos=pos.replace(/"/g,"");												// Remove quotes
	var v=pos.split(",");													// Split up
	var o=this.map.getView();												// Point at view
	var c=ol.proj.transform([v[0]-0,""+v[1].replace(/\*/,"")-0],'EPSG:4326',this.curProjection);	// Get center
	var fc=o.getCenter();													// Get from center
	var fr=o.getRotation();													// Get from rotation		
	var fs=o.getResolution();												// Get from resolution
	var r=-v[4]*Math.PI/180;												// Get to rotation	
	if ((Math.abs(fc[0]-c[0]) < 2) && (Math.abs(fc[1]-c[1]) < 2)			// Center match
			&& (Math.abs(fs-v[2]) < 2) && (Math.abs(fs-v[2]) < 2)			// Resolution  match
			&& (Math.abs(fr-r) < 1) && (Math.abs(fr-r) < 1)					// Rotation  match
			)																// Already there
		return;																// Quit
	var duration=2000;														// Duration
	var start=+new Date();													// Start time
	var pan=ol.animation.pan({												// Pan
	    duration: duration,													// Duration
	    source: fc,															// Start value
	    start: start														// Starting time
	  	});
	var rotate=ol.animation.rotate({										// Rotate
	    duration: duration,													// Duration
	    rotation: fr,														// Start value
	    start: start														// Starting time
	  	});
	 var bounce=ol.animation.bounce({										// Fly bounce
	    duration: duration,													// Duration
	    resolution: Math.min(4*o.getResolution(),2000),						// End value
	    start: start														// Starting time
	  });
  	this.map.beforeRender(pan,rotate);										// Pan, rotate
	o.setResolution(v[2]);													// Set resolution								
	o.setCenter(c);															// Set center
	o.setRotation(v[3]);													// Set rotation								
	}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMAGE OVERLAY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Space.prototype.ShowLayers=function(indices, mode)						// HIDE/SHOW LAYER(s)				
{ 
	
/* HIDE/SHOW LAYER(s)
 * @param {array} 	indices An array of indices specifying the layer(s) to hide or show.
 * @param {boolean}	mode true to show, false to hide.
*/

	var i;
	for (i=0;i<indices.length;++i) 											// For each index
		if ((indices[i] >= 0) && (indices[i] < this.overlays.length))		// If in range
			this.overlays[indices[i]].vis=mode;								// Set vis       
	this.DrawMapLayers();													// Do it
}

Space.prototype.AddKMLLayer=function(url) 								// ADD KML LAYER TO MAP						
{

/* 	ADD KML LAYER TO MAP
  	@param {string} 	url URL of kml file
  	@return {number}	index of new layer added to overlays array.
*/

	var o={};
   	var _this=this;															// Save context for callback
	if (url && url.match(/\/\//)) 											// If cross-domain
		url="proxy.php?url="+url;											// Add proxy

	var index=this.overlays.length;											// Get index
 	o.type="kml";															// KML
 	o.vis=0;																// Visible
	o.src=new ol.layer.Vector({  source: new ol.source.KML({				// New layer
							title: "LAYER-"+this.overlays.length,			// Set name
				   			projection: ol.proj.get(this.curProjection),	// Set KML projection
				    		url: url										// URL
				  			})
						});
	
	o.src.set('visible',false)												// Hide it
	this.overlays.push(o);													// Add to overlay
	mps.loadCounter++;														// Add to count
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
						f: {string} fill color "rrggbb"
						s: {string} stroke color "rrggbb"
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
		  	r=parseInt("0x"+s.f.substr(0,2),16);							// R
			g=parseInt("0x"+s.f.substr(2,2),16);							// G
			b=parseInt("0x"+s.f.substr(4,2),16);							// B
	  		var fill=new ol.style.Fill({ color: [r,g,b,s.a ? s.a : 1]});	// Create fill with alpha
	  		}
	  	if (s.s) {															// If stroke spec'd	
		  	r=parseInt("0x"+s.s.substr(0,2),16);							// R
			g=parseInt("0x"+s.s.substr(2,2),16);							// G
			b=parseInt("0x"+s.s.substr(4,2),16);							// B
	  		var stroke=new ol.style.Stroke({ color: [r,g,b,s.a ? s.a : 1], width:s.w });	// Create stroke with alpha & width
			}
		sty=new ol.style.Style({ fill:fill,stroke:stroke });				// Create style
		if (s.n == "*")														// If styling them all
			features[i].setStyle(sty);										// Set next feature's style
		else																// Justb styling on spec's bu s.n
			features[s.n].setStyle(sty);									// Set particular feature's style
		}
}


Space.prototype.StyleMarker=function(indices, style)					// STYLE MARKERS(s)			
{
	
/* 
 	@param {array} 	indices An array of indices specifying the marker(s) to hide or show.
	@param {object} style Contains the tyle information for the marker(s):
					a: {number} opacity (0-1)
					f: {string} fill color "rrggbb"
					s: {string} stroke color "rrggbb"
					w: {number} stroke width
					p: {string} popup text
					t: {string} type
					l: {string} label
						
 */
}

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
 
/*   
  var iconStyle = new ol.style.Style({
  image: new ol.style.Icon( ({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    opacity: 0.75,
    src: 'img/tslogo.png'
  }))
});

var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point([0, 0]),
  name: 'Null Island',
  population: 4000,
  rainfall: 500
});
iconFeature.setStyle(iconStyle);
*/ 
 
   
    this.markerLayer=new ol.layer.Vector( {									// Make new vector layer
        source: new ol.source.Vector({
 //       features: [iconFeature]	
        }), 									// Add source
	    projection: this.curProjection										// Projection
	   })
    this.map.addLayer(this.canvasLayer);									// Add layer to map
    this.map.addLayer(this.markerLayer);									// Add layer to map
}


Space.prototype.AddImageLayer=function(url, geoRef) 						// ADD MAP IMAGE TO PROJECT
{    

/* 
  	@param {string} url URL of image file (jpeg, png or gif)
 	@param {string} geoReg Contains bounds for the image "north,south,east,west,rotation".
  					rotation is optional and defaults to 0 degrees.				
  	@return {number}index of new layer added to overlays array.
*/

	var o={};
	var index=this.overlays.length;											// Get index
 	o.type="image";															// Image
 	o.vis=0;																// Visible
    o.src=new MapImage(url,geoRef,this);									// Alloc mapimage obj
	this.overlays.push(o);													// Add layer
	mps.loadCounter++;														// Add to count

	function MapImage(url, geoRef, _this) 								// MAPIMAGE CONSTRUCTOR
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
	
	MapImage.prototype.drawMapImage=function(opacity, _this)               	// DRAW IMAGE
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
	return index;															// Return layer ID
}

/** 
 * DRAW OVERLAY LAYERS
 * Draws or shows overlay elements based on the .vis element.
 */
Space.prototype.DrawMapLayers=function()								
{
	var i,o;
	if (this.canvasContext) {  												// If a canvas up      
		this.canvasContext.clearRect(0,0,this.canvasWidth,this.canvasHeight); // Clear canvas
   		for (i=0;i<this.overlays.length;i++) {								// For each overlay layer
           o=this.overlays[i];												// Get ptr  to layer
            if (o.vis && (o.type == "image"))								// If a visible image 
           		o.src.drawMapImage(o.vis,this);   							// Draw it   
        	else if (o.type == "kml")										// If a kml 
       			o.src.set('visible',o.vis > 0);								// Show/hide it
            }
        }
}


Space.prototype.ShowProgress=function()									// SHOW RESORCE LOAD PROGRESS
{
 	var str="";
 	this.loadCounter--; 													// Dec
	if (this.loadCounter)													// If stuff to load
		str=this.loadCounter+" resources to load";							// Set progress
	$("#STloadProgress").text(str);											// Show status
 }					
