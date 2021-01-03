import './css/style.css';
import UICtrl from './js/UICtrl';
import DataCtrl from './js/DataCtrl';
import FirebaseCtrl from './js/FirebaseCtrl';
import { format, parse, subDays, addDays, startOfWeek } from 'date-fns';
import boostrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
// App Controller
const AppCtrl = (function(UICtrl, DataCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Initialize global variables
    const vars = {
        globalUser: '',
        globalTasksOngoing: [],
        globalTasksCompleted: [],
        startTask: '',
        globalPastTaskKeys: []
    }
    // Load event listeners
    const loadEventListeners = function() {
        // UI event listeners
        document.querySelector('body').addEventListener('click', e => {
            // Add user - sign up & log in using firebase
            if (`#${e.target.id}` === UISelectors.addUserBtn || document.querySelector(UISelectors.addUserBtn).contains(e.target)) {
                // Handle tabindex
                UICtrl.handleTabindex(UISelectors.loginMainDiv, "-1");
                // Create add user mode
                UICtrl.createAddMode();
                // Adjust UI
                setTimeout(() => {
                    document.querySelector(UISelectors.loginMainDiv).classList.add('move-y-up');
                    document.querySelector(UISelectors.loginAddMode).classList.add('move-y-zero');
                    setTimeout(() => {
                        if (window.screen.orientation.angle === 90) {
                            document.querySelector('body').style.overflow = 'scroll';
                            document.querySelector(UISelectors.loginWrapper).style.overflow = 'auto';
                            document.querySelector(UISelectors.loginAddMode).parentElement.style.overflow = 'initial';
                        } else {
                            document.querySelector('body').style.overflow = 'hidden';
                        }
                        document.querySelector(UISelectors.username).select();
                        document.querySelector(UISelectors.email).removeAttribute('tabindex');
                        document.querySelector(UISelectors.password).removeAttribute('tabindex');
                    }, 300);
                }, 100)
                // Validate username, email & password
                const errorPara = document.querySelector(UISelectors.errorPara);
                Array.from(document.querySelectorAll('.login-wrapper input'))
                .forEach(input => {
                    input.addEventListener('keyup', e => {
                        DataCtrl.validate(e.target);
                        if (input.id === 'password' && input.classList.contains('invalid')) {
                            errorPara.classList.remove('hide');
                            errorPara.innerHTML = 'Must be at least 8 chars long (include at least one capital letter, one number and one special char).'
                        } else if (input.id === 'email' && input.classList.contains('invalid')) {
                            errorPara.classList.remove('hide');
                            errorPara.innerHTML = 'Must be a valid email format'
                        } else {
                            errorPara.classList.add('hide');
                            errorPara.innerHTML = '';
                        }
                        UICtrl.enableDisableCreateBtn();
                    })
                    input.addEventListener('blur', e => {
                        DataCtrl.validate(e.target);
                        errorPara.classList.add('hide');
                        errorPara.innerHTML = '';
                        UICtrl.enableDisableCreateBtn();
                    })
                });
                // Go Back from add user
                document.querySelector(UISelectors.addBackBtn)
                .addEventListener('click', () => {
                    if (window.screen.orientation.angle === 90) {
                        document.querySelector('body').style.overflow = 'hidden';
                        document.querySelector(UISelectors.loginWrapper).style.overflow = 'hidden';
                        document.querySelector(UISelectors.loginAddMode).parentElement.style.overflow = 'hidden';
                    } else {
                        document.querySelector('body').style.overflow = 'hidden';
                    }
                    // Handle tabindex
                    UICtrl.handleTabindex(UISelectors.loginMainDiv, "0");
                    // Adjust UI display
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
                    const currToday = format(new Date(), "d'-'MMM'-'yyyy");
                    if (DataCtrl.validate(username) && DataCtrl.validate(email) && DataCtrl.validate(pass)) { // YES
                        // Create and store new user in Firebase
                        const user = {
                            name: username.value,
                            avatar: 'avatar-1',
                            theme: 'theme-1',
                            toast: 'toast-change-1'
                        }
                        FirebaseCtrl.signUp(currToday, email.value, pass.value, user)
                        .then(() => {
                            // Adjust UI display
                            document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero'); 
                            document.querySelector(UISelectors.loginAddMode).classList.add('move-y-up');
                            setTimeout(() => {
                                // Adjust UI
                                document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                                document.querySelector(UISelectors.loginAddMode).remove();
                                // Set theme, avatar & toasts
                                UICtrl.chooseTheme(user.theme);
                                UICtrl.chooseAvatar(user.avatar);
                                UICtrl.chooseToast(user.toast);
                                // Calculate progress
                                calculateProgress(new Date());
                                // Adjust UI
                                setTimeout(() => {
                                    document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                                    document.querySelector('body').style.overflow = 'auto';
                                    // Set vars on welcome page
                                    document.querySelector(UISelectors.welcomeHeader).textContent = user.name;
                                    document.querySelector(UISelectors.leadTodayDate).textContent = format(new Date(), "do 'of' MMMM yyyy");
                                }, 2000);
                            }, 2000);
                            // 
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
                    e.preventDefault();
                })
            }
            // Log in
            if (`#${e.target.id}` === UISelectors.loginBtn || document.querySelector(UISelectors.loginBtn).contains(e.target)) {
                // Handle tabindex
                UICtrl.handleTabindex(UISelectors.loginMainDiv, "-1");
                // Create log in mode
                UICtrl.createLogInMode();
                // Adjust UI
                setTimeout(() => {
                    document.querySelector(UISelectors.loginMainDiv).classList.add('move-x-left');
                    document.querySelector(UISelectors.logInConfirmMode).classList.add('move-x-zero');
                    setTimeout(() => {
                        if (window.screen.orientation.angle === 90) {
                            document.querySelector('body').style.overflow = 'scroll';
                            document.querySelector(UISelectors.loginWrapper).style.overflow = 'auto';
                            document.querySelector(UISelectors.logInConfirmMode).parentElement.style.overflow = 'initial';
                        } else {
                            document.querySelector('body').style.overflow = 'hidden';
                        }
                        document.querySelector(UISelectors.email).select();
                    }, 300);
                }, 100)
                // Go back from user log in
                document.querySelector(UISelectors.logInConfirmBackBtn).addEventListener('click', () => {
                    if (window.screen.orientation.angle === 90) {
                        document.querySelector('body').style.overflow = 'hidden';
                        document.querySelector(UISelectors.loginWrapper).style.overflow = 'hidden';
                        document.querySelector(UISelectors.logInConfirmMode).parentElement.style.overflow = 'hidden';
                    } else {
                        document.querySelector('body').style.overflow = 'hidden';
                    }
                    // Handle tabindex
                    UICtrl.handleTabindex(UISelectors.loginMainDiv, "0");
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
                    .then(() => {
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
                        // Show message toast
                        UICtrl.addMsgToast("mainDivMsg", '', 'Logged out successfully.', 'status', 'polite', true, 2000, 'toast-status');
                        // Handle buttons
                        UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "lWeekArrow", "rWeekArrow", "lMonthArrow", "rMonthArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "pickDate", "addForm", "pickDateTodayBtn", "pickDatePickMode", "moreOptionsBtn", "markAsBtn", "deleteBtn", "deselectBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                        setTimeout(() => {
                            // Adjust UI
                            document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                            setTimeout(() => {
                                document.querySelector(UISelectors.welcomeHeader).textContent = '';
                                document.querySelector(UISelectors.leadTodayDate).textContent = '';
                                document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                                // Handle tabindex
                                UICtrl.handleTabindex(UISelectors.loginMainDiv, "0");
                            }, 1000);
                        }, 2000);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("mainDivMsg", '', 'Error: ' + error.message + '. Could not log you out. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
            }
            // Switch to day mode
            if (`#${e.target.id}` === UISelectors.dayModeView) {
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                } else {
                    UICtrl.renderDayModeCalendar(new Date(), setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // Calculate progress
                calculateProgress(new Date());
            }
            // Left arrow in day mode clicked
            if (`#${e.target.id}` === UISelectors.lDayArrow || document.querySelector(UISelectors.lDayArrow).contains(e.target)) {
                // Get correct date
                const prevToday = subDays(UICtrl.retrieveDayDate(), 1);
                let currToday = prevToday;
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    UICtrl.renderDayModeCalendar(currToday, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                } else {
                    UICtrl.renderDayModeCalendar(currToday, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // Calculate progress
                calculateProgress(currToday);
            }
            // Right arrow in day mode clicked
            if (`#${e.target.id}` === UISelectors.rDayArrow || document.querySelector(UISelectors.rDayArrow).contains(e.target)) {
                // Get correct date
                const nextToday = addDays(UICtrl.retrieveDayDate(), 1);
                let currToday = nextToday;
                // Render day mode
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    UICtrl.renderDayModeCalendar(currToday, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                } else {
                    UICtrl.renderDayModeCalendar(currToday, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                }
                // Clear search string
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    document.querySelector(UISelectors.searchForm).searchInput.value = '';
                }
                // Calculate progress
                calculateProgress(currToday);
            }
            // Switch to week mode
            if (`#${e.target.id}` === UISelectors.weekModeView) {
                // Get correct week
                const currFirstDayOfWeek = startOfWeek(UICtrl.retrieveDayDate());
                // Render week mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, []);
                } else {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, vars.globalTasksOngoing);
                }
            }
            // Left arrow in week mode clicked
            if (`#${e.target.id}` === UISelectors.lWeekArrow || document.querySelector(UISelectors.lWeekArrow).contains(e.target)) {
                // Get correct week
                const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                const currFirstDayOfWeek = subDays(startOfWeek(today), 7);
                // Render week mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, []);
                } else {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, vars.globalTasksOngoing);
                }
            }
            // Right arrow in week mode clicked
            if (`#${e.target.id}` === UISelectors.rWeekArrow || document.querySelector(UISelectors.rWeekArrow).contains(e.target)) {
                // Get correct week
                const currWeekContent = document.querySelector(UISelectors.weekModeContent).textContent.trim().split(' - ');
                let today = parse(currWeekContent[0], "d MMMM yyyy", new Date());
                const currFirstDayOfWeek = addDays(startOfWeek(today), 7);
                // Render week mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, []);
                } else {
                    UICtrl.renderWeekModeCalendar(currFirstDayOfWeek, vars.globalTasksOngoing);
                }
            }
            // Switch to month mode
            if (`#${e.target.id}` === UISelectors.monthModeView) {
                // Get current today
                const today = new Date();
                // Render month mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderMonthModeCalendar(today.getFullYear(), today.getMonth(), today, []);
                } else {
                    UICtrl.renderMonthModeCalendar(today.getFullYear(), today.getMonth(), today, vars.globalTasksOngoing);
                }
                // Change month in month mode
                document.querySelector(UISelectors.monthModeMonth).addEventListener('change', e => {
                    // Render month mode
                    if (vars.globalTasksOngoing === undefined) {
                        UICtrl.renderMonthModeCalendar(Number(document.querySelector(UISelectors.monthModeYear).textContent), e.target.selectedIndex, today, []);
                    } else {
                        UICtrl.renderMonthModeCalendar(Number(document.querySelector(UISelectors.monthModeYear).textContent), e.target.selectedIndex, today, vars.globalTasksOngoing);
                    }
                });
            }
            // Left arrow in month mode clicked
            if (`#${e.target.id}` === UISelectors.lMonthArrow || document.querySelector(UISelectors.lMonthArrow).contains(e.target)) {
                // Get current year, month
                let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex - 1;
                if (month === -1) {
                    month = 11;
                    year--;
                }
                // Render month mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderMonthModeCalendar(year, month, new Date(), []);
                } else {
                    UICtrl.renderMonthModeCalendar(year, month, new Date(), vars.globalTasksOngoing);
                }
            }
            // Right arrow in month mode clicked
            if (`#${e.target.id}` === UISelectors.rMonthArrow || document.querySelector(UISelectors.rMonthArrow).contains(e.target)) {
                // Get current year, month
                let year = Number(document.querySelector(UISelectors.monthModeYear).textContent);
                let month = document.querySelector(UISelectors.monthModeMonth).selectedIndex + 1;
                if (month === 12) {
                    month = 0;
                    year++;
                }
                // Render month mode
                if (vars.globalTasksOngoing === undefined) {
                    UICtrl.renderMonthModeCalendar(year, month, new Date(), []);
                } else {
                    UICtrl.renderMonthModeCalendar(year, month, new Date(), vars.globalTasksOngoing);
                }
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
                        UICtrl.renderDayModeCalendar(currToday, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                        // Calculate progress
                        calculateProgress(currToday);
                    }
                } else if (document.querySelector('body').classList.contains('week-mode-active')) {
                    if (!e.target.classList.contains('disabled') && !e.target.classList.contains('invalid-day')) {
                        // Get current date
                        const day = e.target.childNodes[0].nodeValue;
                        const currToday = parse(day, "d MMM", new Date());
                        // Render day mode
                        UICtrl.renderDayModeCalendar(currToday, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                        // Calculate progress
                        calculateProgress(currToday);
                    }
                }
            }
            // Switch to ongoing tasks
            if (`#${e.target.id}` === UISelectors.taskTabsOngoing) {
                if (!e.target.classList.contains('active')) {
                    // Get current date
                    let currToday = UICtrl.retrieveDayDate();
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
                    UICtrl.renderDayModeCalendar(currToday, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                }
            }
            // Switch to completed tasks
            if (`#${e.target.id}` === UISelectors.taskTabsCompleted) {
                if (!e.target.classList.contains('active')) {
                    // Get current date
                    let currToday = UICtrl.retrieveDayDate();
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
                    UICtrl.renderDayModeCalendar(currToday, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                }
            }
            // Task-related event listeners
                // Add task wrapper
            if (`#${e.target.id}` === UISelectors.addOption || document.querySelector(UISelectors.addOption).contains(e.target)) {
                document.querySelector(UISelectors.addFormWrapper).classList.toggle('add-form-open');
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["pickDate", "pickDateTodayBtn", "pickDatePickMode", "addTaskInput", "addTaskSubmit"]);
                UICtrl.handleDisabledStateBtn(["userNavbar", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                // Add task form is inactive
                document.querySelector(UISelectors.addOption).classList.remove('active');
                // 
                if (document.querySelector(UISelectors.addFormWrapper).classList.contains('add-form-open')) {
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                    UICtrl.handleDisabledStateBtn(["pickDate", "addTaskInput", "addTaskSubmit",], false);
                    document.querySelector(UISelectors.addFormInputs).focus();
                    document.querySelector(UISelectors.addFormInputs).select();
                    // Add task form is active
                    document.querySelector(UISelectors.addOption).classList.add('active');
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
                    const date = UICtrl.retrieveDayDate();
                    const currToday = format(date, "d'-'MMM'-'yyyy");
                    // Store deleted task
                    const taskDeleted = e.target.parentElement.parentElement.textContent.trim();
                    // Get all tasks
                    const tasks = document.querySelectorAll('.tasks .task-item');
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
                        FirebaseCtrl.deleteSingleTask(currToday, allTasks, 'ongoing')
                        .then(() => {
                            // Show message toast
                            UICtrl.addMsgToast("taskDivMsg", '', 'Task deleted successfully.', 'status', 'polite', true, 2000, 'toast-status');
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
                                if (vars.globalPastTaskKeys.includes(currToday) && !vars.globalTasksOngoing[currToday].length) {
                                    const index = vars.globalPastTaskKeys.indexOf(currToday);
                                    vars.globalPastTaskKeys.splice(index, 1);
                                }
                                // Notifications - check if pastTasksKeys is empty
                                if (!vars.globalPastTaskKeys.length) {
                                    document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                    document.querySelector(UISelectors.navNotifications).textContent = '';document.querySelector(UISelectors.navNotifications).style.display = 'none';
                                    document.querySelector(UISelectors.notifications).classList.add('disabled');
                                }
                                // Render day mode
                                UICtrl.renderDayModeCalendar(date, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                                // Calculate progress
                                calculateProgress(date);
                            }, 1000);
                        })
                        .catch(error => {
                            // Show message toast
                            UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not delete task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                        });
                    } else if (document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                        // Delete from firestore
                        FirebaseCtrl.deleteSingleTask(currToday, allTasks, 'completed')
                        .then(() => {
                            // Show message toast
                            UICtrl.addMsgToast("taskDivMsg", '', 'Task deleted successfully.', 'status', 'polite', true, 2000, 'toast-status');
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
                                // Render day mode
                                UICtrl.renderDayModeCalendar(date, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                                // Calculate progress
                                calculateProgress(date);
                            }, 1000);
                        })
                        .catch(error => {
                            // Show message toast
                            UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not delete task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                        });
                    }
                }
            }
                // Edit task
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
                // Add tabindex
                e.target.nextElementSibling.setAttribute('tabindex', '0');
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                // Disable enter btn
                e.target.parentElement.parentElement.firstElementChild.nextElementSibling.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                    }
                });
            }
                // Turn off task editing
            if (e.target.classList.contains('ongoing-edit')) {
                // Get current date
                const currToday = format(UICtrl.retrieveDayDate(), "d'-'MMM'-'yyyy");
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
                FirebaseCtrl.updateAllOngoingTasks(currToday, allTasks)
                .then(() => {
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'Task updated successfully.', 'status', 'polite', true, 2000, 'toast-status');
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
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                    // Update ongoing tasks
                    vars.globalTasksOngoing[currToday] = allTasks;
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not save changes. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
                // Complete task
            if (e.target.classList.contains('uncompleted')) {
                if (
                    !e.target.parentElement.parentElement.lastElementChild.firstElementChild.classList.contains('hide') &&
                    document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')
                ) {
                    // Get current date
                    const date = UICtrl.retrieveDayDate();
                    const currToday = format(date, "d'-'MMM'-'yyyy");
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
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                    // Update firestore
                    FirebaseCtrl.markAs(currToday, allTasks, taskCompleted, ['ongoing', 'completed'])
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Task has been completed.', 'status', 'polite', true, 2000, 'toast-status');
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
                            // Adjust UI display
                            document.querySelector(UISelectors.pickDateFormWrapper).classList.remove('pick-date-form-open');
                            // Get current tasks & reassign task ids
                            const tasks = document.querySelectorAll('.tasks li');
                            [].forEach.call(tasks, (li, index) => {
                                li.id = 'task' + index;
                                li.classList.remove('disabled-li');
                            });
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            if (document.querySelector(UISelectors.addFormWrapper).classList.contains('add-form-open')) {
                                document.querySelector(UISelectors.addFormWrapper).classList.toggle('add-form-open');
                                // Handle buttons
                                UICtrl.handleDisabledStateBtn(["pickDate", "pickDateTodayBtn", "pickDatePickMode", "addTaskInput", "addTaskSubmit"]);
                            }
                            // Update ongoing / completed tasks
                            vars.globalTasksOngoing[currToday] = allTasks;
                            if (vars.globalTasksCompleted === undefined) {
                                vars.globalTasksCompleted = [];
                            }
                            if (vars.globalTasksCompleted[currToday] === undefined) {
                                vars.globalTasksCompleted[currToday] = [];
                            }
                            if (!vars.globalTasksCompleted[currToday].includes(taskCompleted)) {
                                vars.globalTasksCompleted[currToday].push(taskCompleted);
                            }
                            // Notifications
                            checkNotifications(date, currToday);
                            // Update task number
                            document.querySelector(UISelectors.leadTaskNum).textContent = allTasks.length;
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                            // Calculate progress
                            calculateProgress(date);
                        }, 1500);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not complete task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
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
                    const date = UICtrl.retrieveDayDate();
                    const currToday = format(date, "d'-'MMM'-'yyyy");
                    // Store task
                    const taskOngoing = e.target.parentElement.parentElement.textContent.trim();
                    // Get all tasks
                    const tasks = document.querySelectorAll('.tasks li');
                    let allTasks = [];
                    Array.from(tasks).forEach(task => {
                        allTasks.push(task.textContent.trim());
                        task.classList.add('disabled-li');
                    });
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                    const index = allTasks.indexOf(taskOngoing);
                    allTasks.splice(index, 1);
                    // Update firestore
                    FirebaseCtrl.markAs(currToday, allTasks, taskOngoing, ['completed', 'ongoing'])
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Task has been moved to scheduled.', 'status', 'polite', true, 2000, 'toast-status');
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
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            // Update ongoing / completed tasks
                            vars.globalTasksCompleted[currToday] = allTasks;
                            if (vars.globalTasksOngoing[currToday] === undefined) {
                                vars.globalTasksOngoing[currToday] = [];
                            }
                            if (!vars.globalTasksOngoing[currToday].includes(taskOngoing)) {
                                vars.globalTasksOngoing[currToday].push(taskOngoing);
                            }
                            // Notifications
                            const date = parse(currToday, "d'-'MMM'-'yyyy", new Date());
                            checkNotifications(date, currToday, false);
                            // Update task number
                            document.querySelector(UISelectors.leadTaskCompletedNum).textContent = allTasks.length;
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                            // Calculate progress
                            calculateProgress(date);
                        }, 1000);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not move task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
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
                        document.querySelector(UISelectors.markAsBtn).textContent = 'MARK AS COMPLETED';
                    } else {
                        document.querySelector(UISelectors.markAsBtn).textContent = 'MARK AS SCHEDULED';
                    }
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"]);
                    UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"], false);
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been selected.', 'status', 'polite', true, 2000, 'toast-status');
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
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"]);
                // Show message toast
                UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been deselected.', 'status', 'polite', true, 2000, 'toast-status');
            }
                // Mark as btn
            if (`#${e.target.id}` === UISelectors.markAsBtn) {
                // Get current date
                const date = UICtrl.retrieveDayDate();
                const currToday = format(date, "d'-'MMM'-'yyyy");
                // 
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    // Get current tasks
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    let taskList = [];
                    Array.from(taskItems).forEach(taskItem => {
                        const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                        if (!(vars.globalTasksCompleted[currToday] === undefined)) {
                            if (!vars.globalTasksCompleted[currToday].includes(task)) {
                                taskList.push(task);
                            }
                        } else {
                            taskList.push(task);
                        }
                    });
                    if (!(vars.globalTasksCompleted[currToday] === undefined)) {
                        taskList = vars.globalTasksCompleted[currToday].concat(taskList);
                    }
                    // Update firestore
                    FirebaseCtrl.markAs(currToday, [], taskList, ['ongoing', 'completed'], false)
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been completed.', 'status', 'polite', true, 2000, 'toast-status');
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
                        // Notifications
                        checkNotifications(date, currToday);
                        // Update task number
                        document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                        setTimeout(() => {
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                            // Calculate progress
                            calculateProgress(date);
                            // Adjust UI display
                            document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"]);
                        }, 1500);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not complete selected tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
                } else {
                    // Get current tasks
                    const taskItems = document.querySelectorAll('.tasks .task-item');
                    let taskList = [];
                    Array.from(taskItems).forEach(taskItem => {
                        const task = taskItem.firstElementChild.nextElementSibling.textContent.trim();
                        if (!(vars.globalTasksOngoing[currToday] === undefined)) {
                            if (!vars.globalTasksOngoing[currToday].includes(task)) {
                                taskList.push(task);
                            }
                        } else {
                            taskList.push(task);
                        }
                    });
                    if (!(vars.globalTasksOngoing[currToday] === undefined)) {
                        taskList = vars.globalTasksOngoing[currToday].concat(taskList);
                    }
                    // Update firestore
                    FirebaseCtrl.markAs(currToday, [], taskList, ['completed', 'ongoing'], false)
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been move to scheduled.', 'status', 'polite', true, 2000, 'toast-status');
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
                        checkNotifications(date, currToday, false);
                        // Update task number
                        document.querySelector(UISelectors.leadTaskCompletedNum).textContent = 0;
                        setTimeout(() => {
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                            // Calculate progress
                            calculateProgress(date);
                            // Adjust UI display
                            document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"]);
                        }, 1500);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not move tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
                }
            }
                // Delete all btn
            if (`#${e.target.id}` === UISelectors.deleteBtn) {
                // Get current date
                const date = UICtrl.retrieveDayDate();
                const currToday = format(date, "d'-'MMM'-'yyyy");
                // Get current tasks
                const taskItems = document.querySelectorAll('.tasks .task-item');
                // 
                if (document.querySelector(UISelectors.taskTabsOngoing).classList.contains('active')) {
                    // Update firestore
                    FirebaseCtrl.deleteSingleTask(currToday, [], 'ongoing')
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been deleted.', 'status', 'polite', true, 2000, 'toast-status');
                        // Adjust UI
                        Array.from(taskItems).forEach(taskItem => {
                            taskItem.appendChild(UICtrl.createMsg('Task Deleted'));
                            taskItem.classList.add('fade-out');
                            // Remove task from UI
                            setTimeout(() => { taskItem.remove() }, 1000);
                        });
                        // Update ongoing tasks
                        vars.globalTasksOngoing[currToday] = [];
                        // Notifications
                        checkNotifications(date, currToday);
                        // Update task number
                        document.querySelector(UISelectors.leadTaskNum).textContent = 0;
                        setTimeout(() => {
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                            // Calculate progress
                            calculateProgress(date);
                            // Adjust UI display
                            document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"]);
                        }, 1500);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not delete tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
                } else {
                    // Update firestore
                    FirebaseCtrl.deleteSingleTask(currToday, [], 'completed')
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'All tasks have been deleted.', 'status', 'polite', true, 2000, 'toast-status');
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
                        setTimeout(() => {
                            // Render day mode
                            UICtrl.renderDayModeCalendar(date, setCompletedTasks, vars.globalTasksCompleted, FirebaseCtrl.updateAllCompletedTasks, false);
                            // Calculate progress
                            calculateProgress(date);
                            // Adjust UI display
                            document.querySelector(UISelectors.selectAllOptions).classList.toggle('select-all-options-open');
                            // Handle buttons
                            UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                            UICtrl.handleDisabledStateBtn(["markAsBtn", "deleteBtn", "deselectBtn"]);
                        }, 1500);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not delete tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
                }
            }
                // Pick date wrapper
            if (`#${e.target.id}` === UISelectors.pickDate || document.querySelector(UISelectors.pickDate).contains(e.target)) {
                document.querySelector(UISelectors.pickDateFormWrapper).classList.toggle('pick-date-form-open');
                document.querySelector(UISelectors.dateToasts).innerHTML = '';
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["pickDateTodayBtn", "pickDatePickMode"]);
                if (document.querySelector(UISelectors.pickDateFormWrapper).classList.contains('pick-date-form-open')) {
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["pickDateTodayBtn", "pickDatePickMode"], false);
                }
            }
                // Pick date mode
            if (`#${e.target.id}` === UISelectors.pickDatePickMode) {
                if (document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode')) {
                    // Render day mode
                    UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["searchTasks", "moreOptionsBtn"]);
                    UICtrl.handleDisabledStateBtn(["dayModeView", "pickDate"], false);
                    // Adjust UI display
                    document.querySelector(UISelectors.tableBody).classList.remove('pick-date-mode');
                    document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-light');
                    document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-danger');
                } else {
                    // Render month mode
                    if (document.querySelector('body').classList.contains('month-mode-active')) {
                        // Get current date
                        const day = Number(e.target.childNodes[0].nodeValue);
                        const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                        const year = Number(document.querySelector(UISelectors.
                            monthModeYear).textContent.trim());
                        const currToday = new Date(year, month, day);
                        // Render month mode
                        if (vars.globalTasksOngoing === undefined) {
                            UICtrl.renderMonthModeCalendar(year, month, currToday, []);
                        } else {
                            UICtrl.renderMonthModeCalendar(year, month, currToday, vars.globalTasksOngoing);
                        }
                    } else {
                        // Render month mode
                        if (vars.globalTasksOngoing === undefined) {
                            UICtrl.renderMonthModeCalendar((new Date()).getFullYear(), (new Date()).getMonth(), new Date(), []);
                        } else {
                            UICtrl.renderMonthModeCalendar((new Date()).getFullYear(), (new Date()).getMonth(), new Date(), vars.globalTasksOngoing);
                        }
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
                    // Reset tabindex
                    UICtrl.handleTabindex(UISelectors.focusguardToast, "0", '');
                    // Set focus
                    document.querySelector(UISelectors.focusguardToast1).focus();
                } else {
                    // Check if current day toast is unique
                    const id = format(new Date(), "d'-'MMM'-'yyyy");
                    if (!Array.from(document.querySelector(UISelectors.dateToasts).children).filter(todayToast => todayToast.id === id).length) {
                        // Add day toast
                        UICtrl.addToast("dateToasts", id, format(new Date(), "d'-'MMM'"));
                    }
                }
            }
                // Add day in pick mode
            if (document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && e.target.classList.contains('valid-day')) {
                // Get current date
                const day = Number(e.target.childNodes[0].nodeValue);
                const month = document.querySelector(UISelectors.monthModeMonth).selectedIndex;
                const year = Number(document.querySelector(UISelectors.monthModeYear).textContent.trim());
                const id = format(new Date(year, month, day), "d'-'MMM'-'yyyy");
                // Check if max number of day toasts is reached
                if (Array.from(document.querySelector(UISelectors.dateToasts).children).length >= Number(document.querySelector(`${UISelectors.toastBtns}.toast-active`).textContent.trim())) {
                    // Show alert
                    document.querySelector(UISelectors.toastMsgWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 1;
                    document.querySelector('body').style.overflow = 'hidden';
                    // Reset tabindex
                    UICtrl.handleTabindex(UISelectors.focusguardToast, "0", '');
                    // Set focus
                    document.querySelector(UISelectors.focusguardToast1).focus();
                } else {
                    // Check the current day toast is unique
                    if (!Array.from(document.querySelector(UISelectors.dateToasts).children).filter(todayToast => todayToast.id === id).length) {
                        // Add day toast
                        UICtrl.addToast("dateToasts", id, format(new Date(year, month, day), "d'-'MMM'"));
                    }
                }
            }
                // Search wrapper
            if (`#${e.target.id}` === UISelectors.searchTasks || document.querySelector(UISelectors.searchTasks).contains(e.target)) {
                // Adjust UI display
                document.querySelector(UISelectors.searchFormWrapper).classList.toggle('search-form-open');
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["searchTaskInput"]);
                UICtrl.handleDisabledStateBtn(["userNavbar", "weekModeView", "monthModeView", "addOption", "moreOptionsBtn"], false);
                // Search task form is inactive
                document.querySelector(UISelectors.searchTasks).classList.remove('active');
                // 
                if (document.querySelector(UISelectors.searchFormWrapper).classList.contains('search-form-open')) {
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["searchTaskInput"], false);
                    UICtrl.handleDisabledStateBtn(["userNavbar", "weekModeView", "monthModeView", "addOption", "moreOptionsBtn"]);
                    document.querySelector(UISelectors.searchForm).searchInput.focus();
                    document.querySelector(UISelectors.searchForm).searchInput.select();
                    // Search task form is active
                    document.querySelector(UISelectors.searchTasks).classList.add('active');
                }
                document.querySelector(UISelectors.searchForm).searchInput.value = '';
                // Filter tasks
                const list = document.querySelector(UISelectors.tasks);
                Array.from(list.children).forEach(task => {
                    task.classList.remove('filtered');
                });
            }
            // Helpers
                // Show/hide user password
            if (`.${e.target.className}` === UISelectors.showHidePass) {
                UICtrl.showHidePass(e.target, document.querySelector(UISelectors.password));
            }
                // Delete day toast
            if (e.target.classList.contains('x')) {
                e.target.parentElement.parentElement.parentElement.remove();
            }
                // Day toast message wrapper
            if (`#${e.target.id}` === UISelectors.toastMsgWrapper || `#${e.target.id}` === UISelectors.toastCloseBtn || document.querySelector(UISelectors.toastCloseBtn).contains(e.target)) {
                document.querySelector(UISelectors.toastMsgWrapper).style.display = 'none';
                document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                    UICtrl.handleTabindex(UISelectors.focusguardToast, "-1", '');
                    // Set focus
                    document.querySelector(UISelectors.userNavbar).focus();
            }
                // Notifications in navbar
            if (`#${e.target.id}` === UISelectors.notifications || document.querySelector(UISelectors.notifications).contains(e.target)) {
                if (document.querySelector(UISelectors.notifications).lastElementChild.textContent.length) {
                    vars.globalPastTaskKeys = UICtrl.checkPastOngoingTasks(vars.globalTasksOngoing);
                }
            }
                // Past tasks message wrapper
            if (`#${e.target.id}` === UISelectors.alertCloseBtn || document.querySelector(UISelectors.alertCloseBtn).contains(e.target) || `#${e.target.id}` === UISelectors.alertMsgWrapper) {
                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardPastTask, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
                // Past tasks wrapper - append tasks
            if (`#${e.target.id}` === UISelectors.alertAppendBtn) {
                const today = format(new Date(), "d'-'MMM'-'yyyy");
                let todaysTasks = [];
                if (vars.globalTasksOngoing[today] !== undefined && vars.globalTasksOngoing[today].length) {
                    todaysTasks = vars.globalTasksOngoing[today];
                }
                // Update firestore
                let allPastTasks = [];
                let flag = false;
                vars.globalPastTaskKeys.some(key => {
                    // Make sure there is no duplicates
                    if (todaysTasks.length) {
                        vars.globalTasksOngoing[key].forEach(task => {
                            if (!todaysTasks.includes(task)) {
                                allPastTasks.push(task);
                            }
                        });
                    }
                    // Delete from ongoing collection
                    FirebaseCtrl.deleteAllTasks(key, 'ongoing')
                    .then(() => {
                        // Update globalTasks
                        vars.globalTasksOngoing[key] = [];
                        // Update globalPastTasks
                        vars.globalPastTaskKeys = [];
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("pastTasksDivMsg", '', 'Error: ' + error.message + '. Could not append tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                        flag = true;
                        return flag;
                    });
                });
                if (!flag) {
                    if (vars.globalTasksOngoing[today] !== undefined && vars.globalTasksOngoing[today].length) {
                        allPastTasks = vars.globalTasksOngoing[today].concat(allPastTasks);
                    }
                    FirebaseCtrl.updateAllOngoingTasks(today, allPastTasks)
                    .then(() => {
                        // Show message toast
                        UICtrl.addMsgToast("pastTasksDivMsg", '', 'Past tasks have been appended.', 'status', 'polite', true, 2000, 'toast-status');
                        // Update globaltasks
                        vars.globalTasksOngoing[today] = allPastTasks;
                        setTimeout(() => {
                            // Update notifications
                            document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                            document.querySelector(UISelectors.navNotifications).textContent = '';
                            document.querySelector(UISelectors.navNotifications).style.display = 'none';
                            document.querySelector(UISelectors.notifications).classList.add('disabled');
                            // Close alert wrapper
                            document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                            document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                            document.querySelector('body').style.overflow = 'auto';
                            document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                            // Render day mode
                            UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                            // Calculate progress
                            calculateProgress(new Date());
                        }, 2000);
                    })
                    .catch(error => {
                        // Show message toast
                        UICtrl.addMsgToast("pastTasksDivMsg", '', 'Error: ' + error.message + '. Could not append tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    });
                }
            }
                // Past tasks wrapper - complete tasks
            if (`#${e.target.id}` === UISelectors.alertCompleteBtn) {
                vars.globalPastTaskKeys.some((key, index) => {
                    // Get tasks
                    let allDayTasks = vars.globalTasksOngoing[key];
                    // Check for duplicates
                    let tasksToComplete = [];
                    allDayTasks.forEach(task => {
                        if (!(vars.globalTasksCompleted[key] === undefined)) {
                            if (!vars.globalTasksCompleted[key].includes(task)) {
                                tasksToComplete.push(task);
                            }
                        } else {
                            tasksToComplete.push(task);
                        }
                    });
                    // Check if there are any completed tasks
                    if (!(vars.globalTasksCompleted[key] === undefined)) {
                        tasksToComplete = vars.globalTasksCompleted[key].concat(tasksToComplete);
                    }
                    // Update firestore
                    if (index === (vars.globalPastTaskKeys.length - 1)) {
                        FirebaseCtrl.markAs(key, [], tasksToComplete, ['ongoing', 'completed'], false)
                        .then(() => {
                            // Show message toast
                            UICtrl.addMsgToast("pastTasksDivMsg", '', 'Past tasks have been completed.', 'status', 'polite', true, 2000, 'toast-status');
                            // Update ongoing / completed tasks
                            vars.globalTasksOngoing[key] = [];
                            vars.globalTasksCompleted[key] = tasksToComplete;
                            // Update globalPastTasks
                            const index = vars.globalPastTaskKeys.indexOf(key);
                            vars.globalPastTaskKeys.splice(index, 1);
                            setTimeout(() => {
                                // Update notifications
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.navNotifications).style.display = 'none';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                                // Adjust UI display
                                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                                document.querySelector('body').style.overflow = 'auto';
                                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                                // Render day mode
                                UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                                // Calculate progress
                                calculateProgress(new Date());
                            }, 2000);
                        })
                        .catch(error => {
                            // Show message toast
                            UICtrl.addMsgToast("pastTasksDivMsg", '', 'Error: ' + error.message + '. Could not complete tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                        });
                    } else {
                        FirebaseCtrl.markAs(key, [], tasksToComplete, ['ongoing', 'completed'], false)
                        .then(() => {
                            // Update ongoing / completed tasks
                            vars.globalTasksOngoing[key] = [];
                            vars.globalTasksCompleted[key] = tasksToComplete;
                            // Update globalPastTasks
                            const index = vars.globalPastTaskKeys.indexOf(key);
                            vars.globalPastTaskKeys.splice(index, 1);
                        });
                    }
                });
            }
                // Past tasks wrapper - delete tasks
            if (`#${e.target.id}` === UISelectors.alertDisposeBtn) {
                vars.globalPastTaskKeys.some((key, index) => {
                    // Update firestore
                    if (index === (vars.globalPastTaskKeys.length - 1)) {
                        FirebaseCtrl.deleteAllTasks(key, 'ongoing')
                        .then(() => {
                            // Show message toast
                            UICtrl.addMsgToast("pastTasksDivMsg", '', 'Past tasks have been deleted.', 'status', 'polite', true, 2000, 'toast-status');
                            // Update globalTasks
                            vars.globalTasksOngoing[key] = [];
                            // Update globalPastTasks
                            const index = vars.globalPastTaskKeys.indexOf(key);
                            vars.globalPastTaskKeys.splice(index, 1);
                            setTimeout(() => {
                                // Update notifications
                                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                                document.querySelector(UISelectors.navNotifications).textContent = '';
                                document.querySelector(UISelectors.navNotifications).style.display = 'none';
                                document.querySelector(UISelectors.notifications).classList.add('disabled');
                                // Adjust UI display
                                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                                document.querySelector('body').style.overflow = 'auto';
                                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                                // Render day mode
                                UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                                // Calculate progress
                                calculateProgress(new Date());
                            }, 2000);
                        })
                        .catch(error => {
                            // Show message toast
                            UICtrl.addMsgToast("pastTasksDivMsg", '', 'Error: ' + error.message + '. Could not delete tasks. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                        });
                    } else {
                        FirebaseCtrl.deleteAllTasks(key, 'ongoing')
                        .then(() => {
                            // Update globalTasks
                            vars.globalTasksOngoing[key] = [];
                            // Update globalPastTasks
                            const index = vars.globalPastTaskKeys.indexOf(key);
                            vars.globalPastTaskKeys.splice(index, 1);
                        });
                    }
                });
            }
            // Settings 
            if (`#${e.target.id}` === UISelectors.settings) {
                document.querySelector(UISelectors.settingsWrapper).style.display = 'flex';
                document.querySelector(UISelectors.settingsWrapper).style.opacity = 1;
                document.querySelector('body').style.overflow = 'hidden';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardSettings, "0", '');
                // Set focus
                document.querySelector(UISelectors.focusguardSettings1).focus();
            }
                // Settings wrapper & settings close btn
            if (`#${e.target.id}` === UISelectors.settingsWrapper || document.querySelector(UISelectors.settingsCloseBtn).contains(e.target)) {
                document.querySelector(UISelectors.settingsWrapper).style.display = 'none';
                document.querySelector(UISelectors.settingsWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardSettings, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
                // Change theme event listener
            if (e.target.classList.contains('theme')) {
                // Update firestore
                FirebaseCtrl.updateUser(vars.globalUser, 'theme', e.target.id)
                .then(() => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Theme has been changed.', 'status', 'polite', true, 2000, 'toast-status');
                    // Update UI
                    const themeBtns = document.querySelectorAll(UISelectors.themeBtns);
                    Array.from(themeBtns).some(themeBtn => {
                        if (themeBtn.classList.contains('theme-active')) {
                            themeBtn.classList.remove('theme-active');
                            return true;
                        }
                    });
                    // Set theme
                    UICtrl.chooseTheme(e.target.id);
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Error: ' + error.message + '. Could not change theme. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
                // Change avatar event listener
            if (document.querySelector(UISelectors.avatarBtnsWrapper).firstElementChild.contains(e.target) || document.querySelector(UISelectors.avatarBtnsWrapper).lastElementChild.contains(e.target)) {
                let id = '';
                let target = '';
                if (e.target.classList.contains('avatar')) {
                    id = e.target.id;
                    target = e.target.firstElementChild.classList;
                } else if (e.target.classList.contains('fas')) {
                    id = e.target.parentElement.id;
                    target = e.target.classList;
                }
                // Update firestore
                FirebaseCtrl.updateUser(vars.globalUser, 'avatar', id)
                .then(() => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Avatar has been changed.', 'status', 'polite', true, 2000, 'toast-status');
                    const avatarBtns = document.querySelectorAll(UISelectors.avatarBtns);
                    Array.from(avatarBtns).some((avatarBtn) => {
                        if (avatarBtn.classList.contains('avatar-active')) {
                            avatarBtn.classList.remove('avatar-active');
                            return true;
                        }
                    });
                    // Set avatar
                    UICtrl.chooseAvatar(id);
                    // Adjust UI display
                    document.querySelector(UISelectors.userAvatar).setAttribute('class', target.value);
                    document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Error: ' + error.message + '. Could not change avatar. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
                // Change toast event listener
            if (e.target.classList.contains('toast-change')) {
                // Update firestore
                FirebaseCtrl.updateUser(vars.globalUser, 'toast', e.target.id)
                .then(() => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Toasts has been changed.', 'status', 'polite', true, 2000, 'toast-status');
                    const toastBtns = document.querySelectorAll(UISelectors.toastBtns);
                    Array.from(toastBtns).some((toastBtn) => {
                        if (toastBtn.classList.contains('toast-active')) {
                            toastBtn.classList.remove('toast-active');
                            return true;
                        }
                    });
                    // Set toast
                    UICtrl.chooseToast(e.target.id);
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("settingsDivMsg", '', 'Error: ' + error.message + '. Could not change toasts. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
            // Delete account
            if (`#${e.target.id}` === UISelectors.deleteAccountBtn) {
                document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'flex';
                document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 1;
                document.querySelector('body').style.overflow = 'hidden';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardDeleteAccount, "0", '');
                // Set focus
                document.querySelector(UISelectors.focusguardDeleteAccount1).focus();
            }
                // Delete account wrapper & delete account close btn
            if (`#${e.target.id}` === UISelectors.deleteAccountWrapper || document.querySelector(UISelectors.deleteAccountCloseBtn).contains(e.target) || `#${e.target.id}` === UISelectors.deleteNo) {
                document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'none';
                document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardDeleteAccount, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
        });
        document.querySelector(UISelectors.focusguardPastTask1).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.alertCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardPastTask2).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.alertCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardSettings1).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.settingsCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardSettings2).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.settingsCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardDeleteAccount1).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.deleteAccountCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardDeleteAccount2).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.deleteAccountCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardToast1).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.toastCloseBtn).focus();
        })
        document.querySelector(UISelectors.focusguardToast2).addEventListener('focus', () => {
            // Past task message wrapper
            document.querySelector(UISelectors.toastCloseBtn).focus();
        })
        document.querySelector('body').addEventListener('keydown', e => {
            // Turn off task editing
            if (document.activeElement.classList.contains('ongoing-edit') && e.key === 'Enter') {
                // Get current date
                const currToday = format(UICtrl.retrieveDayDate(), "d'-'MMM'-'yyyy");
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
                FirebaseCtrl.updateAllOngoingTasks(currToday, allTasks)
                .then(() => {
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'Task updated successfully.', 'status', 'polite', true, 2000, 'toast-status');
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
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                    // Update ongoing tasks
                    vars.globalTasksOngoing[currToday] = allTasks;
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not save changes. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
            // Close past task message wrapper
            if (`#${e.target.id}` === UISelectors.alertCloseBtn && e.key === 'Enter') {
                document.querySelector(UISelectors.alertMsgWrapper).style.display = 'none';
                document.querySelector(UISelectors.alertMsgWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector(UISelectors.listPastTasks).innerHTML = '';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardPastTask, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
            // Close settings wrapper
            if (`#${e.target.id}` === UISelectors.settingsCloseBtn && e.key === 'Enter') {
                document.querySelector(UISelectors.settingsWrapper).style.display = 'none';
                document.querySelector(UISelectors.settingsWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardSettings, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
            // Close delete account wrapper
            if (`#${e.target.id}` === UISelectors.deleteAccountCloseBtn && e.key === 'Enter') {
                document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'none';
                document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                UICtrl.handleTabindex(UISelectors.focusguardDeleteAccount, "-1", '');
                // Set focus
                document.querySelector(UISelectors.userNavbar).focus();
            }
            // Close toast wrapper
            if (`#${e.target.id}` === UISelectors.toastCloseBtn && e.key === 'Enter') {
                document.querySelector(UISelectors.toastMsgWrapper).style.display = 'none';
                document.querySelector(UISelectors.toastMsgWrapper).style.opacity = 0;
                document.querySelector('body').style.overflow = 'auto';
                // Reset tabindex
                    UICtrl.handleTabindex(UISelectors.focusguardToast, "-1", '');
                    // Set focus
                    document.querySelector(UISelectors.userNavbar).focus();
            }
            // Close day toasts
            if (e.target.classList.contains('close') && e.key === 'Enter') {
                e.target.parentElement.parentElement.remove();
            }
        });
        // Add task submit event
        document.querySelector(UISelectors.addForm).addEventListener('submit', e => {
            // Get task
            const task = document.querySelector(UISelectors.addForm).add.value.trim();
            // Get current date
            const date = UICtrl.retrieveDayDate();
            const currToday = format(date, "d'-'MMM'-'yyyy");
            // Lock tasks
            const tasks = document.querySelectorAll('.tasks .task-item');
            Array.from(tasks).forEach(task => {
                task.classList.add('disabled-li');
            });
            // Add task on conditions
            if (task.length && !document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && !document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                // Add task when not in pick mode and ongoing tasks are active
                // Update firestore
                FirebaseCtrl.addTask({
                    currToday,
                    task
                })
                .then(response => {
                    // Show message toast
                    UICtrl.addMsgToast("taskDivMsg", '', 'Task added successfully.', 'status', 'polite', true, 2000, 'toast-status');
                    // Update UI
                    setOngoingTasks(response.data());
                    UICtrl.renderDayModeCalendar(date, setOngoingTasks, response.data(), FirebaseCtrl.updateAllOngoingTasks);
                    // Unlock tasks
                    Array.from(tasks).forEach(task => {
                        task.classList.remove('disabled-li');
                    });
                    // Adjust UI display
                    document.querySelector(UISelectors.dateToasts).innerHTML = '';
                    document.querySelector(UISelectors.addForm).reset();
                    // Calculate progress
                    calculateProgress(date);
                    // Notifications
                    checkNotifications(date, currToday, false);
                    // Handle buttons
                    UICtrl.handleDisabledStateBtn(["userNavbar", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                    UICtrl.handleDisabledStateBtn(["pickDate", "addTaskInput", "addTaskSubmit", "pickDateTodayBtn", "pickDatePickMode"]);
                    document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
                    document.querySelector(UISelectors.pickDateFormWrapper).classList.remove('pick-date-form-open');
                    document.querySelector(UISelectors.addOption).classList.remove('active');
                })
                .catch(error => {
                    // Unlock tasks
                    Array.from(tasks).forEach(task => {
                        task.classList.remove('disabled-li');
                    });
                    // Show message toast
                    if (error.name !== undefined && error.name === "Error") {
                        UICtrl.addMsgToast("taskDivMsg", '', error.message, 'alert', 'assertive', true, 2000, 'toast-alert');
                    } else {
                        UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error + '. Could not add task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                    }
                });
            } else if (task.length && document.querySelector(UISelectors.tableBody).classList.contains('pick-date-mode') && !document.querySelector(UISelectors.taskTabsCompleted).classList.contains('active')) {
                // Add task when pick mode and ongoing tasks are active
                // Get day toast list
                const dayToasts = Array.from(document.querySelector(UISelectors.dateToasts).children);
                if (document.querySelector(UISelectors.dateToasts).children.length) {
                    // Day toast list is not empty -- add tasks
                    dayToasts.some((dayToast, index) => {
                        // Update firestore
                        if (index === (dayToasts.length - 1)) {
                            FirebaseCtrl.updateSingleTask(dayToast.id, task)
                            .then(() => {
                                // Show message toast
                                UICtrl.addMsgToast("taskDivMsg", '', 'Task added successfully.', 'status', 'polite', true, 2000, 'toast-status');
                                // Unlock tasks
                                Array.from(tasks).forEach(task => {
                                    task.classList.remove('disabled-li');
                                });
                                // Update ongoing tasks
                                if (vars.globalTasksOngoing[dayToast.id] === undefined) {
                                    vars.globalTasksOngoing[dayToast.id] = [];
                                    vars.globalTasksOngoing[dayToast.id].push(task);
                                } else {
                                    if (!vars.globalTasksOngoing[dayToast.id].includes(task)) {
                                        vars.globalTasksOngoing[dayToast.id].push(task);
                                    }
                                }
                                // Notifications
                                const date = parse(dayToast.id, "d'-'MMM'-'yyyy", new Date());
                                checkNotifications(date, dayToast.id, false);
                                // Render day mode 
                                UICtrl.renderDayModeCalendar(new Date(), setOngoingTasks, vars.globalTasksOngoing, FirebaseCtrl.updateAllOngoingTasks);
                                // Calculate progress
                                calculateProgress(new Date());
                                // Adjust UI
                                document.querySelector(UISelectors.dateToasts).innerHTML = '';
                                document.querySelector(UISelectors.addForm).reset();
                                document.querySelector(UISelectors.tableBody).classList.remove('pick-date-mode');
                                document.querySelector(UISelectors.pickDatePickMode).classList.add('btn-outline-light');
                                document.querySelector(UISelectors.pickDatePickMode).classList.remove('btn-outline-danger');
                                // Handle buttons
                                UICtrl.handleDisabledStateBtn(["userNavbar", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                                UICtrl.handleDisabledStateBtn(["pickDate", "addTaskInput", "addTaskSubmit", "pickDateTodayBtn", "pickDatePickMode"]);
                                document.querySelector(UISelectors.addFormWrapper).classList.remove('add-form-open');
                                document.querySelector(UISelectors.pickDateFormWrapper).classList.remove('pick-date-form-open');
                                document.querySelector(UISelectors.addOption).classList.remove('active');
                            })
                            .catch(error => {
                                // Show message toast
                                UICtrl.addMsgToast("taskDivMsg", '', 'Error: ' + error.message + '. Could not add task. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                            });
                        } else {
                            FirebaseCtrl.updateSingleTask(dayToast.id, task)
                            .then(() => {
                                // Unlock tasks
                                Array.from(tasks).forEach(task => {
                                    task.classList.remove('disabled-li');
                                });
                                // Update ongoing tasks
                                if (vars.globalTasksOngoing[dayToast.id] === undefined) {
                                    vars.globalTasksOngoing[dayToast.id] = [];
                                    vars.globalTasksOngoing[dayToast.id].push(task);
                                } else {
                                    if (!vars.globalTasksOngoing[dayToast.id].includes(task)) {
                                        vars.globalTasksOngoing[dayToast.id].push(task);
                                    }
                                }
                                // Notifications
                                const date = parse(dayToast.id, "d'-'MMM'-'yyyy", new Date());
                                checkNotifications(date, dayToast.id, false);
                            });
                        }
                    });
                }
            }
            e.preventDefault();
        });
        // Search form
        document.querySelector(UISelectors.searchForm).searchInput
        .addEventListener('keyup', () => {
            // Get search string
            const term = document.querySelector(UISelectors.searchForm).searchInput.value.trim().toLowerCase();
            // Filter tasks
            UICtrl.filterTasks(term, UISelectors.tasks);
        });
        // Search form prevent default
        document.querySelector(UISelectors.searchForm)
        .addEventListener('submit', e => { e.preventDefault() });
        // Delete account submit event
        document.querySelector(UISelectors.deleteAccountForm).addEventListener('submit', e => {
            const email = document.querySelector(UISelectors.deleteAccountEmail);
            const pass = document.querySelector(UISelectors.deleteAccountPassword);
            const errorPara = document.querySelector(UISelectors.deleteAccountErrorPara);
            // Adjust UI display
            document.querySelector(UISelectors.deleteAccountForm)["account-delete"].disabled = true;
            // Reauthenticate
            FirebaseCtrl.reauthenticate(email.value, pass.value)
            .then(() => {
                // Delete user
                return FirebaseCtrl.deleteUser();
            })
            .then(() => {
                // Show message toast
                UICtrl.addMsgToast("deleteDivMsg", '', 'This user has been deleted.', 'status', 'polite', true, 2000, 'toast-status');
                setTimeout(() => {
                    // Clear form
                    document.querySelector(UISelectors.deleteAccountForm).reset();
                    // Adjust UI display
                    document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                    document.querySelector(UISelectors.welcomeHeader).textContent = '';
                    document.querySelector(UISelectors.leadTodayDate).textContent = '';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.display = 'none';
                    document.querySelector(UISelectors.deleteAccountWrapper).style.opacity = 0;
                    setTimeout(() => {
                        // Adjust UI display
                        document.querySelector(UISelectors.deleteAccountForm)["account-delete"].disabled = false;
                        document.querySelector(UISelectors.loginMainDiv).classList.remove('move-x-left');
                    }, 2000);
                }, 2000);
            })
            .catch(error => {
                // Adjust UI display
                document.querySelector(UISelectors.deleteAccountForm)["account-delete"].disabled = false;
                // Show message
                UICtrl.errorLogInAll(error, DataCtrl.errorHandlingLogIn, {
                    email, pass, errorPara
                });
            });
            e.preventDefault();
        });
        window.addEventListener("orientationchange", e => {
            if (document.querySelector(UISelectors.loginAddMode) != null) {
                if (e.target.screen.orientation.angle === 90) {
                    document.querySelector('body').style.overflow = 'scroll';
                    document.querySelector(UISelectors.loginWrapper).style.overflow = 'auto';
                    document.querySelector(UISelectors.loginAddMode).parentElement.style.overflow = 'initial';
                } else {
                    document.querySelector(UISelectors.loginWrapper).style.overflow = 'hidden';
                    document.querySelector(UISelectors.loginAddMode).parentElement.style.overflow = 'hidden';
                }
            }
            if (document.querySelector(UISelectors.logInConfirmMode) != null) {
                if (e.target.screen.orientation.angle === 90) {
                    document.querySelector('body').style.overflow = 'scroll';
                    document.querySelector(UISelectors.loginWrapper).style.overflow = 'auto';
                    document.querySelector(UISelectors.logInConfirmMode).parentElement.style.overflow = 'initial';
                } else {
                    document.querySelector(UISelectors.loginWrapper).style.overflow = 'hidden';
                    document.querySelector(UISelectors.logInConfirmMode).parentElement.style.overflow = 'hidden';
                }
            }
        });
    }
    const setUI = function(user, data) {
        // Set global user
        setUser(user);
        // User logged in
        if (user) {
            // Adjust UI display
            document.querySelector('body').style.overflow = 'auto';
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
            // Show login loader
            UICtrl.createLoginLoader();
            // Adjust UI display
            setTimeout(() => {
                document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                document.querySelector('body').style.overflow = 'auto';
                document.querySelector(UISelectors.mainNavbar).style.display = 'block';
                document.querySelector(UISelectors.mainBody).style.display = 'block';
                // Set UI for a particular user
                document.querySelector(UISelectors.welcomeHeader).textContent = data.info.name;
                document.querySelector(UISelectors.leadTodayDate).textContent = format(data.date, "do 'of' MMMM yyyy");
                // Set theme, avatar & toasts
                UICtrl.chooseTheme(data.info.theme);
                UICtrl.chooseAvatar(data.info.avatar);
                document.querySelector(UISelectors.userAvatar).setAttribute('class', document.querySelector(`#${data.info.avatar}`).firstElementChild.classList.value);
                document.querySelector(UISelectors.userAvatar).classList.add('position-relative');
                UICtrl.chooseToast(data.info.toast);
                // Calculate progress
                calculateProgress(new Date());
                // Handle buttons
                UICtrl.handleDisabledStateBtn(["userNavbar", "lDayArrow", "rDayArrow", "dayModeView", "weekModeView", "monthModeView", "searchTasks", "addOption", "moreOptionsBtn", "taskTabsOngoing", "taskTabsCompleted"], false);
                // Adjust UI display
                setTimeout(() => {
                    // Show message toast
                    UICtrl.addMsgToast("mainDivMsg", '', 'You are currently logged in.', 'status', 'polite', true, 2000, 'toast-status');
                    // Remove loader
                    document.querySelector(UISelectors.loginLoader).remove();
                    document.querySelector(UISelectors.loginWrapper).style.display = 'none';
                    document.querySelector(UISelectors.loginMainDiv).style.opacity = 1;
                    // Check firestore for past tasks
                    vars.globalPastTaskKeys = UICtrl.checkPastOngoingTasks(vars.globalTasksOngoing);
                    // Delete tasks older than 30 days
                    deletePastTasks(vars.globalTasksOngoing, 'ongoing');
                    deletePastTasks(vars.globalTasksCompleted, 'completed');
                }, 1000)
            }, 2000);
        // User logged out
        } else {
            if (data) {
                setTimeout(() => {
                    // Adjust UI display
                    document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.loginMainDiv).parentElement.style.display = 'none';
                    document.querySelector(UISelectors.loginMainDiv).style.display = 'none';
                    document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
                    // Show login loader
                    UICtrl.createLoginLoader();
                    // Reset main theme
                    UICtrl.chooseTheme('theme-1');
                    // Adjust UI display
                    setTimeout(() => {
                        document.querySelector(UISelectors.mainNavbar).style.display = 'none';
                        document.querySelector(UISelectors.mainBody).style.display = 'none';
                        document.querySelector(UISelectors.loginLoader).remove();
                        // Show message toast
                        UICtrl.addMsgToast("offlineDivMsg", '', 'Error: ' + data.error.message + ' This app does not support offline mode. Please regain Internet connection to continue.', 'alert', 'assertive', false, 500, 'toast-alert');
                    }, 2000);
                }, 2000);
            } else {
                setTimeout(() => {
                    // Adjust UI display
                    document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
                    document.querySelector(UISelectors.loginMainDiv).style.opacity = 0;
                    if (window.screen.orientation.angle === 90) {
                        document.querySelector('body').style.overflow = 'scroll';
                    } else {
                        document.querySelector('body').style.overflow = 'hidden';
                    }
                    // Show login loader
                    UICtrl.createLoginLoader();
                    // Reset main theme
                    UICtrl.chooseTheme('theme-1');
                    // Adjust UI display
                    setTimeout(() => {
                        document.querySelector(UISelectors.mainNavbar).style.display = 'none';
                        document.querySelector(UISelectors.mainBody).style.display = 'none';
                        document.querySelector(UISelectors.loginLoader).remove();
                        document.querySelector(UISelectors.loginMainDiv).style.opacity = 1;
                    }, 2000);
                }, 2000);
            }
        }
    } 
    const calculateProgress = function(date) {
        const currToday = format(date, "d'-'MMM'-'yyyy");
        const progressBar = document.querySelector(UISelectors.taskProgress).firstElementChild.firstElementChild;
        let ongoingNum = 0;
        let completedNum = 0;
        if ((vars.globalTasksOngoing !== undefined) && (vars.globalTasksCompleted !== undefined)) {
            if (!(vars.globalTasksOngoing[currToday] === undefined)) {
                ongoingNum = vars.globalTasksOngoing[currToday].length;
            }
            if (!(vars.globalTasksCompleted[currToday] === undefined)) {
                completedNum = vars.globalTasksCompleted[currToday].length;
            }
        }
        let completePerCent = 0;
        if (!(ongoingNum === 0 && completedNum === 0)) {
            completePerCent = Number(Math.ceil(completedNum / (completedNum + ongoingNum) * 100).toFixed());
        }
        progressBar.firstElementChild.style.width = completePerCent + '%';
        document.querySelector(UISelectors.dayProgress).innerHTML = completePerCent * 1 + '%';
    };
    const checkNotifications = function(date, currToday, ongoing = true) {
        if (ongoing) {
            // Notifications - check if currToday is in pastTaskKeys
            if (vars.globalPastTaskKeys.includes(currToday) && !vars.globalTasksOngoing[currToday].length) {
                const index = vars.globalPastTaskKeys.indexOf(currToday);
                vars.globalPastTaskKeys.splice(index, 1);
            }
            // Notifications - check if pastTasksKeys is empty
            if (!vars.globalPastTaskKeys.length) {
                document.querySelector(UISelectors.notifications).lastElementChild.textContent = '';
                document.querySelector(UISelectors.navNotifications).textContent = '';
                document.querySelector(UISelectors.navNotifications).style.display = 'none';
                document.querySelector(UISelectors.notifications).classList.add('disabled');
            }
        } else {
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
                document.querySelector(UISelectors.navNotifications).style.display = 'inline-flex';
                document.querySelector(UISelectors.notifications).classList.remove('disabled');
            }
        }
    }
    const deletePastTasks = function(tasks, collection) {
        // Get current date
        const today = new Date((new Date).getFullYear(), (new Date).getMonth(), (new Date).getDate())
        for (const key in tasks) {
            const date = parse(key, "d'-'MMM'-'yyyy", new Date());
            if (date < subDays(today, 31)) {
                // Delete tasks from firestore
                FirebaseCtrl.deleteAllTasks(key, collection)
                .then(() => {
                    // Show message toast
                    addMsgToast("mainDivMsg", '', 'Tasks older than 30 days were successfully deleted.', 'status', 'polite', true, 2000, 'toast-status');
                    // Update globalTasks
                    vars.globalTasksOngoing[key] = [];
                })
                .catch(error => {
                    // Show message toast
                    UICtrl.addMsgToast("mainDivMsg", '', 'Error: ' + error.message + '. Could not delete tasks older than 30 days. Try again later.', 'alert', 'assertive', true, 2000, 'toast-alert');
                });
            }
        }
    }
    const setOngoingTasks = function(tasks, all = true, currToday = '') {
        if (all) {
            vars.globalTasksOngoing = tasks;
        } else {
            vars.globalTasksOngoing[currToday] = tasks;
        }
    }
    const setCompletedTasks = function(tasks, all = true, currToday = '') {
        if (all) {
            vars.globalTasksCompleted = tasks;
        } else {
            vars.globalTasksCompleted[currToday] = tasks;
        }
    }
    const setUser = function(user) {
        vars.globalUser = user;
    }
	return {
		init: function() {
            // console.log('Initializing App...');
            // Initialize firebase app
            FirebaseCtrl.firebaseInit();
            // Set listener for authentication change
            FirebaseCtrl.authStatus({
                setUI,
                renderDayModeCalendar: UICtrl.renderDayModeCalendar,
                currToday: new Date(),
                setOngoingTasks,
                setCompletedTasks
            });
            // Load event listeners
            loadEventListeners();
		}
	}
})(UICtrl, DataCtrl, FirebaseCtrl);
// Initialize app controller
AppCtrl.init();