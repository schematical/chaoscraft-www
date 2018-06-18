import { Injectable } from '@angular/core';
import * as _ from 'underscore';
@Injectable()
export class MinecraftMapService {
  static eleCanvas:any;
  static Needs:any = {};
  static Actions:any = {};
  static Map:MCWorldMap;
  static Chars:any = {};
  static Settings:any = {
    tile_width:32,
    viewport_width:14,
    viewport_height:10,
    viewport_depth:5,
    draw_debug:false
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
  static InitMap(map:MCWorldMap){
    MinecraftMapService.Map = map;
    //MinecraftMapService.Map = new funMap();
    MinecraftMapService.Map.Init();
  };
  static InitImage(strUrl){
    var imageObj = MinecraftMapService.Images[strUrl];

    if(!MinecraftMapService.Images[strUrl]){

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


        // get context to work with
        var srcContext = MinecraftMapService.eleCanvas;//.getContext("2d");

        // draw the loaded image on the source canvas

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

    MinecraftMapService.Objects[strId] = objObject;
    for(var i in objObject.Animations){
      for(var ii in objObject.Animations[i].Frames){
        var objFrame = objObject.Animations[i].Frames[ii];
        objObject.Animations[i].Frames[ii].imageObj = MinecraftMapService.InitImage(objFrame.img);
      }
    }

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
    if(!MinecraftMapService.Map.Tiles[y]){
      MinecraftMapService.Map.Tiles[y] = {};
    }
    if(!MinecraftMapService.Map.Tiles[y][z]){
      MinecraftMapService.Map.Tiles[y][z] = {};
    }
    if(!MinecraftMapService.Map.Tiles[y][z][x]){
      return MinecraftMapService.AddTile(x,y,z, MinecraftMapService.Tiles.Air);
    }
    return MinecraftMapService.Map.Tiles[y][z][x];
  }
  static AddTile(x,y,z, funTile){
    if(!MinecraftMapService.Map.Tiles[y]){
      MinecraftMapService.Map.Tiles[y] = {};
    }
    if(!MinecraftMapService.Map.Tiles[y][z]){
      MinecraftMapService.Map.Tiles[y][z] = {};
    }

    var objTile = new funTile();
    objTile.Id = 'tile_' + x + '_' + y + '_' + z;
    objTile.x = x;
    objTile.y = y;
    objTile.z = z;
    MinecraftMapService.Map.Tiles[y][z][x] = objTile;
    for(var i in objTile.Animations){
      for(var ii in objTile.Animations[i].Frames){
        var objFrame = objTile.Animations[i].Frames[ii];
        objTile.Animations[i].Frames[ii].imageObj = MinecraftMapService.InitImage(objFrame.img);
      }
    }
    return objTile;
  }
  static RemoveTile(objTile){
    delete MinecraftMapService.Map.Tiles[objTile.y][objTile.z][objTile.x];
  }
  static MoveObject(objObject, newX, newY, newZ){

    if(<any>typeof(newX) === 'TileBase'){
      var newX = newX.x;
      var newY = newX.y;
      var newZ = newX.z;
    }
    //Remove from old tile
    if(objObject.Tile){
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
      5000
    );
    MinecraftMapService.Cycle();
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
    c.width = window.innerWidth;//window.screen.width;
    c.height = window.innerHeight;//window.screen.height;

    MinecraftMapService.eleCanvas = c.getContext('2d');
    MinecraftMapService.Focus.offsetX = window.innerWidth/2;
    MinecraftMapService.Focus.offsetY = window.innerHeight/2;
    console.log("SCREEN SIZE:", window.screen.width, window.screen.height, ' - Offset:', MinecraftMapService.Focus.offsetX , MinecraftMapService.Focus.offsetY)
  }
  static Cycle() {

    MinecraftMapService.Render();
    /*for (var i in MinecraftMapService.SpecialActions) {
      MinecraftMapService.SpecialActions[i].count_down -= 1;
      if (MinecraftMapService.SpecialActions[i].count_down == 0) {

        MinecraftMapService.SpecialActions[i].count_down = MinecraftMapService.SpecialActions[i].cycle_time;
        MinecraftMapService.SpecialActions[i].action.Exicute();
      }
    }

    //console.log(MinecraftMapService.Players);
    for (let strId in MinecraftMapService.Objects) {
      var objObject = MinecraftMapService.Objects[strId];
      objObject.Move();
      if (objObject.Action) {
        if (_.isObject(objObject.Action)) {
          objObject.Action.Exicute();
        } else {
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

      objObject.vY = objObject.vY - (objObject.vY * objObject.Tile.Below().friction * objObject.friction);
      //objObject.vZ = objObject.vZ - (objObject.vZ*objObject.Tile.friction); //No friction for z
      objObject.vX = objObject.vX + objObject.Tile.gX;
      objObject.vY = objObject.vY + objObject.Tile.gY;
      objObject.vZ = objObject.vZ + objObject.Tile.gZ;
      //console.log(objObject.Id + ': ' + objObject.vY + '_' + objObject.y + '/' + newY);

      var blnMoveX = (Math.floor(origX) != Math.floor(newX));
      var blnMoveY = (Math.floor(origY) != Math.floor(newY));
      var blnMoveZ = (Math.floor(origZ) != Math.floor(newZ));


      if (
        (blnMoveZ)
      ) {

        if (
          (Math.floor(newZ) < 0) ||
          (Math.floor(newZ) >= MinecraftMapService.Map.depth)
        ) {

          blnMoveZ = false;
        } else {
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if (objTile.solid) {

            blnMoveZ = false;
          }

        }
        if (!blnMoveZ) {
          objObject.vZ = 0;
          newZ = origZ;
        }
      }

      if (blnMoveY) {
        if (
          (Math.floor(newY) < 0) ||
          (Math.floor(newY) >= MinecraftMapService.Map.height)
        ) {
          blnMoveY = false;
        } else {
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if (objTile.solid) {
            blnMoveY = false;
          }
        }
        if (!blnMoveY) {
          objObject.ContactTile(objTile);
          objObject.vY = 0;
          newY = origY;
        }
      }

      if (blnMoveX) {
        if (
          (Math.floor(newX) < 0) ||
          (Math.floor(newX) >= MinecraftMapService.Map.width)
        ) {
          blnMoveX = false
        } else {
          var objTile = MinecraftMapService.GetTile(
            newX,
            newY,
            newZ
          );
          if (objTile.solid) {

            blnMoveX = false;
          }
        }
        if (!blnMoveX) {
          objObject.ContactTile(objTile);
          newX = origX;
          objObject.vX = 0;
        }
      }

      objObject.x = newX;
      objObject.y = newY;
      objObject.z = newZ;
      if (blnMoveX || blnMoveY || blnMoveZ) {
        MinecraftMapService.MoveObject(
          objObject,
          objObject.x,
          objObject.y,
          objObject.z
        );
      }
      //Contact
      var arrObjects = objObject.TouchingObjects();
      for (let i = 0; i < arrObjects.length; i++) {

        if (objObject.Id != arrObjects[i].Id) {
          //console.log('Touching: '+ objObject.Id + '!=' + arrObjects[i].Id);
          objObject.ContactObject(arrObjects[i]);
        }
      }


    }*/
  }
  static Render(){
    for (var i in MinecraftMapService.Images) {
      if (!MinecraftMapService.Images[i].oLoaded) {
        console.error("Images not loaded:");
        return;
      }
    }
    //-------------_RENDER_------------------------//
    MinecraftMapService.eleCanvas.clearRect(
      0,
      0,
      window.innerHeight,//window.screen.width,//MinecraftMapService.eleCanvas.width,
      window.innerWidth,//window.screen.height// MinecraftMapService.eleCanvas.height
    );
    //Update screens focus before draw
    if(MinecraftMapService.Focus.objObject){
      MinecraftMapService.Focus.x = MinecraftMapService.Focus.objObject.x;
      MinecraftMapService.Focus.y = MinecraftMapService.Focus.objObject.y;
      MinecraftMapService.Focus.z = MinecraftMapService.Focus.objObject.z;
    }

    var yStart = Math.floor(MinecraftMapService.Focus.y - MinecraftMapService.Settings.viewport_depth);
    if(yStart < MinecraftMapService.Map.worldData.y.min){
      yStart = MinecraftMapService.Map.worldData.y.min;
    }
    var yEnd = Math.floor(MinecraftMapService.Focus.y + MinecraftMapService.Settings.viewport_depth);

    if(yEnd > MinecraftMapService.Map.worldData.y.max){
      //MinecraftMapService.Map.Tiles[z] = {};

      yEnd = MinecraftMapService.Map.worldData.y.max;
    }


    for(var y = yStart; y < yEnd; y ++){
      var zStart = Math.floor(MinecraftMapService.Focus.z - MinecraftMapService.Settings.viewport_height);
      if(zStart < MinecraftMapService.Map.worldData.z.min){
        zStart = MinecraftMapService.Map.worldData.z.min;
      }
      var zEnd = Math.floor(MinecraftMapService.Focus.z + MinecraftMapService.Settings.viewport_height);
      if(!MinecraftMapService.Map.Tiles[y]){
        MinecraftMapService.Map.Tiles[y] = {};
      }
      if(zEnd > MinecraftMapService.Map.worldData.z.max){
        zEnd = MinecraftMapService.Map.worldData.z.max;
      }
      let yy =  Math.round(MinecraftMapService.Map.worldData.position.y);
      if(y == yy){
        console.log("HIT");
      }
      for(var z = zStart; z < zEnd; z ++){
        //for(y in MinecraftMapService.Map.Tiles[z]){
        var xStart = Math.floor(MinecraftMapService.Focus.x - MinecraftMapService.Settings.viewport_width);
        if(xStart < MinecraftMapService.Map.worldData.x.min){
          xStart = MinecraftMapService.Map.worldData.x.min;
        }
        var xEnd = Math.floor(MinecraftMapService.Focus.x + MinecraftMapService.Settings.viewport_width);
        if(!MinecraftMapService.Map.Tiles[y][z]){
          MinecraftMapService.Map.Tiles[y][z] = {};
        }
        if(
          (xEnd > MinecraftMapService.Map.worldData.x.max)
        ){
          xEnd = MinecraftMapService.Map.worldData.x.max;
        }
        for(var x = xStart; x < xEnd; x ++){

          //Render

          //Only draw tiles that exists(performance)
          if(
            (MinecraftMapService.Map.Tiles[y]) &&
            (MinecraftMapService.Map.Tiles[y][z]) &&
            (MinecraftMapService.Map.Tiles[y][z][x]) &&
            (MinecraftMapService.Map.Tiles[y][z][x].Draw)
          ){
            var objAbove = MinecraftMapService.Map.Tiles[y][z][x].Above().Above();
            if(
              (y == yEnd - 1) ||
              (!objAbove.visible) ||
              (
                (!MinecraftMapService.Map.Tiles[y][z][x].Front().visible) ||
                (!MinecraftMapService.Map.Tiles[y][z][x].Above().Front().visible) ||
                (!MinecraftMapService.Map.Tiles[y][z][x].Right().visible)
              )
            ){
              MinecraftMapService.Map.Tiles[y][z][x].Draw(MinecraftMapService.eleCanvas);
              for(let strId in MinecraftMapService.Map.Tiles[y][z][x].Objects){
                //console.log("Drawing: " + strId);
                MinecraftMapService.Map.Tiles[y][z][x].Objects[strId].Draw(MinecraftMapService.eleCanvas);
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
      objHoldObject: null,
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
    if(!this.visible/* && !MinecraftMapService.Settings.draw_debug*/) {
      return;
    }

    var intOrigAlpha = MinecraftMapService.eleCanvas.globalAlpha;
    var objFrame = this.Animations[this.state].Frames[this.frame];

    if (!objFrame.imageObj.oLoaded) {
      console.error("Not Loaded yet :(");
    }
    var intSpecialOffset = 5;
    var drawX = this.x - MinecraftMapService.Focus.x;
    var drawZ = this.z - MinecraftMapService.Focus.z - intSpecialOffset;

    var intYDiff = this.y - MinecraftMapService.Focus.y;

   /* var drawWidth_affectY = ((.05 * ( this.y + intYDiff) / 2) + 1) * MinecraftMapService.Settings.tile_width;//((.1 * MinecraftMapService.Focus.z) + 1)  * MinecraftMapService.Settings.tile_width;
    var drawWidth = MinecraftMapService.Settings.tile_width;//drawWidth_affectY;

    this.top = (drawZ * MinecraftMapService.Settings.tile_width + MinecraftMapService.Focus.offsetY);
    this.left = (drawX * MinecraftMapService.Settings.tile_width + MinecraftMapService.Focus.offsetX);

    this.right = this.left + MinecraftMapService.Settings.tile_width;
    this.bottom = this.top + MinecraftMapService.Settings.tile_width;*/

     //This is the real / old way of doing it

      var drawWidth_affectY = ((.05 * ( this.y + intYDiff) / 2) + 1) * MinecraftMapService.Settings.tile_width;//((.1 * MinecraftMapService.Focus.z) + 1)  * MinecraftMapService.Settings.tile_width;
      var drawWidth = drawWidth_affectY;
     this.top = ((drawZ  * drawWidth_affectY) + MinecraftMapService.Focus.offsetY + (intSpecialOffset * MinecraftMapService.Settings.tile_width));
     this.left = (drawX  * drawWidth) + MinecraftMapService.Focus.offsetX;
     this.right = this.left + drawWidth;
     this.bottom = this.top + drawWidth;

   /* if (this.Animations[this.state].flip) {
      c.scale(-1, 1);
      this.left = (-1 * this.left) - drawWidth;
    }*/
    var intYDiff = this.y - MinecraftMapService.Focus.y;
    /*if (
      (this.Id != MinecraftMapService.Focus.objObject.Id) &&
      (Math.abs(this.x - MinecraftMapService.Focus.x) < (intYDiff / 4 + 1)) &&
      ((this.z - MinecraftMapService.Focus.z) > (intYDiff / -4 + 1)) &&
      (intYDiff >= 0)
    ) {
      MinecraftMapService.eleCanvas.globalAlpha = .3;
    }*/
    if(this.visible){
      c.drawImage(
        objFrame.imageObj,
        objFrame.x,
        objFrame.y,

        objFrame.width,
        objFrame.height,
        this.left,
        this.top,
        drawWidth,
        drawWidth
      );
      /*if (this.Animations[this.state].flip) {
        c.scale(-1, 1);
      }*/
      //TODO: Put back in shade
       this.PreDrawShade(objFrame, c, drawWidth, intYDiff);

       MinecraftMapService.DrawShade(
       this.left,
       this.top,
       drawWidth,
       drawWidth,
       (Math.abs(intYDiff)/10) * MinecraftMapService.eleCanvas.globalAlpha
       );

      this.frame += 1;
      if (this.frame >= this.Animations[this.state].Frames.length) {
        this.AnimateEnd(this.state, this.next_state);
        this.frame = 0;
        this.state = this.next_state;
        this.next_state = 'default';
      }

      if (
        (this.Action) &&
        (this.Action.objHoldObject)
      ) {
        //console.log("Drawing:" + this.Action.objHoldObject.Id);
        this.Action.objHoldObject.Draw(c);
      }
      MinecraftMapService.eleCanvas.globalAlpha = intOrigAlpha;
    }
    /*if(
      this.right < 0 ||
      this.left > MinecraftMapService.eleCanvas.width ||
      this.bottom < 0 ||
      this.top > MinecraftMapService.eleCanvas.height
    ){
      return;
    }*/
    if(MinecraftMapService.Settings.draw_debug) {
      //console.log("DEBUG:");
      c.beginPath();
      c.strokeStyle="#FF0000";
      c.moveTo(this.right, this.top);
      c.lineTo(this.left, this.top);
      c.lineTo(this.left, this.bottom);
      c.lineTo(this.right, this.bottom);
      c.lineTo(this.right, this.top);

      c.stroke();
      c.fillStyle = "white";
      c.fillText(
        this.x + ',' + this.y + ',' + this.z,
        this.left + 5,
        (this.top + 10),
      );
      c.fillText(
        this.constructor.name,
        this.left+ 5,
        (this.top + 20),
      );
      c.fillText(
        this.left + ',' + this.top,
        this.left+ 5,
        (this.top + 30),
      );
    }
  }
  TouchingObjects(){
    var arrReturn = [];
    for(let strKey in this.Tile.Objects){
      if(strKey != this.Id){
        arrReturn[arrReturn.length] = this.Tile.Objects[strKey];
      }
    }
    return arrReturn;
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
  PreDrawShade(objFrame, c, drawWidth, intYDiff){

    if(this.y > MinecraftMapService.Focus.y){
      var objBelow = this.Below();
      if(objBelow.top){
        //console.log("New Height: " +objBelow.Id + ':'+ (objBelow.top - this.bottom));
        var intNewHeight =  objBelow.bottom - this.bottom;
        if(intNewHeight > 0){
          if(this.Animations['side']){
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
            (Math.abs(intYDiff)/10 +.2) * MinecraftMapService.eleCanvas.globalAlpha
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
      this.y -1,
      this.z
    );
  }
  Above(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y +1,
      this.z
    );
  }
  Front(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y ,
      this.z+1
    );
  }
  Behind(){
    return MinecraftMapService.GetTile(
      this.x,
      this.y ,
      this.z-1
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
  public Tiles = {};
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
          }else{
            let objTile = MinecraftMapService.AddTile(
              x,
              y,
              z,
              MinecraftMapService.Tiles.Lava
            );
            console.log("Missing: ", x,y,z, ' - Type: ' + (block && block.type || block));
          }
        }
      }
    }
    var objPlayer = MinecraftMapService.AddPlayer(
      'owen',
      MinecraftMapService.Chars.Player
    );
    MinecraftMapService.Focus.objObject = objPlayer;
    this.AddObject(
      objPlayer,
      parseFloat(this.worldData.position.x),
      parseFloat(this.worldData.position.y),
      parseFloat(this.worldData.position.z)
    );
  }
}




class MCPlayer extends MCObjectBase{
  public Animations = {
    'default':{
      "Frames":[
        {
          "name":"",
          "img":"/assets/imgs/entities-28.png",
          "width":"32",
          "height":"32",
          "x":"64",
          "y":"0",
          "offsetWidth":"32",
          "offsetHeight":"32"
        }
      ]
    }
  };
}
MinecraftMapService.Chars.Player = MCPlayer;


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
          "x": "192",
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
          "x": "192",
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




class LavaTile extends MCTile {
  public Animations = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": "208",
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
          "x": "208",
          "y": "240",
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Lava = LavaTile;
MinecraftMapService.Tiles['10'] = LavaTile;
MinecraftMapService.Tiles['11'] = LavaTile;


class SandTile extends MCTile {
  public Animations:any = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": 5 * 16,
          "y": 2 * 16,
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
          "x": 5 * 16,
          "y": 2 * 16,
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Sand = SandTile;
MinecraftMapService.Tiles['12'] = SandTile;


class GravelTile extends MCTile {
  public Animations:any = {
    'default': {
      "Frames": [
        {
          "name": "Grass",
          "img": "/assets/imgs/blocks-1.png",
          "height": "16",
          "width": "16",
          "x": 16 * 16,
          "y": 1 * 16,
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
          "x": 16 * 16,
          "y": 1 * 16,
          "offsetWidth": "16",
          "offsetHeight": "16",
          "offsetYSpace": "0"
        }
      ]
    }
  }
}

MinecraftMapService.Tiles.Gravel = GravelTile;
MinecraftMapService.Tiles['13'] = GravelTile;

