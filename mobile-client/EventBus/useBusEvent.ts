import { EventBus, Registry } from './EventBus';
import React, {useEffect, useRef} from 'react';

import { useServices } from '../contexts/ServiceProvider';

export default function useBusEvent<T>(event: string, cb: (payload: T) => void ){
    const {bus} = useServices()
    // Keep a ref to the latest handler (so we don’t re-register on each render)
    const handlerRef = useRef(cb);
    handlerRef.current = cb;

    useEffect(() => {
        const registry: Registry = bus.on(event, (payload: T) => {
            handlerRef.current(payload)
        })
         console.log(bus.getSubscribers())

        return () => {
            registry.unregister()
        }

    }, [bus, event])
}