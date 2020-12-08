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

    // const dateFormat = (date, format) => { dateFns.format(date, format) };

    const displayLogInFormat = function(email, password, error) {
        if (email === '' && password === '') {
            
        }
    }

    const errorHandling = function(errorCode) {
        switch (errorCode) {
            case "auth/email-already-in-use":
            case "auth/account-exists-with-different-credential":
                return {
                    msg: "Email already used. Go to login page.",
                    email: 1,
                    pass: null
                };
            case "auth/wrong-password":
                return {
                    msg: "Wrong email/password combination.",
                    email: null,
                    pass: 1
                };
            case "auth/user-not-found":
                return {
                    msg: "No user found with this email.",
                    email: 1,
                    pass: null
                };
            case "auth/user-disabled":
                return {
                    msg: "User disabled.",
                    email: 1,
                    pass: 1
                };
            case "auth/operation-not-allowed":
                return {
                    msg: "Server error, please try again later.",
                    email: 1,
                    pass: 1
                };
            case "auth/invalid-email":
                return {
                    msg: "Email address is invalid.",
                    email: 1,
                    pass: null
                };
            case "auth/user-not-found":
                return {
                    msg: "No account found with this email.",
                    email: 1,
                    pass: null
                };
            default:
                return {
                    msg: "Login failed. Please try again.",
                    email: 1,
                    pass: 1
                };
            }
    }

    const filterTasks = function(term, selector) {
        const list = document.querySelector(selector);
        console.log(list);
		//
		Array.from(list.children)
			.filter(task => !task.textContent.toLowerCase().includes(term))
			.forEach(task => {
                task.classList.remove('d-flex');
                task.classList.add('filtered');
                console.log(task);
            });
        //
        Array.from(list.children)
        .filter(task => task.textContent.toLowerCase().includes(term))
        .forEach(task => {
            task.classList.add('d-flex');
            task.classList.remove('filtered');
            console.log(task);
        });
    }

    return {
        validate,
        displayLogInFormat,
        errorHandling,
        filterTasks
    }

})();

export default DataCtrl;