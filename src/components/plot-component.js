/* global Plotly */
import React from 'react';

export default class PlotComponent extends React.Component {
  constructor() {
    super();

    this._updatePlot = this._updatePlot.bind(this);
  }

  componentDidMount() {
    this.boxPlot = document.getElementById('sent-boxplot');
    this.histogram = document.getElementById('sent-histogram');

    Plotly.newPlot(this.boxPlot);
    Plotly.newPlot(this.histogram);

    window.addEventListener("resize", this._updatePlot);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._updatePlot);
  }

  render() {
    if(this.props.data != null)
      this._plotGraph();

    return(
      <div className="container-fluid">
        <div id="sent-boxplot">
        </div>
        <div id="sent-histogram">
        </div>
      </div>
    );
  }

  _updatePlot() {
    console.log("updating plot");
    Plotly.Plots.resize(this.boxPlot);
    Plotly.Plots.resize(this.histogram);
  }

  _plotGraph(data) {
    if (data != null) {
      const layout = {
        autosize: true,
        height: 700,
        margin: {
          l: 50,
          r: 50,
          b: 200,
          t: 120,
          pad: 5
        },
        title: 'Box Plot of Aspect Based Sentiment Scores',
        xaxis: {
          title: "Aspects",
          type: "category",
          tickangle: 45
          },
        yaxis: {title: "Sentiment Polarity"}
      };

      const results = [
        {
          y: data["scores"],
          x: data["aspects"],
          type: 'box'
        }
      ];

      const layoutTrace = {
        autosize: true,
        height: 700,
        margin: {
          l: 50,
          r: 50,
          b: 200,
          t: 120,
          pad: 5
        },
        title: 'Distribution of Aspect Based Sentiment Scores',
        xaxis: {
          title: "Sentiment Polarity",
          },
        yaxis: {title: "# of comments"}
      };

      const trace = [
        {
          y: data["aspects"],
          x: data["scores"],
          type: 'histogram'
        }
      ];

      Plotly.newPlot(this.boxPlot, results, layout);
      Plotly.newPlot(this.histogram, trace, layoutTrace);
    }
  }
}
