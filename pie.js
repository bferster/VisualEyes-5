////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu and some utilities
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Pie(options)														// CONSTRUCTOR
{
	var i;
	this.ops=options;															// Save options
	this.ops.parent=options.parent ? options.parent : "body";					// If a parent div spec'd use it
	var str="<div id='pimenu' class='pi-main unselectable'></div>";				// Main shell
	$(this.ops.parent).append(str);												// Add to DOM														
	for (i=0;i<this.ops.slices.length;++i)										// For each slice
		this.DrawSlice(this.ops.slices[i]);										// Draw slice

	$("#pimenu").animate({ opacity:1},500, function() {							// Animate in content		
		$("#pimenu").css("opacity",1);											// Force full
		});


}

Pie.prototype.DrawSlice=function(slice)								// DRAW PIE SLICE
{
	var str;
	var id="slice"+slice.id;													// Slice id
	var th=slice.thgt ? slice.thgt : "12";										// Text height
	var orbit=Math.ceil(+slice.id/100);											// Calc orbit ring
	var w=slice.wid ? slice.wid : 50;											// Slice size
	if (slice.edge) 	w-=slice.edge;											// Account for border
	var center=this.ops.slices[0];												// Point at center dot
	var x=center.x+(w*1.5*orbit);
	var y=center.y+4;
	slice.col=slice.col ? slice.col : center.col;								// Cascade
	slice.tcol=slice.tcol ? slice.tcol : center.tcol;							// Cascade
	slice.tfont=slice.tfont ? slice.tfont : center.tfont;						// Cascade
	slice.thgt=slice.tght ? slice.thgt : center.thgt;							// Cascade
	if (orbit)	w*=.75,th*=.75;													// Size outer orbits
		
	switch (slice.type) { 														// Dot
		case "dot":
			str="<div id='"+id+"' class='pi-dot' style='";						// Main shell
			str+="left:"+x+"px;top:"+y+"px;"									// Position
			str+="height:"+w+"px;width:"+w+"px;"								// Size
			if (slice.col)	str+="background-color:"+slice.col+";"				// Color
			if (slice.edge) str+="border:"+slice.edge+"px solid "+slice.ecol+";"// Edge
			if (slice.alpha != undefined) str+="opacity:"+slice.alpha+";"		// Alpha
			if (slice.tcol)	str+="color:"+slice.tcol+";"						// Text color
			if (slice.thgt)	str+="font-size:"+slice.thgt+"px;"					// Text height
			str+="font-size:"+th+"px;border-radius:"+w+"px'>";										// End style
			if (slice.name)	str+="<div style='padding-top:"+((w-th)/2)+"px'>"+slice.name+"</div>";	// Name
			$("#pimenu").append(str+"</div>");									// Add to DOM														
		
			$("#"+id).on("mouseover",function() { 								// ON HOVER ON
				$("#"+id).css({"background-color":ShadeColor(slice.col,.33)});	// Lighten	
				});	
			$("#"+id).on("mouseout",function() { 								// ON HOVER OFF
				$("#"+id).css({"background-color":slice.col});					// Full color
				});	
			break;
		case "text":
			str="<div id='"+id+"' class='pi-text' style='";						// Main shell
			str+="left:"+x+"px;top:"+y+"px;"									// Position
			if (slice.alpha != undefined) str+="opacity:"+slice.alpha+";"		// Alpha
			if (slice.tcol)	str+="color:"+slice.tcol+";"						// Text color
			if (slice.tfont) str+="font-family:"+slice.tfont+";"				// Text font
			if (slice.thgt)	str+="font-size:"+slice.thgt+"px;"					// Text height
			str+="px'>";														// End style
			if (slice.name)	str+=slice.name;									// Name
			$("#pimenu").append(str+"</div>");									// Add to DOM														

			$("#"+id).on("mouseover",function() { 								// ON HOVER ON
				$("#"+id).css({"color":ShadeColor(slice.tcol,.5)});				// Lighten	
				});	
			$("#"+id).on("mouseout",function() { 								// ON HOVER OFF
				$("#"+id).css({"color":slice.tcol});							// Full color
				});	
			break;
		case "bar":
			str="<div id='"+id+"' class='pi-bar' style='";						// Main shell
			str+="left:"+x+"px;top:"+y+"px;"									// Position
			if (slice.alpha != undefined) str+="opacity:"+slice.alpha+";"		// Alpha
			if (slice.tcol)	str+="color:"+slice.tcol+";"						// Text color
			if (slice.tfont) str+="font-family:"+slice.tfont+";"				// Text font
			if (slice.thgt)	str+="font-size:"+slice.thgt+"px;"					// Text height
			if (slice.col)	str+="background-color:"+slice.col+";"				// Color
			if (slice.edge) str+="border:"+slice.edge+"px solid "+slice.ecol+";"// Edge
			str+="border-radius:"+w/2+"px'>";									// End style
			if (slice.name)	str+=slice.name;									// Name
			$("#pimenu").append(str+"</div>");									// Add to DOM														

			$("#"+id).on("mouseover",function() { 								// ON HOVER ON
				$("#"+id).css({"background-color":ShadeColor(slice.col,.33)});	// Lighten	
				});	
			$("#"+id).on("mouseout",function() { 								// ON HOVER OFF
				$("#"+id).css({"background-color":slice.col});					// Full color
				});	
			break;
		}

		$("#"+id).on("click",function() {										// ON SLICE CLICK
			$("#pimenu").remove();												// Remove menu
			});	

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function trace(msg, p1, p2, p3, p4)										// CONSOLE 
	{
		if (p4 != undefined)
			console.log(msg,p1,p2,p3,p4);
		else if (p3 != undefined)
			console.log(msg,p1,p2,p3);
		else if (p2 != undefined)
			console.log(msg,p1,p2);
		else if (p1 != undefined)
			console.log(msg,p1);
		else
			console.log(msg);
	}

	function Sound(sound, mute)												// PLAY SOUND
	{
		var snd=new Audio();													// Init audio object
		if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
			snd=new Audio("img/"+sound+".ogg");									// Use ogg
		else	
			snd=new Audio("img/"+sound+".mp3");									// Use mp3
		if (!mute)																// If not initing or muting	
			snd.play();															// Play sound
		}
		
	function ShadeColor(color, percent) {   
		if (!color)
			return;
		
		var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
		}

