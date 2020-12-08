// Intro to Modules

// import './script_name'

// to import a particular function, variable, etc. from another file put export keyword in front of it in that file and then in index.js
// import { function_name, another_function } from './script'

// you can export things in the same file
// export const contact = 'sdsd';
// or
// export { function, function, variable }

// export default
// export default function
// and import in index.js
// import test from './script'
// import default_export, { regular_function } from './script'
// export { regular_function, default_export as default }

// firebase
// import firebase from "firebase/app";
// // Add the Firebase products that you want to use
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/functions";

import './css/style.css';
import UICtrl from './js/UICtrl';
import StoreCtrl from './js/StoreCtrl';
import DataCtrl from './js/DataCtrl';
import UserCtrl from './js/UserCtrl';
import DnDCtrl from './js/DnDCtrl';
import FirebaseCtrl from './js/FirebaseCtrl';
// 
import { format, parse, subDays, addDays, startOfWeek, addWeeks, eachDayOfInterval, getDate, isToday, getDayOfYear } from 'date-fns';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// App Controller
const AppCtrl = (function(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Initialize global user
    let globalUser = '';
    // Initialize global tasks
    let globalTasks = '';
    // Initialize global variables
    const globalVars = {
        currToday: new Date(),
        curr: true,
        months: {
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
        }
    }
    // Load event listeners
    const loadEventListeners = function() {
        // 
        // const tasks = userTasks;
        // UI event listeners
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelector('body').addEventListener('click', e => {
                // Add user - sign up & log in
                if (`#${e.target.id}` === UISelectors.addUserBtn) {
                    // Create add user mode
                    UICtrl.createAddMode();
                    // 
                    setTimeout(() => {
                        document.querySelector(UISelectors.loginMainDiv).classList.add('move-y-up');
                        document.querySelector(UISelectors.loginAddMode).classList.add('move-y-zero');
                        // 
                        document.querySelector(UISelectors.username).select();
                        document.querySelector(UISelectors.email).removeAttribute('tabindex');
                        document.querySelector(UISelectors.password).removeAttribute('tabindex');
                    }, 100)
                    // Validate username, email & password
                    Array.from(document.querySelectorAll('input')).forEach(input => input.addEventListener('keyup', e => {
                        DataCtrl.validate(e.target);
                        enableDisableCreateBtn();
                    }));
                    // Go Back from Add Account Screen
                    document.querySelector(UISelectors.addBackBtn).addEventListener('click', () => {
                        document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                        document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero');
                        setTimeout(() => {
                            document.querySelector(UISelectors.loginAddMode).remove();
                        }, 100)
                        console.log('back');
                    })
                    // Add new account - submit event
                    document.querySelector(UISelectors.addAccountForm).addEventListener('submit', e => {
                        e.preventDefault();
                        // Create and store new user in Firebase
                        const user = {
                            name: document.querySelector(UISelectors.username).value,
                            avatar: 'avatar-1',
                            theme: 'theme-1',
                            toast: 'toast-change-1'
                        }
                        FirebaseCtrl.signUp(document.querySelector(UISelectors.email).value, document.querySelector(UISelectors.password).value, user)
                            .then(() => {
                                console.log('i am here!!!');
                            });
                        // at this point user is created and logged in
                        // 
                        // Create confirm user mode
                        UICtrl.createConfirmMode();
                        document.querySelector(UISelectors.confirmUser).textContent = user.name;
                        // 
                        setTimeout(() => {
                            // Adjust UI to show confirm mode
                            document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero'); 
                            document.querySelector(UISelectors.loginAddMode).classList.add('move-y-up');
                            document.querySelector(UISelectors.loginConfirmMode).classList.add('move-y-zero');
                        }, 100)
                        // 
                        setTimeout(() => {
                            // Adjust UI to show main app screen
                            document.querySelector(UISelectors.loginConfirmMode).classList.remove('move-y-zero');
                            // Show login loader
                            UICtrl.createLoginLoader();
                            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
                            // 
                            document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                            document.querySelector(UISelectors.loginAddMode).remove();
                            document.querySelector(UISelectors.loginConfirmMode).remove();
                            // Clear login accounts
                            document.querySelector(UISelectors.loginAccounts).innerHTML = '';
                            // 
                            setTimeout(() => {
                                // Adjust UI to show main app screen
                                document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                                document.querySelector('body').style.overflow = 'auto';
                                // Set vars on welcome page
                                document.querySelector(UISelectors.welcomeHeader).textContent = user.name;
                                document.querySelector(UISelectors.leadTodayDate).textContent = format(new Date(), "do 'of' MMMM yyyy");
                                // 
                                setTimeout(() => {
                                    document.querySelector(UISelectors.loginLoader).remove();
                                }, 500);
                            }, 2000);
                        }, 2000);
                    })
                }
                // Log in
                console.log(document.querySelector(UISelectors.loginAccounts).contains(e.target));
                console.log(e.target.tagName);
                if (document.querySelector(UISelectors.loginAccounts).contains(e.target) && !document.querySelector(UISelectors.loginAccounts).classList.contains('empty')) {
                    let id = '';
                    if (e.target.tagName.toLowerCase() === 'i') {
                        id = e.target.parentElement.id;
                    } else if(e.target.tagName.toLowerCase() === 'li') {
                        id = e.target.id;
                    }
                    // 
                    UICtrl.createLogInMode(id);
                    // 
                    setTimeout(() => {
                        document.querySelector(UISelectors.loginMainDiv).classList.add('move-x-left');
                        document.querySelector(UISelectors.logInConfirmMode).classList.add('move-x-zero');
                        document.querySelector(UISelectors.email).select();
                    }, 100)
                    // Go back btn clicked
                    document.querySelector(UISelectors.logInConfirmBackBtn).addEventListener('click', () => {
                        console.log('back from login');
                        document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                        document.querySelector(UISelectors.logInConfirmMode).classList.remove('move-x-zero');
                        setTimeout(() => {
                            document.querySelector(UISelectors.logInConfirmMode).remove();
                        }, 100)
                    })
                    // LogIn to an Account
                    document.querySelector(UISelectors.logInForm).addEventListener('submit', (e) => {
                        e.preventDefault();
                        console.log('tutaj tutaj tutaj');
                        // 
                        const emailValue = document.querySelector(UISelectors.email);
                        const passValue = document.querySelector(UISelectors.password);
                        const errorPara = document.querySelector(UISelectors.errorPara);
                        FirebaseCtrl.logIn(emailValue.value, passValue.value)
                            .then(credentials => {
                                console.log(credentials.user);
                                // Adjust UI
                                document.querySelector(UISelectors.logInConfirmMode).remove();
                                // Show login loader
                                UICtrl.createLoginLoader();
                                document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
                                // 
                                document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                            })
                            .catch(error => {
                                console.log(error);
                                console.log('w error jestem');
                                const { msg, email, pass } = DataCtrl.errorHandling(error.code);
                                switch (true) {
                                    case emailValue.value === '' && passValue.value === '':
                                        errorPara.innerHTML = "No email and password provided.";
                                        errorPara.classList.remove('hide');
                                        emailValue.classList.add('invalid');
                                        passValue.classList.add('invalid');
                                        emailValue.disabled = true;
                                        passValue.disabled = true;
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                            passValue.classList.remove('invalid');
                                            emailValue.disabled = false;
                                            passValue.disabled = false;
                                        }, 3000);
                                        break;
                                    case email === 1 && pass === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        emailValue.classList.add('invalid');
                                        passValue.classList.add('invalid');
                                        emailValue.disabled = true;
                                        passValue.disabled = true;
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                            passValue.classList.remove('invalid');
                                            emailValue.disabled = false;
                                            passValue.disabled = false;
                                        }, 3000);
                                        break;
                                    case email === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        emailValue.classList.add('invalid');
                                        emailValue.disabled = true;
                                        passValue.disabled = true;
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                            emailValue.disabled = false;
                                            passValue.disabled = false;
                                        }, 3000);
                                        break;
                                    case pass === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        passValue.classList.add('invalid');
                                        emailValue.disabled = true;
                                        passValue.disabled = true;
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            passValue.classList.remove('invalid');
                                            emailValue.disabled = false;
                                            passValue.disabled = false;
                                        }, 3000);
                                        break;
                                }
                            });
                    });
                }
                // Log out
                if (`#${e.target.id}` === UISelectors.logOut) {
                    console.log('tutaj jestem');
                    FirebaseCtrl.logOut()
                        .then(() => {
                            console.log('user logged out');
    
                            document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                            document.querySelector(UISelectors.welcomeHeader).textContent = '';
                            document.querySelector(UISelectors.leadTodayDate).textContent = '';
                        });
                }
                // Show/Hide password
                if (`.${e.target.className}` === UISelectors.showHidePass) {
                    UICtrl.showHidePass(e.target, document.querySelector(UISelectors.password));
                }
                // Remove user
                if (`#${e.target.id}` === UISelectors.removeUserBtn) {
                    UICtrl.createRemoveMode();
                    // 
                    setTimeout(() => {
                        // render list elements
                        UICtrl.renderListElements(UISelectors.loginAccounts, UISelectors.loginRemoveAccounts);
                        // 
                        document.querySelector(UISelectors.loginMainDiv).classList.add('move-y-up');
                        document.querySelector(UISelectors.loginRemoveMode).classList.add('move-y-zero');
                    }, 100);
                    // Go Back from Remove Account Screen
                    document.querySelector(UISelectors.removeBackBtn).addEventListener('click', () => {
                        setTimeout(() => {
                            // render list elements
                            UICtrl.renderListElements(UISelectors.loginRemoveAccounts, UISelectors.loginAccounts);
                            // 
                            document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                            document.querySelector(UISelectors.loginRemoveMode).classList.remove('move-y-zero');
                            // 
                            document.querySelector(UISelectors.loginRemoveMode).remove();
                        }, 100);
                    });
                    // Remove account screen
                    document.querySelector(UISelectors.loginRemoveAccounts).addEventListener('click', e => {
                        //
                        if (document.querySelector(UISelectors.loginRemoveAccounts).contains(e.target)) {
                            let id = '';
                            if (e.target.tagName.toLowerCase() === 'i') {
                                id = e.target.parentElement.id;
                            } else if(e.target.tagName.toLowerCase() === 'li') {
                                id = e.target.id;
                            }
                            // 
                            // UICtrl.createConfirmRemove(id);
                        }
                        //
                    });
                }
                // Add task
                if (`#${e.target.id}` === UISelectors.addOption || document.querySelector(UISelectors.addOption).contains(e.target)) {
                    console.log('add option clicked');
                    document.querySelector(UISelectors.addFormWrapper).classList.toggle('add-form-open');
                    // UI.removeClass(pickDateFormWrapper, 'pick-date-form-open');
                    //
                    if (document.querySelector(UISelectors.addFormWrapper).classList.contains('add-form-open')) {
                        document.querySelector(UISelectors.addForm).add.disabled = false;
                        document.querySelector(UISelectors.addFormInputs).focus();
                        document.querySelector(UISelectors.addFormInputs).select();
                    }
                    // dateToasts.innerHTML = '';
                }
                // Search tasks
                if (`#${e.target.id}` === UISelectors.searchTasks || document.querySelector(UISelectors.searchTasks).contains(e.target)) {
                    console.log('search option clicked');
                    document.querySelector(UISelectors.searchFormWrapper).classList.toggle('search-form-open');
                    if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                        document.querySelector(UISelectors.searchForm).searchInput.focus();
                        document.querySelector(UISelectors.searchForm).searchInput.select();
                    }
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                    // 
                    const list = document.querySelector(UISelectors.tasks);
                    Array.from(list.children).forEach(task => {
                        task.classList.remove('filtered');
                    });
                }
                // Left arrow in day mode clicked
                if (`#${e.target.id}` === UISelectors.lDayArrow || document.querySelector(UISelectors.lDayArrow).contains(e.target)) {
                    console.log(FirebaseCtrl.checkIfLoggedIn().uid);
                    // 
                    console.log('left arrow here');
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    console.log(today);
                    const prevToday = subDays(today, 1);
                    let currToday = prevToday;
                    console.log(prevToday);
                    // currToday = format(currToday, "d'-'MMM'-'yyyy");
                    console.log(currToday);
                    // console.log(globalUser);
                    // console.log(globalTasks);
                    // 
                    renderDayModeCalendar(currToday, globalTasks);
                }
                // Right arrow in day mode clicked
                if (`#${e.target.id}` === UISelectors.rDayArrow || document.querySelector(UISelectors.rDayArrow).contains(e.target)) {
                    // console.log(FirebaseCtrl.checkIfLoggedIn().uid);
                    // 
                    console.log('right arrow here');
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    console.log(today);
                    const nextToday = addDays(today, 1);
                    let currToday = nextToday;
                    console.log(nextToday);
                    // currToday = format(currToday, "d'-'MMM'-'yyyy");
                    console.log(currToday);
                    // console.log(globalUser);
                    // console.log(globalTasks);
                    // 
                    renderDayModeCalendar(currToday, globalTasks);
                }
                // Switch to week mode
                if (`#${e.target.id}` === UISelectors.weekModeView) {
                    console.log('week mode clicked');
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    console.log(today);
                    const currFirstDayOfWeek = startOfWeek(today);
                    console.log(currFirstDayOfWeek);
                    renderWeekModeCalendar(currFirstDayOfWeek);
                }
                // Switch to day mode
                if (`#${e.target.id}` === UISelectors.dayModeView) {
                    console.log('day mode clicked');
                    // Check if day mdoe is already active
                    renderDayModeCalendar(new Date(), globalTasks);
                }
                // // Left arrow in week mode clicked
                if (`#${e.target.id}` === UISelectors.lWeekArrow || document.querySelector(UISelectors.lWeekArrow).contains(e.target)) {
                    // 
                    const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                    console.log(currWeekContent);
                    let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                    console.log(today);
                    const currFirstDayOfWeek = subDays(startOfWeek(today), 7);
                    // 
                    renderWeekModeCalendar(currFirstDayOfWeek);
                    // 
                }
                // // Right arrow in week mode clicked
                if (`#${e.target.id}` === UISelectors.rWeekArrow || document.querySelector(UISelectors.rWeekArrow).contains(e.target)) {
                    // 
                    const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                    console.log(currWeekContent);
                    let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                    console.log(today);
                    const currFirstDayOfWeek = addDays(startOfWeek(today), 7);
                    // 
                    renderWeekModeCalendar(currFirstDayOfWeek);
                    // 
                }
                // Switch to month mode
                if (`#${e.target.id}` === UISelectors.monthModeView) {
                    console.log('month mode clicked');
                    // 
                    UICtrl.setTableBodyHead();
                    // 
                    const today = new Date();
                    // Check if day mdoe is already active
                    renderMonthModeCalendar(today.getFullYear(), today.getMonth(), today, true);
                    // 
                    // Change month in month mode
                    document.querySelector(UISelectors.monthModeMonth).addEventListener('change', e => {
                        document.querySelector(UISelectors.tableBody).innerHTML = '';
                        // 
                        renderMonthModeCalendar(Number(document.querySelector(UISelectors.monthModeYear).textContent), e.target.selectedIndex, today, true);
                    });
                }
                // Left arrow in month mode clicked
                if (`#${e.target.id}` === UISelectors.lMonthArrow || document.querySelector(UISelectors.lMonthArrow).contains(e.target)) {
                    // 
                    document.querySelector(UISelectors.tableBody).innerHTML = '';
                    let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                    let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex - 1;
                    if (month === -1) {
                        month = 11;
                        year--;
                    }
                    renderMonthModeCalendar(year, month, new Date(), true);
                    // 
                }
                // Right arrow in month mode clicked
                if (`#${e.target.id}` === UISelectors.rMonthArrow || document.querySelector(UISelectors.rMonthArrow).contains(e.target)) {
                    // 
                    document.querySelector(UISelectors.tableBody).innerHTML = '';
                    let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                    let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex + 1;
                    if (month === 12) {
                        month = 0;
                        year++;
                    }
                    renderMonthModeCalendar(year, month, new Date(), true);
                    // 
                }
            });
            // Add form submit event
            document.querySelector(UISelectors.addForm).addEventListener('submit', (e) => {
                e.preventDefault();
                // 
                const task = document.querySelector(UISelectors.addForm).add.value.trim();
                // Check if task has length
                if (task.length) {  // YES
                    // Check if particular day field exist in 'tasks' collection
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    console.log(today);
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    console.log(currToday);
                    FirebaseCtrl.addTasks({
                        currToday,
                        task,
                        error: UICtrl.errorTasks
                    })
                        .then(response => {
                            console.log("let's seee...");
                            console.log(response);
                        })
                        .catch(err => {
                            console.log('Error getting document', err);
                        });
    
                } else {    // NO
    
                }
    
    
                
            });
            // Search form keyup event
            document.querySelector(UISelectors.searchForm).searchInput.addEventListener('keyup', () => {
                const term = document.querySelector(UISelectors.searchForm).searchInput.value.trim().toLowerCase();
                DataCtrl.filterTasks(term, UISelectors.tasks);
            });
            // Search form prevent default
             document.querySelector(UISelectors.searchForm).addEventListener('submit', e => {
                 e.preventDefault();
             });
             //
            //  FirebaseCtrl.tasksOnSnapshot(globalUser);
        })
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

    const setUI = function(user, data) {
        // Set global user
        globalUser = user;
        // 
        if (user) { // user logged in
            // Adjust loginWrapper
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
            // Show login loader
            UICtrl.createLoginLoader();
            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
            // tu zamiast loginWrapper dodaj jakis inny wrapper z logiem lub tym podobnym, ktory bedzie sie pojawial na poczatku, kiedy aplikacja sie wczytuje
            setTimeout(() => {
                document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                document.querySelector('body').style.overflow = 'auto';
                // 
                document.querySelector(UISelectors.mainNavbar).style.display = 'block';
                document.querySelector(UISelectors.mainBody).style.display = 'block';
                // Set UI for a particular user
                console.log(user.displayName);
                console.log(user.email);
                console.log(user.metadata);
                console.log(data);
                document.querySelector(UISelectors.welcomeHeader).textContent = data.info.name;
                document.querySelector(UISelectors.leadTodayDate).textContent = format(data.date, "do 'of' MMMM yyyy");
                // document.querySelector(UISelectors.leadTaskNum).textContent = 
                // 
                setTimeout(() => {
                    document.querySelector(UISelectors.loginLoader).remove();
                    document.querySelector(UISelectors.loginWrapper).style.display = 'none';
                    document.querySelector(UISelectors.loginMainDiv).style.opacity = 1;
                }, 1000)
            }, 2000);
        } else { // user logged out
            // Adjust loginWrapper
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
            // Show login loader
            UICtrl.createLoginLoader();
            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';

            setTimeout(() => {
                document.querySelector('body').style.overflow = 'hidden';
                // 
                document.querySelector(UISelectors.mainNavbar).style.display = 'none';
                document.querySelector(UISelectors.mainBody).style.display = 'none';
                // 
                document.querySelector(UISelectors.loginLoader).remove();
                document.querySelector(UISelectors.loginMainDiv).style.opacity = 1;
            }, 2000);
        }
    }

    

    const renderDayModeCalendar = function(currToday, tasks) {
        // Set global tasks
        if (!globalTasks) {
            globalTasks = tasks;
        }
        // adjust UI
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: block !important');
		document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'flex';
        // 
        // document.querySelector(UISelectors.taskTabs).classList.remove('hide');
        if (document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.remove('hide');
        }
        // 
        document.querySelector(UISelectors.dayModeContent).textContent = `
            ${format(currToday, "d MMMM yyyy, EEEE")}
        `;
        // 
        UICtrl.renderTableUI();
        // 
        console.log('renderDayMode');
        const taskNum = UICtrl.displayTasks(tasks, currToday, DnDCtrl.enableDnD);
        console.log(taskNum);
        if (taskNum) {
            console.log('tutaj?');
            document.querySelector(UISelectors.leadTaskNum).textContent = 'jajeczko';
        } else {
            console.log('a moze tutaj???');
            document.querySelector(UISelectors.leadTaskNum).textContent = 0;
        }
        // Day mode is active
        document.querySelector('body').setAttribute('class', 'day-mode-active');
        // Disable searching if no tasks to display
        if (!(tasks === undefined)) {
            if (tasks[format(currToday, "d'-'MMM'-'yyyy")] === undefined) {
                document.querySelector(UISelectors.searchTasks).disabled = true;
            } else {
                document.querySelector(UISelectors.searchTasks).disabled = false;
            }
        }
    }

    const renderWeekModeCalendar = function(currFirstDayOfWeek) {
        
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
        // 
        // document.querySelector(UISelectors.taskTabs).classList.add('hide');
        // 
        if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
        }
        // 
        document.querySelector(UISelectors.searchFormWrapper).classList.remove('search-form-open');
        document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
        // 
        const firstDayNextWeek = addWeeks(currFirstDayOfWeek, 1);
        const week = eachDayOfInterval({
            start: currFirstDayOfWeek,
            end: subDays(firstDayNextWeek, 1)
        });
        console.log(week);
        //
        UICtrl.setTableBodyHead();
        // 
        console.log('renderWeekMode');
        generateWeekTemplate(currFirstDayOfWeek, firstDayNextWeek, week, false);
    }

    const generateWeekTemplate = function(firstDayCurrWeek, firstDayNextWeek, week, user) {
        document.querySelector(UISelectors.weekModeContent).textContent = `
            ${getDate(firstDayCurrWeek)} ${format(firstDayCurrWeek, 'MMMM yyyy')} - 
            ${getDate(subDays(firstDayNextWeek, 1))} ${format(subDays(firstDayNextWeek, 1), 'MMMM yyyy')}
        `;
        // reset table body & header
        // this.setTableBodyHead();
        // Create template
        let row = document.createElement('tr');
        console.log('generateWeekTemplate');
        // 
        week.forEach(day => {
            let td = document.createElement('td');
            td.innerHTML = `
                ${format(day, 'd')}
            `;
            // 
            if (isToday(day)) {
                td.classList.add('current-day');
                row.classList.add('current-week');
            }
            // 
            if (
				day.getMonth() < subDays(new Date(), 30).getMonth() ||
				day.getFullYear() < subDays(new Date(), 30).getFullYear() ||
				(day.getMonth() === subDays(new Date(), 30).getMonth() &&
					day.getFullYear() === subDays(new Date(), 30).getFullYear() &&
					day.getDate() < subDays(new Date(), 30).getDate())
			) {
                td.classList.add('invalid-day');
                row.classList.add('archived-week');
			} else { td.classList.add('valid-day'); }
			//
			// td = this.addBadge(user, curr.getFullYear(), curr.getMonth(), curr.getDate(), td);
			// append td after each iteration
            row.append(td);
        });
        // append row after each iteration
        console.log(row);
		document.querySelector(UISelectors.tableBody).append(row);
		document.querySelector('body').setAttribute('class', 'week-mode-active');
		//
		// if (row.classList.contains('archived-week')) {
		// 	lWeekArrow.disabled = true;
		// } else {
		// 	lWeekArrow.disabled = false;
		// }
    }

    const renderMonthModeCalendar = function(year, month, today, user) {
        // Adjust week mode display
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: block !important');
        document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: none !important');
        document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'none';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'none';
        // 
        // document.querySelector(UISelectors.taskTabs).classList.add('hide');
        // 
        if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
        }
        // 
        document.querySelector(UISelectors.searchFormWrapper).classList.remove('search-form-open');
        document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
        // 
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
        document.querySelector(UISelectors.monthModeMonth).options[month].selected = true;
		document.querySelector(UISelectors.monthModeYear).textContent = year;
		//
		if (month === 0) {
			//
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = globalVars.months[11];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = globalVars.months[month + 1];
			//
		} else if (month === 11) {
			//
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = globalVars.months[month - 1];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = globalVars.months[0];
			//
		} else {
			//
			document.querySelector(UISelectors.lMonthArrow).lastElementChild.textContent = globalVars.months[month - 1];
			document.querySelector(UISelectors.rMonthArrow).firstElementChild.textContent = globalVars.months[month + 1];
			//
		}
		if (Number(document.querySelector(UISelectors.monthModeYear).textContent) === today.getFullYear()) {
			//
			Array.from(document.querySelector(UISelectors.monthModeMonth).options)
				.filter(curr => curr.index < subDays(today, 30).getMonth())
				.forEach(curr => {
                    //
                    curr.classList.add('hide');
					//
				});
			//
		} else {
			//
			Array.from(document.querySelector(UISelectors.monthModeMonth).options).forEach(curr => {
                //
                curr.classList.remove('hide');
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
                    td.classList.add('disabled');
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
                    td.classList.add('disabled');
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
                        td.classList.add('current-day')
                        row.classList.add('current-week');
						//
					}
					//
					if (
						getDayOfYear(new Date(year, month, renderDaysNumCurrMonth)) <
						getDayOfYear(subDays(today, 30))
					) {
                        //
                        td.classList.add('invalid-day');
						//
					} else {
                        //
                        td.classList.add('valid-day');
						//
					}
					//
					// td = this.addBadge(user, year, month, renderDaysNumCurrMonth, td);
					// append td after each iteration
					row.append(td);
					renderDaysNumCurrMonth++;
					//
				}
			}
            // append row after each iteration
            document.querySelector(UISelectors.tableBody).append(row);
			document.querySelector('body').setAttribute('class', 'month-mode-active');
			i++;
			//
		}
		//
		if (document.querySelector(UISelectors.monthModeMonth).selectedIndex === subDays(today, 30).getMonth()) {
			//
			document.querySelector(UISelectors.lMonthArrow).disabled = true;
			//
		} else {
			//
			document.querySelector(UISelectors.lMonthArrow).disabled = false;
			//
		}
		// disable searching in month mode
		// searchIconPrimary.disabled = true;
		//
		// UI.removeClass(pickDatePickMode, 'btn-outline-danger');
		// UI.addClass(pickDatePickMode, 'btn-outline-light');
    }

	return {
		init: function() {
            console.log('Initializing App...');

            // Initialize firebase app
            FirebaseCtrl.firebaseInit();
            // test firebase
            FirebaseCtrl.test();
            // Adjust UI on user status change
            // let user = '';
            FirebaseCtrl.authStatus({
                setUI,
                renderLoginAccounts: UICtrl.renderLoginAccounts,
                uiListSelector: UISelectors.loginAccounts,
                renderDayModeCalendar,
                currToday: new Date()
            });
            // console.log(globalUser);
            
            // console.log(FirebaseCtrl.checkIfLoggedIn());
            // If no accounts, disable remove btn
            if (!1) {
                document.querySelector(UISelectors.removeUserBtn).disabled = true;
            } else {
                document.querySelector(UISelectors.removeUserBtn).disabled = false;
            }
            // Render login accounts
            // UICtrl.renderLoginAccounts(0, [], UISelectors.loginAccounts) // change that later
            // Load event listeners
            loadEventListeners();
		}
	}

})(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl);
// Initialize App
AppCtrl.init();