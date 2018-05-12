/**
 * Solar Power Monitor model objects.
 */

import Moment from 'moment';
import PropTypes from 'prop-types';

/**
 * A datum represents a timeseries item, holding a value for a topic at a
 * particular point in time.
 */
export class Datum {
  /**
   * Creates a new Datum object.
   * @param {Moment} ts The timestamp.
   * @param {number} topicId The topic ID.
   * @param {string} valueString The value.
   */
  constructor(ts, topicId, valueString) {
    this.ts_ = ts;
    this.topicId_ = topicId;
    this.valueString_ = valueString;
  }

  get ts() {
    return this.ts_;
  }

  get topicId() {
    return this.topicId_;
  }

  get valueString() {
    return this.valueString_;
  }
}

Datum.propTypes = {
  ts: PropTypes.instanceOf(Moment).isRequired,
  topicId: PropTypes.number.isRequired,
  valueString: PropTypes.string.isRequired
};

/**
 * A topic object.
 */
export class Topic {
  /**
   * Creates a new Topic object.
   * @param {number} topicId The topic ID.
   * @param {string} topicName The topic name.
   */
  constructor(topicId, topicName) {
    this.topicId_ = topicId;
    this.topicName_ = topicName;
  }

  get topicId() {
    return this.topicId_;
  }

  get topicName() {
    return this.topicName_;
  }
}

Topic.propTypes = {
  topicId: PropTypes.number.isRequired,
  topicName: PropTypes.string.isRequired
};

/**
 * A building object.
 */
export class Building {
  /**
   * Creates a new Building object.
   * @param {string} buildingName The building name.
   * @param {string} meterName The name of the meter associated with the buidling.
   */
  constructor(buildingName, meterName) {
    this.buildingName_ = buildingName;
    this.meterName_ = meterName;
  }
  get buildingName() {
    return this.buildingName_;
  }
  
  get meterName() {
    return this.meterName_;
  }
}

Building.propTypes = {
  buildingName: PropTypes.string.isRequired,
  meterName: PropTypes.string.isRequired
};

/** 
 * A Metric object
 */
export class Metric {
  /**
   * Creates a new Metric object.
   * @param {string} metricName The metric name.
   * @param {string} unit The unit of the metric.
   */
  constructor(metricName, unit) {
    this.metricName_ = metricName;
    this.unit_ = unit;
  }
  get metricName() {
    return this.metricName_;
  }
  
  get unit() {
    return this.unit_;
  }
}

Metric.propTypes = {
  metricName: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired
};

