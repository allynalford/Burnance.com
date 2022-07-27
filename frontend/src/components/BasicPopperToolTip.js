import * as React from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import FeatherIcon from "feather-icons-react";


function BasicPopperToolTip(props) {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip();

  return (
    <>
      <div className="App">
              <div ref={setTriggerRef}>
              <b>{props.title}</b>&nbsp;<FeatherIcon 
                  size={"15"} 
                  icon={props.icon || "info" } 
                  className="fea icon-ex-sm me-3" />
              </div>

        {visible && (
          <div
            style={{backgroundColor: 'black', color: 'white'}}
            ref={setTooltipRef}
            {...getTooltipProps({ className: 'tooltip-container' })}
          >
            {props.text}
            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          </div>
        )}
      </div>
    </>
  );
}
export default BasicPopperToolTip