// Data Controller
const DataCtrl = (function() {
    const regExPatterns = {
        username:  /^\w{1,}$/,
        email: /^([a-zA-Z]{1}[\w\.]{0,20})@([a-zA-Z]{2,15})\.([a-zA-Z]{2,5})(\.[a-zA-Z]{2,5})?$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?!.*[\s])(?=.{8,})/
    }
    const validate = function(target) {
        if (regExPatterns[target.id].test(target.value)) {
            target.classList.add('valid');
            target.classList.remove('invalid');
            return 1;
        } else {
            target.classList.add('invalid');
            target.classList.remove('valid');
            return 0;
        }
    }
    const errorHandlingSignUp = function(errorCode) {
        switch (errorCode) {
            case "auth/email-already-in-use":
                return {
                    errorMsg: "Account with the given email address already exists.",
                    errorUsername: null,
                    errorEmail: 1,
                    errorPass: null
                };
            case "auth/invalid-email":
                return {
                    errorMsg: "The given email address is not valid.",
                    errorUsername: null,
                    errorEmail: 1,
                    errorPass: null
                };
            case "auth/weak-password":
                return {
                    errorMsg: "Password must be at least 8 characters long, consist of letters, numbers and include at least one capital letter and one special character [!@#$%^&*].",
                    errorUsername: null,
                    errorEmail: null,
                    errorPass: 1
                };
            case "auth/operation-not-allowed":
            default:
                return {
                    errorMsg: "Cannot create an account now. Try again later.",
                    errorUsername: 1,
                    errorEmail: 1,
                    errorPass: 1
                };
        }
    }
    const errorHandlingLogIn = function(errorCode) {
        switch (errorCode) {
            case "auth/email-already-in-use":
            case "auth/account-exists-with-different-credential":
                return {
                    errorMsg: "Email already used. Go to login page.",
                    errorEmail: 1,
                    errorPass: null
                };
            case "auth/wrong-password":
                return {
                    errorMsg: "Wrong email/password combination.",
                    errorEmail: null,
                    errorPass: 1
                };
            case "auth/user-not-found":
                return {
                    errorMsg: "No user found with this email.",
                    errorEmail: 1,
                    errorPass: null
                };
            case "auth/user-disabled":
                return {
                    errorMsg: "User disabled.",
                    errorEmail: 1,
                    errorPass: 1
                };
            case "auth/operation-not-allowed":
            case "auth/invalid-credential":
                return {
                    errorMsg: "Server error, please try again later.",
                    errorEmail: 1,
                    errorPass: 1
                };
            case "auth/user-mismatch":
                return {
                    errorMsg: "Given credential does not correspond to the user.",
                    errorEmail: 1,
                    errorPass: 1
                };
            case "auth/invalid-email":
                return {
                    errorMsg: "Email address is invalid.",
                    errorEmail: 1,
                    errorPass: null
                };
            case "auth/user-not-found":
                return {
                    errorMsg: "No account found with this email.",
                    errorEmail: 1,
                    errorPass: null
                };
            default:
                return {
                    errorMsg: "Login failed. Please try again.",
                    errorEmail: 1,
                    errorPass: 1
                };
            }
    }
    const filterTasks = function(term, selector) {
        // Get list reference
        const list = document.querySelector(selector);
        // Filter
		Array.from(list.children)
			.filter(task => !task.textContent.toLowerCase().includes(term))
			.forEach(task => { task.classList.add('filtered') });
        Array.from(list.children)
        .filter(task => task.textContent.toLowerCase().includes(term))
        .forEach(task => { task.classList.remove('filtered') });
    }
    return {
        validate,
        errorHandlingLogIn,
        errorHandlingSignUp,
        filterTasks
    }
})();
export default DataCtrl;