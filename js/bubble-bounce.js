;(function() {
  var getStyle = function(element, style) {
    return parseFloat(window.getComputedStyle(element).getPropertyValue(style));
  };

  var random = function(low, high, dimension) {
    if (dimension === undefined) dimension = 0;
    return Math.floor(Math.random() * (high - low + 1 - dimension)) + low;
  };

  var getRandomColor = function() {
    var R = parseInt(Math.random() * 255);
    var G = parseInt(Math.random() * 255);
    var B = parseInt(Math.random() * 255);
    var color = 'rgb(' + R + ',' + G + ',' + B + ')';
    return color;
  };

  var bubbleArray = [];

  var Mouse = function(radius, canvas) {
    var that = this;

    if (!radius) radius = MOUSE_RADIUS;
    this.draw = false;

    this.position = {
      x: 0,
      y: 0
    };
    this.radius = radius;

    this.init = function() {
      canvas.onmousemove = function(e) {
        that.position.x = e.clientX - canvas.getBoundingClientRect().left;
        that.position.y = e.clientY - canvas.getBoundingClientRect().top;
        that.draw = true;
      };

      canvas.onmouseout = function() {
        that.draw = false;
      };
    };
    this.init();
  };

  var Bubble = function(position, radius, speed, angle) {
    var that = this;

    if (!position)
      position = {
        x: 0,
        y: 0
      };
    if (!radius) radius = MIN_RADIUS;
    if (!speed) speed = MIN_SPEED;
    if (!angle) angle = MIN_ANGLE;

    this.position = position;
    this.radius = radius;
    this.speed = speed;
    this.initialSpeed = speed;
    this.angle = angle;
    this.velocity = 1;

    this.xDirection = Math.random() > 0.5 ? 1 : -1;
    this.yDirection = Math.random() > 0.5 ? 1 : -1;

    this.index = 0;
    this.color = 'none';

    this.move = function() {
      this.position.x +=
        this.speed * this.xDirection * Math.cos((this.angle / 180) * Math.PI);
      this.position.y +=
        this.speed * this.yDirection * Math.sin((this.angle / 180) * Math.PI);
    };

    this.updateDirection = function(width, height) {
      if (this.position.x + this.radius > width) this.xDirection = -1;
      if (this.position.x - this.radius < 0) this.xDirection = 1;

      if (this.position.y + this.radius > height) this.yDirection = -1;
      if (this.position.y - this.radius < 0) this.yDirection = 1;
    };

    this.collisionDetection = function() {
      for (var index = 0; index < bubbleArray.length; index++) {
        if (index !== this.index) {
          var radius = this.radius + bubbleArray[index].radius;
          var distance = Math.sqrt(
            Math.pow(this.position.x - bubbleArray[index].position.x, 2) +
              Math.pow(this.position.y - bubbleArray[index].position.y, 2),
            2
          );
          if (distance <= radius) {
            this.xDirection *= -1;
            this.yDirection *= -1;
            this.position.x += (radius - distance) * this.xDirection;
            this.position.y += (radius - distance) * this.yDirection;
          }
        }
      }
    };

    this.antigravity = function(mouse) {
      if (mouse.draw) {
        var radius = that.radius + mouse.radius;
        var distance = Math.sqrt(
          Math.pow(this.position.x - mouse.position.x, 2) +
            Math.pow(this.position.y - mouse.position.y, 2),
          2
        );
        if (distance < radius) {
          this.speed = ((radius - distance) / distance) * this.initialSpeed;
        } else {
          this.speed = this.initialSpeed;
        }
      }
    };
  };

  var Canvas = function(id, width, height) {
    var that = this;

    if (!id) {
      return;
    }
    if (!width) {
      width = WIDTH;
    }
    if (!height) {
      height = HEIGHT;
    }

    this.id = id;
    this.width = width;
    this.height = height;

    this.container = document.getElementById(id);

    this.canvasElement = document.createElement('canvas');
    this.canvasElement.setAttribute('width', this.width);
    this.canvasElement.setAttribute('height', this.height);

    this.container.appendChild(this.canvasElement);

    this.canvasContext = this.canvasElement.getContext('2d');

    this.init = function(count) {
      if (!count) count = BALL_COUNT;

      for (var index = 0; index < count; index++) {
        var radius = random(MIN_RADIUS, MAX_RADIUS);
        var center = {
          x: random(0 + radius, this.width - radius),
          y: random(0 + radius, this.height - radius)
        };
        var speed = random(MIN_SPEED, MAX_SPEED);
        var angle = random(MIN_ANGLE, MAX_ANGLE);
        var bubble = new Bubble(center, radius, speed, angle);
        bubble.index = index;
        bubble.color = getRandomColor();
        bubbleArray.push(bubble);
      }

      var mouse = new Mouse(MOUSE_RADIUS, this.canvasElement);

      var draw = function() {
        that.canvasContext.clearRect(0, 0, that.width, that.height);
        for (var index = 0; index < bubbleArray.length; index++) {
          var currentBubble = bubbleArray[index];
          that.canvasContext.beginPath();
          that.canvasContext.arc(
            currentBubble.position.x,
            currentBubble.position.y,
            currentBubble.radius,
            0,
            2 * Math.PI,
            false
          );
          that.canvasContext.fillStyle = currentBubble.color;
          that.canvasContext.fill();
          that.canvasContext.closePath();
          currentBubble.move();
          currentBubble.updateDirection(that.width, that.height);
          currentBubble.collisionDetection();
          currentBubble.antigravity(mouse);
        }
        if (mouse.draw) {
          that.canvasContext.beginPath();
          that.canvasContext.arc(
            mouse.position.x,
            mouse.position.y,
            mouse.radius,
            0,
            2 * Math.PI,
            false
          );
          that.canvasContext.lineWidth = 2;
          that.canvasContext.strokeStyle = '#003300';
          that.canvasContext.stroke();
          that.canvasContext.closePath();
        }

        window.requestAnimationFrame(draw);
      };

      draw();
    };
  };

  var canvas = new Canvas('container', WIDTH, HEIGHT);
  canvas.init(BALL_COUNT);
})();
