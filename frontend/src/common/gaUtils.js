import ReactGA from "react-ga";
/**
 * initGA - init Google Analyitics
 */
export const initGA = () => {
    ReactGA.initialize(process.env.REACT_APP_GA, { testMode: (process.env.REACT_APP_STAGE === "dev" ? true : false) });
    
};
/**
 * PageView - window.location.hash.replace('#','')
 */
export const PageView = () => {
    const path = window.location.pathname;
    ReactGA.pageview(path);
};




/**
 * Event - Add custom tracking event. Track in HubSpot and Google Analyitics
 * @param {string} category 
 * @param {string} action 
 * @param {string} label 
 * @param {string} value 
 */
export const Event = (category, action, label, value) => {
    ReactGA.event({
      category: category,
      action,
      label,
      value
    });
  };


  export const ModalView = (v) => {
    ReactGA.modalview(v);
};

export const Timing = (category, variable, value, label) => {
    ReactGA.timing({
        category: category,
        variable,
        value, // in milliseconds
        label
    });
};