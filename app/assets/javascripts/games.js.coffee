#= require game_classes
#= require get_char

$(document).ready ->
  shipsSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1].reverse()

  field = new Field("placement")
  ship = new Ship(field, shipsSizes.pop())
  field.draw()
  ship.findFreeZone()

  shipsAreReady = ->
    ship = null
    $('body').unbind 'keypress'
    field.readyToPlay()
    setInterval ->
      field.step()
    , 1000

  bodyOnKeypress = (event) ->
    switch getChar(event)
      when 'w', 'ц'
        ship.move 0, -1
      when 's', 'ы'
        ship.move 0, 1
      when 'a', 'ф'
        ship.move -1, 0
      when 'd', 'в'
        ship.move 1, 0
      when 'q', 'й'
        ship.rotate false
        ship.findFreeZone()
      when 'e', 'у'
        ship.rotate true
        ship.findFreeZone()
      when ' '
        return unless ship.inFreelyZone()
        ship.changeCondition 'normal'
        if shipsSizes.length > 0
          ship = new Ship(field, shipsSizes.pop())
          ship.findFreeZone()
        else
          shipsAreReady()
        field.draw()
  
  $('body').on 'keypress', bodyOnKeypress
