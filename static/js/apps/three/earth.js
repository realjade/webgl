$(function(){
	//构造函数
	EarthApp = function(){
		Sim.App.call(this);
	}
	//子类
	EarthApp.prototype = new Sim.App();
	//自定义初始化过程
	EarthApp.prototype.init = function(param){
		//调用父类的初始化代码来设置场景、渲染器、和默认相机
		Sim.App.prototype.init.call(this,param);
		//创建地球，病添加到sim中
		var earth = new Earth();
		earth.init();
		this.addObject(earth);
		var sun = new Sun();
		sun.init();
		this.addObject(sun);
		var stars = new Stars();
	    // Push the stars out past Pluto
	    stars.init(20);
	    this.addObject(stars);
	}

	//自定义地球类
	Earth =  function(){
		Sim.Object.call(this);
	}
	Earth.prototype = new Sim.Object();
	Earth.prototype.init = function(){
		//创建地球球体并添加纹理
		var earthmap = '/static/images/three/earth_surface_2048.jpg';
		var geometry = new THREE.SphereGeometry(1,32,32);
		var texture = THREE.ImageUtils.loadTexture(earthmap);
		var material = new THREE.MeshPhongMaterial({map:texture});
		var mesh = new THREE.Mesh(geometry,material);
		//稍微倾斜一下
		mesh.rotation.z = Earth.TILT;
		//把对象传递给框架
		this.setObject3D(mesh);
	}
	Earth.prototype.update = function(){
		//让地球转动起来
		this.object3D.rotation.y += Earth.ROTATION_Y;
	}
	Earth.ROTATION_Y = 0.0025;
	Earth.TILT = 0.41;

	//自定义的太阳类
	Sun = function(){
		Sim.Object.call(this);
	}
	Sun.prototype = new Sim.Object();
	Sun.prototype.init = function(){
		//创建一个点光源
		var light = new THREE.PointLight(0xffffff,2,100);
		light.position.set(-10,0,20);

		//把对象反馈给框架
		this.setObject3D(light);
	}
	// Custom Stars class
	Stars = function()
	{
		Sim.Object.call(this);
	}

	Stars.prototype = new Sim.Object();

	Stars.prototype.init = function(minDistance)
	{
		// Create a group to hold our Stars particles
		var starsGroup = new THREE.Object3D();

		var i;
		var starsGeometry = new THREE.Geometry();

		// Create random particle locations
		for ( i = 0; i < Stars.NVERTICES; i++)
		{

			var vector = new THREE.Vector3( (Math.random() * 2 - 1) * minDistance, 
					(Math.random() * 2 - 1) * minDistance, 
					(Math.random() * 2 - 1) * minDistance);

			if (vector.length() <  minDistance)
			{
				vector = vector.setLength(minDistance);
			}

			starsGeometry.vertices.push( new THREE.Vertex( vector ) );

		}

		// Create a range of sizes and colors for the stars
		var starsMaterials = [];
		for (i = 0; i < Stars.NMATERIALS; i++)
		{
			starsMaterials.push(
					new THREE.ParticleBasicMaterial( { color: 0x101010 * (i + 1), 
						size: i % 2 + 1, 
						sizeAttenuation: false } )
					);
		}

		// Create several particle systems spread around in a circle, cover the sky
		for ( i = 0; i < Stars.NPARTICLESYSTEMS; i ++ )
		{

			var stars = new THREE.ParticleSystem( starsGeometry, starsMaterials[ i % Stars.NMATERIALS ] );

			stars.rotation.y = i / (Math.PI * 2);

			starsGroup.add( stars );

		}


	    // Tell the framework about our object
	    this.setObject3D(starsGroup);    
	}

	Stars.NVERTICES = 667;
	Stars.NMATERIALS = 8;
	Stars.NPARTICLESYSTEMS = 24;
	var renderer = null;
	var scene = null;
	var camera = null;
	var mesh = null;
	var container = document.getElementById("webgl");
	var app = new EarthApp();
	app.init({ container: container });
	app.run();

});