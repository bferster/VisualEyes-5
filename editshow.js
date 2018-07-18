////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EDITSHOW.JS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function EditShow()														// CONSTRUCTOR
{
	var _this=this;															// Save context 
	this.curMode="";														// Current curMode
	this.curId=-1;															// Current id
	$("body").contextmenu(function(e) { 									// Add context menu handler
		if (e.ctrlKey && e.altKey) {										// If control+alt key
			_this.Draw(e); 													// Show editor
			return false;													// Inhibit browser comtext menu
			} 
		});	
}

EditShow.prototype.Draw=function(e)										// MAIN MENU
{
	this.curMode="story";
	var _this=this;															// Save context 
	var x=e.clientX,y=e.clientY;											// Get pos
	$("#editShowDiv").remove();												// Remove it
	$("#storyEditor").remove();												// Kill story editor
	if ((x < $("#leftDiv").width()) && (y < $("#leftDiv").height())) 		// In map area
		this.curMode="map";													// Edit map item
	else if ((x < $("#leftDiv").width()) && (y > $("#leftDiv").height())) 	// In timeline
		this.curMode="time";												// Edit timeline item
	str="<div id='editShowDiv' class='ve-showEditor'>";
	str+="<img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;color:#666;font-weight:bold'><span id='esHead'></span><span id='esClose'style='float:right;cursor:pointer'><i>x</i></span></span><p><hr></p>";
	str+="<table><tr><td><b>Title</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esTitle'></td></tr>";	
	str+="<tr><td><b>Start</b></td><td><input class='ve-is' style='width:60px' type='text' id='esStart'>&nbsp;&nbsp;";	
	str+="<b>End</b>&nbsp;&nbsp;<input class='ve-is' style='width:60px' type='text' id='esEnd'>&nbsp;&nbsp;";	
	str+="<b>Show</b>&nbsp;&nbsp;<input class='ve-is' style='width:40px' type='text' id='esShow'>&nbsp;&nbsp;";	
	str+="<b>Id</b>&nbsp;&nbsp;<input class='ve-is' style='width:42px' type='text' id='esId'></td></tr>";	
	str+="<tr><td><b>On click</b></td><td><input class='ve-is' style='width:calc(100% - 48px)' type='text' id='esClick'>&nbsp;&nbsp;<img src='img/editbut.gif' id='esClickEditor' style='vertical-align:-5px;cursor:pointer'></td></tr>";	
	str+="<tr><td><b>Where&nbsp;</b></td><td><input class='ve-is' style='width:140px' type='text' id='esWhere'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>(Ctrl-click to get from map)</i></td></tr>";	
	str+="<tr><td><b>Desc&nbsp;&nbsp;&nbsp;<img src='img/editbut.gif' onclick='sto.StoryEditor(\"edit\")' style='vertical-align:-4px;cursor:pointer'></b></td><td>";
	str+="<textarea class='ve-is'  style='width:calc(100% - 18px);height:60px' id='esDesc'></textarea></td></tr>";	
	str+="<tr><td><b>Image</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esPic'></td></tr>";	
	str+="<tr><td><b>Marker</b></td><td>"+MakeSelect("esMarker",false,["dot","diamond","star","bar","box","rbar","line","triup","tridown","triright","trileft","ndot","------------","segment","path","over","story"]);
	str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esSize'>";
	str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esColor'>";
	str+="&nbsp;&nbsp;<b>Position</b>&nbsp;&nbsp;"+MakeSelect("esPos",false,["","1","2","3","4","5","6","7","8","9"])+"</td></tr>";
	str+="<tr><td><b>Map marker&nbsp;</b></td><td>"+MakeSelect("esMapMarker",false,["","dot","diamond","star","bar","box","rbar","line","triup","tridown","triright","trileft","ndot"]);
	str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapSize'>";
	str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapColor'>";
	str+="&nbsp;&nbsp;<b>Opacity</b>&nbsp;&nbsp;<input class='ve-is' style='width:33px' type='text' id='esOpacity'></td></tr>";
	str+="</table>"
	str+="<p><hr></p>";																			
	str+="<div '>";																		
	str+="<div id='esSaveBut' class='ve-gbs'>Save changes</div>&nbsp;&nbsp;";						
	str+="<div id='esCopyBut' class='ve-gbs'>Copy project to clipboard</div>&nbsp;&nbsp;";						
	str+="<div id='esCopyLineBut' class='ve-gbs'>Copy line</div>&nbsp;&nbsp;";						
	str+="<img id='esRemoveBut' title='Delete' style='vertical-align:-5px' src='img/trashbut.gif'>";	// Trash button
	str+="<img src='img/helpicon.gif' id='esHelp' style='float:right;vertical-align:-5px;cursor:pointer'>"	
	str+="<textarea id='outputDiv' style='width:1px;height:1px;opacity:.01'></textarea></div>";
	$("body").append(str);	
	$("#editShowDiv").draggable();											// Make it draggable
	this.curId=-1;															// Assume a new one
	if (this.curMode == "time") {											// Timeline item
		var id=e.target.id;													// Get id
		if (!id) id=e.target.parentElement.id;								// Look at parent
		if (id && id.match(/timeseg/i)) {									// A segment		
			$("#esHead").text("Edit segment");								// Set title
			this.curId=tln.timeSegments[id.substr(7)].id;					// Save mob id
			Sound("click");													// Click	
			}
		else if (id && id.match(/svgmarker/i)) { 							// An event
			$("#esHead").text("Edit event");								// Set title
			if (id.match(/svgMarkerText/i)) 	id=id.substr(13);			// Extract id
			else if (id.match(/svgMarker/i))	id=id.substr(9);			// Extract id
			this.curId=id;													// Save mob id
			Sound("click");													// Click	
			}
		$("#editShowDiv").css({ top:$("#leftDiv").height()-$("#editShowDiv").height()-60+"px",left: $("#leftDiv").width()/2-250+"px"});
		}
	else if (this.curMode == "story") {										// Story item	
		$("#esHead").text("Edit Story");									// Title
		this.curId=sto.pages[sto.curPage];									// Extract id
		$("#editShowDiv").css({ top:"16px",left: $("#leftDiv").width()-546+"px"});
		Sound("click");													// Click	
	}	
	else if (this.curMode == "map") {										// Map item	
		$("#esHead").text("Edit Event");									// Set title
		id=""+mps.GetMapFeatureId(x,y);										// Look for feature at map
		if (id && id.match(/Mob-/i)) { 										// An event
			id=id.substr(4);												// Extract id
			this.curId=id;													// Save mob id
			Sound("click");													// Click	
			}
		$("#editShowDiv").css({ top:$("#leftDiv").height()-$("#editShowDiv").height()-60+"px",left: $("#leftDiv").width()/2-250+"px"});
		}
	this.EditEvent(e);														// Edit

	$("#esColor").on("click", function() {									// COLOR HANDLER
		pop.ColorPicker("esColor",-1);										// Set color
		}); 
	
	$("#esMapColor").on("click", function() {								// MAP COLOR HANDLER
		pop.ColorPicker("esMapColor",-1);									// Set color
		}); 
		
	$("#esClickEditor").on("click", function() {							// CLICK EDITOR HANDLER
		_this.ClickEditor($("#esClick").val());								// Run click editor
		}); 
			
	$("#esClose").on("click", function(e) {									// MAP COLOR HANDLER
		$("#editShowDiv").remove();											// Remove editor
		$("#storyEditor").remove();											// Kill story editor
	}); 

	$("#esSaveBut").on("click", function() {  								// ON SAVE 
		var i,o;
		if (_this.curId == -1) {											// A new mob
			ConfirmBox("This will add a new event. Are you sure?",	function() { // Sure?
				curJson.mobs.push({});										// Add new mob
				_this.curId=curJson.mobs.length-1;							// Point at it
				$("#esSaveBut").trigger("click");							// Try again
				});
			return;															// Quit and rely on trigger if continuing
			}
		for (i=0;i<curJson.mobs.length;++i) {								// For each mob	
			o=curJson.mobs[i];												// Point at mob
			o.start=o.startO;	o.end=o.endO;	o.opacity=o.opacityO;		// Restore original values
			}
		o=curJson.mobs[_this.curId];										// Point at mob
		o.id=$("#esId").val();												// Id
		o.marker=$("#esMarker").val();										// Marker
		o.title=$("#esTitle").val();										// Title
		o.start=$("#esStart").val();										// Start
		o.end=$("#esEnd").val();											// End
		o.desc=$("#esDesc").val();											// Desc
		o.pic=$("#esPic").val();											// Pic
		o.pos=$("#esPos").val();											// Pos
		o.color=$("#esColor").val();										// Color
		o.size=$("#esSize").val();											// Pos
		o.opacity=$("#esOpacity").val();									// Opacity
		o.mapMarker=$("#esMapMarker").val();								// Map marker
		o.mapColor=$("#esMapColor").val();									// Color
		o.mapSize=$("#esMapSize").val();									// Size
		o.where=$("#esWhere").val();										// Where
		o.show=$("#esShow").val();											// Show
		o.click=$("#esClick").val();										// Click
		InitProject(curJson);												// Reinit project
		$("#editShowDiv").remove();											// Remove editor
		$("#storyEditor").remove();											// Kill story editor
		});

	$("#esCopyBut").on("click", function() {  								// ON COPY TO CLIPBOARD
		var str=_this.MakeTabFile(curJson);									// Create TSV file
		$("#outputDiv").val(str);											// Show it
		$("#outputDiv")[0].select();										// Select div
		try {
			if (document.execCommand('copy')) {								// Copy to clipboard
				Sound("ding");												// Ding
				}
			} catch (err) { console.log("Clipboard copy error")}			// Show error
		});

	$("#esCopyLineBut").on("click", function() {  							// ON COPY LINE TO CLIPBOARD
		var str=_this.MakeTabFile(curJson,_this.curId);						// Create TSV line
		$("#outputDiv").val(str);											// Show it
		$("#outputDiv")[0].select();										// Select div
		try {
			if (document.execCommand('copy')) {								// Copy to clipboard
				Sound("ding");												// Ding
				}
			} catch (err) { console.log("Clipboard copy error")}			// Show error
		});
	
	$("#esRemoveBut").on("click", function() {  							// REMOVE MOB
		if (_this.curId >= 0)												// Valid mob
			ConfirmBox("Are you sure?",	function() {						// Sure?
				curJson.mobs.splice(_this.curId,1);							// Remove it
				InitProject(curJson);										// Reinit project
				$("#editShowDiv").remove();									// Remove editor
				$("#storyEditor").remove();									// Kill story editor
			});
		});		

	$("#esHelp").on("click", function(e) {									// HELP
		window.open("https://docs.google.com/document/d/161td5ZuqKqT5R5r9z1P8AxBA6l9LaP-eYl_RvCyvw2g/edit?usp=sharing",'_blank');	
	}); 
	
	$("#esMarker").on("click", function() {  								// ON CHANGE MARKER
		});		
	}

EditShow.prototype.EditEvent=function(e)									// EDIT ITEM
{
	var o={};
	if (this.curId == -1) {													// Invalid event
		$("#esHead").text("Add a new event");								// Add
		$("#esRemoveBut").remove();											// Remove trashcan
		$("#esSaveBut").text("Add new event");								// Say add
		}
	else																	// Nothing	
		o=curJson.mobs[this.curId];											// Point at event

	if (o.id)		$("#esId").val(o.id);									// Id
	if (o.marker)	$("#esMarker").val(o.marker.toLowerCase());				// Marker
	if (o.start)	$("#esStart").val(o.startO);							// Start
	if (o.end)		$("#esEnd").val(o.endO);								// End
	if (o.title)	$("#esTitle").val(o.title);								// Title
	if (o.desc)		$("#esDesc").val(o.desc);								// Desc
	if (o.pic)		$("#esPic").val(o.pic);									// Pic
	if (o.pos)		$("#esPos").val(o.pos);									// Pos
	if (o.color)	$("#esColor").val(o.color);								// Color
	if (o.size)		$("#esSize").val(o.size);								// Size
	if (o.opacity)	$("#esOpacity").val(o.opacityO);						// Opacity
	if (o.mapMarker) $("#esMapMarker").val(o.mapMarker);					// Map marker
	if (o.mapColor)	$("#esMapColor").val(o.mapColor);						// Color
	if (o.mapSize)	$("#esMapSize").val(o.mapSize);							// Size
	if (o.show)		$("#esShow").val(o.show);								// Show
	if (o.open)		$("#esOpen").val(o.open);								// Open
	if (o.click)	$("#esClick").val(o.click);								// Click
	if (o.where)	$("#esWhere").val(o.where);								// Where
	pop.ColorPicker("esMapColor",-1,true);									// Init color
	pop.ColorPicker("esColor",-1,true);										// Init color
}

EditShow.prototype.ClickEditor=function(data)								// MAIN MENU
{
	var i,v=[],vv=[];
	var _this=this;															// Save context 
	$("#storyEditor").remove();												// Kill story editor
	str="<div id='storyEditor' class='ve-clickEditor'>";
	str+="<span style='font-size:14px;color:#666;font-weight:bold'>Click actions<span id='ceClose'style='float:right;cursor:pointer'><i>x</i></span></span><p><hr></p>";
	str+="<table><tr><td><b>Click actions&nbsp;</b></td><td>"+MakeSelect("ceClicks",false,[],"","style='max-width:240px'");
	str+="&nbsp;&nbsp;<img id='ceAddBut' title='Add new action' style='vertical-align:-5px' src='img/addbut.gif'>";
	str+="&nbsp;&nbsp;<img id='ceRemoveBut' title='Delete action' style='vertical-align:-5px' src='img/trashbut.gif'></td></tr>";
	str+="<tr><td><b>Do this</b></td><td>"+MakeSelect("ceActions",false,["where","show","story","basemap","segment","zoomer","mask"]);
	str+="<tr><td><b>With/to</b></td><td><input class='ve-is' style='width:100%' type='text' id='ceWith'></td></tr>";	
	str+="</table>"
	str+="<p><hr></p>";																			
	str+="<div>";																		
	str+="<div id='ceSaveBut' class='ve-gbs'>Save click changes</div>&nbsp;&nbsp;";						
	$("#editShowDiv").append(str);	
	$("#storyEditor").draggable();											// Make it draggable
	if (data)																// If some data
		v=(""+data).split("+");												// Array of click actions
	for (i=0;i<v.length;++i) 												// For each action
	$("#ceClicks").append("<option value='"+v[i]+"'>"+(i+1)+" - "+v[i].split(":")[0]+"</option>");	 // Add to select
	if (v.length) {															// Actions set														
		vv=v[0].split(":");													// Point at 1st and split
		$("#ceActions").val(vv[0]);											// Set action
		$("#ceWith").val(vv[1] ? vv[1] : "");								// Set with
		}
	else{
		$("#ceRemoveBut").hide();											// Hide trash button
		$("#ceClicks").append("<option>Use + to add action</option>"); 		// Add to select
		}

	$("#ceClose").on("click", function(e) {									// MAP COLOR HANDLER
		$("#storyEditor").remove();											// Kill dialog
		}); 

	$("#ceSaveBut").on("click", function() {  								// ON SAVE 
		var s=""
		$("#ceClicks :selected").val($("#ceActions").val()+":"+$("#ceWith").val());	// Set value
		var n=$("#ceClicks option").length;									// Number of options
		for (i=0;i<n;++i) {													// For each option
			s+=$("#ceClicks option:eq("+i+")").val();						// Add click action from value
			if (i != n-1)	s+="+";											// Add sep
			}
		$("#esClick").val(s);												// Save click actions
		$("#storyEditor").remove();											// Kill dialog
		Sound("click");														// Click
		});

	$("#ceAddBut").on("click", function() {  								// ON ADD 
		if ($("#ceClicks").val() == "Use + to add action")					// If first				
			$("#ceClicks").empty();											// Empty missive
		var i=$("#ceClicks option").length;									// Number of options
		$("#ceClicks").append("<option value='"+$("#ceActions").val()+":"+$("#ceWith").val()+"'>"+i+" - "+$("#ceActions").val()+"</option>") // Add to select
		$("#ceRemoveBut").show();											// Hide trash button
		Sound("ding");														// Ding
	});
			
	$("#ceRemoveBut").on("click", function() {  							// ON REMOVE 
		$("#ceClicks :selected").remove();									// Remove action from select
		if (!$("#ceClicks option").length) {								// No actions left												
			$("#ceClicks").append("<option>Use + to add action</option>"); 	// Add to select
			$("#ceRemoveBut").hide();										// Hide trash button
			}
		else{
			vv=(""+$("#ceClicks").val()).split(":");						// Point at 1st and split
			$("#ceActions").val(vv[0]);										// Set action
			$("#ceWith").val(vv[1] ? vv[1] : "");							// Set with
			}
		Sound("delete");													// Delete
		});

	$("#ceWith").on("click", function() {  									// ON WITH CLICK
		var i,ids=[];
		if ($("#ceActions").val() == "where") {								// If a where
			$(this).val(mps.GetView());										// Get current view
			Sound("ding");													// Ding
			}
		else if ($("#ceActions").val() == "basemap") 						// If basemap
			$(this).autocomplete({ source: ["Satellite","Terrain","Earth","Watercolor","B&W","Roadmap"] });
		else if ($("#ceActions").val() == "show") {							// If  show
			for (i=0;i<curJson.mobs.length;++i)								// For each mob
				if (curJson.mobs[i].id)										// If a valid id
					ids.push(curJson.mobs[i].id);							// Add to autocomplete array
			$(this).autocomplete({ source: ids });							// Auto complete
			}
		else if ($("#ceActions").val() == "story") {						// If  story
			for (i=0;i<curJson.mobs.length;++i)								// For each mob
				if (curJson.mobs[i].id && (curJson.mobs[i].marker == "story"))	// If a valid story id
					ids.push(curJson.mobs[i].id);							// Add to autocomplete array
				$(this).autocomplete({ source: ids });						// Auto complete
				}
			});

	$("#ceActions").on("change", function() {								// ON ACTION CHANGE
		$("#ceClicks :selected").text($("#ceClicks :selected").text().substr(0,4)+$("#ceActions").val());	// Set label
		$("#ceClicks :selected").val($("#ceActions").val()+":"+$("#ceWith").val());	// Set value
		});

	$("#ceWith").on("change", function() {									// ON WITH CHANGE
		$("#ceClicks :selected").text($("#ceClicks :selected").text().substr(0,4)+$("#ceActions").val());	// Set label
		$("#ceClicks :selected").val($("#ceActions").val()+":"+$("#ceWith").val());	// Set value
		});

	$("#ceClicks").on("change", function() {								// ON ACTION CLICK CHANGE
		vv=$(this).val().split(":");										// Point at selected
		$("#ceActions").val(vv[0]);											// Set action
		$("#ceWith").val(vv[1] ? vv[1] : "");								// Set do
		});

}

EditShow.prototype.MakeTabFile=function(data, line)						// MAKE TAB-DELINEATED FILE OF PROJECY
{
	var i,o,s,str="";
	var start=0,end=data.mobs.length;										// Assume full show
	if (line != undefined) 													// If line defined
		start=line,end=++line;												// Just save this line
	else																	// Add header for full
		str+="id\tmarker\tstart\tend\ttitle\tdesc\tpic\tpos\tcolor\tsize\topacity\tedge\tmapMarker\tmapColor\tmapSize\twhere\tshow\tclick\tcitation\ttags\n";													// Add header
	for (i=start;i<end;++i) {										// For each mob	
		o=data.mobs[i];														// Point at mob
		s=o.id;			str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	// Save data
		s=o.marker;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.startO;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.endO;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.title;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.desc;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.pic;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.pos;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.color;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.size;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.opacityO;	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.edge;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.mapMarker;	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.mapColor;	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.mapSize;	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.where;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.show;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.click;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.citation;	str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\t";	
		s=o.tags;		str+=(s ? (""+s).replace(/(\n|\r|\t)/g,"") : "")+"\n";	
		}		
	return str;
	}
