'use strict'

const webDriver = require('selenium-webdriver')

class Defaults {
  getDriver () {
    return new webDriver.Builder()
      .withCapabilities(webDriver.Capabilities.firefox())
      .build()
  }
}

/** --------------------- module exports ------------------------ **/

module.exports = new Defaults()
