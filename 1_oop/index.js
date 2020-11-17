//
// Global UI Variables
//
const tableHead = document.querySelector('#table-head');
const tableHeadMonthMode = tableHead.innerHTML;
const tableBody = document.querySelector('#table-body');
//
const monthModeWrapper = document.querySelector('.month-mode-wrapper');
const monthModeMonth = document.querySelector('#month-mode-month');
const monthModeYear = document.querySelector('#month-mode-year');
const lMonthArrow = document.querySelector('#l-month-arrow');
const rMonthArrow = document.querySelector('#r-month-arrow');
const monthModeView = document.querySelector('#month-mode-btn');
//
const weekModeWrapper = document.querySelector('.week-mode-wrapper');
const weekModeContent = document.querySelector('#week-mode-content');
const lWeekArrow = document.querySelector('#l-week-arrow');
const rWeekArrow = document.querySelector('#r-week-arrow');
const weekModeView = document.querySelector('#week-mode-btn');
//
const dayModeWrapper = document.querySelector('.day-mode-wrapper');
const lDayArrow = document.querySelector('#l-day-arrow');
const rDayArrow = document.querySelector('#r-day-arrow');
const dayModeView = document.querySelector('#day-mode-btn');
//
const searchIconPrimary = document.querySelector('#search-icon-primary');
const searchFormWrapper = document.querySelector('#search-form-wrapper');
const searchForm = document.querySelector('.search-form input');
//
const addIconPrimary = document.querySelector('#add-icon-primary');
const addFormWrapper = document.querySelector('#add-form-wrapper');
const addForm = document.querySelector('.add');
//
const pickDate = document.querySelector('#pick-date');
const pickDateFormWrapper = document.querySelector('#pick-date-form-wrapper');
const dateToasts = document.querySelector('.date-toasts');
const pickDatePickMode = document.querySelector('#pick-date-pick-mode');
//
const welcomeHeader = document.querySelector('#welcome-header');
const leadTodayDate = document.querySelector('#lead-today-date');
const leadTaskNum = document.querySelector('#lead-task-number');
const leadTaskCompletedNum = document.querySelector('#lead-task-completed');
// 
const scheduledTasks = document.querySelector('#task-tabs-ongoing');
const completedTasks = document.querySelector('#task-tabs-completed');
//
const taskTabs = document.querySelector('#task-tabs');
//
let today = new Date();
let currToday = today;
let currFirstDayOfWeek = dateFns.startOfWeek(today);
const mainOptionsBtn = document.querySelector('#main-options-btn');
const months = {
	0: 'Jan',
	1: 'Feb',
	2: 'Mar',
	3: 'Apr',
	4: 'May',
	5: 'Jun',
	6: 'Jul',
	7: 'Aug',
	8: 'Sep',
	9: 'Oct',
	10: 'Nov',
	11: 'Dec'
};
const moreOptionsBtn = document.querySelector('#more-options-btn');
const userNavbar = document.querySelector('#user-btn');
//
const currWeek = document.querySelector('.current-week');
const currDay = document.querySelector('.current-day');
//
const themeBtns = document.querySelectorAll('.theme');
const avatarBtns = document.querySelectorAll('.avatar');
const toastBtns = document.querySelectorAll('.toast-change');
// 
const userAvatar = document.querySelector('#user-avatar');
const selectAllOptions = document.querySelector('#select-all-options');
//
// Global DnD Variables
//
let dragSrcEl = null;
//
// Global checkLocalStorage Variables
//
// checkLocalStorage
const alertMsgWrapper = document.querySelector('.alert-message-wrapper');
const body = document.querySelector('body');
const listPastTasks = document.querySelector('.past-tasks');
const notifications = document.querySelector('#notifications');
const navNotifications = document.querySelector('.nav-notifications');
//
//
// DnD Class
//
class DragAndDrop {
	//
	static handleDragStart(e) {
		//
		if (e.target.classList.contains('list-group-item')) {
			//
			e.target.style.opacity = '0.1';
			dragSrcEl = e.target;
			//
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', e.target.innerHTML);
			//
		}
	}
	//
	static handleDragOver(e) {
		//
		if (e.target.classList.contains('list-group-item')) {
			//
			if (e.preventDefault) {
				e.preventDefault();
			}
			//
			e.dataTransfer.dropEffect = 'move';
			//
			return false;
			//
		}
	}
	static handleDragEnter(e) {
		//
		if (e.target.classList != undefined && e.target.classList.contains('list-group-item')) {
			//
			UI.addClass(e.target, 'over');
			//
		}
		//
	}
	//
	static handleDragLeave(e) {
		//
		if (e.target.classList != undefined && e.target.classList.contains('list-group-item')) {
			//
			UI.removeClass(e.target, 'over');
			//
		}
		//
	}
	//
	static handleDrop(e) {
		//
		if (e.target.classList.contains('list-group-item')) {
			//
			if (e.stopPropagation) {
				e.stopPropagation();
			}
			//
			if (dragSrcEl != e.target) {
				//
				dragSrcEl.innerHTML = e.target.innerHTML;
				e.target.innerHTML = e.dataTransfer.getData('text/html');
				//
			}
			//
			return false;
			//
		}
	}
	//
	static handleDragEnd = (user) => {
		//
		let taskList = [];
		//
		[].forEach.call(document.querySelectorAll('.tasks li'), (li) => {
			//
			UI.removeClass(li, 'over');
			li.style.opacity = '1';
			taskList.push(li.textContent);
			//
		});
		//
		if (scheduledTasks.classList.contains('active')) {
			//
			user.tasks[dateFormat(currToday, 'MMM-D-YYYY')] = taskList;
			//
		} else if (completedTasks.classList.contains('active')) {
			//
			user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')] = taskList;
			//
		}
		//
		Store.setUser(user);
		//
	};
	//
}
//
// Utility Functions
//
const getKeyByValue = (object, value) => {
	//
	return Object.keys(object).find((key) => object[key] === value);
	//
};
//
const dateFormat = (date, format) => {
	//
	return dateFns.format(date, format);
	//
};
//
const calculateProgress = () => {
	//
	const progressBar = document.querySelector('#task-progress').firstElementChild.firstElementChild;
	const ongoingNum = Number(leadTaskNum.textContent);
	const completedNum = Number(leadTaskCompletedNum.textContent);
	let completePerCent = 0;
	if (!(ongoingNum === 0 && completedNum === 0)) {
		// 
		completePerCent = Number(Math.ceil(completedNum / (completedNum + ongoingNum) * 100).toFixed());
		// 
	}
	// 
	progressBar.style.width = completePerCent + '%';
	progressBar.firstElementChild.innerHTML = 'Progress: ' + completePerCent * 1 + '%';
	//
};
//
class User {
	//
	constructor(userName, password, email, avatar = 'avatar-1', theme = 'theme-1', toast = 'toast-change-1') {
		//
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
		//
	}
	//
}
class Store {
	//
	static setUser(user) {
		localStorage.setItem('user_' + user.data.name, JSON.stringify(user));
	}
	//
	static setUserOptions(user, avatar = false, theme = false, toast = false) {
		user.options.avatar = avatar ? avatar : user.options.avatar;
		user.options.theme = theme ? theme : user.options.theme;
		user.options.toast = toast ? toast : user.options.toast;
		Store.setUser(user);
	}
	//
	static deleteUser(userName) {
		localStorage.removeItem('user_' + userName);
	}
	//
	static getUser(userName) {
		return JSON.parse(localStorage.getItem('user_' + userName));
	}
	//
	static checkLocalStorage(arrayPrevTasks, userTasks) {
		//
		if (!arrayPrevTasks.length) {
			//
			Object.keys(userTasks.tasks).forEach((day) => {
				//
				let currDay = day;
				let dayNum = Number(currDay.split('-')[1]);
				let monthNum = getKeyByValue(months, currDay.split('-')[0]);
				let yearNum = Number(currDay.split('-')[2]);
				let currNow = new Date(yearNum, monthNum, dayNum);
				let now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
				//
				if (dateFns.getDayOfYear(currNow) < dateFns.getDayOfYear(dateFns.subDays(now, 30))) {
					//
					delete userTasks.tasks[day];
					//
					if (userTasks.completedTasks[day]) {
						//
						delete userTasks.completedTasks[day];
						//
					}
					//
					Store.setUser(userTasks);
					//
				} else {
					//
					if (currNow.getTime() < now.getTime()) {
						//
						arrayPrevTasks.push(currNow.getTime());
						//
					}
					//
				}
				//
			});
			//
			arrayPrevTasks.sort((a, b) => a - b);
			//
		}
		//
		if (arrayPrevTasks.length) {
			//
			arrayPrevTasks.forEach((curr) => {
				//
				const li = UI.createLi('list-group-item d-flex justify-content-between align-items-center py-2');
				li.textContent = `${dateFormat(new Date(curr), 'MMM-D-YYYY')}`;
				listPastTasks.appendChild(li);
				//
			});
			//
			alertMsgWrapper.style.display = 'flex';
			body.style.overflow = 'hidden';
			//
			notifications.lastElementChild.textContent = 1;
			navNotifications.textContent = 1;
			UI.removeClass(notifications, 'disabled');
			//
			document.addEventListener('click', (e) => {
				//
				if (e.target.classList.contains('alert-message-wrapper')) {
					//
					alertMsgWrapper.style.display = 'none';
					body.style.overflow = 'auto';
					listPastTasks.innerHTML = '';
					//
				}
				//
			});
			//
			const alertCloseBtn = document.querySelector('.alert-close-btn');
			//
			alertCloseBtn.addEventListener('click', () => {
				//
				alertMsgWrapper.style.display = 'none';
				body.style.overflow = 'auto';
				listPastTasks.innerHTML = '';
				//
			});
		}
		//
		return arrayPrevTasks;
		//
	}
}
class UI {
	//
	setTheme(main, secondary, td, currWeekHover, rowHover, currDay, badge, bg, text) {
		//
		const root = document.documentElement;
		//
		root.style.setProperty('--theme1-main-color', main);
		root.style.setProperty('--theme1-secondary-color', secondary);
		root.style.setProperty('--theme1-td-color', td);
		root.style.setProperty('--theme1-currweek-hover-color', currWeekHover);
		root.style.setProperty('--theme1-row-hover-color', rowHover);
		root.style.setProperty('--theme1-currday-color', currDay);
		root.style.setProperty('--theme1-badge-color', badge);
		root.style.setProperty('--theme1-bg-color', bg);
		root.style.setProperty('--theme1-text-color', text);
		//
	}
	//
	chooseAvatar(avatar) {
		//
		switch (avatar) {
			//
			case 'avatar-1':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-2':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-3':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-4':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-5':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-6':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-7':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-8':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-9':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-10':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-11':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-12':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-13':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
			case 'avatar-14':
				//
				UI.addClass(document.querySelector('#' + avatar), 'avatar-active');
				//
				break;
			//
		}
		//
	}
	// 
	chooseToast(toast) {
		//
		switch (toast) {
			//
			case 'toast-change-1':
				//
				UI.addClass(document.querySelector('#' + toast), 'toast-active');
				//
				break;
			//
			case 'toast-change-2':
				//
				UI.addClass(document.querySelector('#' + toast), 'toast-active');
				//
				break;
			//
			case 'toast-change-3':
				//
				UI.addClass(document.querySelector('#' + toast), 'toast-active');
				//
				break;
			//
			case 'toast-change-4':
				//
				UI.addClass(document.querySelector('#' + toast), 'toast-active');
				//
				break;
			//
		}
		//
	}
	//
	chooseTheme(theme) {
		//
		switch (theme) {
			//
			case 'theme-1':
				//
				this.setTheme(
					'#343a40',
					'#6c757d',
					'#454d55',
					'#dee2e6',
					'#dee2e6',
					'#000000',
					'#007bff',
					'#000000',
					'#ffffff'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
			case 'theme-2':
				//
				this.setTheme(
					'#666a86',
					'#788aa3',
					'#ffc800',
					'#b2c9ab',
					'#b2c9ab',
					'#788aa3',
					'#ff8427',
					'#92b6b1',
					'#e8ddb5'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
			case 'theme-3':
				//
				this.setTheme(
					'#507dbc',
					'#a1c6ea',
					'#bbd1ea',
					'#ffa62b',
					'#ffa62b',
					'#a1c6ea',
					'#dae3e5',
					'#be6e46',
					'#04080f'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
			case 'theme-4':
				//
				this.setTheme(
					'#291528',
					'#9e829c',
					'#3a3e3b',
					'#9e829c',
					'#9e829c',
					'#93b7be',
					'#000000',
					'#93b7be',
					'#f1fffa'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
			case 'theme-5':
				//
				this.setTheme(
					'#f7a9a8',
					'#ef798a',
					'#087ca7',
					'#05b2dc',
					'#988b8e',
					'#05b2dc',
					'#e5c3d1',
					'#988b8e',
					'#613f75'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
			case 'theme-6':
				//
				this.setTheme(
					'#3d315b',
					'#444b6e',
					'#708b75',
					'#eee5e5',
					'#9ab87a',
					'#ddcecd',
					'#444b6e',
					'#ddcecd',
					'#f8f991'
				);
				//
				UI.addClass(document.querySelector('#' + theme), 'theme-active');
				//
				break;
			//
		}
		//
	}
	//
	createUl(className) {
		const ul = document.createElement('ul');
		ul.className = className;
		return ul;
	}
	//
	static createLi(className, liId) {
		const li = document.createElement('li');
		li.className = className;
		li.id = liId !== undefined ? liId : '';
		return li;
	}
	//
	createIcon(className) {
		const icon = document.createElement('i');
		icon.className = className;
		return icon;
	}
	//
	loadAccounts() {
		//
		let accountNum = 0;
		let accountsArray = [];
		//
		Object.keys(localStorage).forEach((key) => {
			//
			if (key.startsWith('user_')) {
				//
				let accountKey = key.substring(5);
				accountsArray.push(accountKey);
				accountNum++;
				//
			}
			//
		});
		//
		return [ accountNum, accountsArray ];
		//
	}
	//
	renderLoginAccounts = (accountNum, accountsArray, loginAccountsList) => {
		//
		if (accountNum) {
			//
			accountsArray.forEach((account) => {
				//
				const li = UI.createLi(
					'list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2',
					account
				);
				//
				li.appendChild(this.createIcon('fas fa-user show'));
				li.appendChild(this.createIcon('fas fa-user-times hide'));
				li.appendChild(document.createTextNode(account));
				li.appendChild(this.createIcon('fas fa-chevron-right show'));
				li.appendChild(this.createIcon('fas fa-times hide'));
				loginAccountsList.appendChild(li);
			});
			//
		} else {
			//
			const li = UI.createLi('list-group-item py-2');
			li.appendChild(document.createTextNode(`No accounts in the database`));
			loginAccountsList.appendChild(li);
			//
		}
		//
		return loginAccountsList;
		//
	};
	//
	static addClass(target, className) {
		//
		target.classList.add(className);
		//
	}
	//
	static removeClass(target, className) {
		//
		target.classList.remove(className);
		//
	}
	//
	setTableBodyHead(body = '', head = '') {
		//
		tableBody.innerHTML = body;
		tableHead.innerHTML = head;
		//
	}
	//
	renderListElements(listStart, listEnd) {
		//
		Array.from(listStart.children).forEach((li) => {
			//
			Array.from(li.children).forEach((i) => {
				//
				if (i.classList.contains('show')) {
					//
					UI.removeClass(i, 'show');
					UI.addClass(i, 'hide');
					//
				} else {
					//
					UI.removeClass(i, 'hide');
					UI.addClass(i, 'show');
					//
				}
				//
			});
			//
			listEnd.appendChild(li);
			//
		});
		//
		return listEnd;
		//
	}
	//
	renderDayModeCalendar(user, tasks) {
		//
		// adjust week mode display
		monthModeWrapper.setAttribute('style', 'display: none !important');
		weekModeWrapper.setAttribute('style', 'display: none !important');
		dayModeWrapper.setAttribute('style', 'display: flex !important');
		lMonthArrow.parentElement.style.display = 'none';
		rMonthArrow.parentElement.style.display = 'none';
		lWeekArrow.parentElement.style.display = 'none';
		rWeekArrow.parentElement.style.display = 'none';
		lDayArrow.parentElement.style.display = 'flex';
		rDayArrow.parentElement.style.display = 'flex';
		UI.removeClass(taskTabs, 'hide');
		//
		document.querySelector('#day-mode-content').textContent = `
        ${dateFormat(currToday, 'D MMMM YYYY, dddd')}
        `;
		// reset table body & header
		this.setTableBodyHead();
		//
		tableBody.append(this.createUl('list-group tasks mx-auto text-light p-3 w-100'));
		tableBody.setAttribute('class', 'day-mode');
		//
		if (tasks[dateFormat(currToday, 'MMM-D-YYYY')]) {
			//
			tasks[dateFormat(currToday, 'MMM-D-YYYY')].forEach((dayTask, index) => {
				//
				this.generateDayTemplate(dayTask, user, index);
				//
			});
			//
		}
		//
		if (dateFormat(currToday, 'MMM-D-YYYY') === dateFormat(dateFns.subDays(new Date(), 30), 'MMM-D-YYYY')) {
			lDayArrow.disabled = true;
		} else {
			lDayArrow.disabled = false;
		}
		// enable searching in day mode
		searchIconPrimary.disabled = false;
		// show main options
		UI.addClass(mainOptionsBtn, 'main-options-btn-open');
		//
	}
	//
	generateDayTemplate(task, user, index) {
		//
		let list = document.querySelector('.tasks');
		//
		let li = UI.createLi('list-group-item d-flex justify-content-between align-items-center', 'task' + index);
		//
		let divIconComplete = document.createElement('div');
		divIconComplete.className = 'd-flex justify-content-between align-items-center';
		//
		divIconComplete.appendChild(this.createIcon('far fa-circle uncompleted'));
		divIconComplete.appendChild(this.createIcon('far fa-check-circle completed hide'));
		//
		li.appendChild(divIconComplete);
		//
		let divText = document.createElement('div');
		divText.className = 'lead';
		divText.appendChild(document.createTextNode(task));
		//
		li.appendChild(divText);
		//
		let divIcon = document.createElement('div');
		divIcon.className = 'd-flex justify-content-between align-items-center';
		//
		divIcon.appendChild(this.createIcon('fas fa-edit mr-1 edit'));
		divIcon.appendChild(this.createIcon('fas fa-keyboard mr-2 fa-2x ongoing-edit text-danger hide'));
		divIcon.appendChild(this.createIcon('far fa-trash-alt delete'));
		//
		li.appendChild(divIcon);
		//
		li.draggable = true;
		li.addEventListener('dragstart', DragAndDrop.handleDragStart, false);
		li.addEventListener('dragenter', DragAndDrop.handleDragEnter, false);
		li.addEventListener('dragover', DragAndDrop.handleDragOver, false);
		li.addEventListener('dragleave', DragAndDrop.handleDragLeave, false);
		li.addEventListener('drop', DragAndDrop.handleDrop, false);
		li.addEventListener(
			'dragend',
			() => {
				DragAndDrop.handleDragEnd(user);
			},
			false
		);
		//
		list.appendChild(li);
		//
	}
	//
	renderWeekModeCalendar(whichOne, user) {
		//
		// adjust week mode display
		monthModeWrapper.setAttribute('style', 'display: none !important');
		weekModeWrapper.setAttribute('style', 'display: flex !important');
		dayModeWrapper.setAttribute('style', 'display: none !important');
		lMonthArrow.parentElement.style.display = 'none';
		rMonthArrow.parentElement.style.display = 'none';
		lWeekArrow.parentElement.style.display = 'flex';
		rWeekArrow.parentElement.style.display = 'flex';
		lDayArrow.parentElement.style.display = 'none';
		rDayArrow.parentElement.style.display = 'none';
		UI.addClass(taskTabs, 'hide');
		// set up local & update global variables
		let firstDayCurrWeek, firstDayPrevWeek, firstDayNextWeek, firstDayInTwoWeeks, week;
		//
		switch (whichOne) {
			//
			case 'current':
				//
				firstDayCurrWeek = dateFns.startOfWeek(today);
				firstDayNextWeek = dateFns.addWeeks(firstDayCurrWeek, 1);
				week = dateFns.eachDay(firstDayCurrWeek, dateFns.subDays(firstDayNextWeek, 1));
				//
				this.generateWeekTemplate(firstDayCurrWeek, firstDayNextWeek, week, user);
				break;
			//
			case 'previous':
				//
				firstDayCurrWeek = currFirstDayOfWeek;
				firstDayPrevWeek = dateFns.subWeeks(firstDayCurrWeek, 1);
				currFirstDayOfWeek = firstDayPrevWeek;
				week = dateFns.eachDay(firstDayPrevWeek, dateFns.subDays(firstDayCurrWeek, 1));
				//
				this.generateWeekTemplate(firstDayPrevWeek, firstDayCurrWeek, week, user);
				break;
			//
			case 'next':
				//
				firstDayCurrWeek = currFirstDayOfWeek;
				firstDayNextWeek = dateFns.addWeeks(firstDayCurrWeek, 1);
				firstDayInTwoWeeks = dateFns.addWeeks(firstDayNextWeek, 1);
				currFirstDayOfWeek = firstDayNextWeek;
				week = dateFns.eachDay(firstDayNextWeek, dateFns.subDays(dateFns.addWeeks(firstDayNextWeek, 1), 1));
				//
				this.generateWeekTemplate(firstDayNextWeek, firstDayInTwoWeeks, week, user);
				break;
			//
		}
		// disable searching in month mode
		searchIconPrimary.disabled = true;
		//
	}
	//
	generateWeekTemplate(firstDayCurrWeek, firstDayNextWeek, week, user) {
		//
		weekModeContent.textContent = `${dateFns.getDate(firstDayCurrWeek)} ${dateFormat(
			firstDayCurrWeek,
			'MMMM YYYY'
		)} - ${dateFns.getDate(dateFns.subDays(firstDayNextWeek, 1))} ${dateFormat(
			dateFns.subDays(firstDayNextWeek, 1),
			'MMMM YYYY'
		)}`;
		// reset table body & header
		this.setTableBodyHead();
		//
		let row = document.createElement('tr');
		//
		week.forEach((curr) => {
			//
			let td = document.createElement('td');
			td.innerHTML = `
				${dateFormat(curr, 'ddd')}
				<br>
				${dateFormat(curr, 'D MMM')}
			`;
			//
			if (dateFns.isToday(curr)) {
				//
				UI.addClass(td, 'current-day');
				UI.addClass(row, 'current-week');
				//
			}
			//
			if (
				curr.getMonth() < dateFns.subDays(today, 30).getMonth() ||
				curr.getFullYear() < dateFns.subDays(today, 30).getFullYear() ||
				(curr.getMonth() === dateFns.subDays(today, 30).getMonth() &&
					curr.getFullYear() === dateFns.subDays(today, 30).getFullYear() &&
					curr.getDate() < dateFns.subDays(today, 30).getDate())
			) {
				//
				UI.addClass(td, 'invalid-day');
				UI.addClass(row, 'archived-week');
				//
			} else {
				//
				UI.addClass(td, 'valid-day');
				//
			}
			//
			td = this.addBadge(user, curr.getFullYear(), curr.getMonth(), curr.getDate(), td);
			// append td after each iteration
			row.append(td);
			//
		});
		// append row after each iteration
		tableBody.append(row);
		tableBody.setAttribute('class', 'week-mode');
		//
		if (row.classList.contains('archived-week')) {
			lWeekArrow.disabled = true;
		} else {
			lWeekArrow.disabled = false;
		}
		//
	}
	//
	renderMonthModeCalendar(year, month, user) {
		//
		// adjust month mode display
		monthModeWrapper.setAttribute('style', 'display: flex !important');
		weekModeWrapper.setAttribute('style', 'display: none !important');
		dayModeWrapper.setAttribute('style', 'display: none !important');
		lMonthArrow.parentElement.style.display = 'flex';
		rMonthArrow.parentElement.style.display = 'flex';
		lWeekArrow.parentElement.style.display = 'none';
		rWeekArrow.parentElement.style.display = 'none';
		lDayArrow.parentElement.style.display = 'none';
		rDayArrow.parentElement.style.display = 'none';
		UI.addClass(taskTabs, 'hide');
		// set up local variables
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
		//
		monthModeMonth.options[month].selected = true;
		monthModeYear.textContent = year;
		//
		if (month === 0) {
			//
			lMonthArrow.lastElementChild.textContent = months[11];
			rMonthArrow.firstElementChild.textContent = months[month + 1];
			//
		} else if (month === 11) {
			//
			lMonthArrow.lastElementChild.textContent = months[month - 1];
			rMonthArrow.firstElementChild.textContent = months[0];
			//
		} else {
			//
			lMonthArrow.lastElementChild.textContent = months[month - 1];
			rMonthArrow.firstElementChild.textContent = months[month + 1];
			//
		}
		if (Number(monthModeYear.textContent) === today.getFullYear()) {
			//
			Array.from(monthModeMonth.options)
				.filter((curr) => curr.index < dateFns.subDays(today, 30).getMonth())
				.forEach((curr) => {
					//
					UI.addClass(curr, 'hide');
					//
				});
			//
		} else {
			//
			Array.from(monthModeMonth.options).forEach((curr) => {
				//
				UI.removeClass(curr, 'hide');
				//
			});
			//
		}
		//
		let i = 0;
		while (flag >= 0) {
			//
			let row = document.createElement('tr');
			//
			for (let j = 0; j < 7; j++) {
				//
				if (i === 0 && j < startOfCurrMonth) {
					//
					let td = document.createElement('td');
					UI.addClass(td, 'disabled');
					td.textContent = renderDaysNumPrevMonth;
					row.append(td);
					renderDaysNumPrevMonth++;
					//
				} else if (renderDaysNumCurrMonth > numOfDayCurrMonth) {
					//
					flag--;
					//
					if (j === 0) {
						break;
					}
					//
					let td = document.createElement('td');
					UI.addClass(td, 'disabled');
					td.textContent = renderDaysNumNextMonth;
					row.append(td);
					renderDaysNumNextMonth++;
					//
				} else {
					//
					let td = document.createElement('td');
					td.textContent = renderDaysNumCurrMonth;
					//
					if (
						//
						renderDaysNumCurrMonth === today.getDate() &&
						year === today.getFullYear() &&
						month === today.getMonth()
						//
					) {
						//
						UI.addClass(td, 'current-day');
						UI.addClass(row, 'current-week');
						//
					}
					//
					if (
						dateFns.getDayOfYear(new Date(year, month, renderDaysNumCurrMonth)) <
						dateFns.getDayOfYear(dateFns.subDays(today, 30))
					) {
						//
						UI.addClass(td, 'invalid-day');
						//
					} else {
						//
						UI.addClass(td, 'valid-day');
						//
					}
					//
					td = this.addBadge(user, year, month, renderDaysNumCurrMonth, td);
					// append td after each iteration
					row.append(td);
					renderDaysNumCurrMonth++;
					//
				}
			}
			// append row after each iteration
			tableBody.append(row);
			tableBody.setAttribute('class', 'month-mode');
			i++;
			//
		}
		//
		if (monthModeMonth.selectedIndex === dateFns.subDays(today, 30).getMonth()) {
			//
			lMonthArrow.disabled = true;
			//
		} else {
			//
			lMonthArrow.disabled = false;
			//
		}
		// disable searching in month mode
		searchIconPrimary.disabled = true;
		//
		UI.removeClass(pickDatePickMode, 'btn-outline-danger');
		UI.addClass(pickDatePickMode, 'btn-outline-light');
		//
	}
	//
	addBadge(user, year, month, day, td) {
		//
		Object.keys(user.tasks).forEach((dayKey) => {
			//
			if (dayKey === dateFormat(new Date(year, month, day), 'MMM-D-YYYY')) {
				//
				let span = document.createElement('span');
				UI.addClass(td, 'task-marker-td');
				span.className = 'badge badge-pill task-marker';
				span.textContent = user.tasks[dayKey].length;
				td.appendChild(span);
				//
			}
		});
		//
		return td;
		//
	}
	//
	filterTasks(term) {
		//
		const list = document.querySelector('.tasks');
		//
		Array.from(list.children)
			.filter((task) => !task.textContent.toLowerCase().includes(term))
			.forEach((task) => UI.addClass(task, 'filtered'));
		//
		Array.from(list.children)
			.filter((task) => task.textContent.toLowerCase().includes(term))
			.forEach((task) => UI.removeClass(task, 'filtered'));
		//
	}
	//
	addToast(date, selector) {
		//
		dateToasts.innerHTML += `
        <div class="toast" id="${selector}" role="status" aria-live="polite" aria-atomic="true" data-autohide="false">
            <div class="toast-header">
                <span>${date}</span>
                <button type="button" class="ml-auto mb-1 close" data-dismiss="toast" aria-label="Close">
                    <span class="x" aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    `;
		//
	}
	//
	showHidePassword(target, password) {
		//
		Array.from(target.parentElement.children).forEach((child) => {
			//
			child.classList.toggle('hide');
			//
		});
		//
		password.type === 'password' ? (password.type = 'text') : (password.type = 'password');
		//
	}
	//
	checkSetTaskNum(tasks, date, target) {
		// 
		if (tasks[dateFormat(date, 'MMM-D-YYYY')]) {
			//
			target.textContent = tasks[dateFormat(date, 'MMM-D-YYYY')].length;
			//
		} else {
			// 
			target.textContent = 0;
			// 
		}
		// 
	}
	// 
}
//
document.addEventListener('DOMContentLoaded', () => {
	//
	// Variables
	let arrayPrevTasks = [];
	let logIn = false;
	//
	// Instantiate UI & User objects
	const ui = new UI();
	let user = new User();
	//
	// Welcome Screen
	let [ accountNum, accountsArray ] = ui.loadAccounts();
	let loginAccountsList = document.querySelector('.login-accounts');
	const loginMain = document.querySelector('.login-main-div');
	loginAccountsList = ui.renderLoginAccounts(accountNum, accountsArray, loginAccountsList);
	//
	// LogIn Part
	const loginConfirm = document.querySelector('.login-confirm');
	const loginConfirmAccount = document.querySelector('.login-confirm-account');
	const loginBtn = document.querySelector('#login-confirm-login-btn');
	const loginBackBtn = document.querySelector('#login-confirm-back-btn');
	const loginLoader = document.querySelector('#login-loader');
	const loginWrapper = document.querySelector('.login-wrapper');
	const loginPassword = document.querySelector('#log-in-password');
	//
	// LogIn to a Specific Account
	loginAccountsList.addEventListener('click', (e) => {
		//
		accountsArray.some((account) => {
			//
			if (document.getElementById(account).contains(e.target)) {
				//
				UI.addClass(loginMain, 'move-x-left');
				UI.addClass(loginConfirm, 'move-x-zero');
				//
				const li = UI.createLi(
					'list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2',
					account
				);
				li.innerHTML = document.getElementById(account).innerHTML;
				loginConfirmAccount.appendChild(li);
				//
				return true;
				//
			}
			//
		});
		//
		loginPassword.select();
		//
	});
	//
	// Check Password
	loginPassword.addEventListener('keyup', () => {
		//
		user = Store.getUser(loginConfirmAccount.firstChild.id);
		//
		if (loginPassword.value === user.data.password) {
			//
			UI.addClass(loginPassword, 'valid');
			UI.removeClass(loginPassword, 'invalid');
			loginBtn.disabled = false;
			//
		} else {
			//
			UI.addClass(loginPassword, 'invalid');
			UI.removeClass(loginPassword, 'valid');
			loginBtn.disabled = true;
			//
		}
	});
	//
	// Show/Hide Password
	document.querySelector('.log-in-show-password-wrapper').addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('show-password')) {
			//
			ui.showHidePassword(e.target, loginPassword);
			//
		}
		//
	});
	//
	// LogIn to an Account
	loginBtn.addEventListener('click', () => {
		// 
		logIn = true;
		today = new Date();
		currToday = today;
		currFirstDayOfWeek = dateFns.startOfWeek(today);
		//
		welcomeHeader.textContent = user.data.name;
		user.tasks = Store.getUser(user.data.name).tasks;
		//
		UI.addClass(loginConfirm, 'dissapear');
		loginConfirmAccount.innerHTML = '';
		loginLoader.style.height = loginConfirm.offsetHeight + 'px';
		loginLoader.style.display = 'flex';
		//
		setTimeout(() => {
			//
			loginBtn.disabled = true;
			loginPassword.value = '';
			UI.removeClass(loginPassword, 'valid');
			// 
			if (loginPassword.type === 'text') {
				// 
				ui.showHidePassword(document.querySelector('.log-in-show-password-wrapper .show-password'), loginPassword);
				// 
			}
			// 
			UI.addClass(loginWrapper, 'roll-up');
			loginLoader.style.display = 'none';
			leadTodayDate.textContent = dateFormat(today, 'Do of MMMM YYYY');
			//
			ui.checkSetTaskNum(user.tasks, today, leadTaskNum);
			ui.checkSetTaskNum(user.completedTasks, today, leadTaskCompletedNum);
			//
			ui.chooseTheme(user.options.theme);
			ui.chooseAvatar(user.options.avatar);
			ui.chooseToast(user.options.toast);
			document
				.querySelector('#user-avatar')
				.setAttribute(
					'class',
					document.querySelector('#' + user.options.avatar).firstElementChild.classList.value
				);
			UI.addClass(userAvatar, 'position-relative');
			//
			body.style.overflow = 'auto';
			//
			ui.renderDayModeCalendar(user, user.tasks);
			// 
			setTimeout(() => {
				// 
				arrayPrevTasks = Store.checkLocalStorage(arrayPrevTasks, user);
				// 
			}, 1000)
			//
			calculateProgress();
			//
		}, 1500);
		//
	});
	//
	// Go Back from LogIn Screen
	loginBackBtn.addEventListener('click', () => {
		//
		UI.removeClass(loginConfirm, 'move-x-zero');
		UI.removeClass(loginMain, 'move-x-left');
		loginConfirmAccount.innerHTML = '';
		loginPassword.value = '';
		UI.removeClass(loginPassword, 'valid');
		UI.removeClass(loginPassword, 'invalid');
		loginBtn.disabled = true;
		// 
		if (loginPassword.type === 'text') {
			// 
			ui.showHidePassword(document.querySelector('.log-in-show-password-wrapper .show-password'), loginPassword);
			// 
		}
		//
	});
	//
	// Add Account Part
	const addBtn = document.querySelector('#login-add-btn');
	const loginAddMode = document.querySelector('.login-add-mode');
	const loginAddBackBtn = document.querySelector('#login-add-back-btn');
	const loginAddCreateBtn = document.querySelector('#login-add-create-btn');
	const addAccountForm = document.querySelector('#add-account-form');
	const usernamePattern = /^\w{1,15}$/;
	const emailPattern = /^([a-zA-Z]{1}[\w\.]{0,20})@([a-zA-Z]{2,15})\.([a-zA-Z]{2,5})(\.[a-zA-Z]{2,5})?$/;
	const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?!.*[\s])(?=.{8,15})/;
	const loginAddConfirm = document.querySelector('.login-add-confirm-message');
	const confirmUsername = document.querySelector('#confirm-username');
	const username = document.querySelector('#username');
	const email = document.querySelector('#email');
	const password = document.querySelector('#password');
	//
	// Add Account Button
	addBtn.addEventListener('click', () => {
		//
		UI.addClass(loginMain, 'move-y-up');
		UI.addClass(loginAddMode, 'move-y-zero');
		//
		username.select();
		email.removeAttribute('tabindex');
		password.removeAttribute('tabindex');
		//
	});
	//
	// Show/Hide Password
	document.querySelector('.create-account-show-password-wrapper').addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('show-password')) {
			//
			ui.showHidePassword(e.target, password);
			//
		}
		//
	});
	//
	// Go Back from Add Account Screen
	loginAddBackBtn.addEventListener('click', () => {
		//
		UI.removeClass(loginMain, 'move-y-up');
		UI.removeClass(loginAddMode, 'move-y-zero');
		UI.removeClass(username, 'valid');
		UI.removeClass(username, 'invalid');
		UI.removeClass(email, 'valid');
		UI.removeClass(email, 'invalid');
		UI.removeClass(password, 'valid');
		UI.removeClass(password, 'invalid');
		addAccountForm.reset();
		email.setAttribute('tabindex', '-1');
		password.setAttribute('tabindex', '-1');
		// 
		if (password.type === 'text') {
			// 
			ui.showHidePassword(document.querySelector('.create-account-show-password-wrapper .show-password'), password);
			// 
		}
		//
	});
	//
	// Check Username
	username.addEventListener('keyup', () => {
		//
		if (
			usernamePattern.test(addAccountForm.username.value) &&
			!Object.keys(localStorage).includes('user_' + addAccountForm.username.value)
		) {
			//
			UI.addClass(username, 'valid');
			UI.removeClass(username, 'invalid');
			//
		} else {
			//
			UI.addClass(username, 'invalid');
			UI.removeClass(username, 'valid');
			//
		}
		//
		if (
			username.classList.contains('valid') &&
			email.classList.contains('valid') &&
			password.classList.contains('valid')
		) {
			//
			loginAddCreateBtn.disabled = false;
			//
		} else {
			//
			loginAddCreateBtn.disabled = true;
			//
		}
		//
	});
	//
	// Check Email
	email.addEventListener('keyup', () => {
		//
		if (emailPattern.test(addAccountForm.email.value)) {
			//
			UI.addClass(email, 'valid');
			UI.removeClass(email, 'invalid');
			//
		} else {
			//
			UI.addClass(email, 'invalid');
			UI.removeClass(email, 'valid');
			//
		}
		//
		if (
			username.classList.contains('valid') &&
			email.classList.contains('valid') &&
			password.classList.contains('valid')
		) {
			//
			loginAddCreateBtn.disabled = false;
			//
		} else {
			//
			loginAddCreateBtn.disabled = true;
			//
		}
		//
	});
	// 
	// Check Password
	password.addEventListener('keyup', () => {
		//
		if (passwordPattern.test(addAccountForm.password.value)) {
			//
			UI.addClass(password, 'valid');
			UI.removeClass(password, 'invalid');
			//
		} else {
			//
			UI.addClass(password, 'invalid');
			UI.removeClass(password, 'valid');
			//
		}
		//
		if (
			username.classList.contains('valid') &&
			email.classList.contains('valid') &&
			password.classList.contains('valid')
		) {
			//
			loginAddCreateBtn.disabled = false;
			//
		} else {
			//
			loginAddCreateBtn.disabled = true;
			//
		}
		//
	});
	//
	// Add New Account
	addAccountForm.addEventListener('submit', (e) => {
		//
		e.preventDefault();
		//
		const user = new User(addAccountForm.username.value, addAccountForm.password.value, addAccountForm.email.value);
		//
		Store.setUser(user);
		//
		loginAddCreateBtn.disabled = true;
		username.disabled = true;
		UI.removeClass(username, 'valid');
		UI.removeClass(username, 'invalid');
		UI.removeClass(email, 'valid');
		UI.removeClass(email, 'invalid');
		UI.removeClass(password, 'valid');
		UI.removeClass(password, 'invalid');
		confirmUsername.textContent = user.data.name;
		addAccountForm.reset();
		//
		UI.removeClass(loginAddMode, 'move-y-zero');
		UI.addClass(loginAddMode, 'move-y-up');
		UI.addClass(loginAddConfirm, 'move-y-zero');
		//
		setTimeout(() => {
			//
			[ accountNum, accountsArray ] = ui.loadAccounts();
			// 
			if (password.type === 'text') {
				// 
				ui.showHidePassword(document.querySelector('.create-account-show-password-wrapper .show-password'), password);
				// 
			}
			//
			UI.removeClass(loginAddMode, 'move-y-up');
			UI.removeClass(loginAddConfirm, 'move-y-zero');
			UI.removeClass(loginMain, 'move-y-up');
			loginAccountsList.innerHTML = '';
			username.disabled = false;
			//
			ui.renderLoginAccounts(accountNum, accountsArray, loginAccountsList);
			//
		}, 1500);
		//
	});
	//
	// Remove Account Part
	const removeBtn = document.querySelector('#login-remove-btn');
	const loginRemove = document.querySelector('.login-remove-choose');
	let loginRemoveAccount = document.querySelector('.login-remove-accounts');
	const loginRemoveBackBtn = document.querySelector('#login-back-btn');
	const loginRemoveConfirm = document.querySelector('.login-remove-confirm');
	const loginRemoveConfirmAccount = document.querySelector('.login-remove-confirm-account');
	const loginRemoveBackConfirmBtn = document.querySelector('#login-remove-back-confirm-btn');
	const loginRemoveConfirmBtn = document.querySelector('#login-remove-confirm-btn');
	const loginRemoveConfirmMsg = document.querySelector('.login-remove-confirm-message');
	const confirmRemoveUsername = document.querySelector('#confirm-remove-username');
	let accountToRemove = '';
	//
	// Remove Account Button
	removeBtn.addEventListener('click', () => {
		//
		loginRemoveAccount.innerHTML = '';
		//
		UI.addClass(loginMain, 'move-y-up');
		UI.addClass(loginRemove, 'move-y-zero');
		//
		loginRemoveAccount = ui.renderListElements(loginAccountsList, loginRemoveAccount);
		//
	});
	//
	// Remove Account Screen
	loginRemoveAccount.addEventListener('click', (e) => {
		//
		accountsArray.some((account) => {
			if (document.getElementById(account).contains(e.target)) {
				//
				UI.removeClass(loginRemove, 'move-y-zero');
				UI.addClass(loginRemove, 'move-y-up');
				UI.addClass(loginRemoveConfirm, 'move-y-zero');
				//
				const li = UI.createLi(
					'list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2',
					account
				);
				li.innerHTML = document.getElementById(account).innerHTML;
				loginRemoveConfirmAccount.appendChild(li);
				//
				accountToRemove = account;
				//
				return true;
			}
		});
		//
	});
	//
	// Go Back from Remove Account Screen
	loginRemoveBackBtn.addEventListener('click', () => {
		//
		UI.removeClass(loginMain, 'move-y-up');
		UI.removeClass(loginRemove, 'move-y-zero');
		//
		loginAccountsList = ui.renderListElements(loginRemoveAccount, loginAccountsList);
	});
	//
	// Remove Account - Confirmation Button
	loginRemoveConfirmBtn.addEventListener('click', () => {
		//
		UI.removeClass(loginRemoveConfirm, 'move-y-zero');
		UI.addClass(loginRemoveConfirm, 'move-y-up');
		UI.addClass(loginRemoveConfirmMsg, 'move-y-zero');
		//
		// remove User object from Local Storage
		Store.deleteUser(accountToRemove);
		//
		confirmRemoveUsername.textContent = accountToRemove;
		//
		setTimeout(() => {
			//
			[ accountNum, accountsArray ] = ui.loadAccounts();
			//
			UI.removeClass(loginRemoveConfirm, 'move-y-up');
			UI.removeClass(loginRemoveConfirmMsg, 'move-y-zero');
			UI.removeClass(loginRemove, 'move-y-up');
			UI.removeClass(loginMain, 'move-y-up');
			//
			loginRemoveConfirmAccount.innerHTML = '';
			//
			ui.renderLoginAccounts(accountNum, accountsArray, loginAccountsList);
			//
		}, 1500);
	});
	//
	// Go Back from Confirmation Screen
	loginRemoveBackConfirmBtn.addEventListener('click', () => {
		//
		UI.addClass(loginRemove, 'move-y-zero');
		UI.removeClass(loginRemove, 'move-y-up');
		UI.removeClass(loginRemoveConfirm, 'move-y-zero');
		loginRemoveConfirmAccount.innerHTML = '';
		//
	});
	//
	// LogOut Part
	const logOut = document.querySelector('#log-out');
	//
	logOut.addEventListener('click', () => {
		// 
		logIn = false;
		// 
		addIconPrimary.disabled = false;
		moreOptionsBtn.disabled = false;
		dayModeView.disabled = false;
		weekModeView.disabled = false;
		pickDate.disabled = false;
		dateToasts.innerHTML = '';
		UI.removeClass(tableBody, 'pick-date-mode');
		UI.addClass(pickDatePickMode, 'btn-outline-light');
		UI.removeClass(pickDatePickMode, 'btn-outline-danger');
		UI.removeClass(pickDateFormWrapper, 'pick-date-form-open');
		addFormWrapper.classList.toggle('add-form-open');
		addForm.reset();
		//
		body.style.overflow = 'hidden';
		//
		ui.setTheme('#343a40', '#6c757d', '#454d55', '#dee2e6', '#dee2e6', '#000000', '#007bff', '#000000', '#ffffff');
		//
		Array.from(themeBtns).some((themeBtn) => {
			//
			if (themeBtn.classList.contains('theme-active')) {
				//
				UI.removeClass(themeBtn, 'theme-active');
				//
				return true;
				//
			}
			//
		});
		//
		UI.removeClass(loginWrapper, 'roll-up');
		//
		if (
			leadTaskCompletedNum
				.parentElement.parentElement.parentElement.classList.contains('hide')
		) {
			//
			UI.removeClass(
				leadTaskCompletedNum.parentElement.parentElement.parentElement,
				'hide'
			);
			//
		}
		//
		setTimeout(() => {
			//
			loginLoader.style.display = 'flex';
			//
		}, 400);
		//
		setTimeout(() => {
			//
			UI.removeClass(loginConfirm, 'dissapear');
			UI.removeClass(loginConfirm, 'move-x-zero');
			UI.removeClass(loginMain, 'move-x-left');
			loginLoader.style.display = 'none';
			//
		}, 1500);
	});
	//
	// Settings Part
	const settings = document.querySelector('#settings');
	const settingsWrapper = document.querySelector('.settings-wrapper');
	//
	settings.addEventListener('click', () => {
		//
		settingsWrapper.style.display = 'flex';
		body.style.overflow = 'hidden';
		//
		document.addEventListener('click', (e) => {
			//
			if (e.target.classList.contains('settings-wrapper')) {
				//
				settingsWrapper.style.display = 'none';
				body.style.overflow = 'auto';
				listPastTasks.innerHTML = '';
				//
			}
			//
		});
		//
		const settingsCloseBtn = document.querySelector('.settings-close-btn');
		//
		settingsCloseBtn.addEventListener('click', () => {
			//
			settingsWrapper.style.display = 'none';
			body.style.overflow = 'auto';
			listPastTasks.innerHTML = '';
			//
		});
		//
	});
	//
	// Notifications Part
	notifications.addEventListener('click', () => {
		//
		if (notifications.lastElementChild.textContent.length) {
			//
			Store.checkLocalStorage(arrayPrevTasks, user);
			//
		}
		//
	});
	//
	// checkLocalStorage Event Listeners
	// Append Tasks
	document.querySelector('#alert-append-btn').addEventListener('click', () => {
		//
		let arrayAllPrevTasks = [];
		//
		arrayPrevTasks.forEach((currDate) => {
			//
			let currKey = dateFormat(new Date(currDate), 'MMM-D-YYYY');
			//
			Object.keys(user.tasks).forEach((dayTask) => {
				if (dayTask === currKey) {
					//
					arrayAllPrevTasks = arrayAllPrevTasks.concat(user.tasks[dayTask]);
					//
					delete user.tasks[dayTask];
					Store.setUser(user);
					//
				}
			});
			//
		});
		//
		const appendTasks = Object.keys(user.tasks).some((dayTask) => {
			//
			if (dayTask === dateFormat(today, 'MMM-D-YYYY')) {
				//
				user.tasks[dayTask] = user.tasks[dayTask].concat(arrayAllPrevTasks);
				Store.setUser(user);
				//
				leadTaskNum.textContent = user.tasks[dayTask].length;
				//
				ui.renderDayModeCalendar(user, user.tasks);
				//
				return true;
				//
			}
			//
		});
		//
		if (!appendTasks) {
			//
			user.tasks[dateFormat(today, 'MMM-D-YYYY')] = arrayAllPrevTasks;
			//
			Store.setUser(user);
			//
			ui.renderDayModeCalendar(user, user.tasks);
			//
		}
		//
		arrayPrevTasks = [];
		listPastTasks.innerHTML = '';
		//
		if (notifications.lastElementChild.textContent.length) {
			// 
			notifications.lastElementChild.textContent = '';
			navNotifications.textContent = '';
			UI.addClass(notifications, 'disabled');
			// 
		}
		//
		alertMsgWrapper.style.display = 'none';
		body.style.overflow = 'auto';
		//
		if (completedTasks.classList.contains('active')) {
			//
			UI.removeClass(completedTasks, 'active');
			UI.addClass(scheduledTasks, 'active');
			//
		}
		//
	});
	//
	// Complete Tasks
	document.querySelector('#alert-complete-btn').addEventListener('click', () => {
		//
		arrayPrevTasks.forEach((currDate) => {
			//
			let currKey = dateFormat(new Date(currDate), 'MMM-D-YYYY');
			//
			let flag = 0;
			Object.keys(user.completedTasks).forEach((day) => {
				//
				if (day === currKey) {
					//
					user.completedTasks[day] = user.completedTasks[day].concat(user.tasks[day])
					flag++;
					// 
					delete user.tasks[day];
					//
				}
				//
			});
			//
			if (!flag) {
				//
				user.completedTasks[currKey] = [];
				user.completedTasks[currKey] = user.completedTasks[currKey].concat(user.tasks[currKey]);
				// 
				delete user.tasks[currKey];
				//
			}
			//
		});
		//
		Store.setUser(user);
		// 
		arrayPrevTasks = [];
		listPastTasks.innerHTML = '';
		//
		if (notifications.lastElementChild.textContent.length) {
			// 
			notifications.lastElementChild.textContent = '';
			navNotifications.textContent = '';
			UI.addClass(notifications, 'disabled');
			// 
		}
		//
		alertMsgWrapper.style.display = 'none';
		body.style.overflow = 'auto';
		//
	});
	//
	// Dispose of Tasks
	document.querySelector('#alert-dispose-btn').addEventListener('click', () => {
		//
		arrayPrevTasks.forEach((currDate) => {
			//
			let currKey = dateFormat(new Date(currDate), 'MMM-D-YYYY');
			//
			delete user.tasks[currKey];
			//
			Store.setUser(user);
			//
		});
		//
		arrayPrevTasks = [];
		listPastTasks.innerHTML = '';
		//
		if (notifications.lastElementChild.textContent.length) {
			// 
			notifications.lastElementChild.textContent = '';
			navNotifications.textContent = '';
			UI.addClass(notifications, 'disabled');
			// 
		}
		//
		alertMsgWrapper.style.display = 'none';
		body.style.overflow = 'auto';
		//
	});
	//
	// Day Mode Event Listeners
	dayModeView.addEventListener('click', () => {
		//
		currToday = new Date();
		// 
		ui.renderDayModeCalendar(user, user.tasks);
		// 
		ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
		ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
		//
		calculateProgress();
		//
		if (
			leadTaskCompletedNum
				.parentElement.parentElement.parentElement.classList.contains('hide')
		) {
			//
			UI.removeClass(
				leadTaskCompletedNum.parentElement.parentElement.parentElement,
				'hide'
			);
			//
		}
		//
		if (!scheduledTasks.classList.contains('active')) {
			//
			UI.addClass(scheduledTasks, 'active');
			UI.removeClass(completedTasks, 'active');
			//
			UI.addClass(leadTaskCompletedNum.parentElement.parentElement, 'hide');
			UI.removeClass(
				leadTaskCompletedNum.parentElement.parentElement.previousElementSibling,
				'hide'
			);
			//
		}
		//
	});
	//
	lDayArrow.addEventListener('click', () => {
		//
		let newToday = currToday;
		let prevToday = dateFns.subDays(newToday, 1);
		currToday = prevToday;
		//
		if (scheduledTasks.classList.contains('active')) {
			//
			ui.renderDayModeCalendar(user, user.tasks);
			// 
			ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
			ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
			//
		} else {
			//
			ui.renderDayModeCalendar(user, user.completedTasks);
			// 
			Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
				//
				UI.addClass(uncompletedTask, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
				//
				UI.removeClass(completedTask, 'hide');
				//
			});
			// 
			ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
			ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
			//
		}
		//
		calculateProgress();
		//
	});
	//
	rDayArrow.addEventListener('click', () => {
		//
		let newToday = currToday;
		let nextToday = dateFns.addDays(newToday, 1);
		currToday = nextToday;
		//
		if (scheduledTasks.classList.contains('active')) {
			//
			ui.renderDayModeCalendar(user, user.tasks);
			// 
			ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
			ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
			//
		} else {
			//
			ui.renderDayModeCalendar(user, user.completedTasks);
			// 
			Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
				//
				UI.addClass(uncompletedTask, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
				//
				UI.removeClass(completedTask, 'hide');
				//
			});
			// 
			ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
			ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
			//
		}
		//
		calculateProgress();
		//
	});
	//
	// Week Mode Event Listeners
	weekModeView.addEventListener('click', () => {
		//
		ui.renderWeekModeCalendar('current', user);
		currFirstDayOfWeek = dateFns.startOfWeek(today);
		UI.removeClass(searchFormWrapper, 'search-form-open');
		//
		if (
			!leadTaskCompletedNum
				.parentElement.parentElement.parentElement.classList.contains('hide')
		) {
			//
			UI.addClass(
				leadTaskCompletedNum.parentElement.parentElement.parentElement,
				'hide'
			);
			//
		}
		//
	});
	//
	lWeekArrow.addEventListener('click', () => {
		//
		ui.renderWeekModeCalendar('previous', user);
		//
	});
	//
	rWeekArrow.addEventListener('click', () => {
		//
		ui.renderWeekModeCalendar('next', user);
		//
	});
	//
	// Month Mode Event Listeners
	monthModeView.addEventListener('click', () => {
		//
		currToday = today;
		//
		ui.setTableBodyHead();
		ui.renderMonthModeCalendar(today.getFullYear(), today.getMonth(), user);
		UI.removeClass(searchFormWrapper, 'search-form-open');
		//
		if (
			!leadTaskCompletedNum
				.parentElement.parentElement.parentElement.classList.contains('hide')
		) {
			//
			UI.addClass(
				leadTaskCompletedNum.parentElement.parentElement.parentElement,
				'hide'
			);
			//
		}
		//
	});
	//
	monthModeMonth.addEventListener('change', (e) => {
		//
		tableBody.innerHTML = '';
		ui.renderMonthModeCalendar(Number(monthModeYear.textContent), e.target.selectedIndex, user);
		//
	});
	//
	lMonthArrow.addEventListener('click', () => {
		//
		tableBody.innerHTML = '';
		let year = Number(monthModeYear.textContent);
		let month = monthModeMonth.selectedIndex - 1;
		if (month === -1) {
			month = 11;
			year--;
		}
		ui.renderMonthModeCalendar(year, month, user);
		//
	});
	//
	rMonthArrow.addEventListener('click', () => {
		//
		tableBody.innerHTML = '';
		let year = Number(monthModeYear.textContent);
		let month = monthModeMonth.selectedIndex + 1;
		if (month === 12) {
			month = 0;
			year++;
		}
		ui.renderMonthModeCalendar(year, month, user);
		//
	});
	//
	// Event listeners - searching tasks
	searchIconPrimary.addEventListener('click', () => {
		//
		searchFormWrapper.classList.toggle('search-form-open');
		if (searchFormWrapper.classList.contains('search-form-open')) {
			//
			searchForm.focus();
			searchForm.select();
			//
		}
		//
		searchForm.value = '';
		//
		const list = document.querySelector('.tasks');
		//
		Array.from(list.children).forEach((task) => UI.removeClass(task, 'filtered'));
		//
	});
	//
	searchForm.addEventListener('keyup', () => {
		//
		const term = searchForm.value.trim().toLowerCase();
		ui.filterTasks(term);
		//
	});
	//
	// Event listeners - adding a task
	addIconPrimary.addEventListener('click', () => {
		//
		addFormWrapper.classList.toggle('add-form-open');
		UI.removeClass(pickDateFormWrapper, 'pick-date-form-open');
		//
		if (addFormWrapper.classList.contains('add-form-open')) {
			//
			addForm.add.disabled = false;
			document.querySelector('.add input').focus();
			document.querySelector('.add input').select();
			//
		}
		//
		dateToasts.innerHTML = '';
		//
	});
	//
	pickDate.addEventListener('click', () => {
		//
		pickDateFormWrapper.classList.toggle('pick-date-form-open');
		dateToasts.innerHTML = '';
		//
	});
	//
	addForm.addEventListener('submit', (e) => {
		//
		e.preventDefault();
		//
		const task = addForm.add.value.trim();
		//
		if (task.length && !tableBody.classList.contains('pick-date-mode')) {
			//
			let flag = 0;
			Object.keys(user.tasks).forEach((day) => {
				//
				if (day === dateFormat(currToday, 'MMM-D-YYYY')) {
					//
					user.tasks[day].push(task);
					flag++;
					//
					if (day === dateFormat(today, 'MMM-D-YYYY')) {
						//
						leadTaskNum.textContent = user.tasks[day].length;
						//
					}
				}
			});
			//
			if (!flag) {
				//
				user.tasks[dateFormat(currToday, 'MMM-D-YYYY')] = [];
				user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].push(task);
				//
				if (dateFormat(currToday, 'MMM-D-YYYY') === dateFormat(today, 'MMM-D-YYYY')) {
					//
					leadTaskNum.textContent = user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].length;
					//
				}
			}
			//
			Store.setUser(user);
			//
			addFormWrapper.classList.toggle('add-form-open');
			UI.removeClass(pickDateFormWrapper, 'pick-date-form-open');
			//
			addForm.reset();
			//
			ui.renderDayModeCalendar(user, user.tasks);
			//
			if (completedTasks.classList.contains('active')) {
				//
				UI.removeClass(completedTasks, 'active');
				UI.addClass(scheduledTasks, 'active');
				//
			}
			//
			if (user.tasks[dateFormat(currToday, 'MMM-D-YYYY')]) {
				//
				leadTaskNum.textContent = user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].length;
				//
			} else {
				//
				leadTaskNum.textContent = 0;
				//
			}
			//
			searchForm.value = '';
			//
			const list = document.querySelector('.tasks');
			//
			Array.from(list.children).forEach((task) => UI.removeClass(task, 'filtered'));
			//
			if (
				leadTaskCompletedNum
					.parentElement.parentElement.parentElement.classList.contains('hide')
			) {
				//
				UI.removeClass(
					leadTaskCompletedNum.parentElement.parentElement.parentElement,
					'hide'
				);
				//
			}
			//
			if (
				!leadTaskCompletedNum.parentElement.parentElement.classList.contains('hide')
			) {
				//
				UI.addClass(leadTaskCompletedNum.parentElement.parentElement, 'hide');
				UI.removeClass(
					leadTaskCompletedNum.parentElement.parentElement.previousElementSibling,
					'hide'
				);
				//
			}
			//
			calculateProgress();
			// 
			addForm.add.disabled = true;
			//
		} else if (task.length && tableBody.classList.contains('pick-date-mode')) {
			//
			if (!dateToasts.children.length) {
				//
				let selector = dateFormat(new Date(), 'MMM-D-YYYY');
				ui.addToast(dateFormat(new Date(), 'D MMM YY'), selector);
				//
			}
			//
			Array.from(dateToasts.children).forEach((dateToast) => {
				//
				let flag = 0;
				Object.keys(user.tasks).forEach((day) => {
					//
					if (day === dateToast.id) {
						//
						user.tasks[day].push(task);
						flag++;
						//
					}
					//
				});
				//
				if (!flag) {
					//
					user.tasks[dateToast.id] = [];
					user.tasks[dateToast.id].push(task);
					//
				}
				//
				Store.setUser(user);
				//
			});
			//
			addIconPrimary.disabled = false;
			moreOptionsBtn.disabled = false;
			dayModeView.disabled = false;
			weekModeView.disabled = false;
			pickDate.disabled = false;
			dateToasts.innerHTML = '';
			UI.removeClass(tableBody, 'pick-date-mode');
			UI.addClass(pickDatePickMode, 'btn-outline-light');
			UI.removeClass(pickDatePickMode, 'btn-outline-danger');
			UI.removeClass(pickDateFormWrapper, 'pick-date-form-open');
			addFormWrapper.classList.toggle('add-form-open');
			addForm.reset();
			//
			ui.setTableBodyHead();
			ui.renderMonthModeCalendar(today.getFullYear(), today.getMonth(), user);
			// 
			addForm.add.disabled = true;
			//
		}
		//
	});
	//
	// Event listeners - pick mode & date toasts
	pickDatePickMode.addEventListener('click', () => {
		//
		if (tableBody.classList.contains('pick-date-mode')) {
			//
			addIconPrimary.disabled = false;
			moreOptionsBtn.disabled = false;
			dayModeView.disabled = false;
			weekModeView.disabled = false;
			pickDate.disabled = false;
			UI.removeClass(tableBody, 'pick-date-mode');
			UI.addClass(pickDatePickMode, 'btn-outline-light');
			UI.removeClass(pickDatePickMode, 'btn-outline-danger');
			//
			ui.renderDayModeCalendar(user, user.tasks);
			//
		} else {
			//
			ui.setTableBodyHead(tableHeadMonthMode);
			//
			if (tableBody.classList.contains('month-mode')) {
				//
				ui.renderMonthModeCalendar(Number(monthModeYear.textContent), monthModeMonth.selectedIndex, user);
				//
			} else {
				//
				ui.renderMonthModeCalendar(today.getFullYear(), today.getMonth(), user);
				//
			}
			//
			addIconPrimary.disabled = true;
			moreOptionsBtn.disabled = true;
			dayModeView.disabled = true;
			weekModeView.disabled = true;
			pickDate.disabled = true;
			UI.addClass(tableBody, 'pick-date-mode');
			UI.removeClass(pickDatePickMode, 'btn-outline-light');
			UI.addClass(pickDatePickMode, 'btn-outline-danger');
			//
		}
		//
	});
	//
	document.querySelector('#pick-date-today-btn').addEventListener('click', () => {
		//
		if (Array.from(dateToasts.children).length >= Number(document.querySelector('#' + user.options.toast).textContent)) {
			// 
			const toastWrapper = document.querySelector('.toast-message-wrapper');
			//
			toastWrapper.style.display = 'flex';
			body.style.overflow = 'hidden';
			//
			document.addEventListener('click', (e) => {
				//
				if (e.target.classList.contains('toast-message-wrapper')) {
					//
					toastWrapper.style.display = 'none';
					body.style.overflow = 'auto';
					listPastTasks.innerHTML = '';
					//
				}
				//
			});
			//
			const toastCloseBtn = document.querySelector('.toast-close-btn');
			//
			toastCloseBtn.addEventListener('click', () => {
				//
				toastWrapper.style.display = 'none';
				body.style.overflow = 'auto';
				listPastTasks.innerHTML = '';
				//
			});
			//
		} else {
			// 
			let selector = dateFormat(new Date(), 'MMM-D-YYYY');
			//
			if (Array.from(dateToasts.children).filter((todayToast) => todayToast.id === selector).length) {
			} else {
				//
				ui.addToast(dateFormat(new Date(), 'D MMM YY'), selector);
				$('.toast').toast('show');
				//
			}
			// 
		}
		// 
	});
	//
	dateToasts.addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('x')) {
			//
			e.target.parentElement.parentElement.parentElement.remove();
			//
		}
		//
	});
	// 
	// Select All Event Listeners
	document.querySelector('#select-all-btn').addEventListener('click', e => {
		// 
		if (Array.from(document.querySelectorAll('.tasks .list-group-item')).length) {
			// 
			e.preventDefault();
			// 
			selectAllOptions.classList.toggle('select-all-options-open');
			// 
			searchIconPrimary.disabled = true;
			addIconPrimary.disabled = true;
			moreOptionsBtn.disabled = true;
			rDayArrow.disabled = true;
			lDayArrow.disabled = true;
			dayModeView.disabled = true;
			weekModeView.disabled = true;
			monthModeView.disabled = true;
			userNavbar.disabled = true;
			scheduledTasks.disabled = true;
			completedTasks.disabled = true;
			// 
			Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
				//
				UI.addClass(uncompletedTask, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
				//
				UI.addClass(completedTask, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.edit')).forEach((editIcon) => {
				//
				UI.addClass(editIcon, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.delete')).forEach((deleteIcon) => {
				//
				UI.addClass(deleteIcon, 'hide');
				//
			});
			// 
			Array.from(document.querySelectorAll('.tasks .list-group-item')).forEach((taskItem) => {
				//
				UI.addClass(taskItem, 'selected');
				//
			});
			// 
			if (scheduledTasks.classList.contains('active')) {
				// 
				document.querySelector('#mark-as-btn').innerHTML = 'Mark As Completed';
				// 
			} else {
				// 
				document.querySelector('#mark-as-btn').innerHTML = 'Mark As Scheduled';
				// 
			}
			// 
		}
		// 
	});
	// 
	// Mark As Button
	document.querySelector('#mark-as-btn').addEventListener('click', () => {
		// 
		const taskItems = document.querySelectorAll('.tasks .list-group-item');
		// 
		if (scheduledTasks.classList.contains('active')) {
			// 
			if (taskItems) {
				// 
				Array.from(taskItems).forEach((taskItem) => {
					//
					const completedMssg = document.createElement('p');
					UI.addClass(completedMssg, 'm-0');
					completedMssg.appendChild(document.createTextNode('Task Completed'));
					taskItem.appendChild(completedMssg);
					//
					UI.addClass(taskItem, 'fade-out');
					// 
					const task = taskItem.firstElementChild.nextElementSibling.innerHTML;
					//
					let flag = 0;
					Object.keys(user.completedTasks).forEach((day) => {
						//
						if (day === dateFormat(currToday, 'MMM-D-YYYY')) {
							//
							user.completedTasks[day].push(task);
							flag++;
							//
						}
						//
					});
					//
					if (!flag) {
						//
						user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')] = [];
						user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].push(task);
						//
					}
					//
					setTimeout(() => {
						//
						taskItem.remove();
						//
					}, 1500);
					// 
				});
				// 
				delete user.tasks[dateFormat(currToday, 'MMM-D-YYYY')];
				// 
			}
			// 
		} else {
			// 
			if (taskItems) {
				// 
				Array.from(taskItems).forEach((taskItem) => {
					//
					const completedMssg = document.createElement('p');
					UI.addClass(completedMssg, 'm-0');
					completedMssg.appendChild(document.createTextNode('Moved to Scheduled'));
					taskItem.appendChild(completedMssg);
					//
					UI.addClass(taskItem, 'fade-out');
					// 
					const task = taskItem.firstElementChild.nextElementSibling.innerHTML;
					//
					let flag = 0;
					Object.keys(user.tasks).forEach((day) => {
						//
						if (day === dateFormat(currToday, 'MMM-D-YYYY')) {
							//
							user.tasks[day].push(task);
							flag++;
							//
						}
						//
					});
					//
					if (!flag) {
						//
						user.tasks[dateFormat(currToday, 'MMM-D-YYYY')] = [];
						user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].push(task);
						//
					}
					//
					setTimeout(() => {
						//
						taskItem.remove();
						//
					}, 1500);
					// 
				});
				// 
				delete user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')];
				// 
			}
			// 
		}
		// 
		ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
		ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
		// 
		Store.setUser(user);
		calculateProgress();
		// 
		selectAllOptions.classList.toggle('select-all-options-open');
		// 
		searchIconPrimary.disabled = false;
		addIconPrimary.disabled = false;
		moreOptionsBtn.disabled = false;
		rDayArrow.disabled = false;
		lDayArrow.disabled = false;
		dayModeView.disabled = false;
		weekModeView.disabled = false;
		monthModeView.disabled = false;
		userNavbar.disabled = false;
		scheduledTasks.disabled = false;
		completedTasks.disabled = false;
		// 
	});
	// 
	// Delete Button
	document.querySelector('#delete-btn').addEventListener('click', e => {
		// 
		const taskItems = document.querySelectorAll('.tasks .list-group-item');
		// 
		if (taskItems) {
			// 
			Array.from(taskItems).forEach((taskItem) => {
				//
				const completedMssg = document.createElement('p');
				UI.addClass(completedMssg, 'm-0');
				completedMssg.appendChild(document.createTextNode('Task Deleted'));
				taskItem.appendChild(completedMssg);
				//
				UI.addClass(taskItem, 'fade-out');
				//
				setTimeout(() => {
					//
					taskItem.remove();
					//
				}, 1500);
				// 
			});
			// 
			if (scheduledTasks.classList.contains('active')) {
				// 
				delete user.tasks[dateFormat(currToday, 'MMM-D-YYYY')];
				// 
				leadTaskNum.textContent = 0;
				// 
			} else {
				// 
				delete user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')];
				// 
				leadTaskCompletedNum.textContent = 0;
				// 
			}
			// 
		}
		// 
		Store.setUser(user);
		calculateProgress();
		// 
		selectAllOptions.classList.toggle('select-all-options-open');
		// 
		searchIconPrimary.disabled = false;
		addIconPrimary.disabled = false;
		moreOptionsBtn.disabled = false;
		rDayArrow.disabled = false;
		lDayArrow.disabled = false;
		dayModeView.disabled = false;
		weekModeView.disabled = false;
		monthModeView.disabled = false;
		userNavbar.disabled = false;
		scheduledTasks.disabled = false;
		completedTasks.disabled = false;
		// 
	});
	// 
	// Deselct Button
	document.querySelector('#deselect-btn').addEventListener('click', () => {
		// 
		if (scheduledTasks.classList.contains('active')) {
			// 
			Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
				//
				UI.removeClass(uncompletedTask, 'hide');
				//
			});
			// 
		} else {
			// 
			Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
				//
				UI.removeClass(completedTask, 'hide');
				//
			});
			// 
		}
		Array.from(document.querySelectorAll('.edit')).forEach((editIcon) => {
			//
			UI.removeClass(editIcon, 'hide');
			//
		});
		Array.from(document.querySelectorAll('.delete')).forEach((deleteIcon) => {
			//
			UI.removeClass(deleteIcon, 'hide');
			//
		});
		// 
		Array.from(document.querySelectorAll('.list-group-item')).forEach((taskItem) => {
			//
			UI.removeClass(taskItem, 'selected');
			//
		});
		// 
		selectAllOptions.classList.toggle('select-all-options-open');
		// 
		searchIconPrimary.disabled = false;
		addIconPrimary.disabled = false;
		moreOptionsBtn.disabled = false;
		rDayArrow.disabled = false;
		lDayArrow.disabled = false;
		dayModeView.disabled = false;
		weekModeView.disabled = false;
		monthModeView.disabled = false;
		userNavbar.disabled = false;
		scheduledTasks.disabled = false;
		completedTasks.disabled = false;
		// 
	});
	//
	// Event listeners - deleting, editing, pick a date in pick mode, etc.
	let startTask = '';
	//
	tableBody.addEventListener('click', (e) => {
		//
		if (!tableBody.classList.contains('pick-date-mode') && e.target instanceof HTMLTableCellElement) {
			//
			if (tableBody.classList.contains('month-mode')) {
				//
				if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
					//
					let day = Number(e.target.childNodes[0].nodeValue);
					let month = monthModeMonth.selectedIndex;
					let year = Number(monthModeYear.textContent);
					currToday = new Date(year, month, day);
					//
					if (scheduledTasks.classList.contains('active')) {
						//
						ui.renderDayModeCalendar(user, user.tasks);
						//
					} else {
						//
						ui.renderDayModeCalendar(user, user.completedTasks);
						//
						Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
							//
							UI.addClass(uncompletedTask, 'hide');
							//
						});
						Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
							//
							UI.removeClass(completedTask, 'hide');
							//
						});
						//
					}
					// 
					ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
					ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
					//
					if (
						leadTaskCompletedNum
							.parentElement.parentElement.parentElement.classList.contains('hide')
					) {
						//
						UI.removeClass(
							leadTaskCompletedNum.parentElement.parentElement.parentElement,
							'hide'
						);
						//
					}
					//
					calculateProgress();
					//
				}
			}
		}
		//
		if (tableBody.classList.contains('pick-date-mode') && e.target.classList.contains('valid-day')) {
			//
			let day = Number(e.target.childNodes[0].nodeValue);
			let month = monthModeMonth.selectedIndex;
			let year = Number(monthModeYear.textContent);
			let selector = dateFormat(new Date(year, month, day), 'MMM-D-YYYY');
			//
			if (Array.from(dateToasts.children).length >= Number(document.querySelector('#' + user.options.toast).textContent)) {
				//
				const toastWrapper = document.querySelector('.toast-message-wrapper');
				//
				toastWrapper.style.display = 'flex';
				body.style.overflow = 'hidden';
				//
				document.addEventListener('click', (e) => {
					//
					if (e.target.classList.contains('toast-message-wrapper')) {
						//
						toastWrapper.style.display = 'none';
						body.style.overflow = 'auto';
						listPastTasks.innerHTML = '';
						//
					}
					//
				});
				//
				const toastCloseBtn = document.querySelector('.toast-close-btn');
				//
				toastCloseBtn.addEventListener('click', () => {
					//
					toastWrapper.style.display = 'none';
					body.style.overflow = 'auto';
					listPastTasks.innerHTML = '';
					//
				});
				//
			} else {
				//
				if (Array.from(dateToasts.children).filter((todayToast) => todayToast.id === selector).length) {
				} else {
					//
					ui.addToast(dateFormat(new Date(year, month, day), 'D MMM YY'), selector);
					$('.toast').toast('show');
					//
				}
				//
			}
			//
		}
		//
		if (e.target.classList.contains('delete')) {
			//
			if (!e.target.parentElement.firstElementChild.classList.contains('hide')) {
				//
				if (scheduledTasks.classList.contains('active')) {
					//
					e.target.parentElement.parentElement.remove();
					//
					let deleteIndex = Number(e.target.parentElement.parentElement.id.substring(4));
					user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].splice(deleteIndex, 1);
					//
					[].forEach.call(document.querySelectorAll('.tasks li'), (li, index) => {
						//
						li.id = 'task' + index;
						//
					});
					//
					if (dateFormat(currToday, 'MMM-D-YYYY') === dateFormat(today, 'MMM-D-YYYY')) {
						//
						leadTaskNum.textContent = user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].length;
						//
					}
					//
					if (!user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].length) {
						//
						delete user.tasks[dateFormat(currToday, 'MMM-D-YYYY')];
						//
					}
					//
					ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
					//
				} else if (completedTasks.classList.contains('active')) {
					//
					e.target.parentElement.parentElement.remove();
					//
					let deleteIndex = Number(e.target.parentElement.parentElement.id.substring(4));
					user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].splice(deleteIndex, 1);
					//
					[].forEach.call(document.querySelectorAll('.tasks li'), (li, index) => {
						//
						li.id = 'task' + index;
						//
					});
					//
					if (!user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].length) {
						//
						delete user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')];
						//
					}
					// 
					ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
					//
				}
				//
				Store.setUser(user);
				calculateProgress();
				// 
			}
			//
		}
		//
		if (e.target.classList.contains('edit')) {
			//
			startTask = e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent;
			e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
				'contenteditable',
				'true'
			);
			//
			document.querySelectorAll('.tasks li').forEach((curr) => {
				curr.draggable = false;
			});
			//
			const el = e.target.parentElement.parentElement.firstElementChild.nextElementSibling;
			let range = document.createRange();
			let sel = window.getSelection();
			console.log(el.textContent.length);
			range.setStart(el.childNodes[0], el.textContent.length);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
			el.focus();
			//
			UI.addClass(e.target, 'hide');
			UI.removeClass(e.target.nextElementSibling, 'hide');
			//
			searchIconPrimary.disabled = true;
			addIconPrimary.disabled = true;
			moreOptionsBtn.disabled = true;
			rDayArrow.disabled = true;
			lDayArrow.disabled = true;
			dayModeView.disabled = true;
			weekModeView.disabled = true;
			monthModeView.disabled = true;
			userNavbar.disabled = true;
			scheduledTasks.disabled = true;
			completedTasks.disabled = true;
			//
			UI.addClass(el.parentElement, 'editable');
			//
			searchForm.disabled = true;
			// 
			e.target.parentElement.parentElement.firstElementChild.nextElementSibling.addEventListener('keydown', (evt) => {
				// 
				if (evt.keyCode === 13) {
					// 
					evt.preventDefault();
					// 
				}
				// 
			});
			//
		}
		//
		if (e.target.classList.contains('uncompleted')) {
			//
			if (
				!e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
				scheduledTasks.classList.contains('active')
			) {
				//
				e.target.classList.toggle('hide');
				e.target.nextElementSibling.classList.toggle('hide');
				//
				e.target.parentElement.nextElementSibling.nextElementSibling.remove();
				UI.addClass(e.target.parentElement.nextElementSibling, 'hide');
				//
				const completedMssg = document.createElement('p');
				UI.addClass(completedMssg, 'm-0');
				completedMssg.appendChild(document.createTextNode('Task Completed'));
				e.target.parentElement.parentElement.appendChild(completedMssg);
				//
				UI.addClass(e.target.parentElement.parentElement, 'fade-out');
				//
				const task = e.target.parentElement.nextElementSibling.innerHTML;
				// 
				let flag = 0;
				Object.keys(user.completedTasks).forEach((day) => {
					//
					if (day === dateFormat(currToday, 'MMM-D-YYYY')) {
						//
						user.completedTasks[day].push(task);
						flag++;
						//
					}
					//
				});
				//
				if (!flag) {
					//
					user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')] = [];
					user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].push(task);
					//
				}
				//
				setTimeout(() => {
					//
					e.target.parentElement.parentElement.remove();
					//
					let deleteIndex = Number(e.target.parentElement.parentElement.id.substring(4));
					user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].splice(deleteIndex, 1);
					//
					[].forEach.call(document.querySelectorAll('.tasks li'), (li, index) => {
						//
						li.id = 'task' + index;
						//
					});
					//
					if (!user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].length) {
						//
						delete user.tasks[dateFormat(currToday, 'MMM-D-YYYY')];
						//
					}
					//
					Store.setUser(user);
					// 
					ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
					ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
					//
					calculateProgress();
					//
				}, 1500);
				//
			}
		}
		//
		if (e.target.classList.contains('completed')) {
			//
			if (
				!e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
				completedTasks.classList.contains('active')
			) {
				//
				e.target.classList.toggle('hide');
				e.target.previousElementSibling.classList.toggle('hide');
				//
				e.target.parentElement.nextElementSibling.nextElementSibling.remove();
				//
				UI.addClass(e.target.parentElement.nextElementSibling, 'hide');
				//
				const uncompletedMssg = document.createElement('p');
				UI.addClass(uncompletedMssg, 'm-0');
				uncompletedMssg.appendChild(document.createTextNode('Moved to Scheduled'));
				e.target.parentElement.parentElement.appendChild(uncompletedMssg);
				//
				UI.addClass(e.target.parentElement.parentElement, 'fade-out');
				//
				const task = e.target.parentElement.nextElementSibling.innerHTML;
				//
				let flag = 0;
				Object.keys(user.tasks).forEach((day) => {
					//
					if (day === dateFormat(currToday, 'MMM-D-YYYY')) {
						//
						user.tasks[day].push(task);
						flag++;
						//
					}
					//
				});
				//
				if (!flag) {
					//
					user.tasks[dateFormat(currToday, 'MMM-D-YYYY')] = [];
					user.tasks[dateFormat(currToday, 'MMM-D-YYYY')].push(task);
					//
				}
				//
				setTimeout(() => {
					//
					e.target.parentElement.parentElement.remove();
					//
					let deleteIndex = Number(e.target.parentElement.parentElement.id.substring(4));
					user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].splice(deleteIndex, 1);
					//
					[].forEach.call(document.querySelectorAll('.tasks li'), (li, index) => {
						//
						li.id = 'task' + index;
						//
					});
					//
					if (!user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')].length) {
						//
						delete user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')];
						//
					}
					//
					Store.setUser(user);
					// 
					ui.checkSetTaskNum(user.tasks, currToday, leadTaskNum);
					ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
					//
					calculateProgress();
					//
				}, 1500);
				//
				//
			}
			//
		}
		//
		if (e.target.classList.contains('ongoing-edit')) {
			//
			if (scheduledTasks.classList.contains('active')) {
				//
				if (e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent === '') {
					//
					e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent = startTask;
					//
				}
				//
				e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
					'contenteditable',
					'false'
				);
				//
				let taskList = [];
				//
				document.querySelectorAll('.tasks li').forEach((curr) => {
					//
					curr.draggable = true;
					taskList.push(curr.textContent);
					//
				});
				//
				UI.removeClass(e.target.previousElementSibling, 'hide');
				UI.addClass(e.target, 'hide');
				//
				searchIconPrimary.disabled = false;
				addIconPrimary.disabled = false;
				moreOptionsBtn.disabled = false;
				rDayArrow.disabled = false;
				lDayArrow.disabled = false;
				dayModeView.disabled = false;
				weekModeView.disabled = false;
				monthModeView.disabled = false;
				userNavbar.disabled = false;
				scheduledTasks.disabled = false;
				completedTasks.disabled = false;
				//
				UI.removeClass(e.target.parentElement.parentElement, 'editable');
				//
				user.tasks[dateFormat(currToday, 'MMM-D-YYYY')] = taskList;
				Store.setUser(user);
				//
				searchForm.disabled = false;
				//
			} else if (completedTasks.classList.contains('active')) {
				//
				if (e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent === '') {
					//
					e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent = startTask;
					//
				}
				//
				e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
					'contenteditable',
					'false'
				);
				//
				let taskList = [];
				//
				document.querySelectorAll('.tasks li').forEach((curr) => {
					//
					curr.draggable = true;
					taskList.push(curr.textContent);
					//
				});
				//
				UI.removeClass(e.target.previousElementSibling, 'hide');
				UI.addClass(e.target, 'hide');
				//
				searchIconPrimary.disabled = false;
				addIconPrimary.disabled = false;
				moreOptionsBtn.disabled = false;
				rDayArrow.disabled = false;
				dayModeView.disabled = false;
				weekModeView.disabled = false;
				monthModeView.disabled = false;
				userNavbar.disabled = false;
				scheduledTasks.disabled = false;
				completedTasks.disabled = false;
				//
				UI.removeClass(e.target.parentElement.parentElement, 'editable');
				//
				user.completedTasks[dateFormat(currToday, 'MMM-D-YYYY')] = taskList;
				Store.setUser(user);
				//
			}
			//
		}
		//
	});
	//
	scheduledTasks.addEventListener('click', (e) => {
		//
		if (!e.target.classList.contains('active')) {
			//
			ui.renderDayModeCalendar(user, user.tasks);
			UI.addClass(e.target, 'active');
			UI.removeClass(e.target.nextElementSibling, 'active');
			//
			UI.removeClass(leadTaskNum.parentElement.parentElement, 'hide');
			UI.addClass(leadTaskNum.parentElement.parentElement.nextElementSibling, 'hide');
			//
		}
		//
	});
	//
	completedTasks.addEventListener('click', (e) => {
		//
		if (!e.target.classList.contains('active')) {
			//
			ui.renderDayModeCalendar(user, user.completedTasks);
			Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
				//
				UI.addClass(uncompletedTask, 'hide');
				//
			});
			Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
				//
				UI.removeClass(completedTask, 'hide');
				//
			});
			UI.addClass(e.target, 'active');
			UI.removeClass(e.target.previousElementSibling, 'active');
			//
			UI.removeClass(leadTaskCompletedNum.parentElement.parentElement, 'hide');
			UI.addClass(
				leadTaskCompletedNum.parentElement.parentElement.previousElementSibling,
				'hide'
			);
			// 
			ui.checkSetTaskNum(user.completedTasks, currToday, leadTaskCompletedNum);
			//
			searchForm.value = '';
			//
			const list = document.querySelector('.tasks');
			//
			Array.from(list.children).forEach((task) => UI.removeClass(task, 'filtered'));
			//
		}
		//
	});
	//
	// Change Theme Event Listener
	document.querySelector('#theme-btns-wrapper').addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('theme')) {
			//
			Array.from(themeBtns).some((themeBtn) => {
				//
				if (themeBtn.classList.contains('theme-active')) {
					//
					UI.removeClass(themeBtn, 'theme-active');
					//
					return true;
					//
				}
				//
			});
			//
			ui.chooseTheme(e.target.id);
			Store.setUserOptions(user, false, e.target.id);
			//
		}
		//
	});
	//
	// Change Avatar Event Listener
	document.querySelector('#avatar-btns-wrapper').addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('avatar')) {
			//
			Array.from(avatarBtns).some((avatarBtn) => {
				//
				if (avatarBtn.classList.contains('avatar-active')) {
					//
					UI.removeClass(avatarBtn, 'avatar-active');
					//
					return true;
					//
				}
				//
			});
			//
			ui.chooseAvatar(e.target.id);
			Store.setUserOptions(user, e.target.id);
			//
			userAvatar.setAttribute('class', e.target.firstElementChild.classList.value);
			UI.addClass(userAvatar, 'position-relative');
			//
		}
		//
		if (e.target.classList.contains('fas')) {
			//
			Array.from(avatarBtns).some((avatarBtn) => {
				//
				if (avatarBtn.classList.contains('avatar-active')) {
					//
					UI.removeClass(avatarBtn, 'avatar-active');
					//
					return true;
					//
				}
				//
			});
			//
			ui.chooseAvatar(e.target.parentElement.id);
			Store.setUserOptions(user, e.target.parentElement.id);
			//
			userAvatar.setAttribute('class', e.target.classList.value);
			UI.addClass(userAvatar, 'position-relative');
			//
		}
		//
	});
	// 
	// Change Toast Settings Event Listener
	document.querySelector('#toast-btns-wrapper').addEventListener('click', (e) => {
		//
		if (e.target.classList.contains('toast-change')) {
			//
			Array.from(toastBtns).some((toastBtn) => {
				//
				if (toastBtn.classList.contains('toast-active')) {
					//
					UI.removeClass(toastBtn, 'toast-active');
					//
					return true;
					//
				}
				//
			});
			//
			ui.chooseToast(e.target.id);
			Store.setUserOptions(user, false, false, e.target.id);
			//
		}
	});
	//
	// LogOut after 15 minutes of User Incactivity 
	(function() {
		// 
		const idleDurationSecs = 900; // X number of seconds - 15 minutes of user inactivity
		const redirectUrl = 'http://127.0.0.1:5500/FILES/000_github/07_task_manager_oop/index.html'; // Redirect idle users to this URL
		let idleTimeout; // variable to hold the timeout, do not modify
		// 
		const resetIdleTimeout = function() {
			// 
			// Clears the existing timeout
			if (idleTimeout) clearTimeout(idleTimeout);
			// Set a new idle timeout to load the redirectUrl after idleDurationSecs
			idleTimeout = setTimeout(() => {
				// 
				if (logIn) {
					// 
					location.href = redirectUrl
					// 
					logIn = false;
					// 
				}
				// 
			}, idleDurationSecs * 1000);
			// 
		};
		// Init on page load
		resetIdleTimeout();
		// 
		// Reset the idle timeout on any of the events listed below
		[ 'click', 'touchstart', 'mousemove' ].forEach((evt) =>
		document.addEventListener(evt, resetIdleTimeout, false)
		);
		// 
	})();
	//
});
//
