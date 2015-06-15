////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// POPUP.JS 
// Provides popup and some utilities
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Popup()														// CONSTRUCTOR
{

/* 
  	@constructor
  	Styling of popups dependent on css: .popup-*.*

*/
		this.Sound("click",true);											// Init sound
		this.Sound("ding",true);											// Init sound
		this.Sound("delete",true);											// Init sound

}

Popup.prototype.ShowPopup=function(div, timeFormat, x, y,  title, desc, pic, date, end)	// SHOW POPUP
{

/* 
 	Draws popup at coordinates x, y. 
 	If no coordinates given, popup is removed.
 	If x coord is -1, a centered larger popup is drawn.
 	Click on pic shown only the pic. 
 	Click on box makes larger, centered.
 	title, desc, pic, and date are all optional.
 	@param {number} x horizontal placement
 	@param {number} y vertical placement
 	@param {string} desc text to show in popup. Can be HTML formatted.
 	@param {string} title to show in popup in bold. Can be HTML formatted.
 	@param {string} pic URL of image file (jpeg, png or gif)
	@param {string} date date to show
*/

  	this.div=div;															// Set div
  	var _this=this;															// Save context for callbacks
	$("#st-popup").remove();												// Remove any pre-existing popup
	if (x == undefined)														// If no x defined
		return;																// We're just removing

	var str="<div id='st-popup' class='popup-main'>";						// Add message
	if (title)																// If title set
		str+="<div class='popup-title'><b>"+title+"</b>";					// Add it
	if (date) {																// If date set
		date=this.FormatTime(date,timeFormat);								// Format time to date
		str+="<span class='popup-date'>&nbsp;&nbsp;"+date+"</span>";		// Add it
		}
	if (end) {																// If end date set
		end=this.FormatTime(end,timeFormat);								// Format time to date
		str+="<span class='popup-date'>&nbsp;-&nbsp;"+end+"</span>";		// Add it
		}
	str+="</div><table style='width:100%'><tr>";
	if (pic) 																// If pic set
		str+="<td style='vertical-align:top'><img id='poppic' src='"+pic+"' class='popup-pic'></td>";	// Add image
	if (desc)																// If desc set
		str+="<td class='popup-desc' id='popdesc'>"+desc+"</div></td>";		// Add it
	$("body").append("</tr></table>"+str);									// Add popup
	if (x < 0) {															// Bigger 
		$("#poppic").css("cursor","");										// Normal cursor
		$("#st-popup").css("max-width",$(this.div).width()*.75);			// Make it wider
		$("#st-popup").css("max-height",$(this.div).height()*.75);			// Make it taller
		$("#poppic").width($(this.div).width()*(desc ? .5 : .75))			// Make pic bigger
		x=$(this.div).width()/2-$("#st-popup").width()/2;					// Center it
		y=50;																// Near top			
		}
	$("#st-popup").css({left:(x+8)+"px",top:(y+20)+"px"});					// Position
	$("#st-popup").fadeIn(300, function() {									// Fade in
				if ((y+50+$("#st-popup").height() > $(_this.div).offset().top+$(_this.div).height()) && (y!= 50)) { // Overflows bottom
					y=$(_this.div).offset().top+$(_this.div).height()-50-$("#st-popup").height();	// Cap at bottom
					$("#st-popup").css({top:(y+20)+"px"});											// Re-position
				}
		});
	$("#st-popup").click( function(e) {										// ON CLICK OF TEXT
		$("#popdesc").css("cursor","auto");									// Normal cursor
		$("#st-popup").css("max-width",$(_this.div).width()*.66);			// Make it wider
		$("#st-popup").css("max-height",$("body").height()-100);			// Make it taller
		$("#poppic").width($(_this.div).width()*(desc ? .33 : .66))			// Make pic bigger
		x=$(_this.div).width()/2-$("#st-popup").width()/2;					// Center it
		$("#st-popup").css({left:(x+8)+"px",top:"70px"});					// Position
		});	

	$("#poppic").click( function(e) {										// ON CLICK OF PIC
		if ($("#st-popup").width() < 301)									// If not enlarged
			return;															// Do nothing							
		$("#st-popup").css("cursor","auto");								// Normal cursor
		$("#poppic").css("cursor","auto");									// Normal cursor
		$("#st-popup").css("max-height","none");							// Any height
		$("#st-popup").css("max-width",$(_this.div).width()*.66);			// Make it wider
		$("#poppic").width($(_this.div).width()*.66)						// Make pic bigger
		x=$(_this.div).width()/2-$("#st-popup").width()/2;					// Center it
		$("#st-popup").css({left:(x+8)+"px",top:"70px"});					// Position
		e.stopPropagation()
		});

}
 
Popup.prototype.FormatTime=function(time, format) 						// FORMAT TIME TO DATE
{
/* 	
	Format time int human readable format
 	@param {number} time number of ms += 1/1/1970
	@param {string} format type of format. If not set, this.timeFormat is used.
	@return {string} time formatted at date.
*/
	var str;
	var mos=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
	d=new Date(time*36000000);												// Convert minutes to ms
	if (format == "Mo/Year") 												// 1/1900
		str=(d.getMonth()+1)+"/"+d.getFullYear();							// Set it
	else if (format == "Mo/Day/Year") 										// 1/1/1900
		str=(d.getMonth()+1)+"/"+(d.getDay()+1)+"/"+d.getFullYear();		// Set it
	else if (format == "Mon Year") 											// Jan 1900
		str=mos[d.getMonth()]+" "+d.getFullYear();							// Set it
	else if (format == "Mon Day, Year") 									// Jan 1, 1900
		str=mos[d.getMonth()]+" "+(d.getDay()+1)+", "+d.getFullYear();		// Set it
	else																	// Default to only year
		str=d.getFullYear();												// Set it
 	return str;																// Return formatted date
}
	
	
Popup.prototype.GetTextBox=function (title, content, def, callback)		// GET TEXT LINE BOX
{
	this.Sound("click");													// Ding sound
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='ve-unselectable' id='alertBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content;
	str+="<p><input class='ve-is' type='text' id='gtBoxTt' value='"+def+"'></p></div>";
	$("#alertBoxDiv").append(str);	
	$("#alertBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { callback($("#gtBoxTt").val()); $(this).remove(); },
				            	"Cancel":  	function() { $(this).remove(); }
								}});	
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});
}


Popup.prototype.Dialog=function (title, content)			// DIALOG BOX
{
	this.Sound("click");													// Ding sound
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='ve-unselectable' id='alertBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#alertBoxDiv").append(str);	
	$("#alertBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { $(this).remove(); },
								}});	
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});
}


Popup.prototype.ShowLightBox=function(title, content)				// LIGHTBOX
{
	var str="<div id='lightBoxDiv' style='position:fixed;width:100%;height:100%;";	
	str+="background:url(images/overlay.png) repeat;top:0px;left:0px';</div>";
	$("body").append(str);														
	var	width=500;
	var x=$("#lightBoxDiv").width()/2-250;
	if (this.version == 1) 
		x=Math.max(x,950)
	var y=$("#lightBoxDiv").height()/2-200;
	if (this.xPos != undefined)
		x=this.xPos;
	str="<div id='lightBoxIntDiv' class='unselectable' style='position:absolute;padding:16px;width:400px;font-size:12px";
	str+=";border-radius:12px;z-index:2003;"
	str+="border:1px solid; left:"+x+"px;top:"+y+"px;background-color:#f8f8f8'>";
	str+="<img src='imgshantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='lightBoxTitle' style='font-size:18px;text-shadow:1px 1px #ccc'><b>"+title+"</b></span>";
	str+="<div id='lightContentDiv'>"+content+"</div>";					
	$("#lightBoxDiv").append(str);	
	$("#lightBoxDiv").css("z-index",2500);						
}



Popup.prototype.ColorPicker=function (name, transCol) 					//	DRAW COLORPICKER
{
	if (!transCol)															// If no transparent color set
		transCol="";														// Use null
	$("#colorPickerDiv").remove();											// Remove old one
	var x=$("#"+name).offset().left+10;										// Get left
	var y=$("#"+name).offset().top+10;										// Top
	var	str="<div id='colorPickerDiv' style='position:absolute;left:"+x+"px;top:"+y+"px;width:160px;height:225px;z-index:100;border-radius:12px;background-color:#eee'>";
	$("body").append("</div>"+str);											// Add palette to dialog
	$("#colorPickerDiv").draggable();										// Make it draggable
	str="<p style='text-shadow:1px 1px white' align='center'><b>Choose a new color</b></p>";
	str+="<img src='colorpicker.gif' style='position:absolute;left:5px;top:28px' />";
	str+="<input id='shivaDrawColorInput' type='text' style='position:absolute;left:22px;top:29px;width:96px;background:transparent;border:none;'>";
	$("#colorPickerDiv").html(str);											// Fill div
	$("#colorPickerDiv").on("click",onColorPicker);							// Mouseup listener

	function onColorPicker(e) {
		
		var col;
		var cols=["000000","444444","666666","999999","CCCCCC","EEEEEE","E7E7E7","FFFFFF",
				  "FF0000","FF9900","FFFF00","00FF00","00FFFF","0000FF","9900FF","FF00FF",	
				  "F4CCCC","FCE5CD","FFF2CC","D9EAD3","D0E0E3","CFE2F3","D9D2E9","EDD1DC",
				  "EA9999","F9CB9C","FFE599","BED7A8","A2C4C9","9FC5E8","B4A7D6","D5A6BD",
				  "E06666","F6B26B","FFD966","9C347D","76A5AF","6FA8DC","8E7CC3","C27BA0",
				  "CC0000","E69138","F1C232","6AA84F","45818E","3D85C6","674EA7","A64D79",
				  "990000","B45F06","BF9000","38761D","134F5C","0B5394","351C75","741B47",
				  "660000","783F04","7F6000","274E13","0C343D","073763","20124D","4C1130"
				 ];
		var x=e.pageX-this.offsetLeft;										// Offset X from page
		var y=e.pageY-this.offsetTop;										// Y
		if ((x < 102) && (y < 45))											// In text area
			return;															// Quit
		$("#colorPickerDiv").off("click",this.onColorPicker);				// Remove mouseup listener
		if ((x > 102) && (x < 133) && (y < 48))	{							// In OK area
			if ($("#shivaDrawColorInput").val())							// If something there
				col="#"+$("#shivaDrawColorInput").val();					// Get value
			else															// Blank
				x=135;														// Force a quit
			}
		$("#colorPickerDiv").remove();										// Remove
		if ((x > 133) && (y < 48)) 											// In quit area
			return;															// Return
		if (y > 193) 														// In trans area
			col=transCol;													// Set trans
		else if (y > 48) {													// In color grid
			x=Math.floor((x-14)/17);										// Column
			y=Math.floor((y-51)/17);										// Row
			col="#"+cols[x+(y*8)];											// Get color
			}
		if (col == transCol)												// No color 
			$("#"+name).css({ "border":"1px dashed #000","background-color":"#fff" }); 	// Set dot
		else				
			$("#"+name).css({ "border":"1px solid #000","background-color":col }); 		// Set dot
		$("#"+name).data(name,col);											// Set color
	}

}


///////////////////////////////////////////////////////////////////////////////////////////////
//  HELPERS
///////////////////////////////////////////////////////////////////////////////////////////////


Popup.prototype.SetCookie=function(cname, cvalue, exdays)			// SET COOKIE
{
	var d=new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}


Popup.prototype.GetCookie=function(cname) {							// GET COOKIE
	var name=cname+"=",c;
	var ca=document.cookie.split(';');
	for (var i=0;i<ca.length;i++)  {
	  c=ca[i].trim();
	  if (c.indexOf(name) == 0) 
	  	return c.substring(name.length,c.length);
	  }
	return "";
}

Popup.prototype.Sound=function(sound, mute)					// PLAY SOUND
{
	var snd=new Audio();										// Init audio object
	if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
		snd=new Audio("img/"+sound+".ogg");						// Use ogg
	else	
		snd=new Audio("img/"+sound+".mp3");						// Use mp3
	if (!mute)													// If not initing or muting	
		snd.play();												// Play sound
	}

			