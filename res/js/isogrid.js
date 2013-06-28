// $.fn.isogrid implementation
jQuery(function($){
  $.fn.isogrid = function(options) {
    // settings
    var settings = {
      map: {},
      tileSize: 128
    };

    // custom settings
    $.extend(settings, options);
    settings.map.objects = [];

    // constants
    var YSPACE = Math.floor(3*settings.tileSize/4);
    var SIDE = Math.floor(settings.tileSize/4);

    // shapes
    var hexagonShape = new THREE.Shape();
    hexagonShape.moveTo(settings.tileSize/2, 0);
    hexagonShape.moveTo(settings.tileSize, SIDE);
    hexagonShape.moveTo(settings.tileSize, YSPACE);
    hexagonShape.moveTo(settings.tileSize/2, settings.tileSize);
    hexagonShape.moveTo(0, YSPACE);
    hexagonShape.moveTo(0, SIDE);
    hexagonShape.moveTo(settings.tileSize/2, 0);

    // materials
    function material(image) {
      var t = new THREE.ImageUtils.loadTexture(image);
      var m = new THREE.MeshLambertMaterial({
        map: t,
        overdraw: true
      });
      return m;
    }

    var materials = {
      'blank': material('res/img/blank.png'),
      'water': material('res/img/water.png'),
      'ground': material('res/img/ground.png')
    };

    // hexagon
    function addHexagon(tile) {
      var hexagon = new THREE.ShapeGeometry(hexagonShape);
      var geometry = new THREE.ExtrudeGeometry(hexagonShape, {
        amount: tile.elevation,
        bevelEnabled: false
      });
      // uv mapping
      geometry.faceUvs = [[]];
      geometry.faceVertexUvs = [[]];
      for (var f = 0; f < geometry.faces.length; f++) {
        var faceuv = [
            new THREE.Vector2(0, 1),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0, 0)
        ];
        if (f === 7) {
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(0, 0.75),
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(1, 0.75)
          ]);
        } else if (f === 4) {
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(0, 0.75),
            new THREE.Vector2(0, 0.25),
            new THREE.Vector2(0.5, 0)
          ]);
        } else if (f === 5) {
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(0.5, 0),
            new THREE.Vector2(1, 0.25),
            new THREE.Vector2(1, 0.75)
          ]);
        } else if (f === 6) {
          geometry.faceVertexUvs[0].push([
            new THREE.Vector2(1, 0.75),
            new THREE.Vector2(0.5, 1),
            new THREE.Vector2(0, 0.75)
          ]);

        } else {
          geometry.faceVertexUvs[0].push(faceuv);
        }
        geometry.faceUvs[0].push(new THREE.Vector2(0,1));
      }
      // end uv mapping
      var mesh = new THREE.Mesh(geometry, materials[tile.type]);
      var xoffset = Math.abs(tile.y) % 2 === 1 ? settings.tileSize/2 : 0;
      mesh.position.x = tile.x*settings.tileSize + xoffset;
      mesh.position.y = tile.y*YSPACE;
      var tilePoint = point2D(tile.x, tile.y);
      mesh.tilePoint = tilePoint;
      settings.map.objects.push(mesh);
      scene.add(mesh);
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
      window.innerWidth/(window.innerHeight-4), 0.1, 5000);
    camera.position.z = 500;
    camera.rotation.x = 0.5;

    // renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight-4);
    el.html(renderer.domElement);

    // geo setup
    for (var i = 0; i < settings.map.rows; i++) {
      for (var j = 0; j < settings.map.cols; j++) {
        addHexagon(settings.map.getTile(i, j));
      }
    }

    // directional lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.x = settings.map.cols*settings.tileSize/2;
    directionalLight.position.z = 5000;
    directionalLight.rotation.x = 0.5;
    directionalLight.distance = 1000;
    scene.add(directionalLight);

    // render scene
    object.render();

    // find clicked tile
    projector = new THREE.Projector();
    function mouseTile(e) {
      var vector = new THREE.Vector3((event.clientX / window.innerWidth)*2 - 1,
        -1*(event.clientY / window.innerHeight) * 2 + 1, 0.5);
      projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position,
        vector.sub(camera.position).normalize());
      var intersects = raycaster.intersectObjects(settings.map.objects);

      if (intersects.length > 0) {
        intersects[0].object.position.z += 10;
        var tilePoint = intersects[0].object.tilePoint;
        var tile = settings.map.getTile(tilePoint.x, tilePoint.y);
        // do something with tile
        console.log(tile);
      }
    }
    el.click(mouseTile);

    // mouse pan handler
    var mouseIsDown = false;
    var mousedownx = 0;
    var mousedowny = 0;
    var mousedowncam = {};
    el.bind('movestart', function(e) {
      mouseIsDown = true;
      mousedownx = e.pageX;
      mousedowny = e.pageY;
      mousedowncam = {
        x: camera.position.x,
        y: camera.position.y
      };
    });
    el.bind('moveend', function() {
      mouseIsDown = false;
    });
    el.bind('move', function(e) {
      if (mouseIsDown) {
        var mousex = e.pageX;
        var mousey = e.pageY;
        var newx = mousedowncam.x - mousex + mousedownx;
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
