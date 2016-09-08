#tamarin-world

As an extension to [Cucumber.js](https://www.npmjs.com/package/cucumber), __tamarin-world__ allows the tester/developer to concentrate on the functionality that needs to be tested rather than the boiler-plate code around it in order for the test to work.

An example of how to use __tamarin-world__ can be found in the project [tamarin-world-example](https://github.com/ajaxscape/tamarin-world-example).

Note the following feature file taken from the example:

```gherkin
Feature: Do a Google Search
  Using a web browser
  I want to perform a Google search

  Scenario: Google Search
    Given I visit http://google.com
    Then I expect the title to be "Google"
    When I search for "Tamarin"
    When I click the "Images" menu link
    Then I expect to see some "Image" results
```

The corresponding step definitions file is as follows:

```javascript
'use strict'

const webDriver = require('selenium-webdriver')
const By = webDriver.By

const page = {
  'search': By.css('[title="Search"]'),
  'navLink': (linkText) => By.xpath(`//*[@role="navigation"]//a[text()="${linkText}"]`),
  'results': (type, searchTerm) => By.css(`img[alt="${type} result for ${searchTerm}"]`)
}

module.exports = function () {
  this.Given(/^I visit (https?:\/\/.*\..*)$/, function visitStep (url) {
    return this.visit(url)
  })

  this.Then(/^I expect the title to be "([^"]*)"$/, function waitForTitleStep (title) {
    return this.waitForTitle(title)
  })
  
  this.When(/^I search for "([^"]*)"$/, function enterSearchTermStep (searchTerm) {
    return this.setData('searchTerm', searchTerm)
      .then(() => this.sendKeys(page.search, searchTerm + '\n'))
  })

  this.When(/^I click the "([^"]*)" menu link$/, function clickMenuLinkStep (linkText) {
    return this.click(page.navLink(linkText))
  })

  this.Then(/^I expect to see some "([^"]*)" results$/, function waitForResultsStep (type) {
    return this.getData('searchTerm')
      .then((searchTerm) => this.waitFor(page.results(type, searchTerm)))
  })
}
```

Under the hood, __tamarin-world__ waits until an element exists, is visible and enabled prior to performing such actions such as clicking a button or keying text into an input field.

## API
__tamarin-world__ adds the following functions to the __cucumber.js__ world object:
* setData (key, val)
* getData (key)
* sleep (delay)
* visit (url)
* waitForTitle (title)
* waitFor (selector)
* whenEnabled (selector)
* whenDisabled (selector)
* whenVisible (selector)
* whenHidden (selector)
* whenMatches (selector, val)
* whenContains (selector, val)
* sendKeys (selector, value)
* hover (selector, delay)
* click (selector)
* getText (selector)
* getVal (selector)

## Install

### Node

Cucumber.js is available as an npm module.

``` shell
$ npm i tamarin-world -D
```