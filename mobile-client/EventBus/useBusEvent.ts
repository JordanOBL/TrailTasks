import { EventListenerCallback, EventPayloadMap, Registry } from './EventBus';
import React, {useEffect, useRef} from 'react';

import { useServices } from '../contexts/ServiceProvider';

export default function useBusEvent<T extends keyof EventPayloadMap>(event: T, cb: EventListenerCallback<T>){
    const { bus } = useServices();
    // Keep a ref to the latest handler (so we don’t re-register on each render)
    const handlerRef = useRef(cb);
    handlerRef.current = cb;

    useEffect(() => {
        const registry: Registry = bus.on(event, ((payload: EventPayloadMap[T]) => {
            handlerRef.current(payload)
        }) as EventListenerCallback<T>);

        return () => {
            registry.unregister();
        }

    }, [bus, event])
}