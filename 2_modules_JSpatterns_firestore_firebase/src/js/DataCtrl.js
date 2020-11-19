// Data Controller
const DataCtrl = (function() {

    const validate = function() {
        console.log('from DataCtrl');
        console.log(this.id);
    }

    return {
        validate
    }

})();

export default DataCtrl;