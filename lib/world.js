'use strict'

var defaults = require('./defaults')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()

  class World {
    constructor (driver) {
      _data.set(this, {})
      if (driver) {
        _driver.set(this, driver)
      } else {
        _driver.set(this, defaults.getDriver())
      }
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
