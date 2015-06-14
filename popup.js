////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// POPUP.JS 
// Provides popup
// Requires: Sound()
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Popup()														// CONSTRUCTOR
{

/* 
  	@constructor
  	Styling of popups dependent on css: .popup-*.*

*/

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
	if (x == undefined)	{													// If no x defined
		trace(123)
		return;																// We're just removing
	}
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
//	trace(this.timeFormat)
	if (!format)															// If no format spec'd
		format=this.timeFormat;												// Use global format
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
				