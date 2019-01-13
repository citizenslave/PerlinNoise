// Perlin Heat Map POC

// Import the noise module.
import PerlinGenerator2d from './PerlinGenerator2d.js';

// Set the width and height of the map.
const MAP_WIDTH = 256;
const MAP_HEIGHT = 256;

// Set the tile size
const TILE_SIZE = 16;

// Set the color for 1.0 noise values.
const COLORS = {
	red: 0x00,
	green: 0xF0,
	blue: 0xDF
};


// Anonymouse function to create a canvas and draw the heatmap on it.
(function() {
	var canvasElement = document.createElement('canvas');
	canvasElement.width = MAP_WIDTH*TILE_SIZE;
	canvasElement.height = MAP_HEIGHT*TILE_SIZE;

	document.body.appendChild(canvasElement);
	var ctx = canvasElement.getContext('2d');

	var heatMap = new HeatMap(MAP_WIDTH, MAP_HEIGHT);

	heatMap.draw(ctx);
})();


function HeatMap(width, height) {
	// Anything smaller breaks.  Anything bigger just extends computation time.
	// TODO: Figure out why.
	const GRID_SIZE = 128;

	// Instantiate a skewed noise generator
	var perlin = new PerlinGenerator2d(GRID_SIZE, true);
	// Sub in the fractal octaves using the grid size
	var genAlgorithm = perlin.getFractalValue.bind(perlin, GRID_SIZE);

	// Store the max and min.  Our returned values in practice end up
	// being from about 0.3-0.7, so we want to stretch those out to 0.0-1.0
	var max, min;

	// Create an empty heat map.
	var heatMap = [];

	// Export the draw method so it can be drawn to a canvas context.
	this.draw = draw;

	// Generate the values ahead of time, normalize them to 0.0-1.0 range.
	generateValues(true);

	// Generates the values and potentially normalizes them.
	function generateValues(normalize) {
		// each row
		for (var y=0; y<height; y++) {
			// empty row
			var row = [];
			// each column
			for (var x=0; x<width; x++) {
				// Generate a value for the point, adjust the min/max as needed, push the value onto the row.
				row.push(stats(genAlgorithm(x,y)));
			}
			// Push the row onto the map.
			heatMap.push(row);
		}

		// Normalize the values if requested.
		if (normalize) normalizeValues(this);
	}

	// Loop through all the values after min/max have been set
	function normalizeValues() {
		// each row
		for (var y=0; y<height; y++) {
			// each column
			for (var x=0; x<width; x++) {
				// Adjust the value based on how far it is from the minimum as a percentage of the range.
				heatMap[x][y] = ((heatMap[x][y]-min)/(max-min));
			}
		}
	}

	// Stores minimum and maximum return values.
	function stats(heat) {
		// If max hasn't been set yet or if the value is bigger, use the current value.
		if (typeof max === 'undefined' || heat > max) max = heat;
		// If min hasn't been set yet or if the value is smaller, use the current value.
		if (typeof min === 'undefined' || heat < min) min = heat;

		// Return the heat value again so we can daisy chain function calls.
		return heat;
	}

	// Draws the heatmap onto the canvas context.
	function draw(ctx) {
		// Each row
		for (var y=0; y<height; y++) {
			// Each column
			for (var x=0; x<width; x++) {
				// Set the fill style to the color computed using the returned value and the 1.0 color defined above.
				ctx.fillStyle = `rgba(${heatMap[x][y]*COLORS.red}, ${heatMap[x][y]*COLORS.green}, ${heatMap[x][y]*COLORS.blue}, 1)`;
				// Draw a tile at the current location using the size.
				ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}
}