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
		var r=($("#poppic").width()/$("#poppic").height() < 1) ? .8 : 1;	// Make smaller if portait mode
		$("#st-popup").css("max-width",$(_this.div).width()*.66);			// Make it wider
		$("#st-popup").css("max-height",$("#showDiv").height()-200);		// Make it taller
		$("#poppic").width($(_this.div).width()*(desc ? .33*r : .66*r))		// Make pic bigger
		x=$(_this.div).width()/2-$("#st-popup").width()/2;					// Center it
		$("#st-popup").css({left:(x+8)+"px",top:"70px"});					// Position
		});	

	$("#poppic").click( function(e) {										// ON CLICK OF PIC
		if ($("#st-popup").width() < 301)									// If not enlarged
			return;															// Do nothing							
		$("#st-popup").css("cursor","auto");								// Normal cursor
		var r=($("#poppic").width()/$("#poppic").height() < 1) ? .33 : .66;	// Make smaller if portait mode
		$("#poppic").css("cursor","auto");									// Normal cursor
		$("#st-popup").css("max-height",$("#showDiv").height()-100);		// Make it taller
		$("#st-popup").css("max-width",$(_this.div).width()*r);				// Make it wider
		$("#poppic").width($(_this.div).width()*r)							// Make pic bigger
		x=$(_this.div).width()/2-$("#st-popup").width()/2;					// Center it
		$("#st-popup").css({left:(x+8)+"px",top:"70px"});					// Position
		e.stopPropagation()
		});

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


Popup.prototype.Dialog=function (title, content, callback)				// DIALOG BOX
{
	this.Sound("click");													// Ding sound
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='ve-unselectable' id='alertBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#alertBoxDiv").append(str);	
	$("#alertBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { callback(); $(this).remove();  },
				            	"Cancel":  	function() { $(this).remove(); }
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



Popup.prototype.ColorPicker=function (name, transCol, init) 			//	DRAW COLORPICKER
{
	if (!transCol)															// If no transparent color set
		transCol="";														// Use null
	$("#colorPickerDiv").remove();											// Remove old one
	if (init) {																// If initting
		col=$("#"+name).val();												// Get current color
		if (col == transCol)												// No color 
			$("#"+name).css({ "border":"1px dashed #999","background-color":"#fff" }); 	// Set dot
		else				
			$("#"+name).css({ "border":"1px solid #999","background-color":col }); 		// Set dot
		return;																// Quit
	}
	
	var x=$("#"+name).offset().left+10;										// Get left
	var y=$("#"+name).offset().top+10;										// Top
	var	str="<div id='colorPickerDiv' style='position:absolute;left:"+x+"px;top:"+y+"px;width:160px;height:225px;z-index:100;border-radius:12px;background-color:#eee'>";
	$("body").append("</div>"+str);											// Add palette to dialog
	$("#colorPickerDiv").draggable();										// Make it draggable
	str="<p style='text-shadow:1px 1px white' align='center'><b>Choose a new color</b></p>";
	str+="<img src='img/colorpicker.gif' style='position:absolute;left:5px;top:28px' />";
	str+="<input id='shivaDrawColorInput' type='text' style='position:absolute;left:22px;top:29px;width:96px;background:transparent;border:none;'>";
	$("#colorPickerDiv").html(str);											// Fill div
	$("#colorPickerDiv").on("click",onColorPicker);							// Mouseup listener

	function onColorPicker(e) {
		
		var col;
		var cols=["000000","444444","666666","999999","cccccc","eeeeee","e7e7e7","ffffff",
				  "ff0000","ff9900","ffff00","00ff00","00ffff","0000ff","9900ff","ff00ff",	
				  "f4cccc","fce5cd","fff2cc","d9ead3","d0e0e3","cfe2f3","d9d2e9","edd1dc",
				  "ea9999","f9cb9c","ffe599","bed7a8","a2c4c9","9fc5e8","b4a7d6","d5a6bd",
				  "e06666","f6b26b","ffd966","9c347d","76a5af","6fa8dc","8e7cc3","c27ba0",
				  "cc0000","e69138","f1c232","6aa84f","45818e","3d85c6","674ea7","a64d79",
				  "990000","b45f06","bf9000","38761d","134f5c","0b5394","351c75","741b47",
				  "660000","783f04","7f6000","274e13","0c343d","073763","20124d","4c1130"
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
			$("#"+name).css({ "border":"1px dashed #999","background-color":"#fff" }); 	// Set dot
		else				
			$("#"+name).css({ "border":"1px solid #999","background-color":col }); 		// Set dot
		$("#"+name).val(col);												// Set color value
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

Popup.prototype.DateToTime=function(dateString) 						// CONVERT DATE TO MINS +/- 1960
{
/* 	
	Format date  from human readable format to mins +/- 1970
 	@param {number} 
	@return {string} number of mins += 1/1/1970
*/
	if (!dateString)														// No date
		return 0;															// Quit
	if (!isNaN(dateString) && (dateString < -2500) || (dateString > 2500))	// Already in minutea
		return dateString;													// Retun original
	var d=new Date();														// Make new date
	var v=(dateString+"").split("/");										// Split date into parts
	if (v.length == 3)														// Mon/Day/Year
		d.setFullYear(v[2],v[0]-1,v[1]);									// Set it to time
	else if (v.length == 2)													// Mon/Year
		d.setFullYear(v[1],v[0]-1);											// Set it to time
	else																	// Year
		d.setFullYear(v[0]);												// Set it to time
 	var time=d.getTime()/36000000;											// Conver ms to minutes
  	return time;															// Return minutes +/- 1970

}
				