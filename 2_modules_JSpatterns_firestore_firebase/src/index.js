import './css/style.css';
import UICtrl from './js/UICtrl';
import StoreCtrl from './js/StoreCtrl';
import DataCtrl from './js/DataCtrl';
import UserCtrl from './js/UserCtrl';
import DnDCtrl from './js/DnDCtrl';
import FirebaseCtrl from './js/FirebaseCtrl';
// 
import { format, parse, subDays, addDays, startOfWeek, addWeeks, eachDayOfInterval, getDate, isToday, getDayOfYear } from 'date-fns';
import boostrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery'

// App Controller
const AppCtrl = (function(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Initialize global user
    let globalUser = '';
    // Initialize global tasks
    let globalTasksOngoing = [];
    let globalTasksCompleted = [];
    // 
    let startTask = '';
    // 
    let globalPastTaskKeys = [];
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
                    Array.from(document.querySelectorAll('.login-wrapper input')).forEach(input => input.addEventListener('keyup', e => {
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
                            // Set theme, avatar & toasts
                            UICtrl.chooseTheme(user.theme);
                            UICtrl.chooseAvatar(user.avatar);
                            UICtrl.chooseToast(user.toast);
                            // Calculate progress
                            calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
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
                    // 
                    console.log('left arrow here');
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    const prevToday = subDays(today, 1);
                    let currToday = prevToday;
                    // 
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        renderDayModeCalendar(currToday, globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    } else {
                        renderDayModeCalendar(currToday, globalTasksCompleted, globalUser, FirebaseCtrl.updateTasks2, false);
                    }
                    // Calculate progress
                    calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
                }
                // Right arrow in day mode clicked
                if (`#${e.target.id}` === UISelectors.rDayArrow || document.querySelector(UISelectors.rDayArrow).contains(e.target)) {
                    // 
                    console.log('right arrow here');
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    const nextToday = addDays(today, 1);
                    let currToday = nextToday;
                    // 
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        renderDayModeCalendar(currToday, globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    } else {
                        renderDayModeCalendar(currToday, globalTasksCompleted, globalUser, FirebaseCtrl.updateTasks2, false);
                    }
                    // Calculate progress
                    calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
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
                    // ???
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    } else {
                        renderDayModeCalendar(new Date(), globalTasksCompleted, globalUser, FirebaseCtrl.updateTasks2, false);
                    }
                    // Calculate progress
                    calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
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
                // Switch to ongoing tasks
                if (`#${e.target.id}` === UISelectors.taskTabsOngoing) {
                    if (!e.target.classList.contains('active')) {
                        const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                        let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                        let currToday = today;
                        e.target.classList.add('active');
                        e.target.nextElementSibling.classList.remove('active');
                        // 
                        document.querySelector(UISelectors.addOption).disabled = false;
                        // 
                        console.log('switch to ongoing tasks');
                        console.log(globalTasksOngoing);
                        renderDayModeCalendar(currToday, globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                        // 
                        document.querySelector(UISelectors.leadTaskNum).parentElement.parentElement.classList.remove('hide');
                        document.querySelector(UISelectors.leadTaskNum).parentElement.parentElement.nextElementSibling.classList.add('hide');
                    }
                }
                // Switch to completed tasks
                if (`#${e.target.id}` === UISelectors.taskTabsCompleted) {
                    if (!e.target.classList.contains('active')) {
                        const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                        let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                        let currToday = today;
                        // Grab completed tasks from firestore
                        // FirebaseCtrl.tasksOnSnapshotCompleted(globalUser)
                        //     .then(snapshot => {
                        //         // UICtrl.renderTableUI();
                        //         // const taskNum = UICtrl.displayTasks(snapshot.data(), currToday, DnDCtrl.enableDnD, globalUser, FirebaseCtrl.updateTasks2, false);
                        //         // if (taskNum) {
                        //         //     document.querySelector(UISelectors.leadTaskNum).textContent = taskNum;
                        //         // } else {
                        //         //     document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                        //         // }
                        //         // Day mode is active
                        //         // document.querySelector('body').setAttribute('class', 'day-mode-active');
                        //         // Disable searching if no tasks to display
                        //         if (!(snapshot.data() === undefined)) {
                        //             if (snapshot.data()[format(currToday, "d'-'MMM'-'yyyy")] === undefined || snapshot.data()[format(currToday, "d'-'MMM'-'yyyy")].length === 0) {
                        //                 document.querySelector(UISelectors.searchTasks).disabled = true;
                        //             } else {
                        //                 document.querySelector(UISelectors.searchTasks).disabled = false;
                        //             }
                        //         }
                        //     });
                        // 
                        e.target.classList.add('active');
                        e.target.previousElementSibling.classList.remove('active');
                        // 
                        document.querySelector(UISelectors.addOption).disabled = true;
                        // 
                        console.log('switch to completed tasks');
                        console.log(globalTasksCompleted);
                        renderDayModeCalendar(currToday, globalTasksCompleted, globalUser, FirebaseCtrl.updateTasks2, false);
                        // 
                        document.querySelector(UISelectors.leadTaskCompletedNum).parentElement.parentElement.classList.remove('hide');
                        document.querySelector(UISelectors.leadTaskCompletedNum).parentElement.parentElement.previousElementSibling.classList.add('hide');
                    }
                }
                // Settings
                if (`#${e.target.id}` === UISelectors.settings) {
                    document.querySelector(UISelectors.settingsWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.settingsWrapper).style.opacity = 1;
                    document.querySelector('body').style.overflow = 'hidden';
                }
                // Settings wrapper & settings close btn
                if (`#${e.target.id}` === UISelectors.settingsWrapper || document.querySelector(UISelectors.settingsCloseBtn).contains(e.target)) {
                    document.querySelector(UISelectors.settingsWrapper).style.display = 'none';
                    document.querySelector(UISelectors.settingsWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
                    // 
                    // listPastTasks.innerHTML = '';
                }
                // Change theme event listener
                if (e.target.classList.contains('theme')) {
                    const themeBtns = document.querySelectorAll(UISelectors.themeBtns);
                    // 
                    Array.from(themeBtns).some(themeBtn => {
                        if (themeBtn.classList.contains('theme-active')) {
                            themeBtn.classList.remove('theme-active');
                            return true;
                        }
                    });
                    // Switch theme
                    UICtrl.chooseTheme(e.target.id);
                    // Update db & global data
                    FirebaseCtrl.updateUser(globalUser, 'theme', e.target.id);
                    // globalUser.theme = e.target.id;
                }
                // Change avatar event listener
                if (document.querySelector(UISelectors.avatarBtnsWrapper).contains(e.target)) {
                    const avatarBtns = document.querySelectorAll(UISelectors.avatarBtns);
                    //
                    Array.from(avatarBtns).some((avatarBtn) => {
                        if (avatarBtn.classList.contains('avatar-active')) {
                            avatarBtn.classList.remove('avatar-active');
                            return true;
                        }
                    });
                    if (e.target.classList.contains('avatar')) {
                        UICtrl.chooseAvatar(e.target.id);
                        // Update db & global data
                        FirebaseCtrl.updateUser(globalUser, 'avatar', e.target.id);
                        // globalUser.theme = e.target.id;
                        //
                        document.querySelector(UISelectors.userAvatar).setAttribute('class', e.target.firstElementChild.classList.value);
                        document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                    }
                    if (e.target.classList.contains('fas')) {
                        UICtrl.chooseAvatar(e.target.parentElement.id);
                        // Update db & global data
                        FirebaseCtrl.updateUser(globalUser, 'avatar', e.target.parentElement.id);
                        // globalUser.theme = e.target.id;
                        //
                        document.querySelector(UISelectors.userAvatar).setAttribute('class', e.target.classList.value);
                        document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                    }
                }
                // Change toast event listener
                if (e.target.classList.contains('toast-change')) {
                    const toastBtns = document.querySelectorAll(UISelectors.toastBtns);
                    //
                    Array.from(toastBtns).some((toastBtn) => {
                        if (toastBtn.classList.contains('toast-active')) {
                            toastBtn.classList.remove('toast-active');
                            return true;
                        }
                    });
                    UICtrl.chooseToast(e.target.id);
                    // Update db & global data
                    FirebaseCtrl.updateUser(globalUser, 'toast', e.target.id);
                    // globalUser.theme = e.target.id;
                }
                // Delete account
                if (`#${e.target.id}` === UISelectors.deleteAccountBtn) {
                    document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 1;
                    document.querySelector('body').style.overflow = 'hidden';
                }
                // Delete account wrapper & delete account close btn
                if (`#${e.target.id}` === UISelectors.deleteAccountWrapper || document.querySelector(UISelectors.deleteAccountCloseBtn).contains(e.target) || `#${e.target.id}` === UISelectors.deleteNo) {
                    document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'none';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
                    // 
                    // listPastTasks.innerHTML = '';
                }
                // Delete task
                if (e.target.classList.contains('delete')) {
                    if (!e.target.parentElement.firstElementChild.classList.contains('hide')) {
                        const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                        const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                        // Remove task from UI
                        e.target.parentElement.parentElement.remove();
                        // Get current tasks & reassign task ids
                        const tasks = document.querySelectorAll('.tasks li');
                        let todayTasks = [];
                        [].forEach.call(tasks, (li, index) => {
                            li.id = 'task' + index;
                            todayTasks.push(li.textContent.trim());
                        });
                        // Ongoing / completed
                        if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                            // Update globalTasks
                            globalTasksOngoing[currToday] = todayTasks;
                            // Delete from firestore
                            FirebaseCtrl.deleteTask(currToday, todayTasks, 'ongoing');
                            // Update task number
                            document.querySelector(UISelectors.leadTaskNum).textContent = todayTasks.length;
                            // Check if currToday is in pastTaskKeys
                            if (globalPastTaskKeys.includes(currToday)) {
                                const index = globalPastTaskKeys.indexOf(currToday);
                                globalPastTaskKeys.splice(index, 1);
                            }
                            // Check if pastTasksKeys is empty
                            if (!globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                            }
                        } else if (document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                            // Update globalTasks
                            globalTasksCompleted[currToday] = todayTasks;
                            // Delete from firestore
                            FirebaseCtrl.deleteTask(currToday, todayTasks, 'completed');
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = todayTasks.length;
                        }
                        // Calculate progress
                        calculateProgress(currToday);
                    }
                }
                // Edit task
                // CONSIDER DISABLING TABINDEX ON BUTTONS & ENABLING IT ON EDIT ICON
                if (e.target.classList.contains('edit')) {
                    // Save current task & enable edit mode
                    startTask = e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent.trim();
                    e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
                        'contenteditable',
                        'true'
                    );
                    // Disable DnD
                    document.querySelectorAll('.tasks li').forEach((curr) => {
				        curr.draggable = false;
                    });
                    const el = e.target.parentElement.parentElement.firstElementChild.nextElementSibling;
                    let range = document.createRange();
                    let sel = window.getSelection();
                    console.log(el.textContent.length);
                    range.setStart(el.childNodes[0], el.textContent.length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    el.focus();
                    el.parentElement.classList.add('editable');
                    // Switch icons
                    e.target.classList.add('hide');
                    e.target.nextElementSibling.classList.remove('hide');
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.addOption).disabled = true;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    document.querySelector(UISelectors.lDayArrow).disabled = true;
                    document.querySelector(UISelectors.rDayArrow).disabled = true;
                    document.querySelector(UISelectors.dayModeView).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                    document.querySelector(UISelectors.searchForm).disabled = true;
                    // Disable enter
                    e.target.parentElement.parentElement.firstElementChild.nextElementSibling.addEventListener('keydown', (evt) => {
                        if (evt.key === 'Enter' || evt.key === 'Tab') {
                            evt.preventDefault();
                        }
                    });
                }
                // Complete task
                if (e.target.classList.contains('uncompleted')) {
                    if (
                        !e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
                        document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')
                    ) {
                        // Switch icons
                        e.target.classList.toggle('hide');
                        e.target.nextElementSibling.classList.toggle('hide');
                        // Store deleted task
                        const taskDeleted = e.target.parentElement.parentElement.textContent.trim();
                        // Remove from UI
                        e.target.parentElement.nextElementSibling.nextElementSibling.remove();
                        e.target.parentElement.nextElementSibling.classList.add('hide');
                        const completedMsg = document.createElement('p');
                        completedMsg.classList.add('m-0');
                        completedMsg.appendChild(document.createTextNode('Task Completed'));
                        e.target.parentElement.parentElement.appendChild(completedMsg);
                        e.target.parentElement.parentElement.classList.add('fade-out');
                        // 
                        setTimeout(() => {
                            // Adjust firestore data
                            const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                            const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                            // Remove it from UI
                            e.target.parentElement.parentElement.remove();
                            // Get current tasks & reassign task ids
                            const tasks = document.querySelectorAll('.tasks li');
                            let todayTasks = [];
                            [].forEach.call(tasks, (li, index) => {
                                li.id = 'task' + index;
                                todayTasks.push(li.textContent.trim());
                                console.log(todayTasks);
                            });
                            // Update globalTasks
                            console.log('todayTasks');
                            // console.log(todayTasks);
                            console.log(todayTasks);
                            console.log(globalTasksOngoing[currToday]);
                            globalTasksOngoing[currToday] = todayTasks;
                            console.log(globalTasksOngoing[currToday]);
                            console.log(todayTasks);
                            console.log(globalTasksCompleted[currToday]);
                            if (globalTasksCompleted[currToday] === undefined) {
                                globalTasksCompleted[currToday] = [];
                            }
                            globalTasksCompleted[currToday].push(taskDeleted);
                            // Remove task from firestore 'ongoing' collection
                            // console.log(todayTasks);
                            console.log(globalTasksCompleted[currToday]);
                            // 
                            // FirebaseCtrl.markAsCompletedDelete(currToday, todayTasks)
                            // .then(() => {
                            //     FirebaseCtrl.markAsCompletedAdd(currToday, taskDeleted)
                            // })
                            // .then(() => {
                            //     console.log('done here !!!');
                            // })
                            // 
                            // Check if currToday is in pastTaskKeys
                            if (globalPastTaskKeys.includes(currToday)) {
                                const index = globalPastTaskKeys.indexOf(currToday);
                                globalPastTaskKeys.splice(index, 1);
                            }
                            // Check if pastTasksKeys is empty
                            if (!globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                            }
                            // 
                            FirebaseCtrl.markAsCompleted(currToday, todayTasks, taskDeleted)
                            .then(() => {
                                // Update task number
                                document.querySelector(UISelectors.leadTaskNum).textContent = todayTasks.length;
                                // Calculate progress
                                calculateProgress(currToday);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        }, 1500);
                    }
                }
                // Uncomplete task
                if (e.target.classList.contains('completed')) {
                    if (
                        !e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
                        document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')
                    ) {
                        // Switch icons
                        e.target.classList.toggle('hide');
                        e.target.previousElementSibling.classList.toggle('hide');
                        // Store deleted task
                        const taskOngoing = e.target.parentElement.parentElement.textContent.trim();
                        // Remove from UI
                        e.target.parentElement.nextElementSibling.nextElementSibling.remove();
                        e.target.parentElement.nextElementSibling.classList.add('hide');
                        const uncompletedMsg = document.createElement('p');
                        uncompletedMsg.classList.add('m-0');
                        uncompletedMsg.appendChild(document.createTextNode('Moved Back to Scheduled'));
                        e.target.parentElement.parentElement.appendChild(uncompletedMsg);
                        e.target.parentElement.parentElement.classList.add('fade-out');
                        // 
                        setTimeout(() => {
                            // Adjust firestore data
                            const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                            const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                            // Remove it from UI
                            e.target.parentElement.parentElement.remove();
                            // Get current tasks & reassign task ids
                            const tasks = document.querySelectorAll('.tasks li');
                            let todayTasks = [];
                            [].forEach.call(tasks, (li, index) => {
                                li.id = 'task' + index;
                                todayTasks.push(li.textContent.trim());
                            });
                            // Update globalTasks
                            globalTasksCompleted[currToday] = todayTasks;
                            if (globalTasksOngoing[currToday] === undefined) {
                                globalTasksOngoing[currToday] = [];
                                globalTasksOngoing[currToday].push(taskOngoing);
                            } else {
                                globalTasksOngoing[currToday].push(taskOngoing);
                            }
                            // 
                            const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                            if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                                // Check if currToday is in pastTaskKeys
                                if (!globalPastTaskKeys.includes(currToday)) {
                                    globalPastTaskKeys.push(currToday);
                                }
                            }
                            // Check if pastTasksKeys is empty
                            if (globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                                document.querySelector(UISelectors.navNotifications).textContent = 1;
                                document.querySelector(UISelectors.notifications).classList.remove('disabled');
                            }
                            // 
                            // Remove task from firestore 'completed' collection
                            FirebaseCtrl.markAsUncompleted(currToday, todayTasks, taskOngoing);
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = todayTasks.length;
                            // Calculate progress
                            calculateProgress(currToday);
                        }, 1000);
                    }
                }
                // Turn off task editing
                if (e.target.classList.contains('ongoing-edit')) {
                    if (e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent === '') {
                        e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent = startTask;
                    }
                    // 
                    e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
                        'contenteditable',
                        'false'
                    );
                    //
                    let taskList = [];
                    document.querySelectorAll('.tasks .task-item').forEach((task) => {
                        task.draggable = true;
                        taskList.push(task.textContent.trim());
                    });
                    // 
                    e.target.previousElementSibling.classList.remove('hide');
                    e.target.classList.add('hide');
                    e.target.parentElement.parentElement.classList.remove('editable');
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.searchTasks).disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                    document.querySelector(UISelectors.lDayArrow).disabled = false;
                    document.querySelector(UISelectors.rDayArrow).disabled = false;
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.weekModeView).disabled = false;
                    document.querySelector(UISelectors.monthModeView).disabled = false;
                    document.querySelector(UISelectors.userNavbar).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    document.querySelector(UISelectors.searchForm).disabled = false;
                    // 
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    console.log(taskList);
                    globalTasksOngoing[currToday] = taskList;
                    FirebaseCtrl.updateTasks2(globalUser, currToday, taskList);
                }
                // Select all tasks
                if (`#${e.target.id}` === UISelectors.selectAllBtn) {
                    if (Array.from(document.querySelectorAll('.tasks .task-item')).length) {
                        document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                        // 
                        document.querySelector(UISelectors.searchTasks).disabled = true;
                        document.querySelector(UISelectors.addOption).disabled = true;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                        document.querySelector(UISelectors.lDayArrow).disabled = true;
                        document.querySelector(UISelectors.rDayArrow).disabled = true;
                        document.querySelector(UISelectors.dayModeView).disabled = true;
                        document.querySelector(UISelectors.weekModeView).disabled = true;
                        document.querySelector(UISelectors.monthModeView).disabled = true;
                        document.querySelector(UISelectors.userNavbar).disabled = true;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                        document.querySelector(UISelectors.searchForm).disabled = true;
                        // 
                        Array.from(document.querySelectorAll('.uncompleted')).forEach((uncompletedTask) => {
                            uncompletedTask.classList.add('hide');
                        });
                        Array.from(document.querySelectorAll('.completed')).forEach((completedTask) => {
                            completedTask.classList.add('hide');
                        });
                        Array.from(document.querySelectorAll('.edit')).forEach((editIcon) => {
                            editIcon.classList.add('hide');
                        });
                        Array.from(document.querySelectorAll('.delete')).forEach((deleteIcon) => {
                            deleteIcon.classList.add('hide');
                        });
                        // 
                        Array.from(document.querySelectorAll('.tasks li')).forEach((taskItem) => {
                            taskItem.classList.add('selected');
                        });
                        // 
                        if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                            document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Completed';
                        } else {
                            document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Scheduled';
                        }
                    }
                }
                // Mark as btn
                if (`#${e.target.id}` === UISelectors.markAsBtn) {
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    let taskList = [];
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    // 
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        Array.from(taskItems).forEach((taskItem) => {
                            // Adjust UI
                            const completedMssg = document.createElement('p');
                            completedMssg.classList.add('m-0');
                            completedMssg.appendChild(document.createTextNode('Task Completed'));
                            taskItem.appendChild(completedMssg);
                            taskItem.classList.add('fade-out');
                            // Append task
                            const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                            taskList.push(task);
                            //
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // 
                        // Check if currToday is in pastTaskKeys
                        if (globalPastTaskKeys.includes(currToday)) {
                            const index = globalPastTaskKeys.indexOf(currToday);
                            globalPastTaskKeys.splice(index, 1);
                        }
                        // Check if pastTasksKeys is empty
                        if (!globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                        }
                        // 
                        console.log(taskList);
                        // Update globalTasks
                        globalTasksOngoing[currToday] = [];
                        if (globalTasksCompleted[currToday] === undefined) {
                            globalTasksCompleted[currToday] = taskList;
                        } else {
                            taskList = globalTasksCompleted[currToday].concat(taskList);
                            globalTasksCompleted[currToday] = taskList;
                        }
                        console.log(taskList);
                        FirebaseCtrl.markAsCompleted(currToday, [], taskList, false)
                        .then(() => {
                            // Update task number
                            document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                            // Calculate progress
                            calculateProgress(currToday);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    } else {
                        Array.from(taskItems).forEach((taskItem) => {
                            // Adjust UI
                            const completedMssg = document.createElement('p');
                            completedMssg.classList.add('m-0');
                            completedMssg.appendChild(document.createTextNode('Moved Back to Scheduled'));
                            taskItem.appendChild(completedMssg);
                            taskItem.classList.add('fade-out');
                            // Append task
                            const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                            taskList.push(task);
                            //
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // 
                        const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                        if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                            // Check if currToday is in pastTaskKeys
                            if (!globalPastTaskKeys.includes(currToday)) {
                                globalPastTaskKeys.push(currToday);
                            }
                        }
                        // Check if pastTasksKeys is empty
                        if (globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                            document.querySelector(UISelectors.navNotifications).textContent = 1;
                            document.querySelector(UISelectors.notifications).classList.remove('disabled');
                        }
                        // 
                        console.log(taskList);
                        // Update globalTasks
                        globalTasksCompleted[currToday] = [];
                        if (globalTasksOngoing[currToday] === undefined) {
                            globalTasksOngoing[currToday] = taskList;
                        } else {
                            taskList = globalTasksOngoing[currToday].concat(taskList);
                            globalTasksOngoing[currToday] = taskList;
                        }
                        console.log(taskList);
                        FirebaseCtrl.markAsCompleted(currToday, taskList, [], false)
                        .then(() => {
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
                            // Calculate progress
                            calculateProgress(currToday);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    }
                    document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                    // 
                    document.querySelector(UISelectors.searchTasks).disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                    document.querySelector(UISelectors.lDayArrow).disabled = false;
                    document.querySelector(UISelectors.rDayArrow).disabled = false;
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.weekModeView).disabled = false;
                    document.querySelector(UISelectors.monthModeView).disabled = false;
                    document.querySelector(UISelectors.userNavbar).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    document.querySelector(UISelectors.searchForm).disabled = false;
                }
                // Delete all btn
                if (`#${e.target.id}` === UISelectors.deleteBtn) {
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    // 
                    Array.from(taskItems).forEach((taskItem) => {
                        // Adjust UI
                        const completedMssg = document.createElement('p');
                        completedMssg.classList.add('m-0');
                        completedMssg.appendChild(document.createTextNode('Task Completed'));
                        taskItem.appendChild(completedMssg);
                        taskItem.classList.add('fade-out');
                        //
                        setTimeout(() => { taskItem.remove() }, 1000);
                    });
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        // 
                        // Check if currToday is in pastTaskKeys
                        if (globalPastTaskKeys.includes(currToday)) {
                            const index = globalPastTaskKeys.indexOf(currToday);
                            globalPastTaskKeys.splice(index, 1);
                        }
                        // Check if pastTasksKeys is empty
                        if (!globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                        }
                        // 
                        globalTasksOngoing[currToday] = [];
                        FirebaseCtrl.deleteTask(currToday, [], 'ongoing')
                        .then(() => {
                            // Update task number
                            document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                            // Calculate progress
                            calculateProgress(currToday);
                        })
                        .catch(err => {
                            console.log(err);
                        });;
                    } else {
                        globalTasksCompleted[currToday] = [];
                        FirebaseCtrl.deleteTask(currToday, [], 'completed')
                        .then(() => {
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
                            // Calculate progress
                            calculateProgress(currToday);
                        })
                        .catch(err => {
                            console.log(err);
                        });;
                    }
                    document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                    // 
                    document.querySelector(UISelectors.searchTasks).disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                    document.querySelector(UISelectors.lDayArrow).disabled = false;
                    document.querySelector(UISelectors.rDayArrow).disabled = false;
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.weekModeView).disabled = false;
                    document.querySelector(UISelectors.monthModeView).disabled = false;
                    document.querySelector(UISelectors.userNavbar).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    document.querySelector(UISelectors.searchForm).disabled = false;
                }
                // Deselect all tasks
                if (`#${e.target.id}` === UISelectors.deselectBtn) {
                    document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                    // 
                    document.querySelector(UISelectors.searchTasks).disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                    document.querySelector(UISelectors.lDayArrow).disabled = false;
                    document.querySelector(UISelectors.rDayArrow).disabled = false;
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.weekModeView).disabled = false;
                    document.querySelector(UISelectors.monthModeView).disabled = false;
                    document.querySelector(UISelectors.userNavbar).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    document.querySelector(UISelectors.searchForm).disabled = false;
                    // 
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        Array.from(document.querySelectorAll('.uncompleted')).forEach(uncompletedTask => {
                            uncompletedTask.classList.remove('hide');
                        });
                    } else {
                        Array.from(document.querySelectorAll('.completed')).forEach(completedTask => {
                            completedTask.classList.remove('hide');
                        });
                    }
                    Array.from(document.querySelectorAll('.edit')).forEach(editIcon => {
                        editIcon.classList.remove('hide');
                    });
                    Array.from(document.querySelectorAll('.delete')).forEach(deleteIcon => {
                        deleteIcon.classList.remove('hide');
                    });
                    // 
                    Array.from(document.querySelectorAll('.tasks li')).forEach(taskItem => {
                        taskItem.classList.remove('selected');
                    });
                    // 
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Completed';
                    } else {
                        document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Scheduled';
                    }
                }
                if (!document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && e.target instanceof HTMLTableCellElement) {
                    if (document.querySelector('body').classList.contains('month-mode-active')) {
                        if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
                            const day = Number(e.target.childNodes[0].nodeValue);
                            const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                            const year = Number(document.querySelector(UISelectors.monthModeYear).textContent.trim());
                            const currToday = new Date(year, month, day);
                            renderDayModeCalendar(currToday, globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                            // Calculate progress
                            calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
                        }
                    } else if (document.querySelector('body').classList.contains('week-mode-active')) {
                        if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
                            const day = e.target.textContent.trim();
                            const currToday = parse(day, "d MMM yy", new Date())
                            renderDayModeCalendar(currToday, globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                            // Calculate progress
                            calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
                        }
                    }
                }
                // Pick date wrapper
                if (`#${e.target.id}` === UISelectors.pickDate || document.querySelector(UISelectors.pickDate).contains(e.target)) {
                    document.querySelector(UISelectors.pickDateFormWrapper).classList.toggle('pick-date-form-open');
                    document.querySelector(UISelectors.dateToasts).innerHTML = '';
                }
                // Pick date mode
                if (`#${e.target.id}` === UISelectors.pickDatePickMode) {
                    if (document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode')) {
                        document.querySelector(UISelectors.searchTasks).disabled = false;
                        document.querySelector(UISelectors.addOption).disabled = false;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                        document.querySelector(UISelectors.dayModeView).disabled = false;
                        document.querySelector(UISelectors.weekModeView).disabled = false;
                        document.querySelector(UISelectors.monthModeView).disabled = false;
                        document.querySelector(UISelectors.userNavbar).disabled = false;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                        document.querySelector(UISelectors.pickDate).disabled = false;
                        // 
                        document.querySelector(UISelectors.tableBody).classList.remove('pick-date-mode');
                        document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-light');
                        document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-danger');
                        // 
                        renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    } else {
                        //
                        // ui.setTableBodyHead(tableHeadMonthMode);
                        // Empty tableBody
                        document.querySelector(UISelectors.tableBody).innerHTML = '';
                        //
                        if (document.querySelector('body').classList.contains('month-mode-active')) {
                            const day = Number(e.target.childNodes[0].nodeValue);
                            const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                            const year = Number(document.querySelector(UISelectors.
                                monthModeYear).textContent.trim());
                            const currToday = new Date(year, month, day);
                            renderMonthModeCalendar(year, month, currToday, true);
                        } else {
                            renderMonthModeCalendar((new Date()).getFullYear(), (new Date()).getMonth(), new Date(), true);
                        }
                        document.querySelector(UISelectors.searchTasks).disabled = true;
                        document.querySelector(UISelectors.addOption).disabled = true;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                        document.querySelector(UISelectors.dayModeView).disabled = true;
                        document.querySelector(UISelectors.weekModeView).disabled = true;
                        document.querySelector(UISelectors.monthModeView).disabled = true;
                        document.querySelector(UISelectors.userNavbar).disabled = true;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                        document.querySelector(UISelectors.pickDate).disabled = true;
                        //
                        document.querySelector(UISelectors.tableBody).classList.add('pick-date-mode');
                        document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-light');
                        document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-danger');
                    }
                }
                // Pick date today btn
                if (`#${e.target.id}` === UISelectors.pickDateTodayBtn) {
                    // Check if max number of toast is reached
                    if (Array.from(document.querySelector(UISelectors.dateToasts).children).length >= Number(document.querySelector(`${UISelectors.toastBtns}.toast-active`).textContent.trim())) {
                        document.querySelector(UISelectors.toastMsgWrapper).style.display = 'flex';
                        document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 1;
                        document.querySelector('body').style.overflow = 'hidden';
                    } else {
                        const selector = format(new Date(), "d'-'MMM'-'yyyy");
                        // Check the current day toast is unique
                        if (!Array.from(document.querySelector(UISelectors.dateToasts).children).filter((todayToast) => todayToast.id === selector).length) {
                            // Add day toast
                            UICtrl.addToast(format(new Date(), "d'-'MMM'-'yyyy"), selector);
                            $('.toast').toast('show');
                        }
                    }
                }
                // Close day toast msg wrapper
                if (`#${e.target.id}` === UISelectors.toastMsgWrapper || `#${e.target.id}` === UISelectors.toastCloseBtn || document.querySelector(UISelectors.toastCloseBtn).contains(e.target)) {
                    document.querySelector(UISelectors.toastMsgWrapper).style.display = 'none';
                    document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
					// listPastTasks.innerHTML = '';
                }
                // Delete day toast
                if (e.target.classList.contains('x')) {
                    e.target.parentElement.parentElement.parentElement.remove();
                }
                // Pick day mode -- add day
                if (document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && e.target.classList.contains('valid-day')) {
                    const day = Number(e.target.childNodes[0].nodeValue);
                    const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                    const year = Number(document.querySelector(UISelectors.monthModeYear).textContent.trim());
                    const selector = format(new Date(year, month, day), "d'-'MMM'-'yyyy");
                    // 
                    if (Array.from(document.querySelector(UISelectors.dateToasts).children).length >= Number(document.querySelector(`${UISelectors.toastBtns}.toast-active`).textContent.trim())) {
                        document.querySelector(UISelectors.toastMsgWrapper).style.display = 'flex';
                        document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 1;
                        document.querySelector('body').style.overflow = 'hidden';
                    } else {
                        // Check the current day toast is unique
                        if (!Array.from(document.querySelector(UISelectors.dateToasts).children).filter((todayToast) => todayToast.id === selector).length) {
                            // Add day toast
                            UICtrl.addToast(format(new Date(year, month, day), "d'-'MMM'-'yyyy"), selector);
                            $('.toast').toast('show');
                        }
                    }
                }
                // Close alert msg wrapper
                if (`#${e.target.id}` === UISelectors.alertCloseBtn || document.querySelector(UISelectors.alertCloseBtn).contains(e.target) || `#${e.target.id}` === UISelectors.alertMsgWrapper) {
                    document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                    document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
                    document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                }
                // Notifications clicked
                if (`#${e.target.id}` === UISelectors.notifications || document.querySelector(UISelectors.notifications).contains(e.target)) {
                    if (document.querySelector(UISelectors.notifications).lastElementChild.textContent.length) {
                        globalPastTaskKeys = checkPastOngoingTasks(globalTasksOngoing);
                    }
                }
                // Alert append btn
                if (`#${e.target.id}` === UISelectors.alertAppendBtn) {
                    let allPastTasks = [];
                    globalPastTaskKeys.forEach(key => {
                        allPastTasks = allPastTasks.concat(globalTasksOngoing[key]);
                        // 
                        FirebaseCtrl.deleteField(key, 'ongoing')
                        .then(() => {
                            // Update globalTasks
                            globalTasksOngoing[key] = [];
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    });
                    if (globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")] !== undefined && globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")].length) {
                        allPastTasks = allPastTasks.concat(globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")]);
                    }
                    FirebaseCtrl.updateTasks2(globalUser, format(new Date(), "d'-'MMM'-'yyyy"), allPastTasks);
                    // Update globaltasks
                    globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")] = allPastTasks;
                    // 
                    renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    // Calculate progress
                    calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                    // Update notifications
                    document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                    document.querySelector(UISelectors.navNotifications).textContent = '';
                    document.querySelector(UISelectors.notifications).classList.add('disabled');
                    // Update globalPastTasks
                    globalPastTaskKeys = [];
                    // Update UI
                    document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                    document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
                    document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                }
                // Alert complete btn
                if (`#${e.target.id}` === UISelectors.alertCompleteBtn) {
                    globalPastTaskKeys.forEach(key => {
                        // 
                        if (globalTasksOngoing[key].length > 1) {
                            let taskToAppend = globalTasksOngoing[key];
                            if (!(globalTasksCompleted[key] === undefined)) {
                                taskToAppend = taskToAppend.concat(globalTasksCompleted[key]);
                            }
                            FirebaseCtrl.markAsCompleted(key, [], taskToAppend, false)
                            .then(() => {
                                // Update globalTasks
                                if (globalTasksCompleted[key] === undefined) {
                                    globalTasksCompleted[key] = globalTasksOngoing[key];
                                } else {
                                    globalTasksCompleted[key] = globalTasksCompleted[key].concat(globalTasksOngoing[key]);
                                }
                                globalTasksOngoing[key] = [];
                                renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                                // Calculate progress
                                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                                // Update notifications
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                                // Update globalPastTasks
                                globalPastTaskKeys = [];
                                // Update UI
                                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                                document.querySelector('body').style.overflow = 'auto';
                                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        } else {
                            FirebaseCtrl.markAsCompleted(key, [], globalTasksOngoing[key][0])
                            .then(() => {
                                // Update globalTasks
                                if (globalTasksCompleted[key] === undefined) {
                                    globalTasksCompleted[key] = globalTasksOngoing[key];
                                } else {
                                    globalTasksCompleted[key] = globalTasksCompleted[key].concat(globalTasksOngoing[key]);
                                }
                                globalTasksOngoing[key] = [];
                                renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                                // Calculate progress
                                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                                // Update notifications
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                                // Update globalPastTasks
                                globalPastTaskKeys = [];
                                // Update UI
                                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                                document.querySelector('body').style.overflow = 'auto';
                                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                            })
                            .catch(err => {
                                console.log(err);
                            });
                        }
                    });
                }
                // Alert dispose btn
                if (`#${e.target.id}` === UISelectors.alertDisposeBtn) {
                    globalPastTaskKeys.forEach(key => {
                        // 
                        FirebaseCtrl.deleteField(key, 'ongoing')
                        .then(() => {
                            // Update globalTasks
                            globalTasksOngoing[key] = [];
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    });
                    // 
                    renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                    // Calculate progress
                    calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                    // Update notifications
                    document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                    document.querySelector(UISelectors.navNotifications).textContent = '';
                    document.querySelector(UISelectors.notifications).classList.add('disabled');
                    // Update globalPastTasks
                    globalPastTaskKeys = [];
                    // Update UI
                    document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                    document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                    document.querySelector('body').style.overflow = 'auto';
                    document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                }
            });
            // // Delete account submit event
            // document.querySelector(UISelectors.deleteAccountForm).addEventListener('submit', e => {

            // });
            // Delete account submit event
            document.querySelector(UISelectors.deleteAccountForm).addEventListener('submit', e => {
                const emailValue = document.querySelector(UISelectors.deleteAccountEmail);
                const passValue = document.querySelector(UISelectors.deleteAccountPassword);
                const errorPara = document.querySelector(UISelectors.deleteAccountErrorPara);
                FirebaseCtrl.reauthenticate(emailValue.value, passValue.value)
                .then(() => {
                    console.log('reauthenticated');
                    return FirebaseCtrl.deleteUser();
                })
                .then(() => {
                    console.log('user logged out');
                    document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                    document.querySelector(UISelectors.welcomeHeader).textContent = '';
                    document.querySelector(UISelectors.leadTodayDate).textContent = '';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'none';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 0;
                    console.log('user deleted');
                    // 
                    setTimeout(() => {
                        // Adjust UI
                        document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                    }, 2000);
                })
                .catch(error => {
                    console.log(error);
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
                // 
                e.preventDefault();
            });
            // Add form submit event
            document.querySelector(UISelectors.addForm).addEventListener('submit', e => { 
                const task = document.querySelector(UISelectors.addForm).add.value.trim();
                const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                // Add task on conditions
                if (task.length && !document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && !document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                    // 
                    const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                    if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                        // Check if currToday is in pastTaskKeys
                        if (!globalPastTaskKeys.includes(currToday)) {
                            globalPastTaskKeys.push(currToday);
                        }
                    }
                    // Check if pastTasksKeys is empty
                    if (globalPastTaskKeys.length) {
                        document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                        document.querySelector(UISelectors.navNotifications).textContent = 1;
                        document.querySelector(UISelectors.notifications).classList.remove('disabled');
                    }
                    // 
                    FirebaseCtrl.addTasks({
                        currToday,
                        task,
                        error: UICtrl.errorTasks,
                        updateUI: renderDayModeCalendar
                    })
                    .then(() => {
                        // Adjust UI
                        document.querySelector(UISelectors.pickDateFormWrapper).classList.remove('pick-date-form-open');
                        document.querySelector(UISelectors.addForm).reset();
                        // Calculate progress
                        calculateProgress(currToday);
                    })
                    .catch(err => {
                        console.log('Error getting document', err);
                    });
                } else if (task.length && document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && !document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                    const dayToasts = Array.from(document.querySelector(UISelectors.dateToasts).children);
                    if (document.querySelector(UISelectors.dateToasts).children.length) {
                        // Day toast list is not empty -- add tasks
                        dayToasts.forEach(dayToast => {
                            // 
                            const date = parse(dayToast.id, "d'-'MMM'-'yyyy", new Date());
                            if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                                // Check if currToday is in pastTaskKeys
                                if (!globalPastTaskKeys.includes(dayToast.id)) {
                                    globalPastTaskKeys.push(dayToast.id);
                                }
                            }
                            // Check if pastTasksKeys is empty
                            if (globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                                document.querySelector(UISelectors.navNotifications).textContent = 1;
                                document.querySelector(UISelectors.notifications).classList.remove('disabled');
                            }
                            // 
                            FirebaseCtrl.updateTasks(globalUser, dayToast.id, task)
                            .then(() => {
                                // Show success message
                                // 
                                document.querySelector(UISelectors.searchTasks).disabled = false;
                                document.querySelector(UISelectors.addOption).disabled = false;
                                document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                                document.querySelector(UISelectors.dayModeView).disabled = false;
                                document.querySelector(UISelectors.weekModeView).disabled = false;
                                document.querySelector(UISelectors.monthModeView).disabled = false;
                                document.querySelector(UISelectors.userNavbar).disabled = false;
                                document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                                document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                                document.querySelector(UISelectors.pickDate).disabled = false;
                                // 
                                document.querySelector(UISelectors.tableBody).classList.remove('pick-date-mode');
                                document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-light');
                                document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-danger');
                                // Adjust UI
                                document.querySelector(UISelectors.pickDateFormWrapper).classList.remove('pick-date-form-open');
                                document.querySelector(UISelectors.addForm).reset();
                                // Update globalTasks
                                if (globalTasksOngoing[dayToast.id] === undefined) {
                                    globalTasksOngoing[dayToast.id] = task;
                                } else {
                                    globalTasksOngoing[dayToast.id].push(task);
                                }
                                console.log(globalTasksOngoing);
                                // 
                                renderDayModeCalendar(new Date(), globalTasksOngoing, globalUser, FirebaseCtrl.updateTasks2);
                                // Calculate progress
                                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                            })
                            .catch(err => {
                                console.log(err);
                            })
                        });
                    } else {
                        // Day toast list is empty -- show a message
                    }
                }
                // 
                e.preventDefault();
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
                document.querySelector(UISelectors.welcomeHeader).textContent = data.info.name;
                document.querySelector(UISelectors.leadTodayDate).textContent = format(data.date, "do 'of' MMMM yyyy");
                // document.querySelector(UISelectors.leadTaskNum).textContent = 
                // Set theme, avatar & toasts
                UICtrl.chooseTheme(data.info.theme);
                UICtrl.chooseAvatar(data.info.avatar);
                document.querySelector(UISelectors.userAvatar).setAttribute('class', document.querySelector(`#${data.info.avatar}`).firstElementChild.classList.value);
                document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                UICtrl.chooseToast(data.info.toast);
                // Calculate progress
                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                // 
                setTimeout(() => {
                    document.querySelector(UISelectors.loginLoader).remove();
                    document.querySelector(UISelectors.loginWrapper).style.display = 'none';
                    document.querySelector(UISelectors.loginMainDiv).style.opacity = 1;
                    // 
                    console.log('tasks in setUI');
                    globalPastTaskKeys = checkPastOngoingTasks(globalTasksOngoing);
                    deletePastOngoingTasks(globalTasksOngoing);
                    deletePastCompletedTasks(globalTasksCompleted);
                    // Add event listeners
                    console.log(globalPastTaskKeys);
                    
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
        // console.log('tasks in setUI');
        // checkPastOngoingTasks(globalTasksOngoing);
        // deletePastOngoingTasks(globalTasksOngoing);
        // deletePastCompletedTasks(globalTasksCompleted);
    }

    const renderDayModeCalendar = function(currToday, tasks, user, setTasks, ongoing = true) {
        // Set global tasks
        if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
            console.log('ongoing tasks are active');
            globalTasksOngoing = tasks;
            console.log(globalTasksOngoing);
        } else {
            console.log('completed tasks are active');
            globalTasksCompleted = tasks;
            console.log(globalTasksCompleted);
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
        if (ongoing) {
            const taskNum = UICtrl.displayTasks(tasks, currToday, DnDCtrl.enableDnD, user, setTasks);
            if (taskNum) {
                document.querySelector(UISelectors.leadTaskNum).textContent = taskNum;
            } else {
                document.querySelector(UISelectors.leadTaskNum).textContent = 0;
            }
        } else {
            const taskNum = UICtrl.displayTasks(tasks, currToday, DnDCtrl.enableDnD, user, setTasks, false);
            if (taskNum) {
                document.querySelector(UISelectors.leadTaskCompletedNum).textContent = taskNum;
            } else {
                document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
            }
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
                ${format(day, "d MMM yy")}
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
            if (globalTasksOngoing[format(day, "d'-'MMM'-'yyyy")] !== undefined && globalTasksOngoing[format(day, "d'-'MMM'-'yyyy")].length) {
                td = UICtrl.addBadge(td, globalTasksOngoing[format(day, "d'-'MMM'-'yyyy")].length);
            }
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
        // if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
        //     document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
        // }
        // 
        document.querySelector(UISelectors.searchFormWrapper).classList.remove('search-form-open');
        // document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
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
                    console.log('from renderMonth');
                    console.log(new Date(year, month, renderDaysNumCurrMonth));
					if (
						new Date(year, month, renderDaysNumCurrMonth) <
						subDays(today, 31)
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
                    if (globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")] !== undefined && globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length) {
                        td = UICtrl.addBadge(td, globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length);
                    }
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
		if (document.querySelector(UISelectors.monthModeMonth).selectedIndex === subDays(today, 30).getMonth() && (new Date()).getFullYear() === Number(document.querySelector(UISelectors.monthModeYear).textContent.trim())) {
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

    const calculateProgress = function(currToday) {
        console.log('jestem w calculateProgress');
        const progressBar = document.querySelector(UISelectors.taskProgress).firstElementChild.firstElementChild;
        let ongoingNum = 0;
        let completedNum = 0;
        console.log(globalTasksOngoing);
        console.log(globalTasksCompleted);
        if (!(globalTasksOngoing[currToday] === undefined)) {
            ongoingNum = globalTasksOngoing[currToday].length;
        }
        if (!(globalTasksCompleted[currToday] === undefined)) {
            completedNum = globalTasksCompleted[currToday].length;
        }
        let completePerCent = 0;
        if (!(ongoingNum === 0 && completedNum === 0)) {
            completePerCent = Number(Math.ceil(completedNum / (completedNum + ongoingNum) * 100).toFixed());
        }
        progressBar.firstElementChild.style.width = completePerCent + '%';
        progressBar.firstElementChild.innerHTML = 'Progress: ' + completePerCent * 1 + '%';
    };

    const setCompletedTasks = function(tasks) {
        globalTasksCompleted = tasks;
        console.log('setCompletedTasks');
        console.log(globalTasksCompleted);
    }

    const checkPastOngoingTasks = function(tasks) {
        let pastDates = [];
        let pastTasks = [];
        for (const key in tasks) {
            const date = parse(key, "d'-'MMM'-'yyyy", new Date());
            if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate()) && tasks[key].length) {
                pastDates.push(date);
            }
        }
        pastDates.sort((a, b) => a - b);
        pastDates.forEach(pastDate => {
            pastTasks.push(format(pastDate, "d'-'MMM'-'yyyy"));
            let li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-center align-items-center task-item';
            li.textContent = format(pastDate, "d'-'MMM'-'yyyy");
            document.querySelector(UISelectors.listPastTasks).appendChild(li);
        });
        // 
        console.log('from inside checkPastOngoingTasks');
        console.log(pastTasks);
        if (pastTasks.length) {
            document.querySelector(UISelectors.alertMsgWrapper).style.display = 'flex';
            document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 1;
            document.querySelector('body').style.overflow = 'hidden';
            // 
            document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
            document.querySelector(UISelectors.navNotifications).textContent = 1;
            document.querySelector(UISelectors.notifications).classList.remove('disabled');
        }
        // 
        return pastTasks;
    }

    const deletePastOngoingTasks = function(tasks) {
        const today = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())
        for (const key in tasks) {
            const date = parse(key, "d'-'MMM'-'yyyy", new Date());
            if (date < subDays(today, 31)) {
                // Delete tasks from firestore
                FirebaseCtrl.deleteField(key, 'ongoing')
                .then(() => {
                    console.log('deleted ongoing ' + key);
                    // Update globalTasks
                    globalTasksOngoing[key] = [];
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    }
    const deletePastCompletedTasks = function(tasks) {
        const today = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())
        for (const key in tasks) {
            const date = parse(key, "d'-'MMM'-'yyyy", new Date());
            if (date < subDays(today, 31)) {
                // Delete tasks from firestore
                FirebaseCtrl.deleteField(key, 'completed')
                .then(() => {
                    console.log('deleted completed ' + key);
                    // Update globalTasks
                    globalTasksCompleted[key] = [];
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    }

	return {
		init: function() {
            console.log('Initializing App...');

            // Initialize firebase app
            FirebaseCtrl.firebaseInit();
            // test firebase
            // FirebaseCtrl.test();
            // Adjust UI on user status change
            // let user = '';
            FirebaseCtrl.authStatus({
                setUI,
                renderLoginAccounts: UICtrl.renderLoginAccounts,
                uiListSelector: UISelectors.loginAccounts,
                renderDayModeCalendar,
                currToday: new Date(),
                setCompletedTasks
            });
            // Load event listeners
            loadEventListeners();
		}
	}

})(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl);
// Initialize App
AppCtrl.init();