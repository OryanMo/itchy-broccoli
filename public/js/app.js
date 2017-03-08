$(function(){
    window.currlink = null;
    window.daymap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    window.$loader = $("#loader")
    $.get('getAllCinemas', function(data){
        console.log(data);
        $('.cinema-select').html("<option value=\"0\">Pick a cinema</option>" + optionsFromJson(data, 'id', 'name'));
    })



    $('.cinema-select').change(function(e){
        currlink = null;
        $.get('getVenuesForCinema', {cinema_id: $(this).val()}, function(data){
            console.log(data);
            $('.venue-select').html("<option value=\"0\">Pick a venue</option>" + optionsFromJson(data, 'id', 'name'))
            $('.feature-select').html("<option value=\"0\">Pick a feature</option>");
            $('.pres-select').html("<option value=\"0\">Pick a presentation</option>");
            $('.image').slideUp(400, function(){
                $(this).html('')
            })
        })
    })

    $('.venue-select').change(function(e){
        currlink = null;
        $.get('getFeaturesForVenue', {venue_id: $(this).val(), cinema_id: $('.cinema-select').val()}, function(data){
            console.log(data);
            $('.feature-select').html("<option value=\"0\">Pick a feature</option>" + optionsFromJson(data, 'id', 'name'))
            $('.pres-select').html("<option value=\"0\">Pick a presentation</option>");
            $('.image').slideUp(400, function(){
                $(this).html('')
            })
        })
    })

    $('.feature-select').change(function(e){
        currlink = null;
        $.get('getPresentationsForFeatureAndVenue', {feature_id: $(this).val(), venue_id: $('.venue-select').val()}, function(data){
            console.log(data);
            $('.pres-select').html("<option value=\"0\">Pick a presentation</option>" + optionsFromJson(data, 'id', 'time'))
            $('.image').slideUp(400, function(){
                $(this).html('')
            })
        })
    })

    $('.pres-select').change(function(e){
        $.get('getLinkForVenueAndPres', {pres_id: $(this).val(), venue_id: $('.venue-select').val()}, function(data){
            console.log(data);
            currlink = data;
            $('.image').slideUp(400, function(){
                $(this).html('')
            })
            //prompt("Link to buy tickets", data);
        })
    })

    $('.get-image').click(function(e){
        if(currlink){
            $loader.gSpinner();
            $.get('getSeatmapForLink', {link: currlink}, function(data){
                console.log(data)
                $('.image').html('<img src="' + document.location.origin + '/seatmaps/' + data + '.png" />')
                setTimeout(function(){
                    $('.image').slideDown(400)
                }, 200);
                $loader.gSpinner("hide")
            })
        }
    })

    $('body').on({
        click: function(){
            if (currlink){
                var iframe = currlink;
                var ticketnum = $('.ticketnum').val();
                var row = $('.row').val();
                var leftmost = $('.leftmost').val();
                var moviename = $('.feature-select option:selected').text();
                var moviedate = $('.pres-select option:selected').text();
                moviedate = moviedate.split(' ')[0] + ' ' + moviedate.split(' ')[1]
                var theater = $('.venue-select option:selected').text();


                $loader.gSpinner();
                $.post('/reserve', {moviename: moviename, moviedate: moviedate, theater: theater, iframe: iframe, tiknum: ticketnum, row: row, leftmost: leftmost}, function(data){
                    console.log(data);
                    setTimeout(function(){
                        $loader.gSpinner("hide")
                        document.location = '/allmovies';
                    }, 5000);
                });
            }
        }
    }, '.sendButton')
});

var optionsFromJson = function(array, valfield, namefield){
    var output = "";
    $(array).each(function(index, obj){
        output += "<option value=\"";
        output += obj[valfield];
        output += "\">";
        output += obj[namefield];
        if (namefield == 'time')
            output +=  ' ' + daymap[new Date(obj[namefield]).getDay()]
        output += "</option>";
    })
    return output;
}
