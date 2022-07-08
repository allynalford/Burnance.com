const Swal = require("sweetalert2");
/**
 * _fire - open Sweet Alert Modal full screen
 * @param {string} title
 * @param {string} text  
 * @param {string} icon    
 */
export const _fire = (title, text, icon) =>{
    try{
        return Swal.fire({
            title,
            text,
            backdrop: true,
            grow: "fullscreen",
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
              }
        });
    }catch(e){
        console.log(e);
        throw e;
    }
  };