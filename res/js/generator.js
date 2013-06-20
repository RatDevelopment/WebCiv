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

function getMap(rows, cols) {
	var map = {
		rows: rows,
		cols: cols,
		tiles: []
	};
	for (var i = 0; i < rows; i++) {
		map.tiles[i] = [];
		for (var j = 0; j < cols; j++) {
			var type = Math.random() < 0.8 ? "ground" : "water";
			// neighbors will be a list of point2D elements
			var neighbors = [];
			if (i !== 0) {
				// top left
				if (j === 0) {
					neighbors.push(point2D(cols-1, i-1));
				} else {
					neighbors.push(point2D(j-1, i-1));
				}
				// top right
				if (j === cols-1) {
					neighbors.push(point2D(0, i-1));
				} else {
					neighbors.push(point2D(j+1, i-1));
				}
			}
			if (i !== rows-1) {
				// bottom left
				if (j === 0) {
					neighbors.push(point2D(cols-1, i+1));
				} else {
					neighbors.push(point2D(j-1, i+1));
				}
				// bottom right
				if (j === cols-1) {
					neighbors.push(point2D(0, i+1));
				} else {
					neighbors.push(point2D(j+1, i+1));
				}
			}
			// left
			if (j === 0) {
				neighbors.push(point2D(cols-1, i));
			} else {
				neighbors.push(point2D(j-1, i));
			}
			// right
			if (j === cols-1) {
				neighbors.push(point2D(0, i));
			} else {
				neighbors.push(point2D(j+1, i));
			}
			map.tiles[i][j] = tile(j, i, type, neighbors);
		}
	}
	return map;
}