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
import { format } from 'date-fns';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// App Controller
const AppCtrl = (function(UICtrl, UserCtrl, DataCtrl, DnDCtrl, FirebaseCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Load event listeners
    const loadEventListeners = function() {
        // UI event listeners
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
                        document.querySelector(UISelectors.loginAddMode).remove();
                        document.querySelector(UISelectors.loginConfirmMode).remove();
                        // Clear login accounts
                        document.querySelector(UISelectors.loginAccounts).innerHTML = '';
                        // console.log(new Date());
                        // 
                        setTimeout(() => {
                            document.querySelector(UISelectors.loginWrapper).classList.add('roll-up');
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
            // Log out
            if (`#${e.target.id}` === UISelectors.logOut) {
                console.log('tutaj jestem');
                FirebaseCtrl.logOut();
                // 
                // UICtrl.logOut();
                // 
                document.querySelector(UISelectors.loginWrapper).classList.remove('roll-up');
                // 
                setTimeout(() => {
                    // console.log(new Date());
                    // Reset main app screen
                    document.querySelector(UISelectors.welcomeHeader).textContent = '';
                    document.querySelector(UISelectors.leadTodayDate).textContent = '';
                    // Get user's tasks
                    
                    // Show login loader
                    UICtrl.createLoginLoader();
                    // 
                    setTimeout(() => {
                        document.querySelector(UISelectors.loginLoader).remove();
                    }, 1500);
                }, 400);
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
        });
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
        if (user) {
            document.querySelector(UISelectors.loginWrapper).style.display = 'none';
            document.querySelector(UISelectors.mainNavbar).style.display = 'block';
            document.querySelector(UISelectors.mainBody).style.display = 'block';
        } else {
            document.querySelector(UISelectors.loginWrapper).style.display = 'flex';
            document.querySelector(UISelectors.mainNavbar).style.display = 'none';
            document.querySelector(UISelectors.mainBody).style.display = 'none';
        }
    }

    

    const renderDayModeCalendar = function(currToday) {
        // adjust UI
        document.querySelector(UISelectors.monthModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.weekModeWrapper).setAttribute('style', 'display: none !important');
		document.querySelector(UISelectors.dayModeWrapper).setAttribute('style', 'display: flex !important');
		document.querySelector(UISelectors.lMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rMonthArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.rWeekArrow).parentElement.style.display = 'none';
		document.querySelector(UISelectors.lDayArrow).parentElement.style.display = 'flex';
        document.querySelector(UISelectors.rDayArrow).parentElement.style.display = 'flex';
        // 
        document.querySelector(UISelectors.taskTabs).classList.remove('hide');
        // 
        document.querySelector(UISelectors.dayModeContent).textContent = `
            ${format(currToday, "d MMMM yyyy, EEEE")}
        `;
        // 
        UICtrl.renderTableUI();
        // 
        
    }

	return {
		init: function() {
            console.log('Initializing App...');

            // Initialize firebase app
            FirebaseCtrl.firebaseInit();
            // test firebase
            FirebaseCtrl.test();
            // Adjust UI on user status change
            FirebaseCtrl.authStatus(setUI, UICtrl.renderLoginAccounts, UISelectors.loginAccounts, renderDayModeCalendar, new Date());
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