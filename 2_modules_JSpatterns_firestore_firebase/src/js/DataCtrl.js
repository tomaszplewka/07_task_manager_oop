// Data Controller
const DataCtrl = (function() {

    const regExPatterns = {
        username:  /^\w{1,15}$/,
        email: /^([a-zA-Z]{1}[\w\.]{0,20})@([a-zA-Z]{2,15})\.([a-zA-Z]{2,5})(\.[a-zA-Z]{2,5})?$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?!.*[\s])(?=.{8,15})/
    }

    const validate = function(target) {
        // include Local Storage later!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.log(target.id);
        if (regExPatterns[target.id].test(target.value)) {
            target.classList.add('valid');
            target.classList.remove('invalid');
        } else {
            target.classList.add('invalid');
            target.classList.remove('valid');
        }
    }

    const dateFormat = (date, format) => { dateFns.format(date, format) };

    return {
        validate,
        dateFormat
    }

})();

export default DataCtrl;