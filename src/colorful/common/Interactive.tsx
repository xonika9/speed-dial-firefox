import { ParentComponent, createEffect, createSignal } from 'solid-js';
import { clamp } from '../../utils/assorted';

export interface Interaction {
    readonly left: number;
    readonly top: number;
}

// Check if an event was triggered by touch
const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => 'touches' in event;

// Finds a proper touch point by its identifier
const getTouchPoint = (touches: TouchList, touchId?: number): Touch => {
    for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === touchId) return touches[i];
    }
    return touches[0];
};

// Finds the proper window object to fix iframe embedding issues
function getParentWindow(node?: HTMLDivElement | null): Window {
    return (node && node.ownerDocument.defaultView) || self;
}

// Returns a relative position of the pointer inside the node's bounding box
const getRelativePosition = (
    node: HTMLDivElement,
    event: MouseEvent | TouchEvent,
    touchId?: number,
): Interaction => {
    const rect = node.getBoundingClientRect();

    // Get user's pointer position from `touches` array if it's a `TouchEvent`
    const pointer = isTouch(event) ? getTouchPoint(event.touches, touchId) : (event as MouseEvent);

    return {
        left: clamp((pointer.pageX - (rect.left + getParentWindow(node).pageXOffset)) / rect.width),
        top: clamp((pointer.pageY - (rect.top + getParentWindow(node).pageYOffset)) / rect.height),
    };
};

// Browsers introduced an intervention, making touch events passive by default.
// This workaround removes `preventDefault` call from the touch handlers.
// https://github.com/facebook/react/issues/19651
const preventDefaultMove = (event: MouseEvent | TouchEvent): void => {
    !isTouch(event) && event.preventDefault();
};

// Prevent mobile browsers from handling mouse events (conflicting with touch ones).
// If we detected a touch interaction before, we prefer reacting to touch events only.
const isInvalid = (event: MouseEvent | TouchEvent, hasTouch: boolean): boolean => {
    return hasTouch && !isTouch(event);
};

interface InteractiveProps {
    onMove: (interaction: Interaction) => void;
    onKey: (offset: Interaction) => void;
}

const Interactive: ParentComponent<InteractiveProps> = props => {
    let containerRef: HTMLDivElement | undefined;
    let touchId: number | undefined;
    let hasTouch = false;

    const [enableGlobalEvents, setEnableGlobalEvents] = createSignal(false);

    createEffect(() => {
        const touch = hasTouch;
        const container = containerRef!;
        const parentWindow = getParentWindow(container);

        // Add or remove additional pointer event listeners
        const toggleEvent = enableGlobalEvents()
            ? parentWindow.addEventListener
            : parentWindow.removeEventListener;
        toggleEvent(touch ? 'touchmove' : 'mousemove', handleMove);
        toggleEvent(touch ? 'touchend' : 'mouseup', handleMoveEnd);
    });

    const handleMoveStart = (nativeEvent: MouseEvent | TouchEvent) => {
        const container = containerRef!;
        if (!container) return;

        // Prevent text selection
        preventDefaultMove(nativeEvent);

        if (isInvalid(nativeEvent, hasTouch) || !container) return;

        if (isTouch(nativeEvent)) {
            hasTouch = true;
            const changedTouches = nativeEvent.changedTouches || [];
            if (changedTouches.length) touchId = changedTouches[0].identifier;
        }

        container.focus();
        props.onMove(getRelativePosition(container, nativeEvent, touchId));
        setEnableGlobalEvents(true);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
        // Prevent text selection
        preventDefaultMove(event);

        // If user moves the pointer outside of the window or iframe bounds and release it there,
        // `mouseup`/`touchend` won't be fired. In order to stop the picker from following the cursor
        // after the user has moved the mouse/finger back to the document, we check `event.buttons`
        // and `event.touches`. It allows us to detect that the user is just moving his pointer
        // without pressing it down
        const isDown = isTouch(event) ? event.touches.length > 0 : event.buttons > 0;

        if (isDown && containerRef) {
            props.onMove(getRelativePosition(containerRef, event, touchId));
        } else {
            setEnableGlobalEvents(false);
        }
    };

    const handleMoveEnd = () => setEnableGlobalEvents(false);

    const handleKeyDown = (event: KeyboardEvent) => {
        const keyCode = event.which || event.keyCode;

        // Ignore all keys except arrow ones
        if (keyCode < 37 || keyCode > 40) return;
        // Do not scroll page by arrow keys when document is focused on the element
        event.preventDefault();
        // Send relative offset to the parent component.
        // We use codes (37←, 38↑, 39→, 40↓) instead of keys ('ArrowRight', 'ArrowDown', etc)
        // to reduce the size of the library
        props.onKey({
            left: keyCode === 39 ? 0.05 : keyCode === 37 ? -0.05 : 0,
            top: keyCode === 40 ? 0.05 : keyCode === 38 ? -0.05 : 0,
        });
    };

    return (
        <div
            onTouchStart={handleMoveStart}
            onMouseDown={handleMoveStart}
            class='solid-colorful__interactive'
            ref={containerRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role='slider'
        >
            {props.children}
        </div>
    );
};

export default Interactive;
