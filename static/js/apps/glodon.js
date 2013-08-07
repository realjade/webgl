$(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	$.fn.ModelPreview = function(o){
		var self = this;
		self.options={
			container:self,
			stlUrl:'/static/stl/test.stl'
	    };
	    var container = self.options.container,
	    	scene,cameraTarget, camera, plane, renderer, stats;
	    jQuery.extend(self.options, o);
	    var camera, cameraTarget, light, scene, renderer, mesh, controls, center,
	    	animateTag = true;
		init();
		bindEvent();
		function init(){
			camera = new THREE.PerspectiveCamera( 45, container.width() / container.height(), 1, 500000);
			/*camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
			camera.position.set( 3, 400, 800 );
			cameraTarget = new THREE.Vector3( 0, -0.25, 0 );*/

			scene = new THREE.Scene();
			//scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

			load(self.options.stlUrl);
			// Lights
			light = new THREE.AmbientLight(0xf2f2f2);
			light.position.set( 0, -100, 0 );
			scene.add( light );

			// renderer
			renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
			renderer.setSize( container.width(), container.height());
			renderer.setClearColor(0xf2f2f2, 1 );
			//renderer.gammaInput = true;
			//renderer.gammaOutput = true;
			//renderer.physicallyBasedShading = true;
			//renderer.shadowMapEnabled = true;
			//renderer.shadowMapCullFace = THREE.CullFaceBack;

			container.append( renderer.domElement );

			// stats
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.append( stats.domElement );
		}

		function load(path){
	    	var loader = new THREE.STLLoader();
			loader.addEventListener( 'load', function (event){
				var geometry = event.content;
				var material = new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } );
				mesh = new THREE.Mesh(geometry,material);
				//tools.log( geometry.boundingBox);
				setCenter(geometry);
				//mesh.position.set( 0, 0, 0 );
				//mesh.rotation.set( -Math.PI/2, 0 , 0 );
				//mesh.scale.set(0.00013, 0.00013,0.00013);
				/*mesh.position.set( 0, - 0.37, - 0.6 );
				mesh.rotation.set( - Math.PI / 2, 0, 0 );
				mesh.scale.set( 2, 2, 2 );*/

				//mesh.castShadow = true;
				//mesh.receiveShadow = true;

				scene.add(mesh);
				scene.traverse(function(n){
					//tools.log(n);
				});

			});
			loader.load(path);
	    }
	    
	    function bindEvent(){
	    	window.addEventListener( 'resize', onWindowResize, false );
	    	controls = new THREE.EditorControls(camera,self.options.container[0]);
			controls.addEventListener('change',render);
	    }
	    function setCenter(geometry){
	    	var box = geometry.boundingBox,
	    		position = camera.position,
			    offset = position.clone(),
			    min = new THREE.Vector3( box.min.x, box.min.y, box.min.z),
			    max = new THREE.Vector3( box.max.x, box.max.y, box.max.z),
			    distance = max.distanceTo(min);
			center = new THREE.Vector3((box.max.x+box.min.x)/2, (box.min.y+box.max.y)/2, (box.min.z+box.max.z));
			tools.log(position);
			tools.log(offset);
			tools.log(min);
			tools.log(max);
			tools.log(distance);
			camera.position.z = distance*1.5;
			camera.lookAt(center);
			animate();
	    }

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function startAnimate(){
			animateTag = true;
			/*var timer = Date.now() * 0.0003;
			camera.position.x = Math.cos( timer ) * 3;
			camera.position.z = Math.sin( timer ) * 3;*/
			animate();
		}
		function stopAnimate(){
			animateTag = false;
		}
		function animate(){
			/*if(!animateTag) return;*/
			requestAnimationFrame(animate);
			
			//controls.update();
			render();
			stats.update();
		}

		function render() {
			//controls.focus(mesh);
			renderer.render( scene, camera );
		}
		container.dblclick (function(){
			camera.lookAt(center);
			render();
		});
		self.startAnimate = startAnimate;
		self.stopAnimate = stopAnimate;
		return self;
	}
	var preview = $('#webgl').ModelPreview();
	$('#animate').click(function(){
		preview.startAnimate();
	});
	$('#unanimate').click(function(){
		preview.stopAnimate();
	});
});