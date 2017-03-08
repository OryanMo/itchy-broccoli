$(function(){
    $.get("getMovies", function(data){
        $(data).each(function(index, obj){
            $('.movies-container').append(
                '<span class="movie">Theater: ' + obj.theater + ', Movie:' + obj.moviename +
                ', Date: ' + obj.moviedate + ', Last Updated: <span class="lastupdate">'  + obj.lastupdate +
                '</span>, Row: ' + obj.row + ', Seats: ' + obj.seats + ', Hall: ' + obj.hall +
                '<br/><span data-pid="' + obj.pid + '" class="killprocess">Click to kill</span><br/>' +
                /*'<span class="timer"></span>*/'</span><br/><br/>'
            )
        })

        setTimeout(function(){document.location.reload()},60000);
    })

    $('body').on({
        click: function(){
            var $this = $(this);
            var password = prompt('Please enter pincode')
            $.post('/kill', {pid:$this.data('pid'), password:password}, function(data){
                console.log(data);
                $this.parents('.movie').slideUp(400);
            })
        }
    }, '.killprocess');

    //var intervaltime = 10;

    //setInterval(function(){
    //    var intervaltime = 1000;

    //    $('.timer').each(function(index, obj){
    //        var parent = $(obj).parents('.movie');
    //        var lastupdate = new Date(parent.find('.lastupdate').text());
    //        var now = new Date();

    //        var diff = Math.abs(now - lastupdate);

    //        var ms = Math.abs(now - lastupdate);
    //        var min = (ms/1000/60) << 0;
    //        var sec = ((ms / 1000) - (min * 60));

    //        if (parent.text().indexOf('סינמה סיטי') !== -1){
    //            //var time = 7 - ((Math.abs(now - lastupdate) / 1000) / 60);
    //            if (6 - min <= 0)
    //                $(obj).css('color', '#FF0000');
    //                //document.location.reload();
    //            $(obj).text((6 - min + ':' + ('0' + (59 - (sec << 0))).slice(-2)));
    //        }
    //        else if (parent.text().indexOf('גלובוס מקס') !== -1){
    //            //var time = 6 - ((Math.abs(now - lastupdate) / 1000) / 60);
    //            if (5 - min <= 0)
    //                $(obj).css('color', '#FF0000');
    //                //document.location.reload();
    //            $(obj).text((5 - min + ':' + ('0' + (59 - (sec << 0))).slice(-2)));
    //        }
    //        else if (parent.text().indexOf('יס פלנט') !== -1 || parent.text().indexOf('רב חן') !== -1){
    //            //var time = 15 - ((Math.abs(now - lastupdate) / 1000) / 60);
    //            if (14 - min <= 0)
    //                $(obj).css('color', '#FF0000');
    //                //document.location.reload();
    //            $(obj).text((14 - min + ':' + ('0' + (59 - (sec << 0))).slice(-2)));
    //        }
    //    })
    //}, intervaltime)
});
