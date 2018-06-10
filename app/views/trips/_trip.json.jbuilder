json.extract! trip, :id, :name, :description, :thing_ids
json.image_content_url image_content_url(trip.things.first.thing_images.first.image)
