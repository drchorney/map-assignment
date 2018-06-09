class TripsController < ApplicationController
  before_action :set_trip, only: [:show]
  wrap_parameters :image, include: ["name", "description"]
  before_action :origin, only: [:index]

  def index

    miles=params[:miles] ? params[:miles].to_f : nil

    if miles!=nil and @origin!=nil
      @trips=Trip.within_dist(@origin, miles)
    else 
      @trips=Trip.all
    end

    render "trips/index"
  end

  def show
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
