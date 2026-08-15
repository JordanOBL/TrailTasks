import { describe, expect, jest, test } from '@jest/globals';

import { EventBus } from "./EventBus"

describe("EventBus", () => {
    test('singlton Pattern', async () => {
        const eb = EventBus.getInstance();
        const eb1 = EventBus.getInstance() 
        expect(eb).toBe(eb1)
    })

    test('Subscribes to new event', () => {
        const eb = EventBus.getInstance();
        const cb = jest.fn()
        eb.on('NEW EVENT', cb )
        const subscribers = eb.getSubscribers()
        expect(subscribers['NEW EVENT']).not.toBeUndefined()
        expect(Object.keys(subscribers)).toHaveLength(1)

    })

    test('emit method calls callback with payload', async () => {
        const eb = EventBus.getInstance();
        const cb = jest.fn()
        const payload = { payload: true}
        eb.on('NEW EVENT', cb )
        eb.emit('NEW EVENT', payload)
        expect(cb).toHaveBeenCalledTimes(1)
        expect(cb).toHaveBeenLastCalledWith(payload)
    })
})