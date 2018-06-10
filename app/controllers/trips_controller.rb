class TripsController < ApplicationController
  before_action :set_trip, only: [:show]
  wrap_parameters :image, include: ["name", "description"]
  before_action :origin, only: [:index]

  def index

    miles=params[:miles] ? params[:miles].to_f : nil

    if miles!=nil and @origin!=nil
      @trips=Trip.within_dist(@origin, miles)
    else 
      @trips=[]
    end

    render "trips/index"
  end

  def show
  end


  #input into this function is the thing_id
  def thing

    thing_id = params[:id]
    thing = Thing.find(thing_id)
    thing_images = thing.thing_images.with_name.with_caption.with_position

    thing_images.each do |ti|
      if ti.lng != nil
        @thing_image = ti
        break
      end
    end

    render "trips/thing"
  end

  private

  def set_trip
    @trip = Trip.find(params[:id])
  end

  def trip_params
    params.require(:trip).permit(:description,:name)
  end

  def origin
    case
    when params[:lng] && params[:lat]
      @origin=Point.new(params[:lng].to_f, params[:lat].to_f)
    else
      @origin = nil
    end
  end

end
