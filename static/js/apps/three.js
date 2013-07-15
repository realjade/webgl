$(function(){
	/*var camera, scene, renderer;
    var geometry, material, mesh;

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.z = 1000;

        scene = new THREE.Scene();

        geometry = new THREE.CubeGeometry( 200, 200, 200 );
        material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

        mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        $('.webgl').append(renderer.domElement);

    }

    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.02;

        renderer.render( scene, camera );

    }*/
    /*var width = 400,
    	height = 300;
    //设置相机的属性
    var view_angle = 45,
    	aspect = width/height,
    	near = 1,
    	far = 10000;
    //得到dom元素
    var container = $('.webgl');
    //创建一个webgl的渲染器和摄像机和一个场景
    
     camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
     camera.position.z = 1000;
    var scene = new THREE.Scene();
    //摄像机从0,0,0开始，因此默认远点，需要时回滚
    //设置摄像机z坐标位置距离原点向外300
    //camera.position.z = 300;
    //定义球体
    var radius = 300,
    	segments = 16,
    	rings = 16;
    //创建一个球体的材质
    var sphereMaterial =  new THREE.MeshLambertMaterial(
    {
    	color:0xCC0000
    });
    //创建光源
    var pointLight = new THREE.PointLight(0xFFFFFF);
    //设置光源点位置
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;
    scene.add(pointLight);
    //创建一个新的网格球体几何学
    var sphere = new THREE.Mesh(
    	new THREE.SphereGeometry(radius,segments,rings),
    	sphereMaterial);
    //添加球体到场景
    scene.add(sphere);
    
    var renderer = new THREE.CanvasRenderer();
    //开始渲染
    renderer.setSize(width,height);
    container.append(renderer.domElement);
    animate();
    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );

        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.02;
        sphere.rotation.z += 0.02;

        renderer.render( scene, camera );

    }*/

   /* var webgl = $('#webgl');
    //创建render
    var renderer = new THREE.WebGLRenderer(antialias:true);
    renderer.setSize(webgl.width(),webgl.height());
    webgl.append(renderer.domElement);
    //创建场景
    var scene = new THREE.Scene();
    //创建相机
    var camera = new THREE.PerspectiveCamera(45,webgl.width()/webgl.height(),1,4000);
    camera.position.set(0,0,3.3333);
    scene.add(camera);

    //创建一个矩形几何体
    var geometry = new THREE.PlaneGeometry(1,1);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial);
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
    mesh.rotation.z += 0.02;
    scene.add(mesh);
    //渲染绘制
    renderer.render(scene,camera);*/
    var renderer = null,
        scene = null,
        camera = null,
        cube = null,
        animating = false;
    var webgl = $('#webgl');
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(webgl.width(),webgl.height());
    webgl.append(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45,webgl.width()/webgl.height(),1,4000);
    camera.position.set(0,0,3);
    //创建一个平行光光源照射到物体上
    var light = new THREE.DirectionalLight(0xffffff,1.5);
    light.position.set(0,0,1);
    scene.add(light);

    //创建一个接受光照并带有纹理映射的立方体，并添加到场景中
    //首先，创建一个带纹理映射的立方体
    var mapUrl = '/static/images/three/1.jpg';
    var map = THREE.ImageUtils.loadTexture(mapUrl);

    //然后创建一个phong材质来处理着色，并传递给纹理映射
    var material = new THREE.MeshPhongMaterial({map:map});

    //创建一个立方体的几何体
    var geometry = new THREE.CubeGeometry(1,1,1);
    //将几何体和材质放到一个网格中
    cube = new THREE.Mesh(geometry,material);

    //设置网格在场景中的朝向，否则我们将不会看到立方体的形状
    cube.rotation.x = Math.PI/5;
    cube.rotation.y = Math.PI/5;
    //将立方体网格添加到场景中
    scene.add(cube);

    //添加鼠标事件的函数，勇于控制动画的开关
    addMouseHandler();
    //运行渲染循环
    run();
    function run(){
        //渲染场景
        renderer.render(scene,camera);
        //在下一帧中旋转立方体
        if(animating){
            cube.rotation.y -=0.01;
        }
        //在另一帧中回调
        requestAnimationFrame(run);
    }
    function addMouseHandler(){
        var dom = $(renderer.domElement);
        dom.mouseup(function(e){
            tools.cancelDefault(e);
            animating = !animating;
        });
    }

});