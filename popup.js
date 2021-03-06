////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// POPUP.JS 
// Provides popup and some utilities
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Popup()														// CONSTRUCTOR
{
		this.Sound("click",true);											// Init sound
		this.Sound("ding",true);											// Init sound
		this.Sound("delete",true);											// Init sound
}

Popup.prototype.ShowBooklet=function(div, id, width)					// SHOW BOOKLET
{
	var _this=this;															// Save context for callbacks
	if ((id=FindMobByID(id)) < 0)											// Convert to mob index
		return;																// Quit if bad
	var num=0;																// Starting page
	var o=curJson.mobs[id];													// Point at booklet mob
	$("#st-popup").remove();												// Remove any pre-existing popup
	$("#st-booklet").remove();												// Remove any pre-existing booklet
	if (!o.title && !o.desc)												// Nothing to show
		return;																// Quit
	var str="<div id='st-booklet' class='booklet-main'>";					// Main div
	str+="<div class='popup-title' style='text-align:center;margin-bottom:12px'>";	// Title div
	if (o.title)															// If title set
		str+="<b>"+o.title+"</b>";											// Add it
	str+="<img id='bookClose' src='img/closedot.gif' style='float:right'>";	// Close dot
	str+="</div>";															// End it				
	str+="<div id='st-bookPage' style='overflow-y:auto; overflow-x: hidden'></div>"; // Content div
	if (o.desc.split("page()").length > 1) {								// If multipage
		str+="<img src='img/backbut.png' id='lastB' style='position:absolute;cursor:pointer'>";	// Last button
		str+="<span id='pageCtr' style='position:absolute;font-size:9px;color:#999;font-style:italic'></span>";		// Center area
		str+="<img src='img/nextbut.png' id='nextB' style='position:absolute;cursor:pointer'>";	// Next button
		}
	$("body").append(str);													// Add popup
	setPage(id,num);														// Fill page
	$("#st-booklet").css({ width: o.size+"%"});								// Set width
	$("#st-booklet").height($("#st-booklet").width()*.66);					// Set height
	var x=Math.max($(div).width()/2-$("#st-booklet").width()/2,0);			// Center it
	var y=Math.max($(div).height()/2-$("#st-booklet").height()/2,0);		// Center
	
	$("#st-booklet").css({left:x+"px",top:y+"px"});							// Position
	$("#st-booklet").draggable();											// Make it draggable
	$("#st-booklet").resizable({ resize: function() {	posLabels() } });	// Make it resizable
	$("#st-booklet").fadeIn(300, function() { posLabels(); });				// Fade in

	function posLabels() {													// POSITION LABELS												
		var y=$("#st-booklet").height()+6;									// Top
		var x=$("#st-booklet").width()-2;									// Right
		$("#lastB").css({left:"calc(50% - 50px)",top:y+"px"});				// Position
		$("#nextB").css({left:"calc(50% + 40px)",top:y+"px"});				// Position
		$("#pageCtr").css({left:"calc(50% - 24px)",top:(y+4)+"px"});		// Position
		$("#st-bookPage").height($("#st-booklet").height()-60);				// Set scrolling div height
		}

	$("#lastB").on("click", function() {									// ON BACK CLICK
		pop.Sound("click");													// Click
		num=setPage(id,--num);												// Write page
		});

	$("#nextB").on("click", function() {									// ON NEXT CLICK
		pop.Sound("click");													// Click
		num=setPage(id,++num);												// Write page
		});

	$("#bookClose").on("click", function() {								// ON CLOSE
		$("#st-booklet").remove();											// Remove booklet
		});
			
	function setPage(id, num)											// FILL UP PAGE
	{
		var str="";
		var pages=curJson.mobs[id].desc.split("page()");					// Get pages from desc field
		num=Math.max(Math.min(num,pages.length-1),0)						// Cap 0-n
		var content=pages[num]+"";											// Point at content
		if ((pic=content.match(/pic\(.*?\)/i))) {							// If pic set
			var v=pic[0].substring(4,pic[0].length-1).split(",");			// Split from possible caption
			var cap=v[1] ? "<br>"+v[1] : "";								// Get cap
			content=content.replace(/pic\(.*?\)/i,"");						// Delete text
			var wid=content ? 50 : 100;										// Full size if no content text
			str+="<p id='poppic' style='float:left;width:"+wid+"%;overflow:hidden;margin-right:16px;font-size:10px'>";	// Enclosing div for image and caption
			v[0]=ConvertFromGoogleDrive(""+v[0]);							// Convert pic
			str+="<img src='"+v[0]+"' class='booklet-pic'>";				// Add image
			str+=cap+"</p>";												// Add caption & enclosing div
			}
		if (content) 														// If page set
			str+=pop.ExpandMacros(content);									// Expand macros, if any
		$("#st-bookPage").scrollTop(0);										// Scroll to top
		$("#st-bookPage").html(str);										// Add content
		$("#pageCtr").text("Page "+(num+1)+" of "+(pages.length));			// Page counter

		$("#poppic").on("click", function() {								// ON PIC CLICK
			pop.Sound("click");												// Click
			if ($(this).css("cursor") == "zoom-out")						// If big
				$(this).css({"width":"50%","cursor":"zoom-in"});			// Make it small
			else															// If small
				$(this).css({"width":"100%","cursor":"zoom-out"});			// Make it big
		});
	
		return num;															// Return current page
		}
}

Popup.prototype.ShowPopup=function(div, timeFormat, x, y,  title, desc, pic, date, end)	// SHOW POPUP
{
	$("#st-popup").remove();												// Remove any pre-existing popup
	if (x == undefined)														// If no x defined
		return;																// We're just removing
	if (!title && !desc)													// Nothing to show
		return;																// Quit
	var str="<div id='st-popup' class='popup-main'>";						// Add message
	str+="<div class='popup-title'>";										// Title div
	if (title)																// If title set
		str+="<b>"+title+"</b>";											// Add it
	str+="<img src='img/closedot.gif' style='float:right;cursor:pointer' onclick='$(\"#st-popup\").remove()'>";
	if (date) {																// If date set
		date=this.FormatTime(date,timeFormat);								// Format time to date
		str+="<span class='popup-date'>&nbsp;&nbsp;"+date+"</span>";		// Add it
		}
	if (end) {																// If end date set
		end=this.FormatTime(end,timeFormat);								// Format time to date
		str+="<span class='popup-date'>&nbsp;-&nbsp;"+end+"</span>";		// Add it
		}
	str+="</div><table style='width:100%'><tr>";
	if (pic) {																// If pic set
		pic=ConvertFromGoogleDrive(pic);									// Convert pic
		str+="<td style='vertical-align:top'><img id='poppic' src='"+pic+"' class='popup-pic'></td>";	// Add image
		}
	if (desc) {																// If desc set
		desc=this.ExpandMacros(desc);										// Expand macros, if any
		str+="<td class='popup-desc' id='popdesc'>"+desc+"</div></td>";		// Add it
		}
	$("body").append("</tr></table>"+str);									// Add popup
	if (x < 0) {															// Bigger 
		$("#poppic").css("cursor","");										// Normal cursor
		$("#st-popup").css("max-width",$(div).width()*.75+"px");			// Make it wider
		$("#st-popup").css("max-height",$(div).height()*.75+"px");			// Make it taller
		$("#poppic").width($(div).width()*(desc ? .5 : .75)+"px")			// Make pic bigger
		x=$(div).width()/2-$("#st-popup").width()/2;						// Center it
		y=50;																// Near top			
		}

	if (desc.match(/\(BIG\)/) || (div == "#leftDiv")) {						// If (BIG) tag or map click
		$("#popdesc").html($("#popdesc").html().replace(/\(BIG\)/,""));		// Remove tag
		enlarge();															// Enlarge
		}
	else{																	// Regular size
		$("#st-popup").css({left:(x+8)+"px",top:(y+20)+"px"});				// Position
		if ((y+50+$("#st-popup").height() > $(div).offset().top+$(div).height()) && (y != 50)) { // Overflows bottom
			y=$(div).offset().top+$(div).height()-50-$("#st-popup").height();	// Cap at bottom
			$("#st-popup").css({top:(y+20)+"px"});							// Re-position
			}
		}
	$("#st-popup").fadeIn(300);												// Fade in 
	
	$("#st-popup").click( function() { enlarge(); });						// ON CLICK OF TEXT

	$("#poppic").click( function(e) {										// ON CLICK OF PIC
		if ($("#st-popup").width() < 301)									// If not enlarged
			return;															// Do nothing							
		var h=$("#leftDiv").height();										// Get map height
		$("#popdesc").html("");												// Clear description
		$("#st-popup").css("cursor","auto");								// Normal cursor
		var r=($("#poppic").width()/$("#poppic").height() < 1) ? .33 : .66;	// Make smaller if portait mode
		$("#poppic").css("cursor","auto");									// Normal cursor
		$("#st-popup").css("max-height",h-100+"px");						// Make it taller
		$("#st-popup").css("max-width",$(div).width()*r+"px");				// Make it wider
		$("#poppic").css("max-height",h-150);								// Make pic taller
		$("#poppic").css("max-width",$(div).width()*r-8+"px");				// Make pic wider
		$("#poppic").width($(div).width()*r);								// Make pic wider
		var x=($(div).width()-$("#st-popup").width())/2;					// Center it
		var y=(h-$("#st-popup").height())/2;								// Center it
		$("#st-popup").css({left:x-16+"px",top:y-16+"px"});					// Position
		e.stopPropagation()
		});

	function enlarge() {													// ENLARGE POPUP TO MAP AREA
		var h=$("#leftDiv").height();										// Get map height
		if (h < 150)	return;												// Too small
		$("#popdesc").css("cursor","auto");									// Normal cursor
		var r=($("#poppic").width()/$("#poppic").height() < 1) ? .8 : 1;	// Make smaller if portait mode
		$("#st-popup").css("max-width",$(div).width()*.55);					// Make it wider
		$("#st-popup").css("max-height",h-200+"px");						// Make it taller
		$("#poppic").css("max-height",h-250+"px");							// Make pic taller
		$("#poppic").css("max-width",$(div).width()*(desc ? .25*r : .66*r)+"px");	// Make pic bigger
		var x=($(div).width()-$("#st-popup").width())/2;					// Center it
		var y=(h-$("#st-popup").height())/2;								// Center it
		$("#st-popup").css({left:x-16+"px",top:y-16+"px"});					// Position
		$("#popcite").fadeIn();												// Show citation, if any
		}

}
 
Popup.prototype.GetTextBox=function (title, content, def, callback)		// GET TEXT LINE BOX
{
	this.Sound("click");													// Ding sound
	$("#textBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='ve-unselectable' id='textBoxDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content;
	str+="<p><input class='ve-is' type='text' id='gtBoxTt' value='"+def+"'></p></div>";
	$("#textBoxDiv").append(str);	
	$("#textBoxDiv").dialog({ width:400, buttons: {
				            	"OK": 		function() { callback($("#gtBoxTt").val()); $(this).remove(); },
				            	"Cancel":  	function() { $(this).remove(); }
								}});	
	
	$("#gtBoxTt").keypress(function (e) {
		if (e.which == 13) {
			callback($("#gtBoxTt").val()); 
			$("#textBoxDiv").remove();												
			return false;   
			}
		});

	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});
}


Popup.prototype.FileSelect=function (files, callback)					// SELECT FILE FROM LIST
{
	var i;
	var trsty=" style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' ";
	trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'";
	$("#lightBoxDiv").remove();												// Close old one
	str="<br>Choose file from the list below.<br>"
	str+="<br><div style='width:100%;max-height:300px;overflow-y:auto'>";
	str+="<table style='font-size:12px;width:100%;padding:0px;border-collapse:collapse;'>";
	str+="<tr></td><td><b>Title </b></td><td><b>Date&nbsp;&&nbsp;time</b></td><td align=right><b>&nbsp;&nbsp;&nbspId</b></tr>";
	str+="<tr><td colspan='3'><hr></td></tr>";
	for (i=0;i<files.length;++i) 										// For each item
		str+="<tr id='pop"+i+"' "+trsty+"><td>"+files[i].title+"</td><td>"+files[i].date.substr(5,11)+"</td><td align=right>"+files[i].id+"</td></tr>";
	str+="</table></div><div style='font-size:12px;text-align:right'><br>";	
	str+=" <button class='ve-bs' id='fsCancel'>Cancel</button></div>";	
	pop.ShowLightBox("Load a file",str);								// Show lightbox

	for (i=0;i<files.length;++i) {										// For each item
		
		$("#pop"+i).click(function(e) {									// CLICK ON ITEM
			var id=e.currentTarget.id.substr(3);						// Extract id
			callback(files[id].id,files[id].title);						// Run callback with id, title
			$("#lightBoxDiv").remove();									// Close
			});
		}

	$("#fsCancel").click(function(e) {									// CANCEL BUTTON
		$("#lightBoxDiv").remove();										// Close
		});

}


Popup.prototype.Dialog=function (title, content, callback, callback2) // DIALOG BOX
{
	this.Sound("click");												// Ding sound
	$("#dialogDiv").remove();											// Remove any old ones
	$("body").append("<div class='ve-unselectable' id='dialogDiv'></div>");														
	var str="<p><img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#666'><b>"+title+"</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#dialogDiv").append(str);	
	$("#dialogDiv").dialog({ width:450, buttons: {
				            	"OK": 		function() { if (callback)
				            								callback(); 
				            								$(this).remove();  
				            								},
				            	"Cancel":  	function() { if (callback2)	            		
				            								callback2();
				            								$(this).remove(); }
								}});	
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});
}


Popup.prototype.LogIn=function(callback, getTitle)						// LOG IN DIALOG
{
  	var _this=this;															// Save context for callbacks
	this.Sound("click");													// Click sound
	$("#alertBoxDiv").remove();												// Remove any old ones
	$("body").append("<div class='qm-unselectable' id='alertBoxDiv'></div>");	// Add dialog												
	var un=this.GetCookie("email");											// Get email from cookie
	var pw=this.GetCookie("password");										// Password
	var str="<p><img src='images/qlogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>Login</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>Please type your email, and password:<br></div>";
	str+="<table style='font-size:14px;margin:14px'>";
	str+="<tr><td>Email </td><td><input class='ve-is' type='text' id='gtBoxUn' value='"+un+"'></td></tr>";
	str+="<tr><td>Password</td><td><input class='ve-is' type='password' id='gtBoxPw'  value='"+pw+"'></td></tr>";
	if (getTitle)															// If getting title
		str+="<tr><td>Title</td><td><input class='ve-is' type='text' id='gtBoxTitle'></td></tr>";
	$("#alertBoxDiv").append("</table>"+str);	
	$("#alertBoxDiv").dialog({ width:400, modal:true, buttons: {			// Run dialog
			            	"OK": function() { 								// OK
			            		un=$("#gtBoxUn").val();						// Get username
			            		pw=$("#gtBoxPw").val();						// Get password
			            		var title=$("#gtBoxTitle").val();			// Get password
			            		callback(un,pw,title); 						// Callback
								_this.SetCookie("password",pw,7);			// Save cookie
								_this.SetCookie("email",un,7);				// Save cookie
			            		$(this).remove();							// Remove dialog
			            		},
	            			"Cancel": function() { 	$(this).remove()}		// Remove dialog
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
	str+="<img src='img/shantilogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span id='lightBoxTitle' style='font-size:18px;text-shadow:1px 1px #ccc'><b>"+title+"</b></span>";
	str+="<div id='lightContentDiv'>"+content+"</div>";					
	$("#lightBoxDiv").append(str);	
	$("#lightBoxDiv").css("z-index",2500);						
}

Popup.prototype.ConfirmBox=function(content, callback)					// CONFIRMATION BOX
{
	this.Sound("delete");													// Delete sound
	$("body").append("<div class='unselectable' id='confirmBoxDiv'></div>");														
	var str="<p><img src='images/qlogo32.png' style='vertical-align:-10px'/>&nbsp;&nbsp;";								
	str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>Are you sure?</b></span><p>";
	str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
	$("#confirmBoxDiv").append(str);	
	$("#confirmBoxDiv").dialog({ width:400, buttons: {
				            	"Yes": function() { $(this).remove(); callback() },
				            	"No":  function() { $(this).remove(); }
								}});	
	$("#confirmBoxDiv").dialog("option","position",{ my:"center", at:"center", of:window });
	$(".ui-dialog-titlebar").hide();
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
	$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
	$(".ui-button").css({"border-radius":"30px","outline":"none"});
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

Popup.prototype.ShowWebPage=function(div, url, title)						// SHOW WEB PAGE
{
	var pan=false;
	$("#st-webpage").remove();												// Remove any pre-existing popup
	if (!url)																// If no url defined
		return;																// We're just removing
	var str="<div id='st-webpage' class='popup-webpage' style='";			// Add div
  	if (title == "zoomer") title="Pan and Zoom",pan=true					// If doing a zoomer

  	str+="width:"+($(div).width()*.64);										// Width
  	str+="px;height:"+$(div).height();										// Height
  	str+="px;top:70px;left:"+($(div).width()*.16)+"px'>";					// Finish div
 	str+="<div class='popup-title' style='text-align:center'><b>"+(title ? title : '')+"</b></div>";	// Add title if set
	str+="<img id='st-close' src='img/closedot.gif' style='position:absolute;top:1px;cursor:pointer'>"	// Add close button
	if (pan) {																// If doing a zoomer
		$("body").append(str+"</div>");										// Add popup
		$("#st-close").css("top","9px");									// Shift close dot down
		this.DrawZoomer("st-webpage",url,2,4);								// Add it
		}
	else{																	// Web page
		str+="<iframe id='popupIF' allowfullscreen frameborder='0' height='100%' width='100%' style='opacity:0,border:1px solid #666' src='"+url+"'></iframe>";	// Add iframe
		$("body").append(str+"</div>");										// Add popup
		}
	$("#st-close").css("left",$("#st-webpage").width()-4+"px");				// Far right
	$("#st-webpage").fadeIn(1000);											// Fade in
	$("#st-close").click(function() { $("#st-webpage").remove(); });		// Remove on click of close but
}

Popup.prototype.ExpandMacros=function(desc)								// EXPAND MACROS
{
	var i,j,ss;
	var v,v,vvv,str="";
	if (!desc) return null;

	if (desc.match(/where\(/)) {											// If where macro
		v=(desc+" ").match(/where\(.*?\)/ig);								// Extract where(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/where\(([^,]+),(.+)\)/i);						// Get parts
			if (vv && (vv.length > 2)) 										// If enough params
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:mps.Goto(\""+vv[2].replace(/<.*?>/g,"")+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
			}	
		}
	if (desc.match(/link\(/)) {												// If link macro
		v=(desc+" ").match(/link\(.*?\)/ig);								// Extract links(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/link\(([^,]+),(.+)\)/i);							// Get parts
			if (vv && (vv.length > 2)) {									// If enough params
				if (vv[2].match(/http:\/\//)) 	ss=vv[2];					// Insecure sites must use new tab
				else	ss="javascript:ShowIframe2(\""+vv[2]+"\",\"map\")";	// Secure can show in iframe
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a style='color:#000077' target='_blank' onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='"+ss+"'>"+vv[1]+"</a>");	// Replace with anchor tag
				}
			}	
		}
	if (desc.match(/show\(/)) {												// If show macro
		v=(desc+" ").match(/show\(.*?\)/ig);								// Extract show(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/show\(([^,]+),(.+)\)/i);							// Get parts
			if (vv && (vv.length > 2)) {									// If enough params
				vvv=vv[2].split(",");										// Get params
				if (vvv)													// If multi-part show with no visible part
					desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:toggleLayer(\""+vvv[0]+"\",\""+vvv[1]+"\",\""+vvv[2]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
				}
			}	
		}
	if (desc.match(/foot\(/)) {												// If foot macro
		v=(desc+" ").match(/foot\(.*?\)/ig);								// Extract footnotes(s)
		for (i=0;i<v.length;++i) {											// For each foot
			title=v[i].substr(5,v[i].length-6);								// Extract text
			desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"))," <a href='#' title='"+title+"'><b><sup></ul>"+(i+1)+"</b></sup></a> ");	// Replace with anchor tag
			}	
		}
	if (desc.match(/bar\(/)) {												// If bar macro
		v=(desc+" ").match(/bar\(.*?\)/ig);									// Extract bar(s)
		for (i=0;i<v.length;++i) {											// For each bar
			title=v[i].substr(4,v[i].length-5);								// Extract title bar
			desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<div class='popup-bar'>"+title+"</div>");	// Replace with title bar
			}	
		}
	if (desc.match(/zoomer\(/)) {											// If zoomer macro
		v=(desc+" ").match(/zoomer\(.*?\)/ig);								// Extract zoomer(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/zoomer\(([^,]+),(.+)\)/i);						// Get parts
			if (vv && (vv.length > 2)) 										// If enough params
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:pop.ShowWebPage(\"#leftDiv\",\""+vv[2]+"\",\"zoomer\")'>"+vv[1]+"</a>");	// Replace with anchor tag
			}	
		}
	if (desc.match(/story\(/)) {											// If story macro
		v=(desc+" ").match(/story\(.*?\)/ig);								// Extract story element(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/story\(([^,]+),(.+)\)/i);						// Get parts
			if (vv && (vv.length > 2)) 										// If enough params
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:sto.Open(\""+vv[2]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
			}	
		}
	if (desc.match(/booklet\(/)) { 											// If booklet macro
		v=(desc+" ").match(/booklet\(.*?\)/ig); 							// Extract show(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/booklet\(([^,]+),(.+)\)/i);						// Get parts
			if (vv && (vv.length > 2) && ((j=FindMobByID(vv[2])) >= 0)) {	// If enough params and a good id
				var ss="<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:pop.ShowBooklet(\"#leftDiv\",\""+vv[2]+"\",\""+vv[3]+"\")'>"+vv[1]+"</a>";
				if (curJson.mobs[j].color)
					ss="<div class='ve-gbs' style='background-color:"+curJson.mobs[j].color+"' onclick='sto.pop.Sound(\"click\",curJson.muteSound);pop.ShowBooklet(\"#leftDiv\",\""+vv[2]+"\",\""+vv[3]+"\")'>"+vv[1]+"</div>";
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),ss); // Replace with anchor tag
				}
			}   
		}
	if (desc.match(/opacity\(/)) {											// If opacity macro
		v=(desc+" ").match(/opacity\(.*?\)/ig);								// Extract slider
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/opacity\(([^,]+),(.+)\)/i);						// Get macro (title,val,id)
			if (vv.length < 3)				return desc;					// Quit if not enough params
			vvv=vv[2].split(",");											// Get params
			str=vv[1]+": <input id='alphaVal' style='vertical-align:-8px' type='range' min='0' max='100' value='100' ";
			str+="oninput='layerAlpha(\""+vvv[0]+"\",this.value)' ";
			str+="onchange='layerAlpha(\""+vvv[0]+"\",this.value)'>";
			desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),str);	// Replace with anchor tag
			}	
		}
	if (desc.match(/button\(/)) {											// If button macro
		v=(desc+" ").match(/button\(.*?\)/ig);								// Extract button
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/button\(([^,]+),(.+)\)/i);						// Get macro (x,title,params)
			if (vv.length < 3) return desc;									// Quit if not enough params
			str="<button class='ve-is' style='width:auto;margin-bottom:4px;' onclick='"; // Header
			if (!vv[2].match(/:/))											// If not an action
				vv[2]="mask:"+vv[2];										// Force regex into an action
			str+="pop.SendActions(\""+vv[2]+"\")";							// Send them		
			str+="'>"+vv[1]+"</button>";									// End button
			desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),str);	// Replace with anchor tag
			}	
		}
	if (desc.match(/radio\(/)) {											// If radio macro
		var name="name='rad-"+Math.floor(Math.random()*1000000)+"' ";		// Set unique group name
		v=(desc+" ").match(/radio\(.*?\)/ig);								// Extract radio
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/radio\(([^,]+),(.+)\)/i);						// Get macro (title, cmd)
			if (vv.length < 3) return desc;									// Quit if not enough params
			vvv=vv[2].split(",");											// Get params
			if (vvv[vvv.length-1].toLowerCase() == "on")					// An on command
				vvv.pop();													// Remove it
			for (j=1;j<vvv.length;++j)	vvv[0]+=","+vvv[j];					// Put back into string
			str="<input style='vertical-align:-2px' type='radio'"+name;		// Header
			if (!vvv[0].match(/:/))											// If not an action, must be a regex
				vvv[0]="mask:"+vvv[0];										// Force regex into an action
			if (vv[0].match(/on\)/i)) {										// If turning it on
				pop.SendActions(vvv[0]);									// Send action(s)	
				str+=" checked ";											// Check it
				}
			str+=" onclick='pop.SendActions(\""+vvv[0]+"\")'> "+vv[1];		// Send action(s)
			desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),str);	// Replace with anchor tag
			}	
		}
	if (desc.match(/mask\(/)) {                                   			// If mask macro
        v=(desc+" ").match(/mask\(.*?\)/ig);                       			// Extract segment
        vv=v[0].match(/mask\(([^,\)]*),*(.*)\)/i);                  		// Get parts
        dtl.SetTagMask(vv[1]);                                      		// Set mask
        desc=desc.replace(RegExp(vv[0].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"");      // Remove macro
		}                   
	if (desc.match(/play\(/)) {												// If play macro
		v=(desc+" ").match(/play\(.*?\)/ig);								// Extract play element(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/play\(([^,]+),(.+)\)/i);							// Get parts
			if (vv && (vv.length > 2)) {									// If enough params
				vvv=vv[2].split(",");										// Get params
				if (vv[1] == 'auto' && (sto.storyMode == "Stepped"))		// Stepped mode and auto
					tln.PlaySeg(vvv[0],vvv[1],vvv[2],vvv[3]),vv[1]="";		// Trigger animation
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:tln.PlaySeg(\""+vvv[0]+"\",\""+vvv[1]+"\",\""+vvv[2]+"\",\""+vvv[3]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
				}
			}	
		}
	if (desc.match(/action\(/)) {											// If an action macro
		v=(desc+" ").match(/action\(.*?\)/ig);								// Extract action(s)
		for (i=0;i<v.length;++i) {											// For each one
			vv=v[i].match(/action\(([^,]+),(.+)\)/i);						// Get parts
			if (vv && (vv.length > 2)) 										// If enough params
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a onclick='sto.pop.Sound(\"click\",curJson.muteSound)' href='javascript:pop.SendActions(\""+vv[2]+"\")'>"+vv[1]+"</a>");	// Replace with anchor tag
			}
		}
	if (desc.match(/fold\(/i)) {											// If fold macro
		v=(desc+" ").match(/fold\(.*?\).+fe\(\)/ig);						// Extract folds(s)
		for (i=0;i<v.length;++i) {											// For each macro
			vv=v[i].match(/fold\((.*?)\)(.*?)fs\(\)(.+?)fe\(\)/i);			// Get parts
			if (vv.length > 3) {											// Valid
				str=vv[2]+"<div style='display:none' id='fs-"+i+"'>"+vv[3]+"</div>";	// Hidden text
				desc=desc.replace(RegExp(v[i].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")),"<a id='afs-"+i+"' onclick='sto.pop.Sound(\"click\",curJson.muteSound),$(\"#\"+this.id.substr(1)).toggle()' href='javascript:'>"+vv[1]+"</a>"+str);	// Replace with anchor tag
				}
			}
		}
	
	return desc;															// Return expanded html
}


///////////////////////////////////////////////////////////////////////////////////////////////
//  HELPERS
///////////////////////////////////////////////////////////////////////////////////////////////


Popup.prototype.SetCookie=function(cname, cvalue, exdays)				// SET COOKIE
{
	var d=new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

Popup.prototype.SendActions=function(actions) 						// SEND ACTION MESSAGE(s)
{
	var i,v,vv,op,val;
	v=actions.split("+");												// Array of actions
	for (i=0;i<v.length;++i) {											// For each one
		op=v[i].split(":")[0];											// Opcode
		val=v[i].substr(op.length+1);									// Get value
		if (op)															// At least a command
			window.postMessage("Popup="+op+"|"+val,"*");				// Send message to wind
		}
}

Popup.prototype.GetCookie=function(cname) {								// GET COOKIE
	var name=cname+"=",c;
	var ca=document.cookie.split(';');
	for (var i=0;i<ca.length;i++)  {
	  c=ca[i].trim();
	  if (c.indexOf(name) == 0) 
	  	return c.substring(name.length,c.length);
	  }
	return "";
}

Popup.prototype.Sound=function(sound, mute)								// PLAY SOUND
{
	var snd=new Audio("img/"+sound+".mp3");									// Load mp3
	if (!mute)	snd.play();													// If not initing or muting, play sound
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
	d=new Date(time*60000);													// Convert minutes to ms
	var year=d.getFullYear();												// Get year
	if (year < 0)	year=(-1*year)+" BCE";									// Show as BCE
	if (format == "Mo/Year") 												// 1/1900
		str=(d.getMonth()+1)+"/"+year;										// Set it
	else if (format == "Mo/Day/Year") 										// 1/1/1900
		str=(d.getMonth()+1)+"/"+d.getDate()+"/"+year;						// Set it
	else if (format == "Mon Year") 											// Jan 1900
		str=mos[d.getMonth()]+" "+year;										// Set it
	else if (format == "Mon Day, Year") 									// Jan 1, 1900
		str=mos[d.getMonth()]+" "+d.getDate()+", "+year;					// Set it
	else																	// Default to only year
		str=year;															// Set it
  	return str;																// Return formatted date
}

Popup.prototype.DateToTime=function(dateString) 						// CONVERT DATE TO MINS +/- 1960
{
/* 	
	Format date  from human readable format to mins +/- 1970
 	@param {number} 
	@return {string} number of mins += 1/1/1970
*/
	var mins=0;																// Assume no extra time
	if (!dateString)														// No date
		return 0;															// Quit
	if (!isNaN(dateString) && (dateString < -2500) || (dateString > 2500))	// Already in minutes
		return dateString;													// Return original
	var d=new Date();														// Make new date
	dateString+="";															// Make sure it's a string
	if (dateString.split(":").length > 1) {									// Has hours
		mins=dateString.split(":")[1]*60;									// Turn hours into minutes	
		dateString=dateString.split(":")[0];								// Lop off minutes	
		}
	var v=(dateString).split(" ")[0].split("/");							// Split date into parts
	if (v.length == 3)														// Mon/Day/Year
		d.setFullYear(v[2],v[0]-1,v[1]);									// Set it to time
	else if (v.length == 2)													// Mon/Year
		d.setFullYear(v[1],v[0]-1);											// Set it to time
	else																	// Year
		d.setFullYear(v[0]);												// Set it to time
	d.setMinutes(0); 	d.setSeconds(0); 									// Clear minutes/seconds
 	var time=(d.getTime()/60000)+mins;										// Conver ms to minutes and add extra time
  	 return time;															// Return minutes +/- 1970

}

				
/////////////////////////////////////////////////////////////////////////////////////////////////////// 
// ZOOMER
/////////////////////////////////////////////////////////////////////////////////////////////////////// 


Popup.prototype.DrawZoomer=function(div, url, startZoom, overviewSize) 	//	DRAW ZOOMER
{

/* 
 	Draws iframe in popup  
 	@param {string} div 		Container div
	@param {string} url 		URL of image.
	@param {number} startZoom 	Starting zoom amount.
	@param {number} startZoom 	Overview size as a divisor.
	
*/	
	var str,i,j,k,o,v,vv;
 	this.div="#"+div;														// Current div selector
 	var _this=this;															// Context for callbacks
	var str="<div id='zoomerOuterDiv' style='border:1px solid #666;overflow:hidden;margin-right:3px;margin-bottom:3px;'>";	// Make outer div
 	str+="<div id='zoomerDiv' </div></div>";								// Make Zoomer div
	$(this.div).height("auto");												// Height is auto
	$(this.div).append(str);												// Add div
  	this.zoomerScale=startZoom;												// Init scale
	this.zoomerOverviewSize=overviewSize;									// Set size
	url=ConvertFromGoogleDrive(url);										// Convert pic
	str="<img id='zoomerImg' src='"+url+"' ";								// Add image
	str+="height='100%' width='100%'>";										// Size
	$("#zoomerDiv").append(str);											// Add image to zoomer
	
	$("#zoomerImg").load(function(e) {										// WHEN IMAGE IS LOADED
		_this.zoomerWidth=$(this).width();									// Get true width
		_this.zoomerHeight=$(this).height();								// Get true height
		_this.zoomerAsp=_this.zoomerHeight/_this.zoomerWidth;				// Get aspect ratio
		_this.zoomerX=_this.zoomerY=.5; 									// Default center
		$("#zoomerOuterDiv").height($("#zoomerOuterDiv").width()*_this.zoomerAsp);
		_this.DrawZoomerOverview(url);										// Reflect pos in overview
		_this.PositionZoomer();												// Position it
		});

	$("#zoomerDiv").draggable({ drag:function(event,ui) {					// Make it draggable
		var w=$("#zoomerDiv").width();										// Get image width
		var h=$("#zoomerDiv").height();										// Get image height
		var s=this.zoomerScale;												// Current scale
		_this.DrawZoomerOverview(url);										// Reflect pos in overview
		}});	 
	}

Popup.prototype.PositionZoomer=function() 								// POSITION ZOOMER
{
	var s=this.zoomerScale;													// Point at scale
	var w=this.zoomerWidth*s;												// Get image width scaled
	var h=this.zoomerHeight*s;												// Get image height
	$("#zoomerDiv").width(w);												// Size it
	$("#zoomerDiv").height(h);												// Size it
	var l=w*this.zoomerX-(w/s/2);											// Get left
	var t=h*this.zoomerY-(h/s/2);											// Get top
	$("#zoomerDiv").css({"left":-l+"px","top":-t+"px"});					// Position zoomer	
	var l=$(this.div).position().left;										// Left boundary
	var r=l-0+(w/s-w+14);													// Right boundary
	var t=$(this.div).position().top;										// Top boundary
	var b=t-0+(h/s-h+36);													// Bottom boundary
	$("#zoomerDiv").draggable("option",{ containment: [r,b,l,t] } );		// Reset containment
}

Popup.prototype.DrawZoomerOverview=function(url) 						// DRAW ZOOMER OVERVIEW
{
	var str;
	var s=this.zoomerScale;													// Scale
	if (!this.zoomerOverviewSize)
		return;
 	var _this=this;															// Context for callbacks
	var w=$("#zoomerOuterDiv").width()/this.zoomerOverviewSize;				// Width of frame
	var h=$("#zoomerOuterDiv").height()/this.zoomerOverviewSize;			// Height of frame
	var h=w*h/w;															// Height based on aspect
	var p=$("#zoomerOuterDiv").position();									// Offset in frame
	
	if ($("#zoomerOverDiv").length == 0)  {									// If not initted yet 
		var css = { position:"absolute",									// Frame factors
					left:w*this.zoomerOverviewSize-w+p.left+"px",
					width:w+"px",
					height:h+"px",
					top:h*this.zoomerOverviewSize-h+p.top+"px",
					"border-left":"1px solid #ccc",
					"border-top":"1px solid #eee"
					};
		
		str="<div id='zoomerOverDiv'></div>";								// Frame box div
		$("#zoomerOuterDiv").append(str);									// Add to div
		$("#zoomerOverDiv").css(css);										// Set overview frame
		url=ConvertFromGoogleDrive(url);									// Convert pic
		str="<img src='"+url+"' ";											// Name
		str+="height='"+h+"' ";												// Height
		str+="width='"+w+"' >";												// Width
		$("#zoomerOverDiv").append(str);									// Add image to zoomer
		if (typeof(DrawZoomerOverviewGrid) == "function")					// If not embedded
			DrawZoomerOverviewGrid();										// Draw grid in overview if enabled
			var css = { position:"absolute",								// Box factors
						border:"1px solid #eee",
						"z-index":3,
						"background-color":"rgba(220,220,220,0.4)"
						};
		str="<div id='zoomerOverBox'></div>";								// Control box div
		$("#zoomerOverDiv").append(str);									// Add control box to overview frame
		$("#zoomerOverBox").css(css);										// Set overview frame
		$("#zoomerOverBox").draggable({ containment:"parent", 				// Make it draggable 
							drag:function(event,ui) {						// Handle drag						
								var w=$("#zoomerOverDiv").width();			// Overview width
								var pw=$("#zoomerDiv").width();				// Zoomer width
								var h=$("#zoomerOverDiv").height();			// Overview hgt
								var ph=$("#zoomerDiv").height();			// Zoomer hgt
								var s=_this.zoomerScale;					// Current scale
								var x=Math.max(0,ui.position.left/w*pw);	// Calc left
								var y=Math.max(0,ui.position.top/h*ph);		// Calc top
								_this.zoomerX=(x+(pw/s/2))/pw; 				// Get center X%
								_this.zoomerY=(y+(ph/s/2))/ph;  			// Get center Y%
								$("#zoomerDiv").css({"left":-x+"px","top":-y+"px"});	// Position zoomer	
								}
							 });		
		$("#zoomerOverBox").resizable({ containment:"parent",				// Resizable
								aspectRatio:true,
								minHeight:12,
								resize:function(event,ui) {					// On resize
									var w=$("#zoomerOverDiv").width();		// Overview width
									var pw=$("#zoomerDiv").width();			// zoomer width
									var h=$("#zoomerOverDiv").height();		// Overview hgt
									var ph=$("#zoomerDiv").height();		// zoomer hgt
									_this.zoomerScale=Math.max(w/ui.size.width,1); 	// Get new scale, cap at 100%					
									var s=_this.zoomerScale;				// Current scale
									var x=Math.max(0,ui.position.left/w*pw);// Calc left
									var y=Math.max(0,ui.position.top/h*ph);	// Calc top
									_this.zoomerX=(x+(pw/s/2))/pw; 			// Get center X%
									_this.zoomerY=(y+(ph/s/2))/ph;  		// Get center Y%
									_this.PositionZoomer();					// Redraw
									}
								}); 
			}

		var x=$("#zoomerDiv").css("left").replace(/px/,"");					// Get x pos
		x=-$("#zoomerOuterDiv").width()/2;									// Center it
		x=-x/w/this.zoomerOverviewSize*w/this.zoomerScale;					// Scale to fit
		var y=$("#zoomerDiv").css("top").replace(/px/,"");					// Get y pos
		y=-$("#zoomerOuterDiv").height()/2;									// Center it
		y=-y/h/this.zoomerOverviewSize*h/this.zoomerScale;					// Scale to fit
		$("#zoomerOverBox").width(w/this.zoomerScale).height(h/this.zoomerScale);	// Set size
		$("#zoomerOverBox").css({"left":x+"px","top":y+"px"});				// Position control box		
}
