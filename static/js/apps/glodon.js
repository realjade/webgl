
$(function() {
	$('#svgbasics').svg({onLoad: drawInitial,loadURL: '/static/svg/test.svg'});
	$('#rect,#line,#circle,#ellipse').click(drawShape);
	$('#clear').click(function() {
		$('#svgbasics').svg('get').clear();
	});
	$('#export').click(function() {
		var xml = $('#svgbasics').svg('get').toSVG();
		$('#svgexport').html(xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
	});
});

function drawInitial(svg) {
	svg.circle(75, 75, 50, {fill: 'none', stroke: 'red', 'stroke-width': 3});
	var g = svg.group({stroke: 'black', 'stroke-width': 2});
	svg.line(g, 15, 75, 135, 75);
	svg.line(g, 75, 15, 75, 135);
}

var colours = ['purple', 'red', 'orange', 'yellow', 'lime', 'green', 'blue', 'navy', 'black'];

function drawShape() {
	var shape = this.id;
	var svg = $('#svgbasics').svg('get');
	if (shape == 'rect') {
		svg.rect(random(300), random(200), random(100) + 100, random(100) + 100,
			{fill: colours[random(9)], stroke: colours[random(9)],
			'stroke-width': random(5) + 1});
	}
	else if (shape == 'line') {
		svg.line(random(400), random(300), random(400), random(300),
			{stroke: colours[random(9)], 'stroke-width': random(5) + 1});
	}
	else if (shape == 'circle') {
		svg.circle(random(300) + 50, random(200) + 50, random(80) + 20,
			{fill: colours[random(9)], stroke: colours[random(9)],
			'stroke-width': random(5) + 1});
	}
	else if (shape == 'ellipse') {
		svg.ellipse(random(300) + 50, random(200) + 50, random(80) + 20, random(80) + 20,
			{fill: colours[random(9)], stroke: colours[random(9)],
			'stroke-width': random(5) + 1});
	}
}

function random(range) {
	return Math.floor(Math.random() * range);
}


$(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	$.fn.ModelPreview = function(o){
		var self = this;
		self.options={
			container:self,
			stlUrl:'/static/dae/monster.dae'
	    };
	    var container = self.options.container,
	    	scene,cameraTarget, camera, plane, renderer, stats;
	    jQuery.extend(self.options, o);
	    var camera, cameraTarget, light, scene, renderer, mesh, controls, center, dae, 
	    	animations,
	    	kfAnimations = [], 
	    	kfAnimationsLength = 0, 
	    	model,
	    	lastTimestamp,
	    	progress = 0,
	    	animateTag = true;
	    loadDAE(self.options.stlUrl);
		//bindEvent();
		function loadDAE(path){
	    	var loader = new THREE.ColladaLoader();
			loader.options.convertUpAxis = true;
			loader.load(path, function ( collada ) {
				model = collada.scene;
				animations = collada.animations;
				kfAnimationsLength = animations.length;
				model.scale.x = model.scale.y = model.scale.z = 0.125; // 1/8 scale, modeled in cm
				init();
				start();
				animate( lastTimestamp );
				//dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
				
				model.traverse(function(n){
					//tools.log(n);
				});
				//init();
				//animate();

			} );
	    }
		function init(){
			/*camera = new THREE.PerspectiveCamera( 45, container.width() / container.height(), 1, 500000);
			camera.position.z=100;
			camera.position.x=-0;
			camera.position.y=-0;*/
			camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.01, 1000 );
			camera.position.set( -5.00181875, 3.42631375, 11.3102925 );
			camera.lookAt( new THREE.Vector3( -1.224774125, 2.18410625, 4.57969125 ) );
			/*camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
			camera.position.set( 3, 400, 800 );
			cameraTarget = new THREE.Vector3( 0, -0.25, 0 );*/

			scene = new THREE.Scene();
			//scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

			// KeyFrame Animations

			var animHandler = THREE.AnimationHandler;

			for ( var i = 0; i < kfAnimationsLength; ++i ) {

				var animation = animations[ i ];
				animHandler.add( animation );

				var kfAnimation = new THREE.KeyFrameAnimation( animation.node, animation.name );
				kfAnimation.timeScale = 1;
				kfAnimations.push( kfAnimation );

			}
			// Grid

			var material = new THREE.LineBasicMaterial( { color: 0x303030 } );
			var geometry = new THREE.Geometry();
			var floor = -0.04, step = 1, size = 14;

			for ( var i = 0; i <= size / step * 2; i ++ ) {

				geometry.vertices.push( new THREE.Vector3( - size, floor, i * step - size ) );
				geometry.vertices.push( new THREE.Vector3(   size, floor, i * step - size ) );
				geometry.vertices.push( new THREE.Vector3( i * step - size, floor, -size ) );
				geometry.vertices.push( new THREE.Vector3( i * step - size, floor,  size ) );

			}

			var line = new THREE.Line( geometry, material, THREE.LinePieces );
			scene.add( line );
			// Add the COLLADA

			//model.getChildByName( 'camEye_camera', true ).visible = false;
			//model.getChildByName( 'camTarget_camera', true ).visible = false;

			scene.add( model );
			// Lights
			pointLight = new THREE.PointLight( 0xffffff, 1.75 );
			pointLight.position = camera.position;
			pointLight.rotation = camera.rotation;
			pointLight.scale = camera.scale;
			/*light = new THREE.AmbientLight(0xf2f2f2);
			light.position.set( 0, 0, 0 );
			scene.add( light );*/

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

		function loadSTL(path){
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

			});
			loader.load(path);
	    }
	    
	    
	    function bindEvent(){
	    	window.addEventListener( 'resize', onWindowResize, false );
	    	//controls = new THREE.EditorControls(camera,self.options.container[0]);
	    	controls = new THREE.TrackballControls( camera,self.options.container[0] );
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

		function start() {

			for ( var i = 0; i < kfAnimationsLength; ++i ) {

				var animation = kfAnimations[i];

				for ( var h = 0, hl = animation.hierarchy.length; h < hl; h++ ) {

					var keys = animation.data.hierarchy[ h ].keys;
					var sids = animation.data.hierarchy[ h ].sids;
					var obj = animation.hierarchy[ h ];

					if ( keys.length && sids ) {

						for ( var s = 0; s < sids.length; s++ ) {

							var sid = sids[ s ];
							var next = animation.getNextKeyWith( sid, h, 0 );

							if ( next ) next.apply( sid );

						}

						obj.matrixAutoUpdate = false;
						animation.data.hierarchy[ h ].node.updateMatrix();
						obj.matrixWorldNeedsUpdate = true;

					}

				}

				animation.play( false, 0 );
				lastTimestamp = Date.now();

			}

		}

		function animate() {

			var timestamp = Date.now();
			var frameTime = ( timestamp - lastTimestamp ) * 0.001; // seconds

			if ( progress >= 0 && progress < 48 ) {

				for ( var i = 0; i < kfAnimationsLength; ++i ) {

					kfAnimations[ i ].update( frameTime );

				}

			} else if ( progress >= 48 ) {

				for ( var i = 0; i < kfAnimationsLength; ++i ) {

					kfAnimations[ i ].stop();

				}

				progress = 0;
				start();

			}

			progress += frameTime;
			lastTimestamp = timestamp;
			renderer.render( scene, camera );
			stats.update();
			requestAnimationFrame( animate );

		}
		container.dblclick (function(){
			camera.lookAt(center);
			render();
		});
		//self.startAnimate = startAnimate;
		//self.stopAnimate = stopAnimate;
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