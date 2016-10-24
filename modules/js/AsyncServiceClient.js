var AsyncServiceClient = (function(){

	var _handles = {};
	var _deviceInfo = kony.os.deviceInfo();
	
	function _invoke(serviceId, params, isSecureCall){
	
		params.serviceID = serviceId;
		var url = isSecureCall?appConfig.secureurl:appConfig.url;
		//var sessionIdKey = "cacheid";
		params["platformver"] = "6.5.GA_v201507232010";
	    params.appID = appConfig.appId;
	    params.appver = appConfig.appVersion;
	    params.channel = _deviceInfo.name;
	    //params.deviceInfo = _deviceInfo;
	    //params[sessionIdKey] = sessionID;
	
	    if (globalhttpheaders) {
	        if (params["httpheaders"]) {
	            params.httpheaders = mergeHeaders(params.httpheaders, globalhttpheaders);
	        } else {
	            params["httpheaders"] = mergeHeaders({}, globalhttpheaders);
	        };
	    };
	
		var handle;
		var promise = Q.Promise(function(resolve, reject, notify) {
			handle = kony.net.invokeServiceAsync(url, params, function(status, results, relayedParams){
				switch(status){
		            case 100:
		            	var msg = "INFO: Async service invocation sent. Code 100";
		              	kony.print(msg);
		              	notify(msg);
		            	break;
		            case 200:
		            	var msg = "INFO: Async service invocation in progress. Code 200";
		              	kony.print(msg);
		              	notify(msg);
		              	break;
		            case 300:
		            	var msg = "WARNING: Async service invocation cancelled. Code 300";
		              	kony.print(msg);
		              	reject(new Error(msg));
						break;
		            case 400:
		            	if(results.opstatus == 0){
		            		kony.print("INFO: Async service invocation returned with success. Code 400, serviceID: '" + relayedParams.serviceID + "' opstatus 0. ");
		            		resolve(results);
		            	}
		            	else{
		            		var msg = "ERROR: Async service invocation returned with problem. Code 400. serviceID: '" + relayedParams.serviceID + "' opstatus " + results.opstatus +
		            		", errcode " + results.errcode +
		            		", errmsg '" + results.errmsg + "'";
		            		kony.print(msg);
		            		reject(new Error(msg));
		            	}
		              	break;
		            default:
		            	var msg = "ERROR: Async service invocation failed. Code " + status;
		              	kony.print(msg);
		              	reject(msg);
		        }
			}, params);
		});
		_handles[handle] = promise;
		return promise;
	}
	
	return{
		invoke: _invoke,
		handles: _handles
	}

})();


