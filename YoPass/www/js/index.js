// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        $(document).bind('mobileinit', function () {
            $.mobile.loader.prototype.options.text = "loading";
            $.mobile.loader.prototype.options.textVisible = false;
            $.mobile.loader.prototype.options.theme = "a";
            $.mobile.loader.prototype.options.html = "";
        });

        $('.confirm').click(function (ev) {
            var target = $(this).attr('href');
            navigator.notification.confirm(
                'Are you sure?',
                 function (index) {
                     if (index === 1) {
                         $(':mobile-pagecontainer').pagecontainer('change', $(target));
                     }
                 },
                'Confirmation',
                ['Yes', 'No']
            );
            return false;
        });

        $('.submitOnEnter').keypress(function (e) {
            if (e.which == 13) {
                var target = $(this).attr('rel');
                $('#' + target).click();
                return false;    //<---- Add this line
            }
        });

        $('#login').on('pagebeforeshow', function (event) {
            loadData(prepareLoginPage);
        });

        $('#login').on('pageshow', function (event) {
            $("#login input").first().focus();
        });

        $('#addPassword').on('pagebeforeshow', function (event) {
            fillPasswordForm();
            $(':mobile-pagecontainer').pagecontainer('change', $('#editPassword'));
        });

        $('#editPassword').on('pagebeforeshow', function (event) {
        });

        $('#editPassword').on('pageshow', function (event) {
            $("#editPassword input").first().focus();
        });

        $('#list').on('pagebeforeshow', function (event) {
            if ($('#walletList').val() === null || !$('#password').val()) {
                $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                return;
            }
            loadData(function (wallets) {
                loadWallet(function (wallet) {
                    try {
                        var pass = $('#password').val();
                        wallet.decrypt(pass);
                        $('#list h1').html(wallet.name());
                        $('#list .data').html('');
                        $.each(wallet.passwords(), function (key, p) {
                            var html = $("#templates .password").clone();
                            $(html).find('.name').text(p.getTitle());
                            $(html).find('.username').text(p.getUsername());
                            if (typeof Windows.ApplicationModel.DataTransfer.Clipboard !== 'undefined') {
                                $(html).find('.copy').click(function () {
                                    var clipboard = Windows.ApplicationModel.DataTransfer.Clipboard;
                                    var content = Windows.ApplicationModel.DataTransfer.DataPackage();
                                    content.setText(p.getPassword());
                                    clipboard.setContent(content);
                                });
                            }
                            $(html).find('.edit').click(function () {
                                fillPasswordForm(p);
                                $(':mobile-pagecontainer').pagecontainer('change', $('#editPassword'));
                            });
                            $(html).find('.remove').click(function () {
                                navigator.notification.confirm(
                                    'Are you sure?',
                                     function (index) {
                                         if (index === 1) {
                                             wallet.removePassword(p);
                                             wallet.encrypt(pass);
                                             wallet.save(YoPass.DB());
                                             $(html).remove();
                                         }
                                     },
                                    'Confirmation',
                                    ['Yes', 'No']
                                );
                            });
                            $('#list .data').append(html);
                        });
                        $('#list .data').trigger('create');
                    } catch (e) {
                        console.log(e);
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                });
            });
        });

        $('#createWallet').on('pagebeforeshow', function (event) {
            if ($("#newWallet input[name='name']").val() !== '' && $("#newWallet input[name='password']").val() !== '') {
                var name = $("#newWallet input[name='name']").val();
                var pass = $("#newWallet input[name='password']").val();
                var salt = CryptoJS.lib.WordArray.random(128 / 8);
                var iv = CryptoJS.lib.WordArray.random(128 / 8);
                var iters = 100;
                var key = CryptoJS.PBKDF2(pass, salt, { keySize: 1024 / 32, iterations: iters }).toString();
                var encryptedKey = CryptoJS.AES.encrypt(JSON.stringify({ 'key': key, 'salt': salt, 'iv': iv }), pass).toString();
                var encryptedData = CryptoJS.AES.encrypt(JSON.stringify([]), key, { 'iv': iv }).toString();

                $("#newWallet input[name='password']").val('');
                $("#newWallet input[name='name']").val('');

                YoPass.DB().query(
                    'INSERT INTO wallet (name, encryptedKey, data) VALUES (?,?,?)',
                    [name, encryptedKey, encryptedData],
                    function (db, result) {
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                );

            } else {
                $(':mobile-pagecontainer').pagecontainer('change', $('#newWallet'));
            }
        });
        
        $('#newWallet').on('pageshow', function (event) {
            $("#newWallet input").first().focus();
        });

        $('#removeWallet').on('pagebeforeshow', function (event) {
            if ($("#walletList").val()) {
                Wallet.delete(
                    YoPass.DB(),
                    parseInt($("#walletList").val()),
                    function (db, result) { // success
                        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                    }
                );
            }
        });

        $('#newWallet').on('pagebeforeshow', function (event) {
            $("#newWallet input[name='password']").val('');
            $("#newWallet input[name='name']").val('');
        });
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));

    }

    function onPause() {
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
    }

    function onResume() {
        $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
    }

    function prepareLoginPage(wallets) {
        var selected = $('#walletList').val();
        $('#password').val('');
        $('#walletList').html('');
        $.each(wallets, function (key, item) {
            if (!item) {
                return;
            }
            var option = $('#templates .walletItem').clone();
            option.attr('value', item.id);
            option.text(item.name);
            $('#walletList').append(option);
        });
        if (!selected || typeof wallets[parseInt(selected)] === 'undefined') {
            $('#walletList option').first().attr('selected', true);
        } else {
            $('#walletList').val(selected);
        }
        $('#walletList').selectmenu('refresh');
    }

    function loadData(callback) {
        YoPass.DB().query(
            'SELECT id_wallet as id, name, encryptedKey as key, data FROM wallet',
            [], 
            function (db, result) { // success
                var wallets = [];
                for (var i = 0; i < result.rows.length; i++) {
                    var item = result.rows.item(i);
                    wallets[item.id] = item;
                }
                callback(wallets);
            }, function (err) { // error
                console.log(err);
            }
        );
    }

    function loadWallet(callback) {
        loadData(function (wallets) {
            try {
                var w = wallets[parseInt($('#walletList').val())];

                var wallet = Wallet.load(w.id, w.name, w.key, w.data);

                callback(wallet);
            } catch (e) {
                navigator.notification.alert("Sorry, something is broken :(", function () {
                    $(':mobile-pagecontainer').pagecontainer('change', $('#login'));
                }, "It is broken!");
                console.log(e);
            }
        });
    }

    function fillPasswordForm(password, wallet) {
        var p = typeof password === 'undefined' ? new Password() : password;
        $('#editPassword form').html('');

        loadWallet(function (wallet) {
            var pass = $('#password').val();
            wallet.decrypt(pass);

            var usernames = wallet.usedUsernames()

            $.each(p.dict(), function (key, item) {
                var sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
                var label = $('<label>', { for: sanitizedKey }).text(key).appendTo('#editPassword form');
                if (key === 'username' && item == '' && usernames.length > 0) {
                    var select = $('<select>', { name: sanitizedKey, rel: key }).appendTo('#editPassword form');
                    $.each(usernames, function (key, username) {
                        $('<option>', { value: username, text: username }).appendTo(select);
                    });
                    var newUser = $('<option>', { text: "new username" }).appendTo(select);
                    select.change(function () {
                        if (newUser.is(':selected')) {
                            select.remove();
                            var input = $('<input>', { name: sanitizedKey, rel: key, value: item, type: 'text' }).insertAfter(label);
                            input.textinput();
                        }
                    });
                } else {
                    $('<input>', { name: sanitizedKey, rel: key, value: item, type: 'text' }).appendTo('#editPassword form');
                }
            });

            $('#editPassword form').trigger('create');
            $('#editPassword .generatePassword').click(function () {
                $('#editPassword input[name=password]').val(Password.generate());
            });
            $('#editPassword .savePassword').click(function () {
                wallet.removePassword(p);
                var values = {};
                $.each($('#editPassword form').serializeArray(), function (key, item) {
                    values[item["name"]] = item["value"];
                });
                wallet.addPassword(Password.fromDict(values));
                wallet.encrypt(pass);
                wallet.save(YoPass.DB(), function () {
                    $(':mobile-pagecontainer').pagecontainer('change', $('#list'));
                    $('#editPassword .savePassword').removeClass('hidden');
                });

                $('#editPassword .savePassword').addClass('hidden');
                return false;
            });
        });
    }

})();
