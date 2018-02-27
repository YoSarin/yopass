cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
        "id": "cordova-sqlite-storage.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "file": "plugins/cordova-sqlite-storage/src/windows/SQLiteProxy.js",
        "id": "cordova-sqlite-storage.SQLiteProxy",
        "merges": [
            ""
        ]
    },
    {
        "file": "plugins/cordova-sqlite-storage/src/windows/SQLite3-WinRT/SQLite3JS/js/SQLite3.js",
        "id": "cordova-sqlite-storage.SQLite3",
        "merges": [
            ""
        ]
    },
    {
        "file": "plugins/com.verso.cordova.clipboard/www/clipboard.js",
        "id": "com.verso.cordova.clipboard.Clipboard",
        "clobbers": [
            "cordova.plugins.clipboard"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "cordova-sqlite-storage": "0.7.11",
    "com.verso.cordova.clipboard": "0.1.0"
}
// BOTTOM OF METADATA
});