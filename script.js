function GravityBall (root, g) {
	this.root = $(root);
	this.g = g || 980;
	this.position = {x: 0, y: 600};
	this.speed = {x: 170, y: 300};
	this.holding = false;
	this.lastFrame = null;
	this.suppressSpeed = 0.8;
	this.trail = [];
	this.render();
	this.installListeners();
}

GravityBall.prototype = {
	repaint: function (nanoTime) {
		if (this.lastFrame !== null && !this.holding) {
			var dt = (nanoTime - this.lastFrame) / 1000;
			this.advance(dt);
		}
		this.render();
		this.lastFrame = nanoTime;
	},
	render: function () {
		var ball = this.root.children('#ball');
		if (!ball.length) {
			this.root.append($('<div id="ball"></div>'));
			ball = this.root.children('#ball');
		}
		ball.css({
			left: (this.position.x + 13) + 'px',
			bottom: (this.position.y + 13) + 'px'
		});
	},
	advance: function (dt) {
		this.speed.y -= dt * this.g;
		this.position.x += dt * this.speed.x;
		this.position.y += dt * this.speed.y;
		var size = {
			w: this.root.width() - 26,
			h: this.root.height() - 26
		};
		if ( this.position.y < 0 ) {
			this.position.y = -this.position.y;
			this.speed.x = this.suppressSpeed * this.speed.x;
			this.speed.y = -this.suppressSpeed * this.speed.y;
		} 
		if ( this.position.x >  size.w ) {
			this.position.x = 2 * size.w - this.position.x;
			this.speed.x = -this.suppressSpeed * this.speed.x;
			this.speed.y = this.suppressSpeed * this.speed.y;
		}  
		if ( this.position.x <  0 ) {
			this.position.x = -this.position.x;
			this.speed.x = -this.suppressSpeed * this.speed.x;
			this.speed.y = this.suppressSpeed * this.speed.y;
		} 
		if ( this.position.y >  size.h ) {
			this.position.y = 2 * size.h - this.position.y;
			this.speed.x = this.suppressSpeed * this.speed.x;
			this.speed.y = -this.suppressSpeed * this.speed.y;
		} 
	},
	handleMousedown: function (event) {
		this.holding = true;
		this.position.x = event.offsetX;
		this.position.y = this.root.height() - event.offsetY;
		this.speed.x = this.speed.y = 0;
		this.trail.unshift({
			x: this.position.x,
			y: this.position.y,
			t: event.timeStamp
		})

	},
	handleMousemove: function (event) {
		if (!this.holding) return;
		this.position.x = event.offsetX;
		this.position.y = this.root.height() - event.offsetY;
		this.trail.unshift({
			x: this.position.x,
			y: this.position.y,
			t: event.timeStamp
		})
		if (this.trail.length > 3)	this.trail.length = 3;			
	},
	handleMouseup: function (event) {
		this.holding = false;
		var x = event.offsetX;
		var y = this.root.height() - event.offsetY;
		if (!this.trail.length) this.speed.x = this.speed.y = 0;
		else {
			var last = this.trail[this.trail.length - 1];
			var dt = (event.timeStamp - last.t) / 1000;
			this.speed.x = (x - last.x) / dt;
			this.speed.y = (y - last.y) / dt;
		}
		this.trail.length = 0;
	},
	installListeners: function () {
		this.root.on('mousedown', this.handleMousedown.bind(this)); 
		this.root.on('mouseup', this.handleMouseup.bind(this));
		this.root.on('mousemove', this.handleMousemove.bind(this));
		var self = this;
		requestAnimationFrame(function drawer(nanoTime){
			self.repaint(nanoTime);
			requestAnimationFrame(drawer);
		});
	}
}

$(document).ready(function () {
	new GravityBall('#container');
})