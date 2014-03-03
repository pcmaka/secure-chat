self.port.on("message",function(message){
	$("#promptlabel").text(message);
});

$("#okbutton").click(function(){
	self.port.emit("keyOk",$("#edit-box").val());
});

$("#cancelbutton").click(function(){
	$("#promptlabel").text("");
	$("#edit-box").text("");
	self.port.emit("keyCancel");
});