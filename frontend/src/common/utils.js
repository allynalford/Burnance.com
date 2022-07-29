
/**
* returns TRUE|FALSE if a date is more then a set amount of minutes older than the maxMinutes param
*
* @author Allyn j. Alford <Allyn@tenablylabs.com>
* @async
* @function expired
* @param {Date} date - date
* @param {Number} maxMinutes - max minutes elapsed before date is expired
* @return {Boolean>} true or false
*/
function expired(date, maxMinutes) {
    const today = new Date();
    var ObjDate = new Date(date);
    var diffMs = (today - ObjDate); // milliseconds between now & Object Date
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    console.log(diffMins);
    return (diffMins < maxMinutes ? false : true);
}