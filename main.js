// Perlin Heat Map POC

import PerlinGenerator2d from './PerlinGenerator2d.js';

const MAP_WIDTH = 256;
const MAP_HEIGHT = 256;

const TILE_SIZE = 16;

const COLORS = {
	red: 0x00,
	green: 0xF0,
	blue: 0xDF
};

(function() {
	var canvasElement = document.createElement('canvas');
	canvasElement.width = MAP_WIDTH*TILE_SIZE;
	canvasElement.height = MAP_HEIGHT*TILE_SIZE;

	document.body.appendChild(canvasElement);
	var ctx = canvasElement.getContext('2d');

	var heatMap = new HeatMap(MAP_WIDTH, MAP_HEIGHT);

	heatMap.draw(ctx, true);
})();


function HeatMap(width, height) {
	const GRID_SIZE = 128;

	var perlin = new PerlinGenerator2d(GRID_SIZE, true);
	var genAlgorithm = perlin.getFractalValue.bind(perlin, GRID_SIZE);

	var max, min;

	var heatMap = [];

	this.draw = draw;

	generateValues(true);

	function generateValues(normalize) {
		for (var y=0; y<height; y++) {
			var row = [];
			for (var x=0; x<width; x++) {
				row.push(stats(genAlgorithm(x,y)));
			}
			heatMap.push(row);
		}

		if (normalize) normalizeValues(this);
	}

	function normalizeValues() {
		for (var y=0; y<height; y++) {
			for (var x=0; x<width; x++) {
				heatMap[x][y] = ((heatMap[x][y]-min)/(max-min));
			}
		}
	}

	function stats(heat) {
		if (typeof max === 'undefined' || heat > max) max = heat;
		if (typeof min === 'undefined' || heat < min) min = heat;

		return heat;
	}

	function draw(ctx, animate) {
		for (var y=0; y<height; y++) {
			for (var x=0; x<width; x++) {
				ctx.fillStyle = `rgba(${heatMap[x][y]*COLORS.red}, ${heatMap[x][y]*COLORS.green}, ${heatMap[x][y]*COLORS.blue}, 1)`;
				ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}
}