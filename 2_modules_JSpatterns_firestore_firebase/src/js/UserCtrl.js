// User Controller
const UserCtrl = (function() {

    const User = function(userName, password, email, avatar = 'avatar-1', theme = 'theme-1', toast = 'toast-change-1') {
        this.data = {
			name: userName,
			password: password,
			email: email
		};
		//
		this.options = {
			avatar: avatar,
			theme: theme,
			toast: toast
		};
		//
		this.tasks = {};
		this.completedTasks = {};
    }

    return {

    }

})();

export default UserCtrl;