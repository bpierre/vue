var assert = require('assert'),
    Binding = require('../../src/binding')

describe('UNIT: Binding', function () {

    describe('instantiation', function () {

        it('should have root==true with a root key', function () {
            var b = new Binding(null, 'test')
            assert.ok(b.root)
        })

        it('should have root==false with a non-root key', function () {
            var b = new Binding(null, 'test.key')
            assert.ok(!b.root)
        })

        it('should have root==false if its key is an expression', function () {
            var b = new Binding(null, 'test', true)
            assert.ok(!b.root)
        })

        it('should have instances, subs and deps as Arrays', function () {
            var b = new Binding(null, 'test')
            assert.ok(Array.isArray(b.instances))
            assert.ok(Array.isArray(b.subs))
            assert.ok(Array.isArray(b.deps))
        })

    })

    describe('.update()', function () {

        var b = new Binding(null, 'test'),
            val = 123,
            updated = 0,
            pubbed = false,
            numInstances = 3,
            instance = {
                update: function (value) {
                    updated += value
                }
            }
        for (var i = 0; i < numInstances; i++) {
            b.instances.push(instance)
        }
        b.pub = function () {
            pubbed = true
        }
        b.update(val)

        it('should set the binding\'s value', function () {
            assert.ok(b.value === val)
        })

        it('should update the binding\'s instances', function () {
            assert.ok(updated === val * numInstances)
        })

        it('should call the binding\'s pub() method', function () {
            assert.ok(pubbed)
        })

    })

    describe('.refresh()', function () {

        var b = new Binding(null, 'test'),
            refreshed = 0,
            numInstances = 3,
            instance = {
                refresh: function () {
                    refreshed++
                }
            }
        for (var i = 0; i < numInstances; i++) {
            b.instances.push(instance)
        }
        b.refresh()

        it('should call refresh() of all instances', function () {
            assert.ok(refreshed === numInstances)
        })
    })

    describe('.pub()', function () {
        
        var b = new Binding(null, 'test'),
            refreshed = 0,
            numSubs = 3,
            sub = {
                refresh: function () {
                    refreshed++
                }
            }
        for (var i = 0; i < numSubs; i++) {
            b.subs.push(sub)
        }
        b.pub()

        it('should call refresh() of all subscribers', function () {
            assert.ok(refreshed === numSubs)
        })

    })

    describe('.unbind()', function () {
        
        var b = new Binding(null, 'test'),
            unbound = 0,
            pubbed = false,
            numInstances = 3,
            instance = {
                unbind: function () {
                    unbound++
                }
            }
        for (var i = 0; i < numInstances; i++) {
            b.instances.push(instance)
        }

        // mock deps
        var dep1 = { subs: [1, 2, 3, b] },
            dep2 = { subs: [2, b, 4, 6] }
        b.deps.push(dep1, dep2)

        b.unbind()

        it('should call unbind() of all instances', function () {
            assert.ok(unbound === numInstances)
        })

        it('should remove itself from the subs list of all its dependencies', function () {
            assert.ok(dep1.subs.indexOf(b) === -1)
            assert.ok(dep2.subs.indexOf(b) === -1)
        })

        it('should unref all instance props', function () {
            assert.ok(b.compiler === null)
            assert.ok(b.pubs === null)
            assert.ok(b.subs === null)
            assert.ok(b.instances === null)
            assert.ok(b.deps === null)
        })

    })

})