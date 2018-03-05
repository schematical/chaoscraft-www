import { Component, OnInit } from '@angular/core';

import * as io from 'socket.io-client';
import * as d3 from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Force from 'd3-force';
import { ActivatedRoute, Params } from '@angular/router';

import { HttpClient }  from '../shared/data';
@Component({
  selector: 'app-brain-view',
  templateUrl: './brain-view.component.html',
  styleUrls: ['./brain-view.component.css']
})
export class BrainViewComponent implements OnInit {

  //protected http:HttpClient = null;
  protected socket:SocketIOClient.Socket = null;
  protected simulation:d3Force.Simulation;
  private links:any = null;
  private labels:any = null;
  private nodes:any = null;
  private width: number = 900;
  private height: number = 500;
  private x: any;
  private y: any;
  private xScale:any;
  private yScale:any;
  private svg: any;
  private brainData:any = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {


  }

  ngOnInit() {


    this.socket = io('http://localhost:3000');
    console.log("Setting Up Socket");

    console.log("CONNECTED");
    this.socket.on('www_hello_response', (message) => {
      console.log('www_hello_response', message)
    })
    this.socket.on('client_fire_outputnode', (payload)=>{
      console.log("OutputNodeFired:", payload);
    })
    this.socket.emit('www_hello', {foo: 'bar'});
    this.route.paramMap.subscribe((paramMap)=>{
      this.http.loadBrain(paramMap.get('bot'))
        .then((data: any) => {
          this.brainData = data;
          this.startDrawing();
        })
        .catch((e) => {
          throw e;
        })
    })

  }
  startDrawing(){


    //this.xScale = d3Scale.linear().range([0, 720]),
    //this.yScale = d3Scale.linear().range([0, 720]),
    this.svg = d3.select("svg")
      .append("svg:g");

    let _self = this;
    let inputYCount = 0;
    let outputYCount = 0;
    this.simulation = d3Force.forceSimulation()
      .force("link", d3Force.forceLink().id(function(d) { return d.id; }))
      .force("collide", d3Force.forceCollide().radius(function(d) { return 30; }).iterations(2))
      //.force("charge", d3Force.forceManyBody())
      //.force("center", d3Force.forceCenter(this.width / 2, this.height / 2))

      .force('x', d3Force.forceX()
        .x(function(d) {

          switch(d.base_type){
            case('output'):
              return _self.width;
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
      .force('y', d3Force.forceY()
        .y(function(d) {
          let y = null;
          switch(d.base_type){
            case('output'):
              y = inputYCount * 20;
              inputYCount += 1
              return y;

            case('input'):
              y = outputYCount * 20;
              outputYCount += 1
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
      .attr("y2", function(d) { return d.target.y; });

    this.nodes
      .each(function(d){
        d3.select(d.node).attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
      })



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
      .style("stroke-width", function(d) {
        return 1;//d.value;
      })
      .style("stroke", '#888');
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
      /*.attr("transform", function(d) {
       return "translate(" + d.x + "," + d.y + ")";
       })*/
      .each(function(d) { d.node = this; })
      .on("mouseover", function(d){
        d3.select(d.node).classed('selected_node', true);
      })
      .on("mouseout", function(d){
        d3.select(d.node).classed('selected_node', false);
      })



    nodeEnter.append('svg:circle')
      .attr("class", "node_circle")
      .attr('r', function(d) {
        return 10;
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
      .attr("font-size", function(d){return d.r * 6})
      .attr("text-align", "center")
      .attr("dy", function(d){return 30})
      .text(function(d) { return d.type; });

    this.nodes.exit()
    //.transition()
      .remove();
  }

  /* drawLabels() {


   this.labels = this.svg
   .selectAll("text")
   .data(this.brainData.nodes)
   .enter()
   .append("text")
   .attr('cx', function(d) {
   return d.x;
   })
   .attr('cy', function(d) {
   return d.y + 10;
   })
   .text(function(d) { return d.id; });

   this.labels.exit()
   .remove();
   }*/


  dragstarted() {
    if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }
  dragsubject() {
    return this.simulation.find(d3.event.x, d3.event.y);
  }
  dragended() {
    if (!d3.event.active) this.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }


}
