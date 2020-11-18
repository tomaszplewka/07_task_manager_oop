// UI Controller
const UICtrl = (function() {

    const UISelectors = {
        // populate with UI selectors...
        addUserBtn: '#login-add-btn',
        loginMainDiv: '.login-main-div'
    }

    const createHeading = function(cssClass, headingTitle) {
        let heading = document.createElement('h2');
        heading.className = 'display-4 text-center';
        heading.classList.add(cssClass);
        heading.textContent = headingTitle;

        return heading;
    }

    const addMode = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);

        let html = '';

        let div = document.createElement('div');
        div.className = 'login-add-mode px-4 pt-3 pb-4';

        // html += `<h2 class="display-4 welcome-heading text-center">Create an Account</h2>`;
        // html += createHeading('welcome-heading', 'Create an Account').innerHTML;

        html += `<form action="" class="mt-4" id="add-account-form" autocomplete="off">
                    <div class="input-group form-group mb-0 add-username">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="">
                                <i class="fas fa-user-edit"></i>
                            </span>
                        </div>
                        <input type="text" class="form-control text-center" id="username" name="username"
                            placeholder="username" tabindex="-1">
                    </div>
                    <div class="input-group form-group mb-0 add-email">
                        <div class="input-group-prepend">
                            <span class="input-group-text">
                                <i class="fas fa-envelope pl-1"></i>
                            </span>
                        </div>
                        <input type="text" class="form-control text-center" name="email" placeholder="email" id="email" tabindex="-1">
                    </div>
                    <div class="input-group form-group add-password mb-1">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="">
                                <i class="fas fa-key pl-1"></i>
                            </span>
                        </div>
                        <input type="password" class="form-control text-center" name="password" id="password" placeholder="password" tabindex="-1">
                    </div>
                    <div class="d-flex justify-content-end align-items-center create-account-show-password-wrapper">
                        <i class="far fa-circle mr-1 show-password"></i>
                        <i class="far fa-check-circle mr-1 show-password hide"></i>
                        <small class="show-password">Show Password</small>
                        <small class="show-password hide">Hide Password</small>
                    </div>
                    <div class="btn-group d-flex pt-2">
                        <button id="login-add-back-btn" type="button" class="btn btn-outline-light" tabindex="-1">
                            <i class="fas fa-chevron-left"></i>
                            <i class="fas fa-chevron-left ml-n2 mr-1"></i>
                            Go Back
                        </button>
                        <button id="login-add-create-btn" type="submit" class="btn btn-outline-light" disabled tabindex="-1">
                            Create
                            <i class="fas fa-chevron-right ml-1"></i>
                            <i class="fas fa-chevron-right ml-n2"></i>
                        </button>
                    </div>
                </form>
            `;
        
        // div.innerHTML = html;
        // console.log(createHeading('welcome-heading', 'Create an Account'));
        div.appendChild(createHeading('welcome-heading', 'Create an Account'));
        loginMainDiv.after(div);
        console.log('appended');
    }

    return {
        getSelectors: function() {
            return UISelectors;
        },
        createAddMode: addMode
    }

})();

export default UICtrl;