'use strict'

const defaults = require('./defaults')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()
  let _until = new WeakMap()

  class World {
    constructor (driver, until) {
      _data.set(this, {})
      if (driver) {
        _driver.set(this, driver)
      } else {
        _driver.set(this, defaults.getDriver())
      }
      _until.set(this, require('./until')(this, until))
    }

    getDriver () {
      return (new Promise((resolve) => {
        const getDriver = () => {
          const driver = _driver.get(this)
          if (driver) {
            resolve(driver)
          } else {
            setTimeout(getDriver, 100)
          }
        }
        getDriver()
      }))
    }

    getUnitl () {
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
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = World
