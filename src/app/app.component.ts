import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Drag from 'd3-drag';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Force from 'd3-force';

import { Nodes } from './shared/data';

@Component({
  styleUrls:['app.component.css'],
  selector: 'app-root',
  template: `    
    <svg width="900" height="500"></svg>
    <!--<canvas width="900" height="500" ></canvas>-->
  `
})
export class AppComponent implements OnInit {
  simulation:d3Force.Simulation;
  private links:any = null;
  private nodes:any = null;
  private width: number = 900;
  private height: number = 500;
  private x: any;
  private y: any;
  private svg: any;

  constructor() {

  }

  ngOnInit() {

    this.svg = d3.select("svg")
      .append("svg:g");

    let _self = this;
    this.simulation = d3Force.forceSimulation()
      .force("link", d3Force.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3Force.forceManyBody())
      .force("center", d3Force.forceCenter(this.width / 2, this.height / 2))
      /*.force('x', d3Force.forceX().x(function(d) {
        //console.log('ddddd',d);
        switch(d.base_type){
          case('output'):
            return _self.width;

          case('input'):
            return 0;
          default:
            return _self.width / 2;
        }
      }))*/




    this.simulation
      .nodes(Nodes.nodes)
      .on("tick", ()=>{ this.ticked(); });


    this.simulation.force("link")
      .links(Nodes.links);

    this.drawLink();
    this.drawNode();


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
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });

  }
  drawLink() {

    this.links = this.svg
      .selectAll("line")
      .data(Nodes.links)
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
      .style("stroke", '#000');
    this.links.exit().remove();
  }

  drawNode() {


    this.nodes = this.svg
      .selectAll("circle")
      .data(Nodes.nodes)
      .enter()
      .append('circle')
      .attr('r', function(d) {
        return 10;
      })
      .style('fill', function(d) {
        switch(d.base_type){
          case('output'):
            return "#a00";
          case('input'):
            return "#0a0";
          case('middle'):
            return "#999";
        }
      })
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })
      /*.append("text")
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y + 10;
      })
      .text(function(d) { return d.id; });*/

    this.nodes.exit()
      .remove();
  }

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
