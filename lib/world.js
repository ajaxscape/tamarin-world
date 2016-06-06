'use strict'

const _ = require('lodash')
const webDriver = require('selenium-webdriver')
const By = webDriver.By
const defaults = require('./defaults')

const init = ((world) => {

  /** ------------------------ extend until --------------------------- **/

  _.extend(world.until, {
    foundInPage: (selector) => new until.Condition(`for $("${selector}") to be found in page`, co(function * () {
      return yield world.getDriver().findElement(By.css(selector))
        .then(() => true)
        .catch(() => false)
    })),
    notFoundInPage: (selector) => new until.Condition(`for $("${selector}") to not be found in page`, co(function * () {
      return yield world.getDriver().findElement(By.css(selector))
        .then(() => false)
        .catch(() => true)
    })),
    titleIs: (expectedTitle) => new until.Condition(`for "${expectedTitle}" to match page title`, co(function * () {
      const title = yield world.getDriver().getTitle()
      return title === expectedTitle
    })),
    browserReady: () => new until.Condition('for url to not equal data ', co(function * () {
      const url = yield world.getDriver().getCurrentUrl()
      return url !== 'data:,'
    }))
  })
})

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()

  class World {
    constructor (driver, until) {
      _data.set(this, {})
      if (driver) {
        _driver.set(this, driver)
      } else {
        _driver.set(this, defaults.getDriver())
      }
      this.until = until || webDriver.until
      init(this)
    }

    getDriver () {
      return _driver.get(this)
    }

    setData (key, val) {
      let data = _data.get(this)
      data[key] = val
    }

    getData (key) {
      let data = _data.get(this)
      return data[key]
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = World
