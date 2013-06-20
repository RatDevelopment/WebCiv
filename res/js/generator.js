// tile class
function tile(id, x, y, type, neighbors) {
	return {
		id: id,
		x: x,
		y: y,
		type: type,
		neighbors: neighbors
	};
}

function getMap(rows, cols) {
	var count = 0;
	var map = {
		rows: rows,
		cols: cols,
		map:[]
	};
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			var type = Math.random() < .8 ? "ground" : "water";
			map.map.push(tile(count++, i, j, type, []));
		}
	}
	return map;
}