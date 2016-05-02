angular.module('backlogr').filter('findByProperty', function() {
	return function(arr, propName, propValue) {
		var i;
    var hasMatch;
    
    for(i = 0; i < arr.length; i++) {
        if(typeof propName === 'object') {
          hasMatch = true;
          
          angular.forEach(propName, function(val, prop) {
            if(arr[i][prop] !== val) {
              hasMatch = false;
            } 
          });

          if(hasMatch) {
            return arr[i];
          }
        } else {
          if(arr[i][propName] === propValue) {
              return arr[i];
          }
        }
    }
        
    return null;
	};
});