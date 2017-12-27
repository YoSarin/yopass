var cordova = require('cordova'),
    channel = require('cordova/channel');

module.exports = {
    copy: function (success, fail, args) {
        console.log("COPY");
        var value = new Windows.ApplicationModel.DataTransfer.DataPackage();
        value.setText(args[0]);
        Windows.ApplicationModel.DataTransfer.Clipboard.setContent(value);
    },
    paste: function (success, fail, args) {
        console.log("PASTE");
    }
}
require("cordova/exec/proxy").add("Clipboard", module.exports);
