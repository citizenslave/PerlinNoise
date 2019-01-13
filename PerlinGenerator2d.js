export default function PerlinGenerator2d(size, skewed) {
	// Range of potential results, defined by math and stuff...
	const RANGE = Math.sqrt(2/4);

	// Rate at which frequency changes between octaves.  Doesn't work very well near as I can tell.
	const LACUNARITY = 1;
	// Rate at which amplitude changes between octaves.  Also doesn't seem to work very well.
	const PERSISTANCE = 1;

	// Perlin noise relies on a grid of unit vectors.  Points between the vectors interpolate values between them.
	// These vectors have to be initialized to a certain grid size.
	var gradients = initNoise(size);

	// Initializes the grid of unit vectors.
	function initNoise(size) {
		// Start with an empty grid.
		var grid = [];
		// Loop through the rows.
		for (var y=0; y<size+1; y++) {
			// Start with an empty row.
			var row = [];
			// Loop through the columns.
			for (var x=0; x<size+1; x++) {
				// Set a random X value for the vector and randomize its direction.
				var vX = Math.random()*(Math.random()>0.5?1:-1);
				// Set a random Y value for the vector and randomize its direction.
				var vY= Math.random()*(Math.random()>0.5?1:-1);
				// Create a vector using the values and normalize it to a unit vector.
				var gridVector = new Vector2(vX, vY).normalize();

				// Push the vector onto the end of the row.
				row.push(gridVector);
			}

			// After the row is completed, push the whole row onto the end of the grid.
			grid.push(row);
		}

		// After all the rows are completed, return the grid.
		return grid;
	}

	// Get the value at the specified point.  The scale determines how much of the grid to use.
	this.getValue = function(scale, x, y) {
		// Find grid index at scale and identify the four corners.  % size ensures we don't run off the edge of the grid.
		var x0 = Math.floor(x/scale)%size;
		var x1 = x0 + 1;
		var y0 = Math.floor(y/scale)%size;
		var y1 = y0 + 1;

		// Find the relative position in the grid for the point.
		var sx = (x-x0*scale)/scale;
		var sy = (y-y0*scale)/scale;

		// Create vectors from the point to the grid corners.
		var vX0 = new Vector2(sx, sy);
		var vX1 = new Vector2(-(1-sx), sy);
		var vY0 = new Vector2(sx, -(1-sy));
		var vY1 = new Vector2(-(1-sx), -(1-sy));

		// Compute the dot-products of point->grid corner vectors with the gradient vectors at that corner.
		// Break execution if we're about to explode.
		if (typeof gradients[x0] === 'undefined' || typeof gradients[x0][y0] === 'undefined') {debugger;}
		var n0 = gradients[x0][y0].dotProd(vX0);
		var n1 = gradients[x1][y0].dotProd(vX1);
		var n2 = gradients[x0][y1].dotProd(vY0);
		var n3 = gradients[x1][y1].dotProd(vY1);

		// Interpolate the value using smoothstep.  Linear interpolation makes the grid too easy to see
		var ix0 = smoothstep(n0, n1, sx);
		var ix1 = smoothstep(n2, n3, sx);
		var value = smoothstep(ix0, ix1, sy);

		// Adjust the values to 0.0-1.0 from their usual range.
		return normalizeValue(value);

		// I plagerized this entirely from stackoverflow.
		function smoothstep(a0, a1, w) {
			var value = w*w*w*(w*(w*6 - 15) + 10);
			return a0 + value*(a1 - a0);
		}

		// (n-min1)/(max1-min1) maps n from min1-max1 to 0-1.  This can be simplifed for +/- sqrt(2/4).
		function normalizeValue(value) {
			return (value + RANGE)/(2*RANGE);
		}
	}

	// Plagerized from a YouTube video.  Instead of getting the noise value at the point, get the noise value of the point
	// scaled to the noise value of the point.  Not entirely sure why it looks cool, but it does.
	this.getSkewedValue = function(scale, x, y) {
		x *= this.getValue(scale, x, y);
		y *= this.getValue(scale, x, y);

		return this.getValue(scale, x, y);
	}

	// This is a way of doing octaves that sets the persistance and lacunarity fractally by just
	// dividing the size of the grid sampled and the amplitude by 2 each time.
	this.getFractalValue = function(scale, x, y) {
		var result = 0;
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

	// This lets us easily switch between the skewed and normal noise generation.
	this.getAdjustedValue = skewed?this.getSkewedValue:this.getValue;

	// Simple helper class for 2d vectors
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