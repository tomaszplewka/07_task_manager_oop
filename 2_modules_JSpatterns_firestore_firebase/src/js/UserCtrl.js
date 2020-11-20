// User Controller
const UserCtrl = (function() {

    const User = function(data) {
        this.data = {
			name: data.name,
			password: data.password,
			email: data.email
		};
		//
		this.options = {
			avatar: data.avatar,
			theme: data.theme,
			toast: data.toast
		};
		//
		this.tasks = {};
		this.completedTasks = {};
    }

    return {
		addUser: function(data) {
			const newUser = new User({
				name: data.name,
				email: data.email,
				password: data.password,
				avatar: 'avatar-1',
				theme: 'theme-1',
				toast: 'toast-change-1'
			});

			return newUser;
		}
    }

})();

export default UserCtrl;