$(document).ready ->
  show 'button'
  $("#to_play").on "click", join_to_play

show = (object) ->
  if object == 'button'
    $("#to_play").show()
    $("#message").hide()
  if object == 'message'
    $("#to_play").hide()
    $("#message").show()

join_to_play = ->
  $.ajax
    type: "POST"
    url: "/requests"
    success: join_to_play_success

join_to_play_success = (data) ->
  return false if !data.request
  $.cookie "request_id", data.request.id
  if data.request.satisfied
    go_to_play()
  else
    wait_start()

wait_start = ->
  show 'message'
  wait_interval = setInterval ->
    $.ajax
      type: "POST"
      url: "/requests/check",
      data:
        id: $.cookie "request_id"
      success: (data) ->
        wait_to_play_success(data, wait_interval)
  , 1000

wait_to_play_success = (data, wait_interval) ->
  if data.request.satisfied
    clearInterval wait_interval
    go_to_play()

go_to_play = ->
  show 'button'
  console.log "GO TO PLAY PAGE!"
