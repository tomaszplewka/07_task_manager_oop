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
import { format, parse } from 'date-fns';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// App Controller
const AppCtrl = (function(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Load event listeners
    const loadEventListeners = function() {
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
                        // Creat and store new user in Firebase
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
                            document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero'); 
                            document.querySelector(UISelectors.loginAddMode).classList.add('move-y-up');
                            document.querySelector(UISelectors.loginConfirmMode).classList.add('move-y-zero');
                            console.log(new Date());
                        }, 100)
                        // 
                        setTimeout(() => {
                            document.querySelector(UISelectors.loginConfirmMode).classList.remove('move-y-zero');
                            // Show login loader
                            UICtrl.createLoginLoader();
                            document.querySelector(UISelectors.loginLoader).style.height = document.querySelector(UISelectors.loginConfirmMode).offsetHeight + 'px';
                            // 
                            document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                            document.querySelector(UISelectors.loginAddMode).remove();
                            document.querySelector(UISelectors.loginConfirmMode).remove();
                            // Clear login accounts
                            document.querySelector(UISelectors.loginAccounts).innerHTML = '';
                            // console.log(new Date());
                            // 
                            setTimeout(() => {
                                document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
                                // 
                                document.querySelector('body').style.overflow = 'auto';
                                // console.log(new Date());
                                // Adjust main app screen
                                document.querySelector(UISelectors.welcomeHeader).textContent = user.name;
                                // Get user's tasks
    
                                // user.tasks = Store.getUser(user.data.name).tasks;
                                const today = new Date();
                                document.querySelector(UISelectors.leadTodayDate).textContent = format(today, "do 'of' MMMM yyyy");
                                // 
                                setTimeout(() => {
                                    // document.querySelector(UISelectors.loginWrapper).remove();
                                    document.querySelector(UISelectors.loginLoader).remove();
                                }, 500);
                            }, 2000);
                        }, 1500)
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
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                            passValue.classList.remove('invalid');
                                        }, 3000);
                                        break;
                                    case email === 1 && pass === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        emailValue.classList.add('invalid');
                                        passValue.classList.add('invalid');
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                            passValue.classList.remove('invalid');
                                        }, 3000);
                                        break;
                                    case email === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        emailValue.classList.add('invalid');
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            emailValue.classList.remove('invalid');
                                        }, 3000);
                                        break;
                                    case pass === 1:
                                        errorPara.innerHTML = msg;
                                        errorPara.classList.remove('hide');
                                        passValue.classList.add('invalid');
                                        setTimeout(() => {
                                            errorPara.classList.add('hide');
                                            passValue.classList.remove('invalid');
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

    const setUI = function(user) {
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
        // 
        document.querySelector(UISelectors.dayModeContent).textContent = `
            ${format(currToday, "d MMMM yyyy, EEEE")}
        `;
        // 
        UICtrl.renderTableUI();
        // 
        console.log('renderDayMode');
        UICtrl.displayTasks(tasks, currToday, DnDCtrl.enableDnD);
    }

	return {
		init: function() {
            console.log('Initializing App...');

            // Initialize firebase app
            FirebaseCtrl.firebaseInit();
            // test firebase
            FirebaseCtrl.test();
            // Adjust UI on user status change
            FirebaseCtrl.authStatus({
                setUI,
                renderLoginAccounts: UICtrl.renderLoginAccounts,
                uiListSelector: UISelectors.loginAccounts,
                renderDayModeCalendar,
                currToday: new Date()
            });
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

// const dateFormat = function(date, format) { format(date, format) };

// console.log(dateFormat(new Date(), 'Do of MMMM YYYY'));
// console.log(format(new Date(), "do 'of' MMMM yyyy"));

// console.log(parse('26 November 2020, Thursday', "d MMMM yyyy, EEEE", new Date()));
// console.log(format(parse('26 November 2020, Thursday', "d MMMM yyyy, EEEE", new Date()), "d'-'MMM'-'yyyy"));