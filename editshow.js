////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EDITSHOW.JS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function EditShow()														// CONSTRUCTOR
{
	var _this=this;															// Save context 
	$("body").contextmenu(function(e) { _this.Draw(e); return false; });	// Add context menu handler
}

EditShow.prototype.Draw=function(e)										// MAIN MENU
{
	var mode="story";
	var x=e.clientX,y=e.clientY;											// Get pos
	$("#editShowDiv").remove();												// Remove it
	if ((x < $("#leftDiv").width()) && (y < $("#leftDiv").height())) 		// In map area
		mode="map";															// Edit map item
	else if ((x < $("#leftDiv").width()) && (y > $("#leftDiv").height())) 	// In timeline
		mode="time";														// Edit timeline item
	str="<div id='editShowDiv' class='ve-showEditor'>";
	str+="<img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;color:#666;font-weight:bold'><span id='esHead'></span><span id='esClose'style='float:right;cursor:pointer'><i>x</i></span></span><p><hr></p>";
	str+="<table><tr><td><b>Title</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esTitle'></td></tr>";	
	str+="<tr><td><b>Start</b></td><td><input class='ve-is' style='width:80px' type='text' id='esStart'>&nbsp;&nbsp;";	
	str+="<b>End</b>&nbsp;&nbsp;<input class='ve-is' style='width:80px' type='text' id='esEnd'>&nbsp;&nbsp;";	
	str+="<b>Id</b>&nbsp;&nbsp;<input class='ve-is' style='width:114px' type='text' id='esId'></td></tr>";	
	str+="<tr><td><b>Click</b></td><td><input class='ve-is' style='width:calc(100% - 48px)' type='text' id='esClick'>&nbsp;&nbsp;<img src='img/editbut.gif' id='esClickEditor' style='vertical-align:-5px;cursor:pointer'></td></tr>";	
	if (mode == "time") {
		str+="<tr><td><b>Where&nbsp;</b></td><td><input class='ve-is' style='width:140px' type='text' id='esWhere'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i>(Ctrl-click to get from map)</i></td></tr>";	
		str+="<tr><td><b>Description<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src='img/editbut.gif' style='cursor:pointer;margin-top:8px;'></b></td><td>";
		str+="<textarea class='ve-is'  style='width:calc(100% - 18px);height:60px' id='esDesc'></textarea></td></tr>";	
		str+="<tr><td><b>Image</b></td><td><input class='ve-is' style='width:calc(100% - 18px)' type='text' id='esPic'></td></tr>";	
		str+="<tr><td><b>Marker</b></td><td>"+MakeSelect("esMarker",false,["Dot","Diamond","Star","Bar","Box","Rbar","Line","TriUp","TriDown","TriRight","TriLeft","Ndot","Segment"]);
		str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esSize'>";
		str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esColor'>";
		str+="&nbsp;&nbsp;<b>Position</b>&nbsp;&nbsp;"+MakeSelect("esPos",false,["","1","2","3","4","5","6","7","8","9"])+"</td></tr>";
		str+="<tr><td><b>Map marker&nbsp;</b></td><td>"+MakeSelect("esMapmarker",false,["","Dot","Diamond","Star","Bar","Box","Rbar","Line","TriUp","TriDown","TriRight","TriLeft","Ndot","Segment"]);
		str+="&nbsp;&nbsp;<b>Size</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapSize'>";
		str+="&nbsp;&nbsp;<b>Color</b>&nbsp;&nbsp;<input class='ve-is' style='width:30px' type='text' id='esMapColor'>";
		str+="&nbsp;&nbsp;<b>Opacity</b>&nbsp;&nbsp;<input class='ve-is' style='width:33px' type='text' id='esOpacity'></td></tr>";
		}
	else if (mode == "map") {
		}
	else{
		}
	str+="</table>"
	str+="<p><hr></p>";																			
	str+="<div '>";																		
	str+="<div id='esPreviewBut' class='ve-gbs'>Preview</div>&nbsp;&nbsp;";						
	str+="<div id='esSaveBut' class='ve-gbs'>Save changes</div>&nbsp;&nbsp;";						
	str+="<img id='esRemoveBut' title='Delete' style='vertical-align:-5px' src='img/trashbut.gif'></div>";	// Trash button
	$("body").append(str);	
	$("#editShowDiv").draggable();											// Make it draggable
	if (mode == "time") 		this.EditTime(e);
	else if (mode == "map")		this.EditMap(x,y);	
	else						this.EditStory(sto.curPage);

	$("#esColor").on("click", function(e) {									// COLOR HANDLER
		pop.ColorPicker("esColor",-1);										// Set color
		}); 
	
	$("#esMapColor").on("click", function(e) {								// MAP COLOR HANDLER
		pop.ColorPicker("esMapColor",-1);									// Set color
		}); 
		
	$("#esClose").on("click", function(e) {									// MAP COLOR HANDLER
		$("#editShowDiv").remove();											// Remove editor
	}); 
		
}

EditShow.prototype.EditTime=function(e)									// EDIT TIMELINE ITEM
{
	var id=e.target.id;														// Get id
	if (!id) id=e.target.parentElement.id;									// Look at parent
	$("#editShowDiv").css({ top:$("#leftDiv").height()-$("#editShowDiv").height()-60+"px",left: $("#leftDiv").width()/2-250+"px"});
	pop.ColorPicker("esMapColor",-1,true);									// Init color
	pop.ColorPicker("esColor",-1,true);										// Init color

	if (id && id.match(/timeseg/i)) {
		$("#esHead").text("Edit segment");
		}
	else if (id && id.match(/svgmarker/i)) {
		$("#esHead").text("Edit event");
		}
	else
		$("#esHead").text("Add event or segment");
}

EditShow.prototype.EditMap=function(x, y)								// EDIT MAP ITEM
{
	$("#editShowDiv").css({ top:"16px",left: $("#leftDiv").width()+16+"px"});
	$("#esHead").text("Edit Map");
}

EditShow.prototype.EditStory=function(id)								// EDIT STORY ITEM
{
	$("#editShowDiv").css({ top:"16px",left: $("#leftDiv").width()-546+"px"});
	$("#esHead").text("Edit Story");
}
