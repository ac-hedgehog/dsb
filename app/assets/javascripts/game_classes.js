function Ship (field, size, direction, head, condition) {

  this.init = function (field, size, direction, head, condition) {
    this.field = field;
    this.size = size || 4;
    this.direction = direction || 'up';
    this.head = head || [0, 0];
    this.segments = this.initSegments(condition);
    
    this.field.ships.push(this);
  }

  this.initSegments = function (condition) {
    var segments = [], segment;
    if (!condition) condition = 'shadow';
    for (var i = 0; i < this.size; i++) {
      switch (this.direction) {
        case 'up':
          segment = {
            position: [this.head[0], (this.head[1] + i) % 10],
            condition: condition
          };
          break
        case 'down':
          segment = {
            position: [this.head[0], (this.head[1] + 10 - i) % 10],
            condition: condition
          };
          break
        case 'left':
          segment = {
            position: [(this.head[0] + i) % 10, this.head[1]],
            condition: condition
          };
          break
        case 'right':
          segment = {
            position: [(this.head[0] + 10 - i) % 10, this.head[1]],
            condition: condition
          };
          break
      }
      segments.push(segment);
    }
    return segments;
  }

  this.draw = function () {
    var ship = this;
    $('#' + this.field.type + '-field').find('tr').each(function (j, row) {
      $(row).find('td').each(function (i, cell) {
        var segment = ship.segments.filter(function (segment) {
          return segment.position[0] == i - 1 && segment.position[1] == j - 1;
        })[0];
        if (segment) {
          if (segment.position[0] == ship.head[0] &&
              segment.position[1] == ship.head[1]) {
            $(cell).attr('class', segment.condition + '-ship-' + ship.direction);
          } else {
            $(cell).attr('class', segment.condition + '-ship');
          }
        }
      });
    });
  }

  this.move = function (dx, dy) {
    this.head = [(this.head[0] + 10 + dx) % 10, (this.head[1] + 10 + dy) % 10];
    this.segments = this.segments.map(function (segment) {
      return {
        position: [(segment.position[0] + 10 + dx) % 10,
                   (segment.position[1] + 10 + dy) % 10],
        condition: segment.condition
      };
    });
    
    this.field.draw();
  }

  this.rotateSegment = function (segment, clockwise) {
    var sign = clockwise ? 1 : -1;
    var x0 = this.head[0], y0 = this.head[1];
    var x1 = segment[0] - x0, y1 = segment[1] - y0;
    var x2 =  x1 * Math.round(Math.cos(Math.PI/2)) -
              sign * y1 * Math.round(Math.sin(Math.PI/2));
    var y2 =  sign * x1 * Math.round(Math.sin(Math.PI/2)) +
              y1 * Math.round(Math.cos(Math.PI/2));
    var x3 = x2 + x0, y3 = y2 + y0;
    return [(x3 + 10) % 10, (y3 + 10) % 10];
  }

  this.changeDirection = function (clockwise) {
    var order = ['up', 'left', 'down', 'right'];
    if (clockwise) { order.reverse(); }
    this.direction = order[(order.indexOf(this.direction) + 4 + 1) % 4];
  }

  this.rotate = function (clockwise) {
    var ship = this;
    this.segments = this.segments.map(function (segment) {
      return {
        position: ship.rotateSegment(segment.position, clockwise),
        condition: segment.condition
      };
    });
    this.changeDirection(clockwise);
    
    this.field.draw();
  }

  this.changeCondition = function (condition) {
    if (!condition) condition = 'normal';
    
    this.segments = this.segments.map(function (segment) {
      return {
        position: segment.position,
        condition: condition
      };
    });
    
    this.field.draw();
  }

  this.directionHash = function (direction) {
    if (direction == 'up') return [0, 1];
    if (direction == 'right') return [1, 0];
    if (direction == 'down') return [0, 1];
    if (direction == 'left') return [1, 0];
  }

  this.getSegmentsBusyZone = function (busyZone) {
    this.segments.forEach(function (segment, i) {
      busyZone.push(segment.position);
    });
    
    return busyZone;
  }

  this.getDirectionBusyZone = function (busyZone, direction) {
    var directionHash = this.directionHash(this.direction);
    var busyCell = [];
    
    if (directionHash.toString() == this.directionHash(direction).toString()) {
      for (var i = 0; i < 10; i++) {
        busyCell = [(this.head[0] + i * directionHash[0]) % 10,
                    (this.head[1] + i * directionHash[1]) % 10];
        busyZone.push(busyCell);
      }
    }
    
    return busyZone;
  }

  this.getAreaBusyZone = function (busyZone, direction) {
    var shiftOptions = {
      "up-right":   [-1, -1],
      "up-left":    [ 1, -1],
      "right-up":   [ 1,  1],
      "right-down": [ 1, -1],
      "down-right": [-1,  1],
      "down-left":  [ 1,  1],
      "left-up":    [-1,  1],
      "left-down":  [-1, -1]
    };
    var directionHash = this.directionHash(this.direction);
    var busyCell = [];
    var shiftOption = shiftOptions[this.direction + "-" + direction];
    
    if (directionHash.toString() != this.directionHash(direction).toString()) {
      this.segments.forEach(function (segment, i) {
        for (var j = 0; j < 10; j++) {
          busyCell = [(segment.position[0] + 10 + j * shiftOption[0]) % 10,
                      (segment.position[1] + 10 + j * shiftOption[1]) % 10];
          busyZone.push(busyCell);
        }
      });
    }
    
    return busyZone;
  }

  this.getBusyZone = function (direction) {
    var busyZone = [];
    
    busyZone = this.getSegmentsBusyZone(busyZone);
    busyZone = this.getDirectionBusyZone(busyZone, direction);
    busyZone = this.getAreaBusyZone(busyZone, direction);
    
    return busyZone;
  }

  this.findFreeZone = function () {
    var currentShip = this;
    var busyZone = [];
    
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        $("td#cell-" + i + "-" + j)[0].dataset.freely = true;
      }
    }
    
    this.field.ships.forEach(function (ship, i) {
      if (ship != currentShip) {
        busyZone = ship.getBusyZone(currentShip.direction);
        busyZone.forEach(function (buzyCell, i) {
          $("td#cell-" + buzyCell.join("-"))[0].dataset.freely = false
        });
      }
    });
  }

  this.inFreelyZone = function () {
    var shipInFreelyZone = true;
    var cell;
    
    this.segments.forEach(function (segment, i) {
      cell = segment.position;
      if ($("td#cell-" + cell[0] + "-" + cell[1])[0].dataset.freely == "false") {
        shipInFreelyZone = false;
      }
    });
    
    return shipInFreelyZone;
  }

  this.step = function () {
    var shiftOptions = {
      "up":     [ 0, -1],
      "right":  [ 1,  0],
      "down":   [ 0,  1],
      "left":   [-1,  0]
    };
    var dx = shiftOptions[this.direction][0], dy = shiftOptions[this.direction][1];
    
    this.head = [(this.head[0] + 10 + dx) % 10, (this.head[1] + 10 + dy) % 10];
    this.segments = this.segments.map(function (segment) {
      return {
        position: [(segment.position[0] + 10 + dx) % 10,
                   (segment.position[1] + 10 + dy) % 10],
        condition: segment.condition
      };
    });
  }

  this.init(field, size, direction, head, condition);

}

function Field (type) {

  this.init = function (type) {
    this.type = type;
    this.ships = [];
  }

  this.drawSea = function () {
    $('#' + this.type + '-field').find('tr').each(function (j, row) {
      $(row).find('td').each(function (i, cell) {
        if ($(cell).attr('class') !== 'border') {
          $(cell).attr('class', 'sea');
        }
      });
    });
  }

  this.draw = function () {
    this.drawSea();
    this.ships.forEach(function (ship, i) {
      ship.draw();
    });
  }

  this.readyToPlay = function () {
    $('#' + this.type + '-field').find('tr').each(function (j, row) {
      $(row).find('td').each(function (i, cell) {
        if ($(cell).attr('class') !== 'border') {
          $(cell)[0].dataset.freely = null;
        }
      });
    });
  }

  this.step = function () {
    this.ships.forEach(function (ship, i) {
      ship.step();
    });
    this.draw();
  }

  this.init(type);

}
