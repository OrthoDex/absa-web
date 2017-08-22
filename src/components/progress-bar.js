import React from 'react';

export default class ProgressBar extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: 0
    }
  }

  render() {
    if (this.state.progress > 0 && this.state.progress < 100) {
      return(
        <div className="progress">
          <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100" />
        </div>
      );
    }
    else {
      return(
        <div />
      );
    }
  }
}
