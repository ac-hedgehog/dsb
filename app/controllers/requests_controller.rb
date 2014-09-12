class RequestsController < ApplicationController

  def create
    request_to_play = Request.topical.not_satisfied.first
    if request_to_play
      request_to_play.update_attribute(:satisfied, true)
    else
      request_to_play = Request.create
    end
    
    if request.xhr?
      render json: { request: request_to_play }
    end
  end

  def check
    request_to_play = Request.find(params[:id])
    
    if request.xhr?
      render json: { request: request_to_play }
    end
  end

end
