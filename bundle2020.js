(function (topojson,d3) {
  'use strict';
  // referebce: https://www.youtube.com/watch?v=aNbgrqRuoiE
  // https://www.youtube.com/watch?v=OoZ0LWD9KUs
  // https://www.youtube.com/watch?v=urfyp-r255A
  const loadAndProcessData = () => 
    Promise
      .all([
   
        d3.tsv('data_2020.tsv'),
        d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
        
      ])
      .then(([tsvData, topoJSONdata]) => {
        const rowById = tsvData.reduce((accumulator, d) => {
          //accumulator[d.iso_n3] = d;

          accumulator[d.ISON] = d;
          return accumulator;
        }, {});

        const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);

        countries.features.forEach(d => {
          Object.assign(d.properties, rowById[d.id]);
        });

        return countries;
      });

  const colorLegend = (selection, props) => {
    const {                      
      colorScale,                
      circleRadius,
      spacing,                   
      textOffset,
      backgroundRectWidth        
    } = props;                   
    
    const backgroundRect = selection.selectAll('rect')
      .data([null]);             
    const n = colorScale.domain().length; 
    backgroundRect.enter().append('rect')
      .merge(backgroundRect)
        .attr('x', -circleRadius * 2)   
        .attr('y', -circleRadius * 2)   
        .attr('rx', circleRadius * 2)   
        .attr('width', backgroundRectWidth)
        .attr('height', spacing * n + circleRadius * 2) 
        .attr('fill', 'white')
        .attr('opacity', 0.8);
    

    const groups = selection.selectAll('.tick')
      .data(colorScale.domain());
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'tick');
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) =>    
          `translate(0, ${i * spacing})`  
        );
    groups.exit().remove();
    
    groupsEnter.append('circle')
      .merge(groups.select('circle')) 
        .attr('r', circleRadius)
        .attr('fill', colorScale);      
    
    groupsEnter.append('text')
      .merge(groups.select('text'))   
        .text(d => d)
        .attr('dy', '0.32em')
        .attr('x', textOffset);
  };
  const margin = { top: 80, right: 40, bottom: 80, left: 40};
  const width = 1000 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;



  const svg = d3.select('#svg1')
                //.append("div")
                //.classed("svg-container", true) 
                //.attr("preserveAspectRatio", "xMinYMin meet")
                //.attr("viewBox", "0 0 " + width + " " + height)
                //.classed("svg-content-responsive", true)
                .attr('width',width)
                .attr('height',height)
                .classed("rect", true)
                .attr("width", width)
                .attr("height", height);

  const projection = d3.geoMercator();//.translate([width/2,height/1.4]);
  const pathGenerator = d3.geoPath().projection(projection);

  const g = svg.append('g');

  const colorLegendG = svg.append('g')
      .attr('transform', `translate(40,310)`);



  


  //g.append("svg:title").text("World Income Group Map in " );

  svg.call(d3.zoom().on('zoom', () => {
    g.attr('transform', d3.event.transform);
  }));

  const colorScale = d3.scaleOrdinal();

  // const colorValue = d => d.properties.income_grp;
  //const colorValue = d => d.properties.economy;
  const colorValue = d => d.properties.Value;
  loadAndProcessData().then(countries => {
    
    colorScale
      .domain(countries.features.map(colorValue))
      .domain(colorScale.domain().sort().reverse())
      .range(d3.schemeSpectral[colorScale.domain().length]);
    
    colorLegendG.call(colorLegend, {
      colorScale,
      circleRadius: 8,
      spacing: 20,
      textOffset: 12,
      backgroundRectWidth: 235
    });
    
    g.selectAll('path').data(countries.features)
      .enter().append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr('fill', d => colorScale(colorValue(d)))
      .append('title')
        //.text(d => d.properties.name + ': ' + colorValue(d));
        .text(d => d.properties.Country_Name + ': ' + colorValue(d) + " in region " + d.properties.Region );
    
    
  });

 
  svg.append("text")
      .attr('class', 'title')
      .attr('x', width / 2)
      .attr('y', (margin.top/2))
      .attr('text-anchor', 'middle')
      .style("font-size", "30px") 
      .text("CPIA gender equality rating (1=low to 6=high) in 2020");



  //bart chart on income group
  // reference: https://www.educative.io/answers/how-to-create-a-bar-chart-using-d3
  var dataset1 = [30, 142, 33, 31, 5, 3];
  const margin2 = 200;
  const width2 = 500 - margin2;
  const height2 = 400 - margin2;
 
  const groups = ["undefined", "1", "2", "3", "4", "5"];

  const svg2 = d3.select('#svg2')
                //.append("div")
                //.classed("svg-container", true) 
                //.attr("preserveAspectRatio", "xMinYMin meet")
                //.attr("viewBox", "0 0 " + width + " " + height)
                //.classed("svg-content-responsive", true)




  var xScale = d3.scaleBand().range([0, width2]).padding(0.5),
      yScale = d3.scaleLinear().range([height2, 0]);

  var g1 = svg2.append("g")
      .attr("transform", "translate(" + 100 + "," + 100 + ")");
  
  xScale.domain(dataset1);
  yScale.domain([0, 250]);

  g1.append("g")
  .attr("transform", "translate(0," + height2 + ")")
  
  .call(d3.axisBottom(xScale).tickFormat(function(d, i){
    return "N(" +groups[i] + "): " +d;
  }))
  .selectAll("text")  
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", ".15em")
  .attr("transform", "rotate(-15)");
  
  g1.append("g")
    .call(d3.axisLeft(yScale).tickFormat(function(d){
        return d;
  }).ticks(4));

  g1.selectAll(".bar")
    .data(dataset1)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d); })
    .attr("y", function(d) { return yScale(d); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return height2 - yScale(d); });

  svg2.append("text")
    .attr('x', width2 - margin2/4)
    .attr('y', margin2/3)
    .attr('text-anchor', 'middle')
    .style("font-size", "16px") 
    .text("Numbers of countries for each CPIA gender equality rate in 2020");

  // pie chart
  var svg3 = d3.select("#svg3"),
      width3 = svg3.attr("width"),
      height3 = svg3.attr("height"),

      radius = 200;
      
  var data1 = [{name: "undefined", share: 12.3}, 
      {name: "1", share: 58.2},
      {name: "2", share: 2.05},
      {name: "3", share: 12.7},
      {name: "4", share: 13.52},
      {name: "5", share: 1.23}];

  var g3 = svg3.append("g")
      .attr("transform", "translate(" + width3 / 2 + "," + height3 / 2 + ")");
  
  var ordScale = d3.scaleOrdinal()
      .domain(data1)
      .range(['#ffd354','#94ebdd','#fbaccc','#d3e0aa','#fa8f72']);

  var pie = d3.pie().value(function(d) { 
        return d.share; 
  });

  var arc = g3.selectAll("arc")
                   .data(pie(data1))
                   .enter();
  var path = d3.arc()
                .outerRadius(radius)
                .innerRadius(0);
                
  arc.append("path")
                .attr("d", path)
                .attr("fill", function(d) { return ordScale(d.data.name); });
  

  var label = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

  arc.append("text")
      .attr("transform", function(d) { 
               return "translate(" + label.centroid(d) + ")"; 
       })
      .text(function(d) { return d.data.name + " " + d.data.share + "%"; })
      .style("font-family", "arial")
      .style("font-size", 12);
  
  svg3.append("text")
      .attr('x', width3/2 )
      .attr('y', 200/3)
      .attr('text-anchor', 'middle')
      .style("font-size", "16px") 
      .text("Ratio of each CPIA gender equality rate in 2020");
  


  // anotation
  const type = d3.annotationLabel;

  const annotations = [{
    note: {
      label: "Gender equality assesses the extent to which the country has installed institutions and programs to enforce laws and policies that promote equal access for men and women in education, health, the economy, and protection under law.",
      title: "CPIA Gender Equality Rating "
    },
    //can use x, y directly instead of data
    x: 50,
    y: 100,
    dy: 10,
    dx: 10
  }];


  const annotations1 = [{
    note: {
      label: "In 2020, the figures represent a general decline on overall CPIA gender equality rate compared with 2015.",
      title: "Summary"
    },
    //can use x, y directly instead of data
    x: 25,
    y: 100,
    dy: 10,
    dx: 10
  }];

  const makeAnnotations = d3.annotation()
    .annotations(annotations);

  const makeAnnotations1 = d3.annotation()
    .annotations(annotations1);
 
  d3.select("#svg1")
    .append("g")
    .call(makeAnnotations);

  d3.select("#svg3")
    .append("g")
    .call(makeAnnotations1);

}(topojson,d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2xvYWRBbmRQcm9jZXNzRGF0YS5qcyIsIi4uL2NvbG9yTGVnZW5kLmpzIiwiLi4vaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmVhdHVyZSB9IGZyb20gJ3RvcG9qc29uJztcbmltcG9ydCB7IHRzdiwganNvbiB9IGZyb20gJ2QzJztcbmV4cG9ydCBjb25zdCBsb2FkQW5kUHJvY2Vzc0RhdGEgPSAoKSA9PiBcbiAgUHJvbWlzZVxuICAgIC5hbGwoW1xuICAgICAgdHN2KCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC81MG0udHN2JyksXG4gICAgICBqc29uKCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC81MG0uanNvbicpXG4gICAgXSlcbiAgICAudGhlbigoW3RzdkRhdGEsIHRvcG9KU09OZGF0YV0pID0+IHtcbiAgICAgIGNvbnN0IHJvd0J5SWQgPSB0c3ZEYXRhLnJlZHVjZSgoYWNjdW11bGF0b3IsIGQpID0+IHtcbiAgICAgICAgYWNjdW11bGF0b3JbZC5pc29fbjNdID0gZDtcbiAgICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgICAgfSwge30pO1xuXG4gICAgICBjb25zdCBjb3VudHJpZXMgPSBmZWF0dXJlKHRvcG9KU09OZGF0YSwgdG9wb0pTT05kYXRhLm9iamVjdHMuY291bnRyaWVzKTtcblxuICAgICAgY291bnRyaWVzLmZlYXR1cmVzLmZvckVhY2goZCA9PiB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oZC5wcm9wZXJ0aWVzLCByb3dCeUlkW2QuaWRdKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gY291bnRyaWVzO1xuICAgIH0pOyIsImV4cG9ydCBjb25zdCBjb2xvckxlZ2VuZCA9IChzZWxlY3Rpb24sIHByb3BzKSA9PiB7XG4gIGNvbnN0IHsgICAgICAgICAgICAgICAgICAgICAgXG4gICAgY29sb3JTY2FsZSwgICAgICAgICAgICAgICAgXG4gICAgY2lyY2xlUmFkaXVzLFxuICAgIHNwYWNpbmcsICAgICAgICAgICAgICAgICAgIFxuICAgIHRleHRPZmZzZXQsXG4gICAgYmFja2dyb3VuZFJlY3RXaWR0aCAgICAgICAgXG4gIH0gPSBwcm9wczsgICAgICAgICAgICAgICAgICAgXG4gIFxuICBjb25zdCBiYWNrZ3JvdW5kUmVjdCA9IHNlbGVjdGlvbi5zZWxlY3RBbGwoJ3JlY3QnKVxuICAgIC5kYXRhKFtudWxsXSk7ICAgICAgICAgICAgIFxuICBjb25zdCBuID0gY29sb3JTY2FsZS5kb21haW4oKS5sZW5ndGg7IFxuICBiYWNrZ3JvdW5kUmVjdC5lbnRlcigpLmFwcGVuZCgncmVjdCcpXG4gICAgLm1lcmdlKGJhY2tncm91bmRSZWN0KVxuICAgICAgLmF0dHIoJ3gnLCAtY2lyY2xlUmFkaXVzICogMikgICBcbiAgICAgIC5hdHRyKCd5JywgLWNpcmNsZVJhZGl1cyAqIDIpICAgXG4gICAgICAuYXR0cigncngnLCBjaXJjbGVSYWRpdXMgKiAyKSAgIFxuICAgICAgLmF0dHIoJ3dpZHRoJywgYmFja2dyb3VuZFJlY3RXaWR0aClcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCBzcGFjaW5nICogbiArIGNpcmNsZVJhZGl1cyAqIDIpIFxuICAgICAgLmF0dHIoJ2ZpbGwnLCAnd2hpdGUnKVxuICAgICAgLmF0dHIoJ29wYWNpdHknLCAwLjgpO1xuICBcblxuICBjb25zdCBncm91cHMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKCcudGljaycpXG4gICAgLmRhdGEoY29sb3JTY2FsZS5kb21haW4oKSk7XG4gIGNvbnN0IGdyb3Vwc0VudGVyID0gZ3JvdXBzXG4gICAgLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd0aWNrJyk7XG4gIGdyb3Vwc0VudGVyXG4gICAgLm1lcmdlKGdyb3VwcylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAoZCwgaSkgPT4gICAgXG4gICAgICAgIGB0cmFuc2xhdGUoMCwgJHtpICogc3BhY2luZ30pYCAgXG4gICAgICApO1xuICBncm91cHMuZXhpdCgpLnJlbW92ZSgpO1xuICBcbiAgZ3JvdXBzRW50ZXIuYXBwZW5kKCdjaXJjbGUnKVxuICAgIC5tZXJnZShncm91cHMuc2VsZWN0KCdjaXJjbGUnKSkgXG4gICAgICAuYXR0cigncicsIGNpcmNsZVJhZGl1cylcbiAgICAgIC5hdHRyKCdmaWxsJywgY29sb3JTY2FsZSk7ICAgICAgXG4gIFxuICBncm91cHNFbnRlci5hcHBlbmQoJ3RleHQnKVxuICAgIC5tZXJnZShncm91cHMuc2VsZWN0KCd0ZXh0JykpICAgXG4gICAgICAudGV4dChkID0+IGQpXG4gICAgICAuYXR0cignZHknLCAnMC4zMmVtJylcbiAgICAgIC5hdHRyKCd4JywgdGV4dE9mZnNldCk7XG59XG4iLCJpbXBvcnQge1xuICBzZWxlY3QsXG4gIGdlb1BhdGgsXG4gIGdlb05hdHVyYWxFYXJ0aDEsXG4gIHpvb20sXG4gIGV2ZW50LFxuICBzY2FsZU9yZGluYWwsXG4gIHNjaGVtZVNwZWN0cmFsXG59IGZyb20gJ2QzJztcbmltcG9ydCB7IGxvYWRBbmRQcm9jZXNzRGF0YSB9IGZyb20gJy4vbG9hZEFuZFByb2Nlc3NEYXRhJztcbmltcG9ydCB7IGNvbG9yTGVnZW5kIH0gZnJvbSAnLi9jb2xvckxlZ2VuZCc7XG5cbmNvbnN0IHN2ZyA9IHNlbGVjdCgnc3ZnJyk7XG5cbmNvbnN0IHByb2plY3Rpb24gPSBnZW9OYXR1cmFsRWFydGgxKCk7XG5jb25zdCBwYXRoR2VuZXJhdG9yID0gZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbik7XG5cbmNvbnN0IGcgPSBzdmcuYXBwZW5kKCdnJyk7XG5cbmNvbnN0IGNvbG9yTGVnZW5kRyA9IHN2Zy5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKDQwLDMxMClgKTtcblxuZy5hcHBlbmQoJ3BhdGgnKVxuICAgIC5hdHRyKCdjbGFzcycsICdzcGhlcmUnKVxuICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcih7dHlwZTogJ1NwaGVyZSd9KSk7XG5cbnN2Zy5jYWxsKHpvb20oKS5vbignem9vbScsICgpID0+IHtcbiAgZy5hdHRyKCd0cmFuc2Zvcm0nLCBldmVudC50cmFuc2Zvcm0pO1xufSkpO1xuXG5jb25zdCBjb2xvclNjYWxlID0gc2NhbGVPcmRpbmFsKCk7XG5cbi8vIGNvbnN0IGNvbG9yVmFsdWUgPSBkID0+IGQucHJvcGVydGllcy5pbmNvbWVfZ3JwO1xuY29uc3QgY29sb3JWYWx1ZSA9IGQgPT4gZC5wcm9wZXJ0aWVzLmVjb25vbXk7XG5cbmxvYWRBbmRQcm9jZXNzRGF0YSgpLnRoZW4oY291bnRyaWVzID0+IHtcbiAgXG4gIGNvbG9yU2NhbGVcbiAgICAuZG9tYWluKGNvdW50cmllcy5mZWF0dXJlcy5tYXAoY29sb3JWYWx1ZSkpXG4gICAgLmRvbWFpbihjb2xvclNjYWxlLmRvbWFpbigpLnNvcnQoKS5yZXZlcnNlKCkpXG4gICAgLnJhbmdlKHNjaGVtZVNwZWN0cmFsW2NvbG9yU2NhbGUuZG9tYWluKCkubGVuZ3RoXSk7XG4gIFxuICBjb2xvckxlZ2VuZEcuY2FsbChjb2xvckxlZ2VuZCwge1xuICAgIGNvbG9yU2NhbGUsXG4gICAgY2lyY2xlUmFkaXVzOiA4LFxuICAgIHNwYWNpbmc6IDIwLFxuICAgIHRleHRPZmZzZXQ6IDEyLFxuICAgIGJhY2tncm91bmRSZWN0V2lkdGg6IDIzNVxuICB9KTtcbiAgXG4gIGcuc2VsZWN0QWxsKCdwYXRoJykuZGF0YShjb3VudHJpZXMuZmVhdHVyZXMpXG4gICAgLmVudGVyKCkuYXBwZW5kKCdwYXRoJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdjb3VudHJ5JylcbiAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcilcbiAgICAgIC5hdHRyKCdmaWxsJywgZCA9PiBjb2xvclNjYWxlKGNvbG9yVmFsdWUoZCkpKVxuICAgIC5hcHBlbmQoJ3RpdGxlJylcbiAgICAgIC50ZXh0KGQgPT4gZC5wcm9wZXJ0aWVzLm5hbWUgKyAnOiAnICsgY29sb3JWYWx1ZShkKSk7XG4gIFxufSk7Il0sIm5hbWVzIjpbInRzdiIsImpzb24iLCJmZWF0dXJlIiwic2VsZWN0IiwiZ2VvTmF0dXJhbEVhcnRoMSIsImdlb1BhdGgiLCJ6b29tIiwiZXZlbnQiLCJzY2FsZU9yZGluYWwiLCJzY2hlbWVTcGVjdHJhbCJdLCJtYXBwaW5ncyI6Ijs7O0VBRU8sTUFBTSxrQkFBa0IsR0FBRztJQUNoQyxPQUFPO09BQ0osR0FBRyxDQUFDO1FBQ0hBLE1BQUcsQ0FBQyxtREFBbUQsQ0FBQztRQUN4REMsT0FBSSxDQUFDLG9EQUFvRCxDQUFDO09BQzNELENBQUM7T0FDRCxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsS0FBSztRQUNqQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSztVQUNqRCxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUMxQixPQUFPLFdBQVcsQ0FBQztTQUNwQixFQUFFLEVBQUUsQ0FBQyxDQUFDOztRQUVQLE1BQU0sU0FBUyxHQUFHQyxnQkFBTyxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUV4RSxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUk7VUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUM1QyxDQUFDLENBQUM7O1FBRUgsT0FBTyxTQUFTLENBQUM7T0FDbEIsQ0FBQzs7RUNyQkMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxLQUFLO0lBQy9DLE1BQU07TUFDSixVQUFVO01BQ1YsWUFBWTtNQUNaLE9BQU87TUFDUCxVQUFVO01BQ1YsbUJBQW1CO0tBQ3BCLEdBQUcsS0FBSyxDQUFDOztJQUVWLE1BQU0s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