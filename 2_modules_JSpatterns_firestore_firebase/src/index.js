import './css/style.css';
import UICtrl from './js/UICtrl';
import DataCtrl from './js/DataCtrl';
import DnDCtrl from './js/DnDCtrl';
import FirebaseCtrl from './js/FirebaseCtrl';
import { format, parse, subDays, addDays, startOfWeek, addWeeks, eachDayOfInterval, getDate, isToday } from 'date-fns';
import boostrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery'
// App Controller
const AppCtrl = (function(UICtrl, DataCtrl, DnDCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Initialize global variables
    const vars = {
        globalUser: '',
        globalTasksOngoing: [],
        globalTasksCompleted: [],
        startTask: '',
        globalPastTaskKeys: [],
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
        // UI event listeners
        document.querySelector('body').addEventListener('click', e => {
            // Add user - sign up & log in using firebase
            if (`#${e.target.id}` === UISelectors.addUserBtn) {
                // Create add user mode
                UICtrl.createAddMode();
                // Adjust UI
                setTimeout(() => {
                    document.querySelector(UISelectors.loginMainDiv).classList.add('move-y-up');
                    document.querySelector(UISelectors.loginAddMode).classList.add('move-y-zero');
                    document.querySelector(UISelectors.username).select();
                    document.querySelector(UISelectors.email).removeAttribute('tabindex');
                    document.querySelector(UISelectors.password).removeAttribute('tabindex');
                }, 100)
                // Validate username, email & password
                Array.from(document.querySelectorAll('.login-wrapper input'))
                .forEach(input => {
                    input.addEventListener('keyup', e => {
                        DataCtrl.validate(e.target);
                        UICtrl.enableDisableCreateBtn();
                    })
                    input.addEventListener('blur', e => {
                        DataCtrl.validate(e.target);
                        UICtrl.enableDisableCreateBtn();
                    })
                });
                // Go Back from add user
                document.querySelector(UISelectors.addBackBtn)
                .addEventListener('click', () => {
                    document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                    document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero');
                    setTimeout(() => {
                        document.querySelector(UISelectors.loginAddMode).remove();
                    }, 100)
                })
                // Add new account - submit event
                document.querySelector(UISelectors.addAccountForm).addEventListener('submit', e => {
                    // Check if username, email & password pass against regex
                    const username = document.querySelector(UISelectors.username);
                    const email = document.querySelector(UISelectors.email);
                    const pass = document.querySelector(UISelectors.password);
                    const errorPara = document.querySelector(UISelectors.errorPara);
                    if (DataCtrl.validate(username) && DataCtrl.validate(email) && DataCtrl.validate(pass)) { // YES
                        // Create and store new user in Firebase
                        const user = {
                            name: document.querySelector(UISelectors.username).value,
                            avatar: 'avatar-1',
                            theme: 'theme-1',
                            toast: 'toast-change-1'
                        }
                        FirebaseCtrl.signUp(document.querySelector(UISelectors.email).value, document.querySelector(UISelectors.password).value, user)
                        .then(() => {
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
                                // Adjust UI
                                document.querySelector(UISelectors.loginConfirmMode).classList.remove('move-y-zero');
                                // Show login loader
                                UICtrl.createLoginLoader();
                                document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
                                // Adjust UI
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
                                // Adjust UI
                                setTimeout(() => {
                                    document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                                    document.querySelector('body').style.overflow = 'auto';
                                    // Set vars on welcome page
                                    document.querySelector(UISelectors.welcomeHeader).textContent = user.name;
                                    document.querySelector(UISelectors.leadTodayDate).textContent = format(new Date(), "do 'of' MMMM yyyy");
                                    // Remove loader
                                    setTimeout(() => {
                                        document.querySelector(UISelectors.loginLoader).remove();
                                    }, 500);
                                }, 2000);
                            }, 2000);
                        })
                        .catch(error => {
                            // Handle error & adjust UI
                            UICtrl.errorSignUpAll(error, DataCtrl.errorHandlingSignUp, {
                                username, email, pass, errorPara
                            });
                        });
                    } else { // NO - handle errors
                        if (!DataCtrl.validate(username)) {
                            UICtrl.errorSignUpSingleInput({ username, email, pass, errorPara }, "Username field cannot be empty.");
                        }
                        if (!DataCtrl.validate(email)) {
                            UICtrl.errorSignUpSingleInput({ username, email, pass, errorPara }, "Email field must be a valid email address.");
                        }
                        if (!DataCtrl.validate(pass)) {
                            UICtrl.errorSignUpSingleInput({ username, email, pass, errorPara }, "Password must be at least 8 characters long, consist of letters, numbers and include at least one capital letter and one special character [!@#$%^&*].");
                        }
                    }
                    // 
                    e.preventDefault();
                })
            }
            // Log in
            if (document.querySelector(UISelectors.loginAccounts).contains(e.target) && !document.querySelector(UISelectors.loginAccounts).classList.contains('empty')) {
                let id = '';
                if (e.target.tagName.toLowerCase() === 'i') {
                    id = e.target.parentElement.id;
                } else if(e.target.tagName.toLowerCase() === 'li') {
                    id = e.target.id;
                }
                // Create log in mode
                UICtrl.createLogInMode(id);
                // Adjust UI
                setTimeout(() => {
                    document.querySelector(UISelectors.loginMainDiv).classList.add('move-x-left');
                    document.querySelector(UISelectors.logInConfirmMode).classList.add('move-x-zero');
                    document.querySelector(UISelectors.email).select();
                }, 100)
                // Go back from user log in
                document.querySelector(UISelectors.logInConfirmBackBtn).addEventListener('click', () => {
                    // Adjust UI
                    document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                    document.querySelector(UISelectors.logInConfirmMode).classList.remove('move-x-zero');
                    setTimeout(() => {
                        document.querySelector(UISelectors.logInConfirmMode).remove();
                    }, 100)
                })
                // Log in to an account
                document.querySelector(UISelectors.logInForm).addEventListener('submit', (e) => {
                    const email = document.querySelector(UISelectors.email);
                    const pass = document.querySelector(UISelectors.password);
                    const errorPara = document.querySelector(UISelectors.errorPara);
                    FirebaseCtrl.logIn(email.value, pass.value)
                    .then(credentials => {
                        // Adjust UI
                        document.querySelector(UISelectors.logInConfirmMode).remove();
                    })
                    .catch(error => {
                        UICtrl.errorLogInAll(error, DataCtrl.errorHandlingLogIn, {
                            email, pass, errorPara
                        });
                    });
                    e.preventDefault();
                });
            }
            // Log out
            if (`#${e.target.id}` === UISelectors.logOut) {
                FirebaseCtrl.logOut()
                    .then(() => {
                        // Adjust UI
                        document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                        // 
                        // Disable buttons (consider writing function for this!!!)
                        document.querySelector(UISelectors.userNavbar).disabled = true;
                        document.querySelector(UISelectors.lDayArrow).disabled = true;
                        document.querySelector(UISelectors.rDayArrow).disabled = true;
                        document.querySelector(UISelectors.dayModeView).disabled = true;
                        document.querySelector(UISelectors.weekModeView).disabled = true;
                        document.querySelector(UISelectors.monthModeView).disabled = true;
                        document.querySelector(UISelectors.searchTasks).disabled = true;
                        document.querySelector(UISelectors.searchForm).searchInput.disabled = true;
                        document.querySelector(UISelectors.addOption).disabled = true;
                        document.querySelector(UISelectors.addForm).add.disabled = true;
                        document.querySelector(UISelectors.pickDate).disabled = true;
                        document.querySelector(UISelectors.addForm).submit.disabled = true;
                        document.querySelector(UISelectors.pickDateTodayBtn).disabled = true;
                        document.querySelector(UISelectors.pickDatePickMode).disabled = true;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                        document.querySelector(UISelectors.markAsBtn).disabled = true;
                        document.querySelector(UISelectors.deleteBtn).disabled = true;
                        document.querySelector(UISelectors.deselectBtn).disabled = true;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                        // 
                        setTimeout(() => {
                            document.querySelector(UISelectors.welcomeHeader).textContent = '';
                            document.querySelector(UISelectors.leadTodayDate).textContent = '';
                            document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                        }, 1000);
                    })
                    .catch(error => {

                    });
            }
            // Show/hide user password
            if (`.${e.target.className}` === UISelectors.showHidePass) {
                UICtrl.showHidePass(e.target, document.querySelector(UISelectors.password));
            }
            // Switch to day mode
            if (`#${e.target.id}` === UISelectors.dayModeView) {
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                } else {
                    renderDayModeCalendar(new Date(), vars.globalTasksCompleted, vars.globalUser, FirebaseCtrl.updateTasks2, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // Calculate progress
                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
            }
            // Left arrow in day mode clicked
            if (`#${e.target.id}` === UISelectors.lDayArrow || document.querySelector(UISelectors.lDayArrow).contains(e.target)) {
                // Get correct date
                const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                const prevToday = subDays(today, 1);
                let currToday = prevToday;
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    renderDayModeCalendar(currToday, vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                } else {
                    renderDayModeCalendar(currToday, vars.globalTasksCompleted, vars.globalUser, FirebaseCtrl.updateTasks2, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // 
                // Calculate progress
                calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
            }
            // Right arrow in day mode clicked
            if (`#${e.target.id}` === UISelectors.rDayArrow || document.querySelector(UISelectors.rDayArrow).contains(e.target)) {
                // Get correct date
                const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                const nextToday = addDays(today, 1);
                let currToday = nextToday;
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    renderDayModeCalendar(currToday, vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                } else {
                    renderDayModeCalendar(currToday, vars.globalTasksCompleted, vars.globalUser, FirebaseCtrl.updateTasks2, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // Calculate progress
                calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
            }
            // Switch to week mode
            if (`#${e.target.id}` === UISelectors.weekModeView) {
                // Get correct week
                const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                const currFirstDayOfWeek = startOfWeek(today);
                // Render week mode
                renderWeekModeCalendar(currFirstDayOfWeek);
            }
            // Left arrow in week mode clicked
            if (`#${e.target.id}` === UISelectors.lWeekArrow || document.querySelector(UISelectors.lWeekArrow).contains(e.target)) {
                // Get correct week
                const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                const currFirstDayOfWeek = subDays(startOfWeek(today), 7);
                // Render week mode
                renderWeekModeCalendar(currFirstDayOfWeek);
            }
            // Right arrow in week mode clicked
            if (`#${e.target.id}` === UISelectors.rWeekArrow || document.querySelector(UISelectors.rWeekArrow).contains(e.target)) {
                // Get correct week
                const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                const currFirstDayOfWeek = addDays(startOfWeek(today), 7);
                // Render week mode
                renderWeekModeCalendar(currFirstDayOfWeek);
            }
            // Switch to month mode
            if (`#${e.target.id}` === UISelectors.monthModeView) {
                // Set table head/body
                UICtrl.setTableBodyHead(false);
                // Get current today
                const today = new Date();
                // Render month mode
                renderMonthModeCalendar(today.getFullYear(), today.getMonth(), today);
                // Change month in month mode
                document.querySelector(UISelectors.monthModeMonth).addEventListener('change', e => {
                    // Set table head/body
                    UICtrl.setTableBodyHead(false);
                    // Render month mode
                    renderMonthModeCalendar(Number(document.querySelector(UISelectors.monthModeYear).textContent), e.target.selectedIndex, today);
                });
            }
            // Left arrow in month mode clicked
            if (`#${e.target.id}` === UISelectors.lMonthArrow || document.querySelector(UISelectors.lMonthArrow).contains(e.target)) {
                // Clear table body
                document.querySelector(UISelectors.tableBody).innerHTML = '';
                // Get current year, month
                let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex - 1;
                if (month === -1) {
                    month = 11;
                    year--;
                }
                // Render month mode
                renderMonthModeCalendar(year, month, new Date());
            }
            // Right arrow in month mode clicked
            if (`#${e.target.id}` === UISelectors.rMonthArrow || document.querySelector(UISelectors.rMonthArrow).contains(e.target)) {
                // Clear table body
                document.querySelector(UISelectors.tableBody).innerHTML = '';
                // Get current year, month
                let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex + 1;
                if (month === 12) {
                    month = 0;
                    year++;
                }
                // Render month mode
                renderMonthModeCalendar(year, month, new Date());
            }
            // Choose day td when in week / month mode
            if (!document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && e.target.tagName.toLowerCase() === 'td') {
                if (document.querySelector('body').classList.contains('month-mode-active')) {
                    if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
                        // Get current date
                        const day = Number(e.target.childNodes[0].nodeValue);
                        const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                        const year = Number(document.querySelector(UISelectors.monthModeYear).textContent.trim());
                        const currToday = new Date(year, month, day);
                        // Render day mode
                        renderDayModeCalendar(currToday, vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                        // Calculate progress
                        calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
                    }
                } else if (document.querySelector('body').classList.contains('week-mode-active')) {
                    if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
                        // Get current date
                        const day = e.target.textContent.trim();
                        const currToday = parse(day, "d MMM yyyy", new Date())
                        // Render day mode
                        renderDayModeCalendar(currToday, vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                        // Calculate progress
                        calculateProgress(format(currToday, "d'-'MMM'-'yyyy"));
                    }
                }
            }
            // Switch to ongoing tasks
            if (`#${e.target.id}` === UISelectors.taskTabsOngoing) {
                if (!e.target.classList.contains('active')) {
                    // Get current date
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    let currToday = today;
                    // Adjust UI display
                    e.target.classList.add('active');
                    e.target.nextElementSibling.classList.remove('active');
                    document.querySelector(UISelectors.leadTaskNum).parentElement.parentElement.classList.remove('hide');
                    document.querySelector(UISelectors.leadTaskNum).parentElement.parentElement.nextElementSibling.classList.add('hide');
                    if (!document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                        document.querySelector(UISelectors.addOption).disabled = false;
                    }
                    // Clear search string
                    if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                        document.querySelector(UISelectors.searchForm).searchInput.value = '';
                    }
                    // Render day mode
                    console.log('w switch to ongoing jestem');
                    console.log(vars.globalTasksOngoing);
                    renderDayModeCalendar(currToday, vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                }
            }
            // Switch to completed tasks
            if (`#${e.target.id}` === UISelectors.taskTabsCompleted) {
                if (!e.target.classList.contains('active')) {
                    // Get current date
                    const todayContent = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    let today = parse(todayContent, "d MMMM yyyy, EEEE", new Date());
                    let currToday = today;
                    // Adjust UI display
                    e.target.classList.add('active');
                    e.target.previousElementSibling.classList.remove('active');
                    document.querySelector(UISelectors.leadTaskCompletedNum).parentElement.parentElement.classList.remove('hide');
                    document.querySelector(UISelectors.leadTaskCompletedNum).parentElement.parentElement.previousElementSibling.classList.add('hide');
                    document.querySelector(UISelectors.addOption).disabled = true;
                    // Clear search string
                    if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                        document.querySelector(UISelectors.searchForm).searchInput.value = '';
                    }
                    // Render day mode
                    renderDayModeCalendar(currToday, vars.globalTasksCompleted, vars.globalUser, FirebaseCtrl.updateTasks2, false);
                }
            }
            // Task-related event listeners
                // Add task wrapper
            if (`#${e.target.id}` === UISelectors.addOption || document.querySelector(UISelectors.addOption).contains(e.target)) {
                document.querySelector(UISelectors.addFormWrapper).classList.toggle('add-form-open');
                // Disable buttons (consider writing function for this!!!)
                document.querySelector(UISelectors.userNavbar).disabled = false;
                document.querySelector(UISelectors.weekModeView).disabled = false;
                document.querySelector(UISelectors.monthModeView).disabled = false;
                document.querySelector(UISelectors.searchTasks).disabled = false;
                document.querySelector(UISelectors.addForm).add.disabled = true;
                document.querySelector(UISelectors.pickDate).disabled = true;
                document.querySelector(UISelectors.pickDateTodayBtn).disabled = true;
                document.querySelector(UISelectors.pickDatePickMode).disabled = true;
                document.querySelector(UISelectors.addForm).submit.disabled = true;
                document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                // 
                if (document.querySelector(UISelectors.addFormWrapper).classList.contains('add-form-open')) {
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.addForm).add.disabled = false;
                    document.querySelector(UISelectors.pickDate).disabled = false;
                    document.querySelector(UISelectors.addForm).submit.disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                    document.querySelector(UISelectors.addFormInputs).focus();
                    document.querySelector(UISelectors.addFormInputs).select();
                }
                if (document.querySelector(UISelectors.pickDateFormWrapper).classList.contains('pick-date-form-open')) {
                    document.querySelector(UISelectors.pickDateFormWrapper).classList.toggle('pick-date-form-open');
                    document.querySelector(UISelectors.dateToasts).innerHTML = '';
                }
            }
                // Delete task
            if (e.target.classList.contains('delete')) {
                if (!e.target.parentElement.firstElementChild.classList.contains('hide')) {
                    // Get current date
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    // Store deleted task
                    const taskDeleted = e.target.parentElement.parentElement.textContent.trim();
                    // Get all tasks
                    const tasks = document.querySelectorAll('.tasks li');
                    let allTasks = [];
                    Array.from(tasks).forEach(task => {
                        allTasks.push(task.textContent.trim());
                        task.classList.add('disabled-li');
                    })
                    const index = allTasks.indexOf(taskDeleted);
                    allTasks.splice(index, 1);
                    // Ongoing / completed
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        // Delete from firestore
                        FirebaseCtrl.deleteTask(currToday, allTasks, 'ongoing')
                        .then(() => {
                            // Adjust UI display
                            e.target.parentElement.previousElementSibling.previousElementSibling.remove();
                            // Show message
                            e.target.parentElement.previousElementSibling.classList.add('hide');
                            e.target.parentElement.parentElement.appendChild(UICtrl.createMsg('Task Deleted'));
                            e.target.parentElement.parentElement.classList.add('fade-out');
                            // 
                            setTimeout(() => {
                                // Remove task from UI
                                e.target.parentElement.parentElement.remove();
                                // Get current tasks & reassign task ids
                                const tasks = document.querySelectorAll('.tasks li');
                                [].forEach.call(tasks, (li, index) => {
                                    li.id = 'task' + index;
                                    li.classList.remove('disabled-li');
                                });
                                // Update global ongoing tasks
                                vars.globalTasksOngoing[currToday] = allTasks;
                                // Update task number
                                document.querySelector(UISelectors.leadTaskNum).textContent = allTasks.length;
                                // Notifications - check if currToday is in pastTaskKeys
                                if (vars.globalPastTaskKeys.includes(currToday)) {
                                    const index = vars.globalPastTaskKeys.indexOf(currToday);
                                    vars.globalPastTaskKeys.splice(index, 1);
                                }
                                // Notifications - check if pastTasksKeys is empty
                                if (!vars.globalPastTaskKeys.length) {
                                    document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                    document.querySelector(UISelectors.navNotifications).textContent = '';
                                    document.querySelector(UISelectors.notifications).classList.add('disabled');
                                }
                                // Calculate progress
                                calculateProgress(currToday);
                            }, 1000);
                        })
                        .catch(error => {
                            // Handle error
                            console.log(error);
                        });
                    } else if (document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                        // Delete from firestore
                        FirebaseCtrl.deleteTask(currToday, allTasks, 'completed')
                        .then(() => {
                            // Adjust UI display
                            e.target.parentElement.previousElementSibling.previousElementSibling.remove();
                            // Show message
                            e.target.parentElement.previousElementSibling.classList.add('hide');
                            e.target.parentElement.parentElement.appendChild(UICtrl.createMsg('Task Deleted'));
                            e.target.parentElement.parentElement.classList.add('fade-out');
                            // 
                            setTimeout(() => {
                                // Remove task from UI
                                e.target.parentElement.parentElement.remove();
                                // Get current tasks & reassign task ids
                                const tasks = document.querySelectorAll('.tasks li');
                                [].forEach.call(tasks, (li, index) => {
                                    li.id = 'task' + index;
                                    li.classList.remove('disabled-li');
                                });
                                // Update global completed tasks
                                vars.globalTasksCompleted[currToday] = allTasks;
                                // Update task number
                                document.querySelector(UISelectors.leadTaskCompletedNum).textContent = allTasks.length;
                                // Calculate progress
                                calculateProgress(currToday);
                            }, 1000);
                        })
                        .catch(error => {
                            // Handle error
                            console.log(error);
                        });
                    }
                }
            }
                // Edit task
                // CONSIDER DISABLING TABINDEX ON BUTTONS & ENABLING IT ON EDIT ICON
                // when in edit mode cannot tabindex does not change focus -- add it to edit btn
            if (e.target.classList.contains('edit')) {
                // Save current task
                vars.startTask = e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent.trim();
                // Disable DnD
                document.querySelectorAll('.tasks li').forEach((currTask) => {
                    currTask.draggable = false;
                });
                // Enable edit mode
                e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
                    'contenteditable',
                    'true'
                );
                const el = e.target.parentElement.parentElement.firstElementChild.nextElementSibling;
                let range = document.createRange();
                let sel = window.getSelection();
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
                document.querySelector(UISelectors.userNavbar).disabled = true;
                document.querySelector(UISelectors.lDayArrow).disabled = true;
                document.querySelector(UISelectors.rDayArrow).disabled = true;
                document.querySelector(UISelectors.dayModeView).disabled = true;
                document.querySelector(UISelectors.weekModeView).disabled = true;
                document.querySelector(UISelectors.monthModeView).disabled = true;
                document.querySelector(UISelectors.searchTasks).disabled = true;
                document.querySelector(UISelectors.addOption).disabled = true;
                document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                // Disable enter btn
                e.target.parentElement.parentElement.firstElementChild.nextElementSibling.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === 'Tab') {
                        e.preventDefault();
                    }
                });
            }
                // Turn off task editing
            if (e.target.classList.contains('ongoing-edit')) {
                // Get current date
                const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                // Store edited task
                const taskEdited = e.target.parentElement.parentElement.firstElementChild.nextElementSibling.textContent.trim();
                // Check if edited task is empty
                if (taskEdited === '') { taskEdited = vars.startTask }
                // Get all tasks
                const tasks = document.querySelectorAll('.tasks .task-item');
                let allTasks = [];
                Array.from(tasks).forEach(task => {
                    allTasks.push(task.textContent.trim());
                })
                // Update firestore
                FirebaseCtrl.updateTasks2(vars.globalUser, currToday, allTasks)
                .then(() => {
                    // Switch icons
                    e.target.previousElementSibling.classList.remove('hide');
                    e.target.classList.add('hide');
                    // Disable edit mode
                    e.target.parentElement.parentElement.firstElementChild.nextElementSibling.setAttribute(
                        'contenteditable',
                        'false'
                    );
                    e.target.parentElement.parentElement.classList.remove('editable');
                    // Enable DnD & store current tasks
                    Array.from(tasks).forEach(task => {
                        task.draggable = true;
                    });
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = false;
                    document.querySelector(UISelectors.lDayArrow).disabled = false;
                    document.querySelector(UISelectors.rDayArrow).disabled = false;
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.weekModeView).disabled = false;
                    document.querySelector(UISelectors.monthModeView).disabled = false;
                    document.querySelector(UISelectors.searchTasks).disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    // Update ongoing tasks
                    vars.globalTasksOngoing[currToday] = allTasks;
                })
                .catch(error => {
                    console.log(error);
                });
            }
                // Complete task
            if (e.target.classList.contains('uncompleted')) {
                if (
                    !e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
                    document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')
                ) {
                    // Get current date
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    // Store completed task
                    const taskCompleted = e.target.parentElement.parentElement.textContent.trim();
                    // Get all tasks
                    const tasks = document.querySelectorAll('.tasks li');
                    let allTasks = [];
                    Array.from(tasks).forEach(task => {
                        allTasks.push(task.textContent.trim());
                        task.classList.add('disabled-li');
                        
                    })
                    const index = allTasks.indexOf(taskCompleted);
                    allTasks.splice(index, 1);
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.lDayArrow).disabled = true;
                    document.querySelector(UISelectors.rDayArrow).disabled = true;
                    document.querySelector(UISelectors.dayModeView).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.addOption).disabled = true;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                    // Update firestore
                    FirebaseCtrl.markAsCompleted(currToday, allTasks, taskCompleted)
                    .then(() => {
                        // Switch icons
                        e.target.classList.toggle('hide');
                        e.target.nextElementSibling.classList.toggle('hide');
                        // Adjust UI display
                        e.target.parentElement.nextElementSibling.nextElementSibling.remove();
                        // Show message
                        e.target.parentElement.nextElementSibling.classList.add('hide');
                        e.target.parentElement.parentElement.appendChild(UICtrl.createMsg('Task Completed'));
                        e.target.parentElement.parentElement.classList.add('fade-out');
                        // 
                        setTimeout(() => {
                            // Remove task from UI
                            e.target.parentElement.parentElement.remove();
                            // Get current tasks & reassign task ids
                            const tasks = document.querySelectorAll('.tasks li');
                            [].forEach.call(tasks, (li, index) => {
                                li.id = 'task' + index;
                                li.classList.remove('disabled-li');
                            });
                            // Disable buttons (consider writing function for this!!!)
                            document.querySelector(UISelectors.userNavbar).disabled = false;
                            document.querySelector(UISelectors.lDayArrow).disabled = false;
                            document.querySelector(UISelectors.rDayArrow).disabled = false;
                            document.querySelector(UISelectors.dayModeView).disabled = false;
                            document.querySelector(UISelectors.weekModeView).disabled = false;
                            document.querySelector(UISelectors.monthModeView).disabled = false;
                            document.querySelector(UISelectors.searchTasks).disabled = false;
                            document.querySelector(UISelectors.addOption).disabled = false;
                            document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                            document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                            document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                            // Update ongoing / completed tasks
                            vars.globalTasksOngoing[currToday] = allTasks;
                            if (vars.globalTasksCompleted[currToday] === undefined) {
                                vars.globalTasksCompleted[currToday] = [];
                            }
                            vars.globalTasksCompleted[currToday].push(taskCompleted);
                            // Notifications - check if currToday is in pastTaskKeys
                            if (vars.globalPastTaskKeys.includes(currToday)) {
                                const index = vars.globalPastTaskKeys.indexOf(currToday);
                                vars.globalPastTaskKeys.splice(index, 1);
                            }
                            // Notifications - check if pastTasksKeys is empty
                            if (!vars.globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                            }
                            // Update task number
                            document.querySelector(UISelectors.leadTaskNum).textContent = allTasks.length;
                            // Calculate progress
                            calculateProgress(currToday);
                        }, 1500);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }
                // Uncomplete task
            if (e.target.classList.contains('completed')) {
                if (
                    !e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
                    document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')
                ) {
                    // Get current date
                    const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                    const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                    // Store task
                    const taskOngoing = e.target.parentElement.parentElement.textContent.trim();
                    // Get all tasks
                    const tasks = document.querySelectorAll('.tasks li');
                    let allTasks = [];
                    Array.from(tasks).forEach(task => {
                        allTasks.push(task.textContent.trim());
                        task.classList.add('disabled-li');
                    });
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.lDayArrow).disabled = true;
                    document.querySelector(UISelectors.rDayArrow).disabled = true;
                    document.querySelector(UISelectors.dayModeView).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.addOption).disabled = true;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                    const index = allTasks.indexOf(taskOngoing);
                    allTasks.splice(index, 1);
                    // Update firestore
                    FirebaseCtrl.markAsUncompleted(currToday, allTasks, taskOngoing)
                    .then(() => {
                        // Switch icons
                        e.target.classList.toggle('hide');
                        e.target.previousElementSibling.classList.toggle('hide');
                        // Adjust UI display
                        e.target.parentElement.nextElementSibling.nextElementSibling.remove();
                        // Show message
                        e.target.parentElement.nextElementSibling.classList.add('hide');
                        e.target.parentElement.parentElement.appendChild(UICtrl.createMsg('Moved Back to Scheduled'));
                        e.target.parentElement.parentElement.classList.add('fade-out');
                        // 
                        setTimeout(() => {
                            // Remove task from UI
                            e.target.parentElement.parentElement.remove();
                            // Get current tasks & reassign task ids
                            const tasks = document.querySelectorAll('.tasks li');
                            [].forEach.call(tasks, (li, index) => {
                                li.id = 'task' + index;
                                li.classList.remove('disabled-li');
                            });
                            // Disable buttons (consider writing function for this!!!)
                            document.querySelector(UISelectors.userNavbar).disabled = false;
                            document.querySelector(UISelectors.lDayArrow).disabled = false;
                            document.querySelector(UISelectors.rDayArrow).disabled = false;
                            document.querySelector(UISelectors.dayModeView).disabled = false;
                            document.querySelector(UISelectors.weekModeView).disabled = false;
                            document.querySelector(UISelectors.monthModeView).disabled = false;
                            document.querySelector(UISelectors.searchTasks).disabled = false;
                            document.querySelector(UISelectors.addOption).disabled = false;
                            document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                            document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                            document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                            // Update ongoing / completed tasks
                            vars.globalTasksCompleted[currToday] = allTasks;
                            if (vars.globalTasksOngoing[currToday] === undefined) {
                                vars.globalTasksOngoing[currToday] = [];
                                vars.globalTasksOngoing[currToday].push(taskOngoing);
                            } else {
                                vars.globalTasksOngoing[currToday].push(taskOngoing);
                            }
                            // Notifications
                            const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                            if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                                // Check if currToday is in pastTaskKeys
                                if (!vars.globalPastTaskKeys.includes(currToday)) {
                                    vars.globalPastTaskKeys.push(currToday);
                                }
                            }
                            // Check if pastTasksKeys is empty
                            if (vars.globalPastTaskKeys.length) {
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                                document.querySelector(UISelectors.navNotifications).textContent = 1;
                                document.querySelector(UISelectors.notifications).classList.remove('disabled');
                            }
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = allTasks.length;
                            // Calculate progress
                            calculateProgress(currToday);
                        }, 1000);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }
                // Select all tasks
            if (`#${e.target.id}` === UISelectors.selectAllBtn) {
                if (Array.from(document.querySelectorAll('.tasks .task-item')).length) {
                    document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                    // Adjust UI display
                    Array.from(document.querySelectorAll('.uncompleted'))
                    .forEach((uncompletedTask) => { uncompletedTask.classList.add('hide') });
                    Array.from(document.querySelectorAll('.completed'))
                    .forEach((completedTask) => { completedTask.classList.add('hide') });
                    Array.from(document.querySelectorAll('.edit'))
                    .forEach((editIcon) => { editIcon.classList.add('hide') });
                    Array.from(document.querySelectorAll('.delete'))
                    .forEach((deleteIcon) => { deleteIcon.classList.add('hide') });
                    Array.from(document.querySelectorAll('.tasks .task-item'))
                    .forEach((taskItem) => { taskItem.classList.add('selected') });
                    // Render mark as button
                    if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                        document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Completed';
                    } else {
                        document.querySelector(UISelectors.markAsBtn).textContent = 'Mark As Scheduled';
                    }
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.lDayArrow).disabled = true;
                    document.querySelector(UISelectors.rDayArrow).disabled = true;
                    document.querySelector(UISelectors.dayModeView).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.addOption).disabled = true;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    document.querySelector(UISelectors.markAsBtn).disabled = false;
                    document.querySelector(UISelectors.deleteBtn).disabled = false;
                    document.querySelector(UISelectors.deselectBtn).disabled = false;
                    document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
                    document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
                }
            }
            // Deselect all tasks
            if (`#${e.target.id}` === UISelectors.deselectBtn) {
                document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                // Adjust UI display
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    Array.from(document.querySelectorAll('.uncompleted'))
                    .forEach(uncompletedTask => { uncompletedTask.classList.remove('hide') });
                } else {
                    Array.from(document.querySelectorAll('.completed'))
                    .forEach(completedTask => { completedTask.classList.remove('hide') });
                }
                Array.from(document.querySelectorAll('.edit'))
                .forEach(editIcon => { editIcon.classList.remove('hide') });
                Array.from(document.querySelectorAll('.delete'))
                .forEach(deleteIcon => { deleteIcon.classList.remove('hide') });
                Array.from(document.querySelectorAll('.tasks .task-item'))
                .forEach(taskItem => { taskItem.classList.remove('selected') });
                // Disable buttons (consider writing function for this!!!)
                document.querySelector(UISelectors.userNavbar).disabled = false;
                document.querySelector(UISelectors.lDayArrow).disabled = false;
                document.querySelector(UISelectors.rDayArrow).disabled = false;
                document.querySelector(UISelectors.dayModeView).disabled = false;
                document.querySelector(UISelectors.weekModeView).disabled = false;
                document.querySelector(UISelectors.monthModeView).disabled = false;
                document.querySelector(UISelectors.searchTasks).disabled = false;
                document.querySelector(UISelectors.addOption).disabled = false;
                document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                document.querySelector(UISelectors.markAsBtn).disabled = true;
                document.querySelector(UISelectors.deleteBtn).disabled = true;
                document.querySelector(UISelectors.deselectBtn).disabled = true;
                document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
            }
                // Mark as btn
            if (`#${e.target.id}` === UISelectors.markAsBtn) {
                // Get current date
                const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                // 
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    // Get current tasks
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    let taskList = [];
                    Array.from(taskItems).forEach(taskItem => {
                        const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                        taskList.push(task);
                    });
                    if (!(vars.globalTasksCompleted[currToday] === undefined)) {
                        taskList = vars.globalTasksCompleted[currToday].concat(taskList);
                    }
                    // Update firestore
                    FirebaseCtrl.markAsCompleted(currToday, [], taskList, false)
                    .then(() => {
                        // Adjust UI display
                        Array.from(taskItems).forEach(taskItem => {
                            // Show message
                            taskItem.appendChild(UICtrl.createMsg('Task Completed'));
                            taskItem.classList.add('fade-out');
                            // Remove task from UI
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // Update ongoing / completed tasks
                        vars.globalTasksOngoing[currToday] = [];
                        vars.globalTasksCompleted[currToday] = taskList;
                        // Notifications - check if currToday is in pastTaskKeys
                        if (vars.globalPastTaskKeys.includes(currToday)) {
                            const index = vars.globalPastTaskKeys.indexOf(currToday);
                            vars.globalPastTaskKeys.splice(index, 1);
                        }
                        // Notifications - check if pastTasksKeys is empty
                        if (!vars.globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                        }
                        // Update task number
                        document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                        // Calculate progress
                        calculateProgress(currToday);
                        // Adjust UI display
                        document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                        // Disable buttons (consider writing function for this!!!)
                        document.querySelector(UISelectors.userNavbar).disabled = false;
                        document.querySelector(UISelectors.lDayArrow).disabled = false;
                        document.querySelector(UISelectors.rDayArrow).disabled = false;
                        document.querySelector(UISelectors.dayModeView).disabled = false;
                        document.querySelector(UISelectors.weekModeView).disabled = false;
                        document.querySelector(UISelectors.monthModeView).disabled = false;
                        document.querySelector(UISelectors.searchTasks).disabled = false;
                        document.querySelector(UISelectors.addOption).disabled = false;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                } else {
                    // Get current tasks
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    let taskList = [];
                    Array.from(taskItems).forEach(taskItem => {
                        const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                        taskList.push(task);
                    });
                    if (!(vars.globalTasksOngoing[currToday] === undefined)) {
                        taskList = vars.globalTasksOngoing[currToday].concat(taskList);
                    }
                    // Update firestore
                    FirebaseCtrl.markAsUncompleted(currToday, [], taskList, false)
                    .then(() => {
                        // Adjust UI display
                        Array.from(taskItems).forEach((taskItem) => {
                            // Show message
                            taskItem.appendChild(UICtrl.createMsg('Moved Back to Scheduled'));
                            taskItem.classList.add('fade-out');
                            // Remove task from UI
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // Update ongoing / completed tasks
                        vars.globalTasksCompleted[currToday] = [];
                        vars.globalTasksOngoing[currToday] = taskList;
                        // Notifications
                        const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                        if (date < new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())) {
                            // Check if currToday is in pastTaskKeys
                            if (!vars.globalPastTaskKeys.includes(currToday)) {
                                vars.globalPastTaskKeys.push(currToday);
                            }
                        }
                        // Check if pastTasksKeys is empty
                        if (vars.globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                            document.querySelector(UISelectors.navNotifications).textContent = 1;
                            document.querySelector(UISelectors.notifications).classList.remove('disabled');
                        }
                        // Update task number
                        document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
                        // Calculate progress
                        calculateProgress(currToday);
                        // Adjust UI display
                        document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                        // Disable buttons (consider writing function for this!!!)
                        document.querySelector(UISelectors.userNavbar).disabled = false;
                        document.querySelector(UISelectors.lDayArrow).disabled = false;
                        document.querySelector(UISelectors.rDayArrow).disabled = false;
                        document.querySelector(UISelectors.dayModeView).disabled = false;
                        document.querySelector(UISelectors.weekModeView).disabled = false;
                        document.querySelector(UISelectors.monthModeView).disabled = false;
                        document.querySelector(UISelectors.searchTasks).disabled = false;
                        document.querySelector(UISelectors.addOption).disabled = false;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }
                // Delete all btn
            if (`#${e.target.id}` === UISelectors.deleteBtn) {
                // Get current date
                const today = document.querySelector(UISelectors.dayModeContent).textContent.trim();
                const currToday = format(parse(today, "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy");
                // Get current tasks
                const taskItems = document.querySelectorAll('.tasks .task-item');
                // 
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    // Update firestore
                    FirebaseCtrl.deleteTask(currToday, [], 'ongoing')
                    .then(() => {
                        // Adjust UI
                        Array.from(taskItems).forEach(taskItem => {
                            taskItem.appendChild(UICtrl.createMsg('Task Deleted'));
                            taskItem.classList.add('fade-out');
                            // Remove task from UI
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // Update ongoing tasks
                        vars.globalTasksOngoing[currToday] = [];
                        // Notifications - check if currToday is in pastTaskKeys
                        if (vars.globalPastTaskKeys.includes(currToday)) {
                            const index = vars.globalPastTaskKeys.indexOf(currToday);
                            vars.globalPastTaskKeys.splice(index, 1);
                        }
                        // Notifications - check if pastTasksKeys is empty
                        if (!vars.globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                        }
                        // Update task number
                        document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                        // Calculate progress
                        calculateProgress(currToday);
                        // Adjust UI display
                        document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                        // Disable buttons (consider writing function for this!!!)
                        document.querySelector(UISelectors.userNavbar).disabled = false;
                        document.querySelector(UISelectors.lDayArrow).disabled = false;
                        document.querySelector(UISelectors.rDayArrow).disabled = false;
                        document.querySelector(UISelectors.dayModeView).disabled = false;
                        document.querySelector(UISelectors.weekModeView).disabled = false;
                        document.querySelector(UISelectors.monthModeView).disabled = false;
                        document.querySelector(UISelectors.searchTasks).disabled = false;
                        document.querySelector(UISelectors.addOption).disabled = false;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                } else {
                    // Update firestore
                    FirebaseCtrl.deleteTask(currToday, [], 'completed')
                    .then(() => {
                        // Adjust UI
                        Array.from(taskItems).forEach(taskItem => {
                            taskItem.appendChild(UICtrl.createMsg('Task Deleted'));
                            taskItem.classList.add('fade-out');
                            // Remove task from UI
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // Update completed tasks
                        vars.globalTasksCompleted[currToday] = [];
                        // Update task number
                        document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
                        // Calculate progress
                        calculateProgress(currToday);
                        // Adjust UI display
                        document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                        // Disable buttons (consider writing function for this!!!)
                        document.querySelector(UISelectors.userNavbar).disabled = false;
                        document.querySelector(UISelectors.lDayArrow).disabled = false;
                        document.querySelector(UISelectors.rDayArrow).disabled = false;
                        document.querySelector(UISelectors.dayModeView).disabled = false;
                        document.querySelector(UISelectors.weekModeView).disabled = false;
                        document.querySelector(UISelectors.monthModeView).disabled = false;
                        document.querySelector(UISelectors.searchTasks).disabled = false;
                        document.querySelector(UISelectors.addOption).disabled = false;
                        document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                        document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
                        document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }
                // Pick date wrapper
            if (`#${e.target.id}` === UISelectors.pickDate || document.querySelector(UISelectors.pickDate).contains(e.target)) {
                document.querySelector(UISelectors.pickDateFormWrapper).classList.toggle('pick-date-form-open');
                document.querySelector(UISelectors.dateToasts).innerHTML = '';
                // Disable buttons (consider writing function for this!!!)
                document.querySelector(UISelectors.pickDateTodayBtn).disabled = true;
                document.querySelector(UISelectors.pickDatePickMode).disabled = true;
                if (document.querySelector(UISelectors.pickDateFormWrapper).classList.contains('pick-date-form-open')) {
                    document.querySelector(UISelectors.pickDateTodayBtn).disabled = false;
                    document.querySelector(UISelectors.pickDatePickMode).disabled = false;
                }
            }
                // Pick date mode
            if (`#${e.target.id}` === UISelectors.pickDatePickMode) {
                if (document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode')) {
                    // Render day mode
                    renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.dayModeView).disabled = false;
                    document.querySelector(UISelectors.searchTasks).disabled = true;
                    document.querySelector(UISelectors.pickDate).disabled = false;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
                    // Adjust UI display
                    document.querySelector(UISelectors.tableBody).classList.remove('pick-date-mode');
                    document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-light');
                    document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-danger');
                } else {
                    // Clear table body
                    document.querySelector(UISelectors.tableBody).innerHTML = '';
                    // Render month mode
                    if (document.querySelector('body').classList.contains('month-mode-active')) {
                        // Get current date
                        const day = Number(e.target.childNodes[0].nodeValue);
                        const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                        const year = Number(document.querySelector(UISelectors.
                            monthModeYear).textContent.trim());
                        const currToday = new Date(year, month, day);
                        // 
                        renderMonthModeCalendar(year, month, currToday);
                    } else {
                        renderMonthModeCalendar((new Date()).getFullYear(), (new Date()).getMonth(), new Date());
                    }
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.dayModeView).disabled = true;
                    document.querySelector(UISelectors.pickDate).disabled = true;
                    // Adjust UI display
                    document.querySelector(UISelectors.tableBody).classList.add('pick-date-mode');
                    document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-light');
                    document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-danger');
                }
            }
                // Pick date today btn
            if (`#${e.target.id}` === UISelectors.pickDateTodayBtn) {
                // Check if max number of day toasts is reached
                if (Array.from(document.querySelector(UISelectors.dateToasts).children).length >= Number(document.querySelector(`${UISelectors.toastBtns}.toast-active`).textContent.trim())) {
                    // Show alert
                    document.querySelector(UISelectors.toastMsgWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 1;
                    document.querySelector('body').style.overflow = 'hidden';
                } else {
                    // Check if current day toast is unique
                    const selector = format(new Date(), "d'-'MMM'-'yyyy");
                    if (!Array.from(document.querySelector(UISelectors.dateToasts).children).filter((todayToast) => todayToast.id === selector).length) {
                        // Add day toast
                        UICtrl.addToast(format(new Date(), "d'-'MMM'-'yyyy"), selector);
                        $('.toast').toast('show');
                    }
                }
            }
                // Add day in pick mode
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



            
            
            
            
            
            
            
            
            
            
            // Search tasks
            if (`#${e.target.id}` === UISelectors.searchTasks || document.querySelector(UISelectors.searchTasks).contains(e.target)) {
                document.querySelector(UISelectors.searchFormWrapper).classList.toggle('search-form-open');
                // Disable buttons (consider writing function for this!!!)
                document.querySelector(UISelectors.userNavbar).disabled = false;
                document.querySelector(UISelectors.weekModeView).disabled = false;
                document.querySelector(UISelectors.monthModeView).disabled = false;
                document.querySelector(UISelectors.searchForm).searchInput.disabled = true;
                document.querySelector(UISelectors.addOption).disabled = false;
                document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    // Disable buttons (consider writing function for this!!!)
                    document.querySelector(UISelectors.userNavbar).disabled = true;
                    document.querySelector(UISelectors.weekModeView).disabled = true;
                    document.querySelector(UISelectors.monthModeView).disabled = true;
                    document.querySelector(UISelectors.searchForm).searchInput.disabled = false;
                    document.querySelector(UISelectors.addOption).disabled = true;
                    document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
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












            // kiedy otwierasz settings & log out wrapper - ustaw tabindex loop !!! -- pozniej
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
                FirebaseCtrl.updateUser(vars.globalUser, 'theme', e.target.id);
                // vars.globalUser.theme = e.target.id;
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
                    FirebaseCtrl.updateUser(vars.globalUser, 'avatar', e.target.id);
                    // vars.globalUser.theme = e.target.id;
                    //
                    document.querySelector(UISelectors.userAvatar).setAttribute('class', e.target.firstElementChild.classList.value);
                    document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                }
                if (e.target.classList.contains('fas')) {
                    UICtrl.chooseAvatar(e.target.parentElement.id);
                    // Update db & global data
                    FirebaseCtrl.updateUser(vars.globalUser, 'avatar', e.target.parentElement.id);
                    // vars.globalUser.theme = e.target.id;
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
                FirebaseCtrl.updateUser(vars.globalUser, 'toast', e.target.id);
                // vars.globalUser.theme = e.target.id;
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
                    vars.globalPastTaskKeys = checkPastOngoingTasks(vars.globalTasksOngoing);
                }
            }
            // Alert append btn
            if (`#${e.target.id}` === UISelectors.alertAppendBtn) {
                let allPastTasks = [];
                vars.globalPastTaskKeys.forEach(key => {
                    allPastTasks = allPastTasks.concat(vars.globalTasksOngoing[key]);
                    // 
                    FirebaseCtrl.deleteField(key, 'ongoing')
                    .then(() => {
                        // Update globalTasks
                        vars.globalTasksOngoing[key] = [];
                    })
                    .catch(err => {
                        console.log(err);
                    });
                });
                if (vars.globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")] !== undefined && vars.globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")].length) {
                    allPastTasks = allPastTasks.concat(vars.globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")]);
                }
                FirebaseCtrl.updateTasks2(vars.globalUser, format(new Date(), "d'-'MMM'-'yyyy"), allPastTasks);
                // Update globaltasks
                vars.globalTasksOngoing[format(new Date(), "d'-'MMM'-'yyyy")] = allPastTasks;
                // 
                renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                // Calculate progress
                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                // Update notifications
                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                document.querySelector(UISelectors.navNotifications).textContent = '';
                document.querySelector(UISelectors.notifications).classList.add('disabled');
                // Update globalPastTasks
                vars.globalPastTaskKeys = [];
                // Update UI
                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
            }
            // Alert complete btn
            if (`#${e.target.id}` === UISelectors.alertCompleteBtn) {
                vars.globalPastTaskKeys.forEach(key => {
                    // 
                    if (vars.globalTasksOngoing[key].length > 1) {
                        let taskToAppend = vars.globalTasksOngoing[key];
                        if (!(vars.globalTasksCompleted[key] === undefined)) {
                            taskToAppend = taskToAppend.concat(vars.globalTasksCompleted[key]);
                        }
                        FirebaseCtrl.markAsCompleted(key, [], taskToAppend, false)
                        .then(() => {
                            // Update globalTasks
                            if (vars.globalTasksCompleted[key] === undefined) {
                                vars.globalTasksCompleted[key] = vars.globalTasksOngoing[key];
                            } else {
                                vars.globalTasksCompleted[key] = vars.globalTasksCompleted[key].concat(vars.globalTasksOngoing[key]);
                            }
                            vars.globalTasksOngoing[key] = [];
                            renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                            // Calculate progress
                            calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                            // Update notifications
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                            // Update globalPastTasks
                            vars.globalPastTaskKeys = [];
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
                        FirebaseCtrl.markAsCompleted(key, [], vars.globalTasksOngoing[key][0])
                        .then(() => {
                            // Update globalTasks
                            if (vars.globalTasksCompleted[key] === undefined) {
                                vars.globalTasksCompleted[key] = vars.globalTasksOngoing[key];
                            } else {
                                vars.globalTasksCompleted[key] = vars.globalTasksCompleted[key].concat(vars.globalTasksOngoing[key]);
                            }
                            vars.globalTasksOngoing[key] = [];
                            renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                            // Calculate progress
                            calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                            // Update notifications
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                            // Update globalPastTasks
                            vars.globalPastTaskKeys = [];
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
                vars.globalPastTaskKeys.forEach(key => {
                    // 
                    FirebaseCtrl.deleteField(key, 'ongoing')
                    .then(() => {
                        // Update globalTasks
                        vars.globalTasksOngoing[key] = [];
                    })
                    .catch(err => {
                        console.log(err);
                    });
                });
                // 
                renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
                // Calculate progress
                calculateProgress(format(new Date(), "d'-'MMM'-'yyyy"));
                // Update notifications
                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                document.querySelector(UISelectors.navNotifications).textContent = '';
                document.querySelector(UISelectors.notifications).classList.add('disabled');
                // Update globalPastTasks
                vars.globalPastTaskKeys = [];
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
                    if (!vars.globalPastTaskKeys.includes(currToday)) {
                        vars.globalPastTaskKeys.push(currToday);
                    }
                }
                // Check if pastTasksKeys is empty
                if (vars.globalPastTaskKeys.length) {
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
                            if (!vars.globalPastTaskKeys.includes(dayToast.id)) {
                                vars.globalPastTaskKeys.push(dayToast.id);
                            }
                        }
                        // Check if pastTasksKeys is empty
                        if (vars.globalPastTaskKeys.length) {
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = 1;
                            document.querySelector(UISelectors.navNotifications).textContent = 1;
                            document.querySelector(UISelectors.notifications).classList.remove('disabled');
                        }
                        // 
                        FirebaseCtrl.updateTasks(vars.globalUser, dayToast.id, task)
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
                            if (vars.globalTasksOngoing[dayToast.id] === undefined) {
                                vars.globalTasksOngoing[dayToast.id] = task;
                            } else {
                                vars.globalTasksOngoing[dayToast.id].push(task);
                            }
                            console.log(vars.globalTasksOngoing);
                            // 
                            renderDayModeCalendar(new Date(), vars.globalTasksOngoing, vars.globalUser, FirebaseCtrl.updateTasks2);
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
        //  FirebaseCtrl.tasksOnSnapshot(vars.globalUser);
    }

    

    const setUI = function(user, data) {
        // Set global user
        vars.globalUser = user;
        // 
        if (user) { // user logged in
            // Adjust loginWrapper
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
            // Show login loader
            UICtrl.createLoginLoader();
            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
            // tu zamiast loginWrapper dodaj jakis inny wrapper z logiem lub tym podobnym, ktory bedzie sie pojawial na poczatku, kiedy aplikacja sie wczytuje
            // 
            // Disable buttons (consider writing function for this!!!)
            document.querySelector(UISelectors.userNavbar).disabled = false;
            document.querySelector(UISelectors.lDayArrow).disabled = false;
            document.querySelector(UISelectors.rDayArrow).disabled = false;
            document.querySelector(UISelectors.dayModeView).disabled = false;
            document.querySelector(UISelectors.weekModeView).disabled = false;
            document.querySelector(UISelectors.monthModeView).disabled = false;
            document.querySelector(UISelectors.searchTasks).disabled = false;
            // document.querySelector(UISelectors.searchForm).searchInput.disabled = true;
            document.querySelector(UISelectors.addOption).disabled = false;
            // document.querySelector(UISelectors.addForm).add.disabled = true;
            // document.querySelector(UISelectors.pickDate).disabled = false;
            // document.querySelector(UISelectors.addForm).submit.disabled = false;
            // document.querySelector(UISelectors.pickDateTodayBtn).disabled = false;
            // document.querySelector(UISelectors.pickDatePickMode).disabled = false;
            document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
            // document.querySelector(UISelectors.markAsBtn).disabled = false;
            // document.querySelector(UISelectors.deleteBtn).disabled = false;
            // document.querySelector(UISelectors.deselectBtn).disabled = false;
            document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
            document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
            // 
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
                    vars.globalPastTaskKeys = checkPastOngoingTasks(vars.globalTasksOngoing);
                    deletePastOngoingTasks(vars.globalTasksOngoing);
                    deletePastCompletedTasks(vars.globalTasksCompleted);
                    // Add event listeners
                    console.log(vars.globalPastTaskKeys);
                    
                }, 1000)
            }, 2000);
        } else { // user logged out
            // Adjust loginWrapper
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
            // Show login loader
            UICtrl.createLoginLoader();
            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginMainDiv).offsetHeight + 'px';
            // 
            UICtrl.chooseTheme('theme-1');

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
        // checkPastOngoingTasks(vars.globalTasksOngoing);
        // deletePastOngoingTasks(vars.globalTasksOngoing);
        // deletePastCompletedTasks(vars.globalTasksCompleted);
    }

    const renderDayModeCalendar = function(currToday, tasks, user, setTasks, ongoing = true) {
        // Set global tasks
        if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
            vars.globalTasksOngoing = tasks;
        } else {
            vars.globalTasksCompleted = tasks;
        }
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
            // this is when day mode is clicked after week mode or month mode is active
            // Disable buttons (consider writing function for this!!!)
            document.querySelector(UISelectors.lDayArrow).disabled = false;
            document.querySelector(UISelectors.rDayArrow).disabled = false;
            document.querySelector(UISelectors.lWeekArrow).disabled = true;
            document.querySelector(UISelectors.rWeekArrow).disabled = true;
            document.querySelector(UISelectors.lMonthArrow).disabled = true;
            document.querySelector(UISelectors.monthModeMonth).disabled = true;
            document.querySelector(UISelectors.rMonthArrow).disabled = true;
            document.querySelector(UISelectors.searchTasks).disabled = false;
            document.querySelector(UISelectors.addOption).disabled = false;
            document.querySelector(UISelectors.moreOptionsBtn).disabled = false;
            document.querySelector(UISelectors.taskTabsOngoing).disabled = false;
            document.querySelector(UISelectors.taskTabsCompleted).disabled = false;
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
                document.querySelector(UISelectors.searchForm).searchInput.classList.add('disabled');
            } else {
                document.querySelector(UISelectors.searchForm).searchInput.classList.remove('disabled');
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
        if (!document.querySelector(UISelectors.mainOptionsBtns).classList.contains('hide')) {
            document.querySelector(UISelectors.mainOptionsBtns).classList.add('hide');
            document.querySelector(UISelectors.taskTabs).classList.add('hide');
        }
        // Disable buttons (consider writing function for this!!!)
        document.querySelector(UISelectors.lDayArrow).disabled = true;
        document.querySelector(UISelectors.rDayArrow).disabled = true;
        document.querySelector(UISelectors.lWeekArrow).disabled = false;
        document.querySelector(UISelectors.rWeekArrow).disabled = false;
        document.querySelector(UISelectors.lMonthArrow).disabled = true;
        document.querySelector(UISelectors.monthModeMonth).disabled = true;
        document.querySelector(UISelectors.rMonthArrow).disabled = true;
        document.querySelector(UISelectors.searchTasks).disabled = true;
        document.querySelector(UISelectors.addOption).disabled = true;
        document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
        document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
        document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
        // You're disabling it earlier - consider deleting...
        document.querySelector(UISelectors.searchFormWrapper).classList.remove('search-form-open');
        document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
        // Generate correct week
        const firstDayNextWeek = addWeeks(currFirstDayOfWeek, 1);
        const week = eachDayOfInterval({
            start: currFirstDayOfWeek,
            end: subDays(firstDayNextWeek, 1)
        });
        // Adjust table body & header
        UICtrl.setTableBodyHead(false);
        // Generate week template
        console.log('renderWeekMode');
        UICtrl.generateWeekTemplate(currFirstDayOfWeek, firstDayNextWeek, week, vars.globalTasksOngoing);
    }
    const renderMonthModeCalendar = function(year, month, today) {
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
        }
        // Disable forms & buttons
        // Disable buttons (consider writing function for this!!!)
        document.querySelector(UISelectors.lDayArrow).disabled = true;
        document.querySelector(UISelectors.rDayArrow).disabled = true;
        document.querySelector(UISelectors.lWeekArrow).disabled = true;
        document.querySelector(UISelectors.rWeekArrow).disabled = true;
        document.querySelector(UISelectors.lMonthArrow).disabled = false;
        document.querySelector(UISelectors.monthModeMonth).disabled = false;
        document.querySelector(UISelectors.rMonthArrow).disabled = false;
        document.querySelector(UISelectors.searchTasks).disabled = true;
        document.querySelector(UISelectors.addOption).disabled = true;
        document.querySelector(UISelectors.moreOptionsBtn).disabled = true;
        document.querySelector(UISelectors.taskTabsOngoing).disabled = true;
        document.querySelector(UISelectors.taskTabsCompleted).disabled = true;
        // Adjust current date
        document.querySelector(UISelectors.monthModeMonth).options[month].selected = true;
        document.querySelector(UISelectors.monthModeYear).textContent = year;
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
		// Render calendar
		let i = 0;
		while (flag >= 0) {
			let row = document.createElement('tr');
			for (let j = 0; j < 7; j++) {
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
                    if (vars.globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")] !== undefined && vars.globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length) {
                        td = UICtrl.addBadge(td, vars.globalTasksOngoing[format(new Date(year, month, renderDaysNumCurrMonth), "d'-'MMM'-'yyyy")].length);
                    }
					// Append day
					row.append(td);
					renderDaysNumCurrMonth++;
				}
            }
            // Append week
            document.querySelector(UISelectors.tableBody).append(row);
            // Set month mode active
			document.querySelector('body').setAttribute('class', 'month-mode-active');
			i++;
		}
		// Enable/disable left month arrow
		if (document.querySelector(UISelectors.monthModeMonth).selectedIndex === subDays(today, 30).getMonth() && (new Date()).getFullYear() === Number(document.querySelector(UISelectors.monthModeYear).textContent.trim())) {
			document.querySelector(UISelectors.lMonthArrow).disabled = true;
		} else { document.querySelector(UISelectors.lMonthArrow).disabled = false }
    }

    const calculateProgress = function(currToday) {
        const progressBar = document.querySelector(UISelectors.taskProgress).firstElementChild.firstElementChild;
        let ongoingNum = 0;
        let completedNum = 0;
        if (!(vars.globalTasksOngoing[currToday] === undefined)) {
            ongoingNum = vars.globalTasksOngoing[currToday].length;
        }
        if (!(vars.globalTasksCompleted[currToday] === undefined)) {
            completedNum = vars.globalTasksCompleted[currToday].length;
        }
        let completePerCent = 0;
        if (!(ongoingNum === 0 && completedNum === 0)) {
            completePerCent = Number(Math.ceil(completedNum / (completedNum + ongoingNum) * 100).toFixed());
        }
        progressBar.firstElementChild.style.width = completePerCent + '%';
        progressBar.firstElementChild.innerHTML = 'Progress: ' + completePerCent * 1 + '%';
    };

    const setCompletedTasks = function(tasks) {
        vars.globalTasksCompleted = tasks;
        console.log('setCompletedTasks');
        console.log(vars.globalTasksCompleted);
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
                    vars.globalTasksOngoing[key] = [];
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
                    vars.globalTasksCompleted[key] = [];
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
            // Set listener for authentication change
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
})(UICtrl, DataCtrl, DnDCtrl, FirebaseCtrl);
// Initialize app controller
AppCtrl.init();