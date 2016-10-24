var PaypalSrv = (function(){

	/**
	* Variables needed for _getToken (The JSON version of this service).
	* The (Java version) _getToken2 service stores these values on the server side.
	*/
	var clientId = "AfWuZnOvMXIEdXDlCM8fKtLpgXJgRHI_Np8t63Gdpl5YX-MHMkQCMyrEmKXd_BrkRsv6J__1WDLLZ_6p";
	var secret = "EHB9xs9l_0LgTCr9UfMo9LQ129IW21mCVfsyWCDExI3N1MtZa79pwhkKIhViGtWBboe3Aot4MN4LRn3a";
	var b64BasicAuth = "Basic " + kony.convertToBase64(clientId + ":" + secret);
	
	/**
	* Call the JSON service for getting a token.
	*/
	function _getToken(){
		Log.info("1. Getting authorization token");
		var params = {
			httpheaders: {
				"Accept": "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": b64BasicAuth
			},
			grant_type: "client_credentials"
		};
		
		return AsyncServiceClient.invoke("getToken", params, false)
		.then(function(response){
			//Log.info("response: " + JSON.stringify(response));
			return Q(response.access_token);
		});
	}
	
	/**
	* Call the Java service for getting a token.
	*/
	function _getToken2(){
		Log.info("1. Getting authorization token");
		var params = {}; //No need to send clientId and secret because the Java Service has both hardcoded.
		
		return AsyncServiceClient.invoke("getToken2", params, false)
		.then(function(response){
			//Log.info("response: " + JSON.stringify(response));
			return Q(response.access_token);
		});
	}
	
	/**
	* Call the Java service for posting a payment.
	*/
	function _pay(payment, accessToken){
		Log.info("2. Requesting auth for payment with token:"+accessToken);
		session.setAccessToken(accessToken);
		
		/**
		 * Note that the service can either take in a stringified JSON object as specified
		 * by PayPal's REST API or the separated parameters that would be necessary for building
		 * a Payment object.
		 * This is meant to showcase a workaround for sending JSON input to the Kony Server.
		 * To test, try uncommenting one of the examples below and executing this main method.*/
			 
		var params = {
			"access_token": accessToken,
			
			/**Example 2: calling the method with a single parameter containing a stringified JSON object for the payment*/
			"payment": JSON.stringify(payment)
			
			/**Example 1: Calling the method with all the necessary parameters to build a Payment object*/
			/*
			"payment_method": payment.payer.payment_method,
			"intent": payment.intent,
			"description": payment.transactions[0].description,
			"total": payment.transactions[0].amount.total,
			"currency": payment.transactions[0].amount.currency,
			"return_url": payment.redirect_urls.return_url, 
			"cancel_url": payment.redirect_urls.cancel_ulr  */
		};
		
		return AsyncServiceClient.invoke("postPaypalSale", params, false)
		.then(function _parsePostPaypalSaleResponse(response){
			//Log.info("created: " + JSON.stringify(response));
			return Q(JSON.parse(response.payment));
		});
	}
	
	function _execute(accessToken, paymentId, payerId){
	
		var params = {
			"access_token": accessToken,
			"payment_id": paymentId,
			"payer_id": payerId
		};
	
		Log.info("3. Requesting execution of payment with params:" + JSON.stringify(params));
		
		return AsyncServiceClient.invoke("executePayment", params, false)
		.then(function _parseExecuteResponse(response){
			//Log.info("response: " + JSON.stringify(response));
			var result = {
				payment_id: response.payment_id,
				state: response.state
			}
			Log.info("executed: " + JSON.stringify(result));
			return Q(result);
		});
	}
	
	return{
		getToken: _getToken2,
		pay: _pay,
		execute: _execute
	};
})();