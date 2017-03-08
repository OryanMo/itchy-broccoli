$(function(){
    $('body').on({
        submit: function(e){
            e.preventDefault();
            var username = $('.username').val()
                password = $('.password').val();
            $.post('/signin', {username: username, password: password}, function(data){
                if (data.status === "SUCCESS")
                    if (data.lastwanted)
                        document.location = data.lastwanted;
                    else
                        document.location = '/';
                else
                    console.log(data);
            });
        }
    }, '.signin-form');

    $('body').on({
        submit: function(e){
            e.preventDefault();
            var username = $('.username').val()
                password = $('.pass').val()
                secpassword = $('.pass-again').val()
                email = $('.mail').val()
                secemail = $('.mail-again').val()
                firstname = $('.firstname').val()
                lastname = $('.lastname').val();
            $.post('/signup', {username: username, password: password, secpassword: secpassword, email: email, secemail: secemail, firstname: firstname, lastname : lastname}, function(data){
                if (data.status === "SUCCESS")
                    if (data.lastwanted)
                        document.location = data.lastwanted;
                    else
                        document.location = '/';
                else
                    console.log(data);
            });
        }
    }, '.signup-form');
})
