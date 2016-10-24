var Q;
var session;

var App = (function(){

	function _run(){
		Router.init();
		Log.setPrefix("KonyPayPal");
		Q = kony.Q;
		Q.longStackSupport = true;
		session = new SessionSrv();
	}
	
	return {
		run: _run
	}
})();