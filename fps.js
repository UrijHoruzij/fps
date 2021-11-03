class FPS {
  constructor() {
    this.width = 150;
    this.height = 80;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.classList.add("fps-monitor");
    this.ctx.font = "bold 24px Arial";
    this.startTime = 0;
    this.frame = 0;
    this.allFPS = [];
    this.hidden = true;
    this.playing = false;
    this.perf = performance || Date;

    this.canvas.style.top = "10px";
    this.canvas.style.right = "10px";
    this.x = 10;
    this.y = 10;
    this.originalX = 10;
    this.originalY = 10;
    this.addDrag();
    document.body.appendChild(this.canvas);
  }

  addDrag() {
    var self = this;
    var diffs = {};
    var dragging = false;

    this.canvas.onmousedown = function (e) {
      diffs.x = window.innerWidth - e.clientX - self.x;
      diffs.y = e.clientY - self.y;
      dragging = true;
      self.playpause();
    };

    document.onmouseup = function () {
      dragging = false;
      self.originalX = self.x;
      self.originalY = self.y;
    };

    document.onmousemove = function (e) {
      if (dragging) {
        self.x = Math.min(
          Math.max(window.innerWidth - e.clientX - diffs.x, 0),
          window.innerWidth - self.width
        );
        self.y = Math.min(
          Math.max(e.clientY - diffs.y, 0),
          window.innerHeight - self.height
        );
        self.move();
        return false;
      }
    };
  }
  move() {
    this.canvas.style.right = this.x + "px";
    this.canvas.style.top = this.y + "px";
  }

  playpause() {
    this.playing = !this.playing;
    if (this.playing) this.loop();
  }
  toggle() {
    this.hidden = !this.hidden;
    if (!this.hidden) {
      this.loop();
      this.canvas.classList.add("is-visible");
    } else {
      this.canvas.classList.remove("is-visible");
    }
  }
  loop() {
    if (this.hidden || !this.playing) return false;
    var self = this;
    window.requestAnimationFrame(function () {
      self.draw();
      self.loop();
    });
  }
  add(x) {
    this.allFPS.unshift(x);
    this.allFPS = this.allFPS.slice(0, this.width);
  }
  draw() {
    var currentFPS = this.getFPS();
    if (this.currentFPS > 57) this.currentFPS = 60;
    this.add(currentFPS);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = "#19FFC8";
    this.ctx.beginPath();
    for (var i = 0; i <= this.width; i++) {
      this.ctx.lineTo(i, 10 + 60 - this.allFPS[i]);
    }
    this.ctx.stroke();
    this.ctx.fillStyle = "#19FFC8";
    this.ctx.fillText(currentFPS + " fps", 20, 50);
  }
  getFPS() {
    this.frame++;
    var d = this.perf.now();
    this.currentTime = (d - this.startTime) / 1000;
    var result = Math.floor(this.frame / this.currentTime);
    if (this.currentTime > 1) {
      this.startTime = this.perf.now();
      this.frame = 0;
    }
    return result;
  }
}

var fps;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "show_fps") {
    if (fps) {
      fps.toggle();
      fps.playpause();
    } else {
      fps = new FPS();
      fps.toggle();
      fps.playpause();
    }
  }
});
