/**
 * A route component that queries and displays time-series data.
 */

import Card, { CardContent, CardHeader } from 'material-ui/Card';
import Chart from './chart.jsx';
import ChartOptions from './chart-options.jsx';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import IconButton from 'material-ui/IconButton';
import Moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';

/**
 * Granularities at which time series data can be sampled.
 */
const SAMPLE_GRANULARITIES = [
  'year',
  'month',
  'date',
  'hour',
  'minute',
  'second',
  'millisecond'
];

const styles = (theme) => ({
  chartCard: {
    marginTop: '32px'
  },
  linearProgress: {
    left: '0',
    position: 'fixed',
    top: '100px',
    width: '100%'
  }
});

class HomeRoute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // The start date and time of the query.
      startDateTime: new Moment(),

      // The end date and time of the query.
      endDateTime: new Moment(),

      // A list of known topics.
      topics: [],

      // The currently selected topic.
      selectedTopicId: 0,

      // The currently displayed data.
      data: [],

      // The currently selected sample granularity.
      selectedSampleGranularity: 'hour',

      // Whether the progress indicator should be shown.
      showProgressIndicator: false
    };
  }

  /**
   * Performs post-render tasks after properties updates.
   * @returns {undefined}
   */
  componentDidMount() {
    this.fetchTopics();
    this.fetchEarliestTimestamp();
    this.fetchLatestTimestamp();
  }

  /**
   * Renders the home route view.
   * @returns {Object} A rendered JSX element.
   */
  render() {
    const { classes } = this.props;

    let chart = null;
    if (this.state.data.length > 0) {
      const selectedTopic = this.state.topics.find((e) => (
        e['topic_id'] == this.state.selectedTopicId
      ));

      chart = (
        <Card className={classes.chartCard}>
          <CardHeader title="Chart" />
          <CardContent>
            <Chart
              data={this.state.data}
              label={selectedTopic['topic_name']} />
          </CardContent>
        </Card>
      );
    }

    return (
      <div>
        {this.state.showProgressIndicator && <LinearProgress mode="query" className={classes.linearProgress} />}
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography type="headline">Chart Options</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ChartOptions
              topics={this.state.topics}
              selectedTopicId={this.state.selectedTopicId}
              startDateTime={this.state.startDateTime}
              endDateTime={this.state.endDateTime}
              sampleGranularities={SAMPLE_GRANULARITIES}
              selectedSampleGranularity={this.state.selectedSampleGranularity}
              onTopicChange={this.handleSelectedTopicChange.bind(this)}
              onStartDateTimeChange={this.handleStartDateTimeChange.bind(this)}
              onEndDateTimeChange={this.handleEndDateTimeChange.bind(this)}
              onSampleGranularityChange={this.handleSampleGranularityChange.bind(this)}
              onSubmit={this.handleOptionsSubmit.bind(this)} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        {chart}
      </div>
    );
  }

  /**
   * Fetches topics from the backend.
   * @returns {undefined}
   */
  fetchTopics() {
    fetch('/_/topics')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          topics: data,
          selectedTopicId: (data.length > 0 ? data[0]['topic_id'] : 0)
        });
      });
  }

  /**
   * Fetches the earliest data timestamp from the backend.
   * @returns {undefined}
   */
  fetchEarliestTimestamp() {
    fetch('/_/data/timestamp/earliest')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ startDateTime: new Moment(data) });
      });
  }

  /**
   * Fetches the latest data timestamp from the backend.
   * @returns {undefined}
   */
  fetchLatestTimestamp() {
    fetch('/_/data/timestamp/latest')
      .then((response) => response.json())
      .then((data) => {
        this.setState({ endDateTime: new Moment(data) });
      });
  }

  /**
   * Fetches data to be displayed in the chart.
   * @returns {undefined}
   */
  fetchData() {
    this.setState({ showProgressIndicator: true });
    const params = new URLSearchParams();
    params.set('topic_id', this.state.selectedTopicId);
    params.set('start_date_time', this.state.startDateTime.toISOString());
    params.set('end_date_time', this.state.endDateTime.toISOString());

    fetch('/_/data?' + params.toString())
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          data: this.getSamples(data, this.state.selectedSampleGranularity),
          showProgressIndicator: false
        });
      });
  }

  /**
   * Handles changes to the topic selection field.
   * @param {Object} event The change event.
   * @returns {undefined}
   */
  handleSelectedTopicChange(event) {
    this.setState({ selectedTopicId: event.target.value });
  }

  /**
   * Handles changes to the start date and time field.
   * @param {Moment} date The new start date and time.
   * @returns {undefined}
   */
  handleStartDateTimeChange(date) {
    this.setState({ startDateTime: date });
  }

  /**
   * Handles changes to the end date and time field.
   * @param {Moment} date The new end date and time.
   * @returns {undefined}
   */
  handleEndDateTimeChange(date) {
    this.setState({ endDateTime: date });
  }

  /**
   * Handles changes to the sample granularity field.
   * @param {Object} event The change event.
   * @returns {undefined}
   */
  handleSampleGranularityChange(event) {
    this.setState({ selectedSampleGranularity: event.target.value });
  }

  /**
   * Handles submissions of the chart options component.
   * @returns {undefined}
   */
  handleOptionsSubmit() {
    this.fetchData();
  }

  /**
   * Samples a set of data at the requested granularity.
   * @param {Array} data The data to be sampled.
   * @param {string} sampleGranularity The granularity at which the data should be sampled.
   * @returns {Array} A sampled list of data.
   */
  getSamples(data, sampleGranularity) {
    if (data.length == 0) {
      return [];
    }

    // TODO(kjiwa): Put this into a worker thread.
    data.sort((a, b) => (a['ts'] - b['ts']));
    const samples = [data[0]];
    let ts = new Moment(data[0]['ts']);
    for (let i = 1, j = data.length; i < j; ++i) {
      const now = new Moment(data[i]['ts']);
      if (now.isSame(ts, sampleGranularity)) {
        continue;
      }

      samples.push(data[i]);
      ts = now;
    }

    return samples;
  }
}

HomeRoute.propTypes = {
};

export default withStyles(styles)(HomeRoute);
