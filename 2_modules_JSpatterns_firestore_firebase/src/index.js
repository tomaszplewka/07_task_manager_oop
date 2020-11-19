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
    // Load event listeners
    const loadEventListeners = function() {
        // Load UI selectors
        const UISelectors = UICtrl.getSelectors();
        // UI event listeners
        document.querySelector('body').addEventListener('click', e => {
            // Add user
            if (`#${e.target.id}` === UISelectors.addUserBtn) {
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
                Array.from(document.querySelectorAll('input')).forEach(input => input.addEventListener('keyup', DataCtrl.validate));
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