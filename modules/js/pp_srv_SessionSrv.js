var SessionSrv = (function(){
	
	SessionSrv.STATUS_NEW = "new";
	SessionSrv.STATUS_AUTHORISED = "authorised";
	SessionSrv.STATUS_CANCELLED = "cancelled";
	
	function SessionSrv(){
		this.status = SessionSrv.STATUS_NEW; //This is the status of the session, not the state of the payment.
		this.accessToken = undefined;
		this.payment = undefined;
	}
	
	SessionSrv.prototype.setPayment = function(payment){
		this.payment = payment;
	}
	SessionSrv.prototype.getPayment = function(){
		return this.payment;
	}

	SessionSrv.prototype.setStatus = function(status){
		this.status = status;
	}
	SessionSrv.prototype.getStatus = function(){
		return this.status;
	}
	
	SessionSrv.prototype.setAccessToken = function(accessToken){
		this.accessToken = accessToken;
	}
	SessionSrv.prototype.getAccessToken = function(){
		return this.accessToken;
	}
	
	return SessionSrv;
})();