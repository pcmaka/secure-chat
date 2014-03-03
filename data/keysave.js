self.port.on("showKeys",function(keys){
	console.log(keys);
	$("#privKeyText").val(keys[0]);
	$("#pubKeyText").val(keys[1]);
});

self.port.emit("close");