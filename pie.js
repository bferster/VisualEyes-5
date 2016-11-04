////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIE.JS 
// Provides pie/radial menu and some utilities
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Pie(options)														// CONSTRUCTOR
{
	var i;
	this.ops=options;															// Save options
	this.ops.parent=options.parent ? options.parent : "body";					// If a parent div spec'd use it
	this.ops.id=options.id ? options.id : "pmenu";								// If an spec'd use it
	var str="<div id='"+this.ops.id+"' class='pi-main'></div>";					// Main shell
	$(this.ops.parent).append(str);												// Add to DOM														


	this.DrawSlice(this.ops.center,0);											// Draw slice
//	for (i=0;i<this.ops.slices.options.length;++i)								// For each slice
//		this.DrawSlice(this.ops.slices[i]);										// Draw slice

}

Pie.prototype.DrawSlice=function(slice, node)								// DRAW PIE SLICE
{
	var str;
	var id="#slice"+node;														// Slice id
	var th=slice.thgt ? slice.thgt : "12";										// Text height
	switch (slice.type) { 														// Dot
		case "dot":
			str="<div id='"+id+"' class='pi-slice' style='";					// Main shell
			str+="left:"+slice.x+"px;top:"+slice.y+"px;"						// Position
			str+="height:"+slice.wid+"px;width:"+slice.wid+"px;"				// Size
			if (slice.col)	str+="background-color:"+slice.col+";"				// Color
			if (slice.edge) str+="border:"+slice.edge+"px solid "+slice.ecol+";"// Edge
			if (slice.alpha != undefined) str+="opacity:"+slice.alpha+";"		// Alpha
			if (slice.tcol)	str+="color:"+slice.tcol+";"						// Text color
			if (slice.tfont) str+="font-family:"+slice.tfont+";"				// Text font
			if (slice.thgt)	str+="font-size:"+slice.thgt+"px;"					// Text height
			str+="border-radius:"+slice.wid+"px'>";								// End style
			if (slice.name)	str+="<div style='padding-top:"+((slice.wid-th)/2)+"px'>"+slice.name+"</div>";									// Name
				
			$("#"+this.ops.id).append(str+"</div>");							// Add to DOM														
		
			
			
			break;
		}

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
