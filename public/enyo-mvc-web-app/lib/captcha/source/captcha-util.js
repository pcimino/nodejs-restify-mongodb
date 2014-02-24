
var gHeight = 400;
var gWidth = 350;
var gPAD = 10;
var gSeed = "";
var gResult = '';
var gImageObjArr = [];
var gBoxArray = [];
var gBoxOutlineArray = [];
var gLayer;
var gFinishedValues = [];
var gStage = {};
var gCallback = null;
var gColors = ['blue', 'orange', 'darkgreen', 'BlueViolet', 'crimson'];

function buildCaptcha(ctx, canvasId, seedInput, callBack) {
  gSeed = seedInput;
  gCallback = callBack;
  gWidth = ctx.canvas.width;
  gHeight = ctx.canvas.height;
  draw(ctx, canvasId);
}
function draw(ctx, canvasId) {
  gStage = new Kinetic.Stage({
    container: canvasId,
    width: gWidth,
    height: gHeight
  });

  gLayer = new Kinetic.Layer();

  var boxX = getRandX(boxSide);
  var boxY = getRandY(boxSide);
  var boxSide = 0;

  // draw the boxes
  var colorPos = 0;
  for (var i = 0; i < gSeed.length; i++) {
    // next color
    colorPos++;
    if (colorPos >=  gSeed.length) colorPos = 0;

    boxSide = gSeed[i];
    boxX = getRandX(boxSide);
    boxY = getRandY(boxSide);
    var box = new Kinetic.Rect({
      x: boxX
      , y: boxY
      , width: boxSide
      , height: boxSide
      , fill: gColors[colorPos]
      , draggable: true
    });

    // add the shape to the layer
    gBoxArray.push(box);

    // create box
    createBoxOutline(gLayer, box, gColors[colorPos]);

    box.on('dragstart', function() {
        previous_position = {
          x: this.attrs.x,
          y: this.attrs.y
        };
    });

    box.on("dragmove", function(evt) {
      if (isImageInBox(gLayer, this)) {
        this.setDraggable(false);
        if (gFinishedValues.length == gSeed.length) {
          // bubble sort it cause I'm lazy, won't be a big array
          for (var j = 0; j < gFinishedValues.length; j++) {
            for (var i = 1; i < gFinishedValues.length; i++) {
              if (gFinishedValues[i] > gFinishedValues[i-1]) {
                var a = gFinishedValues[i];
                gFinishedValues[i] = gFinishedValues[i-1];
                gFinishedValues[i-1] = a;
              }
            }
          }
          gResult = "";
          for (var i = 0; i < gFinishedValues.length; i++) {
            gResult += "" + gFinishedValues[i];
          }
          if (gCallback) {
            gCallback(gResult);
          }
        }
      }
    });

    gLayer.add(box);

    // add the layer to the stage
    gStage.add(gLayer);
  }

}

function createBoxOutline(layer, box, color) {
    var boxSide = box.getWidth() + gPAD;
    var boxX = getRandX(boxSide);
    var boxY = getRandY(boxSide);
    var rect = new Kinetic.Rect({
      x: boxX
      , y: boxY
      , width: boxSide
      , height: boxSide
      , stroke: color
      , strokeWidth: 6
    });
    gBoxOutlineArray.push(rect);

    // don't allow boxes to overlap
    while (isThisBoxOverlapping(gLayer, rect)) {
      rect.setX(getRandX(boxSide));
      rect.setY(getRandY(boxSide));
    }

    // add the shape to the gLayer
    gLayer.add(rect);
    rect.setZIndex(0);
}
function getRandX(boxSide) {
  return Math.floor((Math.random()*(gWidth - boxSide))+1);
}
function getRandY(boxSide) {
  return Math.floor((Math.random()*(gHeight - boxSide))+1);
}

function isImageInBox(layer, imageObj) {
  // figure out image index
  var index = -1;
  for (var i = 0; i < gBoxArray.length; i++) {
    if (imageObj._id == gBoxArray[i]._id) {
      index = i;
      break;
    }
  }
  if (index >= 0) {
    var x0 = parseInt(imageObj.getX());
    var y0 = parseInt(imageObj.getY());
    var x1 = parseInt(imageObj.getX()) + parseInt(imageObj.getWidth());
    var y1 = parseInt(imageObj.getY()) + parseInt(imageObj.getHeight());

    var x0Outline = parseInt(gBoxOutlineArray[index].getX());
    var y0Outline = parseInt(gBoxOutlineArray[index].getY());
    var x1Outline = parseInt(gBoxOutlineArray[index].getX()) + parseInt(gBoxOutlineArray[index].getWidth());
    var y1Outline = parseInt(gBoxOutlineArray[index].getY()) + parseInt(gBoxOutlineArray[index].getHeight());

    if (x0 >= x0Outline && x1 <= x1Outline && y0 >= y0Outline && y1 <= y1Outline) {
      gBoxOutlineArray[index].setStroke('grey');
      imageObj.setX(x0Outline + (gPAD/2));
      imageObj.setY(y0Outline + (gPAD/2));
      layer.draw();
      gFinishedValues.push(imageObj.getWidth());
      return true;
    }
  }
  return false;
}

function isThisBoxOverlapping(layer, box) {
  var flag = false;
  var children = layer.getChildren();
   for( var j = 0; j < children.length; j++) { //check each other shape
    if (box._id != children[j]._id) {
      flag = flag || isBoxOverlapping(layer, box, children[j]);
    }
  }
  return flag;
}
function isBoxOverlapping(layer, box1, box2) {
  var x0 = parseInt(box1.getX()) + 5;
  var y0 = parseInt(box1.getY()) + 5;
  var x1 = parseInt(box1.getX()) + parseInt(box1.getWidth()) + 5;
  var y1 = parseInt(box1.getY()) + parseInt(box1.getHeight()) + 5;

  var x00 = parseInt(box2.getX()) + 5;
  var y00 = parseInt(box2.getY()) + 5;
  var x11 = parseInt(box2.getX()) + parseInt(box2.getWidth()) + 5;
  var y11 = parseInt(box2.getY()) + parseInt(box2.getHeight()) + 5;

  if ((x0 < x00 && x1 > x00)
    || (x00 < x0 && x11 > x0)
    || (x0 > x00 && x1 < x11)
    || (x00 > x0 && x11 < x1)) {
      // x overlap, look for Y overlap
      if ((y0 < y00 && y1 > y00)
        || (y00 < y0 && y11 > y0)
        || (y0 > y00 && y1 < y11)
        || (y00 > y0 && y11 < y1)) {
          return true;
      }
  }
  return false;
}






