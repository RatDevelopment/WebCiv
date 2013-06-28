// "classes"
function point2D(x, y) {
  var result = {};
  result.x = x;
  result.y = y;
  return result;
}

function tile(x, y, type, neighbors, elevation) {
  return {
    x: x,
    y: y,
    type: type,
    neighbors: neighbors,
    elevation: elevation
  };
}

// get tile function for generator
function getTile(x, y) {
  var tx = x;
  var ty = y;
  while (tx < 0) {
    tx += this.cols;
  }
  while (tx > this.cols-1) {
    tx -= this.cols;
  }
  var result = this.tiles[tx][ty];
  if (typeof result === "undefined") {
    return tile(x, y, "blank", {}, result.elevation);
  } else {
    return tile(x, y, result.type, result.neighbors, result.elevation);
  }
}

function getMap(rows, cols) {
  if (rows % 2 !== 0 || cols % 2 !== 0) {
    throw "The number of rows and columns must be even.";
  }
  var map = {
    rows: rows,
    cols: cols,
    tiles: [],
    getTile: getTile
  };
  for (var i = 0; i < cols; i++) {
    map.tiles[i] = [];
    for (var j = 0; j < rows; j++) {
      var type = Math.random() < 0.7 ? "ground" : "water";
      var elevation = 30;
      if (type === 'water') {
        elevation = 10;
      }
      // neighbors will be a list of point2D elements
      var neighbors = {};
      if (j !== 0) {
        // top left
        if (i === 0) {
          neighbors.topleft = point2D(cols-1, j-1);
        } else {
          neighbors.topleft = point2D(i-1, j-1);
        }
        // top right
        if (i === cols-1) {
          neighbors.topright = point2D(0, j-1);
        } else {
          neighbors.topright = point2D(i+1, j-1);
        }
      }
      if (j !== rows-1) {
        // bottom left
        if (i === 0) {
          neighbors.bottomleft = point2D(cols-1, j+1);
        } else {
          neighbors.bottomleft = point2D(i-1, j+1);
        }
        // bottom right
        if (i === cols-1) {
          neighbors.bottomright = point2D(0, j+1);
        } else {
          neighbors.bottomright = point2D(i+1, j+1);
        }
      }
      // left
      if (j === 0) {
        neighbors.left = point2D(cols-1, j);
      } else {
        neighbors.left = point2D(i-1, j);
      }
      // right
      if (j === cols-1) {
        neighbors.right = point2D(0, j);
      } else {
        neighbors.right = point2D(i+1, j);
      }
      // create tile
      map.tiles[i][j] = tile(i, j, type, neighbors, elevation);
    }
  }
  return map;
}
