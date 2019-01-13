export default function PerlinGenerator2d(size, skewed) {
	const RANGE = Math.sqrt(2/4);
	const MAX_SCALE = size;
	const LACUNARITY = 1;
	const PERSISTANCE = 1;

	var gradients = initNoise(size);

	function initNoise(size) {
		var grid = [];
		for (var y=0; y<size+1; y++) {
			var row = [];
			for (var x=0; x<size+1; x++) {
				var vX = Math.random()*(Math.random()>0.5?1:-1);
				var vY= Math.random()*(Math.random()>0.5?1:-1);
				var gridVector = new Vector2(vX, vY).normalize();

				row.push(gridVector);
			}

			grid.push(row);
		}

		return grid;
	}

	this.getSkewedValue = function(scale, x, y) {
		x *= this.getValue(scale, x, y);
		y *= this.getValue(scale, x, y);

		return this.getValue(scale, x, y);
	}

	this.getFractalValue = function(scale, x, y) {
		var result = 0;
		var baseLog = Math.log(scale)/Math.log(2);
		var frequency = 1;
		var amplitude = scale*2;
		for (var fractal=scale; fractal>1; fractal/=2) {
			var value = this.getAdjustedValue(fractal, x*frequency, y*frequency);
			result += (value*(fractal/amplitude));
			frequency *= LACUNARITY;
			amplitude *= PERSISTANCE;
		}

		return result;
	}

	this.getValue = function(scale, x, y) {
		if (typeof scale === 'undefined') {
			scale = MAX_SCALE;
		}

		// Find Grid Index at Scale
		var x0 = Math.floor(x/scale)%size;
		var x1 = x0 + 1;
		var y0 = Math.floor(y/scale)%size;
		var y1 = y0 + 1;

		// Find Relative Position in Grid
		var sx = (x-x0*scale)/scale;
		var sy = (y-y0*scale)/scale;

		// Create Vectors from Point to Grid Corners
		var vX0 = new Vector2(sx, sy);
		var vX1 = new Vector2(-(1-sx), sy);
		var vY0 = new Vector2(sx, -(1-sy));
		var vY1 = new Vector2(-(1-sx), -(1-sy));

		// Compute Dot Products of Point-Grid Vectors to Gradient Vectors
		if (typeof gradients[x0] === 'undefined' || typeof gradients[x0][y0] === 'undefined') {debugger;}
		var n0 = gradients[x0][y0].dotProd(vX0);
		var n1 = gradients[x1][y0].dotProd(vX1);
		var n2 = gradients[x0][y1].dotProd(vY0);
		var n3 = gradients[x1][y1].dotProd(vY1);

		// Interpolate Value
		var ix0 = smoothstep(n0, n1, sx);
		var ix1 = smoothstep(n2, n3, sx);
		var value = smoothstep(ix0, ix1, sy);

		return normalizeValue(value);

		function smoothstep(a0, a1, w) {
			var value = w*w*w*(w*(w*6 - 15) + 10);
			return a0 + value*(a1 - a0);
		}

		function normalizeValue(value) {
			return (value + RANGE)/(2*RANGE);
		}
	}

	this.getAdjustedValue = skewed?this.getSkewedValue:this.getValue;

	function Vector2(vX, vY) {
		var x = vX, y = vY;

		function magnitude() {
			return Math.sqrt((x*x) + (y*y));
		}

		this.normalize = function() {
			var vM = magnitude();
			return new Vector2(x/vM, y/vM);
		}

		this.dotProd = function(v1) {
			var v1 = v1.get();
			return x*v1.x + y*v1.y;
		}

		this.get = function() {
			return {
				x: x,
				y: y
			};
		}
	}
}