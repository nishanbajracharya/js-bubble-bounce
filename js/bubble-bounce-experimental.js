;
(function() {

  /**
   * Compute a style value of a given element
   * @param  {Element} element [Target Div]
   * @param  {String} style   [Style to be calculated]
   * @return {Float}         [description]
   */
  var getStyle = function(element, style) {
    return parseFloat(window.getComputedStyle(element).getPropertyValue(style));
  };

  /**
   * Get a random value between low and high values.
   * @param  {Int} low       [Lower limit]
   * @param  {Int} high      [Upper limit]
   * @param  {Int} dimension [Used to define width/height of bouncing ball]
   * @return {Int}           [A random value]
   */
  var random = function(low, high, dimension) {
    if (dimension === undefined) {
      dimension = 0;
    }
    return Math.floor(Math.random() * (high - low + 1 - dimension)) + low;
  };

  /**
   * Get a random color
   * @return {String} [CSS rgb() returned as a string]
   */
  var getRandomColor = function() {
    var R = parseInt(Math.random() * 255);
    var G = parseInt(Math.random() * 255);
    var B = parseInt(Math.random() * 255);
    var color = "rgb(" + R + "," + G + "," + B + ")";
    return color;
  };

  var bubbleArray = [];

  var bubbleQuadrantTopLeft = [];
  var bubbleQuadrantBottomLeft = [];
  var bubbleQuadrantTopRight = [];
  var bubbleQuadrantBottomRight = [];

  var resetBubbleQuadrant = function() {
    bubbleQuadrantTopLeft = [];
    bubbleQuadrantBottomLeft = [];
    bubbleQuadrantTopRight = [];
    bubbleQuadrantBottomRight = [];
  };

  var containerWidth;
  var containerHeight;

  /**
   * Mouse Class
   * @param {Int} radius [Radius of mouse field]
   * @param {Element} canvas [Canvas Element to be drawn in]
   */
  var Mouse = function(radius, canvas) {
    var that = this;

    if (radius === undefined) {
      radius = 100;
    }

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

  /**
   * Bubble Class
   * @param {Object} position [Position of bubble]
   * @param {Int} radius   [Radius of bubble]
   * @param {Int} speed    [Speed of bubble]
   * @param {Int} angle    [Angle of bubble]
   */
  var Bubble = function(position, radius, speed, angle) {
    var that = this;

    if (position === undefined) position = {
      x: 0,
      y: 0
    };
    if (radius === undefined) {
      radius = 10;
    }
    if (speed === undefined) {
      speed = 5;
    }
    if (angle === undefined) {
      angle = 45;
    }

    this.position = position;
    this.radius = radius;
    this.speed = speed;
    this.initialSpeed = speed;
    this.angle = angle;
    this.velocity = 1;

    this.xDirection = (Math.random() > 0.5) ? 1 : -1;
    this.yDirection = (Math.random() > 0.5) ? 1 : -1;

    this.index = 0;
    this.color = "none";
    this.quadrant = [];

    this.move = function() {
      if (this.position.x - this.radius < containerWidth / 2) {
        if (this.position.y - this.radius < containerHeight / 2) {
          bubbleQuadrantTopLeft.push(this.index);
          this.quadrant = this.quadrant.concat(bubbleQuadrantTopLeft);
        } else {
          bubbleQuadrantBottomLeft.push(this.index);
          this.quadrant = this.quadrant.concat(bubbleQuadrantBottomLeft);
        }
      } else {
        if (this.position.y - this.radius < containerHeight / 2) {
          bubbleQuadrantTopRight.push(this.index);
          this.quadrant = this.quadrant.concat(bubbleQuadrantTopRight);
        } else {
          bubbleQuadrantBottomRight.push(this.index);
          this.quadrant = this.quadrant.concat(bubbleQuadrantBottomRight);
        }
      }
      if (this.position.x + this.radius < containerWidth / 2) {
        if (this.position.y + this.radius < containerHeight / 2) {
          if (bubbleQuadrantTopLeft.indexOf(this.index) === -1) {
            bubbleQuadrantTopLeft.push(this.index);
            this.quadrant = this.quadrant.concat(bubbleQuadrantTopLeft);
          }
        } else {
          if (bubbleQuadrantBottomLeft.indexOf(this.index) === -1) {
            bubbleQuadrantBottomLeft.push(this.index);
            this.quadrant = this.quadrant.concat(bubbleQuadrantBottomLeft);
          }
        }
      } else {
        if (this.position.y + this.radius < containerHeight / 2) {
          if (bubbleQuadrantTopRight.indexOf(this.index) === -1) {
            bubbleQuadrantTopRight.push(this.index);
            this.quadrant = this.quadrant.concat(bubbleQuadrantTopRight);
          }
        } else {
          if (bubbleQuadrantBottomRight.indexOf(this.index) === -1) {
            bubbleQuadrantBottomRight.push(this.index);
            this.quadrant = this.quadrant.concat(bubbleQuadrantBottomRight);
          }
        }
      }
      this.position.x += this.speed * this.xDirection * Math.cos(this.angle / 180 * Math.PI);
      this.position.y += this.speed * this.yDirection * Math.sin(this.angle / 180 * Math.PI);
    };

    this.updateDirection = function(width, height) {
      if (this.position.x + this.radius > width) {
        this.xDirection = -1;
      }
      if (this.position.x - this.radius < 0) {
        this.xDirection = 1;
      }

      if (this.position.y + this.radius > height) {
        this.yDirection = -1;
      }
      if (this.position.y - this.radius < 0) {
        this.yDirection = 1;
      }
    };

    this.collisionDetection = function() {
      for (var index = 0; index < this.quadrant.length; index++) {
        var currentIndex = this.quadrant[index];
        if (currentIndex !== this.index) {
          var radius = this.radius + bubbleArray[currentIndex].radius;
          var distance = Math.sqrt(Math.pow(this.position.x - bubbleArray[currentIndex].position.x, 2) + Math.pow(this.position.y - bubbleArray[currentIndex].position.y, 2), 2);
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
        var distance = Math.sqrt(Math.pow(this.position.x - mouse.position.x, 2) + Math.pow(this.position.y - mouse.position.y, 2), 2);
        if (distance < (radius * 3)) {
          this.speed = (radius * 3.25 - distance) / distance * this.initialSpeed;
        } else {
          this.speed = this.initialSpeed;
        }
      }
    };
  };

  /**
   * Canvas Class
   * @param {Int} id     [ID of element to draw canvas in]
   * @param {Int} width  [Width of canvas]
   * @param {Int} height [Height of canvas]
   */
  var Canvas = function(id, width, height) {
    var that = this;

    if (id === undefined) {
      return;
    }
    if (width === undefined) {
      width = 500;
    }
    if (height === undefined) {
      height = 500;
    }

    this.id = id;
    this.width = width;
    this.height = height;

    containerWidth = width;
    containerHeight = height;

    this.container = document.getElementById(id);

    this.canvasElement = document.createElement("canvas");
    this.canvasElement.setAttribute("width", this.width);
    this.canvasElement.setAttribute("height", this.height);

    this.container.appendChild(this.canvasElement);

    this.canvasContext = this.canvasElement.getContext('2d');

    this.init = function(count) {
      for (var index = 0; index < count; index++) {
        var radius = random(4, 8);
        var center = {
          x: random(0 + radius, this.width - radius),
          y: random(0 + radius, this.height - radius)
        };
        var speed = random(2, 4);
        var angle = random(5, 85);
        var bubble = new Bubble(center, radius, speed, angle);
        bubble.index = index;
        bubble.color = getRandomColor();
        bubbleArray.push(bubble);
      }

      /**
       * New Instance of Mouse
       * @type {Mouse}
       */
      var mouse = new Mouse(75, this.canvasElement);

      var draw = setInterval(function() {

        that.canvasContext.clearRect(0, 0, that.width, that.height);
        for (var index = 0; index < bubbleArray.length; index++) {
          var currentBubble = bubbleArray[index];
          that.canvasContext.beginPath();
          that.canvasContext.arc(currentBubble.position.x, currentBubble.position.y, currentBubble.radius, 0, 2 * Math.PI, false);
          that.canvasContext.fillStyle = currentBubble.color;
          that.canvasContext.fill();
          that.canvasContext.closePath();
          currentBubble.move();
          currentBubble.updateDirection(that.width, that.height);
          currentBubble.collisionDetection();
          currentBubble.antigravity(mouse);
          currentBubble.quadrant = [];
        }
        if (mouse.draw) {
          that.canvasContext.beginPath();
          //that.canvasContext.arc(mouse.position.x, mouse.position.y, mouse.radius, 0, 2 * Math.PI, false);
          that.canvasContext.lineWidth = 2;
          that.canvasContext.strokeStyle = '#003300';
          that.canvasContext.stroke();
          that.canvasContext.closePath();
        }
        /*
        that.canvasContext.beginPath();
        that.canvasContext.lineWidth = 1;
        that.canvasContext.strokeStyle = '#ccc';
        that.canvasContext.moveTo(that.width / 2, 0);
        that.canvasContext.lineTo(that.width / 2, that.height);
        that.canvasContext.stroke();
        that.canvasContext.closePath();

        that.canvasContext.beginPath();
        that.canvasContext.lineWidth = 1;
        that.canvasContext.strokeStyle = '#ccc';
        that.canvasContext.moveTo(0, that.height / 2);
        that.canvasContext.lineTo(that.width, that.height / 2);
        that.canvasContext.stroke();
        that.canvasContext.closePath();
        */
        resetBubbleQuadrant();
      }, 10);
    };
  };

  /**
   * New Instance of Canvas
   * @type {Canvas}
   */
  var canvas = new Canvas("container", 958, 600);
  canvas.init(800);
})();