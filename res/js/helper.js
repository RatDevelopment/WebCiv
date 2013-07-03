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
