import { Injectable } from '@angular/core';
import * as _ from 'underscore';
@Injectable()
export class MinecraftMapService {
  static eleCanvas:any;
  static Needs:any = {};
  static Actions:any = {};
  static Map:any = {};
  static Chars:any = {};
  static Settings:any = {
    tile_width:64,
    viewport_width:14,
    viewport_height:10,
    viewport_depth:100
  };
  static Focus:any = {
    x:0,
    y:0,
    z:0,
    objObject: null
  };
  static SpecialActions:any = {};
  static Images:any = { };
  static Tiles:any = {};
  static Objects:any = {};
  static Levels:any = {};
  static CreateLevel(width, height, depth){
    for(var z = 1; z <= depth; z++){
      MinecraftMapService.Map.Tiles[z] = [];
      for(var y = 1; y <= height; y++){
        MinecraftMapService.Map.Tiles[z][y] = [];
        /*for(var x = 1; x <= width; x++){
         MinecraftMapService.Map.Tiles[z][y][x] = {};
         }*/
      }
    }
  }
  static InitMap(map:MCMapBase){
    MinecraftMapService.Map = map;
    //MinecraftMapService.Map = new funMap();
    MinecraftMapService.Map.Init();
  };
  static InitImage(strUrl){
    var imageObj = MinecraftMapService.Images[strUrl];

    if(typeof(MinecraftMapService.Images[strUrl]) == 'undefined'){

      imageObj = new Image();
      imageObj.src = strUrl;
      imageObj.oLoaded = false;

      imageObj.onload = function(){
        this.oLoaded = true;

        var transparentColor = {
          r:156,
          g:156,
          b:156
        };

        var img = this;
        // create a source canvas. This is our pixel source
        var srcCanvas = MinecraftMapService.eleCanvas;
        srcCanvas.width = img.width;
        srcCanvas.height = img.height;

        // create a destination canvas. Here the altered image will be placed
        var dstCanvas = document.createElement("canvas");
        dstCanvas.width = img.width;
        dstCanvas.height = img.height;

        // append the canvas elements to the container
        //document.getElementById('container').appendChild(srcCanvas);
        //document.getElementById('container').appendChild(dstCanvas);

        // get context to work with
        var srcContext = MinecraftMapService.eleCanvas;//.getContext("2d");
        //var dstContext = dstCanvas.getContext("2d");

        // draw the loaded image on the source canvas
        //srcContext.drawImage(img, 0, 0);

        // read pixels from source
        var pixels = srcContext.getImageData(0, 0, img.width, img.height);

        // iterate through pixel data (1 pixels consists of 4 ints in the array)
        for(var i = 0, len = pixels.data.length; i < len; i += 4){
          var r = pixels.data[i];
          var g = pixels.data[i+1];
          var b = pixels.data[i+2];

          // if the pixel matches our transparent color, set alpha to 0
          if(r == transparentColor.r && g == transparentColor.g && b == transparentColor.b){
            pixels.data[i+3] = 0;
          }
        }

        // write pixel data to destination context
        this._pixels = pixels;
        srcContext.putImageData(pixels,0,0);
        //this.url = 'data:image/gif;base64:'+ pixels;
      }
      MinecraftMapService.Images[strUrl] = imageObj;
    }

    return imageObj;
  }
  static AddPlayer(strId, funPlayer){
    var objPlayer = new funPlayer();
    objPlayer.Id = strId;

    //console.log(objPlayer.Animations['default']);
    MinecraftMapService.AddObject(strId, objPlayer);
    return objPlayer;
  }
  static AddObject(strId, objObject){
    //objObject.imageObj = MinecraftMapService.InitImage(objObject.img);
    MinecraftMapService.Objects[strId] = objObject;
    for(var i in objObject.Animations){
      for(var ii in objObject.Animations[i].Frames){
        var objFrame = objObject.Animations[i].Frames[ii];
        objObject.Animations[i].Frames[ii].imageObj = MinecraftMapService.InitImage(objFrame.img);
      }
    }

  }
  static AddSpecialAction(strKey, objAction, intCycles){
    MinecraftMapService.SpecialActions[strKey] = {
      cycle_time:intCycles,
      action:objAction,
      count_down:intCycles
    };
  }
  static DeleteObject(objObject){
    if(typeof(objObject) == 'string'){
      var objObject = MinecraftMapService.Objects[objObject];
    }
    objObject.Tile.RemoveObject(objObject);
    //Get its Id and remove it
    delete MinecraftMapService.Objects[objObject.Id];
  }
  static GetTile(x,y,z){
    z = Math.floor(z);
    y = Math.floor(y);
    x = Math.floor(x);
    if(typeof MinecraftMapService.Map.Tiles[z] == 'undefined'){
      MinecraftMapService.Map.Tiles[z] = [];
    }
    if(typeof MinecraftMapService.Map.Tiles[z][y] == 'undefined'){
      MinecraftMapService.Map.Tiles[z][y] = [];
    }
    if(typeof MinecraftMapService.Map.Tiles[z][y][x] == 'undefined'){
      return MinecraftMapService.AddTile(x,y,z, MinecraftMapService.Tiles.Air);
    }
    return MinecraftMapService.Map.Tiles[z][y][x];
  }
  static AddTile(x,y,z, funTile){
    if(typeof MinecraftMapService.Map.Tiles[z] == 'undefined'){
      MinecraftMapService.Map.Tiles[z] = [];
    }
    if(typeof MinecraftMapService.Map.Tiles[z][y] == 'undefined'){
      MinecraftMapService.Map.Tiles[z][y] = [];
    }

    var objTile = new funTile();
    //objTile.imageObj = MinecraftMapService.InitImage(objTile.img);
    objTile.Id = 'tile_' + x + '_' + y + '_' + z;
    objTile.x = x;
    objTile.y = y;
    objTile.z = z;
    MinecraftMapService.Map.Tiles[z][y][x] = objTile;
    for(var i in objTile.Animations){
      for(var ii in objTile.Animations[i].Frames){
        var objFrame = objTile.Animations[i].Frames[ii];
        objTile.Animations[i].Frames[ii].imageObj = MinecraftMapService.InitImage(objFrame.img);
      }
    }
    return objTile;
  }
  static RemoveTile(objTile){
    delete MinecraftMapService.Map.Tiles[objTile.z][objTile.y][objTile.x];
  }
  static MoveObject(objObject, newX, newY, newZ){

    if(<any>typeof(newX) === 'TileBase'){
      var newX = newX.x;
      var newY = newX.y;
      var newZ = newX.z;
    }
    //Remove from old tile
    if(typeof(objObject.Tile) != 'undefined'){
      objObject.Tile.RemoveObject(objObject);
    }
    var objTitle = MinecraftMapService.GetTile(
      objObject.x,
      objObject.y,
      objObject.z
    );

    /*objObject.x = newX;
     objObject.y = newY;
     objObject.z = newZ;*/

    objObject.Tile = objTitle;
    objObject.Tile.Objects[objObject.Id] = objObject;

  }
  static Start(){
    MinecraftMapService.ResizeScreen();
    /*$('body').on('keydown',
      function(objEvent){
        if(!objEvent.ctrlKey){
          objEvent.preventDefault();
        }
        if(typeof(MinecraftMapService.Focus.objObject) != 'undefined'){
          MinecraftMapService.Focus.objObject.key = objEvent.keyCode;
        }
        //objEvent.preventDefault()

      }
    );*/


    //MinecraftMapService.InitMap(MinecraftMapService.Levels.City);


    setInterval(
    ()=>{
      MinecraftMapService.Cycle();
    },
      '100'
    );
  }
  static DrawShade(x,y,width,height, alpha){
    MinecraftMapService.eleCanvas.beginPath();
    var intOrigAlpha = MinecraftMapService.eleCanvas.globalAlpha;
    MinecraftMapService.eleCanvas.globalAlpha   = alpha;

    MinecraftMapService.eleCanvas.rect(
      x,
      y,
      width,
      height,
      alpha
    );

    MinecraftMapService.eleCanvas.fillStyle = 'black';
    MinecraftMapService.eleCanvas.fill();
    MinecraftMapService.eleCanvas.globalAlpha   = intOrigAlpha;
  }
  static ResizeScreen(){
    let c:any = document.getElementById("myCanvas");
    c.width = window.screen.width;
    c.height = window.screen.height;
    MinecraftMapService.eleCanvas = c.getContext('2d');
    MinecraftMapService.Focus.offsetX = c.width/2;
    MinecraftMapService.Focus.offsetY = c.height/2;
  }
  static Cycle(){

    for(var i in MinecraftMapService.Images){
      if(!MinecraftMapService.Images[i].oLoaded){
        return;
      }
    }
    for(var i in MinecraftMapService.SpecialActions){
      MinecraftMapService.SpecialActions[i].count_down -= 1;
      if(MinecraftMapService.SpecialActions[i].count_down == 0){

        MinecraftMapService.SpecialActions[i].count_down = MinecraftMapService.SpecialActions[i].cycle_time;
        MinecraftMapService.SpecialActions[i].action.Exicute();
      }
    }

    MinecraftMapService.eleCanvas.clearRect(0, 0, MinecraftMapService.eleCanvas.width, MinecraftMapService.eleCanvas.height);
    //console.log(MinecraftMapService.Players);
    for(let strId in MinecraftMapService.Objects){
      var objObject = MinecraftMapService.Objects[strId];
      objObject.Move();
      if(typeof(objObject.Action) != 'undefined'){
        if(typeof(objObject.Action) == 'object'){
          objObject.Action.Exicute();
        }else{
          objObject.Action();
        }
      }
      //Apply Physics
      var origY = objObject.y;
      var origX = objObject.x;
      var origZ = objObject.z;
      var newY = objObject.y + objObject.vY;
      var newX = objObject.x + objObject.vX;
      var newZ = objObject.z + objObject.vZ;

      objObject.vX = objObject.vX - (objObject.vX * objObject.Tile.Below().friction * objObject.friction);

      objObject.vY = objObject.vY - (objObject.vY*objObject.Tile.Below().friction * objObject.friction);
      //objObject.vZ = objObject.vZ - (objObject.vZ*objObject.Tile.friction); //No friction for z
      objObject.vX = objObject.vX + objObject.Tile.gX;
      objObject.vY = objObject.vY + objObject.Tile.gY;
      objObject.vZ = objObject.vZ + objObject.Tile.gZ;
      //console.log(objObject.Id + ': ' + objObject.vY + '_' + objObject.y + '/' + newY);

      var blnMoveX = (Math.floor(origX) != Math.floor(newX));
      var blnMoveY = (Math.floor(origY) != Math.floor(newY));
      var blnMoveZ = (Math.floor(origZ) != Math.floor(newZ));


      if(
        (blnMoveZ)
      ){

        if(
          (Math.floor(newZ) < 0) ||
          (Math.floor(newZ) >= MinecraftMapService.Map.depth)
        ){

          blnMoveZ = false;
        }else{
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if(objTile.solid){

            blnMoveZ = false;
          }

        }
        if(!blnMoveZ){
          objObject.vZ = 0;
          newZ = origZ;
        }
      }

      if(blnMoveY){
        if(
          (Math.floor(newY) < 0) ||
          (Math.floor(newY) >= MinecraftMapService.Map.height)
        ){
          blnMoveY = false;
        }else{
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if(objTile.solid){
            blnMoveY = false;
          }
        }
        if(!blnMoveY){
          objObject.ContactTile(objTile);
          objObject.vY = 0;
          newY = origY;
        }
      }

      if(blnMoveX){
        if(
          (Math.floor(newX) < 0) ||
          (Math.floor(newX) >= MinecraftMapService.Map.width)
        ){
          blnMoveX = false
        }else{
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if(objTile.solid){

            blnMoveX = false;
          }
        }
        if(!blnMoveX){
          objObject.ContactTile(objTile);
          newX = origX;
          objObject.vX = 0;
        }
      }

      objObject.x = newX;
      objObject.y = newY;
      objObject.z = newZ;
      if(blnMoveX || blnMoveY || blnMoveZ){
        MinecraftMapService.MoveObject(
          objObject,
          objObject.x,
          objObject.y,
          objObject.z
        );
      }
      //Contact
      var arrObjects = objObject.TouchingObjects();
      for(let i =0; i < arrObjects.length; i++){

        if(objObject.Id != arrObjects[i].Id){
          //console.log('Touching: '+ objObject.Id + '!=' + arrObjects[i].Id);
          objObject.ContactObject(arrObjects[i]);
        }
      }



    }




    //-------------_RENDER_------------------------//

    //Update screens focus before draw
    if(typeof(MinecraftMapService.Focus.objObject) != 'undefined'){
      MinecraftMapService.Focus.x = MinecraftMapService.Focus.objObject.x;
      MinecraftMapService.Focus.y = MinecraftMapService.Focus.objObject.y;
      MinecraftMapService.Focus.z = MinecraftMapService.Focus.objObject.z;
    }
    //console.log(MinecraftMapService.Focus.z);


    //for(z in MinecraftMapService.Map.Tiles){
    var zStart = Math.floor(MinecraftMapService.Focus.z - MinecraftMapService.Settings.viewport_depth);
    if(zStart < 0){
      zStart = 0;
    }
    var zEnd = Math.floor(MinecraftMapService.Focus.z + MinecraftMapService.Settings.viewport_depth);

    if(zEnd > MinecraftMapService.Map.Tiles.length){
      //MinecraftMapService.Map.Tiles[z] = [];
      zEnd = MinecraftMapService.Map.Tiles.length;
    }
    for(var z = zStart; z < zEnd; z ++){
      var yStart = Math.floor(MinecraftMapService.Focus.y - MinecraftMapService.Settings.viewport_height);
      if(yStart < 0){
        yStart = 0;
      }
      var yEnd = Math.floor(MinecraftMapService.Focus.y + MinecraftMapService.Settings.viewport_height);
      if(typeof(MinecraftMapService.Map.Tiles[z]) == 'undefined'){
        MinecraftMapService.Map.Tiles[z] = [];
      }
      if(yEnd > MinecraftMapService.Map.Tiles[z].length){
        yEnd = MinecraftMapService.Map.Tiles[z].length;
      }
      for(var y = yStart; y < yEnd; y ++){
        //for(y in MinecraftMapService.Map.Tiles[z]){
        var xStart = Math.floor(MinecraftMapService.Focus.x - MinecraftMapService.Settings.viewport_width);
        if(xStart < 0){
          xStart = 0;
        }
        var xEnd = Math.floor(MinecraftMapService.Focus.x + MinecraftMapService.Settings.viewport_width);
        if(typeof(MinecraftMapService.Map.Tiles[z][y]) == 'undefined'){
          MinecraftMapService.Map.Tiles[z][y] = [];
        }
        if(
          (xEnd > MinecraftMapService.Map.Tiles[z][y].length)
        ){
          xEnd = MinecraftMapService.Map.Tiles[z][y].length;
        }
        for(var x = xStart; x < xEnd; x ++){

          //Render

          //Only draw tiles that exists(performance)
          if(
            (typeof(MinecraftMapService.Map.Tiles[z]) != 'undefined') &&
            (typeof(MinecraftMapService.Map.Tiles[z][y]) != 'undefined') &&
            (typeof(MinecraftMapService.Map.Tiles[z][y][x]) != 'undefined') &&
            (typeof(MinecraftMapService.Map.Tiles[z][y][x].Draw) != 'undefined')
          ){
            var objAbove = MinecraftMapService.Map.Tiles[z][y][x].Above().Above();
            if(
              (!objAbove.visible) ||
              (
                (!MinecraftMapService.Map.Tiles[z][y][x].Front().visible) ||
                (!MinecraftMapService.Map.Tiles[z][y][x].Above().Front().visible) ||
                (!MinecraftMapService.Map.Tiles[z][y][x].Right().visible)
              )
            ){
              MinecraftMapService.Map.Tiles[z][y][x].Draw(MinecraftMapService.eleCanvas);
              for(let strId in MinecraftMapService.Map.Tiles[z][y][x].Objects){
                //console.log("Drawing: " + strId);
                MinecraftMapService.Map.Tiles[z][y][x].Objects[strId].Draw(MinecraftMapService.eleCanvas);
              }
            }else{
              objAbove.top = undefined;
            }
          }
        }
      }
    }



  }
};


export class MCObjectBase {
  public Animations = {};
  public facing = 'u';
  public state = 'default';
  public next_state = 'default';
  public force_animation = false;
  public frame = 0;
  public friction = 1;
  public solid = false;
  public Id:string = null;
  public Tile:MCTile = null;

  public rot =0;
  public x =0;
  public y =0;
  public z =0;

  public speed = 10;
  public health = 100;

  public vX = 0;
  public vY = 0;
  public vZ = 0;
  public width = 200;
  public height = 137;
  public visible = true;
  public Inv = {};
  public inv_cap = 10;
  public age = 0;

  public left = 0;
  public right;
  public bottom;
  public top;
  public get Action():any {
    return {
      objHoldObject: {},
      Exicute: function () {
      }
    }
  }



  AnimateEnd(strState, strNextState){

  }
  ChangeTransparent(){

  };
  Age(){

  }
  PreDrawShade(objFrame, c, drawWidth, intZDiff){

  }


  Draw(c){
    if(!this.visible){
      return;
    }
    var intOrigAlpha = MinecraftMapService.eleCanvas.globalAlpha;
    var objFrame = this.Animations[this.state].Frames[this.frame];

    if(!objFrame.imageObj.oLoaded){
      console.error("Not Loaded yet :(");
    }
    var intSpecialOffset = 5;
    var drawX = this.x - MinecraftMapService.Focus.x;
    var drawY = this.y -MinecraftMapService.Focus.y - intSpecialOffset;
    var intZDiff = this.z - MinecraftMapService.Focus.z;

    var drawWidth_affectZ = ((.05 *( this.z+ intZDiff)/2) + 1)  * MinecraftMapService.Settings.tile_width;//((.1 * MinecraftMapService.Focus.z) + 1)  * MinecraftMapService.Settings.tile_width;
    var drawWidth = drawWidth_affectZ;//MinecraftMapService.Settings.tile_width;

    this.top = ((drawY  * drawWidth_affectZ) + MinecraftMapService.Focus.offsetY + (intSpecialOffset * MinecraftMapService.Settings.tile_width));
    this.left = (drawX  * drawWidth) + MinecraftMapService.Focus.offsetX;
    this.right = this.left + drawWidth;
    this.bottom = this.top + drawWidth


    if(typeof(this.Animations[this.state].flip) != 'undefined'){
      c.scale(-1, 1);
      this.left = (-1 * this.left) - drawWidth;
    }
    var intZDif = this.z - MinecraftMapService.Focus.z;
    if(
      (this.Id != MinecraftMapService.Focus.objObject.Id) &&
      (Math.abs(this.x - MinecraftMapService.Focus.x) < (intZDif/4 + 1)) &&
      ((this.y - MinecraftMapService.Focus.y) > (intZDif/-4 + 1)) &&
      (intZDif >= 0)
    ){
      MinecraftMapService.eleCanvas.globalAlpha = .3;
    }
    c.drawImage(
      objFrame.imageObj,
      objFrame.x,//this.x,
      objFrame.y,

      objFrame.width,
      objFrame.height,
      this.left,//(drawX  * drawWidth) + MinecraftMapService.Focus.offsetX,
      this.top,//(drawY  * drawWidth) + MinecraftMapService.Focus.offsetY,
      drawWidth,
      drawWidth
    );
    if(typeof(this.Animations[this.state].flip) != 'undefined'){
      c.scale(-1, 1);
    }
    this.PreDrawShade(objFrame, c, drawWidth, intZDiff);

    MinecraftMapService.DrawShade(
      this.left,
      this.top,
      drawWidth,
      drawWidth,
      (Math.abs(intZDiff)/10) * MinecraftMapService.eleCanvas.globalAlpha
    );
    if(typeof(this.Action) != 'undefined'){
      c.fillText(
        'Xxxx',
        //this.Action.type,
        this.top + 200,
        this.left
      );
    }
    this.frame += 1;
    if(this.frame >= this.Animations[this.state].Frames.length ){
      this.AnimateEnd(this.state, this.next_state);
      this.frame = 0;
      this.state = this.next_state;
      this.next_state = 'default';
    }

    if(
      (typeof(this.Action) != 'undefined') &&
      (typeof(this.Action.objHoldObject) != 'undefined')
    ){
      //console.log("Drawing:" + this.Action.objHoldObject.Id);
      this.Action.objHoldObject.Draw(c);
    }
    MinecraftMapService.eleCanvas.globalAlpha = intOrigAlpha;
    /*
     c.save();
     c.translate((this.x + objFrame.width/2), (this.y - objFrame.height));
     c.rotate( this.rot );
     c.drawImage(
     objFrame.imageObj,
     0,//this.x,
     0,//this.y + 300,
     objFrame.width,
     objFrame.height
     );
     c.translate( -1 * (this.x  + objFrame.width/2), -1 * (this.y - objFrame.height ));
     //ctx.drawImage( myImageOrCanvas, 0, 0 );
     c.restore();*/

  }
  Cycle(){

  }
  Move(){

    this.Cycle();
    /*if(this.key == -1){
      this.ChangeState('default');
      /!*this.vX = 0;
       this.vY = 0;
       this.vZ = 0;*!/
    }
    if(this.key == 65){
      //for(var i = 0; i < 20; i++){
      this.Function2();
    }
    if(this.key == 83){
      //for(var i = 0; i < 20; i++){
      this.Function1();
    }
    if(this.key == 68){
      this.Fire();
    }
    if(this.key == 87){
      this.Menu();
    }
    if(this.key == 40){

      this.Down();

    }
    if(this.key == 38){

      this.Up()
    }
    if(this.key == 37){

      this.Left();
    }
    if(this.key == 39){

      this.Right();
    }
    if(this.key == 32){
      //this.vZ =  this.speed/2;
      this.Space();


    }

    if(this.key == 67){
      this.vZ =  this.speed/-2;
    }
    if(typeof(this.key) != 'undefined' && this.key != -1){
      //alert(this.key);
    }
    this.key = -1;
   */
  }

  ChangeState(strState, blnForce?){
    if(typeof(this.Animations[strState]) != 'undefined'){
      if(this.state == strState){
        return;
      }
      if(blnForce == 'undefined'){
        blnForce = false;
      }
      if(this.force_animation){
        //Delay
        this.next_state = strState;
      }else{
        this.frame = 0;
        this.state = strState;
        this.next_state = 'default';
        this.force_animation = blnForce;
      }
    }
  }
  ContactTile(objTile){

  }
  ContactObject(objObject){

  }
  Down(){
    this.facing = 'd';
    this.ChangeState('f_walk');
    this.vY = this.speed;
  }
  Up(){
    this.facing = 'u';
    this.ChangeState('b_walk');
    this.vY = -1 * this.speed;
  }
  Right(){
    this.facing = 'r';
    this.ChangeState('r_walk');
    this.vX = 1 * this.speed;
  }
  Left(){
    this.facing = 'l';
    this.ChangeState('l_walk');
    this.vX = -1 * this.speed;
  }





  /*Space(){
    if(
      this.Tile.Below().solid
    ){
      this.vZ =  this.speed*2;
    }
    if(
      (typeof(this.Action) != 'undefined') &&
      (typeof(this.Action.objHoldObject) != 'undefined')
    ){
      //console.log("Drawing:" + this.Action.objHoldObject.Id);
      this.Throw(this.Action.objHoldObject, this.Action, this.Action);
    }else{
      //Trigger Push
      var arrObjects = this.TouchingObjects();
      for(var i =0; i < arrObjects.length; i++){
        if(arrObjects[i].loot){
          this.Hold(arrObjects[i], this.Action, this.Action);
        }else{
          this.Push(arrObjects[i], this.Action);
        }
        /!*if(this.Id != arrObjects[i].Id){

         }*!/
      }
    }

  }*/

  Survive(){

  }
}
export class MCTile extends MCObjectBase{

  public Objects = {};
  public type = 'OTile';
  public solid = true;
  public friction = 1;
  public gX = 0;
  public gY = 0;
  public gZ = -.1;

  public Animations = {
    'default': {
      Frames: [
        {
          "name": "",
          "img": "/assets/imgs/blocks-1.png",
          "height": "100",
          "width": "100",
          "x": "64",
          "y": "64",
          "offsetWidth": "32",
          "offsetHeight": "32"
        }, {
          "name": "",
          "img": "/assets/imgs/blocks-1.png",
          "height": "100",
          "width": "100",
          "x": "64",
          "y": "96",
          "offsetWidth": "32",
          "offsetHeight": "32"
        }, {
          "name": "",
          "img": "/assets/imgs/blocks-1.png",
          "height": "100",
          "width": "100",
          "x": "96",
          "y": "96",
          "offsetWidth": "32",
          "offsetHeight": "32"
        }
      ]
    }
  };
  constructor() {
    super();
  }
  PreDrawShade(objFrame, c, drawWidth, intZDiff){

    if(this.z > 0){
      var objBelow = this.Below();
      if(typeof(objBelow.top) != 'undefined'){
        //console.log("New Height: " +objBelow.Id + ':'+ (objBelow.top - this.bottom));
        var intNewHeight =  objBelow.bottom - this.bottom;
        if(intNewHeight > 0){
          if(typeof(this.Animations['side']) != 'undefined'){
            objFrame = this.Animations['side'].Frames[this.frame];
          }
          c.drawImage(
            objFrame.imageObj,
            objFrame.x,//193,
            objFrame.y,//223,

            objFrame.width,
            objFrame.height,
            this.left,
            this.bottom,
            drawWidth,
            Math.abs(intNewHeight)

          );
          MinecraftMapService.DrawShade(
            this.left,
            this.bottom,
            drawWidth,
            Math.abs(intNewHeight),
            (Math.abs(intZDiff)/10 +.2) * MinecraftMapService.eleCanvas.globalAlpha
          );

        }
      }
    }

  }
  RemoveObject(objObject){
    if(typeof(objObject) == 'string'){
      var objObject = MinecraftMapService.Objects[objObject];
    }
    //Get its Id and remove it
    delete this.Objects[objObject.Id];
  }
  Below(){

    return MinecraftMapService.GetTile(
      this.x,
      this.y,
      this.z -1
    );
  }
  Above(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y,
      this.z +1
    );
  }
  Front(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y +1,
      this.z
    );
  }
  Behind(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y -1,
      this.z
    );
  }
  Right(){
    return MinecraftMapService.GetTile(
      this.x +1,
      this.y,
      this.z
    );
  }
  Left(){
    return MinecraftMapService.GetTile(
      this.x -1,
      this.y,
      this.z
    );
  }
  NextTo (){
    var objReturn = {
      'l':this.Left(),
      'r':this.Right(),
      'u':this.Behind(),
      'd':this.Front()
    };
    return objReturn;
  }
  Around(){
    var objReturn = this.NextTo();
    objReturn['t'] = this.Above();
    objReturn['b'] = this.Below();
    return objReturn;
  }
  Destroy(){
    MinecraftMapService.RemoveTile(this);
  }
  Replace(objTile){
    MinecraftMapService.RemoveTile(this);
    MinecraftMapService.AddTile(this.x, this.y, this.z, objTile);
  }


}


class MCMapBase{
  public Tiles = [];
  public width = 20;
  public height = 20;
  public depth = 20;
  constructor(){

  }
  Init(){

  }

  AddObject(objObject, x,y,z){
    objObject.x = x;
    objObject.y = y;
    objObject.z = z;
    MinecraftMapService.MoveObject(
      objObject,
      objObject.x,
      objObject.y,
      objObject.z
    );
  };
}
export class MCWorldMap extends MCMapBase{
  public worldData:any;
  constructor(worldData:any){
    super();
    this.worldData = worldData;
  }
  Init(){
    for(let x =  this.worldData.x.min; x <= this.worldData.x.max; x++){
      for(let y =  this.worldData.y.min; y <= this.worldData.y.max; y++){
        for(let z =  this.worldData.z.min; z <= this.worldData.z.max; z++){
          let block = this.worldData.world[x][y][z];
          if(block && MinecraftMapService.Tiles[block.type]){
            let objTile = MinecraftMapService.AddTile(
              x,
              y,
              z,
              MinecraftMapService.Tiles[block.type]
            );
            //objTile._rZ = rZ;
          }
        }
      }
    }

  }
}

class AirTile extends MCTile {
 public visible = false;
 public solid = false;
 public friction = .1;
}
MinecraftMapService.Tiles.Air = AirTile;
MinecraftMapService.Tiles[0] = AirTile;

class StoneTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "0",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "0",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Stone = StoneTile;
MinecraftMapService.Tiles[1] = StoneTile;
MinecraftMapService.Tiles['1:1'] = StoneTile;
MinecraftMapService.Tiles['1:2'] = StoneTile;
MinecraftMapService.Tiles['1:3'] = StoneTile;
MinecraftMapService.Tiles['1:4'] = StoneTile;
MinecraftMapService.Tiles['1:5'] = StoneTile;
MinecraftMapService.Tiles['1:6'] = StoneTile;

class GrassTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "16",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "32",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Grass = GrassTile;
MinecraftMapService.Tiles[2] = GrassTile;



class DirtTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "48",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "48",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Dirt = DirtTile;
MinecraftMapService.Tiles['3'] = DirtTile;
MinecraftMapService.Tiles['3.1'] = DirtTile;
MinecraftMapService.Tiles['3.2'] = DirtTile;




class CobblestoneTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "64",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "64",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Cobblestone = CobblestoneTile;
MinecraftMapService.Tiles['4'] = DirtTile;




class WoodPlankTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "80",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "80",
          "y": "0",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.WoodPlank = WoodPlankTile;
MinecraftMapService.Tiles['5'] = WoodPlankTile;
MinecraftMapService.Tiles['5:1'] = WoodPlankTile;
MinecraftMapService.Tiles['5:2'] = WoodPlankTile;
MinecraftMapService.Tiles['5:3'] = WoodPlankTile;
MinecraftMapService.Tiles['5:4'] = WoodPlankTile;
MinecraftMapService.Tiles['5:5'] = WoodPlankTile;


class WaterTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "186",
          "y": "240",
          "offsetWidth": "16",
          "offsetHeight": "16"
        }
      ]
    },
    'side': {
      "Frames": [
        {
          "name": "default",
          "img": "/assets/imgs/blocks-1.png",
          "width": "16",
          "height": "16",
          "x": "186",
          "y": "240",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Water = WaterTile;
MinecraftMapService.Tiles['8'] = WaterTile;
MinecraftMapService.Tiles['9'] = WaterTile;
