import * as React from 'react';
import ReactDOM from 'react-dom';
import { usePopperTooltip } from 'react-popper-tooltip';
import { animated, useTransition } from 'react-spring';
import 'react-popper-tooltip/dist/styles.css';
import FeatherIcon from "feather-icons-react";

function PopperToolTip() {
    const [controlledVisible, setControlledVisible] = React.useState(false);

    const {
        getArrowProps,
        getTooltipProps,
        setTooltipRef,
        setTriggerRef,
    } = usePopperTooltip({
        visible: controlledVisible,
        onVisibleChange: setControlledVisible,
    });

    const transitions = useTransition(controlledVisible, 0, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });

    return (
        <div className="App">
            <FeatherIcon
                icon="info"
                className="fea icon-ex-md text me-3"
                ref={setTriggerRef}
            />

            {transitions.map(
                ({ item, key, props }) =>
                    item && (
                        <animated.div
                            key={key}
                            ref={setTooltipRef}
                            {...getTooltipProps({
                                className: 'tooltip-container',
                                style: props,
                            })}
                        >
                            Tooltip element
                            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
                        </animated.div>
                    )
            )}
        </div>
    );
}

export default PopperToolTip
