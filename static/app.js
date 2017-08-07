$(document).ready(function() {

  // SocketIO message receive code
  var socket = io('http://localhost');
  var progressBar = "<div class=\"progress\"><div class=\"progress-bar progress-bar-striped active\" role=\"progressbar\"aria-valuenow=\"0\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 0%\"></div></div>";
  // Form submission code
  $('#submit_form').submit(function(event) {
    event.preventDefault();

    $('#submit').prop('disabled', true);
    $('#graphs').hide();
    $('.result').remove();
    $('.alert').remove();
    var csrf_token = $('input[name=csrf_token]');

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrf_token);
            }
        }
    });

    var video_id = $('input[name=video_id]').val();
    // var uid = Math.floor((Math.random() * 10) + 1).toString() + video_id
    var formData = {
            'video_id' : video_id,
            'uid': socket.id
        };

    $.ajax({
      type: 'POST',
      url: '/analyze',
      data: formData,
      encode: true,
      success: function(data) {
        console.log("Done.");
        $('#submit').prop('disabled', false);
        $('#submit_form').append('<div class="result">Thank you! Please wait sometime till the analysis is done. This usually takes about 5 minutes.</div>');
        $('#submit_form').append('<p class="alert alert-warning">If the process takes longer than 10-15 minutes, please try again after an hour or so. This is caused by an error in the Background Worker (<a href="https://github.com/celery/celery/issues/3773">Reported here</a>).</p>');
        $('#submit_form').append(progressBar);
        var progress = 0;

        socket.on('comments', function (data) {
          // console.log(data);
          results = JSON.parse(data);
          if(results["message"] != null) {
            console.log('Received:' + data);
            progress += 15;
            $('.progress-bar').attr('aria-valuenow', progress + '%').css('width',progress + '%');
            $('#submit_form').append('<div class="result">' + results["message"] + '</div>');
          } else if(results["error"] != null) {
            $('#submit_form').append('<div class="result">' + results["error"] + '</div>');
            $('.progress').remove();
          } else {
            $('#graphs').show();
            $('.progress-bar').attr('aria-valuenow', 100 + '%').css('width',100 + '%');
            $('.progress').remove();

            console.log(results);
            var layout = {
              autosize: false,
              width: 1200,
              height: 700,
              margin: {
                l: 50,
                r: 50,
                b: 200,
                t: 120,
                pad: 5
              },
              title: 'Box Plot of Aspect Based Sentiment Scores',
              xaxis: {
                title: "Aspects",
                type: "category",
                tickangle: 45
                },
              yaxis: {title: "Sentiment Polarity"}
            };

            var data = [
              {
                y: results["scores"],
                x: results["aspects"],
                type: 'box'
              }
            ];
            Plotly.newPlot('sent-boxplot', data, layout);

            var layoutTrace = {
              autosize: false,
              width: 1200,
              height: 700,
              margin: {
                l: 50,
                r: 50,
                b: 200,
                t: 120,
                pad: 5
              },
              title: 'Distribution of Aspect Based Sentiment Scores',
              xaxis: {
                title: "Sentiment Polarity",
                },
              yaxis: {title: "# of comments"}
            };

            var trace = [
              {
                y: results["aspects"],
                x: results["scores"],
                type: 'histogram'
              }
            ];
            Plotly.newPlot('sent-histogram', trace, layoutTrace);
          }
        });
      },
      error: function(data) {
        console.log("Error!");
        $('#submit').prop('disabled', false);
        $('#submit_form').append('<div id="result">Sorry! An error ocurred. Please try again later.</div>')
      }
    });
  });
});
