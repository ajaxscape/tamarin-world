'use strict'

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()

  class World {
    constructor () {
      _data.set(this, {})
    }

    setDriver (driver) {
      _driver.set(this, driver)
    }

    setData (key, val) {
      let data = _data.get(this)
      data[key] = val
    }

    getData (key, val) {
      let data = _data.get(this)
      return data[key]
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = World
