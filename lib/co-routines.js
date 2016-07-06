'use strict'

const webDriver = require('selenium-webdriver')
const By = webDriver.By
const WebElement = webDriver.WebElement
const co = require('bluebird').coroutine
const _ = require('lodash')
/** --------------------- co functions ------------------------ **/

const get = (world, defaultTimeout) => {
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
    whenEnabled: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return el.getOuterHtml()
          .then((html) => {
            throw new Error(e.message + '\n' + html)
          })
      }
    }),

    whenDisabled: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsDisabled(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return el.getOuterHtml()
          .then((html) => {
            throw new Error(e.message + '\n' + html)
          })
      }
    }),

    whenVisible: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
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
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsNotVisible(el), timeout || defaultTimeout)
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
        el = yield this.findElement(el, timeout)
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

    waitForTitle: co(function * (title, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.titleIs(title), timeout || defaultTimeout)
        return Promise.resolve(true)
      } catch (e) {
        throw new Error(e.message)
      }
    }),

    findElement: co(function * (el) {
      try {
        const driver = yield world.getDriver()
        if (_.isString(el)) {
          if (el.indexOf('/') === 0) {
            el = yield driver.findElement(By.xpath(el))
          } else {
            el = yield driver.findElement(By.css(el))
          }
        } else if (!(el instanceof WebElement)) {
          el = yield driver.findElement(el)
        }
        return Promise.resolve(el)
      } catch (e) {
        throw new Error(e.message)
      }
    }),

    waitFor: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        yield this.whenVisible(el, timeout)
        yield this.whenEnabled(el, timeout)
        return Promise.resolve(el)
      } catch (e) {
        throw new Error(e.message)
      }
    }),

    waitForBrowser: co(function * (timeout) {
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
  get: get
}
