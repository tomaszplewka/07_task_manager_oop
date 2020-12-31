// 
// UI Controller
// 
import DnDCtrl from './DnDCtrl';
import { format, isToday, subDays, parse, addWeeks, eachDayOfInterval, getDate } from 'date-fns';
import $ from 'jquery';
// 
const UICtrl = (function(DnDCtrl) {
    // Initialize global variables
    const vars = {
        months: { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' }
    }
    const UISelectors = {
        addUserBtn: '#add-user-btn',
        loginBtn: '#login-btn',
        loginMainDiv: '.login-main-div',
        loginAddMode: '.login-add-mode',
        username: '#username',
        email: '#email',
        password: '#password',
        showHidePass: '.show-password',
        addBackBtn: '#login-add-back-btn',
        addCreateBtn: '#login-add-create-btn',
        addAccountForm: '#add-account-form',
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
        logInConfirmBackBtn: '#login-confirm-back-btn',
        logInConfirmMode: '.login-confirm',
        logInForm: '#login-form',
        errorPara: '.error',
        addOption: '#add-icon-primary',
        addForm: '.add',
        addFormWrapper: '#add-form-wrapper',
        addFormInputs: '.add input',
        searchTasks: '#search-icon-primary',
        searchForm: '.search-form',
        searchFormWrapper: '#search-form-wrapper',
        leadTaskNum: '#lead-task-number',
        weekModeView: '#week-mode-btn',
        weekModeContent: '#week-mode-content',
        mainOptionsBtns: '#main-options-btn',
        dayModeView: '#day-mode-btn',
        monthModeView: '#month-mode-btn',
        monthModeMonth: '#month-mode-month',
        monthModeYear: '#month-mode-year',
        taskTabsOngoing: '#task-tabs-ongoing',
        taskTabsCompleted: '#task-tabs-completed',
        leadTaskCompletedNum: '#lead-task-completed',
        settings: '#settings',
        settingsWrapper: '#settings-wrapper',
        settingsCloseBtn: '#settings-close-btn',
        themeBtnsWrapper: '#theme-btns-wrapper',
        themeBtns: '.theme',
        avatarBtns: '.avatar',
        toastBtns: '.toast-change',
        avatarBtnsWrapper: '#avatar-btns-wrapper',
        userAvatar: '#user-avatar',
        toastBtnsWrapper: '#toast-btns-wrapper',
        deleteAccountBtn: '#delete-account',
        deleteAccountWrapper: '#delete-account-wrapper',
        deleteAccountCloseBtn: '#delete-account-close-btn',
        deleteAccountForm: '#delete-account-form',
        deleteAccountEmail: '#delete-email',
        deleteAccountPassword: '#delete-password',
        deleteAccountErrorPara: '#delete-account-form .error',
        delete: '.delete',
        moreOptionsBtn: '#more-options-btn',
        userNavbar: '#user-btn',
        taskProgress: '#task-progress',
        selectAllOptions: '#select-all-options',
        selectAllBtn: '#select-all-btn',
        markAsBtn: '#mark-as-btn',
        deleteBtn: '#delete-btn',
        deselectBtn: '#deselect-btn',
        pickDate: '#pick-date',
        pickDateFormWrapper: '#pick-date-form-wrapper',
        pickDatePickMode: '#pick-date-pick-mode',
        dateToasts: '.date-toasts',
        pickDateTodayBtn: '#pick-date-today-btn',
        toastMsgWrapper: '#toast-message-wrapper',
        toastCloseBtn: '#toast-close-btn',
        alertMsgWrapper: '#alert-message-wrapper',
        listPastTasks: '.past-tasks',
        alertCloseBtn: '#alert-close-btn',
        notifications: '#notifications',
        navNotifications: '.nav-notifications',
        alertAppendBtn: '#alert-append-btn',
        alertCompleteBtn: '#alert-complete-btn',
        alertDisposeBtn: '#alert-dispose-btn',
        addTaskInput: '#add-task-input',
        addTaskSubmit: '#add-task-submit',
        searchTaskInput: '#search-task-input',
        mainDivMsg: '#main-div-msg',
        taskDivMsg: '#task-div-msg',
        settingsDivMsg: '#settings-div-msg',
        pastTasksDivMsg: '#past-tasks-div-msg',
        deleteDivMsg: '#delete-div-msg',
        focusguardPastTask: '.focusguard-past-task',
        focusguardPastTask1: '#focusguard-past-task-1',
        focusguardPastTask2: '#focusguard-past-task-2',
        focusguardSettings: '.focusguard-settings',
        focusguardSettings1: '#focusguard-settings-1',
        focusguardSettings2: '#focusguard-settings-2',
        focusguardDeleteAccount: '.focusguard-delete-account',
        focusguardDeleteAccount1: '#focusguard-delete-account-1',
        focusguardDeleteAccount2: '#focusguard-delete-account-2',
        focusguardToast: '.focusguard-toast',
        focusguardToast1: '#focusguard-toast-1',
        focusguardToast2: '#focusguard-toast-2',
        dayProgress: '#day-progress',
        taskProgressWrapper: '#task-progress-wrapper'
    }
    const createHeading = function(cssClass, headingTitle) {
        let heading = document.createElement('h2');
        heading.className = `display-4 text-center ${cssClass}`;
        heading.textContent = headingTitle;
        return heading;
    }
    const createErrPara = function() {
        let p = document.createElement('p');
        p.className = 'text-center error invalid hide mb-0';
        return p;
    }
    const createUl = function(ulClass) {
        let ul = document.createElement('ul');
        ul.className = `list-group ${ulClass} mx-auto w-100 my-2`;
        return ul;
    }
    const createListWithMsg = function(selector, message) {
        let list = document.querySelector(selector);
        let li = createLi('list-group-item d-flex justify-content-center align-items-center');
        let p = document.createElement('p');
        p.className = 'lead text-center m-0';
        p.appendChild(document.createTextNode(message));
        li.appendChild(p);
        list.appendChild(li);
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
                <input type="${inputType}" class="validate form-control text-center" id="${inputID}" name="${inputID}" placeholder="${placeholder}">
            `;
        } else {
            html = `
                <input type="${inputType}" class="validate form-control text-center" id="${inputID}" name="${inputID}" placeholder="${placeholder}">
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
    const createAddMode = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // 
        let div = document.createElement('div');
        div.className = `login-add-mode px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Create an Account'));
        div.appendChild(createForm('add-account-form'));
        div.lastElementChild.appendChild(createInputGroup('add-username', 'fa-user-edit', 'text', 'username', 'username'));
        div.lastElementChild.appendChild(createInputGroup('add-email', 'fa-envelope', 'text', 'email', 'email'));
        div.lastElementChild.appendChild(createInputGroup('add-password', 'fa-key', 'password', 'password', 'password'));
        div.lastElementChild.appendChild(createShowHidePassword('create-account-show-password-wrapper'));
        div.lastElementChild.appendChild(createErrPara());
        div.lastElementChild.appendChild(createBtnGroup(createBtn('login-add-back-btn', 'button', 'Go Back', 'fa-chevron-left'), createBtn('login-add-create-btn', 'submit', 'Create', 'fa-chevron-right', false)));
        div.querySelector(UISelectors.addCreateBtn).setAttribute('disabled', true);
        // 
        loginMainDiv.after(div);
    }
    const createLogInMode = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // 
        let div = document.createElement('div');
        div.className = `login-confirm px-4 pt-3 pb-4`;
        div.appendChild(createHeading('welcome-heading', 'Log In'));
        div.appendChild(createForm('login-form'));
        div.lastElementChild.appendChild(createInputGroup('login-email', 'fa-envelope', 'text', 'email', 'email'));
        div.lastElementChild.appendChild(createInputGroup('login-password', 'fa-key', 'password', 'password', 'password'));
        div.lastElementChild.appendChild(createShowHidePassword('login-show-password-wrapper'));
        div.lastElementChild.appendChild(createErrPara());
        div.lastElementChild.appendChild(createBtnGroup(createBtn('login-confirm-back-btn', 'button', 'Go Back', 'fa-chevron-left'), createBtn('login-confirm-login-btn', 'submit', 'Log In', 'fa-chevron-right', false)));
        // 
        loginMainDiv.after(div);
    }
    const createLoginLoader = function() {
        const loginMainDiv = document.querySelector(UISelectors.loginMainDiv);
        // 
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
        // 
        loginMainDiv.after(div);
    }
    const setTableBodyHead = function(head = true) {
        let tableHead;
        if (!head) {
            tableHead = 
            `
                <tr>
                    <th>Sun</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                    <th>Sat</th>
                </tr>
            `;
        } else {
            tableHead = '';
        }
        document.querySelector(UISelectors.tableBody).innerHTML = '';
        document.querySelector(UISelectors.tableHead).innerHTML = tableHead;
    }
    const renderTableUI = function() {
        setTableBodyHead();
        document.querySelector(UISelectors.tableBody).append(createUl('tasks text-light'));
    }
    const showHidePass = function(target, password) {
        Array.from(target.parentElement.children).forEach((child) => {
			child.classList.toggle('hide');
		});
		password.type === 'password' ? (password.type = 'text') : (password.type = 'password');
    }
    const renderDayModeCalendar = function(currToday, tasks, updateAllTasks, ongoing = true) {
        // Adjust UI display
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: block !important');
		document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'flex';
        if (document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.remove('hide');
            document.querySelector(UISelectors.taskTabs).classList.remove('hide');
            document.querySelector(UISelectors.taskProgressWrapper).classList.remove('hide');
            // Handle buttons
            handleDisabledStateBtn(["lWeekArrow", "rWeekArrow", "lMonthArrow", "monthModeMonth", "rMonthArrow"]);
            handleDisabledStateBtn(["lDayArrow", "rDayArrow", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
        }
        // Day mode is active
        document.querySelector('body').setAttribute('class', 'day-mode-active');
        document.querySelector(UISelectors.dayModeView).classList.add('active');
        document.querySelector(UISelectors.weekModeView).classList.remove('active');
        document.querySelector(UISelectors.monthModeView).classList.remove('active');
        // Set vars on welcome screen
        document.querySelector(UISelectors.dayModeContent).textContent = `
            ${format(currToday, "d MMMM yyyy, EEEE")}
        `;
        // Adjust table head & body
        renderTableUI();
        // Display tasks
        if (ongoing) {
            const taskNum = displayTasks(currToday, tasks, updateAllTasks, DnDCtrl.enableDnD);
            if (taskNum) {
                document.querySelector(UISelectors.leadTaskNum).textContent = taskNum;
            } else {
                document.querySelector(UISelectors.leadTaskNum).textContent = 0;
            }
            // Disable searching if no tasks to display
            if (!(tasks === undefined)) {
                if (tasks[format(currToday, "d'-'MMM'-'yyyy")] === undefined) {
                    document.querySelector(UISelectors.searchForm).searchInput.classList.add('disabled');
                } else {
                    document.querySelector(UISelectors.searchForm).searchInput.classList.remove('disabled');
                }
            }
        } else {
            const taskNum = displayTasks(currToday, tasks, updateAllTasks, DnDCtrl.enableDnD, false);
            if (taskNum) {
                document.querySelector(UISelectors.leadTaskCompletedNum).textContent = taskNum;
            } else {
                document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
            }
        }
        // Enable/disable left day arrow
        const today = retrieveDayDate();
		if (today < subDays(new Date(), 30)) {
			document.querySelector(UISelectors.lDayArrow).disabled = true;
		} else { document.querySelector(UISelectors.lDayArrow).disabled = false }
    }
    const displayTasks = function(currToday, tasks, updateAllTasks, enableDnD, ongoing = true) {
        // Format current day
        currToday = format(currToday, "d'-'MMM'-'yyyy");
        // Check tasks
        if (!(tasks === undefined) && (tasks[currToday] !== undefined) && (tasks[currToday].length !== 0)) {
            Array.from(tasks[currToday]).forEach((task, index) => {
                generateDayTemplate(task, index, enableDnD, currToday, updateAllTasks, ongoing);
            });
            return tasks[currToday].length;
        } else {
            // No tasks to display for this date
            createListWithMsg(UISelectors.tasks, 'No tasks to display');
            return 0;
        }
    }
    const generateDayTemplate = function(task, index, enableDnD, currToday, updateAllTasks, ongoing = true) {
        // Create list item
        let list = document.querySelector(UISelectors.tasks);
        let li = createLi('list-group-item d-flex justify-content-between align-items-center task-item', `task${index}`);
        // Create div with complete / uncomplete icons
        let divIconComplete = document.createElement('div');
        divIconComplete.className = 'd-flex justify-content-between align-items-center';
        if (ongoing) {
            divIconComplete.appendChild(createIcon('far fa-circle uncompleted'));
            divIconComplete.appendChild(createIcon('far fa-check-circle completed hide'));
        } else {
            divIconComplete.appendChild(createIcon('far fa-circle uncompleted hide'));
            divIconComplete.appendChild(createIcon('far fa-check-circle completed'));
        }
        li.appendChild(divIconComplete);
        // Create div with text node (task name)
        let divText = document.createElement('div');
        divText.appendChild(document.createTextNode(task));
        divText.className = 'p-1';
        li.appendChild(divText);
        // Create div with edit & delete icons
        let divIcon = document.createElement('div');
        divIcon.className = 'd-flex justify-content-between align-items-center';
        if (ongoing) {
            divIcon.appendChild(createIcon('fas fa-edit mr-1 edit'));
            divIcon.appendChild(createIcon('fas fa-keyboard mr-2 fa-2x ongoing-edit text-danger hide'));
        }
		divIcon.appendChild(createIcon('far fa-trash-alt delete'));
        li.appendChild(divIcon);
        // Enable DnD feature
        enableDnD(li, currToday, updateAllTasks);
		// Append task item
		list.appendChild(li);
    }
    const renderWeekModeCalendar = function(currFirstDayOfWeek, tasks) {
        // Adjust week mode display
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: block !important');
        document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'none';
        if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
            document.querySelector(UISelectors.taskTabs).classList.add('hide');
            document.querySelector(UISelectors.taskProgressWrapper).classList.add('hide');
        }
        // Handle buttons
        handleDisabledStateBtn(["lDayArrow", "rDayArrow", "lMonthArrow", "monthModeMonth", "rMonthArrow", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
        handleDisabledStateBtn(["lWeekArrow", "rWeekArrow"], false);
        // Week mode is active
        document.querySelector('body').setAttribute('class', 'week-mode-active');
        document.querySelector(UISelectors.dayModeView).classList.remove('active');
        document.querySelector(UISelectors.weekModeView).classList.add('active');
        document.querySelector(UISelectors.monthModeView).classList.remove('active');
        // Generate correct week
        const firstDayNextWeek = addWeeks(currFirstDayOfWeek, 1);
        const week = eachDayOfInterval({
            start: currFirstDayOfWeek,
            end: subDays(firstDayNextWeek, 1)
        });
        // Adjust table body & header
        setTableBodyHead(false);
        // Generate week template
        document.querySelector(UISelectors.weekModeContent).textContent = 
        `
            ${getDate(currFirstDayOfWeek)} ${format(currFirstDayOfWeek, 'MMMM yyyy')} - 
            ${getDate(subDays(firstDayNextWeek, 1))} ${format(subDays(firstDayNextWeek, 1), 'MMMM yyyy')}
        `;
        generateWeekTemplate(week, tasks);
    }
    const generateWeekTemplate = function(week, taskList) {
        // Create week template
        let row = document.createElement('tr');
        week.forEach(day => {
            let td = document.createElement('td');
            td.innerHTML = `${format(day, "d MMM")}`;
            if (isToday(day)) {
                td.classList.add('current-day');
                row.classList.add('current-week');
            }
            if (new Date(day.getFullYear(), day.getMonth(), day.getDate()) < subDays(new Date(), 31)) {
                td.classList.add('invalid-day');
                row.classList.add('invalid-week');
			} else { td.classList.add('valid-day'); }
            // Add badge
            if (taskList[format(day, "d'-'MMM'-'yyyy")] !== undefined && taskList[format(day, "d'-'MMM'-'yyyy")].length) {
                td = addBadge(td, taskList[format(day, "d'-'MMM'-'yyyy")].length);
            }
			// Append day
            row.append(td);
        });
        // Append week
		document.querySelector(UISelectors.tableBody).append(row);
		// Enable/disable left week arrow
		if (row.classList.contains('invalid-week')) {
            document.querySelector(UISelectors.lWeekArrow).disabled = true;
		} else {
			document.querySelector(UISelectors.lWeekArrow).disabled = false;
		}
    }
    const renderMonthModeCalendar = function(year, month, today, tasks) {
        // Adjust UI display
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: block !important');
        document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'none';
        if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
            document.querySelector(UISelectors.taskTabs).classList.add('hide');
            document.querySelector(UISelectors.taskProgressWrapper).classList.add('hide');
        }
        // Handle buttons
        handleDisabledStateBtn(["lDayArrow", "rDayArrow", "lWeekArrow", "rWeekArrow", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
        handleDisabledStateBtn(["lMonthArrow", "monthModeMonth", "rMonthArrow"], false);
        // Adjust current date
        document.querySelector(UISelectors.monthModeMonth).options[month].selected = true;
        document.querySelector(UISelectors.monthModeYear).textContent = year;
        // Month mode is active
        document.querySelector('body').setAttribute('class', 'month-mode-active');
        document.querySelector(UISelectors.dayModeView).classList.remove('active');
        document.querySelector(UISelectors.weekModeView).classList.remove('active');
        document.querySelector(UISelectors.monthModeView).classList.add('active');
        // Adjust months in select
		if (month === 0) {
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = vars.months[11];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = vars.months[month + 1];
		} else if (month === 11) {
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = vars.months[month - 1];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = vars.months[0];
		} else {
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = vars.months[month - 1];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = vars.months[month + 1];
		}
		if (Number(document.querySelector(UISelectors.monthModeYear).textContent) === today.getFullYear()) {
			Array.from(document.querySelector(UISelectors.monthModeMonth).options)
            .filter(month => month.index < subDays(today, 30).getMonth())
            .forEach(month => { month.classList.add('hide') });
		} else {
            Array.from(document.querySelector(UISelectors.monthModeMonth).options)
            .forEach(curr => { curr.classList.remove('hide') });
		}
        // Adjust table body & header
        setTableBodyHead(false);
        // Generate month template
        generateMonthTemplate(year, month, today, tasks);
		// Enable/disable left month arrow
		if (document.querySelector(UISelectors.monthModeMonth).selectedIndex === subDays(today, 30).getMonth() && (new Date()).getFullYear() === Number(document.querySelector(UISelectors.monthModeYear).textContent.trim())) {
			document.querySelector(UISelectors.lMonthArrow).disabled = true;
		} else { document.querySelector(UISelectors.lMonthArrow).disabled = false }
    }
    const generateMonthTemplate = function(year, month, today, tasks) {
        // Set local vars
        let startOfCurrMonth = new Date(year, month).getDay();
		let numOfDayCurrMonth = 32 - new Date(year, month, 32).getDate();
		let numOfDayPrevMonth = 32 - new Date(year, month - 1, 32).getDate();
		if (numOfDayPrevMonth === -1) {
			numOfDayPrevMonth = 1;
		}
		let renderDaysNumCurrMonth = 1;
		let renderDaysNumPrevMonth = numOfDayPrevMonth - startOfCurrMonth + 1;
		let renderDaysNumNextMonth = 1;
        let flag = 0;
		// Render calendar
		let i = 0;
		while (flag >= 0) {
            let row = document.createElement('tr');
            let j;
			for (j = 0; j < 7; j++) {
				if (i === 0 && j < startOfCurrMonth) {
                    let td = document.createElement('td');
                    td.classList.add('disabled');
					td.textContent = renderDaysNumPrevMonth;
					row.append(td);
					renderDaysNumPrevMonth++;
				} else if (renderDaysNumCurrMonth > numOfDayCurrMonth) {
					flag--;
					if (j === 0) {
						break;
					}
                    let td = document.createElement('td');
                    td.classList.add('disabled');
					td.textContent = renderDaysNumNextMonth;
					row.append(td);
					renderDaysNumNextMonth++;
				} else {
					let td = document.createElement('td');
					td.textContent = renderDaysNumCurrMonth;
					if (renderDaysNumCurrMonth === today.getDate() &&
						year === today.getFullYear() &&
						month === today.getMonth()) {
                        td.classList.add('current-day')
                        row.classList.add('current-week');
					}
					if (new Date(year, month, renderDaysNumCurrMonth) <
						subDays(today, 31)) {
                        td.classList.add('invalid-day');
                    } else { td.classList.add('valid-day') }
                    // Add badge
                    if (tasks[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")] !== undefined && tasks[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length) {
                        td = UICtrl.addBadge(td, tasks[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length);
                    }
					// Append day
					row.append(td);
					renderDaysNumCurrMonth++;
				}
            }
            if (j !== 0) {
                // Append week
                document.querySelector(UISelectors.tableBody).append(row);
                i++;
            }
		}
    }
    const createMsg = function(text) {
        const msg = document.createElement('p');
        msg.classList.add('m-0');
        msg.appendChild(document.createTextNode(text));
        return msg;
    }
    const checkPastOngoingTasks = function(tasks) {
        let pastDates = [];
        let pastTasks = [];
        for (const key in tasks) {
            // Get current date
            const date = parse(key, "d'-'MMM'-'yyyy", new Date());
            if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate()) && tasks[key].length) {
                // Append past date
                pastDates.push(date);
            }
        }
        // Sort in ascending order
        pastDates.sort((a, b) => a - b);
        // Loop through past dates & append list item
        pastDates.forEach(pastDate => {
            pastTasks.push(format(pastDate, "d'-'MMM'-'yyyy"));
            let li = createLi('list-group-item d-flex justify-content-center align-items-center task-item');
            li.textContent = format(pastDate, "d'-'MMM'-'yyyy");
            document.querySelector(UISelectors.listPastTasks).appendChild(li);
        });
        // Show alert if there are any past tasks
        if (pastTasks.length) {
            document.querySelector(UISelectors.alertMsgWrapper).style.display = 'flex';
            document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 1;
            document.querySelector('body').style.overflow = 'hidden';
            document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
            document.querySelector(UISelectors.navNotifications).style.display = 'inline-flex';
            document.querySelector(UISelectors.navNotifications).textContent = 1;
            document.querySelector(UISelectors.notifications).classList.remove('disabled');
            // Add tabindex
            handleTabindex(UISelectors.focusguardPastTask, "0", '');
            // Set focus
            document.querySelector(UISelectors.focusguardPastTask1).focus();
        }
        return pastTasks;
    }
    const addToast = function(selector, id, text, role = 'status', ariaLive = 'polite', autohide = false, delay = 500, msgClass = '') {
        document.querySelector(UISelectors[selector]).innerHTML += 
        `
            <div class="toast m-0" id="${id}" role="${role}" aria-live="${ariaLive}" aria-atomic="true" data-autohide="${autohide}" data-animation="true" data-delay="${delay}">
                <div class="${msgClass} toast-header justify-content-center p-2 pr-0 position-relative text-center">
                    <span>${text}</span>
                    <button type="button" class="ml-auto mb-1 close" data-dismiss="toast" aria-label="Close">
                        <span class="x p-0" aria-hidden="true">&times;</span>
                    </button>
                </div>
            </div>
        `;
        $(`${UISelectors[selector]} .toast`).toast('show');
    }
    const addMsgToast = function(selector, id, text, role = 'status', ariaLive = 'polite', autohide = false, delay = 500, msgClass = '') {
        // Clear messages first
        document.querySelector(UISelectors[selector]).innerHTML = '';
        // Show message toast
        addToast(selector, id, text, role, ariaLive, autohide, delay, msgClass);
    }
    const addBadge = function(td, number) {
        let span = document.createElement('span');
        span.className = 'badge badge-pill custom-badge';
        span.textContent = number;
        td.appendChild(span);
        return td
    }
    const setTheme = function(main, secondary, td, currWeekHover, rowHover, currDay, badge, bg) {
		const root = document.documentElement;
		root.style.setProperty('--theme1-main-color', main);
		root.style.setProperty('--theme1-secondary-color', secondary);
		root.style.setProperty('--theme1-td-color', td);
		root.style.setProperty('--theme1-currweek-hover-color', currWeekHover);
		root.style.setProperty('--theme1-row-hover-color', rowHover);
		root.style.setProperty('--theme1-currday-color', currDay);
		root.style.setProperty('--theme1-badge-color', badge);
		root.style.setProperty('--theme1-bg-color', bg);
    }
    const chooseTheme = function(theme) {
		switch (theme) {
			case 'theme-1':
				setTheme('#343a40', '#6c757d', '#454d55', '#dee2e6', '#dee2e6', '#000000', '#007bff', '#000000');
                document.querySelector('#' + theme).classList.add('theme-active');
				break;
			case 'theme-2':
				setTheme('#666a86', '#788aa3', '#ffc800', '#b2c9ab', '#b2c9ab', '#788aa3', '#ff8427', '#92b6b1');
				document.querySelector('#' + theme).classList.add('theme-active');
				break;
			case 'theme-3':
				setTheme('#221E22', '#876327', '#EE5622', '#44355B', '#31263E', '#ECA72C', '#F06536', '#554125');
				document.querySelector('#' + theme).classList.add('theme-active');
				break;
			case 'theme-4':
				setTheme('#291528', '#9e829c', '#3a3e3b', '#9e829c', '#9e829c', '#93b7be', '#000000', '#93b7be');
				document.querySelector('#' + theme).classList.add('theme-active');
				break;
			case 'theme-5':
				setTheme('#f7a9a8', '#ef798a', '#087ca7', '#05b2dc', '#988b8e', '#05b2dc', '#e5c3d1', '#988b8e');
				document.querySelector('#' + theme).classList.add('theme-active');
				break;
			case 'theme-6':
				setTheme('#3d315b', '#444b6e', '#708b75', '#eee5e5', '#9ab87a', '#ddcecd', '#444b6e', '#ddcecd');
				document.querySelector('#' + theme).classList.add('theme-active');
                break;
			case 'theme-7':
				setTheme('#A37A74', '#607466', '#CAD5CA', '#E49273', '#F8F0FB', '#6320EE', '#211A1D', '#8075FF');
				document.querySelector('#' + theme).classList.add('theme-active');
                break;
			case 'theme-8':
				setTheme('#426A5A', '#B7B5B3', '#0FA3B1', '#0FA3B1', '#394053', '#E5E7E6', '#B80C09', '#6B2B06');
				document.querySelector('#' + theme).classList.add('theme-active');
				break;
		}
    }
    const chooseAvatar = function(avatar) {
		switch (avatar) {
			case 'avatar-1':
                document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-2':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-3':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-4':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-5':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-6':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-7':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-8':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-9':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-10':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-11':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-12':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-13':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
			case 'avatar-14':
				document.querySelector('#' + avatar).classList.add('avatar-active');
				break;
		}
    }
    const chooseToast = function(toast) {
		switch (toast) {
			case 'toast-change-1':
                document.querySelector('#' + toast).classList.add('toast-active');
				break;
			case 'toast-change-2':
				document.querySelector('#' + toast).classList.add('toast-active');
				break;
			case 'toast-change-3':
				document.querySelector('#' + toast).classList.add('toast-active');
				break;
			case 'toast-change-4':
				document.querySelector('#' + toast).classList.add('toast-active');
				break;
		}
    }
    const enableDisableCreateBtn = function() {
        if (document.querySelector(UISelectors.username).classList.contains('valid') &&
            document.querySelector(UISelectors.email).classList.contains('valid') &&
            document.querySelector(UISelectors.password).classList.contains('valid')) {
            document.querySelector(UISelectors.addCreateBtn).disabled = false;
        } else {
            document.querySelector(UISelectors.addCreateBtn).disabled = true;
        }
    }
    const errorSignUpAll = function(error, errorHandler, data) {
        const { errorMsg, errorUsername, errorEmail, errorPass } = errorHandler(error.code);
        switch (true) {
            case (errorUsername === 1 && errorEmail === 1 && errorPass === 1):
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.username.classList.add('invalid');
                data.email.classList.add('invalid');
                data.pass.classList.add('invalid');
                data.username.disabled = true;
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.username.classList.remove('invalid');
                    data.email.classList.remove('invalid');
                    data.pass.classList.remove('invalid');
                    data.username.classList.remove('valid');
                    data.email.classList.remove('valid');
                    data.pass.classList.remove('valid');
                    data.username.disabled = false;
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
            case errorEmail === 1:
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.email.classList.add('invalid');
                data.username.disabled = true;
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.username.classList.remove('invalid');
                    data.email.classList.remove('invalid');
                    data.pass.classList.remove('invalid');
                    data.username.classList.remove('valid');
                    data.email.classList.remove('valid');
                    data.pass.classList.remove('valid');
                    data.username.disabled = false;
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
            case pass === 1:
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.pass.classList.add('invalid');
                data.username.disabled = true;
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.username.classList.remove('invalid');
                    data.email.classList.remove('invalid');
                    data.pass.classList.remove('invalid');
                    data.username.classList.remove('valid');
                    data.email.classList.remove('valid');
                    data.pass.classList.remove('valid');
                    data.username.disabled = false;
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
        }
    }
    const errorSignUpSingleInput = function(data, msg) {
        let p = document.createElement('p');
        p.className = "text-center invalid mb-0"
        p.textContent = msg;
        data.errorPara.appendChild(p);
        data.errorPara.classList.remove('hide');
        data.username.disabled = true;
        data.email.disabled = true;
        data.pass.disabled = true;
        setTimeout(() => {
            data.errorPara.classList.add('hide');
            data.username.classList.remove('invalid');
            data.email.classList.remove('invalid');
            data.pass.classList.remove('invalid');
            data.username.classList.remove('valid');
            data.email.classList.remove('valid');
            data.pass.classList.remove('valid');
            data.username.disabled = false;
            data.email.disabled = false;
            data.pass.disabled = false;
        }, 5000);
    }
    const errorLogInAll = function(error, errorHandler, data) {
        const { errorMsg, errorEmail, errorPass } = errorHandler(error.code);
        switch (true) {
            case data.email.value === '' && data.pass.value === '':
                data.errorPara.innerHTML = "No email and password provided.";
                data.errorPara.classList.remove('hide');
                data.email.classList.add('invalid');
                data.pass.classList.add('invalid');
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.email.classList.remove('invalid');
                    data.pass.classList.remove('invalid');
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
            case errorEmail === 1 && errorPass === 1:
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.email.classList.add('invalid');
                data.pass.classList.add('invalid');
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.email.classList.remove('invalid');
                    data.pass.classList.remove('invalid');
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
            case errorEmail === 1:
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.email.classList.add('invalid');
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.email.classList.remove('invalid');
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
            case errorPass === 1:
                data.errorPara.innerHTML = errorMsg;
                data.errorPara.classList.remove('hide');
                data.pass.classList.add('invalid');
                data.email.disabled = true;
                data.pass.disabled = true;
                setTimeout(() => {
                    data.errorPara.classList.add('hide');
                    data.pass.classList.remove('invalid');
                    data.email.disabled = false;
                    data.pass.disabled = false;
                }, 3000);
                break;
        }
    }
    const handleTabindex = function(selector, tabindexValue, tagTarget = 'button') {
        const buttons = document.querySelectorAll(`${selector} ${tagTarget}`);
        Array.from(buttons).forEach(button =>{
            button.setAttribute("tabindex", tabindexValue);
        });
    }
    const handleDisabledStateBtn = function(keys, disable = true) {
        keys.forEach(key => {
            document.querySelector(UISelectors[key]).disabled = disable;
        });
    }
    const retrieveDayDate = function() {
        const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
        let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
        return today;
    }
    return {
        getSelectors: function() {
            return UISelectors;
        },
        createAddMode,
        createLogInMode,
        createLoginLoader,
        setTableBodyHead,
        showHidePass,
        renderTableUI,
        renderDayModeCalendar,
        displayTasks,
        renderWeekModeCalendar,
        generateWeekTemplate,
        renderMonthModeCalendar,
        createMsg,
        checkPastOngoingTasks,
        addToast,
        addMsgToast,
        addBadge,
        chooseTheme,
        chooseAvatar,
        chooseToast,
        enableDisableCreateBtn,
        errorSignUpAll,
        errorSignUpSingleInput,
        errorLogInAll,
        handleTabindex,
        handleDisabledStateBtn,
        retrieveDayDate,
        createListWithMsg
    }
})(DnDCtrl);
export default UICtrl;