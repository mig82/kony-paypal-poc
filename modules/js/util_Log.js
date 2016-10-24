var Log = (function(){
	var _prefix = "";
  
	function print(level, caller, message){
    	kony.print(_prefix + " [" + caller + "] " + level + ": " + message );
    }
    
    function _setPrefix(prefix){
    	_prefix = prefix;
    }
  
  	return{
  		setPrefix: _setPrefix,
  		success: function(message){
          	var caller = arguments.callee.caller.name;
        	print("SUCCESS", caller, message);
        },
    	info: function(message){
          	var caller = arguments.callee.caller.name;
        	print("INFO", caller, message);
        },
      	warn: function(message){
        	var caller = arguments.callee.caller.name;
        	print("WARN", caller, message);
        },
      	error: function(message){
        	var caller = arguments.callee.caller.name;
        	print("ERROR", caller, message);
        }
    };
})();
