var OrbitAjax = function(url){

	var pthis = this;

	var orbitData = null;
	var index = 0;
	
	var currentOrbit = null;

	var flag = false;

	this.url = url;

	this.init= function(){
		//alert("init");
		
		$.getJSON(this.url,
			null,
	    	function(data, status) {   
	    		//alert("load");
	    		orbitData = data;
	    		pthis.updated(data);
	    		flag = true;
		});
		
	}

	this.getIntervalMinutes = function(){
		return parseFloat(orbitData.intervalMinutes);
	}

	this.getSateliteName = function(){
		return orbitData.sateliteName;
	}

	this.hasUpdated = function(){
		return flag;
	}

	// handler
	this.updated = function(data) {
		alert('updated');
	}

	this.nextOrbit = function() {
		var num = parseInt(orbitData.dataNum);

		var cIndex = index;

		index = (index+1)%num;
		//if( index >= num ){
		//	flag = false;
		//	this.init();
		//}

		currentOrbit = orbitData.orbits[cIndex];

		return currentOrbit;
	}
	
}
