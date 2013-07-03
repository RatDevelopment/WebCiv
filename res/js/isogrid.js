// $.fn.isogrid implementation
jQuery(function($){
  $.fn.isogrid = function(options) {
    // ---- [ settings ] ------------------------------------------------------
    var settings = {
      map: {},
      tileSize: 128
    };

    // override settings
    $.extend(settings, options);

    // make array for hex meshes
    settings.map.meshes = [];

    // ---- [ variables ] -----------------------------------------------------
    //constants
    var YSPACE = Math.floor(3*settings.tileSize/4);
    var SIDE = Math.floor(settings.tileSize/4);

    // hexagon shape for tiles
    var hexagonShape = new THREE.Shape();
    hexagonShape.moveTo(settings.tileSize/2, 0);
    hexagonShape.moveTo(settings.tileSize, SIDE);
    hexagonShape.moveTo(settings.tileSize, YSPACE);
    hexagonShape.moveTo(settings.tileSize/2, settings.tileSize);
    hexagonShape.moveTo(0, YSPACE);
    hexagonShape.moveTo(0, SIDE);
    hexagonShape.moveTo(settings.tileSize/2, 0);

    // camera target
    var cameraTarget = null;

    // tile focus
    var focus = false;

    // element
    var el = $(this);

    // materials
    var materials;
    var numMaterialsLoaded = 0;

    // reusable textures
    var blackTexture;

    // three.js vars
    var scene, renderer, camera, projector, pointLight;

    // ---- [ loading shaders ] -----------------------------------------------
    // shader variables
    var vertexShader = null;
    var fragmentShader = null;
    // XHR shader loading
    var shaderXhr = new XMLHttpRequest();
    shaderXhr.open("GET", "res/shaders/vertexShader.fs", true);
    shaderXhr.onload = function() {
      vertexShader = this.responseText;
      shadersLoaded();
    };
    shaderXhr.send(null);
    shaderXhr = new XMLHttpRequest();
    shaderXhr.open("GET", "res/shaders/fragmentShader.fs", true);
    shaderXhr.onload = function() {
      fragmentShader = this.responseText;
      shadersLoaded();
    };
    shaderXhr.send(null);
    // init if both shaders are loaded
    function shadersLoaded() {
      if (vertexShader !== null && fragmentShader !== null) {
        init();
      }
    }

    // ---- [ three.js init function ] ----------------------------------------
    function init() {
      // renderer
      renderer = new THREE.WebGLRenderer();
      renderer.physicallyBasedShading = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      el.html(renderer.domElement);

      // scene
      scene = new THREE.Scene();

      // camera
      camera = new THREE.PerspectiveCamera(60,
        window.innerWidth/(window.innerHeight-4), 0.1, 5000);
      camera.position.z = 500;
      camera.rotation.x = 0.5;

      // used for finding what object is clicked
      projector = new THREE.Projector();

      // black texture for darkening
      blackTexture = new THREE.ImageUtils.loadTexture('res/img/black.png',
        new THREE.UVMapping(), function() {
          numMaterialsLoaded++;
          materialsLoaded();
      });
      blackTexture.needsUpdate = true;

      // point light
      var pointLight = new THREE.PointLight(0xffffff, 1.2);
      pointLight.position = camera.position;
      pointLight.rotation.y = Math.PI/2;
      scene.add(pointLight);

      // load materials
       materials = {
        'water': material('res/img/water.png', true),
        'waterdark': material('res/img/water.png', false),
        'ground': material('res/img/ground.png', true),
        'grounddark': material('res/img/ground.png', false)
      };

      // tilegrid setup
      for (var i = 0; i < settings.map.rows; i++) {
        for (var j = 0; j < settings.map.cols; j++) {
          addHexagon(settings.map.tiles[i][j]);
        }
      }
    }

    // ---- [ three.js render function ] --------------------------------------
    function render() {
      requestAnimationFrame(render);

      // animate camera to target if there is a target
      if (cameraTarget !== null) {
        var rotStep = 0.02;
        var xStep = 20;
        var yStep = 20;
        var completedRot = transitionStep(camera.rotation.x,
          cameraTarget.rotation.x, rotStep);
        camera.rotation.x = completedRot.current;
        var completedPosX = transitionStep(camera.position.x,
          cameraTarget.position.x, xStep);
        camera.position.x = completedPosX.current;
        var completedPosY = transitionStep(camera.position.y,
          cameraTarget.position.y, yStep);
        camera.position.y = completedPosY.current;
        if (completedRot.completed && completedPosX.completed &&
          completedPosY.completed) {
          cameraTarget = null;
        }
      }

      renderer.render(scene, camera);
    }

    // ---- [ functions ] -----------------------------------------------------
    // object will contain public methods to interact with the grid
    var object = {
      'focusTile': function(point) {
        // get tile
        var t = settings.map.tiles[point.x][point.y];
        // zoom to tile mesh
        cameraTarget = {};
        cameraTarget.position = new THREE.Vector3();
        cameraTarget.rotation = new THREE.Vector3();
        cameraTarget.position.copy(t.mesh.position);
        cameraTarget.rotation.copy(t.mesh.rotation);
        cameraTarget.position.x += Math.floor(settings.tileSize/2);
        cameraTarget.position.y += Math.floor(settings.tileSize/2);
        focus = true;

      },
      'unFocus': function() {
        cameraTarget = {};
        cameraTarget.position = new THREE.Vector3();
        cameraTarget.rotation = new THREE.Vector3();
        cameraTarget.position.copy(camera.position);
        cameraTarget.position.y -= window.innerHeight/3;
        cameraTarget.rotation = new THREE.Vector3(0.5,0,0);
        focus = false;
      },
      'switchActive': function(point) {
        var tile = settings.map.tiles[point.x][point.y];
      if (tile.active) {
        tile.mesh.material = materials[tile.type+'dark'];
        tile.active = false;
      } else {
        tile.mesh.material = materials[tile.type];
        tile.active = true;
      }
    }
    };

    // add hexagon to scene
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
      var mesh;
      if (tile.active) {
        mesh = new THREE.Mesh(geometry, materials[tile.type]);
      } else {
        mesh = new THREE.Mesh(geometry, materials[tile.type+'dark']);
      }
      var xoffset = Math.abs(tile.y) % 2 === 1 ? settings.tileSize/2 : 0;
      mesh.position.x = tile.x*settings.tileSize + xoffset;
      mesh.position.y = tile.y*YSPACE;
      var tilePoint = point2D(tile.x, tile.y);
      mesh.tilePoint = tilePoint;
      settings.map.tiles[tile.x][tile.y].mesh = mesh;
      settings.map.meshes.push(mesh);
      scene.add(mesh);
    }

    // return a material
    function material(image, active) {
      // texture
      var texture = new THREE.ImageUtils.loadTexture(image,
        new THREE.UVMapping(), function() {
          numMaterialsLoaded++;
          materialsLoaded();
      });
      texture.needsUpdate = true;
      // material
      var result;
      if (active) {
        result = new THREE.MeshLambertMaterial({
          map: texture,
          overdraw: true
        });
      } else {
        // uniforms
        var uniforms = {
          texture: {type: 't', value: texture},
          black: {type: 't', value: blackTexture}
        };
        // attributes
        var attributes = {
        };
        result = new THREE.ShaderMaterial({
          attributes: attributes,
          uniforms: uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader
        });
      }
      return result;
    }

    // render if all materials are loaded
    function materialsLoaded() {
      if (numMaterialsLoaded === Object.keys(materials).length+1) {
        render();
      }
    }

    // find clicked tile
    function mouseTile(e) {
      var vector = new THREE.Vector3((e.clientX / window.innerWidth)*2 - 1,
        -1*(e.clientY / window.innerHeight) * 2 + 1, 0.5);
      projector.unprojectVector(vector, camera);
      var raycaster = new THREE.Raycaster(camera.position,
        vector.sub(camera.position).normalize());
      var intersects = raycaster.intersectObjects(settings.map.meshes);

      if (intersects.length > 0) {
        // get tile
        var tilePoint = intersects[0].object.tilePoint;
        var tile = settings.map.tiles[tilePoint.x][tilePoint.y];
        // do something with tile
        object.switchActive(tile);
        // if (!focus) {
        //   object.focusTile(tile);
        // } else {
        //   object.unFocus();
        // }
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
      camera.aspect = window.innerWidth/(window.innerHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return object;
  };
});
