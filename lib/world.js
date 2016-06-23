'use strict'

const defaults = require('./defaults')
const cor = require('./co-routines')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()
  let _until = new WeakMap()

  const whenReady = (world, selector, callback, retries, timeout) => {
    const coRoutines = cor.get(world, timeout)
    const retry = (retries) => coRoutines.whenReady(selector)
      .then(callback || ((el) => Promise.resolve(el)))
      .catch((err) => {
        if (retries) {
          return world.sleep(defaults.defaultRetryDelay)
            .then(() => retry(--retries))
        }
        throw err
      })
    return retry(retries)
  }

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
      return Promise.resolve(data[key] = val)
    }

    getData (key) {
      let data = _data.get(this)
      return Promise.resolve(data[key])
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
      return whenReady(this, selector,
        (el) => Promise.resolve(el),
        retries, timeout)
    }

    sendKeys (selector, value, retries, timeout) {
      return whenReady(this, selector,
        (el) => el.sendKeys(value),
        retries, timeout)
    }

    hover (selector, delay, retries, timeout) {
      return whenReady(this, selector,
        (el) => this.getDriver()
          .then((driver) => driver.actions().mouseMove(el).perform())
          .then(() => this.sleep(delay || 0))
          .then(() => Promise.resolve(el)),
        retries, timeout)
    }

    click (selector, retries, timeout) {
      return whenReady(this, selector,
        (el) => el.click(),
        retries, timeout)
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = {
  World: World,
  use: (extend) => extend(World)
}
