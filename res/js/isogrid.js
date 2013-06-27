// $.fn.isogrid implementation
jQuery(function($){
  $.fn.isogrid = function(options) {
    // settings
    var settings = {
      map: {},
      tileWidth: 128,
      tileHeight: 106
    };

    // custom settings
    $.extend(settings, options);

    // materials
    function material(image) {
      var t = new THREE.ImageUtils.loadTexture(image);
      var m = new THREE.MeshBasicMaterial({
        map: t,
        overdraw: true,
        transparent: true,
        dynamic: true
      });
      return m;
    }

    var materials = {
      'blank': material('res/img/blank.png'),
      'water': material('res/img/water.png'),
      'ground': material('res/img/ground.png')
    };

    // hexagon
    function getHexagon(x, y, z, material) {
      var shape = new THREE.ShapeGeometry();

    }

    // object will contain public methods to interact with the grid
    var object = {
      render: function() {
        requestAnimationFrame(object.render);

        renderer.render(scene, camera);
      }
    };

    // element
    var el = $(this);

    // scene
    var scene = new THREE.Scene();

    // camera
    var camera = new THREE.PerspectiveCamera(60,
      window.innerWidth/(window.innerHeight-4), 0.1, 1000);
    camera.position.z = 500;
    camera.position.x = 50;
    camera.position.y = -200;
    camera.rotation.x = 0.5;

    // renderer
    var renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight-4);
    el.html(renderer.domElement);

    // geo setup

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(128, 106, 4, 4),
      materials.ground);
    scene.add(plane);
    var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(128, 106, 4, 4),
      materials.water);
    plane2.position.x +=  128;
    scene.add(plane2);
    var plane3 = new THREE.Mesh(new THREE.PlaneGeometry(128, 106, 4, 4),
      materials.water);
    plane3.position.x +=  64;
    plane3.position.y += Math.floor(106*3/4);
    scene.add(plane3);

    // render scene
    object.render();

    // mouse pan handler
    var mouseIsDown = false;
    var mousedownx = 0;
    var mousedowny = 0;
    var mousedowncam = {};
    $(document).mousedown(function(e) {
      mouseIsDown = true;
      mousedownx = e.pageX;
      mousedowny = e.pageY;
      mousedowncam = {
        x: camera.position.x,
        y: camera.position.y
      };
    });
    $(document).mouseup(function() {
      mouseIsDown = false;
    });
    $(document).mousemove(function(e) {
      if (mouseIsDown) {
        var mousex = e.pageX;
        var mousey = e.pageY;
        var newx = mousedownx - mousex -mousedowncam.x;
        var newy = mousedowncam.y + mousey - mousedowny;
        camera.position.x = newx;
        camera.position.y = newy;
      }
    });

    // resize handler
    $(window).resize(function() {
      camera.aspect = window.innerWidth/(window.innerHeight-4);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight-4);
    });

    return object;
  };
});
