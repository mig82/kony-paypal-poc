var MsgDirective = (function(){
	
	var MsgDirective = function(labelWidget){
		this.labelWidget = labelWidget;
	}
	
	MsgDirective.prototype.setMsg = function(severity, msg){
  		switch(severity){
  			case 0:
  				this.labelWidget.skin = "infoMsgSkin";
  				break;
  			case 1:
  				this.labelWidget.skin = "warnMsgSkin";
  				break;
  			case 2:
  				this.labelWidget.skin = "errorMsgSkin";
  				break;
  			default:
  				this.labelWidget.skin = "lblNormal";
  				
  		}
  		this.labelWidget.text = msg;
  	}
  	
  	return MsgDirective;
})();