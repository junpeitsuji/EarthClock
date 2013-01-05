(function($){

	$.fn.earthClock = function(argments){

		var options = $.extend({
			url : null,
			params : {},
			speed : 2.0*Math.PI / (24*60*60*1000),
			ambient : 0x111111,
			extraTags : {
				clock: 'clock',
				satelite: 'satelite'
			},
			image : null
		},argments);

		//var dataFlag = false;

		return this.each(function(){
		//function init(domId) {

			var orbitData = null;
			var index = 0;
			//orbitData = null;
			//index = 0;

			if( options.url != null )
			{
				$.getJSON(options.url,
					options.params,
					function(data) { 
						orbitData = data;
						//dataFlag = true;
					}
				);				
			}

			if(!Detector.webgl) Detector.addGetWebGLMessage();

			var glframe = $(this).get(0);//document.getElementById('canvas-frame');
			
			var width = glframe.clientWidth;
			var height = glframe.clientHeight;  

			var renderer;
			renderer = new THREE.WebGLRenderer({ antialias:true });
			renderer.setSize(width, height);
			renderer.setClearColorHex(0x000000, 1);
			glframe.appendChild(renderer.domElement);

			var scene;
			scene = new THREE.Scene();

			var camera;
			camera = new THREE.PerspectiveCamera(
				15, width / height);
			camera.position = new THREE.Vector3(0, 0, 8);
			camera.lookAt(new THREE.Vector3(0, 0, 0));
			scene.add(camera);

			var light;
			light = new THREE.DirectionalLight(0xcccccc);
			//light.position = new THREE.Vector3(0.577, 0.577, 0.577);
			light.position = new THREE.Vector3(0, 0, 100);
			var ambient = new THREE.AmbientLight(options.ambient);
			scene.add(light);
			scene.add(ambient);

// /*
// */
// /*
			var geometry = new THREE.SphereGeometry(1, 32, 16);
			var material = new THREE.MeshPhongMaterial({
				color: 0xffffff, specular: 0xcccccc, shininess:50, ambient: 0xffffff,
				map: THREE.ImageUtils.loadTexture(options.image) });
			var mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
// */


			// create a camera control object
			var controls
			controls = new THREE.OrbitControls(camera, glframe);
			controls.center = new THREE.Vector3(0, 0, 0);

			var baseTime = +new Date(2011, 12, 31, 2, 0, 0);


			var prevDate = +new Date();

			var lng = 0.0;
			var lat = 0.0;
			var alt = 0.0;

			var cube = null;			
			var lines = null;


			function render() {

				requestAnimationFrame(render);

				// update camera state
				controls.update();

				var date = new Date();

				//mesh.rotation.y = 0.3 * (+date - baseTime) / 1000;
				var theta = (+date - baseTime) * options.speed;
				mesh.rotation.y = theta;
				//cube.rotation.y = (+date - baseTime) * 2.0*3.14159265 / (60*1000);


				var str  = ''+date+'';
				if(document.getElementById(options.extraTags.clock) != null)
					document.getElementById(options.extraTags.clock).innerHTML = str;

				if( orbitData != null ){

					var orbit = orbitData.orbits[index];

					if(orbit != null && orbit.date != null)
					{

						var dataTime = Date.parse(orbit.date);
						var currentTime = date.getTime();

						if( currentTime > dataTime ){

							prevDate = date;

							var num = parseInt(orbitData.dataNum);
							//index = (index+1)%num;
							index = index + 1; 

							if( orbit != null ){
								//document.getElementById('content').innerHTML 
								//	= '<p>lat: '+orbit.latitude+', lng: '+orbit.longitude+'</p>';
								date = orbit.date;
								lat  = parseFloat(orbit.latitude);
								lng  = parseFloat(orbit.longitude);
								alt  = parseFloat(orbit.altitude);

								var str = "";
								str += '<p>'+orbitData.sateliteName+' ';
								str += '[date: '+date+', latitude: '+lat.toFixed(6)+', longitude: '+lng.toFixed(6)+', altitude: '+alt.toFixed(6)+'] </p>';
								if(document.getElementById(options.extraTags.satelite) != null)
									document.getElementById(options.extraTags.satelite).innerHTML = str;

							}

							if( cube == null )
							{
								//scene.remove( cube );
								cube = new THREE.Mesh(
			    		     		new THREE.CubeGeometry(0.03,0.03,0.03),          // shapes
			        		 		new THREE.MeshLambertMaterial({color: 0xff0000, ambient: 0xff0000}) // materials
								);
								scene.add(cube);
							}

						}

					}

// /*
					if( orbitData != null ){
						if( lines == null ){

							var lineGeometry = new THREE.Geometry();
							for (var i=0; i<orbitData.orbits.length; i++) 
							{

								var lat_i = parseFloat(orbitData.orbits[i].latitude);
								var lng_i = parseFloat(orbitData.orbits[i].longitude);
								var alt_i = parseFloat(orbitData.orbits[i].altitude);

								var obTheta = (90.0-lat_i) * 2.0 * Math.PI / 360.0; 
								var obPhi   = (lng_i) * 2.0 * Math.PI / 360.0; 
								var radius  = (alt_i + 6378.137) / 6378.137;
				 				
								lineGeometry.vertices.push( new THREE.Vector3( 
									radius*Math.sin(obTheta)*Math.cos(-obPhi),
									radius*Math.cos(obTheta),
									radius*Math.sin(obTheta)*Math.sin(-obPhi)
								));

							}
							
		 					lines = new THREE.Line( lineGeometry, new THREE.LineBasicMaterial( { color: 0xff6666, opacity: 0.5 } ) );
							scene.add( lines );
		// */
						}
						
						if( lines != null ) {
							lines.rotation.y = theta;
						}
					}

// */

					{
						var obTheta = (90.0-lat) * 2.0 * Math.PI / 360.0; 
						var obPhi   = (lng) * 2.0 * Math.PI / 360.0; 
						var radius  = (alt + 6378.137) / 6378.137;
		 
		 				if( cube != null ){
							cube.position.set(
								radius*Math.sin(obTheta)*Math.cos(-theta-obPhi),
								radius*Math.cos(obTheta),
								radius*Math.sin(obTheta)*Math.sin(-theta-obPhi)
							);								 					
		 				}
					}
				}

				if( index > num-1 ){
					orbitData = null;
					window.location.reload();
				}

				renderer.clear();  
				renderer.render(scene, camera);
				
			};
			render();


			glframe.addEventListener('resize', function() {
				renderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}, false );
/*
			glframe.resize( function() {
				renderer.setSize(width, height);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			} );
*/
		});

	}

})(jQuery);

