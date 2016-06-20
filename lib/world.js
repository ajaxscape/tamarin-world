'use strict'

const defaults = require('./defaults')
const cor = require('./co-routines')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()
  let _until = new WeakMap()

  class World {
    constructor (driver, until) {
      _data.set(this, {})
      this.getDriver(driver)
        .then((driver) => (this.executeScript = driver.executeScript.bind(driver)))
      if (until) {
        _until.set(this, require('./until')(this, until))
      }
    }

    getDriver (driver) {
      if (!_driver.get(this)) {
        _driver.set(this, driver || defaults.getDriver())
      }
      return Promise.resolve(_driver.get(this))
    }

    getUntil (until) {
      if (!_until.get(this)) {
        _until.set(this, require('./until')(this, until))
      }
      return _until.get(this)
    }

    setData (key, val) {
      let data = _data.get(this)
      data[key] = val
    }

    getData (key) {
      let data = _data.get(this)
      return data[key]
    }

    sleep (delay) {
      return this.getDriver()
        .then((driver) => driver.sleep(delay || 0))
    }

    visit (url) {
      return this.getDriver()
        .then((driver) => driver.get(url))
    }

    whenReady (selector, retries, timeout) {
      const coRoutines = cor.get(this, timeout)
      const retry = (retries) => coRoutines.whenReady(selector)
        .catch((err) => {
          if (retries) {
            return this.sleep(150)
              .then(() => retry(--retries))
          }
          throw err
        })
      return retry(retries)
    }

    sendKeys (selector, value, retries, timeout) {
      const coRoutines = cor.get(this, timeout)
      const retry = (retries) => coRoutines.whenReady(selector)
        .then((el) => el.sendKeys(value))
        .catch((err) => {
          if (retries) {
            return this.sleep(150)
              .then(() => retry(--retries))
          }
          throw err
        })
      return retry(retries)
    }

    hover (selector, delay, retries, timeout) {
      const coRoutines = cor.get(this, timeout)
      const retry = (retries) => coRoutines.whenReady(selector)
        .then((el) => this.getDriver()
          .then((driver) => driver.actions().mouseMove(el).perform())
          .then(() => this.sleep(delay || 0))
          .then(() => Promise.resolve(el)))
        .catch((err) => {
          if (retries) {
            return this.sleep(150)
              .then(() => retry(--retries))
          }
          throw err
        })
      return retry(retries)
    }

    click (selector, retries, timeout) {
      const coRoutines = cor.get(this, timeout)
      const retry = (retries) => coRoutines.whenReady(selector)
        .whenReady(selector, timeout)
        .then((el) => el.click())
        .catch((err) => {
          if (retries) {
            return this.sleep(150)
              .then(() => retry(--retries))
          }
          throw err
        })
      return retry(retries)
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = {
  World: World
}
