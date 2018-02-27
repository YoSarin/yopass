cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-sqlite-storage.SQLitePlugin",
        "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
        "pluginId": "cordova-sqlite-storage",
        "clobbers": [
            "SQLitePlugin"
        ]
    },
    {
        "id": "cordova-sqlite-storage.SQLiteProxy",
        "file": "plugins/cordova-sqlite-storage/src/windows/sqlite-proxy.js",
        "pluginId": "cordova-sqlite-storage",
        "runs": true
    },
    {
        "id": "cordova-sqlite-storage.SQLite3",
        "file": "plugins/cordova-sqlite-storage/src/windows/SQLite3-Win-RT/SQLite3JS/js/SQLite3.js",
        "pluginId": "cordova-sqlite-storage",
        "runs": true
    },
    {
        "id": "cordova-plugin-dialogs.notification",
        "file": "plugins/cordova-plugin-dialogs/www/notification.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "id": "cordova-plugin-dialogs.NotificationProxy",
        "file": "plugins/cordova-plugin-dialogs/src/windows/NotificationProxy.js",
        "pluginId": "cordova-plugin-dialogs",
        "merges": [
            ""
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-sqlite-storage": "2.0.2",
    "cordova-plugin-dialogs": "1.3.1"
};
// BOTTOM OF METADATA
});