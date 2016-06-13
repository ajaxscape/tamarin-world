'use strict'

const cor = require('../lib/co-routines')
const TamarinWorld = require('../lib/world')
const chai = require('chai')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('co-routines', function () {
  it('must have world', function () {
    expect(cor.getCoRoutines).to.throw('World must be defined')
  })
  describe('valid world', function () {
    var coRoutines
    var el

    beforeEach(function () {
      coRoutines = cor.getCoRoutines(new TamarinWorld())
      el = {
        getOuterHtml: () => Promise.resolve('')
      }
    })

    it('whenVisible', function () {
      return coRoutines.whenVisible(el).should.eventually.be.equal(true)
    })
  })
})
