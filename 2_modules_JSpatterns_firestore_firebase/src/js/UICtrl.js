// UI Controller
const UICtrl = (function() {

    const UISelectors = {
        addUserBtn: '#login-add-btn',
        loginMainDiv: '.login-main-div',
        loginAddMode: '.login-add-mode',
        username: '#username',
        email: '#email',
        password: '#password',
        showHidePass: '.show-password',
        addBackBtn: '#login-add-back-btn',
        addCreateBtn: '#login-add-create-btn',
        addAccountForm: '#add-account-form',
        loginConfirmMode: '.login-add-confirm-message',
        confirmUser: '#confirm-username'
    }

    const createHeading = function(cssClass, headingTitle) {
        let heading = document.createElement('h2');
        heading.className = `display-4 text-center ${cssClass}`;
        heading.textContent = headingTitle;

        return heading;
    }

    const createPara = function(spanID, pText) {
        let p = document.createElement('p');
        p.className = 'lead text-center';
        p.innerHTML = `
            Account for user <span id="${spanID}" class="stand-out"></span> has been ${pText}
        `;

        return p;
    }

    const createForm = function(formID) {
        let form = document.createElement('form');
        form.className = 'mt-4';
        form.setAttribute('id', formID);
        form.setAttribute('autocomplete', 'off');

        return form;
    }

    const createInputGroup = function(inputClass, iconClass, inputType, inputID) {
        let div = document.createElement('div');
        div.className = `input-group form-group mb-0 ${inputClass}`;

        let html = `
        <div class="input-group-prepend">
            <span class="input-group-text" id="">
                <i class="fas ${iconClass}"></i>
            </span>
        </div>
        <input type="${inputType}" class="form-control text-center" id="${inputID}" name="${inputID}"
            placeholder="${inputID}" tabindex="-1">
        `;

        div.innerHTML = html;

        return div;
    }

    const createShowHidePassword = function(wrapperClass) {
        let div = document.createElement('div');
        div.className = `d-flex justify-content-end align-items-center ${wrapperClass}`;
        div.innerHTML = `
        <i class="far fa-circle mr-1 show-password"></i>
        <i class="far fa-check-circle mr-1 show-password hide"></i>
        <small class="show-password">Show Password</small>
        <small class="show-password hide">Hide Password</small>
        `;

        return div;
    }

    const createBtnGroup = function(btnOne, btnTwo) {
        let div = document.createElement('div');
        div.className = 'btn-group d-flex pt-2';
        div.appendChild(btnOne);
        div.appendChild(btnTwo);
        
        return div;
    }

    const createBtn = function(btnID, btnType, btnText, iconClass, left = true) {
        let btn = document.createElement('button');
        btn.className = 'btn btn-outline-light';
        btn.setAttribute('id', btnID);
        btn.setAttribute('type', btnType);
        btn.setAttribute('tabindex', '-1');
        if (left) {
            btn.innerHTML = `
                <i class="fas ${iconClass}"></i>
                <i class="fas ${iconClass} ml-n2 mr-1"></i>
                ${btnText}
            `;
        } else {
            btn.innerHTML = `
                ${btnText}
                <i class="fas ${iconClass} ml-1"></i>
                <i class="fas ${iconClass} ml-n2"></i>
            `;
        }

        return btn;
    }

    const showHidePass = function(target, password) {
        Array.from(target.parentElement.children).forEach((child) => {
			child.classList.toggle('hide');
		});
		//
		password.type === 'password' ? (password.type = 'text') : (password.type = 'password');
    }

    const addMode = function() {
        // 
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // create add div
        let div = document.createElement('div');
        div.className = `login-add-mode px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Create an Account'));
        div.appendChild(createForm('add-account-form'));
        div.lastElementChild.appendChild(createInputGroup('add-username', 'fa-user-edit', 'text', 'username'));
        div.lastElementChild.appendChild(createInputGroup('add-email', 'fa-envelope', 'text', 'email'));
        div.lastElementChild.appendChild(createInputGroup('add-password', 'fa-key', 'password', 'password'));
        div.lastElementChild.appendChild(createShowHidePassword('create-account-show-password-wrapper'));
        div.lastElementChild.appendChild(createBtnGroup(createBtn('login-add-back-btn', 'button', 'Go Back', 'fa-chevron-left'), createBtn('login-add-create-btn', 'submit', 'Create', 'fa-chevron-right', false)));

        div.querySelector(UISelectors.addCreateBtn).setAttribute('disabled', true);
        // append add div to dom
        loginMainDiv.after(div);
        console.log('appended');
    }

    const confirmMode = function() {
        // 
        const loginAddMode = document.querySelector(UISelectors.loginAddMode);
        // 
        let div = document.createElement('div');
        div.className = `login-add-confirm-message px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Account Created'));
        div.appendChild(createPara('confirm-username', 'created'));
        // 
        loginAddMode.after(div);
        console.log('appended confirm mode');
    }

    return {
        getSelectors: function() {
            return UISelectors;
        },
        createAddMode: addMode,
        showHidePass,
        createConfirmMode: confirmMode
    }

})();

export default UICtrl;