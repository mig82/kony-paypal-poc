var BrowserViewCtrl = (function(){
  	
  	var $frm;
  	var $scope;
    
    /***********************************************
    *            Auxiliary Functions               *
    ************************************************/
    
    function findLink(payment, rel){
		var lCount = payment.links.length;
		var found = false;
		var link;
		for(var k = 0; k < lCount && !found; k++){
			link = payment.links[k];
			if(link.rel === rel){
				found = true;
			}
		}
		return found?link:undefined;
	}
    
    /***********************************************
    *              Form Life Cycle                 *
    ************************************************/
    
    function _bind(frm){
  		$frm = frm;
  	}
  	
  	function _init(){
  		$scope = new Scope();
		//window.$scope = $scope;
  		
  		$frm.brw1.handleRequest = function handleRequest(browserWidget, request){
  			
  			var dontLoad = false;
  			var url = request["originalURL"];
  			var method = request["requestMethod"];
  			var params =  request["queryParams"];
  			var headers = request["header"];
  			
  			Log.info("handleRequest event triggered");
			Log.info("Original URL: " + url);
			Log.info("Request Method: " + method);
			Log.info("Query Params: " + JSON.stringify(params));
			Log.info("Header: " + JSON.stringify(headers));
			
			//Browser is returning from Paypal authorisation process.
			if(typeof params !== "undefined" && params["konypoc"]){
				
				Log.info("***********Browser is back from Paypal authorised:" + params.authorised);
				
				if(params.authorised === 'true'){
					Log.info("Payment was authorised");
					session.setStatus(SessionSrv.STATUS_AUTHORISED);
					session.getPayment().payment_id = params.paymentId; //setPaymentId(params.paymentId);
					session.getPayment().payer.id = params.PayerID; //setPayerId(params.PayerID);
				}
				else{ // params.authorised === 'false'
					Log.info("Payment was cancelled");
					session.setStatus(SessionSrv.STATUS_CANCELLED);
				}
				
				Router.go2("home");
				dontLoad = true;
			}
			//Browser is navigating through Paypal authorization process.
			else{
				Log.info("***********Browser is navigating Paypal");
				dontLoad = false;
			}
			//false: Load the originalurl, true: Do not load original url and handle programmatically.
			return dontLoad;
  		}
  	}
  	
  	function _preShow(){}
    
    function _postShow(){
    	
    	var link = findLink(session.getPayment(), "approval_url"); //session.getApprovalLink();
    	Log.info("Redirecting for approval " + link.method + " " + link.href);
    	
    	$frm.brw1.requestURLConfig = {
			"URL": link.href, //"https://uk.yahoo.com/",
			"requestMethod": link.method //constants.BROWSER_REQUEST_METHOD_GET
		};
    }
    
    function _hide(){}
    
    function _destroy(){
    	$scope.$destroy();
    	$scope = undefined;
    }
   
 	return{
 		bind: _bind,
    	init: _init,
    	preShow: _preShow,
    	postShow: _postShow,
    	hide: _hide,
    	destroy: _destroy
    };
})();