var HomeViewCtrl = (function(){
  	
  	var $frm;
  	var $scope;
    
    /***********************************************
    *            Auxiliary Functions               *
    ************************************************/
    
    function checkForNetwork(){
		if(!kony.net.isNetworkAvailable(constants.NETWORK_TYPE_ANY)){
			var msg = "No network connection available";
			Log.error(msg);
			$scope.msg.setMsg(2, msg);
		}
		else{
			Log.info("Network connection ok");
		}
	}
	
	function createNewPaymentShell(){
		return {
			payment_id: "",
			intent: "sale",
			payer: {
				payment_method: "paypal"
			},
			transactions: [
				{
					amount: {
						currency: "EUR",
						total: 1.99
					},
					description: "Kony PoC purchase"
				}
			],
			redirect_urls: {
				return_url: "http://konypaypal/?konypoc=imback&authorised=true",
				cancel_url: "http://konypaypal/?konypoc=imback&authorised=false"
			}
		};
	}
	
	/***********************************************
    *                Service Calls                 *
    ************************************************/
	
	function callGetToken(){
		$scope.msg.setMsg(0, "Please wait while we get an auth token");
		return PaypalSrv.getToken()
		.progress(function displayGetTokenProgress(progress){
			$scope.msg.setMsg(0, "Requesting auth token from PayPal");
		})
		.then(function _receiveToken(accessToken){
			session.setAccessToken(accessToken);
			$scope.msg.setMsg(0, "accessToken: '"+accessToken+"'");
			return accessToken;
		})
		.fail(function handleGetTokenError(e){
			$scope.msg.setMsg(2, e.message);
		});
	}
	
	function callPostPaypalSale(){
		$scope.msg.setMsg(0, "Please wait while we get auth for the transaction");
		return Q.fcall(function _retrieveToken(){
			var accessToken = session.getAccessToken();
			return accessToken?accessToken:callGetToken();
		})
		.then(function _callPayService(accessToken){
			return PaypalSrv.pay($scope.payment, accessToken);
		})
		.progress(function displayPaymentProgress(progress){
			$scope.msg.setMsg(0, "Sending transaction data to PayPal");
		})
		.then(function handlePaymentResponse(payment){
			if(typeof payment === "undefined"){
				throw new Error("Unable to get payment authorisation");
			}
			else{
				$scope.payment = payment;
				session.setPayment(payment);
				$scope.msg.setMsg(0, "Payment: '"+payment.id+"'");
				Router.go2("appr");
			}
		})
		.fail(function handlePostPaymentError(e){
			$scope.msg.setMsg(2, e.message);
		});
	}
	
	function callExecute(accessToken, paymentId, payerId){
		$scope.msg.setMsg(0, "Please wait while we execute the transaction.");
		return PaypalSrv.execute(accessToken, paymentId, payerId)
		.progress(function displayExecuteProgress(progress){
			$scope.msg.setMsg(0, "Requesting funds capture from PayPal");
		})
		.then(function handleExecuteResponse(result){
			if(result.payment_id === $scope.payment.payment_id){
				$scope.payment.state = result.state;
				$scope.msg.setMsg(0, "Payment "+result.payment_id+" is complete!");
				
				//Reset the payment data to start all over again.
				$scope.payment = createNewPaymentShell();
			}
			else{
				throw new Error("payment_id's sent and received do not match");
			}
			
		})
		.fail(function handleExecuteError(e){
			$scope.msg.setMsg(2, e.message);
		});
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
  		
  		$scope.$bind($frm, [
  			{wid: "amtTxt", value: "text", 			model: "payment.transactions[0].amount.total", 		trigger: "onTextChange"},
  			{wid: "ccyLBox", value: "selectedKey", 	model: "payment.transactions[0].amount.currency", 	trigger: "onSelection"},
  			{wid: "itemDescTxt", value: "text", 	model: "payment.transactions[0].description", 		trigger: "onTextChange"}
  		]);
  		
  		//$scope.$watch("payment.total", function(amt, old){
		$scope.$watch("payment.transactions[0].amount.total", function(amt, old){
  			kony.print("old amt: " + old + ", new amt: " + amt);
  			
  			if( (typeof amt === "string" && amt.trim() === '') || isNaN(amt)){
				$scope.msg.setMsg(2, "Amount must be a number");
				$frm.payBtn.setEnabled(false);
			}
			else{
				amt = parseFloat(amt);
				if(amt <= 0){
					$scope.msg.setMsg(2, "Amount must greater than zero (0)");
					$frm.payBtn.setEnabled(false);
				}
				else{
					$scope.msg.setMsg(0, "Hit 'Pay' when you're good to go");
					$frm.payBtn.setEnabled(true);
				}
			}
  		});
  		
  		$scope.msg = new MsgDirective($frm.msgLb);
  	}
  	
  	function _preShow(){
  		
  		var payment = session.getPayment();
  		
  		if(typeof payment !== "undefined"){
  			$scope.payment = payment;
  		}
  		else{
  			$scope.payment = createNewPaymentShell();
  		}

		$scope.$digest();
  	}
    
    function _postShow(){
    	
    	$frm.getTokenBtn.onClick = function getToken_clickHandler(btn){
    		callGetToken();
    	}
    	
    	$frm.payBtn.onClick = function pay_clickHandler(btn){
    		callPostPaypalSale();
    	}
    	
    	var status = session.getStatus();
    	
    	if(status === SessionSrv.STATUS_NEW){
    		$scope.msg.setMsg(0, "Welcome to the Kony PayPal PoC");
    	}
    	
    	else if(status === SessionSrv.STATUS_AUTHORISED){
    		$scope.msg.setMsg(0, "You've successfully authorised your payment");
    		
    		var accessToken = session.getAccessToken();
    		var paymentId = session.getPayment().payment_id; //session.getPaymentId();
			var payerId = session.getPayment().payer.id; //session.getPayerId();
			
			Log.info("accessToken: " + accessToken);
			Log.info("paymentId: " + paymentId);
			Log.info("payerId:" + payerId);
			
			callExecute(accessToken, paymentId, payerId);
    	}
    	
    	else if(status === SessionSrv.STATUS_CANCELLED){
    		$scope.msg.setMsg(1, "You've not authorised your payment");
    		
    		//Reset the payment data to start all over again.
			$scope.payment = createNewPaymentShell();
    	}
    	
    	checkForNetwork();
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