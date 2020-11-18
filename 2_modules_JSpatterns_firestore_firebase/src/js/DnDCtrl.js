import DataCtrl from "./DataCtrl";

// DragAndDrop Controller
const DnDCtrl = (function() {
	// Constructor
	const DnD = function(event, user) {
		this.event = event;
		this.user = user;
	}

	return {
		test: function() {
			console.log('test');
		}
	}
})();

export default DnDCtrl;