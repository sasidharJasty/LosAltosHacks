
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forecastData, aiModelPerformance } from "@/data/mockData";

const ForecastChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous content
    chartRef.current.innerHTML = '';
    
    // Create a simulated chart (in a real implementation, we would use a charting library)
    const chartContainer = document.createElement('div');
    chartContainer.className = 'relative h-[220px] w-full';
    
    // Create labels (x-axis)
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1';
    
    // Only show every 5th label to avoid cluttering
    const visibleLabels = forecastData.labels.filter((_, i) => i % 5 === 0 || i === forecastData.labels.length - 1);
    
    visibleLabels.forEach((label, index) => {
      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      labelEl.style.left = `${(index / (visibleLabels.length - 1)) * 100}%`;
      labelEl.style.position = 'absolute';
      labelEl.style.transform = 'translateX(-50%)';
      labelsContainer.appendChild(labelEl);
    });
    
    chartContainer.appendChild(labelsContainer);
    
    // Create y-axis
    const yAxisContainer = document.createElement('div');
    yAxisContainer.className = 'absolute top-0 bottom-8 left-0 flex flex-col justify-between text-xs text-muted-foreground';
    
    const yLabels = ['12K', '10K', '8K', '6K', '4K', '2K', '0'];
    yLabels.forEach((label) => {
      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      yAxisContainer.appendChild(labelEl);
    });
    
    chartContainer.appendChild(yAxisContainer);
    
    // Create grid lines
    const gridContainer = document.createElement('div');
    gridContainer.className = 'absolute top-0 left-6 right-0 bottom-8';
    
    // Horizontal grid lines
    for (let i = 0; i < yLabels.length; i++) {
      const lineEl = document.createElement('div');
      lineEl.className = 'absolute w-full h-px bg-border';
      lineEl.style.top = `${(i / (yLabels.length - 1)) * 100}%`;
      gridContainer.appendChild(lineEl);
    }
    
    chartContainer.appendChild(gridContainer);
    
    // Create legend
    const legendContainer = document.createElement('div');
    legendContainer.className = 'absolute top-0 right-0 flex items-center gap-4 text-xs';
    
    const datasets = [
      { label: 'Predicted Demand', color: '#16a34a' },
      { label: 'Predicted Supply', color: '#2563eb' },
      { label: 'Predicted Gap', color: '#dc2626' },
    ];
    
    datasets.forEach((dataset) => {
      const legendItem = document.createElement('div');
      legendItem.className = 'flex items-center gap-1';
      
      const colorIndicator = document.createElement('div');
      colorIndicator.className = 'w-3 h-3 rounded-full';
      colorIndicator.style.backgroundColor = dataset.color;
      
      const labelEl = document.createElement('span');
      labelEl.textContent = dataset.label;
      
      legendItem.appendChild(colorIndicator);
      legendItem.appendChild(labelEl);
      legendContainer.appendChild(legendItem);
    });
    
    chartContainer.appendChild(legendContainer);
    
    // Draw the lines (simplified version)
    const linesContainer = document.createElement('div');
    linesContainer.className = 'absolute top-0 left-6 right-0 bottom-8';
    
    // Sample points for three curved lines
    const createPath = (dataset: any, color: string) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.position = 'absolute';
      svg.style.overflow = 'visible';
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      // Generate a simplified path - in a real implementation, we would calculate actual points
      const maxValue = 12000; // Max value in our scale
      
      // Create path data
      let pathData = '';
      
      dataset.data.forEach((value: number, index: number) => {
        const x = (index / (dataset.data.length - 1)) * 100;
        const y = 100 - (value / maxValue * 100);
        
        if (index === 0) {
          pathData += `M ${x} ${y}`;
        } else {
          // Create a curved line using cubic bezier
          const prevX = ((index - 1) / (dataset.data.length - 1)) * 100;
          const cpX1 = prevX + (x - prevX) / 3;
          const cpX2 = x - (x - prevX) / 3;
          
          pathData += ` C ${cpX1} ${y}, ${cpX2} ${y}, ${x} ${y}`;
        }
      });
      
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '2');
      
      svg.appendChild(path);
      linesContainer.appendChild(svg);
      
      // Add points at intervals
      dataset.data.forEach((value: number, index: number) => {
        if (index % 5 === 0 || index === dataset.data.length - 1) {
          const point = document.createElement('div');
          point.className = 'absolute w-2 h-2 rounded-full';
          point.style.backgroundColor = color;
          point.style.transform = 'translate(-50%, -50%)';
          point.style.left = `${(index / (dataset.data.length - 1)) * 100}%`;
          point.style.top = `${100 - (value / maxValue * 100)}%`;
          
          // Add hover effect
          point.style.cursor = 'pointer';
          point.setAttribute('data-value', value.toString());
          point.setAttribute('data-day', `Day ${index + 1}`);
          
          point.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute bg-background border border-border rounded px-2 py-1 text-xs z-10';
            tooltip.style.transform = 'translate(-50%, -130%)';
            tooltip.style.left = '50%';
            tooltip.innerHTML = `${point.getAttribute('data-day')}<br>${point.getAttribute('data-value')} lbs`;
            point.appendChild(tooltip);
          });
          
          point.addEventListener('mouseleave', () => {
            const tooltip = point.querySelector('div');
            if (tooltip) point.removeChild(tooltip);
          });
          
          linesContainer.appendChild(point);
        }
      });
    };
    
    createPath(forecastData.datasets[0], '#16a34a');
    createPath(forecastData.datasets[1], '#2563eb');
    createPath(forecastData.datasets[2], '#dc2626');
    
    chartContainer.appendChild(linesContainer);
    
    // Add to DOM
    chartRef.current.appendChild(chartContainer);
  }, []);
  
  return (
    <Card className="col-span-8 row-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          AI-Powered Demand Forecast
        </CardTitle>
        <CardDescription>
          30-day predictive model for food demand and supply across all regions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[250px]"></div>
        
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-muted/40 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Prediction Accuracy</div>
            <div className="text-lg font-semibold">{aiModelPerformance.demandPredictionAccuracy}%</div>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Allocation Efficiency</div>
            <div className="text-lg font-semibold">{aiModelPerformance.allocationEfficiency}%</div>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Optimization Score</div>
            <div className="text-lg font-semibold">{aiModelPerformance.optimizationScore}%</div>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground">Improvement Rate</div>
            <div className="text-lg font-semibold">+{aiModelPerformance.improvementRate}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;