import { format } from 'date-fns';


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
        confirmUser: '#confirm-username',
        loginAccounts: '.login-accounts',
        removeUserBtn: '#login-remove-btn',
        loginRemoveMode: '.login-remove-choose',
        loginRemoveAccounts: '.login-remove-accounts',
        removeBackBtn: '#login-remove-back-btn',
        loginLoader: '#login-loader',
        loginWrapper: '.login-wrapper',
        welcomeHeader: '#welcome-header',
        leadTodayDate: '#lead-today-date',
        mainNavbar: '#main-navbar',
        mainBody: '#main-body',
        logOut: '#log-out',
        monthModeWrapper: '.month-mode-wrapper',
        weekModeWrapper: '.week-mode-wrapper',
        dayModeWrapper: '.day-mode-wrapper',
        lMonthArrow: '#l-month-arrow',
        rMonthArrow: '#r-month-arrow',
        lWeekArrow: '#l-week-arrow',
        rWeekArrow: '#r-week-arrow',
        lDayArrow: '#l-day-arrow',
        rDayArrow: '#r-day-arrow',
        taskTabs: '#task-tabs',
        dayModeContent: '#day-mode-content',
        tableBody: '#table-body',
        tableHead: '#table-head',
        tasks: '.tasks',
        listItem: '.list-group-item',
        logInConfirmBtn: '#login-confirm-login-btn',
        logInConfirmBackBtn: '#login-confirm-back-btn',
        logInConfirmAccount: '.login-confirm-account',
        logInConfirmMode: '.login-confirm',
        logInForm: '#login-form',
        errorPara: '.error'
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

    const createErrMsg = function() {
        let p = document.createElement('p');
        p.className = 'lead text-center error invalid hide mb-0';

        return p;
    }

    const createUl = function(ulClass) {
        let ul = document.createElement('ul');
        ul.className = `list-group ${ulClass} mx-auto w-100 mt-4`;

        return ul;
    }

    const createLi = function(className, liId) {
        let li = document.createElement('li');
		li.className = className;
        li.id = liId !== undefined ? liId : '';
        
		return li;
    }

    const createIcon = function(className) {
        const icon = document.createElement('i');
        icon.className = className;
        
		return icon;
    }

    const createForm = function(formID) {
        let form = document.createElement('form');
        form.className = 'mt-4';
        form.setAttribute('id', formID);
        form.setAttribute('autocomplete', 'off');

        return form;
    }

    const createInputGroup = function(inputClass, iconClass, inputType, inputID, placeholder, prepend = true) {
        let div = document.createElement('div');
        div.className = `input-group form-group mb-0 ${inputClass}`;
        let html = '';
        if (prepend) {
            html = `
            <div class="input-group-prepend">
                <span class="input-group-text" id="">
                    <i class="fas ${iconClass}"></i>
                </span>
            </div>
            <input type="${inputType}" class="form-control text-center" id="${inputID}" name="${inputID}"
                placeholder="${placeholder}" ${prepend ? 'tabindex="-1"' : ''}>
            `;
        } else {
            html = `
            <input type="${inputType}" class="form-control text-center" id="${inputID}" name="${inputID}"
                placeholder="${placeholder}" ${prepend ? 'tabindex="-1"' : ''}>
            `;
        }
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

    const createBtnGroup = function(...btns) {
        let div = document.createElement('div');
        div.className = 'btn-group d-flex pt-4';
        btns.forEach(btn => div.appendChild(btn));
        
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
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // create add div
        let div = document.createElement('div');
        div.className = `login-add-mode px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Create an Account'));
        div.appendChild(createForm('add-account-form'));
        div.lastElementChild.appendChild(createInputGroup('add-username', 'fa-user-edit', 'text', 'username', 'username'));
        div.lastElementChild.appendChild(createInputGroup('add-email', 'fa-envelope', 'text', 'email', 'email'));
        div.lastElementChild.appendChild(createInputGroup('add-password', 'fa-key', 'password', 'password', 'password'));
        div.lastElementChild.appendChild(createShowHidePassword('create-account-show-password-wrapper'));
        div.lastElementChild.appendChild(createErrMsg());
        div.lastElementChild.appendChild(createBtnGroup(createBtn('login-add-back-btn', 'button', 'Go Back', 'fa-chevron-left'), createBtn('login-add-create-btn', 'submit', 'Create', 'fa-chevron-right', false)));

        div.querySelector(UISelectors.addCreateBtn).setAttribute('disabled', true);
        // append add div to dom
        loginMainDiv.after(div);
        console.log('appended');
    }

    const confirmMode = function() {
        const loginAddMode = document.querySelector(UISelectors.loginAddMode);
        // Create confirmation div
        let div = document.createElement('div');
        div.className = `login-add-confirm-message px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Account Created'));
        div.appendChild(createPara('confirm-username', 'created'));
        // 
        loginAddMode.after(div);
        console.log('appended confirm mode');
    }

    const removeMode = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // Create remove div
        let div = document.createElement('div');
        div.className = `login-remove-choose px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Remove an Account'));
        div.appendChild(createUl('login-remove-accounts'));
        div.appendChild(createBtnGroup(createBtn('login-remove-back-btn', 'button', 'Go Back', 'fa-chevron-left')));
        // 
        loginMainDiv.after(div);
        console.log('appended remove mode');
    }

    const logInMode = function(id) {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // Create log in div
        let div = document.createElement('div');
        div.className = `login-confirm px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Log In'));
        div.appendChild(createUl('login-confirm-account')); 
        div.appendChild(createForm('login-form'));
        div.lastElementChild.appendChild(createInputGroup('login-email', 'fa-key', 'text', 'email', 'email', false));
        div.lastElementChild.appendChild(createInputGroup('login-password', 'fa-key', 'password', 'password', 'password', false));
        div.lastElementChild.appendChild(createShowHidePassword('login-show-password-wrapper'));
        div.lastElementChild.appendChild(createErrMsg());
        div.lastElementChild.appendChild(createBtnGroup(createBtn('login-confirm-back-btn', 'button', 'Go Back', 'fa-chevron-left'), createBtn('login-confirm-login-btn', 'submit', 'Log In', 'fa-chevron-right', false)));

        // div.querySelector(UISelectors.logInConfirmBtn).setAttribute('disabled', true);
        // append add div to dom
        loginMainDiv.after(div);
        // 
        document.querySelector(UISelectors.logInConfirmAccount).appendChild(renderLiAccount(id,  'mb-n4'));
        console.log('login mode');
    }

    const loginLoader = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        let div = document.createElement('div');
        div.setAttribute('id', 'login-loader');
        div.innerHTML = `
            <div class="loadingio-spinner-double-ring-qvrskz4wwq">
                    <div class="ldio-voeg20dzl7">
                        <div></div>
                        <div></div>
                        <div>
                            <div></div>
                        </div>
                        <div>
                            <div></div>
                        </div>
                    </div>
                </div>
        `;
        loginMainDiv.after(div);
        console.log('login loader');
    }

    const renderLiAccount = function(liID, liClass = '') {
        let li = createLi(
            `list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 ${liClass}`,
            liID
        );
        li.appendChild(createIcon('fas fa-user show'));
        li.appendChild(createIcon('fas fa-user-times hide'));
        li.appendChild(document.createTextNode(liID));
        li.appendChild(createIcon('fas fa-chevron-right show'));
        li.appendChild(createIcon('fas fa-times hide'));

        return li;
    }

    const renderLoginAccounts = function(accNum, accArr, listSelector) {
        if (accNum) {
			accArr.forEach((account) => {
                const accountObj = account.data();
				document.querySelector(listSelector).appendChild(renderLiAccount(accountObj.name));
			});
		} else {
			let li = createLi('list-group-item py-2');
			li.appendChild(document.createTextNode(`No accounts in the database`));
			document.querySelector(listSelector).appendChild(li);
			document.querySelector(listSelector).classList.add('empty');
        }
    }

    const renderListElements = function(listStart, listEnd) {
        Array.from(document.querySelector(listStart).children).forEach((li) => {
			Array.from(li.children).forEach((i) => {
				if (i.classList.contains('show')) {
                    i.classList.remove('show');
                    i.classList.add('hide');
				} else {
                    i.classList.remove('hide');
                    i.classList.add('show');
				}
			});
			document.querySelector(listEnd).appendChild(li);
		});
    }

    const setTableBodyHead = function(body = '', head = '') {
		document.querySelector(UISelectors.tableBody).innerHTML = body;
		document.querySelector(UISelectors.tableHead).innerHTML = head;
	}

    const renderTableUI = function() {
        setTableBodyHead();
        document.querySelector(UISelectors.tableBody).append(createUl('tasks text-light p-3'));
		document.querySelector(UISelectors.tableBody).setAttribute('class', 'day-mode');
    }

    const displayTasks = function(tasks, currToday, enableDnD) {
        if (tasks) {
            tasks.some(task => {
                console.log(task.data());
                console.log(format(new Date(), "d'-'MMM'-'yyyy"));
                console.log(task.data()[format(currToday, "d'-'MMM'-'yyyy")]);
                if (task.data()[format(currToday, "d'-'MMM'-'yyyy")]) {
                    task.data()[format(currToday, "d'-'MMM'-'yyyy")].forEach((task, index) => {
                        console.log(task);
                        generateDayTemplate(task, index, enableDnD);
                    })
                    // 
                    // 
                    return true;
                }
            })
        }
    }

    const generateDayTemplate = function(task, index, enableDnD) {
        let list = document.querySelector(UISelectors.tasks);
        let li = createLi('list-group-item d-flex justify-content-between align-items-center', `task${index}`);
        // 
        let divIconComplete = document.createElement('div');
		divIconComplete.className = 'd-flex justify-content-between align-items-center';
		divIconComplete.appendChild(createIcon('far fa-circle uncompleted'));
		divIconComplete.appendChild(createIcon('far fa-check-circle completed hide'));
        li.appendChild(divIconComplete);
        // 
        let divText = document.createElement('div');
		divText.className = 'lead';
		divText.appendChild(document.createTextNode(task));
        li.appendChild(divText);
        // 
        let divIcon = document.createElement('div');
		divIcon.className = 'd-flex justify-content-between align-items-center';
		divIcon.appendChild(createIcon('fas fa-edit mr-1 edit'));
		divIcon.appendChild(createIcon('fas fa-keyboard mr-2 fa-2x ongoing-edit text-danger hide'));
		divIcon.appendChild(createIcon('far fa-trash-alt delete'));
        li.appendChild(divIcon);
        // 
        enableDnD(li);
		//
		list.appendChild(li);
    }

    return {
        getSelectors: function() {
            return UISelectors;
        },
        createAddMode: addMode,
        createConfirmMode: confirmMode,
        createRemoveMode: removeMode,
        createLoginLoader: loginLoader,
        createLogInMode: logInMode,
        showHidePass,
        renderLoginAccounts,
        renderListElements,
        setTableBodyHead,
        renderTableUI,
        displayTasks
    }

})();

export default UICtrl;