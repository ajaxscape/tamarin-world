'use strict'

const _ = require('lodash')
const webDriver = require('selenium-webdriver')
const By = webDriver.By
const co = require('bluebird').coroutine

const until = ((world, until) => {

  /** ------------------------ extend until --------------------------- **/

  until = until || webDriver.until
  _.extend(until, {
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

  return until
})

/** --------------------- module exports ------------------------ **/

module.exports = until
