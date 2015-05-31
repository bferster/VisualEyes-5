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
	this.kmlLayers=[];														// Holds KML layers
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
  	this.CreateCanvasLayer();												// Canvas layer for map images
  	var _this=this;															// Save context for callback
   	
	this.map.on('moveend', function(e) {									// On end of move
      	_this.DrawMapLayers();												// Redraw maps in new extent, if moved
		var o=_this.map.getView();											// Point at view
		var c=ol.proj.transform(o.getCenter(),_this.curProjection,'EPSG:4326');	// Get center
		var pos=Math.floor(c[1]*10000)/10000+"|"+Math.floor(c[0]*10000)/10000+"|"+o.getZoom()+"|";	
		pos+=Math.floor((o.getRotation()*180/Math.PI)*1000)/-1000;			// Rotation
		SendShivaMessage("ShivaMap=move",pos);								// Send that view has changed
		});
	}	

Space.prototype.AddKMLLayer=function(mob) 								// ADD KML LAYER TO PROJECT
{
	var u=mob.marker;														
	if (u && u.match(/\/\//)) 												// If cross-domain
		u="proxy.php?url="+u;												// Add proxy

	this.kmlLayers.push(new ol.layer.Vector({  source: new ol.source.KML({	// New layer
							title: "LAYER-"+this.kmlLayers.length,			// Set name
				   			projection: ol.proj.get(this.curProjection),	// Set KML projection
				    		url:u,											// URL
				  			visible:false									// Hide it
				  			})
						}));

	this.map.addLayer(this.kmlLayers[this.kmlLayers.length-1]);				// Add to map	
   	var _this=this;															// Save context for callback
 
	this.kmlLayers[this.kmlLayers.length-1].getSource().once("change",function() {	// WHEN KML IS LOADED						
       	_this.loadCounter--; 													// Dec
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMAGE OVERLAY
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Space.prototype.CreateCanvasLayer=function()							// CREATE CANVAS LAYER 
{        
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
    this.map.addLayer(this.canvasLayer);									// Add layer to map
}

Space.prototype.MakeMapImage=function(mob) 								// ADD MAP IMAGE TO PROJECT
{    
    mob.mapImage=new MapImage(mob, this);									// Alloc mapimage obj

	function MapImage(mob, _this) {											// MAPIMAGE CONSTRUCTOR
	    
	    this.img=new Image();												// Alloc image
		
		function progress() {												// SHOW LOAD PROGRESS
         	var str="";
         	_this.loadCounter--; 											// Dec
       		if (_this.loadCounter)											// If stuff to load
 				str=_this.loadCounter+" maps to load";						// Set progress
 			$("#loadProgress").text(str);									// Show status
         	}					

	    this.img.onload=progress;											// Add handler to remove from count after loaded
        this.img.onerror=progress;											// Add handler to remove from count if error
        this.imgWidth;	 this.imgHeight;									// Set size, if any
        var v=mob.georef.split(",");										// Split into parts
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
		this.img.src=mob.marker;											// Set url
  	}
	
MapImage.prototype.drawMapImage=function(alpha, _this)                   		// DRAW IMAGE
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
		ctx.globalAlpha = alpha / 100;
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
}

Space.prototype.DrawMapLayers=function()								// DRAW OL IMAGES
{
	var i,m;
	if (this.canvasContext && sd.mobs) {  									// If a canvas up      
		this.canvasContext.clearRect(0,0,this.canvasWidth,this.canvasHeight);	// Clear canvas
   		for (i=0;i<sd.mobs.length;i++) {									// For each mob
            m=sd.mobs[i];													// Get ptr
            if (m.mapImage && m.vis)										// If an image alloc'd amd visible
           		m.mapImage.drawMapImage(100,this);   						// Draw it   
            }
        }
}

