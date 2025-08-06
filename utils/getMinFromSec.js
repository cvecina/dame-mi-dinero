export default function getMinFromSec(secs) {
    try {
        if (secs === 0) {
            return "";
        }
        let min = Math.floor(secs / 60);
        let remainingSecs = secs % 60;
        let returnVal = "";
        if (remainingSecs == 0) {
            returnVal = min + "min";
        } else {
            returnVal = min + "min " + remainingSecs + "s";
        }
        return returnVal;
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}
