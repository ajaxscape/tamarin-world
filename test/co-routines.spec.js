'use strict'

const cor = require('../lib/co-routines')
const TamarinWorld = require('../lib/world')
const chai = require('chai')
const sinon = require('sinon')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('co-routines', function () {
  it('must have world', function () {
    expect(cor.get).to.throw('World must be defined')
  })

  it('must have a valid timeout', function () {
    const world = new TamarinWorld()
    expect(() => cor.get(world, 'abc')).to.throw('Default Timeout must be a number')
  })

  describe('valid world', function () {
    let world
    let coRoutines
    let el
    let html = '<h1>Hello</h1>'

    beforeEach(function () {
      world = new TamarinWorld()
      el = {
        getOuterHtml: () => Promise.resolve(html)
      }
    })

    describe('resolved', function () {
      beforeEach(function () {
        sinon.stub(world, 'getDriver').returns(Promise.resolve({
          getCurrentUrl: () => Promise.resolve('/ready'),
          wait: (fn) => fn
        }))
        sinon.stub(world, 'getUntil').returns({
          findElement: () => Promise.resolve({}),
          elementIsEnabled: () => Promise.resolve(true),
          elementIsDisabled: () => Promise.resolve(true),
          elementIsVisible: () => Promise.resolve(true),
          elementIsNotVisible: () => Promise.resolve(true),
          elementTextIs: () => Promise.resolve(true),
          titleIs: () => Promise.resolve(true),
          browserReady: () => Promise.resolve(true)
        })
        coRoutines = cor.get(world, 100)
      })

      afterEach(function () {
        world.getUntil.restore()
        world.getDriver.restore()
      })

      it('findElement', function () {
        return coRoutines.findElement(el).should.eventually.be.equal(el)
      })

      it('whenEnabled', function () {
        return coRoutines.whenEnabled(el).should.eventually.be.equal(el)
      })

      it('whenDisabled', function () {
        return coRoutines.whenDisabled(el).should.eventually.be.equal(el)
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el).should.eventually.be.equal(el)
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el).should.eventually.be.equal(el)
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el).should.eventually.be.equal(el)
      })

      it('whenReady', function () {
        return coRoutines.whenReady(el).should.eventually.be.equal(el)
      })

      it('whenTitleIs', function () {
        return coRoutines.whenTitleIs('title').should.eventually.be.equal(true)
      })

      it('whenBrowserReady', function () {
        return coRoutines.whenBrowserReady().should.eventually.be.equal('/ready')
      })
    })

    describe('rejected', function () {
      beforeEach(function () {
        sinon.stub(world, 'getDriver').returns(Promise.resolve({
          getCurrentUrl: () => Promise.resolve('/ready'),
          wait: (fn) => fn
        }))
        sinon.stub(world, 'getUntil').returns({
          elementIsEnabled: () => Promise.reject({message: 'Not Enabled'}),
          elementIsDisabled: () => Promise.reject({message: 'Not Disabled'}),
          elementIsVisible: () => Promise.reject({message: 'Not Visible'}),
          elementIsNotVisible: () => Promise.reject({message: 'Is Visible'}),
          elementTextIs: () => Promise.reject({message: 'Not Matching Text'}),
          titleIs: () => Promise.reject({message: 'Not Matching Title'}),
          browserReady: () => Promise.reject({message: 'Not Ready'})
        })
        coRoutines = cor.get(world, 100)
      })

      afterEach(function () {
        world.getUntil.restore()
        world.getDriver.restore()
      })

      it('whenEnabled', function () {
        return coRoutines.whenEnabled(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Enabled'),
            expect(Promise.resolve(err.message)).to.eventually.contain(html)
          ]))
      })

      it('whenDisabled', function () {
        return coRoutines.whenDisabled(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Disabled'),
            expect(Promise.resolve(err.message)).to.eventually.contain(html)
          ]))
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Visible'),
            expect(Promise.resolve(err.message)).to.eventually.contain(html)
          ]))
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Is Visible'),
            expect(Promise.resolve(err.message)).to.eventually.contain(html)
          ]))
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Matching Text'),
            expect(Promise.resolve(err.message)).to.eventually.contain(html)
          ]))
      })

      it('whenReady', function () {
        return coRoutines.whenReady(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Visible')
          ]))
      })

      it('whenTitleIs', function () {
        return coRoutines.whenTitleIs(el)
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Matching Title')
          ]))
      })

      it('whenBrowserReady', function () {
        return coRoutines.whenBrowserReady()
          .catch((err) => Promise.all([
            expect(Promise.resolve(err.message)).to.eventually.contain('Not Ready')
          ]))
      })
    })
  })
})
