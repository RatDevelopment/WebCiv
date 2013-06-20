// "classes"
function point2D(x, y) {
	var result = {};
	result.x = x;
	result.y = y;
	return result;
}

function tile(x, y, type, neighbors) {
	return {
		x: x,
		y: y,
		type: type,
		neighbors: neighbors
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
		return tile(x, y, "blank", {});
	} else {
		return tile(x, y, result.type, result.neighbors);
	}
}

function getMap(rows, cols) {
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
			// neighbors will be a list of point2D elements
			var neighbors = {};
			if (i !== 0) {
				// top left
				if (j === 0) {
					neighbors.topleft = point2D(cols-1, i-1);
				} else {
					neighbors.topleft = point2D(j-1, i-1);
				}
				// top right
				if (j === cols-1) {
					neighbors.topright = point2D(0, i-1);
				} else {
					neighbors.topright = point2D(j+1, i-1);
				}
			}
			if (i !== rows-1) {
				// bottom left
				if (j === 0) {
					neighbors.bottomleft = point2D(cols-1, i+1);
				} else {
					neighbors.bottomleft = point2D(j-1, i+1);
				}
				// bottom right
				if (j === cols-1) {
					neighbors.bottomright = point2D(0, i+1);
				} else {
					neighbors.bottomright = point2D(j+1, i+1);
				}
			}
			// left
			if (j === 0) {
				neighbors.left = point2D(cols-1, i);
			} else {
				neighbors.left = point2D(j-1, i);
			}
			// right
			if (j === cols-1) {
				neighbors.right = point2D(0, i);
			} else {
				neighbors.right = point2D(j+1, i);
			}
			map.tiles[i][j] = tile(j, i, type, neighbors);
		}
	}
	return map;
}