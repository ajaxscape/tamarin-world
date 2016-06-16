'use strict'

const defaults = require('./defaults')
const cor = require('./co-routines')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()
  let _until = new WeakMap()

  class World {
    constructor (driver) {
      _data.set(this, {})
      if (driver) {
        _driver.set(this, driver)
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

    sendKeys (selector, value, timeout) {
      const coRoutines = cor.getCoRoutines(this, timeout)
      return coRoutines.whenReady(selector)
        .then((el) => el.sendKeys(value))
    }

    click (selector, timeout) {
      const coRoutines = cor.getCoRoutines(this, timeout)
      return coRoutines.whenReady(selector)
        .then((el) => el.click())
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = {
  World: World
}
