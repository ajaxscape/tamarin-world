'use strict'

const co = require('bluebird').coroutine
const _ = require('lodash')
/** --------------------- co functions ------------------------ **/

const getCoRoutines = (world, defaultTimeout) => {
  if (!world) {
    throw new Error('World must be defined')
  }

  if (_.isUndefined(defaultTimeout)) {
    defaultTimeout = 10000
  } else if (!_.isNumber(defaultTimeout)) {
    throw new Error('Default Timeout must be a number')
  }

  const until = world.getUntil()

  return {
    whenVisible: co(function * (el, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout)
        yield driver.wait(until.elementIsVisible(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return el.getOuterHtml()
          .then((html) => {
            throw new Error(e.message + '\n' + html)
          })
      }
    }),

    whenHidden: co(function * (el, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsNotVisible(el), timeout || defaultTimeout)
        yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return el.getOuterHtml()
          .then((html) => {
            throw new Error(e.message + '\n' + html)
          })
      }
    }),

    whenMatches: co(function * (el, text, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.elementTextIs(el, text), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return el.getOuterHtml()
          .then((html) => {
            throw new Error(e.message + '\n' + html)
          })
      }
    }),

    whenTitleIs: co(function * (title, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.titleIs(title), timeout || defaultTimeout)
        return Promise.resolve(true)
      } catch (e) {
        throw new Error(e.message)
      }
    }),

    whenBrowserReady: co(function * (timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.browserReady(), timeout || defaultTimeout)
        const url = yield driver.getCurrentUrl()
        return Promise.resolve(url)
      } catch (e) {
        throw new Error(e.message)
      }
    })
  }
}

/** --------------------- module exports ------------------------ **/

module.exports = {
  getCoRoutines: getCoRoutines
}
