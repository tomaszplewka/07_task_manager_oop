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
const AppCtrl = (function(DnDCtrl) {
    // Load event listeners
    const loadEventListeners = function() {
        // Load UI selectors
        const UISelectors = UICtrl.getSelectors();
        // UI event listeners
        // Add user
        document.querySelector(UISelectors.addUserBtn).addEventListener('click', UICtrl.createAddMode);
    }

	return {
		init: function() {
            console.log('Initializing App...');
            
            // Load event listeners
            loadEventListeners();
		}
	}

})(DnDCtrl);





// Initialize App
AppCtrl.init();