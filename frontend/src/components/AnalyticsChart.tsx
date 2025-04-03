import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Analytics } from "../types";

const AnalyticsChart = ({ data }: { data: Analytics }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !data.hashtag_counts) return;

    const hashtags = Object.entries(data.hashtag_counts).map(([hashtag, count]) => ({
      hashtag,
      count,
    }));

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };

    // Select SVG and clear previous content
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    // Create scales
    const x = d3
      .scaleBand()
      .domain(hashtags.map((d) => d.hashtag))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(hashtags, (d) => d.count)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .attr("text-anchor", "end");

    // Add Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Draw bars
    svg.selectAll(".bar")
      .data(hashtags)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.hashtag)!)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - margin.bottom - y(d.count))
      .attr("fill", "steelblue");

  }, [data]);

  return (
    <div>
      <h2>Hashtag Analytics</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default AnalyticsChart;
