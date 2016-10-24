var Router = (function(){
  	
  	var _state;
  	
  	var config = {
		"home": {
			form: "frm1",
			ctrl: "HomeViewCtrl"
		},
		"appr": {
			form: "browserFrm",
			ctrl: "BrowserViewCtrl"
		}
	};
  	
  	function _bind(frm, Ctrl){
  		Ctrl.bind(frm);
  		frm.init = Ctrl.init;
		frm.hide = Ctrl.hide;
  		frm.preShow = Ctrl.preShow;
  		frm.postShow = Ctrl.postShow;
  		frm.destroy = Ctrl.destroy;
  	}
  	
  	function _init(){
  		for (var stateKey in config){
			var state = config[stateKey];
			_bind(eval(state.form), eval(state.ctrl));
		}
  	}
  	
  	function _goto(stateKey){
  		//Log.info("Going to state: " + stateKey);
  		_state = stateKey;
  		eval(config[stateKey].form).show();
  	}
  	
  	function _getCurrentState(){
  		return _state;
  	}
  
	return{
		init: _init,
    	go2: _goto,
    	getCurrentState: _getCurrentState
    };
})();