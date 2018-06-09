class Trip < ActiveRecord::Base
  has_and_belongs_to_many :things  

  # attr_accessor :things_ids


  scope :within_dist, ->(origin, limit=nil) {
    thing_image_ids_restricted = ThingImage.within_range(origin,limit).where.not(:id=>nil).pluck(:id)
    if thing_image_ids_restricted.count > 0
      string_restriction = "('"+thing_image_ids_restricted.join("','")+"')"
      result = ActiveRecord::Base.connection.exec_query("SELECT DISTINCT trips.id as trip_id FROM trips INNER JOIN 
                                              things_trips ON trips.id = things_trips.trip_id INNER JOIN things ON things.id = things_trips.thing_id 
                                              INNER JOIN thing_images ON things.id = thing_images.thing_id WHERE thing_images.id IN "+string_restriction)
    
      distinct_trip_ids = []
      result.rows.each do |r_|
        distinct_trip_ids.push(r_[0].to_i)
      end
      return self.find(distinct_trip_ids)
    else
      return []
    end
  }


end
