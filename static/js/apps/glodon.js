$(function(){
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	$.fn.ModelPreview = function(o){
		var self = this;
		self.options={
			container:self,
			stlUrl:'/static/stl/test.stl',
			enabled:true,
			userZoom:true,
			userZoomSpeed:1.0,
			userRotate:true,
			userRotateSpeed:1.0,
			userPan:true,
			userPanSpeed:2.0,
			autoRotate:false,
			autoRotateSpeed:2.0,// 30 seconds per round when fps is 60
			minPolarAngle:0,// radians
			maxPolarAngle:Math.PI, // radians
			minDistance:0,
			maxDistance:Infinity
	    };
	    var EPS = 0.000001;
		var PIXELS_PER_ROUND = 1800;

		var rotateStart = new THREE.Vector2();
		var rotateEnd = new THREE.Vector2();
		var rotateDelta = new THREE.Vector2();

		var zoomStart = new THREE.Vector2();
		var zoomEnd = new THREE.Vector2();
		var zoomDelta = new THREE.Vector2();

		var phiDelta = 0;
		var thetaDelta = 0;
		var scale = 1;

		var lastPosition = new THREE.Vector3();
	    var KEYS = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	    var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	    var state = STATE.NONE;
	    var container = self.options.container,
	    	scene,cameraTarget, camera, plane, renderer, stats;
	    jQuery.extend(self.options, o);
	    var camera, cameraTarget, scene, renderer, mesh,
	    	animateTag = true;
		init();
		bindEvent();
		animate();
		function init(){
			camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
			camera.position.set( 3, 0.15, 3 );
			cameraTarget = new THREE.Vector3( 0, -0.25, 0 );

			scene = new THREE.Scene();
			scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

			// Ground
			var plane = new THREE.Mesh( new THREE.PlaneGeometry( 40, 40 ), new THREE.MeshPhongMaterial( { ambient: 0x999999, color: 0x999999, specular: 0x101010 } ) );
			plane.rotation.x = -Math.PI/2;
			plane.position.y = -0.5;
			scene.add( plane );
			plane.receiveShadow = true;

			load(self.options.stlUrl);

			// Lights
			scene.add( new THREE.AmbientLight( 0x777777 ) );
			addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
			//addShadowedLight( 0.5, 1, -1, 0xffaa00, 1 );

			// renderer
			renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
			renderer.setSize( window.innerWidth, window.innerHeight );
			renderer.setClearColor( scene.fog.color, 1 );
			renderer.gammaInput = true;
			renderer.gammaOutput = true;
			renderer.physicallyBasedShading = true;
			renderer.shadowMapEnabled = true;
			renderer.shadowMapCullFace = THREE.CullFaceBack;

			container.append( renderer.domElement );

			// stats
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.append( stats.domElement );

			//

			window.addEventListener( 'resize', onWindowResize, false );

		}

		function load(path){
	    	var loader = new THREE.STLLoader();
			loader.addEventListener( 'load', function (event){

				var geometry = event.content;
				var material = new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } );
				mesh = new THREE.Mesh( geometry );

				mesh.position.set( 0, - 0.25, 0.6 );
				mesh.rotation.set( -Math.PI/2, 0 , 0 );
				mesh.scale.set(0.00005, 0.00005,0.00005);
				/*mesh.position.set( 0, - 0.37, - 0.6 );
				mesh.rotation.set( - Math.PI / 2, 0, 0 );
				mesh.scale.set( 2, 2, 2 );*/

				mesh.castShadow = true;
				mesh.receiveShadow = true;

				scene.add(mesh);

			});
			loader.load(path);
	    }

	    function bindEvent(){
	    	self.on( 'contextmenu', function (event) {
	    		tools.cancelDefault(event);
	    	});
			self.on('mousedown', mouseDown);
			self.on('mousewheel', mouseWheel);
			self.on('DOMMouseScroll', mouseWheel); // firefox
			self.on('keydown', keyDown);
	    }
	    function mouseDown(event) {
			if ( self.options.enabled === false ) return;
			if ( self.options.userRotate === false ) return;
			tools.cancelDefault(event);
			if (event.button === 0) {
				//左键
				state = STATE.ROTATE;
				rotateStart.set(event.clientX, event.clientY);
			} else if ( event.button === 1 ) {
				//中键
				state = STATE.ZOOM;
				zoomStart.set( event.clientX, event.clientY );
			} else if ( event.button === 2 ) {
				//邮件
				state = STATE.PAN;
			}
			self.on('mousemove', mouseMove);
			self.on('mouseup', mouseUp);

		}

		function mouseMove( event ) {
			if ( self.options.enabled === false) return;
			event.preventDefault();
			if ( state === STATE.ROTATE ) {
				rotateEnd.set( event.clientX, event.clientY );
				rotateDelta.subVectors( rotateEnd, rotateStart );
				self.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * self.options.userRotateSpeed );
				self.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * self.options.userRotateSpeed );
				rotateStart.copy(rotateEnd);
			} else if ( state === STATE.ZOOM) {
				zoomEnd.set( event.clientX, event.clientY );
				zoomDelta.subVectors( zoomEnd, zoomStart );
				if ( zoomDelta.y > 0 ) {
					self.zoomIn();
				} else {
					self.zoomOut();
				}
				zoomStart.copy( zoomEnd );
			} else if ( state === STATE.PAN ) {
				var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
				var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
				self.pan( new THREE.Vector3( - movementX, movementY, 0 ) );
			}
		}

		function mouseUp( event ) {
			if ( self.enabled === false ) return;
			if ( self.userRotate === false ) return;
			self.off( 'mousemove', mouseMove);
			self.off( 'mouseup', mouseUp);
			state = STATE.NONE;
		}

		function mouseWheel( event ) {

			if ( self.enabled === false ) return;
			if ( self.userZoom === false ) return;

			var delta = 0;

			if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

				delta = event.wheelDelta;

			} else if ( event.detail ) { // Firefox

				delta = - event.detail;

			}

			if ( delta > 0 ) {

				self.zoomOut();

			} else {

				self.zoomIn();

			}

		}

		function keyDown( event ) {

			if ( self.enabled === false ) return;
			if ( self.userPan === false ) return;

			switch ( event.keyCode ) {

				case self.keys.UP:
					self.pan( new THREE.Vector3( 0, 1, 0 ) );
					break;
				case self.keys.BOTTOM:
					self.pan( new THREE.Vector3( 0, - 1, 0 ) );
					break;
				case self.keys.LEFT:
					self.pan( new THREE.Vector3( - 1, 0, 0 ) );
					break;
				case self.keys.RIGHT:
					self.pan( new THREE.Vector3( 1, 0, 0 ) );
					break;
			}

		}
		// events

		var changeEvent = { type: 'change' };


		self.rotateLeft = function ( angle ) {
			if ( angle === undefined ) {
				angle = getAutoRotationAngle();
			}
			thetaDelta -= angle;
		};

		self.rotateRight = function ( angle ) {

			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			thetaDelta += angle;

		};

		self.rotateUp = function ( angle ) {

			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			phiDelta -= angle;

		};

		self.rotateDown = function ( angle ) {

			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			phiDelta += angle;

		};

		self.zoomIn = function ( zoomScale ) {

			if ( zoomScale === undefined ) {

				zoomScale = getZoomScale();

			}

			scale /= zoomScale;

		};

		self.zoomOut = function ( zoomScale ) {

			if ( zoomScale === undefined ) {

				zoomScale = getZoomScale();

			}

			scale *= zoomScale;

		};

		self.pan = function ( distance ) {

			distance.transformDirection( this.object.matrix );
			distance.multiplyScalar( scope.userPanSpeed );

			this.object.position.add( distance );
			this.center.add( distance );

		};
		function addShadowedLight( x, y, z, color, intensity ) {

			var directionalLight = new THREE.DirectionalLight( color, intensity );
			directionalLight.position.set( x, y, z )
			scene.add( directionalLight );

			directionalLight.castShadow = true;
			// directionalLight.shadowCameraVisible = true;

			var d = 1;
			directionalLight.shadowCameraLeft = -d;
			directionalLight.shadowCameraRight = d;
			directionalLight.shadowCameraTop = d;
			directionalLight.shadowCameraBottom = -d;

			directionalLight.shadowCameraNear = 1;
			directionalLight.shadowCameraFar = 4;

			directionalLight.shadowMapWidth = 1024;
			directionalLight.shadowMapHeight = 1024;

			directionalLight.shadowBias = -0.005;
			directionalLight.shadowDarkness = 0.15;

		}

		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

		function startAnimate(){
			animateTag = true;
			animate();
		}
		function stopAnimate(){
			animateTag = false;
		}
		function animate(){
			if(!animateTag) return;
			requestAnimationFrame(animate);
			render();
			stats.update();
		}

		function render() {
			var timer = Date.now() * 0.0003;

			camera.position.x = Math.cos( timer ) * 3;
			camera.position.z = Math.sin( timer ) * 3;

			camera.lookAt( cameraTarget );

			renderer.render( scene, camera );

		}
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