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
	var descHgt=60;
	this.curMode="story";
	var _this=this;															// Save context 
	var x=e.clientX,y=e.clientY;											// Get pos
	$("#editShowDiv").remove();												// Remove it
	$("#storyEditor").remove();												// Kill story editor
	if ((x < $("#leftDiv").width()) && (y < $("#leftDiv").height())) 		// In map area
		this.curMode="map";													// Edit map item
	else if ((x < $("#leftDiv").width()) && (y > $("#leftDiv").height())) 	// In timeline
		this.curMode="time";												// Edit timeline item
	else																	// In story
		descHgt=300;														// Bigger description
	str="<div id='editShowDiv' class='ve-showEditor'>";
	str+="<img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;color:#666;font-weight:bold'><span id='esHead'></span><span id='esClose'style='float:right;cursor:pointer'><i>x</i></span></span><p><hr></p>";
	str+="<table><tr><td><b>Title</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esTitle'></td></tr>";	
	str+="<tr><td><b>Start</b></td><td><input class='ve-is' style='width:60px' type='text' id='esStart'>&nbsp;&nbsp;";	
	str+="<b>End</b>&nbsp;&nbsp;<input class='ve-is' style='width:60px' type='text' id='esEnd'>&nbsp;&nbsp;";	
	str+="<b>Show</b>&nbsp;&nbsp;<input class='ve-is' style='width:40px' type='text' id='esShow'>&nbsp;&nbsp;";	
	str+="<b>Id</b>&nbsp;&nbsp;<input class='ve-is' style='width:42px' type='text' id='esId'></td></tr>";	
	str+="<tr><td><b>On click</b></td><td><input class='ve-is' style='width:calc(100% - 48px)' type='text' id='esClick'>&nbsp;&nbsp;<img src='img/editbut.gif' id='esClickEditor' style='vertical-align:-5px;cursor:pointer'></td></tr>";	
	str+="<tr><td><b>Where&nbsp;</b></td><td><input class='ve-is' style='width:140px' type='text' id='esWhere'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id='esGeo'></span></td></tr>";	
	str+="<tr><td><b>Desc&nbsp;&nbsp;&nbsp;<img src='img/editbut.gif' onclick='sto.StoryEditor(\"edit\")' style='vertical-align:-4px;cursor:pointer'></b></td><td>";
	str+="<textarea class='ve-is'  style='width:calc(100% - 18px);height:"+descHgt+"px' id='esDesc'></textarea></td></tr>";	
	str+="<tr><td><b>Image</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esPic'></td></tr>";	
	str+="<tr><td><b>Marker</b></td><td>"+MakeSelect("esMarker",false,["dot","diamond","star","bar","box","rbar","line","triup","tridown","triright","trileft","ndot","------------","segment","path","over","story","booklet"]);
	str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esSize'>";
	str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esColor'>";
	str+="&nbsp;&nbsp;<b>Position</b>&nbsp;&nbsp;"+MakeSelect("esPos",false,["","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"])+"</td></tr>";
	if (this.curMode != "story") {												// Hide for story
		str+="<tr><td><b>Map marker&nbsp;</b></td><td>"+MakeSelect("esMapMarker",false,["","dot","diamond","star","bar","box","rbar","line","triup","tridown","triright","trileft","ndot"]);
		str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapSize'>";
		str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapColor'>";
		str+="&nbsp;&nbsp;<b>Opacity</b>&nbsp;&nbsp;<input class='ve-is' style='width:33px' type='text' id='esOpacity'></td></tr>";
		}
	str+="</table>"
	str+="<p><hr></p>";																			
	str+="<div '>";																		
	str+="<div id='esSaveBut' class='ve-gbs'>Save changes</div>&nbsp;&nbsp;";						
	str+="<div id='esCopyBut' class='ve-gbs'>Save project to GDrive</div>&nbsp;&nbsp;";						
	str+="<div id='esCopyLineBut' class='ve-gbs'>Copy line</div>&nbsp;&nbsp;";						
	str+="<div id='esFindBut' class='ve-gbs'>Find</div>&nbsp;&nbsp;";						
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
		if (sto.storyMode == "Scrolled") {									// If scrolled
			for (var i=0;i<sto.pages.length;++i)							// Look through pages
				if (curJson.mobs[sto.pages[i]].open) {						// If open
					this.curId=sto.pages[i]-0;								// Get index
					break;													// Quit looking
					}
			}
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

	$("#esFindBut").on("click", function() {								// FIND MOB HANDLER
		_this.FindMob();													// Run find dialog
		}); 
						
	$("#esClose").on("click", function(e) {									// MAP COLOR HANDLER
		$("#editShowDiv").remove();											// Remove editor
		$("#storyEditor").remove();											// Kill story editor
	}); 

	$("#esMarker").on("change", function(e) {								// MARKER CHANGE HANDLER
		_this.setEventOptions();											// Change event options
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
		getMobValues(o);													// Get values from inputa	
		InitProject(curJson);												// Reinit project
		Sound("ding");														// Ding
		$("#editShowDiv").remove();											// Remove editor
		$("#storyEditor").remove();											// Kill story editor
		});

	function getMobValues(o) {											// GET VALUES FROM INPUTS
		if (!o)	return;														// Got to have an obj
		o.id=$("#esId").val();												// Id
		o.marker=$("#esMarker").val();										// Marker
		o.title=$("#esTitle").val();										// Title
		o.start=o.startO=$("#esStart").val();								// Start
		o.end=o.endO=$("#esEnd").val();										// End
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
		}

	$("#esCopyBut").on("click", function() {  								// ON COPY TO GDRIVE
		var o,i,d=[];
		for (i=0;i<curJson.mobs.length;++i) {								// For each mob	
			o=curJson.mobs[i];												// Point at mob
			o.start=o.startO;	o.end=o.endO;	o.opacity=o.opacityO;		// Restore original values
			}
		o=curJson.mobs[_this.curId];										// Point at mob
		getMobValues(o);													// Get values from inputa	
		var v=_this.MakeTabFile(curJson).split("\n");						// Split into rows
		for (i=0;i<v.length;++i)											// For each row
			d.push(v[i].split("\t"));										// Add array of fields
		var str=curJson.sheet.match(/\/d\/(.+)\//)[1];						// Extract id
		_this.SaveSpreadsheet(str,d);										// Save to GDrive
		});

	$("#esCopyLineBut").on("click", function() {  							// ON COPY LINE TO CLIPBOARD
		var o={};
		getMobValues(o);													// Extract values
		var str=_this.MakeTabFile(curJson,o);								// Create TSV line
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


EditShow.prototype.GeoRef=function()										//  GEO-REFERENCE
{
	mps.GeoReference($("#esPic").val() ? $("#esPic").val() : "//farm9.staticflickr.com/8019/7310697988_18eb47c466_z.jpg",$("#esWhere").val() ? $("#esWhere").val() : "",1)
}

EditShow.prototype.setEventOptions=function()								// SET EVENT OPTIONS
{
	var marker=$("#esMarker").val();											// Get cur marker
	if (marker == "over")														// If overlay
		$("#esGeo").html("<a href='javascript:void(0)' onclick='eds.GeoRef()'>Click to georeference</a>");
	else																		// Regular
		$("#esGeo").html("<i>Ctrl-click on map to get</i>");					// Map click
}

EditShow.prototype.EditEvent=function()									// EDIT ITEM
{
	var o={};
	if (this.curId == -1) {													// Invalid event
		$("#esHead").text("Add a new event");								// Add
		$("#esRemoveBut").hide();											// Hide trashcan
		$("#esSaveBut").text("Add new event");								// Say add
		}
	else{																	// Valid event	
		if (curJson.mobs[this.curId]) o=curJson.mobs[this.curId];			// Point at event
		$("#esFindBut").remove();											// Remove find but
		$("#esRemoveBut").show();											// Show trashcan
		$("#esHead").text("Edit event");									// Edit
		$("#esSaveBut").text("Save changes");								// Say save
		}
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
	this.setEventOptions();													// Change event options
}

EditShow.prototype.FindMob=function()										// FIND MOB
{
	var _this=this;															// Save context 
	$("#storyEditor").remove();												// Kill story editor
	str="<div id='storyEditor' class='ve-clickEditor'>";
	str+="<span style='font-size:14px;color:#666;font-weight:bold'>Find event by Id<span id='fmClose'style='float:right;cursor:pointer'><i>x</i></span></span><p><hr></p>";
	str+="<table><tr><td><b>Kind of event&nbsp;</b></td><td>"+MakeSelect("fmType",false,["any","path","over","story","booklet"])+"&nbsp;&nbsp<i>(limits the ids shown)</i>";
	str+="<tr><td><b>Type Id here&nbsp;</b></td><td><input class='ve-is' style='width:160px' type='text' id='fmId'>&nbsp;&nbsp;";	
	str+="<div id='fmFindBut' class='ve-gbs'>Find</div></td></tr></table><div>";						
	$("#editShowDiv").append(str);											// Set body
	$("#fmId").focus();														// Setb fpocus on input
	autoComplete("any");													// Set auto complete to any

	$("#fmClose").on("click", function(e) {									// X CLICK
		$("#storyEditor").remove();											// Kill dialog
		}); 

	$("#fmId").on("change", function() {  									// ON ENTER
		$("#fmFindBut").trigger("click");									// Trigger find
		}); 
	
	$("#fmType").on("change", function(e) {									// TYPE CHANGE
		autoComplete($(this).val());										// Set auto complete
		}); 

	$("#fmFindBut").on("click", function() {  									// ON FIND CLICK
		for (i=0;i<curJson.mobs.length;++i)									// For each mob
			if ((""+curJson.mobs[i].id).toLowerCase() == $("#fmId").val().toLowerCase())	{	// If found
				_this.curId=i;												// Set id
				$("#storyEditor").remove();									// Kill dialog
				_this.EditEvent();											// Edit
				Sound("ding");												// Ding
				return;														// Quit	
				}
		Sound("delete");													// Delete
		});

	function autoComplete(type)	{											// SET AUTOCOMPLETE
		var i,ids=[];	
		for (i=0;i<curJson.mobs.length;++i)									// For each mob
		if (curJson.mobs[i].id && ((curJson.mobs[i].marker == type) || (type == "any")))	//  A match
			ids.push(curJson.mobs[i].id);									// Add to autocomplete array
		$("#fmId").autocomplete({ source: ids, minLength: 0});				// Auto complete
	}		
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
			$(this).autocomplete({ source: ["Satellite","Terrain","Earth","Watercolor","B&W","Roadmap"], minLength: 0 });
		else if ($("#ceActions").val() == "show") {							// If  show
			for (i=0;i<curJson.mobs.length;++i)								// For each mob
				if (curJson.mobs[i].id)										// If a valid id
					ids.push(curJson.mobs[i].id);							// Add to autocomplete array
			$(this).autocomplete({ source: ids, minLength: 0 });			// Auto complete
			}
		else if ($("#ceActions").val() == "story") {						// If  story
			for (i=0;i<curJson.mobs.length;++i)								// For each mob
				if (curJson.mobs[i].id && (curJson.mobs[i].marker == "story"))	// If a valid story id
					ids.push(curJson.mobs[i].id);							// Add to autocomplete array
				$(this).autocomplete({ source: ids, minLength: 0 });		// Auto complete
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

EditShow.prototype.MakeTabFile=function(data, line)						// MAKE TAB-DELINEATED FILE OF PROJECT
{
	var i,o,s,str="";
	var start=0,end=data.mobs.length;										// Assume full show
	if (line != undefined) 													// If line defined
		start=0,end=1;														// Just save one line
	else																	// Add header for full
		str+="id\tmarker\tstart\tend\ttitle\tdesc\tpic\tpos\tcolor\tsize\topacity\tedge\tmapMarker\tmapColor\tmapSize\twhere\tshow\tclick\tcitation\ttags\n";													// Add header
	for (i=start;i<end;++i) {												// For each mob	
		o=data.mobs[i];														// Point at mob
		if (line != undefined) 												// If line defined
			o=line;															// Use it
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

EditShow.prototype.SaveSpreadsheet=function(id, data)										// CLEAR AND SAVE DATA TO GDRIVE
{
	if (!id)	return;																			// Quit if no id
	var _this=this;																				// Save context
	gapi.load('client:auth2', function() {														// Start oauto
			gapi.client.init({																	// Init
          	apiKey: "AIzaSyD0jrIlONfTgL-qkfnMTNdjizsNbLBBjTk",									// Key
			clientId: "453812393680-8tb3isinl1bap0vqamv45cc5d9c7ohai.apps.googleusercontent.com", // Google client id 
			scope:"https://www.googleapis.com/auth/drive",										// Scope
          	discoveryDocs:["https://sheets.googleapis.com/$discovery/rest?version=v4"],			// API discovery
        	}).then(function () {																// When initted, listen for sign-in state changes.
	        	gapi.auth2.getAuthInstance().isSignedIn.listen(doIt);							// Try						
        		doIt(gapi.auth2.getAuthInstance().isSignedIn.get());							// Try
	
				function doIt(isSignedIn) {														// Do action
					if (!isSignedIn) 															// If not signed in yet														
						gapi.auth2.getAuthInstance().signIn();									// Sign in
					else{																		// Clear and save
						var params= { spreadsheetId:id, range: "A1:ZZZ100000" };				// Where to save it
						var body= { majorDimension: "ROWS", values: data };						// Data to save
						var request=gapi.client.sheets.spreadsheets.values.clear(params);		// Clear first
						request.then(function(r) { 												// When cleared
							params.valueInputOption="RAW";										// Send raw data
							var request=gapi.client.sheets.spreadsheets.values.update(params,body);	// Send new data
							request.then(function(r) {											// Good save
								Sound("ding");													// Ding
								_this.PopUp("Project<br>copied to Google Drive");				// Show popup
								}, 
								function(e) { trace(e.result.error.message); })					// Error reporting for send
							}, 
						function(e) { trace(e.result.error.message); });						// Error reporting for clear
						}
				}			
			});
		});
}

EditShow.prototype.PopUp=function(msg)														// TIMED POPUP
{
	$("#popupDiv").remove();																	// Kill old one, if any
	var str="<div id='popupDiv' class='ve-popup'>"; 											// Add div
	str+=msg+"</div>"; 																			// Add div
	$("body").append(str);																		// Add to  body
	$("#popupDiv").fadeIn(500).delay(2000).fadeOut(500)											// Animate in and out		
}

