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

import './css/style.css';
import UICtrl from './js/UICtrl';
import StoreCtrl from './js/StoreCtrl';
import DataCtrl from './js/DataCtrl';
import UserCtrl from './js/UserCtrl';
import DnDCtrl from './js/DnDCtrl';

// App Controller
const AppCtrl = (function(UICtrl, UserCtrl, DataCtrl, DnDCtrl) {
    // Load UI selectors
    const UISelectors = UICtrl.getSelectors();
    // Load event listeners
    const loadEventListeners = function() {
        // UI event listeners
        document.querySelector('body').addEventListener('click', e => {
            // Add user
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
                // Add new account - submit event
                document.querySelector(UISelectors.addAccountForm).addEventListener('submit', e => {
                    e.preventDefault();
                    // Create user instance
                    const user = UserCtrl.addUser({
                        name: document.querySelector(UISelectors.username).value,
                        email: document.querySelector(UISelectors.email).value,
                        password: document.querySelector(UISelectors.password).value
                    });
                    // Store user in LS

                    // Create confirm user mode
                    UICtrl.createConfirmMode();
                    document.querySelector(UISelectors.confirmUser).textContent = user.data.name;
                    // 
                    setTimeout(() => {
                        document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero'); 
                        document.querySelector(UISelectors.loginAddMode).classList.add('move-y-up');
                        document.querySelector(UISelectors.loginConfirmMode).classList.add('move-y-zero');
                    }, 100)
                    // 
                    setTimeout(() => {
                        // first load user accounts !!!!!!!!!!!!!!!!!!!!

                        // 
                        document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-up');
                        document.querySelector(UISelectors.loginConfirmMode).classList.remove('move-y-zero');
                        document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                        // 
                        document.querySelector(UISelectors.loginAddMode).remove();
                        document.querySelector(UISelectors.loginConfirmMode).remove();
                        // render login Accounts !!!!!!!!!!!!!!!!!!!!!!!

                    }, 2000)
                    

                })
            }
            // Show/Hide password
            if (`.${e.target.className}` === UISelectors.showHidePass) {
                UICtrl.showHidePass(e.target, document.querySelector(UISelectors.password));
            }
            // Go Back from Add Account Screen
            if (`#${e.target.id}` === UISelectors.addBackBtn) {
                document.querySelector(UISelectors.loginMainDiv).classList.remove('move-y-up');
                document.querySelector(UISelectors.loginAddMode).classList.remove('move-y-zero');
                setTimeout(() => {
                    document.querySelector(UISelectors.loginAddMode).remove();
                }, 100)
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

	return {
		init: function() {
            console.log('Initializing App...');
            
            // Load event listeners
            loadEventListeners();
		}
	}

})(UICtrl, UserCtrl, DataCtrl, DnDCtrl);





// Initialize App
AppCtrl.init();