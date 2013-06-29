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

    // camera target
    var cameraTarget = null;
    var focus = false;

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
        switch(f) {
          case 4:
            geometry.faceVertexUvs[0].push([
              new THREE.Vector2(0, 0.75),
              new THREE.Vector2(0, 0.25),
              new THREE.Vector2(0.5, 0)
            ]);
            break;
          case 5:
            geometry.faceVertexUvs[0].push([
              new THREE.Vector2(0.5, 0),
              new THREE.Vector2(1, 0.25),
              new THREE.Vector2(1, 0.75)
            ]);
            break;
          case 6:
            geometry.faceVertexUvs[0].push([
              new THREE.Vector2(1, 0.75),
              new THREE.Vector2(0.5, 1),
              new THREE.Vector2(0, 0.75)
            ]);
            break;
          case 7:
            geometry.faceVertexUvs[0].push([
              new THREE.Vector2(0, 0.75),
              new THREE.Vector2(0.5, 0),
              new THREE.Vector2(1, 0.75)
            ]);
            break;
          default:
            geometry.faceVertexUvs[0].push([
            new THREE.Vector2(0, 0.25),
            new THREE.Vector2(1, 0.25),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0, 0)
        ]);
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

        if (cameraTarget !== null) {
          var rotStep = 0.02;
          var xstep = 20;
          var ystep = 20;
          var completed = true;

          if (camera.rotation.x < cameraTarget.rotation.x - rotStep) {
            camera.rotation.x += rotStep;
            completed = false;
          } else if (camera.rotation.x > cameraTarget.rotation.x + rotStep) {
            camera.rotation.x -= rotStep;
            completed = false;
          } else {
            camera.rotation = cameraTarget.rotation;
          }

          if (camera.position.x < cameraTarget.position.x - xstep) {
            camera.position.x += xstep;
            completed = false;
          } else if (camera.position.x > cameraTarget.position.x + xstep) {
            camera.position.x -= xstep;
            completed = false;
          } else {
            camera.position.x = cameraTarget.position.x;
          }

          if (camera.position.y < cameraTarget.position.y - ystep) {
            camera.position.y += ystep;
            completed = false;
          } else if (camera.position.y > cameraTarget.position.y + ystep) {
            camera.position.y -= ystep;
            completed = false;
          } else {
            camera.position.y = cameraTarget.position.y;
          }

          if (completed) {
            cameraTarget = null;
          }
        }

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
    var renderer = new THREE.WebGLRenderer({
      antialiasing: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight-4);
    el.html(renderer.domElement);

    // geo setup
    for (var i = 0; i < settings.map.rows; i++) {
      for (var j = 0; j < settings.map.cols; j++) {
        addHexagon(settings.map.getTile(i, j));
      }
    }

    // hemisphere light
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0.3);
    scene.add(hemisphereLight);

    // point light
    var pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position = camera.position;
    pointLight.rotation.y = Math.PI/2;
    scene.add(pointLight);

    // render scene
    object.render();

    // find clicked tile
    projector = new THREE.Projector();
    function mouseTile(e) {
      var vector = new THREE.Vector3((e.clientX / window.innerWidth)*2 - 1,
        -1*(e.clientY / window.innerHeight) * 2 + 1, 0.5);
      projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position,
        vector.sub(camera.position).normalize());
      var intersects = raycaster.intersectObjects(settings.map.objects);

      if (intersects.length > 0) {
        // zoom to tile mesh
        cameraTarget = {};
        cameraTarget.position = new THREE.Vector3();
        cameraTarget.rotation = new THREE.Vector3();
        if (!focus) {
          cameraTarget.position.copy(intersects[0].object.position);
          cameraTarget.rotation.copy(intersects[0].object.rotation);
          cameraTarget.position.x += Math.floor(settings.tileSize/2);
          cameraTarget.position.y += Math.floor(settings.tileSize/2);
          pointLight.position.x = camera.position.x;
          pointLight.position.x = camera.position.x;
          focus = true;
        } else {
          cameraTarget.position.copy(camera.position);
          cameraTarget.position.y -= window.innerHeight/3;
          cameraTarget.rotation = new THREE.Vector3(0.5,0,0);
          focus = false;
        }
        // get tile
        var tilePoint = intersects[0].object.tilePoint;
        var tile = settings.map.getTile(tilePoint.x, tilePoint.y);
        // do something with tile
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
