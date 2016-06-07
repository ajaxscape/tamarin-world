'use strict'

const webDriver = require('selenium-webdriver')
let driver

const defaults = Object.freeze({
  defaultTimeout: 10000,
  getDriver: () => driver || (driver = new webDriver.Builder()
      .withCapabilities(webDriver.Capabilities.firefox())
      .build())
})

/** --------------------- module exports ------------------------ **/

module.exports = defaults
