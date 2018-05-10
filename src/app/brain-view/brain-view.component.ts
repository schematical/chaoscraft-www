import { Component, OnInit } from '@angular/core';
import * as _ from 'underscore';
import * as d3 from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Zoom from 'd3-zoom';
import * as d3Force from 'd3-force';
//import * as MinecraftData  from  'minecraft-data' ;
import { ActivatedRoute, Params } from '@angular/router';
import { SocketService } from '../socket.service'
import { HttpClient }  from '../shared/data';
@Component({
  selector: 'app-brain-view',
  templateUrl: './brain-view.component.html',
  styleUrls: ['./brain-view.component.css']
})
export class BrainViewComponent implements OnInit {
  //protected minecraftData:any = null;
  //protected http:HttpClient = null;
  protected selectedNodeJSON:string = null;
  protected svgParent:any;
  protected simulation:d3Force.Simulation;
  private links:any = null;
  private labels:any = null;
  private nodes:any = null;
  private padding:number = 30;
  private x: any;
  private y: any;
  private xScale:any;
  private yScale:any;
  private inputCount:number = null;
  private nodeYHight:number = null;
  private inputNodeYHight:number = null;
  private svg: any;
  private brainData:any = null;
  private currBotUserame:string = null;
  private minecraftData:any = null;
  private nodeAgeTotals:any = {};
  private stats:string = null;
  private page:string = 'brain-view';
  private bot:any = null;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {

    this.http.loadMinecraftData()
      .then((minecraftData)=>{
        this.minecraftData = minecraftData;
      })
      .catch((err)=>{
        console.error("Error Loading MinecraftData:" + err.message);
      })
  }

  ngOnInit() {

    let self = this;

    this.route.paramMap.subscribe((paramMap)=>{
      this.currBotUserame = paramMap.get('bot');
      this.http.loadBrain(this.currBotUserame)
        .then((data: any) => {
          this.brainData = data;
          this.nodeAgeTotals.total = 0;
          Object.keys(this.brainData.indexedNodes).forEach((nodeId)=>{
            let node = this.brainData.indexedNodes[nodeId];
            node.originGen = node.originGen || 0;
            this.nodeAgeTotals[node.originGen] = this.nodeAgeTotals[node.originGen] || 0;
            this.nodeAgeTotals[node.originGen] += 1;
            this.nodeAgeTotals.total += 1;
          })
          this.selectedNodeJSON = JSON.stringify(this.nodeAgeTotals);
          this.startDrawing();
          this.socket.on(SocketService.client_fire_outputnode, (payload)=>{
            if(payload.username !== this.currBotUserame){
              return;
            }
            let lastFireTime = new Date().getTime();
            let nodeData = this.brainData.indexedNodes[payload.payload.node]
            function updateDependants(n){
              n.lastFireTime = lastFireTime;
              n.outputFiredCount = n.outputFiredCount || 0;
              n.outputFiredCount += 1;
              if(!n.dependants){
                return;
              }
              n.dependants.forEach((dep)=>{
                let depNode =  self.brainData.indexedNodes[dep.id]
                updateDependants(depNode);
              });
            }
            updateDependants.apply(this,[nodeData]);


            this.outputFireRankNodes();
            this.simulation.nodes(this.nodes);
            this.updateY();


            console.log("!!!!!!!!!!!");

          })
        })
        .catch((e) => {
          throw e;
        })
    })

  }
  outputFireRankNodes(){
    let sorted = _.sortBy(this.brainData.nodes, (nodeData:any)=>{
      return 0 - (nodeData.lastFireTime || 0);
    })
    sorted.forEach((nodeData, index)=>{
      nodeData.sortedIndex = index;
    })

  }
  updateY(){
    this.inputNodeYHight = ((parseInt(this.svgParent.style('height')) - (this.padding * 2))/this.inputCount);
    this.nodeYHight = ((parseInt(this.svgParent.style('height')) - (this.padding*2))/this.brainData.nodes.length);
    this.simulation.force('Y', d3Force.forceY()
      .y((d) => {
        let y = null;
        switch(d.base_type){
          case('output'):
            y = d.sortedIndex * this.nodeYHight + this.padding;
            //inputYCount += 1
            return y;

          case('input'):
            y = d.inputIndex * this.inputNodeYHight + this.padding;
            //outputYCount += 1
            return y;

          default:
            return y ;
        }
      })
      .strength(function(d) {

        switch(d.base_type){
          case('output'):
            return 1;
          case('input'):
            return 1;
          default:
            return 0 ;
        }
      })
    )
    //.alphaMin(0.5)
    .alpha(1).restart()
  }
  startDrawing() {


    this.outputFireRankNodes();
    //this.xScale = d3Scale.linear().range([0, 720]),
    //this.yScale = d3Scale.linear().range([0, 720]),
    this.svgParent = d3.select("svg");
    if(!this.svgParent){
      throw new Error("Missing `this.svGParent`");
    }
    this.svg = this.svgParent.append("svg:g");
    /*this.svgParent.attr('height', () => {
      return this.brainData.nodes.length * 20 + 100;
    })*/


    var zoom = d3Zoom.zoom()
      //.scaleExtent([1, 10])
      .on("zoom", (e)=>{ this.zoomed(e) })
    this.svg.call(zoom);



   this.inputCount = 0;
    Object.keys(this.brainData.indexedNodes).forEach((nodeId)=>{
      if(this.brainData.indexedNodes[nodeId].base_type == 'input'){
        this.brainData.indexedNodes[nodeId].inputIndex = this.inputCount;
        this.inputCount += 1;
      }
    })


    this.simulation = d3Force.forceSimulation()
      .force("link", d3Force.forceLink().id(function(d) { return d.id; }))
      .force("collide", d3Force.forceCollide().radius((d)=> { return this.nodeYHight * 2; }).iterations(2))
      //.force("charge", d3Force.forceManyBody().strength(-50))
      //.force("center", d3Force.forceCenter(this.width / 2, this.height / 2))
      //.alphaDecay(0.05)
      .force('x', d3Force.forceX()
        .x((d)=> {

          switch(d.base_type){
            case('output'):
              return parseInt(this.svgParent.style("width"));
            case('input'):
              return 0;
            default:
              return null ;
          }
        })
        .strength(function(d) {

          switch(d.base_type){
            case('output'):
              return 1;
            case('input'):
              return 1;
            default:
              return 0 ;
          }
        })
      )

    this.updateY();


    let force = this.simulation
      .nodes(this.brainData.nodes)


    this.simulation.force("link")
      .links(this.brainData.links);

    this.drawLink();
    this.drawNode();
    force.on("tick", ()=>{ this.ticked(); });

    //this.drawLabels();


  }
  ticked() {

    this.links
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .classed('hightlighted_link', function(d){
        if(!d.source.lastFireTime ){
          return false;
        }
        return (new Date().getTime() - d.source.lastFireTime < 1000);
      })
      .classed('link', function(d){
        if(!d.source.lastFireTime ){
          return true;
        }
        return !(new Date().getTime() - d.source.lastFireTime < 1000);
      })

    this.nodes
      .each(function(d){
        d3.select(d.node).attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .classed('firing_node', function(d){
          if(!d.lastFireTime ){
            return
          }

          return (new Date().getTime() - d.lastFireTime < 1000);
        })
      })
    /*this.svg.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })*/



  }
  drawLink() {

    this.links = this.svg
      .selectAll("line")
      .data(this.brainData.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .classed('hightlighted_link', function(d){
        if(!d.source.node){
          return false;
        }
        return d.source.node.classed('selected_node');
      })
      /*.style("stroke-width", function(d) {
        return 1;//d.value;
      })
      .style("stroke", '#888');*/
    this.links.exit().remove();
  }

  drawNode() {


    this.nodes = this.svg
      .selectAll("g.node")
      .data(this.brainData.nodes)
      .enter();

    let nodeEnter = this.nodes
      .append("g")
      .attr("class", "node")

      .each(function(d) { d.node = this; })
      .on("mouseover", (d)=>{

        let nodeData = this.brainData.indexedNodes[d.id];
        let jsonData = _.clone(nodeData);
        delete(jsonData.dependancies);
        delete(jsonData.node)
        delete(jsonData.x);
        delete(jsonData.y);
        delete(jsonData.vx);
        delete(jsonData.vy);
        if(jsonData.target){
          switch(jsonData.target.type){
            case('block'):
              jsonData.target.blockNames = [];
              jsonData.target.block.forEach((blockId)=> {
                jsonData.target.blockNames.push(this.minecraftData.blocks[blockId].displayName);
              });
            break;
            case('item'):
              jsonData.target.itemNames = [];
              jsonData.target.item.forEach((itemId)=> {
                jsonData.target.itemNames.push(this.minecraftData.items[itemId].displayName);
              });

              break;
            case('entity'):
              jsonData.target.entityNames = [];
              jsonData.target.entityType.forEach((entityId)=> {
                jsonData.target.entityNames.push(this.minecraftData.mobs[entityId].displayName);
              });
              break;
            default:
              console.error("Not sure how to translate `jsonData.target.type`:" + jsonData.target.type);
          }
        }
        this.selectedNodeJSON = JSON.stringify(jsonData, null, 3);
        let self = this;
        function updateDependants(d){
          d3.select(d.node).classed('selected_node', true);
          if(!d.dependants){
            return;
          }
          d.dependants.forEach((dep)=>{
            let depNode = self.brainData.indexedNodes[dep.id]
            updateDependants(depNode);
          });
        }
        updateDependants.apply(this,[nodeData]);


      })
      .on("mouseout", (d)=>{
        let nodeData = this.brainData.indexedNodes[d.id]
        let self = this;
        function updateDependants(d){
          d3.select(d.node).classed('selected_node', false);
          if(!d.dependants){
            return;
          }
          d.dependants.forEach((dep)=>{
            let depNode =  self.brainData.indexedNodes[dep.id]
            updateDependants(depNode);
          });
        }
        updateDependants.apply(this,[nodeData]);
      })



    nodeEnter.append('svg:circle')
      .attr("class", "node_circle")
      .attr('r', (d) => {
        return this.nodeYHight / 2;
      })
      .each(function(d){
        let className = null;
        switch(d.base_type){
          case('output'):
            className = "output_node";
            break;
          case('input'):
            className = "input_node";
            break;
          case('middle'):
            className = "middle_node";
            break;
        }
        d3.select(d.node).select('circle').classed(className, true);
      })


    //nodeEnter.merge(this.nodes)
    nodeEnter.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("class","textClass")
      .attr("id", function(d) { return "Node_"+d.id;})
      .attr("fill", "black")
      .attr("stroke-width",(d)=>{ return this.nodeYHight/10 })
      .attr("font-size", function(d){return this.nodeYHight * 6})
      .attr("text-align", "center")
      .attr("dy", function(d){return 30})
      .text(function(d) { return d.type; });


    var drag = d3Drag.drag()
      .on("start", (e)=>{ this.dragstarted(e); })
      .on("drag",  (e)=>{ this.dragged(e); })
      .on("end", (e)=>{  this.dragended(e); });
    drag(this.svg);

    this.nodes.exit()
    //.transition()
      .remove();
  }


  dragstarted(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;

  }

  dragged(d) {
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;

  }

  dragended(d) {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }
  zoomed(d){
    this.svg.attr("transform", d3.event.transform)
  }


}
