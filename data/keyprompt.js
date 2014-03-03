self.port.on("message",function(message){
	$("#edit-box").text("");
	$("#promptlabel").text(message);
});

$("#okbutton").click(function(){
	$("#edit-box").text("");
	self.port.emit("keyOk",$("#edit-box").val());
});

$("#cancelbutton").click(function(){
	$("#promptlabel").text("");
	$("#edit-box").text("");
	self.port.emit("keyCancel");
});