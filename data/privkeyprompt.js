$("#okbutton").click(function(){
	$("#privedit-box").text("");
	$("#pubedit-box").text("");
	var keys = [];
	keys[0] = $("#privedit-box").text("");
	keys[1] = $("#pubedit-box").text("");
	self.port.emit("keyOk",keys);
});

$("#cancelbutton").click(function(){
	$("#privedit-box").text("");
	$("#pubedit-box").text("");
	self.port.emit("keyCancel");
});

$("#generatebutton").click(function(){
	$("#privedit-box").text("");
	$("#pubedit-box").text("");
	self.port.emit("keyGenerate");
});