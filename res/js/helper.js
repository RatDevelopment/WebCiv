// supplemental variables and functions

// transition step for animation
function transitionStep(current, target, step) {
  var completed = true;
  if (current < target - step) {
    current += step;
    completed = false;
  } else if (current > target + step) {
    current -= step;
    completed = false;
  } else {
    current = target;
  }
  var result = {};
  result.current = current;
  result.completed = completed;
  return result;
}

// return a material
function material(image) {
  var t = new THREE.ImageUtils.loadTexture(image);
  var m = new THREE.MeshLambertMaterial({
    map: t,
    overdraw: true
  });
  return m;
}

// materials
var materials = {
  'blank': material('res/img/blank.png'),
  'water': material('res/img/water.png'),
  'ground': material('res/img/ground.png')
};
